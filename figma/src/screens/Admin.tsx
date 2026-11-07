import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Icon } from "../components/Icon";
import { TopBar } from "../components/TopBar";
import { resetAllData } from "../lib/storage";
import { useState } from "react";
import type { Screen } from "../types";

function Admin({
  back,
  navigate,
  notify,
}: {
  back: () => void;
  navigate: (screen: Screen) => void;
  notify: (message: string) => void;
}) {
  const [confirmReset, setConfirmReset] = useState(false);
  return (
    <div className="screen">
      <TopBar title="Mi perfil" subtitle="ADMINISTRADORA PRINCIPAL" back={back} points={false} />
      <main className="content">
        <section className="admin-hero">
          <Avatar person="ana" size="xl" />
          <div>
            <span className="role-badge">Admin</span>
            <h1>Ana Martínez</h1>
            <p>Cuidadora principal · 3 pacientes asignados</p>
          </div>
        </section>
        <div className="admin-stats">
          <div>
            <strong>3</strong>
            <small>pacientes</small>
          </div>
          <div>
            <strong>4</strong>
            <small>familiares</small>
          </div>
          <div>
            <strong>12</strong>
            <small>días de racha</small>
          </div>
        </div>
        <section>
          <div className="section-heading">
            <h2>Administración</h2>
          </div>
          <div className="admin-menu">
            <button onClick={() => navigate("patient-create")}>
              <span className="type-icon">
                <Icon name="users" size={20} />
              </span>
              <span>
                <strong>Pacientes</strong>
                <small>Perfiles, datos médicos y accesos</small>
              </span>
              <Icon name="chevron" size={18} />
            </button>
            <button onClick={() => navigate("caregivers")}>
              <span className="type-icon peach">
                <Icon name="userPlus" size={20} />
              </span>
              <span>
                <strong>Cuidadores y familia</strong>
                <small>Roles, permisos e invitaciones</small>
              </span>
              <Icon name="chevron" size={18} />
            </button>
            <button onClick={() => navigate("points")}>
              <span className="type-icon">
                <Icon name="star" size={20} />
              </span>
              <span>
                <strong>Plan y puntos</strong>
                <small>Saldo, recompensas y suscripción</small>
              </span>
              <Icon name="chevron" size={18} />
            </button>
          </div>
        </section>
        <section>
          <div className="section-heading">
            <h2>Preferencias</h2>
          </div>
          <label className="toggle-row">
            <span>
              <strong>Alertas familiares</strong>
              <small>Avisos de necesidades e incidentes</small>
            </span>
            <input type="checkbox" defaultChecked onChange={() => notify("Preferencia actualizada")} />
          </label>
          <label className="toggle-row">
            <span>
              <strong>Resumen diario</strong>
              <small>Recibirlo cada noche</small>
            </span>
            <input type="checkbox" defaultChecked onChange={() => notify("Preferencia actualizada")} />
          </label>
        </section>
        <Button variant="secondary" icon="edit" onClick={() => notify("Datos de Ana listos para editar")}>
          Editar mis datos
        </Button>
        <Button variant="danger" icon="alert" onClick={() => setConfirmReset(true)}>
          Reiniciar datos de la demo
        </Button>
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 8 }}>
          Borra todo lo guardado en este dispositivo (entradas, notas, pacientes nuevos…) y vuelve
          a los datos de ejemplo iniciales.
        </p>
      </main>
      {confirmReset && (
        <ConfirmDialog
          title="¿Reiniciar todos los datos?"
          message="Se borrarán los registros guardados en este dispositivo y la app volverá a los datos de ejemplo. No afecta a otros dispositivos."
          confirmLabel="Reiniciar demo"
          onConfirm={() => {
            resetAllData();
            window.location.reload();
          }}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </div>
  );
}

export default Admin;
