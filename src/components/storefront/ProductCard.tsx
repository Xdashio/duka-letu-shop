"use client";

import Link from "next/link";
import { Plus, Check } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/types";
import { priceRange, productStockLevel, publicVariants } from "@/lib/calculations";
import { addToCart } from "@/lib/actions";
import { money } from "@/lib/format";
import { useToast } from "../shared/toast";
import { ProductImage } from "../shared/ProductImage";
import { Badge, cx } from "../shared/ui";

const NEW_DAYS = 14;

function optionSummary(p: Product): string | null {
  const vs = publicVariants(p);
  if (vs.length < 2) return null;
  const colourish = vs.every((v) => /^[A-Z][a-z]+( \/ [A-Z][a-z]+)?$/.test(v.label));
  return `${vs.length} ${colourish ? "colours" : "options"}`;
}

export function ProductCard({ product: p, threshold, priority }: { product: Product; threshold: number; priority?: boolean }) {
  const { toast, attempt } = useToast();
  const [justAdded, setJustAdded] = useState(false);
  const vs = publicVariants(p);
  const [lo, hi] = priceRange(p);
  const level = productStockLevel(p, threshold);
  const isNew = Date.now() - new Date(p.createdAt).getTime() < NEW_DAYS * 86_400_000;
  const opts = optionSummary(p);
  const single = vs.length === 1 ? vs[0] : null;
  const href = `/product/${p.slug}`;
  // One badge at most, most important first.
  const badge = level === "out" ? <Badge tone="neutral">Sold out</Badge> : level === "low" ? <Badge tone="warning" dot>Few left</Badge> : isNew ? <Badge tone="ink">New</Badge> : null;

  return (
    <article className="group relative flex h-full flex-col">
      <Link href={href} className="relative block overflow-hidden rounded-md" tabIndex={-1} aria-hidden>
        <ProductImage src={p.images[0]} alt="" priority={priority}
          className={cx("aspect-[4/5] transition-transform duration-300 ease-out group-hover:scale-[1.025] motion-reduce:transform-none", level === "out" && "opacity-60")} />
        {badge && <span className="pointer-events-none absolute left-2.5 top-2.5">{badge}</span>}
      </Link>
      <div className="flex flex-1 flex-col pt-3">
        <p className="eyebrow truncate">{p.brand}</p>
        <h3 className="mt-0.5 font-sans text-sm font-medium leading-snug tracking-normal">
          <Link href={href} className="line-clamp-2 min-h-[2.75em] after:absolute after:inset-0 after:content-[''] group-hover:underline group-hover:decoration-line-strong group-hover:underline-offset-2 focus:outline-none">
            {p.name}
          </Link>
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2.5">
          <div className="min-w-0 leading-tight">
            <p className="num text-body font-semibold">
              {lo !== hi && <span className="mr-1 text-small font-normal text-text-3">from</span>}{money(lo)}
            </p>
            {opts && <p className="mt-0.5 text-caption text-text-3">{opts}</p>}
          </div>
          {single ? (
            <button
              type="button"
              disabled={level === "out"}
              onClick={() => {
                const r = attempt(() => addToCart(p.id, single.id, 1));
                if (r) {
                  setJustAdded(true);
                  setTimeout(() => setJustAdded(false), 1400);
                  toast({ kind: "success", title: "Added to cart", body: p.name });
                }
              }}
              aria-label={level === "out" ? `${p.name} is sold out` : `Add ${p.name} to cart`}
              className={cx(
                "relative z-10 inline-flex h-9 shrink-0 items-center gap-1 rounded-sm px-3 text-small font-semibold transition-colors",
                level === "out" ? "bg-sunken text-text-3" : justAdded ? "bg-success-600 text-white" : "bg-ink-900 text-white hover:bg-ink-700",
              )}
            >
              {justAdded ? <Check className="h-4 w-4" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />}
              {level === "out" ? "Sold out" : justAdded ? "Added" : "Add"}
            </button>
          ) : (
            <span className="relative z-10 inline-flex h-9 shrink-0 items-center rounded-sm px-3 text-small font-semibold text-text ring-1 ring-inset ring-line-strong transition-colors group-hover:ring-text-3" aria-hidden>
              Options
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

const GRID = "grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4";

export function ProductGrid({ products, threshold, className, priorityCount = 4 }: { products: Product[]; threshold: number; className?: string; priorityCount?: number }) {
  return (
    <ul className={cx(GRID, className)}>
      {products.map((p, i) => <li key={p.id}><ProductCard product={p} threshold={threshold} priority={i < priorityCount} /></li>)}
    </ul>
  );
}

export function ProductGridSkeleton({ count = 8, className }: { count?: number; className?: string }) {
  return (
    <ul className={cx(GRID, className)} aria-label="Loading products">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <div className="skeleton aspect-[4/5] rounded-md" />
          <div className="space-y-2 pt-3">
            <div className="skeleton h-3 w-14 rounded-xs" />
            <div className="skeleton h-4 w-full rounded-xs" />
            <div className="skeleton h-4 w-2/3 rounded-xs" />
            <div className="flex justify-between pt-1"><div className="skeleton h-5 w-20 rounded-xs" /><div className="skeleton h-9 w-16 rounded-sm" /></div>
          </div>
        </li>
      ))}
    </ul>
  );
}
