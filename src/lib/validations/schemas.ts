import { z } from "zod";

export const StudentSchema = z.object({
  full_name: z
    .string()
    .min(2, "Imie i nazwisko musi miec co najmniej 2 znaki")
    .max(100, "Imie i nazwisko moze miec maksymalnie 100 znakow"),
  email: z
    .string()
    .email("Nieprawidlowy adres email")
    .max(255)
    .or(z.literal(""))
    .optional()
    .transform((v) => v || null),
  phone: z
    .string()
    .regex(/^(\+48\s?)?\d{3}\s?\d{3}\s?\d{3}$/, "Nieprawidlowy numer telefonu (np. +48 600 000 000)")
    .or(z.literal(""))
    .optional()
    .transform((v) => v || null),
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Nieprawidlowy format daty")
    .or(z.literal(""))
    .optional()
    .transform((v) => v || null),
  notes: z
    .string()
    .max(1000, "Notatki moga miec maksymalnie 1000 znakow")
    .optional()
    .transform((v) => v?.trim() || null),
});

export type StudentFormData = z.infer<typeof StudentSchema>;

export const GroupSchema = z
  .object({
    code: z
      .string()
      .min(1, "Kod grupy jest wymagany")
      .max(20, "Kod grupy moze miec maksymalnie 20 znakow"),
    name: z
      .string()
      .min(1, "Nazwa grupy jest wymagana")
      .max(100, "Nazwa grupy moze miec maksymalnie 100 znakow"),
    day_of_week: z.coerce.number().int().min(0).max(6),
    start_time: z.string().regex(/^\d{2}:\d{2}$/, "Nieprawidlowy format godziny"),
    end_time: z.string().regex(/^\d{2}:\d{2}$/, "Nieprawidlowy format godziny"),
    level: z.string().min(1, "Wybierz poziom"),
    instructor_id: z.string().uuid("Wybierz instruktora"),
    capacity: z.coerce.number().int().min(1, "Pojemnosc musi byc wieksza niz 0").max(100, "Pojemnosc moze wynosic maksymalnie 100"),
  })
  .refine((data) => data.start_time < data.end_time, {
    message: "Godzina zakonczenia musi byc pozniejsza niz rozpoczecia",
    path: ["end_time"],
  });

export type GroupFormData = z.infer<typeof GroupSchema>;

export const PaymentSchema = z.object({
  student_id: z.string().uuid("Wybierz kursantke"),
  pass_id: z.string().uuid("Wybierz karnet"),
  amount: z.coerce
    .number()
    .int("Kwota musi byc liczba calkowita")
    .min(1, "Kwota musi wynosic co najmniej 1 zl")
    .max(100000, "Kwota nie moze przekraczac 100 000 zl"),
  method: z.enum(["cash", "transfer"]),
  notes: z
    .string()
    .max(500, "Notatki moga miec maksymalnie 500 znakow")
    .optional()
    .transform((v) => v?.trim() || null),
});

export type PaymentFormData = z.infer<typeof PaymentSchema>;

export const PassSchema = z
  .object({
    template_id: z
      .string()
      .optional()
      .transform((v) => v || null),
    price_amount: z.coerce
      .number()
      .int("Cena musi byc liczba calkowita")
      .min(0, "Cena nie moze byc ujemna")
      .max(100000, "Cena nie moze przekraczac 100 000 zl"),
    valid_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Nieprawidlowy format daty"),
    valid_until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Nieprawidlowy format daty"),
    entries_total: z.coerce
      .number()
      .int()
      .min(1, "Liczba wejsc musi byc wieksza niz 0")
      .nullable()
      .optional(),
    auto_renew: z.boolean().default(false),
    notes: z
      .string()
      .max(500, "Notatki moga miec maksymalnie 500 znakow")
      .optional()
      .transform((v) => v?.trim() || null),
  })
  .refine((data) => data.valid_from <= data.valid_until, {
    message: "Data zakonczenia musi byc pozniejsza niz rozpoczecia",
    path: ["valid_until"],
  });

export type PassFormData = z.infer<typeof PassSchema>;
