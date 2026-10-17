import { gsap } from 'gsap';

/**
 * Scroll story: one chapter per `.ch` article in the HTML.
 * In each chapter the previous paragraph slides out, the next one rises in,
 * and the model moves to its next pose. Order here must match the HTML.
 */
export function buildTimeline({ chapters, callouts, sw, rack, stage, reduced }) {
  const { unit, parts: p } = sw;
  const { product, shadow, cam } = stage;

  const tl = gsap.timeline({ paused: reduced, defaults: { ease: 'power2.inOut', duration: 1.4 } });
  gsap.set(chapters.slice(1), { autoAlpha: 0, y: 48 });

  const moving = Object.values(p);
  const home = new Map(moving.map((part) => [part, part.position.clone()])); // assembled positions
  const rackState = { o: 0 }, cableState = { p: 0 };

  let n = 0;
  function chapter(move, hold = 2.3) {
    const i = n++, at = 'c' + i;
    tl.addLabel(at);
    if (i > 0) {
      tl.to(chapters[i - 1], { autoAlpha: 0, y: -48, duration: .5, ease: 'power1.in' }, at)
        .to(chapters[i], { autoAlpha: 1, y: 0, duration: .7, ease: 'power2.out' }, at + '+=.4');
    }
    move(at);
    tl.to({}, { duration: .01 }, at + '+=' + hold); // pause so the paragraph can be read
  }

  // 01 The NX-24 — turns into view
  chapter((at) => tl
    .fromTo(product.rotation, { y: -2.3 }, { y: -.55, ease: 'power2.out' }, at)
    .fromTo(product.scale, { x: .82, y: .82, z: .82 }, { x: 1, y: 1, z: 1 }, at));

  // 02 Enclosure — the lid lifts off
  chapter((at) => tl
    .to(p.cover.position, { y: '+=1.9' }, at)
    .to(product.rotation, { y: -.8 }, at)
    .to(cam, { height: 4.6, dist: 11.8, lookY: .8 }, at));

  // 03 Cooling — heatsink rises, fans slide out, turn to the rear
  chapter((at) => tl
    .to(p.heatsink.position, { y: '+=1.15' }, at)
    .to(p.fans.position, { z: '-=1.05', y: '+=.15' }, at + '+=.15')
    .to(product.rotation, { y: -2.15 }, at)
    .to(cam, { height: 4.2, dist: 11.5 }, at));

  // 04 Mainboard — board lifts off the chassis, look down onto it
  chapter((at) => tl
    .to(p.pcb.position, { y: '+=.3' }, at)
    .to(p.chassis.position, { y: '-=.55' }, at)
    .to(product.rotation, { y: -.5 }, at)
    .to(cam, { height: 6.2, dist: 11.4, lookY: .6 }, at));

  // 05 Ports — ports and front bezel slide forward, front view
  chapter((at) => tl
    .to(p.ports.position, { z: '+=.95', y: '+=.25' }, at)
    .to(p.bezel.position, { z: '+=1.65' }, at + '+=.1')
    .to(product.rotation, { y: -.12 }, at)
    .to(cam, { height: 2.7, dist: 10, lookY: .35 }, at));

  // 06 Power — power supply rises out the back
  chapter((at) => tl
    .to(p.psu.position, { y: '+=.75', z: '-=.35' }, at)
    .to(product.rotation, { y: -1.05 }, at)
    .to(cam, { height: 4.4, dist: 11.8, lookY: .8 }, at));

  // 07 All layers — labels on, slow turn
  chapter((at) => tl
    .to(callouts, { opacity: 1, stagger: .1, duration: .3 }, at + '+=.3')
    .to(product.rotation, { y: .45, duration: 2.2, ease: 'none' }, at)
    .to(cam, { height: 4.8, dist: 11, lookY: .7 }, at)
    .to(callouts, { opacity: 0, duration: .3 }, at + '+=2'));

  // 08 Ready to deploy — back together
  chapter((at) => {
    tl.to(product.rotation, { y: -.32 }, at).to(cam, { height: 2.9, dist: 9.4, lookY: .2 }, at);
    moving.forEach((part) => { const o = home.get(part); tl.to(part.position, { x: o.x, y: o.y, z: o.z }, at); });
  });

  // 09 Installation — pulled out, rack fades in, slides into its slot, cables go in
  chapter((at) => tl
    .to(unit.position, { z: 3.2, duration: .9, ease: 'power2.out' }, at)
    .to(shadow.material, { opacity: 0, duration: .6 }, at)
    .to(rackState, { o: 1, duration: 1, onUpdate: () => rack.setOpacity(rackState.o) }, at + '+=.3')
    .to(product.rotation, { y: -.6, duration: 1.6 }, at)
    .to(cam, { height: 3.4, dist: 15.5, lookY: -.1, duration: 1.6 }, at)
    .to(unit.position, { z: 0, duration: 1.1, ease: 'power3.inOut' }, at + '+=1.2')
    .to(cableState, { p: 1, duration: .9, ease: 'none', onUpdate: () => rack.setCables(cableState.p) }, at + '+=2.2')
    .to(cam, { height: 2.6, dist: 13.5, lookY: .1, duration: 1.3 }, at + '+=2.1')
    .to(product.rotation, { y: -.42, duration: 1.3 }, at + '+=2.1'), 3.6);

  const starts = chapters.map((_, i) => tl.labels['c' + i]);
  /** Index of the chapter shown at timeline progress p (0…1). */
  const chapterAt = (prog) => {
    const t = prog * tl.duration();
    let i = 0; starts.forEach((s, k) => { if (t >= s + .3) i = k; });
    return i;
  };

  return { tl, chapterAt };
}
