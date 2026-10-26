import fs from 'fs';
import { PNG } from 'pngjs';

const buf = fs.readFileSync('public/assets/layers/day_near_phone_bill.png');
const png = PNG.sync.read(buf);

console.log('day_near_phone_bill.png dimensions:', png.width, png.height);

let minX = png.width, maxX = 0, minY = png.height, maxY = 0;
for (let y = 0; y < png.height; y++) {
  for (let x = 0; x < png.width; x++) {
    const a = png.data[(y * png.width + x) * 4 + 3];
    if (a > 20) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}
console.log('Phone bounding box:', { minX, maxX, minY, maxY });
