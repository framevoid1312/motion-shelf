// A Year on the Island — Memphis-diorama motion piece. Pure function of time: window.seek(t) paints frame t.
import * as THREE from 'three';

THREE.ColorManagement.enabled = false;
const params = new URLSearchParams(location.search);
const SS = Number(params.get('ss') || 1.5);          // supersampling of the 3-D window
const DURATION = 30;
const W = 1920, H = 1080;
const FW = 1520, FH = 744, FX = (W - FW) / 2, FY = 78;  // the diorama window, slightly above centre
const RW = Math.round(FW * SS), RH = Math.round(FH * SS);
const TAU = Math.PI * 2;

// ------------------------------------------------------------------ seeded helpers
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const inOutSine = (x) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(x));
const outCubic = (x) => 1 - (1 - clamp(x)) ** 3;
const inBack = (x, s = 1.7) => x * x * ((s + 1) * x - s);
const angDiff = (a, b) => { let d = a - b; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; return d; };

// ------------------------------------------------------------------ the year
// states: 0 spring, 1 summer, 2 autumn, 3 winter, 4 night, then spring again (palette 0)
const TW = [5, 10, 15, 20, 25];                // wave start times (downbeats, 96 BPM)
const STATE_PAL = [0, 1, 2, 3, 4, 0];
const V0 = 5.5, ACC = 1.2;                      // wave front: r = V0 τ + ACC τ²
const rOf = (tau) => (tau <= 0 ? 0 : V0 * tau + ACC * tau * tau);
const tauOf = (d) => (-V0 + Math.sqrt(V0 * V0 + 4 * ACC * d)) / (2 * ACC);

function waveAt(t) {
  let k = -1;
  for (let i = 0; i < TW.length; i++) if (t >= TW[i]) k = i;
  if (k < 0) return { k, prev: 0, next: 0, r: 0, tau: -1 };
  const tau = t - TW[k];
  return { k, prev: STATE_PAL[k], next: STATE_PAL[k + 1], r: rOf(tau), tau };
}
// value of a per-palette array at an object at distance d from the lighthouse, with the squash/spring
function objState(arr, t, d) {
  let k = -1;
  for (let i = 0; i < TW.length; i++) if (t >= TW[i] + tauOf(d)) k = i;
  if (k < 0) return { from: arr[0], to: arr[0], s: 99 };
  return { from: arr[STATE_PAL[k]], to: arr[STATE_PAL[k + 1]], s: t - (TW[k] + tauOf(d)) };
}
// [sxz, sy] — every change is announced with a squash, then a spring back
function popScale({ from, to, s }) {
  if (s >= 99) return [from, from];
  if (from === 0 && to === 0) return [0, 0];
  if (to === 0) {                                  // squash down and away
    const p = clamp(s / 0.3), e = clamp(inBack(p, 1.4), -0.3, 1);
    const v = Math.max(0, from * (1 - e));
    return [v * (1 + 0.35 * p), v * (1 - 0.25 * p)];
  }
  const k = 1 - Math.exp(-7 * s) * Math.cos(13 * s);
  const v = from + (to - from) * k;
  if (from === 0) { const sq = 0.28 * Math.exp(-6 * s) * Math.sin(13 * s); return [Math.max(0, v * (1 - sq * 0.5)), Math.max(0, v * (1 + sq))]; }
  const pulse = -0.17 * Math.exp(-6 * s) * Math.cos(13 * s);
  return [v * (1 - pulse * 0.6), v * (1 + pulse)];
}

// ------------------------------------------------------------------ palette
const PAPER = '#FFFCF6', INK = '#25214A', LAMP = '#FFD36E';
const S5 = (a, b, c, d, e) => [a, b, c, d, e];
const PAL = {
  grass:  S5('#9AE6A4', '#4FD686', '#F2C46D', '#F3F4FF', '#8A82D8'),
  sand:   S5('#FFE6A8', '#FFDF86', '#F7D79C', '#E4E7F8', '#6E66BE'),
  crownA: S5('#FF7EB3', '#1E9E5A', '#FF5A5F', '#F4F2FF', '#A49BE8'),
  crownB: S5('#FFB3D1', '#34C774', '#FF9C6B', '#E1E4FA', '#9189DC'),
  pine:   S5('#2FA36E', '#1E9460', '#2C9A68', '#E6EEFF', '#7E76CF'),
  roofA:  S5('#FF5A5F', '#FF5A5F', '#FF5A5F', '#FBFAFF', '#C2B8F2'),
  roofB:  S5('#2F5BFF', '#2F5BFF', '#2F5BFF', '#FBFAFF', '#C2B8F2'),
  water:  S5('#5CC8FF', '#2FB4FF', '#57B5DE', '#AEDFF2', '#3F3CA0'),
  waterS: S5('#3EA6E6', '#1C92DE', '#3A96C2', '#86C0DD', '#2C2A7E'),
  field:  S5('#B9EE8A', '#FFD234', '#FF9C6B', '#F7F7FF', '#9088D8'),
  table:  S5('#FFF4E2', '#FFF4E2', '#FFF4E2', '#FFF4E2', '#2B2468'),
  lantern: S5('#FFD234', '#FFD234', '#FFD234', '#FFD234', '#FFE08A'),
};

// ------------------------------------------------------------------ shaders
const G = {
  uPrev: { value: 0 }, uNext: { value: 0 }, uWO: { value: new THREE.Vector2() }, uWR: { value: 0 },
  uBand: { value: 0 }, uSun: { value: new THREE.Vector3(-0.42, 0.78, 0.46).normalize() },
  uShadow: { value: null }, uSunVP: { value: new THREE.Matrix4() }, uTime: { value: 0 }, uWaveAmp: { value: 0 },
};

