import { useState } from "react";
import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { ActionSheet } from "../components/ActionSheet";
import { FormField } from "../components/FormField";
import { Icon } from "../components/Icon";
import { IconButton } from "../components/IconButton";
import { usePersistentState } from "../lib/storage";

type Contact = {
  id: string;
  name: string;
  role: string;
  phone: string;
  /** Si el contacto coincide con un avatar ilustrado de la familia, se usa. */
  person?: "ana" | "luis" | "jose" | "maria" | "roberto";
  isDoctor?: boolean;
};

const seedContacts: Contact[] = [
  { id: "ana", name: "Ana Martínez", role: "Cuidadora principal", phone: "+525511112222", person: "ana" },
  { id: "luis", name: "Luis Ramírez", role: "Hijo", phone: "+525533334444", person: "luis" },
  {
    id: "doctora",
    name: "Dra. Laura Méndez",
    role: "Médico de cabecera · 55 1234 5678",
    phone: "+525512345678",
    isDoctor: true,
  },
];

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  const text = (parts[0]?.[0] ?? "C") + (parts.length > 1 ? parts[parts.length - 1][0] : "");
  return text.toUpperCase() || "C";
}

function Emergency({ back, notify }: { back: () => void; notify: (message: string) => void }) {
  const [contacts, setContacts] = usePersistentState<Contact[]>("emergency:contacts", seedContacts);
  const [addOpen, setAddOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactRole, setContactRole] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleting = contacts.find((contact) => contact.id === deleteId);

  const addContact = () => {
    const name = contactName.trim();
    const phone = contactPhone.trim();
    if (!name || !phone) {
      notify("Escribe nombre y teléfono");
      return;
    }
    const isDoctor = /m[ée]dic/i.test(contactRole);
    setContacts((current) => [
      ...current,
      {
        id: `contacto-${Date.now()}`,
        name,
        role: contactRole.trim() || "Contacto",
        phone,
        isDoctor,
      },
    ]);
    setAddOpen(false);
    setContactName("");
    setContactRole("");
    setContactPhone("");
    notify("Contacto agregado");
  };

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
            {contacts.map((contact, index) => (
              <div key={contact.id}>
                {index > 0 && <div className="divider" />}
                <div>
                  {contact.isDoctor ? (
                    <span className="doctor-contact">
                      <Icon name="stethoscope" size={20} />
                    </span>
                  ) : (
                    <Avatar person={contact.person ?? "luis"} size="sm" initials={contact.person ? undefined : initialsOf(contact.name)} />
                  )}
                  <span>
                    <strong>{contact.name}</strong>
                    <small>{contact.role}</small>
                  </span>
                  <IconButton
                    icon="phone"
                    label={`Llamar a ${contact.name}`}
                    onClick={() => {
                      window.location.href = `tel:${contact.phone}`;
                    }}
                  />
                  <IconButton
                    icon="close"
                    label={`Eliminar ${contact.name}`}
                    onClick={() => setDeleteId(contact.id)}
                  />
                </div>
              </div>
            ))}
            {contacts.length === 0 && (
              <div>
                <span style={{ color: "var(--muted)" }}>No hay contactos. Agrega uno abajo.</span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            icon="plus"
            onClick={() => {
              setContactName("");
              setContactRole("");
              setContactPhone("");
              setAddOpen(true);
            }}
          >
            Agregar contacto
          </Button>
        </section>
        <Button variant="primary" icon="bell" onClick={() => notify("Alerta enviada a toda la familia")}>
          Avisar a toda la familia
        </Button>
        <p className="emergency-note">
          <Icon name="heart" size={16} /> La ayuda de emergencia siempre es gratuita.
        </p>
      </main>
      {addOpen && (
        <ActionSheet title="Nuevo contacto" subtitle="EMERGENCIA" close={() => setAddOpen(false)}>
          <div className="sheet-form">
            <FormField
              label="Nombre"
              value={contactName}
              onChange={setContactName}
              placeholder="Ej. María López"
            />
            <FormField
              label="Relación o cargo"
              value={contactRole}
              onChange={setContactRole}
              placeholder="Ej. Vecina de apoyo"
            />
            <FormField
              label="Teléfono"
              type="tel"
              value={contactPhone}
              onChange={setContactPhone}
              placeholder="55 0000 0000"
            />
            <Button icon="check" onClick={addContact}>
              Guardar contacto
            </Button>
          </div>
        </ActionSheet>
      )}
      {deleting && (
        <ConfirmDialog
          title={`¿Eliminar a ${deleting.name}?`}
          message="Ya no aparecerá entre los contactos de emergencia."
          confirmLabel="Eliminar contacto"
          onConfirm={() => {
            setContacts((current) => current.filter((contact) => contact.id !== deleting.id));
            setDeleteId(null);
            notify("Contacto eliminado");
          }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}

export default Emergency;
