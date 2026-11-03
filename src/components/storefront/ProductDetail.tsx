"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PackageX, ShoppingBag, Store, Truck, Smartphone, Check } from "lucide-react";
import { useApp } from "@/hooks/useApp";
import { isPublic, publicVariants } from "@/lib/calculations";
import { addToCart } from "@/lib/actions";
import { money } from "@/lib/format";
import { useToast } from "../shared/toast";
import { ProductImage } from "../shared/ProductImage";
import { Price, SectionHead, StockLine } from "../shared/bits";
import { Button, EmptyState, QtyStepper, Skeleton, buttonClass, cx } from "../shared/ui";
import { ProductGrid } from "./ProductCard";

function optionName(labels: string[]): string {
  if (labels.every((l) => /\d+\s*W\b/.test(l))) return "Wattage";
  if (labels.every((l) => /^[A-Z][a-z]+( \/ [A-Z][a-z]+)?$/.test(l))) return "Colour";
  if (labels.some((l) => /(cm|m cable|"|kg|L\b|mm)/.test(l))) return "Size";
  return "Option";
}

export function ProductDetail({ slug }: { slug: string }) {
  const snap = useApp();
  const router = useRouter();
  const { toast, attempt } = useToast();
  const product = snap?.data.products.find((p) => p.slug === slug);
  const variants = useMemo(() => (product ? publicVariants(product) : []), [product]);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);

  // Default to the first in-stock variant.
  useEffect(() => {
    if (!variants.length) return;
    if (!variantId || !variants.some((v) => v.id === variantId)) setVariantId((variants.find((v) => v.stock > 0) ?? variants[0]).id);
  }, [variants, variantId]);

  if (!snap) {
    return (
      <div className="container-page grid gap-8 pt-8 md:grid-cols-2">
        <Skeleton className="aspect-[4/5] rounded-lg" />
        <div className="space-y-4"><Skeleton className="h-4 w-24" /><Skeleton className="h-9 w-4/5" /><Skeleton className="h-8 w-32" /><Skeleton className="h-24 w-full" /><Skeleton className="h-12 w-full" /></div>
      </div>
    );
  }

  if (!product || !isPublic(product)) {
    return (
      <div className="container-page">
        <h1 className="sr-only">Product not available</h1>
        <EmptyState icon={<PackageX />} title="This product isn't available" body="It may have been removed or is temporarily hidden. Have a look at similar items instead."
          action={<Link href="/products" className={buttonClass("primary")}>Browse products</Link>} />
      </div>
    );
  }

  const data = snap.data;
  const threshold = data.settings.lowStockThreshold;
  const variant = variants.find((v) => v.id === variantId) ?? variants[0];
  const inCart = snap.cart.find((l) => l.productId === product.id && l.variantId === variant.id)?.qty ?? 0;
  const room = Math.max(0, variant.stock - inCart);
  const q = Math.min(Math.max(1, qty), Math.max(1, room));
  const category = data.categories.find((c) => c.id === product.categoryId);
  const related = data.products.filter((p) => p.id !== product.id && p.categoryId === product.categoryId && isPublic(p)).slice(0, 4);
  const optName = optionName(variants.map((v) => v.label));
  const images = product.images.length ? product.images : [""];

  const add = (thenCheckout: boolean) => {
    const r = attempt(() => addToCart(product.id, variant.id, q));
    if (!r) return;
    setQty(1);
    if (thenCheckout) { router.push("/checkout"); return; }
    toast({
      kind: "success",
      title: r.capped ? `Added ${r.added} (all we have)` : `Added ${r.added} to cart`,
      body: `${product.name} · ${variant.label}`,
      action: { label: "View cart", onClick: () => router.push("/cart") },
    });
  };

  const pricesDiffer = new Set(variants.map((v) => v.price)).size > 1;
  const blocked = variant.stock <= 0 || room <= 0;
  const addLabel = variant.stock <= 0 ? "Out of stock" : room <= 0 ? "All in your cart" : "Add to cart";

  return (
    <div className="container-page pt-4 md:pt-6">
      <nav aria-label="Breadcrumb" className="mb-4 text-small text-text-3">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="hover:text-text">Home</Link></li><li aria-hidden>/</li>
          {category && <><li><Link href={`/category/${category.slug}`} className="hover:text-text">{category.name}</Link></li><li aria-hidden>/</li></>}
          <li aria-current="page" className="line-clamp-1 text-text-2">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:gap-10 lg:gap-16">
        {/* Gallery: the photo is mounted on the matte, never cropped */}
        <div className="md:sticky md:top-32 md:self-start">
          <ProductImage src={images[img]} alt={`${product.name}, photo ${img + 1} of ${images.length}`} fit="contain" inset priority
            className="aspect-square rounded-lg md:aspect-[4/5]" />
          {images.length > 1 && (
            <div className="mt-3 flex gap-2" role="group" aria-label="Product photos">
              {images.map((src, i) => (
                <button key={src + i} type="button" onClick={() => setImg(i)} aria-label={`Show photo ${i + 1}`} aria-pressed={i === img}
                  className={cx("w-16 overflow-hidden rounded-sm ring-offset-2 transition-shadow", i === img ? "ring-2 ring-ink-900" : "ring-1 ring-line hover:ring-text-3")}>
                  <ProductImage src={src} alt="" className="aspect-square" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="md:pt-2">
          <p className="eyebrow">{product.brand}{category && <> · {category.name}</>}</p>
          <h1 className="mt-1.5 text-[1.625rem] leading-tight sm:text-title">{product.name}</h1>
          <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <Price value={variant.price} size="xl" />
            <StockLine stock={variant.stock} threshold={threshold} />
          </div>

          {variants.length > 1 && (
            <fieldset className="mt-7">
              <legend className="mb-2.5 text-sm font-semibold">{optName} <span className="font-normal text-text-2">· {variant.label}</span></legend>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => {
                  const out = v.stock <= 0;
                  const sel = v.id === variant.id;
                  return (
                    <button key={v.id} type="button" onClick={() => { setVariantId(v.id); setQty(1); }} aria-pressed={sel}
                      aria-label={`${v.label}${pricesDiffer ? `, ${money(v.price)}` : ""}${out ? ", sold out" : ""}`}
                      className={cx(
                        "flex min-h-10 min-w-14 flex-col justify-center rounded-sm px-3.5 py-1.5 text-left text-sm transition-[box-shadow,background-color]",
                        sel ? "bg-surface ring-2 ring-ink-900" : "bg-surface ring-1 ring-field hover:ring-text",
                        out && "text-text-3",
                      )}>
                      <span className={cx("font-medium", out && "line-through decoration-1")}>{v.label}</span>
                      {(pricesDiffer || out) && <span className="num text-caption text-text-3">{out ? "Sold out" : money(v.price)}</span>}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-3">
            {!blocked && <QtyStepper size="lg" value={q} max={room} onChange={setQty} />}
            <Button size="lg" className="min-w-44 flex-1" onClick={() => add(false)} disabled={blocked}>
              <ShoppingBag className="h-[18px] w-[18px]" aria-hidden /> {addLabel}
            </Button>
            <Button size="lg" variant="secondary" className="max-sm:hidden" onClick={() => add(true)} disabled={blocked}>Buy now</Button>
          </div>
          <div className="mt-3 min-h-5 text-small" aria-live="polite">
            {inCart > 0 && (
              <p className="flex items-center gap-1.5 text-success-600">
                <Check className="h-4 w-4" aria-hidden /> {inCart} in your cart · <Link href="/cart" className="font-semibold underline underline-offset-2">View cart</Link>
              </p>
            )}
          </div>

          <div className="mt-6 border-t border-line pt-6">
            <h2 className="font-sans text-sm font-semibold tracking-normal">About this product</h2>
            <p className="mt-2 max-w-[62ch] text-body leading-relaxed text-text-2">{product.description || "No description yet."}</p>
            <p className="num mt-3 text-caption text-text-3">SKU {variant.sku}</p>
          </div>

          <ul className="mt-6 divide-y divide-line border-y border-line text-sm">
            <li className="flex gap-3 py-3.5"><Store className="mt-0.5 h-[18px] w-[18px] shrink-0 text-text-3" aria-hidden /><span><b className="font-semibold">Free pickup</b> from the shop · <span className="text-text-2">{data.settings.hours}</span></span></li>
            <li className="flex gap-3 py-3.5"><Truck className="mt-0.5 h-[18px] w-[18px] shrink-0 text-text-3" aria-hidden /><span><b className="font-semibold">Delivery in town</b> <span className="text-text-2">from <span className="num">{money(Math.min(...data.settings.zones.map((z) => z.fee)))}</span>, by zone</span></span></li>
            <li className="flex gap-3 py-3.5"><Smartphone className="mt-0.5 h-[18px] w-[18px] shrink-0 text-text-3" aria-hidden /><span><b className="font-semibold">M-Pesa</b> <span className="text-text-2">Till or Paybill, or cash when you collect</span></span></li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16" aria-labelledby="rel-title">
          <SectionHead id="rel-title" title={`More in ${category?.name ?? "this category"}`}
            action={category && <Link href={`/category/${category.slug}`} className="text-sm font-semibold text-brand-600 hover:text-brand-700">See all</Link>} />
          <ProductGrid products={related} threshold={threshold} priorityCount={0} />
        </section>
      )}

      {/* Mobile sticky bar: the same primary action as the page */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 bg-surface px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-bar sm:hidden">
        <div className="min-w-0 flex-1 leading-tight"><Price value={variant.price * q} size="lg" /><span className="block truncate text-caption text-text-3">{q} × {variant.label}</span></div>
        <Button size="lg" onClick={() => add(false)} disabled={blocked}><ShoppingBag className="h-[18px] w-[18px]" aria-hidden /> {blocked ? addLabel : "Add to cart"}</Button>
      </div>
      <div className="h-20 sm:hidden" aria-hidden />
    </div>
  );
}
