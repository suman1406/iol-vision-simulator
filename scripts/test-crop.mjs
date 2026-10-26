import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
if (typeof globalThis.ImageData === 'undefined') {
  globalThis.ImageData = class ImageData {
    constructor(w, h) {
      this.width = w;
      this.height = h;
      this.data = new Uint8ClampedArray(w * h * 4);
    }
  };
}
import { renderScene } from '../src/lib/optics/renderer.ts';
import { OPTICAL_MODELS } from '../src/lib/data/opticalModels.ts';
import { ENVIRONMENTS } from '../src/lib/data/environments.ts';

class MockCanvas {
  constructor(w, h, data) {
    this.width = w;
    this.height = h;
    this.data = data;
  }
  getContext(type) {
    return {
      getImageData: (x, y, w, h) => {
        return { data: this.data, width: w, height: h };
      }
    };
  }
}

function loadPngCanvas(filePath) {
  const buf = fs.readFileSync(filePath);
  const png = PNG.sync.read(buf);
  return new MockCanvas(png.width, png.height, png.data);
}

const env = ENVIRONMENTS[0]; // Day mall
const layers = env.layers.map(l => ({
  id: l.id,
  label: l.label,
  distanceM: l.distanceM,
  canvas: loadPngCanvas(path.join(process.cwd(), 'public', l.file)),
  emissive: null
}));

const scene = { w: 960, h: 640, layers };

for (const lensId of ['monofocal', 'puresee', 'trifocal', 'imported_trifocal', 'aphakic']) {
  const model = OPTICAL_MODELS[lensId];
  const res = renderScene(scene, env, model, true);
  
  // Crop near phone area: x: 550 to 900, y: 160 to 600
  const cropW = 350, cropH = 440;
  const outPng = new PNG({ width: cropW, height: cropH });
  for (let y = 0; y < cropH; y++) {
    for (let x = 0; x < cropW; x++) {
      const srcIdx = ((160 + y) * 960 + (550 + x)) * 4;
      const dstIdx = (y * cropW + x) * 4;
      for (let c = 0; c < 4; c++) {
        outPng.data[dstIdx + c] = res.imageData.data[srcIdx + c];
      }
    }
  }
  const outPath = `crop_${lensId}.png`;
  fs.writeFileSync(outPath, PNG.sync.write(outPng));
  console.log(`Saved ${outPath}`);
}
