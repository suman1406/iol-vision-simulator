(function () {
  const $ = id => document.getElementById(id);
  const lensSel = $('lens'), envSel = $('env'), canvas = $('view'), note = $('note');
  const ctx = canvas.getContext('2d');
  const scenes = {}, loaded = {}, cache = {}, lastInfo = {};
  const scene = env => loaded[env.id];
  const loadScene = env => scenes[env.id] || (scenes[env.id] = Scenes.load(env).then(s => (loaded[env.id] = s)));

  LENS_PROFILES.forEach(l => lensSel.add(new Option(l.name, l.id)));
  ENVIRONMENTS.forEach(e => envSel.add(new Option(e.name, e.id)));

  let token = 0;
  function render() {
    const lens = LENS_PROFILES.find(l => l.id === lensSel.value);
    const env = ENVIRONMENTS.find(e => e.id === envSel.value);
    const model = lens.optical ? OPTICAL_MODELS[lens.optical] : null;
    $('status').textContent = lens.statusText;
    $('status').className = 'badge ' + lens.status;
    const key = lens.id + '|' + env.id, my = ++token;
    $('credit').textContent = env.credit;
    const show = () => {
      const img = cache[key].imageData;
      if (canvas.width !== img.width || canvas.height !== img.height) { canvas.width = img.width; canvas.height = img.height; }
      ctx.putImageData(img, 0, 0);
      lastInfo.layers = cache[key].layers;
      note.textContent = model ? (lens.renderKind === 'generic' ? 'Generic demonstration — not a specific product.'
        : lens.renderKind === 'reference' ? 'No IOL: eye without any lens (aphakia), about +11 D out of focus. Illustrative.' : '')
        : 'Unprocessed source scene. This profile is not rendered: ' + lens.statusText.toLowerCase() + '.';
      note.style.display = note.textContent ? 'block' : 'none';
      renderMethod(lens, env, model);
    };
    if (cache[key]) return show();
    note.textContent = 'Computing optical simulation…'; note.style.display = 'block';
    loadScene(env).then(() => setTimeout(() => { // let the message paint first
      if (my !== token) return;
      cache[key] = Renderer.renderScene(scene(env), env, model, !!model);
      if (my === token) show();
    }, 30)).catch(err => { note.textContent = 'Scene could not be loaded (' + err.message + '). Serve the folder over http — see README.'; });
  }

  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  function refHtml(id, note) {
    const e = EVIDENCE[id];
    const hasSd = e.points.some(p => p.sd != null);
    const curve = e.points.length ? `<details><summary>Digitised defocus curve (${e.points.length} points)</summary>
      <div class="scroll"><table><tr><th>Defocus (D)</th><th>VA (logMAR)</th><th>${esc(e.errorBars ? '95% CI' : 'Error bar range')}</th>${hasSd ? '<th>SD</th>' : ''}</tr>
      ${e.points.map(p => `<tr><td>${p.d.toFixed(2)}</td><td>${p.va.toFixed(3)}</td><td>${p.lo.toFixed(3)} to ${p.hi.toFixed(3)}</td>${hasSd ? `<td>${p.sd.toFixed(3)}</td>` : ''}</tr>`).join('')}</table></div>
      <p class="small">Units: ${e.units.defocus}; ${e.units.va}.${e.errorBars ? ' Error bars: ' + esc(e.errorBars) + '.' : ''}</p></details>` : '';
    const v = e.version;
    const ver = v ? `<br>Version: record ${esc(v.recordVersion)} · source: ${esc(v.sourceVersion)} · retrieved ${esc(v.retrieved)}${v.changes ? ' · ' + esc(v.changes) : ''}` : '';
    return `<div class="ref"><b>${esc(e.title)}</b><br>${esc(e.authors)}. ${esc(e.venue)}, ${e.year}. <a href="${e.link}" target="_blank" rel="noopener">${e.link}</a>
      ${note ? `<br><i>Related only: ${esc(note)}</i>` : ''}
      <br>Type: ${e.kind} · Lens: ${esc(e.lenses)}<br>Design: ${esc(e.design)}<br>Conditions: ${esc(e.conditions)}<br>Location: ${esc(e.location)}
      <ul>${e.results.map(r => `<li>${esc(r)}</li>`).join('')}</ul>${curve}
      Data handling: ${esc(e.transcription)}.<br>Limitations: ${esc(e.limitations)}<br>Q1 status: not checked.${ver}</div>`;
  }

  const EFFECT_NAMES = { blur: 'Blur', contrast: 'Contrast loss', halo: 'Halo / glare', colour: 'Colour / red shift' };
  function effectsHtml(lens) {
    if (!lens.effects) return '';
    const rows = Object.entries(EFFECT_NAMES).map(([k, name]) => {
      const f = lens.effects[k];
      const ev = f.evidence.length ? f.evidence.map(id => esc(EVIDENCE[id].authors.split(/[,;]/)[0] + ' ' + EVIDENCE[id].year)).join('; ') : '—';
      return `<tr><td>${name}</td><td class="st-${f.status.replace(/ /g, '-')}">${esc(f.status)}</td><td>${esc(f.basis)}</td><td>${ev}</td></tr>`;
    }).join('');
    return `<h4>Effects and their evidence</h4><div class="scroll"><table class="effects"><tr><th>Effect</th><th>Status</th><th>Basis</th><th>Evidence</th></tr>${rows}</table></div>
      <p class="small">Blur, contrast loss and halos are not separate settings: all three follow from one physically computed point-spread function, so none can be exaggerated on its own.</p>`;
  }

  function renderMethod(lens, env, model) {
    const layers = scene(env).layers.map(l => {
      const k = (lastInfo.layers || []).find(i => i.id === l.id);
      return `<li>${esc(l.label)}: ${(1 / l.distanceM).toFixed(2)} D${k ? `, PSF kernel ${k.kernelSize}×${k.kernelSize} px` : ''}</li>`;
    }).join('');
    const foci = model && model.foci.length > 1 ? `<p>Foci (add, light weight): ${model.foci.map(f => `${f.addD >= 0 ? '+' : ''}${f.addD.toFixed(2)} D @ ${(f.weight * 100).toFixed(1)}%`).join(', ')}.</p>` : '';
    $('method-body').innerHTML = `
      <h3>${esc(lens.name)}</h3><p>${esc(lens.model)} — <b>${esc(lens.statusText)}</b></p><p>${esc(lens.summary)}</p>
      ${effectsHtml(lens)}
      <h4>Optical rendering model</h4>
      ${model ? `<p><b>${esc(model.label)}</b> (${model.kind === 'lens-specific-measured' ? 'lens-specific measured data' : 'generic, labelled assumptions'}).</p>${foci}
        ${model.version ? `<p class="small">Model version ${esc(model.version.modelVersion)} (${esc(model.version.date)}) · derived from: ${esc(model.version.derivedFrom)}${model.version.changes ? ' · ' + esc(model.version.changes) : ''}</p>` : ''}
        <ul>${model.assumptions.map(a => `<li>${esc(a)}</li>`).join('')}</ul>`
        : '<p>No rendering applied. No blur, halo, glare or colour effect is invented for this profile.</p>'}
      <h4>Environment: ${esc(env.name)}</h4>
      <ul>${env.notes.map(n => `<li>${esc(n)}</li>`).join('')}<li>Monochromatic ${env.lambdaUm * 1000} nm; field of view ${env.fovDeg}° across ${scene(env).w} px</li></ul>
      <p>Depth layers (object vergence):</p><ul>${layers}</ul>
      <h4>Method (identical for every profile)</h4>
      <ol><li>Wavefront in the pupil = lens wavefront (if measured) + defocus for each layer's distance and each focus of the lens.</li>
        <li>PSF = |Fourier transform of the pupil function|², summed over foci by light weight (incoherent), binned to screen pixels.</li>
        <li>Each depth layer is convolved with its PSF in linear light, then layers are composited far to near. Halos and contrast loss arise only from these PSFs; nothing is drawn on top.</li>
        <li>No colour shift is applied: no evidence for one has been loaded, and the model is monochromatic.</li></ol>
      <p class="small">Approximations: layered (not continuous) depth; occlusion edges approximate; no corneal aberrations, scatter, chromatic aberration, retinal or neural processing; display cannot reproduce real luminance. Engine checks (validate.js): diffraction-limited MTF matches theory (0.807 vs 0.807); the PureSee model reproduces the bench through-focus MTF at 3 mm (peak 0.38 vs 0.41; near-side secondary at +2.1 D, 0.13 vs 0.09); the Vivity model matches an independent bench at distance (0.33 vs 0.325 at 3 mm) but places its intermediate peak closer (≈1.3 vs 1.75 D) and, at 3 mm, stronger than measured.</p>
      <h4>Evidence</h4>
      ${lens.references.length ? lens.references.map(id => refHtml(id)).join('') : '<p><b>No verified lens-specific sources.</b></p>'}
      ${(lens.related || []).map(r => refHtml(r.id, r.note)).join('')}
      <h4>Scene</h4><p class="small">${esc(env.credit)}. One fixed photograph per environment, identical for all profiles, split into depth layers with hand-traced masks (tools/prepare_scenes.py). Full attribution: assets/ATTRIBUTION.md.</p>
      <p class="small">Clinical defocus curves are shown as clinical evidence and are not converted into pixel blur.</p>
      <p class="small">Evidence set version ${esc(window.EVIDENCE_SET_VERSION)}.</p>`;
  }

  lensSel.onchange = envSel.onchange = render;
  $('open-method').onclick = () => $('method').showModal();
  $('close-method').onclick = () => $('method').close();
  $('method').addEventListener('click', e => { // tap on the backdrop (outside the panel) to close
    const r = $('method').getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) $('method').close();
  });
  render();
})();
