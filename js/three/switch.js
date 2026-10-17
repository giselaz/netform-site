import * as THREE from 'three';
import { std, box, anchor } from './helpers.js';

/** Outer size of the NX-24 in scene units (1 unit ≈ 10 cm): 1U, 19″ wide. */
export const SIZE = { W: 4.4, D: 2.6, H: 0.44 };

const M = {
  metal:  std({ color: 0x3a3b3e, metalness: .85, roughness: .42 }),
  alu:    std({ color: 0xc3c4c8, metalness: .9,  roughness: .3 }),
  black:  std({ color: 0x0f0f10, metalness: .2,  roughness: .6 }),
  dark:   std({ color: 0x222326, metalness: .6,  roughness: .45 }),
  pcb:    std({ color: 0x173527, metalness: .15, roughness: .55 }),
  chip:   std({ color: 0x141415, metalness: .3,  roughness: .35 }),
  copper: std({ color: 0xc27a45, metalness: 1,   roughness: .35 }),
  gold:   std({ color: 0xd4a64a, metalness: 1,   roughness: .3 }),
  orange: std({ color: 0xfe5b2a, metalness: .2,  roughness: .4, emissive: 0xfe5b2a, emissiveIntensity: .35 }),
};

/**
 * Builds the NX-24 switch from separate parts so each one can be animated.
 * Returns the whole unit, its parts, label anchors, and the moving bits (LEDs, fan rotors).
 */
export function buildSwitch() {
  const { W, D, H } = SIZE;
  const unit = new THREE.Group();
  const anchors = {};
  const part = () => { const g = new THREE.Group(); unit.add(g); return g; };

  // chassis: tray, side walls, rack ears
  const chassis = part();
  box(W, .04, D, M.metal, 0, -H / 2, 0, chassis);
  box(.04, H, D, M.metal, -W / 2, 0, 0, chassis);
  box(.04, H, D, M.metal,  W / 2, 0, 0, chassis);
  box(.26, H, .03, M.metal, -W / 2 - .13, 0, D / 2 - .04, chassis);
  box(.26, H, .03, M.metal,  W / 2 + .13, 0, D / 2 - .04, chassis);

  // mainboard with switching chip, memory and traces
  const pcb = part(); pcb.position.y = -.16;
  box(W - .14, .03, D - .3, M.pcb, 0, 0, -.06, pcb);
  box(.7, .05, .7, M.chip, -.2, .04, .05, pcb);
  [[-1.45, .45], [-1.45, -.4], [.5, .62], [-.9, -.75]].forEach(([x, z]) => box(.3, .04, .3, M.chip, x, .035, z, pcb));
  [.36, .56].forEach((x) => box(.12, .08, .85, M.chip, x, .05, -.12, pcb));
  for (let i = 0; i < 14; i++) box(.012, .004, .62, M.copper, -1.2 + i * .17, .017, .72, pcb);
  anchors.pcb = anchor(pcb, -1.45, .06, -.4);

  // heatsink on the switching chip
  const heatsink = part(); heatsink.position.set(-.2, -.075, .05);
  box(.74, .03, .74, M.alu, 0, 0, 0, heatsink);
  for (let i = 0; i < 9; i++) box(.025, .17, .74, M.alu, -.34 + i * .085, .1, 0, heatsink);
  anchors.heatsink = anchor(heatsink, .36, .18, 0);

  // port module: 2 × 12 RJ45 with link LEDs, 2 × 2 SFP+ cages
  const ports = part(); ports.position.set(0, -.05, 1.15);
  const leds = [];
  for (let r = 0; r < 2; r++) for (let c = 0; c < 12; c++) {
    const x = -1.2 + c * .19, y = r * .155;
    box(.165, .135, .22, M.black, x, y, 0, ports);
    box(.1, .01, .01, M.gold, x, y + .035, .112, ports);
    const led = box(.03, .02, .01, std({ color: 0x111111, emissive: 0x39d17a, emissiveIntensity: 0 }), x + .058, y + .05, .112, ports);
    led.userData.phase = Math.random() * 10;
    leds.push(led);
  }
  for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) box(.16, .12, .34, M.alu, 1.2 + c * .2, r * .155, -.05, ports);
  anchors.ports = anchor(ports, 1.5, .23, .1);

  // front bezel with brand mark and status lights
  const bezel = part(); bezel.position.set(-1.78, 0, 1.29);
  box(.84, H, .03, M.metal, 0, 0, 0, bezel);
  box(.1, .1, .01, M.orange, -.28, .1, .02, bezel);
  [0, 1, 2].forEach((i) => box(.03, .02, .01, std({ color: 0x111111, emissive: 0xfe5b2a, emissiveIntensity: 1.5 }), -.28 + i * .07, -.08, .02, bezel));

  // three cooling fans at the rear
  const fans = part(); fans.position.z = -1.17;
  const rotors = [];
  [-1.75, -1.1, -.45].forEach((x) => {
    const f = new THREE.Group(); f.position.x = x; fans.add(f);
    const s = .38, t = .03;
    box(s, t, .12, M.dark, 0,  s / 2 - t / 2, 0, f); box(s, t, .12, M.dark, 0, -s / 2 + t / 2, 0, f);
    box(t, s, .12, M.dark,  s / 2 - t / 2, 0, 0, f); box(t, s, .12, M.dark, -s / 2 + t / 2, 0, 0, f);
    const rotor = new THREE.Group(); f.add(rotor); rotors.push(rotor);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, .08, 20), M.black);
    hub.rotation.x = Math.PI / 2; rotor.add(hub);
    for (let b = 0; b < 7; b++) {
      const arm = new THREE.Group(); arm.rotation.z = b / 7 * Math.PI * 2; rotor.add(arm);
      box(.05, .12, .01, M.black, 0, .11, 0, arm).rotation.y = .5;
    }
  });
  anchors.fans = anchor(fans, -1.75, .22, 0);

  // power supply
  const psu = part(); psu.position.set(1.4, -.005, -.62);
  box(1.05, .3, 1.0, M.dark, 0, 0, 0, psu);
  box(1.05, .012, .14, M.orange, 0, .156, .32, psu);
  for (let i = 0; i < 8; i++) box(.06, .2, .01, M.black, -.35 + i * .1, 0, -.505, psu);
  anchors.psu = anchor(psu, .52, .16, 0);

  // top cover with vents and brand strip
  const cover = part(); cover.position.y = H / 2 + .015;
  box(W + .02, .03, D, M.metal, 0, 0, 0, cover);
  for (let i = 0; i < 14; i++) box(.04, .006, .5, M.black, -1.9 + i * .16, .016, -.9, cover);
  box(.5, .006, .06, M.orange, -1.6, .016, 1.1, cover);
  anchors.cover = anchor(cover, 1.9, .03, .9);

  const parts = { chassis, pcb, heatsink, ports, bezel, fans, psu, cover };
  return { unit, parts, anchors, leds, rotors };
}
