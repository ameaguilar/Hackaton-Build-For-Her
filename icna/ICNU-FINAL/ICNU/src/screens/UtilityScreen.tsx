import { useContext, useState } from "react";
import { Button } from "../components/Button";
import { ActionSheet } from "../components/ActionSheet";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { FormField } from "../components/FormField";
import { Icon, type IconName } from "../components/Icon";
import { TopBar } from "../components/TopBar";
import { todayISO, plusDaysISO } from "../lib/dates";
import { usePersistentState } from "../lib/storage";
import { PatientScope } from "../lib/patientScope";
import { resolvePatient, type StoredPatient } from "../data/patients";
import type { Screen } from "../types";

export type UtilityKind = "medications" | "appointments" | "tasks" | "caregivers";
export type UtilityItem = {
  title: string;
  detail: string;
  meta: string;
  date?: string;
  time?: string;
  dose?: string;
  notes?: string;
  phone?: string;
  role?: string;
  done?: boolean;
};
const config: Record<UtilityKind, { title: string; icon: IconName; action: string }> = {
  medications: { title: "Medicamentos", icon: "pill", action: "Agregar medicamento" },
  appointments: { title: "Citas", icon: "calendar", action: "Agregar cita" },
  tasks: { title: "Tareas", icon: "check", action: "Nueva tarea" },
  caregivers: { title: "Círculo de apoyo", icon: "users", action: "Agregar cuidador" },
};
export function seedUtilityItems(kind: UtilityKind): UtilityItem[] {
  if (kind === "medications")
    return [
      {
        title: "Losartán · 50 mg",
        detail: "09:00 · Después del desayuno",
        meta: "Programado",
        time: "09:00",
        dose: "50 mg",
        notes: "Después del desayuno",
      },
      {
        title: "Metformina · 850 mg",
        detail: "14:00 · Después de comer",
        meta: "Programado",
        time: "14:00",
        dose: "850 mg",
        notes: "Después de comer",
      },
      {
        title: "Atorvastatina · 20 mg",
        detail: "21:00 · Antes de dormir",
        meta: "Programado",
        time: "21:00",
        dose: "20 mg",
        notes: "Antes de dormir",
      },
    ];
  if (kind === "tasks")
    return [
      {
        title: "Desayuno",
        detail: "08:00 · Avena, fruta y té",
        time: "08:00",
        notes: "Avena, fruta y té",
        meta: "Pendiente",
      },
      {
        title: "Comida",
        detail: "12:30 · Dieta baja en sodio",
        time: "12:30",
        notes: "Dieta baja en sodio",
        meta: "Pendiente",
      },
      {
        title: "Caminata suave",
        detail: "16:00 · 15 minutos",
        time: "16:00",
        notes: "15 minutos",
        meta: "Pendiente",
      },
    ];
  if (kind === "appointments")
    return [
      {
        title: "Cardiología",
        detail: `${plusDaysISO(2)} · 10:30 · Clínica Central`,
        date: plusDaysISO(2),
        time: "10:30",
        notes: "Clínica Central",
        meta: "Programada",
      },
    ];
  return [
    {
      title: "Ana Martínez",
      detail: "Cuidador principal · 5511112222",
      role: "Cuidador principal",
      phone: "5511112222",
      meta: "Contacto de ejemplo",
    },
    {
      title: "Luis Ramírez",
      detail: "Familiar · 5533334444",
      role: "Familiar",
      phone: "5533334444",
      meta: "Contacto de ejemplo",
    },
  ];
}

