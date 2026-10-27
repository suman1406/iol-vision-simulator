import { LENS_PROFILES, computeRatingsForLens } from '../src/lib/data/lensProfiles.ts';
import { CLINICAL_DEFOCUS_DATA, interpolateLogMar, logMarToSnellen, logMarToScore } from '../src/lib/data/defocusCurves.ts';
import { OPTICAL_MODELS } from '../src/lib/data/opticalModels.ts';
import { mtfAt, bestFocus } from '../src/lib/optics/fourier.ts';

console.log('========================================================================================');
console.log('IOL VISION SIMULATOR: COMPLETE NUMERICAL & OPTICAL BENCHMARK AUDIT');
console.log('========================================================================================\n');

const PUPIL_MM = 3.0;
const LAMBDA_UM = 0.555;
const CYCLES_PER_RAD = 835; // 50 lp/mm (eye focal length ~16.7mm)

// Target vergences
const D_FAR = 0.00;
const D_INT = -1.18;  // 85 cm
const D_NEAR = -2.50; // 40 cm

const results = [];

for (const profile of LENS_PROFILES) {
  const lensId = profile.id;
  const optModel = OPTICAL_MODELS[profile.optical];

  // 1. Calculate Scorecard Acuities
  const logFar = interpolateLogMar(lensId, D_FAR);
  const logInt = interpolateLogMar(lensId, D_INT);
  const logNear = interpolateLogMar(lensId, D_NEAR);

  const snellenFar = logMarToSnellen(logFar);
  const snellenInt = logMarToSnellen(logInt);
  const snellenNear = logMarToSnellen(logNear);

  const scoreFar = logMarToScore(logFar);
  const scoreInt = logMarToScore(logInt);
  const scoreNear = logMarToScore(logNear);

  // 2. Calculate Viewport Fourier Optics MTF at 50 lp/mm (0-1 scale)
  let mtfFar = 0, mtfInt = 0, mtfNear = 0;
  if (optModel) {
    let effModel = optModel;
    if (effModel.focusPerPupil) {
      effModel = {
        ...effModel,
        focusOffsetD: bestFocus(effModel, PUPIL_MM, LAMBDA_UM),
      };
    }

    if (effModel.kind === 'natural-reference') {
      mtfFar = 0.804;
      mtfInt = 0.804;
      mtfNear = 0.804;
    } else {
      mtfFar = mtfAt({ pupilMm: PUPIL_MM, lambdaUm: LAMBDA_UM, defocusD: 0.10 + (effModel.focusOffsetD || 0), lens: effModel, M: 128, N: 256 }, CYCLES_PER_RAD);
      mtfInt = mtfAt({ pupilMm: PUPIL_MM, lambdaUm: LAMBDA_UM, defocusD: 1.18 + (effModel.focusOffsetD || 0), lens: effModel, M: 128, N: 256 }, CYCLES_PER_RAD);
      mtfNear = mtfAt({ pupilMm: PUPIL_MM, lambdaUm: LAMBDA_UM, defocusD: 2.50 + (effModel.focusOffsetD || 0), lens: effModel, M: 128, N: 256 }, CYCLES_PER_RAD);
    }
  }

  results.push({
    id: lensId,
    name: profile.name,
    statusText: profile.statusText,
    card: {
      far: `${snellenFar} (${scoreFar.toFixed(1)}) [${logFar.toFixed(3)} logMAR]`,
      int: `${snellenInt} (${scoreInt.toFixed(1)}) [${logInt.toFixed(3)} logMAR]`,
      near: `${snellenNear} (${scoreNear.toFixed(1)}) [${logNear.toFixed(3)} logMAR]`,
    },
    mtf: {
      far: mtfFar.toFixed(3),
      int: mtfInt.toFixed(3),
      near: mtfNear.toFixed(3),
    }
  });
}

console.log(JSON.stringify(results, null, 2));
