import fs from 'fs';
import { PNG } from 'pngjs';

// Polyfill ImageData
if (typeof globalThis.ImageData === 'undefined') {
  globalThis.ImageData = class ImageData {
    constructor(w, h) {
      this.width = w;
      this.height = h;
      this.data = new Uint8ClampedArray(w * h * 4);
    }
  };
}

// Minimal 2D FFT & Fourier PSF calculation
function fft1(re, im, inv) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      let t = re[i]; re[i] = re[j]; re[j] = t;
      t = im[i]; im[i] = im[j]; im[j] = t;
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (inv ? 2 : -2) * Math.PI / len;
    const wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k, b = a + len / 2;
        const tr = re[b] * cr - im[b] * ci;
        const ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr;
        im[b] = im[a] - ti;
        re[a] += tr;
        im[a] += ti;
        const nr = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = nr;
      }
    }
  }
  if (inv) {
    for (let i = 0; i < n; i++) {
      re[i] /= n;
      im[i] /= n;
    }
  }
}

function fft2(re, im, w, h, inv) {
  const rr = new Float64Array(w), ri = new Float64Array(w);
  for (let y = 0; y < h; y++) {
    const o = y * w;
    for (let x = 0; x < w; x++) { rr[x] = re[o + x]; ri[x] = im[o + x]; }
    fft1(rr, ri, inv);
    for (let x = 0; x < w; x++) { re[o + x] = rr[x]; im[o + x] = ri[x]; }
  }
  const cr = new Float64Array(h), ci = new Float64Array(h);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) { cr[y] = re[y * w + x]; ci[y] = im[y * w + x]; }
    fft1(cr, ci, inv);
    for (let y = 0; y < h; y++) { re[y * w + x] = cr[y]; im[y * w + x] = ci[y]; }
  }
}

function psfComponent(opts) {
  const { pupilMm, lambdaUm, defocusD, M, N } = opts;
  const re = new Float64Array(N * N), im = new Float64Array(N * N);
  const R = pupilMm / 2, c = N / 2;

  for (let y = 0; y < M; y++) {
    for (let x = 0; x < M; x++) {
      const px = (x + 0.5 - M / 2) / (M / 2);
      const py = (y + 0.5 - M / 2) / (M / 2);
      const r = Math.hypot(px, py);
      if (r > 1) continue;
      let w = defocusD * R * R * r * r / 2;
      const ph = 2 * Math.PI * w / lambdaUm;
      const i = ((y - M / 2 + c + N) % N) * N + ((x - M / 2 + c + N) % N);
      re[i] = Math.cos(ph);
      im[i] = Math.sin(ph);
    }
  }

  fft2(re, im, N, N, false);

  const out = new Float64Array(N * N);
  let sum = 0;
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const v = re[y * N + x] ** 2 + im[y * N + x] ** 2;
      out[((y + c) % N) * N + ((x + c) % N)] = v;
      sum += v;
    }
  }
  if (sum > 0) {
    for (let i = 0; i < out.length; i++) out[i] /= sum;
  }
  return out;
}

function psfForLayer(opts) {
  const { pupilMm, lambdaUm, vergenceD, foci, radPerPx, isNatural } = opts;
  const needRad = 0.05;
  const M = Math.min(512, Math.max(64, 2 ** Math.ceil(Math.log2(needRad * pupilMm * 1e-3 / (lambdaUm * 1e-6)))));
  const N = 2 * M;
  const dA = (lambdaUm * 1e-6) * M / (N * pupilMm * 1e-3);
  const acc = new Float64Array(N * N);
  let wsum = 0;

  for (const f of foci) {
    const rawDefocus = vergenceD - f.addD;
    const defocusD = isNatural ? 0 : rawDefocus;
    const absDefocus = Math.abs(defocusD);

    const neuralGain = absDefocus <= 0.45 ? (1.0 + 2.5 * Math.cos((Math.PI / 2) * (absDefocus / 0.45))) : 1.0;
    const effectiveWeight = f.weight * neuralGain;

    const p = psfComponent({ pupilMm, lambdaUm, defocusD, M, N });
    for (let i = 0; i < acc.length; i++) acc[i] += effectiveWeight * p[i];
    wsum += effectiveWeight;
  }

  const half = Math.ceil((N * dA / 2) / radPerPx);
  const size = 2 * half + 1;
  const k = new Float64Array(size * size);

  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const bx = Math.round((x - N / 2) * dA / radPerPx) + half;
      const by = Math.round((y - N / 2) * dA / radPerPx) + half;
      if (bx >= 0 && by >= 0 && bx < size && by < size) {
        k[by * size + bx] += acc[y * N + x];
      }
    }
  }
  let s = 0;
  for (let i = 0; i < k.length; i++) s += k[i];
  if (s > 0) {
    for (let i = 0; i < k.length; i++) k[i] /= s;
  }
  return { k, size };
}

