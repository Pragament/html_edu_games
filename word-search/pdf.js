/* A4 worksheet export. Coordinates use a top-left origin. */
function createWordSearchPDF(puzzle, board) {
  const width = 595.28, height = 841.89, margin = 36;
  const available = width - 2 * margin;
  const pages = [];
  let commands, y;
  const clean = value => String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2010-\u2015]/g, '-').replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"').replace(/\u2022/g, ' / ').replace(/[^\x20-\x7e]/g, ' ');
  const escape = value => clean(value).replace(/[\\()]/g, '\\$&');
  function text(value, x, top, size = 10, bold = false) {
    commands.push(`BT /${bold ? 'F2' : 'F1'} ${size} Tf 0 g 1 0 0 1 ${x.toFixed(2)} ${(height - top).toFixed(2)} Tm (${escape(value)}) Tj ET`);
  }
  function wrap(value, size = 10) {
    const limit = Math.floor(available / (size * 0.6));
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
    text(label, margin, y, 16, true); y += 24;
  }
  function paragraph(value, size = 10, bold = false) {
    for (const line of wrap(value, size)) {
      if (y + size * 1.3 > height - margin) page('Word Search continued');
      text(line, margin, y, size, bold); y += size * 1.3;
    }
    y += 6;
  }
  page('Word Search Worksheet');
  paragraph(puzzle.title.replace(/Crossword/gi, 'Word Search'), 11, true);
  paragraph(puzzle.subtitle);
  paragraph('Name: ___________________________    Date: ______________');
  paragraph('Find and circle each word. Words may run horizontally, vertically, or diagonally, forwards or backwards.');
  const cellSize = Math.min(25, available / board.size, 360 / board.size);
  const gridWidth = cellSize * board.size;
  const left = (width - gridWidth) / 2;
  y += 8;
  if (y + gridWidth > height - margin - 70) page('Word Search Worksheet');
  const size = cellSize * 0.58;
  for (let r = 0; r < board.size; r++) for (let c = 0; c < board.size; c++) {
    text(board.letters[r][c], left + c * cellSize + (cellSize - size * 0.6) / 2,
      y + r * cellSize + cellSize * 0.7, size, true);
  }
  y += gridWidth + 24;
  paragraph('Words to find', 12, true);
  paragraph(board.placements.map(p => p.answer).join('   /   '), 11);
  y += 8;
  paragraph('Values to explore', 12, true);
  for (const placement of board.placements) {
    const word = puzzle.words.find(w => w.answer === placement.answer);
    if (y + 55 > height - margin) page('Values to explore');
    paragraph(word.answer, 11, true);
    if (word.clue) paragraph(word.clue);
    if (word.explain) paragraph(word.explain);
    y += 6;
  }
  if (pages.length > 1) pages.forEach((pageCommands, i) => {
    commands = pageCommands; text(`Page ${i + 1}`, margin, height - 18, 8);
  });
  const objects = [null, '<< /Type /Catalog /Pages 2 0 R >>', '',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold >>'];
  const ids = [];
  for (const pageCommands of pages) {
    const id = objects.length, streamId = id + 1; ids.push(id);
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${streamId} 0 R >>`);
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
