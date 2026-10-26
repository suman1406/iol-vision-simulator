import fs from 'fs';
import { PNG } from 'pngjs';

const dir = 'public/assets/layers/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));

for (const f of files) {
  const buf = fs.readFileSync(dir + f);
  const p = PNG.sync.read(buf);
  console.log(`${f.padEnd(35)} : ${p.width}x${p.height} (${(buf.length / 1024).toFixed(1)} KB)`);
}
