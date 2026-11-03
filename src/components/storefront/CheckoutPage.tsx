"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Store, Truck, Smartphone, Banknote, ShoppingBag, Lock, ChevronDown, Landmark } from "lucide-react";
import type { Fulfilment, PaymentMethod } from "@/types";
import { useApp } from "@/hooks/useApp";
import { cartRows } from "@/lib/calculations";
import { placeOrder, DomainError } from "@/lib/actions";
import { money } from "@/lib/format";
import { isEmail, normalizeKePhone } from "@/lib/validation";
import { useToast } from "../shared/toast";
import { ProductImage } from "../shared/ProductImage";
import { Price } from "../shared/bits";
import { Button, EmptyState, Field, Input, Skeleton, Textarea, buttonClass, cx } from "../shared/ui";

type Errors = Partial<Record<"name" | "phone" | "email" | "zone" | "payment", string>>;

function OptionCard({ name, value, checked, onChange, icon, title, desc, aside, disabled }: {
  name: string; value: string; checked: boolean; onChange: () => void; icon: React.ReactNode; title: string; desc: React.ReactNode; aside?: React.ReactNode; disabled?: boolean;
}) {
  const id = `${name}-${value}`;
  return (
    <label htmlFor={id} className={cx(
      "flex cursor-pointer items-start gap-3 rounded-md bg-surface p-4 transition-[box-shadow,background-color]",
      checked ? "ring-2 ring-ink-900" : "ring-1 ring-field hover:ring-text",
      disabled && "cursor-not-allowed bg-sunken opacity-60 hover:ring-field",
    )}>
      <input id={id} type="radio" name={name} value={value} checked={checked} onChange={onChange} disabled={disabled} className="mt-1 h-4 w-4 shrink-0 accent-ink-900" />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2"><span className="font-semibold">{title}</span>{aside}</span>
        <span className="mt-0.5 block text-small text-text-2">{desc}</span>
      </span>
      <span className="mt-0.5 shrink-0 text-text-3 [&_svg]:h-5 [&_svg]:w-5" aria-hidden>{icon}</span>
    </label>
  );
}

