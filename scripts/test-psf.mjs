// Diagnose PSF kernels and contrast washout
function sinc2(x) {
  return x === 0 ? 1 : Math.pow(Math.sin(Math.PI * x) / (Math.PI * x), 2);
}

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

function calcPsf(foci, vergenceD, pupilMm = 3.0, lambdaUm = 0.555, radPerPx = (50 * Math.PI / 180) / 960) {
  const adds = foci.map(f => Math.abs(vergenceD - f.addD));
  const extentRad = Math.min(0.08, pupilMm * 1e-3 * Math.max(...adds, 0.5) * 1.3 + 0.004);
  const M = Math.min(512, Math.max(64, 2 ** Math.ceil(Math.log2(extentRad * pupilMm * 1e-3 / (lambdaUm * 1e-6)))));
  const N = 2 * M;
  const dA = (lambdaUm * 1e-6) * M / (N * pupilMm * 1e-3);
  const acc = new Float64Array(N * N);

  for (const f of foci) {
    const p = psfComponent({ pupilMm, lambdaUm, defocusD: vergenceD - f.addD, M, N });
    for (let i = 0; i < acc.length; i++) acc[i] += f.weight * p[i];
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
  return { size, k };
}

const tests = [
  { name: 'Monofocal (add 0)', foci: [{ addD: 0, weight: 1 }] },
  { name: 'EDOF (Symfony)', foci: [{ addD: 0, weight: 0.58 }, { addD: 1.05, weight: 0.24 }, { addD: 1.75, weight: 0.18 }] },
  { name: 'Trifocal (PanOptix)', foci: [{ addD: 0, weight: 0.44 }, { addD: 1.68, weight: 0.22 }, { addD: 2.51, weight: 0.22 }] },
  { name: 'Aphakic (+11D)', foci: [{ addD: -11, weight: 1 }] },
];

console.log('--- TEST AT NEAR (0.40m = 2.50D) ---');
for (const t of tests) {
  const res = calcPsf(t.foci, 2.50);
  const centerIdx = Math.floor(res.size / 2) * res.size + Math.floor(res.size / 2);
  const centerWeight = res.k[centerIdx];
  // Calculate energy in central 3x3
  const half = Math.floor(res.size / 2);
  let central3x3 = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      central3x3 += res.k[(half + dy) * res.size + (half + dx)];
    }
  }
  console.log(`${t.name}: size=${res.size}px, center=${centerWeight.toFixed(5)}, central 3x3=${central3x3.toFixed(4)}`);
}

console.log('\n--- TEST AT FAR (10m = 0.10D) ---');
for (const t of tests) {
  const res = calcPsf(t.foci, 0.10);
  const half = Math.floor(res.size / 2);
  let central3x3 = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      central3x3 += res.k[(half + dy) * res.size + (half + dx)];
    }
  }
  console.log(`${t.name}: size=${res.size}px, central 3x3=${central3x3.toFixed(4)}`);
}
