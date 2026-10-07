/* PDF preferences are independent of crossword and game progress. */
const wordSearchPDFControls = [...document.querySelectorAll('#pdf-options input, #pdf-options select')];
const wordSearchPDFKey = 'wordSearch.pdfOptions.v1';
function refreshWordSearchPDFLabels() {
  for (const [id, suffix] of [['pdf-text-size', ' pt'], ['pdf-watermark-opacity', '%'], ['pdf-watermark-size', ' pt']]) {
    document.getElementById(`${id}-value`).value = `${document.getElementById(id).value}${suffix}`;
  }
}
function saveWordSearchPDFOptions() {
  try {
    localStorage.setItem(wordSearchPDFKey, JSON.stringify(Object.fromEntries(wordSearchPDFControls.map(control => [control.id, control.type === 'checkbox' ? control.checked : control.value]))));
  } catch { /* Controls still work without storage. */ }
}
try {
  const saved = JSON.parse(localStorage.getItem(wordSearchPDFKey));
  if (saved && typeof saved === 'object' && !Array.isArray(saved)) for (const control of wordSearchPDFControls) {
    const value = saved[control.id];
    if (control.type === 'checkbox') { if (typeof value === 'boolean') control.checked = value; }
    else if (control.type === 'range') {
      if ((typeof value === 'number' || typeof value === 'string') && value !== '' && Number.isFinite(Number(value))) {
        const min = Number(control.min), step = Number(control.step) || 1;
        control.value = Math.min(Number(control.max), Math.max(min, min + Math.round((Number(value) - min) / step) * step));
      }
    } else if (control.tagName === 'SELECT') {
      if ([...control.options].some(option => option.value === value)) control.value = value;
    } else if (typeof value === 'string') control.value = value.slice(0, control.maxLength);
  }
} catch { /* Ignore invalid stored settings. */ }
refreshWordSearchPDFLabels();
for (const eventName of ['input', 'change']) document.getElementById('pdf-options').addEventListener(eventName, event => {
  if (event.target.id === 'pdf-watermark-text') document.getElementById('pdf-watermark-enabled').checked = event.target.value.trim().length > 0;
  refreshWordSearchPDFLabels(); saveWordSearchPDFOptions();
});
document.getElementById('reset-pdf-options').addEventListener('click', () => {
  for (const control of wordSearchPDFControls) {
    if (control.type === 'checkbox') control.checked = control.defaultChecked;
    else if (control.tagName === 'SELECT') control.value = ([...control.options].find(option => option.defaultSelected) || control.options[0]).value;
    else control.value = control.defaultValue;
  }
  refreshWordSearchPDFLabels(); saveWordSearchPDFOptions();
  document.getElementById('pdf-status').textContent = 'PDF options reset to defaults.';
});
function getWordSearchPDFOptions() {
  saveWordSearchPDFOptions();
  const value = id => document.getElementById(id).value;
  return {
    textSize: Number(value('pdf-text-size')),
    watermark: document.getElementById('pdf-watermark-enabled').checked ? {
      text: value('pdf-watermark-text').trim(), opacity: Number(value('pdf-watermark-opacity')) / 100,
      size: Number(value('pdf-watermark-size')), position: value('pdf-watermark-position'), alignment: value('pdf-watermark-alignment')
    } : null
  };
}
