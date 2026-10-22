import * as T from 'three';
export function makeRoom(scene: T.Scene) {
  const group = new T.Group();
  scene.add(group);
  const box = (
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    color: string,
    roughness = 0.75,
  ) => {
    const m = new T.Mesh(
      new T.BoxGeometry(w, h, d),
      new T.MeshStandardMaterial({ color, roughness }),
    );
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
    return m;
  };
  box(7, 0.18, 5, 0, -0.12, 0, '#b19a7d');
  for (let i = 0; i < 28; i++) box(0.012, 0.005, 5, -3.4 + i * 0.25, -0.024, 0, '#8a725a');
  box(7, 3, 0.16, 0, 1.5, -2.5, '#e0d9ca');
  box(0.16, 3, 5, -3.5, 1.5, 0, '#cbcabe');
  // Real geometry: a cutaway studio, made for Vista3D. No reconstructed AI claims.
  box(2.1, 1.65, 0.05, -1.7, 1.65, -2.39, '#254c51');
  box(1.91, 1.47, 0.07, -1.7, 1.65, -2.34, '#91bbc1');
  box(0.055, 1.55, 0.1, -1.7, 1.65, -2.27, '#f4ecdc');
  box(2, 0.06, 0.1, -1.7, 1.65, -2.26, '#f4ecdc');
  box(2.25, 0.12, 0.3, -1.7, 0.8, -2.2, '#d9c9af');
  box(2.8, 0.33, 1.06, 0.9, 0.32, -1.28, '#35555b');
  box(2.8, 0.72, 0.25, 0.9, 0.78, -1.75, '#3a6265');
  box(0.23, 0.6, 1.1, -0.62, 0.61, -1.3, '#466c6d');
  box(0.23, 0.6, 1.1, 2.42, 0.61, -1.3, '#466c6d');
  for (let i = 0; i < 3; i++) box(0.82, 0.18, 0.79, -0.02 + i * 0.91, 0.57, -1.22, '#628687');
  const pillow = box(0.46, 0.46, 0.18, 1.8, 0.9, -1.43, '#d2b58d');
  pillow.rotation.z = -0.18;
  box(0.44, 0.42, 0.18, 0.04, 0.87, -1.43, '#b5c5b8').rotation.z = 0.16;
  box(3.4, 0.025, 2.2, 0.35, 0.006, 0.65, '#d8cdb6');
  for (let i = 0; i < 13; i++) box(3.3, 0.006, 0.025, 0.35, 0.024, -0.36 + i * 0.16, '#b2a58b');
  const table = new T.Mesh(
    new T.CylinderGeometry(0.72, 0.72, 0.1, 48),
    new T.MeshStandardMaterial({ color: '#85674d', roughness: 0.65 }),
  );
  table.position.set(0.45, 0.59, 0.35);
  table.castShadow = true;
  group.add(table);
  box(0.15, 0.55, 0.15, 0.45, 0.28, 0.35, '#403d36');
  box(0.33, 0.04, 0.25, 0.26, 0.67, 0.34, '#d7d1bc');
  box(0.29, 0.035, 0.23, 0.3, 0.71, 0.36, '#567c78');
  const vase = new T.Mesh(
    new T.CylinderGeometry(0.1, 0.15, 0.27, 20),
    new T.MeshStandardMaterial({ color: '#dcccb6' }),
  );
  vase.position.set(0.8, 0.77, 0.22);
  group.add(vase);
  box(1.05, 0.08, 0.65, -2.5, 0.65, 0.5, '#80654d');
  for (const x of [-2.9, -2.1])
    for (const z of [0.28, 0.72]) box(0.06, 0.65, 0.06, x, 0.32, z, '#393c39');
  box(0.85, 0.05, 0.52, -2.5, 0.73, 0.5, '#38464b');
  box(0.7, 0.5, 0.035, -2.5, 1, 0.28, '#26343c').rotation.x = -0.15;
  for (let i = 0; i < 2; i++) {
    box(0.68, 0.85, 0.07, 0.65 + i * 0.94, 1.93, -2.36, '#745d43');
    box(0.57, 0.74, 0.08, 0.65 + i * 0.94, 1.93, -2.3, i ? '#b7b1a0' : '#9fae9b');
    const art = new T.Mesh(
      new T.CircleGeometry(0.21, 40),
      new T.MeshStandardMaterial({ color: i ? '#476565' : '#ddcbb1' }),
    );
    art.position.set(0.65 + i * 0.94, 1.94, -2.245);
    group.add(art);
  }
  const pot = new T.Mesh(
    new T.CylinderGeometry(0.27, 0.2, 0.48, 24),
    new T.MeshStandardMaterial({ color: '#b9a68a' }),
  );
  pot.position.set(-2.8, 0.24, -1.72);
  pot.castShadow = true;
  group.add(pot);
  for (let i = 0; i < 13; i++) {
    const angle = i * 2.4;
    const leaf = new T.Mesh(
      new T.SphereGeometry(1, 12, 8),
      new T.MeshStandardMaterial({ color: i % 2 ? '#567b59' : '#375b46' }),
    );
    leaf.scale.set(0.17, 0.48, 0.09);
    leaf.position.set(
      -2.8 + Math.cos(angle) * 0.27,
      0.7 + (i % 4) * 0.18,
      -1.72 + Math.sin(angle) * 0.27,
    );
    leaf.rotation.set(Math.sin(angle) * 0.5, angle, Math.cos(angle) * 0.5);
    leaf.castShadow = true;
    group.add(leaf);
  }
  const lamp = new T.Mesh(
    new T.ConeGeometry(0.3, 0.26, 30, 1, true),
    new T.MeshStandardMaterial({ color: '#bdb09a', side: T.DoubleSide }),
  );
  lamp.position.set(2.8, 1.9, -1.85);
  group.add(lamp);
  box(0.035, 1.7, 0.035, 2.8, 0.85, -1.85, '#55564a');
  const grid = new T.GridHelper(24, 48, '#23363c', '#19292e');
  grid.position.y = -0.23;
  scene.add(grid);
  return group;
}
