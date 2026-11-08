import { Button } from "../components/Button";
import { TopBar } from "../components/TopBar";
import { usePersistentState } from "../lib/storage";
import { seedLogEntries, seedNeeds, migrateNeed, isEconomicNeed } from "../data/seed";
import { todayISO } from "../lib/dates";
import { seedUtilityItems } from "./UtilityScreen";
import type { Screen } from "../types";

export default function Family({
  back,
  navigate,
}: {
  back: () => void;
  navigate: (s: Screen) => void;
}) {
  const [entries] = usePersistentState("log:entries", seedLogEntries);
  const [needs] = usePersistentState("needs:items", seedNeeds);
  const [meds] = usePersistentState("utility:items:medications", seedUtilityItems("medications"));
  const [done] = usePersistentState<number[]>("utility:completed:medications", []);
  const today = entries.filter((e) => (e.date ?? todayISO()) === todayISO());
  const open = needs
    .map(migrateNeed)
    .filter((n) => !n.claimed && (!isEconomicNeed(n) || (n.raised ?? 0) < (n.goal ?? 0))).length;
  return (
    <div className="screen">
      <TopBar title="En familia" subtitle="CADA APOYO CUENTA" back={back} summary={false} />
      <main className="content">
        <section className="editor-intro">
          <h1>Así va su día.</h1>
          <p>Un resumen de lo que has registrado hoy en este dispositivo.</p>
        </section>
        <div className="family-stats">
          <div>
            <strong>{today.length}</strong>
            <small>registros hoy</small>
          </div>
          <div>
            <strong>
              {done.filter((i) => i < meds.length).length}/{meds.length}
            </strong>
            <small>tomas marcadas</small>
          </div>
          <div>
            <strong>{open}</strong>
            <small>necesidades</small>
          </div>
        </div>
        <section className="form-section">
          <h2>Lo más reciente</h2>
          {today
            .slice()
            .sort((a, b) => b.time.localeCompare(a.time))
            .map((entry, i) => (
              <div className="routine-row" key={i}>
                <span className="time">{entry.time}</span>
                <div>
                  <strong>{entry.category}</strong>
                  <small>{entry.note}</small>
                </div>
              </div>
            ))}
          {!today.length && <p className="helper">Aún no hay registros de hoy.</p>}
        </section>
        <Button icon="book" onClick={() => navigate("log")}>
          Abrir bitácora
        </Button>
        <Button variant="secondary" icon="heart" onClick={() => navigate("needs")}>
          Ver necesidades de apoyo
        </Button>
        <Button variant="secondary" icon="users" onClick={() => navigate("caregivers")}>
          Directorio de cuidadores
        </Button>
      </main>
    </div>
  );
}
