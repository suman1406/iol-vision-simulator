import { CLINICAL_DEFOCUS_DATA } from '../src/lib/data/defocusCurves.ts';

function interpolateVa(points, d) {
  if (!points || points.length === 0) return 0.0;
  const sorted = [...points].sort((a, b) => a.d - b.d);
  if (d <= sorted[0].d) return sorted[0].va;
  if (d >= sorted[sorted.length - 1].d) return sorted[sorted.length - 1].va;
  for (let i = 1; i < sorted.length; i++) {
    if (d <= sorted[i].d) {
      const p0 = sorted[i - 1], p1 = sorted[i];
      const t = (d - p0.d) / (p1.d - p0.d);
      return p0.va + t * (p1.va - p0.va);
    }
  }
  return 0.0;
}

function vaToScore(va) {
  // va is logMAR. 0.0 or lower is 20/20 (5.0).
  const score = 5.0 - 7.0 * Math.max(0, va);
  return Math.round(Math.max(1.0, Math.min(5.0, score)) * 10) / 10;
}

function vaToSnellen(va) {
  const mar = Math.pow(10, va);
  const denom = Math.round(20 * mar);
  return `20/${denom}`;
}

const lenses = ['monofocal', 'edof', 'puresee', 'vivity', 'multifocal', 'trifocal', 'imported_trifocal', 'natural_eye'];
const distances = [
  { name: 'Distance (10m)', d: 0.0 },
  { name: 'Intermediate (66cm)', d: -1.5 },
  { name: 'Near (40cm)', d: -2.5 },
];

for (const id of lenses) {
  const dataset = CLINICAL_DEFOCUS_DATA[id];
  console.log(`\n=== ${id.toUpperCase()} ===`);
  for (const dist of distances) {
    const va = interpolateVa(dataset?.points, dist.d);
    console.log(`  ${dist.name}: logMAR=${va.toFixed(3)}, Snellen=${vaToSnellen(va)}, Score=${vaToScore(va)}★`);
  }
}
