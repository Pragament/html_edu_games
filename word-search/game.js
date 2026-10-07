'use strict';
const directions = [[0,1],[1,0],[1,1],[1,-1],[0,-1],[-1,0],[-1,-1],[-1,1]];
function randomGenerator(seed) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function buildWordSearch(words, seed) {
  const random = randomGenerator(seed);
  const answers = [...new Set(words.map(w => w.answer.toUpperCase().replace(/[^A-Z]/g,'')))].filter(Boolean).sort((a,b)=>b.length-a.length);
  for (let size = Math.max(12, ...answers.map(w=>w.length)); size <= Math.max(12,...answers.map(w=>w.length)) + 12; size++) {
    const letters = Array.from({length:size},()=>Array(size).fill(''));
    const placements = [];
    for (const answer of answers) {
      const candidates=[];
      for(let r=0;r<size;r++)for(let c=0;c<size;c++)for(const [dr,dc] of directions){
        const endR=r+dr*(answer.length-1),endC=c+dc*(answer.length-1);
        if(endR<0||endR>=size||endC<0||endC>=size)continue;
        const path=Array.from(answer,(_,i)=>[r+dr*i,c+dc*i]);
        if(path.every(([row,col],i)=>!letters[row][col]||letters[row][col]===answer[i]))candidates.push(path);
      }
      if(!candidates.length)break;
      const path=candidates[Math.floor(random()*candidates.length)];
      path.forEach(([r,c],i)=>letters[r][c]=answer[i]);placements.push({answer,path});
    }
    if(placements.length!==answers.length)continue;
    for(let r=0;r<size;r++)for(let c=0;c<size;c++)if(!letters[r][c])letters[r][c]=String.fromCharCode(65+Math.floor(random()*26));
    return {size,letters,placements};
  }
  throw new Error('Could not arrange this puzzle.');
}
const $ = id => document.getElementById(id);
const STORAGE='wordSearch.progress.v1';
let puzzles=[],puzzle,board,seed,found=new Set(),anchor=null,preview=[],dragging=false,dragStart=null;
let saved={};
try { saved=JSON.parse(localStorage.getItem(STORAGE))||{}; if(typeof saved!=='object'||Array.isArray(saved))saved={}; } catch {}
function save(){try{saved.last=puzzle.id;saved[puzzle.id]={seed,found:[...found],signature:JSON.stringify(puzzle.words.map(w=>w.answer))};localStorage.setItem(STORAGE,JSON.stringify(saved));}catch{}}
const key=([r,c])=>`${r},${c}`;
function pathBetween(a,b){const dr=b[0]-a[0],dc=b[1]-a[1];if(dr&&dc&&Math.abs(dr)!==Math.abs(dc))return [];const length=Math.max(Math.abs(dr),Math.abs(dc))+1;return Array.from({length},(_,i)=>[a[0]+Math.sign(dr)*i,a[1]+Math.sign(dc)*i]);}
function paint(){const marked=new Set(board.placements.filter(p=>found.has(p.answer)).flatMap(p=>p.path.map(key)));const selected=new Set(preview.map(key));for(const el of $('grid').children){el.classList.toggle('found',marked.has(el.dataset.cell));el.classList.toggle('selected',selected.has(el.dataset.cell));el.classList.toggle('anchor',anchor&&el.dataset.cell===key(anchor));}for(const el of $('words').querySelectorAll('button'))el.classList.toggle('found',found.has(el.dataset.answer));$('count').textContent=`${found.size}/${board.placements.length}`;}
function finish(path){if(path.length<2)return;const letters=path.map(([r,c])=>board.letters[r][c]).join('');const match=board.placements.find(p=>p.answer===letters||p.answer===letters.split('').reverse().join(''));if(match){found.add(match.answer);save();$('status').textContent=found.size===board.placements.length?'Well done! You found every word.':`${match.answer} found!`;showWord(puzzle.words.find(w=>w.answer===match.answer));}else $('status').textContent='No matching word there. Try another line.';anchor=null;preview=[];paint();}
function choose(cell){if(!anchor){anchor=cell;preview=[cell];$('status').textContent='Choose the last letter of the word.';paint();}else if(key(anchor)===key(cell)){anchor=null;preview=[];paint();}else{const path=pathBetween(anchor,cell);if(path.length)finish(path);else{$('status').textContent='Choose a straight horizontal, vertical, or diagonal line.';}}}
function cellAt(event){const el=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-cell]');return el&&$('grid').contains(el)?el.dataset.cell.split(',').map(Number):null;}
function showWord(word){$('details').hidden=false;$('word-title').textContent=word.answer;$('word-context').textContent=word.clue||'';$('explanation').textContent=word.explain||'';for(const el of $('words').querySelectorAll('button'))el.classList.toggle('active',el.dataset.answer===word.answer);}
function loadPuzzle(selected,fresh=false){puzzle=selected;const progress=saved[puzzle.id];const valid=!fresh&&progress&&progress.signature===JSON.stringify(puzzle.words.map(w=>w.answer))&&Number.isInteger(progress.seed);seed=valid?progress.seed:Math.floor(Math.random()*4294967296);board=buildWordSearch(puzzle.words,seed);found=new Set(valid&&Array.isArray(progress.found)?progress.found.filter(a=>board.placements.some(p=>p.answer===a)):[]);anchor=null;preview=[];dragging=false;$('details').hidden=true;$('subtitle').textContent=puzzle.subtitle;$('grid').style.setProperty('--size',board.size);$('grid').replaceChildren();for(let r=0;r<board.size;r++)for(let c=0;c<board.size;c++){const el=document.createElement('button');el.className='letter';el.type='button';el.textContent=board.letters[r][c];el.dataset.cell=`${r},${c}`;el.setAttribute('aria-label',`${board.letters[r][c]}, row ${r+1}, column ${c+1}`);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose([r,c]);}else if(e.key==='Escape'){anchor=null;preview=[];paint();}else if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();const nr=r+(e.key==='ArrowDown'?1:e.key==='ArrowUp'?-1:0),nc=c+(e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0);if(nr>=0&&nr<board.size&&nc>=0&&nc<board.size)$('grid').children[nr*board.size+nc].focus();}});$('grid').appendChild(el);}$('words').replaceChildren();for(const placement of board.placements){const li=document.createElement('li'),button=document.createElement('button');button.type='button';button.textContent=placement.answer;button.dataset.answer=placement.answer;button.addEventListener('click',()=>showWord(puzzle.words.find(w=>w.answer===placement.answer)));li.appendChild(button);$('words').appendChild(li);}$('status').textContent=found.size===board.placements.length?'Well done! You found every word.':'Find the hidden words. Progress saves automatically in this browser.';paint();save();}
$('grid').addEventListener('pointerdown',e=>{if(e.button!==0)return;const cell=cellAt(e);if(!cell)return;e.preventDefault();dragging=true;dragStart=cell;$('grid').setPointerCapture(e.pointerId);});
$('grid').addEventListener('pointermove',e=>{if(!dragging)return;const cell=cellAt(e);if(cell){preview=pathBetween(dragStart,cell);paint();}});
$('grid').addEventListener('pointerup',e=>{if(!dragging)return;dragging=false;const cell=cellAt(e);if(cell&&key(cell)!==key(dragStart))finish(pathBetween(dragStart,cell));else if(cell)choose(cell);preview=anchor?[anchor]:[];paint();});
$('grid').addEventListener('pointercancel',()=>{dragging=false;preview=anchor?[anchor]:[];paint();});
$('new-grid').addEventListener('click',()=>{if(window.confirm('Create a new grid and clear your word search progress for this puzzle?'))loadPuzzle(puzzle,true);});
$('puzzle-select').addEventListener('change',e=>loadPuzzle(puzzles[Number(e.target.value)]));
(async()=>{try{const response=await fetch('../crossword/puzzles.json');if(!response.ok)throw Error('Puzzle data unavailable');puzzles=await response.json();if(!Array.isArray(puzzles)||!puzzles.length)throw Error('No puzzles');for(const [i,p]of puzzles.entries()){const option=document.createElement('option');option.value=i;option.textContent=`${p.title} — ${p.subtitle}`;$('puzzle-select').appendChild(option);}let index=puzzles.findIndex(p=>p.id===saved.last);if(index<0)index=Math.floor(Math.random()*puzzles.length);$('puzzle-select').value=index;loadPuzzle(puzzles[index]);$('puzzle-select').disabled=false;$('new-grid').disabled=false;$('download-pdf').disabled=false;}catch(error){$('status').textContent='Puzzles could not be loaded. Refresh to try again.';console.error(error);}})();

$('download-pdf').addEventListener('click', () => {
  if (!puzzle || !board) return;
  try {
    const url = URL.createObjectURL(createWordSearchPDF(puzzle, board));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${puzzle.id}-word-search.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    $('pdf-status').textContent = 'PDF worksheet downloaded.';
  } catch (error) {
    $('pdf-status').textContent = 'The PDF could not be created. Please try again.';
    console.error(error);
  }
});