const pow2 = (n) => 2 ** Math.ceil(Math.log2(n));

function convolve(planes, w, h, k, size) {
  const half = (size - 1) / 2;
  const W = pow2(w + size);
  const H = pow2(h + size);
  const kr = new Float64Array(W * H);
  const ki = new Float64Array(W * H);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      kr[((y - half + H) % H) * W + ((x - half + W) % W)] = k[y * size + x];
    }
  }
  fft2(kr, ki, W, H, false);

  const out = [];
  for (const [a, b] of [[0, 1], [2, 3]]) {
    const re = new Float64Array(W * H);
    const im = new Float64Array(W * H);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        re[y * W + x] = planes[a][y * w + x];
        im[y * W + x] = planes[b][y * w + x];
      }
    }
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (y < h && x < w) continue;
        const sx = x < w ? x : (x < w + (W - w) / 2 ? w - 1 : 0);
        const sy = y < h ? y : (y < h + (H - h) / 2 ? h - 1 : 0);
        re[y * W + x] = planes[a][sy * w + sx];
        im[y * W + x] = planes[b][sy * w + sx];
      }
    }
    fft2(re, im, W, H, false);
    for (let i = 0; i < W * H; i++) {
      const r = re[i] * kr[i] - im[i] * ki[i];
      im[i] = re[i] * ki[i] + im[i] * kr[i];
      re[i] = r;
    }
    fft2(re, im, W, H, true);
    const pa = new Float32Array(w * h);
    const pb = new Float32Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        pa[y * w + x] = re[y * W + x];
        pb[y * w + x] = im[y * W + x];
      }
    }
    out.push(pa, pb);
  }
  return out;
}

// Read near layer PNG
const nearBuf = fs.readFileSync('public/assets/layers/day_near_phone_bill.png');
const nearPng = PNG.sync.read(nearBuf);
const { width: w, height: h } = nearPng;

const toLin = new Float32Array(256);
for (let i = 0; i < 256; i++) {
  const c = i / 255;
  toLin[i] = c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}
const toSrgb = (v) => {
  v = Math.min(1, Math.max(0, v));
  return Math.round(255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055));
};

const rawPlanes = [0, 1, 2, 3].map(() => new Float32Array(w * h));
for (let i = 0; i < w * h; i++) {
  const a = nearPng.data[i * 4 + 3] / 255;
  for (let c = 0; c < 3; c++) {
    rawPlanes[c][i] = toLin[nearPng.data[i * 4 + c]] * a;
  }
  rawPlanes[3][i] = a;
}

const radPerPx = (50 * Math.PI / 180) / w;
const vergenceD = 1 / 0.40; // 2.50 D

const lensTests = [
  { id: 'natural_eye', isNatural: true, foci: [{ addD: 0, weight: 1 }] },
  { id: 'monofocal', isNatural: false, foci: [{ addD: 0, weight: 1 }] },
  { id: 'trifocal', isNatural: false, foci: [{ addD: 0, weight: 0.44 }, { addD: 1.68, weight: 0.22 }, { addD: 2.51, weight: 0.22 }] },
  { id: 'aphakic', isNatural: false, foci: [{ addD: -11, weight: 1 }] },
];

for (const lt of lensTests) {
  const psf = psfForLayer({
    pupilMm: 3.0,
    lambdaUm: 0.555,
    vergenceD,
    foci: lt.foci,
    radPerPx,
    isNatural: lt.isNatural,
  });

  const planesCopy = rawPlanes.map(p => new Float32Array(p));
  const convolved = convolve(planesCopy, w, h, psf.k, psf.size);

  const cropW = 360;
  const cropH = 200;
  const cropPng = new PNG({ width: cropW, height: cropH });

  let sum = 0, sumSq = 0, count = 0;
  for (let cy = 0; cy < cropH; cy++) {
    for (let cx = 0; cx < cropW; cx++) {
      const srcX = 500 + cx;
      const srcY = 320 + cy;
      const srcIdx = srcY * w + srcX;
      const outIdx = (cy * cropW + cx) * 4;
      const r = toSrgb(convolved[0][srcIdx]);
      const g = toSrgb(convolved[1][srcIdx]);
      const b = toSrgb(convolved[2][srcIdx]);
      const a = Math.round(convolved[3][srcIdx] * 255);
      cropPng.data[outIdx] = r;
      cropPng.data[outIdx + 1] = g;
      cropPng.data[outIdx + 2] = b;
      cropPng.data[outIdx + 3] = a;

      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      sum += lum;
      sumSq += lum * lum;
      count++;
    }
  }

  const mean = sum / count;
  const variance = sumSq / count - mean * mean;
  console.log(`Lens ${lt.id}: crop luminance mean=${mean.toFixed(1)}, variance (sharpness)=${variance.toFixed(1)}`);
  fs.writeFileSync(`public/crop_${lt.id}.png`, PNG.sync.write(cropPng));
}
console.log('Saved test crops in public/');
