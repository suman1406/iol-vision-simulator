// Depth-layered image formation: each layer is convolved (in linear light) with the PSF for that
// layer's vergence, then layers are composited far -> near. Same procedure for every profile.
(function (root) {
  const toLin = new Float32Array(256);
  for (let i = 0; i < 256; i++) { const c = i / 255; toLin[i] = c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }
  const toSrgb = v => { v = Math.min(1, Math.max(0, v)); return 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055); };
  const pow2 = n => 2 ** Math.ceil(Math.log2(n));

  // Convolve premultiplied linear RGBA (Float32 planes) with kernel k (size x size) via FFT.
  function convolve(planes, w, h, k, size) {
    const half = (size - 1) / 2, W = pow2(w + size), H = pow2(h + size);
    const kr = new Float64Array(W * H), ki = new Float64Array(W * H);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++)
      kr[((y - half + H) % H) * W + ((x - half + W) % W)] = k[y * size + x];
    Optics.fft2(kr, ki, W, H, false);
    const out = [];
    for (const [a, b] of [[0, 1], [2, 3]]) { // pack two real channels per complex FFT
      const re = new Float64Array(W * H), im = new Float64Array(W * H);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        // Edge-extend into padding to avoid dark borders.
        re[y * W + x] = planes[a][y * w + x]; im[y * W + x] = planes[b][y * w + x];
      }
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (y < h && x < w) continue;
        const sx = x < w ? x : (x < w + (W - w) / 2 ? w - 1 : 0), sy = y < h ? y : (y < h + (H - h) / 2 ? h - 1 : 0);
        re[y * W + x] = planes[a][sy * w + sx]; im[y * W + x] = planes[b][sy * w + sx];
      }
      Optics.fft2(re, im, W, H, false);
      for (let i = 0; i < W * H; i++) {
        const r = re[i] * kr[i] - im[i] * ki[i]; im[i] = re[i] * ki[i] + im[i] * kr[i]; re[i] = r;
      }
      Optics.fft2(re, im, W, H, true);
      const pa = new Float32Array(w * h), pb = new Float32Array(w * h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { pa[y * w + x] = re[y * W + x]; pb[y * w + x] = im[y * W + x]; }
      out.push(pa, pb);
    }
    return out;
  }

  // Layer canvas -> premultiplied linear planes; emissive canvas (optional) added with HDR gain.
  function toPlanes(layer, w, h, gain) {
    const d = layer.canvas.getContext('2d').getImageData(0, 0, w, h).data;
    const e = layer.emissive ? layer.emissive.getContext('2d').getImageData(0, 0, w, h).data : null;
    const p = [0, 1, 2, 3].map(() => new Float32Array(w * h));
    for (let i = 0; i < w * h; i++) {
      const a = d[i * 4 + 3] / 255;
      for (let c = 0; c < 3; c++) p[c][i] = toLin[d[i * 4 + c]] * a + (e ? toLin[e[i * 4 + c]] * (e[i * 4 + 3] / 255) * gain : 0);
      p[3][i] = Math.max(a, e ? e[i * 4 + 3] / 255 : 0);
    }
    return p;
  }

  // Returns {imageData, layers:[{id, vergenceD, kernelSize}]}.
  function renderScene(scene, env, lens, rendered) {
    const { w, h } = scene, radPerPx = env.fovDeg * Math.PI / 180 / w;
    const acc = [0, 1, 2].map(() => new Float32Array(w * h)), info = [];
    if (rendered && lens.focusPerPupil) lens = Object.assign({}, lens, { focusOffsetD: Optics.bestFocus(lens, env.pupilMm, env.lambdaUm) });
    for (const layer of scene.layers) {
      let planes = toPlanes(layer, w, h, env.hdrGain || 1);
      const vergenceD = 1 / layer.distanceM;
      if (rendered) {
        const adds = (lens.foci || [{ addD: 0 }]).map(f => Math.abs(vergenceD - f.addD + (lens.focusOffsetD || 0)));
        const extentRad = Math.min(0.08, env.pupilMm * 1e-3 * Math.max(...adds, 0.5) * 1.3 + 0.004);
        const psf = Optics.psfForLayer({ pupilMm: env.pupilMm, lambdaUm: env.lambdaUm, vergenceD, lens, radPerPx, extentRad });
        planes = convolve(planes, w, h, psf.k, psf.size);
        info.push({ id: layer.id, vergenceD, kernelSize: psf.size });
      }
      for (let i = 0; i < w * h; i++) {
        const t = 1 - Math.min(1, Math.max(0, planes[3][i]));
        for (let c = 0; c < 3; c++) acc[c][i] = planes[c][i] + acc[c][i] * t;
      }
    }
    const img = new ImageData(w, h);
    for (let i = 0; i < w * h; i++) {
      for (let c = 0; c < 3; c++) img.data[i * 4 + c] = toSrgb(acc[c][i]);
      img.data[i * 4 + 3] = 255;
    }
    return { imageData: img, layers: info };
  }

  root.Renderer = { renderScene };
})(this);
