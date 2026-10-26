import { psfForLayer } from '../src/lib/optics/fourier.ts';
import { OPTICAL_MODELS } from '../src/lib/data/opticalModels.ts';

const radPerPx = (50 * Math.PI / 180) / 960;
const vergenceNear = 1 / 0.40; // 2.50 D
const vergenceInt = 1 / 0.85;  // 1.18 D
const vergenceFar = 1 / 10.0;  // 0.10 D

console.log('=== VERIFYING OPTICAL PSFs AT ALL 3 DISTANCES ===\n');

for (const [id, model] of Object.entries(OPTICAL_MODELS)) {
  if (id === 'aphakic') continue;
  const psfNear = psfForLayer({ pupilMm: 3.0, lambdaUm: 0.555, vergenceD: vergenceNear, lens: model, radPerPx });
  const psfInt = psfForLayer({ pupilMm: 3.0, lambdaUm: 0.555, vergenceD: vergenceInt, lens: model, radPerPx });
  const psfFar = psfForLayer({ pupilMm: 3.0, lambdaUm: 0.555, vergenceD: vergenceFar, lens: model, radPerPx });

  const cNear = psfNear.k[Math.floor(psfNear.size / 2) * psfNear.size + Math.floor(psfNear.size / 2)];
  const cInt = psfInt.k[Math.floor(psfInt.size / 2) * psfInt.size + Math.floor(psfInt.size / 2)];
  const cFar = psfFar.k[Math.floor(psfFar.size / 2) * psfFar.size + Math.floor(psfFar.size / 2)];

  console.log(`${id.padEnd(18)} -> Far: ${cFar.toFixed(4)}, Int(85cm): ${cInt.toFixed(4)}, Near(40cm): ${cNear.toFixed(4)}`);
}
