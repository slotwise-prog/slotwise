# Slotwise Database Setup

Use Supabase for the first MVP database.

1. Create a Supabase project.
2. Open the SQL editor.
3. Run `supabase-schema.sql`.
4. Run `supabase-public-policies.sql`.
5. Copy `.env.example` to `.env`.
6. Add your Supabase project URL and public anon key.
7. Restart the local preview.

After that, leads, bookings, setup wizard submissions, permanent business pages, business services, business availability, and SMM admin authorization will save online instead of only in the browser demo storage.

## Phase 4 SMM admin security

Public booking pages do not require login.

The setup wizard remains public and stores setup requests for SMM Solutions to review.

Permanent client provisioning is managed from `/smm-admin` by approved SMM admin users only.

### Create the first SMM admin

1. In Supabase, open Authentication.
2. Make sure Email/Password provider is enabled.
3. Go to Users.
4. Click Add user.
5. Create your admin email and password manually.
6. Open the created user and copy the user's UUID.
7. Open SQL Editor.
8. Run this, replacing `PASTE-USER-UUID-HERE`:

```sql
insert into admin_users (user_id, role, active)
values ('PASTE-USER-UUID-HERE', 'MASTER_ADMIN', true)
on conflict (user_id)
do update set role = excluded.role, active = excluded.active;
```

9. Go to `/smm-admin`.
10. Log in using the admin email and password.

Do not put admin passwords, database passwords, or service role keys in repository files.

Important: if Supabase says a column or table is missing, run both SQL files again in this order:

1. `supabase-schema.sql`
2. `supabase-public-policies.sql`

The SQL is additive. It uses `create table if not exists`, `alter table add column if not exists`, and safe policy replacement, so it should not delete existing leads, bookings, or setup requests.
