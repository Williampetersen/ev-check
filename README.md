# EV Check

EV Check is a Next.js operations dashboard for EV appointments, customers, service users, email settings, payments, invoices, and customer portals.

## Development

```bash
npx pnpm@9.3.0 install
npx pnpm@9.3.0 dev
```

## Required Environment

Copy `.env.example` and fill in the values you need. The dashboard can render demo data without a database, but persistence requires `DATABASE_URL` or `POSTGRES_URL`.

Core variables:

- `DATABASE_URL` or `POSTGRES_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `CUSTOMER_SESSION_SECRET`
- `AGENT_SESSION_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `MAIL_FROM`
- `BOOKING_ADMIN_EMAIL`

## Routes

- `/admin/login`
- `/admin`
- `/min-konto`
- `/kunde/[token]`
- `/agent/login`
- `/agent`
