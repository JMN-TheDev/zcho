(() => {
  const MODEL_URL = 'https://teachablemachine.withgoogle.com/models/9vyxPItyW/';
  const $ = (id) => document.getElementById(id);
  const input = $('file-input'), zone = $('dropzone'), modelStatus = $('model-status');
  const modelIndicator = $('model-indicator'), modelError = $('model-error');
  const resultContent = $('result-content'), predictions = $('predictions');
  const cameraArea = $('camera-area'), video = $('camera-video');
  let model = null, loading = null, stream = null, activeImage = null;

  function setStatus(text, ready = false) {
    modelStatus.textContent = text;
    modelIndicator.style.background = ready ? '#d8f56b' : '#85aaa1';
  }

  async function ensureModel() {
    if (model) return model;
    if (loading) return loading;
    if (!window.tmImage) throw new Error('The model library could not load. Check your internet connection and reload the page.');
    setStatus('LOADING MODEL');
    $('result-hint').textContent = 'Loading your project model…';
    loading = tmImage.load(MODEL_URL + 'model.json', MODEL_URL + 'metadata.json')
      .then((loaded) => { model = loaded; setStatus('MODEL READY', true); $('result-hint').textContent = 'Ready to scan'; return model; })
      .catch((error) => { loading = null; setStatus('MODEL UNAVAILABLE'); throw error; });
    return loading;
  }

  function showError(error) {
    modelError.hidden = false;
    modelError.textContent = error?.message || 'Could not analyze that image. Try another image or check the model connection.';
  }

  function renderResults(items) {
    const sorted = [...items].sort((a, b) => b.probability - a.probability);
    const best = sorted[0];
    resultContent.hidden = true;
    predictions.hidden = false;
    predictions.replaceChildren();
    const headline = document.createElement('div');
    headline.className = 'result-content';
    headline.style.cssText = 'display:block;min-height:0;padding:8px 0 18px;text-align:left';
    const title = document.createElement('h3');
    title.style.cssText = 'font:600 18px Manrope,sans-serif;color:#173f43;margin:0 0 6px;text-transform:capitalize';
    title.textContent = best.className;
    const confidence = document.createElement('p');
    confidence.style.cssText = 'font:10px "DM Mono",monospace;color:#76918c;margin:0';
    confidence.textContent = `TOP MATCH · ${(best.probability * 100).toFixed(1)}% confidence`;
    headline.append(title, confidence);
    predictions.append(headline);
    sorted.slice(0, 4).forEach((item, index) => {
      const row = document.createElement('div'); row.className = 'pred-row';
      const label = document.createElement('div'); label.className = 'pred-label';
      const name = document.createElement('span'); name.textContent = item.className;
      const percent = document.createElement('strong'); percent.textContent = `${(item.probability * 100).toFixed(1)}%`;
      const bar = document.createElement('div'); bar.className = 'pred-bar';
      const fill = document.createElement('i'); fill.style.width = `${Math.max(2, item.probability * 100)}%`;
      bar.append(fill); label.append(name, percent); row.append(label, bar); predictions.append(row);
    });
    $('result-hint').textContent = 'Model prediction · verify visually';
  }

  async function classify(source) {
    modelError.hidden = true;
    $('result-hint').textContent = 'Analyzing image…';
    try {
      const active = await ensureModel();
      const result = await active.predict(source);
      renderResults(result);
    } catch (error) {
      showError(error); $('result-hint').textContent = 'Could not complete scan';
    }
  }

  function selectFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    if (activeImage) URL.revokeObjectURL(activeImage);
    activeImage = URL.createObjectURL(file);
    const img = $('preview-image'); img.src = activeImage;
    img.onload = () => classify(img);
    $('preview-frame').hidden = false;
    $('preview-area').hidden = true;
    $('upload-title').textContent = file.name;
    $('upload-sub').textContent = 'Image selected · analyze with your project model';
    $('choose-image').innerHTML = 'Choose another <span>↑</span>';
  }

  $('choose-image').addEventListener('click', (event) => { event.stopPropagation(); input.click(); });
  zone.addEventListener('click', (event) => { if (!event.target.closest('button')) input.click(); });
  zone.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); input.click(); } });
  input.addEventListener('change', () => selectFile(input.files?.[0]));
  ['dragenter', 'dragover'].forEach((name) => zone.addEventListener(name, (event) => { event.preventDefault(); zone.classList.add('dragging'); }));
  ['dragleave', 'drop'].forEach((name) => zone.addEventListener(name, (event) => { event.preventDefault(); zone.classList.remove('dragging'); }));
  zone.addEventListener('drop', (event) => selectFile(event.dataTransfer.files?.[0]));

  $('camera-button').addEventListener('click', async () => {
    modelError.hidden = true;
    if (!navigator.mediaDevices?.getUserMedia) { showError(new Error('Camera access needs a secure page (HTTPS or localhost) and a browser that supports camera access.')); return; }
    try {
      await ensureModel();
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      video.srcObject = stream;
      cameraArea.hidden = false;
      $('camera-button').textContent = '◎ Camera on';
      $('result-hint').textContent = 'Camera ready · point at an item and scan';
    } catch (error) {
      showError(error.name === 'NotAllowedError' ? new Error('Camera permission was blocked. Allow camera access in your browser, then try again.') : error);
    }
  });
  $('capture-button').addEventListener('click', () => { if (video.readyState >= 2) classify(video); });
  $('camera-close').addEventListener('click', () => {
    stream?.getTracks().forEach((track) => track.stop()); stream = null; video.srcObject = null;
    cameraArea.hidden = true; $('camera-button').innerHTML = '<span>◎</span> Use camera';
  });
})();
