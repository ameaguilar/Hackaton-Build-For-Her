import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

export function Button({
  children,
  onClick,
  variant = "primary",
  icon,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  icon?: IconName;
  className?: string;
}) {
  return (
    <button className={`btn btn-${variant} ${className}`} onClick={onClick}>
      {icon && <Icon name={icon} size={20} />}
      <span>{children}</span>
    </button>
  );
}
