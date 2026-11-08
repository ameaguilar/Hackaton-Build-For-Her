import { Button } from "./Button";
import { Icon } from "./Icon";
import { useModalFocus } from "../lib/useModalFocus";

/**
 * Modal de confirmación para acciones destructivas (eliminar registros).
 * Mismo estilo que el modal de canje de puntos.
 */
export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Eliminar",
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useModalFocus(onCancel);
  return (
    <div className="sheet-backdrop">
      <section
        ref={ref}
        className="confirm-modal"
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
      >
        <span className="confirm-icon">
          <Icon name="alert" size={30} />
        </span>
        <h2>{title}</h2>
        <p>{message}</p>
        <Button onClick={onConfirm}>{confirmLabel}</Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </section>
    </div>
  );
}
