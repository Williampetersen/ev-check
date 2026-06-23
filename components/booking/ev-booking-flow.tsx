"use client";

import Image from "next/image";
import Link from "next/link";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Car,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import type {
  BookingConfig,
  BookingService,
  CarBrand,
  CarModelOption,
} from "@/lib/server/booking-system";
import { formatPrice, OTHER_MODEL_SUFFIX } from "@/lib/ev-domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type BookingFlowProps = {
  config: BookingConfig;
};

type CustomerType = "private" | "business";

type CustomerForm = {
  customerType: CustomerType;
  name: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  company: string;
  notes: string;
  acceptsTerms: boolean;
};

type VehicleForm = {
  brand: string;
  model: string;
  customBrand: string;
  customModel: string;
};

type Confirmation = {
  bookingId: string;
  portalUrl: string;
  total: number;
  appointmentLabel: string;
  serviceLabel: string;
};

const initialCustomer: CustomerForm = {
  customerType: "private",
  name: "",
  email: "",
  phone: "",
  address: "",
  postalCode: "",
  city: "",
  company: "",
  notes: "",
  acceptsTerms: false,
};

const initialVehicle: VehicleForm = {
  brand: "",
  model: "",
  customBrand: "",
  customModel: "",
};

const weekdayLabels = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

const steps = [
  { id: 1 as const, label: "Vælg bil" },
  { id: 2 as const, label: "Service" },
  { id: 3 as const, label: "Tidspunkt" },
  { id: 4 as const, label: "Dine oplysninger" },
  { id: 5 as const, label: "Bekræft" },
];

type Step = 1 | 2 | 3 | 4 | 5;

type CalendarDay = {
  key: string;
  day: number;
  inMonth: boolean;
  disabled: boolean;
};

function dateFromKey(date: string) {
  return new Date(`${date}T12:00:00`);
}

function dateKey(date: Date) {
  const copy = new Date(date);
  copy.setHours(12, 0, 0, 0);
  return copy.toISOString().slice(0, 10);
}

function monthKey(date: string) {
  return `${date.slice(0, 7)}-01`;
}

function addMonths(date: string, months: number) {
  const next = dateFromKey(monthKey(date));
  next.setMonth(next.getMonth() + months);
  return dateKey(next);
}

function dateLabel(date: string) {
  try {
    return new Intl.DateTimeFormat("da-DK", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    }).format(new Date(`${date}T12:00:00`));
  } catch {
    return date;
  }
}

function fullDateLabel(date: string) {
  try {
    return new Intl.DateTimeFormat("da-DK", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(dateFromKey(date));
  } catch {
    return date;
  }
}

function monthLabel(date: string) {
  try {
    return new Intl.DateTimeFormat("da-DK", {
      month: "long",
      year: "numeric",
    }).format(dateFromKey(date));
  } catch {
    return date.slice(0, 7);
  }
}

function calendarDaysForMonth(
  visibleMonth: string,
  minDate: string,
  maxDate: string,
): CalendarDay[] {
  const first = dateFromKey(monthKey(visibleMonth));
  const start = new Date(first);
  const mondayOffset = (first.getDay() + 6) % 7;
  start.setDate(first.getDate() - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    const key = dateKey(day);
    const isSunday = day.getDay() === 0;
    return {
      key,
      day: day.getDate(),
      inMonth: day.getMonth() === first.getMonth(),
      disabled: key < minDate || key > maxDate || isSunday,
    };
  });
}

function cleanValue(value: string) {
  return value.trim();
}

function hasValue(value: string) {
  return cleanValue(value).length > 0;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanValue(value));
}

function isValidPhone(value: string) {
  const digits = cleanValue(value).replace(/[\s-]/g, "");
  return /^\+?\d{8,12}$/.test(digits);
}

