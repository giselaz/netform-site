import * as THREE from 'three';

/** Standard PBR material shorthand. */
export const std = (opts) => new THREE.MeshStandardMaterial(opts);

/** Add a box mesh to `parent` at (x, y, z) and return it. */
export function box(w, h, d, mat, x, y, z, parent) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

/** Invisible point used to pin an HTML label to a spot on a part. */
export function anchor(parent, x, y, z) {
  const a = new THREE.Object3D();
  a.position.set(x, y, z);
  parent.add(a);
  return a;
}
