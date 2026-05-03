## Rebuild: College Sports Society Management

### New database schema (replaces old tables)
Drop: `students`, `teams`, `team_members`, `events`, `event_rsvps`, `announcements`.
Keep: `profiles`, `user_roles` (roles simplified to `admin`, `user`).

New tables:
- **sports** — name, description, vision, mission, cover_url, created_by
- **sport_members** — sport_id, user_id, role (`lead` | `member`), unique(sport_id, user_id)
- **tasks** — sport_id, title, description, status (`todo`/`in_progress`/`done`), assignee_id, due_date, created_by
- **sport_events** — sport_id, title, description, location, starts_at, ends_at, cover_url
- **progress_reports** — sport_id, period (text), summary, metrics (jsonb), created_by

RLS:
- `is_sport_member(sport_id, user_id)` security-definer helper.
- Admin: full access everywhere.
- Sport users: SELECT/INSERT/UPDATE/DELETE on tasks/events/progress for sports they belong to. Sport leads can update vision/mission of their sport.
- Members table: admin manages assignments; users see their own memberships.
- Realtime enabled on tasks, sport_events, progress_reports.

### Auth & roles
- First signup → `admin`. Others → `user`.
- Admin assigns users to sports via memberships.
- `useAuth` exposes `isAdmin` plus `mySportIds`.

### Routes (TanStack)
- `/login`, `/signup`
- `/dashboard` — admin: totals (sports, users, tasks, events, completion %); user: their sports + upcoming events + open tasks
- `/sports` — list (admin can create); user sees only assigned
- `/sports/$sportId` — tabs: Overview (vision/mission), Tasks (CRUD kanban-ish), Events (CRUD), Members (admin/lead), Progress (CRUD reports)
- `/users` — admin only; assign roles + sport memberships
- Realtime subscriptions on tasks/events/progress for live updates.

### UI
- Reuse existing AppShell + design tokens. Update sidebar nav (Dashboard, Sports, Users[admin]). Responsive, clean cards.

### Technical notes
- Keep storage buckets `team-logos`/`event-covers` reused as `sport-covers`/`event-covers` (or just reuse existing buckets).
- ProtectedRoute by role; sport detail guard checks membership or admin.
- Old route files removed/replaced.