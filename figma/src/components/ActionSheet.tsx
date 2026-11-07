import type { ReactNode } from "react";
import { IconButton } from "./IconButton";

export function ActionSheet({
  title,
  subtitle,
  children,
  close,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  close: () => void;
}) {
  return (
    <div className="sheet-backdrop" onClick={close}>
      <section className="bottom-sheet action-sheet" onClick={(event) => event.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-title">
          <div>
            {subtitle && <span className="eyebrow">{subtitle}</span>}
            <h2>{title}</h2>
          </div>
          <IconButton icon="close" label="Cerrar" onClick={close} />
        </div>
        {children}
      </section>
    </div>
  );
}
