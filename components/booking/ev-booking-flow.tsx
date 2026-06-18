"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  AlertCircle,
  BatteryCharging,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  X as CloseIcon,
} from "lucide-react";
import type {
  BookingConfig,
  BookingService,
} from "@/lib/server/booking-system";
import { formatPrice } from "@/lib/ev-domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type BookingFlowProps = {
  config: BookingConfig;
};

type CustomerForm = {
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
  make: string;
  model: string;
  year: string;
  registrationNumber: string;
  currentRange: string;
};

type Confirmation = {
  bookingId: string;
  portalUrl: string;
  total: number;
  appointmentLabel: string;
  serviceLabel: string;
};

const initialCustomer: CustomerForm = {
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
  make: "Tesla",
  model: "",
  year: "",
  registrationNumber: "",
  currentRange: "",
};

const vehicleMakes = [
  "Tesla",
  "BYD",
  "Polestar",
  "Kia",
  "Volkswagen",
  "Hyundai",
  "Mercedes-Benz",
  "BMW",
  "Audi",
  "Anden elbil",
];
const weekdayLabels = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const bookingStepLabels = ["Service", "Oplysninger", "Tid", "Bekræft"];

type CalendarDay = {
  key: string;
  day: number;
  inMonth: boolean;
  disabled: boolean;
  isWeekend: boolean;
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
    const weekday = day.getDay();
    const isSunday = weekday === 0;
    return {
      key,
      day: day.getDate(),
      inMonth: day.getMonth() === first.getMonth(),
      disabled: key < minDate || key > maxDate || isSunday,
      isWeekend: weekday === 0 || weekday === 6,
    };
  });
}

function timeToMinutesValue(time: string) {
  const [hours, minutes] = time.split(":").map((part) => Number(part || 0));
  return hours * 60 + minutes;
}

