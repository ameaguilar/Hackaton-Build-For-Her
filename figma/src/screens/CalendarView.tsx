import { useState } from "react";
import { Icon } from "../components/Icon";
import { IconButton } from "../components/IconButton";

const calendarMonths = [
  { label: "Octubre 2026", days: 31, offset: 3 },
  { label: "Noviembre 2026", days: 30, offset: 6 },
  { label: "Diciembre 2026", days: 31, offset: 1 },
];

export function CalendarView({ openDay }: { openDay: (day: number) => void }) {
  const [monthIndex, setMonthIndex] = useState(1);
  const month = calendarMonths[monthIndex];
  const monthDays = Array.from({ length: month.days }, (_, index) => index + 1);
  return (
    <>
      <div className="week-strip">
        {["L 16", "M 17", "X 18", "J 19", "V 20"].map((day, i) => (
          <button
            key={day}
            className={`week-day ${i === 2 ? "today" : ""}`}
            onClick={() => openDay(16 + i)}
          >
            <small>{day.split(" ")[0]}</small>
            <strong>{day.split(" ")[1]}</strong>
            {i === 2 && <span />}
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
            const complete =
              monthIndex === 1 && [2, 3, 4, 6, 9, 10, 11, 12, 13, 16, 17, 18].includes(day);
            const incident = monthIndex === 1 && [4, 12].includes(day);
            const appointment = monthIndex === 1 && [8, 19].includes(day);
            const support = monthIndex === 1 && [20, 26].includes(day);
            return (
              <button
                key={day}
                onClick={() => openDay(day)}
                className={`calendar-day ${
                  complete ? "complete" : "empty"
                } ${monthIndex === 1 && day === 18 ? "selected" : ""}`}
              >
                <span>{day}</span>
                <small>
                  {monthIndex === 1 && [3, 9, 10, 16, 17, 18].includes(day)
                    ? "⌣"
                    : monthIndex === 1 && day === 12
                      ? "•︵•"
                      : ""}
                </small>
                {incident && <i className="incident-dot" />}
                {appointment && <i className="appointment-mark">+</i>}
                {support && <i className="support-mark" />}
              </button>
            );
          })}
        </div>
        <div className="legend">
          <span>
            <i className="legend-fill" /> Registro completo
          </span>
          <span>
            <i className="legend-dash" /> Sin registro
          </span>
          <span>
            <i className="legend-alert" /> Incidente
          </span>
          <span>
            <i className="legend-support" /> Apoyo familiar
          </span>
        </div>
      </div>
      <div className="month-summary">
        <h3>Resumen del mes</h3>
        <div className="summary-grid">
          <div>
            <strong>14</strong>
            <small>días registrados</small>
          </div>
          <div>
            <strong>☺</strong>
            <small>ánimo tranquilo</small>
          </div>
          <div>
            <strong>2</strong>
            <small>incidentes</small>
          </div>
          <div>
            <strong>2</strong>
            <small>citas</small>
          </div>
        </div>
        <div className="streak">
          <span style={{ width: "62%" }} />
          <small>Racha de 7 días</small>
        </div>
      </div>
    </>
  );
}
