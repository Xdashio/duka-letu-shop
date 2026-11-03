/**
 * Reads free-text opening hours such as "Mon–Sat 8:00–19:00 · Sun 10:00–16:00"
 * and answers "is the shop open now, and until when?". Anything it can't parse
 * returns null so the UI falls back to showing the raw text.
 */
const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

interface Span { days: Set<number>; open: number; close: number }

function parse(text: string): Span[] | null {
  const spans: Span[] = [];
  for (const part of text.split(/[·;,|\n]/)) {
    const m = part.trim().toLowerCase().match(/^([a-z]{3})[a-z]*\.?(?:\s*[–-]\s*([a-z]{3})[a-z]*\.?)?\s+(\d{1,2})(?::(\d{2}))?\s*[–-]\s*(\d{1,2})(?::(\d{2}))?$/);
    if (!m) continue;
    const a = DAYS.indexOf(m[1]), b = m[2] ? DAYS.indexOf(m[2]) : a;
    if (a < 0 || b < 0) continue;
    const days = new Set<number>();
    for (let d = a; ; d = (d + 1) % 7) { days.add(d); if (d === b) break; }
    spans.push({ days, open: +m[3] * 60 + +(m[4] ?? 0), close: +m[5] * 60 + +(m[6] ?? 0) });
  }
  return spans.length ? spans : null;
}

const hhmm = (mins: number) => `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, "0")}`;

export interface OpenState { open: boolean; label: string; detail: string }

export function openState(hours: string, now = new Date()): OpenState | null {
  const spans = parse(hours);
  if (!spans) return null;
  const day = now.getDay(), mins = now.getHours() * 60 + now.getMinutes();
  const today = spans.find((s) => s.days.has(day));
  if (today && mins >= today.open && mins < today.close) {
    return { open: true, label: "Open now", detail: `until ${hhmm(today.close)} today` };
  }
  if (today && mins < today.open) return { open: false, label: "Closed", detail: `opens ${hhmm(today.open)} today` };
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    const s = spans.find((x) => x.days.has(d));
    if (s) {
      const when = i === 1 ? "tomorrow" : DAYS[d][0].toUpperCase() + DAYS[d].slice(1);
      return { open: false, label: "Closed", detail: `opens ${hhmm(s.open)} ${when}` };
    }
  }
  return null;
}
