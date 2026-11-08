import type { AccountProfile } from "../types";
import { usePersistentState } from "../lib/storage";
import { Avatar } from "./Avatar";
import { Icon } from "./Icon";
import { IconButton } from "./IconButton";
import { Brand } from "./Brand";

export function TopBar({
  title,
  subtitle,
  back,
  onProfile,
  onSummary,
  summary = true,
}: {
  title: string;
  subtitle?: string;
  back?: () => void;
  onProfile?: () => void;
  onSummary?: () => void;
  summary?: boolean;
}) {
  const [account] = usePersistentState<AccountProfile | null>("account:profile", null);
  const initials =
    account?.name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("") || "TÚ";
  return (
    <header className="topbar">
      <div className="topbar-left">
        {back && <IconButton icon="chevron" label="Volver" onClick={back} />}
        {title === "icnu" ? (
          <Brand tagline />
        ) : (
          <div>
            <span className="eyebrow">{subtitle}</span>
            <strong className="page-title">{title}</strong>
          </div>
        )}
      </div>
      <div className="topbar-actions">
        {summary && onSummary && (
          <button
            className="summary-shortcut"
            onClick={onSummary}
            aria-label="Abrir resumen semanal"
          >
            <Icon name="calendar" size={17} /> <span>Resumen</span>
          </button>
        )}
        {onProfile ? (
          <button className="avatar-button" onClick={onProfile} aria-label="Abrir perfil">
            <Avatar initials={initials} size="sm" />
          </button>
        ) : (
          <Avatar initials={initials} size="sm" />
        )}
      </div>
    </header>
  );
}
