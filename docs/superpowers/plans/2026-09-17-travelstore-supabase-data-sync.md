# Travel Store Supabase Data Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Supabase the shared persistent source of truth for Travel Story business data while preserving the existing UI and reporting flows.

**Architecture:** Keep React state for responsive UI, but move authoritative reads/writes behind server-side Next.js API routes. Supabase PostgreSQL stores normalized business records; a server-verifiable session cookie protects API mutations; localStorage is retained only for session/UI cache and one-time legacy migration.

**Tech Stack:** Next.js App Router, TypeScript, Supabase PostgreSQL/REST, server-side API routes, React state, existing lucide UI.

**Spec:** `docs/superpowers/specs/2026-09-17-travelstore-supabase-data-sync-design.md`

## Global Constraints

- `SUPABASE_SERVICE_ROLE_KEY` must never reach browser code.
- Supabase is authoritative for business data after migration.
- Existing UI/features remain visually and behaviorally compatible unless cloud-sync or migration UI is required.
- Sales/billing plus stock decrement must be atomic.
- API mutations must validate server session and permission.
- Existing localStorage data must never silently overwrite non-empty Supabase data.
- `npm run build` must complete successfully.

---

### Task 1: Database schema and constraints

**Files:**
- Create: `supabase/store.sql`
- Modify: `supabase/site-settings.sql` only if shared SQL conventions require it

**Interfaces:**
- Produces tables: `products`, `categories`, `customers`, `bills`, `bill_items`, `stock_logs`, `expenses`, `inquiries`, `staff_users`.
- Produces database constraints and indexes required by API tasks.

- [ ] **Step 1: Define normalized tables matching the approved spec.**

Create columns for product/category/customer/bill/bill_item/stock_log/expense/inquiry/staff records exactly as specified, including timestamps and bill item historical snapshots.

- [ ] **Step 2: Add relationships and uniqueness constraints.**

Use foreign keys for bill-to-customer, bill-item-to-bill/product, and stock-log-to-product; make `bill_no` and `staff_users.username` unique.

- [ ] **Step 3: Add check constraints and indexes.**

Constrain payment to `Cash`, `GPay / UPI`, `Credit`; status to `Completed`; stock quantity and monetary values to valid ranges; index bill dates, customer mobile, product category, and inquiry dates.

- [ ] **Step 4: Enable RLS on application tables.**

Enable row-level security so anonymous browser access cannot directly mutate application data. The Next.js server route will use the service role.

- [ ] **Step 5: Commit the SQL schema.**

```bash
git add supabase/store.sql
git commit -m "feat: add Travel Store Supabase schema"
```

---

### Task 2: Server session and authorization boundary

**Files:**
- Modify: `lib/store.tsx`
- Modify: `app/login/page.tsx`
- Create: `lib/server/auth.ts`
- Create: `app/api/auth/login/route.ts`
- Create: `app/api/auth/logout/route.ts`
- Create: `app/api/auth/session/route.ts`

**Interfaces:**
- `loginServer(username: string, password: string): Promise<{user: User} | {error: string}>`
- `getServerSession(): Promise<{userId: number; role: Role; permissions: Permission[]} | null>`
- `requirePermission(permission: Permission): Promise<...>`

- [ ] **Step 1: Add password hashing utilities and session-cookie helpers.**

Store only password hashes in `staff_users`; create an HTTP-only, secure-in-production session cookie containing a server-verifiable session token.

- [ ] **Step 2: Implement login route.**

Validate username/password, compare with stored hash, create a session, and return only safe user fields.

- [ ] **Step 3: Implement logout and session routes.**

Clear the cookie on logout and expose only the authenticated user's role/permissions from the server.

- [ ] **Step 4: Update login UI/store to use server authentication.**

Remove authorization trust from `noor_user`/`noor_role`; localStorage may cache display state but cannot authorize API writes.

- [ ] **Step 5: Verify unauthenticated access is rejected.**

Test API calls without the session cookie and confirm they return 401/403 rather than mutating data.

- [ ] **Step 6: Commit authentication boundary.**

```bash
git add lib/server/auth.ts app/api/auth app/login/page.tsx lib/store.tsx
git commit -m "feat: add server-verifiable Travel Store sessions"
```

---

### Task 3: Shared server data API and validation

**Files:**
- Create: `lib/server/supabase.ts`
- Create: `lib/server/validation.ts`
- Create: `app/api/store/products/route.ts`
- Create: `app/api/store/categories/route.ts`
- Create: `app/api/store/customers/route.ts`
- Create: `app/api/store/bills/route.ts`
- Create: `app/api/store/stock/route.ts`
- Create: `app/api/store/expenses/route.ts`
- Create: `app/api/store/inquiries/route.ts`
- Create: `app/api/store/users/route.ts`
- Create: `app/api/store/reports/route.ts`