const VERT = /* glsl */`
uniform float uVar; uniform int uMode; uniform float uTime; uniform vec2 uWO; uniform float uWR; uniform float uWaveAmp;
#ifdef INST
in float aVar;
#endif
out vec3 vW; out vec3 vN; out vec3 vVN; out float vVar;
void main(){
  vec4 lp = vec4(position, 1.0); vec3 n = normal;
#ifdef USE_INSTANCING
  lp = instanceMatrix * lp; n = mat3(instanceMatrix) * n;
#endif
  vec4 wp = modelMatrix * lp;
  if (uMode == 1) {
    float d = distance(wp.xz, uWO);
    float b = exp(-pow((d - uWR) / 0.5, 2.0));
    wp.y += 0.20 * b * uWaveAmp + 0.035 * sin(wp.x * 1.7 + uTime * 1.6) * cos(wp.z * 1.3 + uTime * 1.1);
  }
  vW = wp.xyz; vN = normalize(mat3(modelMatrix) * n);
  vVN = normalize(mat3(viewMatrix) * vN);
#ifdef INST
  vVar = aVar;
#else
  vVar = uVar;
#endif
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const FRAG = /* glsl */`
precision highp float;
layout(location = 0) out vec4 oColor;
layout(location = 1) out vec4 gNrm;
uniform vec3 uPal[5]; uniform vec3 uPal2[5]; uniform int uPrev; uniform int uNext;
uniform vec2 uWO; uniform float uWR; uniform float uBand; uniform int uSeasonal; uniform int uMode;
uniform vec3 uSun; uniform sampler2D uShadow; uniform mat4 uSunVP; uniform float uTime; uniform float uFlash;
in vec3 vW; in vec3 vN; in vec3 vVN; in float vVar;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main(){
  float d = distance(vW.xz, uWO);
  float m = 1.0 - smoothstep(uWR - 0.3, uWR, d);
  float vv = vVar;
  if (uMode == 3) { float yb = fract((vW.y - 1.15) * 1.55); vv = step(0.5, yb); }
  vec3 cA = mix(uPal[uPrev], uPal2[uPrev], vv);
  vec3 cB = mix(uPal[uNext], uPal2[uNext], vv);
  vec3 base = mix(cA, cB, m);
  float night = mix(uPrev == 4 ? 1.0 : 0.0, uNext == 4 ? 1.0 : 0.0, m);
  if (uSeasonal == 0) base = mix(base, base * vec3(0.40, 0.38, 0.74) + vec3(0.05, 0.04, 0.15), night);
  vec3 lamp = vec3(1.0, 0.827, 0.431);

  if (uMode == 1) {             // water: drifting squiggle lines, anchored to the world
    float wv = vW.z * 1.25 + 0.32 * sin(vW.x * 1.05 + uTime * 0.9) + 0.12 * sin(vW.x * 2.6 - uTime * 1.3);
    float ln = abs(fract(wv) - 0.5); float aa = fwidth(wv) * 1.2;
    float line = 1.0 - smoothstep(0.045, 0.045 + aa, ln);
    line *= smoothstep(8.2, 7.2, length(vW.xz));
    base = mix(base, mix(base, vec3(1.0), 0.42 - 0.2 * night), line);
  }
  if (uMode == 4) {             // field rows
    float rw = vW.x * 0.94 + vW.z * 0.34; float ln = abs(fract(rw * 3.2) - 0.5);
    base *= mix(1.0, 0.84, 1.0 - smoothstep(0.16, 0.16 + fwidth(rw * 3.2) * 1.5, ln));
  }
  if (uMode == 7) {             // strata on cut earth
    float ln = abs(fract(vW.y * 5.0) - 0.5);
    base *= mix(1.0, 0.9, 1.0 - smoothstep(0.08, 0.08 + fwidth(vW.y * 5.0) * 1.5, ln));
  }

  vec3 N = normalize(vN); if (!gl_FrontFacing) N = -N;
  vec3 col;
  if (uMode == 5) {            // window: day glass -> warm lamp at night
    col = mix(vec3(0.80, 0.93, 1.0), lamp, night);
  } else if (uMode == 6) {     // lantern: unlit
    col = mix(base, vec3(1.0, 0.97, 0.80), uFlash);
  } else {
    float ndl = dot(N, uSun);
    vec4 sc = uSunVP * vec4(vW, 1.0); vec3 s = sc.xyz / sc.w * 0.5 + 0.5;
    float lit = 1.0;
    if (s.x > 0.0 && s.x < 1.0 && s.y > 0.0 && s.y < 1.0 && s.z < 1.0) {
      float dz = texture(uShadow, s.xy).r;
      lit = (s.z - 0.0009 > dz) ? 0.0 : 1.0;
    }
    vec3 t1 = base * vec3(0.91, 0.88, 0.97), t2 = base * vec3(0.76, 0.71, 0.91);
    col = ndl > 0.62 ? base : (ndl > 0.08 ? t1 : t2);
    if (lit < 0.5 && ndl > 0.08) {
      vec2 huv = abs(N.y) > 0.6 ? vW.xz : (abs(N.x) > abs(N.z) ? vW.zy : vW.xy);
      huv *= 7.0; huv = mat2(0.7071, -0.7071, 0.7071, 0.7071) * huv;
      float dd = length(fract(huv) - 0.5); float aa = fwidth(dd);
      float dotm = 1.0 - smoothstep(0.30 - aa, 0.30 + aa, dd);
      vec3 sh = base * vec3(0.84, 0.80, 0.96);
      vec3 dc = base * vec3(0.56, 0.50, 0.84);
      col = mix(sh, dc, dotm);
    }
  }
  if (uMode == 2) {            // table: stars come out at night
    vec2 g = vW.xz * 0.85; vec2 id = floor(g); float h = hash(id);
    vec2 o = vec2(hash(id + 7.1), hash(id + 3.3)) * 0.6 + 0.2;
    vec2 q = fract(g) - o; float sd = min(abs(q.x) * 4.0 + abs(q.y), abs(q.y) * 4.0 + abs(q.x));
    float tw = 0.6 + 0.4 * sin(uTime * 2.0 + h * 40.0);
    float star = step(0.74, h) * (1.0 - smoothstep(0.06, 0.06 + fwidth(sd) * 1.5, sd)) * tw;
    col = mix(col, lamp, star * night);
  }
  float band = exp(-pow((d - uWR) / 0.24, 2.0)) * uBand;
  col = mix(col, vec3(1.0, 0.985, 0.94), band * 0.75);
  oColor = vec4(col, 1.0);
  gNrm = vec4(normalize(vVN) * 0.5 + 0.5, 1.0);
}`;

const toCols = (arr) => arr.map((h) => new THREE.Color(h));
const five = (x) => (Array.isArray(x) ? x : [x, x, x, x, x]);
function mat({ pal, pal2, seasonal = false, mode = 0, inst = false, side = THREE.FrontSide, vVar = 0 }) {
  const P = five(pal), P2 = five(pal2 || pal);
  return new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3, vertexShader: VERT, fragmentShader: FRAG, side,
    defines: inst ? { INST: 1 } : {},
    uniforms: { ...G, uPal: { value: toCols(P) }, uPal2: { value: toCols(P2) }, uSeasonal: { value: seasonal ? 1 : 0 },
      uMode: { value: mode }, uVar: { value: vVar }, uFlash: { value: 0 } },
  });
}

// ------------------------------------------------------------------ renderer & targets
const glCanvas = document.createElement('canvas');
glCanvas.width = FW; glCanvas.height = FH;
const R = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: false, preserveDrawingBuffer: true, alpha: false });
R.setPixelRatio(1); R.setSize(FW, FH, false);
R.outputColorSpace = THREE.LinearSRGBColorSpace;
R.toneMapping = THREE.NoToneMapping;

const mainRT = new THREE.WebGLRenderTarget(RW, RH, { count: 2, depthTexture: new THREE.DepthTexture(RW, RH), minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
const compRT = new THREE.WebGLRenderTarget(RW, RH, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false });
const SH = 2048;
const shadowRT = new THREE.WebGLRenderTarget(SH, SH, { depthTexture: new THREE.DepthTexture(SH, SH) });
G.uShadow.value = shadowRT.depthTexture;

const scene = new THREE.Scene();
const overlay = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(29, FW / FH, 2, 140);
const sunCam = new THREE.OrthographicCamera(-14, 14, 14, -14, 1, 70);
sunCam.position.copy(G.uSun.value).multiplyScalar(32);
sunCam.lookAt(0, 0, 0); sunCam.updateMatrixWorld(); sunCam.updateProjectionMatrix();
G.uSunVP.value.multiplyMatrices(sunCam.projectionMatrix, sunCam.matrixWorldInverse);
const depthMat = new THREE.MeshDepthMaterial();

// full-screen passes
const quadGeo = new THREE.PlaneGeometry(2, 2);
const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const edgeMat = new THREE.ShaderMaterial({
  glslVersion: THREE.GLSL3, depthTest: false, depthWrite: false,
  uniforms: { tCol: { value: mainRT.textures[0] }, tNrm: { value: mainRT.textures[1] }, tDep: { value: mainRT.depthTexture },
    uRes: { value: new THREE.Vector2(RW, RH) }, uPx: { value: SS }, uNear: { value: camera.near }, uFar: { value: camera.far } },
  vertexShader: `void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }`,
  fragmentShader: /* glsl */`
precision highp float; out vec4 oColor;
uniform sampler2D tCol, tNrm, tDep; uniform vec2 uRes; uniform float uPx, uNear, uFar;
float lin(float z){ return 2.0 * uNear * uFar / (uFar + uNear - (z * 2.0 - 1.0) * (uFar - uNear)); }
float iw(vec2 uv){ return 1.0 / lin(texture(tDep, uv).r); }
vec3 nr(vec2 uv){ return texture(tNrm, uv).xyz * 2.0 - 1.0; }
float edgeAt(vec2 uv, vec2 px){
  float c = iw(uv), l = iw(uv - vec2(px.x, 0.)), r = iw(uv + vec2(px.x, 0.)), u = iw(uv + vec2(0., px.y)), d = iw(uv - vec2(0., px.y));
  float dd = (abs(l + r - 2.0 * c) + abs(u + d - 2.0 * c)) / c;
  vec3 nc = nr(uv);
  float nd = 1.0 - min(min(dot(nc, nr(uv - vec2(px.x, 0.))), dot(nc, nr(uv + vec2(px.x, 0.)))), min(dot(nc, nr(uv + vec2(0., px.y))), dot(nc, nr(uv - vec2(0., px.y)))));
  float dist = 1.0 / c;
  float e = max(smoothstep(0.035, 0.07, dd), smoothstep(0.22, 0.4, nd));
  return e * (1.0 - smoothstep(34.0, 52.0, dist));
}
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec3 col = texture(tCol, uv).rgb;
  vec2 px = uPx / uRes;
  float e = edgeAt(uv, px);
  oColor = vec4(mix(col, vec3(0.145, 0.129, 0.29), e), 1.0);
}`,
});
const downMat = new THREE.ShaderMaterial({
  glslVersion: THREE.GLSL3, depthTest: false, depthWrite: false,
  uniforms: { tSrc: { value: compRT.texture }, uRes: { value: new THREE.Vector2(FW, FH) }, uSrc: { value: new THREE.Vector2(RW, RH) } },
  vertexShader: `void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }`,
  fragmentShader: /* glsl */`
