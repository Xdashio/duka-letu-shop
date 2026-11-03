"use client";

import {
  forwardRef, useEffect, useId, useRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode,
  type SelectHTMLAttributes, type TextareaHTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, LoaderCircle, X, CircleAlert, RotateCcw } from "lucide-react";

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/* ───────── Button ─────────
 * primary   ink: the one main action in a view (Add to cart, Place order, Save)
 * accent    amber: reserved for the till's Complete sale and the hero, never more than one per view
 * secondary outlined: alternatives to the primary action
 * ghost     toolbars, row actions
 * danger / success: destructive and money-received confirmations
 * inverse   on ink surfaces
 */
export type ButtonVariant = "primary" | "accent" | "secondary" | "outline" | "ghost" | "danger" | "success" | "inverse" | "link";
export type ButtonSize = "sm" | "md" | "lg" | "icon" | "icon-sm";

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-ink-900 text-white hover:bg-ink-700 active:bg-ink-950 disabled:bg-line-strong disabled:text-white",
  accent: "bg-marigold-500 text-ink-950 hover:bg-marigold-600 disabled:bg-line disabled:text-text-3",
  secondary: "border border-line-strong bg-surface text-text hover:border-text-3 hover:bg-sunken disabled:text-text-3 disabled:hover:bg-surface disabled:hover:border-line-strong",
  outline: "border border-line-strong bg-surface text-text hover:border-text-3 hover:bg-sunken disabled:text-text-3 disabled:hover:bg-surface disabled:hover:border-line-strong",
  ghost: "text-text-2 hover:bg-sunken hover:text-text disabled:text-text-3 disabled:hover:bg-transparent",
  danger: "bg-danger-600 text-white hover:bg-danger-700 disabled:bg-line-strong",
  success: "bg-success-600 text-white hover:bg-success-700 disabled:bg-line-strong",
  inverse: "border border-white/25 bg-white/10 text-white hover:bg-white/20",
  link: "text-brand-600 underline-offset-4 hover:text-brand-700 hover:underline",
};
const SIZE: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-small gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-5 text-body gap-2",
  icon: "h-10 w-10 justify-center",
  "icon-sm": "h-8 w-8 justify-center",
};

/** Class string for anything that should look like a button, including <Link>. */
export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", extra?: string | false) {
  return cx(
    "inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-sm font-semibold transition-[background-color,border-color,color] duration-150 disabled:cursor-not-allowed",
    variant !== "link" && SIZE[size], variant === "link" && "gap-1.5 text-sm",
    VARIANT[variant], extra,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  block?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, block, className, children, disabled, type = "button", ...rest }, ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass(variant, size, cx(block && "w-full", className))}
      {...rest}
    >
      {loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});

/* ───────── Form fields ───────── */

