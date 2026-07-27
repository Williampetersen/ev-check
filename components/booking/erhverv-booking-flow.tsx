"use client";

import Link from "next/link";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Car,
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Receipt,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import type { BookingConfig, BookingService } from "@/lib/server/booking-system";
import {
  calculateServiceCharge,
  formatPrice,
  OTHER_MODEL_SUFFIX,
  type ServiceChargeBreakdown,
  type VatSettings,
} from "@/lib/ev-domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  BrandDropdown,
  Card,
  Field,
  ModelSelect,
  ReviewRow,
  StepHeading,
  StepNav,
  TimeStep,
  calendarDaysForMonth,
  cleanValue,
  dateLabel,
  firstSelectableDate,
  hasValue,
  isValidEmail,
  isValidPhone,
  monthKey,
} from "@/components/booking/ev-booking-flow";

type ErhvervFlowProps = {
  config: BookingConfig;
};

type ErhvervVehicle = {
  id: string;
  brand: string;
  model: string;
  customBrand: string;
  customModel: string;
};

type ErhvervCustomerForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  company: string;
  cvr: string;
  notes: string;
  acceptsTerms: boolean;
};

type ErhvervStep = 1 | 2 | 3 | 4;

const steps = [
  { id: 1 as const, label: "Biler" },
  { id: 2 as const, label: "Tidspunkt" },
  { id: 3 as const, label: "Oplysninger" },
  { id: 4 as const, label: "Bekræft" },
];

const MAX_CARS = 50;

const initialCustomer: ErhvervCustomerForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  postalCode: "",
  city: "",
  company: "",
  cvr: "",
  notes: "",
  acceptsTerms: false,
};