**Interfaces:**
- `supabaseAdminFetch(path: string, init?: RequestInit): Promise<Response>`
- `requirePermission(permission: Permission)` from Task 2
- CRUD JSON contracts use only fields needed by the UI.

- [ ] **Step 1: Add the server-only Supabase client wrapper.**

Read `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` only in server modules and fail with a clear configuration error when missing.

- [ ] **Step 2: Add common request validation.**

Validate IDs, dates, money, quantities, enums, required names/mobile fields, and permission-sensitive fields before database calls.

- [ ] **Step 3: Implement Products and Categories routes.**

Support list/create/update/delete, category image storage as text URL/data reference compatible with the existing UI, and prevent category deletion when products reference it.

- [ ] **Step 4: Implement Customers and Expenses routes.**

Support list/create/update/delete as required by current screens, including shared customer balances and expense `added_by` values from the server session.

- [ ] **Step 5: Implement Inquiries and Staff routes.**

Protect staff management and permission changes with admin authorization; reject client-supplied role escalation.

- [ ] **Step 6: Implement Bills and Stock routes.**

Return bills with bill-item snapshots and support date-range filtering needed by Bills & History.

- [ ] **Step 7: Commit the API layer.**

```bash
git add lib/server app/api/store
git commit -m "feat: add protected Supabase store APIs"
```

---

### Task 4: Atomic billing and stock transaction

**Files:**
- Create: `supabase/store-functions.sql`
- Modify: `app/api/store/bills/route.ts`
- Modify: `lib/server/validation.ts`

**Interfaces:**
- `create_bill_transaction(payload): bigint` or equivalent RPC result containing bill id/bill number.

- [ ] **Step 1: Define the database transaction function.**

Insert the bill, insert all bill items, decrement each product's stock, update the customer's balance, and reject insufficient stock inside one PostgreSQL transaction.

- [ ] **Step 2: Include discounted totals and historical cost snapshots.**

Persist `subtotal`, `discount`, `total`, `paid`, `balance`, `expense`, and `profit`; each item stores its sale price and cost at sale time.

- [ ] **Step 3: Call the transaction from the Bills API.**

The API must return an error when any operation fails and must not claim the bill was saved.

- [ ] **Step 4: Test rollback behavior.**

Force an insufficient-stock or validation failure and verify that no bill, bill item, stock decrement, or balance update remains.

- [ ] **Step 5: Commit the transactional billing layer.**

```bash
git add supabase/store-functions.sql app/api/store/bills/route.ts lib/server/validation.ts
git commit -m "feat: make billing and stock updates atomic"
```

---

### Task 5: Migrate the existing React store from localStorage authority to Supabase

**Files:**
- Modify: `lib/store.tsx`
- Create: `lib/client/store-api.ts`
- Create: `components/CloudSyncStatus.tsx`

**Interfaces:**
- `storeApi.listProducts()`
- `storeApi.listCategories()`
- `storeApi.listCustomers()`
- `storeApi.listBills(params)`
- `storeApi.listStockLogs()`
- `storeApi.listExpenses()`
- `storeApi.listInquiries()`
- `storeApi.listUsers()`
- Mutation helpers matching each API route.

- [ ] **Step 1: Add typed client API helpers.**

All browser calls use `/api/...` routes; no Supabase service key is imported into client code.

- [ ] **Step 2: Load authoritative data after authentication.**

Hydrate React state from Supabase and keep localStorage only as a non-authoritative cache where useful.

- [ ] **Step 3: Route mutations through the API.**

Product/category/customer/bill/stock/expense/inquiry/staff changes must await a successful API response before showing success.

- [ ] **Step 4: Add explicit cloud/offline state.**

Show a clear sync error when a cloud save fails; never silently fall back to a separate authoritative browser database.

- [ ] **Step 5: Commit the client data layer.**

```bash
git add lib/store.tsx lib/client/store-api.ts components/CloudSyncStatus.tsx
git commit -m "feat: connect React store to Supabase APIs"
```

---

### Task 6: One-time legacy localStorage migration

**Files:**
- Create: `app/api/store/migrate/route.ts`
- Create: `components/DataMigrationDialog.tsx`
- Create: `lib/client/migration.ts`
- Modify: `lib/store.tsx`

**Interfaces:**
- `POST /api/store/migrate` accepts a validated snapshot of legacy datasets.
- `migrationStatus()` returns whether Supabase is empty, populated, or requires an explicit import/skip choice.

