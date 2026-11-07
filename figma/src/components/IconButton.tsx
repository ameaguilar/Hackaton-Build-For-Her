import { Icon, type IconName } from "./Icon";

export function IconButton({
  icon,
  label,
  onClick,
}: {
  icon: IconName;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button className="icon-button" aria-label={label} onClick={onClick}>
      <Icon name={icon} />
    </button>
  );
}