precision highp float; out vec4 oColor; uniform sampler2D tSrc; uniform vec2 uRes, uSrc;
void main(){
  vec2 uv = gl_FragCoord.xy / uRes; vec2 o = 0.5 / uSrc * ${(SS * 0.75).toFixed(3)};
  vec3 c = texture(tSrc, uv + vec2(-o.x, -o.y)).rgb + texture(tSrc, uv + vec2(o.x, -o.y)).rgb
         + texture(tSrc, uv + vec2(-o.x, o.y)).rgb + texture(tSrc, uv + vec2(o.x, o.y)).rgb;
  oColor = vec4(c * 0.25, 1.0);
}`,
});
const quadScene = new THREE.Scene();
const quad = new THREE.Mesh(quadGeo, edgeMat); quad.frustumCulled = false; quadScene.add(quad);

// ------------------------------------------------------------------ island geometry
const LTH = -0.62;
function Rf(th) {
  return 5.0 + 0.42 * Math.sin(2 * th + 1.3) + 0.28 * Math.sin(3 * th + 0.4) + 0.16 * Math.sin(5 * th + 2.0)
    + 0.85 * Math.exp(-((angDiff(th, LTH) / 0.42) ** 2));
}
const L = new THREE.Vector3(4.25 * Math.cos(LTH), 1.15, 4.25 * Math.sin(LTH));   // lighthouse base
G.uWO.value.set(L.x, L.z);
const distL = (x, z) => Math.hypot(x - L.x, z - L.z);

function tier(rfun, cx, cz, y0, y1, mats, bevel = 0.06, n = 220) {
  const sh = new THREE.Shape();
  for (let i = 0; i < n; i++) {
    const th = (i / n) * TAU, r = rfun(th);
    const x = cx + r * Math.cos(th), z = cz + r * Math.sin(th);
    i ? sh.lineTo(x, -z) : sh.moveTo(x, -z);
  }
  const g = new THREE.ExtrudeGeometry(sh, { depth: y1 - y0 - 2 * bevel, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2 });
  g.rotateX(-Math.PI / 2); g.translate(0, y0 + bevel, 0);
  const m = new THREE.Mesh(g, mats); scene.add(m); return m;
}

const M = {
  grass: mat({ pal: PAL.grass, seasonal: true }),
  sand: mat({ pal: PAL.sand, seasonal: true }),
  earth: mat({ pal: '#F2A877', mode: 7 }),
  sandSide: mat({ pal: '#F6C98C', mode: 7 }),
  water: mat({ pal: PAL.water, seasonal: true, mode: 1 }),
  waterS: mat({ pal: PAL.waterS, seasonal: true, mode: 7 }),
  table: mat({ pal: PAL.table, seasonal: true, mode: 2 }),
  field: mat({ pal: PAL.field, seasonal: true, mode: 4 }),
  path: mat({ pal: PAL.sand, seasonal: true }),
};

// table + sea slab
{
  const t = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), M.table); t.rotation.x = -Math.PI / 2; t.position.y = -0.9; scene.add(t);
  const side = new THREE.Mesh(new THREE.CylinderGeometry(7.9, 7.9, 0.9, 160, 1, true), M.waterS); side.position.y = -0.45; scene.add(side);
  // polar grid water surface so the wave front can lift it
  const RS = 70, AS = 220, pos = [], idx = [];
  for (let i = 0; i <= RS; i++) for (let j = 0; j < AS; j++) {
    const r = 7.9 * (i / RS) ** 0.8, a = (j / AS) * TAU; pos.push(r * Math.cos(a), 0, r * Math.sin(a));
  }
  for (let i = 0; i < RS; i++) for (let j = 0; j < AS; j++) {
    const a = i * AS + j, b = i * AS + ((j + 1) % AS), c = (i + 1) * AS + j, d = (i + 1) * AS + ((j + 1) % AS);
    idx.push(a, b, c, b, d, c);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
  g.setAttribute('normal', new THREE.Float32BufferAttribute(pos.map((_, k) => (k % 3 === 1 ? 1 : 0)), 3));
  scene.add(new THREE.Mesh(g, M.water));
}
// tiers
tier(Rf, 0, 0, -0.5, 0.25, [M.sand, M.sandSide]);
tier((th) => Rf(th) * 0.86, 0, 0, 0.0, 0.55, [M.grass, M.earth]);
tier((th) => 1.12 + 0.08 * Math.sin(3 * th + 1) + 0.05 * Math.sin(5 * th), L.x, L.z, 0.2, 1.15, [M.grass, M.earth]);

// ------------------------------------------------------------------ props
const objs = [];   // {node, base:{x,y,z}, d, pres:[5], kind, rotY}
function addObj(node, x, y, z, pres, kind = 'prop', extra = {}) {
  node.position.set(x, y, z); scene.add(node);
  const o = { node, x, y, z, d: distL(x, z), pres, kind, ...extra }; objs.push(o); return o;
}
const box = (w, h, d) => { const g = new THREE.BoxGeometry(w, h, d); g.translate(0, h / 2, 0); return g; };
const cyl = (rt, rb, h, seg = 24) => { const g = new THREE.CylinderGeometry(rt, rb, h, seg); g.translate(0, h / 2, 0); return g; };
const sph = (r, sx = 1, sy = 1, sz = 1) => { const g = new THREE.SphereGeometry(r, 24, 16); g.scale(sx, sy, sz); g.translate(0, r * sy, 0); return g; };
const mesh = (g, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); return o; };
const PLAIN = {};
const plain = (hex) => (PLAIN[hex] ||= mat({ pal: hex }));
const ALL = [1, 1, 1, 1, 1];

// lighthouse (one group so it squashes as a unit from its base)
const lighthouse = new THREE.Group();
const lantern = mat({ pal: PAL.lantern, seasonal: true, mode: 6 });
{
  const tower = mesh(cyl(0.32, 0.5, 2.2, 32), mat({ pal: '#FF5A5F', pal2: PAPER, mode: 3 }));
  lighthouse.add(tower);
  lighthouse.add(mesh(cyl(0.6, 0.6, 0.1, 32), plain('#2F5BFF'), 0, 2.2, 0));
  lighthouse.add(mesh(cyl(0.3, 0.3, 0.45, 24), lantern, 0, 2.3, 0));
  const cap = new THREE.ConeGeometry(0.42, 0.42, 32); cap.translate(0, 0.21, 0);
  lighthouse.add(mesh(cap, plain('#2F5BFF'), 0, 2.75, 0));
  lighthouse.add(mesh(sph(0.07), plain('#FFD234'), 0, 3.14, 0));
  const hut = mesh(box(0.75, 0.42, 0.55), plain(PAPER), -0.55, 0, 0.35); hut.rotation.y = 0.3; lighthouse.add(hut);
  const hutRoof = mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.86, 3).rotateZ(Math.PI / 2).rotateX(-Math.PI / 2).scale(1, 0.62, 0.78).translate(0, 0.54, 0), mat({ pal: PAL.roofA, seasonal: true }), -0.55, 0, 0.35);
  hutRoof.rotation.y = 0.3; lighthouse.add(hutRoof);
  lighthouse.position.copy(L); scene.add(lighthouse);
}
const LANTERN_Y = L.y + 2.52;

// houses
const VILLAGE = new THREE.Vector2(2.55 * Math.cos(2.35), 2.55 * Math.sin(2.35));
const WALLS = ['#FF9C6B', '#B9A0FF', '#FFD234', '#5EDFB0', '#5CC8FF'];
const roofMats = [mat({ pal: PAL.roofA, seasonal: true }), mat({ pal: PAL.roofB, seasonal: true })];
const winMat = mat({ pal: '#ffffff', mode: 5 });
const chimneys = [];
[[-0.55, -0.55, 0.4], [0.55, -0.62, -0.2], [0.0, 0.42, 0.15], [-1.05, 0.45, -0.35], [1.0, 0.38, 0.5]].forEach(([dx, dz, ry], i) => {
  const g = new THREE.Group();
  const w = 0.72 + (i % 2) * 0.12, d = 0.6, h = 0.5 + (i % 3) * 0.12;
  g.add(mesh(box(w, h, d), plain(WALLS[i])));
  const roof = new THREE.CylinderGeometry(0.5, 0.5, w + 0.14, 3); roof.rotateZ(Math.PI / 2); roof.rotateX(-Math.PI / 2);
  roof.scale(1, 0.75, (d + 0.12) / 0.86); roof.translate(0, h + 0.18, 0);
  g.add(mesh(roof, roofMats[i % 2]));
  const ch = mesh(box(0.12, 0.3, 0.12), plain('#FF7EB3'), w * 0.25, h + 0.1, -0.08); g.add(ch);
  // windows + door (thin boxes proud of the wall)
  const wg = box(0.14, 0.14, 0.03);
  for (const sx of [-0.2, 0.2]) g.add(mesh(wg, winMat, sx * w / 0.72, h * 0.45, d / 2));
  g.add(mesh(box(0.13, 0.22, 0.03), plain('#2F5BFF'), 0, 0, d / 2 + 0.001).translateX(w * 0.32));
  g.add(mesh(new THREE.BoxGeometry(0.03, 0.14, 0.14).translate(0, 0.07, 0), winMat, w / 2, h * 0.45, 0));
  g.rotation.y = ry;
  const x = VILLAGE.x + dx, z = VILLAGE.y + dz;
  addObj(g, x, 0.55, z, ALL, 'house');
  const cw = new THREE.Vector3(w * 0.25, h + 0.42, -0.08).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry);
  chimneys.push([x + cw.x, 0.55 + cw.y, z + cw.z]);
});

// field
const FIELD = new THREE.Vector2(2.45 * Math.cos(-2.25), 2.45 * Math.sin(-2.25));
{
  const f = mesh(box(2.0, 0.07, 1.3), M.field, FIELD.x, 0.55, FIELD.y); f.rotation.y = 0.45; scene.add(f);
}
// windmill
const MILL = new THREE.Vector2(2.75 * Math.cos(0.95), 2.75 * Math.sin(0.95));
const millBlades = new THREE.Group();
{
  const g = new THREE.Group();
  g.add(mesh(cyl(0.2, 0.32, 1.1, 24), plain('#B9A0FF')));
  const c = new THREE.ConeGeometry(0.27, 0.32, 24); c.translate(0, 1.26, 0); g.add(mesh(c, plain('#FF5A5F')));
  for (let i = 0; i < 4; i++) { const b = mesh(new THREE.BoxGeometry(0.1, 0.62, 0.025).translate(0, 0.35, 0), plain('#FFD234')); b.rotation.z = (i * Math.PI) / 2; millBlades.add(b); }
  millBlades.add(mesh(new THREE.SphereGeometry(0.06, 12, 8), plain(INK === '' ? '#000' : '#2F5BFF')));
  millBlades.position.set(0, 1.0, 0.3); g.add(millBlades);
  g.rotation.y = Math.atan2(MILL.x, MILL.y);   // blades face outward-ish
  addObj(g, MILL.x, 0.55, MILL.y, ALL, 'mill');
}
// pier
const PIER_TH = 1.9;
{
  const r0 = Rf(PIER_TH) * 0.93, r1 = Rf(PIER_TH) + 1.9, len = r1 - r0;
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(len, 0.07, 0.48).translate(len / 2, 0, 0), plain('#F2B27A'), 0, 0.2, 0));
  for (let i = 0; i < 4; i++) for (const s of [-1, 1]) g.add(mesh(cyl(0.04, 0.04, 0.6, 10), plain('#C9875A'), 0.4 + i * (len - 0.5) / 3, -0.4, s * 0.2));
  g.position.set(r0 * Math.cos(PIER_TH), 0, r0 * Math.sin(PIER_TH)); g.rotation.y = -PIER_TH; scene.add(g);
}
const PIER_END = new THREE.Vector3((Rf(PIER_TH) + 1.9) * Math.cos(PIER_TH), 0, (Rf(PIER_TH) + 1.9) * Math.sin(PIER_TH));

// path loop (walkers follow it)
const pathCurve = new THREE.CatmullRomCurve3([
  [-1.0, 1.05], [0.4, 1.75], [1.55, 1.25], [2.35, 0.15], [2.2, -1.15], [0.85, -1.25], [-0.3, -0.75], [-1.0, -0.1],
].map(([x, z]) => new THREE.Vector3(x, 0.556, z)), true, 'centripetal');
{
  const N = 260, pos = [], idx = [], w = 0.12;
  for (let i = 0; i <= N; i++) {
    const p = pathCurve.getPointAt((i % N) / N), tg = pathCurve.getTangentAt((i % N) / N);
    const nx = -tg.z, nz = tg.x;
    pos.push(p.x + nx * w, 0.557, p.z + nz * w, p.x - nx * w, 0.557, p.z - nz * w);
    if (i < N) idx.push(2 * i, 2 * i + 2, 2 * i + 1, 2 * i + 1, 2 * i + 2, 2 * i + 3);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
  g.setAttribute('normal', new THREE.Float32BufferAttribute(pos.map((_, k) => (k % 3 === 1 ? 1 : 0)), 3));
  const m = new THREE.Mesh(g, M.path); m.material = mat({ pal: PAL.sand, seasonal: true, side: THREE.DoubleSide }); scene.add(m);
}
const pathSamples = Array.from({ length: 120 }, (_, i) => pathCurve.getPointAt(i / 120));
const nearPath = (x, z, r) => pathSamples.some((p) => Math.hypot(p.x - x, p.z - z) < r);

// trees — instanced
const rnd = mulberry32(7);
const trees = [], pines = [];
{
  const tries = 3000; const taken = [];
  const ok = (x, z, minD) => {
    const th = Math.atan2(z, x), r = Math.hypot(x, z);
    if (r > Rf(th) * 0.86 - 0.35) return false;
    if (distL(x, z) < 1.55) return false;
    if (Math.hypot(x - VILLAGE.x, z - VILLAGE.y) < 1.75) return false;
    if (Math.hypot(x - FIELD.x, z - FIELD.y) < 1.45) return false;
    if (Math.hypot(x - MILL.x, z - MILL.y) < 0.7) return false;
    if (nearPath(x, z, 0.32)) return false;
    return taken.every(([a, b]) => Math.hypot(a - x, b - z) > minD);
  };
  for (let i = 0; i < tries && trees.length + pines.length < 27; i++) {
    const th = rnd() * TAU, r = Math.sqrt(rnd()) * 4.6, x = r * Math.cos(th), z = r * Math.sin(th);
    if (!ok(x, z, 0.8)) continue;
    taken.push([x, z]);
    const t = { x, z, d: distL(x, z), s: 0.85 + rnd() * 0.35, var: rnd() < 0.5 ? 0 : 1, ph: rnd() * TAU };
    (rnd() < 0.3 ? pines : trees).push(t);
  }
}
function instanced(geo, material, n, vars) {
  const im = new THREE.InstancedMesh(geo, material, n);
  if (vars) geo.setAttribute('aVar', new THREE.InstancedBufferAttribute(new Float32Array(vars), 1));
  im.frustumCulled = false; scene.add(im); return im;
}
const crownGeo = sph(0.37, 1, 1.05, 1);
const trunkIM = instanced(cyl(0.06, 0.09, 0.5, 10), plain('#C9875A'), trees.length + pines.length);
const crownIM = instanced(crownGeo, mat({ pal: PAL.crownA, pal2: PAL.crownB, seasonal: true, inst: true }), trees.length, trees.map((t) => t.var));
const pineGeo = (() => {
  const a = new THREE.ConeGeometry(0.42, 0.7, 24); a.translate(0, 0.65, 0);
  const b = new THREE.ConeGeometry(0.32, 0.6, 24); b.translate(0, 1.0, 0);
  const pos = [...a.toNonIndexed().attributes.position.array, ...b.toNonIndexed().attributes.position.array];
  const nor = [...a.toNonIndexed().attributes.normal.array, ...b.toNonIndexed().attributes.normal.array];
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); return g;
})();
const pineIM = instanced(pineGeo, mat({ pal: PAL.pine, seasonal: true, inst: true }), pines.length, pines.map(() => 0));

// seasonal props — instanced, scaled by the wave
const placeOnGrass = (n, seed, test) => {
  const r = mulberry32(seed), out = [];
  for (let i = 0; i < 4000 && out.length < n; i++) {
    const th = r() * TAU, rr = Math.sqrt(r()) * 4.4, x = rr * Math.cos(th), z = rr * Math.sin(th);
    if (rr > Rf(th) * 0.86 - 0.15 || distL(x, z) < 1.3) continue;
    if (Math.hypot(x - VILLAGE.x, z - VILLAGE.y) < 1.5 || Math.hypot(x - FIELD.x, z - FIELD.y) < 1.25) continue;
    if ([...trees, ...pines].some((t) => Math.hypot(t.x - x, t.z - z) < 0.35)) continue;
    if (test && !test(x, z)) continue;
    out.push({ x, z, d: distL(x, z), var: r() < 0.5 ? 0 : 1, s: 0.8 + r() * 0.4, ph: r() * TAU });
  }
  return out;
};
const flowers = placeOnGrass(80, 11, (x, z) => !nearPath(x, z, 0.15));
const flowerIM = instanced(sph(0.07), mat({ pal: '#FF7EB3', pal2: '#FFD234', inst: true }), flowers.length, flowers.map((f) => f.var));
const umbrellas = [0.05, 0.35, 0.62, 2.95, 3.25].map((th, i) => ({ th, x: Rf(th) * 0.93 * Math.cos(th), z: Rf(th) * 0.93 * Math.sin(th), var: i % 2 }));
umbrellas.forEach((u) => (u.d = distL(u.x, u.z)));
const umbGeo = (() => { const c = new THREE.ConeGeometry(0.34, 0.16, 16); c.translate(0, 0.62, 0); return c; })();
const umbIM = instanced(umbGeo, mat({ pal: '#FF7EB3', pal2: '#FFD234', inst: true }), umbrellas.length, umbrellas.map((u) => u.var));
const poleIM = instanced(cyl(0.018, 0.018, 0.6, 6), plain(PAPER), umbrellas.length);
const pumpkins = Array.from({ length: 7 }, (_, i) => {
  const a = (i / 7) * TAU + 0.3, x = FIELD.x + Math.cos(a) * 1.25, z = FIELD.y + Math.sin(a) * 0.95;
  return { x, z, d: distL(x, z), s: 0.8 + ((i * 37) % 10) / 25 };
}).filter((p) => Math.hypot(p.x, p.z) < Rf(Math.atan2(p.z, p.x)) * 0.86 - 0.12);
const pumpIM = instanced(sph(0.12, 1.25, 0.85, 1.25), plain('#FF8A3D'), pumpkins.length);
const bales = [[-0.5, -0.2], [0.35, 0.25], [0.55, -0.3]].map(([a, b]) => {
  const c = Math.cos(-0.45), s = Math.sin(-0.45);
  const x = FIELD.x + a * c - b * s, z = FIELD.y + a * s + b * c; return { x, z, d: distL(x, z) };
});
const baleGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.26, 20); baleGeo.rotateZ(Math.PI / 2); baleGeo.translate(0, 0.17, 0);
const baleIM = instanced(baleGeo, plain('#FFD234'), bales.length);
const snowmen = [[VILLAGE.x + 1.1, VILLAGE.y - 1.1], [0.2, -0.2], [FIELD.x + 1.35, FIELD.y + 0.35]].map(([x, z]) => ({ x, z, d: distL(x, z) }));
const snowGeo = (() => {
  const a = sph(0.17), b = sph(0.12); b.translate(0, 0.27, 0);
  const g = new THREE.BufferGeometry();
  const A = a.toNonIndexed(), B = b.toNonIndexed();
  g.setAttribute('position', new THREE.Float32BufferAttribute([...A.attributes.position.array, ...B.attributes.position.array], 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute([...A.attributes.normal.array, ...B.attributes.normal.array], 3)); return g;
})();
const snowIM = instanced(snowGeo, plain('#FBFAFF'), snowmen.length);
const noseIM = instanced(new THREE.ConeGeometry(0.03, 0.12, 8).rotateX(Math.PI / 2).translate(0, 0.39, 0.15), plain('#FF9C6B'), snowmen.length);
const rocks = [0.9, 1.4, 2.6, 3.9, 4.6, 5.3, -0.2].map((th, i) => {
  const r = Rf(th) + 0.35 + (i % 3) * 0.2; return { x: r * Math.cos(th), z: r * Math.sin(th), s: 0.6 + (i % 4) * 0.25 };
});
const rockIM = instanced(sph(0.28, 1.3, 0.7, 1.0), plain('#C9C2EE'), rocks.length);

// boats
function boat(hull, sail) {
  const g = new THREE.Group();
  const h = new THREE.CylinderGeometry(0.2, 0.13, 0.75, 16, 1); h.rotateZ(Math.PI / 2); h.scale(1, 0.55, 0.9); g.add(mesh(h, plain(hull), 0, 0.03, 0));
  g.add(mesh(cyl(0.018, 0.018, 0.8, 6), plain(PAPER), 0.02, 0.08, 0));
  const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(0, 0.68); s.lineTo(0.42, 0); s.closePath();
  const sg = new THREE.ShapeGeometry(s); sg.translate(0.05, 0.14, 0);
  g.add(mesh(sg, mat({ pal: sail, side: THREE.DoubleSide })));
  scene.add(g); return g;
}
const boats = [
  { g: boat('#FF5A5F', PAPER), rad: 6.5, w: 0.14, ph: 2.0, pres: [1, 1, 1, 0, 0] },
  { g: boat('#2F5BFF', '#FFD234'), rad: 6.15, w: -0.18, ph: 4.4, pres: [0, 1, 0, 0, 0] },
  { g: boat('#FFD234', '#FF7EB3'), rad: 7.2, w: 0.11, ph: 0.4, pres: [1, 1, 0, 0, 0] },
];
// walkers
const walkers = [['#FF5A5F', 0.0], ['#2F5BFF', 0.37], ['#FFD234', 0.69]].map(([c, ph]) => {
  const g = new THREE.Group();
  g.add(mesh(cyl(0.045, 0.055, 0.15, 10), plain(c)));
  g.add(mesh(new THREE.SphereGeometry(0.045, 12, 8), plain('#FFC9A8'), 0, 0.19, 0));
  scene.add(g); return { g, ph };
});

// ------------------------------------------------------------------ overlay: particles, birds, beam (no outline)
const OV_HEAD = /* glsl */`
uniform sampler2D tDep; uniform vec2 uRes;
void depthTest(){ if (gl_FragCoord.z > texture(tDep, gl_FragCoord.xy / uRes).r + 0.00002) discard; }`;
const ovU = { tDep: { value: mainRT.depthTexture }, uRes: { value: new THREE.Vector2(RW, RH) } };
const PT_VERT = /* glsl */`
uniform int uKind; uniform float uTime; uniform float uScale; uniform float uPres[5]; uniform int uPrev; uniform int uNext;
uniform vec2 uWO; uniform float uWR;
in vec4 aSeed; out float vA; out float vRot; out float vFlap; out float vPick;
void main(){
  vec3 p = position; float size = 0.1, a = 1.0; vRot = 0.0; vFlap = 0.0; vPick = aSeed.w;
  if (uKind == 0) {            // snow
    float ph = fract(aSeed.x + uTime * (0.055 + 0.03 * aSeed.y));
    p.y = 7.0 - ph * 7.9; p.x += 0.35 * sin(uTime * 0.7 + aSeed.z * 6.28); p.z += 0.3 * cos(uTime * 0.6 + aSeed.w * 6.28);
    size = 0.075 + 0.05 * aSeed.y; a = smoothstep(0.0, 0.06, ph);
  } else if (uKind == 1) {     // petals
    float ph = fract(aSeed.x + uTime * (0.04 + 0.02 * aSeed.y));
    p.y = 5.5 - ph * 6.2; p.x += ph * 2.2 - 1.1 + 0.3 * sin(uTime + aSeed.z * 9.0); p.z += 0.4 * sin(uTime * 0.7 + aSeed.w * 6.28);
    size = 0.11; a = smoothstep(0.0, 0.06, ph); vRot = uTime * (1.5 + aSeed.y * 2.0) + aSeed.z * 6.28;
  } else if (uKind == 2) {     // autumn leaves riding the wind
    float ph = fract(aSeed.x + uTime * (0.05 + 0.03 * aSeed.y));
    p.y = 5.0 - ph * 5.8 + 0.25 * sin(uTime * 2.0 + aSeed.z * 9.0); p.x += (ph - 0.5) * 4.5; p.z += 0.6 * sin(uTime * 0.9 + aSeed.w * 6.28) + ph * 1.2;
    size = 0.13; a = smoothstep(0.0, 0.06, ph); vRot = uTime * (3.0 + aSeed.y * 3.0) + aSeed.z * 6.28;
  } else if (uKind == 3) {     // chimney smoke
    float ph = fract(aSeed.x + uTime * 0.32);
    p.y += ph * 1.7; p.x += ph * 0.55 + 0.06 * sin(uTime * 2.0 + aSeed.y * 9.0); p.z += ph * 0.25;
    size = 0.1 + ph * 0.32; a = (1.0 - ph) * smoothstep(0.0, 0.12, ph) * 0.9;
  } else if (uKind == 4) {     // sparkles on summer water
    float tw = pow(max(0.0, sin(uTime * 2.1 + aSeed.x * 40.0)), 14.0);
    size = 0.3 * tw; a = tw;
    p.y = 0.06;
  } else if (uKind == 5) {     // birds
    float dir = aSeed.z > 0.5 ? 1.0 : -1.0;
    float ang = aSeed.x * 6.28 + uTime * (0.22 + 0.08 * aSeed.y) * dir;
    float rad = 3.5 + 3.2 * aSeed.w;
    p = vec3(cos(ang) * rad, 4.0 + aSeed.y * 1.4 + 0.15 * sin(uTime * 1.3 + aSeed.x * 9.0), sin(ang) * rad);
    vFlap = sin(uTime * 8.0 + aSeed.x * 30.0); size = 0.46;
  }
  float d = distance(p.xz, uWO); float m = 1.0 - smoothstep(uWR - 0.3, uWR, d);
  float pres = mix(uPres[uPrev], uPres[uNext], m);
  a *= step(aSeed.w * 0.98, pres);
  vA = a;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = a > 0.001 ? size * uScale / -mv.z : 0.0;
  gl_Position = projectionMatrix * mv;
}`;
const PT_FRAG = /* glsl */`
precision highp float; out vec4 oColor;
${OV_HEAD}
uniform int uKind; uniform vec3 uC0, uC1, uC2;
in float vA; in float vRot; in float vFlap; in float vPick;
float seg(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h); }
void main(){
  depthTest();
  vec2 q = gl_PointCoord - 0.5; q.y = -q.y;
  float alpha = 0.0; vec3 c = uC0;
  float aa = fwidth(q.x) * 1.2;
  if (uKind == 0 || uKind == 3) { alpha = 1.0 - smoothstep(0.42 - aa, 0.42 + aa, length(q)); }
  else if (uKind == 1 || uKind == 2) {
    float cs = cos(vRot), sn = sin(vRot); vec2 r = mat2(cs, -sn, sn, cs) * q;
    if (uKind == 1) alpha = 1.0 - smoothstep(1.0 - aa * 6.0, 1.0 + aa * 6.0, length(r / vec2(0.44, 0.24)));
    else { float l = length(r / vec2(0.46, 0.2 * (1.0 - abs(r.x) * 1.4))); alpha = 1.0 - smoothstep(1.0 - aa * 6.0, 1.0 + aa * 6.0, l); }
    c = vPick < 0.33 ? uC0 : (vPick < 0.66 ? uC1 : uC2);
  } else if (uKind == 4) {
    float s = min(abs(q.x) * 6.0 + abs(q.y), abs(q.y) * 6.0 + abs(q.x));
    alpha = 1.0 - smoothstep(0.42 - aa * 4.0, 0.42 + aa * 4.0, s);
  } else if (uKind == 5) {
    float f = vFlap * 0.17;
    float dd = min(seg(q, vec2(0.0, -0.04), vec2(-0.2, 0.04 + f)), seg(q, vec2(-0.2, 0.04 + f), vec2(-0.4, -0.02 + f * 0.6)));
    dd = min(dd, min(seg(q, vec2(0.0, -0.04), vec2(0.2, 0.04 + f)), seg(q, vec2(0.2, 0.04 + f), vec2(0.4, -0.02 + f * 0.6))));
    alpha = 1.0 - smoothstep(0.035 - aa, 0.035 + aa, dd);
  }
  alpha *= vA;
  if (alpha < 0.01) discard;
  oColor = vec4(c, alpha);
}`;
function particles(kind, n, seed, spawn, pres, cols, extra = {}) {
  const r = mulberry32(seed), pos = new Float32Array(n * 3), sd = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) { const p = spawn(r, i); pos.set(p, i * 3); sd.set([r(), r(), r(), r()], i * 4); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aSeed', new THREE.BufferAttribute(sd, 4));
  const c = cols.map((h) => new THREE.Color(h));
  const m = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3, vertexShader: PT_VERT, fragmentShader: PT_FRAG, transparent: true, depthTest: false, depthWrite: false,
    uniforms: { ...G, ...ovU, uKind: { value: kind }, uScale: { value: RH / (2 * Math.tan((camera.fov * Math.PI) / 360)) }, uPres: { value: pres },
      uC0: { value: c[0] }, uC1: { value: c[1] || c[0] }, uC2: { value: c[2] || c[0] } },
  });
  const pts = new THREE.Points(g, m); pts.frustumCulled = false; overlay.add(pts); return pts;
}
const disc = (R0, R1 = 0) => (r) => { const a = r() * TAU, rr = Math.sqrt(lerp(R1 * R1 / (R0 * R0), 1, r())) * R0; return [rr * Math.cos(a), 0, rr * Math.sin(a)]; };
particles(0, 520, 21, disc(11), [0, 0, 0, 1, 0.55], ['#FFFFFF']);
particles(1, 120, 22, disc(6.5), [1, 0, 0, 0, 0], ['#FF7EB3', '#FFB3D1', '#FFFFFF']);
particles(2, 170, 23, disc(7.5), [0, 0, 1, 0, 0], ['#FF5A5F', '#FF9C6B', '#FFD234']);
{
  const chim = chimneys;
  particles(3, chim.length * 7, 24, (r, i) => chim[i % chim.length], [0, 0, 0, 1, 1], ['#FBFAFF']);
}
particles(4, 70, 25, disc(7.6, 5.6), [0.35, 1, 0.25, 0, 0], ['#FFFFFF']);
particles(5, 9, 26, () => [0, 0, 0], [1, 1, 0.6, 0, 0], [INK]);

// lighthouse beam
const beamMat = new THREE.ShaderMaterial({
  glslVersion: THREE.GLSL3, transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide,
  uniforms: { ...ovU, uOn: { value: 0 } },
  vertexShader: `out float vAl; in float aAl; void main(){ vAl = aAl; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */`precision highp float; out vec4 oColor; ${OV_HEAD} uniform float uOn; in float vAl;
    void main(){ depthTest(); float a = uOn * 0.62 * pow(1.0 - vAl, 0.9); oColor = vec4(1.0, 0.85, 0.45, a); }`,
});
const beam = (() => {
  const pos = [0, 0, 0], al = [0], idx = [], n = 24, spread = 0.14, len = 12;
  for (let i = 0; i <= n; i++) { const a = -spread + (2 * spread * i) / n; pos.push(len * Math.cos(a), -0.35 * (i % 1), len * Math.sin(a)); al.push(1); }
  for (let i = 1; i <= n; i++) idx.push(0, i, i + 1);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aAl', new THREE.Float32BufferAttribute(al, 1)); g.setIndex(idx);
  const m = new THREE.Mesh(g, beamMat); m.position.set(L.x, LANTERN_Y, L.z); m.frustumCulled = false; overlay.add(m); return m;
})();

