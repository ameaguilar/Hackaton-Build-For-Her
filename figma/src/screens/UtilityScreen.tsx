import { useState } from "react";
import { Button } from "../components/Button";
import { ActionSheet } from "../components/ActionSheet";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { FormField } from "../components/FormField";
import { Icon, type IconName } from "../components/Icon";
import { IconButton } from "../components/IconButton";
import { TopBar } from "../components/TopBar";
import { patientProfiles, type StoredPatient } from "../data/patients";
import { todayISO } from "../lib/dates";
import { usePersistentState } from "../lib/storage";
import type { Screen } from "../types";

export type UtilityKind = "medications" | "appointments" | "tasks" | "caregivers" | "patient-create";

const utilityContent: Record<
  UtilityKind,
  {
    title: string;
    subtitle: string;
    icon: IconName;
    intro: string;
    items: { title: string; detail: string; meta: string; done?: boolean; extraId?: string }[];
    action: string;
  }
> = {
  medications: {
    title: "Medicamentos",
    subtitle: "HOY · DON JOSÉ",
    icon: "pill",
    intro: "Control claro de las tomas de hoy",
    items: [
      {
        title: "Losartán · 50 mg",
        detail: "09:00 · Después del desayuno",
        meta: "Tomado por Ana",
        done: true,
      },
      { title: "Metformina · 850 mg", detail: "14:00 · Después de comer", meta: "Próxima toma" },
      { title: "Atorvastatina · 20 mg", detail: "21:00 · Antes de dormir", meta: "Programado" },
    ],
    action: "Agregar medicamento",
  },
  appointments: {
    title: "Citas",
    subtitle: "PRÓXIMAS VISITAS",
    icon: "calendar",
    intro: "La familia ya conoce estas citas",
    items: [
      {
        title: "Cardiología",
        detail: "Jueves 19 · 10:30 · Clínica Central",
        meta: "Ana acompañará a Don José",
        done: true,
      },
      {
        title: "Laboratorio",
        detail: "Martes 24 · 08:00 · En ayuno",
        meta: "Falta confirmar traslado",
      },
    ],
    action: "Agregar cita",
  },
  tasks: {
    title: "Tareas",
    subtitle: "RUTINA DE HOY",
    icon: "check",
    intro: "3 de 5 tareas completadas",
    items: [
      { title: "Desayuno", detail: "08:00 · Avena, fruta y té", meta: "Completada", done: true },
      {
        title: "Losartán · 50 mg",
        detail: "09:00 · Después del desayuno",
        meta: "Completada",
        done: true,
      },
      { title: "Comida", detail: "12:30 · Dieta baja en sodio", meta: "En curso" },
      { title: "Caminata suave", detail: "16:00 · 15 minutos", meta: "Pendiente" },
    ],
    action: "Nueva tarea",
  },
  caregivers: {
    title: "Usuarios y accesos",
    subtitle: "FAMILIA Y CUIDADORES",
    icon: "users",
    intro: "2 administradores · 2 usuarios secundarios",
    items: [
      {
        title: "Ana Martínez",
        detail: "Cuidadora principal · Administradora",
        meta: "Acceso total",
        done: true,
      },
      {
        title: "Luis Ramírez",
        detail: "Hijo · Administrador",
        meta: "Vive lejos · apoyo económico",
        done: true,
      },
      {
        title: "María López",
        detail: "Enfermera · Secundaria",
        meta: "Bitácora, tareas y alertas",
      },
    ],
    action: "Agregar nuevo cuidador",
  },
  "patient-create": {    title: "Pacientes",
    subtitle: "PERFILES ASIGNADOS",
    icon: "users",
    intro: "3 pacientes activos",
    items: [
      {
        title: "José Ramírez",
        detail: "78 años · Don José · Melocotón",
        meta: "Hipertensión · Diabetes tipo 2",
        done: true,
      },
      {
        title: "Elena Torres",
        detail: "82 años · Doña Elena · Salvia",
        meta: "Artritis · Osteoporosis",
        done: true,
      },
      {
        title: "Roberto Díaz",
        detail: "74 años · Don Roberto · Amarillo suave",
        meta: "Hipertensión · Alergia a sulfas",
        done: true,
      },
    ],
    action: "Agregar nuevo",
  },
};

