import { z } from "zod";

export const bookingCreateSchema = z.object({
  serviceId: z.string().trim().min(1, "Vælg en service."),
  addonIds: z.array(z.string()).default([]),
  appointmentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Vælg en gyldig dato."),
  appointmentTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Vælg en gyldig tid."),
  customer: z.object({
    name: z.string().trim().min(2, "Indtast dit fulde navn."),
    email: z.string().trim().email("Indtast en gyldig e-mailadresse."),
    phone: z.string().trim().min(5, "Indtast dit telefonnummer."),
    address: z.string().trim().min(2, "Indtast adressen."),
    postalCode: z.string().trim().min(3, "Indtast postnummer."),
    city: z.string().trim().min(2, "Indtast by."),
    company: z.string().optional().default(""),
    notes: z.string().optional().default(""),
    acceptsTerms: z
      .boolean()
      .refine(Boolean, "Du skal acceptere, at EV-Check må kontakte dig om bookingen."),
  }),
  vehicle: z.object({
    make: z.string().trim().min(2, "Indtast bilens navn."),
    model: z.string().optional().default(""),
    year: z.string().optional().default(""),
    registrationNumber: z.string().optional().default(""),
    currentRange: z.string().optional().default(""),
  }),
});

export type ValidBookingCreateInput = z.infer<typeof bookingCreateSchema>;
