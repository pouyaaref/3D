// Original deterministic synthetic Gaussian fixture, authored for Vista3D. MIT.
// It is a genuine binary Gaussian PLY, not a reconstruction or a photo plane.
export function gaussianPly() {
  const fields = [
    'x',
    'y',
    'z',
    'nx',
    'ny',
    'nz',
    'f_dc_0',
    'f_dc_1',
    'f_dc_2',
    'opacity',
    'scale_0',
    'scale_1',
    'scale_2',
    'rot_0',
    'rot_1',
    'rot_2',
    'rot_3',
  ];
  const n = 800;
  const header = `ply\nformat binary_little_endian 1.0\nelement vertex ${n}\n${fields.map((f) => `property float ${f}\n`).join('')}end_header\n`;
  const h = new TextEncoder().encode(header);
  const data = new Uint8Array(h.length + n * fields.length * 4);
  data.set(h);
  const v = new DataView(data.buffer);
  for (let i = 0; i < n; i++) {
    const a = i * 2.399963229728653;
    const y = 1 - (2 * (i + 0.5)) / n;
    const r = Math.sqrt(1 - y * y);
    const values = [
      r * Math.cos(a),
      y,
      r * Math.sin(a),
      0,
      0,
      0,
      Math.cos(a) * 0.8,
      y * 0.8,
      0.6,
      4,
      -2.6,
      -2.6,
      -2.6,
      1,
      0,
      0,
      0,
    ];
    values.forEach((value, j) => v.setFloat32(h.length + (i * fields.length + j) * 4, value, true));
  }
  return data;
}
export function triangleGlb() {
  const json = {
    asset: { version: '2.0', generator: 'Vista3D test' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 }, material: 0 }] }],
    materials: [
      {
        doubleSided: true,
        pbrMetallicRoughness: {
          baseColorFactor: [0.15, 0.8, 0.7, 1],
          metallicFactor: 0,
          roughnessFactor: 0.5,
        },
      },
    ],
    buffers: [{ byteLength: 36 }],
    bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: 36, target: 34962 }],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: 3,
        type: 'VEC3',
        max: [1, 1, 0],
        min: [-1, -1, 0],
      },
    ],
  };
  const text = new TextEncoder().encode(JSON.stringify(json));
  const jsonLength = Math.ceil(text.length / 4) * 4;
  const data = new Uint8Array(12 + 8 + jsonLength + 8 + 36);
  const v = new DataView(data.buffer);
  v.setUint32(0, 0x46546c67, true);
  v.setUint32(4, 2, true);
  v.setUint32(8, data.length, true);
  v.setUint32(12, jsonLength, true);
  v.setUint32(16, 0x4e4f534a, true);
  data.fill(32, 20, 20 + jsonLength);
  data.set(text, 20);
  v.setUint32(20 + jsonLength, 36, true);
  v.setUint32(24 + jsonLength, 0x004e4942, true);
  [-1, -1, 0, 1, -1, 0, 0, 1, 0].forEach((x, i) => v.setFloat32(28 + jsonLength + i * 4, x, true));
  return data;
}
