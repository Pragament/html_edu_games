/* Local A4 PDF export with vector text, grids, and QR code. */
function getWorksheetInstructions(puzzle) {
  return puzzle.instructions.replace(/\s*Select a word(?: for progressive hints| to reveal hints one at a time)\./gi, '').trim();
}

function createCrosswordPDF(puzzle, cells, rows, cols, options = {}) {
  const width = 595.28, height = 841.89, margin = 30;
  const contentWidth = width - margin * 2, gap = 18;
  const columnWidth = (contentWidth - gap) / 2;
  const fontSize = Math.max(8, Math.min(14, Number(options.textSize) || 9));
  const lineHeight = fontSize * 1.25;
  const pages = [];
  let commands, y;
  const clean = value => String(value).normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2010-\u2015]/g, '-').replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"').replace(/\u2022/g, ' / ')
    .replace(/[^\x20-\x7e]/g, ' ');
  const escape = value => clean(value).replace(/[\\()]/g, '\\$&');
  const watermark = options.watermark && clean(options.watermark.text || '').trim() ? options.watermark : null;
  const watermarkOpacity = watermark ? Math.max(0, Math.min(1, Number(watermark.opacity ?? 0.12))) : 0;
  function text(value, x, top, size = fontSize, bold = false) {
    commands.push(`BT /${bold ? 'F2' : 'F1'} ${size} Tf 0 g 1 0 0 1 ${x.toFixed(2)} ${(height - top).toFixed(2)} Tm (${escape(value)}) Tj ET`);
  }
  function wrap(value, size = fontSize, availableWidth = contentWidth) {
    const limit = Math.max(1, Math.floor(availableWidth / (size * 0.6)));
    const lines = [];
    let line = '';
    for (const word of clean(value).split(/\s+/)) {
      if (line && line.length + word.length + 1 > limit) { lines.push(line); line = ''; }
      let rest = word;
      while (rest.length > limit) {
        if (line) { lines.push(line); line = ''; }
        lines.push(rest.slice(0, limit)); rest = rest.slice(limit);
      }
      line += (line ? ' ' : '') + rest;
    }
    if (line) lines.push(line);
    return lines;
  }
  function qrCode(url) {
    const qr = qrcode(0, 'M');
    qr.addData(url); qr.make();
    const count = qr.getModuleCount(), size = 66;
    const module = size / (count + 8);
    const left = width - margin - size, top = margin;
    commands.push(`q 1 g ${left} ${height - top - size} ${size} ${size} re f Q`);
    // Four-module white quiet zone is included in the reserved area.
    for (let r = 0; r < count; r++) for (let c = 0; c < count; c++) {
      if (qr.isDark(r, c)) commands.push(`0 g ${(left + (c + 4) * module).toFixed(3)} ${(height - top - (r + 5) * module).toFixed(3)} ${module.toFixed(3)} ${module.toFixed(3)} re f`);
    }
    text('Play online', left, top + size + 8, 8);
  }
  function newPage(label, withQR = false) {
    commands = []; pages.push(commands); y = margin + 16;
    if (watermark) {
      let size = Math.max(12, Math.min(96, Number(watermark.size) || 48));
      let lines = wrap(watermark.text, size);
      // Fit long text inside the page without clipping it at large sizes.
      while (size + (lines.length - 1) * size * 1.2 > height - margin * 2) {
        size *= 0.95;
        lines = wrap(watermark.text, size);
      }
      const lineSpacing = size * 1.2;
      const blockHeight = size + (lines.length - 1) * lineSpacing;
      const top = watermark.position === 'top' ? margin
        : watermark.position === 'bottom' ? height - margin - blockHeight
        : (height - blockHeight) / 2;
      commands.push('q /WM gs');
      lines.forEach((line, index) => {
        const textWidth = line.length * size * 0.6;
        const x = watermark.alignment === 'left' ? margin
          : watermark.alignment === 'right' ? width - margin - textWidth
          : (width - textWidth) / 2;
        text(line, x, top + size + index * lineSpacing, size, true);
      });
      commands.push('Q');
    }
    const headerWidth = contentWidth - (withQR ? 84 : 0);
    for (const line of wrap(label, 16, headerWidth)) { text(line, margin, y, 16, true); y += 20; }
    for (const line of wrap(puzzle.title, fontSize, headerWidth)) { text(line, margin, y); y += lineHeight; }
    if (withQR && options.puzzleUrl) qrCode(options.puzzleUrl);
    if (withQR) y = Math.max(y + 6, margin + 86);
    else y += 10;
  }
  function paragraph(value) {
    for (const line of wrap(value)) {
      if (y + lineHeight > height - margin) newPage('Worksheet continued');
      text(line, margin, y); y += lineHeight;
    }
    y += 5;
  }
  function grid(answers) {
    const cellSize = Math.min(answers ? 16 : 18, contentWidth / cols, 220 / rows);
    const left = (width - cols * cellSize) / 2;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const cell = cells[`${r},${c}`];
      if (!cell) continue; // Unused spaces remain white, with no border or fill.
      const x = left + c * cellSize, top = y + r * cellSize;
      commands.push(`0 G 0.5 w ${x.toFixed(2)} ${(height - top - cellSize).toFixed(2)} ${cellSize.toFixed(2)} ${cellSize.toFixed(2)} re S`);
      if (cell.number) text(cell.number, x + 1, top + cellSize * 0.28, cellSize * 0.23);
      if (answers) text(cell.letter, x + cellSize * 0.32, top + cellSize * 0.78, cellSize * 0.6, true);
    }
    y += rows * cellSize + 16;
  }
  const ordered = direction => puzzle.words.filter(w => w.dir === direction).sort((a, b) => a.display - b.display);
  function clueBlocks(direction) {
    return ordered(direction).map(word => {
      const lines = wrap(`${word.display}. ${word.clue} (${word.answer.length})`, fontSize, columnWidth);
      for (const [index, hint] of (word.hints || []).entries()) {
        lines.push(...wrap(`Hint ${index + 1}: ${hint}`, fontSize, columnWidth));
      }
      if (word.explain) lines.push(...wrap(`Explanation: ${word.explain}`, fontSize, columnWidth));
      return lines;
    });
  }
  newPage('Crossword Worksheet', true);
  paragraph(puzzle.subtitle);
  paragraph(getWorksheetInstructions(puzzle));
  paragraph('Name: _______________________    Date: ______________');
  grid(false);
  const clues = [clueBlocks('across'), clueBlocks('down')];
  const positions = [0, 0];
  const lineOffsets = [0, 0];
  const continuationY = margin + 16 + 20 + wrap(puzzle.title).length * lineHeight + 10;
  const fullColumnCapacity = Math.floor((height - margin - continuationY) / lineHeight) - 2;
  while (positions.some((position, col) => position < clues[col].length)) {
    const startY = y;
    if (height - margin - startY < lineHeight * 4) { newPage('Clues continued'); continue; }
    for (let col = 0; col < 2; col++) {
      let top = startY;
      if (positions[col] >= clues[col].length) continue;
      text(col === 0 ? 'ACROSS' : 'DOWN', margin + col * (columnWidth + gap), top, fontSize, true);
      top += lineHeight * 2;
      while (positions[col] < clues[col].length) {
        const block = clues[col][positions[col]];
        const capacity = Math.floor((height - margin - top) / lineHeight);
        const remaining = block.length - lineOffsets[col];
        if (capacity <= 0 || (remaining > capacity && block.length <= fullColumnCapacity && lineOffsets[col] === 0)) break;
        const count = Math.min(remaining, capacity);
        for (const line of block.slice(lineOffsets[col], lineOffsets[col] + count)) {
          text(line, margin + col * (columnWidth + gap), top);
          top += lineHeight;
        }
        lineOffsets[col] += count;
        if (lineOffsets[col] < block.length) break;
        top += lineHeight;
        positions[col]++;
        lineOffsets[col] = 0;
      }
    }
    if (positions.some((position, col) => position < clues[col].length)) newPage('Clues continued');
  }
  if (options.includeAnswers !== false) {
    newPage('Answer Key & Explanations');
    grid(true);
    let col = 0, top = y, startY = y;
    function nextColumn() {
      if (col === 0) { col = 1; top = startY; }
      else { newPage('Answer Key continued'); col = 0; startY = y; top = y; }
    }
    for (const word of [...puzzle.words].sort((a, b) => a.display - b.display)) {
      const lines = [
        ...wrap(`${word.display} ${word.dir.toUpperCase()} - ${word.answer}`, fontSize, columnWidth).map(value => ({value, bold: true})),
        ...wrap(`${word.chapter}: ${word.explain}`, fontSize, columnWidth).map(value => ({value})),
        {value: ''}
      ];
      const blockHeight = lines.length * lineHeight;
      if (top + blockHeight > height - margin && blockHeight <= height - margin - startY) nextColumn();
      for (const line of lines) {
        if (top + lineHeight > height - margin) nextColumn();
        text(line.value, margin + col * (columnWidth + gap), top, fontSize, line.bold);
        top += lineHeight;
      }
    }
  }
  if (pages.length > 1) {
    pages.forEach((page, index) => {
      commands = page;
      text(`Page ${index + 1}`, margin, height - 16, 8);
    });
  }
  const objects = [null, '<< /Type /Catalog /Pages 2 0 R >>', '',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold >>'];
  const watermarkId = watermark ? objects.length : null;
  if (watermark) objects.push(`<< /Type /ExtGState /ca ${watermarkOpacity} /CA ${watermarkOpacity} >>`);
  const pageIds = [];
  for (const page of pages) {
    const pageId = objects.length, streamId = pageId + 1;
    pageIds.push(pageId);
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> ${watermark ? `/ExtGState << /WM ${watermarkId} 0 R >>` : ''} >> /Contents ${streamId} 0 R >>`);
    const stream = page.join('\n') + '\n';
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}endstream`);
  }
  objects[2] = `<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] >>`;
  let output = '%PDF-1.4\n';
  const offsets = [0];
  for (let i = 1; i < objects.length; i++) {
    offsets.push(output.length);
    output += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xref = output.length;
  output += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  output += offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
  output += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new Blob([output], {type: 'application/pdf'});
}
