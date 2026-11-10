export const AI_NEWSROOM_SCRIPT = `
(function() {
  if (window.__PUNTO_AI_MOUNTED__) return;
  window.__PUNTO_AI_MOUNTED__ = true;

  const style = document.createElement('style');
  style.textContent = \`
    .pulso-ai-fab {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 99999;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: linear-gradient(135deg, #1E3A8A 0%, #B91C1C 100%);
      color: #FFFFFF;
      border: 1px solid rgba(255,255,255,0.22);
      border-radius: 999px;
      padding: 13px 22px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.02em;
      box-shadow: 0 12px 30px rgba(30, 58, 138, 0.35), 0 4px 10px rgba(0,0,0,0.2);
      cursor: pointer;
      transition: transform 0.18s ease, box-shadow 0.18s ease;
    }
    .pulso-ai-fab:hover {
      transform: translateY(-2px);
      box-shadow: 0 16px 36px rgba(30, 58, 138, 0.45), 0 6px 14px rgba(0,0,0,0.25);
    }
    .pulso-ai-fab-badge {
      background: rgba(255,255,255,0.2);
      padding: 2px 8px;
      border-radius: 99px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
    }
    .pulso-ai-backdrop {
      position: fixed;
      inset: 0;
      z-index: 100000;
      background: rgba(15, 23, 42, 0.72);
      backdrop-filter: blur(5px);
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .pulso-ai-backdrop.open {
      display: flex;
    }
    .pulso-ai-modal {
      background: #FFFFFF;
      width: 100%;
      max-width: 680px;
      border-radius: 14px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.35);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      max-height: 92vh;
      border: 1px solid #E2E8F0;
    }
    .pulso-ai-header {
      background: #0F172A;
      color: #FFFFFF;
      padding: 18px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .pulso-ai-header h3 {
      margin: 0;
      font-size: 17px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .pulso-ai-header p {
      margin: 4px 0 0;
      font-size: 12.5px;
      color: #94A3B8;
    }
    .pulso-ai-close {
      background: rgba(255,255,255,0.1);
      color: #FFF;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      font-size: 18px;
      cursor: pointer;
    }
    .pulso-ai-tabs {
      display: flex;
      background: #F1F5F9;
      padding: 6px;
      gap: 6px;
      border-bottom: 1px solid #E2E8F0;
    }
    .pulso-ai-tab {
      flex: 1;
      border: none;
      background: transparent;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13.5px;
      font-weight: 700;
      color: #475569;
      cursor: pointer;
      transition: all 0.15s;
    }
    .pulso-ai-tab.active {
      background: #FFFFFF;
      color: #1E3A8A;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    .pulso-ai-body {
      padding: 20px 24px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .pulso-ai-field label {
      display: block;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #334155;
      margin-bottom: 6px;
    }
    .pulso-ai-field input,
    .pulso-ai-field textarea {
      width: 100%;
      box-sizing: border-box;
      padding: 11px 14px;
      border: 1.5px solid #CBD5E1;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      color: #0F172A;
    }
    .pulso-ai-field textarea {
      min-height: 120px;
      resize: vertical;
    }
    .pulso-ai-status {
      padding: 12px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      display: none;
    }
    .pulso-ai-status.loading {
      display: block;
      background: #EFF6FF;
      color: #1E40AF;
      border: 1px solid #BFDBFE;
    }
    .pulso-ai-status.error {
      display: block;
      background: #FEF2F2;
      color: #991B1B;
      border: 1px solid #FECACA;
    }
    .pulso-ai-status.success {
      display: block;
      background: #F0FDF4;
      color: #166534;
      border: 1px solid #BBF7D0;
    }
    .pulso-ai-footer {
      padding: 16px 24px;
      background: #F8FAFC;
      border-top: 1px solid #E2E8F0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .pulso-ai-submit {
      background: #1E3A8A;
      color: #FFFFFF;
      border: none;
      padding: 11px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
    }
    .pulso-ai-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  \`;
  document.head.appendChild(style);

  const fab = document.createElement('button');
  fab.className = 'pulso-ai-fab';
  fab.innerHTML = '<span>✨ Redactar con IA</span><span class="pulso-ai-fab-badge">Gemini</span>';
  document.body.appendChild(fab);

  const backdrop = document.createElement('div');
  backdrop.className = 'pulso-ai-backdrop';
  backdrop.innerHTML = \`
    <div class="pulso-ai-modal">
      <div class="pulso-ai-header">
        <div>
          <h3>✨ Sala de Redacción IA — Punto Cuenca</h3>
          <p>Genera una noticia completa desde un enlace o boletín de prensa y rellena el editor automáticamente.</p>
        </div>
        <button class="pulso-ai-close" id="pulso-ai-close">&times;</button>
      </div>
      <div class="pulso-ai-tabs">
        <button class="pulso-ai-tab active" data-mode="url">🔗 Desde URL / Link de Noticia</button>
        <button class="pulso-ai-tab" data-mode="text">📋 Pegar Boletín / Texto</button>
      </div>
      <div class="pulso-ai-body">
        <div class="pulso-ai-field" id="pulso-field-url">
          <label>Enlace (URL) de la noticia o comunicado</label>
          <input type="url" id="pulso-input-url" placeholder="https://..." />
        </div>
        <div class="pulso-ai-field" id="pulso-field-text" style="display:none;">
          <label>Texto del boletín, declaraciones o apuntes</label>
          <textarea id="pulso-input-text" placeholder="Pega aquí el boletín de prensa o los datos de la noticia..."></textarea>
        </div>
        <div class="pulso-ai-field">
          <label>Instrucción o enfoque editorial (Opcional)</label>
          <input type="text" id="pulso-input-instructions" placeholder="Ej. Destacar el impacto para Cuenca y la provincia del Azuay..." />
        </div>
        <div class="pulso-ai-status" id="pulso-ai-status"></div>
      </div>
      <div class="pulso-ai-footer">
        <span style="font-size:12px;color:#64748B;">Revisa siempre el borrador antes de hacer clic en Publicar.</span>
        <button class="pulso-ai-submit" id="pulso-ai-generate">⚡ Generar y Rellenar Nota</button>
      </div>
    </div>
  \`;
  document.body.appendChild(backdrop);

  let currentMode = 'url';
  const tabs = backdrop.querySelectorAll('.pulso-ai-tab');
  const fieldUrl = backdrop.querySelector('#pulso-field-url');
  const fieldText = backdrop.querySelector('#pulso-field-text');
  const statusEl = backdrop.querySelector('#pulso-ai-status');
  const btnGenerate = backdrop.querySelector('#pulso-ai-generate');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentMode = tab.getAttribute('data-mode');
      fieldUrl.style.display = currentMode === 'url' ? 'block' : 'none';
      fieldText.style.display = currentMode === 'text' ? 'block' : 'none';
    });
  });

  fab.addEventListener('click', () => {
    if (!window.location.hash.includes('/collections/noticias/entries/') && !window.location.hash.includes('/collections/noticias/new')) {
      window.location.hash = '#/collections/noticias/new';
    }
    backdrop.classList.add('open');
  });

  backdrop.querySelector('#pulso-ai-close').addEventListener('click', () => {
    backdrop.classList.remove('open');
  });

  function setStatus(type, msg) {
    statusEl.className = 'pulso-ai-status ' + type;
    statusEl.textContent = msg;
  }

  function setNativeValue(element, value) {
    if (!element) return false;
    const prototype = Object.getPrototypeOf(element);
    const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value') || Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value') || Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
    if (descriptor && descriptor.set) {
      descriptor.set.call(element, value);
    } else {
      element.value = value;
    }
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
    return true;
  }

  function findInputByLabelText(labelSubstr) {
    const labels = Array.from(document.querySelectorAll('label'));
    const targetLabel = labels.find(l => (l.textContent || '').toLowerCase().includes(labelSubstr.toLowerCase()));
    if (!targetLabel) return null;
    const forId = targetLabel.getAttribute('for');
    if (forId) {
      const byId = document.getElementById(forId);
      if (byId) return byId;
    }
    const container = targetLabel.closest('div[class]') || targetLabel.parentElement;
    if (container) {
      return container.querySelector('input, textarea');
    }
    return null;
  }

  async function fillDecapEditor(draft, scrapedImage) {
    for (let i = 0; i < 15; i++) {
      if (findInputByLabelText('Titular de la Noticia')) break;
      await new Promise(r => setTimeout(r, 250));
    }

    const titleInput = findInputByLabelText('Titular de la Noticia');
    const subtitleInput = findInputByLabelText('Subtítulo');
    const authorInput = findInputByLabelText('Autor');
    const captionInput = findInputByLabelText('Pie de Foto');
    const readTimeInput = findInputByLabelText('Tiempo de Lectura');

    if (draft.title) setNativeValue(titleInput, draft.title);
    if (draft.subtitle) setNativeValue(subtitleInput, draft.subtitle);
    if (draft.author) setNativeValue(authorInput, draft.author);
    if (draft.imageCaption) setNativeValue(captionInput, draft.imageCaption);
    if (draft.readTime) setNativeValue(readTimeInput, draft.readTime);

    if (draft.body) {
      const mdButtons = Array.from(document.querySelectorAll('button'));
      const rawToggle = mdButtons.find(b => (b.textContent || '').toLowerCase().includes('markdown') || (b.getAttribute('title') || '').toLowerCase().includes('markdown'));
      const codeMirror = document.querySelector('.CodeMirror');
      if (codeMirror && codeMirror.CodeMirror) {
        codeMirror.CodeMirror.setValue(draft.body);
      } else {
        const slateEditor = document.querySelector('[data-slate-editor="true"]');
        if (slateEditor) {
          slateEditor.focus();
          document.execCommand('selectAll', false, null);
          document.execCommand('insertText', false, draft.body);
        }
      }
    }
  }

  btnGenerate.addEventListener('click', async () => {
    const urlVal = backdrop.querySelector('#pulso-input-url').value.trim();
    const textVal = backdrop.querySelector('#pulso-input-text').value.trim();
    const instructionsVal = backdrop.querySelector('#pulso-input-instructions').value.trim();

    if (currentMode === 'url' && !urlVal) {
      setStatus('error', 'Por favor ingresa una URL válida.');
      return;
    }
    if (currentMode === 'text' && textVal.length < 20) {
      setStatus('error', 'Por favor pega el texto del boletín o nota (mínimo 20 caracteres).');
      return;
    }

    btnGenerate.disabled = true;
    setStatus('loading', '⏳ Analizando información y redactando nota periodística con Gemini IA...');

    try {
      let token = '';
      if (window.netlifyIdentity && window.netlifyIdentity.currentUser()) {
        token = await window.netlifyIdentity.currentUser().jwt();
      } else {
        const rawUser = localStorage.getItem('gotrue.user');
        if (rawUser) {
          const parsed = JSON.parse(rawUser);
          token = parsed?.token?.access_token || '';
        }
      }

      const res = await fetch('/.netlify/functions/ai-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': 'Bearer ' + token } : {})
        },
        body: JSON.stringify({
          mode: currentMode,
          url: urlVal,
          rawText: textVal,
          instructions: instructionsVal
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al generar borrador con IA.');
      }

      await fillDecapEditor(data.draft, data.scrapedImage);
      setStatus('success', '✅ ¡Nota redactada e insertada en el editor! Revisa los campos y sube la fotografía.');
      setTimeout(() => {
        backdrop.classList.remove('open');
      }, 1100);
    } catch (err) {
      setStatus('error', '❌ ' + (err.message || 'Ocurrió un error al redactar la nota.'));
    } finally {
      btnGenerate.disabled = false;
    }
  });
})();
`;