export function EvBookingFlow({ config }: BookingFlowProps) {
  const [step, setStep] = useState<Step>(1);
  const [serviceId, setServiceId] = useState(config.services[0]?.id || "");
  const [vehicle, setVehicle] = useState<VehicleForm>(initialVehicle);
  const [appointmentDate, setAppointmentDate] = useState(config.minDate);
  const [appointmentTime, setAppointmentTime] = useState("");
  const [visibleMonth, setVisibleMonth] = useState(monthKey(config.minDate));
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [customer, setCustomer] = useState<CustomerForm>(initialCustomer);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const selectedService = useMemo(
    () =>
      config.services.find((item) => item.id === serviceId) ||
      config.services[0],
    [config.services, serviceId],
  );
  const total = useMemo(
    () => Number(selectedService?.price || 0),
    [selectedService?.price],
  );
  const durationMinutes = useMemo(
    () => Number(selectedService?.durationMinutes || 0),
    [selectedService?.durationMinutes],
  );
  const calendarDays = useMemo(
    () => calendarDaysForMonth(visibleMonth, config.minDate, config.maxDate),
    [config.maxDate, config.minDate, visibleMonth],
  );

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ date: appointmentDate, serviceId });
    setSlotsLoading(true);
    setSlotsError("");
    fetch(`/api/booking/availability?${params.toString()}`, {
      headers: { accept: "application/json" },
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = (await response.json().catch(() => ({}))) as {
          slots?: string[];
          error?: string;
        };
        if (!response.ok)
          throw new Error(payload.error || "Kunne ikke hente ledige tider.");
        const nextSlots = Array.isArray(payload.slots) ? payload.slots : [];
        setSlots(nextSlots);
        setAppointmentTime((current) =>
          nextSlots.includes(current) ? current : "",
        );
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setSlots([]);
        setAppointmentTime("");
        setSlotsError(
          error instanceof Error
            ? error.message
            : "Kunne ikke hente ledige tider.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setSlotsLoading(false);
      });

    return () => controller.abort();
  }, [appointmentDate, serviceId]);

  const selectedBrand = useMemo(
    () => config.carBrands.find((item) => item.id === vehicle.brand),
    [config.carBrands, vehicle.brand],
  );
  const isOtherBrand = vehicle.brand === "other";
  const isOtherModel =
    !isOtherBrand && vehicle.model.endsWith(OTHER_MODEL_SUFFIX);
  const brandLabel = isOtherBrand
    ? cleanValue(vehicle.customBrand)
    : selectedBrand?.label || "";
  const modelLabel = isOtherBrand || isOtherModel
    ? cleanValue(vehicle.customModel)
    : selectedBrand?.models.find((item) => item.id === vehicle.model)
        ?.label || "";

  const step1Valid = isOtherBrand
    ? hasValue(vehicle.customBrand)
    : Boolean(vehicle.brand) &&
      Boolean(vehicle.model) &&
      (!isOtherModel || hasValue(vehicle.customModel));
  const step2Valid = Boolean(serviceId);
  const step3Valid = Boolean(appointmentDate && appointmentTime);
  const missingDetails = useMemo(
    () =>
      [
        !hasValue(customer.name) && "Fulde navn",
        !isValidPhone(customer.phone) && "Gyldigt telefonnummer",
        !isValidEmail(customer.email) && "Gyldig e-mail",
        !hasValue(customer.address) && "Adresse",
        !hasValue(customer.postalCode) && "Postnummer",
        !hasValue(customer.city) && "By",
        customer.customerType === "business" &&
          !hasValue(customer.company) &&
          "Firmanavn",
        !customer.acceptsTerms && "Kontaktaccept",
      ].filter(Boolean) as string[],
    [customer],
  );
  const step4Valid = missingDetails.length === 0;
  const canSubmit =
    step1Valid &&
    step2Valid &&
    step3Valid &&
    step4Valid &&
    !slotsLoading &&
    config.databaseConfigured;

  const stepValid: Record<Step, boolean> = {
    1: step1Valid,
    2: step2Valid,
    3: step3Valid,
    4: step4Valid,
    5: canSubmit,
  };

  const goToStep = (target: Step) => {
    if (target <= step) {
      setStep(target);
      return;
    }
    for (let index = step; index < target; index += 1) {
      if (!stepValid[index as Step]) return;
    }
    setStep(target);
  };

  const submitBooking = async () => {
    if (!canSubmit) return;
    setSubmitError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          serviceId,
          addonIds: [],
          appointmentDate,
          appointmentTime,
          customer: { ...customer, email: cleanValue(customer.email) },
          vehicle: {
            make: [brandLabel, modelLabel].filter(Boolean).join(" "),
          },
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(payload.error || "Bookingen kunne ikke oprettes.");
      setConfirmation(payload);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Bookingen kunne ikke oprettes.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmation) {
    return (
      <BookingConfirmation
        confirmation={confirmation}
        customerEmail={customer.email}
      />
    );
  }

  return (
    <section className="bg-gradient-to-b from-teal-50 via-slate-50 to-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-teal-700 text-white shadow-sm">
            <CalendarCheck className="h-5 w-5" />
          </span>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
            Book tid
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Book din batteritest
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Fem enkle trin, og du har en bekræftet tid.
          </p>
        </div>

        <Stepper activeStep={step} stepValid={stepValid} onStepClick={goToStep} />

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="order-2 lg:order-1">
            <SummaryCard
              service={selectedService}
              brandLabel={brandLabel}
              modelLabel={modelLabel}
              brandLogo={selectedBrand?.logo}
              appointmentDate={appointmentDate}
              appointmentTime={appointmentTime}
              total={total}
              durationMinutes={durationMinutes}
              className="mb-6 lg:hidden"
            />

            {step === 1 ? (
              <VehicleStep
                carBrands={config.carBrands}
                vehicle={vehicle}
                selectedBrand={selectedBrand}
                isOtherBrand={isOtherBrand}
                isOtherModel={isOtherModel}
                onVehicleChange={setVehicle}
                onContinue={() => goToStep(2)}
                canContinue={step1Valid}
              />
            ) : null}

            {step === 2 ? (
              <ServiceStep
                services={config.services}
                serviceId={serviceId}
                onServiceChange={setServiceId}
                onBack={() => goToStep(1)}
                onContinue={() => goToStep(3)}
                canContinue={step2Valid}
              />
            ) : null}

            {step === 3 ? (
              <TimeStep
                appointmentDate={appointmentDate}
                appointmentTime={appointmentTime}
                calendarDays={calendarDays}
                maxDate={config.maxDate}
                minDate={config.minDate}
                visibleMonth={visibleMonth}
                slots={slots}
                slotsError={slotsError}
                slotsLoading={slotsLoading}
                onDateChange={(date) => {
                  setAppointmentDate(date);
                  setAppointmentTime("");
                }}
                onMonthChange={setVisibleMonth}
                onTimeChange={setAppointmentTime}
                onBack={() => goToStep(2)}
                onContinue={() => goToStep(4)}
                canContinue={step3Valid}
              />
            ) : null}

            {step === 4 ? (
              <DetailsStep
                customer={customer}
                missingDetails={missingDetails}
                onCustomerChange={setCustomer}
                onBack={() => goToStep(3)}
                onContinue={() => goToStep(5)}
                canContinue={step4Valid}
              />
            ) : null}

            {step === 5 ? (
              <ReviewStep
                appointmentDate={appointmentDate}
                appointmentTime={appointmentTime}
                customer={customer}
                brandLabel={brandLabel}
                modelLabel={modelLabel}
                service={selectedService}
                total={total}
                databaseConfigured={config.databaseConfigured}
                isSubmitting={isSubmitting}
                submitError={submitError}
                canSubmit={canSubmit}
                onBack={() => goToStep(4)}
                onSubmit={submitBooking}
              />
            ) : null}
          </div>

          <SummaryCard
            service={selectedService}
            brandLabel={brandLabel}
            modelLabel={modelLabel}
            brandLogo={selectedBrand?.logo}
            appointmentDate={appointmentDate}
            appointmentTime={appointmentTime}
            total={total}
            durationMinutes={durationMinutes}
            className="order-1 hidden lg:order-2 lg:block lg:self-start"
            sticky
          />
        </div>
      </div>
    </section>
  );
}

