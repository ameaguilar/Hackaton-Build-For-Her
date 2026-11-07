import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import type { Screen } from "../types";

export default function Welcome({ navigate }: { navigate: (screen: Screen) => void }) {
  return (
    <div className="screen welcome-screen">
      <main className="content welcome-content">
        <section className="welcome-hero">
          <span className="welcome-mark" aria-hidden="true">
            <Icon name="heart" size={34} />
          </span>
          <span className="eyebrow">CUIDADOS</span>
          <h1>Bienvenido</h1>
          <p>
            Coordina el cuidado de tus seres queridos en un solo lugar: bitácora, medicamentos,
            citas, necesidades y apoyo familiar.
          </p>
        </section>

        <section className="welcome-highlights" aria-label="Qué puedes hacer">
          <div className="welcome-item">
            <span className="type-icon">
              <Icon name="book" size={20} />
            </span>
            <div>
              <strong>Registra el día a día</strong>
              <small>Notas, rutinas y estado de ánimo en la bitácora.</small>
            </div>
          </div>
          <div className="welcome-item">
            <span className="type-icon peach">
              <Icon name="users" size={20} />
            </span>
            <div>
              <strong>Coordina a la familia</strong>
              <small>Comparte necesidades y mantén a todos informados.</small>
            </div>
          </div>
          <div className="welcome-item">
            <span className="type-icon">
              <Icon name="calendar" size={20} />
            </span>
            <div>
              <strong>Organiza citas y medicamentos</strong>
              <small>Resúmenes claros antes de ver a tus pacientes.</small>
            </div>
          </div>
        </section>

        <div className="welcome-actions">
          <Button icon="chevron" onClick={() => navigate("account-create")}>
            Crear mi cuenta
          </Button>
          <p className="welcome-note">
            Tus datos se guardan en este dispositivo. Podrás agregar pacientes después.
          </p>
        </div>
      </main>
    </div>
  );
}
