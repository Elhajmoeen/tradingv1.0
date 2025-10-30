export const norm = (s: any): string => (s ?? '').toString().toLowerCase().trim();
export const digits = (s: any): string => (s ?? '').toString().replace(/\D+/g, '');

// return a number from string or null
export const toNum = (s?: string | null): number | null => s && s.trim() !== '' ? Number(s) : null;

// simple includes with score bonus for startsWith or exact
export function scoreMatch(hay: string, needle: string): number {
  if (!needle) return 0;
  const i = hay.indexOf(needle);
  if (i < 0) return -1;
  // higher score for start/exact/short fields
  if (hay === needle) return 100;
  if (i === 0) return 60 - Math.min(needle.length, 40);
  return 40 - Math.min(i, 40);
}

// highlight matched substring for display
export function highlightMatch(text: string, needle: string): Array<{t: string; h: boolean}> {
  const a = text ?? '';
  const n = (needle ?? '').toLowerCase().trim();
  if (!n) return [{ t: a, h: false }];
  const L = a.toLowerCase();
  const i = L.indexOf(n);
  if (i < 0) return [{ t: a, h: false }];
  return [
    { t: a.slice(0, i), h: false },
    { t: a.slice(i, i + n.length), h: true },
    { t: a.slice(i + n.length), h: false },
  ];
}