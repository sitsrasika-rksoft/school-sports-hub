-- Enum for app roles
create type public.app_role as enum ('admin', 'coach', 'student');

-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now()
);

-- User roles table (separate to prevent privilege escalation)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

-- Security definer role check
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create or replace function public.get_user_role(_user_id uuid)
returns app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.user_roles
  where user_id = _user_id
  order by case role when 'admin' then 1 when 'coach' then 2 else 3 end
  limit 1
$$;

-- Auto-create profile + default student role on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));

  insert into public.user_roles (user_id, role)
  values (new.id, 'student');

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Students (athlete records)
create table public.students (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  grade text not null,
  email text,
  phone text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Teams
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sport text not null,
  description text,
  logo_url text,
  coach_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Team members
create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  position text,
  created_at timestamptz not null default now(),
  unique (team_id, student_id)
);

-- Events
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  location text,
  cover_url text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  team_id uuid references public.teams(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Event RSVPs
create table public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'going' check (status in ('going','maybe','declined')),
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

-- Announcements
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  author_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.students enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;
alter table public.announcements enable row level security;

-- Profiles policies
create policy "Profiles viewable by authenticated"
  on public.profiles for select to authenticated using (true);
create policy "Users update own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);

-- user_roles policies
create policy "Roles viewable by authenticated"
  on public.user_roles for select to authenticated using (true);
create policy "Admins insert roles"
  on public.user_roles for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins update roles"
  on public.user_roles for update to authenticated
  using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete roles"
  on public.user_roles for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Students: viewable by all auth, mutable by admin/coach
create policy "Students viewable by authenticated"
  on public.students for select to authenticated using (true);
create policy "Admins/coaches insert students"
  on public.students for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'coach'));
create policy "Admins/coaches update students"
  on public.students for update to authenticated
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'coach'));
create policy "Admins delete students"
  on public.students for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Teams policies
create policy "Teams viewable by authenticated"
  on public.teams for select to authenticated using (true);
create policy "Admins/coaches insert teams"
  on public.teams for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'coach'));
create policy "Admins/coaches update teams"
  on public.teams for update to authenticated
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'coach'));
create policy "Admins delete teams"
  on public.teams for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Team members policies
create policy "Team members viewable by authenticated"
  on public.team_members for select to authenticated using (true);
create policy "Admins/coaches manage team members"
  on public.team_members for all to authenticated
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'coach'))
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'coach'));

-- Events policies
create policy "Events viewable by authenticated"
  on public.events for select to authenticated using (true);
create policy "Admins/coaches insert events"
  on public.events for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'coach'));
create policy "Admins/coaches update events"
  on public.events for update to authenticated
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'coach'));
create policy "Admins delete events"
  on public.events for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- RSVP policies
create policy "RSVPs viewable by authenticated"
  on public.event_rsvps for select to authenticated using (true);
create policy "Users manage own RSVPs insert"
  on public.event_rsvps for insert to authenticated
  with check (auth.uid() = user_id);
create policy "Users manage own RSVPs update"
  on public.event_rsvps for update to authenticated using (auth.uid() = user_id);
create policy "Users manage own RSVPs delete"
  on public.event_rsvps for delete to authenticated using (auth.uid() = user_id);

-- Announcements
create policy "Announcements viewable by authenticated"
  on public.announcements for select to authenticated using (true);
create policy "Admins/coaches insert announcements"
  on public.announcements for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'coach'));
create policy "Admins/coaches update own announcements"
  on public.announcements for update to authenticated
  using (auth.uid() = author_id and (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'coach')));
create policy "Admins delete announcements"
  on public.announcements for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Storage buckets for team logos and event covers
insert into storage.buckets (id, name, public) values ('team-logos','team-logos', true);
insert into storage.buckets (id, name, public) values ('event-covers','event-covers', true);

create policy "Public read team-logos" on storage.objects for select using (bucket_id = 'team-logos');
create policy "Auth upload team-logos" on storage.objects for insert to authenticated
  with check (bucket_id = 'team-logos');
create policy "Auth update team-logos" on storage.objects for update to authenticated
  using (bucket_id = 'team-logos');
create policy "Auth delete team-logos" on storage.objects for delete to authenticated
  using (bucket_id = 'team-logos');

create policy "Public read event-covers" on storage.objects for select using (bucket_id = 'event-covers');
create policy "Auth upload event-covers" on storage.objects for insert to authenticated
  with check (bucket_id = 'event-covers');
create policy "Auth update event-covers" on storage.objects for update to authenticated
  using (bucket_id = 'event-covers');
create policy "Auth delete event-covers" on storage.objects for delete to authenticated
  using (bucket_id = 'event-covers');