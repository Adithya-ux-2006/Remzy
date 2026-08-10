import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';
import { mapRemedy } from '../utils/mappers';
import { trackRemedyEvent } from '../utils/analytics';

export const useFavoritesStore = create((set, get) => ({
  favorites: [],
  isLoading: false,
  pendingIds: new Set(),
  error: null,

  fetchFavorites: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ favorites: [], isLoading: false });
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
      // We fetch favorite records and join with remedies
      const { data, error } = await supabase
        .from('favorites')
        .select('*, remedies(*)')
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      const remedies = data
        .filter((favorite) => favorite.remedies)
        .map((favorite) => {
          const remedy = mapRemedy(favorite.remedies);
          if (remedy) remedy._savedAt = favorite.created_at;
          return remedy;
        })
        .filter(Boolean);
      // Ignore a response that belongs to a session which has since changed.
      if (useAuthStore.getState().user?.id !== user.id) return;
      set({ favorites: remedies.sort((a, b) => new Date(b._savedAt) - new Date(a._savedAt)) });
    } catch (error) {
      console.error('Error fetching favorites:', error);
      if (useAuthStore.getState().user?.id === user.id) set({ error });
    } finally {
      if (useAuthStore.getState().user?.id === user.id) set({ isLoading: false });
    }
  },

  addFavorite: async (remedy) => {
    const user = useAuthStore.getState().user;
    if (!user || get().pendingIds.has(remedy.id)) return false;

    set((state) => ({
      pendingIds: new Set(state.pendingIds).add(remedy.id),
      error: null,
    }));

    // Optimistic update
    const { favorites } = get();
    if (!favorites.some(f => f.id === remedy.id)) {
      const entry = { ...remedy, _savedAt: new Date().toISOString() };
      set({ favorites: [entry, ...favorites.filter(f => f.id !== remedy.id)] });
    }

    try {
      const { error } = await supabase
        .from('favorites')
        .upsert(
          { user_id: user.id, remedy_id: remedy.id },
          { onConflict: 'user_id,remedy_id', ignoreDuplicates: true }
        );
         
      if (error) throw error;

      trackRemedyEvent({
        remedyId: remedy.id,
        eventType: 'saved',
        metadata: { method: 'favorites' },
      }).catch(() => {});
      return true;
    } catch (error) {
      console.error('Error adding favorite:', error);
      set((state) => ({
        favorites: state.favorites.filter(f => f.id !== remedy.id),
        error,
      }));
      return false;
    } finally {
      set((state) => {
        const pendingIds = new Set(state.pendingIds);
        pendingIds.delete(remedy.id);
        return { pendingIds };
      });
    }
  },

  removeFavorite: async (id) => {
    const user = useAuthStore.getState().user;
    if (!user || get().pendingIds.has(id)) return false;

    set((state) => ({
      pendingIds: new Set(state.pendingIds).add(id),
      error: null,
    }));

    // Optimistic update
    const { favorites } = get();
    set({ favorites: favorites.filter(f => f.id !== id) });

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .match({ user_id: user.id, remedy_id: id });
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing favorite:', error);
      set({ error });
      await get().fetchFavorites();
      return false;
    } finally {
      set((state) => {
        const pendingIds = new Set(state.pendingIds);
        pendingIds.delete(id);
        return { pendingIds };
      });
    }
  },

  isFavorite: (id) => {
    return get().favorites.some(f => f.id === id);
  },

  clear: () => set({ favorites: [], pendingIds: new Set(), error: null, isLoading: false }),

  toggleFavorite: async (remedy) => {
    if (!remedy?.id || get().pendingIds.has(remedy.id)) return false;
    if (get().isFavorite(remedy.id)) {
      return get().removeFavorite(remedy.id);
    }
    return get().addFavorite(remedy);
  }
}));
