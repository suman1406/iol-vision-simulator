import { OPTICAL_MODELS } from '../src/lib/data/opticalModels.ts';
import { interpolateLogMar, logMarToScore, logMarToSnellen } from '../src/lib/data/defocusCurves.ts';
import { fft2 } from '../src/lib/optics/fourier.ts';

function psfForLayerBilinear(opts) {
  const { pupilMm, lambdaUm, vergenceD, lens, radPerPx } = opts;
  const foci = lens.foci || [{ addD: 0, weight: 1 }];
  const needRad = opts.extentRad || 0.045;
  const M = Math.min(512, Math.max(64, 2 ** Math.ceil(Math.log2(needRad * pupilMm * 1e-3 / (lambdaUm * 1e-6)))));
  const N = 2 * M;
  const dA = (lambdaUm * 1e-6) * M / (N * pupilMm * 1e-3);
  const acc = new Float64Array(N * N);
  let wsum = 0;

  for (const f of foci) {
    const rawDefocus = vergenceD - f.addD + (lens.focusOffsetD || 0);
    const defocusD = lens.kind === 'natural-reference' ? 0 : rawDefocus;
    const absDefocus = Math.abs(defocusD);
    const neuralGain = absDefocus <= 0.45 ? (1.0 + 2.5 * Math.cos((Math.PI / 2) * (absDefocus / 0.45))) : 1.0;
    const effectiveWeight = f.weight * neuralGain;

    // Geometric/diffractive phase profile
    const R = pupilMm / 2;
    const c = N / 2;
    const re = new Float64Array(N * N), im = new Float64Array(N * N);
    
    for (let y = 0; y < M; y++) {
      for (let x = 0; x < M; x++) {
        const px = (x + 0.5 - M / 2) / (M / 2);
        const py = (y + 0.5 - M / 2) / (M / 2);
        const r = Math.hypot(px, py);
        if (r > 1) continue;
        const w = defocusD * R * R * r * r / 2;
        const ph = 2 * Math.PI * w / lambdaUm;
        const idx = ((y - M / 2 + c + N) % N) * N + ((x - M / 2 + c + N) % N);
        re[idx] = Math.cos(ph);
        im[idx] = Math.sin(ph);
      }
    }

    fft2(re, im, N, N, false);

    let sum = 0;
    const p = new Float64Array(N * N);
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const v = re[y * N + x] ** 2 + im[y * N + x] ** 2;
        p[((y + c) % N) * N + ((x + c) % N)] = v;
        sum += v;
      }
    }
    if (sum > 0) {
      for (let i = 0; i < p.length; i++) {
        acc[i] += effectiveWeight * (p[i] / sum);
      }
    }
    wsum += effectiveWeight;
  }

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

  let s = 0;
  for (let i = 0; i < k.length; i++) s += k[i];
  if (s > 0) for (let i = 0; i < k.length; i++) k[i] /= s;

  return { k, size };
}

const w = 960;
const radPerPx = (20 * Math.PI / 180) / w; // 20 deg foveal view

console.log('--- Calibrated Foveal Optical PSF Analysis (radPerPx = 1.25 arcmin) ---');
for (const [id, model] of Object.entries(OPTICAL_MODELS)) {
  if (id === 'aphakic') continue;
  const logMarFar = interpolateLogMar(id, 0.0);
  const logMarInt = interpolateLogMar(id, -1.5);
  const logMarNear = interpolateLogMar(id, -2.5);

  const pNear = psfForLayerBilinear({ pupilMm: 3.0, lambdaUm: 0.555, vergenceD: 2.5, lens: model, radPerPx });
  const pInt = psfForLayerBilinear({ pupilMm: 3.0, lambdaUm: 0.555, vergenceD: 1.5, lens: model, radPerPx });

  const getMetrics = (psf) => {
    const k = psf.k;
    const size = psf.size;
    const c = (size - 1) / 2;
    let varSum = 0, sum = 0;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const v = k[y * size + x];
        sum += v;
        varSum += v * ((x - c)**2 + (y - c)**2);
      }
    }
    const sigmaPx = Math.sqrt(varSum / sum);
    return { sigmaPx: sigmaPx.toFixed(2), center: (k[c * size + c] * 100).toFixed(1) + '%' };
  };

  const mNear = getMetrics(pNear);
  const mInt = getMetrics(pInt);

  console.log(id.padEnd(18), 
    `\n  Near (40cm): logMAR ${logMarNear.toFixed(2)} (${logMarToSnellen(logMarNear)}) Score: ${logMarToScore(logMarNear)} -> sigma: ${mNear.sigmaPx} px, center core: ${mNear.center}`,
    `\n  Int  (66cm): logMAR ${logMarInt.toFixed(2)} (${logMarToSnellen(logMarInt)}) Score: ${logMarToScore(logMarInt)} -> sigma: ${mInt.sigmaPx} px, center core: ${mInt.center}`
  );
}