export function Field({ label, hint, error, children, htmlFor, optional, className }: {
  label: ReactNode; hint?: ReactNode; error?: string | null; children: ReactNode; htmlFor: string; optional?: boolean; className?: string;
}) {
  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-small font-semibold text-text">
        {label}{optional && <span className="ml-1 font-normal text-text-3">(optional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-err`} className="flex items-center gap-1.5 text-small text-danger-600" role="alert">
          <CircleAlert className="h-3.5 w-3.5 shrink-0" aria-hidden /> {error}
        </p>
      ) : hint ? <p id={`${htmlFor}-hint`} className="text-small text-text-3">{hint}</p> : null}
    </div>
  );
}

export const fieldBase =
  "h-10 w-full rounded-sm border bg-surface px-3 text-body text-text placeholder:text-text-3 transition-[border-color,box-shadow] duration-150 hover:border-text-3 focus:outline-none focus:ring-3 focus:ring-brand-500/20 disabled:bg-sunken disabled:text-text-3";
const fieldTone = (invalid?: boolean) => (invalid ? "border-danger-600" : "border-field focus:border-brand-600");

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  function Input({ className, invalid, ...rest }, ref) {
    return <input ref={ref} aria-invalid={invalid || undefined} className={cx(fieldBase, fieldTone(invalid), className)} {...rest} />;
  },
);

export function Textarea({ className, invalid, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea aria-invalid={invalid || undefined}
      className={cx(fieldBase, "h-auto min-h-24 py-2 leading-relaxed", fieldTone(invalid), className)} {...rest} />
  );
}

export function Select({ className, invalid, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <div className={cx("relative", className)}>
      <select aria-invalid={invalid || undefined} className={cx(fieldBase, "appearance-none pr-9", fieldTone(invalid))} {...rest}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" aria-hidden />
    </div>
  );
}

export function Checkbox({ id, label, checked, onChange, description, className }: {
  id: string; label: ReactNode; checked: boolean; onChange: (v: boolean) => void; description?: ReactNode; className?: string;
}) {
  return (
    <label htmlFor={id} className={cx("-mx-1.5 flex cursor-pointer items-start gap-2.5 rounded-xs px-1.5 py-1 text-sm hover:bg-sunken", className)}>
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-ink-900" />
      <span className="min-w-0">
        <span className="font-medium">{label}</span>
        {description && <span className="block text-small text-text-3">{description}</span>}
      </span>
    </label>
  );
}

/** On/off switch for an immediate setting (no save step). Label is the accessible name; state is announced. */
export function Switch({ checked, onChange, label, disabled, showText = true }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean; showText?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={() => onChange(!checked)}
      className="group/sw inline-flex min-h-8 shrink-0 items-center gap-2 rounded-sm text-small font-medium disabled:cursor-not-allowed disabled:opacity-50">
      <span className={cx("relative h-5 w-9 rounded-full transition-colors", checked ? "bg-success-600" : "bg-line-strong group-hover/sw:bg-field")} aria-hidden>
        <span className={cx("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-pop transition-transform", checked ? "translate-x-[18px]" : "translate-x-0.5")} />
      </span>
      {showText && <span className={checked ? "text-text" : "text-text-3"} aria-hidden>{checked ? "Live" : "Hidden"}</span>}
    </button>
  );
}

/* ───────── Badge ───────── */

export type Tone = "neutral" | "brand" | "accent" | "success" | "warning" | "danger" | "info" | "ink";
const TONE: Record<Tone, string> = {
  neutral: "bg-sunken text-text-2 ring-1 ring-inset ring-line",
  brand: "bg-brand-50 text-brand-700",
  accent: "bg-marigold-100 text-marigold-700",
  success: "bg-success-100 text-success-700",
  warning: "bg-warning-100 text-warning-600",
  danger: "bg-danger-100 text-danger-700",
  info: "bg-info-100 text-info-600",
  ink: "bg-ink-900 text-white",
};
export function Badge({ tone = "neutral", children, className, dot }: { tone?: Tone; children: ReactNode; className?: string; dot?: boolean }) {
  return (
    <span className={cx("inline-flex h-5 items-center gap-1.5 whitespace-nowrap rounded-full px-2 text-caption font-semibold", TONE[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}

/* ───────── Panel: the one card/panel shape for staff & order pages ───────── */

export function Panel({ title, action, children, className, bodyClassName, id, description }: {
  title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; bodyClassName?: string; id?: string; description?: ReactNode;
}) {
  return (
    <section className={cx("rounded-md border border-line bg-surface", className)} aria-labelledby={title && id ? id : undefined}>
      {title && (
        <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-4">
          <div className="min-w-0">
            <h2 id={id} className="font-sans text-subhead font-semibold tracking-normal">{title}</h2>
            {description && <p className="mt-0.5 text-small text-text-3">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

/* ───────── Overlay primitives ───────── */

function useFocusTrap(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const el = ref.current;
    const sel = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
    const first = el?.querySelector<HTMLElement>("[data-autofocus]") ?? el?.querySelector<HTMLElement>(sel);
    (first ?? el)?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopPropagation(); closeRef.current(); }
      if (e.key === "Tab" && el) {
        const f = [...el.querySelectorAll<HTMLElement>(sel)].filter((x) => x.offsetParent !== null);
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [open]);
  return ref;
}

export function Dialog({ open, onClose, title, description, children, footer, size = "md" }: {
  open: boolean; onClose: () => void; title: ReactNode; description?: ReactNode; children?: ReactNode; footer?: ReactNode; size?: "sm" | "md" | "lg";
}) {
  const ref = useFocusTrap(open, onClose);
  const id = useId();
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="anim-fade absolute inset-0 bg-ink-950/50" onClick={onClose} aria-hidden />
      <div
        ref={ref} role="dialog" aria-modal="true" aria-labelledby={`${id}-t`} aria-describedby={description ? `${id}-d` : undefined} tabIndex={-1}
        className={cx(
          "anim-rise relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-lg bg-surface shadow-dialog focus:outline-none sm:rounded-lg",
          size === "sm" ? "sm:max-w-md" : size === "md" ? "sm:max-w-lg" : "sm:max-w-3xl",
        )}
        style={{ overscrollBehavior: "contain" }}
      >
        <div className="flex items-start gap-4 px-5 pb-2 pt-5">
          <div className="min-w-0 flex-1">
            <h2 id={`${id}-t`} className="font-sans text-subhead font-semibold tracking-normal">{title}</h2>
            {description && <p id={`${id}-d`} className="mt-0.5 text-sm text-text-2">{description}</p>}
          </div>
          <Button variant="ghost" size="icon-sm" className="-mr-2 -mt-1" onClick={onClose} aria-label="Close dialog"><X className="h-4 w-4" /></Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-2">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))]">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function Drawer({ open, onClose, title, children, side = "right", footer, width = "max-w-md", bare }: {
  open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; side?: "left" | "right"; footer?: ReactNode; width?: string;
  /** Render without the title bar (content supplies its own); title becomes the accessible name. */
  bare?: boolean;
}) {
  const ref = useFocusTrap(open, onClose);
  const id = useId();
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="anim-fade absolute inset-0 bg-ink-950/50" onClick={onClose} aria-hidden />
      <div
        ref={ref} role="dialog" aria-modal="true" aria-labelledby={`${id}-t`} tabIndex={-1}
        className={cx(
          "absolute top-0 flex h-full w-[88%] flex-col bg-surface shadow-dialog focus:outline-none", width,
          side === "right" ? "anim-drawer-right right-0" : "anim-drawer-left left-0",
        )}
        style={{ overscrollBehavior: "contain" }}
      >
        {bare ? <h2 id={`${id}-t`} className="sr-only">{title}</h2> : (
          <div className="flex h-14 shrink-0 items-center gap-3 border-b border-line px-5">
            <h2 id={`${id}-t`} className="min-w-0 flex-1 truncate font-sans text-subhead font-semibold tracking-normal">{title}</h2>
            <Button variant="ghost" size="icon-sm" className="-mr-2" onClick={onClose} aria-label="Close"><X className="h-4 w-4" /></Button>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="border-t border-line px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, body, confirmLabel, tone = "danger", children, busy }: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; body: ReactNode; confirmLabel: string;
  tone?: "danger" | "primary"; children?: ReactNode; busy?: boolean;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title} size="sm"
      footer={<>
        <Button variant="secondary" onClick={onClose}>Keep as is</Button>
        <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} loading={busy}>{confirmLabel}</Button>
      </>}>
      <div className="text-sm text-text-2">{body}</div>
      {children}
    </Dialog>
  );
}

/* ───────── States ───────── */

export function EmptyState({ icon, title, body, action, className }: {
  icon: ReactNode; title: string; body?: ReactNode; action?: ReactNode; className?: string;
}) {
  return (
    <div className={cx("flex flex-col items-center px-6 py-14 text-center", className)}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sunken text-text-2 ring-1 ring-inset ring-line [&_svg]:h-5 [&_svg]:w-5">{icon}</div>
      <h2 className="font-sans text-subhead font-semibold tracking-normal">{title}</h2>
      {body && <p className="mt-1 max-w-sm text-sm text-text-2">{body}</p>}
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", body, onRetry }: { title?: string; body?: ReactNode; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-md border border-danger-100 bg-danger-100/40 px-6 py-10 text-center">
      <CircleAlert className="mb-3 h-7 w-7 text-danger-600" aria-hidden />
      <h2 className="font-sans text-subhead font-semibold">{title}</h2>
      {body && <p className="mt-1 max-w-sm text-sm text-text-2">{body}</p>}
      {onRetry && <Button variant="secondary" className="mt-4" onClick={onRetry}><RotateCcw className="h-4 w-4" /> Try again</Button>}
    </div>
  );
}

export function Notice({ tone = "info", icon, children, className, action }: {
  tone?: "info" | "warning" | "danger" | "success" | "demo"; icon?: ReactNode; children: ReactNode; className?: string; action?: ReactNode;
}) {
  const t = {
    info: "bg-info-100/70 text-info-600",
    warning: "bg-warning-100/80 text-warning-600",
    danger: "bg-danger-100/80 text-danger-700",
    success: "bg-success-100/80 text-success-700",
    demo: "bg-marigold-100 text-marigold-700",
  }[tone];
  return (
    <div className={cx("flex items-start gap-2.5 rounded-sm px-3.5 py-2.5 text-small", t, className)}>
      {icon && <span className="mt-px shrink-0 [&_svg]:h-4 [&_svg]:w-4" aria-hidden>{icon}</span>}
      <div className="min-w-0 flex-1 [&_b]:font-semibold">{children}</div>
      {action}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("skeleton rounded-sm", className)} aria-hidden />;
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-text-2" role="status">
      <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden /> {label}…
    </div>
  );
}

/* ───────── Quantity stepper ───────── */

export function QtyStepper({ value, min = 1, max, onChange, size = "md", label = "Quantity" }: {
  value: number; min?: number; max: number; onChange: (n: number) => void; size?: "sm" | "md" | "lg"; label?: string;
}) {
  const h = size === "sm" ? "h-8" : size === "lg" ? "h-12" : "h-10";
  const w = size === "sm" ? "w-8" : size === "lg" ? "w-11" : "w-10";
  const btn = cx(w, "flex items-center justify-center text-text-2 transition-colors hover:bg-sunken hover:text-text disabled:text-line-strong disabled:hover:bg-transparent");
  return (
    <div className={cx("inline-flex items-stretch overflow-hidden rounded-sm border border-field bg-surface", h)} role="group" aria-label={label}>
      <button type="button" className={btn} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Decrease quantity">
        <span aria-hidden className="text-lg leading-none">−</span>
      </button>
      <input
        type="text" inputMode="numeric" aria-label={label}
        className="num w-10 border-x border-line bg-transparent text-center text-sm font-semibold focus:outline-none focus:bg-brand-50"
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value.replace(/\D/g, "") || "0", 10);
          onChange(Math.max(min, Math.min(max, n)));
        }}
      />
      <button type="button" className={btn} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Increase quantity">
        <span aria-hidden className="text-lg leading-none">+</span>
      </button>
    </div>
  );
}

/* ───────── Segmented control ───────── */

export function Segmented<T extends string>({ value, onChange, options, label, size = "md", block }: {
  value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode; count?: number }[]; label: string; size?: "sm" | "md"; block?: boolean;
}) {
  return (
    <div role="tablist" aria-label={label} className={cx("max-w-full overflow-x-auto rounded-sm bg-sunken p-0.5 ring-1 ring-inset ring-line", block ? "flex" : "inline-flex")}>
      {options.map((o) => (
        <button
          key={o.value} role="tab" type="button" aria-selected={value === o.value} onClick={() => onChange(o.value)}
          className={cx(
            "flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-[5px] font-semibold transition-colors",
            block && "flex-1",
            size === "sm" ? "h-7 px-2.5 text-caption" : "h-8 px-3 text-small",
            value === o.value ? "bg-surface text-text shadow-pop" : "text-text-2 hover:text-text",
          )}
        >
          {o.label}
          {o.count !== undefined && <span className={cx("num min-w-5 rounded-full px-1.5 text-caption", value === o.value ? "bg-ink-900 text-white" : "bg-line text-text-2")}>{o.count}</span>}
        </button>
      ))}
    </div>
  );
}
