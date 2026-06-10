// One-off: render the Food Mood app icon (5 mood orbs) as a 1024x1024 opaque PNG.
// Pure Node (no deps): supersampled circle rasteriser + manual PNG encoder.
const fs = require('fs');
const zlib = require('zlib');

const SIZE = 1024;
const SS = 2; // supersample factor
const W = SIZE * SS;

const BG = [250, 248, 244]; // #FAF8F4
const ORBS = [
  [244, 228, 193], // energetic  #F4E4C1
  [201, 168, 118], // focused    #C9A876
  [168, 184, 160], // calm       #A8B8A0
  [122, 143, 163], // contemplative/bloated #7A8FA3
  [139, 79, 92],   // sluggish   #8B4F5C
];

const r = 86 * SS;       // orb radius
const gap = 20 * SS;     // gap between orbs
const cy = (SIZE / 2) * SS;
const rowW = ORBS.length * 2 * r + (ORBS.length - 1) * gap;
const startX = (W - rowW) / 2 + r;
const centers = ORBS.map((_, i) => startX + i * (2 * r + gap));

const mix = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

// supersampled RGB buffer
const buf = Buffer.alloc(W * W * 3);
for (let y = 0; y < W; y++) {
  for (let x = 0; x < W; x++) {
    let R = BG[0], G = BG[1], B = BG[2];
    for (let i = 0; i < ORBS.length; i++) {
      const cx = centers[i];
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const cov = clamp(r + 0.5 - dist, 0, 1);
      if (cov <= 0) continue;
      const base = ORBS[i];
      const ty = (y - (cy - r)) / (2 * r); // 0 top → 1 bottom
      // soft top sheen (lighten toward white near the top)
      const h = 0.26 * Math.max(0, 1 - ty * 1.55);
      let cr = mix(base[0], 255, h);
      let cg = mix(base[1], 255, h);
      let cb = mix(base[2], 255, h);
      // faint settle at the very bottom
      const sh = 0.07 * Math.max(0, (ty - 0.72) / 0.28);
      cr = mix(cr, base[0] * 0.86, sh);
      cg = mix(cg, base[1] * 0.86, sh);
      cb = mix(cb, base[2] * 0.86, sh);
      // subtle edge rim for definition
      const rimT = clamp((dist - (r - 2 * SS)) / (2 * SS), 0, 1) * 0.5;
      cr = mix(cr, base[0] * 0.82, rimT);
      cg = mix(cg, base[1] * 0.82, rimT);
      cb = mix(cb, base[2] * 0.82, rimT);
      R = mix(R, cr, cov);
      G = mix(G, cg, cov);
      B = mix(B, cb, cov);
    }
    const o = (y * W + x) * 3;
    buf[o] = clamp(Math.round(R), 0, 255);
    buf[o + 1] = clamp(Math.round(G), 0, 255);
    buf[o + 2] = clamp(Math.round(B), 0, 255);
  }
}

// downsample SSxSS → SIZE (box filter)
const out = Buffer.alloc(SIZE * SIZE * 3);
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    let R = 0, G = 0, B = 0;
    for (let sy = 0; sy < SS; sy++) {
      for (let sx = 0; sx < SS; sx++) {
        const o = ((y * SS + sy) * W + (x * SS + sx)) * 3;
        R += buf[o]; G += buf[o + 1]; B += buf[o + 2];
      }
    }
    const n = SS * SS;
    const o = (y * SIZE + x) * 3;
    out[o] = Math.round(R / n);
    out[o + 1] = Math.round(G / n);
    out[o + 2] = Math.round(B / n);
  }
}

// ---- PNG encode (RGB, 8-bit, no alpha) ----
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
const crc32 = (b) => {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = crcTable[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
};

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0); ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

// add per-row filter byte (0)
const raw = Buffer.alloc(SIZE * (SIZE * 3 + 1));
for (let y = 0; y < SIZE; y++) {
  raw[y * (SIZE * 3 + 1)] = 0;
  out.copy(raw, y * (SIZE * 3 + 1) + 1, y * SIZE * 3, (y + 1) * SIZE * 3);
}
const idat = zlib.deflateSync(raw, { level: 9 });
const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const png = Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);

fs.writeFileSync('assets/images/icon.png', png);
console.log('wrote assets/images/icon.png', png.length, 'bytes', SIZE + 'x' + SIZE);
