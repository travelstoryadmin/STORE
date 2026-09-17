# Travel Store Supabase Data Sync Design

**Date:** 2026-09-17

## Goal
Make Supabase the shared persistent database for Travel Story so Products, Categories, Customers, Bills, Stock Logs, Expenses, Enquiries, and Staff data are available consistently across PC and mobile instead of relying on browser-local localStorage.

## Current State
The application is a Next.js App Router app. `lib/store.tsx` currently persists the main business datasets in browser localStorage keys such as `noor_products_v4`, `noor_customers_v4`, `noor_bills_v4`, `noor_stock_logs_v4`, `travel_expenses_v1`, `travel_inquiries_v1`, `noor_users_v1`, `travel_categories_v1`, and `travel_category_images_v1`. A server route already exists at `app/api/site-settings/route.ts` and uses Supabase REST with `SUPABASE_SERVICE_ROLE_KEY`; `supabase/site-settings.sql` defines the existing shared settings table.

## Proposed Architecture
Supabase PostgreSQL becomes the source of truth for business data. The browser will continue to hold short-lived React state for UI responsiveness, but reads and writes will go through server-side Next.js API routes. The service-role key remains server-only. The application will keep localStorage only for non-authoritative UI/session cache and as a one-time migration source for legacy browser data.

### Data model
Create normalized tables:

- `products`: id, name, category, price, expense, stock, image, active, created_at, updated_at
- `categories`: id, name, image, created_at, updated_at
- `customers`: id, name, mobile, place, balance, created_at, updated_at
- `bills`: id, bill_no, bill_date, customer_id, subtotal, discount, total, paid, balance, payment, expense, profit, status, created_at, updated_at
- `bill_items`: id, bill_id, product_id, name_snapshot, qty, price, expense, total
- `stock_logs`: id, product_id, product_name_snapshot, qty, expense, log_date, type, created_at
- `expenses`: id, expense_date, category, description, amount, added_by, created_at, updated_at
- `inquiries`: id, inquiry_date, customer_name, mobile, place, product, description, status, added_by, created_at, updated_at
- `staff_users`: id, username, name, role, password_hash, permissions, active, created_at, updated_at

Business IDs currently represented as numbers will remain stable where possible. Bill numbers remain the human-facing unique identifier. Bill item snapshots preserve the product name/price/cost at the time of sale so later product edits do not rewrite historical bills.

### API boundary
Add server-side routes under `app/api/store/` for authenticated CRUD and transactional operations. The service role is used only in these server routes. Sales/billing creation and stock decrement must be performed atomically so a bill cannot be saved without its corresponding stock update.

The API will expose only the fields/actions required by the UI, validate input on the server, and reject unauthenticated or unauthorized writes. Admin-only fields/actions such as product cost, profit, staff management, and category management remain permission controlled.

### Authentication/session
The existing localStorage/plaintext demo authentication is not suitable as the trust boundary for server-side database writes. Introduce a server-verifiable session cookie for admin/staff API authorization. Existing demo users can be migrated into `staff_users` with password hashes; the first login after migration can continue using the current demo credentials, but the password is stored hashed server-side. Permissions remain compatible with the existing `Permission` values, including `categories`.

This keeps the existing login UI while moving authorization decisions away from client-controlled localStorage values.

### Legacy data migration
On first connection, the client checks whether Supabase has initialized data. If not, an authenticated migration endpoint accepts a validated snapshot of the current localStorage datasets and writes them to Supabase. Migration is idempotent: stable IDs and unique keys prevent duplicate imports. Seed/demo customers should not be recreated as a side effect; only data actually present in the user's current browser should be migrated. After successful migration, the UI switches to Supabase reads/writes.

If Supabase already contains data, the application must not silently overwrite it with an empty browser store. The migration flow must show an explicit import/skip decision when both sources contain records.

### Offline/cache behavior
The first implementation targets reliable online synchronization. Existing local state can be retained as a read cache, but Supabase remains authoritative. If the network is unavailable, the UI should show a clear sync/offline state instead of falsely reporting a successful cloud save. A later offline queue can be added without changing the database contract.

## UI behavior after migration

- Products page reads/writes products and categories from Supabase.
- Categories page reads/writes categories and category images from Supabase.
- Sales/Billing reads customers/products and writes bills, bill items, customer balance, and stock changes transactionally.
- Bills & History reads bills from Supabase, preserving the current-month default and date-range search/export behavior.
- Stock Management reads products/stock logs and writes stock purchases to Supabase.
- Expenses reads/writes expenses in Supabase.
- Enquiries reads/writes inquiries in Supabase.
- Customers reads customers and bill counts from Supabase.
- Settings/staff management reads/writes staff users through the protected server API.
- Reports calculate from Supabase data rather than browser-only state.

## Security requirements

1. `SUPABASE_SERVICE_ROLE_KEY` is never sent to the browser.
2. API routes validate the server session and permission for every mutation.
3. Server validation rejects malformed IDs, negative quantities where not allowed, invalid payment/status values, and invalid dates.
4. Database constraints protect unique usernames, unique bill numbers, required relationships, and valid bill/payment fields.
5. Row-level security is enabled for application tables. Because the browser talks to the protected Next.js API rather than the database directly, privileged service-role access stays server-side.
6. Existing localStorage credentials are treated as legacy data only and are not trusted for authorization after migration.

## Deployment/configuration

Required Vercel environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The SQL migration will be run once in the Supabase Production project's SQL Editor. The application must fail clearly when required cloud configuration is missing rather than silently falling back to a separate browser-only database.

## Compatibility

The existing UI and features should remain visually and behaviorally compatible unless a cloud-sync status or migration dialog is required. Current exports/printing remain client-side because they operate on already-loaded report data; their source data becomes Supabase-backed.

## Acceptance Criteria

1. A product created on PC appears on mobile after refresh without copying localStorage.
2. A category rename/image change is visible on another device.
3. A customer and its credit balance are shared across devices.
4. A completed bill and its bill items are visible from another device and remain searchable by date.
5. Adding stock on one device changes available stock on another device.
6. Expenses and enquiries are shared across devices.
7. Staff permissions are enforced by the server, not merely hidden in the UI.
8. Refreshing/clearing browser localStorage does not delete cloud business data.
9. A failed cloud write is reported as failed and does not claim success.
10. Existing browser data can be migrated once without duplicate bills/products/customers.
11. `npm run build` completes successfully after the migration implementation.
