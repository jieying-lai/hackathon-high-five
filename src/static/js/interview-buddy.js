/* Interview practice lives in the existing Talent Portal; nothing is sent to HR. */
(function () {
  'use strict';
  if (document.getElementById('interviewBuddy')) return;
  const buddy=document.createElement('button');
  buddy.type='button';buddy.id='interviewBuddy';buddy.className='interview-buddy';buddy.setAttribute('data-no-translate','');
  buddy.setAttribute('aria-haspopup','dialog');buddy.setAttribute('aria-controls','interviewBuddyDialog');
  buddy.innerHTML='<img src="/static/interview-room/assets/buddy.png" alt="" draggable="false"><span class="interview-buddy-label">Interview Buddy</span>';
  document.body.appendChild(buddy);
  const modal=document.createElement('dialog');modal.id='interviewBuddyDialog';modal.className='interview-buddy-dialog';modal.setAttribute('aria-label','Interview simulator');modal.setAttribute('data-no-translate','');
  modal.innerHTML='<div class="interview-buddy-toolbar"><span>CareerLens · Interview Studio</span><button type="button" aria-label="Close interview simulator">✕ <span>Back to CareerLens</span></button></div><iframe title="Interview practice room" allow="microphone; autoplay"></iframe>';
  document.body.appendChild(modal);
  const frame=modal.querySelector('iframe'),close=modal.querySelector('button');
  const tip=document.createElement('div');tip.className='interview-buddy-tip';tip.id='interviewBuddyHint';tip.hidden=true;tip.setAttribute('role','tooltip');document.body.appendChild(tip);buddy.setAttribute('aria-describedby',tip.id);
  let opener=buddy,drag=null,moved=false;
  const key='cl_interview_buddy_position_v1';
  function language(){return document.getElementById('uiLanguage')?.value||document.documentElement.lang||'en';}
  function label(){const cn=language().startsWith('zh');buddy.querySelector('.interview-buddy-label').textContent=cn?'模拟面试':'Interview Buddy';buddy.setAttribute('aria-label',cn?'打开模拟面试。拖动或使用方向键移动。':'Open interview simulator. Drag or use arrow keys to move.');tip.innerHTML=cn?'点击，开始模拟面试<br><small>按住人物可拖动</small>':'Click to practice an interview<br><small>Hold the buddy to move it</small>';}
  function open(){if(buddy.hidden||modal.open)return;tip.hidden=true;opener=document.activeElement;frame.src='/static/interview-room/index.html?v=20261023-12&lang='+encodeURIComponent(language());modal.showModal();close.focus();}
  function shut(){if(modal.open)modal.close();}
  close.addEventListener('click',shut);
  modal.addEventListener('close',()=>{frame.contentWindow?.postMessage({type:'careerlens-interview-pause'},location.origin);frame.src='about:blank';opener?.focus();});
  window.addEventListener('message',event=>{if(event.origin===location.origin&&event.source===frame.contentWindow&&event.data?.type==='careerlens-interview-close')shut();});
  function positionTip(){
    if(buddy.hidden||tip.hidden)return;
    const r=buddy.getBoundingClientRect(),box=tip.getBoundingClientRect();
    const gap=10,margin=8;
    const preferred=r.left+(r.width-box.width)/2;
    tip.style.left=Math.max(margin,Math.min(innerWidth-box.width-margin,preferred))+'px';
    tip.style.top=Math.max(margin,Math.min(innerHeight-box.height-margin,(r.top>=box.height+gap+margin?r.top-box.height-gap:r.top+r.height+gap)))+'px';
  }
  function showTip(){tip.hidden=false;positionTip();}
  function hideTip(){tip.hidden=true;}
  buddy.addEventListener('pointerenter',showTip);
  buddy.addEventListener('pointerleave',hideTip);
  buddy.addEventListener('focus',showTip);
  buddy.addEventListener('blur',hideTip);
  function place(x,y,save=true){const r=buddy.getBoundingClientRect();const left=Math.max(8,Math.min(innerWidth-r.width-8,x));const top=Math.max(8,Math.min(innerHeight-r.height-8,y));buddy.style.left=left+'px';buddy.style.top=top+'px';buddy.style.right='auto';buddy.style.bottom='auto';positionTip();if(save)try{localStorage.setItem(key,JSON.stringify({left,top}));}catch{}}
  buddy.addEventListener('pointerdown',event=>{if(event.button!==0)return;hideTip();const r=buddy.getBoundingClientRect();drag={x:event.clientX,y:event.clientY,left:r.left,top:r.top};moved=false;buddy.setPointerCapture(event.pointerId);});
  buddy.addEventListener('pointermove',event=>{if(!drag)return;if(Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>6)moved=true;if(moved){buddy.classList.add('is-dragging');place(drag.left+event.clientX-drag.x,drag.top+event.clientY-drag.y);}});
  buddy.addEventListener('pointerup',()=>{if(!drag)return;drag=null;buddy.classList.remove('is-dragging');if(!moved)open();});
  buddy.addEventListener('pointercancel',()=>{drag=null;buddy.classList.remove('is-dragging');});
  buddy.addEventListener('click',event=>{if(event.detail===0)open();});
  buddy.addEventListener('keydown',event=>{const steps={ArrowLeft:[-16,0],ArrowRight:[16,0],ArrowUp:[0,-16],ArrowDown:[0,16]};if(steps[event.key]){event.preventDefault();const r=buddy.getBoundingClientRect(),d=steps[event.key];place(r.left+d[0],r.top+d[1]);}if(event.key==='Home'){event.preventDefault();buddy.style.cssText='';positionTip();try{localStorage.removeItem(key);}catch{}}});
  try{const p=JSON.parse(localStorage.getItem(key));if(p&&Number.isFinite(p.left)&&Number.isFinite(p.top))place(p.left,p.top,false);}catch{}
  window.addEventListener('resize',()=>{if(buddy.style.left){const r=buddy.getBoundingClientRect();place(r.left,r.top,false);}else positionTip();});
  const exploreTabs=new Set(['jobs','companies','radar','match','atlas']);
  function setView(id){hideTip();buddy.hidden=!exploreTabs.has(id);if(buddy.hidden){drag=null;buddy.classList.remove('is-dragging');shut();}else if(buddy.style.left){const r=buddy.getBoundingClientRect();place(r.left,r.top,false);}else positionTip();}
  window.InterviewBuddy={setView};
  setView(window.careerLensActiveTab||'dash');
  document.getElementById('uiLanguage')?.addEventListener('change',label);label();
})();
