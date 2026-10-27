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
  category?: 'day' | 'night';
  pupilMm: number;
  lambdaUm: number;
  fovDeg: number;
  hdrGain?: number;
  credit?: string;
  notes?: string[];
  renderMode?: 'depth-blend' | 'layered';
  baseImage?: string;
  emissiveImage?: string;
}

export interface RenderResult {
  imageData: ImageData;
  layers: Array<{ id: string; vergenceD: number; kernelSize: number }>;
}

// Convolve RGB planes (preserving original alpha) with kernel k via 2D FFT
export function convolveRGB(
  planes: Float32Array[], // [R, G, B, A] premultiplied linear
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
  const channelPairs: [number, number | null][] = [[0, 1], [2, null]];

  for (const [aIdx, bIdx] of channelPairs) {
    const re = new Float64Array(W * H);
    const im = new Float64Array(W * H);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        re[y * W + x] = planes[aIdx][y * w + x];
        if (bIdx !== null) im[y * W + x] = planes[bIdx][y * w + x];
      }
    }

    // Mirror border extension to suppress rectangular FFT boundary wrap-around artifacts
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (y < h && x < w) continue;
        const sx = x < w ? x : x < w + (W - w) / 2 ? w - 1 : 0;
        const sy = y < h ? y : y < h + (H - h) / 2 ? h - 1 : 0;
        re[y * W + x] = planes[aIdx][sy * w + sx];
        if (bIdx !== null) im[y * W + x] = planes[bIdx][sy * w + sx];
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
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        pa[y * w + x] = re[y * W + x];
      }
    }
    out.push(pa);

    if (bIdx !== null) {
      const pb = new Float32Array(w * h);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          pb[y * w + x] = im[y * W + x];
        }
      }
      out.push(pb);
    }
  }

  return [out[0], out[1], out[2], planes[3]];
}

