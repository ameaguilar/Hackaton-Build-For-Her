import { useState } from "react";
import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { FormField } from "../components/FormField";
import { TopBar } from "../components/TopBar";
import { resetAllData, usePersistentState } from "../lib/storage";
import type { AccountProfile, Screen } from "../types";

export default function Admin({
  back,
  navigate,
  notify,
  logout,
}: {
  back: () => void;
  navigate: (screen: Screen) => void;
  notify: (message: string) => void;
  logout: () => void;
}) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [account, setAccount] = usePersistentState<AccountProfile | null>("account:profile", null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<AccountProfile>(account ?? { name: "" });
  const [error, setError] = useState("");
  const save = () => {
    if (!draft.name.trim() || (draft.phone ?? "").replace(/\D/g, "").length !== 10) {
      setError("Escribe tu nombre y un teléfono de 10 dígitos.");
      return;
    }
    if (draft.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) {
      setError("Revisa el correo electrónico.");
      return;
    }
    setAccount({ ...draft, name: draft.name.trim() });
    setEditing(false);
    setError("");
    notify("Tu perfil se actualizó");
  };
  return (
    <div className="screen">
      <TopBar title="Mi perfil" subtitle="QUIEN CUIDA TAMBIÉN IMPORTA" back={back} summary={false} />
      <main className="content">
        <section className="admin-hero">
          <Avatar
            initials={(account?.name ?? "")
              .split(" ")
              .map((s) => s[0])
              .slice(0, 2)
              .join("")}
            size="xl"
          />
          <div>
            <span className="role-badge">Tu círculo comienza contigo</span>
            <h1>{account?.name}</h1>
            <p>{account?.role}</p>
          </div>
        </section>
        {editing ? (
          <section className="form-section">
            <h2>Tu información</h2>
            <FormField
              label="Nombre *"
              value={draft.name}
              onChange={(name) => setDraft({ ...draft, name })}
            />
            <FormField
              label="Teléfono *"
              type="tel"
              value={draft.phone ?? ""}
              onChange={(phone) => setDraft({ ...draft, phone })}
            />
            <FormField
              label="Correo"
              type="email"
              value={draft.email ?? ""}
              onChange={(email) => setDraft({ ...draft, email })}
            />
            <label className="form-field">
              <span>Rol</span>
              <select
                value={draft.role}
                onChange={(e) => setDraft({ ...draft, role: e.target.value })}
              >
                {["Cuidador principal", "Familiar", "Administrador", "Cuidador externo"].map(
                  (role) => (
                    <option key={role}>{role}</option>
                  ),
                )}
              </select>
            </label>
            <FormField
              label="Notas sobre ti"
              value={draft.notes ?? ""}
              onChange={(notes) => setDraft({ ...draft, notes })}
              placeholder="Disponibilidad, experiencia o algo que quieras recordar"
            />
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <Button icon="check" onClick={save}>
              Guardar mis datos
            </Button>
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
          </section>
        ) : (
          <>
            <section className="card account-details">
              <span className="eyebrow">DATOS DE CONTACTO</span>
              <h3>{account?.phone || "Teléfono sin registrar"}</h3>
              <p>{account?.email || "Sin correo registrado"}</p>
              {account?.notes && <p>{account.notes}</p>}
            </section>
            <Button
              variant="secondary"
              icon="edit"
              onClick={() => {
                setDraft(account ?? { name: "" });
                setEditing(true);
              }}
            >
              Editar mis datos
            </Button>
          </>
        )}
        <div className="admin-menu">
          <button onClick={() => navigate("patient-create")}>
            <span>01</span>
            <span>
              <strong>Personas que cuidas</strong>
              <small>Crear, consultar y editar perfiles</small>
            </span>
            <span>→</span>
          </button>
          <button onClick={() => navigate("caregivers")}>
            <span>02</span>
            <span>
              <strong>Círculo de apoyo</strong>
              <small>Directorio local de familiares y cuidadores</small>
            </span>
            <span>→</span>
          </button>
        </div>
        <p className="helper">
          Demo local. Los roles describen a cada persona; no habilitan permisos ni envían
          invitaciones.
        </p>
        <Button variant="ghost" onClick={logout}>
          Salir del perfil
        </Button>
        <Button variant="danger" onClick={() => setConfirmReset(true)}>
          Reiniciar demo
        </Button>
      </main>
      {confirmReset && (
        <ConfirmDialog
          title="¿Reiniciar todos los datos?"
          message="Se borrarán tu perfil y los registros guardados en este navegador. La app volverá a sus datos de ejemplo."
          confirmLabel="Reiniciar demo"
          onCancel={() => setConfirmReset(false)}
          onConfirm={() => {
            resetAllData();
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
