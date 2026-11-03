"use client";

import { useEffect, useState } from "react";
import {
  Boxes, Cctv, ClipboardList, CookingPot, Flashlight, LayoutDashboard, Lightbulb, Package, PlugZap, ScanBarcode,
  Settings, Speaker, Tv, Users, Warehouse, Wrench, type LucideProps,
} from "lucide-react";
import { money } from "@/lib/format";
import { stockLevel, type StockLevel } from "@/lib/calculations";
import { openState, type OpenState } from "@/lib/hours";
import { Badge, cx } from "./ui";

const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  Boxes, Cctv, ClipboardList, CookingPot, Flashlight, LayoutDashboard, Lightbulb, Package, PlugZap, ScanBarcode,
  Settings, Speaker, Tv, Users, Warehouse, Wrench,
};

/** Resolves the icon names stored in data (categories, nav). */
export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const C = ICONS[name] ?? Package;
  return <C aria-hidden {...props} />;
}

/** Prices are data, not display type: Hanken, tabular figures, weight carries the emphasis. */
export function Price({ value, className, size = "md" }: { value: number; className?: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const s = { sm: "text-sm font-semibold", md: "text-body font-semibold", lg: "text-[1.25rem] font-semibold", xl: "text-[1.75rem] font-semibold leading-none tracking-[-0.01em]" }[size];
  return <span className={cx("num text-text", s, className)}>{money(value)}</span>;
}

export const STOCK_TEXT: Record<StockLevel, string> = { in: "In stock", low: "Few left", out: "Out of stock" };

export function StockBadge({ stock, threshold, showCount }: { stock: number; threshold: number; showCount?: boolean }) {
  const lvl = stockLevel(stock, threshold);
  const tone = lvl === "in" ? "success" : lvl === "low" ? "warning" : "danger";
  const text = lvl === "low" && showCount ? `Only ${stock} left` : lvl === "in" && showCount ? `${stock} in stock` : STOCK_TEXT[lvl];
  return <Badge tone={tone} dot>{text}</Badge>;
}

export function LevelBadge({ level }: { level: StockLevel }) {
  return <Badge tone={level === "in" ? "success" : level === "low" ? "warning" : "danger"} dot>{STOCK_TEXT[level]}</Badge>;
}

/** Plain-text stock line for the storefront: quieter than a badge, still never colour alone. */
export function StockLine({ stock, threshold, className }: { stock: number; threshold: number; className?: string }) {
  const lvl = stockLevel(stock, threshold);
  return (
    <span className={cx("inline-flex items-center gap-1.5 text-small font-medium",
      lvl === "in" ? "text-success-600" : lvl === "low" ? "text-warning-600" : "text-danger-600", className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {lvl === "in" ? `In stock · ${stock} on the shelf` : lvl === "low" ? `Only ${stock} left` : "Out of stock"}
    </span>
  );
}

/** Live "Open now / Closed" read from the shop's hours. Renders after mount to avoid hydration drift. */
export function useOpenState(hours: string | undefined): OpenState | null {
  const [s, setS] = useState<OpenState | null>(null);
  useEffect(() => {
    if (!hours) return;
    const tick = () => setS(openState(hours));
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, [hours]);
  return s;
}

export function OpenSign({ hours, className, tone = "light" }: { hours?: string; className?: string; tone?: "light" | "dark" }) {
  const s = useOpenState(hours);
  if (!hours) return null;
  return (
    <span className={cx("inline-flex items-center gap-2 text-small", tone === "dark" ? "text-white/80" : "text-text-2", className)}>
      <span className={cx("relative flex h-2 w-2 rounded-full", s?.open ? "bg-success-600" : s ? "bg-marigold-600" : "bg-text-3")} aria-hidden>
        {s?.open && <span className="anim-pulse absolute inset-0 rounded-full bg-success-600/40 ring-4 ring-success-600/20" />}
      </span>
      {s ? <span><b className={cx("font-semibold", tone === "dark" ? "text-white" : "text-text")}>{s.label}</b> · {s.detail}</span> : <span>{hours}</span>}
    </span>
  );
}

/** Placeholder mark until the owner supplies a logo: a shop awning over a "D". */
export function LogoMark({ className, inverse }: { className?: string; inverse?: boolean }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <rect width="40" height="40" rx="9" fill={inverse ? "var(--color-surface)" : "var(--color-ink-900)"} />
      <path d="M6 12h28l-2.5 5.5a3.6 3.6 0 0 1-6.3 0 3.6 3.6 0 0 1-6.4 0 3.6 3.6 0 0 1-6.3 0 3.6 3.6 0 0 1-3.9 1.8L6 12Z"
        fill="var(--color-marigold-500)" />
      <path d="M13 22.5h6.2c4 0 6.8 2.4 6.8 5.9 0 3.6-2.8 5.9-6.8 5.9H13V22.5Zm4 3.3v5.2h2.1c1.8 0 2.9-1 2.9-2.6s-1.1-2.6-2.9-2.6H17Z"
        fill={inverse ? "var(--color-ink-900)" : "var(--color-surface)"} />
    </svg>
  );
}

/** Section heading used across storefront sections: title, optional sub, optional link; hairline below. */
export function SectionHead({ title, sub, action, id }: { title: string; sub?: string; action?: React.ReactNode; id?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 border-b border-line pb-3">
      <div className="min-w-0">
        <h2 id={id} className="text-heading">{title}</h2>
        {sub && <p className="mt-0.5 text-small text-text-3">{sub}</p>}
      </div>
      {action}
    </div>
  );
}
