// Fourier-optics image formation (scalar, monochromatic, incoherent).
// PSF = |FFT(pupil * exp(i*2*pi*W/lambda))|^2, sampled in object-space angle.
// Works in the browser (window.Optics) and in Node (module.exports) for validation.
(function (root) {
  // In-place radix-2 complex FFT on separate re/im Float64Arrays.
  function fft1(re, im, inv) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) {
      let bit = n >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
      if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
    }
    for (let len = 2; len <= n; len <<= 1) {
      const ang = (inv ? 2 : -2) * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
      for (let i = 0; i < n; i += len) {
        let cr = 1, ci = 0;
        for (let k = 0; k < len / 2; k++) {
          const a = i + k, b = a + len / 2;
          const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
          re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
          const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr;
        }
      }
    }
    if (inv) for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
  }

  // 2D FFT on row-major arrays of size w*h (both powers of two).
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

  // Unnormalised Zernike radial polynomial R_n^m (peak-amplitude convention).
  function radial(n, m, r) {
    m = Math.abs(m); let s = 0;
    const f = k => { let v = 1; for (let i = 2; i <= k; i++) v *= i; return v; };
    for (let k = 0; k <= (n - m) / 2; k++)
      s += (k % 2 ? -1 : 1) * f(n - k) / (f(k) * f((n + m) / 2 - k) * f((n - m) / 2 - k)) * Math.pow(r, n - 2 * k);
    return s;
  }
  function zernike(n, m, r, t) {
    return radial(n, m, r) * (m > 0 ? Math.cos(m * t) : m < 0 ? Math.sin(-m * t) : 1);
  }

  // Lens wavefront (µm) at IOL-plane radius rMm: linear interpolation of a measured radial OPD profile.
  function lensWavefront(model, rMm) {
    const p = model.radialOpd;
    if (!p) return 0;
    const rs = p.rMm, n = rs.length;
    if (rMm >= rs[n - 1]) return p.waves[n - 1] * p.lambdaUm * p.sign;
    let i = 1; while (rs[i] < rMm) i++;
    const f = (rMm - rs[i - 1]) / (rs[i] - rs[i - 1]);
    return (p.waves[i - 1] + f * (p.waves[i] - p.waves[i - 1])) * p.lambdaUm * p.sign;
  }

  // Monochromatic PSF for one focus component.
  // opts: pupilMm (entrance pupil), lambdaUm, defocusD (spectacle-plane vergence error, + = needs more plus),
  //       lens (optical model), M (samples across pupil), N (grid size).
  function psfComponent(opts) {
    const { pupilMm, lambdaUm, defocusD, lens, M, N } = opts;
    const re = new Float64Array(N * N), im = new Float64Array(N * N);
    const R = pupilMm / 2, c = N / 2;
    // Map entrance-pupil radius to IOL-plane radius (see methodology: OPD conservation).
    const iolScale = lens.radialOpd ? 1 / lens.pupilToIolScale : 0;
    for (let y = 0; y < M; y++) for (let x = 0; x < M; x++) {
      const px = (x + 0.5 - M / 2) / (M / 2), py = (y + 0.5 - M / 2) / (M / 2), r = Math.hypot(px, py);
      if (r > 1) continue;
      // Defocus OPD (µm) = V[D] * (R[mm])^2 * r^2 / 2.
      let w = defocusD * R * R * r * r / 2;
      if (iolScale) w += lensWavefront(lens, r * R * iolScale);
      const ph = 2 * Math.PI * w / lambdaUm;
      const i = ((y - M / 2 + c + N) % N) * N + ((x - M / 2 + c + N) % N);
      re[i] = Math.cos(ph); im[i] = Math.sin(ph);
    }
    fft2(re, im, N, N, false);
    const out = new Float64Array(N * N);
    let sum = 0;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { // fftshift
      const v = re[y * N + x] ** 2 + im[y * N + x] ** 2;
      out[((y + c) % N) * N + ((x + c) % N)] = v; sum += v;
    }
    for (let i = 0; i < out.length; i++) out[i] /= sum;
    return out; // angular sample = lambda / (N * pupil/M) rad
  }

  // Incoherent sum over foci, binned to image pixels. Returns {k, size} normalised to 1.
  function psfForLayer(opts) {
    const { pupilMm, lambdaUm, vergenceD, lens, radPerPx } = opts;
    const foci = lens.foci || [{ addD: 0, weight: 1 }];
    const needRad = opts.extentRad;
    const M = Math.min(512, Math.max(64, 2 ** Math.ceil(Math.log2(needRad * pupilMm * 1e-3 / (lambdaUm * 1e-6)))));
    const N = 2 * M;
    const dA = (lambdaUm * 1e-6) * M / (N * pupilMm * 1e-3);
    const acc = new Float64Array(N * N);
    let wsum = 0;
    for (const f of foci) {
      const p = psfComponent({ pupilMm, lambdaUm, defocusD: vergenceD - f.addD + (lens.focusOffsetD || 0), lens, M, N });
      for (let i = 0; i < acc.length; i++) acc[i] += f.weight * p[i];
      wsum += f.weight;
    }
    // Bin from dA to radPerPx (area-weighted nearest-bin accumulation).
    const half = Math.ceil((N * dA / 2) / radPerPx), size = 2 * half + 1, k = new Float64Array(size * size);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const bx = Math.round((x - N / 2) * dA / radPerPx) + half, by = Math.round((y - N / 2) * dA / radPerPx) + half;
      if (bx >= 0 && by >= 0 && bx < size && by < size) k[by * size + bx] += acc[y * N + x];
    }
    let s = 0; for (const v of k) s += v;
    for (let i = 0; i < k.length; i++) k[i] /= s; // energy lost to absent orders is not re-added: weights < 1 handled below
    return { k, size, transmitted: wsum };
  }

  // MTF at a given frequency (cycles/rad) averaged over x and y, for validation.
  function mtfAt(opts, cyclesPerRad) {
    const M = opts.M, N = opts.N;
    const p = psfComponent(opts);
    const dA = (opts.lambdaUm * 1e-6) * M / (N * opts.pupilMm * 1e-3);
    let sre = 0, sim = 0, tre = 0, tim = 0;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const v = p[y * N + x];
      const ax = 2 * Math.PI * cyclesPerRad * (x - N / 2) * dA, ay = 2 * Math.PI * cyclesPerRad * (y - N / 2) * dA;
      sre += v * Math.cos(ax); sim += v * Math.sin(ax); tre += v * Math.cos(ay); tim += v * Math.sin(ay);
    }
    return (Math.hypot(sre, sim) + Math.hypot(tre, tim)) / 2;
  }

  // Defocus (D) maximising MTF at 835 c/rad (50 lp/mm bench equivalent) for this pupil: the eye's focus setting.
  function bestFocus(lens, pupilMm, lambdaUm) {
    let best = 0, bv = -1;
    for (let v = -1.5; v <= 1.5001; v += 0.0625) {
      const m = mtfAt({ pupilMm, lambdaUm, defocusD: v, lens, M: 128, N: 256 }, 835);
      if (m > bv) { bv = m; best = v; }
    }
    return best;
  }

  const api = { fft2, zernike, radial, psfComponent, psfForLayer, mtfAt, lensWavefront, bestFocus };
  if (typeof module !== 'undefined') module.exports = api; else root.Optics = api;
})(this);
