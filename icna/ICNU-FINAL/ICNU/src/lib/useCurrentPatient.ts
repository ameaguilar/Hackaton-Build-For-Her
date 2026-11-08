import { useContext } from "react";
import { PatientScope } from "./patientScope";
import { usePersistentState } from "./storage";
import { resolvePatient, type StoredPatient } from "../data/patients";

export function useCurrentPatient() {
  const id = useContext(PatientScope);
  const [extra] = usePersistentState<StoredPatient[]>("patients:extra", []);
  return resolvePatient(
    id,
    extra.find((p) => p.id === id),
  );
}
