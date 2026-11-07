import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { IconButton } from "../components/IconButton";

function Emergency({ back, notify }: { back: () => void; notify: (message: string) => void }) {
  return (
    <div className="screen emergency-screen">
      <header className="emergency-top">
        <IconButton icon="close" label="Cerrar" onClick={back} />
        <strong>Emergencia</strong>
        <span />
      </header>
      <main className="content">
        <section className="emergency-call">
          <span className="emergency-pulse">
            <Icon name="phone" size={34} />
          </span>
          <h1>¿Necesitas ayuda inmediata?</h1>
          <p>Llama a emergencias y mantén esta información a la mano.</p>
          <Button
            variant="danger"
            icon="phone"
            onClick={() => {
              window.location.href = "tel:911";
            }}
          >
            Llamar al 911
          </Button>
        </section>
        <section className="critical-card">
          <div className="section-heading">
            <h2>Datos médicos críticos</h2>
            <Icon name="alert" />
          </div>
          <div>
            <span>Alergia severa</span>
            <strong>Penicilina</strong>
          </div>
          <div>
            <span>Medicamentos</span>
            <strong>Losartán · Metformina</strong>
          </div>
          <div>
            <span>Tipo de sangre</span>
            <strong>O positivo</strong>
          </div>
        </section>
        <section>
          <h2 className="section-title">Contactos prioritarios</h2>
          <div className="card contacts">
            <div>
              <Avatar person="ana" size="sm" />
              <span>
                <strong>Ana Martínez</strong>
                <small>Cuidadora principal</small>
              </span>
              <IconButton
                icon="phone"
                label="Llamar a Ana"
                onClick={() => {
                  window.location.href = "tel:+525511112222";
                }}
              />
            </div>
            <div className="divider" />
            <div>
              <Avatar person="luis" size="sm" />
              <span>
                <strong>Luis Ramírez</strong>
                <small>Hijo</small>
              </span>
              <IconButton
                icon="phone"
                label="Llamar a Luis"
                onClick={() => {
                  window.location.href = "tel:+525533334444";
                }}
              />
            </div>
            <div className="divider" />
            <div>
              <span className="doctor-contact">
                <Icon name="stethoscope" size={20} />
              </span>
              <span>
                <strong>Dra. Laura Méndez</strong>
                <small>Médico de cabecera · 55 1234 5678</small>
              </span>
              <IconButton
                icon="phone"
                label="Llamar a la doctora"
                onClick={() => {
                  window.location.href = "tel:+525512345678";
                }}
              />
            </div>
          </div>
        </section>
        <Button variant="primary" icon="bell" onClick={() => notify("Alerta enviada a toda la familia")}>
          Avisar a toda la familia
        </Button>
        <p className="emergency-note">
          <Icon name="heart" size={16} /> La ayuda de emergencia siempre es gratuita.
        </p>
      </main>
    </div>
  );
}

export default Emergency;
