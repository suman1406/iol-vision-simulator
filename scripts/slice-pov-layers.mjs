import fs from 'fs';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';

function processScene(jpgPath, prefix, isNight = false) {
  console.log(`Processing ${jpgPath}...`);
  const jpgData = fs.readFileSync(jpgPath);
  const { width: w, height: h, data } = jpeg.decode(jpgData, { useTArray: true });

  const farPng = new PNG({ width: w, height: h });
  const intPng = new PNG({ width: w, height: h });
  const nearPng = new PNG({ width: w, height: h });
  const emissivePng = isNight ? new PNG({ width: w, height: h }) : null;

  // Let's classify each pixel based on geometric depth regions & color
  for (let y = 0; y < h; y++) {
    const normY = y / h;
    for (let x = 0; x < w; x++) {
      const normX = x / w;
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // 1. NEAR REGION: Smartphone held in lower-right foreground
      // Phone is located in normX: 0.58 - 0.96, normY: 0.48 - 0.98
      const inNearRegion = (normX >= 0.58 && normX <= 0.96 && normY >= 0.48);
      // Phone screen itself is bright with high contrast text
      const isNearElement = inNearRegion && (normY >= 0.52 || (normX >= 0.65 && normY >= 0.48));

      // 2. FAR REGION: Windshield looking out at distance
      // Windshield is in upper region normY < 0.48, tapering on sides
      const dashboardHorizon = 0.46 + 0.08 * Math.sin(normX * Math.PI);
      const isFar = (normY < dashboardHorizon) && !inNearRegion;

      // Alpha channels with soft feathered blending at boundaries
      if (isNearElement) {
        // Near Layer (0.40m)
        nearPng.data[idx] = r;
        nearPng.data[idx + 1] = g;
        nearPng.data[idx + 2] = b;
        nearPng.data[idx + 3] = 255;

        // Interior & Far are masked out behind phone
        intPng.data[idx + 3] = 0;
        farPng.data[idx + 3] = 0;
      } else if (isFar) {
        // Far Layer (10m / 15m)
        farPng.data[idx] = r;
        farPng.data[idx + 1] = g;
        farPng.data[idx + 2] = b;
        farPng.data[idx + 3] = 255;

        intPng.data[idx + 3] = 0;
        nearPng.data[idx + 3] = 0;

        // In night scene: extract bright headlight/taillight/sign cores for emissive HDR
        if (isNight && emissivePng) {
          if (lum > 210 || (r > 200 && g > 180 && b < 100) || (r > 200 && g < 80 && b < 80)) {
            emissivePng.data[idx] = r;
            emissivePng.data[idx + 1] = g;
            emissivePng.data[idx + 2] = b;
            emissivePng.data[idx + 3] = 255;
          } else {
            emissivePng.data[idx + 3] = 0;
          }
        }
      } else {
        // Intermediate Layer (0.85m): Dashboard, steering wheel, speedometer, GPS
        intPng.data[idx] = r;
        intPng.data[idx + 1] = g;
        intPng.data[idx + 2] = b;
        intPng.data[idx + 3] = 255;

        farPng.data[idx + 3] = 0;
        nearPng.data[idx + 3] = 0;
      }
    }
  }

  // Write PNGs
  const farPath = `public/assets/layers/${prefix}_far.png`;
  const intPath = `public/assets/layers/${prefix}_interior.png`;
  const nearPath = `public/assets/layers/${prefix}_near_phone.png`;

  fs.writeFileSync(farPath, PNG.sync.write(farPng));
  fs.writeFileSync(intPath, PNG.sync.write(intPng));
  fs.writeFileSync(nearPath, PNG.sync.write(nearPng));
  console.log(`Saved: ${farPath}, ${intPath}, ${nearPath}`);

  if (isNight && emissivePng) {
    const emPath = `public/assets/layers/${prefix}_lights.png`;
    fs.writeFileSync(emPath, PNG.sync.write(emissivePng));
    console.log(`Saved: ${emPath}`);
  }
}

processScene('public/assets/scenes/daytime_driver_pov.jpg', 'pov_day', false);
processScene('public/assets/scenes/nighttime_driver_pov.jpg', 'pov_night', true);
console.log('All POV layers sliced and saved successfully!');
