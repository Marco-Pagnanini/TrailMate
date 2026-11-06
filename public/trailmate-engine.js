(() => {
if (customElements.get('trailmate-3d')) return;
const THREE_URL = '/vendor/three.module.min.js';
const PARTS = [
  { id: 'battery', name: 'Cold-weather battery' },
  { id: 'brain', name: 'Logic board with AI model' },
  { id: 'imu', name: 'Motion sensor (IMU)' },
  { id: 'climate', name: 'Barometer and temperature sensor' },
  { id: 'satellite', name: 'Satellite and GNSS module' },
  { id: 'camera', name: 'Wide-angle camera' },
  { id: 'beacon', name: 'Siren and SOS LED' },
];
const FINISHES = { grafite: 0x3b3f43, oliva: 0x474c38, sabbia: 0x8c8170 };
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const damp = (c, t, k, dt) => lerp(c, t, 1 - Math.exp(-k * dt));
function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

function ctex(T, w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; return t;
}
function drawPCB(g, w, h, seed, label) {
  const r = rng(seed), k = w / 512;
  g.fillStyle = '#0a281d'; g.fillRect(0, 0, w, h);
  const id = g.getImageData(0, 0, w, h);
  for (let i = 0; i < id.data.length; i += 4) { const n = (r() - 0.5) * 10; id.data[i] += n; id.data[i + 1] += n * 1.4; id.data[i + 2] += n; }
  g.putImageData(id, 0, 0);
  g.fillStyle = 'rgba(26,78,54,0.55)';
  for (let i = 0; i < 9; i++) { const x = r() * w, y = r() * h, ww = (60 + r() * 160) * k, hh = (40 + r() * 140) * k; g.beginPath(); g.moveTo(x + 8 * k, y); g.lineTo(x + ww, y); g.lineTo(x + ww, y + hh - 8 * k); g.lineTo(x + ww - 8 * k, y + hh); g.lineTo(x, y + hh); g.lineTo(x, y + 8 * k); g.closePath(); g.fill(); }
  g.lineCap = 'round'; g.lineJoin = 'round';
  for (let b = 0; b < 26; b++) {
    let x = r() * w, y = r() * h; const n = 1 + Math.floor(r() * 5), lw = (r() < 0.25 ? 4.5 : 2) * k, gap = lw + 4 * k;
    const segs = []; for (let s = 0; s < 3 + Math.floor(r() * 3); s++) { const d = (r() - 0.5) * 220 * k, m = r(); segs.push(m < 0.45 ? [d, 0] : m < 0.9 ? [0, d] : [d, Math.sign(r() - 0.5) * Math.abs(d)]); }
    for (let j = 0; j < n; j++) {
      let cx = x + j * gap, cy = y + j * gap; g.strokeStyle = 'rgba(52,128,88,0.9)'; g.lineWidth = lw; g.beginPath(); g.moveTo(cx, cy);
      for (const [dx, dy] of segs) { cx += dx; cy += dy; g.lineTo(cx, cy); } g.stroke();
      g.fillStyle = '#3f9a6a'; g.beginPath(); g.arc(cx, cy, 3.4 * k, 0, 7); g.fill(); g.fillStyle = '#06140e'; g.beginPath(); g.arc(cx, cy, 1.4 * k, 0, 7); g.fill();
    }
  }
  for (let i = 0; i < 26; i++) { const x = r() * w, y = r() * h; g.fillStyle = '#d6b15c'; g.beginPath(); g.arc(x, y, 5 * k, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(x - 1.5 * k, y - 1.5 * k, 1.8 * k, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(238,240,232,0.82)'; g.fillStyle = 'rgba(238,240,232,0.82)'; g.lineWidth = 1.4 * k; g.font = `600 ${Math.round(9 * k)}px monospace`;
  const refs = ['R', 'C', 'U', 'L', 'D', 'TP', 'Q', 'J'];
  for (let i = 0; i < 34; i++) { const x = r() * w, y = r() * h, bw = (14 + r() * 30) * k, bh = (8 + r() * 14) * k; g.strokeRect(x, y, bw, bh); g.fillText(refs[Math.floor(r() * refs.length)] + (1 + Math.floor(r() * 40)), x, y - 3 * k); }
  g.strokeStyle = 'rgba(238,240,232,0.6)'; g.lineWidth = 2 * k; g.strokeRect(10 * k, 10 * k, w - 20 * k, h - 20 * k);
  if (label) { g.font = `700 ${Math.round(16 * k)}px monospace`; g.fillText(label, 24 * k, h - 24 * k); g.font = `${Math.round(10 * k)}px monospace`; g.fillText('94V-0  ▲  2546', 24 * k, h - 44 * k); }
}
function drawEtch(g, w, h, lines) {
  g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(40,44,48,0.85)'; g.textAlign = 'center';
  lines.forEach((l, i) => { g.font = `${i === 0 ? 700 : 500} ${Math.round(h * (i === 0 ? 0.15 : 0.085))}px monospace`; g.fillText(l, w / 2, h * (0.38 + i * 0.16)); });
  g.beginPath(); g.arc(w * 0.12, h * 0.12, w * 0.035, 0, 7); g.fill();
}
function drawPerf(g, w, h) { g.fillStyle = '#c9ced3'; g.fillRect(0, 0, w, h); g.fillStyle = '#3a3f44'; for (let y = 10; y < h; y += 18) for (let x = 10 + ((y / 18) % 2) * 9; x < w; x += 18) { g.beginPath(); g.arc(x, y, 3.2, 0, 7); g.fill(); } }
function drawChip(g, w, h, l1, l2) {
  g.fillStyle = '#16181b'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#8f969d'; g.textAlign = 'center';
  g.font = `600 ${Math.round(h * 0.17)}px monospace`; g.fillText(l1, w / 2, h * 0.5);
  g.font = `${Math.round(h * 0.1)}px monospace`; g.fillText(l2, w / 2, h * 0.68);
  g.beginPath(); g.arc(w * 0.15, h * 0.15, w * 0.04, 0, 7); g.fill();
}
function drawBattery(g, w, h) {
  g.fillStyle = '#1b1e21'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8662a'; g.fillRect(0, 0, w, h * 0.14);
  g.fillStyle = '#ffffff'; g.font = `700 ${Math.round(h * 0.08)}px sans-serif`; g.fillText('TRAILMATE', w * 0.08, h * 0.3);
  g.fillStyle = '#a7aeb5'; g.font = `500 ${Math.round(h * 0.045)}px monospace`;
  g.fillText('LI-ION CELL · LOW TEMP', w * 0.08, h * 0.39);
  g.fillText('3.7 V', w * 0.08, h * 0.46);
  g.strokeStyle = '#5c636a'; g.lineWidth = 3; g.strokeRect(w * 0.08, h * 0.56, w * 0.84, h * 0.2);
  g.fillStyle = '#5c636a';
  for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(w * (0.2 + i * 0.2), h * 0.66, h * 0.05, 0, 7); g.fill(); }
  const r = rng(3);
  for (let x = w * 0.08; x < w * 0.92; x += 3 + r() * 6) { g.fillStyle = '#c7ccd1'; g.fillRect(x, h * 0.83, 1 + r() * 4, h * 0.09); }
}
function drawLogo(g, w, h) {
  g.clearRect(0, 0, w, h); g.strokeStyle = '#9ca3aa'; g.lineWidth = w * 0.055; g.lineJoin = 'round'; g.lineCap = 'round';
  g.beginPath(); g.arc(w / 2, h / 2, w * 0.38, 0, 7); g.stroke();
  g.beginPath(); g.moveTo(w * 0.25, h * 0.64); g.lineTo(w * 0.44, h * 0.37); g.lineTo(w * 0.55, h * 0.52); g.lineTo(w * 0.63, h * 0.44); g.lineTo(w * 0.76, h * 0.64); g.stroke();
}
function drawWordmark(g, w, h) {
  g.clearRect(0, 0, w, h); g.fillStyle = '#80878e'; g.font = `700 ${Math.round(h * 0.62)}px sans-serif`; g.textBaseline = 'middle';
  const s = 'TRAILMATE'; let x = w * 0.03; const step = w * 0.105;
  for (const ch of s) { g.fillText(ch, x, h / 2); x += step; }
}
function makeEnv(T, renderer) {
  const s = new T.Scene();
  const room = new T.Mesh(new T.BoxGeometry(1, 1, 1), new T.MeshBasicMaterial({ color: 0x1b1d20, side: T.BackSide }));
  room.scale.set(24, 14, 24); s.add(room);
  const add = (w, h, i, pos, rot, tint = [1, 1, 1]) => {
    const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(i * tint[0], i * tint[1], i * tint[2]), side: T.DoubleSide }));
    m.position.set(...pos); if (rot) m.rotation.set(...rot); else m.lookAt(0, 0, 0); s.add(m);
  };
  add(10, 5, 5, [0, 6.8, 0], [Math.PI / 2, 0, 0]);
  add(3, 7, 4, [-9, 2, 4]);
  add(2.5, 6, 2.2, [9, 1, 3]);
  add(8, 1.6, 2.4, [0, 1.5, -10], null, [1, 0.82, 0.66]);
  add(6, 3, 1.2, [0, -2, 10]);
  const pm = new T.PMREMGenerator(renderer);
  const tex = pm.fromScene(s, 0.035).texture; pm.dispose(); return tex;
}

class TrailmateViewer extends HTMLElement {
  constructor() {
    super();
    this._t = { explode: 0, focusId: null, focus: 0, spin: 0 };
    this._c = { explode: 0, spin: 0 };
    this._drag = { yaw: 0, pitch: 0, tyaw: 0, tpitch: 0, down: false, moved: 0, lastUp: 0 };
    this._finish = 'grafite'; this._ghostOn = true; this._time = 0; this._visible = true;
    this.ready = new Promise(r => (this._resolveReady = r));
  }
  explode(v) { this._t.explode = clamp(+v || 0, 0, 1); }
  focus(id, v) { this._t.focusId = id || null; this._t.focus = clamp(+v || 0, 0, 1); }
  spin(r) { this._t.spin = +r || 0; }
  setFinish(name) { this._finish = FINISHES[name] ? name : 'grafite'; if (this._rubber) for (const m of this._rubber) { m.userData.base.setHex(FINISHES[this._finish]); } if (this._parts) for (const p of this._parts) p.lastK = -1; }
  setGhost(on) { this._ghostOn = !!on; }
  connectedCallback() {
    Object.assign(this.style, { display: 'block', position: 'absolute', inset: '0', width: '100%', height: '100%' });
    this._reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this._center = this.getAttribute('layout') === 'center';
    this._fit = parseFloat(this.getAttribute('fit')) || 0;
    if (this._built) { this._start(); return; }
    if (this._booting) return; this._booting = true;
    this._boot();
  }
  disconnectedCallback() { this._stop(); }
  _hasGL() { try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; } }
  _fallback(msg) {
    this.innerHTML = `<div role="note" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:flex-end;padding:6vw;box-sizing:border-box;color:#eceeef;font-family:'IBM Plex Mono',monospace"><div style="max-width:380px"><p style="color:#f0712c;margin:0 0 12px;font-size:13px;letter-spacing:.08em;text-transform:uppercase">${msg}</p><p style="margin:0 0 14px;font-size:14px;color:#a3aab1">Here’s what’s inside Trailmate:</p><ol style="margin:0;padding-left:20px;line-height:1.9;font-size:14px">${PARTS.map(p => `<li>${p.name}</li>`).join('')}</ol></div></div>`;
    this._resolveReady(this);
  }
  async _boot() {
    if (!this._hasGL()) return this._fallback('WebGL is not available on this device.');
    try { this.THREE = await import(THREE_URL); } catch (e) { return this._fallback('Unable to load the 3D model.'); }
    try { this._build(); } catch (e) { console.error(e); return this._fallback('The 3D model cannot be displayed.'); }
    this._built = true; this._resolveReady(this); if (this.isConnected) this._start();
  }
  _build() {
    const T = this.THREE;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('role', 'img'); canvas.tabIndex = -1;
    canvas.setAttribute('aria-label', 'Interactive exploded 3D model of Trailmate: rubber shell, cold-weather battery, logic board with AI model, motion sensor, barometer and temperature sensor, satellite module, camera, siren and LED. Drag to rotate, click a component to learn more.');
    Object.assign(canvas.style, { width: '100%', height: '100%', display: 'block', touchAction: 'pan-y', cursor: 'grab', outline: 'none' });
    this.appendChild(canvas); this._canvas = canvas;
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    this._renderer = renderer;
    const scene = new T.Scene(); this._scene = scene;
    scene.environment = makeEnv(T, renderer);
    const camera = new T.PerspectiveCamera(32, 1, 0.1, 100); this._camera = camera;
    const key = new T.DirectionalLight(0xffffff, 1.7); key.position.set(-3, 8, 6); key.castShadow = true;
    Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 30 });
    key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; key.shadow.radius = 5;
    scene.add(key);
    const fill = new T.DirectionalLight(0xffe2c8, 0.45); fill.position.set(5, 1, 3); scene.add(fill);
    const rim = new T.DirectionalLight(0xbcd2ff, 0.9); rim.position.set(0, 3, -6); scene.add(rim);
    const ground = new T.Mesh(new T.PlaneGeometry(30, 30), new T.ShadowMaterial({ opacity: 0.22 }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -2.9; ground.receiveShadow = true; ground.visible = !this._center && !this.hasAttribute('no-ground'); scene.add(ground);
    this._root = new T.Group(); this._device = new T.Group(); this._root.add(this._device); scene.add(this._root);
    this._buildModel();
    this._tmp = { v: new T.Vector3(), tgt: new T.Vector3(), arc: new T.Vector3(), qP: new T.Quaternion(), qPi: new T.Quaternion(), qD: new T.Quaternion(), qT: new T.Quaternion(), qI: new T.Quaternion(), eul: new T.Euler(), ndc: new T.Vector2() };
    this._ray = new T.Raycaster();
    this._resize();
    this._ro = new ResizeObserver(() => this._resize()); this._ro.observe(this);
    this._bindPointer();
  }
  _buildModel() {
    const T = this.THREE, device = this._device;
    const parts = []; this._parts = parts; this._byId = {}; this._pickables = []; this._leds = []; this._rubber = [];
    const fin = FINISHES[this._finish];
    const P = (id, kind, rest, exZ, delay, fs) => {
      const g = new T.Group(); g.position.set(...rest); device.add(g);
      const p = { id, kind, story: kind === 'story', group: g, rest: new T.Vector3(...rest), exZ, delay, fs, mats: [], edges: [], meshes: [], f: 0, lastK: -1, shadow: true };
      parts.push(p); this._byId[id] = p; return p;
    };
    const M = (p, o, Cls) => {
      const m = new (Cls || T.MeshStandardMaterial)(o);
      m.userData.base = m.color.clone(); m.userData.env = m.envMapIntensity ?? 1;
      p.mats.push(m); return m;
    };
    const add = (p, geo, mat, x = 0, y = 0, z = 0, pick = true) => {
      const o = new T.Mesh(geo, mat); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true;
      o.userData.partId = p.id; p.group.add(o); p.meshes.push(o); if (pick) this._pickables.push(o); return o;
    };
    const edge = (p, geo, x = 0, y = 0, z = 0) => {
      const l = new T.LineSegments(new T.EdgesGeometry(geo, 32), new T.LineBasicMaterial({ color: 0xc3ccd4, transparent: true, opacity: 0, depthWrite: false }));
      l.position.set(x, y, z); p.group.add(l); p.edges.push(l.material);
    };
    const rrPath = (path, w, h, r, cx = 0, cy = 0) => {
      r = Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4); const x = cx - w / 2, y = cy - h / 2;
      path.moveTo(x + r, y); path.lineTo(x + w - r, y); path.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
      path.lineTo(x + w, y + h - r); path.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
      path.lineTo(x + r, y + h); path.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
      path.lineTo(x, y + r); path.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
    };
    const shape = (w, h, r, cx, cy, holes = []) => {
      const s = new T.Shape(); rrPath(s, w, h, r, cx, cy);
      for (const hd of holes) { const hp = new T.Path(); rrPath(hp, ...hd); s.holes.push(hp); }
      return s;
    };
    const ext = (s, thick, b = 0) => {
      const depth = Math.max(thick - 2 * b, 0.001);
      const g = new T.ExtrudeGeometry(s, { depth, bevelEnabled: b > 0, bevelThickness: b, bevelSize: b, bevelSegments: b > 0 ? 4 : 1, curveSegments: 24 });
      g.translate(0, 0, -depth / 2); return g;
    };
    const rbox = (w, h, d, r = 0.03, b = 0.012) => ext(shape(w - 2 * b, h - 2 * b, Math.max(r - b, 0.003), 0, 0), d, b);
    const cylZ = (r, h, seg = 48) => { const g = new T.CylinderGeometry(r, r, h, seg); g.rotateX(Math.PI / 2); return g; };
    const tube = (pts, r = 0.012) => new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(a => new T.Vector3(...a))), 32, r, 8, false);
    const OW = 1.6, OH = 2.75, OR = 0.34;
    const outline = i => [OW - 2 * i, OH - 2 * i, OR - i, 0, 0];
    const loopH = e => [0.86 + 2 * e, 0.3 + 2 * e, 0.15 + e, 0, -1.04];
    const CAV = [1.38, 2.02, 0.2, 0, 0.29];

    const pcbTex = ctex(T, 1024, 1504, (g, w, h) => drawPCB(g, w, h, 11, 'TRAILMATE MB-01 REV C'));
    const pcbSmall = ctex(T, 512, 512, (g, w, h) => drawPCB(g, w, h, 29, ''));
    const npuTex = ctex(T, 256, 256, (g, w, h) => drawChip(g, w, h, 'TM-N1', 'ON-DEVICE AI'));
    const memTex = ctex(T, 256, 144, (g, w, h) => drawChip(g, w, h, 'MEM', 'TRAILMATE'));
    const imuTex = ctex(T, 128, 128, (g, w, h) => drawChip(g, w, h, '6AX', 'IMU'));
    const batTex = ctex(T, 512, 620, drawBattery);
    const logoTex = ctex(T, 256, 256, drawLogo);
    const wordTex = ctex(T, 512, 80, drawWordmark);
    const noiseTex = ctex(T, 256, 256, (g, w, h) => { const id = g.createImageData(w, h); const r = rng(5); for (let i = 0; i < w * h; i++) { const v = (100 + r() * 80) | 0; id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255; } g.putImageData(id, 0, 0); });
    noiseTex.colorSpace = T.NoColorSpace; noiseTex.wrapS = noiseTex.wrapT = T.RepeatWrapping; noiseTex.repeat.set(6, 6);
    const rubberX = { transparent: true, bumpMap: noiseTex, bumpScale: 0.5 };
    const pcbMats = (p, tex) => { const side = M(p, { color: 0x6b6a4e, roughness: 0.8 }); const top = M(p, { map: tex, bumpMap: tex, bumpScale: 0.8, roughness: 0.42, metalness: 0.05, clearcoat: 0.55, clearcoatRoughness: 0.35 }, T.MeshPhysicalMaterial); const bot = M(p, { color: 0x0b2a1f, roughness: 0.5 }); return [side, side, side, side, top, bot]; };
    const sdm = (p, color, rough, metal, extra = {}) => M(p, Object.assign({ color, roughness: rough, metalness: metal }, extra));
    const ledMat = (p, color, base) => { const m = M(p, { color: 0x111111, emissive: color, emissiveIntensity: base, roughness: 0.3 }); this._leds.push({ p, m, base }); return m; };
    const passives = (p, n, seed, w, h, z) => {
      const r = rng(seed); const tan = sdm(p, 0xb59b6c, 0.5, 0.2), dark = sdm(p, 0x2b2b2b, 0.45, 0.2); const g = new T.BoxGeometry(0.05, 0.026, 0.022);
      for (let i = 0; i < n; i++) { const o = add(p, g, r() < 0.6 ? tan : dark, (r() - 0.5) * w, (r() - 0.5) * h, z); if (r() < 0.5) o.rotation.z = Math.PI / 2; }
    };

    // Back shell
    const back = P('shell-back', 'shell', [0, 0, 0], -1.6, 0.3, 1);
    const rubB = sdm(back, fin, 0.82, 0.04, rubberX); this._rubber.push(rubB);
    const orB = sdm(back, 0xe2621f, 0.5, 0.05, { transparent: true });
    let g = ext(shape(...outline(0.03), [loopH(0.03)]), 0.08, 0.03); add(back, g, rubB, 0, 0, -0.28); edge(back, g, 0, 0, -0.28);
    g = ext(shape(...outline(0.02), [[CAV[0] + 0.04, CAV[1] + 0.04, CAV[2] + 0.02, 0, CAV[4]], loopH(0.02)]), 0.44, 0.02); add(back, g, rubB, 0, 0, -0.04); edge(back, g, 0, 0, -0.04);
    add(back, ext(shape(0.86, 0.3, 0.15, 0, -1.04, [[0.79, 0.23, 0.115, 0, -1.04]]), 0.5, 0), orB, 0, 0, -0.06);
    g = rbox(0.06, 0.28, 0.13, 0.03, 0.01); add(back, g, orB, -0.81, 0.74, 0); add(back, g, orB, -0.81, 0.36, 0);
    add(back, rbox(0.06, 0.44, 0.13, 0.03, 0.01), orB, 0.81, 0.58, 0);
    add(back, rbox(0.03, 0.28, 0.1, 0.014, 0.007), rubB, -0.812, -0.42, 0);
    g = new T.BoxGeometry(0.02, 0.012, 0.09); for (let i = 0; i < 4; i++) add(back, g, sdm(back, 0x1a1c1f, 0.7, 0, { transparent: true }), 0.805, -0.05 - i * 0.05, 0);

    // Front cover (lid)
    const front = P('shell-front', 'shell', [0, 0, 0], 1.65, 0, 1);
    const rubF = sdm(front, fin, 0.78, 0.04, rubberX); this._rubber.push(rubF);
    const orF = sdm(front, 0xe2621f, 0.5, 0.05, { transparent: true });
    const blkF = sdm(front, 0x0d0e10, 0.22, 0.2, { transparent: true });
    const metF = sdm(front, 0x2b2e32, 0.3, 0.85, { transparent: true });
    const btnF = sdm(front, 0x2a2d31, 0.66, 0.05, { transparent: true });
    const glassF = M(front, { color: 0x0a1520, roughness: 0.04, metalness: 0.3, clearcoat: 1, clearcoatRoughness: 0.03, transparent: true }, T.MeshPhysicalMaterial);
    g = ext(shape(...outline(0.045), [loopH(0.045)]), 0.13, 0.045); add(front, g, rubF, 0, 0, 0.255); edge(front, g, 0, 0, 0.255);
    add(front, ext(shape(...outline(-0.012), [outline(0.07)]), 0.035, 0), orF, 0, 0, 0.185);
    add(front, ext(shape(0.86, 0.3, 0.15, 0, -1.04, [[0.78, 0.22, 0.11, 0, -1.04]]), 0.14, 0), orF, 0, 0, 0.255);
    add(front, rbox(0.66, 0.44, 0.05, 0.13, 0.015), blkF, 0.22, 0.98, 0.335);
    add(front, ext(shape(...outline(0.055), [outline(0.13)]), 0.04, 0.012), rubF, 0, 0, 0.33);
    // camera module: bezel, stepped metal barrel, iridescent element, glass dome
    const lx = 0.33, ly = 0.98, lz = 0.36;
    const barrel = new T.LatheGeometry([[0.104, 0.008], [0.104, 0.044], [0.132, 0.046], [0.152, 0.032], [0.156, 0.0]].map(([r, h]) => new T.Vector2(r, h)), 72); barrel.rotateX(Math.PI / 2);
    const metF2 = sdm(front, 0x3a3e44, 0.22, 1, { transparent: true, side: T.DoubleSide });
    add(front, barrel, metF2, lx, ly, lz);
    add(front, cylZ(0.105, 0.01), blkF, lx, ly, lz + 0.006);
    const irid = M(front, { color: 0x1a2a55, metalness: 0.9, roughness: 0.18, iridescence: 1, iridescenceIOR: 1.7, iridescenceThicknessRange: [180, 620], transparent: true }, T.MeshPhysicalMaterial);
    add(front, cylZ(0.085, 0.004), irid, lx, ly, lz + 0.013);
    add(front, cylZ(0.036, 0.004), sdm(front, 0x020304, 0.3, 0, { transparent: true }), lx, ly, lz + 0.016);
    add(front, new T.TorusGeometry(0.06, 0.004, 8, 48), metF2, lx, ly, lz + 0.016);
    const R = 0.22, th = Math.asin(0.104 / R);
    const dome = new T.SphereGeometry(R, 64, 12, 0, Math.PI * 2, 0, th); dome.rotateX(Math.PI / 2);
    const domeM = M(front, { color: 0x0a0f16, roughness: 0.02, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.01, transparent: true, opacity: 0.5, envMapIntensity: 2.2 }, T.MeshPhysicalMaterial);
    add(front, dome, domeM, lx, ly, lz + 0.012 - R * Math.cos(th));
    add(front, cylZ(0.03, 0.005), M(front, { color: 0x2a0a0a, roughness: 0.05, metalness: 0.2, clearcoat: 1, transparent: true }, T.MeshPhysicalMaterial), 0.04, 0.98, 0.362);
    add(front, cylZ(0.009, 0.004, 16), sdm(front, 0x000000, 0.9, 0, { transparent: true }), 0.04, 1.1, 0.362);
    add(front, rbox(0.07, 0.18, 0.012, 0.03, 0.004), blkF, -0.32, 0.98, 0.322);
    add(front, rbox(0.05, 0.15, 0.03, 0.025, 0.01), ledMat(front, 0x3dff74, 2.4), -0.32, 0.98, 0.33);
    const glowTex = ctex(T, 128, 128, (gg, w, h) => { const gr = gg.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.22, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); gg.fillStyle = gr; gg.fillRect(0, 0, w, h); });
    const glow = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0x3dff74, blending: T.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.6 }));
    glow.scale.set(0.34, 0.42, 1); glow.position.set(-0.32, 0.98, 0.37); front.group.add(glow); this._glow = { s: glow, shell: rubF, p: front };
    add(front, rbox(0.56, 0.44, 0.06, 0.11, 0.02), btnF, 0, 0.3, 0.345);
    add(front, ext(shape(0.5, 0.38, 0.085, 0, 0, [[0.44, 0.32, 0.06, 0, 0]]), 0.012, 0.003), btnF, 0, 0.3, 0.378);
    const logoM = sdm(front, 0xffffff, 0.6, 0, { map: logoTex, transparent: true, polygonOffset: true, polygonOffsetFactor: -2 });
    add(front, new T.PlaneGeometry(0.24, 0.24), logoM, 0, 0.3, 0.3762);
    g = rbox(0.12, 0.026, 0.028, 0.012, 0.005); for (let i = 0; i < 6; i++) add(front, g, rubF, 0.56, 0.12 + i * 0.062, 0.332);
    const chin = new T.Shape(); chin.moveTo(-0.56, -0.66); chin.lineTo(0.56, -0.66); chin.lineTo(0.44, -0.84); chin.lineTo(-0.44, -0.84); chin.closePath();
    add(front, ext(chin, 0.035, 0.012), btnF, 0, 0, 0.335);
    const screwG = cylZ(0.03, 0.012, 24), slotG = new T.BoxGeometry(0.036, 0.007, 0.006), screwM = sdm(front, 0x4a4f55, 0.3, 0.95, { transparent: true }), slotM = sdm(front, 0x050505, 0.8, 0, { transparent: true });
    for (const [sx, sy] of [[-0.708, 0.62], [0.708, 0.62], [-0.708, -0.62], [0.708, -0.62]]) { add(front, screwG, screwM, sx, sy, 0.355); add(front, slotG, slotM, sx, sy, 0.3615).rotation.z = 0.5; add(front, slotG, slotM, sx, sy, 0.3615).rotation.z = 0.5 + Math.PI / 2; }
    const wordM = sdm(front, 0xffffff, 0.7, 0, { map: wordTex, transparent: true, polygonOffset: true, polygonOffsetFactor: -2 });
    add(front, new T.PlaneGeometry(0.62, 0.097), wordM, 0, -0.5, 0.3215);

    const inst = (p, geo, mat, list) => {
      if (!list.length) return null;
      const im = new T.InstancedMesh(geo, mat, list.length), m4 = new T.Matrix4(), q = new T.Quaternion(), s = new T.Vector3(1, 1, 1), v = new T.Vector3(), eu = new T.Euler();
      list.forEach((o, i) => { v.set(o[0], o[1], o[2]); q.setFromEuler(eu.set(0, 0, o[3] || 0)); m4.compose(v, q, s); im.setMatrixAt(i, m4); });
      im.castShadow = true; im.receiveShadow = true; im.userData.partId = p.id; p.group.add(im); p.meshes.push(im); this._pickables.push(im); return im;
    };
    const etch = (lines, w = 256, h = 256) => ctex(T, w, h, (gg, ww, hh) => drawEtch(gg, ww, hh, lines));
    const perfTex = ctex(T, 256, 256, drawPerf); perfTex.wrapS = perfTex.wrapT = T.RepeatWrapping;
    const smdGeo = { rb: new T.BoxGeometry(0.034, 0.026, 0.016), cb: new T.BoxGeometry(0.034, 0.026, 0.02), bb: new T.BoxGeometry(0.06, 0.04, 0.032), cap: new T.BoxGeometry(0.01, 0.027, 0.017), capB: new T.BoxGeometry(0.012, 0.041, 0.033) };
    const smd = (p, n, seed, w, h, top, avoid = [], cx = 0, cy = 0) => {
      const r = rng(seed), placed = [], L = { rb: [], cb: [], bb: [], cap: [], capB: [] };
      const hit = (x, y) => avoid.some(([ax, ay, aw, ah]) => Math.abs(x - ax) < aw / 2 + 0.04 && Math.abs(y - ay) < ah / 2 + 0.04) || placed.some(([px, py]) => Math.hypot(px - x, py - y) < 0.062);
      for (let t = 0; t < n * 8 && placed.length < n; t++) {
        const x = cx + (r() - 0.5) * w, y = cy + (r() - 0.5) * h; if (hit(x, y)) continue; placed.push([x, y]);
        const rot = r() < 0.5 ? 0 : Math.PI / 2, kd = r(), c = Math.cos(rot), s = Math.sin(rot);
        if (kd < 0.14) { L.bb.push([x, y, top + 0.016, rot]); for (const sg of [-1, 1]) L.capB.push([x + sg * 0.033 * c, y + sg * 0.033 * s, top + 0.0165, rot]); }
        else { const key = kd < 0.55 ? 'rb' : 'cb', hz = key === 'rb' ? 0.008 : 0.01; L[key].push([x, y, top + hz, rot]); for (const sg of [-1, 1]) L.cap.push([x + sg * 0.022 * c, y + sg * 0.022 * s, top + 0.0085, rot]); }
      }
      inst(p, smdGeo.rb, sdm(p, 0x121212, 0.5, 0.1), L.rb); inst(p, smdGeo.cb, sdm(p, 0x9c8257, 0.6, 0.05), L.cb); inst(p, smdGeo.bb, sdm(p, 0xa88c5c, 0.6, 0.05), L.bb);
      const tin = sdm(p, 0xd2d6d9, 0.28, 1); inst(p, smdGeo.cap, tin, L.cap); inst(p, smdGeo.capB, tin, L.capB);
    };
    const qfn = (p, x, y, top, w, d, tex, padCol) => {
      add(p, rbox(w, w, d, 0.006, 0.003), sdm(p, 0x141518, 0.55, 0.15), x, y, top + d / 2);
      if (tex) add(p, new T.PlaneGeometry(w * 0.9, w * 0.9), sdm(p, 0xffffff, 0.6, 0, { map: tex, transparent: true }), x, y, top + d + 0.0006);
      const pads = [], nper = Math.max(3, Math.round(w / 0.022)), st = w / (nper + 1);
      for (let i = 1; i <= nper; i++) { const o = -w / 2 + i * st; pads.push([x + o, y - w / 2 - 0.004, top + 0.002, 0], [x + o, y + w / 2 + 0.004, top + 0.002, 0], [x - w / 2 - 0.004, y + o, top + 0.002, Math.PI / 2], [x + w / 2 + 0.004, y + o, top + 0.002, Math.PI / 2]); }
      inst(p, new T.BoxGeometry(st * 0.5, 0.012, 0.004), padCol || sdm(p, 0xcfd3d6, 0.3, 1), pads);
    };
    const holes = (p, pts, top) => { const ring = sdm(p, 0xd6b15c, 0.3, 1), dark = sdm(p, 0x050806, 0.9, 0); for (const [x, y] of pts) { add(p, new T.RingGeometry(0.028, 0.05, 32), ring, x, y, top + 0.0008); add(p, new T.CircleGeometry(0.028, 24), dark, x, y, top + 0.0009); } };
    const glassMat = (p, c = 0x0a1520, extra = {}) => M(p, Object.assign({ color: c, roughness: 0.03, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.6 }, extra), T.MeshPhysicalMaterial);

    // 01 Battery — pouch cell with PCM board
    const bat = P('battery', 'story', [0, 0.28, -0.17], -1.05, 0.28, 1.0);
    const foil = sdm(bat, 0xbfc4c9, 0.34, 0.75, { bumpMap: noiseTex, bumpScale: 0.25 });
    add(bat, rbox(1.2, 1.38, 0.11, 0.06, 0.04), foil, 0, -0.06, 0);
    add(bat, rbox(1.22, 0.14, 0.018, 0.02, 0.006), foil, 0, 0.69, -0.01);
    add(bat, rbox(1.16, 0.06, 0.02, 0.01, 0.004), sdm(bat, 0xb5bac0, 0.4, 0.7), 0, 0.64, 0.035);
    add(bat, new T.PlaneGeometry(1.0, 1.14), sdm(bat, 0xffffff, 0.5, 0, { map: batTex }), 0, -0.08, 0.0552);
    const kapton = sdm(bat, 0xd68b1e, 0.25, 0, { transparent: true, opacity: 0.72, clearcoat: 1 });
    add(bat, new T.BoxGeometry(0.9, 0.1, 0.004), kapton, 0, 0.6, 0.057);
    const nickel = sdm(bat, 0xdadde0, 0.22, 1);
    add(bat, new T.BoxGeometry(0.1, 0.16, 0.006), nickel, -0.3, 0.8, 0.0); add(bat, new T.BoxGeometry(0.1, 0.16, 0.006), sdm(bat, 0xc9a36a, 0.25, 1), 0.3, 0.8, 0.0);
    add(bat, new T.BoxGeometry(0.86, 0.13, 0.022), pcbMats(bat, pcbSmall), 0, 0.84, 0.012);
    qfn(bat, -0.08, 0.84, 0.023, 0.07, 0.014); qfn(bat, 0.08, 0.84, 0.023, 0.05, 0.012);
    const solder = sdm(bat, 0xe2e5e8, 0.18, 1);
    for (const x of [-0.3, 0.3]) add(bat, new T.SphereGeometry(0.03, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2).rotateX(Math.PI / 2), solder, x, 0.84, 0.023);
    add(bat, rbox(0.14, 0.07, 0.06, 0.01, 0.004), sdm(bat, 0xf1ede2, 0.55, 0), 0.34, 0.86, 0.05);
    add(bat, tube([[0.31, 0.89, 0.06], [0.28, 0.98, 0.1], [0.12, 1.02, 0.14], [0.02, 0.98, 0.16]], 0.011), sdm(bat, 0xc23a2a, 0.45, 0));
    add(bat, tube([[0.37, 0.89, 0.06], [0.36, 1.0, 0.1], [0.2, 1.05, 0.14], [0.08, 1.0, 0.16]], 0.011), sdm(bat, 0x18191b, 0.45, 0));

    // 02 Mainboard + NPU
    const brain = P('brain', 'story', [0, 0.28, -0.08], -0.52, 0.22, 0.82);
    add(brain, new T.BoxGeometry(1.36, 2.0, 0.03), pcbMats(brain, pcbTex));
    const top = 0.015;
    add(brain, new T.BoxGeometry(0.46, 0.46, 0.012), sdm(brain, 0x2d3524, 0.6, 0.1), 0.04, 0.16, top + 0.006);
    const lid = sdm(brain, 0xc4c9ce, 0.33, 1, { bumpMap: noiseTex, bumpScale: 0.08 });
    add(brain, rbox(0.38, 0.38, 0.022, 0.02, 0.005), lid, 0.04, 0.16, top + 0.023);
    add(brain, new T.PlaneGeometry(0.34, 0.34), sdm(brain, 0xffffff, 0.5, 0, { map: etch(['TM-N1', 'ON-DEVICE AI', '2546  KR']), transparent: true }), 0.04, 0.16, top + 0.0345);
    const memTex2 = etch(['TM-M4', 'LPDDR', 'X7 2539'], 256, 160);
    for (const x of [-0.2, 0.28]) { add(brain, rbox(0.26, 0.16, 0.03, 0.008, 0.003), sdm(brain, 0x16171a, 0.5, 0.1), x, -0.22, top + 0.015); add(brain, new T.PlaneGeometry(0.24, 0.15), sdm(brain, 0xffffff, 0.55, 0, { map: memTex2, transparent: true, opacity: 0.9 }), x, -0.22, top + 0.0306); }
    qfn(brain, -0.42, 0.18, top, 0.16, 0.022, etch(['PM8', '1A2'], 128, 128));
    qfn(brain, 0.46, -0.6, top, 0.1, 0.018);
    const ind = sdm(brain, 0x4b4f54, 0.65, 0.2);
    for (const [x, y] of [[-0.56, -0.02], [-0.42, -0.02], [-0.28, -0.02]]) { add(brain, rbox(0.09, 0.09, 0.045, 0.01, 0.004), ind, x, y, top + 0.0225); }
    const shield = sdm(brain, 0xffffff, 0.3, 1, { map: perfTex });
    add(brain, rbox(0.44, 0.34, 0.045, 0.012, 0.004), shield, -0.34, 0.64, top + 0.0225);
    add(brain, rbox(0.3, 0.2, 0.04, 0.012, 0.004), shield, 0.38, 0.84, top + 0.02);
    add(brain, new T.BoxGeometry(0.3, 0.07, 0.04), sdm(brain, 0xe6dfcf, 0.6, 0), 0.34, 0.56, top + 0.02);
    add(brain, new T.BoxGeometry(0.31, 0.025, 0.015), sdm(brain, 0x18191b, 0.5, 0), 0.34, 0.585, top + 0.044);
    const pins = []; for (let i = 0; i < 14; i++) pins.push([0.22 + i * 0.019, 0.515, top + 0.002, 0]);
    inst(brain, new T.BoxGeometry(0.008, 0.03, 0.004), sdm(brain, 0xd6b15c, 0.3, 1), pins);
    add(brain, rbox(0.13, 0.07, 0.03, 0.03, 0.006), sdm(brain, 0xd4d8dc, 0.26, 1), 0.47, 0.2, top + 0.015);
    add(brain, rbox(0.18, 0.08, 0.07, 0.006, 0.003), sdm(brain, 0xf0ece0, 0.55, 0), 0.44, -0.38, top + 0.035);
    const usb = sdm(brain, 0xc9ced3, 0.25, 1);
    add(brain, rbox(0.28, 0.11, 0.09, 0.05, 0.008), usb, 0, -0.95, top + 0.045);
    add(brain, rbox(0.22, 0.06, 0.004, 0.028, 0.002).rotateX(Math.PI / 2), sdm(brain, 0x050505, 0.9, 0), 0, -1.006, top + 0.045);
    holes(brain, [[-0.58, 0.9], [0.58, 0.9], [-0.58, -0.88], [0.58, -0.88]], top);
    smd(brain, 120, 7, 1.2, 1.84, top, [[0.04, 0.16, 0.48, 0.48], [-0.2, -0.22, 0.28, 0.18], [0.28, -0.22, 0.28, 0.18], [-0.42, 0.18, 0.2, 0.2], [0.46, -0.6, 0.14, 0.14], [-0.42, -0.02, 0.4, 0.1], [-0.34, 0.64, 0.46, 0.36], [0.38, 0.84, 0.32, 0.22], [0.34, 0.55, 0.34, 0.12], [0.47, 0.2, 0.15, 0.09], [0.44, -0.38, 0.2, 0.1], [0, -0.95, 0.3, 0.14], [-0.58, 0.9, 0.1, 0.1], [0.58, 0.9, 0.1, 0.1], [-0.58, -0.88, 0.1, 0.1], [0.58, -0.88, 0.1, 0.1]]);

    // 03 IMU
    const imu = P('imu', 'story', [-0.42, -0.45, 0], -0.06, 0.16, 3.3);
    add(imu, new T.BoxGeometry(0.38, 0.38, 0.025), pcbMats(imu, pcbSmall));
    const t3 = 0.0125;
    qfn(imu, 0, 0.02, t3, 0.12, 0.022, etch(['6AX', 'IMU'], 128, 128));
    add(imu, rbox(0.11, 0.05, 0.03, 0.006, 0.003), sdm(imu, 0xf0ece0, 0.55, 0), 0, -0.15, t3 + 0.015);
    const cast = []; for (let i = 0; i < 6; i++) { const o = -0.15 + i * 0.06; cast.push([-0.19, o, 0, Math.PI / 2], [0.19, o, 0, Math.PI / 2]); }
    inst(imu, new T.BoxGeometry(0.03, 0.012, 0.027), sdm(imu, 0xd6b15c, 0.3, 1), cast);
    holes(imu, [[-0.14, 0.15], [0.14, 0.15]], t3);
    smd(imu, 10, 41, 0.3, 0.26, t3, [[0, 0.02, 0.14, 0.14], [0, -0.15, 0.12, 0.06], [-0.14, 0.15, 0.08, 0.08], [0.14, 0.15, 0.08, 0.08]]);

    // 04 Climate: barometer + temperature
    const cli = P('climate', 'story', [0.4, -0.45, 0], -0.06, 0.16, 2.6);
    add(cli, new T.BoxGeometry(0.5, 0.38, 0.025), pcbMats(cli, pcbSmall));
    const t4 = 0.0125, can = sdm(cli, 0xd2d6da, 0.22, 1, { bumpMap: noiseTex, bumpScale: 0.05 });
    add(cli, rbox(0.15, 0.15, 0.06, 0.02, 0.006), can, -0.11, 0.05, t4 + 0.03);
    add(cli, cylZ(0.02, 0.004, 24), sdm(cli, 0x050505, 0.8, 0), -0.08, 0.08, t4 + 0.0615);
    add(cli, new T.PlaneGeometry(0.12, 0.12), sdm(cli, 0xffffff, 0.5, 0, { map: etch(['BMP', '7K2'], 128, 128), transparent: true }), -0.12, 0.03, t4 + 0.0605);
    add(cli, rbox(0.08, 0.08, 0.022, 0.008, 0.003), sdm(cli, 0xe8e4da, 0.6, 0), 0.13, 0.08, t4 + 0.011);
    add(cli, new T.CircleGeometry(0.012, 16), sdm(cli, 0x2c2a26, 0.8, 0), 0.13, 0.08, t4 + 0.0225);
    add(cli, new T.TorusGeometry(0.06, 0.012, 12, 40), sdm(cli, 0x2a2c2f, 0.7, 0), 0.12, -0.1, t4 + 0.01);
    add(cli, cylZ(0.052, 0.006, 32), sdm(cli, 0xf4f4f0, 0.95, 0, { bumpMap: noiseTex, bumpScale: 0.4 }), 0.12, -0.1, t4 + 0.008);
    smd(cli, 10, 77, 0.44, 0.32, t4, [[-0.11, 0.05, 0.17, 0.17], [0.13, 0.08, 0.1, 0.1], [0.12, -0.1, 0.16, 0.16]]);

    // 05 Satellite + GNSS patch antenna
    const sat = P('satellite', 'story', [-0.34, 0.86, 0.05], 0.38, 0.1, 2.1);
    add(sat, rbox(0.6, 0.6, 0.1, 0.02, 0.01), sdm(sat, 0xcdb98f, 0.62, 0.02, { bumpMap: noiseTex, bumpScale: 0.15 }));
    const elec = new T.Shape(); const a = 0.22, cc = 0.05; elec.moveTo(-a + cc, -a); elec.lineTo(a, -a); elec.lineTo(a, a - cc); elec.lineTo(a - cc, a); elec.lineTo(-a, a); elec.lineTo(-a, -a + cc); elec.closePath();
    add(sat, ext(elec, 0.006, 0), sdm(sat, 0xdfe2e4, 0.2, 1, { bumpMap: noiseTex, bumpScale: 0.06 }), 0, 0, 0.053);
    add(sat, new T.SphereGeometry(0.03, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2).rotateX(Math.PI / 2), sdm(sat, 0xe4e7ea, 0.15, 1), 0.06, 0.06, 0.056);
    add(sat, new T.BoxGeometry(0.62, 0.62, 0.02), pcbMats(sat, pcbSmall), 0, 0, -0.065);
    add(sat, rbox(0.3, 0.24, 0.035, 0.01, 0.004), sdm(sat, 0xffffff, 0.3, 1, { map: perfTex }), -0.12, -0.12, -0.093);
    const gold = sdm(sat, 0xd6b15c, 0.28, 1);
    add(sat, cylZ(0.03, 0.025, 24), gold, 0.22, -0.22, -0.088);
    add(sat, tube([[0.22, -0.22, -0.1], [0.3, -0.34, -0.13], [0.1, -0.42, -0.15], [-0.18, -0.36, -0.15]], 0.014), sdm(sat, 0x2c2f33, 0.55, 0.1));

    // 06 Camera
    const cam = P('camera', 'story', [0.33, 0.98, 0.02], 1.04, 0.05, 2.8);
    add(cam, new T.BoxGeometry(0.42, 0.42, 0.02), pcbMats(cam, pcbSmall), 0, 0, -0.065);
    add(cam, rbox(0.38, 0.38, 0.11, 0.03, 0.01), sdm(cam, 0x111214, 0.55, 0.1, { bumpMap: noiseTex, bumpScale: 0.2 }), 0, 0, -0.0);
    const thread = []; for (let i = 0; i <= 16; i++) thread.push(new T.Vector2(i % 2 ? 0.118 : 0.126, i * 0.006));
    thread.push(new T.Vector2(0.135, 0.098), new T.Vector2(0.135, 0.108), new T.Vector2(0.1, 0.11));
    const barrelC = new T.LatheGeometry(thread, 72); barrelC.rotateX(Math.PI / 2);
    add(cam, barrelC, sdm(cam, 0x1a1b1e, 0.4, 0.4, { side: T.DoubleSide }), 0, 0, 0.055);
    add(cam, cylZ(0.1, 0.006, 48), glassMat(cam, 0x26356a, { iridescence: 1, iridescenceIOR: 1.6, iridescenceThicknessRange: [200, 600] }), 0, 0, 0.16);
    const Rc = 0.2, thc = Math.asin(0.095 / Rc); const domeC = new T.SphereGeometry(Rc, 64, 12, 0, Math.PI * 2, 0, thc); domeC.rotateX(Math.PI / 2);
    add(cam, domeC, glassMat(cam, 0x0a0f16, { transparent: true, opacity: 0.55 }), 0, 0, 0.163 - Rc * Math.cos(thc));
    add(cam, new T.TorusGeometry(0.1, 0.006, 8, 48), sdm(cam, 0x55595e, 0.25, 1), 0, 0, 0.165);
    const flexM = sdm(cam, 0xc8761f, 0.35, 0.1, { clearcoat: 0.6, transparent: true, opacity: 0.95 });
    add(cam, new T.BoxGeometry(0.16, 0.44, 0.006), flexM, 0, -0.4, -0.074);
    add(cam, new T.BoxGeometry(0.17, 0.06, 0.014), sdm(cam, 0x2a2210, 0.6, 0), 0, -0.6, -0.074);
    const fp = []; for (let i = 0; i < 12; i++) fp.push([-0.055 + i * 0.01, -0.6, -0.066, 0]);
    inst(cam, new T.BoxGeometry(0.005, 0.05, 0.002), sdm(cam, 0xd6b15c, 0.3, 1), fp);

    // 07 Siren + strobe LED
    const bea = P('beacon', 'story', [0, 0.2, 0.07], 0.72, 0.08, 2.5);
    add(bea, cylZ(0.24, 0.012, 64), sdm(bea, 0xc9a24c, 0.28, 1, { bumpMap: noiseTex, bumpScale: 0.06 }));
    add(bea, cylZ(0.17, 0.01, 64), sdm(bea, 0xe6e1d4, 0.75, 0), 0, 0, 0.011);
    add(bea, cylZ(0.15, 0.004, 64), sdm(bea, 0xd5d9dc, 0.22, 1, { bumpMap: noiseTex, bumpScale: 0.1 }), 0, 0, 0.018);
    const sb = sdm(bea, 0xe3e6e9, 0.15, 1);
    add(bea, new T.SphereGeometry(0.022, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2).rotateX(Math.PI / 2), sb, 0.08, -0.02, 0.02);
    add(bea, new T.SphereGeometry(0.022, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2).rotateX(Math.PI / 2), sb, -0.2, -0.1, 0.006);
    add(bea, tube([[0.08, -0.02, 0.03], [0.2, -0.12, 0.04], [0.26, -0.26, 0.02], [0.1, -0.33, 0.01]], 0.009), sdm(bea, 0xc23a2a, 0.45, 0));
    add(bea, tube([[-0.2, -0.1, 0.012], [-0.26, -0.2, 0.03], [-0.2, -0.3, 0.02], [-0.1, -0.33, 0.01]], 0.009), sdm(bea, 0x18191b, 0.45, 0));
    add(bea, new T.BoxGeometry(0.36, 0.12, 0.016), pcbMats(bea, pcbSmall), 0, -0.36, 0);
    for (const [x, col, base] of [[-0.09, 0x3dff74, 2.2], [0.07, 0xfff4e0, 1.6]]) {
      add(bea, new T.BoxGeometry(0.07, 0.07, 0.016), sdm(bea, 0xf2f2ee, 0.5, 0), x, -0.36, 0.016);
      add(bea, new T.BoxGeometry(0.03, 0.03, 0.004), ledMat(bea, col, base), x, -0.36, 0.026);
      add(bea, new T.SphereGeometry(0.03, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2).rotateX(Math.PI / 2), glassMat(bea, 0xffffff, { transparent: true, opacity: 0.35 }), x, -0.36, 0.024);
    }
    smd(bea, 4, 13, 0.3, 0.08, 0.008, [[-0.09, -0.36, 0.08, 0.08], [0.07, -0.36, 0.08, 0.08]], 0, -0.36);

    // shell interior: screw bosses + ribs
    const bossM = sdm(back, fin, 0.8, 0.04, { transparent: true }); this._rubber.push(bossM);
    for (const [x, y] of [[-0.58, 1.18], [0.58, 1.18], [-0.58, -0.6], [0.58, -0.6]]) { add(back, new T.TorusGeometry(0.035, 0.022, 10, 24), bossM, x, y, -0.1); add(back, cylZ(0.057, 0.15, 24), bossM, x, y, -0.175); }

    // Absent component: SIM
    const ghost = P('ghost', 'ghost', [1.4, 0.2, 0.0], 0, 0, 1);
    const simM = sdm(ghost, 0xdfe4e8, 0.4, 0.1, { transparent: true, opacity: 0, depthWrite: false });
    g = rbox(0.44, 0.58, 0.02, 0.05, 0.006); add(ghost, g, simM, 0, 0, 0, false); edge(ghost, g);
    add(ghost, new T.BoxGeometry(0.2, 0.16, 0.004), sdm(ghost, 0xd4a64a, 0.3, 1, { transparent: true, opacity: 0, depthWrite: false }), 0, -0.08, 0.012, false);
    const xM = new T.MeshBasicMaterial({ color: 0xff4a3d, transparent: true, opacity: 0, depthWrite: false }); this._xMat = xM;
    g = new T.BoxGeometry(0.66, 0.035, 0.01);
    add(ghost, g, xM, 0, 0, 0.03, false).rotation.z = 0.72; add(ghost, g, xM, 0, 0, 0.03, false).rotation.z = -0.72;
    ghost.meshes.forEach(m => (m.castShadow = false));
    this._ghost = ghost;
    if (this.hasAttribute('rope')) {
      const braid = ctex(T, 256, 64, (gg, w, h) => { gg.fillStyle = '#d4561a'; gg.fillRect(0, 0, w, h); for (let i = -h; i < w + h; i += 16) { gg.strokeStyle = '#f2803a'; gg.lineWidth = 7; gg.beginPath(); gg.moveTo(i, 0); gg.lineTo(i + h, h); gg.stroke(); gg.strokeStyle = '#9c3c0e'; gg.lineWidth = 2; gg.beginPath(); gg.moveTo(i + 9, 0); gg.lineTo(i + 9 + h, h); gg.stroke(); } });
      braid.wrapS = braid.wrapT = T.RepeatWrapping; braid.repeat.set(70, 1);
      const ropeM = new T.MeshStandardMaterial({ map: braid, roughness: 0.85, metalness: 0, bumpMap: braid, bumpScale: 2 });
      const pts = [[0.07, -3.2, 0.44], [0.06, -2.0, 0.46], [0.03, -1.4, 0.46], [0.01, -1.12, 0.44], [0, -1.07, 0.3], [0, -1.05, 0], [0, -1.07, -0.3], [-0.01, -1.12, -0.44], [-0.03, -1.4, -0.46], [-0.06, -2.0, -0.46], [-0.07, -3.2, -0.44]].map(a => new T.Vector3(...a));
      const rope = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 260, 0.055, 16, false), ropeM);
      rope.castShadow = true; rope.receiveShadow = true; device.add(rope);
    }
  }
  _bindPointer() {
    const c = this._canvas, d = this._drag;
    c.addEventListener('pointerdown', e => { d.down = true; d.moved = 0; d.x = e.clientX; d.y = e.clientY; c.setPointerCapture(e.pointerId); c.style.cursor = 'grabbing'; });
    c.addEventListener('pointermove', e => {
      this._hover = { x: e.clientX, y: e.clientY };
      if (!d.down) return;
      const dx = e.clientX - d.x, dy = e.clientY - d.y; d.x = e.clientX; d.y = e.clientY; d.moved += Math.abs(dx) + Math.abs(dy);
      d.tyaw = clamp(d.tyaw + dx * 0.006, -0.78, 0.78); d.tpitch = clamp(d.tpitch + dy * 0.004, -0.3, 0.3);
    });
    const up = e => {
      if (!d.down) return; d.down = false; d.lastUp = performance.now(); c.style.cursor = 'grab';
      if (d.moved < 6) { const id = this._hit(e.clientX, e.clientY); if (id) this.dispatchEvent(new CustomEvent('pick', { detail: { id }, bubbles: true, composed: true })); }
    };
    c.addEventListener('pointerup', up); c.addEventListener('pointercancel', () => { d.down = false; });
    c.addEventListener('pointerleave', () => { this._hover = null; });
  }
  _hit(cx, cy) {
    const r = this._canvas.getBoundingClientRect(); const n = this._tmp.ndc;
    n.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    this._ray.setFromCamera(n, this._camera);
    const hits = this._ray.intersectObjects(this._pickables, false);
    for (const h of hits) {
      const p = this._byId[h.object.userData.partId]; if (!p) continue;
      if (p.story) return p.id;
      if (p.kind === 'shell' && this._c.explode < 0.4) return null;
    }
    return null;
  }
  _resize() {
    const w = Math.max(1, this.clientWidth), h = Math.max(1, this.clientHeight);
    this._w = w; this._h = h; this._mobile = w < 760;
    this._renderer.setSize(w, h, false);
    const cam = this._camera; cam.aspect = w / h;
    if (this._center) cam.clearViewOffset();
    else if (this._mobile) cam.setViewOffset(w, h, 0, h * 0.2, w, h); else cam.setViewOffset(w, h, -w * 0.2, 0, w, h);
    cam.updateProjectionMatrix();
  }
  _start() { if (this._raf || !this._built) return; this._last = performance.now(); const loop = now => { this._raf = requestAnimationFrame(loop); this._frame(now); }; this._raf = requestAnimationFrame(loop); }
  _stop() { if (this._raf) cancelAnimationFrame(this._raf); this._raf = 0; }
  _setK(p, k) {
    if (Math.abs(p.lastK - k) < 0.002) return; p.lastK = k;
    for (const m of p.mats) { m.color.copy(m.userData.base).multiplyScalar(k); m.envMapIntensity = m.userData.env * k; }
  }
  _frame(now) {
    const dt = Math.min(0.05, (now - this._last) / 1000); this._last = now;
    if (((this._vf = (this._vf || 0) + 1) % 15) === 1) { const r = this.getBoundingClientRect(); this._visible = r.width > 2 && r.height > 2 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth; }
    if (!this._visible) return;
    const red = this._reduced; this._time += red ? 0 : dt;
    const T = this.THREE, t = this._t, c = this._c, d = this._drag, tmp = this._tmp;
    const k = red ? 40 : 7;
    c.explode = damp(c.explode, t.explode, k, dt); c.spin = damp(c.spin, t.spin, k, dt);
    if (!d.down && now - d.lastUp > 1800) { d.tyaw = damp(d.tyaw, 0, 0.8, dt); d.tpitch = damp(d.tpitch, 0, 0.8, dt); }
    d.yaw = damp(d.yaw, d.tyaw, 10, dt); d.pitch = damp(d.pitch, d.tpitch, 10, dt);
    const E = c.explode, time = this._time;
    let dim = 0, focused = null;
    for (const p of this._parts) {
      if (!p.story) continue;
      p.f = damp(p.f, p.id === t.focusId ? t.focus : 0, red ? 40 : 6, dt);
      if (p.f > dim) { dim = p.f; focused = p; }
    }
    const root = this._root, device = this._device;
    root.rotation.y = lerp(-0.42, -0.62, E) + c.spin + d.yaw + Math.sin(time * 0.4) * 0.04;
    root.position.y = Math.sin(time * 0.8) * 0.025;
    device.rotation.x = lerp(-0.06, -1.02, E) + d.pitch;
    const fovT = Math.tan(T.MathUtils.degToRad(16));
    const extY = lerp(3.3, 4.7, E), extX = lerp(2.2, 3.7, E);
    const hf = this._center ? (this._fit || 0.6) : this._mobile ? 0.56 : 0.86, wf = this._center ? 0.9 : this._mobile ? 0.92 : 0.5;
    const dist = Math.max(extY / (2 * fovT * hf), extX / (2 * fovT * (this._w / this._h) * wf));
    this._camera.position.set(0, dist * 0.12, dist); this._camera.lookAt(0, 0, 0);
    root.updateMatrixWorld(true);
    device.getWorldQuaternion(tmp.qP); tmp.qPi.copy(tmp.qP).invert();
    tmp.tgt.set(0, -0.05, dist * 0.3); device.worldToLocal(tmp.tgt);
    tmp.arc.set(-0.5, 0.7, 0).applyQuaternion(tmp.qPi);
    tmp.qD.setFromEuler(tmp.eul.set(-0.5, 0, time * 0.35));
    tmp.qT.copy(tmp.qPi).multiply(tmp.qD);
    for (const p of this._parts) {
      if (p.kind === 'ghost') continue;
      const e = sstep(p.delay, p.delay + 0.62, E);
      const g = p.group; g.position.set(p.rest.x, p.rest.y, lerp(p.rest.z, p.exZ, e));
      if (p.story) {
        const f = ease(clamp(p.f, 0, 1));
        if (f > 0.0005) {
          tmp.v.copy(g.position); g.position.lerpVectors(tmp.v, tmp.tgt, f).addScaledVector(tmp.arc, Math.sin(Math.PI * f));
          g.quaternion.slerpQuaternions(tmp.qI, tmp.qT, f); g.scale.setScalar(lerp(1, p.fs, f));
        } else { g.quaternion.identity(); g.scale.setScalar(1); }
        this._setK(p, p === focused ? 1 : 1 - 0.76 * dim);
      } else {
        const st = sstep(0.12, 0.7, E), op = lerp(1, 0.1, st);
        this._setK(p, 1 - 0.6 * dim);
        for (const m of p.mats) { m.opacity = op; m.depthWrite = op > 0.96; }
        for (const m of p.edges) m.opacity = 0.5 * st * (1 - 0.6 * dim);
        const sh = op > 0.5; if (sh !== p.shadow) { p.shadow = sh; p.meshes.forEach(o => (o.castShadow = sh)); }
      }
    }
    const go = (this._ghostOn ? 1 : 0) * sstep(0.75, 1, E) * (1 - dim);
    for (const m of this._ghost.mats) m.opacity = 0.32 * go;
    for (const m of this._ghost.edges) m.opacity = 0.7 * go;
    this._xMat.opacity = 0.95 * go; this._ghost.group.visible = go > 0.002;
    const pulse = red ? 1 : 0.7 + 0.3 * Math.sin(time * 2.6);
    for (const l of this._leds) l.m.emissiveIntensity = l.base * Math.max(0.15, l.p.lastK) * pulse;
    if (this._glow) this._glow.s.material.opacity = 0.6 * pulse * this._glow.shell.opacity * Math.max(0.15, this._glow.p.lastK);
    if (this._hover && !d.down && (this._hoverT = (this._hoverT || 0) + 1) % 4 === 0) this._canvas.style.cursor = this._hit(this._hover.x, this._hover.y) ? 'pointer' : 'grab';
    this._renderer.render(this._scene, this._camera);
  }
}
customElements.define('trailmate-3d', TrailmateViewer);
})();
