/* In-page location guide for the visible portal page. */
(function(root,factory){
 if(typeof module==='object'&&module.exports)module.exports=factory;
 else if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',()=>factory(root));
 else factory(root);
})(typeof window==='undefined'?globalThis:window,function(win){
 const doc=win.document,main=doc.querySelector('main');
 if(!main||doc.getElementById('pageOutline'))return;
 const rail=doc.createElement('nav');rail.id='pageOutline';rail.className='page-outline';rail.setAttribute('aria-label','On this page');
 rail.innerHTML='<div class="outline-caption"><span class="outline-caption-dot" aria-hidden="true"></span><span>On this page</span></div><div id="outlineSteps" class="outline-list"><div class="outline-track" aria-hidden="true"><i class="outline-progress"></i></div><div class="outline-indicator" aria-hidden="true"></div><ol></ol></div><div class="outline-footer"><span>Current section</span><span class="outline-count" data-no-translate></span></div>';
 doc.body.append(rail);doc.body.classList.add('page-outline-enabled');
 const list=rail.querySelector('ol'),track=rail.querySelector('.outline-track'),progress=rail.querySelector('.outline-progress'),indicator=rail.querySelector('.outline-indicator');
 const counter=rail.querySelector('.outline-count');
 let steps=[],buttons=[],active=-1,frame=null,rebuildFrame=null,observer=null,scope=null,destroyed=false;
 const reduce=win.matchMedia('(prefers-reduced-motion: reduce)');
 const translate=text=>win.careerLensLocale?.translate(text)??text;
 function visible(element){return !element.closest('[hidden],.hidden')&&element.getClientRects().length>0;}
 function schedule(){if(!destroyed&&frame===null)frame=win.requestAnimationFrame(()=>{frame=null;update();});}
 function geometry(){
  if(!buttons.length)return;
  const top=rail.querySelector('.outline-list').getBoundingClientRect().top;
  const centers=buttons.map(button=>{const r=button.querySelector('.outline-number').getBoundingClientRect();return r.top+r.height/2-top;});
  const first=centers[0],height=Math.max(0,centers.at(-1)-first);
  track.style.top=first+'px';track.style.height=height+'px';
  if(active>=0)indicator.style.transform=`translateY(${centers[active]-indicator.getBoundingClientRect().height/2}px)`;
 }
 function update(){
  if(!steps.length)return;
  const focus=win.innerHeight*.4;
  const positions=steps.map(step=>step.target.getBoundingClientRect().top);
  let index=0;
  positions.forEach((top,i)=>{if(top<=focus)index=i;});
  const height=doc.documentElement.scrollHeight;
  if(height>win.innerHeight+20&&win.scrollY+win.innerHeight>=height-4)index=steps.length-1;
  if(index!==active){
   active=index;
   buttons.forEach((button,i)=>{button.classList.toggle('is-active',i===index);button.classList.toggle('is-past',i<index);if(i===index)button.setAttribute('aria-current','location');else button.removeAttribute('aria-current');});
   counter.textContent=String(index+1).padStart(2,'0')+' / '+String(steps.length).padStart(2,'0');
   geometry();
  }
  let fraction=0;
  if(steps.length>1){
   if(index===steps.length-1)fraction=1;
   else fraction=(index+Math.max(0,Math.min(1,(focus-positions[index])/Math.max(1,positions[index+1]-positions[index]))))/(steps.length-1);
  }
  progress.style.transform=`scaleY(${fraction})`;
 }
 function rebuild(){
  rebuildFrame=null;
  const nextScope=[...main.querySelectorAll('.tab')].find(visible);
  if(!nextScope){rail.hidden=true;return;}
  let next=[...nextScope.querySelectorAll('[data-outline-label]')].filter(visible).map(target=>({target,label:target.dataset.outlineLabel}));
  if(!next.length)next=[{target:nextScope,label:doc.getElementById('pgTitle')?.textContent||'Overview'}];
  rail.hidden=false;
  if(scope===nextScope&&next.length===steps.length&&next.every((step,i)=>step.target===steps[i].target&&step.label===steps[i].label)){geometry();schedule();return;}
  scope=nextScope;steps=next;active=-1;list.replaceChildren();buttons=[];
  if(observer)observer.disconnect();
  steps.forEach((step,i)=>{
   const item=doc.createElement('li'),button=doc.createElement('button'),number=doc.createElement('span'),label=doc.createElement('span');
   button.type='button';button.className='outline-step';
   number.className='outline-number';number.dataset.noTranslate='';number.textContent=String(i+1);
   label.className='outline-label';label.textContent=step.label;
   button.append(number,label);item.append(button);list.append(item);buttons.push(button);
   button.setAttribute('aria-label',translate(step.label));button.title=translate(step.label);
   button.addEventListener('click',()=>{
    step.target.scrollIntoView({behavior:reduce.matches?'instant':'smooth',block:'start'});
    if(!step.target.hasAttribute('tabindex'))step.target.setAttribute('tabindex','-1');
    step.target.focus({preventScroll:true});
   });
   observer?.observe(step.target);
  });
  rail.dataset.count=String(steps.length);
  win.careerLensLocale?.apply();geometry();update();
 }
 if(win.IntersectionObserver)observer=new win.IntersectionObserver(schedule,{rootMargin:'-30% 0px -45% 0px',threshold:[0,.1,.5,1]});
 function queueRebuild(){if(!destroyed&&rebuildFrame===null)rebuildFrame=win.requestAnimationFrame(rebuild);}
 const mutations=new win.MutationObserver(queueRebuild);
 mutations.observe(main,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden']});
 win.addEventListener('scroll',schedule,{passive:true});
 const onResize=()=>{geometry();queueRebuild();};
 win.addEventListener('resize',onResize,{passive:true});
 let resize;
 if(win.ResizeObserver){resize=new win.ResizeObserver(()=>{geometry();schedule();});resize.observe(main);resize.observe(rail);}
 doc.fonts?.ready.then(()=>{geometry();schedule();});
 rebuild();
 return {refresh:rebuild,update,destroy(){destroyed=true;mutations.disconnect();observer?.disconnect();resize?.disconnect();win.removeEventListener('scroll',schedule);win.removeEventListener('resize',onResize);if(frame!==null)win.cancelAnimationFrame(frame);if(rebuildFrame!==null)win.cancelAnimationFrame(rebuildFrame);rail.remove();doc.body.classList.remove('page-outline-enabled');}};
});
