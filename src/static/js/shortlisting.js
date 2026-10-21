/* Shortlists contain only explicit HR decisions for a specific vacancy. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HRShortlist=api;})(typeof window==='undefined'?globalThis:window,function(){
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const generated=new Map();
 const questionKey=c=>JSON.stringify([c.id,c.vacancy_id,c.matched_required,c.to_confirm,c.projects]);
 function questions(candidate){
  return generated.get(questionKey(candidate))||[];
 }
 function rows(candidates,decisions,vacancy=''){
  const unique=new Map();
  for(const c of candidates){const key=String(c.vacancy_id)+'|'+c.id;if(decisions[key]==='Shortlist'&&(!vacancy||String(c.vacancy_id)===String(vacancy)))unique.set(key,c);}
  return [...unique.values()].sort((a,b)=>b.score-a.score||String(a.id).localeCompare(String(b.id))||Number(a.vacancy_id)-Number(b.vacancy_id));
 }
 function render(options){
  const {document:doc,candidates,vacancies,decisions,onInvite,onRemove}=options;
  const container=doc.getElementById('shortlistCandidates'),select=doc.getElementById('shortlistVacancy'),status=doc.getElementById('shortlistStatus');
  if(!container||!select||!status)return;
  const selected=select.value||'';
  select.innerHTML='<option value="">All positions</option>'+vacancies.map(v=>`<option value="${Number(v.id)}" ${String(v.id)===selected?'selected':''}>${esc(v.title)}</option>`).join('');
  if(!vacancies.some(v=>String(v.id)===selected))select.value='';
  const selectedRows=rows(candidates,decisions,select.value||'');
  status.textContent=options.error||`${selectedRows.length} shortlisted candidates`;
  container.innerHTML=selectedRows.length?selectedRows.map((c,i)=>`<article class="shortlist-flip" data-shortlist-index="${i}"><div class="shortlist-flip-inner">
  <div class="shortlist-face shortlist-front glass rounded-3xl p-6 space-y-4">
   <div class="flex flex-wrap justify-between items-start gap-4"><button type="button" class="shortlist-name text-left" data-shortlist-action="flip" aria-expanded="false"><span class="block text-lg font-extrabold" data-no-translate>${esc(c.name)}</span><span class="block text-sm font-bold text-teal-700">${esc(c.position)}</span><span class="block text-xs text-slate-500">${esc(c.education_category||c.education||'Not specified')}</span><span class="block text-xs font-bold text-teal-700 mt-2">View CV-based interview questions ↻</span></button><div class="flex gap-2 items-center"><span class="chip chip-teal">${esc(c.source||'Application')}</span><span class="chip chip-indigo">${Number(c.score)||0}%</span></div></div>
   <div class="flex flex-wrap gap-2">${(c.matched_required||[]).slice(0,6).map(skill=>`<span class="chip chip-teal">${esc(skill)}</span>`).join('')}</div>
   <div class="flex flex-wrap gap-3"><button type="button" class="btn btn-hr" data-shortlist-action="invite">Invite to interview</button><button type="button" class="btn btn-soft" data-shortlist-action="remove">Remove from shortlist</button></div>
  </div><div class="shortlist-face shortlist-back glass rounded-3xl p-6 space-y-4" aria-hidden="true" inert>
   <div class="flex flex-wrap justify-between items-start gap-3"><div><h3 class="font-extrabold">CV-based interview questions</h3><p data-no-translate class="shortlist-question-name text-sm font-bold">${esc(c.name)}</p><p class="text-sm">${esc(c.position)}</p></div><button type="button" class="btn btn-soft" data-shortlist-action="back">Back to candidate ↻</button></div>
   <div data-interview-question-list>${questions(c).length?`<ol class="list-decimal pl-5 space-y-3" data-no-translate>${questions(c).map(q=>`<li class="text-sm leading-relaxed">${esc(q)}</li>`).join('')}</ol>`:''}</div>
   <div class="space-y-3"><button type="button" class="btn shortlist-ai-generate" data-shortlist-action="regenerate"><svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/><path d="M20 2v4m-2-2h4M4 18v4m-2-2h4"/></svg><span>Auto generate</span></button><p class="hint" role="status" aria-live="polite" data-question-status></p></div>
  </div></div></article>`).join(''):'<div class="glass rounded-3xl p-8 space-y-2"><h3 class="font-extrabold">No shortlisted candidates yet.</h3><p class="hint">Select Shortlist in Candidate Screening to add candidates here.</p></div>';
  container.querySelectorAll('[data-shortlist-action]').forEach(button=>button.addEventListener('click',async()=>{
   const row=selectedRows[Number(button.closest('[data-shortlist-index]').dataset.shortlistIndex)];
   if(!row||decisions[String(row.vacancy_id)+'|'+row.id]!=='Shortlist')return;
   if(button.dataset.shortlistAction==='regenerate'){
    const card=button.closest('[data-shortlist-index]'),status=card.querySelector('[data-question-status]');
    const tr=text=>options.translate?.(text)??text;
    button.disabled=true;button.setAttribute('aria-busy','true');
    status.textContent=tr('Generating new interview questions…');
    try{
     const response=await options.onGenerate(row,'',questions(row));
     if(!card.isConnected)return;
     if(!response.ok||!response.data.ok)throw Error(response.data.message||'Could not generate new questions. Your current questions are unchanged. Please retry.');
     if(!Array.isArray(response.data.questions)||!response.data.questions.length)throw Error('Could not generate new questions. Your current questions are unchanged. Please retry.');
     generated.set(questionKey(row),response.data.questions);
     card.querySelector('[data-interview-question-list]').innerHTML='<ol class="list-decimal pl-5 space-y-3" data-no-translate>'+response.data.questions.map(q=>`<li class="text-sm leading-relaxed">${esc(q)}</li>`).join('')+'</ol>';
     status.textContent=tr('New AI interview questions are ready. Review before use.');
    }catch(error){if(card.isConnected)status.textContent=tr(error.message||'Could not generate new questions. Your current questions are unchanged. Please retry.');}
    finally{button.disabled=false;button.removeAttribute('aria-busy');}
    return;
   }
   if(['flip','back'].includes(button.dataset.shortlistAction)){
    const card=button.closest('[data-shortlist-index]'),flipped=button.dataset.shortlistAction==='flip';
    card.classList.toggle('is-flipped',flipped);
    const front=card.querySelector('.shortlist-front'),back=card.querySelector('.shortlist-back');
    front.inert=flipped;back.inert=!flipped;
    front.setAttribute('aria-hidden',String(flipped));back.setAttribute('aria-hidden',String(!flipped));
    card.querySelector('[data-shortlist-action="flip"]').setAttribute('aria-expanded',String(flipped));
    card.querySelector(flipped?'[data-shortlist-action="back"]':'[data-shortlist-action="flip"]').focus({preventScroll:true});
    return;
   }
   if(button.dataset.shortlistAction==='invite')onInvite(row);else onRemove(row);
  }));
 }
 return {rows,render,questions};
});
