const fs=require('node:fs'),assert=require('node:assert/strict');
const mount=require('../src/static/js/page-outline.js');
const tr=require('../src/static/js/portal-i18n.js').translate;
(async()=>{
 const {parseHTML}=await import(process.env.CAREERLENS_DOM_MODULE||'../work/qa/linkedom.mjs');
 for(const page of ['candidate','hr']){
  const {window}=parseHTML(fs.readFileSync(`src/templates/${page}.html`,'utf8'));const {document}=window;
  const frames=new Map();let nextFrame=0,scrollRequest=null,mutation;
  const win={document,innerHeight:800,scrollY:0,matchMedia:()=>({matches:false}),
   requestAnimationFrame:fn=>{frames.set(++nextFrame,fn);return nextFrame},cancelAnimationFrame:id=>frames.delete(id),
   addEventListener(){},removeEventListener(){},
   MutationObserver:class{constructor(fn){mutation=fn}observe(){}disconnect(){}},
   IntersectionObserver:class{observe(){}disconnect(){}},ResizeObserver:class{observe(){}disconnect(){}},
   careerLensLocale:{translate:t=>tr(t,'en'),apply(){}}};
  Object.defineProperty(document.documentElement,'scrollHeight',{value:6500,configurable:true});
  window.Element.prototype.getClientRects=function(){return this.closest('.hidden,[hidden]')?[]:[this.getBoundingClientRect()];};
  window.Element.prototype.getBoundingClientRect=function(){
   let top=0,height=40;
   if(this.classList.contains('outline-list'))top=100;
   else if(this.classList.contains('outline-number')){top=112+(Number(this.textContent)-1)*64;height=28;}
   else if(this.closest('main')){
    const scope=this.closest('.tab');const items=scope?[...scope.querySelectorAll('[data-outline-label]')]:[];
    top=300+Math.max(0,items.indexOf(this))*1000-win.scrollY;
   }
   return {top,bottom:top+height,height,left:0,right:200,width:200};
  };
  window.Element.prototype.scrollIntoView=function(options){scrollRequest={target:this,options};};
  window.Element.prototype.focus=function(){};
  const flush=()=>{for(let limit=0;frames.size&&limit<10;limit++){const jobs=[...frames.values()];frames.clear();jobs.forEach(job=>job());}};
  const api=mount(win);flush();assert(document.getElementById('pageOutline'));
  assert.equal(document.querySelector('.outline-toggle'),null,'No collapse control');
  const targetPage=page==='candidate'?'tab-profile':'tab-heatmap';
  document.querySelectorAll('.tab').forEach(tab=>tab.classList.toggle('hidden',tab.id!==targetPage));mutation();flush();
  let buttons=[...document.querySelectorAll('.outline-step')];
  assert.equal(buttons.length,page==='candidate'?5:4);
  assert(buttons[0].hasAttribute('aria-current'));
  win.scrollY=2100;api.update();assert(buttons[2].hasAttribute('aria-current'));
  assert(buttons[0].classList.contains('is-past'));assert(buttons[1].classList.contains('is-past'));
  assert(!buttons[2].classList.contains('is-past'));
  const fill=document.querySelector('.outline-progress').style.transform;assert(!fill.includes('NaN'));assert.notEqual(fill,'scaleY(0)');
  const indicator=document.querySelector('.outline-indicator').style.transform;assert(indicator.includes('translateY'));
  buttons.at(-1).click();assert.equal(scrollRequest.options.behavior,'smooth');assert.equal(scrollRequest.target,document.querySelectorAll(`#${targetPage} [data-outline-label]`)[buttons.length-1]);
  for(const node of document.querySelectorAll('[data-outline-label]'))for(const lang of ['zh','ms'])assert.notEqual(tr(node.dataset.outlineLabel,lang),node.dataset.outlineLabel,`${page}: ${lang} ${node.dataset.outlineLabel}`);
  document.querySelectorAll('.tab').forEach(tab=>tab.classList.toggle('hidden',tab.id!==(page==='candidate'?'tab-jobs':'tab-overview')));mutation();flush();
  buttons=[...document.querySelectorAll('.outline-step')];assert(buttons.length>=3);assert.equal(document.querySelectorAll('#pageOutline').length,1);
  assert(!document.querySelector('#pageOutline select'),'Location guide must not switch account roles');
  api.destroy();assert.equal(document.getElementById('pageOutline'),null);
  console.log(`PASS ${page}: correct per-page anchors, scroll-driven highlight/progress, smooth navigation, no role switching, EN/中文/BM labels and cleanup.`);
 }
 const css=fs.readFileSync('src/static/css/page-outline.css','utf8');assert(css.includes('position:fixed'));assert(css.includes('prefers-reduced-motion'));assert(css.includes('max-width:1023px'));
 assert(css.includes('.page-outline-enabled .portal-content{padding-left:0}'));
 assert(css.includes('margin-left:auto!important;margin-right:auto!important'));
 assert(!css.includes('padding-left:208px'));
})().catch(error=>{console.error(error);process.exitCode=1});
