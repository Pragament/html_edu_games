'use strict';
let playScreenActive=false,playScreenNative=false,playScreenReturnFocus=null,playScreenScroll=0;
function syncPlayScreen(){
 $('play-screen-title').textContent=$('title').textContent;
 $('play-screen-sound').textContent=muted?'♪ Sound off':'♪ Sound on';
 $('play-screen-sound').setAttribute('aria-pressed',String(muted));
 document.querySelector('.studio').classList.toggle('has-left-hand',!$('left-hand').hidden);
 $('play-screen-hint').textContent=window.matchMedia('(orientation: portrait)').matches?'Rotate your phone for wider keys.':'';
}
async function enterPlayScreen(){
 if(playScreenActive)return;
 playScreenReturnFocus=document.activeElement;playScreenScroll=window.scrollY;playScreenActive=true;
 document.body.classList.add('play-screen');$('play-screen-toolbar').hidden=false;$('play-screen-toggle').setAttribute('aria-pressed','true');syncPlayScreen();
 const studio=document.querySelector('.studio');
 if(studio.requestFullscreen){try{await studio.requestFullscreen();if(!playScreenActive){await document.exitFullscreen();return;}playScreenNative=true;try{await screen.orientation?.lock?.('landscape');}catch{}}catch{playScreenNative=false;}}
 if(playScreenActive)$('play-screen-exit').focus({preventScroll:true});
}
async function exitPlayScreen(){
 if(!playScreenActive)return;
 releaseAll();releaseLeft();stopDemo();playScreenActive=false;document.body.classList.remove('play-screen');$('play-screen-toolbar').hidden=true;$('play-screen-toggle').setAttribute('aria-pressed','false');
 try{screen.orientation?.unlock?.();}catch{}
 if(playScreenNative&&document.fullscreenElement){try{await document.exitFullscreen();}catch{}}
 playScreenNative=false;window.scrollTo(0,playScreenScroll);playScreenReturnFocus?.focus?.({preventScroll:true});
}
function initPlayScreen(){
 $('play-screen-toggle').onclick=enterPlayScreen;$('play-screen-exit').onclick=exitPlayScreen;
 $('play-screen-sound').onclick=()=>{$('sound').click();syncPlayScreen();};
 document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&playScreenNative){playScreenNative=false;syncPlayScreen();}});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&playScreenActive){event.preventDefault();exitPlayScreen();}});
 window.addEventListener('resize',()=>{if(playScreenActive)syncPlayScreen();});
 new MutationObserver(()=>{if(playScreenActive)syncPlayScreen();}).observe($('title'),{childList:true});
 new MutationObserver(()=>{if(playScreenActive)syncPlayScreen();}).observe($('left-hand'),{attributes:true,attributeFilter:['hidden']});
}
