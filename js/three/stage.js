import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const HEADER_H = 64;     // sticky header height in px
const SIDE_BY_SIDE = 760; // above this width: text left, model right

/**
 * Renderer, scene, lights and a camera that keeps the model inside the area
 * the chapter text doesn't cover.
 */
export function createStage(canvas, stageEl) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;

  const key = new THREE.DirectionalLight(0xffffff, 1.2); key.position.set(4, 6, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xfe5b2a, 1.6); rim.position.set(-5, 2, -5); scene.add(rim);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

  /** Animated by the timeline: distance, height and look-at height of the camera. */
  const cam = { dist: 10.5, height: 3.6, lookY: .35 };
  let fit = 1;

  // soft round shadow under the product
  const product = new THREE.Group();
  scene.add(product);
  const shadow = makeShadow();
  product.add(shadow);

  function resize() {
    const w = stageEl.clientWidth, h = stageEl.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;

    const left = stageEl.getBoundingClientRect().left;
    const texts = [...stageEl.querySelectorAll('.ch')];
    let rw = w, rh = h - HEADER_H, cx = w / 2, cy = (HEADER_H + h) / 2;
    if (w > SIDE_BY_SIDE) {
      const textRight = Math.max(...texts.map((t) => t.getBoundingClientRect().right)) - left + 32;
      rw = w - textRight; cx = textRight + rw / 2;
    } else {
      const textH = Math.max(...texts.map((t) => t.offsetHeight)) + 92 + 24;
      rh = Math.max(h - HEADER_H - textH, h * .3); cy = HEADER_H + rh / 2;
    }
    fit = Math.max(h / rh, 1.1 * h / rw) * .78;              // lower = bigger model
    camera.setViewOffset(w, h, w / 2 - cx, h / 2 - cy, w, h); // centre the model in its free area
    camera.updateProjectionMatrix();
  }

  function render() {
    camera.position.set(0, cam.height * fit, cam.dist * fit);
    camera.lookAt(0, cam.lookY, 0);
    renderer.render(scene, camera);
  }

  resize();
  addEventListener('resize', resize);
  document.fonts?.ready.then(resize);

  return { scene, camera, product, shadow, cam, render };
}

function makeShadow() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(0,0,0,.55)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 4.5),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -1.1;
  return mesh;
}