function minutesToTimeLabel(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

/** Per-unit headline price label, honoring the admin's incl./excl. moms display preference. */
function unitPriceLabel(service: BookingService, vat: VatSettings) {
  const { unitHeadline, unitHeadlineIncludesVat } = calculateServiceCharge(
    service,
    1,
    vat,
  );
  return `${formatPrice(unitHeadline)} ${unitHeadlineIncludesVat ? "inkl. moms" : "ekskl. moms"}`;
}

const newVehicle = (): ErhvervVehicle => ({
  id: Math.random().toString(36).slice(2),
  brand: "",
  model: "",
  customBrand: "",
  customModel: "",
});

function vehicleLabel(
  vehicle: ErhvervVehicle,
  config: BookingConfig,
): string {
  const brand = config.carBrands.find((item) => item.id === vehicle.brand);
  const isOtherBrand = vehicle.brand === "other";
  const isOtherModel =
    !isOtherBrand && vehicle.model.endsWith(OTHER_MODEL_SUFFIX);
  const brandLabel = isOtherBrand
    ? cleanValue(vehicle.customBrand)
    : brand?.label || "";
  const modelLabel =
    isOtherBrand || isOtherModel
      ? cleanValue(vehicle.customModel)
      : brand?.models.find((item) => item.id === vehicle.model)?.label || "";
  return [brandLabel, modelLabel].filter(Boolean).join(" ");
}

function vehicleValid(vehicle: ErhvervVehicle): boolean {
  const isOtherBrand = vehicle.brand === "other";
  const isOtherModel =
    !isOtherBrand && vehicle.model.endsWith(OTHER_MODEL_SUFFIX);
  if (isOtherBrand) return hasValue(vehicle.customBrand);
  return (
    Boolean(vehicle.brand) &&
    Boolean(vehicle.model) &&
    (!isOtherModel || hasValue(vehicle.customModel))
  );
}

export function ErhvervBookingFlow({ config }: ErhvervFlowProps) {
  const initialAppointmentDate = firstSelectableDate(config);
  const [step, setStep] = useState<ErhvervStep>(1);
  const [serviceId, setServiceId] = useState(config.services[0]?.id || "");
  const [vehicles, setVehicles] = useState<ErhvervVehicle[]>([newVehicle()]);
  const [appointmentDate, setAppointmentDate] = useState(
    initialAppointmentDate,
  );
  const [appointmentTime, setAppointmentTime] = useState("");
  const [visibleMonth, setVisibleMonth] = useState(
    monthKey(initialAppointmentDate),
  );
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [customer, setCustomer] = useState<ErhvervCustomerForm>(initialCustomer);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmation, setConfirmation] = useState<ErhvervConfirmation | null>(
    null,
  );
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  const selectedService = useMemo(
    () =>
      config.services.find((item) => item.id === serviceId) ||
      config.services[0],
    [config.services, serviceId],
  );
  const durationMinutes = Number(selectedService?.durationMinutes || 15);
  const carCount = vehicles.length;
  const vatSettings = config.settings.vat;
  const charge = useMemo(
    () =>
      calculateServiceCharge(
        selectedService || { price: 0, priceExcludesVat: false },
        carCount,
        vatSettings,
      ),
    [selectedService, carCount, vatSettings],
  );

  const calendarDays = useMemo(
    () =>
      calendarDaysForMonth(
        visibleMonth,
        config.minDate,
        config.maxDate,
        config.unavailablePeriods,
        config.settings.workingDays,
      ),
    [
      config.maxDate,
      config.minDate,
      config.unavailablePeriods,
      config.settings.workingDays,
      visibleMonth,
    ],
  );

  // Total block duration for the whole fleet visit (N cars × service duration).
  const blockDurationMinutes = carCount * durationMinutes;

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      date: appointmentDate,
      serviceId,
      blockDurationMinutes: String(blockDurationMinutes),
    });
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
        setSlots(Array.isArray(payload.slots) ? payload.slots : []);
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setSlots([]);
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
  }, [appointmentDate, serviceId, blockDurationMinutes]);

  useEffect(() => {
    setAppointmentTime((current) =>
      slots.includes(current) ? current : "",
    );
  }, [slots]);

  useEffect(() => {
    if (!isMobileSummaryOpen) return;
    const originalOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileSummaryOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileSummaryOpen]);

  const step1Valid =
    Boolean(serviceId) &&
    vehicles.length > 0 &&
    vehicles.every(vehicleValid);
  const step2Valid = Boolean(appointmentDate && appointmentTime);
  const missingDetails = useMemo(
    () =>
      [
        !hasValue(customer.company) && "Firmanavn",
        !/^\d{8}$/.test(cleanValue(customer.cvr)) && "Gyldigt CVR-nummer (8 cifre)",
        !hasValue(customer.name) && "Kontaktpersonens fulde navn",
        !isValidPhone(customer.phone) && "Gyldigt telefonnummer",
        !isValidEmail(customer.email) && "Gyldig e-mail",
        !hasValue(customer.address) && "Adresse",
        !hasValue(customer.postalCode) && "Postnummer",
        !hasValue(customer.city) && "By",
        !customer.acceptsTerms && "Vilkår og betingelser",
      ].filter(Boolean) as string[],
    [customer],
  );
  const step3Valid = missingDetails.length === 0;
  const canSubmit =
    step1Valid && step2Valid && step3Valid && !slotsLoading && config.databaseConfigured;

  const stepValid: Record<ErhvervStep, boolean> = {
    1: step1Valid,
    2: step2Valid,
    3: step3Valid,
    4: canSubmit,
  };

  const goToStep = (target: ErhvervStep) => {
    if (target <= step) {
      setStep(target);
      return;
    }
    for (let index = step; index < target; index += 1) {
      if (!stepValid[index as ErhvervStep]) return;
    }
    setStep(target);
  };

  const addVehicle = () => {
    setVehicles((current) =>
      current.length >= MAX_CARS ? current : [...current, newVehicle()],
    );
  };

  const removeVehicle = (id: string) => {
    setVehicles((current) =>
      current.length <= 1 ? current : current.filter((item) => item.id !== id),
    );
  };

  const updateVehicle = (id: string, patch: Partial<ErhvervVehicle>) => {
    setVehicles((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const submitBooking = async () => {
    if (!canSubmit || !selectedService) return;
    setSubmitError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/bookings/create-erhverv", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          serviceId,
          appointmentDate,
          appointmentTime,
          customer: { ...customer, email: cleanValue(customer.email) },
          vehicles: vehicles.map((vehicle) => ({
            make: vehicleLabel(vehicle, config),
          })),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(payload.error || "Erhvervsbookingen kunne ikke oprettes.");
      setConfirmation(payload);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Erhvervsbookingen kunne ikke oprettes.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmation) {
    return (
      <ErhvervConfirmationView
        confirmation={confirmation}
        customerEmail={customer.email}
      />
    );
  }

  return (
    <section className="bg-gradient-to-b from-sky-50 via-slate-50 to-slate-50 px-4 pt-10 pb-32 sm:px-6 lg:px-8 lg:pb-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-sky-500 text-white shadow-sm shadow-sky-700/20">
            <CalendarCheck className="h-5 w-5" />
          </span>
          <p className="text-xs font-bold tracking-[0.18em] text-sky-700 uppercase">
            Erhvervsbooking
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Book batteritest til jeres flåde
          </h1>
        </div>

        <Stepper activeStep={step} stepValid={stepValid} onStepClick={goToStep} />

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="order-2 lg:order-1">
            {step === 1 ? (
              <CarsStep
                config={config}
                serviceId={serviceId}
                onServiceChange={setServiceId}
                vehicles={vehicles}
                onAddVehicle={addVehicle}
                onRemoveVehicle={removeVehicle}
                onUpdateVehicle={updateVehicle}
                onContinue={() => goToStep(2)}
                canContinue={step1Valid}
                vatSettings={vatSettings}
              />
            ) : null}

            {step === 2 ? (
              <div>
                <Card className="mb-4">
                  <p className="text-sm leading-6 text-slate-600">
                    Vælg starttidspunkt for hele besøget. Vi tester alle{" "}
                    <strong className="text-slate-900">{carCount}</strong>{" "}
                    {carCount === 1 ? "bil" : "biler"} samlet — besøget varer
                    ca.{" "}
                    <strong className="text-slate-900">
                      {blockDurationMinutes} min.
                    </strong>{" "}
                    i alt.
                  </p>
                </Card>
                <TimeStep
                  appointmentDate={appointmentDate}
                  appointmentTime={appointmentTime}
                  calendarDays={calendarDays}
                  maxDate={config.maxDate}
                  minDate={config.minDate}
                  unavailablePeriods={config.unavailablePeriods}
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
                  onBack={() => goToStep(1)}
                  onContinue={() => goToStep(3)}
                  canContinue={step2Valid}
                />
              </div>
            ) : null}

            {step === 3 ? (
              <DetailsStep
                customer={customer}
                missingDetails={missingDetails}
                onCustomerChange={setCustomer}
                onBack={() => goToStep(2)}
                onContinue={() => goToStep(4)}
                canContinue={step3Valid}
              />
            ) : null}

            {step === 4 ? (
              <ReviewStep
                config={config}
                appointmentDate={appointmentDate}
                appointmentTime={appointmentTime}
                blockDurationMinutes={blockDurationMinutes}
                customer={customer}
                vehicles={vehicles}
                service={selectedService}
                charge={charge}
                vatPercent={vatSettings.percent}
                databaseConfigured={config.databaseConfigured}
                isSubmitting={isSubmitting}
                submitError={submitError}
                canSubmit={canSubmit}
                onBack={() => goToStep(3)}
                onSubmit={submitBooking}
              />
            ) : null}
          </div>

          <ErhvervSummaryCard
            config={config}
            service={selectedService}
            vehicles={vehicles}
            appointmentDate={appointmentDate}
            appointmentTime={appointmentTime}
            blockDurationMinutes={blockDurationMinutes}
            charge={charge}
            vatPercent={vatSettings.percent}
            className="order-1 hidden lg:order-2 lg:block lg:self-start"
          />
        </div>
      </div>
      <ErhvervMobileSummarySheet
        open={isMobileSummaryOpen}
        onClose={() => setIsMobileSummaryOpen(false)}
        config={config}
        service={selectedService}
        vehicles={vehicles}
        appointmentDate={appointmentDate}
        appointmentTime={appointmentTime}
        blockDurationMinutes={blockDurationMinutes}
        charge={charge}
        vatPercent={vatSettings.percent}
        step={step}
      />
      <ErhvervMobileBottomBar
        service={selectedService}
        total={charge.gross}
        vehicleCount={vehicles.length}
        step={step}
        hidden={isMobileSummaryOpen}
        onOpen={() => setIsMobileSummaryOpen(true)}
      />
    </section>
  );
}

function Stepper({
  activeStep,
  stepValid,
  onStepClick,
}: {
  activeStep: ErhvervStep;
  stepValid: Record<ErhvervStep, boolean>;
  onStepClick: (step: ErhvervStep) => void;
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
                      ? "border-sky-500 bg-sky-500 text-white shadow-sm shadow-sky-700/20"
                      : isDone
                        ? "border-sky-500 bg-white text-sky-700"
                        : "border-slate-200 bg-white text-slate-400",
                  )}
                >
                  {isDone ? <CheckCircle2 className="h-4 w-4" /> : item.id}
                </span>
                <span
                  className={cn(
                    "hidden text-xs font-semibold sm:block",
                    isActive
                      ? "text-slate-900"
                      : isDone
                        ? "text-sky-700"
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
                    item.id < activeStep ? "bg-sky-500" : "bg-slate-200",
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

function CarsStep({
  config,
  serviceId,
  onServiceChange,
  vehicles,
  onAddVehicle,
  onRemoveVehicle,
  onUpdateVehicle,
  onContinue,
  canContinue,
  vatSettings,
}: {
  config: BookingConfig;
  serviceId: string;
  onServiceChange: (id: string) => void;
  vehicles: ErhvervVehicle[];
  onAddVehicle: () => void;
  onRemoveVehicle: (id: string) => void;
  onUpdateVehicle: (id: string, patch: Partial<ErhvervVehicle>) => void;
  onContinue: () => void;
  canContinue: boolean;
  vatSettings: VatSettings;
}) {
  const selectedService = config.services.find((item) => item.id === serviceId);
  return (
    <Card>
      {config.services.length > 1 ? (
        <div className="mb-5">
          <p className="mb-2 text-sm font-semibold text-slate-700">Service</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {config.services.map((service) => {
              const selected = service.id === serviceId;
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => onServiceChange(service.id)}
                  className={cn(
                    "rounded-xl border-2 px-4 py-3 text-left text-sm font-semibold transition",
                    selected
                      ? "border-sky-500 bg-sky-50/60 text-slate-900"
                      : "border-slate-200 text-slate-600 hover:border-sky-300",
                  )}
                >
                  <span className="block">{service.title}</span>
                  <span className="mt-1 block text-xs font-bold text-sky-700">
                    {unitPriceLabel(service, vatSettings)} pr. bil
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : selectedService ? (
        <p className="mb-5 flex items-center gap-2 text-sm font-bold text-slate-900">
          <Receipt className="h-4 w-4 shrink-0 text-sky-700" />
          {selectedService.title}
        </p>
      ) : null}

      <div className="grid gap-3">
        {vehicles.map((vehicle, index) => {
          const selectedBrand = config.carBrands.find(
            (item) => item.id === vehicle.brand,
          );
          const isOtherBrand = vehicle.brand === "other";
          const isOtherModel =
            !isOtherBrand && vehicle.model.endsWith(OTHER_MODEL_SUFFIX);
          return (
            <div
              key={vehicle.id}
              className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Car className="h-4 w-4 text-sky-700" />
                  Bil {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => onRemoveVehicle(vehicle.id)}
                  disabled={vehicles.length <= 1}
                  aria-label={`Fjern bil ${index + 1}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Bilmærke" required plain>
                  <BrandDropdown
                    brands={config.carBrands}
                    value={vehicle.brand}
                    onChange={(brand) =>
                      onUpdateVehicle(vehicle.id, {
                        brand,
                        model: "",
                        customModel: "",
                      })
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
                        onUpdateVehicle(vehicle.id, { model, customModel: "" })
                      }
                    />
                  </Field>
                ) : null}
              </div>

              {isOtherBrand ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Field label="Bilmærke (skriv selv)" required>
                    <Input
                      value={vehicle.customBrand}
                      onChange={(event) =>
                        onUpdateVehicle(vehicle.id, {
                          customBrand: event.target.value,
                        })
                      }
                      placeholder="Fx Lucid"
                    />
                  </Field>
                  <Field label="Model">
                    <Input
                      value={vehicle.customModel}
                      onChange={(event) =>
                        onUpdateVehicle(vehicle.id, {
                          customModel: event.target.value,
                        })
                      }
                      placeholder="Fx Air"
                    />
                  </Field>
                </div>
              ) : isOtherModel ? (
                <div className="mt-3">
                  <Field label="Skriv bilmodel" required>
                    <Input
                      value={vehicle.customModel}
                      onChange={(event) =>
                        onUpdateVehicle(vehicle.id, {
                          customModel: event.target.value,
                        })
                      }
                      placeholder="Fx Model 3 Performance"
                    />
                  </Field>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onAddVehicle}
          disabled={vehicles.length >= MAX_CARS}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-sky-300 px-4 text-sm font-bold text-sky-700 transition hover:border-sky-400 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-40 sm:h-10"
        >
          <Plus className="h-4 w-4" />
          Tilføj bil
        </button>
        <p className="text-xs font-semibold text-slate-500">
          {vehicles.length} af {MAX_CARS} biler tilføjet
        </p>
      </div>

      <StepNav onContinue={onContinue} canContinue={canContinue} />
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
  customer: ErhvervCustomerForm;
  missingDetails: string[];
  onCustomerChange: Dispatch<SetStateAction<ErhvervCustomerForm>>;
  onBack: () => void;
  onContinue: () => void;
  canContinue: boolean;
}) {
  return (
    <Card>
      <StepHeading
        title="Virksomhedens oplysninger"
        description="CVR-nummer er et krav for erhvervsbooking, så vi kan fakturere korrekt til virksomheden."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Firmanavn" required>
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
        <Field label="CVR-nummer" required>
          <Input
            inputMode="numeric"
            maxLength={8}
            placeholder="Fx 12345678"
            value={customer.cvr}
            onChange={(event) =>
              onCustomerChange((current) => ({
                ...current,
                cvr: event.target.value.replace(/\D/g, "").slice(0, 8),
              }))
            }
            required
          />
        </Field>
        <Field label="Kontaktperson" required>
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
          className="mt-1 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
        />
        <span>
          Jeg accepterer vilkår og betingelser og giver EV-Check lov til at
          kontakte virksomheden om bookingen.
          <span className="font-semibold text-sky-700"> *</span>
        </span>
      </label>

      {missingDetails.length === 0 ? (
        <p className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4" />
          Oplysningerne er klar.
        </p>
      ) : (
        <p className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Mangler: {missingDetails.join(", ")}.</span>
        </p>
      )}

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
  config,
  appointmentDate,
  appointmentTime,
  blockDurationMinutes,
  customer,
  vehicles,
  service,
  charge,
  vatPercent,
  databaseConfigured,
  isSubmitting,
  submitError,
  canSubmit,
  onBack,
  onSubmit,
}: {
  config: BookingConfig;
  appointmentDate: string;
  appointmentTime: string;
  blockDurationMinutes: number;
  customer: ErhvervCustomerForm;
  vehicles: ErhvervVehicle[];
  service?: BookingService;
  charge: ServiceChargeBreakdown;
  vatPercent: number;
  databaseConfigured: boolean;
  isSubmitting: boolean;
  submitError: string;
  canSubmit: boolean;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const endTime = useMemo(() => {
    if (!appointmentTime) return "";
    const [h, m] = appointmentTime.split(":").map(Number);
    return minutesToTimeLabel((h || 0) * 60 + (m || 0) + blockDurationMinutes);
  }, [appointmentTime, blockDurationMinutes]);

  return (
    <Card>
      <StepHeading
        title="Bekræft jeres erhvervsbooking"
        description="Gennemse biler, tidspunkt og oplysninger, og bekræft bookingen."
      />
      <div className="grid gap-2">
        <ReviewRow label="Service" value={service?.title || ""} />
        <ReviewRow label="Dato" value={dateLabel(appointmentDate)} />
        <ReviewRow
          label="Tid"
          value={
            appointmentTime
              ? `kl. ${appointmentTime}–${endTime} (ca. ${blockDurationMinutes} min.)`
              : "-"
          }
        />
        <ReviewRow
          label={`Biler (${vehicles.length})`}
          value={vehicles
            .map((v, i) => `${i + 1}. ${vehicleLabel(v, config) || "–"}`)
            .join(" · ")}
        />
        <ReviewRow label="Firma" value={customer.company} />
        <ReviewRow label="CVR-nummer" value={customer.cvr} />
        <ReviewRow label="Kontaktperson" value={customer.name} />
        <ReviewRow label="Telefon" value={customer.phone} />
        <ReviewRow label="E-mail" value={customer.email} />
        <ReviewRow
          label="Adresse"
          value={[customer.address, customer.postalCode, customer.city]
            .filter(Boolean)
            .join(", ")}
        />
        <ReviewRow label="Pris ekskl. moms" value={formatPrice(charge.net)} />
        <ReviewRow
          label={`Moms (${vatPercent}%)`}
          value={`+${formatPrice(charge.vat)}`}
        />
        <ReviewRow
          label="Total (inkl. moms)"
          value={formatPrice(charge.gross)}
          highlight
        />
      </div>

      {submitError ? (
        <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
          {submitError}
        </p>
      ) : null}
      {!databaseConfigured ? (
        <p className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm leading-6 font-semibold text-sky-800">
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
          Bekræft erhvervsbooking
        </Button>
      </div>
    </Card>
  );
}

type ErhvervSummaryProps = {
  config: BookingConfig;
  service?: BookingService;
  vehicles: ErhvervVehicle[];
  appointmentDate: string;
  appointmentTime: string;
  blockDurationMinutes: number;
  charge: ServiceChargeBreakdown;
  vatPercent: number;
};

function ErhvervSummaryDetails({
  config,
  service,
  vehicles,
  appointmentDate,
  appointmentTime,
  blockDurationMinutes,
  charge,
  vatPercent,
  className,
}: ErhvervSummaryProps & { className?: string }) {
  const endTime = appointmentTime
    ? minutesToTimeLabel(
        (() => {
          const [h, m] = appointmentTime.split(":").map(Number);
          return (h || 0) * 60 + (m || 0) + blockDurationMinutes;
        })(),
      )
    : "";

  return (
    <div className={className}>
      <p className="text-lg font-bold text-slate-900">
        {service?.title || "Batteritest"}
      </p>
      <div className="mt-3 grid gap-2 text-sm text-slate-600">
        <span className="flex items-center gap-2">
          <Car className="h-4 w-4 text-sky-700" />
          {vehicles.length} {vehicles.length === 1 ? "bil" : "biler"} · ca.{" "}
          {blockDurationMinutes} min. i alt
        </span>
        <span className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-sky-700" />
          Hos jer på Sjælland
        </span>
      </div>

      <div className="mt-4 grid max-h-36 gap-1.5 overflow-y-auto pr-1">
        {vehicles.map((vehicle, index) => {
          const label = vehicleLabel(vehicle, config);
          return (
            <p
              key={vehicle.id}
              className="truncate rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600"
            >
              {index + 1}. {label || "Vælg bil"}
            </p>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-sky-200 bg-sky-50/60 px-3 py-2.5 text-sm">
        {appointmentTime ? (
          <>
            <p className="font-semibold text-slate-900">
              {dateLabel(appointmentDate)}
            </p>
            <p className="mt-0.5 text-slate-600">
              kl. {appointmentTime}–{endTime}
            </p>
          </>
        ) : (
          <p className="font-semibold text-sky-700">Vælg dato og tid.</p>
        )}
      </div>

      <div className="mt-4 grid gap-1.5 border-t border-slate-100 pt-4 text-sm">
        <span className="flex items-center justify-between text-slate-500">
          <span>Pris ekskl. moms</span>
          <span>{formatPrice(charge.net)}</span>
        </span>
        <span className="flex items-center justify-between text-slate-500">
          <span>Moms ({vatPercent}%)</span>
          <span>+{formatPrice(charge.vat)}</span>
        </span>
      </div>
      <div className="mt-2 flex items-baseline justify-between border-t border-slate-100 pt-3">
        <span className="text-sm font-semibold text-slate-500">
          Total inkl. moms
        </span>
        <span className="text-xl font-bold text-sky-700">
          {formatPrice(charge.gross)}
        </span>
      </div>
    </div>
  );
}

function ErhvervSummaryCard({
  className,
  ...summary
}: ErhvervSummaryProps & { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-sky-300/70 bg-white shadow-md shadow-sky-700/10 lg:sticky lg:top-20",
        className,
      )}
    >
      <div className="flex items-center gap-2 bg-sky-500 px-5 py-3 shadow-sm shadow-sky-700/20 sm:px-6">
        <CalendarCheck className="h-4 w-4 text-sky-100" />
        <p className="text-xs font-bold tracking-[0.14em] text-white uppercase">
          Jeres erhvervsbooking
        </p>
      </div>
      <ErhvervSummaryDetails {...summary} className="p-5 sm:p-6" />
    </div>
  );
}

function ErhvervMobileSummarySheet({
  open,
  onClose,
  step,
  ...summary
}: ErhvervSummaryProps & {
  open: boolean;
  onClose: () => void;
  step: ErhvervStep;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end bg-slate-950/50 px-3 pb-[env(safe-area-inset-bottom)] lg:hidden"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="erhverv-mobile-booking-summary-title"
        className="mx-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border border-white/70 bg-white shadow-[0_-22px_64px_rgba(15,23,42,0.24)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
              <CalendarCheck className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h3
                id="erhverv-mobile-booking-summary-title"
                className="text-lg font-bold text-slate-900"
              >
                Jeres erhvervsbooking
              </h3>
              <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">
                Trin {step} af {steps.length}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Luk bookingoversigt"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto">
          <ErhvervSummaryDetails {...summary} className="px-5 py-4" />
        </div>
        <div className="border-t border-slate-100 bg-white px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 text-sm font-bold text-white shadow-[0_12px_28px_rgba(14,116,184,0.24)] transition hover:bg-sky-600"
          >
            Fortsæt booking
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ErhvervMobileBottomBar({
  service,
  total,
  vehicleCount,
  step,
  hidden,
  onOpen,
}: {
  service?: BookingService;
  total: number;
  vehicleCount: number;
  step: ErhvervStep;
  hidden?: boolean;
  onOpen: () => void;
}) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-16px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:hidden",
        hidden && "hidden",
      )}
    >
      <div className="mx-auto flex max-w-xl items-center gap-3 overflow-hidden">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
          <CalendarCheck className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xl leading-none font-bold text-sky-700">
            {formatPrice(total)}
          </p>
          <p className="mt-1 truncate text-xs font-semibold text-slate-500">
            {service?.title || "Batteritest"} · {vehicleCount}{" "}
            {vehicleCount === 1 ? "bil" : "biler"} · Trin {step} af{" "}
            {steps.length}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpen}
          aria-controls="erhverv-mobile-booking-summary-title"
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-sky-500 px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(14,116,184,0.26)] transition hover:bg-sky-600"
        >
          Se oversigt
        </button>
      </div>
    </div>
  );
}

type ErhvervConfirmation = {
  bookingId: string;
  groupId: string;
  portalToken: string;
  portalUrl: string;
  total: number;
  carCount: number;
  unitPrice: number;
  unitNet: number;
  netAmount: number;
  vatAmount: number;
  vatPercent: number;
  appointmentDate: string;
  appointmentTime: string;
  appointmentEndTime: string;
  appointmentLabel: string;
  serviceLabel: string;
  vehicles: Array<{ make: string }>;
  invoiceNumber: string;
};

function ErhvervConfirmationView({
  confirmation,
  customerEmail,
}: {
  confirmation: ErhvervConfirmation;
  customerEmail: string;
}) {
  const carWord = confirmation.carCount === 1 ? "bil" : "biler";
  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 p-6 text-center shadow-sm sm:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-9 w-9 text-emerald-600" />
        </span>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Jeres erhvervsbooking er modtaget
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
          Vi har reserveret tid til batteritest af{" "}
          <strong className="text-slate-900">
            {confirmation.carCount} {carWord}
          </strong>{" "}
          og sendt en bekræftelse pr. e-mail.
        </p>
        <div className="mt-6 grid gap-2 text-left">
          <ReviewRow label="Booking ID" value={confirmation.bookingId} />
          <ReviewRow label="Service" value={confirmation.serviceLabel} />
          <ReviewRow
            label="Tid"
            value={`${dateLabel(confirmation.appointmentDate)} kl. ${confirmation.appointmentTime}–${confirmation.appointmentEndTime}`}
          />
          <ReviewRow
            label={`Biler (${confirmation.carCount})`}
            value={confirmation.vehicles
              .map((v, i) => `${i + 1}. ${v.make}`)
              .join(" · ")}
          />
          {confirmation.invoiceNumber ? (
            <ReviewRow label="Faktura" value={confirmation.invoiceNumber} />
          ) : null}
          <ReviewRow
            label="Pris pr. bil (ekskl. moms)"
            value={`${formatPrice(confirmation.unitNet)} pr. bil`}
          />
          <ReviewRow
            label="Pris ekskl. moms"
            value={formatPrice(confirmation.netAmount)}
          />
          <ReviewRow
            label={`Moms (${confirmation.vatPercent}%)`}
            value={`+${formatPrice(confirmation.vatAmount)}`}
          />
          <ReviewRow
            label="Total (inkl. moms)"
            value={formatPrice(confirmation.total)}
            highlight
          />
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href={confirmation.portalUrl}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-sky-500 px-4 text-sm font-semibold text-white transition hover:bg-sky-600"
          >
            Åbn kundeportal
          </Link>
          <a
            href={`mailto:${customerEmail}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-sky-300"
          >
            <Mail className="h-4 w-4" />
            {customerEmail}
          </a>
          <a
            href="tel:+4571900530"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-sky-300"
          >
            <Phone className="h-4 w-4" />
            Ring til os
          </a>
        </div>
      </div>
    </section>
  );
}
