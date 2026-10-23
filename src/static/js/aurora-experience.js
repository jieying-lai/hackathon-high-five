(function(){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let scheduled=false;
 document.querySelectorAll('.motion-toggle').forEach(button=>button.addEventListener('click',()=>{const paused=document.body.classList.toggle('motion-paused');button.setAttribute('aria-pressed',String(paused));button.textContent=paused?'Resume ambient motion':'Pause ambient motion';document.dispatchEvent(new CustomEvent('careerlens-motion',{detail:{paused}}));}));
 // A small background displacement gives depth without moving text or controls.
 window.addEventListener('scroll',()=>{if(scheduled||reduced.matches||document.body.classList.contains('motion-paused'))return;scheduled=true;requestAnimationFrame(()=>{document.querySelectorAll('.totem-glow-1,.blob').forEach(el=>{el.style.translate='0 '+Math.min(scrollY*.035,35)+'px';});scheduled=false;});},{passive:true});
 document.querySelectorAll('img').forEach(img=>{if(img.complete)return;const parent=img.parentElement;parent.classList.add('skeleton-surface');const done=()=>parent.classList.remove('skeleton-surface');img.addEventListener('load',done,{once:true});img.addEventListener('error',done,{once:true});});
})();
