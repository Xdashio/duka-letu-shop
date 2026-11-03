"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, ScanBarcode, Boxes } from "lucide-react";
import type { ActivityEntry } from "@/types";
import { useApp } from "@/hooks/useApp";
import { DAY, countsAsSale, salesByDay, startOfDay, topSellers } from "@/lib/calculations";
import { fmtTime, money, plural, timeAgo } from "@/lib/format";
import { ProductImage } from "../shared/ProductImage";
import { PaymentBadge, StatusBadge } from "../shared/OrderBits";
import { Badge, Panel, Skeleton, buttonClass, cx } from "../shared/ui";
import { PageHeader } from "./StaffShell";
import { SalesChart } from "./SalesChart";

function Delta({ now, prev }: { now: number; prev: number }) {
  if (prev === 0 && now === 0) return <span className="text-text-3">No sales yet today</span>;
  if (prev === 0) return <span className="text-text-3">Nothing by this time yesterday</span>;
  const pct = Math.round(((now - prev) / prev) * 100);
  const up = pct >= 0;
  return (
    <span className="text-text-2">
      <span className={cx("font-semibold", up ? "text-success-600" : "text-danger-600")}>{up ? "↑" : "↓"} {Math.abs(pct)}%</span>{" "}
      vs <span className="num">{money(prev)}</span> by this time yesterday
    </span>
  );
}

function Counter({ label, value, sub, href, cta, attention }: { label: string; value: number; sub: React.ReactNode; href: string; cta: string; attention: boolean }) {
  return (
    <Link href={href} className="group flex flex-col p-5 transition-colors hover:bg-canvas">
      <span className="flex items-center gap-2 text-small font-medium text-text-2">
        <span className={cx("h-2 w-2 rounded-full", attention ? "bg-marigold-500" : "bg-success-600")} aria-hidden />{label}
      </span>
      <span className="num mt-2 text-[2rem] font-semibold leading-none tracking-tight">{value}</span>
      <span className="mt-2 text-small text-text-2">{sub}</span>
      <span className="mt-auto flex items-center gap-1 pt-3 text-small font-semibold text-brand-600 group-hover:text-brand-700">{cta} <ArrowRight className="h-3.5 w-3.5" aria-hidden /></span>
    </Link>
  );
}

const KIND_DOT: Record<ActivityEntry["kind"], string> = {
  order: "bg-info-600", payment: "bg-success-600", stock: "bg-warning-600", product: "bg-brand-600", pos: "bg-chart-shop", staff: "bg-ink-700", settings: "bg-text-3",
};