function Step({ n, id, title, children }: { n: number; id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="border-t border-line pt-6 first:border-0 first:pt-0">
      <h2 id={id} className="flex items-baseline gap-2.5 font-sans text-subhead font-semibold tracking-normal">
        <span className="num text-text-3">{n}.</span> {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function CheckoutPage() {
  const snap = useApp();
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [fulfilment, setFulfilment] = useState<Fulfilment>("pickup");
  const [zoneId, setZoneId] = useState<string>("");
  const [note, setNote] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("mpesa_till");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const placed = useRef(false);

  // Cash is pickup-only.
  useEffect(() => { if (fulfilment === "delivery" && payment === "cash") setPayment("mpesa_till"); }, [fulfilment, payment]);

  if (!snap) return <div className="container-page pt-8"><Skeleton className="mb-6 h-9 w-48" /><div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]"><Skeleton className="h-[480px]" /><Skeleton className="h-72" /></div></div>;

  const { settings } = snap.data;
  const rows = cartRows(snap.data, snap.cart).filter((r) => !r.unavailable);
  if (rows.length === 0 && !placed.current) {
    return (
      <div className="container-page">
        <h1 className="sr-only">Checkout</h1>
        <EmptyState icon={<ShoppingBag />} title="Nothing to check out" body="Your cart is empty. Add something first."
          action={<Link href="/products" className={buttonClass("primary")}>Browse products</Link>} />
      </div>
    );
  }

  const zone = settings.zones.find((z) => z.id === zoneId);
  const subtotal = rows.reduce((s, r) => s + r.variant.price * Math.min(r.line.qty, r.variant.stock), 0);
  const fee = fulfilment === "delivery" ? zone?.fee ?? 0 : 0;
  const total = subtotal + fee;

  const validate = (): Errors => {
    const e: Errors = {};
    if (name.trim().length < 2) e.name = "Enter your full name.";
    if (!normalizeKePhone(phone)) e.phone = "Enter a Kenyan mobile number, e.g. 0712 345 678.";
    if (email.trim() && !isEmail(email)) e.email = "That email address doesn't look right.";
    if (fulfilment === "delivery" && !zone) e.zone = "Choose your delivery zone.";
    return e;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (busy) return;
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      const first = Object.keys(e)[0];
      document.getElementById(first === "zone" ? "zone-group" : `co-${first}`)?.focus();
      return;
    }
    setBusy(true);
    try {
      const order = placeOrder({ name, phone, email, fulfilment, zoneId: zone?.id, deliveryNote: note, paymentMethod: payment });
      placed.current = true;
      router.push(`/order/${order.id}${payment === "cash" ? "" : "?pay=1"}`);
    } catch (err) {
      setBusy(false);
      toast({ kind: "error", title: err instanceof DomainError ? err.message : "Could not place your order. Please try again." });
    }
  };

  const count = rows.reduce((n, r) => n + Math.min(r.line.qty, r.variant.stock), 0);
  const summaryBody = (
    <>
      <ul className="divide-y divide-line">
        {rows.map(({ product, variant, line }) => (
          <li key={variant.id} className="flex items-center gap-3 py-3">
            <div className="relative shrink-0">
              <ProductImage src={product.images[0]} alt="" className="h-14 w-12 rounded-sm" />
              <span className="num absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink-900 px-1 text-[11px] font-bold text-white ring-2 ring-canvas">{Math.min(line.qty, variant.stock)}</span>
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <p className="line-clamp-2 font-medium leading-snug">{product.name}</p>
              <p className="text-caption text-text-3">{variant.label}</p>
            </div>
            <span className="num text-sm font-semibold">{money(variant.price * Math.min(line.qty, variant.stock))}</span>
          </li>
        ))}
      </ul>
      <dl className="space-y-2 border-t border-line-strong/60 pt-4 text-sm">
        <div className="flex justify-between"><dt className="text-text-2">Subtotal</dt><dd className="num font-semibold">{money(subtotal)}</dd></div>
        <div className="flex justify-between"><dt className="text-text-2">{fulfilment === "pickup" ? "Shop pickup" : `Delivery${zone ? ` · ${zone.name}` : ""}`}</dt>
          <dd className="num font-semibold">{fulfilment === "pickup" ? "Free" : zone ? money(zone.fee) : <span className="font-normal text-text-3">Choose a zone</span>}</dd></div>
      </dl>
      <div className="mt-4 flex items-baseline justify-between border-t border-line-strong/60 pt-4"><span className="font-semibold">Total</span><Price value={total} size="xl" /></div>
    </>
  );

  return (
    <div className="container-page pt-5 md:pt-8">
      <h1 className="text-[1.625rem] sm:text-title">Checkout</h1>

      {/* Phones: the total is visible before the form, details on demand */}
      <details className="group mt-4 rounded-lg bg-canvas lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 [&::-webkit-details-marker]:hidden">
          <span className="text-sm"><b className="font-semibold">Order summary</b> <span className="num text-text-2">· {count} {count === 1 ? "item" : "items"}</span></span>
          <span className="flex items-center gap-2"><Price value={total} /><ChevronDown className="h-4 w-4 text-text-3 transition-transform group-open:rotate-180" aria-hidden /></span>
        </summary>
        <div className="px-4 pb-4">{summaryBody}</div>
      </details>

      <form noValidate onSubmit={submit} className="mt-6 grid items-start gap-8 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-14">
        <div className="space-y-8">
          <Step n={1} id="s1" title="Your details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" htmlFor="co-name" error={errors.name} className="sm:col-span-2">
                <Input id="co-name" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} invalid={!!errors.name} aria-describedby={errors.name ? "co-name-err" : undefined} />
              </Field>
              <Field label="M-Pesa / phone number" htmlFor="co-phone" error={errors.phone} hint="To confirm your order and send the M-Pesa prompt.">
                <Input id="co-phone" name="tel" type="tel" inputMode="tel" autoComplete="tel" placeholder="0712 345 678" value={phone} onChange={(e) => setPhone(e.target.value)} invalid={!!errors.phone}
                  aria-describedby={errors.phone ? "co-phone-err" : "co-phone-hint"} />
              </Field>
              <Field label="Email" optional htmlFor="co-email" error={errors.email} hint="For a copy of your receipt.">
                <Input id="co-email" name="email" type="email" autoComplete="email" spellCheck={false} value={email} onChange={(e) => setEmail(e.target.value)} invalid={!!errors.email}
                  aria-describedby={errors.email ? "co-email-err" : "co-email-hint"} />
              </Field>
            </div>
          </Step>

          <Step n={2} id="s2" title="Pickup or delivery">
            <fieldset className="grid gap-3 sm:grid-cols-2">
              <legend className="sr-only">Fulfilment method</legend>
              <OptionCard name="ful" value="pickup" checked={fulfilment === "pickup"} onChange={() => setFulfilment("pickup")} icon={<Store />}
                title="Pick up in shop" aside={<span className="text-sm font-semibold text-success-600">Free</span>} desc={settings.hours} />
              <OptionCard name="ful" value="delivery" checked={fulfilment === "delivery"} onChange={() => setFulfilment("delivery")} icon={<Truck />}
                title="Deliver in town" aside={<span className="num text-sm text-text-2">from {money(Math.min(...settings.zones.map((z) => z.fee)))}</span>} desc="Brought by our rider. The fee depends on your zone." />
            </fieldset>

            {fulfilment === "delivery" && (
              <div className="anim-fade mt-5 space-y-4">
                <fieldset id="zone-group" tabIndex={-1} aria-describedby={errors.zone ? "zone-err" : undefined} className="focus:outline-none">
                  <legend className="mb-2 text-small font-semibold">Delivery zone</legend>
                  <div className={cx("divide-y divide-line overflow-hidden rounded-md ring-1", errors.zone ? "ring-danger-600" : "ring-field")}>
                    {settings.zones.map((z) => (
                      <label key={z.id} htmlFor={`zone-${z.id}`} className={cx("flex min-h-14 cursor-pointer items-center gap-3 px-4 py-3", zoneId === z.id ? "bg-sunken" : "hover:bg-canvas")}>
                        <input id={`zone-${z.id}`} type="radio" name="zone" checked={zoneId === z.id} onChange={() => setZoneId(z.id)} className="h-4 w-4 accent-ink-900" />
                        <span className="flex-1"><span className="block text-sm font-semibold">{z.name}</span><span className="text-small text-text-2">{z.areas}</span></span>
                        <span className="num text-sm font-semibold">{money(z.fee)}</span>
                      </label>
                    ))}
                  </div>
                  {errors.zone && <p id="zone-err" role="alert" className="mt-1.5 text-small text-danger-600">{errors.zone}</p>}
                </fieldset>
                <Field label="Directions for the rider" optional htmlFor="co-note" hint="Estate, building, landmark or gate colour.">
                  <Textarea id="co-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} aria-describedby="co-note-hint" className="min-h-0" />
                </Field>
              </div>
            )}
          </Step>

          <Step n={3} id="s3" title="Payment">
            <fieldset className="grid gap-3">
              <legend className="sr-only">Payment method</legend>
              <OptionCard name="pay" value="mpesa_till" checked={payment === "mpesa_till"} onChange={() => setPayment("mpesa_till")} icon={<Smartphone />}
                title="M-Pesa Till (Buy Goods)" desc={<>Till number <b className="num font-semibold text-text">{settings.tillNumber}</b>. You&rsquo;ll get a payment prompt on your phone.</>} />
              <OptionCard name="pay" value="mpesa_paybill" checked={payment === "mpesa_paybill"} onChange={() => setPayment("mpesa_paybill")} icon={<Landmark />}
                title="M-Pesa Paybill" desc={<>Business no. <b className="num font-semibold text-text">{settings.paybillNumber}</b>, account: {settings.paybillAccountFormat}.</>} />
              <OptionCard name="pay" value="cash" checked={payment === "cash"} onChange={() => setPayment("cash")} icon={<Banknote />} disabled={fulfilment === "delivery"}
                title="Cash on pickup" desc={fulfilment === "delivery" ? "Only available for shop pickup." : "Pay at the counter when you collect."} />
            </fieldset>
          </Step>

          {/* Phones: the action closes the form */}
          <div className="border-t border-line pt-6 lg:hidden">
            <div className="mb-3 flex items-baseline justify-between"><span className="font-semibold">Total</span><Price value={total} size="lg" /></div>
            <Button type="submit" size="lg" block loading={busy}>{payment === "cash" ? "Place order" : `Place order & pay ${money(total)}`}</Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-caption text-text-3"><Lock className="h-3 w-3" aria-hidden /> Your details are only used for this order.</p>
          </div>
        </div>

        <aside className="hidden rounded-lg bg-canvas p-6 lg:sticky lg:top-24 lg:block" aria-labelledby="sum">
          <h2 id="sum" className="font-sans text-subhead font-semibold tracking-normal">Order summary</h2>
          <div className="mt-2">{summaryBody}</div>
          <Button type="submit" size="lg" block loading={busy} className="mt-5">
            {payment === "cash" ? "Place order" : `Place order & pay ${money(total)}`}
          </Button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-caption text-text-3"><Lock className="h-3 w-3" aria-hidden /> Your details are only used for this order.</p>
        </aside>
      </form>
    </div>
  );
}
