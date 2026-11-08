import { Icon } from "./Icon";
import { Brand } from "./Brand";
import type { IconName } from "./Icon";
import type { Screen } from "../types";

export function BottomNav({ active, navigate }: { active: Screen; navigate: (s: Screen) => void }) {
  const tabs: { id: Screen; label: string; icon: IconName }[] = [
    { id: "home", label: "Inicio", icon: "home" },
    { id: "log", label: "Bitácora", icon: "book" },
    { id: "notes", label: "Notas", icon: "note" },
    { id: "weekly-summary", label: "Resumen", icon: "calendar" },
  ];
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      <div className="nav-brand">
        <Brand tagline />
      </div>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-item ${active === tab.id ? "active" : ""}`}
          aria-current={active === tab.id ? "page" : undefined}
          onClick={() => navigate(tab.id)}
        >
          <Icon name={tab.icon} size={21} />
          <span>{tab.label}</span>
        </button>
      ))}
      <div className="nav-footnote">
        <Icon name="shield" size={20} />
        <strong>El cuidado nos conecta.</strong>
        <p>
          Un día a la vez.
          <br />
          Un equipo a tu lado.
        </p>
      </div>
    </nav>
  );
}
