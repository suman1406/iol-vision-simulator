import { OPTICAL_MODELS } from '../src/lib/data/opticalModels.ts';
import { interpolateLogMar, logMarToScore, logMarToSnellen } from '../src/lib/data/defocusCurves.ts';

// Bilinear PSF binning test
function testPsf(lens, pupilMm, vergenceD, radPerPx) {
  const lambdaUm = 0.555;
  const foci = lens.foci || [{ addD: 0, weight: 1 }];
  const needRad = 0.045;
  const M = Math.min(512, Math.max(64, 2 ** Math.ceil(Math.log2(needRad * pupilMm * 1e-3 / (lambdaUm * 1e-6)))));
  const N = 2 * M;
  const dA = (lambdaUm * 1e-6) * M / (N * pupilMm * 1e-3);
  
  // Test with continuous bilinear interpolation
  const half = Math.max(1, Math.ceil((N * dA / 2) / radPerPx));
  const size = 2 * half + 1;
  const k = new Float64Array(size * size);
  
  // Simulate for near (2.5 D)
  let totalEnergy = 0;
  for (const f of foci) {
    const rawDefocus = vergenceD - f.addD;
    const absDefocus = lens.kind === 'natural-reference' ? 0 : Math.abs(rawDefocus);
    
    // Geometric blur radius in radians: r_geom = (pupilMm/2 * 1e-3) * absDefocus
    // In pixels: r_px = r_geom / radPerPx
    const rPx = (absDefocus * (pupilMm / 2) * 1e-3) / radPerPx;
    // Energy in central in-focus core vs blur circle
    const coreWeight = absDefocus < 0.3 ? 1.0 : (absDefocus < 0.6 ? 0.4 : 0.05);
    
    totalEnergy += f.weight;
  }
  return { half, size };
}

console.log('Testing with different radPerPx values:');
for (const rad of [0.000909, 0.00045, 0.00030]) {
  const arcmin = (rad * 180 * 60 / Math.PI).toFixed(2);
  console.log(`radPerPx = ${rad} (${arcmin} arcmin/px) -> half: ${testPsf(OPTICAL_MODELS['monofocal'], 3.0, 2.5, rad).half}`);
}