function Stepper({
  activeStep,
  stepValid,
  onStepClick,
}: {
  activeStep: Step;
  stepValid: Record<Step, boolean>;
  onStepClick: (step: Step) => void;
}) {
  return (
    <div>
      <div className="flex items-center">
        {steps.map((item, index) => {
          const isActive = item.id === activeStep;
          const isDone = item.id < activeStep;
          return (
            <div key={item.id} className="flex flex-1 items-center last:flex-none">
              <button
                type="button"
                onClick={() => onStepClick(item.id)}
                className="group flex flex-col items-center gap-2"
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition",
                    isActive
                      ? "border-teal-700 bg-teal-700 text-white"
                      : isDone
                      ? "border-teal-700 bg-white text-teal-700"
                      : "border-slate-200 bg-white text-slate-400",
                  )}
                >
                  {isDone ? <Check className="h-4 w-4" /> : item.id}
                </span>
                <span
                  className={cn(
                    "hidden text-xs font-semibold sm:block",
                    isActive
                      ? "text-slate-900"
                      : isDone
                      ? "text-teal-700"
                      : "text-slate-400",
                  )}
                >
                  {item.label}
                </span>
              </button>
              {index < steps.length - 1 ? (
                <span
                  className={cn(
                    "mx-2 h-0.5 flex-1 rounded-full",
                    item.id < activeStep ? "bg-teal-700" : "bg-slate-200",
                  )}
                />
              ) : null}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-sm font-semibold text-slate-900 sm:hidden">
        Trin {activeStep} af {steps.length} — {steps[activeStep - 1].label}
      </p>
    </div>
  );
}

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

function StepHeading({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-5", className)}>
      <h2 className="text-lg font-bold text-slate-900 sm:text-xl">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      ) : null}
    </div>
  );
}

