// Fixed photographic scenes, pre-split into depth layers by tools/prepare_scenes.py.
// Layer files and distances are declared per environment in data/lensProfiles.js (ENVIRONMENTS[].layers).
(function (root) {
  const loadImg = src => new Promise((ok, fail) => {
    const im = new Image(); im.onload = () => ok(im); im.onerror = () => fail(new Error('Could not load ' + src)); im.src = src;
  });
  const toCanvas = im => {
    const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
    c.getContext('2d').drawImage(im, 0, 0); return c;
  };

  async function load(env) {
    const layers = [];
    for (const l of env.layers) {
      const canvas = toCanvas(await loadImg(l.file));
      const emissive = l.emissive ? toCanvas(await loadImg(l.emissive)) : null;
      layers.push({ id: l.id, label: l.label, distanceM: l.distanceM, canvas, emissive });
    }
    return { w: layers[0].canvas.width, h: layers[0].canvas.height, layers };
  }

  root.Scenes = { load };
})(this);
