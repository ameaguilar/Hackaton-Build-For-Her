import type { ReactNode } from "react";

export type IconName =
  | "home"
  | "book"
  | "note"
  | "star"
  | "pill"
  | "calendar"
  | "users"
  | "heart"
  | "clock"
  | "check"
  | "plus"
  | "chevron"
  | "phone"
  | "bell"
  | "lock"
  | "alert"
  | "cart"
  | "car"
  | "wallet"
  | "sparkle"
  | "gift"
  | "edit"
  | "stethoscope"
  | "close"
  | "userPlus"
  | "video";

export function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    home: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v11h14V9" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
    book: (
      <>
        <path d="M4 4h5a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H4Z" />
        <path d="M20 4h-5a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h5Z" />
      </>
    ),
    note: (
      <>
        <path d="M5 3h14v18H5z" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </>
    ),
    star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6-5.4-2.8-5.4 2.8 1-6-4.4-4.3 6.1-.9Z" />,
    pill: (
      <>
        <path d="M8.5 19.5a5 5 0 0 1-7-7l8-8a5 5 0 0 1 7 7Z" />
        <path d="m6 8 7 7" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.8M16 3.2a4 4 0 0 1 0 7.6" />
      </>
    ),
    heart: (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    phone: (
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7 12.8 12.8 0 0 0 .7 2.8 2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5 12.8 12.8 0 0 0 2.8.7 2 2 0 0 1 1.8 2.1Z" />
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    alert: (
      <>
        <path d="M10.3 3.6 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4M12 17h.01" />
      </>
    ),
    cart: (
      <>
        <circle cx="9" cy="20" r="1" />
        <circle cx="19" cy="20" r="1" />
        <path d="M3 4h2l2.5 11h11l2-8H6" />
      </>
    ),
    car: (
      <>
        <path d="m5 17-1 2v2M19 17l1 2v2M4 17h16l-2-7H6Z" />
        <path d="M7 17h.01M17 17h.01" />
      </>
    ),
    wallet: (
      <>
        <path d="M3 6h18v14H3z" />
        <path d="M3 6l14-3v3M16 12h5" />
      </>
    ),
    sparkle: (
      <>
        <path d="m12 3 1.3 3.7L17 8l-3.7 1.3L12 13l-1.3-3.7L7 8l3.7-1.3Z" />
        <path d="m18 14 .8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8Z" />
      </>
    ),
    gift: (
      <>
        <rect x="3" y="8" width="18" height="13" />
        <path d="M12 8v13M3 12h18" />
        <path d="M12 8H7.5A2.5 2.5 0 1 1 10 5.5ZM12 8h4.5A2.5 2.5 0 1 0 14 5.5Z" />
      </>
    ),
    edit: (
      <>
        <path d="M12 20h9" />
        <path d="m16.5 3.5 4 4L8 20l-5 1 1-5Z" />
      </>
    ),
    stethoscope: (
      <>
        <path d="M6 3v5a4 4 0 0 0 8 0V3M8 3H4M16 3h-4" />
        <path d="M10 17a5 5 0 0 0 10 0v-3" />
        <circle cx="20" cy="12" r="2" />
      </>
    ),
    close: <path d="m6 6 12 12M18 6 6 18" />,
    userPlus: (
      <>
        <path d="M15 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8" cy="7" r="4" />
        <path d="M19 8v6M16 11h6" />
      </>
    ),
    video: (
      <>
        <rect x="2" y="5" width="15" height="14" rx="2" />
        <path d="m17 10 5-3v10l-5-3Z" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}
