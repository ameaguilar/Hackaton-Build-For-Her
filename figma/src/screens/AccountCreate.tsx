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
  const [role, setRole] = useState("Cuidador principal");

  const save = () => {
    if (!name.trim()) {
      notify("Escribe tu nombre para crear la cuenta");
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
          <strong className="page-title">Crear cuenta</strong>
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
            <p>Antes de ver pacientes y resúmenes, crea tu cuenta para personalizar la app.</p>
          </div>
        </section>

        <div className="sheet-form" style={{ paddingTop: 0 }}>
          <FormField label="Nombre" value={name} onChange={setName} placeholder="Ej. Ana Martínez" />
          <FormField
            label="Correo (opcional)"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="nombre@correo.com"
          />
          <FormField
            label="Teléfono (opcional)"
            type="tel"
            value={phone}
            onChange={setPhone}
            placeholder="55 0000 0000"
          />
          <label className="form-field">
            <span>Rol</span>
            <select value={role} onChange={(event) => setRole(event.target.value)}>
              {[
                "Cuidador principal",
                "Familiar",
                "Administrador",
                "Enfermera o cuidador profesional",
              ].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <Button icon="check" onClick={save}>
            Crear cuenta y continuar
          </Button>
          <p style={{ color: "var(--muted)", fontSize: 12, margin: 0 }}>
            Al continuar verás el inicio con pacientes y resúmenes.
          </p>
        </div>
      </main>
    </div>
  );
}
