import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { TopBar } from "../components/TopBar";
import type { Screen } from "../types";

function Family({ back, navigate }: { back: () => void; navigate: (screen: Screen) => void }) {
  return (
    <div className="screen">
      <TopBar
        title="Familia"
        subtitle="TODOS CERCA"
        back={back}
        points={false}
        onProfile={() => navigate("admin")}
      />
      <main className="content">
        <section className="daily-summary">
          <div className="summary-avatar">
            <Avatar person="jose" size="lg" />
            <span>☺</span>
          </div>
          <div>
            <span className="eyebrow">RESUMEN DE HOY</span>
            <h2>Un día tranquilo</h2>
            <p>Don José comió bien, tomó sus medicamentos y estuvo de buen ánimo.</p>
          </div>
        </section>
        <div className="family-stats">
          <div>
            <Icon name="pill" />
            <strong>2 de 3</strong>
            <small>medicamentos</small>
          </div>
          <div>
            <Icon name="heart" />
            <strong>Tranquilo</strong>
            <small>ánimo</small>
          </div>
          <div>
            <Icon name="alert" />
            <strong>0</strong>
            <small>incidentes</small>
          </div>
        </div>
        <button className="need-summary family-need" onClick={() => navigate("needs")}>
          <span className="need-count">2</span>
          <span>
            <strong>Necesidades abiertas</strong>
            <small>Tu ayuda puede hacer la diferencia</small>
          </span>
          <Icon name="chevron" size={18} />
        </button>
        <section>
          <div className="section-heading">
            <h2>Novedades</h2>
            <button className="text-button" onClick={() => navigate("log")}>
              Ver bitácora
            </button>
          </div>
          <button className="feed-item" onClick={() => navigate("log")}>
            <Avatar person="ana" size="sm" />
            <div>
              <p>
                <strong>Ana</strong> registró el desayuno y los medicamentos.
              </p>
              <small>Hace 2 horas</small>
            </div>
            <span className="feed-icon">
              <Icon name="check" size={17} />
            </span>
          </button>
          <button className="feed-item" onClick={() => navigate("needs")}>
            <Avatar person="luis" size="sm" />
            <div>
              <p>
                <strong>Luis</strong> aportó $500 para los medicamentos del mes.
              </p>
              <small>Hace 4 horas</small>
            </div>
            <span className="feed-icon peach">
              <Icon name="wallet" size={17} />
            </span>
          </button>
        </section>
        <Button variant="secondary" icon="userPlus" onClick={() => navigate("caregivers")}>
          Agregar nuevo cuidador
        </Button>
      </main>
    </div>
  );
}

export default Family;
