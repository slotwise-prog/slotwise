# Client Service Record Investigation

Status: a session-refresh defect is corrected locally; the originally reported failure has not been reproduced. This is not a confirmed production bug closure.

## Production evidence

- User confirmed the actual login is tfucareer.philippines@gmail.com.
- The dashboard displayed OWNER for that login.
- The production business_users response contained membership facial-unliph, user_id 899f6fb9-05c2-4093-b5ed-5fa92eed0c91, business_slug the-facial-unlimited-ph, role OWNER, active true.
- The returned business row has package PRO and clientRecords, client_records, client_records_enabled all true.
- authorized_branches was not selected by the deployed frontend, so its stored value remains unverified. The local diagnostic query now requests membership fields including that value.
- Antipolo INSERT returned HTTP 200 and saved CSR-04646546 for client CR-14389537.
- Parañaque UPDATE returned HTTP 200 for that same record with the edited notes.
- Taguig / Lakeshore UPDATE persisted: verified by reopening the browser and client profile on September 14.
- Earlier Pateros Add/Edit tests persisted after refresh.
- No Supabase error was returned in these successful tests. No claim is made that the production helper definitions or admin bypass status were inspected.
- One zero-charge entry labeled ADMIN TEST ONLY - branch authorization remains in the affected client's profile. It is explicitly marked not a real visit or charge. It currently has branch Taguig / Lakeshore.

## Defect corrected in code

Client session refresh ran only when the dashboard mounted. Service Record writes and their subsequent reload used the unchanged in-memory access token, which could expire while the dashboard remained open. A fresh login test does not exercise that defect.

Before either Add or Edit, the save now reads the current stored session, checks the user identity, refreshes an expired/near-expiry or undated session using the existing Supabase refresh endpoint, and uses the renewed token for both the RPC and data reload. It prevents concurrent duplicate saves and refuses an account switch while the old form is open.

This is a verified code defect, but it is not confirmed as the cause of the client's reported failure because no failing production response has been captured.

Error details remain in developer console only: user ID, membership role/active/branches, entitlement, business/client/record identifiers, branch, INSERT/UPDATE, code/message/details/hint. No token, password, or service-role secret is logged. The customer-facing failure message stays generic.

## Verification and outstanding checks

Six automated session tests pass: expired token renewal, valid token reuse, missing expiry renewal, account mismatch rejection, refresh failure propagation, and missing refresh token rejection. Production build passes.

No production database changes were applied. Tenant checks, entitlements, RLS, and foreign keys were not changed. Cross-tenant denial and production helper/branch configuration are still unverified; use facial-client-authorization-audit.sql to inspect them before making permission changes.

The new build has not been deployed. After deployment, capture the client's original failing action and verify the long-open session case. Do not treat the successful existing live tests as verification of the new build.

## Supabase

No migration is required for the session-refresh fix. The separate facial-client-authorization-audit.sql is read-only and is still needed to confirm the stored branch values and installed helper/RLS definitions. Do not rerun old broad permission hotfixes without reviewing that evidence.
