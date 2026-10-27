// Fourier-optics image formation (scalar, monochromatic, incoherent).
// PSF = |FFT(pupil * exp(i*2*pi*W/lambda))|^2, sampled in object-space angle.
//
// Units: D in 1/m, radii in mm, wavelength and OPD in um.
// W[um] = D * rho[mm]^2 / 2   (the 1e-3 * 1e3 unit factors cancel).

export interface OpticalModel {
  kind: string;
  label: string;
  /**
   * Discrete-focus approximation (incoherent sum). Use ONLY for lenses whose
   * wavefront is not modelled explicitly. Ignored when `radialOpd` or `kinoform`
   * is present, because those already contain the add power (using both
   * double-counts it).
   */
  foci: Array<{ addD: number; weight: number }>;
  assumptions: string[];
  /** Measured / derived radial OPD profile of the lens (continuous designs: Eyhance, Vivity, PureSee). */
  radialOpd?: {
    lambdaUm: number;
    sign: number;
    rMm: number[];
    waves: number[];
  };
  /**
   * Ideal blazed diffractive (kinoform) profile. stepWaves = phase step height in waves
   * (0.5 -> eta0 = eta1 = 40.5 %). Pupil dependence emerges from the physics.
   */
  kinoform?: { addD: number; stepWaves: number };
  /**
   * Radius (mm, IOL plane) of the diffractive/multifocal zone for discrete-foci lenses.
   * Outside it the lens is treated as monofocal (all energy to distance), weighted by area.
   * Heuristic: only valid for lenses whose peripheral zone is monofocal (e.g. PanOptix 4.5 mm
   * diameter -> 2.25).
   */
  diffractiveZoneMm?: number;
  /** pupil radius / IOL-plane radius. Defaults to 1 when omitted. */
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
  /** Sum of effective focus weights before normalisation (informational; the kernel is energy-normalised). */
  transmitted: number;
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
 * - natural eye / continuous / kinoform lenses: a single "focus"; add power lives in the OPD.
 * - discrete-focus lenses: listed foci, with optional pupil-area weighting outside the diffractive zone.
 */
export function effectiveFoci(lens: OpticalModel, pupilMm: number): Array<{ addD: number; weight: number }> {
  if (lens.kind === 'natural-reference' || lens.radialOpd || lens.kinoform) {
    return [{ addD: 0, weight: 1 }];
  }
  const foci = lens.foci && lens.foci.length ? lens.foci : [{ addD: 0, weight: 1 }];
  const zone = lens.diffractiveZoneMm;
  const R = pupilMm / 2;
  if (!zone || R <= zone) return foci;
  const inner = (zone / R) ** 2; // area fraction inside the diffractive zone
  const total = foci.reduce((s, f) => s + f.weight, 0);
  const out = foci.map((f) => ({ addD: f.addD, weight: f.weight * inner }));
  const dist = out.find((f) => f.addD === 0);
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
  // FIX: previously the lens OPD was silently dropped when pupilToIolScale was missing.
  const s = lens.pupilToIolScale ? 1 / lens.pupilToIolScale : 1;

  for (let y = 0; y < M; y++) {
    for (let x = 0; x < M; x++) {
      const px = (x + 0.5 - M / 2) / (M / 2);
      const py = (y + 0.5 - M / 2) / (M / 2);
      const r = Math.hypot(px, py);
      if (r > 1) continue;
      // Defocus OPD (um) = D * R^2 * r^2 / 2
      let w = defocusD * R * R * r * r / 2;
      const rho = r * R * s;
      if (lens.radialOpd) w += lensWavefront(lens, rho);
      if (lens.kinoform) w += kinoformWavefront(lens.kinoform.addD, lens.kinoform.stepWaves, rho, lambdaUm);
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

// Incoherent sum over foci, binned to image pixels
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
  // Accommodating natural eye is always in focus; otherwise defocus = V - add + offset
  const defocusOf = (addD: number) => (natural ? 0 : vergenceD - addD + (lens.focusOffsetD || 0));
  const R = pupilMm / 2;

  // --- Grid sizing -------------------------------------------------------------------------
  // Full angular field of the FFT grid is lambda*M/p; it must cover +/- extentRad (FIX: was only +extentRad,
  // so wide PSFs wrapped around), and the pupil must be sampled finely enough for the defocus phase
  // (and any diffractive zones) not to alias.
  const needRad = opts.extentRad || 0.05;
  const maxDef = Math.max(0, ...foci.map((f) => Math.abs(defocusOf(f.addD))));
  const mFov = (2 * needRad * pupilMm * 1e-3) / (lambdaUm * 1e-6);
  const mNyq = (2 * maxDef * R * pupilMm) / lambdaUm;
  const nZones = lens.kinoform ? (lens.kinoform.addD * R * R) / (2 * lambdaUm) : 0;
  const want = Math.max(64, mFov, mNyq, 16 * nZones);
  const pow = 2 ** Math.ceil(Math.log2(want));
  const M = Math.min(512, pow);
  if (pow > 512 && typeof console !== 'undefined') {
    console.warn(`[optics] pupil grid capped at 512 (wanted ${pow}); PSF may be aliased for ${lens.label}`);
  }
  const N = 2 * M;
  const dA = (lambdaUm * 1e-6) * M / (N * pupilMm * 1e-3);
  const acc = new Float64Array(N * N);
  let wsum = 0;

  for (const f of foci) {
    const p = psfComponent({ pupilMm, lambdaUm, defocusD: defocusOf(f.addD), lens, M, N });
    // Weight each focus purely by its optical energy allocation.
    for (let i = 0; i < acc.length; i++) acc[i] += f.weight * p[i];
    wsum += f.weight;
  }

  // Bin from dA to radPerPx using bilinear splatting
  const half = Math.max(1, Math.ceil((N * dA / 2) / radPerPx));
  const size = 2 * half + 1;
  const k = new Float64Array(size * size);

  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const v = acc[y * N + x];
      if (v === 0) continue;
      const fx = (x - N / 2) * (dA / radPerPx) + half;
      const fy = (y - N / 2) * (dA / radPerPx) + half;
      const x0 = Math.floor(fx);
      const y0 = Math.floor(fy);
      const wx = fx - x0;
      const wy = fy - y0;

      if (x0 >= 0 && x0 < size && y0 >= 0 && y0 < size) {
        k[y0 * size + x0] += v * (1 - wx) * (1 - wy);
        if (x0 + 1 < size) k[y0 * size + (x0 + 1)] += v * wx * (1 - wy);
        if (y0 + 1 < size) k[(y0 + 1) * size + x0] += v * (1 - wx) * wy;
        if (x0 + 1 < size && y0 + 1 < size) k[(y0 + 1) * size + (x0 + 1)] += v * wx * wy;
      }
    }
  }

  let sum = 0;
  for (let i = 0; i < k.length; i++) sum += k[i];
  if (sum > 0) {
    for (let i = 0; i < k.length; i++) k[i] /= sum;
  }
  return { k, size, transmitted: wsum };
}

// MTF at a given frequency (cycles/rad) averaged over x and y
export function mtfAt(opts: {
  pupilMm: number;
  lambdaUm: number;
  defocusD: number;
  lens: OpticalModel;
  M: number;
  N: number;
}, cyclesPerRad: number): number {
  const { M, N } = opts;
  const p = psfComponent(opts);
  const dA = (opts.lambdaUm * 1e-6) * M / (N * opts.pupilMm * 1e-3);
  let sre = 0, sim = 0, tre = 0, tim = 0;

  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const v = p[y * N + x];
      const ax = 2 * Math.PI * cyclesPerRad * (x - N / 2) * dA;
      const ay = 2 * Math.PI * cyclesPerRad * (y - N / 2) * dA;
      sre += v * Math.cos(ax);
      sim += v * Math.sin(ax);
      tre += v * Math.cos(ay);
      tim += v * Math.sin(ay);
    }
  }
  return (Math.hypot(sre, sim) + Math.hypot(tre, tim)) / 2;
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
