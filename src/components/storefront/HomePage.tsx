"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Store, Truck, Smartphone, PackageSearch, ShieldCheck, Tags, UserRoundX } from "lucide-react";
import type { Product } from "@/types";
import { useApp } from "@/hooks/useApp";
import { isPublic, priceRange, topSellers } from "@/lib/calculations";
import { money } from "@/lib/format";
import { ProductGrid, ProductGridSkeleton } from "./ProductCard";
import { ProductImage } from "../shared/ProductImage";
import { OpenSign, SectionHead } from "../shared/bits";
import { Skeleton, buttonClass, cx } from "../shared/ui";

/** Category cover photos: chosen for legibility at thumbnail size. */
const CATEGORY_IMAGE: Record<string, string> = {
  lighting: "/products/lamp-solar-shell-1.webp",
  torches: "/products/torch-jc7125-1.webp",
  audio: "/products/speaker-phone-stand-1.webp",
  power: "/products/ext-babastra-4way-1.webp",
  tools: "/products/pliers-aweisi-8-1.webp",
  "home-kitchen": "/products/mini-fan-1.webp",
  security: "/products/cam-panoramic-bulb-1.webp",
  "tv-mounts": "/products/mount-sh45f-1.webp",
  other: "/products/gotv-gotenna-1.webp",
};

/**
 * Hero products: art-directed for the window. These three were shot on light
 * backgrounds and read clearly at large size. Falls back to featured items if
 * any are hidden or deleted.
 */
const HERO_IDS = ["speaker-phone-stand", "torch-jc7125", "mini-fan"];
/** Window crops of catalogue photos (watermark and edge clutter removed); the catalogue keeps the originals. */
const HERO_IMAGE: Record<string, string> = { "speaker-phone-stand": "/products/hero/speaker-phone-stand.webp" };