export function DashboardPage() {
  const snap = useApp();
  const stats = useMemo(() => {
    if (!snap) return null;
    const d = snap.data;
    const now = Date.now();
    const t0 = startOfDay(now), y0 = t0 - DAY;
    const inDay = (iso: string, start: number) => { const t = new Date(iso).getTime(); return t >= start && t < start + DAY; };
    const posOn = (s: number) => d.posSales.filter((x) => inDay(x.createdAt, s)).reduce((a, x) => a + x.total, 0);
    const onlineOn = (s: number) => d.orders.filter((o) => countsAsSale(o) && inDay(o.paidAt ?? o.createdAt, s)).reduce((a, o) => a + o.total, 0);
    // Fair comparison: yesterday up to the same time of day.
    const cut = y0 + (now - t0);
    const until = (iso: string) => { const t = new Date(iso).getTime(); return t >= y0 && t < cut; };
    const yestSoFar = d.posSales.filter((x) => until(x.createdAt)).reduce((a, x) => a + x.total, 0)
      + d.orders.filter((o) => countsAsSale(o) && until(o.paidAt ?? o.createdAt)).reduce((a, o) => a + o.total, 0);
    const th = d.settings.lowStockThreshold;
    const variants = d.products.flatMap((p) => p.variants.map((v) => ({ p, v })));
    const low = variants.filter(({ v }) => v.stock > 0 && v.stock <= th).sort((a, b) => a.v.stock - b.v.stock);
    const out = variants.filter(({ v }) => v.stock <= 0);
    return {
      posToday: posOn(t0), onlineToday: onlineOn(t0), yestSoFar,
      onlineCountToday: d.orders.filter((o) => countsAsSale(o) && inDay(o.paidAt ?? o.createdAt, t0)).length,
      pending: d.orders.filter((o) => o.status === "placed"),
      inProgress: d.orders.filter((o) => ["packed", "ready_for_pickup", "out_for_delivery"].includes(o.status)).length,
      low, out, products: d.products.length, published: d.products.filter((p) => p.published).length,
      salesToday: d.posSales.filter((x) => inDay(x.createdAt, t0)).length,
      days: salesByDay(d, 7, now), top: topSellers(d, 7, now, 5), recent: d.orders.slice(0, 6), activity: d.activity.slice(0, 8),
    };
  }, [snap]);

  if (!snap || !stats) {
    return <div><Skeleton className="mb-6 h-9 w-48" /><Skeleton className="h-44 rounded-md" /><div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]"><Skeleton className="h-80 rounded-md" /><Skeleton className="h-80 rounded-md" /></div></div>;
  }
  const s = stats;
  const today = new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long" });
  const total = s.posToday + s.onlineToday;
  const posShare = total ? s.posToday / total : 0.5;
  const restock = s.low.length + s.out.length;

  return (
    <div>
      <PageHeader title="Today" sub={today}
        actions={<Link href="/staff/pos" className={buttonClass("primary")}><ScanBarcode className="h-4 w-4" aria-hidden /> Open till</Link>} />

      {/* Today: one panel. A headline figure, then the two things that need doing. */}
      <section aria-label="Today at a glance" className="grid overflow-hidden rounded-md border border-line bg-surface md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)] md:divide-x md:divide-line max-md:divide-y max-md:divide-line">
        <div className="p-5">
          <p className="text-small font-medium text-text-2">Sales today</p>
          <p className="num mt-2 text-[2.25rem] font-semibold leading-none tracking-tight">{money(total)}</p>
          <p className="mt-2 text-small"><Delta now={total} prev={s.yestSoFar} /></p>
          <div className="mt-5">
            <div className="flex h-2 overflow-hidden rounded-full bg-sunken" role="img"
              aria-label={`Shop ${money(s.posToday)}, online ${money(s.onlineToday)}`}>
              {total > 0 && <>
                <span className="h-full bg-chart-shop" style={{ width: `${posShare * 100}%` }} />
                <span className="h-full w-0.5 shrink-0 bg-surface" />
                <span className="h-full flex-1 bg-chart-online" />
              </>}
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-4 text-small">
              <div><dt className="flex items-center gap-1.5 text-text-2"><span className="h-2 w-2 rounded-[2px] bg-chart-shop" aria-hidden />Shop till</dt>
                <dd className="num mt-0.5 font-semibold">{money(s.posToday)} <span className="font-normal text-text-3">· {plural(s.salesToday, "sale")}</span></dd></div>
              <div><dt className="flex items-center gap-1.5 text-text-2"><span className="h-2 w-2 rounded-[2px] bg-chart-online" aria-hidden />Online</dt>
                <dd className="num mt-0.5 font-semibold">{money(s.onlineToday)} <span className="font-normal text-text-3">· {plural(s.onlineCountToday, "order")}</span></dd></div>
            </dl>
          </div>
        </div>
        <Counter label="Orders to pack" value={s.pending.length} attention={s.pending.length > 0} href="/staff/orders"
          sub={<>{s.inProgress} more in progress</>} cta="Open orders" />
        <Counter label="Items to restock" value={restock} attention={restock > 0} href="/staff/inventory?level=attention"
          sub={<>{s.out.length} out of stock · {s.low.length} running low</>} cta="Open inventory" />
      </section>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel title="Sales, last 7 days" id="chart-t" description="Shop till and paid online orders, KES" bodyClassName="px-5 pb-5">
          <SalesChart days={s.days} />
        </Panel>

        <Panel title="Top sellers" id="top-t" description="Last 7 days, by revenue">
          {s.top.length === 0 ? <p className="px-5 pb-8 pt-4 text-center text-sm text-text-3">No sales in the last 7 days.</p> : (
            <ol className="divide-y divide-line border-t border-line">
              {s.top.map((t, i) => (
                <li key={t.productId} className="flex items-center gap-3 px-5 py-2.5">
                  <span className="num w-4 text-small font-semibold text-text-3">{i + 1}</span>
                  <ProductImage src={t.image} alt="" className="h-10 w-10 shrink-0 rounded-sm" />
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{t.name}</p><p className="num text-caption text-text-3">{t.qty} sold</p></div>
                  <span className="num text-sm font-semibold">{money(t.revenue)}</span>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel title="Recent online orders" id="ord-t"
          action={<Link href="/staff/orders" className="flex items-center gap-1 text-small font-semibold text-brand-600 hover:text-brand-700">All orders <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link>}>
          <ul className="divide-y divide-line border-t border-line">
            {s.recent.map((o) => (
              <li key={o.id}>
                <Link href={`/staff/orders?open=${o.id}`} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-5 py-3 hover:bg-canvas sm:grid-cols-[5.5rem_minmax(0,1fr)_auto_6.5rem]">
                  <span className="num text-sm font-semibold">{o.number}</span>
                  <span className="min-w-0 truncate text-sm">{o.customer.name} <span className="text-text-3">· {o.fulfilment === "pickup" ? "Pickup" : "Delivery"} · {timeAgo(o.createdAt)}</span></span>
                  <span className="col-start-2 row-start-2 flex items-center gap-1.5 sm:col-start-auto sm:row-start-auto"><StatusBadge status={o.status} /><PaymentBadge status={o.paymentStatus} /></span>
                  <span className="num col-start-3 row-start-1 text-right text-sm font-semibold sm:col-start-auto">{money(o.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-6">
          <Panel title="Stock alerts" id="low-t"
            action={<Link href="/staff/inventory?level=attention" className="flex items-center gap-1 text-small font-semibold text-brand-600 hover:text-brand-700">Inventory <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link>}>
            {restock === 0 ? <p className="border-t border-line px-5 py-6 text-sm text-text-3">Everything is well stocked.</p> : (
              <ul className="max-h-72 divide-y divide-line overflow-y-auto border-t border-line">
                {[...s.out, ...s.low].slice(0, 8).map(({ p, v }) => (
                  <li key={v.id} className="flex items-center gap-3 px-5 py-2.5 text-sm">
                    <span className="min-w-0 flex-1 truncate">{p.name} <span className="text-text-3">· {v.label}</span></span>
                    <Badge tone={v.stock <= 0 ? "danger" : "warning"} dot>{v.stock <= 0 ? "Out" : `${v.stock} left`}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Activity" id="act-t">
            <ul className="space-y-3 border-t border-line px-5 py-4">
              {s.activity.map((a) => (
                <li key={a.id} className="flex gap-3 text-sm">
                  <span className={cx("mt-1.5 h-2 w-2 shrink-0 rounded-full", KIND_DOT[a.kind])} aria-hidden />
                  <p className="min-w-0 flex-1"><b className="font-semibold">{a.actor}</b> {a.text}<span className="num block text-caption text-text-3" title={fmtTime(a.at)}>{timeAgo(a.at)}</span></p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
      <p className="mt-6 flex items-center gap-2 text-caption text-text-3"><Boxes className="h-3.5 w-3.5" aria-hidden /> Catalogue prices and stock are demonstration values, not the shop’s real figures.</p>
    </div>
  );
}
