// One-off: render the Food Mood splash mark (5 mood orbs) as a tightly-cropped
// TRANSPARENT PNG so it centres on the cream splash background. Pure Node.
const fs = require('fs');
const zlib = require('zlib');

const SS = 2;
const ORBS = [
  [244, 228, 193], // energetic
  [201, 168, 118], // focused
  [168, 184, 160], // calm
  [122, 143, 163], // bloated
  [139, 79, 92],   // sluggish
];

const r = 80 * SS;
const gap = 22 * SS;
const padX = 30 * SS;
const padY = 30 * SS;
const W = Math.round(ORBS.length * 2 * r + (ORBS.length - 1) * gap + 2 * padX);
const H = Math.round(2 * r + 2 * padY);
const cy = H / 2;
const x0 = padX + r;
const centers = ORBS.map((_, i) => x0 + i * (2 * r + gap));

const mix = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

const big = Buffer.alloc(W * H * 4); // RGBA
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    let cr = 0, cg = 0, cb = 0, ca = 0;
    for (let i = 0; i < ORBS.length; i++) {
      const dx = x - centers[i], dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const cov = clamp(r + 0.5 - dist, 0, 1);
      if (cov <= 0) continue;
      const base = ORBS[i];
      const ty = (y - (cy - r)) / (2 * r);
      const h = 0.26 * Math.max(0, 1 - ty * 1.55);
      let R = mix(base[0], 255, h), G = mix(base[1], 255, h), B = mix(base[2], 255, h);
      const sh = 0.07 * Math.max(0, (ty - 0.72) / 0.28);
      R = mix(R, base[0] * 0.86, sh); G = mix(G, base[1] * 0.86, sh); B = mix(B, base[2] * 0.86, sh);
      const rimT = clamp((dist - (r - 2 * SS)) / (2 * SS), 0, 1) * 0.5;
      R = mix(R, base[0] * 0.82, rimT); G = mix(G, base[1] * 0.82, rimT); B = mix(B, base[2] * 0.82, rimT);
      cr = R; cg = G; cb = B; ca = cov; // orbs don't overlap, last wins
    }
    const o = (y * W + x) * 4;
    big[o] = clamp(Math.round(cr), 0, 255);
    big[o + 1] = clamp(Math.round(cg), 0, 255);
    big[o + 2] = clamp(Math.round(cb), 0, 255);
    big[o + 3] = clamp(Math.round(ca * 255), 0, 255);
  }
}

// downsample SSxSS
const OW = W / SS, OH = H / SS;
const out = Buffer.alloc(OW * OH * 4);
for (let y = 0; y < OH; y++) {
  for (let x = 0; x < OW; x++) {
    let R = 0, G = 0, B = 0, A = 0;
    for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
      const o = ((y * SS + sy) * W + (x * SS + sx)) * 4;
      R += big[o]; G += big[o + 1]; B += big[o + 2]; A += big[o + 3];
    }
    const n = SS * SS, o = (y * OW + x) * 4;
    out[o] = Math.round(R / n); out[o + 1] = Math.round(G / n); out[o + 2] = Math.round(B / n); out[o + 3] = Math.round(A / n);
  }
}

// PNG encode RGBA
const crcTable = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (b) => { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = crcTable[(c ^ b[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0); const t = Buffer.from(type, 'ascii'); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0); return Buffer.concat([len, t, data, crc]); };
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(OW, 0); ihdr.writeUInt32BE(OH, 4); ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
const raw = Buffer.alloc(OH * (OW * 4 + 1));
for (let y = 0; y < OH; y++) { raw[y * (OW * 4 + 1)] = 0; out.copy(raw, y * (OW * 4 + 1) + 1, y * OW * 4, (y + 1) * OW * 4); }
const idat = zlib.deflateSync(raw, { level: 9 });
const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const png = Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
fs.writeFileSync('assets/images/splash-icon.png', png);
console.log('wrote assets/images/splash-icon.png', OW + 'x' + OH, png.length, 'bytes');