// ------------------------------------------------------------------ per-frame update (pure)
const tmpM = new THREE.Matrix4(), tmpQ = new THREE.Quaternion(), tmpS = new THREE.Vector3(), tmpP = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0);
const setInst = (im, i, x, y, z, sx, sy, sz, ry = 0) => {
  tmpQ.setFromAxisAngle(Y, ry); tmpS.set(sx, sy, sz); tmpP.set(x, y, z); tmpM.compose(tmpP, tmpQ, tmpS); im.setMatrixAt(i, tmpM);
};
const CROWN_S = [1, 1.12, 1.0, 0.8, 0.8];

function update(t) {
  const w = waveAt(t);
  G.uTime.value = t; G.uPrev.value = w.prev; G.uNext.value = w.next; G.uWR.value = w.r;
  G.uBand.value = w.k < 0 ? 0 : smooth(0, 0.08, w.tau) * (1 - smooth(18, 30, w.r));
  G.uWaveAmp.value = w.k < 0 ? 0 : 1 - smooth(10, 22, w.r);

  // camera: one slow high orbit with a gentle push
  const p = inOutSine(t / DURATION);
  const az = lerp(0.55, 2.35, p), el = lerp(0.62, 0.6, p), dist = lerp(24.6, 23.9, p);
  const tgt = new THREE.Vector3(0.2, -0.5, 0.1);
  camera.position.set(tgt.x + dist * Math.cos(el) * Math.cos(az), tgt.y + dist * Math.sin(el), tgt.z + dist * Math.cos(el) * Math.sin(az));
  camera.lookAt(tgt); camera.updateMatrixWorld();

  // lighthouse: anticipation squash before each wave, release spring as it fires
  let sy = 1, flash = 0;
  for (let k = 0; k < TW.length; k++) {
    const s = t - TW[k];
    if (s > -0.32 && s < 0) sy = 1 - 0.15 * Math.sin((Math.PI / 2) * ((s + 0.32) / 0.32));
    else if (s >= 0 && s < 2.5) sy = 1 - 0.15 * Math.exp(-5 * s) * Math.cos(12 * s);
    if (s >= 0 && s < 1.2) flash = Math.max(flash, Math.exp(-4 * s));
  }
  lighthouse.scale.set(1 + (1 - sy) * 0.6, sy, 1 + (1 - sy) * 0.6);
  lantern.uniforms.uFlash.value = flash;

  // houses & mill: pulse on wave arrival
  for (const o of objs) {
    const [sxz, syy] = popScale(objState(o.pres, t, o.d));
    o.node.scale.set(sxz, syy, sxz);
  }
  const wind = [0.6, 0.5, 1.2, 0.8, 0.5];
  millBlades.rotation.z = t * 1.6;

  // trees
  let ti = 0;
  trees.forEach((tr, i) => {
    const [a, b] = popScale(objState(CROWN_S, t, tr.d));
    const sway = 0.035 * Math.sin(t * 1.6 + tr.ph);
    setInst(trunkIM, ti++, tr.x, 0.55, tr.z, tr.s, tr.s, tr.s);
    tmpQ.setFromEuler(new THREE.Euler(sway, tr.ph, sway * 0.6)); tmpS.set(a * tr.s, b * tr.s, a * tr.s); tmpP.set(tr.x, 0.55 + 0.4 * tr.s, tr.z);
    tmpM.compose(tmpP, tmpQ, tmpS); crownIM.setMatrixAt(i, tmpM);
  });
  pines.forEach((pn, i) => {
    const [a, b] = popScale(objState(ALL, t, pn.d));
    setInst(trunkIM, ti++, pn.x, 0.55, pn.z, pn.s, pn.s * 0.6, pn.s);
    setInst(pineIM, i, pn.x, 0.55, pn.z, a * pn.s, b * pn.s, a * pn.s, pn.ph);
  });
  flowers.forEach((f, i) => { const [a, b] = popScale(objState([1, 0, 0, 0, 0], t, f.d)); setInst(flowerIM, i, f.x, 0.55, f.z, a * f.s, b * f.s, a * f.s); });
  umbrellas.forEach((u, i) => {
    const [a, b] = popScale(objState([0, 1, 0, 0, 0], t, u.d));
    setInst(umbIM, i, u.x, 0.25, u.z, a, b, a); setInst(poleIM, i, u.x, 0.25, u.z, a, b, a);
  });
  pumpkins.forEach((q, i) => { const [a, b] = popScale(objState([0, 0, 1, 0, 0], t, q.d)); setInst(pumpIM, i, q.x, 0.55, q.z, a * q.s, b * q.s, a * q.s); });
  bales.forEach((q, i) => { const [a, b] = popScale(objState([0, 0, 1, 0, 0], t, q.d)); setInst(baleIM, i, q.x, 0.62, q.z, a, b, a, 0.45 + i); });
  snowmen.forEach((q, i) => {
    const [a, b] = popScale(objState([0, 0, 0, 1, 1], t, q.d));
    setInst(snowIM, i, q.x, 0.55, q.z, a, b, a, 0.6 + i); setInst(noseIM, i, q.x, 0.55, q.z, a, b, a, 0.6 + i);
  });
  rocks.forEach((q, i) => setInst(rockIM, i, q.x, -0.12, q.z, q.s, q.s, q.s, i));
  for (const im of [trunkIM, crownIM, pineIM, flowerIM, umbIM, poleIM, pumpIM, baleIM, snowIM, noseIM, rockIM]) im.instanceMatrix.needsUpdate = true;

  // boats: sail around the island; the wave decides who is out
  for (const b of boats) {
    const ang = b.ph + b.w * t;
    const x = b.rad * Math.cos(ang), z = b.rad * Math.sin(ang);
    const [a, bb] = popScale(objState(b.pres, t, distL(x, z)));
    b.g.position.set(x, 0.03 * Math.sin(t * 2.2 + b.ph) + 0.02, z);
    b.g.rotation.set(0.06 * Math.sin(t * 1.7 + b.ph), -ang + (b.w > 0 ? -Math.PI / 2 : Math.PI / 2), 0.05 * Math.sin(t * 2.3 + b.ph));
    b.g.scale.set(a, bb, a);
  }
  // walkers
  for (const wk of walkers) {
    const u = (wk.ph + t * 0.018) % 1, p0 = pathCurve.getPointAt(u), tg = pathCurve.getTangentAt(u);
    const [a, b] = popScale(objState([1, 1, 1, 1, 0], t, distL(p0.x, p0.z)));
    wk.g.position.set(p0.x, 0.557 + Math.abs(Math.sin(t * 9 + wk.ph * 20)) * 0.025, p0.z);
    wk.g.rotation.y = Math.atan2(tg.x, tg.z); wk.g.scale.set(a, b, a);
  }
  // beam
  beamMat.uniforms.uOn.value = smooth(20.9, 21.9, t) * (1 - smooth(25.0, 25.5, t));
  beam.rotation.y = -(t * 1.05 - 21.64);
}
function nightAt(t, d) {
  const o = objState([0, 0, 0, 0, 1], t, d);
  if (o.s >= 99) return o.from;
  return lerp(o.from, o.to, smooth(0, 0.35, o.s));
}

