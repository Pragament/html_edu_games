/* A4 worksheet export. Coordinates use a top-left origin. */
function createWordScramblePDF(puzzle, entries, options = {}) {
  const width = 595.28, height = 841.89, margin = 36;
  const available = width - 2 * margin;
  const gap = 18, columnWidth = (available - gap) / 2;
  const valuesSize = Math.max(6, Math.min(14, Number(options.textSize) || 9));
  const watermark = options.watermark && String(options.watermark.text || '').trim() ? options.watermark : null;
  const opacity = watermark ? Math.max(0, Math.min(1, Number(watermark.opacity ?? 0.12))) : 0;
  const pages = [];
  let commands, y;
  const clean = value => String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2010-\u2015]/g, '-').replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"').replace(/\u2022/g, ' / ').replace(/[^\x20-\x7e]/g, ' ');
  const escape = value => clean(value).replace(/[\\()]/g, '\\$&');
  function text(value, x, top, size = 10, bold = false) {
    commands.push(`BT /${bold ? 'F2' : 'F1'} ${size} Tf 0 g 1 0 0 1 ${x.toFixed(2)} ${(height - top).toFixed(2)} Tm (${escape(value)}) Tj ET`);
  }
  function wrap(value, size = 10, lineWidth = available) {
    const limit = Math.max(1, Math.floor(lineWidth / (size * 0.6)));
    const lines = [];
    let line = '';
    for (const word of clean(value).split(/\s+/)) {
      if (line && line.length + word.length + 1 > limit) { lines.push(line); line = ''; }
      let rest = word;
      while (rest.length > limit) { if (line) { lines.push(line); line = ''; } lines.push(rest.slice(0, limit)); rest = rest.slice(limit); }
      line += (line ? ' ' : '') + rest;
    }
    if (line) lines.push(line);
    return lines;
  }
  function page(label) {
    commands = []; pages.push(commands); y = margin + 16;
    if (watermark) {
      let size = Math.max(12, Math.min(96, Number(watermark.size) || 48));
      let lines = wrap(watermark.text, size);
      while (size + (lines.length - 1) * size * 1.2 > height - 2 * margin) {
        size *= 0.95; lines = wrap(watermark.text, size);
      }
      const blockHeight = size + (lines.length - 1) * size * 1.2;
      const top = watermark.position === 'top' ? margin : watermark.position === 'bottom' ? height - margin - blockHeight : (height - blockHeight) / 2;
      commands.push('q /WM gs');
      lines.forEach((line, i) => {
        const textWidth = line.length * size * 0.6;
        const x = watermark.alignment === 'left' ? margin : watermark.alignment === 'right' ? width - margin - textWidth : (width - textWidth) / 2;
        text(line, x, top + size + i * size * 1.2, size, true);
      });
      commands.push('Q');
    }
    if (label) { text(label, margin, y, 16, true); y += 24; }
  }
  function paragraph(value, size = 10, bold = false) {
    for (const line of wrap(value, size)) {
      if (y + size * 1.3 > height - margin) page('Word Scramble continued');
      text(line, margin, y, size, bold); y += size * 1.3;
    }
    y += 6;
  }
  page('');
  let headerY = margin + 16;
  const headerWidth = available - (options.puzzleUrl ? 84 : 0);
  function header(value, fontSize = 10, bold = false) {
    for (const line of wrap(value, fontSize, headerWidth)) {
      text(line, margin, headerY, fontSize, bold); headerY += fontSize * 1.3;
    }
    headerY += 8;
  }
  header('Word Scramble Worksheet', 16, true);
  header(puzzle.title.replace(/Crossword/gi, 'Word Scramble'), 11, true);
  header(puzzle.subtitle);
  if (options.puzzleUrl) {
    const qr = qrcode(0, 'M'); qr.addData(options.puzzleUrl); qr.make();
    const count = qr.getModuleCount(), qrSize = 66, module = qrSize / (count + 8), left = width - margin - qrSize;
    commands.push(`q 1 g ${left} ${height - margin - qrSize} ${qrSize} ${qrSize} re f Q`);
    for (let r = 0; r < count; r++) for (let c = 0; c < count; c++) if (qr.isDark(r, c)) {
      commands.push(`0 g ${(left + (c + 4) * module).toFixed(3)} ${(height - margin - (r + 5) * module).toFixed(3)} ${module.toFixed(3)} ${module.toFixed(3)} re f`);
    }
    text('Play online', left, margin + qrSize + 9, 8);
    headerY = Math.max(headerY, margin + 92);
  }
  header('Read each description and rearrange the scrambled letters to name the value or good habit. Write your answer on the line.');
  header('Name: ___________________________   Date: ______________');
  y = headerY + 12;
  let column = 0, startY = y, top = y;
  const lineHeight = valuesSize * 1.3;
  function nextColumn() {
    if (column === 0) { column = 1; top = startY; }
    else { page('Word Scramble continued'); column = 0; startY = y; top = y; }
  }
  puzzle.words.forEach((word, index) => {
    const lines = [
      ...wrap(`${index + 1}. ${entries[index].scramble} (${word.answer.length} letters)`, valuesSize, columnWidth).map(value => ({value, bold: true})),
      ...wrap(word.clue || '', valuesSize, columnWidth).map(value => ({value})),
      {value: ''},
      ...wrap('Answer: ' + '_'.repeat(word.answer.length), valuesSize, columnWidth).map(value => ({value})),
      {value: ''}, {value: ''}
    ];
    if (top + lines.length * lineHeight > height - margin && lines.length * lineHeight <= height - margin - startY) nextColumn();
    for (const line of lines) {
      if (top + lineHeight > height - margin) nextColumn();
      text(line.value, margin + column * (columnWidth + gap), top, valuesSize, line.bold);
      top += lineHeight;
    }
  });
  if (pages.length > 1) pages.forEach((pageCommands, i) => {
    commands = pageCommands; text(`Page ${i + 1}`, margin, height - 18, 8);
  });
  const objects = [null, '<< /Type /Catalog /Pages 2 0 R >>', '',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold >>'];
  const watermarkId = watermark ? objects.length : null;
  if (watermark) objects.push(`<< /Type /ExtGState /ca ${opacity} /CA ${opacity} >>`);
  const ids = [];
  for (const pageCommands of pages) {
    const id = objects.length, streamId = id + 1; ids.push(id);
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> ${watermark ? `/ExtGState << /WM ${watermarkId} 0 R >>` : ''} >> /Contents ${streamId} 0 R >>`);
    const stream = pageCommands.join('\n') + '\n';
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}endstream`);
  }
  objects[2] = `<< /Type /Pages /Count ${ids.length} /Kids [${ids.map(id => `${id} 0 R`).join(' ')}] >>`;
  let output = '%PDF-1.4\n'; const offsets = [0];
  for (let i = 1; i < objects.length; i++) { offsets.push(output.length); output += `${i} 0 obj\n${objects[i]}\nendobj\n`; }
  const xref = output.length;
  output += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  output += offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
  output += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new Blob([output], {type: 'application/pdf'});
}
