import { usePersistentState } from "../lib/storage";
import { Avatar } from "./Avatar";
import { Icon } from "./Icon";
import { IconButton } from "./IconButton";

export function TopBar({
  title,
  subtitle,
  back,
  onProfile,
  onPoints,
  points = true,
}: {
  title: string;
  subtitle?: string;
  back?: () => void;
  onProfile?: () => void;
  onPoints?: () => void;
  points?: boolean;
}) {
  const [pointsBalance] = usePersistentState<number>("points", 840);
  return (
    <header className="topbar">
      <div className="topbar-left">
        {back && <IconButton icon="chevron" label="Volver" onClick={back} />}
        <div>
          <span className="eyebrow">{subtitle}</span>
          <strong className="page-title">{title}</strong>
        </div>
      </div>
      <div className="topbar-actions">
        {points && (
          <button className="points-chip" onClick={onPoints} aria-label="Abrir puntos">
            <Icon name="star" size={15} /> {pointsBalance}
          </button>
        )}
        {onProfile ? (
          <button className="avatar-button" onClick={onProfile} aria-label="Abrir perfil">
            <Avatar person="ana" size="sm" />
          </button>
        ) : (
          <Avatar person="ana" size="sm" />
        )}
      </div>
    </header>
  );
}
