# Travel Story — Multi Page Next.js

## Pages
- `/` — customer homepage
- `/login` — admin/staff login
- `/admin/dashboard`
- `/admin/products`
- `/admin/categories`
- `/admin/sales`
- `/admin/stock`
- `/admin/expenses`
- `/admin/reports`
- `/admin/bills`
- `/admin/customers`
- `/admin/inquiry`
- `/admin/settings`

## Supabase cloud database
Travel Story now uses the Supabase Production database as the shared cloud source for business data. Browser localStorage is retained as a UI/legacy cache; it is not the intended authoritative database after cloud setup.

Run these SQL files once in the Supabase Production SQL Editor, in this order:

1. `supabase/store.sql`
2. `supabase/store-functions.sql`
3. `supabase/site-settings.sql`

Required Vercel Production environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TRAVEL_SESSION_SECRET`

Never commit the real service-role key or session secret to GitHub.

## Demo login
Admin: `admin` / `admin123`
Staff: `staff` / `staff123`

The first successful cloud login creates the demo admin/staff records if the `staff_users` table is empty. Existing staff records should be migrated before changing/removing the demo accounts.

## Run
```bash
npm install
npm run dev
```

## Cloud behavior
- Products and categories are shared across devices.
- Customers and credit balances are shared across devices.
- Bills and bill items are stored in Supabase.
- Billing stock deduction is performed by the PostgreSQL transaction function.
- Stock purchases, expenses and enquiries sync to Supabase.
- The session cookie is HTTP-only and signed server-side.
