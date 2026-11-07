import { useState } from "react";
import { Button } from "../components/Button";
import { ActionSheet } from "../components/ActionSheet";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { FormField } from "../components/FormField";
import { IconButton } from "../components/IconButton";
import { Icon } from "../components/Icon";
import { TopBar } from "../components/TopBar";
import { CalendarView } from "./CalendarView";
import { NeedsView } from "./NeedsView";
import { seedLogEntries, seedNeeds, type LogEntry, type NeedItem } from "../data/seed";
import { usePersistentState } from "../lib/storage";
import type { Screen } from "../types";

export function Logbook({
  initialSegment = "calendar",
  navigate,
  notify,
}: {
  initialSegment?: "calendar" | "needs";
  navigate: (screen: Screen) => void;
  notify: (message: string) => void;
}) {
  const [segment, setSegment] = useState<"calendar" | "needs">(initialSegment);
  const [sheet, setSheet] = useState(false);
  const [sheetMode, setSheetMode] = useState<"timeline" | "entry" | "need">("timeline");
  const [selectedDay, setSelectedDay] = useState(18);
  const [category, setCategory] = useState("Alimentación");
  const [entryNote, setEntryNote] = useState("");
  const [needTitle, setNeedTitle] = useState("");
  const [tipo, setTipo] = useState("Acompañar a una cita");
  const [mood, setMood] = useState("☺");
  const [urgency, setUrgency] = useState("Media");
  const [entryTime, setEntryTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  });
  const [needDate, setNeedDate] = useState(() => {
    const today = new Date();
    const plusWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const y = plusWeek.getFullYear();
    const m = String(plusWeek.getMonth() + 1).padStart(2, "0");
    const d = String(plusWeek.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });
  const [entries, setEntries] = usePersistentState<LogEntry[]>("log:entries", seedLogEntries);
  const [needs, setNeeds] = usePersistentState<NeedItem[]>("needs:items", seedNeeds);
  const [deletingEntry, setDeletingEntry] = useState<number | null>(null);
  const openNeeds = needs.filter(
    (need) => !need.claimed && (need.kind !== "economica" || (need.raised ?? 0) < (need.goal ?? 0)),
  ).length;
  const openTimeline = (day: number) => {
    setSelectedDay(day);
    setSheetMode("timeline");
    setSheet(true);
  };
  const openCreate = (mode: "entry" | "need") => {
    setSheetMode(mode);
    setSheet(true);
  };
  return (
    <div className="screen">
      <TopBar
        title="Bitácora"
        subtitle="DON JOSÉ"
        onProfile={() => navigate("admin")}
        onPoints={() => navigate("points")}
      />
      <main className="content log-content">
        <div className="segment">
          <button
            className={segment === "calendar" ? "active" : ""}
            onClick={() => setSegment("calendar")}
          >
            Calendario
          </button>
          <button
            className={segment === "needs" ? "active" : ""}
            onClick={() => setSegment("needs")}
          >
            Necesidades <span>{openNeeds}</span>
          </button>
        </div>
        {segment === "calendar" ? (
          <CalendarView openDay={openTimeline} />
        ) : (
          <NeedsView notify={notify} />
        )}
      </main>
      <Button
        className="floating-action"
        icon="plus"
        onClick={() => openCreate(segment === "calendar" ? "entry" : "need")}
      >
        {segment === "calendar" ? "Nueva entrada" : "Pedir apoyo"}
      </Button>
      {sheet && sheetMode === "timeline" && (
        <ActionSheet
          title={`${selectedDay} de noviembre de 2026`}
          subtitle="BITÁCORA DEL DÍA"
          close={() => setSheet(false)}
        >
          <div className="timeline">
            {entries.map((entry, index) => (
              <div className="timeline-item" key={`${entry.time}-${index}`}>
                <span className="timeline-time">{entry.time}</span>
                <span
                  className={`timeline-icon ${
                    entry.category === "Medicamento"
                      ? "meds"
                      : entry.category === "Ánimo"
                        ? "mood"
                        : "food"
                  }`}
                >
                  {entry.category === "Medicamento" ? (
                    <Icon name="pill" size={17} />
                  ) : entry.category === "Ánimo" ? (
                    entry.mood
                  ) : (
                    "☕"
                  )}
                </span>
                <div>
                  <strong>{entry.category}</strong>
                  <p>{entry.note}</p>
                  <small>Registró Ana · {entry.mood}</small>
                </div>
                <IconButton
                  icon="close"
                  label={`Eliminar entrada de ${entry.time}`}
                  onClick={() => setDeletingEntry(index)}
                />
              </div>
            ))}
          </div>
          <Button icon="plus" onClick={() => setSheetMode("entry")}>
            Agregar otra entrada
          </Button>
        </ActionSheet>
      )}
      {sheet && sheetMode === "entry" && (
        <ActionSheet title="Nueva entrada" subtitle="BITÁCORA" close={() => setSheet(false)}>
          <div className="sheet-form">
            <label className="form-field">
              <span>Categoría</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                {["Alimentación", "Medicamento", "Ánimo", "Sueño", "Higiene", "Incidente"].map(
                  (item) => (
                    <option key={item}>{item}</option>
                  ),
                )}
              </select>
            </label>
            <FormField label="Hora" type="time" value={entryTime} onChange={setEntryTime} />
            <FormField
              label="Nota breve"
              value={entryNote}
              onChange={setEntryNote}
              placeholder="¿Qué ocurrió?"
            />
            <div className="mood-picker">
              <span>Estado de ánimo</span>
              <div>
                {["☺", "🙂", "•‿•", "•︵•"].map((item) => (
                  <button
                    className={mood === item ? "selected" : ""}
                    key={item}
                    onClick={() => setMood(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <label className="toggle-row">
              <span>
                <strong>Importante para la familia</strong>
                <small>Se enviará una notificación</small>
              </span>
              <input type="checkbox" />
            </label>
            <Button
              icon="check"
              onClick={() => {
                if (!entryNote.trim()) {
                  notify("Escribe una nota antes de guardar");
                  return;
                }
                setEntries((current) =>
                  [...current, { time: entryTime, category, note: entryNote.trim(), mood }].sort(
                    (a, b) => a.time.localeCompare(b.time),
                  ),
                );
                setSheetMode("timeline");
                setEntryNote("");
                notify(`${category} guardado en la bitácora`);
              }}
            >
              Guardar entrada
            </Button>
          </div>
        </ActionSheet>
      )}
      {sheet && sheetMode === "need" && (
        <ActionSheet title="Pedir apoyo" subtitle="NUEVA NECESIDAD" close={() => setSheet(false)}>
          <div className="sheet-form">
            <label className="form-field">
              <span>Tipo de apoyo</span>
              <select value={tipo} onChange={(event) => setTipo(event.target.value)}>
                {[
                  "Acompañar a una cita",
                  "Apoyo económico",
                  "Comprar o llevar algo",
                  "Traslado",
                  "Visita o compañía",
                  "Otro",
                ].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <FormField
              label="¿Qué se necesita?"
              value={needTitle}
              onChange={setNeedTitle}
              placeholder="Describe el apoyo"
            />
            <FormField label="Fecha" type="date" value={needDate} onChange={setNeedDate} />
            <div className="priority-picker">
              <span>Urgencia</span>
              {[
                ["Informativa", "info"],
                ["Media", "mid"],
                ["Alta", "high"],
              ].map(([label, tone]) => (
                <button
                  key={label}
                  className={`priority ${tone} ${urgency === label ? "selected" : ""}`}
                  onClick={() => setUrgency(label)}
                >
                  {label}
                </button>
              ))}
            </div>
            <Button
              icon="bell"
              onClick={() => {
                if (!needTitle.trim()) {
                  notify("Describe el apoyo que se necesita");
                  return;
                }
                const kind: NeedItem["kind"] = tipo === "Apoyo económico" ? "economica" : "cita";
                const [y, m, d] = needDate.split("-").map(Number);
                const label = new Intl.DateTimeFormat("es-MX", {
                  day: "numeric",
                  month: "long",
                }).format(new Date(y, (m ?? 1) - 1, d ?? 1));
                setNeeds((current) => [
                  ...current,
                  {
                    id: `need-${Date.now()}`,
                    kind,
                    title: needTitle.trim(),
                    detail: `${label} · ${tipo}`,
                    priority: (urgency as NeedItem["priority"]) ?? "Media",
                    claimed: false,
                    ...(kind === "economica" ? { raised: 0, goal: 2000, contributions: [] } : {}),
                  },
                ]);
                setSheet(false);
                setNeedTitle("");
                notify("Necesidad publicada y familia notificada");
              }}
            >
              Publicar necesidad
            </Button>
          </div>
        </ActionSheet>
      )}
      {deletingEntry !== null && entries[deletingEntry] && (
        <ConfirmDialog
          title={`¿Eliminar la entrada de ${entries[deletingEntry].time}?`}
          message={`«${entries[deletingEntry].note}» se borrará de la bitácora. Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar entrada"
          onConfirm={() => {
            setEntries((current) => current.filter((_, index) => index !== deletingEntry));
            setDeletingEntry(null);
            notify("Entrada eliminada");
          }}
          onCancel={() => setDeletingEntry(null)}
        />
      )}
    </div>
  );
}
