import * as THREE from 'three';
import { std, box } from './helpers.js';
import { SIZE } from './switch.js';

/**
 * A 19″ server rack with other gear already installed and an empty 1U slot at y = 0.
 * Starts invisible; call setOpacity(0…1) to fade it in and setCables(0…1) to draw the patch cables.
 */
export function buildRack() {
  const { W, D } = SIZE;
  const rack = new THREE.Group();
  rack.visible = false;

  const fadeMats = [];
  const mat = (o) => { const m = std({ ...o, transparent: true, opacity: 0 }); fadeMats.push(m); return m; };
  const R = {
    post: mat({ color: 0x1c1d1f, metalness: .7, roughness: .5 }),
    dev:  mat({ color: 0x2a2b2e, metalness: .7, roughness: .45 }),
    hole: mat({ color: 0x050505, roughness: .8 }),
    led:  mat({ color: 0x111111, emissive: 0x39d17a, emissiveIntensity: 1.4 }),
    acc:  mat({ color: 0xfe5b2a, emissive: 0xfe5b2a, emissiveIntensity: .5 }),
  };

  // frame: four posts with rail holes (1U = 3 holes), top and bottom
  const RX = W / 2 + .33, TOP = 2.15, BOT = -2.45, PH = TOP - BOT, PY = (TOP + BOT) / 2, FZ = 1.15;
  for (const x of [-RX, RX]) {
    for (const z of [FZ, -1.4]) box(.14, PH, .14, R.post, x, PY, z, rack);
    for (let y = BOT + .1; y < TOP - .05; y += .147) box(.05, .05, .01, R.hole, x, y, FZ + .075, rack);
  }
  box(2 * RX + .14, .12, 2.7, R.post, 0, TOP, -.12, rack);
  box(2 * RX + .14, .12, 2.7, R.post, 0, BOT, -.12, rack);

  // other gear in the rack
  const device = (y, u, kind) => {
    const hgt = u * .44 - .02, front = D / 2 - .04;
    box(W, hgt, D - .1, R.dev, 0, y, 0, rack);
    for (const s of [-1, 1]) box(.26, hgt, .03, R.dev, s * (W / 2 + .13), y, FZ + .1, rack);
    if (kind === 'patch') {
      for (let i = 0; i < 24; i++) box(.12, .1, .02, R.hole, -2 + i * .174, y, front, rack);
    }
    if (kind === 'switch') for (let i = 0; i < 16; i++) {
      box(.15, .12, .02, R.hole, -1.6 + i * .2, y - .04, front, rack);
      box(.03, .02, .01, R.led, -1.55 + i * .2, y + .08, front + .01, rack);
    }
    if (kind === 'server') for (let i = 0; i < 6; i++) for (let r = 0; r < 2; r++) {
      box(.62, .16, .02, R.hole, -1.75 + i * .7, y - .2 + r * .4, front, rack);
      box(.04, .03, .01, R.acc, -1.5 + i * .7, y - .2 + r * .4, front + .02, rack);
    }
  };
  device(.46, 1, 'patch');   // patch panel right above the NX-24 slot
  device(.92, 1, 'switch');  // core switch
  device(1.6, 2, 'server');
  device(-.69, 2, 'server');
  device(-1.57, 2, 'server');

  // patch cables from the NX-24 ports up to the panel
  const cables = [];
  const cableMats = [std({ color: 0xfe5b2a, roughness: .5 }), std({ color: 0x8fa3b8, roughness: .5 })];
  for (let i = 0; i < 10; i++) {
    const x = -1.2 + i * .19 * (i < 5 ? 1 : 1.2);
    const px = -2 + (i * 2 + 3) * .174;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x, .1, 1.34),
      new THREE.Vector3(x, .14, 1.62 + (i % 3) * .05),
      new THREE.Vector3((x + px) / 2, .36, 1.6),
      new THREE.Vector3(px, .46, 1.36),
    ]);
    const geo = new THREE.TubeGeometry(curve, 32, .022, 6);
    geo.setDrawRange(0, 0);
    const cable = new THREE.Mesh(geo, cableMats[i % 2]);
    rack.add(cable); cables.push(cable);
  }

  function setOpacity(o) {
    rack.visible = o > .001;
    const transparent = o < .999;
    fadeMats.forEach((m) => {
      if (m.transparent !== transparent) { m.transparent = transparent; m.needsUpdate = true; }
      m.opacity = o;
    });
  }

  function setCables(p) {
    cables.forEach((c) => c.geometry.setDrawRange(0, Math.floor(c.geometry.index.count * p / 3) * 3));
  }

  return { rack, setOpacity, setCables };
}
