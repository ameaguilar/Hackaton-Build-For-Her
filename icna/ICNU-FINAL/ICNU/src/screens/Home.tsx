import { useEffect } from "react";
import { usePersistentState } from "../lib/storage";
import { patientProfiles, resolvePatient, type StoredPatient } from "../data/patients";
import { isEconomicNeed, migrateNeed, seedLogEntries, seedNeeds } from "../data/seed";
import { todayISO, nowTime } from "../lib/dates";
import { seedUtilityItems } from "./UtilityScreen";
import { MedicalGraphic } from "../components/MedicalGraphic";
import { Avatar } from "../components/Avatar";
import { Icon, type IconName } from "../components/Icon";
import { TopBar } from "../components/TopBar";
import { Button } from "../components/Button";
import type { AccountProfile, PatientId, Screen } from "../types";

export default function Home({
  navigate,
  notify,
  patient,
  selectPatient,
}: {
  navigate: (s: Screen) => void;
  notify: (message: string) => void;
  patient: PatientId;
  selectPatient: (p: PatientId) => void;
}) {
  const [account] = usePersistentState<AccountProfile | null>("account:profile", null);
  const [extra] = usePersistentState<StoredPatient[]>("patients:extra", []);
  const [hidden] = usePersistentState<string[]>("patients:hidden", []);
  const [entries] = usePersistentState("log:entries", seedLogEntries);
  const [meds] = usePersistentState("utility:items:medications", seedUtilityItems("medications"));
  const [medDone] = usePersistentState<number[]>("utility:completed:medications", []);
  const [appointments] = usePersistentState(
    "utility:items:appointments",
    seedUtilityItems("appointments"),
  );
  const [tasks] = usePersistentState("utility:items:tasks", seedUtilityItems("tasks"));
  const [done, setDone] = usePersistentState<number[]>("utility:completed:tasks", []);
  const [needs] = usePersistentState("needs:items", seedNeeds);
  const chips = [
    ...Object.keys(patientProfiles),
    ...extra.filter((p) => !(p.id in patientProfiles)).map((p) => p.id),
  ]
    .filter((id) => !hidden.includes(id))
    .map((id) => ({
      id,
      ...resolvePatient(
        id,
        extra.find((p) => p.id === id),
      )!,
    }));
  useEffect(() => {
    if (!chips.some((p) => p.id === patient)) selectPatient(chips[0]?.id ?? "");
  }, [patient, hidden, extra]);
  const selected = chips.find((p) => p.id === patient);
  const openNeeds = needs
    .map(migrateNeed)
    .filter((n) => !n.claimed && (!isEconomicNeed(n) || (n.raised ?? 0) < (n.goal ?? 0))).length;
  const pendingMeds = meds
    .map((item, index) => ({ ...item, index }))
    .filter((m) => !medDone.includes(m.index));
  const nextMed =
    pendingMeds
      .slice()
      .sort((a, b) =>
        (a.time ?? a.detail.slice(0, 5)).localeCompare(b.time ?? b.detail.slice(0, 5)),
      )
      .find((m) => (m.time ?? m.detail.slice(0, 5)) >= nowTime()) ?? pendingMeds[0];
  const nextAppointment = appointments
    .filter((a) => a.date && a.date >= todayISO())
    .sort(
      (a, b) => a.date!.localeCompare(b.date!) || (a.time ?? "").localeCompare(b.time ?? ""),
    )[0];
  const dailyTasks = tasks
    .map((task, i) => ({ task, i }))
    .filter(({ task }) => !task.date || task.date === todayISO());
  const completedTasks = dailyTasks.filter(({ i }) => done.includes(i)).length;
  const todayEntries = entries.filter((e) => (e.date ?? todayISO()) === todayISO());
  const cards: { screen: Screen; icon: IconName; title: string }[] = [
    { screen: "log", icon: "book", title: "Bitácora" },
    { screen: "medications", icon: "pill", title: "Medicamentos" },
    { screen: "appointments", icon: "calendar", title: "Citas" },
    { screen: "family", icon: "users", title: "Familia" },
  ];
  return (
    <div className="screen dashboard-screen">
      <TopBar
        title="icnu"
        subtitle="TU CÍRCULO DE CUIDADO"
        onProfile={() => navigate("admin")}
        onSummary={() => navigate("weekly-summary")}
      />
      <main className="content home-content dashboard-content">
        <header className="dashboard-heading">
          <div>
            <p className="dashboard-date">
              {new Intl.DateTimeFormat("es-MX", {
                weekday: "long",
                day: "numeric",
                month: "long",
              }).format(new Date())}
            </p>
            <h1>Hola, {account?.name.split(" ")[0] || "bienvenido"}.</h1>
            <p>El cuidado de quienes quieres, más cerca.</p>
          </div>
          <button
            className="desktop-add btn btn-primary"
            aria-label="Registrar cuidado"
            onClick={() => navigate("log-entry")}
          >
            <Icon name="plus" size={18} /> <span>Registrar cuidado</span>
          </button>
        </header>
        <section className="patient-context" aria-label="Seleccionar paciente">
          <div className="section-heading">
            <h2>Persona a tu cuidado</h2>
            <button className="text-button" onClick={() => navigate("patient-create")}>
              Administrar <Icon name="arrowUpRight" size={14} />
            </button>
          </div>
          <div className="patient-switch">
            {chips.map((p) => (
              <button
                className={`patient-chip ${p.id === patient ? "selected" : ""}`}
                key={p.id}
                aria-pressed={p.id === patient}
                onClick={() => selectPatient(p.id)}
              >
                <Avatar person={p.avatar} initials={p.initials} size="sm" />
                <span>{p.name.split(" ")[0]}</span>
                {p.id === patient && <Icon name="check" size={13} />}
              </button>
            ))}
            <button
              className="add-patient"
              aria-label="Agregar paciente"
              onClick={() => navigate("patient-create")}
            >
              <Icon name="plus" size={18} />
            </button>
          </div>
        </section>
        {selected ? (
          <div className="dashboard-grid">
            <section className="appointment-feature" aria-label="Próxima cita">
              {/cardio|coraz/i.test(nextAppointment?.title ?? "") ? (
                <div className="cardiology-art">
                  <img
                    src="/images/cardiology-heart.webp"
                    alt="Ilustración anatómica del corazón"
                    fetchPriority="high"
                  />
                </div>
              ) : (
                <MedicalGraphic />
              )}
              <div className="appointment-copy">
                <span className="eyebrow">
                  {nextAppointment ? "PRÓXIMA CONSULTA" : "SU AGENDA DE CUIDADO"}
                </span>
                <h2>{nextAppointment?.title ?? "Un cuidado bien organizado."}</h2>
                {nextAppointment ? (
                  <>
                    <div className="appointment-details">
                      <p>
                        <Icon name="calendar" size={14} />
                        {new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long" }).format(
                          new Date(nextAppointment.date + "T12:00:00"),
                        )}
                      </p>
                      <p>
                        <Icon name="clock" size={14} />
                        {nextAppointment.time || "Horario pendiente"}
                      </p>
                    </div>
                    <p className="appointment-place">
                      {nextAppointment.notes || "Consulta los detalles de la cita"}
                    </p>
                  </>
                ) : (
                  <p>Programa consultas y ten cada detalle a la mano.</p>
                )}
                <button onClick={() => navigate("appointments")}>
                  {nextAppointment ? "Ver cita" : "Programar cita"}
                  <Icon name="arrowUpRight" size={17} />
                </button>
              </div>
            </section>
            <section className="care-overview">
              <div className="section-heading">
                <h2>El cuidado de hoy</h2>
                <span>Hoy</span>
              </div>
              <div className="overview-metrics">
                <button onClick={() => navigate("medications")}>
                  <Icon name="pill" size={18} />
                  <strong>
                    {medDone.filter((i) => i < meds.length).length}
                    <span>/{meds.length}</span>
                  </strong>
                  <small>Tomas marcadas</small>
                </button>
                <button onClick={() => navigate("tasks")}>
                  <Icon name="check" size={18} />
                  <strong>
                    {completedTasks}
                    <span>/{dailyTasks.length}</span>
                  </strong>
                  <small>Tareas listas</small>
                </button>
                <button onClick={() => navigate("log")}>
                  <Icon name="book" size={18} />
                  <strong>{todayEntries.length}</strong>
                  <small>Registros</small>
                </button>
              </div>
            </section>
            <section className="quick-access card">
              <div className="section-heading">
                <h2>¿Qué necesitas hacer?</h2>
              </div>
              <div className="quick-grid">
                {cards.map((c) => (
                  <button className="quick-card" key={c.screen} onClick={() => navigate(c.screen)}>
                    <span className={`quick-icon service-icon service-icon-${c.icon}`}>
                      <Icon name={c.icon} size={22} />
                    </span>
                    <strong>{c.title}</strong>
                  </button>
                ))}
              </div>
            </section>
            <section className="patient-overview card">
              <div className="section-heading">
                <h2>Perfil de cuidado</h2>
                <button className="text-button" onClick={() => navigate("profile")}>
                  Ver perfil <Icon name="arrowUpRight" size={14} />
                </button>
              </div>
              <button className="selected-patient-banner" onClick={() => navigate("profile")}>
                <Avatar person={selected.avatar} initials={selected.initials} size="lg" />
                <span>
                  <strong>{selected.name}</strong>
                  <em>
                    {selected.age === null ? "Edad sin registrar" : selected.age + " años"} · Perfil
                    del paciente
                  </em>
                </span>
                <Icon name="chevron" size={18} />
              </button>
              <div className="patient-medical-line">
                <Icon name="shield" size={16} />
                <p>{selected.conditions || "Información médica por completar"}</p>
              </div>
            </section>
            {nextMed && (
              <section className="next-medication card">
                <span className="medical-icon">
                  <Icon name="pill" size={22} />
                </span>
                <div>
                  <small>PRÓXIMA TOMA PENDIENTE</small>
                  <h3>{nextMed.title}</h3>
                  <p>{nextMed.detail}</p>
                </div>
                <button aria-label="Ver medicamentos" onClick={() => navigate("medications")}>
                  <Icon name="arrowUpRight" size={19} />
                </button>
              </section>
            )}
            <section className="routine-section">
              <div className="section-heading">
                <h2>Rutina de hoy</h2>
                <button className="text-button" onClick={() => navigate("tasks")}>
                  Ver tareas <Icon name="arrowUpRight" size={14} />
                </button>
              </div>
              <div className="card task-list">
                {dailyTasks.slice(0, 4).map(({ task, i }) => (
                  <div className={`routine-row ${done.includes(i) ? "is-complete" : ""}`} key={i}>
                    <span className="routine-time">
                      {task.time ||
                        (/^\d{2}:\d{2}/.test(task.detail) ? task.detail.slice(0, 5) : "—")}
                    </span>
                    <div>
                      <strong>{task.title}</strong>
                      <small>
                        {task.notes ||
                          task.detail.split(" · ").slice(1).join(" · ") ||
                          "Actividad de cuidado"}
                      </small>
                    </div>
                    <button
                      className={`check-button ${done.includes(i) ? "done" : ""}`}
                      aria-label={`${done.includes(i) ? "Desmarcar" : "Completar"} ${task.title}`}
                      aria-pressed={done.includes(i)}
                      onClick={() => {
                        setDone((current) =>
                          current.includes(i) ? current.filter((v) => v !== i) : [...current, i],
                        );
                        notify("Tarea actualizada");
                      }}
                    >
                      <Icon name="check" size={16} />
                    </button>
                  </div>
                ))}
                {!dailyTasks.length && (
                  <div className="empty-message">
                    <Icon name="calendar" />
                    <p>No hay tareas para hoy.</p>
                    <button className="text-button" onClick={() => navigate("tasks")}>
                      Crear la primera
                    </button>
                  </div>
                )}
              </div>
            </section>
            <section className="support-feature">
              <span className="support-badge">
                <Icon name="users" size={25} />
              </span>
              <div>
                <span className="eyebrow">CÍRCULO DE APOYO</span>
                <h2>Cuidar es un trabajo en equipo.</h2>
                <p>
                  {openNeeds
                    ? `${openNeeds} necesidades de apoyo pendientes.`
                    : "Organiza el apoyo de quienes están cerca."}
                </p>
                <button onClick={() => navigate("needs")}>
                  Ver necesidades <Icon name="arrowUpRight" size={16} />
                </button>
              </div>
            </section>
            <button className="weekly-dashboard-link" onClick={() => navigate("weekly-summary")}>
              <span className="medical-icon">
                <Icon name="activity" size={22} />
              </span>
              <span>
                <strong>Resumen semanal</strong>
                <small>Una mirada completa a su cuidado</small>
              </span>
              <Icon name="chevron" size={18} />
            </button>
            <button className="emergency-dashboard-link" onClick={() => navigate("emergency")}>
              <Icon name="phone" size={19} />
              <span>Contactos de emergencia</span>
              <Icon name="arrowUpRight" size={16} />
            </button>
          </div>
        ) : (
          <section className="form-section">
            <Icon name="users" size={28} />
            <h2>Comienza tu círculo</h2>
            <p>Registra a la primera persona que vas a cuidar.</p>
            <Button icon="plus" onClick={() => navigate("patient-create")}>
              Registrar paciente
            </Button>
          </section>
        )}
      </main>
    </div>
  );
}
