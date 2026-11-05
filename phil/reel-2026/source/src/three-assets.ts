// Three.js assets posed per frame (no clocks): studio-lit ribbons for the footage cards, and the 3D point ocean.
// Both render synchronously into their own canvas; the engine draws that canvas into the frame.
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const P = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const iX = (p: number) => (p <= 0 ? 0 : Math.pow(2, 10 * p - 10));
const ioX = (p: number) =>
  p <= 0 ? 0 : p >= 1 ? 1 : p < 0.5 ? Math.pow(2, 20 * p - 10) / 2 : (2 - Math.pow(2, -20 * p + 10)) / 2;
const hash = (n: number) => {
  n = Math.imul((n | 0) ^ 0x9e3779b9, 0x85ebca6b);
  n ^= n >>> 13;
  n = Math.imul(n, 0xc2b2ae35);
  n ^= n >>> 16;
  return (n >>> 0) / 4294967296;
};

// ---------------------------------------------------------------- ribbons
// Long twisted bands of brushed grey metal under a studio environment — the reference's grey "footage" plates.
function ribbonGeometry(len: number, wid: number, twist: number, bend: number, wave: number) {
  const g = new THREE.PlaneGeometry(len, wid, 260, 2);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const u = x / len + 0.5;
    const ang = twist * (u - 0.5) * Math.PI;
    const yy = y * Math.cos(ang);
    const zz = y * Math.sin(ang) + bend * Math.sin(u * Math.PI) + wave * Math.sin(u * Math.PI * 3.0);
    p.setXYZ(i, x, yy, zz);
  }
  g.computeVertexNormals();
  return g;
}

export function makeRibbons() {
  const canvas = document.createElement('canvas');
  const renderer = new THREE.WebGLRenderer({canvas, antialias: true, preserveDrawingBuffer: true, alpha: false});
  renderer.setPixelRatio(1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0a);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(3, 5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xdfe6ff, 1.1);
  rim.position.set(-5, -2, -3);
  scene.add(rim);
  const mat = new THREE.MeshStandardMaterial({color: 0x8a8a86, metalness: 0.78, roughness: 0.3, side: THREE.DoubleSide});
  const matDark = new THREE.MeshStandardMaterial({color: 0x3a3a38, metalness: 0.6, roughness: 0.45, side: THREE.DoubleSide});
  const ribbons = [
    new THREE.Mesh(ribbonGeometry(9, 0.9, 1.4, 0.9, 0.15), mat),
    new THREE.Mesh(ribbonGeometry(9, 0.6, -2.2, -0.6, 0.25), matDark),
    new THREE.Mesh(ribbonGeometry(9, 1.3, 0.8, 0.4, -0.2), mat),
  ];
  ribbons.forEach((r) => scene.add(r));
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  let size = [0, 0];

  return (w: number, h: number, t: number, seed: number) => {
    const rw = Math.max(64, Math.round(w * 0.75));
    const rh = Math.max(64, Math.round(h * 0.75));
    if (rw !== size[0] || rh !== size[1]) {
      renderer.setSize(rw, rh, false);
      size = [rw, rh];
    }
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    ribbons.forEach((r, i) => {
      const a = hash(seed * 7 + i) * Math.PI;
      r.rotation.set(0.5 * hash(seed * 3 + i) - 0.25 + 0.05 * Math.sin(t * 0.7 + i), 0.6 * (hash(seed * 11 + i) - 0.5), a + 0.06 * t * (i % 2 ? 1 : -1));
      r.position.set((hash(seed * 5 + i) - 0.5) * 2.4, (hash(seed * 13 + i) - 0.5) * 1.8 + 0.12 * t * (i % 2 ? 1 : -1), (hash(seed * 17 + i) - 0.5) * 1.5);
    });
    const ca = hash(seed * 19) * Math.PI * 2;
    camera.position.set(Math.sin(ca) * 2.0, Math.cos(ca) * 1.2, 7.2);
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    return canvas;
  };
}

