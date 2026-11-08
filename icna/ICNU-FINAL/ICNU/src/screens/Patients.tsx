import { useState } from "react";
import { patientProfiles, type StoredPatient } from "../data/patients";
import { usePersistentState } from "../lib/storage";
import { PatientEditor } from "../components/PatientEditor";
import { TopBar } from "../components/TopBar";
import { Button } from "../components/Button";
import { Avatar } from "../components/Avatar";
import { Icon } from "../components/Icon";

export default function Patients({
  back,
  open,
  notify,
}: {
  back: () => void;
  open: (id: string) => void;
  notify: (message: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [extra] = usePersistentState<StoredPatient[]>("patients:extra", []);
  const [hidden] = usePersistentState<string[]>("patients:hidden", []);
  const rows = [
    ...Object.entries(patientProfiles).map(([id, p]) => ({ ...p, id })),
    ...extra.filter((p) => !(p.id in patientProfiles)),
  ]
    .map((p) => extra.find((e) => e.id === p.id) ?? p)
    .filter((p) => !hidden.includes(p.id));
  if (adding) return <PatientEditor close={() => setAdding(false)} saved={open} notify={notify} />;
  return (
    <div className="screen">
      <TopBar
        title="Personas que cuidas"
        subtitle="TU CÍRCULO DE CUIDADO"
        back={back}
        summary={false}
      />
      <main className="content">
        <div className="editor-intro">
          <h1>Cada persona, un cuidado único.</h1>
          <p>{rows.length} perfiles en este dispositivo.</p>
        </div>
        <div className="patient-registry">
          {rows.map((p) => (
            <button className="patient-record card" key={p.id} onClick={() => open(p.id)}>
              <Avatar
                initials={p.name
                  .split(" ")
                  .map((s) => s[0])
                  .slice(0, 2)
                  .join("")}
                size="lg"
              />
              <div>
                <strong>{p.name}</strong>
                <small>{p.age ?? "—"} años</small>
                <p>{p.conditions || "Completa su información de cuidado"}</p>
              </div>
              <Icon name="chevron" size={18} />
            </button>
          ))}
        </div>
        {!rows.length && (
          <p className="empty-message">Agrega a la primera persona que vas a cuidar.</p>
        )}
        <Button icon="plus" onClick={() => setAdding(true)}>
          Registrar paciente
        </Button>
      </main>
    </div>
  );
}
