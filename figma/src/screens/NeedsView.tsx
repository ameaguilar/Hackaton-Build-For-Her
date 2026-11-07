import { useState } from "react";
import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { ActionSheet } from "../components/ActionSheet";
import { FormField } from "../components/FormField";
import { IconButton } from "../components/IconButton";
import { Icon } from "../components/Icon";
import { seedNeeds, type NeedItem } from "../data/seed";
import { usePersistentState } from "../lib/storage";

export function NeedsView({ notify }: { notify: (message: string) => void }) {
  const [needs, setNeeds] = usePersistentState<NeedItem[]>("needs:items", seedNeeds);
  const [filter, setFilter] = useState("Todas");
  const [contributeNeedId, setContributeNeedId] = useState<string | null>(null);
  const [amount, setAmount] = useState("500");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const matches = (need: NeedItem) => {
    switch (filter) {
      case "Mías":
        return need.claimed;
      case "Económicas":
        return need.kind === "economica";
      case "Citas":
        return need.kind === "cita";
      case "Pendientes":
        return !need.claimed && (need.kind !== "economica" || (need.raised ?? 0) < (need.goal ?? 0));
      default:
        return true;
    }
  };
  const open = needs
    .filter(matches)
    .sort((a, b) => (a.priority === b.priority ? 0 : a.priority === "Alta" ? -1 : b.priority === "Alta" ? 1 : a.priority === "Media" ? -1 : 1));
  const deleting = needs.find((need) => need.id === deletingId);
  const contributing = needs.find((need) => need.id === contributeNeedId);

  const patchNeed = (id: string, patch: Partial<NeedItem>) =>
    setNeeds((current) => current.map((need) => (need.id === id ? { ...need, ...patch } : need)));

  const contribute = () => {
    const value = Number(amount);
    if (!contributing || !Number.isFinite(value) || value <= 0) {
      notify("Escribe un monto válido");
      return;
    }
    patchNeed(contributing.id, {
      raised: (contributing.raised ?? 0) + value,
      contributions: [...(contributing.contributions ?? []), value],
    });
    setContributeNeedId(null);
    notify(`Aportación de $${amount} registrada`);
  };

  return (
    <>
      <div className="filter-row">
        {["Todas", "Mías", "Económicas", "Citas", "Pendientes"].map((f) => (
          <button
            className={`filter-chip ${filter === f ? "active" : ""}`}
            key={f}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>
      {open.map((need) => {
        const goal = need.goal ?? 0;
        const raised = need.raised ?? 0;
        const percent = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
        const tone =
          need.priority === "Alta" ? "urgent" : need.priority === "Media" ? "medium" : "info";
        const priorityClass = need.priority === "Alta" ? "high" : need.priority === "Media" ? "mid" : "info";
        return (
          <article className={`need-card ${tone}`} key={need.id}>
            <div className="need-card-head">
              <span className={`type-icon ${need.kind === "economica" ? "peach" : ""}`}>
                <Icon name={need.kind === "economica" ? "wallet" : "calendar"} size={20} />
              </span>
              <div>
                <span className={`priority ${priorityClass}`}>{need.priority}</span>
                <h3>{need.title}</h3>
              </div>
              <IconButton
                icon="close"
                label={`Eliminar ${need.title}`}
                onClick={() => setDeletingId(need.id)}
              />
            </div>
            <p>{need.detail}</p>
            {need.kind === "economica" ? (
              <>
                <div className="progress-copy">
                  <strong>
                    ${raised.toLocaleString("es-MX")} de ${goal.toLocaleString("es-MX")}
                  </strong>
                  <span>{percent}%</span>
                </div>
                <div className="progress">
                  <span style={{ width: `${percent}%` }} />
                </div>
                <div className="contributors">
                  <Avatar person="luis" size="sm" />
                  <Avatar person="ana" size="sm" />
                  <span>
                    {(need.contributions?.length ?? 0) > 0
                      ? `${need.contributions!.length} aportación(es) de la familia`
                      : "Nadie ha aportado todavía"}
                  </span>
                </div>
                <Button
                  variant="secondary"
                  icon="wallet"
                  onClick={() => {
                    setAmount("500");
                    setContributeNeedId(need.id);
                  }}
                >
                  Puedo aportar
                </Button>
              </>
            ) : (
              <>
                <div className="claimed-row">
                  {need.claimed ? (
                    <>
                      <Avatar person="ana" size="sm" />
                      <span>
                        <strong>Ana se encargará de esto</strong>
                        <small>La familia ya fue notificada</small>
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="open-dot" />
                      <span>
                        <strong>Pendiente</strong>
                        <small>Aún necesitamos ayuda</small>
                      </span>
                    </>
                  )}
                </div>
                <Button
                  variant={need.claimed ? "secondary" : "primary"}
                  onClick={() => {
                    patchNeed(need.id, { claimed: !need.claimed });
                    notify(
                      need.claimed
                        ? "Necesidad cerrada y registrada"
                        : "La familia recibió tu confirmación",
                    );
                  }}
                  icon={need.claimed ? "check" : "heart"}
                >
                  {need.claimed ? "Liberar necesidad" : "Yo puedo ayudar"}
                </Button>
              </>
            )}
          </article>
        );
      })}
      {open.length === 0 && (
        <div className="covered">
          <span className="covered-art">
            <Icon name="check" />
          </span>
          <div>
            <strong>Todo cubierto por hoy</strong>
            <small>No hay resultados en este filtro.</small>
          </div>
        </div>
      )}
      <div className="covered">
        <span className="covered-art">
          <Icon name="check" />
        </span>
        <div>
          <strong>Lo demás está cubierto</strong>
          <small>Gracias por coordinar a la familia</small>
        </div>
      </div>
      {contributing && (
        <ActionSheet
          title="Realizar aportación"
          subtitle="APOYO ECONÓMICO"
          close={() => setContributeNeedId(null)}
        >
          <div className="sheet-form">
            <FormField label="Monto a aportar" type="number" value={amount} onChange={setAmount} />
            <div className="quick-amounts">
              {["200", "500", "1000"].map((value) => (
                <button key={value} onClick={() => setAmount(value)}>
                  ${value}
                </button>
              ))}
            </div>
            <Button icon="wallet" onClick={contribute}>
              Confirmar aportación
            </Button>
          </div>
        </ActionSheet>
      )}
      {deleting && (
        <ConfirmDialog
          title={`¿Eliminar «${deleting.title}»?`}
          message="La necesidad desaparecerá de la lista de la familia. Esta acción no se puede deshacer."
          confirmLabel="Eliminar necesidad"
          onConfirm={() => {
            setNeeds((current) => current.filter((need) => need.id !== deleting.id));
            setDeletingId(null);
            notify("Necesidad eliminada");
          }}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </>
  );
}
