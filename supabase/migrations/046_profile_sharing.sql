-- Profile Sharing: opt-in, view-only access for invited users
-- Owner invites a viewer by email; viewer must accept before gaining access.
-- Shared scope: Health Profile + Saved Remedies + Treatment Reminders (all three).

create table public.profile_shares (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  viewer_email text not null,
  status      text not null default 'pending'
                check (status in ('pending', 'active', 'revoked')),
  created_at  timestamptz not null default now(),
  accepted_at timestamptz,
  unique (owner_id, viewer_email)
);

alter table public.profile_shares enable row level security;

-- Owner can manage their shares (CRUD)
create policy "Owner manages shares"
  on public.profile_shares for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Viewer can see shares where they are the invitee (by matching their auth email)
create policy "Viewer sees own invites"
  on public.profile_shares for select
  using (
    status in ('pending', 'active')
    and viewer_email = (select email from auth.users where id = auth.uid())
  );

-- Viewer can read owner's user profile when share is active
create policy "Viewer reads shared profile"
  on public.users for select
  using (
    exists (
      select 1 from public.profile_shares
      where owner_id = users.id
        and viewer_email = (select email from auth.users where id = auth.uid())
        and status = 'active'
    )
  );

-- Viewer can read owner's favorites when share is active
create policy "Viewer reads shared favorites"
  on public.favorites for select
  using (
    exists (
      select 1 from public.profile_shares
      where owner_id = favorites.user_id
        and viewer_email = (select email from auth.users where id = auth.uid())
        and status = 'active'
    )
  );

-- Viewer can read owner's schedules when share is active
create policy "Viewer reads shared schedules"
  on public.remedy_schedules for select
  using (
    exists (
      select 1 from public.profile_shares
      where owner_id = remedy_schedules.user_id
        and viewer_email = (select email from auth.users where id = auth.uid())
        and status = 'active'
    )
  );

-- Viewer can read owner's schedule completions when share is active
create policy "Viewer reads shared completions"
  on public.schedule_completions for select
  using (
    exists (
      select 1 from public.profile_shares
      where owner_id = schedule_completions.user_id
        and viewer_email = (select email from auth.users where id = auth.uid())
        and status = 'active'
    )
  );