function timePeriod(time: string) {
  const minutes = timeToMinutesValue(time);
  if (minutes < 12 * 60) return "Formiddag";
  if (minutes < 15 * 60) return "Middag";
  return "Eftermiddag";
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

export function EvBookingFlow({ config }: BookingFlowProps) {
  const [serviceId, setServiceId] = useState(config.services[0]?.id || "");
  const [appointmentDate, setAppointmentDate] = useState(config.minDate);
  const [appointmentTime, setAppointmentTime] = useState("");
  const [visibleMonth, setVisibleMonth] = useState(monthKey(config.minDate));
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [customer, setCustomer] = useState<CustomerForm>(initialCustomer);
  const [vehicle, setVehicle] = useState<VehicleForm>(initialVehicle);
  const [openStep, setOpenStep] = useState<1 | 2 | 3 | 4>(1);
  const [detailsError, setDetailsError] = useState("");
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
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
    const params = new URLSearchParams({
      date: appointmentDate,
      serviceId,
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

  useEffect(() => {
    if (typeof window === "undefined" || window.innerWidth >= 640) return;
    window.setTimeout(() => {
      document
        .querySelector(`[data-booking-step="${openStep}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }, [openStep]);

  const stepOneDone = Boolean(serviceId);
  const missingDetails = useMemo(
    () =>
      [
        !hasValue(vehicle.make) && "Bilmærke",
        !hasValue(vehicle.model) && "Model",
        !hasValue(customer.name) && "Fulde navn",
        !hasValue(customer.phone) && "Telefonnummer",
        !isValidEmail(customer.email) && "Gyldig e-mail",
        !hasValue(customer.address) && "Adresse",
        !hasValue(customer.postalCode) && "Postnummer",
        !hasValue(customer.city) && "By",
        !customer.acceptsTerms && "Kontaktaccept",
      ].filter(Boolean) as string[],
    [
      customer.acceptsTerms,
      customer.address,
      customer.city,
      customer.email,
      customer.name,
      customer.phone,
      customer.postalCode,
      vehicle.make,
      vehicle.model,
    ],
  );
  const stepTwoDone = missingDetails.length === 0;
  const stepThreeDone = Boolean(appointmentDate && appointmentTime);
  const canSubmit =
    stepOneDone &&
    stepTwoDone &&
    stepThreeDone &&
    !slotsLoading &&
    config.databaseConfigured;
  const progressPercent = Math.round((openStep / 4) * 100);

  const continueToDate = () => {
    if (!stepTwoDone) {
      setDetailsError("Udfyld de manglende felter, før du vælger tid.");
      return;
    }
    setDetailsError("");
    setOpenStep(3);
  };

  const continueToReview = () => {
    if (!stepThreeDone) return;
    setSubmitError("");
    setOpenStep(4);
  };

  const submitBooking = async () => {
    if (!stepOneDone) {
      setOpenStep(1);
      return;
    }
    if (!stepTwoDone) {
      setDetailsError("Udfyld de manglende felter, før du bekræfter.");
      setOpenStep(2);
      return;
    }
    if (!stepThreeDone) {
      setOpenStep(3);
      return;
    }
    if (!config.databaseConfigured) {
      setSubmitError(
        "Bookingsystemet mangler databaseopsætning, så bookingen kan ikke gemmes endnu.",
      );
      return;
    }

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
          customer: {
            ...customer,
            email: cleanValue(customer.email),
          },
          vehicle: {
            ...vehicle,
            registrationNumber: cleanValue(
              vehicle.registrationNumber,
            ).toUpperCase(),
          },
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(payload.error || "Bookingen kunne ikke oprettes.");
      setConfirmation(payload);
      setOpenStep(4);
      setIsSummaryOpen(false);
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
    <section className="relative overflow-hidden bg-transparent px-3 pb-24 pt-3 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <MobileBookingHeader
          appointmentDate={appointmentDate}
          appointmentTime={appointmentTime}
          durationMinutes={durationMinutes}
          openStep={openStep}
          progressPercent={progressPercent}
          serviceTitle={selectedService?.title || "Batteritest"}
          total={total}
        />

        <div className="glass-dark mb-4 hidden overflow-hidden rounded-lg text-slate-950 sm:mb-6 sm:block">
          <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:p-8">
            <div>
              <p className="inline-flex items-center gap-2 rounded-lg border border-white/75 bg-white/55 px-3 py-1 text-sm font-semibold text-sky-700 shadow-sm shadow-sky-950/5 backdrop-blur-xl">
                <CalendarCheck className="h-4 w-4" />
                Online booking
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-normal sm:text-5xl">
                Book batteritest af din elbil
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Én service, fast pris og en klar bekræftelse til både kunde og
                admin.
              </p>
            </div>
            <div className="grid gap-2 text-sm text-slate-700">
              <HeroMini
                icon={BatteryCharging}
                text="Batteriets sundhed (SoH)"
              />
              <HeroMini icon={FileText} text="PDF-rapport inkluderet" />
              <HeroMini icon={MapPin} text="Vi dækker Sjælland" />
            </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-4">
            <BookingStep
              step={1}
              title="Vælg service"
              summary={selectedService?.title}
              isOpen={openStep === 1}
              isComplete={stepOneDone}
              onEdit={() => setOpenStep(1)}
            >
              <div className="grid gap-4">
                {config.services.map((service) => (
                  <PackageCard
                    key={service.id}
                    service={service}
                    active={service.id === serviceId}
                    onClick={() => {
                      setServiceId(service.id);
                      setOpenStep(2);
                    }}
                  />
                ))}
              </div>
            </BookingStep>

            <BookingStep
              step={2}
              title="Kunde og bil"
              summary={
                stepTwoDone
                  ? `${customer.name} · ${vehicle.make} ${vehicle.model}`
                  : "Udfyld oplysninger"
              }
              isOpen={openStep === 2}
              isComplete={stepTwoDone}
              locked={!stepOneDone}
              onEdit={() => setOpenStep(2)}
            >
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <FormPanel
                  icon={BatteryCharging}
                  title="Elbil"
                  className="lg:order-1"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Bilmærke" required>
                      <select
                        value={vehicle.make}
                        onChange={(event) =>
                          setVehicle((current) => ({
                            ...current,
                            make: event.target.value,
                          }))
                        }
                        className="h-12 w-full rounded-lg border border-white/70 bg-white/70 px-3 text-base outline-none backdrop-blur focus:border-sky-400 focus:bg-white/85 focus:ring-4 focus:ring-sky-500/10 sm:h-10 sm:text-sm"
                        required
                      >
                        {vehicleMakes.map((make) => (
                          <option key={make}>{make}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Model" required>
                      <Input
                        value={vehicle.model}
                        onChange={(event) =>
                          setVehicle((current) => ({
                            ...current,
                            model: event.target.value,
                          }))
                        }
                        placeholder="Model 3, ID.4, Ioniq 5"
                        required
                      />
                    </Field>
                    <Field label="Årgang">
                      <Input
                        inputMode="numeric"
                        maxLength={4}
                        value={vehicle.year}
                        onChange={(event) =>
                          setVehicle((current) => ({
                            ...current,
                            year: event.target.value,
                          }))
                        }
                        placeholder="2021"
                      />
                    </Field>
                    <Field label="Nummerplade">
                      <Input
                        autoCapitalize="characters"
                        maxLength={10}
                        value={vehicle.registrationNumber}
                        onChange={(event) =>
                          setVehicle((current) => ({
                            ...current,
                            registrationNumber:
                              event.target.value.toUpperCase(),
                          }))
                        }
                        placeholder="AB12345"
                      />
                    </Field>
                    <Field label="Oplevet rækkevidde" className="sm:col-span-2">
                      <Input
                        value={vehicle.currentRange}
                        onChange={(event) =>
                          setVehicle((current) => ({
                            ...current,
                            currentRange: event.target.value,
                          }))
                        }
                        placeholder="Fx 320 km ved fuld opladning"
                      />
                    </Field>
                  </div>
                </FormPanel>

                <FormPanel
                  icon={User}
                  title="Kontakt og adresse"
                  className="lg:order-2"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Fulde navn" required>
                      <Input
                        autoComplete="name"
                        value={customer.name}
                        onChange={(event) =>
                          setCustomer((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        required
                      />
                    </Field>
                    <Field label="Telefonnummer" required>
                      <Input
                        autoComplete="tel"
                        inputMode="tel"
                        value={customer.phone}
                        onChange={(event) =>
                          setCustomer((current) => ({
                            ...current,
                            phone: event.target.value,
                          }))
                        }
                        required
                      />
                    </Field>
                    <Field
                      label="E-mailadresse"
                      required
                      className="sm:col-span-2"
                    >
                      <Input
                        autoComplete="email"
                        type="email"
                        value={customer.email}
                        onChange={(event) =>
                          setCustomer((current) => ({
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
                          setCustomer((current) => ({
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
                          setCustomer((current) => ({
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
                          setCustomer((current) => ({
                            ...current,
                            city: event.target.value,
                          }))
                        }
                        required
                      />
                    </Field>
                    <Field label="Firma">
                      <Input
                        autoComplete="organization"
                        value={customer.company}
                        onChange={(event) =>
                          setCustomer((current) => ({
                            ...current,
                            company: event.target.value,
                          }))
                        }
                        placeholder="Valgfrit"
                      />
                    </Field>
                    <Field label="Besked" className="sm:col-span-2">
                      <Textarea
                        value={customer.notes}
                        onChange={(event) =>
                          setCustomer((current) => ({
                            ...current,
                            notes: event.target.value,
                          }))
                        }
                        placeholder="Hjemme, på arbejde eller før køb?"
                      />
                    </Field>
                  </div>
                  <label className="mt-4 flex items-start gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={customer.acceptsTerms}
                      onChange={(event) =>
                        setCustomer((current) => ({
                          ...current,
                          acceptsTerms: event.target.checked,
                        }))
                      }
                      className="mt-1 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span>
                      EV-Check må kontakte mig om bookingen og testen.
                      <span className="font-semibold text-sky-700"> *</span>
                    </span>
                  </label>
                  {missingDetails.length > 0 || detailsError ? (
                    <MissingDetailsNotice
                      error={detailsError}
                      items={missingDetails}
                    />
                  ) : (
                    <p className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
                      <CheckCircle2 className="h-4 w-4" />
                      Oplysningerne er klar til tidsvalg.
                    </p>
                  )}
                  <Button
                    type="button"
                    className="mt-4 w-full sm:w-auto"
                    disabled={!stepTwoDone}
                    onClick={continueToDate}
                  >
                    Fortsæt
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </FormPanel>
              </div>
            </BookingStep>

            <BookingStep
              step={3}
              title="Dato og tid"
              summary={
                appointmentTime
                  ? `${dateLabel(appointmentDate)} kl. ${appointmentTime}`
                  : "Vælg tid"
              }
              isOpen={openStep === 3}
              isComplete={stepThreeDone}
              locked={!stepTwoDone}
              onEdit={() => setOpenStep(3)}
            >
              <div>
                <DateTimeSelector
                  appointmentDate={appointmentDate}
                  appointmentTime={appointmentTime}
                  calendarDays={calendarDays}
                  durationMinutes={durationMinutes}
                  maxDate={config.maxDate}
                  minDate={config.minDate}
                  serviceTitle={selectedService?.title || "Batteritest"}
                  slots={slots}
                  slotsError={slotsError}
                  slotsLoading={slotsLoading}
                  visibleMonth={visibleMonth}
                  onDateChange={(date) => {
                    setAppointmentDate(date);
                    setAppointmentTime("");
                  }}
                  onMonthChange={setVisibleMonth}
                  onTimeChange={setAppointmentTime}
                />
                <Button
                  type="button"
                  className="mt-4 w-full sm:w-auto"
                  disabled={!stepThreeDone}
                  onClick={continueToReview}
                >
                  Gennemgå booking
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </BookingStep>

            <BookingStep
              step={4}
              title="Bekræft"
              summary={formatPrice(total)}
              isOpen={openStep === 4}
              isComplete={canSubmit}
              locked={!stepThreeDone}
            >
              <div className="grid gap-5 lg:grid-cols-[1fr_0.82fr]">
                <div className="glass-card rounded-lg p-4">
                  <p className="mb-4 font-bold text-slate-950">Booking</p>
                  <div className="grid gap-3 text-sm">
                    <ConfirmRow
                      label="Service"
                      value={selectedService?.title || ""}
                    />
                    <ConfirmRow
                      label="Tid"
                      value={`${dateLabel(
                        appointmentDate,
                      )} kl. ${appointmentTime}`}
                    />
                    <ConfirmRow
                      label="Bil"
                      value={[vehicle.make, vehicle.model, vehicle.year]
                        .filter(Boolean)
                        .join(" ")}
                    />
                    <ConfirmRow
                      label="Adresse"
                      value={[
                        customer.address,
                        customer.postalCode,
                        customer.city,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    />
                    <ConfirmRow
                      label="Total"
                      value={formatPrice(total)}
                      highlight
                    />
                  </div>
                </div>
                <div className="glass-panel rounded-lg p-4">
                  <p className="flex items-center gap-2 font-bold text-slate-950">
                    <ShieldCheck className="h-5 w-5 text-sky-700" />
                    Efter bekræftelse
                  </p>
                  <ul className="mt-4 grid gap-2 text-sm leading-6 text-slate-700">
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-sky-600" />
                      Bookingen gemmes i systemet.
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-sky-600" />
                      Kunden får e-mailbekræftelse.
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-sky-600" />
                      Admin får besked med alle detaljer.
                    </li>
                  </ul>
                  {submitError ? (
                    <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                      {submitError}
                    </p>
                  ) : null}
                  {!config.databaseConfigured ? (
                    <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold leading-6 text-amber-800">
                      Tilføj DATABASE_URL, før rigtige bookinger kan gemmes.
                    </p>
                  ) : null}
                  <Button
                    type="button"
                    disabled={isSubmitting || !canSubmit}
                    onClick={submitBooking}
                    className="mt-5 w-full"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Bekræft booking
                  </Button>
                </div>
              </div>
            </BookingStep>
          </div>

          <BookingSummary
            service={selectedService}
            total={total}
            durationMinutes={durationMinutes}
            appointmentDate={appointmentDate}
            appointmentTime={appointmentTime}
            databaseConfigured={config.databaseConfigured}
            className="hidden xl:block"
          />
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 border-t border-white/60 bg-white/75 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-16px_40px_rgba(15,23,42,0.12)] backdrop-blur-2xl sm:px-4 sm:py-3 xl:hidden",
          isSummaryOpen && "hidden",
        )}
      >
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xl font-bold leading-none text-sky-700">
              {formatPrice(total)}
            </p>
            <p className="mt-1 truncate text-xs font-semibold text-slate-500">
              {selectedService?.title || "Batteritest"} · trin {openStep} af 4
            </p>
          </div>
          <Button type="button" onClick={() => setIsSummaryOpen(true)}>
            Oversigt
          </Button>
        </div>
      </div>

      {isSummaryOpen ? (
        <div className="fixed inset-0 z-[60] bg-slate-950/40 p-4 backdrop-blur-sm xl:hidden">
          <div className="glass-shell mx-auto mt-8 max-w-md rounded-lg p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-bold text-slate-950">Bookingoversigt</p>
              <button
                type="button"
                onClick={() => setIsSummaryOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            <BookingSummary
              service={selectedService}
              total={total}
              durationMinutes={durationMinutes}
              appointmentDate={appointmentDate}
              appointmentTime={appointmentTime}
              databaseConfigured={config.databaseConfigured}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function HeroMini({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/75 bg-white/45 px-3 py-2 shadow-sm shadow-sky-950/5 backdrop-blur-xl">
      <Icon className="h-4 w-4 text-sky-600" />
      <span>{text}</span>
    </div>
  );
}

function MobileBookingHeader({
  appointmentDate,
  appointmentTime,
  durationMinutes,
  openStep,
  progressPercent,
  serviceTitle,
  total,
}: {
  appointmentDate: string;
  appointmentTime: string;
  durationMinutes: number;
  openStep: 1 | 2 | 3 | 4;
  progressPercent: number;
  serviceTitle: string;
  total: number;
}) {
  return (
    <div className="glass-shell sticky top-14 z-30 mb-3 rounded-lg p-3 sm:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-700">
            Trin {openStep} af 4
          </p>
          <h1 className="mt-1 truncate text-lg font-bold leading-tight text-slate-950">
            {bookingStepLabels[openStep - 1]}
          </h1>
        </div>
        <div className="shrink-0 rounded-lg border border-white/75 bg-white/60 px-3 py-2 text-right text-slate-950 shadow-sm shadow-sky-950/5 backdrop-blur-xl">
          <p className="text-base font-bold leading-none">
            {formatPrice(total)}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-sky-700">
            {durationMinutes || 0} min.
          </p>
        </div>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/60">
        <div
          className="h-full rounded-full bg-sky-600 transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="mt-3 grid grid-cols-4 gap-1">
        {bookingStepLabels.map((label, index) => {
          const step = index + 1;
          const active = step === openStep;
          const complete = step < openStep;
          return (
            <div
              key={label}
              className={cn(
                "rounded-lg px-2 py-1.5 text-center text-[11px] font-bold",
                active
                  ? "bg-sky-600 text-white"
                  : complete
                  ? "bg-emerald-500/15 text-emerald-700"
                  : "bg-white/45 text-slate-500",
              )}
            >
              {label}
            </div>
          );
        })}
      </div>

      <p className="mt-3 truncate text-xs font-semibold text-slate-500">
        {serviceTitle}
        {appointmentTime
          ? ` · ${dateLabel(appointmentDate)} kl. ${appointmentTime}`
          : ""}
      </p>
    </div>
  );
}

function DateTimeSelector({
  appointmentDate,
  appointmentTime,
  calendarDays,
  durationMinutes,
  maxDate,
  minDate,
  serviceTitle,
  slots,
  slotsError,
  slotsLoading,
  visibleMonth,
  onDateChange,
  onMonthChange,
  onTimeChange,
}: {
  appointmentDate: string;
  appointmentTime: string;
  calendarDays: CalendarDay[];
  durationMinutes: number;
  maxDate: string;
  minDate: string;
  serviceTitle: string;
  slots: string[];
  slotsError: string;
  slotsLoading: boolean;
  visibleMonth: string;
  onDateChange: (date: string) => void;
  onMonthChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}) {
  const minMonth = monthKey(minDate);
  const maxMonth = monthKey(maxDate);
  const previousMonth = addMonths(visibleMonth, -1);
  const nextMonth = addMonths(visibleMonth, 1);
  const canGoPrevious = previousMonth >= minMonth;
  const canGoNext = nextMonth <= maxMonth;
  const groupedSlots = slots.reduce<Record<string, string[]>>(
    (groups, slot) => {
      const period = timePeriod(slot);
      groups[period] = [...(groups[period] || []), slot];
      return groups;
    },
    {},
  );
  const groupOrder = ["Formiddag", "Middag", "Eftermiddag"];

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(18rem,0.9fr)_minmax(0,1fr)] lg:gap-5">
      <div className="glass-card rounded-lg p-3 sm:p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-sky-700">
              Vælg dato
            </p>
            <p className="mt-1 text-sm text-slate-500">{serviceTitle}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg bg-sky-50/80 px-3 py-2 text-xs font-semibold text-sky-800 backdrop-blur sm:text-sm">
            <Clock className="h-4 w-4" />
            {durationMinutes || 0} min.
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-2">
          <button
            type="button"
            aria-label="Forrige måned"
            disabled={!canGoPrevious}
            onClick={() => canGoPrevious && onMonthChange(previousMonth)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/70 bg-white/60 text-slate-700 backdrop-blur transition hover:border-sky-300 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="text-base font-bold capitalize text-slate-950">
            {monthLabel(visibleMonth)}
          </p>
          <button
            type="button"
            aria-label="Næste måned"
            disabled={!canGoNext}
            onClick={() => canGoNext && onMonthChange(nextMonth)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/70 bg-white/60 text-slate-700 backdrop-blur transition hover:border-sky-300 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wide text-slate-400 sm:text-[11px]">
          {weekdayLabels.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            const selected = day.key === appointmentDate;
            return (
              <button
                key={day.key}
                type="button"
                disabled={day.disabled}
                onClick={() => onDateChange(day.key)}
                className={cn(
                  "relative flex h-10 min-w-0 items-center justify-center rounded-lg border text-sm font-bold transition sm:h-11",
                  selected
                    ? "border-sky-600 bg-sky-600 text-white shadow-sm shadow-sky-500/30"
                    : "border-transparent bg-white/50 text-slate-700 hover:border-sky-200 hover:bg-sky-50/80",
                  !day.inMonth && "text-slate-300",
                  day.isWeekend && !selected && "bg-white/30 text-slate-500",
                  day.disabled &&
                    "cursor-not-allowed bg-white/25 text-slate-300 hover:border-transparent hover:bg-white/25",
                )}
              >
                <span>{day.day}</span>
                {selected ? (
                  <span className="absolute bottom-1 h-1 w-4 rounded-full bg-white/80" />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-2 rounded-lg border border-white/60 bg-white/50 px-3 py-3 text-xs font-semibold text-slate-500 backdrop-blur sm:grid-cols-2">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-600" />
            Valgt dato
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            Lukket/udenfor periode
          </span>
        </div>
      </div>

      <div className="glass-card rounded-lg p-3 sm:p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-sky-700">
              Vælg tid
            </p>
            <h3 className="mt-1 text-xl font-bold leading-tight text-slate-950 sm:text-2xl">
              {fullDateLabel(appointmentDate)}
            </h3>
          </div>
          <div className="rounded-lg border border-white/75 bg-white/60 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm shadow-sky-950/5 backdrop-blur-xl sm:text-sm">
            {appointmentTime ? `Kl. ${appointmentTime}` : "Ingen tid valgt"}
          </div>
        </div>

        <div className="mt-5 min-h-[12rem]">
          {slotsLoading ? (
            <div className="flex h-44 items-center justify-center rounded-lg border border-dashed border-sky-200/80 bg-sky-50/50 text-sm font-semibold text-slate-600 backdrop-blur">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Henter ledige tider
            </div>
          ) : slotsError ? (
            <p className="rounded-lg bg-rose-50 px-3 py-3 text-sm font-semibold text-rose-700">
              {slotsError}
            </p>
          ) : slots.length > 0 ? (
            <div className="space-y-4">
              {groupOrder
                .filter((period) => groupedSlots[period]?.length)
                .map((period) => (
                  <div key={period}>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                      {period}
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3">
                      {groupedSlots[period].map((slot) => {
                        const selected = appointmentTime === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => onTimeChange(slot)}
                            className={cn(
                              "flex h-12 items-center justify-between gap-2 rounded-lg border px-3 text-left text-base font-bold backdrop-blur transition sm:text-sm",
                              selected
                                ? "border-sky-500 bg-white/80 text-sky-700 shadow-sm shadow-sky-500/15"
                                : "border-white/70 bg-white/50 text-slate-700 hover:border-sky-300 hover:bg-sky-50/80",
                            )}
                          >
                            <span>{slot}</span>
                            <span
                              className={cn(
                                "text-[11px] font-semibold",
                                selected ? "text-sky-100" : "text-slate-400",
                              )}
                            >
                              Ledig
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="flex h-44 items-center justify-center rounded-lg border border-dashed border-white/70 bg-white/40 px-4 text-center text-sm font-semibold leading-6 text-slate-500 backdrop-blur">
              Ingen ledige tider denne dag. Vælg en anden dato i kalenderen.
            </div>
          )}
        </div>

        {appointmentTime ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-200/80 bg-emerald-50/70 px-3 py-3 text-sm font-semibold text-emerald-800 backdrop-blur">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Tid valgt
            </span>
            <span>
              {dateLabel(appointmentDate)} kl. {appointmentTime}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function BookingStep({
  step,
  title,
  summary,
  isOpen,
  isComplete,
  locked,
  onEdit,
  children,
}: {
  step: number;
  title: string;
  summary?: string;
  isOpen: boolean;
  isComplete?: boolean;
  locked?: boolean;
  onEdit?: () => void;
  children: React.ReactNode;
}) {
  const statusLabel = locked ? "Låst" : isComplete ? "Klar" : "Mangler";

  return (
    <section
      data-booking-step={step}
      className={cn(
        "scroll-mt-32 overflow-hidden rounded-lg backdrop-blur-xl transition",
        isOpen ? "glass-shell ring-1 ring-sky-300/40" : "glass-card",
        locked && "opacity-60",
      )}
    >
      <button
        type="button"
        disabled={locked}
        aria-expanded={isOpen}
        onClick={() => !isOpen && onEdit?.()}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left sm:gap-4 sm:px-5 sm:py-4"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold sm:h-8 sm:w-8",
              isOpen
                ? "bg-sky-600 text-white"
                : isComplete
                ? "bg-emerald-500 text-white"
                : "bg-slate-100 text-slate-500",
            )}
          >
            {isComplete && !isOpen ? <Check className="h-4 w-4" /> : step}
          </span>
          <span className="min-w-0">
            <span className="block text-base font-bold text-slate-950 sm:text-sm">
              {title}
            </span>
            {summary && !isOpen ? (
              <span className="mt-1 block truncate text-sm text-slate-500">
                {summary}
              </span>
            ) : null}
          </span>
        </span>
        <span
          className={cn(
            "shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold",
            locked
              ? "bg-slate-100 text-slate-400"
              : isComplete
              ? "bg-emerald-500/15 text-emerald-700"
              : isOpen
              ? "bg-sky-600 text-white"
              : "bg-white/70 text-slate-500",
          )}
        >
          {isComplete && !isOpen ? "Rediger" : statusLabel}
        </span>
      </button>
      {isOpen ? (
        <div className="border-t border-white/50 p-3 sm:p-5">{children}</div>
      ) : null}
    </section>
  );
}

function PackageCard({
  service,
  active,
  onClick,
}: {
  service: BookingService;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "glass-card grid overflow-hidden rounded-lg text-left transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-900/10 md:grid-cols-[16rem_minmax(0,1fr)]",
        active ? "ring-4 ring-sky-500/15" : "",
      )}
    >
      <div className="relative h-36 sm:h-52 md:h-full">
        <Image
          src={service.imageUrl}
          alt={service.title}
          fill
          sizes="(max-width:768px) 100vw, 260px"
          className="object-cover"
        />
        <span className="absolute left-3 top-3 rounded-lg border border-white/60 bg-white/75 px-3 py-1 text-xs font-bold text-sky-700 shadow-sm backdrop-blur">
          {service.badge}
        </span>
        {active ? (
          <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white">
            <Check className="h-4 w-4" />
          </span>
        ) : null}
      </div>
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-950 sm:text-xl">
              {service.title}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-sm">
              {service.description}
            </p>
          </div>
          <div className="rounded-lg border border-white/60 bg-white/50 px-3 py-2 text-left backdrop-blur sm:text-right">
            <p className="text-lg font-bold text-sky-700 sm:text-xl">
              {formatPrice(service.price)}
            </p>
            <p className="text-xs font-semibold text-slate-500">
              {service.duration}
            </p>
          </div>
        </div>
        <ul className="mt-4 hidden gap-2 sm:grid sm:grid-cols-2">
          {service.features.slice(0, 4).map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-2 text-sm font-medium text-slate-600"
            >
              <CheckCircle2 className="h-4 w-4 text-sky-600" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </button>
  );
}

function FormPanel({
  icon: Icon,
  title,
  children,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("glass-card rounded-lg p-4", className)}>
      <p className="mb-4 flex items-center gap-2 font-bold text-slate-950">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50/80 text-sky-700 backdrop-blur">
          <Icon className="h-4 w-4" />
        </span>
        {title}
      </p>
      {children}
    </div>
  );
}

function BookingSummary({
  service,
  total,
  durationMinutes,
  appointmentDate,
  appointmentTime,
  databaseConfigured,
  className,
}: {
  service?: BookingService;
  total: number;
  durationMinutes: number;
  appointmentDate: string;
  appointmentTime: string;
  databaseConfigured: boolean;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "glass-shell rounded-lg p-4 xl:sticky xl:top-20",
        className,
      )}
    >
      <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-sky-700">
        <FileText className="h-4 w-4" />
        Oversigt
      </p>
      <div className="mt-4 space-y-3">
        <SummaryRow
          label={service?.title || "Service"}
          value={formatPrice(service?.price || 0)}
        />
        <div className="border-t border-sky-100 pt-3">
          <SummaryRow
            label="Samlet tid"
            value={`${durationMinutes || 0} min.`}
          />
          <SummaryRow
            label="Dato"
            value={
              appointmentTime
                ? `${dateLabel(appointmentDate)} kl. ${appointmentTime}`
                : "Vælg tid"
            }
          />
        </div>
        <div className="border-t border-sky-100 pt-3">
          <SummaryRow label="Total" value={formatPrice(total)} big />
        </div>
      </div>
      {!databaseConfigured ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-xs font-semibold leading-5 text-amber-800">
          Demo-visning: Tilføj DATABASE_URL, før bookinger kan gemmes rigtigt.
        </div>
      ) : null}
    </aside>
  );
}

function SummaryRow({
  label,
  value,
  big = false,
}: {
  label: string;
  value: string;
  big?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-slate-500">{label}</span>
      <strong
        className={cn(
          "text-right text-slate-950",
          big && "text-xl text-sky-700",
        )}
      >
        {value}
      </strong>
    </div>
  );
}

function ConfirmRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2">
      <span className="text-slate-500">{label}</span>
      <strong
        className={cn(
          "max-w-[60%] text-right text-slate-950",
          highlight && "text-lg text-sky-700",
        )}
      >
        {value || "-"}
      </strong>
    </div>
  );
}

function Field({
  label,
  children,
  className,
  required,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}) {
  return (
    <label
      className={cn(
        "grid gap-1.5 text-sm font-semibold text-slate-700",
        className,
      )}
    >
      <span>
        {label}
        {required ? <span className="text-sky-700"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

function MissingDetailsNotice({
  error,
  items,
}: {
  error: string;
  items: string[];
}) {
  return (
    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-3 text-sm text-amber-900">
      <p className="flex items-center gap-2 font-bold">
        <AlertCircle className="h-4 w-4" />
        {error || "Mangler før næste trin"}
      </p>
      {items.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="rounded-lg border border-amber-200 bg-white/70 px-2.5 py-1 text-xs font-semibold"
            >
              {item}
            </span>
          ))}
        </div>
      ) : null}
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
    <section className="bg-transparent px-3 py-10 sm:px-6 sm:py-16 lg:px-8">
      <div className="glass-shell mx-auto max-w-3xl rounded-lg p-5 text-center sm:p-8">
        <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
        <h1 className="mt-6 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
          Din booking er modtaget
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
          Vi har sendt bekræftelse og samlet bookingen i kundeportalen.
        </p>
        <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">
          <ConfirmRow label="Booking" value={confirmation.bookingId} />
          <ConfirmRow label="Service" value={confirmation.serviceLabel} />
          <ConfirmRow label="Tid" value={confirmation.appointmentLabel} />
          <ConfirmRow
            label="Total"
            value={formatPrice(confirmation.total)}
            highlight
          />
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href={confirmation.portalUrl}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-sky-600 px-4 text-sm font-semibold text-white hover:bg-sky-700"
          >
            Åbn kundeportal
          </Link>
          <a
            href={`mailto:${customerEmail}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:border-sky-300"
          >
            <Mail className="h-4 w-4" />
            {customerEmail}
          </a>
          <a
            href="tel:+4571900530"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:border-sky-300"
          >
            <Phone className="h-4 w-4" />
            Ring til os
          </a>
        </div>
      </div>
    </section>
  );
}
