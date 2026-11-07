import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { TopBar } from "../components/TopBar";
import { resolvePatient, type StoredPatient } from "../data/patients";
import { usePersistentState } from "../lib/storage";
import type { PatientId, Screen } from "../types";

function Profile({
  back,
  navigate,
  notify,
  patient,
}: {
  back: () => void;
  navigate: (screen: Screen) => void;
  notify: (message: string) => void;
  patient: PatientId;
}) {
  const [completed, setCompleted] = usePersistentState<number[]>(`profile:completed:${patient}`, [
    0,
    1,
  ]);
  const [extraPatients] = usePersistentState<StoredPatient[]>("patients:extra", []);
  const profile = resolvePatient(
    patient,
    extraPatients.find((stored) => stored.id === patient),
  );
  if (!profile) {
    return (
      <div className="screen">
        <TopBar title="Perfil del paciente" back={back} points={false} />
        <main className="content profile-content">
          <div className="covered">
            <span className="covered-art">
              <Icon name="alert" />
            </span>
            <div>
              <strong>Paciente no encontrado</strong>
              <small>Regresa y selecciona otro paciente del listado.</small>
            </div>
          </div>
        </main>
      </div>
    );
  }
  return (
    <div className="screen">
      <TopBar title="Perfil del paciente" back={back} points={false} />
      <main className="content profile-content">
        <section className="profile-hero">
          <Avatar person={profile.avatar} size="xl" initials={profile.initials} />
          <div>
            <h1>{profile.name}</h1>
            <p>
              {profile.age ?? "Edad no indicada"} años · {profile.short}
            </p>
            <button className="text-button" onClick={() => navigate("patient-create")}>
              <Icon name="edit" size={15} /> Cambiar avatar
            </button>
          </div>
        </section>
        <div className="profile-actions">
          <Button variant="secondary" icon="edit" onClick={() => navigate("patient-create")}>
            Editar
          </Button>
          <Button icon="plus" onClick={() => navigate("tasks")}>
            Tareas nuevas
          </Button>
        </div>
        <section>
          <div className="section-heading">
            <h2>Horarios de hoy</h2>
            <span className="status-pill">
              {completed.filter((index) => index < profile.schedule.length).length} de{" "}
              {profile.schedule.length}
            </span>
          </div>
          {profile.schedule.length > 0 ? (
            <div className="card schedule">
              {profile.schedule.map((item, i) => (
                <button
                  className="schedule-row"
                  key={item}
                  onClick={() =>
                    setCompleted((current) =>
                      current.includes(i)
                        ? current.filter((value) => value !== i)
                        : [...current, i],
                    )
                  }
                >
                  <span className={`schedule-check ${completed.includes(i) ? "done" : ""}`}>
                    <Icon name="check" size={15} />
                  </span>
                  <span>{item}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="card schedule">
              <p style={{ margin: "8px 4px", color: "var(--muted)" }}>
                Aún no hay horarios registrados para este paciente. Se pueden agregar desde
                Medicamentos y Tareas.
              </p>
            </div>
          )}
        </section>
        <section className="important-card">
          <div className="section-heading">
            <h2>Datos importantes</h2>
            <Icon name="alert" size={20} />
          </div>
          <dl>
            <div>
              <dt>Alergias</dt>
              <dd>{profile.allergies}</dd>
            </div>
            <div>
              <dt>Condiciones</dt>
              <dd>{profile.conditions}</dd>
            </div>
            <div>
              <dt>Tipo de sangre</dt>
              <dd>{profile.blood}</dd>
            </div>
          </dl>
        </section>
        <section className="card doctor-card">
          <span className="doctor-icon">
            <Icon name="stethoscope" />
          </span>
          <div>
            <small>MÉDICO DE CABECERA</small>
            <h3>{profile.doctor}</h3>
            <p>
              {profile.specialty} · {profile.phoneLabel}
            </p>
            <div>
              <Button
                variant="secondary"
                icon="phone"
                onClick={() => {
                  if (profile.phone) {
                    window.location.href = `tel:${profile.phone}`;
                  } else {
                    notify("Este paciente no tiene teléfono de médico registrado");
                  }
                }}
              >
                Llamar
              </Button>
              <Button
                variant="ghost"
                icon="bell"
                onClick={() => notify(`${profile.doctor} fue notificado`)}
              >
                Notificar
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Profile;
