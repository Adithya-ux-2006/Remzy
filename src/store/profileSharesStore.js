import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

export const useProfileSharesStore = create((set, get) => ({
  shares: [],
  pendingInvites: [],
  sharedProfiles: [],
  isLoading: false,
  error: null,

  fetchShares: async () => {
    const user = useAuthStore.getState().user;
    if (!user) { set({ shares: [] }); return; }

    set({ isLoading: true });
    const { data, error } = await supabase
      .from('profile_shares')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) set({ shares: data || [] });
    set({ isLoading: false });
  },

  fetchPendingInvites: async () => {
    const user = useAuthStore.getState().user;
    if (!user?.email) { set({ pendingInvites: [] }); return; }

    const { data, error } = await supabase
      .from('profile_shares')
      .select('*, users!profile_shares_owner_id_fkey(name)')
      .eq('viewer_email', user.email)
      .eq('status', 'pending');

    if (!error) set({ pendingInvites: data || [] });
  },

  inviteViewer: async (email) => {
    const user = useAuthStore.getState().user;
    if (!user) return { error: 'Not authenticated' };

    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail === user.email?.toLowerCase()) {
      return { error: 'You cannot share your profile with yourself.' };
    }

    const { data: existing } = await supabase
      .from('profile_shares')
      .select('id, status')
      .eq('owner_id', user.id)
      .eq('viewer_email', normalizedEmail)
      .maybeSingle();

    if (existing) {
      if (existing.status === 'revoked') {
        const { error } = await supabase
          .from('profile_shares')
          .update({ status: 'pending', accepted_at: null })
          .eq('id', existing.id);
        if (error) return { error: error.message };
        await get().fetchShares();
        return { success: true };
      }
      return { error: 'This person already has an active or pending share.' };
    }

    const { error } = await supabase
      .from('profile_shares')
      .insert({ owner_id: user.id, viewer_email: normalizedEmail });

    if (error) return { error: error.message };
    await get().fetchShares();
    return { success: true };
  },

  revokeAccess: async (shareId) => {
    const { error } = await supabase
      .from('profile_shares')
      .update({ status: 'revoked' })
      .eq('id', shareId);

    if (error) return { error: error.message };
    await get().fetchShares();
    return { success: true };
  },

  acceptInvite: async (shareId) => {
    const { error } = await supabase
      .from('profile_shares')
      .update({ status: 'active', accepted_at: new Date().toISOString() })
      .eq('id', shareId);

    if (error) return { error: error.message };
    await get().fetchPendingInvites();
    await get().fetchSharedProfiles();
    return { success: true };
  },

  declineInvite: async (shareId) => {
    const { error } = await supabase
      .from('profile_shares')
      .update({ status: 'revoked' })
      .eq('id', shareId);

    if (error) return { error: error.message };
    await get().fetchPendingInvites();
    return { success: true };
  },

  fetchSharedProfiles: async () => {
    const user = useAuthStore.getState().user;
    if (!user?.email) { set({ sharedProfiles: [] }); return; }

    const { data: shares, error } = await supabase
      .from('profile_shares')
      .select('id, owner_id, created_at')
      .eq('viewer_email', user.email)
      .eq('status', 'active');

    if (error || !shares?.length) { set({ sharedProfiles: [] }); return; }

    const profiles = await Promise.all(
      shares.map(async (share) => {
        const { data: owner } = await supabase
          .from('users')
          .select('id, name, gender, common_conditions, known_allergies, treatment_prefs, is_child_safe')
          .eq('id', share.owner_id)
          .single();

        const { data: favorites } = await supabase
          .from('favorites')
          .select('*, remedies(*)')
          .eq('user_id', share.owner_id);

        const { data: schedules } = await supabase
          .from('remedy_schedules')
          .select('*')
          .eq('user_id', share.owner_id)
          .order('scheduled_time');

        return {
          shareId: share.id,
          sharedAt: share.created_at,
          owner,
          favorites: favorites || [],
          schedules: schedules || [],
        };
      })
    );

    set({ sharedProfiles: profiles.filter((p) => p.owner) });
  },
}));
