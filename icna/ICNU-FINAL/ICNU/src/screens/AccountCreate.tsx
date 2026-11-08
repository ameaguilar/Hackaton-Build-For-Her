import { useState } from "react";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { Icon } from "../components/Icon";
import { IconButton } from "../components/IconButton";
import type { AccountProfile, Screen } from "../types";

export default function AccountCreate({
  navigate,
  notify,
  onCreate,
}: {
  navigate: (screen: Screen) => void;
  notify: (message: string) => void;
  onCreate: (account: AccountProfile) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("Cuidador principal");

  const save = () => {
    if (!name.trim()) {
      notify("Escribe tu nombre para crear el perfil");
      return;
    }
    if (phone.replace(/\D/g, "").length != 10) {
      setError("Escribe un teléfono de 10 dígitos.");
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Revisa el correo electrónico.");
      return;
    }
    if (!accepted) {
      setError("Lee y acepta el aviso de almacenamiento local para continuar.");
      return;
    }
    onCreate({
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      role,
    });
  };

  return (
    <div className="screen">
      <header className="onboarding-topbar">
        <IconButton icon="chevron" label="Volver" onClick={() => navigate("welcome")} />
        <div>
          <span className="eyebrow">PASO 1</span>
          <strong className="page-title">Crear perfil</strong>
        </div>
        <span style={{ width: 44 }} />
      </header>
      <main className="content">
        <section className="utility-intro">
          <span>
            <Icon name="userPlus" />
          </span>
          <div>
            <h1>Tu perfil</h1>
            <p>Cuéntanos cómo te llamas y cuál es tu papel en el círculo de cuidado.</p>
          </div>
        </section>

        <div className="sheet-form" style={{ paddingTop: 0 }}>
          <FormField
            label="Nombre"
            value={name}
            onChange={setName}
            placeholder="Ej. Ana Martínez"
          />
          <FormField
            label="Correo (opcional)"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="nombre@correo.com"
          />
          <FormField
            label="Teléfono *"
            type="tel"
            value={phone}
            onChange={setPhone}
            placeholder="55 0000 0000"
          />
          <label className="form-field">
            <span>Rol</span>
            <select value={role} onChange={(event) => setRole(event.target.value)}>
              {["Cuidador principal", "Familiar", "Administrador", "Cuidador externo"].map(
                (item) => (
                  <option key={item}>{item}</option>
                ),
              )}
            </select>
          </label>

          <details className="privacy-notice">
            <summary>Aviso de almacenamiento local</summary>
            <p>
              Esta demo guarda tu nombre, teléfono y registros de cuidado en este navegador. No crea
              una cuenta en línea ni envía información a otras personas. Quien use este navegador
              puede ver los datos. Puedes borrarlos desde Mi perfil → Reiniciar demo.
            </p>
          </details>
          <label className="consent">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <span>He leído el aviso y acepto guardar los datos en este navegador.</span>
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <Button icon="check" onClick={save}>
            Crear perfil y continuar
          </Button>
          <p style={{ color: "var(--muted)", fontSize: 12, margin: 0 }}>
            Al continuar verás el inicio con pacientes y resúmenes.
          </p>
        </div>
      </main>
    </div>
  );
}