function renderGL() {
  R.setRenderTarget(shadowRT); scene.overrideMaterial = depthMat; R.setClearColor(0xffffff, 1); R.clear(); R.render(scene, sunCam); scene.overrideMaterial = null;
  R.setRenderTarget(mainRT); R.setClearColor(0xfff4e2, 1); R.clear(); R.render(scene, camera);
  quad.material = edgeMat; R.setRenderTarget(compRT); R.render(quadScene, quadCam);
  R.autoClear = false; R.render(overlay, camera); R.autoClear = true;
  quad.material = downMat; R.setRenderTarget(null); R.render(quadScene, quadCam);
}

// ------------------------------------------------------------------ 2-D frame, paper, grain, captions
const out = document.getElementById('film');
const ctx = out.getContext('2d');
function noiseCanvas(w, h, seed, amt) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'), img = g.createImageData(w, h), r = mulberry32(seed);
  for (let i = 0; i < w * h; i++) { const v = r() < 0.5 ? 0 : 255; img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = Math.floor(r() * amt); }
  g.putImageData(img, 0, 0); return c;
}
const GRAIN = Array.from({ length: 6 }, (_, i) => noiseCanvas(FW, FH, 100 + i, 26));
const PAPER_TEX = (() => {
  const c = noiseCanvas(W, H, 7, 14);
  const g = c.getContext('2d'), r = mulberry32(9);
  g.strokeStyle = 'rgba(120,100,80,0.05)'; g.lineWidth = 1;
  for (let i = 0; i < 900; i++) { const x = r() * W, y = r() * H, a = r() * TAU, l = 6 + r() * 22; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + 3, y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  return c;
})();

function framePath(t) {
  // grow open 0..1.15 s, draw back in 28.45..29.55 s
  const open = t < 15 ? 0.02 + 0.98 * springOpen(t) : 1 - inOutSine((t - 28.45) / 1.1);
  if (open <= 0.001) return null;
  const ow = clamp(open, 0, 1.2);
  const w = lerp(120, FW, Math.min(ow, 1)), h = lerp(120, FH, clamp(ow * 1.06));
  const rad = lerp(60, 30, clamp(ow));
  const cx = W / 2, cy = FY + FH / 2;
  const step = Math.floor(t * 12);       // the edge boils at 12 fps
  const r = mulberry32(500 + step);
  const ph = [r() * TAU, r() * TAU, r() * TAU];
  const path = new Path2D();
  const N = 360;
  // perimeter of rounded rect, parametrised by angle-ish
  const pts = [];
  const hw = w / 2 - 6, hh = h / 2 - 6, rr = Math.min(rad, hw, hh);
  const per = 2 * (w + h - 4 * rr) + TAU * rr;
  for (let i = 0; i < N; i++) {
    let s = (i / N) * per, x, y, nx, ny;
    const segs = [w - 2 * rr, (Math.PI / 2) * rr, h - 2 * rr, (Math.PI / 2) * rr, w - 2 * rr, (Math.PI / 2) * rr, h - 2 * rr, (Math.PI / 2) * rr];
    let k = 0; while (k < 7 && s > segs[k]) { s -= segs[k]; k++; }
    const corner = (cxx, cyy, a0) => { const a = a0 + s / rr; return [cxx + rr * Math.cos(a), cyy + rr * Math.sin(a), Math.cos(a), Math.sin(a)]; };
    switch (k) {
      case 0: [x, y, nx, ny] = [-hw + rr + s, -hh, 0, -1]; break;
      case 1: [x, y, nx, ny] = corner(hw - rr, -hh + rr, -Math.PI / 2); break;
      case 2: [x, y, nx, ny] = [hw, -hh + rr + s, 1, 0]; break;
      case 3: [x, y, nx, ny] = corner(hw - rr, hh - rr, 0); break;
      case 4: [x, y, nx, ny] = [hw - rr - s, hh, 0, 1]; break;
      case 5: [x, y, nx, ny] = corner(-hw + rr, hh - rr, Math.PI / 2); break;
      case 6: [x, y, nx, ny] = [-hw, hh - rr - s, -1, 0]; break;
      default: [x, y, nx, ny] = corner(-hw + rr, -hh + rr, Math.PI); break;
    }
    const u = i / N;
    const wob = 2.2 * Math.sin(u * TAU * 7 + ph[0]) + 1.2 * Math.sin(u * TAU * 19 + ph[1]) + 0.7 * Math.sin(u * TAU * 41 + ph[2]);
    pts.push([cx + x + nx * wob, cy + y + ny * wob]);
  }
  pts.forEach(([x, y], i) => (i ? path.lineTo(x, y) : path.moveTo(x, y)));
  path.closePath();
  return path;
}
function springOpen(s) { if (s <= 0) return 0.0; const p = clamp(s / 2.3); const c = 0.9; return 1 + (c + 1) * (p - 1) ** 3 + c * (p - 1) ** 2; }

const CAPS = [
  { t0: 0.75, t1: 4.85, l: ['A Year on the Island', 'One lighthouse, one small island, twelve months.', 'SPRING · MAR · 14 °C · SUNRISE 06:41'] },
  { t0: 5.25, t1: 9.85, l: ['Summer', 'Long light, warm water, boats out past the rocks.', 'JUL · 29 °C · SUNRISE 06:02'] },
  { t0: 10.25, t1: 14.85, l: ['Autumn', 'The orchard turns, and the wind picks up.', 'OCT · 18 °C · SUNRISE 07:22'] },
  { t0: 15.25, t1: 19.85, l: ['Winter', 'Snow settles quietly on every roof.', 'JAN · 4 °C · SUNRISE 07:40'] },
  { t0: 20.25, t1: 24.85, l: ['Night', 'One light keeps watch over the long dark.', 'JAN · 23:40 · ONE BEAM EVERY 6 S'] },
  { t0: 25.25, t1: 29.3, l: ['Spring, again', 'The light turns, and the year begins once more.', 'MAR · 14 °C · SUNRISE 06:41'] },
];
const TYPE = [
  { f: '600 31px "Inter Tight"', c: '#25214A', y: FY + FH + 62, track: -0.2 },
  { f: '400 21px "Inter Tight"', c: '#6E6A8A', y: FY + FH + 98, track: 0 },
  { f: '400 16px "Plex Mono"', c: '#9A96B4', y: FY + FH + 132, track: 1.2 },
];
function drawCaptions(t) {
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  for (const cap of CAPS) {
    if (t < cap.t0 - 0.1 || t > cap.t1 + 0.4) continue;
    cap.l.forEach((str, i) => {
      const a0 = cap.t0 + i * 0.09;
      const kin = clamp((t - a0) / 0.42), kout = clamp((t - cap.t1 - i * 0.04) / 0.26);
      const a = outCubic(kin) * (1 - kout);
      if (a <= 0.002) return;
      const dy = (1 - outCubic(kin)) * 9 - outCubic(kout) * 6;
      ctx.globalAlpha = a; ctx.font = TYPE[i].f; ctx.fillStyle = TYPE[i].c;
      ctx.letterSpacing = `${TYPE[i].track}px`;
      ctx.fillText(str, W / 2, TYPE[i].y + dy);
    });
  }
  ctx.globalAlpha = 1; ctx.letterSpacing = '0px';
}

function seek(t) {
  t = clamp(t, 0, DURATION);
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
  ctx.drawImage(PAPER_TEX, 0, 0);
  const path = framePath(t);
  if (path) {
    update(t); renderGL();
    ctx.save(); ctx.clip(path);
    ctx.drawImage(glCanvas, FX, FY);
    ctx.globalCompositeOperation = 'soft-light';
    ctx.drawImage(GRAIN[Math.floor(t * 12) % 6], FX, FY);
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
    ctx.lineWidth = 1.6; ctx.strokeStyle = 'rgba(37,33,74,0.55)'; ctx.stroke(path);
  }
  drawCaptions(t);
}

// ------------------------------------------------------------------ events for the score / sfx
function events() {
  const ev = [];
  TW.forEach((t0, k) => {
    ev.push({ t: t0 - 0.32, type: 'squash', k }, { t: t0, type: 'wave', k, to: STATE_PAL[k + 1] });
    const from = STATE_PAL[k], to = STATE_PAL[k + 1];
    const add = (list, arr, type) => list.forEach((o) => {
      const a = arr[from], b = arr[to]; if (a === b && type !== 'pulse') return;
      ev.push({ t: t0 + tauOf(o.d), type: a === 0 ? 'pop-in' : b === 0 ? 'pop-out' : 'pulse', what: type, d: +o.d.toFixed(2) });
    });
    add(objs, ALL, 'pulse');
    add(umbrellas, [0, 1, 0, 0, 0], 'umbrella'); add(pumpkins, [0, 0, 1, 0, 0], 'pumpkin'); add(bales, [0, 0, 1, 0, 0], 'bale');
    add(snowmen, [0, 0, 0, 1, 1], 'snowman'); add(flowers, [1, 0, 0, 0, 0], 'flower');
  });
  return ev.sort((a, b) => a.t - b.t);
}

await document.fonts.load('600 31px "Inter Tight"'); await document.fonts.load('400 21px "Inter Tight"'); await document.fonts.load('400 15px "Plex Mono"');
window.seek = seek;
window.DURATION = DURATION;
window.HITS = [];
window.EVENTS = events();
window.filmReady = true;
seek(Number(params.get('t') || 0));
