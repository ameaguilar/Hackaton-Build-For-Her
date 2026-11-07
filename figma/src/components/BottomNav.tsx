import { Icon } from "./Icon";
import type { IconName } from "./Icon";
import type { Screen } from "../types";

export function BottomNav({ active, navigate }: { active: Screen; navigate: (s: Screen) => void }) {
  const tabs: { id: Screen; label: string; icon: IconName }[] = [
    { id: "home", label: "Inicio", icon: "home" },
    { id: "log", label: "Bitácora", icon: "book" },
    { id: "notes", label: "Notas", icon: "note" },
    { id: "points", label: "Puntos", icon: "star" },
  ];
  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-item ${active === tab.id ? "active" : ""}`}
          onClick={() => navigate(tab.id)}
        >
          <Icon name={tab.icon} size={21} />
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