// ---------------------------------------------------------------- point ocean
// The ripple field as real geometry: 12,288 round points on a plane, heights from the same impacts as v3,
// camera from straight down → tilted over the surface → flying forward. Depth fog fades the far field.
export const IMPACTS: [number, number, number, number][] = [
  [12.0, 0, 0, 95],
  [12.55, -560, 320, 70],
  [12.95, 640, -260, 70],
  [13.35, -200, 820, 80],
];

export function makeOcean(W: number, H: number) {
  const canvas = document.createElement('canvas');
  const renderer = new THREE.WebGLRenderer({canvas, antialias: false, preserveDrawingBuffer: true, alpha: false});
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  renderer.setClearColor(0x070707, 1);
  const scene = new THREE.Scene();
  const COLS = 132;
  const ROWS = 168;
  const SP = 40;
  const N = COLS * ROWS;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const siz = new Float32Array(N);
  for (let j = 0; j < ROWS; j++)
    for (let i = 0; i < COLS; i++) {
      const k = j * COLS + i;
      pos[k * 3] = -2620 + i * SP;
      pos[k * 3 + 2] = -1300 + j * SP;
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(siz, 1));
  const fov = 2 * Math.atan(540 / 900) * (180 / Math.PI);
  const mat = new THREE.ShaderMaterial({
    uniforms: {uScale: {value: H / 2 / Math.tan((fov * Math.PI) / 360)}, uNear: {value: 1300}, uFar: {value: 4600}},
    vertexShader: `attribute float size; attribute vec3 color; varying vec3 vColor; varying float vFade; uniform float uScale, uNear, uFar;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv; float d = -mv.z;
        gl_PointSize = max(1.5, size * uScale / max(d, 1.0)); vColor = color; vFade = smoothstep(uFar, uNear, d); }`,
    fragmentShader: `varying vec3 vColor; varying float vFade;
      void main(){ vec2 c = gl_PointCoord - 0.5; float r = length(c); if (r > 0.5) discard; float a = smoothstep(0.5, 0.36, r);
        gl_FragColor = vec4(vColor * vFade, a); }`,
    transparent: true,
    depthWrite: true,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  scene.add(pts);
  const camera = new THREE.PerspectiveCamera(fov, W / H, 5, 9000);
  camera.rotation.order = 'YXZ';

  const wave = (x: number, z: number, t: number) => {
    let h = 0;
    for (const [ti, ix, iz, A] of IMPACTS) {
      const dt = t - ti;
      if (dt < 0) continue;
      const d = Math.hypot(x - ix, z - iz);
      h += A * Math.exp(-Math.pow((d - 950 * dt) / 85, 2)) * Math.exp(-dt * 0.7);
      if (d < 950 * dt) h += A * 0.45 * Math.sin(d * 0.03 - dt * 13) * Math.exp(-d / 520) * Math.exp(-dt * 1.3);
    }
    if (t > 13.4) h += 48 * P(t, 13.4, 14.0) * Math.sin(x * 0.0045 + t * 2.2) * Math.cos(z * 0.0052 + t * 1.7);
    return h;
  };
  const LIME = [0.612, 0.98, 0.039];
  const WHITE = [0.95, 0.95, 0.93];
  const GREY = [0.36, 0.36, 0.34];

  return (t: number) => {
    for (let k = 0; k < N; k++) {
      const x = pos[k * 3];
      const z = pos[k * 3 + 2];
      const h = wave(x, z, t);
      pos[k * 3 + 1] = h;
      const c = h > 26 ? LIME : h < -26 ? GREY : WHITE;
      col[k * 3] = c[0];
      col[k * 3 + 1] = c[1];
      col[k * 3 + 2] = c[2];
      siz[k] = 2 * (4.2 + Math.min(10, Math.abs(h) * 0.09)) * 1.05;
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
    geo.attributes.size.needsUpdate = true;
    const e = ioX(P(t, 13.35, 14.2));
    const fly = iX(P(t, 14.2, 14.8));
    camera.position.set(0, lerp(1150, 330, e), lerp(0, -760, e) + 3600 * fly);
    camera.rotation.set(lerp(-Math.PI / 2, -0.3, e), Math.PI, 0);
    renderer.render(scene, camera);
    return canvas;
  };
}
