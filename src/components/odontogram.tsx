import type { Zone } from "@/content/treatments";

/**
 * FDI numaralı 32 dişlik çizgisel diş haritası.
 * Geometri build sırasında hesaplanır (server component), istemciye JS göndermez.
 * Etkileşim tamamen CSS :has() ile (globals.css → "Treatment board ↔ odontogram").
 */

type Tooth = { n: number; zone: Exclude<Zone, "gum">; w: number; h: number };

// izleyicinin solundan sağına: 18 → 11 | 21 → 28
const quadrant = (q: number): Tooth[] => [
  { n: q * 10 + 8, zone: "molar", w: 21, h: 23 },
  { n: q * 10 + 7, zone: "molar", w: 23, h: 25 },
  { n: q * 10 + 6, zone: "molar", w: 24, h: 26 },
  { n: q * 10 + 5, zone: "premolar", w: 16.5, h: 20 },
  { n: q * 10 + 4, zone: "premolar", w: 16.5, h: 20 },
  { n: q * 10 + 3, zone: "front", w: 14.5, h: 22 },
  { n: q * 10 + 2, zone: "front", w: 12.5, h: 20 },
  { n: q * 10 + 1, zone: "front", w: 14.5, h: 21 },
];

const GAP = 3;
const r1 = (v: number) => Math.round(v * 10) / 10;

type Ell = { cx: number; cy: number; rx: number; ry: number; upper: boolean };

function point(e: Ell, t: number) {
  const phi = e.upper ? Math.PI + Math.PI * t : Math.PI - Math.PI * t;
  return { x: e.cx + e.rx * Math.cos(phi), y: e.cy + e.ry * Math.sin(phi) };
}

function arch(teeth: Tooth[], e: Ell) {
  const N = 1600;
  const pts: { x: number; y: number; s: number }[] = [];
  let s = 0;
  for (let i = 0; i <= N; i++) {
    const p = point(e, i / N);
    if (i > 0) s += Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y);
    pts.push({ ...p, s });
  }
  const span = teeth.reduce((a, t) => a + t.w, 0) + GAP * (teeth.length - 1);
  const start = (s - span) / 2;

  const at = (target: number) => {
    let lo = 0;
    let hi = pts.length - 2;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (pts[mid].s < target) lo = mid + 1;
      else hi = mid;
    }
    const p = pts[lo];
    const q = pts[lo + 1];
    const tx = q.x - p.x;
    const ty = q.y - p.y;
    const len = Math.hypot(tx, ty) || 1;
    // dışa bakan normal
    let nx = ty / len;
    let ny = -tx / len;
    if ((p.x - e.cx) * nx + (p.y - e.cy) * ny < 0) {
      nx = -nx;
      ny = -ny;
    }
    return { x: p.x, y: p.y, ang: (Math.atan2(ty, tx) * 180) / Math.PI, nx, ny };
  };

  let cursor = start;
  const placed = teeth.map((t) => {
    const p = at(cursor + t.w / 2);
    cursor += t.w + GAP;
    return {
      ...t,
      x: r1(p.x),
      y: r1(p.y),
      ang: r1(p.ang),
      lx: r1(p.x + p.nx * (t.h / 2 + 12)),
      ly: r1(p.y + p.ny * (t.h / 2 + 12)),
    };
  });

  // diş eti bandı: dişlerin dış kenarına paralel çizgi
  const gum: string[] = [];
  for (let k = 0; k <= 60; k++) {
    const p = at(start - 4 + ((span + 8) * k) / 60);
    gum.push(`${r1(p.x + p.nx * 9)} ${r1(p.y + p.ny * 9)}`);
  }
  return { placed, gum: `M${gum.join(" L")}` };
}

const upperTeeth = [...quadrant(1), ...quadrant(2).reverse()];
const lowerTeeth = [...quadrant(4), ...quadrant(3).reverse()];

const UP = arch(upperTeeth, { cx: 200, cy: 214, rx: 124, ry: 168, upper: true });
const LO = arch(lowerTeeth, { cx: 200, cy: 228, rx: 116, ry: 160, upper: false });
const ALL = [...UP.placed, ...LO.placed];

const ZONES: Exclude<Zone, "gum">[] = ["molar", "premolar", "front"];

export function Odontogram({ labels }: { labels: { upper: string; lower: string; title: string } }) {
  return (
    <svg viewBox="0 0 400 440" role="img" aria-label={labels.title} className="h-auto w-full select-none">
      <g className="zone" data-zone="gum">
        <path className="gum" d={UP.gum} />
        <path className="gum" d={LO.gum} />
      </g>

      {ZONES.map((z) => (
        <g key={z} className="zone" data-zone={z}>
          {ALL.filter((t) => t.zone === z).map((t) => (
            <rect
              key={t.n}
              className="tooth"
              x={-t.w / 2}
              y={-t.h / 2}
              width={t.w}
              height={t.h}
              rx={t.zone === "front" ? 5 : 6.5}
              transform={`translate(${t.x} ${t.y}) rotate(${t.ang})`}
            />
          ))}
        </g>
      ))}

      <g aria-hidden="true" stroke="#E3E9EF" strokeWidth="1">
        <line x1="200" y1="58" x2="200" y2="398" strokeDasharray="2 4" />
      </g>
      <g aria-hidden="true" fill="#5F6B79" fontSize="8.5" letterSpacing="1.6" textAnchor="middle">
        <text x="200" y="208">{labels.upper}</text>
        <text x="200" y="242">{labels.lower}</text>
      </g>
    </svg>
  );
}
