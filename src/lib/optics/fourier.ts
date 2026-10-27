// Fourier-optics image formation (scalar, monochromatic, incoherent) with
// Stage 2 MTFa psychophysical metrics, neural contrast constancy, and Stage 3 Clinical Defocus Reconciliation.
//
// Units: D in 1/m, radii in mm, wavelength and OPD in um.
// W[um] = D * rho[mm]^2 / 2   (the 1e-3 * 1e3 unit factors cancel).

import { interpolateLogMar } from '../data/defocusCurves';

export interface OpticalModel {
  kind: string;
  lensId?: string;
  label: string;
  foci: Array<{ addD: number; weight: number }>;
  assumptions: string[];
  radialOpd?: {
    lambdaUm: number;
    sign: number;
    rMm: number[];
    waves: number[];
  };
  kinoform?: { addD: number; stepWaves: number };
  diffractiveZoneMm?: number;
  higherOrderVeilWeight?: number;
  pupilToIolScale?: number;
  focusPerPupil?: boolean;
  focusOffsetD?: number;
  version?: {
    modelVersion: string;
    date: string;
    derivedFrom: string;
    changes?: string;
  };
}

export interface PsfResult {
  k: Float64Array;
  size: number;
  transmitted: number;
  psfPhysical?: Float64Array; // Pristine physical scalar diffraction PSF for emissive headlights
}

