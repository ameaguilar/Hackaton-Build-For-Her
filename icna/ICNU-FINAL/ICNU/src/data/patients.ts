import type { PatientId } from "../types";

export type PatientProfile = {
  name: string;
  short: string;
  age: number | null;
  avatar: "jose" | "maria" | "roberto";
  /** Iniciales para avatares de pacientes nuevos (Avatar con `initials`). */
  initials?: string;
  schedule: string[];
  allergies: string;
  conditions: string;
  blood: string;
  doctor: string;
  specialty: string;
  phone: string;
  phoneLabel: string;
};

export type StoredPatient = Pick<
  PatientProfile,
  | "name"
  | "short"
  | "age"
  | "conditions"
  | "allergies"
  | "blood"
  | "doctor"
  | "specialty"
  | "phone"
  | "phoneLabel"
> & {
  id: string;
  directions?: string;
  contacts?: { id: string; name: string; phone: string; role: string }[];
};

const seedProfiles: Record<"jose" | "elena" | "roberto", PatientProfile> = {
  jose: {
    name: "José Ramírez",
    short: "Don José",
    age: 78,
    avatar: "jose",
    schedule: [
      "08:00  Desayuno",
      "09:00  Losartán · 50 mg",
      "12:30  Comida",
      "16:00  Caminata suave",
    ],
    allergies: "Penicilina",
    conditions: "Hipertensión, diabetes tipo 2",
    blood: "O+",
    doctor: "Dra. Laura Méndez",
    specialty: "Medicina interna",
    phone: "+525512345678",
    phoneLabel: "55 1234 5678",
  },
  elena: {
    name: "Elena Torres",
    short: "Doña Elena",
    age: 82,
    avatar: "maria",
    schedule: [
      "08:30  Levotiroxina · 50 mcg",
      "09:00  Desayuno",
      "13:00  Ejercicios de movilidad",
      "20:00  Calcio",
    ],
    allergies: "Ninguna conocida",
    conditions: "Artritis, osteoporosis",
    blood: "A+",
    doctor: "Dr. Jorge Salas",
    specialty: "Geriatría",
    phone: "+525598765432",
    phoneLabel: "55 9876 5432",
  },
  roberto: {
    name: "Roberto Díaz",
    short: "Don Roberto",
    age: 74,
    avatar: "roberto",
    schedule: [
      "07:30  Presión arterial",
      "08:00  Desayuno",
      "10:00  Caminata",
      "19:30  Enalapril · 10 mg",
    ],
    allergies: "Sulfas",
    conditions: "Hipertensión",
    blood: "B+",
    doctor: "Dra. Sofía Luna",
    specialty: "Medicina familiar",
    phone: "+525544445555",
    phoneLabel: "55 4444 5555",
  },
};

export const patientProfiles = seedProfiles;

/** Devuelve el perfil completo combinando la semilla con el paciente almacenado. */
export function resolvePatient(
  id: PatientId,
  stored: StoredPatient | undefined,
): PatientProfile | undefined {
  if (id in seedProfiles) return { ...seedProfiles[id as keyof typeof seedProfiles], ...stored };
  if (!stored) return undefined;
  return {
    name: stored.name,
    short: stored.short,
    age: stored.age,
    avatar: "jose",
    initials: initialsOf(stored.name, stored.short),
    schedule: [],
    allergies: stored.allergies || "Sin registrar",
    conditions: stored.conditions || "Sin registrar",
    blood: stored.blood || "—",
    doctor: stored.doctor || "Sin médico registrado",
    specialty: stored.specialty || "—",
    phone: stored.phone || "",
    phoneLabel: stored.phoneLabel || stored.phone || "",
  };
}

function initialsOf(name: string, short: string): string {
  const source = short || name;
  const parts = source
    .replace(/^(Don|Doña)\s+/i, "")
    .trim()
    .split(/\s+/);
  const first = parts[0]?.[0] ?? "P";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "P";
}