- [ ] **Step 1: Detect cloud/local record states.**

Never overwrite a populated Supabase dataset with an empty browser dataset.

- [ ] **Step 2: Validate and import only actual browser records.**

Do not recreate seed/demo customers just because the current seed file contains them. Use stable IDs/unique bill numbers to make imports idempotent.

- [ ] **Step 3: Add explicit migration UI when both sources contain data.**

Offer Import local data or Skip migration; do not silently choose either option.

- [ ] **Step 4: Verify duplicate protection.**

Run migration twice and verify products/customers/bills are not duplicated.

- [ ] **Step 5: Commit migration support.**

```bash
git add app/api/store/migrate components/DataMigrationDialog.tsx lib/client/migration.ts lib/store.tsx
git commit -m "feat: migrate legacy localStorage data to Supabase"
```

---

### Task 7: Connect existing pages and preserve reports/exports

**Files:**
- Modify: `app/admin/products/page.tsx`
- Modify: `app/admin/categories/page.tsx`
- Modify: `app/admin/sales/page.tsx`
- Modify: `app/admin/bills/page.tsx`
- Modify: `app/admin/stock/page.tsx`
- Modify: `app/admin/expenses/page.tsx`
- Modify: `app/admin/inquiry/page.tsx`
- Modify: `app/admin/customers/page.tsx`
- Modify: `app/admin/reports/page.tsx`
- Modify: `app/admin/settings/page.tsx`

**Interfaces:**
- Pages consume Supabase-backed store state and mutation helpers from Task 5.

- [ ] **Step 1: Remove page-specific assumptions that data is browser-only.**

Keep existing forms and UI, but use API-backed state and await mutations.

- [ ] **Step 2: Preserve Bills & History behavior.**

Keep current-month default, From/To date filtering, bill search, Print/PDF, Excel, individual bill print/export, and WhatsApp sharing. The report source is now Supabase.

- [ ] **Step 3: Preserve Stock Management reporting.**

Keep stock search, Print/PDF, Excel, and stock update behavior using cloud data.

- [ ] **Step 4: Preserve Categories and Products behavior.**

Category rename must update product category references; category deletion remains blocked when products use it.

- [ ] **Step 5: Verify permissions on every page.**

UI visibility must match server authorization; staff cannot bypass protected endpoints by manually calling them.

- [ ] **Step 6: Commit page integration.**

```bash
git add app/admin
 git commit -m "feat: migrate admin pages to cloud-backed data"
```

---

### Task 8: Supabase production configuration and deployment verification

**Files:**
- Modify: `.env.example` if present; otherwise create `.env.example`
- Modify: `README.md`

**Interfaces:**
- Required production environment: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

- [ ] **Step 1: Document environment variables.**

Do not place real service-role credentials in GitHub. Document where the production values must be entered in Vercel.

- [ ] **Step 2: Run the SQL files in the Travel Store Supabase Production project.**

Run `supabase/store.sql` and `supabase/store-functions.sql` in the Supabase SQL Editor after reviewing the generated schema.

- [ ] **Step 3: Configure Vercel production environment variables.**

Set the two required Supabase variables for Production and redeploy.

- [ ] **Step 4: Run build verification.**

```bash
npm run build
```

Expected: exit code 0 with no TypeScript/build errors.

- [ ] **Step 5: Verify cross-device acceptance cases.**

Create/edit product, category, customer, bill, stock, expense, inquiry, and staff permission on one device; refresh another device and verify the same cloud state.

- [ ] **Step 6: Verify localStorage clearing safety.**

Clear browser storage after cloud migration, log in again, and verify business data remains in Supabase.

- [ ] **Step 7: Commit documentation/config changes.**

```bash
git add .env.example README.md
git commit -m "docs: document Travel Store Supabase deployment"
```

---

## Final Verification Checklist

- [ ] Supabase schema and RLS are installed in Production.
- [ ] Server session authentication works with existing login credentials after user migration.
- [ ] Service-role key is server-only.
- [ ] Products and categories sync across devices.
- [ ] Customers and balances sync across devices.
- [ ] Bills and bill items sync and date search remains correct.
- [ ] Billing and stock decrement are atomic.
- [ ] Stock purchases sync and reporting/export still works.
- [ ] Expenses and enquiries sync.
- [ ] Staff permissions are server-enforced.
- [ ] Legacy localStorage migration is idempotent and explicit when both sources have data.
- [ ] Cloud failures are surfaced as failures.
- [ ] Clearing browser localStorage does not delete cloud data.
- [ ] `npm run build` passes.
