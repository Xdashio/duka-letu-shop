"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, PackageSearch, ChevronRight, Lock, ArrowLeft } from "lucide-react";
import { useApp } from "@/hooks/useApp";
import { cartCount } from "@/lib/calculations";
import { money } from "@/lib/format";
import { Icon, LogoMark, OpenSign } from "../shared/bits";
import { Button, Drawer, cx } from "../shared/ui";

function SearchBox({ id, className }: { id: string; className?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();
  const [q, setQ] = useState("");
  useEffect(() => { setQ(pathname === "/products" ? params.get("q") ?? "" : ""); }, [params, pathname]);
  return (
    <form
      role="search"
      className={cx("group relative flex w-full", className)}
      onSubmit={(e) => {
        e.preventDefault();
        const t = q.trim();
        router.push(t ? `/products?q=${encodeURIComponent(t)}` : "/products");
      }}
    >
      <label htmlFor={id} className="sr-only">Search products</label>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-text-3" aria-hidden />
      <input
        id={id}
        type="search"
        name="q"
        autoComplete="off"
        spellCheck={false}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search bulbs, speakers, sockets…"
        className="h-11 w-full rounded-md border border-transparent bg-sunken pl-10 pr-24 text-body ring-1 ring-inset ring-line placeholder:text-text-3 transition-[background-color,box-shadow] hover:ring-field focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-600"
      />
      <button type="submit"
        className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2 rounded-sm bg-ink-900 px-3.5 text-small font-semibold text-white hover:bg-ink-700">
        Search
      </button>
    </form>
  );
}

function CategoryLinks({ className, itemClass }: { className?: string; itemClass: (active: boolean) => string }) {
  const snap = useApp();
  const pathname = usePathname();
  const cats = snap?.data.categories ?? [];
  return (
    <ul className={className}>
      <li><Link href="/products" aria-current={pathname === "/products" ? "page" : undefined} className={itemClass(pathname === "/products")}>All products</Link></li>
      {cats.map((c) => {
        const active = pathname === `/category/${c.slug}`;
        return <li key={c.id}><Link href={`/category/${c.slug}`} aria-current={active ? "page" : undefined} className={itemClass(active)}>{c.name}</Link></li>;
      })}
    </ul>
  );
}

function CheckoutHeader({ shopName }: { shopName: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface print:hidden">
      <div className="container-page flex h-16 items-center gap-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${shopName} home`}>
          <LogoMark className="h-8 w-8 shrink-0" />
          <span className="hidden font-display text-[1.125rem] font-semibold tracking-tight sm:inline">{shopName}</span>
        </Link>
        <span className="flex items-center gap-1.5 text-small font-medium text-text-2"><Lock className="h-3.5 w-3.5" aria-hidden /> Secure checkout</span>
        <Link href="/cart" className="ml-auto flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Back to cart
        </Link>
      </div>
    </header>
  );
}

export function SiteHeader() {
  const snap = useApp();
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const count = snap ? cartCount(snap.cart) : 0;
  const s = snap?.data.settings;
  const shopName = s?.shopName ?? "Duka Letu";
  const cats = snap?.data.categories ?? [];
  const minFee = s?.zones.length ? Math.min(...s.zones.map((z) => z.fee)) : null;
  const browsing = pathname === "/" || pathname === "/products" || pathname.startsWith("/category/");
  useEffect(() => { setMenu(false); }, [pathname]);

  if (pathname.startsWith("/checkout")) return <CheckoutHeader shopName={shopName} />;

  return (
    <>
      {/* Announcement line: one message set, light, not sticky */}
      <div className="border-b border-line bg-canvas print:hidden">
        <div className={cx("container-page flex h-9 items-center gap-4 text-small text-text-2", pathname === "/" ? "justify-center md:justify-end" : "justify-between")}>
          {pathname !== "/" && <OpenSign hours={s?.hours} />}
          {pathname === "/" && (
            <p className="truncate md:hidden">Free pickup · Delivery from <span className="num">{money(minFee ?? 100)}</span> · M-Pesa</p>
          )}
          <p className="hidden md:block">
            Free pickup in the shop<span className="mx-2 text-line-strong" aria-hidden>|</span>
            Town delivery{minFee !== null && <> from <span className="num">{money(minFee)}</span></>}<span className="mx-2 text-line-strong" aria-hidden>|</span>
            Pay with M-Pesa
          </p>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur-sm print:hidden supports-[backdrop-filter]:bg-surface/90">
        <div className="container-page flex h-16 items-center gap-2 md:gap-6">
          <Button variant="ghost" size="icon" className="-ml-2.5 text-text lg:hidden" onClick={() => setMenu(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label={`${shopName} home`}>
            <LogoMark className="h-8 w-8 shrink-0" />
            <span className="truncate font-display text-[1.1875rem] font-semibold tracking-tight">{shopName}</span>
          </Link>
          <Suspense fallback={<div className="hidden flex-1 md:block" />}>
            <SearchBox id="search-desktop" className="mx-auto hidden max-w-2xl flex-1 md:flex" />
          </Suspense>
          <nav aria-label="Account and cart" className="ml-auto flex items-center gap-0.5 md:ml-0">
            <Link href="/track" aria-current={pathname === "/track" ? "page" : undefined}
              className="hidden h-10 items-center gap-2 rounded-sm px-3 text-sm font-medium text-text-2 hover:bg-sunken hover:text-text sm:flex">
              <PackageSearch className="h-5 w-5" aria-hidden /> <span className="hidden xl:inline">Track order</span>
            </Link>
            <Link href="/cart" aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`} aria-current={pathname === "/cart" ? "page" : undefined}
              className="relative flex h-10 items-center gap-2 rounded-sm px-2.5 text-sm font-semibold hover:bg-sunken sm:px-3">
              <ShoppingBag className="h-5 w-5" aria-hidden />
              <span className="hidden lg:inline">Cart</span>
              {count > 0 && (
                <span className="num absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-marigold-500 px-1 text-[11px] font-bold text-ink-950 lg:static lg:h-5 lg:min-w-5 lg:text-caption">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>
          </nav>
        </div>

        {/* Desktop categories: quiet text links, active underlined */}
        <nav aria-label="Categories" className="hidden lg:block">
          <CategoryLinks className="container-page -mb-px flex h-11 items-center gap-6 text-small"
            itemClass={(a) => cx("flex h-11 items-center whitespace-nowrap border-b-2 font-medium transition-colors",
              a ? "border-ink-900 text-text" : "border-transparent text-text-2 hover:text-text")} />
        </nav>
      </header>

      {/* Mobile and tablet: search on its own row; categories as a scroll row on browse pages */}
      <div className="border-b border-line bg-surface lg:hidden print:hidden">
        <div className="container-page pb-3 pt-1 md:hidden">
          <Suspense fallback={<div className="h-11" />}><SearchBox id="search-mobile" /></Suspense>
        </div>
        {browsing && (
          <nav aria-label="Categories" className="container-page pb-3 md:pt-3">
            <CategoryLinks className="scroll-row -mx-4 gap-2 px-4 sm:-mx-6 sm:px-6"
              itemClass={(a) => cx("flex h-8 items-center whitespace-nowrap rounded-full px-3.5 text-small font-medium ring-1 ring-inset transition-colors",
                a ? "bg-ink-900 text-white ring-ink-900" : "bg-surface text-text-2 ring-line-strong hover:text-text")} />
          </nav>
        )}
      </div>

      <Drawer open={menu} onClose={() => setMenu(false)} side="left" title="Menu" width="max-w-xs">
        <nav aria-label="Shop by category">
          <p className="eyebrow px-5 pb-1 pt-4">Shop by category</p>
          <ul className="pb-2">
            <li>
              <Link href="/products" className="flex h-12 items-center gap-3 px-5 font-semibold hover:bg-sunken">
                <Icon name="Boxes" className="h-5 w-5 text-text-3" /> All products <ChevronRight className="ml-auto h-4 w-4 text-text-3" aria-hidden />
              </Link>
            </li>
            {cats.map((c) => (
              <li key={c.id}>
                <Link href={`/category/${c.slug}`} aria-current={pathname === `/category/${c.slug}` ? "page" : undefined}
                  className="flex h-12 items-center gap-3 px-5 hover:bg-sunken aria-[current=page]:font-semibold">
                  <Icon name={c.icon} className="h-5 w-5 text-text-3" /> {c.name}
                  <ChevronRight className="ml-auto h-4 w-4 text-text-3" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-line px-5 py-3">
          <Link href="/track" className="flex h-11 items-center gap-3 font-semibold"><PackageSearch className="h-5 w-5 text-text-3" aria-hidden /> Track an order</Link>
          <OpenSign hours={s?.hours} className="mt-2" />
        </div>
      </Drawer>
    </>
  );
}
