import { createContext } from "react";

export const PatientScope = createContext("jose");
export const isPatientKey = (key: string) =>
  /^(log:|needs:|notes:|emergency:|utility:(items|completed):(medications|appointments|tasks))/.test(
    key,
  );
