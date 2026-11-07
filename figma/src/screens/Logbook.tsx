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
import {
  ECONOMIC_NEED,
  NEED_TYPES,
  isEconomicNeed,
  migrateNeed,
  seedLogEntries,
  seedNeeds,
  type LogEntry,
  type NeedItem,
} from "../data/seed";
import { longDateLabel, nowTime, plusDaysISO, todayISO } from "../lib/dates";
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
  const [selectedDate, setSelectedDate] = useState<{ iso: string; label: string }>(() => ({
    iso: todayISO(),
    label: longDateLabel(todayISO()),
  }));
  const [category, setCategory] = useState("Alimentación");
  const [entryNote, setEntryNote] = useState("");
  const [needTitle, setNeedTitle] = useState("");
  const [tipo, setTipo] = useState("Acompañar a una cita");
  const [mood, setMood] = useState("☺");
  const [urgency, setUrgency] = useState("Media");
  const [entryTime, setEntryTime] = useState(() => nowTime());
  const [needDate, setNeedDate] = useState(() => plusDaysISO(7));
  // Migración: entradas guardadas antes de tener fecha se consideran de hoy.
  const [rawEntries, setEntries] = usePersistentState<LogEntry[]>("log:entries", seedLogEntries);
  const entries = rawEntries.map((entry) => ({ ...entry, date: entry.date ?? todayISO() }));
  const [rawNeeds, setNeeds] = usePersistentState<NeedItem[]>("needs:items", seedNeeds);
  const needs = rawNeeds.map(migrateNeed);
  const [deletingEntry, setDeletingEntry] = useState<number | null>(null);
  const [editingEntry, setEditingEntry] = useState<number | null>(null);
  const openNeeds = needs.filter(
    (need) => !need.claimed && (!isEconomicNeed(need) || (need.raised ?? 0) < (need.goal ?? 0)),
  ).length;
  const resetEntryForm = () => {
    setEditingEntry(null);
    setCategory("Alimentación");
    setEntryTime(nowTime());
    setEntryNote("");
    setMood("☺");
  };
  const closeSheet = () => {
    setSheet(false);
    setEditingEntry(null);
  };
  const openTimeline = (iso: string, label: string) => {
    setSelectedDate({ iso, label });
    setSheetMode("timeline");
    setSheet(true);
  };
  const openCreate = (mode: "entry" | "need") => {
    if (mode === "entry") resetEntryForm();
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
          <CalendarView entries={entries} openDay={openTimeline} />
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
        <ActionSheet title={selectedDate.label} subtitle="BITÁCORA DEL DÍA" close={closeSheet}>

          <div className="timeline">
            {entries.filter((entry) => entry.date === selectedDate.iso).length === 0 && (
              <p style={{ color: "var(--muted)", margin: "4px 0 12px" }}>
                No hay registros para este día. Puedes agregar el primero abajo.
              </p>
            )}
            {entries
              .map((entry, globalIndex) => ({ entry, globalIndex }))
              .filter(({ entry }) => entry.date === selectedDate.iso)
              .map(({ entry, globalIndex }) => (
              <div className="timeline-item" key={`${entry.time}-${globalIndex}`}>
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
                <div className="timeline-actions">
                  <IconButton
                    icon="edit"
                    label={`Editar entrada de ${entry.time}`}
                    onClick={() => {
                      setEditingEntry(globalIndex);
                      setCategory(entry.category);
                      setEntryTime(entry.time);
                      setEntryNote(entry.note);
                      setMood(entry.mood);
                      setSheetMode("entry");
                    }}
                  />
                  <IconButton
                    icon="close"
                    label={`Eliminar entrada de ${entry.time}`}
                    onClick={() => setDeletingEntry(globalIndex)}
                  />
                </div>
              </div>
            ))}
          </div>
          <Button
            icon="plus"
            onClick={() => {
              resetEntryForm();
              setSheetMode("entry");
            }}
          >
            Agregar otra entrada
          </Button>
        </ActionSheet>
      )}
      {sheet && sheetMode === "entry" && (
        <ActionSheet
          title={editingEntry === null ? "Nueva entrada" : "Editar entrada"}
          subtitle="BITÁCORA"
          close={closeSheet}
        >
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
                if (editingEntry !== null) {
                  const original = entries[editingEntry];
                  setEntries((current) =>
                    current
                      .map((item, index) =>
                        index === editingEntry
                          ? {
                              ...item,
                              time: entryTime,
                              category,
                              note: entryNote.trim(),
                              mood,
                              date: original?.date ?? selectedDate.iso ?? todayISO(),
                            }
                          : item,
                      )
                      .sort(
                        (a, b) =>
                          (a.date ?? "").localeCompare(b.date ?? "") ||
                          a.time.localeCompare(b.time),
                      ),
                  );
                  setEditingEntry(null);
                  setSheetMode("timeline");
                  setEntryNote("");
                  notify("Entrada actualizada");
                  return;
                }
                setEntries((current) =>
                  [
                    ...current,
                    {
                      time: entryTime,
                      category,
                      note: entryNote.trim(),
                      mood,
                      date: selectedDate.iso ?? todayISO(),
                    },
                  ].sort(
                    (a, b) =>
                      (a.date ?? "").localeCompare(b.date ?? "") || a.time.localeCompare(b.time),
                  ),
                );
                setSheetMode("timeline");
                setEntryNote("");
                setEditingEntry(null);
                notify(`${category} guardado en la bitácora`);
              }}
            >
              {editingEntry === null ? "Guardar entrada" : "Guardar cambios"}
            </Button>
          </div>
        </ActionSheet>
      )}
      {sheet && sheetMode === "need" && (
        <ActionSheet title="Pedir apoyo" subtitle="NUEVA NECESIDAD" close={closeSheet}>
          <div className="sheet-form">
            <label className="form-field">
              <span>Tipo de apoyo</span>
              <select value={tipo} onChange={(event) => setTipo(event.target.value)}>
                {NEED_TYPES.map((item) => (
                  <option key={item.label}>{item.label}</option>
                ))}
              </select>
            </label>
            <FormField
              label="¿Qué se necesita?"
              value={needTitle}
              onChange={setNeedTitle}
              placeholder="Describe el apoyo"
            />
            <FormField
              label="Fecha"
              type="date"
              value={needDate}
              onChange={setNeedDate}
              min={todayISO()}
            />
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
                const label = longDateLabel(needDate);
                setNeeds((current) => [
                  ...current,
                  {
                    id: `need-${Date.now()}`,
                    type: tipo,
                    title: needTitle.trim(),
                    detail: `${label} · ${tipo}`,
                    priority: (urgency as NeedItem["priority"]) ?? "Media",
                    claimed: false,
                    ...(tipo === ECONOMIC_NEED
                      ? { raised: 0, goal: 2000, contributions: [] }
                      : {}),
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
