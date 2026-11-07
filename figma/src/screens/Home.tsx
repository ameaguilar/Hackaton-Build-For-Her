import { usePersistentState } from "../lib/storage";
import type { StoredPatient } from "../data/patients";
import { isEconomicNeed, migrateNeed, seedLogEntries, seedNeeds } from "../data/seed";
import { todayISO, nowTime } from "../lib/dates";
import { seedUtilityItems } from "./UtilityScreen";
import { Avatar } from "../components/Avatar";
import { Icon } from "../components/Icon";
import { TopBar } from "../components/TopBar";
import type { AccountProfile, PatientId, Screen } from "../types";

function initialsOf(name: string): string {
  const parts = name
    .replace(/^(Don|Doña)\s+/i, "")
    .trim()
    .split(/\s+/);
  const text = (parts[0]?.[0] ?? "P") + (parts.length > 1 ? parts[parts.length - 1][0] : "");
  return text.toUpperCase() || "P";
}

function Home({
  navigate,
  notify,
  patient,
  selectPatient,
}: {
  navigate: (s: Screen) => void;
  notify: (message: string) => void;
  patient: PatientId;
  selectPatient: (patient: PatientId) => void;
}) {
  const [account] = usePersistentState<AccountProfile | null>("account:profile", null);
  const firstName = account?.name.trim().split(/\s+/)[0] || "Ana";
  const [extraPatients] = usePersistentState<StoredPatient[]>("patients:extra", []);
  const [logEntries] = usePersistentState("log:entries", seedLogEntries);
  const [medItems] = usePersistentState("utility:items:medications", seedUtilityItems("medications"));
  const [appointmentItems] = usePersistentState(
    "utility:items:appointments",
    seedUtilityItems("appointments"),
  );
  const [needs] = usePersistentState("needs:items", seedNeeds);
  const today = todayISO();
  const registrosHoy = logEntries.filter((entry) => (entry.date ?? today) === today).length;
  const openNeeds = needs.map(migrateNeed).filter(
    (need) => !need.claimed && (!isEconomicNeed(need) || (need.raised ?? 0) < (need.goal ?? 0)),
  ).length;
  const nextMed = medItems.find((item) => item.detail.slice(0, 5) >= nowTime())?.detail.slice(0, 5);
  const nextAppointment = appointmentItems[0]?.detail.split(" · ").slice(0, 2).join(" · ");
  const patientName =
    extraPatients.find((p) => p.id === patient)?.short ??
    extraPatients.find((p) => p.id === patient)?.name ??
    (patient === "jose"
      ? "Don José"
      : patient === "elena"
        ? "Doña Elena"
        : patient === "roberto"
          ? "Don Roberto"
          : "Paciente");
  const chips: {
    id: PatientId;
    label: string;
    avatar: "jose" | "maria" | "roberto";
    initials?: string;
  }[] = [
    { id: "jose", label: "José", avatar: "jose" },
    { id: "elena", label: "Elena", avatar: "maria" },
    { id: "roberto", label: "Roberto", avatar: "roberto" },
    ...extraPatients.map((p) => ({
      id: p.id,
      label: (p.short || p.name).replace(/^(Don|Doña)\s+/i, ""),
      avatar: "jose" as const,
      initials: initialsOf(p.name),
    })),
  ];
  const [doneTasks, setDoneTasks] = usePersistentState<number[]>("home:doneTasks", []);
  const toggleTask = (index: number) => {
    setDoneTasks((current) =>
      current.includes(index) ? current.filter((task) => task !== index) : [...current, index],
    );
    notify("Tarea actualizada");
  };
  return (
    <div className="screen">
      <TopBar
        title={patientName}
        subtitle={`Buenos días, ${firstName}`}
        onProfile={() => navigate("admin")}
        onPoints={() => navigate("points")}
      />
      <main className="content home-content">
        <section className="patient-switch" aria-label="Cambiar paciente">
          {chips.map((chip) => (
            <button
              key={chip.id}
              className={`patient-chip ${patient === chip.id ? "selected" : ""}`}
              onClick={() => {
                selectPatient(chip.id);
                navigate("profile");
              }}
            >
              <Avatar person={chip.avatar} size="sm" initials={chip.initials} />
              <span>{chip.label}</span>
            </button>
          ))}
          <button
            className="add-patient"
            aria-label="Agregar paciente"
            onClick={() => navigate("patient-create")}
          >
            <Icon name="plus" size={18} />
          </button>
        </section>

        <section className="greeting">
          <div>
            <span className="eyebrow">MIÉRCOLES, 18 NOV 2026</span>
            <h1>¿Cómo estuvo hoy?</h1>
          </div>
          <span className="status-pill">
            <span className="status-dot" /> Todo en orden
          </span>
        </section>

        <section className="quick-grid">
          <button className="quick-card mint" onClick={() => navigate("log")}>
            <span className="quick-icon">
              <Icon name="book" />
            </span>
            <strong>Bitácora</strong>
            <small>{registrosHoy} registro{registrosHoy === 1 ? "" : "s"} hoy</small>
            <Icon name="chevron" size={18} />
          </button>
          <button className="quick-card yellow" onClick={() => navigate("medications")}>
            <span className="quick-icon">
              <Icon name="pill" />
            </span>
            <strong>Medicamentos</strong>
            <small>{nextMed ? `Próximo ${nextMed}` : "Todo tomado hoy"}</small>
            <Icon name="chevron" size={18} />
          </button>
          <button className="quick-card peach" onClick={() => navigate("appointments")}>
            <span className="quick-icon">
              <Icon name="calendar" />
            </span>
            <strong>Citas</strong>
            <small>{nextAppointment ?? "Sin citas programadas"}</small>
            <Icon name="chevron" size={18} />
          </button>
          <button className="quick-card blue" onClick={() => navigate("family")}>
            <span className="quick-icon">
              <Icon name="users" />
            </span>
            <strong>Familia</strong>
            <small>2 novedades</small>
            <Icon name="chevron" size={18} />
          </button>
        </section>

        <section>
          <div className="section-heading">
            <h2>Próximas tareas</h2>
            <button className="text-button" onClick={() => navigate("tasks")}>
              Ver todas
            </button>
          </div>
          <div className="card task-list">
            <div className="task-row">
              <span className="time">12:30</span>
              <span className="task-icon pill">
                <Icon name="pill" size={18} />
              </span>
              <div>
                <strong>Losartán · 50 mg</strong>
                <small>Después de comer</small>
              </div>
              <button
                className={`check-button ${doneTasks.includes(0) ? "done" : ""}`}
                aria-label="Completar"
                onClick={() => toggleTask(0)}
              >
                <Icon name="check" size={17} />
              </button>
            </div>
            <div className="divider" />
            <div className="task-row">
              <span className="time">16:00</span>
              <span className="task-icon heart">
                <Icon name="heart" size={18} />
              </span>
              <div>
                <strong>Caminata suave</strong>
                <small>15 minutos</small>
              </div>
              <button
                className={`check-button ${doneTasks.includes(1) ? "done" : ""}`}
                aria-label="Completar"
                onClick={() => toggleTask(1)}
              >
                <Icon name="check" size={17} />
              </button>
            </div>
          </div>
        </section>

        <button className="need-summary" onClick={() => navigate("needs")}>
          <span className="need-avatars">
            <Avatar person="ana" size="sm" />
            <Avatar person="luis" size="sm" />
          </span>
          <span>
            <strong>{openNeeds} necesidad{openNeeds === 1 ? "" : "es"} abierta{openNeeds === 1 ? "" : "s"}</strong>
            <small>La familia puede apoyar</small>
          </span>
          <Icon name="chevron" size={18} />
        </button>
      </main>
      <button className="emergency-fab" onClick={() => navigate("emergency")}>
        <Icon name="phone" size={20} />
        <span>EMERGENCIA</span>
      </button>
    </div>
  );
}

export default Home;
