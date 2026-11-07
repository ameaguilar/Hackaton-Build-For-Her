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

export type NeedKind = "cita" | "economica";

export type NeedItem = {
  id: string;
  kind: NeedKind;
  title: string;
  detail: string;
  priority: "Informativa" | "Media" | "Alta";
  claimed: boolean;
  /** Solo necesidades económicas. */
  raised?: number;
  goal?: number;
  contributions?: number[];
};

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
    kind: "cita",
    title: "Acompañar a cardiología",
    detail: "Jueves 19 · 10:30 · Clínica Central",
    priority: "Alta",
    claimed: false,
  },
  {
    id: "medicamentos-mes",
    kind: "economica",
    title: "Medicamentos del mes",
    detail: "Fecha límite · 24 de noviembre de 2026",
    priority: "Media",
    claimed: false,
    raised: 1200,
    goal: 2000,
    contributions: [500],
  },
];
