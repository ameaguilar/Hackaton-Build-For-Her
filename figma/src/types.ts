/** Tipos compartidos de navegación. */

export type Screen =
  | "welcome"
  | "account-create"
  | "home"
  | "admin"
  | "log"
  | "needs"
  | "notes"
  | "points"
  | "profile"
  | "family"
  | "emergency"
  | "medications"
  | "appointments"
  | "tasks"
  | "caregivers"
  | "patient-create";

export type AccountProfile = {
  name: string;
  email?: string;
  phone?: string;
  role?: string;
};

export type PatientId = string;
