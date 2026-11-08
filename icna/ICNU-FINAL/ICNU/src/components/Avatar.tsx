export function Avatar({ person = "jose", size = "md", initials }: {
  person?: "jose" | "maria" | "roberto" | "ana" | "luis";
  size?: "sm" | "md" | "lg" | "xl";
  initials?: string;
}) {
  const people = { jose: "👴🏻", maria: "👵🏻", roberto: "👨🏻‍🦳", ana: "👩🏻", luis: "👨🏻" };
  const emoji = initials ? (person === "ana" || person === "luis" ? "🧑🏻" : "🧓🏻") : people[person];
  return <span className={`avatar avatar-person-3d avatar-${size}`} aria-hidden="true"><span>{emoji}</span></span>;
}
