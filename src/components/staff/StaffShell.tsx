"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { FlaskConical, LogOut, Menu, ArrowUpRight, ShieldOff } from "lucide-react";
import { useStaff } from "@/hooks/useApp";
import { logout } from "@/lib/actions";
import { ROLE_LABEL, STAFF_NAV, can, homeFor } from "@/lib/permissions";
import { Icon, LogoMark } from "../shared/bits";
import { Button, Drawer, EmptyState, Spinner, buttonClass, cx } from "../shared/ui";

function routePerm(pathname: string) {
  const hit = [...STAFF_NAV].sort((a, b) => b.href.length - a.href.length).find((n) => pathname === n.href || pathname.startsWith(n.href + "/"));
  return hit?.perm;
}

/** Grouped by job: selling happens at the counter; managing happens after hours. */
const GROUPS: { label: string; hrefs: string[] }[] = [
  { label: "Sell", hrefs: ["/staff", "/staff/orders", "/staff/pos"] },
  { label: "Manage", hrefs: ["/staff/products", "/staff/inventory", "/staff/team", "/staff/settings"] },
];

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const { snap, staff } = useStaff();
  const pathname = usePathname();
  const pending = snap?.data.orders.filter((o) => o.status === "placed").length ?? 0;
  const threshold = snap?.data.settings.lowStockThreshold ?? 5;
  const low = snap?.data.products.reduce((n, p) => n + p.variants.filter((v) => v.stock <= threshold).length, 0) ?? 0;
  const items = STAFF_NAV.filter((n) => can(staff, n.perm));
  return (
    <div className="space-y-5 px-3">
      {GROUPS.map((g) => {
        const list = items.filter((n) => g.hrefs.includes(n.href));
        if (!list.length) return null;
        return (
          <div key={g.label}>
            <p className="eyebrow mb-1 px-3">{g.label}</p>
            <ul className="space-y-0.5">
              {list.map((n) => {
                const active = n.href === "/staff" ? pathname === "/staff" : pathname.startsWith(n.href);
                const badge = n.href === "/staff/orders" ? pending : n.href === "/staff/inventory" ? low : 0;
                return (
                  <li key={n.href}>
                    <Link href={n.href} onClick={onNavigate} aria-current={active ? "page" : undefined}
                      className={cx(
                        "flex h-10 items-center gap-3 rounded-sm px-3 text-sm font-medium transition-colors",
                        active ? "bg-ink-900 text-white" : "text-text-2 hover:bg-sunken hover:text-text",
                      )}>
                      <Icon name={n.icon} className={cx("h-[18px] w-[18px]", active ? "text-white/80" : "text-text-3")} />
                      <span className="flex-1">{n.label}</span>
                      {badge > 0 && (
                        <span className={cx("num min-w-5 rounded-full px-1.5 text-center text-caption font-semibold",
                          active ? "bg-white/15 text-white" : n.href === "/staff/orders" ? "bg-marigold-500 text-ink-950" : "bg-sunken text-text-2 ring-1 ring-inset ring-line")}
                          aria-label={n.href === "/staff/orders" ? `${badge} new orders` : `${badge} low-stock variants`}>{badge}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function DemoChip({ className }: { className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full bg-marigold-100 px-2.5 py-1 text-caption font-semibold text-marigold-700", className)}
      title="Sample data and simulated payments. Nothing here is real money or real stock.">
      <FlaskConical className="h-3.5 w-3.5" aria-hidden /> Demo data
    </span>
  );
}

export function StaffShell({ children }: { children: ReactNode }) {
  const { snap, staff } = useStaff();
  const pathname = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const shopName = snap?.data.settings.shopName ?? "Duka Letu";

  useEffect(() => {
    if (snap && !staff) router.replace(`/staff/login?next=${encodeURIComponent(pathname)}`);
  }, [snap, staff, pathname, router]);
  useEffect(() => { setMenu(false); }, [pathname]);

  if (!snap || !staff) return <div className="min-h-dvh bg-canvas"><Spinner label="Checking your session" /></div>;

  const perm = routePerm(pathname);
  const allowed = !perm || can(staff, perm);
  const initials = staff.name.split(" ").map((s) => s[0]).slice(0, 2).join("");

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <LogoMark className="h-8 w-8" />
        <div className="min-w-0 leading-tight">
          <p className="truncate font-display text-[1.0625rem] font-semibold tracking-tight">{shopName}</p>
          <p className="text-caption text-text-3">Shop manager</p>
        </div>
      </div>
      <nav aria-label="Staff" className="flex-1 overflow-y-auto pb-4 pt-3"><Nav onNavigate={() => setMenu(false)} /></nav>
      <div className="space-y-3 border-t border-line p-4">
        <div className="flex items-center justify-between gap-2">
          <DemoChip />
          <Link href="/" target="_blank" className="flex items-center gap-1 text-small font-medium text-text-2 hover:text-text">
            Storefront <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sunken text-small font-semibold text-text ring-1 ring-inset ring-line" aria-hidden>{initials}</span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-semibold">{staff.name}</p>
            <p className="text-caption text-text-3">{ROLE_LABEL[staff.role]}</p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={() => { logout(); router.replace("/staff/login"); }} aria-label="Log out" title="Log out">
            <LogOut className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-canvas lg:pl-60">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-line bg-surface lg:block print:hidden">{sidebar}</aside>

      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur-sm lg:hidden print:hidden">
        <Button variant="ghost" size="icon" className="-ml-2.5 text-text" onClick={() => setMenu(true)} aria-label="Open staff menu"><Menu className="h-5 w-5" /></Button>
        <LogoMark className="h-7 w-7" />
        <span className="truncate font-display text-[1.0625rem] font-semibold tracking-tight">{shopName}</span>
        <DemoChip className="ml-auto" />
      </header>

      <Drawer open={menu} onClose={() => setMenu(false)} side="left" title="Staff menu" width="max-w-[280px]" bare>
        {sidebar}
      </Drawer>

      <main id="main" className="mx-auto max-w-[1360px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        {allowed ? children : (
          <div className="mx-auto max-w-lg">
            <h1 className="sr-only">No access</h1>
            <EmptyState icon={<ShieldOff />} title="You don’t have access to this page"
              body={`Your role (${ROLE_LABEL[staff.role]}) can’t open this section. Ask the owner if you need it.`}
              action={<Link href={homeFor(staff.role)} className={buttonClass("primary")}>Go to my home page</Link>} />
          </div>
        )}
      </main>
    </div>
  );
}

export function PageHeader({ title, sub, actions }: { title: string; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-[1.5rem] sm:text-[1.75rem]">{title}</h1>
        {sub && <p className="mt-1 text-sm text-text-2">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
