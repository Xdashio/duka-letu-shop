"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, FlaskConical, CircleAlert } from "lucide-react";
import { useStaff } from "@/hooks/useApp";
import { login, DomainError } from "@/lib/actions";
import { ROLE_LABEL, ROLE_SUMMARY, can, homeFor, STAFF_NAV } from "@/lib/permissions";
import type { Role } from "@/types";
import { LogoMark } from "../shared/bits";
import { Button, Field, Input, Notice } from "../shared/ui";

const DEMO: { role: Role; username: string; pin: string }[] = [
  { role: "owner", username: "owner", pin: "1234" },
  { role: "cashier", username: "cashier", pin: "2345" },
  { role: "stock", username: "stock", pin: "3456" },
];

export function LoginPage() {
  const { snap, staff } = useStaff();
  const router = useRouter();
  const sp = useSearchParams();
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const go = (role: Role) => {
    const next = sp.get("next");
    const nav = STAFF_NAV.find((n) => next && (next === n.href || next.startsWith(n.href + "/")));
    router.replace(next && next.startsWith("/staff") && nav && can({ role, active: true }, nav.perm) ? next : homeFor(role));
  };

  useEffect(() => { if (staff) go(staff.role); }, [staff]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !/^\d{4}$/.test(pin)) { setError("Enter your username and 4-digit PIN."); return; }
    setBusy(true);
    setTimeout(() => {
      try { login(username, pin); }
      catch (err) { setError(err instanceof DomainError ? err.message : "Could not sign in."); setPin(""); }
      setBusy(false);
    }, 350);
  };

  return (
    <main id="main" className="flex min-h-dvh flex-col bg-canvas">
      <div className="flex items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5"><LogoMark className="h-8 w-8" /><span className="font-display text-[1.125rem] font-semibold tracking-tight">{snap?.data.settings.shopName ?? "Duka Letu"}</span></Link>
        <Link href="/" className="flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"><ArrowLeft className="h-4 w-4" aria-hidden /> Back to the shop</Link>
      </div>

      <div className="flex flex-1 items-start justify-center px-5 pb-12 pt-4 sm:items-center sm:pt-0">
        <div className="w-full max-w-[400px]">
          <div className="rounded-lg border border-line bg-surface p-6 shadow-pop sm:p-8">
            <h1 className="text-[1.5rem]">Staff sign in</h1>
            <p className="mt-1 text-sm text-text-2">Orders, stock and the till, from one count.</p>

            <form onSubmit={submit} noValidate className="mt-6 space-y-4">
              <Field label="Username" htmlFor="l-user">
                <Input id="l-user" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} value={username} onChange={(e) => { setUsername(e.target.value); setError(null); }} />
              </Field>
              <Field label="PIN" htmlFor="l-pin" hint="4 digits">
                <Input id="l-pin" name="password" type="password" inputMode="numeric" autoComplete="current-password" maxLength={4} value={pin}
                  onChange={(e) => { setPin(e.target.value.replace(/\D/g, "").slice(0, 4)); setError(null); }} className="num tracking-[0.4em]" aria-describedby="l-pin-hint" />
              </Field>
              {error && <Notice tone="danger" icon={<CircleAlert />}><span role="alert">{error}</span></Notice>}
              <Button type="submit" size="lg" block loading={busy} disabled={!snap}>Sign in</Button>
            </form>
          </div>

          <div className="mt-5 px-1">
            <p className="flex items-center gap-1.5 text-small font-semibold text-text"><FlaskConical className="h-3.5 w-3.5 text-marigold-600" aria-hidden /> Demo accounts</p>
            <p className="mt-0.5 text-caption text-text-3">For demonstration only. Not production authentication.</p>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {DEMO.map((d) => (
                <li key={d.role} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="font-medium">{ROLE_LABEL[d.role]} <span className="num font-normal text-text-3">· {d.username} / {d.pin}</span></p>
                    <p className="text-caption text-text-3">{ROLE_SUMMARY[d.role]}</p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => { setUsername(d.username); setPin(d.pin); setError(null); }} aria-label={`Fill in ${ROLE_LABEL[d.role]} demo login`}>Use</Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