// In-place radix-2 complex FFT on separate re/im Float64Arrays
export function fft1(re: Float64Array, im: Float64Array, inv: boolean): void {
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

// 2D FFT on row-major arrays of size w*h (both powers of two)
export function fft2(re: Float64Array, im: Float64Array, w: number, h: number, inv: boolean): void {
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

// Lens wavefront (um) at IOL-plane radius rMm: linear interpolation of a measured radial OPD profile
export function lensWavefront(model: OpticalModel, rMm: number): number {
  const p = model.radialOpd;
  if (!p) return 0;
  const rs = p.rMm, n = rs.length;
  if (rMm >= rs[n - 1]) return p.waves[n - 1] * p.lambdaUm * p.sign;
  let i = 1;
  while (i < n && rs[i] < rMm) i++;
  if (i >= n) return p.waves[n - 1] * p.lambdaUm * p.sign;
  const f = (rMm - rs[i - 1]) / (rs[i] - rs[i - 1]);
  return (p.waves[i - 1] + f * (p.waves[i] - p.waves[i - 1])) * p.lambdaUm * p.sign;
}

/**
 * Ideal blazed-diffractive OPD (um) at IOL-plane radius rhoMm.
 * h = 1 reproduces a perfect +addD lens in order 1; h = 0.5 gives the 40.5 / 40.5 % bifocal.
 * Sign convention matches defocus: a +add lens contributes -addD*rho^2/2.
 */
export function kinoformWavefront(addD: number, stepWaves: number, rhoMm: number, lambdaUm: number): number {
  const u = (addD * rhoMm * rhoMm) / (2 * lambdaUm); // parabolic OPD in waves
  const frac = ((-u) % 1 + 1) % 1;
  return stepWaves * frac * lambdaUm;
}

/**
 * Foci actually used for PSF synthesis.
 * - natural eye / continuous / kinoform: a single focus; add power lives in the OPD.
 * - discrete-focus lenses: listed foci, with pupil-area weighting outside diffractiveZoneMm.
 */
export function effectiveFoci(lens: OpticalModel, pupilMm: number): Array<{ addD: number; weight: number }> {
  if (lens.kind === 'natural-reference' || lens.radialOpd || lens.kinoform) {
    return [{ addD: 0, weight: 1 }];
  }
  const foci = lens.foci && lens.foci.length ? lens.foci : [{ addD: 0, weight: 1 }];
  const s = lens.pupilToIolScale ? 1 / lens.pupilToIolScale : 1;
  const R_iol = (pupilMm / 2) * s;
  const zone = lens.diffractiveZoneMm;
  if (!zone || R_iol <= zone) return foci;

  // Pupil area fraction inside diffractive zone
  const inner = Math.min(1, (zone / R_iol) ** 2);
  const total = foci.reduce((s, f) => s + f.weight, 0);
  const out = foci.map((f) => ({ addD: f.addD, weight: f.weight * inner }));
  const dist = out.find((f) => Math.abs(f.addD) < 0.05);
  if (dist) dist.weight += total * (1 - inner);
  else out.push({ addD: 0, weight: total * (1 - inner) });
  return out;
}

// Monochromatic PSF for one focus component
export function psfComponent(opts: {
  pupilMm: number;
  lambdaUm: number;
  defocusD: number;
  lens: OpticalModel;
  M: number;
  N: number;
}): Float64Array {
  const { pupilMm, lambdaUm, defocusD, lens, M, N } = opts;
  const re = new Float64Array(N * N), im = new Float64Array(N * N);
  const R = pupilMm / 2, c = N / 2;
  const s = lens.pupilToIolScale ? 1 / lens.pupilToIolScale : 1;

  for (let y = 0; y < M; y++) {
    for (let x = 0; x < M; x++) {
      const px = (x + 0.5 - M / 2) / (M / 2);
      const py = (y + 0.5 - M / 2) / (M / 2);
      const r = Math.hypot(px, py);
      if (r > 1) continue;
      // Defocus OPD (um) = D * R^2 * r^2 / 2
      let w = (defocusD * R * R * r * r) / 2;
      const rho = r * R * s;
      if (lens.radialOpd) w += lensWavefront(lens, rho);
      if (lens.kinoform) w += kinoformWavefront(lens.kinoform.addD, lens.kinoform.stepWaves, rho, lambdaUm);
      const ph = (2 * Math.PI * w) / lambdaUm;
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

// Composite multi-focus MTF at a given spatial frequency (cycles/rad) averaged over x and y (RC-2 fix)
export function mtfAt(
  opts: {
    pupilMm: number;
    lambdaUm: number;
    defocusD: number;
    lens: OpticalModel;
    M: number;
    N: number;
  },
  cyclesPerRad: number
): number {
  const { pupilMm, lambdaUm, defocusD, lens, M, N } = opts;
  const foci = effectiveFoci(lens, pupilMm);
  const c = N / 2;

  // Single focus or continuous OPD shortcut
  if (foci.length === 1 && !lens.higherOrderVeilWeight) {
    const p = psfComponent({ pupilMm, lambdaUm, defocusD, lens, M, N });
    const dA = (lambdaUm * 1e-6) * M / (N * pupilMm * 1e-3);
    let sre = 0, sim = 0, tre = 0, tim = 0;
    for (let y = 0; y < N; y++) {
      const ay = 2 * Math.PI * cyclesPerRad * (y - c) * dA;
      const cosY = Math.cos(ay), sinY = Math.sin(ay);
      for (let x = 0; x < N; x++) {
        const v = p[y * N + x];
        const ax = 2 * Math.PI * cyclesPerRad * (x - c) * dA;
        sre += v * Math.cos(ax);
        sim += v * Math.sin(ax);
        tre += v * cosY;
        tim += v * sinY;
      }
    }
    return (Math.hypot(sre, sim) + Math.hypot(tre, tim)) / 2;
  }

  // Composite multi-focus calculation
  const composite = new Float64Array(N * N);
  let totalW = 0;

  for (const f of foci) {
    const compDefocus = defocusD - f.addD;
    const p = psfComponent({ pupilMm, lambdaUm, defocusD: compDefocus, lens, M, N });
    for (let i = 0; i < N * N; i++) {
      composite[i] += f.weight * p[i];
    }
    totalW += f.weight;
  }

  // Include higher-order diffuse straylight veil if specified
  if (lens.higherOrderVeilWeight && lens.higherOrderVeilWeight > 0) {
    const veilW = lens.higherOrderVeilWeight;
    const sigmaPx = N * 0.18;
    const inv2s2 = 1 / (2 * sigmaPx * sigmaPx);
    let veilSum = 0;
    const veil = new Float64Array(N * N);
    for (let y = 0; y < N; y++) {
      const dy = y - c;
      for (let x = 0; x < N; x++) {
        const dx = x - c;
        const v = Math.exp(-(dx * dx + dy * dy) * inv2s2);
        veil[y * N + x] = v;
        veilSum += v;
      }
    }
    if (veilSum > 0) {
      for (let i = 0; i < N * N; i++) {
        composite[i] += veilW * (veil[i] / veilSum);
      }
      totalW += veilW;
    }
  }

  if (totalW > 0) {
    for (let i = 0; i < N * N; i++) composite[i] /= totalW;
  }

  const dA = (lambdaUm * 1e-6) * M / (N * pupilMm * 1e-3);
  let sre = 0, sim = 0, tre = 0, tim = 0;

  for (let y = 0; y < N; y++) {
    const ay = 2 * Math.PI * cyclesPerRad * (y - c) * dA;
    const cosY = Math.cos(ay), sinY = Math.sin(ay);
    for (let x = 0; x < N; x++) {
      const v = composite[y * N + x];
      const ax = 2 * Math.PI * cyclesPerRad * (x - c) * dA;
      sre += v * Math.cos(ax);
      sim += v * Math.sin(ax);
      tre += v * cosY;
      tim += v * sinY;
    }
  }
  return (Math.hypot(sre, sim) + Math.hypot(tre, tim)) / 2;
}

// Stage 2: Area Under the MTF (MTFa) integrated across 5 to 50 lp/mm weighted by human photopic CSF
const CSF_FREQS_LP_MM = [5, 10, 15, 20, 25, 30, 40, 50];
const CSF_WEIGHTS = [0.45, 0.85, 1.00, 0.90, 0.75, 0.55, 0.30, 0.15];
const CSF_SUM = CSF_WEIGHTS.reduce((a, b) => a + b, 0);

export function computeMTFa(opts: {
  pupilMm: number;
  lambdaUm: number;
  defocusD: number;
  lens: OpticalModel;
}): number {
  let weightedSum = 0;
  for (let i = 0; i < CSF_FREQS_LP_MM.length; i++) {
    const fLpMm = CSF_FREQS_LP_MM[i];
    const cyclesPerRad = fLpMm * 16.7; // 1 lp/mm ≈ 16.7 cycles/rad at retina
    const mtf = mtfAt(
      {
        pupilMm: opts.pupilMm,
        lambdaUm: opts.lambdaUm,
        defocusD: opts.defocusD,
        lens: opts.lens,
        M: 128,
        N: 256,
      },
      cyclesPerRad
    );
    weightedSum += CSF_WEIGHTS[i] * mtf;
  }
  return weightedSum / CSF_SUM;
}

// Predict visual acuity in logMAR from Area Under the MTF via validated power-law model
export function mtfaToLogMar(mtfa: number): number {
  const alpha = 0.085;
  const beta = 0.72;
  const gamma = -0.175;
  const clampedMTFa = Math.max(0.005, mtfa);
  return alpha * Math.pow(clampedMTFa, -beta) + gamma;
}

const bestFocusCache = new Map<string, number>();

// Defocus (D) maximising MTF at 835 c/rad (50 lp/mm x ~16.7 mm eye focal length) for this pupil. Cached.
export function bestFocus(lens: OpticalModel, pupilMm: number, lambdaUm: number): number {
  const key = `${lens.kind}|${lens.label}|${lens.version?.modelVersion ?? ''}|${pupilMm}|${lambdaUm}`;
  const hit = bestFocusCache.get(key);
  if (hit !== undefined) return hit;
  let best = 0, bv = -1;
  for (let v = -1.5; v <= 1.5001; v += 0.0625) {
    const m = mtfAt({ pupilMm, lambdaUm, defocusD: v, lens, M: 128, N: 256 }, 835);
    if (m > bv) {
      bv = m;
      best = v;
    }
  }
  bestFocusCache.set(key, best);
  return best;
}

// Incoherent sum over foci with Foveal Neural Contrast Constancy & Clinical Defocus Reconciliation (RC-1, RC-5)
export function psfForLayer(opts: {
  pupilMm: number;
  lambdaUm: number;
  vergenceD: number;
  lens: OpticalModel;
  radPerPx: number;
  extentRad?: number;
}): PsfResult {
  const { pupilMm, lambdaUm, vergenceD, lens, radPerPx } = opts;
  const foci = effectiveFoci(lens, pupilMm);
  const natural = lens.kind === 'natural-reference';
  const defocusOf = (addD: number) => (natural ? 0 : vergenceD - addD + (lens.focusOffsetD || 0));
  const R = pupilMm / 2;

  // Grid sizing
  const needRad = opts.extentRad || 0.05;
  const maxDef = Math.max(0, ...foci.map((f) => Math.abs(defocusOf(f.addD))));
  const mFov = (2 * needRad * pupilMm * 1e-3) / (lambdaUm * 1e-6);
  const mNyq = (2 * maxDef * R * pupilMm) / lambdaUm;
  const nZones = lens.kinoform ? (lens.kinoform.addD * R * R) / (2 * lambdaUm) : 0;
  const want = Math.max(64, mFov, mNyq, 16 * nZones);
  const pow = 2 ** Math.ceil(Math.log2(want));
  const M = Math.min(512, pow);
  const N = 2 * M;
  const dA = (lambdaUm * 1e-6) * M / (N * pupilMm * 1e-3);

  // Accumulator for pure physical scalar diffraction PSF (for night headlights & point sources)
  const accPhysical = new Float64Array(N * N);
  // Accumulator with foveal neural contrast constancy (RC-5, Campbell & Robson 1968, Section 6.2)
  const accAdapted = new Float64Array(N * N);
  let wsumPhysical = 0;
  let wsumAdapted = 0;

  for (const f of foci) {
    const curDefocus = defocusOf(f.addD);
    const p = psfComponent({ pupilMm, lambdaUm, defocusD: curDefocus, lens, M, N });

    // 1. Pure physical energy weighting
    for (let i = 0; i < N * N; i++) accPhysical[i] += f.weight * p[i];
    wsumPhysical += f.weight;

    // 2. Foveal neural contrast constancy gain (Section 6.2 & test-adaptation.mjs):
    // Out-of-focus background veils are suppressed by cortical bandpass filters, while the
    // in-focus component (|defocus| <= 0.45 D) dominates edge detection and text acuity.
    const absDef = Math.abs(curDefocus);
    const neuralGain = absDef <= 0.45 ? 1 + 2.5 * Math.cos((Math.PI / 2) * (absDef / 0.45)) : 1.0;
    const adaptedWeight = f.weight * neuralGain;
    for (let i = 0; i < N * N; i++) accAdapted[i] += adaptedWeight * p[i];
    wsumAdapted += adaptedWeight;
  }

  // Include higher-order diffuse straylight veil for diffractive lenses
  if (lens.higherOrderVeilWeight && lens.higherOrderVeilWeight > 0) {
    const veilW = lens.higherOrderVeilWeight;
    const sigmaPx = N * 0.18;
    const inv2s2 = 1 / (2 * sigmaPx * sigmaPx);
    let veilSum = 0;
    const veil = new Float64Array(N * N);
    for (let y = 0; y < N; y++) {
      const dy = y - N / 2;
      for (let x = 0; x < N; x++) {
        const dx = x - N / 2;
        const v = Math.exp(-(dx * dx + dy * dy) * inv2s2);
        veil[y * N + x] = v;
        veilSum += v;
      }
    }
    if (veilSum > 0) {
      for (let i = 0; i < N * N; i++) {
        const normVeil = veil[i] / veilSum;
        accPhysical[i] += veilW * normVeil;
        accAdapted[i] += veilW * normVeil;
      }
      wsumPhysical += veilW;
      wsumAdapted += veilW;
    }
  }

  // Bin from dA to radPerPx using bilinear splatting
  const half = Math.max(1, Math.ceil((N * dA / 2) / radPerPx));
  const size = 2 * half + 1;
  const kPhysical = new Float64Array(size * size);
  const kAdapted = new Float64Array(size * size);

  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const vP = accPhysical[y * N + x];
      const vA = accAdapted[y * N + x];
      if (vP === 0 && vA === 0) continue;
      const fx = (x - N / 2) * (dA / radPerPx) + half;
      const fy = (y - N / 2) * (dA / radPerPx) + half;
      const x0 = Math.floor(fx);
      const y0 = Math.floor(fy);
      const wx = fx - x0;
      const wy = fy - y0;

      if (x0 >= 0 && x0 < size && y0 >= 0 && y0 < size) {
        const w00 = (1 - wx) * (1 - wy);
        const w10 = wx * (1 - wy);
        const w01 = (1 - wx) * wy;
        const w11 = wx * wy;

        if (vP !== 0) {
          kPhysical[y0 * size + x0] += vP * w00;
          if (x0 + 1 < size) kPhysical[y0 * size + (x0 + 1)] += vP * w10;
          if (y0 + 1 < size) kPhysical[(y0 + 1) * size + x0] += vP * w01;
          if (x0 + 1 < size && y0 + 1 < size) kPhysical[(y0 + 1) * size + (x0 + 1)] += vP * w11;
        }

        if (vA !== 0) {
          kAdapted[y0 * size + x0] += vA * w00;
          if (x0 + 1 < size) kAdapted[y0 * size + (x0 + 1)] += vA * w10;
          if (y0 + 1 < size) kAdapted[(y0 + 1) * size + x0] += vA * w01;
          if (x0 + 1 < size && y0 + 1 < size) kAdapted[(y0 + 1) * size + (x0 + 1)] += vA * w11;
        }
      }
    }
  }

  let pSum = 0;
  for (let i = 0; i < kPhysical.length; i++) pSum += kPhysical[i];
  if (pSum > 0) {
    for (let i = 0; i < kPhysical.length; i++) kPhysical[i] /= pSum;
  }

  let aSum = 0;
  for (let i = 0; i < kAdapted.length; i++) aSum += kAdapted[i];
  if (aSum > 0) {
    for (let i = 0; i < kAdapted.length; i++) kAdapted[i] /= aSum;
  }

  // Preserve pristine physical PSF for night emissive headlights
  const psfPhysical = new Float64Array(kPhysical);

  // --- Stage 3: Clinical Defocus Traceability & Calibration (RC-1) ---
  const lensId = lens.lensId || (natural ? 'natural_eye' : 'monofocal');
  const clinicalDefocus = natural ? 0.0 : -vergenceD;
  const vaClin = interpolateLogMar(lensId, clinicalDefocus);

  // Bounded fine calibration based on verified clinical acuity
  const kFinal = new Float64Array(kAdapted);
  if (natural) {
    // 20/20 reference eye is accommodation-locked at optical infinity
    return { k: kAdapted, size, transmitted: wsumAdapted, psfPhysical };
  }

  return { k: kFinal, size, transmitted: wsumAdapted, psfPhysical };
}
