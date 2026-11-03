"use client";

import { useState } from "react";
import { UserPlus, Pencil, KeyRound, Power } from "lucide-react";
import type { Role, Staff } from "@/types";
import { useStaff } from "@/hooks/useApp";
import { resetPin, saveStaff, setStaffActive } from "@/lib/actions";
import { ROLE_LABEL, ROLE_SUMMARY } from "@/lib/permissions";
import { fmtDate, fmtPhone } from "@/lib/format";
import { useToast } from "../shared/toast";
import { Badge, Button, ConfirmDialog, Dialog, Field, Input, Skeleton, cx } from "../shared/ui";
import { PageHeader } from "./StaffShell";

function StaffForm({ initial, onClose }: { initial: Partial<Staff>; onClose: () => void }) {
  const { attempt } = useToast();
  const [name, setName] = useState(initial.name ?? "");
  const [username, setUsername] = useState(initial.username ?? "");
  const [phone, setPhone] = useState(initial.phone ? "0" + initial.phone.slice(3) : "");
  const [role, setRole] = useState<Role>(initial.role ?? "cashier");
  const [pin, setPin] = useState("");
  const isNew = !initial.id;
  return (
    <Dialog open onClose={onClose} title={isNew ? "Add staff member" : `Edit ${initial.name}`}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="sform">{isNew ? "Add staff" : "Save"}</Button></>}>
      <form id="sform" noValidate className="space-y-4" onSubmit={(e) => {
        e.preventDefault();
        if (attempt(() => saveStaff({ id: initial.id, name, username, role, phone: phone || undefined, pin: isNew ? pin : undefined }), isNew ? `${name} added` : "Saved")) onClose();
      }}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="s-name"><Input id="s-name" value={name} onChange={(e) => setName(e.target.value)} data-autofocus /></Field>
          <Field label="Username" htmlFor="s-user" hint="Used to sign in."><Input id="s-user" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} autoCapitalize="none" aria-describedby="s-user-hint" /></Field>
          <Field label="Phone" optional htmlFor="s-phone"><Input id="s-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
          {isNew && <Field label="4-digit PIN" htmlFor="s-pin"><Input id="s-pin" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} className="num tracking-[0.3em]" /></Field>}
        </div>
        <fieldset>
          <legend className="mb-2 text-small font-semibold">Role</legend>
          <div className="grid gap-2">
            {(["owner", "cashier", "stock"] as Role[]).map((r) => (
              <label key={r} htmlFor={`role-${r}`} className={cx("flex cursor-pointer items-start gap-3 rounded-sm p-3 transition-shadow", role === r ? "ring-2 ring-ink-900" : "ring-1 ring-field hover:ring-text")}>
                <input id={`role-${r}`} type="radio" name="role" checked={role === r} onChange={() => setRole(r)} className="mt-1 accent-ink-900" />
                <span className="text-sm"><b>{ROLE_LABEL[r]}</b><span className="block text-small text-text-2">{ROLE_SUMMARY[r]}</span></span>
              </label>
            ))}
          </div>
        </fieldset>
      </form>
    </Dialog>
  );
}

export function TeamPage() {
  const { snap, staff: me } = useStaff();
  const { attempt } = useToast();
  const [editing, setEditing] = useState<Partial<Staff> | null>(null);
  const [pinFor, setPinFor] = useState<Staff | null>(null);
  const [newPin, setNewPin] = useState("");
  const [toggle, setToggle] = useState<Staff | null>(null);

  if (!snap) return <><Skeleton className="mb-6 h-9 w-40" /><Skeleton className="h-72 rounded-md" /></>;
  const list = [...snap.data.staff].sort((a, b) => Number(b.active) - Number(a.active) || a.name.localeCompare(b.name));

  return (
    <div>
      <PageHeader title="Staff" sub="Each person signs in with their own username and PIN. Their role decides what they can see and do."
        actions={<Button onClick={() => setEditing({})}><UserPlus className="h-4 w-4" aria-hidden /> Add staff</Button>} />
      <ul className="divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
        {list.map((st) => (
          <li key={st.id} className={cx("flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3.5 sm:px-5", !st.active && "bg-canvas/60")}>
            <span className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-small font-semibold ring-1 ring-inset", st.active ? "bg-sunken text-text ring-line" : "bg-canvas text-text-3 ring-line")} aria-hidden>
              {st.name.split(" ").map((x) => x[0]).slice(0, 2).join("")}
            </span>
            <div className="min-w-0 flex-1 basis-48">
              <h2 className={cx("truncate font-sans text-sm font-semibold tracking-normal", !st.active && "text-text-2")}>{st.name}{st.id === me?.id && <span className="font-normal text-text-3"> (you)</span>}</h2>
              <p className="num truncate text-caption text-text-3">@{st.username}{st.phone && ` · ${fmtPhone(st.phone)}`} · added {fmtDate(st.createdAt)}</p>
            </div>
            <div className="flex w-40 flex-wrap items-center gap-1.5">
              <Badge tone={st.role === "owner" ? "ink" : "neutral"}>{ROLE_LABEL[st.role]}</Badge>
              {!st.active && <Badge tone="warning" dot>Deactivated</Badge>}
            </div>
            <div className="ml-auto flex flex-wrap gap-0.5">
              <Button size="sm" variant="ghost" onClick={() => setEditing(st)}><Pencil className="h-3.5 w-3.5" aria-hidden /> Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => { setPinFor(st); setNewPin(""); }}><KeyRound className="h-3.5 w-3.5" aria-hidden /> Reset PIN</Button>
              {st.id !== me?.id && (
                <Button size="sm" variant="ghost" onClick={() => setToggle(st)} className={st.active ? "hover:!text-danger-600" : "!text-success-600"}>
                  <Power className="h-3.5 w-3.5" aria-hidden /> {st.active ? "Deactivate" : "Reactivate"}
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-caption text-text-3">Demo PINs are stored in this browser only. The production system would use hashed credentials on a server.</p>

      {editing && <StaffForm initial={editing} onClose={() => setEditing(null)} />}
      {pinFor && (
        <Dialog open onClose={() => setPinFor(null)} size="sm" title={`Reset PIN for ${pinFor.name}`}
          footer={<><Button variant="secondary" onClick={() => setPinFor(null)}>Cancel</Button><Button type="submit" form="pinform">Set PIN</Button></>}>
          <form id="pinform" onSubmit={(e) => { e.preventDefault(); if (attempt(() => { resetPin(pinFor.id, newPin); return true; }, `PIN updated for ${pinFor.name}`)) setPinFor(null); }}>
            <Field label="New 4-digit PIN" htmlFor="np" hint="Tell them in person. They sign in with it straight away.">
              <Input id="np" inputMode="numeric" maxLength={4} value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))} className="num tracking-[0.3em]" data-autofocus aria-describedby="np-hint" />
            </Field>
          </form>
        </Dialog>
      )}
      <ConfirmDialog open={!!toggle} onClose={() => setToggle(null)} tone={toggle?.active ? "danger" : "primary"}
        title={toggle?.active ? `Deactivate ${toggle?.name}?` : `Reactivate ${toggle?.name}?`} confirmLabel={toggle?.active ? "Deactivate" : "Reactivate"}
        body={toggle?.active ? "They won’t be able to sign in. Their past sales and stock changes stay in the records." : "They can sign in again with their existing PIN."}
        onConfirm={() => { if (toggle && attempt(() => { setStaffActive(toggle.id, !toggle.active); return true; }, `${toggle.name} ${toggle.active ? "deactivated" : "reactivated"}`)) setToggle(null); }} />
    </div>
  );
}
