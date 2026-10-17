import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger.js';
import { createStage } from './three/stage.js';
import { buildSwitch } from './three/switch.js';
import { buildRack } from './three/rack.js';
import { buildTimeline } from './timeline.js';
import { updateCallouts } from './callouts.js';
import { initContactForm } from './form.js';

gsap.registerPlugin(ScrollTrigger);
initContactForm(document.getElementById('form'), document.getElementById('sent'));

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const stageEl = document.getElementById('product');
const chapters = gsap.utils.toArray('.ch', stageEl);
const callouts = gsap.utils.toArray('.callout', stageEl);
const stepEl = document.getElementById('step');
const barEl = document.getElementById('bar');

// 3D scene: the switch plus the rack it gets mounted in
const stage = createStage(document.getElementById('scene'), stageEl);
const sw = buildSwitch();
const rack = buildRack();
stage.product.add(sw.unit, rack.rack);

const { tl, chapterAt } = buildTimeline({ chapters, callouts, sw, rack, stage, reduced });

function showProgress(p) {
  const i = chapterAt(p);
  stepEl.innerHTML = `<small>[ 0${i + 1} / 0${chapters.length} ]</small>${chapters[i].dataset.name}`;
  barEl.style.transform = `scaleX(${p})`;
}

if (reduced) {
  // No scroll animation: show the labelled exploded view.
  tl.progress((tl.labels.c6 + 1.2) / tl.duration());
  showProgress(tl.progress());
} else {
  ScrollTrigger.create({
    trigger: stageEl,
    start: 'top top',
    end: '+=' + chapters.length * 950, // px of scrolling for the whole story
    pin: true,
    scrub: 1,
    animation: tl,
    onUpdate: (self) => showProgress(self.progress),
  });
}
document.getElementById('loading').style.opacity = 0;

// render loop: spin fans, blink port lights, draw, move labels
gsap.ticker.add((time) => {
  if (!reduced) sw.rotors.forEach((r, i) => { r.rotation.z -= .12 + i * .01; });
  sw.leds.forEach((l) => { l.material.emissiveIntensity = Math.sin(time * 9 + l.userData.phase * 3) > .2 ? 1.6 : .2; });
  stage.render();
  updateCallouts({ callouts, anchors: sw.anchors, product: stage.product, camera: stage.camera, stageEl, force: reduced });
});