function SeeAll({ href, label = "See all" }: { href: string; label?: string }) {
  return (
    <Link href={href} className="flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
      {label} <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}

function HeroTile({ p, large, priority }: { p: Product; large?: boolean; priority?: boolean }) {
  const [lo, hi] = priceRange(p);
  return (
    <Link href={`/product/${p.slug}`}
      className={cx("group flex h-full min-h-0 flex-col rounded-md bg-surface p-2.5 ring-1 ring-line transition-shadow hover:shadow-pop", large && "sm:p-3")}>
      <ProductImage src={HERO_IMAGE[p.id] && p.images[0] === `/products/${p.id}-1.webp` ? HERO_IMAGE[p.id] : p.images[0]} alt="" priority={priority}
        className="min-h-0 flex-1 rounded-sm transition-transform duration-300 [&_img]:transition-transform [&_img]:duration-500 group-hover:[&_img]:scale-[1.03] motion-reduce:[&_img]:transform-none" />
      <span className="flex items-baseline justify-between gap-3 px-1 pb-0.5 pt-2.5">
        <span className={cx("min-w-0 truncate font-medium", large ? "text-sm" : "text-small")}>{p.name}</span>
        <span className="num shrink-0 text-sm font-semibold">{lo !== hi && <span className="mr-1 text-caption font-normal text-text-3">from</span>}{money(lo)}</span>
      </span>
    </Link>
  );
}

export function HomePage() {
  const snap = useApp();
  const data = snap?.data;
  const threshold = data?.settings.lowStockThreshold ?? 5;

  const sets = useMemo(() => {
    if (!data) return null;
    const live = data.products.filter(isPublic);
    const byId = new Map(live.map((p) => [p.id, p]));
    const inStock = (p: Product) => p.variants.some((v) => v.stock > 0);
    const used = new Set<string>();
    const take = (list: (Product | undefined)[], n: number) => {
      const out: Product[] = [];
      for (const p of list) { if (p && !used.has(p.id) && out.length < n) { out.push(p); used.add(p.id); } }
      return out;
    };
    const featuredAll = live.filter((p) => p.featured && inStock(p));
    const hero = take([...HERO_IDS.map((id) => byId.get(id)).filter((p) => p && inStock(p)), ...featuredAll], 3);
    const featured = take(featuredAll.concat(live.filter(inStock)), 8);
    const popular = take(topSellers(data, 30, Date.now(), 24).map((t) => byId.get(t.productId)).filter((p) => p && inStock(p)), 4);
    const fresh = take([...live].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), 4);
    const counts = new Map<string, number>();
    live.forEach((p) => counts.set(p.categoryId, (counts.get(p.categoryId) ?? 0) + 1));
    return { hero, featured, popular, fresh, counts, total: live.length };
  }, [data]);

  const s = data?.settings;
  const zones = s?.zones ?? [];
  const minFee = zones.length ? Math.min(...zones.map((z) => z.fee)) : 0;

  return (
    <div className="flex flex-col">
      {/* ── Hero: the shop window ── */}
      <section className="container-page order-1 pt-4 md:pt-6" aria-labelledby="hero-title">
        <div className="grid grid-cols-[minmax(0,1fr)] overflow-hidden rounded-lg bg-canvas lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)]">
          <div className="flex flex-col justify-center px-5 pb-6 pt-6 sm:px-8 md:py-10 lg:px-10 xl:px-12">
            <OpenSign hours={s?.hours} className="mb-4" />
            <h1 id="hero-title" className="max-w-[17ch] text-[1.75rem] leading-[1.08] tracking-[-0.022em] sm:text-[2.5rem] lg:text-[2.25rem] xl:text-display">
              Light, power & sound from the shop down the road.
            </h1>
            <p className="mt-4 max-w-[42ch] text-body text-text-2 sm:text-[1.0625rem]">
              Bulbs, torches, speakers, sockets and kitchen goods. The same stock we sell over the counter, with a clear price on every item.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link href="/products" className={buttonClass("primary", "lg")}>
                Shop all {sets ? sets.total : ""} products <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/track" className={buttonClass("link")}><PackageSearch className="h-4 w-4" aria-hidden /> Track an order</Link>
            </div>
            <ul className="mt-8 hidden max-w-md grid-cols-3 gap-4 border-t border-line-strong/60 pt-5 text-small text-text-2 sm:grid">
              <li><Store className="mb-1.5 h-[18px] w-[18px] text-text" aria-hidden /><b className="block font-semibold text-text">Free pickup</b>at the counter</li>
              <li><Truck className="mb-1.5 h-[18px] w-[18px] text-text" aria-hidden /><b className="block font-semibold text-text">Delivery</b>from <span className="num">{money(minFee || 100)}</span></li>
              <li><Smartphone className="mb-1.5 h-[18px] w-[18px] text-text" aria-hidden /><b className="block font-semibold text-text">M-Pesa</b>Till or Paybill</li>
            </ul>
          </div>

          {/* Product trio: real, clickable stock. Swipe row on mobile, composed grid from lg. */}
          <div className="pb-5 lg:p-5 lg:pl-0 xl:p-6 xl:pl-0">
            {sets ? (
              <>
                <ul className="scroll-row gap-3 px-5 sm:px-8 lg:hidden" aria-label="In the window this week">
                  {sets.hero.map((p, i) => <li key={p.id} className="h-[260px] w-[64%] shrink-0 sm:w-[38%]"><HeroTile p={p} priority={i === 0} /></li>)}
                </ul>
                <ul className="hidden h-full min-h-[400px] grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] grid-rows-2 gap-3 lg:grid" aria-label="In the window this week">
                  {sets.hero.map((p, i) => <li key={p.id} className={cx("min-h-0 min-w-0", i === 0 && "row-span-2")}><HeroTile p={p} large={i === 0} priority /></li>)}
                </ul>
              </>
            ) : <Skeleton className="mx-5 h-[260px] lg:mx-0 lg:h-full lg:min-h-[400px]" />}
          </div>
        </div>
      </section>

      {/* ── Departments (after Featured on phones: the header already has a category row there) ── */}
      <section id="categories" className="container-page order-3 scroll-mt-28 pt-14 lg:order-2 lg:pt-12" aria-labelledby="cat-title">
        <SectionHead id="cat-title" title="Shop by department" action={<SeeAll href="/products" label="All products" />} />
        <ul className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3">
          {(data?.categories ?? []).map((c) => (
            <li key={c.id}>
              <Link href={`/category/${c.slug}`}
                className="group flex h-full items-center gap-3 rounded-md bg-surface p-2 ring-1 ring-line transition-shadow hover:shadow-pop hover:ring-line-strong sm:gap-4 sm:p-2.5">
                <ProductImage src={CATEGORY_IMAGE[c.id]} alt="" className="h-14 w-14 shrink-0 rounded-sm sm:h-16 sm:w-16" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold leading-tight">{c.name}</span>
                  <span className="mt-0.5 hidden truncate text-small text-text-3 sm:block">{c.blurb}</span>
                  <span className="num mt-0.5 block text-caption text-text-3 sm:hidden">{sets?.counts.get(c.id) ?? 0} items</span>
                </span>
                <span className="num hidden shrink-0 pr-2 text-small text-text-3 sm:block">{sets?.counts.get(c.id) ?? 0}</span>
              </Link>
            </li>
          ))}
          {!data && Array.from({ length: 9 }, (_, i) => <li key={i}><Skeleton className="h-[76px] rounded-md" /></li>)}
        </ul>
      </section>

      {/* ── Featured ── */}
      <section className="container-page order-2 pt-12 lg:order-3 lg:pt-14" aria-labelledby="feat-title">
        <SectionHead id="feat-title" title="Featured" sub="Picked from the shop floor this week" action={<SeeAll href="/products" />} />
        {sets ? <ProductGrid products={sets.featured} threshold={threshold} priorityCount={0} /> : <ProductGridSkeleton count={8} />}
      </section>

      {/* ── Pickup, delivery & payment: one compact band ── */}
      <section id="delivery" className="order-4 mt-16 scroll-mt-28 border-y border-line bg-canvas" aria-labelledby="del-title">
        <div className="container-page py-10 md:py-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2fr)] lg:gap-12">
            <div>
              <h2 id="del-title" className="text-heading">Collect it or have it brought to you</h2>
              <p className="mt-2 max-w-sm text-sm text-text-2">Order online, then pick up at the counter or get it delivered in town. Track any order with its number and your phone.</p>
              <ul className="mt-5 space-y-2 text-small text-text-2">
                <li className="flex items-center gap-2"><Tags className="h-4 w-4 text-text-3" aria-hidden /> Every size and colour shows its own price</li>
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-text-3" aria-hidden /> Live stock, the same count our till uses</li>
                <li className="flex items-center gap-2"><UserRoundX className="h-4 w-4 text-text-3" aria-hidden /> No account needed to order</li>
              </ul>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-md bg-surface p-5 ring-1 ring-line">
                <Store className="h-5 w-5" aria-hidden />
                <h3 className="mt-3 font-sans text-sm font-semibold tracking-normal">Shop pickup · Free</h3>
                <p className="mt-1 text-small text-text-2">We tell you when it&rsquo;s packed. Pay by M-Pesa or cash at the counter.</p>
                <OpenSign hours={s?.hours} className="mt-3" />
              </div>
              <div className="rounded-md bg-surface p-5 ring-1 ring-line">
                <Truck className="h-5 w-5" aria-hidden />
                <h3 className="mt-3 font-sans text-sm font-semibold tracking-normal">Town delivery</h3>
                <dl className="mt-2 divide-y divide-line text-small">
                  {zones.map((z) => (
                    <div key={z.id} className="flex justify-between gap-2 py-1.5">
                      <dt className="min-w-0 text-text-2"><span className="font-medium text-text">{z.name}</span> <span className="hidden xl:inline">· {z.areas}</span></dt>
                      <dd className="num font-semibold">{money(z.fee)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="rounded-md bg-surface p-5 ring-1 ring-line">
                <Smartphone className="h-5 w-5" aria-hidden />
                <h3 className="mt-3 font-sans text-sm font-semibold tracking-normal">Pay with M-Pesa</h3>
                <p className="mt-1 text-small text-text-2">Till or Paybill at checkout; you get a prompt on your phone. Cash only for shop pickup.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {sets && sets.popular.length > 0 && (
        <section className="container-page order-5 pt-14" aria-labelledby="pop-title">
          <SectionHead id="pop-title" title="Popular this month" sub="What customers are buying" />
          <ProductGrid products={sets.popular} threshold={threshold} priorityCount={0} />
        </section>
      )}

      <section className="container-page order-6 pt-14" aria-labelledby="new-title">
        <SectionHead id="new-title" title="New on the shelf" action={<SeeAll href="/products?sort=newest" />} />
        {sets ? <ProductGrid products={sets.fresh} threshold={threshold} priorityCount={0} /> : <ProductGridSkeleton count={4} />}
      </section>
    </div>
  );
}
