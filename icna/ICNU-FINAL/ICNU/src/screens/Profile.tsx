import { useState } from "react";
import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { TopBar } from "../components/TopBar";
import { PatientEditor } from "../components/PatientEditor";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { resolvePatient, type StoredPatient } from "../data/patients";
import { usePersistentState } from "../lib/storage";
import { seedUtilityItems } from "./UtilityScreen";
import { seedContacts, type Contact } from "./Emergency";
import type { PatientId, Screen } from "../types";

export default function Profile({
  back,
  navigate,
  notify,
  patient,
  deleted,
}: {
  back: () => void;
  navigate: (screen: Screen) => void;
  notify: (message: string) => void;
  patient: PatientId;
  deleted: () => void;
}) {
  const [extraPatients] = usePersistentState<StoredPatient[]>("patients:extra", []);
  const [hidden, setHidden] = usePersistentState<string[]>("patients:hidden", []);
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [meds] = usePersistentState("utility:items:medications", seedUtilityItems("medications"));
  const [contacts] = usePersistentState<Contact[]>("emergency:contacts", seedContacts);
  const stored = extraPatients.find((p) => p.id === patient);
  const profile = resolvePatient(patient, stored);
  if (!profile || hidden.includes(patient))
    return (
      <div className="screen">
        <TopBar title="Perfil no disponible" back={back} summary={false} />
      </div>
    );
  if (editing)
    return (
      <PatientEditor
        initial={{ ...profile, ...stored, id: patient }}
        close={() => setEditing(false)}
        saved={() => setEditing(false)}
        notify={notify}
      />
    );
  return (
    <div className="screen">
      <TopBar
        title="Perfil del paciente"
        subtitle="TODO LO QUE NECESITAS SABER"
        back={back}
        summary={false}
      />
      <main className="content profile-content">
        <section className="profile-hero">
          <Avatar person={profile.avatar} size="xl" initials={profile.initials} />
          <div>
            <span className="eyebrow">PERSONA A TU CUIDADO</span>
            <h1>{profile.name}</h1>
            <p>{profile.age === null ? "Edad sin registrar" : `${profile.age} años`}</p>
          </div>
        </section>
        <div className="profile-actions">
          <Button icon="edit" onClick={() => setEditing(true)}>
            Editar perfil
          </Button>
          <Button variant="secondary" icon="plus" onClick={() => navigate("tasks")}>
            Crear tarea
          </Button>
        </div>
        <section className="important-card">
          <div className="section-heading">
            <h2>Salud y cuidados</h2>
            <Icon name="heart" />
          </div>
          <dl>
            <div>
              <dt>Condiciones médicas</dt>
              <dd>{profile.conditions || "Sin registrar"}</dd>
            </div>
            <div>
              <dt>Alergias</dt>
              <dd>{profile.allergies || "Sin registrar"}</dd>
            </div>
            <div>
              <dt>Tipo de sangre</dt>
              <dd>{profile.blood || "Sin registrar"}</dd>
            </div>
            {stored?.directions && (
              <div>
                <dt>Indicaciones</dt>
                <dd>{stored.directions}</dd>
              </div>
            )}
          </dl>
        </section>
        <section>
          <div className="section-heading">
            <h2>Medicamentos y horarios</h2>
            <button className="text-button" onClick={() => navigate("medications")}>
              Administrar
            </button>
          </div>
          <div className="card schedule">
            {meds.length ? (
              meds.map((m, i) => (
                <div className="editor-list-row" key={i}>
                  <Icon name="pill" />
                  <div>
                    <strong>{m.title}</strong>
                    <small>{m.detail}</small>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-message">Sin medicamentos registrados.</p>
            )}
          </div>
        </section>
        <section>
          <div className="section-heading">
            <h2>Contactos de emergencia</h2>
            <button className="text-button" onClick={() => navigate("emergency")}>
              Administrar
            </button>
          </div>
          <div className="card schedule">
            {contacts
              .filter((c) => !c.isDoctor)
              .map((c) => (
                <div className="editor-list-row" key={c.id}>
                  <Icon name="phone" />
                  <div>
                    <strong>{c.name}</strong>
                    <small>{c.phone}</small>
                  </div>
                  <a
                    className="call-link"
                    href={`tel:${c.phone.replace(/[^+\d]/g, "")}`}
                    aria-label={`Llamar a ${c.name}`}
                  >
                    <Icon name="phone" size={18} />
                  </a>
                </div>
              ))}
            {!contacts.filter((c) => !c.isDoctor).length && (
              <p className="empty-message">Agrega un contacto para tenerlo a la mano.</p>
            )}
          </div>
        </section>
        <section className="card doctor-card">
          <span className="doctor-icon">
            <Icon name="stethoscope" />
          </span>
          <div>
            <span className="eyebrow">MÉDICO PRINCIPAL</span>
            <h3>{profile.doctor || "Sin registrar"}</h3>
            <p>
              {profile.specialty} {profile.phoneLabel}
            </p>
            {profile.phone && (
              <a className="call-link" href={`tel:${profile.phone.replace(/[^+\d]/g, "")}`}>
                <Icon name="phone" size={18} /> Llamar al médico
              </a>
            )}
          </div>
        </section>
        <Button variant="ghost" onClick={() => setConfirm(true)}>
          Eliminar paciente
        </Button>
      </main>
      {confirm && (
        <ConfirmDialog
          title={`¿Eliminar a ${profile.name}?`}
          message="Se quitará de tu listado en este dispositivo. Los demás pacientes conservarán sus datos."
          confirmLabel="Eliminar paciente"
          onCancel={() => setConfirm(false)}
          onConfirm={() => {
            setHidden([...hidden, patient]);
            notify("Paciente eliminado");
            deleted();
          }}
        />
      )}
    </div>
  );
}
