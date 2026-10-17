import * as THREE from 'three';

const v = new THREE.Vector3();

/**
 * Pins each `.callout[data-part]` label to its 3D anchor.
 * Parts left of the product centre get their label on the left.
 */
export function updateCallouts({ callouts, anchors, product, camera, stageEl, force }) {
  const w = stageEl.clientWidth, h = stageEl.clientHeight;
  const centreX = (product.getWorldPosition(v).project(camera).x * .5 + .5) * w;
  callouts.forEach((el) => {
    if (!force && +el.style.opacity === 0) return; // hidden: skip the work
    anchors[el.dataset.part].getWorldPosition(v).project(camera);
    const x = (v.x * .5 + .5) * w;
    el.classList.toggle('flip', x < centreX);
    el.style.transform = `translate(${x}px, ${(-v.y * .5 + .5) * h}px)`;
  });
}
