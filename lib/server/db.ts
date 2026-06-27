import postgres, { type Sql } from "postgres";

declare global {
  var EvCheckSql: Sql | null | undefined;
  var EvCheckSchemaPromise: Promise<void> | null | undefined;
}

let cachedSql: Sql | null | undefined = globalThis.EvCheckSql;
let schemaPromise: Promise<void> | null =
  globalThis.EvCheckSchemaPromise ?? null;

export const getConnectionString = () =>
  process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

export const isDatabaseConfigured = () => Boolean(getConnectionString());

export const shouldRunDatabaseSetup = () =>
  process.env.NODE_ENV !== "production" ||
  process.env.DATABASE_AUTO_SETUP === "true" ||
  process.env.DATABASE_RUN_MIGRATIONS === "true";

const createClient = () => {
  const connectionString = getConnectionString();
  if (!connectionString) return null;

  return postgres(connectionString, {
    ssl: "require",
    prepare: false,
    max: Number(process.env.DATABASE_MAX_CONNECTIONS || 5),
  });
};

export const getSql = () => {
  if (cachedSql === undefined) {
    cachedSql = createClient();
    globalThis.EvCheckSql = cachedSql;
  }
  if (!cachedSql) {
    throw new Error("DATABASE_URL is not configured.");
  }
  return cachedSql;
};

