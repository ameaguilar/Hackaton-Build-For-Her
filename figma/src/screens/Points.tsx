import { useState } from "react";
import { Button } from "../components/Button";
import { ActionSheet } from "../components/ActionSheet";
import { Icon } from "../components/Icon";
import { TopBar } from "../components/TopBar";
import { usePersistentState } from "../lib/storage";
import type { Screen } from "../types";

type PointsMove = { id: string; label: string; delta: number; at: string };

const earnOptions: [string, number, string][] = [
  ["Bitácora diaria", 20, "Registro de hoy confirmado"],
  ["Racha de 7 días", 80, "¡Racha reclamada!"],
  ["Cubrir una necesidad", 40, "Necesidad cubierta"],
  ["Invitar a un familiar", 100, "Invitación enviada"],
];

function nowStamp() {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function Points({
  navigate,
  notify,
}: {
  navigate: (screen: Screen) => void;
  notify: (message: string) => void;
}) {
  const [redeem, setRedeem] = useState(false);
  const [redeemCost, setRedeemCost] = useState(300);
  const [balance, setBalance] = usePersistentState<number>("points", 840);
  const [history, setHistory] = usePersistentState<PointsMove[]>("points:history", []);
  const [pointsSheet, setPointsSheet] = useState<"earn" | "catalog" | null>(null);

  const recordMove = (label: string, delta: number) => {
    setBalance((current) => current + delta);
    setHistory((current) => [
      { id: `move-${Date.now()}`, label, delta, at: nowStamp() },
      ...current,
    ]);
  };
  return (
    <div className="screen">
      <TopBar
        title="Puntos"
        subtitle="TU CONSTANCIA CUENTA"
        points={false}
        onProfile={() => navigate("admin")}
      />
      <main className="content">
        <section className="points-hero">
          <span className="eyebrow">SALDO DISPONIBLE</span>
          <div>
            <Icon name="star" size={28} />
            <strong>{balance}</strong>
            <small>puntos</small>
          </div>
          <p>Gracias por cuidar con constancia.</p>
          <div className="points-actions">
            <Button icon="sparkle" onClick={() => setPointsSheet("earn")}>
              Ganar puntos
            </Button>
            <Button variant="secondary" icon="gift" onClick={() => setPointsSheet("catalog")}>
              Canjear
            </Button>
          </div>
        </section>
        <section>
          <div className="section-heading">
            <h2>Reto de la semana</h2>
            <span className="reward">+80 pts</span>
          </div>
          <div className="card challenge">
            <div className="challenge-icon">
              <Icon name="book" />
            </div>
            <div>
              <strong>Bitácora al día</strong>
              <p>Registra 7 días seguidos</p>
              <div className="progress">
                <span style={{ width: "71%" }} />
              </div>
              <small>5 de 7 días</small>
            </div>
          </div>
        </section>
        <section>
          <div className="section-heading">
            <h2>Recompensas</h2>
            <button className="text-button" onClick={() => setPointsSheet("catalog")}>
              Ver todas
            </button>
          </div>
          <article className="reward-card">
            <span className="reward-icon mint">
              <Icon name="sparkle" />
            </span>
            <div>
              <strong>Resumen semanal con IA</strong>
              <p>Una lectura clara para toda la familia.</p>
              <span className="cost">
                <Icon name="star" size={14} /> 300
              </span>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                setRedeemCost(300);
                setRedeem(true);
              }}
            >
              Canjear
            </Button>
          </article>
          <article className="reward-card">
            <span className="reward-icon yellow">
              <Icon name="note" />
            </span>
            <div>
              <strong>Reporte PDF médico</strong>
              <p>Bitácora lista para tu próxima cita.</p>
              <span className="cost">
                <Icon name="star" size={14} /> 500
              </span>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                setRedeemCost(500);
                setRedeem(true);
              }}
            >
              Canjear
            </Button>
          </article>
        </section>
        <section>
          <div className="section-heading">
            <h2>Movimientos recientes</h2>
          </div>
          {history.length === 0 ? (
            <div className="card challenge" style={{ opacity: 0.75 }}>
              <div className="challenge-icon">
                <Icon name="clock" />
              </div>
              <div>
                <strong>Aún no hay movimientos</strong>
                <p>Gana o canjea puntos y verás el registro aquí.</p>
              </div>
            </div>
          ) : (
            history
              .slice(0, 6)
              .map((move) => (
                <article className="reward-card" key={move.id}>
                  <span className={`reward-icon ${move.delta >= 0 ? "mint" : "yellow"}`}>
                    <Icon name={move.delta >= 0 ? "sparkle" : "gift"} />
                  </span>
                  <div>
                    <strong>{move.label}</strong>
                    <p>{move.at}</p>
                  </div>
                  <span className="cost">
                    {move.delta >= 0 ? "+" : ""}
                    {move.delta} pts
                  </span>
                </article>
              ))
          )}
        </section>
        <div className="free-note">
          <Icon name="heart" size={19} />
          <span>
            <strong>Lo esencial siempre es gratis</strong>
            <small>Emergencias, avisos y bitácora básica.</small>
          </span>
        </div>
      </main>
      {redeem && (
        <div className="sheet-backdrop">
          <section className="confirm-modal">
            <span className="confirm-icon">
              <Icon name="sparkle" size={30} />
            </span>
            <h2>¿Canjear {redeemCost} puntos?</h2>
            <p>
              Activarás{" "}
              {redeemCost === 300 ? "el resumen semanal con IA" : "el reporte PDF médico"}.
            </p>
            <Button
              onClick={() => {
                if (balance >= redeemCost) {
                  recordMove(
                    redeemCost === 300 ? "Canje: resumen semanal con IA" : "Canje: reporte PDF médico",
                    -redeemCost,
                  );
                  notify("Recompensa activada y saldo actualizado");
                } else {
                  notify("No tienes puntos suficientes");
                }
                setRedeem(false);
              }}
            >
              Confirmar canje
            </Button>
            <Button variant="ghost" onClick={() => setRedeem(false)}>
              Ahora no
            </Button>
          </section>
        </div>
      )}
      {pointsSheet && (
        <ActionSheet
          title={pointsSheet === "earn" ? "Ganar puntos" : "Catálogo de recompensas"}
          subtitle={pointsSheet === "earn" ? "RETOS Y CONSTANCIA" : "BENEFICIOS"}
          close={() => setPointsSheet(null)}
        >
          <div className="option-list">
            {pointsSheet === "earn"
              ? earnOptions.map(([title, delta]) => (
                  <button
                    key={title}
                    onClick={() => {
                      recordMove(title, delta);
                      setPointsSheet(null);
                      notify(`${title}: +${delta} puntos`);
                    }}
                  >
                    <span>
                      <strong>{title}</strong>
                      <small>+{delta} puntos</small>
                    </span>
                    <Icon name="plus" size={18} />
                  </button>
                ))
              : [
                  ["Resumen semanal con IA", "300 puntos"],
                  ["Reporte PDF médico", "500 puntos"],
                  ["Perfil de paciente adicional", "700 puntos"],
                  ["Almacenamiento ampliado", "900 puntos"],
                ].map(([title, detail]) => (
                  <button key={title} onClick={() => notify(`${title}: opción seleccionada`)}>
                    <span>
                      <strong>{title}</strong>
                      <small>{detail}</small>
                    </span>
                    <Icon name="chevron" size={18} />
                  </button>
                ))}
          </div>
        </ActionSheet>
      )}
    </div>
  );
}

export default Points;
