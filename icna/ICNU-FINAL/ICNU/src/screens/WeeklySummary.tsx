import { useState } from "react";
import { moodLabel } from "../lib/moods";
import { TopBar } from "../components/TopBar";
import { Icon } from "../components/Icon";
import { Button } from "../components/Button";
import { usePersistentState } from "../lib/storage";
import { useCurrentPatient } from "../lib/useCurrentPatient";
import { todayISO } from "../lib/dates";
import { seedLogEntries, seedNeeds, migrateNeed, isEconomicNeed } from "../data/seed";
import { seedUtilityItems } from "./UtilityScreen";
import type { Screen } from "../types";

function shiftDate(iso: string, days: number) {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
const dateLabel = (iso: string) =>
  new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short" }).format(
    new Date(`${iso}T12:00:00`),
  );

function DayActivity({ date, count }: { date: string; count: number }) {
  const [tasks] = usePersistentState<number[]>(`utility:completed:tasks:${date}`, []);
  const [meds] = usePersistentState<number[]>(`utility:completed:medications:${date}`, []);
  return (
    <div className="weekly-day">
      <div>
        <strong>
          {new Intl.DateTimeFormat("es-MX", { weekday: "short" }).format(
            new Date(`${date}T12:00:00`),
          )}
        </strong>
        <small>{dateLabel(date)}</small>
      </div>
      <div className="weekly-day-count">
        <strong>{count}</strong>
        <small>registros</small>
      </div>
      <div className="weekly-day-count">
        <strong>{tasks.length}</strong>
        <small>tareas</small>
      </div>
      <div className="weekly-day-count">
        <strong>{meds.length}</strong>
        <small>tomas</small>
      </div>
    </div>
  );
}