export default function UtilityScreen({
  kind,
  back,
  notify,
}: {
  kind: UtilityKind;
  back: () => void;
  navigate: (s: Screen) => void;
  notify: (message: string) => void;
}) {
  const content = config[kind];
  const patient = useContext(PatientScope);
  const [extra] = usePersistentState<StoredPatient[]>("patients:extra", []);
  const profile = resolvePatient(
    patient,
    extra.find((p) => p.id === patient),
  );
  const [items, setItems] = usePersistentState<UtilityItem[]>(
    `utility:items:${kind}`,
    seedUtilityItems(kind),
  );
  const [done, setDone] = usePersistentState<number[]>(`utility:completed:${kind}`, []);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const empty = {
    name: "",
    dose: "",
    time: "09:00",
    date: todayISO(),
    notes: "",
    role: "Cuidador principal",
    phone: "",
  };
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const update = (key: keyof typeof form) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  const edit = (index: number) => {
    const item = items[index];
    const parts = item.detail.split(" · ");
    setForm({
      name: kind === "medications" ? item.title.split(" · ")[0] : item.title,
      dose: item.dose ?? item.title.split(" · ")[1] ?? "",
      time: item.time ?? (/^\d{2}:\d{2}$/.test(parts[0]) ? parts[0] : "09:00"),
      date: item.date ?? (/^\d{4}-\d{2}-\d{2}$/.test(parts[0]) ? parts[0] : todayISO()),
      notes:
        item.notes ??
        (kind === "medications" || kind === "tasks" ? parts.slice(1).join(" · ") : ""),
      role: item.role ?? "Cuidador principal",
      phone: item.phone ?? "",
    });
    setEditing(index);
    setError("");
    setOpen(true);
  };
  const save = () => {
    if (!form.name.trim()) {
      setError("Escribe un nombre para continuar.");
      return;
    }
    if (kind === "caregivers" && form.phone.replace(/\D/g, "").length !== 10) {
      setError("Escribe un teléfono de 10 dígitos.");
      return;
    }
    if (kind !== "caregivers" && !/^\d{2}:\d{2}$/.test(form.time)) {
      setError("Indica un horario válido.");
      return;
    }
    if (
      (kind === "appointments" || kind === "tasks") &&
      (!form.date || (editing === null && form.date < todayISO()))
    ) {
      setError("Selecciona una fecha de hoy en adelante.");
      return;
    }
    const value: UtilityItem = {
      title:
        kind === "medications"
          ? [form.name.trim(), form.dose.trim()].filter(Boolean).join(" · ")
          : form.name.trim(),
      detail:
        kind === "caregivers"
          ? `${form.role} · ${form.phone}`
          : [
              kind === "appointments" || kind === "tasks" ? form.date : "",
              form.time,
              form.notes.trim(),
            ]
              .filter(Boolean)
              .join(" · "),
      meta: kind === "caregivers" ? form.notes.trim() || "Contacto local" : "Programado",
      date: form.date,
      time: form.time,
      notes: form.notes.trim(),
      dose: form.dose,
      role: form.role,
      phone: form.phone,
    };
    setItems((current) =>
      editing === null
        ? [...current, value]
        : current.map((item, index) => (index === editing ? value : item)),
    );
    setOpen(false);
    notify("Información guardada");
  };
  return (
    <div className="screen">
      <TopBar
        title={content.title}
        subtitle={kind === "caregivers" ? "TU EQUIPO DE CUIDADO" : (profile?.name ?? "ICNU")}
        back={back}
        summary={false}
      />
      <main className="content">
        <section className="utility-intro">
          <span>
            <Icon name={content.icon} />
          </span>
          <div>
            <h1>
              {kind === "caregivers"
                ? `${items.length} personas para apoyarte`
                : `${items.length} ${content.title.toLowerCase()} registrados`}
            </h1>
            <p>
              {kind === "caregivers"
                ? "Un directorio local de las personas que cuidan contigo."
                : `${done.filter((i) => i < items.length).length} marcados como completados.`}
            </p>
          </div>
        </section>
        <div className="utility-list">
          {items.map((item, index) => (
            <div className="utility-row" key={index}>
              {kind === "caregivers" ? (
                <span className="type-icon">
                  <Icon name="users" size={18} />
                </span>
              ) : (
                <button
                  className={`utility-check ${done.includes(index) ? "done" : ""}`}
                  aria-pressed={done.includes(index)}
                  aria-label={`${done.includes(index) ? "Desmarcar" : "Completar"} ${item.title}`}
                  onClick={() =>
                    setDone((current) =>
                      current.includes(index)
                        ? current.filter((i) => i !== index)
                        : [...current, index],
                    )
                  }
                >
                  <Icon name="check" size={17} />
                </button>
              )}
              <span>
                <strong>{item.title}</strong>
                <small>{item.detail}</small>
                <em>{kind !== "caregivers" && done.includes(index) ? "Completado" : item.meta}</em>
                {kind === "caregivers" && item.phone && (
                  <a className="call-link" href={`tel:${item.phone.replace(/[^+\d]/g, "")}`}>
                    Llamar
                  </a>
                )}
              </span>
              <button
                className="utility-edit"
                aria-label={`Editar ${item.title}`}
                onClick={() => edit(index)}
              >
                <Icon name="edit" size={18} />
              </button>
              <button
                className="utility-edit"
                aria-label={`Eliminar ${item.title}`}
                onClick={() => setDeleting(index)}
              >
                <Icon name="close" size={18} />
              </button>
            </div>
          ))}
          {!items.length && (
            <p className="empty-message">Todavía no hay registros. Agrega el primero.</p>
          )}
        </div>
        <Button
          icon="plus"
          onClick={() => {
            setForm(empty);
            setEditing(null);
            setError("");
            setOpen(true);
          }}
        >
          {content.action}
        </Button>
        {kind === "caregivers" && (
          <p className="helper">
            Los roles son descriptivos en esta demo. Agregar un contacto no envía invitaciones.
          </p>
        )}
      </main>
      {open && (
        <ActionSheet
          title={editing === null ? content.action : "Editar registro"}
          subtitle="ORGANIZAR ES CUIDAR"
          close={() => setOpen(false)}
        >
          <div className="sheet-form">
            <FormField
              label={kind === "medications" ? "Medicamento *" : "Nombre *"}
              value={form.name}
              onChange={update("name")}
            />
            {kind === "medications" && (
              <FormField
                label="Dosis"
                value={form.dose}
                onChange={update("dose")}
                placeholder="Ej. 50 mg"
              />
            )}
            {(kind === "appointments" || kind === "tasks") && (
              <FormField
                label="Fecha *"
                type="date"
                min={editing === null ? todayISO() : undefined}
                value={form.date}
                onChange={update("date")}
              />
            )}
            {kind !== "caregivers" && (
              <FormField
                label="Horario *"
                type="time"
                value={form.time}
                onChange={update("time")}
              />
            )}
            {kind === "caregivers" && (
              <>
                <FormField
                  label="Teléfono *"
                  type="tel"
                  value={form.phone}
                  onChange={update("phone")}
                />
                <label className="form-field">
                  <span>Rol</span>
                  <select value={form.role} onChange={(e) => update("role")(e.target.value)}>
                    {["Cuidador principal", "Familiar", "Administrador", "Cuidador externo"].map(
                      (r) => (
                        <option key={r}>{r}</option>
                      ),
                    )}
                  </select>
                </label>
              </>
            )}
            <FormField
              label={kind === "appointments" ? "Lugar e indicaciones" : "Notas e indicaciones"}
              value={form.notes}
              onChange={update("notes")}
            />
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <Button icon="check" onClick={save}>
              Guardar
            </Button>
          </div>
        </ActionSheet>
      )}
      {deleting !== null && (
        <ConfirmDialog
          title={`¿Eliminar ${items[deleting].title}?`}
          message="Se eliminará este registro de tu dispositivo."
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            setItems((current) => current.filter((_, i) => i !== deleting));
            setDone((current) =>
              current.filter((i) => i !== deleting).map((i) => (i > deleting ? i - 1 : i)),
            );
            setDeleting(null);
            notify("Registro eliminado");
          }}
        />
      )}
    </div>
  );
}
