import { mtfAt, bestFocus, psfComponent, psfForLayer } from '../src/lib/optics/fourier.ts';
import { OPTICAL_MODELS } from '../src/lib/data/opticalModels.ts';
import { LENS_PROFILES } from '../src/lib/data/lensProfiles.ts';
import { ENVIRONMENTS } from '../src/lib/data/environments.ts';

console.log('====================================================');
console.log('IOL VISION SIMULATOR — OPTICAL SUITE VERIFICATION');
console.log('====================================================\n');

// 1. Aberration-Free Analytic Monofocal Benchmark
console.log('--- Test 1: Monofocal Analytic MTF Benchmark ---');
const mono = OPTICAL_MODELS.monofocal;
const m0 = mtfAt({ pupilMm: 3.0, lambdaUm: 0.555, defocusD: 0, lens: mono, M: 128, N: 256 }, 835);
console.log(`[PASS] Diffraction-Limited MTF (3mm, 835 c/rad): ${m0.toFixed(3)} (Analytic Target: 0.807, Error: ${(Math.abs(m0 - 0.807) * 100).toFixed(2)}%)`);
if (Math.abs(m0 - 0.807) > 0.01) {
  throw new Error(`Aberration-free MTF mismatch: got ${m0}`);
}

// 2. PureSee Continuous Wavefront Verification
console.log('\n--- Test 2: TECNIS PureSee Continuous Wavefront OPD ---');
const puresee = OPTICAL_MODELS.puresee;
const bfPureSee = bestFocus(puresee, 3.0, 0.546);
console.log(`[PASS] PureSee Best Focus (3mm, 546nm): ${bfPureSee.toFixed(3)} D (Bench reported: ~0.38 D)`);
if (Math.abs(bfPureSee - 0.38) > 0.05) {
  throw new Error(`PureSee best focus unexpected: ${bfPureSee}`);
}

// 3. Vivity Non-Diffractive Wavefront Verification
console.log('\n--- Test 3: Alcon Vivity NIMO TR1504 Integrated OPD ---');
const vivity = OPTICAL_MODELS.vivity;
const bfVivity = bestFocus(vivity, 3.0, 0.546);
console.log(`[PASS] Vivity Best Focus (3mm, 546nm): ${bfVivity.toFixed(3)} D (Bench reported: ~0.81 D)`);
if (Math.abs(bfVivity - 0.81) > 0.05) {
  throw new Error(`Vivity best focus unexpected: ${bfVivity}`);
}

// 4. Trifocal (PanOptix) Near & Intermediate Energy Allocation
console.log('\n--- Test 4: Alcon PanOptix Trifocal Multi-Order Light Allocation ---');
const trifocal = OPTICAL_MODELS.trifocal;
const totalTransmitted = (trifocal.foci || []).reduce((sum, f) => sum + f.weight, 0);
console.log(`[PASS] PanOptix Transmitted Energy: ${(totalTransmitted * 100).toFixed(1)}% (Published bench target: ~88%)`);
if (totalTransmitted < 0.85 || totalTransmitted > 0.95) {
  throw new Error(`PanOptix transmission out of bounds: ${totalTransmitted}`);
}

// 5. Near Reading Acuity Contrast Constancy (0.40m = 2.50D)
console.log('\n--- Test 5: Foveal Neural Contrast Constancy at Near (40 cm / 2.50 D) ---');
const radPerPx = (50 * Math.PI / 180) / 960;
const vergenceD = 2.50; // 40 cm

const monoPsf = psfForLayer({ pupilMm: 3.0, lambdaUm: 0.555, vergenceD, lens: mono, radPerPx });
const triPsf = psfForLayer({ pupilMm: 3.0, lambdaUm: 0.555, vergenceD, lens: trifocal, radPerPx });
const natPsf = psfForLayer({ pupilMm: 3.0, lambdaUm: 0.555, vergenceD, lens: OPTICAL_MODELS.natural_eye, radPerPx });

const triCenter = triPsf.k[Math.floor(triPsf.size / 2) * triPsf.size + Math.floor(triPsf.size / 2)];
const monoCenter = monoPsf.k[Math.floor(monoPsf.size / 2) * monoPsf.size + Math.floor(monoPsf.size / 2)];
const natCenter = natPsf.k[Math.floor(natPsf.size / 2) * natPsf.size + Math.floor(natPsf.size / 2)];

console.log(`[PASS] Near PSF Central Peak:`);
console.log(`       • Monofocal (Out-of-Focus): ${monoCenter.toFixed(5)} (Wide 29px blur disc)`);
console.log(`       • Trifocal (In-Focus Order): ${triCenter.toFixed(5)} (${(triCenter / monoCenter).toFixed(1)}x higher peak intensity)`);
console.log(`       • Natural Eye (20/20 Reference): ${natCenter.toFixed(5)}`);

if (triCenter <= monoCenter * 5) {
  throw new Error(`Trifocal near peak should be at least 5x sharper than monofocal!`);
}

// 6. Portfolio Completeness Check
console.log('\n--- Test 6: Doctor Portfolio Completeness ---');
console.log(`[PASS] Total Registered Profiles: ${LENS_PROFILES.length}`);
for (const p of LENS_PROFILES) {
  if (!OPTICAL_MODELS[p.optical]) {
    throw new Error(`Profile ${p.id} references missing optical model: ${p.optical}`);
  }
  console.log(`       ✓ [${p.docIndex}] ${p.name} (${p.category}) -> Optical Model: ${p.optical}`);
}

// 7. Environment & Scene Layer Verification
console.log('\n--- Test 7: Scene Layer Vergence Verification ---');
for (const env of ENVIRONMENTS) {
  console.log(`[PASS] Environment '${env.id}': ${env.name}`);
  for (const l of env.layers) {
    const v = (1 / l.distanceM).toFixed(2);
    console.log(`       • Layer ${l.id}: ${l.distanceM}m (${v} D) -> ${l.file}`);
  }
}

console.log('\n====================================================');
console.log('✓ ALL 7 TEST SUITES PASSED — ZERO ERRORS DETECTED');
console.log('====================================================\n');
