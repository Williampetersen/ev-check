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
- `MAIL_FROM_NAME`
- `BOOKING_ADMIN_EMAIL`
- `APP_URL`

For one.com mail, use:

```env
SMTP_HOST=send.one.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@ev-check.dk
MAIL_FROM="EV-Check.dk <info@ev-check.dk>"
MAIL_FROM_NAME=EV-Check.dk
BOOKING_ADMIN_EMAIL=info@ev-check.dk
APP_URL=https://ev-check.dk
```

## Routes

- `/admin/login`
- `/admin`
- `/min-konto`
- `/kunde/[token]`
- `/agent/login`
- `/agent`
