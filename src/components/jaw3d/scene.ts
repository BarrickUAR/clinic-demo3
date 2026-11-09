/**
 * Prosedürel 3D çene sahnesi (three.js).
 * Bu modül yalnızca dinamik import ile yüklenir — ilk sayfa yüküne girmez.
 * Dışarıya küçük bir API verir: setHighlight, dispose; hover bilgisini callback ile bildirir.
 */
import {
  ACESFilmicToneMapping,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Raycaster,
  Scene,
  SphereGeometry,
  Shape,
  SRGBColorSpace,
  TorusGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export type Zone = "front" | "premolar" | "molar" | "gum";
export type ToothInfo = { n: number; zone: Zone };

type Kind = "central" | "lateral" | "canine" | "premolar" | "molar";

const KIND_ZONE: Record<Kind, Zone> = {
  central: "front",
  lateral: "front",
  canine: "front",
  premolar: "premolar",
  molar: "molar",
};

// [tür, genişlik(mesiodistal), kalınlık(bukko-lingual), yükseklik]
const DIMS: Record<Kind, [number, number, number]> = {
  central: [0.86, 0.68, 1.05],
  lateral: [0.66, 0.6, 0.92],
  canine: [0.76, 0.78, 1.08],
  premolar: [0.7, 0.9, 0.82],
  molar: [1.02, 1.04, 0.78],
};

const QUAD: Kind[] = ["central", "lateral", "canine", "premolar", "premolar", "molar", "molar", "molar"];

const COLORS = {
  tooth: new Color("#f1efe8"),
  toothHi: new Color("#a9c9f2"),
  emissiveHi: new Color("#1f6fd1"),
  gum: new Color("#d98490"),
  gumHi: new Color("#b9d2f1"),
  hover: new Color("#4f93e6"),
};

/* ───────── geometri ───────── */

const sgn = (v: number) => (v < 0 ? -1 : 1);

/** Süperelipsoid tabanlı diş kronu; azılarda tüberküller, kesicilerde ince kesici kenar. */
function toothGeometry(kind: Kind): BufferGeometry {
  const g = new SphereGeometry(1, kind === "molar" ? 36 : 28, 22);
  const p = g.attributes.position;
  const [w, d, h] = DIMS[kind];
  const ex = kind === "molar" || kind === "premolar" ? 0.55 : 0.62; // kutuluk
  const v = new Vector3();
  const cols = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    let x = sgn(v.x) * Math.pow(Math.abs(v.x), ex);
    let y = v.y;
    let z = sgn(v.z) * Math.pow(Math.abs(v.z), ex);

    const top = Math.max(0, y); // y+ = çiğneme yüzeyi / kesici kenar
    if (kind === "central" || kind === "lateral") {
      // kesici kenara doğru incelme (kürek formu)
      z *= 1 - 0.62 * Math.pow(top, 1.6);
      x *= 1 + 0.06 * top;
      y = y > 0 ? Math.pow(y, 0.72) : y;
    } else if (kind === "canine") {
      // sivri tüberkül
      const k = 1 - 0.55 * Math.pow(top, 1.4);
      x *= k;
      z *= 1 - 0.35 * Math.pow(top, 1.4);
      y += 0.16 * Math.pow(top, 3);
    } else {
      // tüberküller: üst yüzeyde kosinüs çukurları
      const cusps = kind === "molar" ? 2 : 1;
      const bump =
        0.11 *
        Math.pow(top, 2.2) *
        (Math.cos(x * Math.PI * cusps) * Math.cos(z * Math.PI * (kind === "molar" ? 2 : 1.4)) - 0.35);
      y = Math.min(1, y) + bump;
      // boyun bölgesinde hafif daralma
      if (y < 0) {
        x *= 1 - 0.18 * Math.pow(-y, 1.5);
        z *= 1 - 0.18 * Math.pow(-y, 1.5);
      }
    }
    p.setXYZ(i, (x * w) / 2, (y * h) / 2, (z * d) / 2);
    // y: -1 (boyun) → +1 (çiğneme yüzeyi)
    const k = Math.min(1, Math.max(0, (y + 1) / 2));
    const e = Math.pow(k, 0.7);
    cols[i * 3] = 0.9 + 0.1 * e;
    cols[i * 3 + 1] = 0.86 + 0.14 * e;
    cols[i * 3 + 2] = 0.76 + 0.24 * e;
  }
  g.setAttribute("color", new BufferAttribute(cols, 3));
  g.computeVertexNormals();
  return g;
}

const easeBack = (x: number) => {
  const t = Math.min(1, Math.max(0, x)) - 1;
  return 1 + 2.2 * t * t * t + 1.2 * t * t;
};

function shadowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  const gr = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(27,36,48,0.22)");
  gr.addColorStop(1, "rgba(27,36,48,0)");
  ctx.fillStyle = gr;
  ctx.fillRect(0, 0, 128, 128);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/* ───────── sahne ───────── */

