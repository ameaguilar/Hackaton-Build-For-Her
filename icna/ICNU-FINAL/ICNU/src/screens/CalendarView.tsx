import { useState } from "react";
import { moodLabel } from "../lib/moods";
import { Icon } from "../components/Icon";
import { IconButton } from "../components/IconButton";
import { todayISO, longDateLabel } from "../lib/dates";
import type { LogEntry } from "../data/seed";

/**
 * Calendario real: los puntos de cada día salen de las entradas de la bitácora.
 * Muestra el mes anterior, el actual y el siguiente.
 */
export function CalendarView({
  entries,
  openDay,
}: {
  entries: LogEntry[];
  openDay: (iso: string, label: string) => void;
}) {
  const now = new Date();
  const months = [-1, 0, 1].map((offset) => {
    const first = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    return {
      year: first.getFullYear(),
      index: first.getMonth(),
      label: new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" }).format(first),
      days: new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate(),
      // Lunes primero.
      offset: (first.getDay() + 6) % 7,
    };
  });
  const [monthIndex, setMonthIndex] = useState(1);
  const month = months[monthIndex];
  const monthDays = Array.from({ length: month.days }, (_, index) => index + 1);
  const today = todayISO();

  const entriesByDate = new Map<string, LogEntry[]>();
  for (const entry of entries) {
    const date = entry.date ?? today;
    const group = entriesByDate.get(date) ?? [];
    entriesByDate.set(date, [...group, entry]);
  }

  // Resumen del mes visible.
  const monthPrefix = `${month.year}-${String(month.index + 1).padStart(2, "0")}-`;
  const monthDates = [...entriesByDate.keys()].filter((date) => date.startsWith(monthPrefix));
  const monthEntriesForDates = monthDates.flatMap((date) => entriesByDate.get(date) ?? []);
  const moods = monthEntriesForDates
    .filter((entry) => entry.category === "Ánimo")
    .map((entry) => moodLabel(entry.mood));
  const commonMood =
    [...new Set(moods)].sort(
      (a, b) =>
        moods.filter((item) => item === b).length - moods.filter((item) => item === a).length,
    )[0] ?? "Sin datos";
  const incidents = monthEntriesForDates.filter((entry) => entry.category === "Incidente").length;

  // Racha: días consecutivos registrados terminando hoy (o ayer si hoy no hay).
  let streak = 0;
  let cursor = new Date();
  if (!entriesByDate.has(todayISO())) cursor.setDate(cursor.getDate() - 1);
  for (;;) {
    const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(
      cursor.getDate(),
    ).padStart(2, "0")}`;
    if (entriesByDate.has(iso)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else break;
  }

  // Semana visible en la tira superior: lunes a lunes del día de hoy.
  const monday = new Date();
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate(),
    ).padStart(2, "0")}`;
    return {
      iso,
      short: ["L", "M", "X", "J", "V", "S", "D"][index],
      number: date.getDate(),
      count: (entriesByDate.get(iso) ?? []).length,
    };
  });

  return (
    <>
      <div className="week-strip">
        {weekDays.map((day) => (
          <button
            key={day.iso}
            className={`week-day ${day.iso === today ? "today" : ""}`}
            onClick={() => openDay(day.iso, longDateLabel(day.iso))}
          >
            <small>{day.short}</small>
            <strong>{String(day.number).padStart(2, "0")}</strong>
            {day.iso === today && <span />}
          </button>
        ))}
      </div>
      <div className="card calendar-card">
        <div className="calendar-title">
          <IconButton
            icon="chevron"
            label="Mes anterior"
            onClick={() => setMonthIndex((current) => Math.max(0, current - 1))}
          />
          <strong>{month.label}</strong>
          <IconButton
            icon="chevron"
            label="Mes siguiente"
            onClick={() => setMonthIndex((current) => Math.min(2, current + 1))}
          />
        </div>
        <div className="weekday-row">
          {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="month-grid">
          {Array.from({ length: month.offset }, (_, index) => (
            <span className="calendar-blank" key={`blank-${index}`} />
          ))}
          {monthDays.map((day) => {
            const iso = `${month.year}-${String(month.index + 1).padStart(2, "0")}-${String(
              day,
            ).padStart(2, "0")}`;
            const dayEntries = entriesByDate.get(iso) ?? [];
            const complete = dayEntries.length > 0;
            const incident = dayEntries.some((entry) => entry.category === "Incidente");
            const isPast = iso < today;
            return (
              <button
                key={day}
                aria-label={`${longDateLabel(iso)}, ${dayEntries.length} registros`}
                onClick={() => openDay(iso, longDateLabel(iso))}
                className={`calendar-day ${complete ? "complete" : isPast ? "empty" : "empty"} ${
                  iso === today ? "selected" : ""
                }`}
              >
                <span>{day}</span>
                <small className="calendar-record-indicator">
                  {complete ? dayEntries.length : ""}
                </small>
                {incident && <i className="incident-dot" />}
                {!complete && !isPast && (
                  <i className="appointment-mark" aria-hidden="true">
                    ·
                  </i>
                )}
              </button>
            );
          })}
        </div>
        <div className="legend">
          <span>
            <i className="legend-fill" /> Registro
          </span>
          <span>
            <i className="legend-dash" /> Sin registro
          </span>
          <span>
            <i className="legend-alert" /> Incidente
          </span>
          <span>
            <i className="legend-support" /> Hoy
          </span>
        </div>
      </div>
      <div className="month-summary">
        <h3>Resumen de {month.label}</h3>
        <div className="summary-grid">
          <div>
            <strong>{monthDates.length}</strong>
            <small>días registrados</small>
          </div>
          <div>
            <strong>{commonMood}</strong>
            <small>ánimo frecuente</small>
          </div>
          <div>
            <strong>{incidents}</strong>
            <small>incidentes</small>
          </div>
          <div>
            <strong>{monthEntriesForDates.length}</strong>
            <small>registros</small>
          </div>
        </div>
        <div className="streak">
          <span
            style={{
              width: `${Math.min(100, Math.round((streak / 14) * 100))}%`,
            }}
          />
          <small>{streak > 0 ? `Racha de ${streak} día(s)` : "Registra hoy para empezar"}</small>
        </div>
      </div>
    </>
  );
}
