/** Tipos de datos de la app. Los detalles visuales viven en App.tsx. */

export type LogEntry = {
  time: string;
  category: string;
  note: string;
  mood: string;
  /** Fecha local ISO (YYYY-MM-DD). Las entradas viejas sin fecha se toman como hoy. */
  date?: string;
};

export type NoteItem = {
  id: string;
  title: string;
  detail: string;
  priority: "Alta" | "Media" | "Informativa";
  /** Texto del permiso/alcance mostrado en la tarjeta ("Toda la familia", …). */
  scope: string;
  /** Texto de la línea "Actualizada …" o autor. */
  meta: string;
};

export type NeedItem = {
  id: string;
  /** Tipo de apoyo exacto. Ver NEED_TYPES. (Los datos viejos usaban kind: cita/economica.) */
  type: string;
  title: string;
  detail: string;
  priority: "Informativa" | "Media" | "Alta";
  claimed: boolean;
  /** Solo necesidades económicas. */
  raised?: number;
  goal?: number;
  contributions?: number[];
};

/** Catálogo de tipos de apoyo, con su icono dentro de la app. */
export const NEED_TYPES: {
  label: string;
  icon: "calendar" | "wallet" | "cart" | "car" | "users" | "bell" | "pill";
}[] = [
  { label: "Acompañar a una cita", icon: "calendar" },
  { label: "Apoyo económico", icon: "wallet" },
  { label: "Medicamentos", icon: "pill" },
  { label: "Comprar o llevar algo", icon: "cart" },
  { label: "Traslado", icon: "car" },
  { label: "Visita o compañía", icon: "users" },
  { label: "Otro", icon: "bell" },
];

export const ECONOMIC_NEED = "Apoyo económico";
export const APPOINTMENT_NEED = "Acompañar a una cita";
export const MEDICATION_NEED = "Medicamentos";

export function isEconomicNeed(need: Pick<NeedItem, "type">): boolean {
  return need.type === ECONOMIC_NEED;
}

export function needIcon(type: string) {
  return (NEED_TYPES.find((item) => item.label === type)?.icon ?? "bell") as
    | "calendar"
    | "wallet"
    | "cart"
    | "car"
    | "users"
    | "bell"
    | "pill";
}

/** Semillas equivalentes a los datos de prueba que venían quemados en App.tsx. */
import { todayISO } from "../lib/dates";

export const seedLogEntries: LogEntry[] = [
  {
    time: "08:15",
    category: "Alimentación",
    note: "Avena, fruta y té. Buen apetito.",
    mood: "☺",
    date: todayISO(),
  },
  {
    time: "09:00",
    category: "Medicamento",
    note: "Losartán · 50 mg",
    mood: "☺",
    date: todayISO(),
  },
  {
    time: "11:40",
    category: "Ánimo",
    note: "Conversó con Luis por teléfono.",
    mood: "🙂",
    date: todayISO(),
  },
];

export const seedNotes: NoteItem[] = [
  {
    id: "penicilina",
    title: "Alergia a la penicilina",
    detail:
      "Ha presentado reacción severa. Informar siempre antes de cualquier tratamiento.",
    priority: "Alta",
    scope: "Solo administradores",
    meta: "Actualizada hace 2 días",
  },
  {
    id: "rutina-dormir",
    title: "Rutina para dormir",
    detail: "Le ayuda escuchar boleros suaves y dejar una luz tenue encendida.",
    priority: "Media",
    scope: "Toda la familia",
    meta: "Actualizada por Ana",
  },
  {
    id: "jardin",
    title: "Le gusta hablar del jardín",
    detail: "Preguntarle por sus rosales suele animarlo durante las tardes.",
    priority: "Informativa",
    scope: "Toda la familia",
    meta: "Hace 1 semana",
  },
];

export const seedNeeds: NeedItem[] = [
  {
    id: "cardiologia",
    type: APPOINTMENT_NEED,
    title: "Acompañar a cardiología",
    detail: "Jueves 19 · 10:30 · Clínica Central",
    priority: "Alta",
    claimed: false,
  },
  {
    id: "medicamentos-mes",
    type: ECONOMIC_NEED,
    title: "Medicamentos del mes",
    detail: "Fecha límite · 24 de noviembre de 2026",
    priority: "Media",
    claimed: false,
    raised: 1200,
    goal: 2000,
    contributions: [500],
  },
];

/** Convierte datos viejos (antes del campo `type`) al formato actual. */
export function migrateNeed(need: NeedItem): NeedItem {
  if (need.type) return need;
  const legacyKind = (need as NeedItem & { kind?: string }).kind;
  return { ...need, type: legacyKind === "economica" ? ECONOMIC_NEED : APPOINTMENT_NEED };
}
