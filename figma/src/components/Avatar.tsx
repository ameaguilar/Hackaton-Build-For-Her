export function Avatar({
  person = "jose",
  size = "md",
  initials,
}: {
  person?: "jose" | "maria" | "roberto" | "ana" | "luis";
  size?: "sm" | "md" | "lg" | "xl";
  /** Si se pasa, dibuja iniciales (pacientes nuevos) en vez del avatar ilustrado. */
  initials?: string;
}) {
  if (initials) {
    return <span className={`avatar initials avatar-${size} luis`}>{initials}</span>;
  }
  if (person === "ana" || person === "luis") {
    return (
      <span className={`avatar initials avatar-${size} ${person}`}>
        {person === "ana" ? "AM" : "LR"}
      </span>
    );
  }
  return (
    <span className={`avatar illustrated avatar-${size} ${person}`}>
      <span className="hair" />
      <span className="face">
        <span className="eyes" />
        <span className="smile" />
      </span>
      {person === "jose" && <span className="glasses" />}
    </span>
  );
}