// Convert Layer canvas -> premultiplied linear planes; add emissive with HDR gain
export function toPlanes(layer: SceneLayer, w: number, h: number, gain: number): Float32Array[] {
  const ctx = layer.canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2d context for layer canvas');
  const d = ctx.getImageData(0, 0, w, h).data;

  const e = layer.emissive ? layer.emissive.getContext('2d')?.getImageData(0, 0, w, h).data : null;

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

// Render complete layered scene (for classic layered assets)
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
      const adds =
        effectiveLens.kind === 'natural-reference'
          ? [0]
          : (effectiveLens.foci || [{ addD: 0 }]).map((f) =>
              Math.abs(vergenceD - f.addD + (effectiveLens?.focusOffsetD || 0))
            );
      const extentRad = Math.min(0.045, env.pupilMm * 1e-3 * Math.max(...adds, 0.5) * 1.3 + 0.004);
      const psf = psfForLayer({
        pupilMm: env.pupilMm,
        lambdaUm: env.lambdaUm,
        vergenceD,
        lens: effectiveLens,
        radPerPx,
        extentRad,
      });

      planes = convolveRGB(planes, w, h, psf.k, psf.size);
      info.push({ id: layer.id, vergenceD, kernelSize: psf.size });
    }

    // Compositing far -> near (Porter-Duff "over")
    for (let i = 0; i < w * h; i++) {
      const a = Math.min(1, Math.max(0, planes[3][i]));
      for (let c = 0; c < 3; c++) {
        acc[c][i] = planes[c][i] + acc[c][i] * (1 - a);
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

export interface DepthBlendedSceneInput {
  baseCanvas: HTMLCanvasElement;
  emissiveCanvas?: HTMLCanvasElement | null;
  w: number;
  h: number;
  farDistM: number;
  intDistM: number;
  nearDistM: number;
}

// Render continuous multi-plane depth-blended photograph with boundary bleed isolation
export function renderDepthBlendedScene(
  input: DepthBlendedSceneInput,
  env: EnvironmentConfig,
  lens: OpticalModel | null,
  rendered: boolean
): RenderResult {
  const { w, h, baseCanvas, emissiveCanvas, farDistM, intDistM, nearDistM } = input;
  const ctx = baseCanvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2d context for base canvas');
  const d = ctx.getImageData(0, 0, w, h).data;

  const info: Array<{ id: string; vergenceD: number; kernelSize: number }> = [];

  if (!rendered || !lens) {
    const img = new ImageData(w, h);
    for (let i = 0; i < w * h * 4; i++) img.data[i] = d[i];
    return { imageData: img, layers: [] };
  }

  const radPerPx = (env.fovDeg * Math.PI) / 180 / w;

  let effectiveLens = lens;
  if (effectiveLens.focusPerPupil) {
    effectiveLens = {
      ...effectiveLens,
      focusOffsetD: bestFocus(effectiveLens, env.pupilMm, env.lambdaUm),
    };
  }

  // Pre-calculate spatial depth masks to prevent cross-depth boundary bleed (RC-7)
  const wNearMap = new Float32Array(w * h);
  const wFarMap = new Float32Array(w * h);
  const wIntMap = new Float32Array(w * h);

  const phoneCenterX = 0.865;
  const phoneCenterY = 0.65;
  const phoneHalfW = 0.095;
  const phoneHalfH = 0.30;
  const phoneBlendRadius = 0.04;

  for (let y = 0; y < h; y++) {
    const normY = y / h;
    for (let x = 0; x < w; x++) {
      const normX = x / w;
      const idx = y * w + x;

      // 1. Smartphone & hand region (Near: 0.40m)
      const phoneDistX = Math.max(0, Math.abs(normX - phoneCenterX) - phoneHalfW);
      const phoneDistY = Math.max(0, Math.abs(normY - phoneCenterY) - phoneHalfH);
      const phoneDist = Math.hypot(phoneDistX / phoneBlendRadius, phoneDistY / phoneBlendRadius);
      const wNear = Math.max(0, Math.min(1, 1 - phoneDist));
      wNearMap[idx] = wNear;

      // 2. Windshield horizon line (Far: 10m)
      const horizon = 0.34 + 0.04 * Math.sin(normX * Math.PI);
      const farDist = (horizon - normY) / 0.04;
      const rawFar = Math.max(0, Math.min(1, farDist));
      const wFar = rawFar * (1 - wNear);
      wFarMap[idx] = wFar;

      // 3. Cockpit interior (Intermediate: 0.85m)
      wIntMap[idx] = Math.max(0, 1 - wFar - wNear);
    }
  }

  // Base linear planes per depth layer (with soft cross-boundary infill to prevent bleed)
  const farPlanes = [new Float32Array(w * h), new Float32Array(w * h), new Float32Array(w * h), new Float32Array(w * h)];
  const intPlanes = [new Float32Array(w * h), new Float32Array(w * h), new Float32Array(w * h), new Float32Array(w * h)];
  const nearPlanes = [new Float32Array(w * h), new Float32Array(w * h), new Float32Array(w * h), new Float32Array(w * h)];

  for (let i = 0; i < w * h; i++) {
    for (let c = 0; c < 3; c++) {
      const lin = toLin[d[i * 4 + c]];
      farPlanes[c][i] = lin;
      intPlanes[c][i] = lin;
      nearPlanes[c][i] = lin;
    }
    farPlanes[3][i] = 1.0;
    intPlanes[3][i] = 1.0;
    nearPlanes[3][i] = 1.0;
  }

  // Compute 3 focal plane PSFs
  const vergFar = 1 / farDistM;
  const vergInt = 1 / intDistM;
  const vergNear = 1 / nearDistM;

  const getExtent = (vD: number) => {
    const adds =
      effectiveLens.kind === 'natural-reference'
        ? [0]
        : (effectiveLens.foci || [{ addD: 0 }]).map((f) =>
            Math.abs(vD - f.addD + (effectiveLens.focusOffsetD || 0))
          );
    return Math.min(0.045, env.pupilMm * 1e-3 * Math.max(...adds, 0.5) * 1.3 + 0.004);
  };

  const psfFar = psfForLayer({
    pupilMm: env.pupilMm,
    lambdaUm: env.lambdaUm,
    vergenceD: vergFar,
    lens: effectiveLens,
    radPerPx,
    extentRad: getExtent(vergFar),
  });

  const psfInt = psfForLayer({
    pupilMm: env.pupilMm,
    lambdaUm: env.lambdaUm,
    vergenceD: vergInt,
    lens: effectiveLens,
    radPerPx,
    extentRad: getExtent(vergInt),
  });

  const psfNear = psfForLayer({
    pupilMm: env.pupilMm,
    lambdaUm: env.lambdaUm,
    vergenceD: vergNear,
    lens: effectiveLens,
    radPerPx,
    extentRad: getExtent(vergNear),
  });

  info.push(
    { id: 'far', vergenceD: vergFar, kernelSize: psfFar.size },
    { id: 'intermediate', vergenceD: vergInt, kernelSize: psfInt.size },
    { id: 'near', vergenceD: vergNear, kernelSize: psfNear.size }
  );

  // Full-frame continuous convolution per depth plane
  const cFar = convolveRGB(farPlanes, w, h, psfFar.k, psfFar.size);
  const cInt = convolveRGB(intPlanes, w, h, psfInt.k, psfInt.size);
  const cNear = convolveRGB(nearPlanes, w, h, psfNear.k, psfNear.size);

  // Emissive headlights for night scene (using pristine physical wave-optics PSF)
  let cEmissive: Float32Array[] | null = null;
  if (emissiveCanvas) {
    const eCtx = emissiveCanvas.getContext('2d');
    if (eCtx) {
      const eData = eCtx.getImageData(0, 0, w, h).data;
      const ePlanes = [new Float32Array(w * h), new Float32Array(w * h), new Float32Array(w * h), new Float32Array(w * h)];
      const gain = env.hdrGain || 25;
      for (let i = 0; i < w * h; i++) {
        const a = eData[i * 4 + 3] / 255;
        for (let c = 0; c < 3; c++) {
          ePlanes[c][i] = toLin[eData[i * 4 + c]] * a * gain;
        }
        ePlanes[3][i] = a;
      }
      // Pure physical scalar diffraction kernel preserves exact diffraction rings & halo radius
      const physicalKernel = psfFar.psfPhysical || psfFar.k;
      cEmissive = convolveRGB(ePlanes, w, h, physicalKernel, psfFar.size);
    }
  }

  const img = new ImageData(w, h);

  for (let idx = 0; idx < w * h; idx++) {
    const wFar = wFarMap[idx];
    const wInt = wIntMap[idx];
    const wNear = wNearMap[idx];

    // Distant headlights (Far: 10m) must be occluded by opaque foreground elements (phone & dashboard) (RC-7)
    const emissiveOcclusion = Math.max(0, 1 - wNear - 0.9 * wInt);
    const eVal = cEmissive ? emissiveOcclusion : 0;

    for (let c = 0; c < 3; c++) {
      const val =
        wFar * cFar[c][idx] +
        wInt * cInt[c][idx] +
        wNear * cNear[c][idx] +
        (cEmissive ? cEmissive[c][idx] * eVal : 0);
      img.data[idx * 4 + c] = toSrgb(val);
    }
    img.data[idx * 4 + 3] = 255;
  }

  return { imageData: img, layers: info };
}
