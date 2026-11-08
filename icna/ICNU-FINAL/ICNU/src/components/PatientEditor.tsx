import { useEffect, useState } from "react";
import { Button } from "./Button";
import { FormField } from "./FormField";
import { Icon } from "./Icon";
import { TopBar } from "./TopBar";
import { usePersistentState, patientDataKey, writePersistentState } from "../lib/storage";
import type { StoredPatient } from "../data/patients";
import { seedContacts, type Contact } from "../screens/Emergency";

export function PatientEditor({
  initial,
  close,
  saved,
  notify,
}: {
  initial?: StoredPatient;
  close: () => void;
  saved: (id: string) => void;
  notify: (message: string) => void;
}) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);
  const [id] = useState(() => initial?.id ?? `pac-${crypto.randomUUID()}`);
  const [patients, setPatients] = usePersistentState<StoredPatient[]>("patients:extra", []);
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    age: initial?.age?.toString() ?? "",
    conditions: initial?.conditions ?? "",
    allergies: initial?.allergies ?? "",
    blood: initial?.blood ?? "",
    doctor: initial?.doctor ?? "",
    phone: initial?.phone ?? "",
    specialty: initial?.specialty ?? "",
    directions: initial?.directions ?? "",
  });
  const [savedContacts] = usePersistentState<Contact[]>(
    patientDataKey(id, "emergency:contacts"),
    initial?.id === "jose" ? seedContacts : [],
  );
  const [contacts, setContacts] = useState(() => savedContacts.filter((c) => !c.isDoctor));
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [medicines, setMedicines] = useState<{ title: string; detail: string; meta: string }[]>([]);
  const [med, setMed] = useState({ name: "", dose: "", time: "09:00", directions: "" });
  const [error, setError] = useState("");
  const field = (key: keyof typeof form) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  const validPhone = (value: string) =>
    /^\+?[\d\s()-]{10,20}$/.test(value) && value.replace(/\D/g, "").length >= 10;
  const addContact = () => {
    if (!contactName.trim() || !validPhone(contactPhone)) {
      setError("Agrega un nombre y un teléfono válido de al menos 10 dígitos.");
      return;
    }
    setContacts((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: contactName.trim(),
        phone: contactPhone.trim(),
        role: "Contacto de emergencia",
      },
    ]);
    setContactName("");
    setContactPhone("");
    setError("");
  };
  const addMedicine = () => {
    if (!med.name.trim() || !med.time) {
      setError("Indica el medicamento y su horario.");
      return;
    }
    setMedicines((current) => [
      ...current,
      {
        title: [med.name.trim(), med.dose.trim()].filter(Boolean).join(" · "),
        detail: `${med.time} · ${med.directions.trim() || "Sin indicaciones"}`,
        meta: "Programado",
      },
    ]);
    setMed({ name: "", dose: "", time: "09:00", directions: "" });
    setError("");
  };
  const save = () => {
    if (
      !form.name.trim() ||
      !form.age ||
      !Number.isInteger(Number(form.age)) ||
      Number(form.age) < 0 ||
      Number(form.age) > 120
    ) {
      setError("Escribe el nombre y una edad entre 0 y 120 años.");
      return;
    }
    if (form.phone && !validPhone(form.phone)) {
      setError("Revisa el teléfono del médico (al menos 10 dígitos).");
      return;
    }
    if (contactName || contactPhone) {
      setError("Agrega el contacto pendiente con el botón o vacía sus campos antes de guardar.");
      return;
    }
    if (med.name || med.dose || med.directions) {
      setError("Agrega el medicamento pendiente antes de guardar.");
      return;
    }
    const value: StoredPatient = {
      id,
      ...form,
      name: form.name.trim(),
      short: form.name.trim(),
      age: Number(form.age),
      phoneLabel: form.phone,
      contacts,
    };
    setPatients([...patients.filter((p) => p.id !== id), value]);
    if (!initial) {
      writePersistentState(patientDataKey(id, "utility:items:medications"), medicines);
      writePersistentState(patientDataKey(id, "utility:completed:medications"), []);
    }
    writePersistentState(patientDataKey(id, "emergency:contacts"), [
      ...contacts,
      ...(form.doctor && form.phone
        ? [
            {
              id: "doctor",
              name: form.doctor,
              phone: form.phone,
              role: form.specialty || "Médico principal",
              isDoctor: true,
            },
          ]
        : []),
    ]);
    notify(initial ? "Perfil actualizado" : "Paciente registrado");
    saved(id);
  };
  return (
    <div className="screen editor-screen">
      <TopBar
        title={initial ? "Editar paciente" : "Nuevo paciente"}
        subtitle="SU BIENESTAR, EN EQUIPO"
        back={close}
        summary={false}
      />
      <main className="content">
        <div className="editor-intro">
          <span className="eyebrow">PERFIL DE CUIDADO</span>
          <h1>Conozcamos a quien cuidas.</h1>
          <p>Lo esencial, siempre a la mano. Puedes completar los datos médicos después.</p>
        </div>
        <section className="form-section">
          <h2>
            <span>01</span> Datos personales
          </h2>
          <FormField
            label="Nombre completo *"
            value={form.name}
            onChange={field("name")}
            placeholder="Ej. Elena Torres"
          />
          <div className="form-columns">
            <FormField
              label="Edad *"
              type="number"
              min="0"
              max="120"
              value={form.age}
              onChange={field("age")}
            />
            <FormField
              label="Tipo de sangre"
              value={form.blood}
              onChange={field("blood")}
              placeholder="Ej. O+"
            />
          </div>
        </section>
        <section className="form-section">
          <h2>
            <span>02</span> Salud y cuidados
          </h2>
          <FormField
            label="Condiciones médicas"
            value={form.conditions}
            onChange={field("conditions")}
            placeholder="Ej. Diabetes tipo 2, hipertensión"
          />
          <FormField
            label="Alergias"
            value={form.allergies}
            onChange={field("allergies")}
            placeholder="Ej. Penicilina o ninguna conocida"
          />
          <FormField
            label="Indicaciones de cuidado"
            value={form.directions}
            onChange={field("directions")}
            placeholder="Ej. Dieta baja en sodio"
          />
        </section>
        {!initial && (
          <section className="form-section">
            <h2>
              <span>03</span> Medicamentos
            </h2>
            <p className="helper">Opcional. Agrega las tomas que necesitas organizar.</p>
            {medicines.map((item, index) => (
              <div className="editor-list-row" key={index}>
                <Icon name="pill" />
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.detail}</small>
                </div>
                <button
                  aria-label={`Quitar ${item.title}`}
                  onClick={() => setMedicines((current) => current.filter((_, i) => i !== index))}
                >
                  ×
                </button>
              </div>
            ))}
            <FormField
              label="Medicamento"
              value={med.name}
              onChange={(value) => setMed({ ...med, name: value })}
            />
            <div className="form-columns">
              <FormField
                label="Dosis"
                value={med.dose}
                onChange={(value) => setMed({ ...med, dose: value })}
                placeholder="Ej. 50 mg"
              />
              <FormField
                label="Horario"
                type="time"
                value={med.time}
                onChange={(value) => setMed({ ...med, time: value })}
              />
            </div>
            <FormField
              label="Indicaciones de la toma"
              value={med.directions}
              onChange={(value) => setMed({ ...med, directions: value })}
            />
            <Button variant="secondary" icon="plus" onClick={addMedicine}>
              Agregar medicamento
            </Button>
          </section>
        )}
        <section className="form-section">
          <h2>
            <span>{initial ? "03" : "04"}</span> Contactos de emergencia
          </h2>
          {contacts.map((contact) => (
            <div className="editor-list-row" key={contact.id}>
              <Icon name="phone" />
              <div>
                <strong>{contact.name}</strong>
                <small>{contact.phone}</small>
              </div>
              <button
                aria-label={`Quitar ${contact.name}`}
                onClick={() => setContacts((current) => current.filter((c) => c.id !== contact.id))}
              >
                ×
              </button>
            </div>
          ))}
          <FormField label="Nombre del contacto" value={contactName} onChange={setContactName} />
          <FormField
            label="Teléfono del contacto"
            type="tel"
            value={contactPhone}
            onChange={setContactPhone}
            placeholder="10 dígitos"
          />
          <Button variant="secondary" icon="plus" onClick={addContact}>
            Agregar contacto
          </Button>
        </section>
        <section className="form-section">
          <h2>
            <span>{initial ? "04" : "05"}</span> Médico principal
          </h2>
          <FormField label="Nombre del médico" value={form.doctor} onChange={field("doctor")} />
          <FormField label="Especialidad" value={form.specialty} onChange={field("specialty")} />
          <FormField
            label="Teléfono del médico"
            type="tel"
            value={form.phone}
            onChange={field("phone")}
            placeholder="10 dígitos"
          />
        </section>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <Button icon="check" onClick={save}>
          Guardar paciente
        </Button>
        <Button variant="ghost" onClick={close}>
          Cancelar
        </Button>
      </main>
    </div>
  );
}
