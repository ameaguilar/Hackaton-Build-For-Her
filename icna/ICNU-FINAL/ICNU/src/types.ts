/** Tipos compartidos de navegación. */

export type Screen =
  | "welcome"
  | "account-create"
  | "home"
  | "admin"
  | "log"
  | "log-entry"
  | "needs"
  | "notes"
  | "weekly-summary"
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
  notes?: string;
};

export type PatientId = string;
