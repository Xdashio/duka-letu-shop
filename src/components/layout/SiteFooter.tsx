"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, MapPin, Phone, Lock } from "lucide-react";
import { useApp } from "@/hooks/useApp";
import { LogoMark } from "../shared/bits";

export function SiteFooter() {
  const snap = useApp();
  const pathname = usePathname();
  const s = snap?.data.settings;
  const cats = snap?.data.categories ?? [];
  const name = s?.shopName ?? "Duka Letu";
  const year = new Date().getFullYear();

  // Checkout: no exits. Just the legal line.
  if (pathname.startsWith("/checkout")) {
    return (
      <footer className="mt-16 border-t border-line print:hidden">
        <p className="container-page py-6 text-caption text-text-3">© {year} {name} · Prices in Kenyan shillings (KES) · Your details are only used for this order.</p>
      </footer>
    );
  }

  const head = "mb-3 text-caption font-semibold text-white";
  const link = "text-white/70 transition-colors hover:text-white";
  return (
    <footer className="mt-20 bg-ink-900 text-sm text-white/70 print:hidden">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1.4fr_0.8fr_1.1fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <LogoMark className="h-8 w-8" inverse />
            <span className="font-display text-[1.1875rem] font-semibold tracking-tight text-white">{name}</span>
          </Link>
          <p className="mt-3 max-w-xs">Lighting, torches, audio, power, tools and home goods from our shop to your door. Order online, pay with M-Pesa.</p>
        </div>
        <nav aria-labelledby="f-shop">
          <h2 id="f-shop" className={`${head} font-sans tracking-normal`}>Shop</h2>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
            {cats.map((c) => <li key={c.id}><Link href={`/category/${c.slug}`} className={link}>{c.name}</Link></li>)}
          </ul>
        </nav>
        <nav aria-labelledby="f-help">
          <h2 id="f-help" className={`${head} font-sans tracking-normal`}>Help</h2>
          <ul className="space-y-2">
            <li><Link href="/track" className={link}>Track an order</Link></li>
            <li><Link href="/cart" className={link}>Your cart</Link></li>
            <li><Link href="/#delivery" className={link}>Delivery & pickup</Link></li>
          </ul>
        </nav>
        <div>
          <h2 className={`${head} font-sans tracking-normal`}>Visit the shop</h2>
          <ul className="space-y-2.5">
            <li className="flex gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/50" aria-hidden />{s?.address}</li>
            <li className="flex gap-2.5"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-white/50" aria-hidden />{s?.hours}</li>
            <li className="flex gap-2.5"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-white/50" aria-hidden /><a href={`tel:${s?.phone?.replace(/\s/g, "")}`} className={`num ${link}`}>{s?.phone}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-wrap items-center gap-x-6 gap-y-2 py-4 text-caption text-white/60">
          <span>© {year} {name}. Prices in Kenyan shillings (KES).</span>
          <Link href="/staff/login" className="ml-auto flex items-center gap-1.5 hover:text-white">
            <Lock className="h-3 w-3" aria-hidden /> Staff login
          </Link>
        </div>
      </div>
    </footer>
  );
}
