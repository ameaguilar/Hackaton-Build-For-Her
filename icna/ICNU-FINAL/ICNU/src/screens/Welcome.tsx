import { MedicalGraphic } from "../components/MedicalGraphic";
import { Brand } from "../components/Brand";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import type { Screen, AccountProfile } from "../types";

export default function Welcome({
  navigate,
  account,
  resume,
}: {
  navigate: (screen: Screen) => void;
  account: AccountProfile | null;
  resume: () => void;
}) {
  return (
    <div className="screen welcome-screen">
      <main className="content welcome-content">
        <section className="welcome-hero">
          <div className="welcome-object">
            <MedicalGraphic kind="shield" />
          </div>
          <div className="welcome-hero-copy">
            <div className="welcome-brand">
              <Brand />
            </div>
            <span className="eyebrow">UN CÍRCULO DE APOYO</span>
            <h1>
              El cuidado
              <br />
              nos conecta.
            </h1>
            <p>
              Cuidar se siente mejor en compañía. Organiza el día a día de quienes quieres, con
              calma y claridad.
            </p>
          </div>
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
          <Button icon="chevron" onClick={() => (account ? resume() : navigate("account-create"))}>
            {account ? `Continuar como ${account.name.split(" ")[0]}` : "Comenzar mi círculo"}
          </Button>
          <p className="welcome-note">
            Demo local · Tu perfil y tus registros se guardan en este navegador.
          </p>
        </div>
      </main>
    </div>
  );
}
