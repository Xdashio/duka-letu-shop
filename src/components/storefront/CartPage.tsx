"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ShoppingBag, Trash2, ArrowRight, TriangleAlert, ArrowLeft } from "lucide-react";
import { useApp } from "@/hooks/useApp";
import { cartRows } from "@/lib/calculations";
import { removeFromCart, setCartQty } from "@/lib/actions";
import { money } from "@/lib/format";
import { ProductImage } from "../shared/ProductImage";
import { Price } from "../shared/bits";
import { Button, EmptyState, Notice, QtyStepper, Skeleton, buttonClass } from "../shared/ui";

export function CartPage() {
  const snap = useApp();

  // If stock dropped below what's in the cart (e.g. a shop sale), lower the quantity.
  useEffect(() => {
    if (!snap) return;
    cartRows(snap.data, snap.cart).forEach((r) => {
      if (!r.unavailable && r.overStock) setCartQty(r.product.id, r.variant.id, r.variant.stock);
    });
  }, [snap]);

  if (!snap) {
    return <div className="container-page pt-8"><Skeleton className="mb-6 h-9 w-40" /><div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]"><Skeleton className="h-64" /><Skeleton className="h-56 rounded-lg" /></div></div>;
  }

  const rows = cartRows(snap.data, snap.cart);
  const subtotal = rows.filter((r) => !r.unavailable).reduce((s, r) => s + r.variant.price * Math.min(r.line.qty, r.variant.stock), 0);
  const items = rows.reduce((s, r) => s + r.line.qty, 0);
  const problems = rows.filter((r) => r.unavailable || r.overStock);
  const minFee = Math.min(...snap.data.settings.zones.map((z) => z.fee));

  if (rows.length === 0) {
    return (
      <div className="container-page">
        <h1 className="sr-only">Your cart</h1>
        <EmptyState icon={<ShoppingBag />} title="Your cart is empty" body="Browse the shop and add a few things. Your cart is saved on this device."
          action={<Link href="/products" className={buttonClass("primary", "lg")}>Start shopping <ArrowRight className="h-4 w-4" aria-hidden /></Link>} />
      </div>
    );
  }

  return (
    <div className="container-page pt-5 md:pt-7">
      <div className="flex items-baseline gap-3">
        <h1 className="text-[1.625rem] sm:text-title">Your cart</h1>
        <p className="num text-sm text-text-2">{items} {items === 1 ? "item" : "items"}</p>
      </div>

      {problems.length > 0 && (
        <Notice tone="warning" icon={<TriangleAlert />} className="mt-5">
          <b>Stock changed since you added some items.</b> Adjust the highlighted items before checking out.
        </Notice>
      )}

      <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
        <ul className="divide-y divide-line border-y border-line">
          {rows.map(({ line, product, variant, unavailable, overStock }) => (
            <li key={`${line.productId}-${line.variantId}`} className="flex gap-4 py-4 sm:gap-5 sm:py-5">
              <Link href={`/product/${product.slug}`} className="shrink-0" tabIndex={-1} aria-hidden>
                <ProductImage src={product.images[0]} alt="" className="h-24 w-20 rounded-md sm:h-[120px] sm:w-24" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Link href={`/product/${product.slug}`} className="line-clamp-2 text-sm font-medium hover:underline sm:text-body">{product.name}</Link>
                    <p className="mt-0.5 text-small text-text-3">{variant.label} · <span className="num">{money(variant.price)}</span> each</p>
                  </div>
                  <Price value={variant.price * Math.min(line.qty, Math.max(variant.stock, 0))} className="shrink-0" />
                </div>
                {unavailable ? (
                  <p className="mt-2 text-small font-semibold text-danger-600">No longer available. Please remove it.</p>
                ) : overStock ? (
                  <p className="mt-2 text-small font-semibold text-warning-600">Only {variant.stock} left, so we lowered your quantity.</p>
                ) : null}
                <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                  {unavailable ? <span /> : (
                    <QtyStepper size="sm" value={Math.min(line.qty, variant.stock)} max={variant.stock}
                      onChange={(n) => setCartQty(product.id, variant.id, n)} label={`Quantity of ${product.name}`} />
                  )}
                  <Button variant="ghost" size="sm" onClick={() => removeFromCart(product.id, variant.id)} aria-label={`Remove ${product.name} from cart`}>
                    <Trash2 className="h-4 w-4" aria-hidden /><span className="hidden sm:inline">Remove</span>
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="rounded-lg bg-canvas p-5 sm:p-6 lg:sticky lg:top-32" aria-labelledby="sum-title">
          <h2 id="sum-title" className="font-sans text-subhead font-semibold tracking-normal">Order summary</h2>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-text-2">Subtotal</dt><dd className="num font-semibold">{money(subtotal)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-text-2">Delivery</dt><dd className="text-right text-text-2">Free pickup, or from <span className="num">{money(minFee)}</span></dd></div>
          </dl>
          <div className="mt-4 flex items-baseline justify-between border-t border-line-strong/60 pt-4">
            <span className="font-semibold">Estimated total</span><Price value={subtotal} size="lg" />
          </div>
          {problems.some((p) => p.unavailable) ? (
            <Button size="lg" block className="mt-5" disabled>Remove unavailable items to continue</Button>
          ) : (
            <Link href="/checkout" className={buttonClass("primary", "lg", "mt-5 w-full")}>
              Go to checkout <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
          <p className="mt-3 text-center text-caption text-text-3">Choose pickup or delivery and pay with M-Pesa on the next step.</p>
          <Link href="/products" className="mt-4 flex items-center justify-center gap-1.5 border-t border-line-strong/60 pt-4 text-sm font-semibold text-brand-600 hover:text-brand-700">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
