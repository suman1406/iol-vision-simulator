import { fft2, psfForLayer, bestFocus, OpticalModel } from './fourier';

const toLin = new Float32Array(256);
for (let i = 0; i < 256; i++) {
  const c = i / 255;
  toLin[i] = c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

const toSrgb = (v: number): number => {
  v = Math.min(1, Math.max(0, v));
  return 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
};

const pow2 = (n: number): number => 2 ** Math.ceil(Math.log2(n));

export interface SceneLayer {
  id: string;
  label: string;
  distanceM: number;
  canvas: HTMLCanvasElement;
  emissive?: HTMLCanvasElement | null;
}

export interface EnvironmentConfig {
  id: string;
  name: string;
  pupilMm: number;
  lambdaUm: number;
  fovDeg: number;
  hdrGain?: number;
  credit?: string;
  notes?: string[];
}

export interface RenderResult {
  imageData: ImageData;
  layers: Array<{ id: string; vergenceD: number; kernelSize: number }>;
}

// Convolve premultiplied linear RGBA planes with kernel k via FFT
export function convolve(
  planes: Float32Array[],
  w: number,
  h: number,
  k: Float64Array,
  size: number
): Float32Array[] {
  const half = (size - 1) / 2;
  const W = pow2(w + size);
  const H = pow2(h + size);
  const kr = new Float64Array(W * H);
  const ki = new Float64Array(W * H);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      kr[((y - half + H) % H) * W + ((x - half + W) % W)] = k[y * size + x];
    }
  }

  fft2(kr, ki, W, H, false);

  const out: Float32Array[] = [];

  // Pack two real channels per complex FFT
  for (const [a, b] of [[0, 1], [2, 3]]) {
    const re = new Float64Array(W * H);
    const im = new Float64Array(W * H);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        re[y * W + x] = planes[a][y * w + x];
        im[y * W + x] = planes[b][y * w + x];
      }
    }

    // Edge-extend into padding to avoid dark borders
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (y < h && x < w) continue;
        const sx = x < w ? x : (x < w + (W - w) / 2 ? w - 1 : 0);
        const sy = y < h ? y : (y < h + (H - h) / 2 ? h - 1 : 0);
        re[y * W + x] = planes[a][sy * w + sx];
        im[y * W + x] = planes[b][sy * w + sx];
      }
    }

    fft2(re, im, W, H, false);

    for (let i = 0; i < W * H; i++) {
      const r = re[i] * kr[i] - im[i] * ki[i];
      im[i] = re[i] * ki[i] + im[i] * kr[i];
      re[i] = r;
    }

    fft2(re, im, W, H, true);

    const pa = new Float32Array(w * h);
    const pb = new Float32Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        pa[y * w + x] = re[y * W + x];
        pb[y * w + x] = im[y * W + x];
      }
    }
    out.push(pa, pb);
  }

  return out;
}

// Convert Layer canvas -> premultiplied linear planes; add emissive with HDR gain
export function toPlanes(
  layer: SceneLayer,
  w: number,
  h: number,
  gain: number
): Float32Array[] {
  const ctx = layer.canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2d context for layer canvas');
  const d = ctx.getImageData(0, 0, w, h).data;
  
  const e = layer.emissive
    ? layer.emissive.getContext('2d')?.getImageData(0, 0, w, h).data
    : null;

  const p = [0, 1, 2, 3].map(() => new Float32Array(w * h));
  for (let i = 0; i < w * h; i++) {
    const a = d[i * 4 + 3] / 255;
    for (let c = 0; c < 3; c++) {
      p[c][i] = toLin[d[i * 4 + c]] * a + (e ? toLin[e[i * 4 + c]] * (e[i * 4 + 3] / 255) * gain : 0);
    }
    p[3][i] = Math.max(a, e ? e[i * 4 + 3] / 255 : 0);
  }
  return p;
}

// Render complete layered scene
export function renderScene(
  scene: { w: number; h: number; layers: SceneLayer[] },
  env: EnvironmentConfig,
  lens: OpticalModel | null,
  rendered: boolean
): RenderResult {
  const { w, h } = scene;
  const radPerPx = (env.fovDeg * Math.PI) / 180 / w;
  const acc = [0, 1, 2].map(() => new Float32Array(w * h));
  const info: Array<{ id: string; vergenceD: number; kernelSize: number }> = [];

  let effectiveLens = lens;
  if (rendered && effectiveLens && effectiveLens.focusPerPupil) {
    effectiveLens = {
      ...effectiveLens,
      focusOffsetD: bestFocus(effectiveLens, env.pupilMm, env.lambdaUm),
    };
  }

  for (const layer of scene.layers) {
    let planes = toPlanes(layer, w, h, env.hdrGain || 1);
    const vergenceD = 1 / layer.distanceM;

    if (rendered && effectiveLens) {
      const adds = (effectiveLens.foci || [{ addD: 0 }]).map((f) =>
        Math.abs(vergenceD - f.addD + (effectiveLens?.focusOffsetD || 0))
      );
      const extentRad = Math.min(0.08, env.pupilMm * 1e-3 * Math.max(...adds, 0.5) * 1.3 + 0.004);
      const psf = psfForLayer({
        pupilMm: env.pupilMm,
        lambdaUm: env.lambdaUm,
        vergenceD,
        lens: effectiveLens,
        radPerPx,
        extentRad,
      });
      planes = convolve(planes, w, h, psf.k, psf.size);
      info.push({ id: layer.id, vergenceD, kernelSize: psf.size });
    }

    // Compositing far -> near
    for (let i = 0; i < w * h; i++) {
      const t = 1 - Math.min(1, Math.max(0, planes[3][i]));
      for (let c = 0; c < 3; c++) {
        acc[c][i] = planes[c][i] + acc[c][i] * t;
      }
    }
  }

  const img = new ImageData(w, h);
  for (let i = 0; i < w * h; i++) {
    for (let c = 0; c < 3; c++) {
      img.data[i * 4 + c] = toSrgb(acc[c][i]);
    }
    img.data[i * 4 + 3] = 255;
  }

  return { imageData: img, layers: info };
}
