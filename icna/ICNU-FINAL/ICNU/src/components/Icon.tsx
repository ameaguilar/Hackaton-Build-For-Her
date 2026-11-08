import {
  House,
  BookOpen,
  NotebookPen,
  Star,
  Pill,
  CalendarDays,
  UsersRound,
  HeartPulse,
  Clock3,
  Check,
  Plus,
  ChevronRight,
  Phone,
  Bell,
  LockKeyhole,
  TriangleAlert,
  ShoppingCart,
  Car,
  Wallet,
  Sparkles,
  Gift,
  Pencil,
  Stethoscope,
  X,
  UserRoundPlus,
  Video,
  ArrowUpRight,
  Activity,
  ChevronDown,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

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
  | "video"
  | "arrowUpRight"
  | "activity"
  | "chevronDown"
  | "shield";

const icons: Record<IconName, LucideIcon> = {
  home: House,
  book: BookOpen,
  note: NotebookPen,
  star: Star,
  pill: Pill,
  calendar: CalendarDays,
  users: UsersRound,
  heart: HeartPulse,
  clock: Clock3,
  check: Check,
  plus: Plus,
  chevron: ChevronRight,
  phone: Phone,
  bell: Bell,
  lock: LockKeyhole,
  alert: TriangleAlert,
  cart: ShoppingCart,
  car: Car,
  wallet: Wallet,
  sparkle: Sparkles,
  gift: Gift,
  edit: Pencil,
  stethoscope: Stethoscope,
  close: X,
  userPlus: UserRoundPlus,
  video: Video,
  arrowUpRight: ArrowUpRight,
  activity: Activity,
  chevronDown: ChevronDown,
  shield: ShieldCheck,
};
export function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const Glyph = icons[name];
  return <Glyph size={size} strokeWidth={1.7} aria-hidden="true" focusable="false" />;
}