function StepNav({
  onBack,
  onContinue,
  canContinue,
  continueLabel = "Fortsæt",
}: {
  onBack?: () => void;
  onContinue: () => void;
  canContinue: boolean;
  continueLabel?: string;
}) {
  return (
    <div className="mt-6 flex items-center justify-between gap-3">
      {onBack ? (
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Tilbage
        </Button>
      ) : (
        <span />
      )}
      <Button type="button" disabled={!canContinue} onClick={onContinue}>
        {continueLabel}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function BrandDropdown({
  brands,
  value,
  onChange,
}: {
  brands: CarBrand[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = brands.find((brand) => brand.id === value);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-teal-300"
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected?.logo ? (
            <Image
              src={selected.logo}
              alt={selected.label}
              width={22}
              height={22}
              className="h-5 w-5 shrink-0 object-contain"
            />
          ) : (
            <Car className="h-4 w-4 shrink-0 text-slate-400" />
          )}
          <span className="truncate">
            {selected ? selected.label : "Vælg bilmærke"}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-400 transition",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div className="absolute z-20 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          {brands.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-500">
              Ingen bilmærker tilføjet endnu.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {brands.map((brand) => (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => {
                    onChange(brand.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold transition",
                    brand.id === value
                      ? "bg-teal-50 text-teal-700"
                      : "text-slate-700 hover:bg-slate-50",
                  )}
                >
                  {brand.logo ? (
                    <Image
                      src={brand.logo}
                      alt={brand.label}
                      width={22}
                      height={22}
                      className="h-5 w-5 shrink-0 object-contain"
                    />
                  ) : (
                    <Car className="h-5 w-5 shrink-0 text-slate-400" />
                  )}
                  <span className="truncate">{brand.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function ModelSelect({
  models,
  value,
  disabled,
  onChange,
}: {
  models: CarModelOption[];
  value: string;
  disabled?: boolean;
  onChange: (id: string) => void;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
    >
      <option value="">
        {disabled ? "Vælg bilmærke først" : "Vælg model"}
      </option>
      {models.map((model) => (
        <option key={model.id} value={model.id}>
          {model.label}
        </option>
      ))}
    </select>
  );
}

function VehicleStep({
  carBrands,
  vehicle,
  selectedBrand,
  isOtherBrand,
  isOtherModel,
  onVehicleChange,
  onContinue,
  canContinue,
}: {
  carBrands: CarBrand[];
  vehicle: VehicleForm;
  selectedBrand?: CarBrand;
  isOtherBrand: boolean;
  isOtherModel: boolean;
  onVehicleChange: Dispatch<SetStateAction<VehicleForm>>;
  onContinue: () => void;
  canContinue: boolean;
}) {
  return (
    <Card>
      <StepHeading
        title="Vælg din bil"
        description="Vælg bilmærke, og fortæl os hvilken model det er."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Bilmærke" required plain>
          <BrandDropdown
            brands={carBrands}
            value={vehicle.brand}
            onChange={(brand) =>
              onVehicleChange((current) => ({
                ...current,
                brand,
                model: "",
                customModel: "",
              }))
            }
          />
        </Field>
        {!isOtherBrand ? (
          <Field label="Model" required={Boolean(vehicle.brand)} plain>
            <ModelSelect
              models={selectedBrand?.models || []}
              value={vehicle.model}
              disabled={!vehicle.brand}
              onChange={(model) =>
                onVehicleChange((current) => ({
                  ...current,
                  model,
                  customModel: "",
                }))
              }
            />
          </Field>
        ) : null}
      </div>

      {isOtherBrand ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Bilmærke (skriv selv)" required>
            <Input
              value={vehicle.customBrand}
              onChange={(event) =>
                onVehicleChange((current) => ({
                  ...current,
                  customBrand: event.target.value,
                }))
              }
              placeholder="Fx Lucid"
            />
          </Field>
          <Field label="Model">
            <Input
              value={vehicle.customModel}
              onChange={(event) =>
                onVehicleChange((current) => ({
                  ...current,
                  customModel: event.target.value,
                }))
              }
              placeholder="Fx Air"
            />
          </Field>
        </div>
      ) : isOtherModel ? (
        <div className="mt-4">
          <Field label="Skriv din bilmodel" required>
            <Input
              value={vehicle.customModel}
              onChange={(event) =>
                onVehicleChange((current) => ({
                  ...current,
                  customModel: event.target.value,
                }))
              }
              placeholder="Fx Model 3 Performance"
            />
          </Field>
        </div>
      ) : null}

      <StepNav onContinue={onContinue} canContinue={canContinue} />
    </Card>
  );
}

function ServiceStep({
  services,
  serviceId,
  onServiceChange,
  onBack,
  onContinue,
  canContinue,
}: {
  services: BookingService[];
  serviceId: string;
  onServiceChange: (id: string) => void;
  onBack: () => void;
  onContinue: () => void;
  canContinue: boolean;
}) {
  return (
    <Card>
      <StepHeading
        title="Vælg service"
        description="Vælg den service, du ønsker."
      />
      <div className="grid gap-3">
        {services.map((service) => {
          const selected = service.id === serviceId;
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onServiceChange(service.id)}
              className={cn(
                "flex items-start justify-between gap-4 rounded-xl border-2 p-4 text-left transition",
                selected
                  ? "border-teal-700 bg-teal-50/60"
                  : "border-slate-200 hover:border-teal-300",
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                    selected
                      ? "border-teal-700 bg-teal-700 text-white"
                      : "border-slate-300",
                  )}
                >
                  {selected ? <Check className="h-3 w-3" /> : null}
                </span>
                <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                  {service.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={service.imageUrl}
                      alt={service.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-slate-300">
                      <Car className="h-6 w-6" />
                    </span>
                  )}
                </span>
                <div>
                  <p className="font-bold text-slate-900">{service.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {service.description}
                  </p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    {service.duration}
                  </p>
                </div>
              </div>
              <p className="shrink-0 font-bold text-teal-700">
                {formatPrice(service.price)}
              </p>
            </button>
          );
        })}
      </div>

      <StepNav onBack={onBack} onContinue={onContinue} canContinue={canContinue} />
    </Card>
  );
}

function TimeStep({
  appointmentDate,
  appointmentTime,
  calendarDays,
  maxDate,
  minDate,
  visibleMonth,
  slots,
  slotsError,
  slotsLoading,
  onDateChange,
  onMonthChange,
  onTimeChange,
  onBack,
  onContinue,
  canContinue,
}: {
  appointmentDate: string;
  appointmentTime: string;
  calendarDays: CalendarDay[];
  maxDate: string;
  minDate: string;
  visibleMonth: string;
  slots: string[];
  slotsError: string;
  slotsLoading: boolean;
  onDateChange: (date: string) => void;
  onMonthChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onBack: () => void;
  onContinue: () => void;
  canContinue: boolean;
}) {
  const minMonth = monthKey(minDate);
  const maxMonth = monthKey(maxDate);
  const previousMonth = addMonths(visibleMonth, -1);
  const nextMonth = addMonths(visibleMonth, 1);
  const canGoPrevious = previousMonth >= minMonth;
  const canGoNext = nextMonth <= maxMonth;

  return (
    <Card>
      <StepHeading
        title="Vælg dato og tid"
        description="Vi kommer ud til dig på den valgte adresse."
      />
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Forrige måned"
              disabled={!canGoPrevious}
              onClick={() => canGoPrevious && onMonthChange(previousMonth)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-teal-300 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-bold capitalize text-slate-900">
              {monthLabel(visibleMonth)}
            </p>
            <button
              type="button"
              aria-label="Næste måned"
              disabled={!canGoNext}
              onClick={() => canGoNext && onMonthChange(nextMonth)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-teal-300 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wide text-slate-400">
            {weekdayLabels.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {calendarDays.map((day) => {
              const selected = day.key === appointmentDate;
              return (
                <button
                  key={day.key}
                  type="button"
                  disabled={day.disabled}
                  onClick={() => onDateChange(day.key)}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-lg text-sm font-semibold transition",
                    selected
                      ? "bg-teal-700 text-white"
                      : "text-slate-700 hover:bg-teal-50",
                    !day.inMonth && "text-slate-300",
                    day.disabled &&
                      "cursor-not-allowed text-slate-300 hover:bg-transparent",
                  )}
                >
                  {day.day}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm font-bold capitalize text-slate-900">
            {fullDateLabel(appointmentDate)}
          </p>
          <div className="mt-3 min-h-[14rem]">
            {slotsLoading ? (
              <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm font-semibold text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Henter tider
              </div>
            ) : slotsError ? (
              <p className="rounded-xl bg-rose-50 px-3 py-3 text-sm font-semibold text-rose-700">
                {slotsError}
              </p>
            ) : slots.length > 0 ? (
              <div className="grid max-h-[16rem] grid-cols-3 gap-1.5 overflow-y-auto pr-1">
                {slots.map((slot) => {
                  const selected = appointmentTime === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => onTimeChange(slot)}
                      className={cn(
                        "flex h-9 items-center justify-center rounded-lg border text-sm font-semibold transition",
                        selected
                          ? "border-teal-700 bg-teal-700 text-white"
                          : "border-slate-200 text-slate-700 hover:border-teal-300 hover:text-teal-700",
                      )}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 px-4 text-center text-sm font-semibold text-slate-500">
                Ingen tider denne dag.
              </div>
            )}
          </div>
        </div>
      </div>

      <StepNav onBack={onBack} onContinue={onContinue} canContinue={canContinue} />
    </Card>
  );
}

function DetailsStep({
  customer,
  missingDetails,
  onCustomerChange,
  onBack,
  onContinue,
  canContinue,
}: {
  customer: CustomerForm;
  missingDetails: string[];
  onCustomerChange: Dispatch<SetStateAction<CustomerForm>>;
  onBack: () => void;
  onContinue: () => void;
  canContinue: boolean;
}) {
  return (
    <Card>
      <StepHeading
        title="Dine oplysninger"
        description="Så vi kan bekræfte og finde dig på adressen."
      />

      <div className="mb-5">
        <p className="mb-2 text-sm font-semibold text-slate-700">Kundetype</p>
        <div className="inline-flex w-full rounded-xl border border-slate-200 bg-slate-50 p-1 sm:w-auto">
          {(
            [
              { value: "private", label: "Privat" },
              { value: "business", label: "Erhverv" },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                onCustomerChange((current) => ({
                  ...current,
                  customerType: option.value,
                }))
              }
              className={cn(
                "flex-1 rounded-lg px-5 py-2 text-sm font-semibold transition sm:flex-none sm:px-8",
                customer.customerType === option.value
                  ? "bg-white text-teal-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {customer.customerType === "business" ? (
          <Field label="Firmanavn / CVR-nr." required className="sm:col-span-2">
            <Input
              autoComplete="organization"
              value={customer.company}
              onChange={(event) =>
                onCustomerChange((current) => ({
                  ...current,
                  company: event.target.value,
                }))
              }
              required
            />
          </Field>
        ) : null}
        <Field label="Fulde navn" required>
          <Input
            autoComplete="name"
            value={customer.name}
            onChange={(event) =>
              onCustomerChange((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            required
          />
        </Field>
        <Field label="Telefon" required>
          <Input
            autoComplete="tel"
            inputMode="tel"
            maxLength={15}
            placeholder="Fx 12345678"
            value={customer.phone}
            onChange={(event) =>
              onCustomerChange((current) => ({
                ...current,
                phone: event.target.value.replace(/[^\d+\s-]/g, ""),
              }))
            }
            required
          />
        </Field>
        <Field label="E-mail" required className="sm:col-span-2">
          <Input
            autoComplete="email"
            type="email"
            value={customer.email}
            onChange={(event) =>
              onCustomerChange((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
            required
          />
        </Field>
        <Field label="Adresse" required>
          <Input
            autoComplete="street-address"
            value={customer.address}
            onChange={(event) =>
              onCustomerChange((current) => ({
                ...current,
                address: event.target.value,
              }))
            }
            required
          />
        </Field>
        <Field label="Postnummer" required>
          <Input
            autoComplete="postal-code"
            inputMode="numeric"
            maxLength={8}
            value={customer.postalCode}
            onChange={(event) =>
              onCustomerChange((current) => ({
                ...current,
                postalCode: event.target.value,
              }))
            }
            required
          />
        </Field>
        <Field label="By" required>
          <Input
            autoComplete="address-level2"
            value={customer.city}
            onChange={(event) =>
              onCustomerChange((current) => ({
                ...current,
                city: event.target.value,
              }))
            }
            required
          />
        </Field>
        <Field label="Besked" className="sm:col-span-2">
          <Textarea
            value={customer.notes}
            onChange={(event) =>
              onCustomerChange((current) => ({
                ...current,
                notes: event.target.value,
              }))
            }
          />
        </Field>
      </div>

      <label className="mt-5 flex items-start gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={customer.acceptsTerms}
          onChange={(event) =>
            onCustomerChange((current) => ({
              ...current,
              acceptsTerms: event.target.checked,
            }))
          }
          className="mt-1 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
        />
        <span>
          EV-Check må kontakte mig om bookingen.
          <span className="font-semibold text-teal-700"> *</span>
        </span>
      </label>

      {missingDetails.length === 0 ? (
        <p className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4" />
          Oplysningerne er klar.
        </p>
      ) : null}

      <StepNav
        onBack={onBack}
        onContinue={onContinue}
        canContinue={canContinue}
        continueLabel="Gennemgå"
      />
    </Card>
  );
}

function ReviewStep({
  appointmentDate,
  appointmentTime,
  customer,
  brandLabel,
  modelLabel,
  service,
  total,
  databaseConfigured,
  isSubmitting,
  submitError,
  canSubmit,
  onBack,
  onSubmit,
}: {
  appointmentDate: string;
  appointmentTime: string;
  customer: CustomerForm;
  brandLabel: string;
  modelLabel: string;
  service?: BookingService;
  total: number;
  databaseConfigured: boolean;
  isSubmitting: boolean;
  submitError: string;
  canSubmit: boolean;
  onBack: () => void;
  onSubmit: () => void;
}) {
  return (
    <Card>
      <StepHeading
        title="Bekræft din booking"
        description="Gennemse oplysningerne, og bekræft din tid."
      />
      <div className="grid gap-2">
        <ReviewRow label="Service" value={service?.title || ""} />
        <ReviewRow
          label="Tid"
          value={`${dateLabel(appointmentDate)} kl. ${appointmentTime}`}
        />
        <ReviewRow
          label="Bil"
          value={[brandLabel, modelLabel].filter(Boolean).join(" ")}
        />
        <ReviewRow
          label="Kundetype"
          value={customer.customerType === "business" ? "Erhverv" : "Privat"}
        />
        {customer.customerType === "business" ? (
          <ReviewRow label="Firma" value={customer.company} />
        ) : null}
        <ReviewRow label="Navn" value={customer.name} />
        <ReviewRow label="Telefon" value={customer.phone} />
        <ReviewRow label="E-mail" value={customer.email} />
        <ReviewRow
          label="Adresse"
          value={[customer.address, customer.postalCode, customer.city]
            .filter(Boolean)
            .join(", ")}
        />
        <ReviewRow label="Total" value={formatPrice(total)} highlight />
      </div>

      {submitError ? (
        <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
          {submitError}
        </p>
      ) : null}
      {!databaseConfigured ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold leading-6 text-amber-800">
          Tilføj DATABASE_URL, før rigtige bookinger kan gemmes.
        </p>
      ) : null}

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Tilbage
        </Button>
        <Button
          type="button"
          disabled={isSubmitting || !canSubmit}
          onClick={onSubmit}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
          Bekræft booking
        </Button>
      </div>
    </Card>
  );
}

function SummaryCard({
  service,
  brandLabel,
  modelLabel,
  brandLogo,
  appointmentDate,
  appointmentTime,
  total,
  durationMinutes,
  className,
  sticky,
}: {
  service?: BookingService;
  brandLabel: string;
  modelLabel: string;
  brandLogo?: string;
  appointmentDate: string;
  appointmentTime: string;
  total: number;
  durationMinutes: number;
  className?: string;
  sticky?: boolean;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-teal-700/20 bg-white shadow-md",
        sticky && "lg:sticky lg:top-20",
        className,
      )}
    >
      <div className="flex items-center gap-2 bg-teal-700 px-5 py-3 sm:px-6">
        <CalendarCheck className="h-4 w-4 text-teal-100" />
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-white">
          Din booking
        </p>
      </div>
      <div className="p-5 sm:p-6">
        <p className="text-lg font-bold text-slate-900">
          {service?.title || "Batteritest"}
        </p>
        <div className="mt-3 grid gap-2 text-sm text-slate-600">
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-teal-700" />
            {durationMinutes || 0} min.
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-teal-700" />
            Hos dig på Sjælland
          </span>
          {brandLabel ? (
            <span className="flex items-center gap-2">
              {brandLogo ? (
                <Image
                  src={brandLogo}
                  alt={brandLabel}
                  width={18}
                  height={18}
                  className="h-4 w-4 object-contain"
                />
              ) : (
                <Car className="h-4 w-4 text-teal-700" />
              )}
              {[brandLabel, modelLabel].filter(Boolean).join(" ")}
            </span>
          ) : null}
        </div>
        <div className="mt-4 rounded-xl border border-dashed border-teal-200 bg-teal-50/60 px-3 py-2.5 text-sm">
          {appointmentTime ? (
            <p className="font-semibold text-slate-900">
              {dateLabel(appointmentDate)} kl. {appointmentTime}
            </p>
          ) : (
            <p className="font-semibold text-teal-700">Vælg dato og tid.</p>
          )}
        </div>
        <div className="mt-4 flex items-baseline justify-between border-t border-slate-100 pt-4">
          <span className="text-sm font-semibold text-slate-500">Total</span>
          <span className="text-xl font-bold text-teal-700">
            {formatPrice(total)}
          </span>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className,
  required,
  plain,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
  plain?: boolean;
}) {
  const Wrapper = plain ? "div" : "label";
  return (
    <Wrapper
      className={cn(
        "grid gap-1.5 text-sm font-semibold text-slate-700",
        className,
      )}
    >
      <span>
        {label}
        {required ? <span className="text-teal-700"> *</span> : null}
      </span>
      {children}
    </Wrapper>
  );
}

function ReviewRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2.5">
      <span className="text-sm text-slate-500">{label}</span>
      <strong
        className={cn(
          "max-w-[60%] text-right text-sm text-slate-900",
          highlight && "text-lg text-teal-700",
        )}
      >
        {value || "-"}
      </strong>
    </div>
  );
}

function BookingConfirmation({
  confirmation,
  customerEmail,
}: {
  confirmation: Confirmation;
  customerEmail: string;
}) {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 p-6 text-center shadow-sm sm:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-9 w-9 text-emerald-600" />
        </span>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Din booking er modtaget
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
          Vi har sendt bekræftelse og samlet bookingen i kundeportalen.
        </p>
        <div className="mt-6 grid gap-2 text-left">
          <ReviewRow label="Booking" value={confirmation.bookingId} />
          <ReviewRow label="Service" value={confirmation.serviceLabel} />
          <ReviewRow label="Tid" value={confirmation.appointmentLabel} />
          <ReviewRow
            label="Total"
            value={formatPrice(confirmation.total)}
            highlight
          />
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href={confirmation.portalUrl}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            Åbn kundeportal
          </Link>
          <a
            href={`mailto:${customerEmail}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-teal-300"
          >
            <Mail className="h-4 w-4" />
            {customerEmail}
          </a>
          <a
            href="tel:+4571900530"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-teal-300"
          >
            <Phone className="h-4 w-4" />
            Ring til os
          </a>
        </div>
      </div>
    </section>
  );
}