/** Semillas compartidas (las usa Inicio para tarjetas con datos reales). */
export function seedUtilityItems(kind: UtilityKind) {
  return utilityContent[kind].items.map((item) => ({ ...item }));
}

function UtilityScreen({
  kind,
  back,
  navigate,
  notify,
}: {
  kind: UtilityKind;
  back: () => void;
  navigate: (screen: Screen) => void;
  notify: (message: string) => void;
}) {
  const content = utilityContent[kind];
  const [items, setItems] = usePersistentState<typeof content.items>(
    `utility:items:${kind}`,
    content.items.map((item) => ({ ...item })),
  );
  const [completed, setCompleted] = usePersistentState<number[]>(
    `utility:completed:${kind}`,
    content.items.map((item, index) => (item.done ? index : -1)).filter((index) => index >= 0),
  );
  const toggle = (index: number) =>
    setCompleted((current) =>
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index],
    );
  const [actionOpen, setActionOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formName, setFormName] = useState("");
  const [selectedChoice, setSelectedChoice] = useState("");
  const [formDate, setFormDate] = useState(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [age, setAge] = useState("");
  const [conditions, setConditions] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medicalDirections, setMedicalDirections] = useState("");
  const [medicationName, setMedicationName] = useState("");
  const [dose, setDose] = useState("");
  const [medicationTime, setMedicationTime] = useState("09:00");
  const [medicationDirections, setMedicationDirections] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [doctorPhone, setDoctorPhone] = useState("");
  const isStepper = kind === "caregivers" || kind === "patient-create";
  const maxSteps = kind === "patient-create" ? 4 : kind === "caregivers" ? 3 : 1;
  const [extraPatients, setExtraPatients] = usePersistentState<StoredPatient[]>("patients:extra", []);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [deletePatientId, setDeletePatientId] = useState<string | null>(null);

  /** Filas del registro de pacientes (ardilla semillas + pacientes creados). */
  const registryRows: { title: string; detail: string; meta: string; extraId?: string }[] = [
    ...Object.values(patientProfiles).map((profile) => ({
      title: profile.name,
      detail: `${profile.age} años · ${profile.short}`,
      meta: profile.conditions,
    })),
    ...extraPatients.map((stored) => ({
      title: stored.name,
      detail: `${stored.age ?? "Edad no indicada"} años · ${stored.short || stored.name}`,
      meta:
        [stored.conditions, stored.allergies && `Alergia: ${stored.allergies}`]
          .filter(Boolean)
          .join(" · ") || "Información médica por completar",
      extraId: stored.id,
    })),
  ];

  return (
    <div className="screen">
      <TopBar
        title={content.title}
        subtitle={content.subtitle}
        back={back}
        points={false}
        onProfile={() => navigate("admin")}
      />
      <main className="content utility-content">
        <section className="utility-intro">
          <span>
            <Icon name={content.icon} />
          </span>
          <div>
            <h1>{content.intro}</h1>
            <p>Información coordinada para cuidar mejor.</p>
          </div>
        </section>
        <div className="utility-list">
          {(kind === "patient-create" ? registryRows : items).map((row, index) => (
            <div className="utility-row" key={`${row.title}-${index}`}>
              {kind === "patient-create" ? (
                <span className="utility-check done" aria-hidden="true">
                  <Icon name="check" size={17} />
                </span>
              ) : (
                <button
                  className={`utility-check ${completed.includes(index) ? "done" : ""}`}
                  aria-label={completed.includes(index) ? "Desmarcar" : "Marcar"}
                  onClick={() => toggle(index)}
                >
                  <Icon name="check" size={17} />
                </button>
              )}
              <span>
                <strong>{row.title}</strong>
                <small>{row.detail}</small>
                <em>{kind !== "patient-create" && completed.includes(index) ? "Listo" : row.meta}</em>
              </span>
              {kind === "patient-create" ? (
                row.extraId && (
                  <button
                    className="utility-edit"
                    aria-label={`Eliminar ${row.title}`}
                    onClick={() => setDeletePatientId(row.extraId!)}
                  >
                    <Icon name="close" size={18} />
                  </button>
                )
              ) : (
                <>
                  <button
                    className="utility-edit"
                    aria-label={`Editar ${row.title}`}
                    onClick={() => {
                      setEditingIndex(index);
                      setFormName(row.title);
                      if (kind === "medications") {
                        const [currentName, currentDose = ""] = row.title.split(" · ");
                        setMedicationName(currentName);
                        setDose(currentDose);
                        setMedicationTime(row.detail.split(" · ")[0] || "09:00");
                        setMedicationDirections(row.meta);
                      }
                      setStep(1);
                      setActionOpen(true);
                    }}
                  >
                    <Icon name="edit" size={18} />
                  </button>
                  <button
                    className="utility-edit"
                    aria-label={`Eliminar ${row.title}`}
                    onClick={() => setDeleteIndex(index)}
                  >
                    <Icon name="close" size={18} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
        <Button
          icon={kind === "patient-create" ? "chevron" : "plus"}
          onClick={() => {
            setEditingIndex(null);
            setFormName("");
            setMedicationName("");
            setDose("");
            setMedicationTime("09:00");
            setMedicationDirections("");
            setActionOpen(true);
          }}
        >
          {content.action}
        </Button>
      </main>
      {actionOpen && (
        <ActionSheet
          title={editingIndex === null ? content.action : `Editar ${items[editingIndex].title}`}
          subtitle={isStepper ? `PASO ${step} DE ${maxSteps}` : "NUEVO REGISTRO"}
          close={() => {
            setActionOpen(false);
            setStep(1);
            setEditingIndex(null);
          }}
        >
          <div className="sheet-form">
            {step === 1 && (
              <>
                {kind === "medications" ? (
                  <>
                    <FormField
                      label="Nombre del medicamento"
                      value={medicationName}
                      onChange={setMedicationName}
                      placeholder="Ej. Metformina"
                    />
                    <FormField label="Dosis" value={dose} onChange={setDose} placeholder="Ej. 850 mg" />
                    <FormField
                      label="Horario"
                      type="time"
                      value={medicationTime}
                      onChange={setMedicationTime}
                    />
                    <FormField
                      label="Indicaciones"
                      value={medicationDirections}
                      onChange={setMedicationDirections}
                      placeholder="Ej. Después de comer"
                    />
                  </>
                ) : (
                  <>
                    <FormField
                      label={
                        kind === "caregivers"
                          ? "Nombre del cuidador"
                          : kind === "patient-create"
                            ? "Nombre del paciente"
                            : "Nombre"
                      }
                      value={formName}
                      onChange={setFormName}
                      placeholder="Escribe un nombre"
                    />
                    {kind === "patient-create" ? (
                      <FormField
                        label="Edad"
                        type="number"
                        value={age}
                        onChange={setAge}
                        placeholder="Ej. 78"
                        min="0"
                        max="120"
                      />
                    ) : (
                      <FormField
                        label={kind === "appointments" ? "Fecha de la cita" : "Fecha"}
                        type="date"
                        value={formDate}
                        onChange={setFormDate}
                        min={todayISO()}
                      />
                    )}
                  </>
                )}
              </>
            )}
            {step === 2 && (
              <>
                {kind === "patient-create" ? (
                  <>
                    <div className="step-explanation">
                      <strong>Salud y cuidados</strong>
                      <p>
                        Registra información que el cuidador debe conocer antes de atender al
                        paciente.
                      </p>
                    </div>
                    <FormField
                      label="Condiciones"
                      value={conditions}
                      onChange={setConditions}
                      placeholder="Ej. Hipertensión, diabetes"
                    />
                    <FormField
                      label="Alergias"
                      value={allergies}
                      onChange={setAllergies}
                      placeholder="Ej. Penicilina o ninguna conocida"
                    />
                    <FormField
                      label="Indicaciones médicas"
                      value={medicalDirections}
                      onChange={setMedicalDirections}
                      placeholder="Ej. Dieta baja en sodio"
                    />
                  </>
                ) : (
                  <div className="choice-grid">
                    {["Administrador", "Secundario"].map((choice) => (
                      <button
                        className={selectedChoice === choice ? "selected" : ""}
                        key={choice}
                        onClick={() => setSelectedChoice(choice)}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
            {step === 3 && kind === "patient-create" && (
              <>
                <div className="step-explanation">
                  <strong>Medicamentos y horarios</strong>
                  <p>
                    Agrega la primera toma. Después podrás registrar más medicamentos desde su
                    perfil.
                  </p>
                </div>
                <FormField
                  label="Medicamento"
                  value={medicationName}
                  onChange={setMedicationName}
                  placeholder="Ej. Losartán"
                />
                <FormField label="Dosis" value={dose} onChange={setDose} placeholder="Ej. 50 mg" />
                <FormField
                  label="Hora"
                  type="time"
                  value={medicationTime}
                  onChange={setMedicationTime}
                />
                <FormField
                  label="Indicaciones de la toma"
                  value={medicationDirections}
                  onChange={setMedicationDirections}
                  placeholder="Ej. Después del desayuno"
                />
              </>
            )}
            {step === 3 && kind === "caregivers" && (
              <>
                <div className="step-explanation">
                  <strong>Permisos del cuidador</strong>
                  <p>Define qué información puede consultar y qué avisos recibirá.</p>
                </div>
                <label className="toggle-row">
                  <span>
                    <strong>Ver bitácora</strong>
                    <small>Puede consultar los registros diarios del paciente</small>
                  </span>
                  <input type="checkbox" defaultChecked />
                </label>
                <label className="toggle-row">
                  <span>
                    <strong>Recibir alertas</strong>
                    <small>Avisos importantes</small>
                  </span>
                  <input type="checkbox" defaultChecked />
                </label>
                <label className="toggle-row">
                  <span>
                    <strong>Vive lejos</strong>
                    <small>Solo apoyo económico</small>
                  </span>
                  <input type="checkbox" />
                </label>
              </>
            )}
            {step === 4 && kind === "patient-create" && (
              <>
                <div className="step-explanation">
                  <strong>Contactos médicos y de emergencia</strong>
                  <p>Estos datos aparecerán como accesos rápidos durante una emergencia.</p>
                </div>
                <FormField
                  label="Contacto de emergencia"
                  value={emergencyContact}
                  onChange={setEmergencyContact}
                  placeholder="Nombre y teléfono"
                />
                <FormField
                  label="Médico de cabecera"
                  value={doctorName}
                  onChange={setDoctorName}
                  placeholder="Nombre del médico"
                />
                <FormField
                  label="Teléfono del médico"
                  type="tel"
                  value={doctorPhone}
                  onChange={setDoctorPhone}
                  placeholder="55 0000 0000"
                />
              </>
            )}
            <div className="step-actions">
              {step > 1 && (
                <Button
                  className="back-step"
                  variant="secondary"
                  icon="chevron"
                  onClick={() => setStep((current) => current - 1)}
                >
                  Anterior
                </Button>
              )}
              <Button
                icon={step < maxSteps ? "chevron" : "check"}
                onClick={() => {
                  if (step < maxSteps) {
                    if (kind === "patient-create" && step === 1 && age) {
                      const parsedAge = Number(age);
                      if (!Number.isInteger(parsedAge) || parsedAge < 0 || parsedAge > 120) {
                        notify("Escribe una edad válida (0 a 120)");
                        return;
                      }
                    }
                    if (kind === "caregivers" && step === 2 && !selectedChoice) {
                      notify("Elige Administrador o Secundario para continuar");
                      return;
                    }
                    if (kind === "patient-create" && step === 1 && formName.trim() === "") {
                      notify("Escribe el nombre del paciente antes de continuar");
                      return;
                    }
                    setStep((current) => current + 1);
                    return;
                  }
                  const name = kind === "medications" ? medicationName.trim() : formName.trim();
                  if (!name) {
                    notify(
                      kind === "medications"
                        ? "Escribe el nombre del medicamento"
                        : "Escribe un nombre antes de guardar",
                    );
                    return;
                  }
                  if (kind === "patient-create" && editingIndex === null) {
                    const storedName = name;
                    setExtraPatients((current) => [
                      ...current,
                      {
                        id: `pac-${Date.now()}`,
                        name: storedName,
                        short: storedName,
                        age: age ? Number(age) : null,
                        conditions: conditions.trim(),
                        allergies: allergies.trim(),
                        blood: "",
                        doctor: doctorName.trim(),
                        specialty: "Medicina general",
                        phone: doctorPhone.trim(),
                        phoneLabel: doctorPhone.trim(),
                      },
                    ]);
                    setActionOpen(false);
                    setStep(1);
                    setFormName("");
                    setAge("");
                    setConditions("");
                    setAllergies("");
                    setMedicalDirections("");
                    setMedicationName("");
                    setDose("");
                    setMedicationTime("09:00");
                    setMedicationDirections("");
                    setEmergencyContact("");
                    setDoctorName("");
                    setDoctorPhone("");
                    notify("Paciente registrado: ya aparece en el selector de Inicio");
                    return;
                  }
                  const newItem =
                    kind === "medications"
                      ? {
                          title: `${medicationName.trim()}${dose.trim() ? ` · ${dose.trim()}` : ""}`,
                          detail: `${medicationTime} · ${medicationDirections || "Sin indicaciones adicionales"}`,
                          meta: "Programado",
                        }
                      : kind === "patient-create"
                        ? {
                            title: formName.trim(),
                            detail: `${age || "Edad no indicada"} años · ${
                              medicationName
                                ? `${medicationName}${dose ? ` ${dose}` : ""} a las ${medicationTime}`
                                : "Sin medicamentos registrados"
                            }`,
                            meta:
                              [conditions, allergies && `Alergia: ${allergies}`, medicalDirections]
                                .filter(Boolean)
                                .join(" · ") || "Información médica por completar",
                          }
                        : {
                            title: formName.trim(),
                            detail: formDate,
                            meta: "Nuevo registro",
                          };
                  if (editingIndex === null) {
                    setItems((current) => [...current, newItem]);
                  } else {
                    setItems((current) =>
                      current.map((item, index) =>
                        index === editingIndex ? { ...item, ...newItem } : item,
                      ),
                    );
                  }
                  setActionOpen(false);
                  setStep(1);
                  setFormName("");
                  setSelectedChoice("");
                  setEditingIndex(null);
                  notify(
                    kind === "medications"
                      ? "Medicamento guardado y agregado al horario"
                      : `${content.action}: información guardada`,
                  );
                }}
              >
                {step < maxSteps ? "Continuar" : "Guardar"}
              </Button>
            </div>
          </div>
        </ActionSheet>
      )}
      {deleteIndex !== null && items[deleteIndex] && (
        <ConfirmDialog
          title={`¿Eliminar «${items[deleteIndex].title}»?`}
          message="Este registro desaparecerá de la lista. Esta acción no se puede deshacer."
          confirmLabel="Eliminar"
          onConfirm={() => {
            const index = deleteIndex;
            setItems((current) => current.filter((_, i) => i !== index));
            setCompleted((current) => current.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i)));
            setDeleteIndex(null);
            notify("Registro eliminado");
          }}
          onCancel={() => setDeleteIndex(null)}
        />
      )}
      {deletePatientId && (
        <ConfirmDialog
          title="¿Eliminar este paciente?"
          message="Se quitará del registro y del selector de Inicio. Esta acción no se puede deshacer."
          confirmLabel="Eliminar paciente"
          onConfirm={() => {
            setExtraPatients((current) => current.filter((stored) => stored.id !== deletePatientId));
            setDeletePatientId(null);
            notify("Paciente eliminado del registro");
          }}
          onCancel={() => setDeletePatientId(null)}
        />
      )}
    </div>
  );
}

export default UtilityScreen;