export type View = "front" | "upper" | "lower" | "side";
export type JawApi = {
  setHighlight: (zones: Zone[]) => void;
  setFocus: (treatmentId: string | null) => void;
  setView: (view: View) => void;
  setXray: (on: boolean) => void;
  dispose: () => void;
};

export function createJaw(
  canvas: HTMLCanvasElement,
  opts: {
    reduceMotion: boolean;
    onHover: (info: ToothInfo | null) => void;
    onReady: () => void;
  },
): JawApi {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;

  const camera = new PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 4.4, 14.6);
  camera.lookAt(0, -0.15, 0);

  scene.add(new HemisphereLight(0xffffff, 0xdfe8f2, 0.9));
  const key = new DirectionalLight(0xffffff, 1.6);
  key.position.set(3, 8, 6);
  scene.add(key);
  const rim = new DirectionalLight(0xdce9f7, 0.8);
  rim.position.set(-5, 2, -6);
  scene.add(rim);

  const root = new Group();
  scene.add(root);

  // materyaller
  const toothMat = () =>
    new MeshPhysicalMaterial({
      color: COLORS.tooth,
      roughness: 0.3,
      clearcoat: 0.7,
      clearcoatRoughness: 0.25,
      sheen: 0.3,
      sheenColor: new Color("#ffffff"),
      envMapIntensity: 0.9,
      vertexColors: true,
    });
  const gumMat = new MeshPhysicalMaterial({
    color: COLORS.gum,
    roughness: 0.42,
    clearcoat: 0.55,
    clearcoatRoughness: 0.3,
    sheen: 0.5,
    sheenColor: new Color("#f6c3c9"),
    envMapIntensity: 0.55,
  });
  const baseMat = new MeshPhysicalMaterial({ color: new Color("#f3f6f9"), roughness: 0.85, envMapIntensity: 0.4 });

  const geos = new Map<Kind, BufferGeometry>();
  const geo = (k: Kind) => {
    if (!geos.has(k)) geos.set(k, toothGeometry(k));
    return geos.get(k)!;
  };

  const teeth: Mesh[] = [];

  /* kökler ve pulpa (kök kanalları): normalde diş eti içinde gizli; röntgen ve kanal modunda görünür */
  const ROOTS: Record<Kind, { len: number; n: number }> = {
    central: { len: 1.25, n: 1 },
    lateral: { len: 1.15, n: 1 },
    canine: { len: 1.55, n: 1 },
    premolar: { len: 1.2, n: 1 },
    molar: { len: 1.05, n: 2 },
  };
  const rootMat = new MeshPhysicalMaterial({ color: new Color("#eadcb8"), roughness: 0.45, clearcoat: 0.3, envMapIntensity: 0.6 });
  const pulpMat = new MeshPhysicalMaterial({ color: new Color("#1f6fd1"), emissive: new Color("#1f6fd1"), emissiveIntensity: 0.35, roughness: 0.4 });
  const chamberGeo = new SphereGeometry(1, 18, 12);
  const canalLineGeo = new CylinderGeometry(0.04, 0.014, 1, 8);
  const rootGeos = new Map<string, BufferGeometry>();
  const rootGeo = (kind: Kind, n: number) => {
    const key = `${kind}-${n}`;
    if (!rootGeos.has(key)) {
      const [w, d] = DIMS[kind];
      const rt = Math.min(w, d) * (n > 1 ? 0.2 : 0.3);
      const g = new CylinderGeometry(rt, 0.045, ROOTS[kind].len, 16, 4);
      rootGeos.set(key, g);
    }
    return rootGeos.get(key)!;
  };
  const addAnatomy = (m: Mesh, kind: Kind, upper: boolean) => {
    const [w, d, h] = DIMS[kind];
    const { len } = ROOTS[kind];
    const n = kind === "molar" ? (upper ? 3 : 2) : 1;
    const roots: Mesh[] = [];
    const pulp: Mesh[] = [];
    for (let i = 0; i < n; i++) {
      const r = new Mesh(rootGeo(kind, n), rootMat);
      let ox = 0;
      let oz = 0;
      if (n >= 2 && i < 2) {
        ox = (i === 0 ? -1 : 1) * w * 0.24;
        r.rotation.z = (i === 0 ? 1 : -1) * 0.1;
      }
      if (i === 2) {
        oz = -d * 0.24;
        r.rotation.x = 0.12;
      }
      r.position.set(ox, -h / 2 - len / 2 + 0.12, oz);
      r.visible = false;
      const c = new Mesh(canalLineGeo, pulpMat);
      c.scale.y = len * 0.92;
      r.add(c);
      pulp.push(c);
      roots.push(r);
      m.add(r);
    }
    const ch = new Mesh(chamberGeo, pulpMat);
    ch.scale.set(w * 0.2, h * 0.22, d * 0.18);
    ch.position.y = -h * 0.08;
    ch.visible = false;
    m.add(ch);
    pulp.push(ch);
    m.userData.roots = roots;
    m.userData.pulp = pulp;
  };
  const gums: Mesh[] = [];
  const shells: Mesh[] = []; // diş eti + kaide, karşı çeneyi soldurmak için

  const buildArch = (upper: boolean) => {
    const jaw = new Group();
    const rx = upper ? 3.05 : 2.85;
    const rz = upper ? 3.55 : 3.3;
    // diş sırası: izleyicinin solundan sağına
    const qL = upper ? 1 : 4;
    const qR = upper ? 2 : 3;
    const order: { kind: Kind; n: number }[] = [
      ...QUAD.map((k, i) => ({ kind: k, n: qL * 10 + i + 1 })).reverse(),
      ...QUAD.map((k, i) => ({ kind: k, n: qR * 10 + i + 1 })),
    ];

    // yay uzunluğuna göre yerleşim (ön dişler kameraya bakar: +z)
    const N = 800;
    const pts: { x: number; z: number; s: number }[] = [];
    let s = 0;
    for (let i = 0; i <= N; i++) {
      const phi = Math.PI * (i / N); // 0 → π
      const x = -rx * Math.cos(phi);
      const z = rz * Math.sin(phi) - rz * 0.55;
      if (i) s += Math.hypot(x - pts[i - 1].x, z - pts[i - 1].z);
      pts.push({ x, z, s });
    }
    const gap = 0.05;
    const span = order.reduce((a, o) => a + DIMS[o.kind][0], 0) + gap * (order.length - 1);
    const at = (target: number) => {
      let lo = 0;
      let hi = pts.length - 2;
      while (lo < hi) {
        const m = (lo + hi) >> 1;
        if (pts[m].s < target) lo = m + 1;
        else hi = m;
      }
      const a = pts[lo];
      const b = pts[lo + 1];
      return { x: a.x, z: a.z, ang: Math.atan2(b.z - a.z, b.x - a.x) };
    };

    let cur = (s - span) / 2;
    const yBase = upper ? 0.62 : -0.62;
    for (const o of order) {
      const [w, , h] = DIMS[o.kind];
      const p = at(cur + w / 2);
      cur += w + gap;
      const m = new Mesh(geo(o.kind), toothMat());
      m.position.set(p.x, yBase + (upper ? -h / 2 : h / 2) * 0.92, p.z);
      m.rotation.y = -p.ang;
      if (upper) m.rotation.z = Math.PI; // üst dişler aşağı bakar
      // ön dişlerde hafif labial eğim
      const tilt = o.kind === "central" || o.kind === "lateral" ? 0.16 : o.kind === "canine" ? 0.08 : 0;
      m.rotateX(upper ? -tilt : tilt);
      m.userData = {
        n: o.n,
        zone: KIND_ZONE[o.kind],
        kind: o.kind,
        baseY: m.position.y,
        lift: 0,
        upper,
        delay: Math.abs(order.indexOf(o) - 7.5) * 0.05 + (upper ? 0 : 0.15),
      };
      addAnatomy(m, o.kind, upper);
      teeth.push(m);
      jaw.add(m);
    }
    // diş eti + alçı kaide: dişlerin oturduğu at nalı formu (çalışma modeli görünümü)
    const iStart = pts.findIndex((q) => q.s >= (s - span) / 2 - 0.35);
    const iEnd = pts.findIndex((q) => q.s >= (s + span) / 2 + 0.35);
    const phiA = (Math.PI * Math.max(0, iStart)) / N;
    const phiB = (Math.PI * (iEnd < 0 ? N : iEnd)) / N;
    const horseshoe = (m: number, depth: number, bevel: number, STEPS = 64) => {
      const sh = new Shape();
      for (let k = 0; k <= STEPS; k++) {
        const phi = phiA + ((phiB - phiA) * k) / STEPS;
        const x = -(rx + m) * Math.cos(phi);
        const z = (rz + m) * Math.sin(phi) - rz * 0.55;
        if (k === 0) sh.moveTo(x, -z);
        else sh.lineTo(x, -z);
      }
      for (let k = STEPS; k >= 0; k--) {
        const phi = phiA + ((phiB - phiA) * k) / STEPS;
        const x = -(rx - m) * Math.cos(phi);
        const z = (rz - m) * Math.sin(phi) - rz * 0.55;
        sh.lineTo(x, -z);
      }
      sh.closePath();
      const g = new ExtrudeGeometry(sh, {
        depth,
        bevelEnabled: true,
        bevelThickness: bevel,
        bevelSize: bevel,
        bevelSegments: 6,
        curveSegments: 24,
      });
      g.rotateX(-Math.PI / 2); // ekstrüzyon +y yönüne
      g.computeVertexNormals();
      return g;
    };

    // diş eti: kronların boyun kısmını sarar
    const gumH = 0.62;
    const gumGeo = horseshoe(0.5, gumH, 0.16, 240);
    {
      // dişlerin ortasında diş eti çekilir, aralarında papilla yükselir
      const archTeeth = teeth.filter((t) => t.userData.upper === upper);
      const gp = gumGeo.attributes.position;
      const half = gumH / 2;
      for (let i = 0; i < gp.count; i++) {
        const x = gp.getX(i);
        const y = gp.getY(i);
        const z = gp.getZ(i);
        const wEdge = upper ? (half - y) / (half + 0.16) : (y - half) / (half + 0.16);
        if (wEdge <= 0) continue;
        let best = 9;
        let bw = 1;
        for (const t of archTeeth) {
          const dd = Math.hypot(x - t.position.x, z - t.position.z);
          if (dd < best) {
            best = dd;
            bw = DIMS[t.userData.kind as Kind][0];
          }
        }
        const q = best / (bw / 2);
        const c = Math.max(0, 1 - q * q);
        const dy = 0.17 * c * Math.min(1, wEdge);
        gp.setY(i, upper ? y + dy : y - dy);
      }
      gumGeo.computeVertexNormals();
    }
    const gum = new Mesh(gumGeo, gumMat.clone());
    gum.position.y = upper ? yBase - 0.1 : yBase + 0.1 - gumH;
    gum.userData = { n: 0, zone: "gum", upper, part: "gum" } as ToothInfo & { upper: boolean; part: string };
    shells.push(gum);
    gums.push(gum);
    jaw.add(gum);

    // alçı kaide
    const baseH = 0.55;
    const base = new Mesh(horseshoe(0.62, baseH, 0.1), baseMat.clone());
    base.userData = { upper, part: "base" };
    shells.push(base);
    base.position.y = upper ? yBase - 0.1 + gumH + 0.12 : yBase + 0.1 - gumH - 0.12 - baseH;
    jaw.add(base);

    if (!upper) {
      const tongueGeo = new SphereGeometry(1, 48, 24);
      const tp = tongueGeo.attributes.position;
      const tv = new Vector3();
      for (let i = 0; i < tp.count; i++) {
        tv.fromBufferAttribute(tp, i);
        // üstü hafif basık, ortada belirgin çizgi (median sulcus)
        const y = tv.y > 0 ? tv.y * (0.75 - 0.18 * Math.exp(-tv.x * tv.x * 40)) : tv.y;
        tp.setXYZ(i, tv.x, y, tv.z);
      }
      tongueGeo.computeVertexNormals();
      const tongue = new Mesh(
        tongueGeo,
        new MeshPhysicalMaterial({
          color: new Color("#e28b97"),
          roughness: 0.55,
          sheen: 0.6,
          sheenColor: new Color("#f8c9cf"),
          clearcoat: 0.35,
          clearcoatRoughness: 0.5,
          envMapIntensity: 0.5,
        }),
      );
      tongue.scale.set(1.75, 0.42, 1.75);
      tongue.position.set(0, yBase - 0.05, -0.55);
      tongue.userData = { upper: false, part: "tongue" };
      shells.push(tongue);
      jaw.add(tongue);
    }
    return jaw;
  };

  const upperJaw = buildArch(true);
  const lowerJaw = buildArch(false);
  upperJaw.position.y = 0.5;
  lowerJaw.position.y = -0.5;
  root.add(upperJaw, lowerJaw);
  root.scale.setScalar(0.72);

  const shadow = new Mesh(new PlaneGeometry(11, 8), new MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -2.9;
  scene.add(shadow);

  /* ───────── tedaviye göre odak ───────── */
  type Mode = "sweep" | "canal" | "fill" | "whiten" | "crown" | "veneer" | "extract" | "gum";
  const FOCUS: Record<string, { teeth: number[] | "all"; mode: Mode; rot: [number, number]; open: number }> = {
    exam: { teeth: "all", mode: "sweep", rot: [0, 0.05], open: 0.55 },
    "root-canal": { teeth: [36], mode: "canal", rot: [-0.7, 0.12], open: 1.15 },
    filling: { teeth: [35], mode: "fill", rot: [-0.5, 0.12], open: 1.15 },
    whitening: { teeth: [13, 12, 11, 21, 22, 23, 33, 32, 31, 41, 42, 43], mode: "whiten", rot: [0, 0], open: 0.3 },
    zirconia: { teeth: [46], mode: "crown", rot: [0.7, 0.12], open: 1.1 },
    veneers: { teeth: [13, 12, 11, 21, 22, 23], mode: "veneer", rot: [0, -0.1], open: 0.35 },
    gum: { teeth: [], mode: "gum", rot: [-0.3, 0.05], open: 0.3 },
    extraction: { teeth: [38], mode: "extract", rot: [-0.95, 0.12], open: 1.15 },
  };
  let focus: (typeof FOCUS)[string] | null = null;
  let focusSet = new Set<number>();
  let focusStart = 0;
  let focusArch: boolean | null = null; // true = üst, false = alt
  let viewArch: boolean | null = null;
  let viewOpen = 0.18;
  let xray = false;
  const XRAY = new Color("#d3e3f7");
  const VIEWS: Record<View, { rot: [number, number]; open: number; arch: boolean | null }> = {
    front: { rot: [0, 0], open: 0.18, arch: null },
    upper: { rot: [0, -1.15], open: 0.6, arch: true },
    lower: { rot: [0, 0.55], open: 0.6, arch: false },
    side: { rot: [1.35, 0.05], open: 0.35, arch: null },
  };
  /** kök/pulpa görünürlüğü */
  const applyAnatomy = () => {
    for (const m of teeth) {
      const inF = !!focus && focusSet.has(m.userData.n);
      const deep = !!focus && inF && (focus.mode === "canal" || focus.mode === "extract");
      const showRoots = (xray && !focus) || deep;
      for (const r of m.userData.roots as Mesh[]) r.visible = showRoots;
      const showPulp = (xray && !focus) || (!!focus && inF && focus.mode === "canal");
      for (const pm of m.userData.pulp as Mesh[]) pm.visible = showPulp;
    }
  };
  let userRot: [number, number] = [-0.35, 0];
  const DIM = new Color("#c3ccd7");
  const WHITE = new Color("#ffffff");
  const STAIN = new Color("#e2d6b4");
  const STEEL = new Color("#1f6fd1");

  /* ───────── tedavi aksesuarları (dişin çocuğu; yerel +y = çiğneme yüzeyi) ───────── */
  const ringGeo = new TorusGeometry(0.6, 0.03, 10, 56);
  const canalGeo = new CylinderGeometry(0.07, 0.03, 1, 14);
  const patchGeo = new SphereGeometry(1, 24, 12);
  type AccKind = "ring" | "canal" | "patch" | "crown" | "veneer";
  const accs: { mesh: Mesh; kind: AccKind; tooth: Mesh }[] = [];
  const clearAccs = () => {
    for (const a of accs) {
      a.tooth.remove(a.mesh);
      (a.mesh.material as MeshPhysicalMaterial).dispose();
      if (a.kind === "crown" || a.kind === "veneer") a.mesh.geometry.dispose();
    }
    accs.length = 0;
  };
  const addAccs = (mode: Mode) => {
    clearAccs();
    for (const m of teeth) {
      if (!focusSet.has(m.userData.n)) continue;
      const [w, d, h] = DIMS[m.userData.kind as Kind];
      const ring = new Mesh(ringGeo, new MeshBasicMaterial({ color: STEEL, transparent: true, opacity: 0, depthWrite: false }));
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -h * 0.42;
      ring.scale.set(w * 0.95, d * 0.95, 1);
      m.add(ring);
      accs.push({ mesh: ring, kind: "ring", tooth: m });
      if (mode === "fill") {
        const pt = new Mesh(
          patchGeo,
          new MeshPhysicalMaterial({ color: new Color("#ffffff"), emissive: new Color("#ffffff"), emissiveIntensity: 0.35, roughness: 0.2, clearcoat: 1, transparent: true, opacity: 0 }),
        );
        pt.scale.set(w * 0.2, 0.05, d * 0.2);
        pt.position.y = h * 0.47;
        m.add(pt);
        accs.push({ mesh: pt, kind: "patch", tooth: m });
      } else if (mode === "crown" || mode === "veneer") {
        const cr = new Mesh(
          (m.geometry as BufferGeometry).clone(),
          new MeshPhysicalMaterial({
            color: new Color(mode === "crown" ? "#f4f8ff" : "#cfe2fa"),
            roughness: 0.18,
            clearcoat: 1,
            transparent: true,
            opacity: 0,
            depthWrite: false,
          }),
        );
        if (mode === "crown") cr.scale.setScalar(1.12);
        else cr.scale.set(1.07, 1.03, 1.12);
        m.add(cr);
        accs.push({ mesh: cr, kind: mode, tooth: m });
      }
    }
  };

  /* ───────── etkileşim ───────── */
  const ray = new Raycaster();
  const ptr = new Vector2();
  const tmp = new Vector3();
  const hoverRing = new Mesh(
    new TorusGeometry(0.6, 0.028, 10, 56),
    new MeshBasicMaterial({ color: new Color("#1f6fd1"), transparent: true, opacity: 0, depthWrite: false }),
  );
  hoverRing.rotation.x = Math.PI / 2;
  let introStart = 0;
  let hovered: Mesh | null = null;
  let highlight = new Set<Zone>();
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let targetRotY = -0.35;
  let targetRotX = 0;
  let rotY = targetRotY;
  let rotX = 0;
  let open = 0; // ağız açıklığı (hover ile hafif açılır)
  let targetOpen = 0.18;
  let visible = true;
  let raf = 0;
  let t0 = performance.now();

  const paint = () => {
    for (const m of teeth) {
      const mat = m.material as MeshPhysicalMaterial;
      const hov = m === hovered;
      mat.emissive.copy(COLORS.emissiveHi);
      if (focus) {
        const inF = focus.teeth === "all" || focusSet.has(m.userData.n);
        if (focus.mode === "whiten") {
          mat.color.copy(inF ? STAIN : DIM); // karede beyaza doğru akar
          mat.emissive.copy(WHITE);
          mat.emissiveIntensity = 0;
        } else if (focus.mode === "gum") {
          mat.color.copy(DIM);
          mat.emissiveIntensity = 0;
        } else if (focus.mode === "sweep") {
          mat.color.copy(COLORS.tooth);
        } else {
          // seçili diş: hover'daki gibi belirgin mavi; diğerleri gri
          mat.color.copy(inF ? COLORS.hover : DIM);
          mat.emissiveIntensity = inF ? 0.3 : 0;
        }
        continue;
      }
      const on = highlight.has(m.userData.zone as Zone);
      if (xray && !hov) {
        mat.color.copy(on ? COLORS.toothHi : XRAY);
        mat.emissiveIntensity = on ? 0.14 : 0.05;
        continue;
      }
      mat.color.copy(hov ? COLORS.hover : on ? COLORS.toothHi : COLORS.tooth);
      mat.emissiveIntensity = hov ? 0.38 : on ? 0.14 : 0;
    }
    for (const g of gums) {
      const mat = g.material as MeshPhysicalMaterial;
      const on = highlight.has("gum") || g === hovered || focus?.mode === "gum";
      mat.color.copy(g === hovered ? new Color("#8db6ea") : on ? COLORS.gumHi : COLORS.gum);
    }
    applyAnatomy();
    kick();
  };

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    if (!r.width) return;
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
    kick();
  };

  const pick = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, camera);
    const hit = ray.intersectObjects([...teeth, ...gums], false)[0];
    const m = (hit?.object as Mesh) ?? null;
    if (m !== hovered) {
      hovered = m;
      hoverRing.removeFromParent();
      if (m && m.userData.kind) {
        const [w, d, h] = DIMS[m.userData.kind as Kind];
        hoverRing.position.y = -h * 0.42;
        hoverRing.userData = { w, d };
        m.add(hoverRing);
      }
      canvas.style.cursor = m ? "pointer" : dragging ? "grabbing" : "grab";
      opts.onHover(m ? (m.userData as ToothInfo) : null);
      paint();
    }
  };

  const onDown = (e: PointerEvent) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
    canvas.style.cursor = "grabbing";
  };
  const onMove = (e: PointerEvent) => {
    if (dragging) {
      targetRotY += (e.clientX - lastX) * 0.008;
      targetRotX = Math.max(-0.35, Math.min(0.5, targetRotX + (e.clientY - lastY) * 0.005));
      lastX = e.clientX;
      lastY = e.clientY;
      kick();
    } else if (e.pointerType === "mouse") {
      pick(e);
    }
  };
  const onUp = (e: PointerEvent) => {
    dragging = false;
    canvas.releasePointerCapture?.(e.pointerId);
    if (e.pointerType !== "mouse") pick(e);
    canvas.style.cursor = hovered ? "pointer" : "grab";
  };
  const onEnter = () => {
    if (!focus) targetOpen = Math.max(viewOpen, 0.42);
    kick();
  };
  const onLeave = () => {
    if (!focus) targetOpen = viewOpen;
    if (hovered) {
      hovered = null;
      hoverRing.removeFromParent();
      opts.onHover(null);
      paint();
    }
    kick();
  };

  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  canvas.addEventListener("pointerenter", onEnter);
  canvas.addEventListener("pointerleave", onLeave);
  canvas.style.cursor = "grab";
  canvas.style.touchAction = "pan-y";

  const introIo = new IntersectionObserver(
    ([e]) => {
      if (e.isIntersecting && !introStart) {
        introStart = performance.now();
        introIo.disconnect();
        kick();
      }
    },
    { threshold: 0.3 },
  );
  introIo.observe(canvas);
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) kick();
  });
  io.observe(canvas);

  /* ───────── döngü: yalnızca gerektiğinde çizer ───────── */
  let settleFrames = 0;
  function frame(now: number) {
    raf = 0;
    if (!visible) return;
    const dt = Math.min(0.05, (now - t0) / 1000);
    t0 = now;
    const idle = opts.reduceMotion || dragging || focus ? 0 : Math.sin(now / 2600) * 0.12;
    const ft = (now - focusStart) / 1000;
    const arch = focus ? focusArch : viewArch;
    for (const m of teeth) {
      const u = m.userData;
      const mat = m.material as MeshPhysicalMaterial;
      const inF = !!focus && (focus.teeth === "all" || focusSet.has(u.n));
      let liftT = 0;
      let opT = 1;
      if (m === hovered && !focus) liftT = 0.14;
      const sc = m === hovered && !focus ? 1.08 : 1;
      m.scale.x += (sc - m.scale.x) * (1 - Math.pow(0.002, dt));
      m.scale.z = m.scale.x;
      const md = focus?.mode;
      if (inF && (md === "crown" || md === "fill" || md === "canal")) liftT = 0.12;
      if (inF && md === "extract") {
        liftT = 1.6;
        opT = 0;
      }
      // odak dışı dişler geri çekilir
      if (focus && !inF && md !== "sweep") opT = md === "gum" ? 0.7 : 0.92;
      if (arch !== null && u.upper !== arch) opT = 0.1;
      else if (xray && !focus) opT = 0.42;
      if (inF && md === "canal") opT = 0.55;
      if (inF && md === "whiten") {
        const k = opts.reduceMotion ? 1 : Math.min(1, ft / 1.8);
        mat.color.copy(STAIN).lerp(WHITE, k * k * (3 - 2 * k));
        mat.emissiveIntensity = 0.14 * k;
      }
      if (focus?.mode === "sweep") {
        const wave = Math.max(0, Math.cos((m.position.x * 0.9 - ((ft * 3.2) % 8) + 4) * 1.4));
        mat.emissiveIntensity = opts.reduceMotion ? 0.08 : 0.22 * Math.pow(wave, 3);
      }
      u.lift += (liftT - u.lift) * (1 - Math.pow(0.004, dt));
      const it = opts.reduceMotion ? 1 : introStart ? (now - introStart) / 1000 - u.delay : -1;
      const ik = opts.reduceMotion ? 1 : easeBack(it / 0.75);
      m.position.y = u.baseY + (u.upper ? -u.lift : u.lift) + (u.upper ? 1 : -1) * (1 - ik) * 0.85;
      m.scale.y = 0.25 + 0.75 * Math.min(1.04, Math.max(0, ik));
      const tOp = opT;
      if (tOp < 1 || mat.opacity < 1) {
        if (!mat.transparent) {
          mat.transparent = true;
          mat.needsUpdate = true;
        }
        mat.opacity += (tOp - mat.opacity) * (1 - Math.pow(0.01, dt));
        if (mat.opacity > 0.995 && tOp === 1) {
          mat.opacity = 1;
          mat.transparent = false;
          mat.needsUpdate = true;
        }
      }
    }

    // aksesuar animasyonları
    const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
    for (const a of accs) {
      const am = a.mesh.material as MeshPhysicalMaterial | MeshBasicMaterial;
      const [w, d, h] = DIMS[a.tooth.userData.kind as Kind];
      if (a.kind === "ring") {
        const p = opts.reduceMotion ? 0 : (ft * 0.7) % 1;
        const s = 1 + p * 0.35;
        a.mesh.scale.set(w * 0.95 * s, d * 0.95 * s, 1);
        am.opacity = opts.reduceMotion ? 0.8 : 0.85 * (1 - p);
      } else if (a.kind === "patch") {
        const k = ease((ft - 0.5) / 0.6);
        am.opacity = k;
        a.mesh.scale.set(w * 0.2 * (0.6 + 0.4 * k), 0.05, d * 0.2 * (0.6 + 0.4 * k));
      } else if (a.kind === "crown") {
        // kaplama yukarıdan iner, oturur, bekler, tekrar
        const cyc = opts.reduceMotion ? 1.5 : ft % 3.2;
        a.mesh.position.y = h * 1.3 * (1 - ease(cyc / 1.1));
        am.opacity = Math.min(0.55, cyc / 0.6) * (cyc > 2.8 ? Math.max(0, 1 - (cyc - 2.8) / 0.4) : 1);
      } else if (a.kind === "veneer") {
        const k = ease((ft - 0.3) / 0.8);
        am.opacity = 0.62 * k;
        a.mesh.position.y = 0.04 * (1 - k);
      }
    }
    // 1–2 dişlik odakta hafif yakınlaştırma
    const fovT = 30;
    if (Math.abs(camera.fov - fovT) > 0.01) {
      camera.fov += (fovT - camera.fov) * (1 - Math.pow(0.02, dt));
      camera.updateProjectionMatrix();
    }
    // diş eti modu: renk yavaşça nefes alır
    if (focus?.mode === "gum") {
      const k = opts.reduceMotion ? 1 : 0.5 + 0.5 * Math.sin(ft * 2.6);
      for (const g of gums) (g.material as MeshPhysicalMaterial).color.copy(COLORS.gum).lerp(COLORS.gumHi, 0.35 + 0.65 * k);
    }
    const k = 1 - Math.pow(0.0015, dt);
    rotY += (targetRotY + idle - rotY) * k;
    rotX += (targetRotX - rotX) * k;
    const breathe = focus || dragging || opts.reduceMotion ? 0 : Math.sin(now / 1900) * 0.07;
    open += (targetOpen + breathe - open) * k;
    // hover halkası nabız gibi genişler
    if (hoverRing.parent) {
      const p = opts.reduceMotion ? 0 : (now / 1000) % 1;
      const { w, d } = hoverRing.userData as { w: number; d: number };
      hoverRing.scale.set(w * 0.95 * (1 + p * 0.3), d * 0.95 * (1 + p * 0.3), 1);
      (hoverRing.material as MeshBasicMaterial).opacity = opts.reduceMotion ? 0.8 : 0.9 * (1 - p);
    }
    root.rotation.set(rotX, rotY, 0);
    // seçili dişleri kadrajın ortasına çek
    let cx = 0;
    let cy = 0;
    const sc = focus && focusArch !== null ? 1.08 : arch !== null ? 0.86 : 0.74;
    // karşı çenenin diş eti + kaidesi solar
    for (const sh of shells) {
      const sm = sh.material as MeshPhysicalMaterial;
      const part = sh.userData.part as string;
      let t = 1;
      if (arch !== null && sh.userData.upper !== arch) t = 0.1;
      else if (xray && !focus) t = part === "base" ? 0.16 : part === "tongue" ? 0.18 : 0.3;
      else if (focus && (focus.mode === "canal" || focus.mode === "extract") && sh.userData.upper === focusArch && part !== "tongue") t = 0.4;
      if (t < 1 && !sm.transparent) {
        sm.transparent = true;
        sm.needsUpdate = true;
      }
      sm.opacity += (t - sm.opacity) * (1 - Math.pow(0.01, dt));
      if (t === 1 && sm.opacity > 0.995 && sm.transparent) {
        sm.opacity = 1;
        sm.transparent = false;
        sm.needsUpdate = true;
      }
    }
    if (focus && focusSet.size > 0) {
      root.updateMatrixWorld();
      // ekran (NDC) konumuna göre geri besleme: seçili dişler kadrajın ortasına (biraz altına) gelir
      let n = 0;
      let nx = 0;
      let ny = 0;
      for (const m of teeth) {
        if (!focusSet.has(m.userData.n)) continue;
        tmp.setFromMatrixPosition(m.matrixWorld).project(camera);
        nx += tmp.x;
        ny += tmp.y;
        n++;
      }
      nx /= n;
      ny = ny / n + 0.08;
      cx = root.position.x - nx * 3.2;
      cy = root.position.y - ny * 2.2;
    }
    root.position.x += (cx - root.position.x) * k;
    root.position.y += (cy - root.position.y) * k;
    root.scale.setScalar(root.scale.x + (sc - root.scale.x) * k);
    upperJaw.position.y = 0.32 + open;
    lowerJaw.position.y = -0.32 - open;
    renderer.render(scene, camera);

    const moving =
      Math.abs(targetRotY + idle - rotY) > 0.0005 || Math.abs(targetRotX - rotX) > 0.0005 || Math.abs(targetOpen - open) > 0.0005;
    if (moving || !opts.reduceMotion || focus || hovered) settleFrames = 0;
    else settleFrames++;
    if (settleFrames < 2) kick();
  }
  function kick() {
    if (!raf && visible) {
      t0 = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }

  resize();
  renderer.render(scene, camera);
  opts.onReady();
  kick();

  return {
    setView(v) {
      const pv = VIEWS[v];
      viewArch = pv.arch;
      viewOpen = pv.open;
      if (focus) userRot = [...pv.rot];
      else {
        [targetRotY, targetRotX] = pv.rot;
        targetOpen = viewOpen;
      }
      paint();
    },
    setXray(on) {
      xray = on;
      paint();
    },
    setHighlight(zones) {
      highlight = new Set(zones);
      paint();
    },
    setFocus(id) {
      const f = id ? FOCUS[id] ?? null : null;
      if (f && !focus) userRot = [targetRotY, targetRotX];
      focus = f;
      focusArch = null;
      focusSet = new Set(f && f.teeth !== "all" ? f.teeth : []);
      focusStart = performance.now();
      if (f && f.mode !== "sweep" && f.mode !== "gum" && f.mode !== "whiten") addAccs(f.mode);
      else clearAccs();
      if (f) {
        targetRotY = f.rot[0];
        targetRotX = f.rot[1];
        targetOpen = f.open;
        // hedef dişler tek çenedeyse diğer çeneyi soldur
        const arches = new Set([...focusSet].map((n) => Math.floor(n / 10) <= 2));
        focusArch = focusSet.size > 0 && arches.size === 1 && f.mode !== "veneer" ? [...arches][0] : null;
        if (focusArch !== null) {
          targetOpen = Math.min(f.open, 0.6);
          targetRotX = focusArch ? -1.2 : 0.22;
        }
        // 1–2 dişlik odak: dişi kameraya döndür (y ekseninde, dişin ark üzerindeki açısı)
        if (focusSet.size > 0 && focusSet.size <= 2) {
          let x = 0;
          let z = 0;
          for (const m of teeth) {
            if (!focusSet.has(m.userData.n)) continue;
            x += m.position.x;
            z += m.position.z;
          }
          x /= focusSet.size;
          z /= focusSet.size;
          // tam profil yerine 3/4 görünüm: açının %80'i
          targetRotY = Math.atan2(-x, z) * 0.8;
        }
      } else {
        [targetRotY, targetRotX] = userRot;
        targetOpen = viewOpen;
      }
      paint();
    },
    dispose() {
      cancelAnimationFrame(raf);
      clearAccs();
      ringGeo.dispose();
      canalGeo.dispose();
      chamberGeo.dispose();
      canalLineGeo.dispose();
      rootGeos.forEach((g) => g.dispose());
      patchGeo.dispose();
      ro.disconnect();
      io.disconnect();
      introIo.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("pointerenter", onEnter);
      canvas.removeEventListener("pointerleave", onLeave);
      geos.forEach((g) => g.dispose());
      scene.traverse((o) => {
        if (o instanceof Mesh) {
          o.geometry.dispose();
          (o.material as MeshPhysicalMaterial).dispose();
        }
      });
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
