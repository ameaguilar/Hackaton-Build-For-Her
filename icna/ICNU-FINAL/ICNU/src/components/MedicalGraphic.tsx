import { useId } from "react";

/** Vector illustration: dimensional clinical objects, without people or faces. */
export function MedicalGraphic({ kind = "calendar" }: { kind?: "calendar" | "shield" }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 220 220"
      fill="none"
      aria-hidden="true"
      className={`medical-graphic medical-graphic-${kind}`}
    >
      <defs>
        <linearGradient
          id={`${id}-body`}
          x1="60"
          y1="30"
          x2="170"
          y2="190"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff" />
          <stop offset="1" stopColor="#b9dfff" />
        </linearGradient>
        <linearGradient
          id={`${id}-blue`}
          x1="70"
          y1="30"
          x2="160"
          y2="190"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#70d0ff" />
          <stop offset="1" stopColor="#2872d8" />
        </linearGradient>
        <linearGradient
          id={`${id}-check`}
          x1="140"
          y1="137"
          x2="202"
          y2="199"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#55c4fa" />
          <stop offset="1" stopColor="#2478de" />
        </linearGradient>
        <filter
          id={`${id}-shadow`}
          x="0"
          y="0"
          width="220"
          height="240"
          filterUnits="userSpaceOnUse"
        >
          <feDropShadow dx="0" dy="9" stdDeviation="8" floodColor="#1267ba" floodOpacity=".2" />
        </filter>
      </defs>
      <circle cx="115" cy="115" r="94" fill="#b7deff" fillOpacity=".32" />
      {kind === "calendar" ? (
        <g filter={`url(#${id}-shadow)`}>
          <path
            d="M51 50h115a15 15 0 0 1 15 15v108a15 15 0 0 1-15 15H51a15 15 0 0 1-15-15V65a15 15 0 0 1 15-15Z"
            fill="#89bfee"
          />
          <rect x="30" y="45" width="145" height="138" rx="16" fill={`url(#${id}-body)`} />
          <path d="M30 61a16 16 0 0 1 16-16h113a16 16 0 0 1 16 16v29H30V61Z" fill="#a3d5fa" />
          <rect x="56" y="29" width="13" height="38" rx="6.5" fill="#80b8e6" />
          <rect x="53" y="25" width="13" height="38" rx="6.5" fill={`url(#${id}-body)`} />
          <rect x="135" y="29" width="13" height="38" rx="6.5" fill="#80b8e6" />
          <rect x="132" y="25" width="13" height="38" rx="6.5" fill={`url(#${id}-body)`} />
          {[0, 1, 2].map((row) =>
            [0, 1, 2].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={51 + col * 36}
                y={106 + row * 25}
                width="23"
                height="17"
                rx="4"
                fill={row === 0 && col === 1 ? "#5ba9ed" : "#b6dafa"}
              />
            )),
          )}
          <circle cx="170" cy="164" r="34" fill={`url(#${id}-check)`} />
          <path
            d="m155 164 10 10 20-23"
            stroke="white"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ) : (
        <g filter={`url(#${id}-shadow)`}>
          <path d="m112 27 65 25v54c0 47-33 72-65 90-32-18-65-43-65-90V52l65-25Z" fill="#91c7f2" />
          <path
            d="m105 22 65 25v54c0 47-33 72-65 90-32-18-65-43-65-90V47l65-25Z"
            fill={`url(#${id}-blue)`}
          />
          <path d="M94 70h23v24h24v23h-24v24H94v-24H70V94h24V70Z" fill={`url(#${id}-body)`} />
          <path
            d="m58 53 46-18 47 18"
            stroke="#d4efff"
            strokeWidth="3"
            strokeLinecap="round"
            opacity=".7"
          />
        </g>
      )}
    </svg>
  );
}
