"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BatteryCharging,
  CalendarDays,
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
  X,
} from "lucide-react";
import type { BookingAddon, BookingConfig, BookingService } from "@/lib/server/booking-system";
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

const vehicleMakes = ["Tesla", "BYD", "Polestar", "Kia", "Volkswagen", "Hyundai", "Mercedes-Benz", "BMW", "Audi", "Anden elbil"];

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

function nextDates(minDate: string, count: number) {
  const start = new Date(`${minDate}T12:00:00`);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date.toISOString().slice(0, 10);
  });
}

export function EvBookingFlow({ config }: BookingFlowProps) {
  const [serviceId, setServiceId] = useState(config.services[0]?.id || "");
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [appointmentDate, setAppointmentDate] = useState(config.minDate);
  const [appointmentTime, setAppointmentTime] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [customer, setCustomer] = useState<CustomerForm>(initialCustomer);
  const [vehicle, setVehicle] = useState<VehicleForm>(initialVehicle);
  const [openStep, setOpenStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const selectedService = useMemo(
    () => config.services.find((item) => item.id === serviceId) || config.services[0],
    [config.services, serviceId],
  );
  const selectedAddons = useMemo(
    () => config.addons.filter((item) => addonIds.includes(item.id)),
    [addonIds, config.addons],
  );
  const total = useMemo(
    () => Number(selectedService?.price || 0) + selectedAddons.reduce((sum, item) => sum + item.price, 0),
    [selectedAddons, selectedService?.price],
  );
  const durationMinutes = useMemo(
    () =>
      Number(selectedService?.durationMinutes || 0) +
      selectedAddons.reduce((sum, item) => sum + item.durationMinutes, 0),
    [selectedAddons, selectedService?.durationMinutes],
  );
  const dates = useMemo(() => nextDates(config.minDate, 21), [config.minDate]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      date: appointmentDate,
      serviceId,
    });
    if (addonIds.length) params.set("addonIds", addonIds.join(","));

    setSlotsLoading(true);
    setSlotsError("");
    fetch(`/api/booking/availability?${params.toString()}`, {
      headers: { accept: "application/json" },
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = (await response.json().catch(() => ({}))) as { slots?: string[]; error?: string };
        if (!response.ok) throw new Error(payload.error || "Kunne ikke hente ledige tider.");
        const nextSlots = Array.isArray(payload.slots) ? payload.slots : [];
        setSlots(nextSlots);
        setAppointmentTime((current) => (nextSlots.includes(current) ? current : nextSlots[0] || ""));
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setSlots([]);
        setAppointmentTime("");
        setSlotsError(error instanceof Error ? error.message : "Kunne ikke hente ledige tider.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setSlotsLoading(false);
      });

    return () => controller.abort();
  }, [addonIds, appointmentDate, serviceId]);

  const toggleAddon = (addon: BookingAddon) => {
    setAddonIds((current) =>
      current.includes(addon.id) ? current.filter((id) => id !== addon.id) : [...current, addon.id],
    );
  };

  const stepOneDone = Boolean(serviceId);
  const stepTwoDone = Boolean(appointmentDate && appointmentTime);
  const stepThreeDone = Boolean(vehicle.make && vehicle.model && customer.name && customer.email && customer.phone);

  const submitBooking = async () => {
    setSubmitError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          serviceId,
          addonIds,
          appointmentDate,
          appointmentTime,
          customer,
          vehicle,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Bookingen kunne ikke oprettes.");
      setConfirmation(payload);
      setOpenStep(4);
      setIsSummaryOpen(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Bookingen kunne ikke oprettes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmation) {
    return <BookingConfirmation confirmation={confirmation} customerEmail={customer.email} />;
  }

  return (
    <section className="relative bg-[#f4fbfa] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-300/40">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-300">Online booking</p>
          <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <h1 className="max-w-3xl text-4xl font-bold tracking-normal sm:text-5xl">
                Book batteritest af din elbil.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Vælg testpakke, tidspunkt og udfyld dine oplysninger. Vi kommer ud til dig og leverer en professionel rapport.
              </p>
            </div>
            <div className="grid gap-2 text-sm text-slate-200 sm:grid-cols-3 lg:grid-cols-1">
              <HeroMini icon={ShieldCheck} text="Ikke-invasiv test" />
              <HeroMini icon={FileText} text="PDF-rapport inkluderet" />
              <HeroMini icon={MapPin} text="Vi dækker hele Sjælland" />
            </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-4">
            <BookingStep
              step={1}
              title="Vælg testpakke"
              summary={selectedService?.title}
              isOpen={openStep === 1}
              isComplete={stepOneDone}
              onEdit={() => setOpenStep(1)}
            >
              <div className="grid gap-4 md:grid-cols-3">
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
              title="Tilvalg og tidspunkt"
              summary={appointmentTime ? `${dateLabel(appointmentDate)} kl. ${appointmentTime}` : "Vælg tid"}
              isOpen={openStep === 2}
              isComplete={stepTwoDone}
              locked={!stepOneDone}
              onEdit={() => setOpenStep(2)}
            >
              <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                <div>
                  <p className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-teal-700">Ekstra hjælp</p>
                  <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                    {config.addons.map((addon) => (
                      <AddonCard
                        key={addon.id}
                        addon={addon}
                        selected={addonIds.includes(addon.id)}
                        onToggle={() => toggleAddon(addon)}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-teal-700">Dato og tid</p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {dates.map((date) => (
                      <button
                        key={date}
                        type="button"
                        onClick={() => setAppointmentDate(date)}
                        className={cn(
                          "rounded-2xl border px-3 py-3 text-left text-sm font-semibold transition",
                          appointmentDate === date
                            ? "border-teal-600 bg-teal-600 text-white shadow-sm shadow-teal-500/30"
                            : "border-slate-200 bg-white text-slate-700 hover:border-teal-300",
                        )}
                      >
                        {dateLabel(date)}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4">
                    {slotsLoading ? (
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Henter ledige tider
                      </div>
                    ) : slotsError ? (
                      <p className="text-sm font-semibold text-rose-700">{slotsError}</p>
                    ) : slots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {slots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setAppointmentTime(slot)}
                            className={cn(
                              "h-10 rounded-xl border text-sm font-semibold transition",
                              appointmentTime === slot
                                ? "border-slate-950 bg-slate-950 text-white"
                                : "border-slate-200 bg-slate-50 text-slate-700 hover:border-teal-300 hover:bg-teal-50",
                            )}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-slate-500">Ingen ledige tider denne dag.</p>
                    )}
                  </div>
                  <Button type="button" className="mt-4" disabled={!appointmentTime} onClick={() => setOpenStep(3)}>
                    Fortsæt til oplysninger
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </BookingStep>

            <BookingStep
              step={3}
              title="Bil og kontaktoplysninger"
              summary={customer.name || "Udfyld oplysninger"}
              isOpen={openStep === 3}
              isComplete={stepThreeDone}
              locked={!stepTwoDone}
              onEdit={() => setOpenStep(3)}
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-white p-4">
                  <p className="mb-4 flex items-center gap-2 font-bold text-slate-950">
                    <BatteryCharging className="h-5 w-5 text-teal-700" />
                    Elbil
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Bilmærke">
                      <select
                        value={vehicle.make}
                        onChange={(event) => setVehicle((current) => ({ ...current, make: event.target.value }))}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10"
                      >
                        {vehicleMakes.map((make) => (
                          <option key={make}>{make}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Model">
                      <Input value={vehicle.model} onChange={(event) => setVehicle((current) => ({ ...current, model: event.target.value }))} placeholder="Model 3, ID.4, Ioniq 5..." />
                    </Field>
                    <Field label="Årgang">
                      <Input value={vehicle.year} onChange={(event) => setVehicle((current) => ({ ...current, year: event.target.value }))} placeholder="2021" />
                    </Field>
                    <Field label="Nummerplade">
                      <Input value={vehicle.registrationNumber} onChange={(event) => setVehicle((current) => ({ ...current, registrationNumber: event.target.value.toUpperCase() }))} placeholder="AB12345" />
                    </Field>
                    <Field label="Oplevet rækkevidde" className="sm:col-span-2">
                      <Input value={vehicle.currentRange} onChange={(event) => setVehicle((current) => ({ ...current, currentRange: event.target.value }))} placeholder="Fx 320 km ved fuld opladning" />
                    </Field>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-4">
                  <p className="mb-4 flex items-center gap-2 font-bold text-slate-950">
                    <User className="h-5 w-5 text-teal-700" />
                    Kontakt og adresse
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Fulde navn">
                      <Input value={customer.name} onChange={(event) => setCustomer((current) => ({ ...current, name: event.target.value }))} />
                    </Field>
                    <Field label="Telefonnummer">
                      <Input value={customer.phone} onChange={(event) => setCustomer((current) => ({ ...current, phone: event.target.value }))} />
                    </Field>
                    <Field label="E-mailadresse" className="sm:col-span-2">
                      <Input type="email" value={customer.email} onChange={(event) => setCustomer((current) => ({ ...current, email: event.target.value }))} />
                    </Field>
                    <Field label="Adresse">
                      <Input value={customer.address} onChange={(event) => setCustomer((current) => ({ ...current, address: event.target.value }))} />
                    </Field>
                    <Field label="Postnummer">
                      <Input value={customer.postalCode} onChange={(event) => setCustomer((current) => ({ ...current, postalCode: event.target.value }))} />
                    </Field>
                    <Field label="By">
                      <Input value={customer.city} onChange={(event) => setCustomer((current) => ({ ...current, city: event.target.value }))} />
                    </Field>
                    <Field label="Firma (valgfrit)">
                      <Input value={customer.company} onChange={(event) => setCustomer((current) => ({ ...current, company: event.target.value }))} />
                    </Field>
                    <Field label="Besked" className="sm:col-span-2">
                      <Textarea value={customer.notes} onChange={(event) => setCustomer((current) => ({ ...current, notes: event.target.value }))} placeholder="Skriv gerne om bilen skal testes hjemme, på arbejde eller før køb." />
                    </Field>
                  </div>
                  <label className="mt-4 flex items-start gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={customer.acceptsTerms}
                      onChange={(event) => setCustomer((current) => ({ ...current, acceptsTerms: event.target.checked }))}
                      className="mt-1 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    Jeg accepterer, at EV-Check må kontakte mig om bookingen og behandle mine oplysninger i forbindelse med testen.
                  </label>
                  <Button type="button" className="mt-4" disabled={!stepThreeDone} onClick={() => setOpenStep(4)}>
                    Gennemgå booking
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </BookingStep>

            <BookingStep
              step={4}
              title="Bekræft booking"
              summary={formatPrice(total)}
              isOpen={openStep === 4}
              isComplete={false}
              locked={!stepThreeDone}
            >
              <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
                <div className="rounded-2xl border border-slate-100 bg-white p-4">
                  <p className="mb-4 font-bold text-slate-950">Gennemgang</p>
                  <div className="grid gap-3 text-sm">
                    <ConfirmRow label="Testpakke" value={selectedService?.title || ""} />
                    <ConfirmRow label="Tilvalg" value={selectedAddons.length ? selectedAddons.map((item) => item.label).join(", ") : "Ingen tilvalg"} />
                    <ConfirmRow label="Dato og tid" value={`${dateLabel(appointmentDate)} kl. ${appointmentTime}`} />
                    <ConfirmRow label="Bil" value={[vehicle.make, vehicle.model, vehicle.year].filter(Boolean).join(" ")} />
                    <ConfirmRow label="Adresse" value={[customer.address, customer.postalCode, customer.city].filter(Boolean).join(", ")} />
                    <ConfirmRow label="Total" value={formatPrice(total)} highlight />
                  </div>
                </div>
                <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4">
                  <p className="flex items-center gap-2 font-bold text-slate-950">
                    <ShieldCheck className="h-5 w-5 text-teal-700" />
                    Når du bekræfter
                  </p>
                  <ul className="mt-4 grid gap-2 text-sm leading-6 text-slate-700">
                    <li>Vi gemmer bookingen i systemet.</li>
                    <li>Du får adgang til din kundeportal.</li>
                    <li>EV-Check kontakter dig med praktisk bekræftelse.</li>
                    <li>Efter testen modtager du din PDF-rapport.</li>
                  </ul>
                  {submitError ? <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{submitError}</p> : null}
                  <Button type="button" disabled={isSubmitting || !customer.acceptsTerms} onClick={submitBooking} className="mt-5 w-full">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Bekræft booking
                  </Button>
                </div>
              </div>
            </BookingStep>
          </div>

          <BookingSummary
            service={selectedService}
            addons={selectedAddons}
            total={total}
            durationMinutes={durationMinutes}
            appointmentDate={appointmentDate}
            appointmentTime={appointmentTime}
            databaseConfigured={config.databaseConfigured}
            className="hidden xl:block"
          />
        </div>
      </div>

      <div className={cn("fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-16px_40px_rgba(15,23,42,0.12)] backdrop-blur xl:hidden", isSummaryOpen && "hidden")}>
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xl font-bold leading-none text-teal-700">{formatPrice(total)}</p>
            <p className="mt-1 truncate text-xs font-semibold text-slate-500">{selectedService?.title || "Batteritest"} - trin {openStep} af 4</p>
          </div>
          <Button type="button" onClick={() => setIsSummaryOpen(true)}>
            Se oversigt
          </Button>
        </div>
      </div>

      {isSummaryOpen ? (
        <div className="fixed inset-0 z-[60] bg-slate-950/40 p-4 backdrop-blur-sm xl:hidden">
          <div className="mx-auto mt-8 max-w-md rounded-3xl bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-bold text-slate-950">Bookingoversigt</p>
              <button type="button" onClick={() => setIsSummaryOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <BookingSummary
              service={selectedService}
              addons={selectedAddons}
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

function HeroMini({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-3 py-2">
      <Icon className="h-4 w-4 text-teal-300" />
      <span>{text}</span>
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
  return (
    <section
      className={cn(
        "overflow-hidden rounded-3xl border transition",
        isOpen
          ? "border-teal-300 bg-white shadow-xl shadow-teal-900/10"
          : "border-white/70 bg-white/80 shadow-sm shadow-slate-200/60",
        locked && "opacity-60",
      )}
    >
      <button
        type="button"
        disabled={locked}
        onClick={() => !isOpen && onEdit?.()}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
              isOpen ? "bg-teal-600 text-white" : isComplete ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500",
            )}
          >
            {isComplete && !isOpen ? <Check className="h-4 w-4" /> : step}
          </span>
          <span>
            <span className="block font-bold text-slate-950">{title}</span>
            {summary && !isOpen ? <span className="mt-1 block truncate text-sm text-slate-500">{summary}</span> : null}
          </span>
        </span>
        {isComplete && !isOpen ? <span className="text-sm font-semibold text-teal-700">Rediger</span> : null}
      </button>
      {isOpen ? <div className="border-t border-slate-100 p-5">{children}</div> : null}
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
        "group overflow-hidden rounded-3xl border bg-white text-left transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70",
        active ? "border-teal-500 ring-4 ring-teal-500/10" : "border-slate-100",
      )}
    >
      <div className="relative h-44">
        <Image src={service.imageUrl} alt={service.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-teal-700 shadow-sm">
          {service.badge}
        </span>
        {active ? (
          <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-white">
            <Check className="h-4 w-4" />
          </span>
        ) : null}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-slate-950">{service.title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{service.description}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-500">
            <Clock className="h-4 w-4" />
            {service.duration}
          </span>
          <span className="text-lg font-bold text-teal-700">{formatPrice(service.price)}</span>
        </div>
        <ul className="mt-4 grid gap-1.5">
          {service.features.slice(0, 4).map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </button>
  );
}

function AddonCard({
  addon,
  selected,
  onToggle,
}: {
  addon: BookingAddon;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "overflow-hidden rounded-2xl border bg-white text-left transition hover:border-teal-300",
        selected ? "border-teal-500 ring-4 ring-teal-500/10" : "border-slate-100",
      )}
    >
      <div className="relative h-24">
        <Image src={addon.imageUrl} alt={addon.label} fill sizes="(max-width:768px) 33vw, 20vw" className="object-cover" />
        {selected ? (
          <span className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white">
            <Check className="h-4 w-4" />
          </span>
        ) : null}
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-bold text-slate-950">{addon.label}</p>
          <p className="shrink-0 text-sm font-bold text-teal-700">{formatPrice(addon.price)}</p>
        </div>
        <p className="mt-1 text-xs leading-5 text-slate-500">{addon.description}</p>
      </div>
    </button>
  );
}

function BookingSummary({
  service,
  addons,
  total,
  durationMinutes,
  appointmentDate,
  appointmentTime,
  databaseConfigured,
  className,
}: {
  service?: BookingService;
  addons: BookingAddon[];
  total: number;
  durationMinutes: number;
  appointmentDate: string;
  appointmentTime: string;
  databaseConfigured: boolean;
  className?: string;
}) {
  return (
    <aside className={cn("rounded-3xl border border-white/70 bg-white/90 p-4 shadow-xl shadow-slate-200/70 backdrop-blur xl:sticky xl:top-20", className)}>
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">Oversigt</p>
      <div className="mt-4 space-y-3">
        <SummaryRow label={service?.title || "Testpakke"} value={formatPrice(service?.price || 0)} />
        {addons.map((addon) => (
          <SummaryRow key={addon.id} label={addon.label} value={formatPrice(addon.price)} />
        ))}
        <div className="border-t border-slate-100 pt-3">
          <SummaryRow label="Samlet tid" value={`${durationMinutes || 0} min.`} />
          <SummaryRow label="Dato" value={appointmentTime ? `${dateLabel(appointmentDate)} kl. ${appointmentTime}` : "Vælg tid"} />
        </div>
        <div className="border-t border-slate-100 pt-3">
          <SummaryRow label="Total" value={formatPrice(total)} big />
        </div>
      </div>
      {!databaseConfigured ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs font-semibold leading-5 text-amber-800">
          Demo-visning: Tilføj `DATABASE_URL`, før bookinger kan gemmes rigtigt.
        </div>
      ) : null}
    </aside>
  );
}

function SummaryRow({ label, value, big = false }: { label: string; value: string; big?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-slate-500">{label}</span>
      <strong className={cn("text-right text-slate-950", big && "text-xl text-teal-700")}>{value}</strong>
    </div>
  );
}

function ConfirmRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl bg-slate-50 px-3 py-2">
      <span className="text-slate-500">{label}</span>
      <strong className={cn("max-w-[60%] text-right text-slate-950", highlight && "text-lg text-teal-700")}>{value || "-"}</strong>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("grid gap-1.5 text-sm font-semibold text-slate-700", className)}>
      {label}
      {children}
    </label>
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
    <section className="bg-[#f4fbfa] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/70 bg-white p-8 text-center shadow-xl shadow-slate-200/70">
        <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
        <h1 className="mt-6 text-4xl font-bold text-slate-950">Din booking er modtaget</h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          Vi har registreret din forespørgsel og kontakter dig med bekræftelse. Du kan følge bookingen i kundeportalen.
        </p>
        <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">
          <ConfirmRow label="Booking" value={confirmation.bookingId} />
          <ConfirmRow label="Pakke" value={confirmation.serviceLabel} />
          <ConfirmRow label="Tid" value={confirmation.appointmentLabel} />
          <ConfirmRow label="Total" value={formatPrice(confirmation.total)} highlight />
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href={confirmation.portalUrl} className="inline-flex h-10 items-center justify-center rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white hover:bg-teal-700">
            Åbn kundeportal
          </Link>
          <a href={`mailto:${customerEmail}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:border-teal-300">
            <Mail className="h-4 w-4" />
            {customerEmail}
          </a>
          <a href="tel:+4536212370" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:border-teal-300">
            <Phone className="h-4 w-4" />
            Ring til os
          </a>
        </div>
      </div>
    </section>
  );
}
