# EV-Check Booking System

Modern Next.js service-booking website for EV battery tests, with customer booking, admin dashboard, email automation, PostgreSQL persistence, Prisma schema, and PDF invoice/receipt generation.

## Stack

- Next.js 14, React, TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM schema and migrations
- Existing runtime SQL via `postgres`
- Zod API validation
- Nodemailer SMTP emails
- PDFKit invoice/receipt PDFs

## Setup

```bash
npm install
cp .env.example .env.local
```

Fill in at least:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="change-me"
ADMIN_SESSION_SECRET="long-random-secret"
CUSTOMER_SESSION_SECRET="long-random-secret"
AGENT_SESSION_SECRET="long-random-secret"
APP_URL="http://localhost:3000"
```

For SMTP confirmations:

```env
SMTP_HOST=send.one.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@ev-check.dk
SMTP_PASSWORD=...
MAIL_FROM="EV-Check.dk <info@ev-check.dk>"
BOOKING_ADMIN_EMAIL=info@ev-check.dk
```

## Database

Generate Prisma client:

```bash
npm run db:generate
```

Apply Prisma migrations:

```bash
npm run db:migrate
```

Seed sample services and weekday availability:

```bash
npm run db:seed
```

The app also keeps a compatible runtime schema initializer in `lib/server/db.ts`. In production, prefer Prisma migrations and set:

```env
DATABASE_AUTO_SETUP=false
DATABASE_RUN_MIGRATIONS=false
```

## Development

```bash
npm run dev
```

Main routes:

- `/` homepage
- `/service` services
- `/book-tid` booking flow
- `/booking` booking alias
- `/admin/login` admin login
- `/admin` admin dashboard
- `/min-konto` customer login
- `/kunde/[token]` customer portal

## Booking Flow

Customers can:

1. Choose a service/date/time
2. Enter contact information and car name
3. Review the booking
4. Confirm booking

The server validates the payload with Zod, prevents double-booking, creates/updates the customer, saves the appointment, generates a PDF receipt, records invoice data, sends the customer confirmation email, sends the admin notification email, and logs email delivery status.

## Admin

The admin dashboard supports:

- Booking overview and filters
- Status changes: pending, approved, completed, cancelled
- Customer records and portal links
- Email logs and SMTP test email
- Invoice PDF generation/download
- Resend customer confirmation email
- Settings for booking hours, slot interval, service areas, and email automation

## Invoice PDFs

PDF receipts are generated with PDFKit and stored at:

```text
public/generated/invoices
```

Generated PDFs are ignored by Git. Admins can generate/view them from `/admin?view=invoices`.

## Quality Checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```
