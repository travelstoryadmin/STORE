# Travel Story — Multi Page Next.js

## Pages
- `/` — customer homepage
- `/login` — admin/staff login
- `/admin/dashboard`
- `/admin/products`
- `/admin/sales`
- `/admin/stock`
- `/admin/expenses` — Admin only
- `/admin/reports`
- `/admin/bills`
- `/admin/customers`
- `/admin/settings`

## Demo login
Admin: `admin` / `admin123`
Staff: `staff` / `staff123`

## Run
```bash
npm install
npm run dev
```

This demo uses localStorage so products, customers, bills and stock changes persist in the browser. Replace the WhatsApp number in `lib/data.ts` before publishing.