export async function ensureSchema(options: { force?: boolean } = {}) {
  if (
    !isDatabaseConfigured() ||
    (!options.force && !shouldRunDatabaseSetup())
  ) {
    return;
  }

  const sql = getSql();
  if (!schemaPromise) {
    schemaPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS customers (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT DEFAULT '',
          address TEXT DEFAULT '',
          postal_code TEXT DEFAULT '',
          city TEXT DEFAULT '',
          company TEXT DEFAULT '',
          notes TEXT DEFAULT '',
          portal_token TEXT UNIQUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;

      await sql`
        ALTER TABLE customers
          ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '',
          ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '',
          ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '',
          ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '',
          ADD COLUMN IF NOT EXISTS postal_code TEXT DEFAULT '',
          ADD COLUMN IF NOT EXISTS city TEXT DEFAULT '',
          ADD COLUMN IF NOT EXISTS company TEXT DEFAULT '',
          ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '',
          ADD COLUMN IF NOT EXISTS portal_token TEXT,
          ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS customers_email_idx
        ON customers (LOWER(email));
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS appointments (
          id TEXT PRIMARY KEY,
          customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
          vehicle_label TEXT DEFAULT '',
          registration_number TEXT DEFAULT '',
          service_label TEXT DEFAULT '',
          report_label TEXT DEFAULT '',
          appointment_date DATE NOT NULL,
          appointment_time TEXT NOT NULL,
          appointment_end_time TEXT DEFAULT '',
          status TEXT NOT NULL DEFAULT 'pending',
          payment_status TEXT NOT NULL DEFAULT 'unpaid',
          invoice_status TEXT NOT NULL DEFAULT 'not_requested',
          invoice_number TEXT DEFAULT '',
          total INTEGER NOT NULL DEFAULT 0,
          assigned_user TEXT DEFAULT '',
          area_name TEXT DEFAULT '',
          admin_notes TEXT DEFAULT '',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;

      await sql`
        ALTER TABLE appointments
          ADD COLUMN IF NOT EXISTS vehicle_label TEXT DEFAULT '',
          ADD COLUMN IF NOT EXISTS registration_number TEXT DEFAULT '',
          ADD COLUMN IF NOT EXISTS service_label TEXT DEFAULT '',
          ADD COLUMN IF NOT EXISTS report_label TEXT DEFAULT '',
          ADD COLUMN IF NOT EXISTS appointment_end_time TEXT DEFAULT '',
          ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid',
          ADD COLUMN IF NOT EXISTS invoice_status TEXT NOT NULL DEFAULT 'not_requested',
          ADD COLUMN IF NOT EXISTS invoice_number TEXT DEFAULT '',
          ADD COLUMN IF NOT EXISTS total INTEGER NOT NULL DEFAULT 0,
          ADD COLUMN IF NOT EXISTS assigned_user TEXT DEFAULT '',
          ADD COLUMN IF NOT EXISTS area_name TEXT DEFAULT '',
          ADD COLUMN IF NOT EXISTS admin_notes TEXT DEFAULT '',
          ADD COLUMN IF NOT EXISTS addons_json JSONB NOT NULL DEFAULT '[]'::jsonb,
          ADD COLUMN IF NOT EXISTS booking_payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
          ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'website',
          ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS dashboard_users (
          id TEXT PRIMARY KEY,
          full_name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          phone TEXT DEFAULT '',
          role TEXT NOT NULL DEFAULT 'inspector',
          status TEXT NOT NULL DEFAULT 'active',
          assigned_services_json JSONB NOT NULL DEFAULT '[]'::jsonb,
          working_area TEXT DEFAULT '',
          password_hash TEXT DEFAULT '',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS dashboard_settings (
          settings_key TEXT PRIMARY KEY DEFAULT 'default',
          company_name TEXT NOT NULL DEFAULT 'EV Check',
          support_email TEXT NOT NULL DEFAULT 'support@ev-check.dk',
          admin_notify_email TEXT NOT NULL DEFAULT '',
          default_appointment_status TEXT NOT NULL DEFAULT 'pending',
          booking_enabled BOOLEAN NOT NULL DEFAULT true,
          timezone TEXT NOT NULL DEFAULT 'Europe/Copenhagen',
          start_hour INTEGER NOT NULL DEFAULT 8,
          end_hour INTEGER NOT NULL DEFAULT 18,
          slot_minutes INTEGER NOT NULL DEFAULT 60,
          service_areas_json JSONB NOT NULL DEFAULT '[]'::jsonb,
          services_json JSONB NOT NULL DEFAULT '[]'::jsonb,
          email_automation_json JSONB NOT NULL DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;

      await sql`
        ALTER TABLE dashboard_settings
          ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'Europe/Copenhagen';
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS email_logs (
          id TEXT PRIMARY KEY,
          appointment_id TEXT,
          customer_id TEXT,
          recipient TEXT NOT NULL,
          recipient_role TEXT NOT NULL,
          template_key TEXT NOT NULL,
          subject TEXT NOT NULL,
          status TEXT NOT NULL,
          error_message TEXT DEFAULT '',
          sent_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS customer_email_verifications (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL,
          portal_token TEXT NOT NULL,
          code_hash TEXT NOT NULL,
          expires_at TIMESTAMPTZ NOT NULL,
          used_at TIMESTAMPTZ,
          attempts INTEGER NOT NULL DEFAULT 0,
          last_attempt_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS customer_email_verifications_portal_token_idx
        ON customer_email_verifications (portal_token, created_at DESC);
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS customer_email_verifications_active_idx
        ON customer_email_verifications (expires_at)
        WHERE used_at IS NULL;
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS invoices (
          id TEXT PRIMARY KEY,
          "bookingId" TEXT,
          "appointmentId" TEXT UNIQUE,
          "invoiceNumber" TEXT NOT NULL UNIQUE,
          amount INTEGER NOT NULL,
          currency TEXT NOT NULL DEFAULT 'DKK',
          "pdfUrl" TEXT,
          "pdfPath" TEXT,
          "pdfData" BYTEA,
          "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;

      await sql`
        ALTER TABLE invoices
          ADD COLUMN IF NOT EXISTS "bookingId" TEXT,
          ADD COLUMN IF NOT EXISTS "appointmentId" TEXT,
          ADD COLUMN IF NOT EXISTS "invoiceNumber" TEXT NOT NULL DEFAULT '',
          ADD COLUMN IF NOT EXISTS amount INTEGER NOT NULL DEFAULT 0,
          ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'DKK',
          ADD COLUMN IF NOT EXISTS "pdfUrl" TEXT,
          ADD COLUMN IF NOT EXISTS "pdfPath" TEXT,
          ADD COLUMN IF NOT EXISTS "pdfData" BYTEA,
          ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW();
      `;

      await sql`
        CREATE UNIQUE INDEX IF NOT EXISTS invoices_appointment_id_key
        ON invoices ("appointmentId")
        WHERE "appointmentId" IS NOT NULL;
      `;

      await sql`
        CREATE UNIQUE INDEX IF NOT EXISTS invoices_invoice_number_key
        ON invoices ("invoiceNumber")
        WHERE "invoiceNumber" <> '';
      `;

      await sql`
        ALTER TABLE appointments
          ADD COLUMN IF NOT EXISTS booking_number TEXT,
          ADD COLUMN IF NOT EXISTS service_id TEXT;
      `;

      await sql`
        INSERT INTO dashboard_settings (settings_key)
        VALUES ('default')
        ON CONFLICT (settings_key) DO NOTHING;
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS booking_services (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL DEFAULT '',
          description TEXT NOT NULL DEFAULT '',
          badge TEXT NOT NULL DEFAULT '',
          duration_minutes INTEGER NOT NULL DEFAULT 15,
          buffer_before_minutes INTEGER NOT NULL DEFAULT 60,
          buffer_after_minutes INTEGER NOT NULL DEFAULT 0,
          price INTEGER NOT NULL DEFAULT 0,
          image_data TEXT NOT NULL DEFAULT '',
          features_json JSONB NOT NULL DEFAULT '[]'::jsonb,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;

      await sql`
        ALTER TABLE booking_services
          ADD COLUMN IF NOT EXISTS buffer_before_minutes INTEGER NOT NULL DEFAULT 60,
          ADD COLUMN IF NOT EXISTS buffer_after_minutes INTEGER NOT NULL DEFAULT 0;
      `;

      await sql`
        INSERT INTO booking_services (
          id, title, description, badge, duration_minutes, buffer_before_minutes,
          buffer_after_minutes, price, image_data, features_json, sort_order
        )
        VALUES (
          'battery-health', 'Batteritest af elbil',
          'Fast batteritest med gennemgang af bilens batteristatus og en klar rapport.',
          'Fast service', 15, 60, 0, 1300, '/wp/ev-car-danmark-1.png',
          ${sql.json([
            "Test af batteriets sundhed (SoH)",
            "Opladningstilstand (SoC)",
            "Celle-spændingsbalance",
            "Temperaturmåling",
            "BMS- og fejlkodekontrol",
            "PDF-rapport samme dag",
          ])}, 0
        )
        ON CONFLICT (id) DO NOTHING;
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS booking_unavailable_periods (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL DEFAULT '',
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          start_time TEXT NOT NULL DEFAULT '00:00',
          end_time TEXT NOT NULL DEFAULT '23:59',
          is_full_day BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS booking_unavailable_periods_dates_idx
        ON booking_unavailable_periods (start_date, end_date);
      `;
    })();
    globalThis.EvCheckSchemaPromise = schemaPromise;
  }

  try {
    await schemaPromise;
  } catch (error) {
    schemaPromise = null;
    globalThis.EvCheckSchemaPromise = null;
    throw error;
  }
}
