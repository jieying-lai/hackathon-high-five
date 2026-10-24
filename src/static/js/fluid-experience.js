/* Progressive visual enhancement. Never intercepts submission or authorization. */
(() => {
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  document.body.classList.add('fluid-ui');
  const seen=new WeakSet();
  const listSelector='#jobsGrid,#dashTop,.career-quick-actions,.career-visual-grid,.role-model-grid,.atlas-masonry';
  function reveal(parent){
    if(reduced.matches||!parent)return;
    [...parent.children].filter(el=>!el.classList.contains('hidden')).slice(0,10).forEach((el,i)=>{
      if(seen.has(el))return;seen.add(el);el.style.setProperty('--fluid-delay',Math.min(i*45,225)+'ms');el.classList.add('fluid-enter');
      el.addEventListener('animationend',()=>el.classList.remove('fluid-enter'),{once:true});
    });
  }
  function sheet(element){
    if(element.querySelector(':scope > .fluid-sheet-handle'))return;
    const native=element.tagName==='DIALOG';
    const close=native?()=>element.close():()=>element.querySelector('[aria-label="Close application"]')?.click();
    element.classList.add('fluid-sheet');
    const grip=document.createElement('div');grip.className='fluid-sheet-handle';grip.setAttribute('aria-hidden','true');element.prepend(grip);
    // Only the handle accepts this gesture: scrolling or editing a form cannot dismiss it.
    let start=null;
    grip.addEventListener('pointerdown',e=>{if(e.button!==0)return;start={x:e.clientX,y:e.clientY};grip.setPointerCapture(e.pointerId);});
    grip.addEventListener('pointerup',e=>{if(start && e.clientY-start.y>70 && Math.abs(e.clientX-start.x)<70)close();start=null;});
    grip.addEventListener('pointercancel',()=>{start=null;});
  }
  function enhance(scope){
    if(!(scope instanceof Element))return;
    if(scope.matches(listSelector))reveal(scope);
    scope.querySelectorAll(listSelector).forEach(reveal);
    if(scope.matches('dialog.career-practice,dialog.interview-buddy-dialog'))sheet(scope);
    scope.querySelectorAll('dialog.career-practice,dialog.interview-buddy-dialog,#applyModalWrap .modal').forEach(sheet);
  }
  enhance(document.body);
  const observer=new MutationObserver(records=>{
    for(const record of records){
      if(record.type==='attributes'){
        if(record.target.matches('.tab')&&!record.target.classList.contains('hidden'))reveal(record.target);
      }else{
        if(record.target.matches?.(listSelector))reveal(record.target);
        if(record.target.matches?.('dialog.career-practice,dialog.interview-buddy-dialog'))sheet(record.target);
        record.addedNodes.forEach(enhance);
      }
    }
  });
  observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  document.addEventListener('toggle',e=>{
    if(e.target instanceof HTMLDetailsElement && e.target.open && !reduced.matches){
      [...e.target.children].filter(el=>el.tagName!=='SUMMARY').forEach(el=>el.animate([{opacity:0,transform:'translateY(5px)'},{opacity:1,transform:'none'}],{duration:220,easing:'ease-out'}));
    }
  },true);
})();
