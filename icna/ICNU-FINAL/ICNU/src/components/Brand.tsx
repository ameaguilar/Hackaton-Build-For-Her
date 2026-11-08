export function Brand({ compact = false, tagline = false }: { compact?: boolean; tagline?: boolean }) {
  return <span className={`icnu-brand ${compact ? "icnu-brand-compact" : ""}`}>
    <img src={compact ? "/brand/icnu-symbol.svg" : "/brand/icnu-logo.svg"} alt="icnu" width={compact ? 42 : 150} height="40" />
    {!compact && tagline && <small>El cuidado nos conecta</small>}
  </span>;
}
