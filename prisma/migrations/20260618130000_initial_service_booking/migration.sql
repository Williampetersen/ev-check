CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'admin',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "services" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "description" TEXT NOT NULL,
  "durationMinutes" INTEGER NOT NULL,
  "price" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'DKK',
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "availability" (
  "id" TEXT PRIMARY KEY,
  "serviceId" TEXT NOT NULL REFERENCES "services"("id") ON DELETE CASCADE,
  "weekday" INTEGER NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "slotIntervalMinutes" INTEGER NOT NULL DEFAULT 15,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS "availability_service_weekday_idx"
  ON "availability" ("serviceId", "weekday");

CREATE TABLE IF NOT EXISTS "bookings" (
  "id" TEXT PRIMARY KEY,
  "bookingNumber" TEXT NOT NULL UNIQUE,
  "serviceId" TEXT NOT NULL REFERENCES "services"("id"),
  "customerName" TEXT NOT NULL,
  "customerEmail" TEXT NOT NULL,
  "customerPhone" TEXT NOT NULL,
  "customerMessage" TEXT NOT NULL DEFAULT '',
  "bookingDate" DATE NOT NULL,
  "bookingTime" TEXT NOT NULL,
  "durationMinutes" INTEGER NOT NULL,
  "totalPrice" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'DKK',
  "status" TEXT NOT NULL DEFAULT 'pending',
  "invoiceNumber" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "bookings_service_date_time_key" UNIQUE ("serviceId", "bookingDate", "bookingTime")
);

CREATE INDEX IF NOT EXISTS "bookings_status_date_idx"
  ON "bookings" ("status", "bookingDate");

CREATE TABLE IF NOT EXISTS "invoices" (
  "id" TEXT PRIMARY KEY,
  "bookingId" TEXT UNIQUE REFERENCES "bookings"("id") ON DELETE CASCADE,
  "appointmentId" TEXT UNIQUE,
  "invoiceNumber" TEXT NOT NULL UNIQUE,
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'DKK',
  "pdfUrl" TEXT,
  "pdfPath" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "invoices_appointment_idx"
  ON "invoices" ("appointmentId");

CREATE TABLE IF NOT EXISTS "customers" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL DEFAULT '',
  "email" TEXT NOT NULL DEFAULT '',
  "phone" TEXT DEFAULT '',
  "address" TEXT DEFAULT '',
  "postal_code" TEXT DEFAULT '',
  "city" TEXT DEFAULT '',
  "company" TEXT DEFAULT '',
  "notes" TEXT DEFAULT '',
  "portal_token" TEXT UNIQUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "appointments" (
  "id" TEXT PRIMARY KEY,
  "customer_id" TEXT NOT NULL REFERENCES "customers"("id") ON DELETE CASCADE,
  "vehicle_label" TEXT DEFAULT '',
  "registration_number" TEXT DEFAULT '',
  "service_label" TEXT DEFAULT '',
  "report_label" TEXT DEFAULT '',
  "appointment_date" DATE NOT NULL,
  "appointment_time" TEXT NOT NULL,
  "appointment_end_time" TEXT DEFAULT '',
  "status" TEXT NOT NULL DEFAULT 'pending',
  "payment_status" TEXT NOT NULL DEFAULT 'unpaid',
  "invoice_status" TEXT NOT NULL DEFAULT 'not_requested',
  "invoice_number" TEXT DEFAULT '',
  "total" INTEGER NOT NULL DEFAULT 0,
  "assigned_user" TEXT DEFAULT '',
  "area_name" TEXT DEFAULT '',
  "admin_notes" TEXT DEFAULT '',
  "addons_json" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "booking_payload_json" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "source" TEXT NOT NULL DEFAULT 'website',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "email_logs" (
  "id" TEXT PRIMARY KEY,
  "appointment_id" TEXT,
  "customer_id" TEXT,
  "recipient" TEXT NOT NULL,
  "recipient_role" TEXT NOT NULL DEFAULT 'customer',
  "template_key" TEXT NOT NULL DEFAULT 'booking_confirmation',
  "subject" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "error_message" TEXT DEFAULT '',
  "sent_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE "email_logs"
  ADD COLUMN IF NOT EXISTS "bookingId" TEXT,
  ADD COLUMN IF NOT EXISTS "appointmentId" TEXT,
  ADD COLUMN IF NOT EXISTS "customerId" TEXT,
  ADD COLUMN IF NOT EXISTS "recipientRole" TEXT DEFAULT 'customer',
  ADD COLUMN IF NOT EXISTS "templateKey" TEXT DEFAULT 'booking_confirmation',
  ADD COLUMN IF NOT EXISTS "sentAt" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "errorMessage" TEXT,
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE "appointments"
  ADD COLUMN IF NOT EXISTS "booking_number" TEXT,
  ADD COLUMN IF NOT EXISTS "service_id" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "appointments_booking_number_key"
  ON "appointments" ("booking_number")
  WHERE "booking_number" IS NOT NULL;
