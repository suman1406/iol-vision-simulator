// Node validation of the optical engine against analytic and published values. Run: node validate.js
const O = require('./optics.js');
const g = {}; g.window = g;
for (const f of ['data/vivityPowerProfile.js', 'data/opticalModels.js'])
  require('vm').runInNewContext(require('fs').readFileSync(__dirname + '/' + f, 'utf8'), g);
const ps = g.OPTICAL_MODELS.puresee;
const mtf = (pupilMm, v, lens) => O.mtfAt({ pupilMm, lambdaUm: 0.546, defocusD: v, lens, M: 128, N: 256 }, 835);

// 0. Diffraction-limited MTF vs analytic circular-pupil MTF.
const nu = 835, s = nu / (3e-3 / 0.546e-6);
console.log('0. Aberration-free MTF, 3 mm, 835 c/rad:', mtf(3, 0, {}).toFixed(3),
  'analytic', (2 / Math.PI * (Math.acos(s) - s * Math.sqrt(1 - s * s))).toFixed(3));

// 1. Zernike table convention (traceability check; table not used for rendering).
let ss = 0; for (const z of ps.zernikeTable) ss += z.c * z.c / (z.m === 0 ? z.n + 1 : 2 * (z.n + 1));
let ssN = 0; for (const z of ps.zernikeTable) ssN += z.c * z.c;
console.log('1. Table 1 RMS, unnormalised convention:', Math.sqrt(ss).toFixed(4), 'µm | OSA-normalised', Math.sqrt(ssN).toFixed(4), '| paper 0.3046');

// 2. Through-focus MTF at 50 lp/mm (≈835 c/rad, f≈16.7 mm) for IOL apertures 3.0 and 4.2 mm, relative to the
// calibrated best focus, printed in IOL-plane dioptres (spectacle × 2.2/1.7).
for (const ap of [3.0, 4.2]) {
  const row = [];
  const pupil = ap * ps.pupilToIolScale, f0 = O.bestFocus(ps, pupil, 0.546);
  for (let v = -1; v <= 2.01; v += 0.125) row.push((v * 2.2 / 1.7).toFixed(2) + ':' + mtf(pupil, v + f0, ps).toFixed(2));
  console.log(`2. PureSee, ${ap} mm IOL aperture (best focus ${f0.toFixed(3)} D):\n   ` + row.join(' '));
}
console.log('   Fig 3A (3 mm): peak ~0.41 at 0; ~0.03 at +1.0; secondary ~0.09 at ~+2.1 D');
console.log('   Fig 3B (4.5 mm): narrow peak ~0.61 at the same 0; near peak lost');

// 3. Vivity (Garzón 2024 power profile) vs independent bench: Schmid & Borkenstein 2023, 22 D lens, 50 lp/mm:
//    3 mm far 0.325 / intermediate 0.190, 4.5 mm far 0.350 / intermediate 0.110; peaks 1.75 D apart (IOL plane).
const vv = g.OPTICAL_MODELS.vivity;
for (const ap of [3.0, 4.5]) {
  const pupil = ap * vv.pupilToIolScale, f0 = O.bestFocus(vv, pupil, 0.546), row = [];
  for (let v = -0.75; v <= 2.51; v += 0.125) row.push((v * 2.2 / 1.7).toFixed(2) + ':' + mtf(pupil, v + f0, vv).toFixed(2));
  console.log(`3. Vivity, ${ap} mm IOL aperture (best focus ${f0.toFixed(3)} D):\n   ` + row.join(' '));
}
console.log('   Bench: 3 mm far 0.325 / int 0.190; 4.5 mm far 0.350 / int 0.110; secondary peak +1.75 D (IOL plane)');

// 4. Data integrity: every referenced evidence id exists; every profile has all four effect records;
//    every evidence record and optical model carries version information.
{
  const vm = require('vm'), fs = require('fs'), d = {}; d.window = d;
  for (const f of ['data/defocusCurves.js', 'data/evidence.js', 'data/vivityPowerProfile.js', 'data/opticalModels.js', 'data/lensProfiles.js'])
    vm.runInNewContext(fs.readFileSync(__dirname + '/' + f, 'utf8'), d);
  const problems = [];
  for (const p of d.LENS_PROFILES) {
    for (const id of [...p.references, ...p.defocusCurves, ...p.opticalProfiles, ...(p.related || []).map(r => r.id)])
      if (!d.EVIDENCE[id]) problems.push(`${p.id}: missing evidence ${id}`);
    for (const k of ['blur', 'contrast', 'halo', 'colour']) {
      const f = p.effects && p.effects[k];
      if (!f) problems.push(`${p.id}: no ${k} effect record`);
      else for (const id of f.evidence) if (!d.EVIDENCE[id]) problems.push(`${p.id}/${k}: missing evidence ${id}`);
    }
  }
  for (const [id, e] of Object.entries(d.EVIDENCE)) if (!e.version) problems.push(`evidence ${id}: no version`);
  for (const [id, m] of Object.entries(d.OPTICAL_MODELS)) if (!m.version) problems.push(`model ${id}: no version`);
  console.log(`4. Data integrity: ${problems.length ? problems.join('; ') : 'OK'} (${Object.keys(d.EVIDENCE).length} evidence records, set ${d.EVIDENCE_SET_VERSION})`);
}
