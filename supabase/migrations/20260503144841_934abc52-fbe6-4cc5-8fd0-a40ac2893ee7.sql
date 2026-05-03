
drop table if exists public.event_rsvps cascade;
drop table if exists public.events cascade;
drop table if exists public.team_members cascade;
drop table if exists public.teams cascade;
drop table if exists public.students cascade;
drop table if exists public.announcements cascade;

create table public.sports (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  vision text,
  mission text,
  cover_url text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sport_members (
  id uuid primary key default gen_random_uuid(),
  sport_id uuid not null references public.sports(id) on delete cascade,
  user_id uuid not null,
  role text not null default 'member' check (role in ('lead','member')),
  created_at timestamptz not null default now(),
  unique (sport_id, user_id)
);
create index idx_sport_members_user on public.sport_members(user_id);
create index idx_sport_members_sport on public.sport_members(sport_id);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  sport_id uuid not null references public.sports(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo','in_progress','done')),
  assignee_id uuid,
  due_date date,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_tasks_sport on public.tasks(sport_id);

create table public.sport_events (
  id uuid primary key default gen_random_uuid(),
  sport_id uuid not null references public.sports(id) on delete cascade,
  title text not null,
  description text,
  location text,
  cover_url text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  created_by uuid,
  created_at timestamptz not null default now()
);
create index idx_sport_events_sport on public.sport_events(sport_id);

create table public.progress_reports (
  id uuid primary key default gen_random_uuid(),
  sport_id uuid not null references public.sports(id) on delete cascade,
  period text not null,
  summary text,
  metrics jsonb not null default '{}'::jsonb,
  created_by uuid,
  created_at timestamptz not null default now()
);
create index idx_progress_sport on public.progress_reports(sport_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger trg_sports_updated before update on public.sports
  for each row execute function public.set_updated_at();
create trigger trg_tasks_updated before update on public.tasks
  for each row execute function public.set_updated_at();

create or replace function public.is_sport_member(_sport_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.sport_members where sport_id=_sport_id and user_id=_user_id);
$$;

create or replace function public.is_sport_lead(_sport_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.sport_members where sport_id=_sport_id and user_id=_user_id and role='lead');
$$;

alter table public.sports enable row level security;
alter table public.sport_members enable row level security;
alter table public.tasks enable row level security;
alter table public.sport_events enable row level security;
alter table public.progress_reports enable row level security;

create policy "Sports viewable by admin or members" on public.sports for select to authenticated
  using (public.has_role(auth.uid(),'admin') or public.is_sport_member(id, auth.uid()));
create policy "Admins insert sports" on public.sports for insert to authenticated
  with check (public.has_role(auth.uid(),'admin'));
create policy "Admins or leads update sports" on public.sports for update to authenticated
  using (public.has_role(auth.uid(),'admin') or public.is_sport_lead(id, auth.uid()));
create policy "Admins delete sports" on public.sports for delete to authenticated
  using (public.has_role(auth.uid(),'admin'));

create policy "Members visible" on public.sport_members for select to authenticated
  using (public.has_role(auth.uid(),'admin') or user_id = auth.uid() or public.is_sport_member(sport_id, auth.uid()));
create policy "Admins insert memberships" on public.sport_members for insert to authenticated
  with check (public.has_role(auth.uid(),'admin'));
create policy "Admins update memberships" on public.sport_members for update to authenticated
  using (public.has_role(auth.uid(),'admin'));
create policy "Admins delete memberships" on public.sport_members for delete to authenticated
  using (public.has_role(auth.uid(),'admin'));

create policy "Tasks select" on public.tasks for select to authenticated
  using (public.has_role(auth.uid(),'admin') or public.is_sport_member(sport_id, auth.uid()));
create policy "Tasks insert" on public.tasks for insert to authenticated
  with check (public.has_role(auth.uid(),'admin') or public.is_sport_member(sport_id, auth.uid()));
create policy "Tasks update" on public.tasks for update to authenticated
  using (public.has_role(auth.uid(),'admin') or public.is_sport_member(sport_id, auth.uid()));
create policy "Tasks delete" on public.tasks for delete to authenticated
  using (public.has_role(auth.uid(),'admin') or public.is_sport_lead(sport_id, auth.uid()));

create policy "Events select" on public.sport_events for select to authenticated
  using (public.has_role(auth.uid(),'admin') or public.is_sport_member(sport_id, auth.uid()));
create policy "Events insert" on public.sport_events for insert to authenticated
  with check (public.has_role(auth.uid(),'admin') or public.is_sport_member(sport_id, auth.uid()));
create policy "Events update" on public.sport_events for update to authenticated
  using (public.has_role(auth.uid(),'admin') or public.is_sport_member(sport_id, auth.uid()));
create policy "Events delete" on public.sport_events for delete to authenticated
  using (public.has_role(auth.uid(),'admin') or public.is_sport_lead(sport_id, auth.uid()));

create policy "Reports select" on public.progress_reports for select to authenticated
  using (public.has_role(auth.uid(),'admin') or public.is_sport_member(sport_id, auth.uid()));
create policy "Reports insert" on public.progress_reports for insert to authenticated
  with check (public.has_role(auth.uid(),'admin') or public.is_sport_member(sport_id, auth.uid()));
create policy "Reports update" on public.progress_reports for update to authenticated
  using (public.has_role(auth.uid(),'admin') or public.is_sport_member(sport_id, auth.uid()));
create policy "Reports delete" on public.progress_reports for delete to authenticated
  using (public.has_role(auth.uid(),'admin') or public.is_sport_lead(sport_id, auth.uid()));

alter table public.tasks replica identity full;
alter table public.sport_events replica identity full;
alter table public.progress_reports replica identity full;
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.sport_events;
alter publication supabase_realtime add table public.progress_reports;

insert into storage.buckets (id, name, public) values ('sport-covers','sport-covers', true)
on conflict (id) do nothing;

create policy "Sport covers public read" on storage.objects for select using (bucket_id='sport-covers');
create policy "Authenticated upload sport covers" on storage.objects for insert to authenticated with check (bucket_id='sport-covers');
create policy "Authenticated update sport covers" on storage.objects for update to authenticated using (bucket_id='sport-covers');
