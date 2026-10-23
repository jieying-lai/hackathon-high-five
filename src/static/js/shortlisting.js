/* Shortlists contain only explicit HR decisions for a specific vacancy. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HRShortlist=api;})(typeof window==='undefined'?globalThis:window,function(){
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function interviewTips(candidate){
  const strings=value=>Array.isArray(value)?[...new Set(value.filter(v=>typeof v==='string'&&v.trim()).map(v=>v.trim()))]:[];
  const matched=strings(candidate.matched_required),pending=strings(candidate.to_confirm),projects=strings(candidate.projects);
  const years=typeof candidate.years==='number'&&Number.isFinite(candidate.years)&&candidate.years>=0?candidate.years:null;
  return [
   {title:'Explore the matched skills',evidence:matched,label:'CV skills matching this role',description:matched.length?'Ask for a concrete example using these skills. Clarify the candidate’s own contribution, tools used and how the outcome was checked.':'No matched skills are recorded in the available CV summary. Ask the candidate to describe experience relevant to this role.'},
   {title:'Clarify skills not yet evidenced',evidence:pending,label:'Role requirements to confirm',description:pending.length?'These requirements are not clearly evidenced in the available CV. Ask about relevant experience or a practical approach; do not treat an omission as inability.':'No additional skill gaps are flagged in this summary. Confirm depth and practical application rather than assuming proficiency.'},
   {title:'Discuss the listed projects',evidence:projects,label:'Projects recorded in the CV',description:projects.length?'Use these projects as discussion anchors. Clarify ownership, challenges, decisions and measurable outcomes; distinguish team results from individual work.':'No project details are recorded in the available CV. Invite an example from work, study or volunteering and clarify the candidate’s contribution.'},
   {title:'Confirm the experience context',evidence:years===null?[]:[String(years)],label:'Years of experience recorded in the CV',description:years===null?'Experience duration is not specified in the available CV summary. Confirm the timeline and which work is relevant to this role.':'Confirm which roles and responsibilities make up this duration and how they relate to the vacancy. The number alone does not establish expertise.'}
  ];
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
   <div class="flex flex-wrap justify-between items-start gap-4"><button type="button" class="shortlist-name text-left" data-shortlist-action="flip" aria-expanded="false"><span class="block text-lg font-extrabold" data-no-translate>${esc(c.name)}</span><span class="block text-sm font-bold text-teal-700">${esc(c.position)}</span><span class="block text-xs text-slate-500">${esc(c.education_category||c.education||'Not specified')}</span><span class="block text-xs font-bold text-teal-700 mt-2">View CV interview notes ↻</span></button><div class="flex gap-2 items-center"><span class="chip chip-teal">${esc(c.source||'Application')}</span><span class="chip chip-indigo">${Number(c.score)||0}%</span></div></div>
   <div class="flex flex-wrap gap-2">${(c.matched_required||[]).slice(0,6).map(skill=>`<span class="chip chip-teal">${esc(skill)}</span>`).join('')}</div>
   <div class="flex flex-wrap gap-3"><button type="button" class="btn btn-hr" data-shortlist-action="invite">Invite to interview</button><button type="button" class="btn btn-soft" data-shortlist-action="remove">Remove from shortlist</button></div>
  </div><div class="shortlist-face shortlist-back glass rounded-3xl p-6 space-y-4" aria-hidden="true" inert>
   <div class="flex flex-wrap justify-between items-start gap-3"><div><h3 class="font-extrabold">CV-based interview notes</h3><p data-no-translate class="shortlist-question-name text-sm font-bold">${esc(c.name)}</p><p class="text-sm">${esc(c.position)}</p></div><button type="button" class="btn btn-soft" data-shortlist-action="back">Back to candidate ↻</button></div>
   <p class="hint">Based on this candidate’s available CV and the selected vacancy. Confirm details during the interview.</p>
   <ol class="shortlist-interview-tips">${interviewTips(c).map(({title,evidence,label,description},index)=>`<li><span class="shortlist-tip-number" aria-hidden="true">${index+1}</span><div><h4>${esc(title)}</h4>${evidence.length?`<div class="shortlist-tip-evidence"><span>${esc(label)}</span><ul>${evidence.map(value=>`<li data-no-translate>${esc(value)}</li>`).join('')}</ul></div>`:''}<p>${esc(description)}</p></div></li>`).join('')}</ol>
  </div></div></article>`).join(''):'<div class="glass rounded-3xl p-8 space-y-2"><h3 class="font-extrabold">No shortlisted candidates yet.</h3><p class="hint">Select Shortlist in Candidate Screening to add candidates here.</p></div>';
  container.querySelectorAll('[data-shortlist-action]').forEach(button=>button.addEventListener('click',()=>{
   const row=selectedRows[Number(button.closest('[data-shortlist-index]').dataset.shortlistIndex)];
   if(!row||decisions[String(row.vacancy_id)+'|'+row.id]!=='Shortlist')return;
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
 return {rows,render,interviewTips};
});