export default function WeeklySummary({ navigate }: { navigate: (s: Screen) => void }) {
  const patient = useCurrentPatient();
  const [offset, setOffset] = useState(0);
  const [entries] = usePersistentState("log:entries", seedLogEntries);
  const [rawNeeds] = usePersistentState("needs:items", seedNeeds);
  const [appointments] = usePersistentState(
    "utility:items:appointments",
    seedUtilityItems("appointments"),
  );
  const today = todayISO();
  const end = shiftDate(today, -offset * 7);
  const start = shiftDate(end, -6);
  const days = Array.from({ length: 7 }, (_, i) => shiftDate(start, i));
  const weekly = entries.filter((e) => (e.date ?? today) >= start && (e.date ?? today) <= end);
  const activeDays = new Set(weekly.map((e) => e.date ?? today)).size;
  const categories = [...new Set(weekly.map((e) => e.category))]
    .map((name) => ({ name, count: weekly.filter((e) => e.category === name).length }))
    .sort((a, b) => b.count - a.count);
  const moods = weekly
    .filter((e) => e.category === "Ánimo" && e.mood)
    .map((e) => ({ ...e, mood: moodLabel(e.mood) }));
  const moodCounts = [...new Set(moods.map((e) => e.mood))]
    .map((mood) => ({ mood, count: moods.filter((e) => e.mood === mood).length }))
    .sort((a, b) => b.count - a.count);
  const openNeeds = rawNeeds
    .map(migrateNeed)
    .filter((n) => !n.claimed && (!isEconomicNeed(n) || (n.raised ?? 0) < (n.goal ?? 0)));
  const upcoming = appointments
    .filter((a) => a.date && a.date >= today && a.date <= shiftDate(today, 6))
    .sort((a, b) => a.date!.localeCompare(b.date!) || (a.time ?? "").localeCompare(b.time ?? ""));
  return (
    <div className="screen">
      <TopBar
        title="Resumen semanal"
        subtitle={patient?.name ?? "TU CÍRCULO DE CUIDADO"}
        summary={false}
        onProfile={() => navigate("admin")}
      />
      <main className="content weekly-content">
        <section className="weekly-hero">
          <span className="eyebrow">UNA MIRADA A SU CUIDADO</span>
          <h1>Su semana, en resumen.</h1>
          <p>
            Lo que registraste para {patient?.name ?? "la persona que cuidas"}, reunido en un solo
            lugar.
          </p>
          <div className="weekly-period">
            <button aria-label="Ver semana anterior" onClick={() => setOffset((v) => v + 1)}>
              <Icon name="chevron" size={18} />
            </button>
            <div>
              <strong>
                {dateLabel(start)} — {dateLabel(end)} {end.slice(0, 4)}
              </strong>
              <small>
                {offset === 0
                  ? "Últimos 7 días · incluye hoy"
                  : `Hace ${offset} ${offset === 1 ? "semana" : "semanas"}`}
              </small>
            </div>
            <button
              aria-label="Ver semana siguiente"
              disabled={offset === 0}
              onClick={() => setOffset((v) => Math.max(0, v - 1))}
            >
              <Icon name="chevron" size={18} />
            </button>
          </div>
        </section>
        <section className="weekly-stats" aria-label="Indicadores de la semana">
          <div className="card">
            <Icon name="book" />
            <strong>{weekly.length}</strong>
            <small>Registros de cuidado</small>
          </div>
          <div className="card">
            <Icon name="calendar" />
            <strong>
              {activeDays}
              <span> / 7</span>
            </strong>
            <small>Días con registros</small>
          </div>
        </section>
        {!weekly.length && (
          <section className="form-section">
            <h2>Una semana por contar</h2>
            <p className="helper">
              No hay entradas de bitácora en este periodo. Los registros que agregues aparecerán
              aquí.
            </p>
            <Button icon="plus" onClick={() => navigate("log")}>
              Ir a la bitácora
            </Button>
          </section>
        )}
        <section className="form-section">
          <h2>Actividad por día</h2>
          <p className="helper">
            Registros de bitácora y marcas de tareas y tomas guardadas para cada fecha.
          </p>
          <div>
            {days.map((date) => (
              <DayActivity
                key={date}
                date={date}
                count={weekly.filter((e) => (e.date ?? today) === date).length}
              />
            ))}
          </div>
        </section>
        {categories.length > 0 && (
          <section className="form-section">
            <h2>Lo que registraste</h2>
            {categories.map((c) => (
              <div className="weekly-category" key={c.name}>
                <div>
                  <strong>{c.name}</strong>
                  <span>{c.count}</span>
                </div>
                <div className="weekly-bar">
                  <span style={{ width: `${(c.count / weekly.length) * 100}%` }} />
                </div>
              </div>
            ))}
          </section>
        )}
        <section className="form-section">
          <h2>Ánimo registrado</h2>
          {moodCounts.length ? (
            <div className="weekly-moods">
              {moodCounts.map((m) => (
                <div key={m.mood}>
                  <span>{m.mood}</span>
                  <small>
                    {m.count} {m.count === 1 ? "registro" : "registros"}
                  </small>
                </div>
              ))}
            </div>
          ) : (
            <p className="helper">No hay registros de la categoría Ánimo en este periodo.</p>
          )}
          <p className="helper">
            Este resumen refleja tus anotaciones; no realiza una evaluación médica.
          </p>
        </section>
        <section className="form-section">
          <span className="eyebrow">PARA ORGANIZARTE AHORA</span>
          <h2>Necesidades abiertas · {openNeeds.length}</h2>
          <p className="helper">
            Estado actual del apoyo pendiente, independientemente del periodo seleccionado.
          </p>
          {openNeeds.slice(0, 3).map((n) => (
            <div className="weekly-open-need" key={n.id}>
              <Icon name="heart" size={18} />
              <span>{n.title}</span>
            </div>
          ))}
          {!openNeeds.length && <p className="helper">No hay solicitudes de apoyo pendientes.</p>}
          <button className="text-button" onClick={() => navigate("needs")}>
            Ver necesidades →
          </button>
        </section>
        <section className="form-section">
          <h2>Citas de los próximos 7 días</h2>
          {upcoming.length ? (
            upcoming.map((a, i) => (
              <div className="routine-row" key={i}>
                <Icon name="calendar" />
                <div>
                  <strong>{a.title}</strong>
                  <small>{a.detail}</small>
                </div>
              </div>
            ))
          ) : (
            <p className="helper">No hay citas con fecha registrada para los próximos 7 días.</p>
          )}
          <button className="text-button" onClick={() => navigate("appointments")}>
            Administrar citas →
          </button>
        </section>
        <p className="helper">
          Resumen del paciente seleccionado. Los datos se guardan únicamente en este navegador.
        </p>
      </main>
    </div>
  );
}
