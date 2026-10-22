/* Company comparison: one filter state feeds chart counts, rows and the podium. */
const CompanyComparison = (() => {
  let data = null, requestVersion = 0, lastPodiumMarkup = null;
  const state = {vacancy: '', department: '', years: 0, education: 0, sort: 'match', query: ''};
  const ranks = {'SPM / UEC':1,Undergraduate:2,Master:3,Doctor:4};
  const colors = ['#38bdf8','#6366f1','#14b8a6','#f59e0b','#ec4899','#94a3b8'];
  const tr = text => window.careerLensLocale?.translate(text) || text;
  const text = value => `<span>${esc(value)}</span>`;
  function option(value, label, selected) {return `<option value="${esc(value)}" ${String(value)===String(selected)?'selected':''}>${esc(label)}</option>`;}
  function unique(values) {return [...new Set(values)].sort();}
  function set(key,value) {
    state[key] = ['years','education'].includes(key) ? Number(value) : value;
    if (key === 'department') state.vacancy='';
    if (key === 'vacancy' && value) {
      const vacancy=data?.vacancies.find(v=>String(v.id)===String(value));
      if (state.department && vacancy?.department!==state.department) state.department='';
    }
    render();
  }
  function filtered() {
    if (!data) return [];
    let rows = data.candidates.filter(c => (!state.vacancy || String(c.vacancy_id)===String(state.vacancy)) &&
(!state.department || c.department===state.department) &&
      (!state.years || (c.experience_known && c.years>=state.years)) && (!state.education || (ranks[c.education_category]||0)>=state.education) &&
      (!state.query || `${c.name} ${c.skills.join(' ')}`.toLowerCase().includes(state.query.toLowerCase())));
    // One person appears once; when several vacancies are included, retain their best fit.
    rows.sort((a,b)=>b.score-a.score || a.id.localeCompare(b.id));
    rows = [...new Map(rows.map(c=>[c.id,c]).reverse()).values()];
    rows.sort((a,b)=>state.sort==='experience' ? (b.experience_known?b.years:-1)-(a.experience_known?a.years:-1)||b.score-a.score : state.sort==='education' ? (ranks[b.education_category]||0)-(ranks[a.education_category]||0)||b.score-a.score : b.score-a.score||a.id.localeCompare(b.id));
    return rows;
  }
  async function load() {
    const version = ++requestVersion;
    const demo = document.getElementById('comparisonDemo')?.checked;
    const status = document.getElementById('comparisonStatus');
    if (status) status.textContent = tr('Loading comparison…');
    try {
      const r=await api('/api/hr/candidate-comparison?demo='+(demo?'1':'0'));
      if (version!==requestVersion) return;
      if (!r.ok) throw Error();
      data=r.data;
      if (!data.vacancies.some(v=>String(v.id)===String(state.vacancy))) state.vacancy='';
      render();
      if (status) status.textContent=tr(demo ? 'Demo mode: synthetic candidates are labelled.' : 'Only candidates who applied to your company and shared their CV summary.');
    } catch { if (version===requestVersion && status) status.textContent=tr('Could not load comparison. Please retry.'); }
  }
  function renderFilters() {
    const positions=data.vacancies.filter(v=>!state.department||(v.department||'General')===state.department);
    const controls={comparePosition:['vacancy',positions.map(v=>[v.id,v.title]),'All positions'], compareDepartment:['department',unique(data.vacancies.map(v=>v.department || 'General')).map(v=>[v,v]),'All departments']};
    Object.entries(controls).forEach(([id,[key,options,all]])=>{const el=document.getElementById(id); if(el)el.innerHTML=option('',all,state[key])+options.map(([v,l])=>option(v,l,state[key])).join('');});
    const select=document.getElementById('podiumVacancy');
    if(select)select.innerHTML=option('','All positions',state.vacancy)+positions.map(v=>option(v.id,v.title,state.vacancy)).join('');
  }

  function pie(rows) {
    const categories=data.education_categories;
    const count=categories.map(category=>rows.filter(c=>c.education_category===category).length);
    let angle=-Math.PI/2;
    const paths=count.map((n,i)=>{
      if(!n) return '';
      const next=angle+2*Math.PI*n/Math.max(rows.length,1), x1=100+80*Math.cos(angle),y1=100+80*Math.sin(angle),x2=100+80*Math.cos(next),y2=100+80*Math.sin(next);
      const title=`${tr(categories[i])}: ${n} (${Math.round(n*100/rows.length)}%)`;
      const shape=n===rows.length?`<circle cx="100" cy="100" r="80"`:`<path d="M100 100 L${x1} ${y1} A80 80 0 ${next-angle>Math.PI?1:0} 1 ${x2} ${y2} Z"`;
      angle=next;
      return `${shape} fill="${colors[i]}" tabindex="0"><title>${esc(title)}</title></${n===rows.length?'circle':'path'}>`;
    }).join('');
    document.getElementById('educationChart').innerHTML=`<svg viewBox="0 0 200 200" role="img" aria-label="${esc(tr('Education distribution'))}">${paths||'<circle cx="100" cy="100" r="80" fill="#e2e8f0"/>'}</svg><ul>${categories.map((c,i)=>`<li class="comparison-legend"><i style="background:${colors[i]}"></i>${text(c)}<b data-no-translate>${count[i]} · ${rows.length?Math.round(100*count[i]/rows.length):0}%</b></li>`).join('')}</ul>`;
  }
  function skillsChart(rows) {
    const requirements = data.vacancies.filter(v=>!state.vacancy||String(v.id)===state.vacancy).flatMap(v=>v.required_skills);
    const skills=unique(requirements).slice(0,12);
    const cohortBars=skills.map(skill=>{
      const n=rows.filter(c=>c.matched_required.includes(skill)||c.skills.includes(skill)).length;
      return `<div class="space-y-1"><div class="flex justify-between gap-3 text-sm">${text(skill)}<b data-no-translate>${n}/${rows.length}</b></div><div class="comparison-bar" role="img" aria-label="${esc(tr(skill))}: ${n}/${rows.length}"><i style="width:${rows.length?100*n/rows.length:0}%"></i></div></div>`;
    }).join('') || '<p>No comparison data.</p>';
    const best=[...rows].sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).slice(0,3);
    const personBars=best.map((c,i)=>{
      const v=data.vacancies.find(v=>v.id===c.vacancy_id), total=v?.required_skills.length || 0;
      const pct=total?Math.round(100*c.matched_required.length/total):0;
      return `<div class="space-y-1"><div class="flex justify-between gap-2 text-xs"><span data-no-translate>${esc(c.name)}</span><b data-no-translate>${pct}% (${c.matched_required.length}/${total})</b></div><div class="comparison-bar" title="${esc(c.matched_required.join(', '))}"><i style="width:${pct}%;background:${colors[i]}"></i></div></div>`;
    }).join('');
    document.getElementById('comparisonSkills').innerHTML='<div class="comparison-skill-scroll" tabindex="0" aria-label="'+esc(tr('CV evidence for required skills'))+'">'+cohortBars+'</div><h3 class="font-bold pt-4">Top 3 CV skill coverage</h3>'+personBars;

  }
  function podium(rows) {
    const best=[...rows].sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).slice(0,3);
    const html=[1,0,2].map(index=>{
      const c=best[index],rank=index+1;
      if(!c) return `<article class="podium-card podium-${rank} podium-empty"><b data-no-translate>#${rank}</b><p>No candidate for this position.</p></article>`;
      return `<article class="podium-card podium-${rank}"><div class="podium-medal" data-no-translate>${['🥇','🥈','🥉'][index]} #${rank}</div><h3 data-no-translate>${esc(c.name)}</h3><p>${esc(c.position)}</p><strong class="podium-score" data-no-translate>${c.score}%</strong><p>${esc(c.education_category)}</p><div class="flex flex-wrap justify-center gap-1">${c.matched_required.slice(0,4).map(s=>`<span class="chip chip-teal">${esc(s)}</span>`).join('')}</div><p class="text-xs">${esc(c.source)}</p><button class="btn btn-hr" onclick="CompanyComparison.shortlist('${esc(c.id)}',${c.vacancy_id})">Shortlist candidate</button></article>`;
    }).join('');
    // Preserve existing cards on unchanged refreshes, keeping focus and preventing flicker.
    if (html !== lastPodiumMarkup) {
      document.getElementById('overviewPodium').innerHTML=html;
      lastPodiumMarkup=html;
    }
  }
  let cmpPage = 1;
  const CMP_PAGE_SIZE = 10;
  function table(rows) {
    const total = rows.length;
    const totalPages = Math.ceil(total / CMP_PAGE_SIZE) || 1;
    if (cmpPage > totalPages) cmpPage = totalPages;
    if (cmpPage < 1) cmpPage = 1;
    const start = (cmpPage - 1) * CMP_PAGE_SIZE;
    const end = Math.min(start + CMP_PAGE_SIZE, total);
    const paged = rows.slice(start, end);

    document.getElementById('comparisonRows').innerHTML=paged.map(c=>`<tr><th scope="row"><span data-no-translate>${esc(c.name)}</span><small>${esc(c.source)}</small></th><td>${esc(c.department)}<small>${esc(c.position)}</small></td><td>${c.experience_known?`<span data-no-translate>${c.years}</span>`:'To confirm'}</td><td>${esc(c.education_category)}<small data-no-translate>${esc(c.institution.join(' · ') || '—')}<br>${esc(c.major.join(' · ') || '—')}</small></td><td><b data-no-translate>${c.score}%</b></td><td><details><summary>Skills & experience</summary><p>Hard skills</p><p>${c.hard_skills.map(s=>text(s)).join(' · ')||'—'}</p><p>Soft skills</p><p>${c.soft_skills.map(s=>text(s)).join(' · ')||'—'}</p><p data-no-translate>${esc(c.past_positions.join(' · ')||'—')}</p><p>To confirm</p><p>${c.to_confirm.map(s=>text(s)).join(' · ')||'—'}</p></details></td><td><select class="input !text-xs" onchange="setDecision('${esc(c.id)}',this.value,${c.vacancy_id})">${['Pending','Shortlist','Needs review','Hold'].map(d=>option(d,d,window.getCandidateDecision?.(c.vacancy_id,c.id)||'Pending')).join('')}</select></td></tr>`).join('') || '<tr><td colspan="7">No candidates match these filters.</td></tr>';

    let pagContainer = document.getElementById('comparisonPagination');
    if (!pagContainer) {
      pagContainer = document.createElement('div');
      pagContainer.id = 'comparisonPagination';
      pagContainer.className = 'flex flex-wrap items-center justify-between gap-3 p-4 border-t border-slate-200/80 bg-slate-50/70 mt-2 rounded-2xl';
      document.getElementById('comparisonRows')?.closest('.table-scroll')?.after(pagContainer);
    }
    if (total > 0 && pagContainer) {
      let pagePills = '';
      for (let p = 1; p <= totalPages; p++) {
        pagePills += `<button type="button" onclick="CompanyComparison.setPage(${p})" class="btn !py-1 !px-3 !text-xs ${p === cmpPage ? 'btn-hr font-extrabold shadow-sm' : 'btn-soft'}">${p}</button>`;
      }
      pagContainer.innerHTML = `
        <div class="text-xs text-slate-500 font-medium">
          Showing <b class="text-slate-800">${start + 1}</b>–<b class="text-slate-800">${end}</b> of <b class="text-slate-800">${total}</b> candidates (10 per page)
        </div>
        <div class="flex items-center gap-1.5">
          <button type="button" onclick="CompanyComparison.setPage(${cmpPage - 1})" ${cmpPage <= 1 ? 'disabled' : ''} class="btn btn-soft !py-1 !px-2.5 !text-xs font-bold ${cmpPage <= 1 ? 'opacity-40 cursor-not-allowed' : ''}">‹ Prev</button>
          ${pagePills}
          <button type="button" onclick="CompanyComparison.setPage(${cmpPage + 1})" ${cmpPage >= totalPages ? 'disabled' : ''} class="btn btn-soft !py-1 !px-2.5 !text-xs font-bold ${cmpPage >= totalPages ? 'opacity-40 cursor-not-allowed' : ''}">Next ›</button>
        </div>
      `;
      pagContainer.hidden = false;
    } else if (pagContainer) {
      pagContainer.hidden = true;
    }
  }
  function snapshot(rows) {
    const container=document.getElementById('comparisonSnapshot'); if(!container)return;
    const avg=rows.length?Math.round(rows.reduce((sum,c)=>sum+c.score,0)/rows.length):null;
    const unknown=rows.filter(c=>!c.experience_known||c.education_category==='Other / To confirm').length;
    const skills=unique(data.vacancies.filter(v=>!state.vacancy||String(v.id)===state.vacancy).flatMap(v=>v.required_skills));
    const gaps=skills.map(skill=>({skill,n:rows.filter(c=>!c.matched_required.includes(skill)&&!c.skills.includes(skill)).length})).sort((a,b)=>b.n-a.n||a.skill.localeCompare(b.skill));
    container.innerHTML=`<div class="snapshot-metrics"><div><span>Matching candidates</span><b data-no-translate>${rows.length}</b></div><div><span>Average match score</span><b data-no-translate>${avg===null?'—':avg+'%'}</b></div><div><span>Qualifications to confirm</span><b data-no-translate>${unknown}</b></div></div>`+
      (rows.length&&gaps[0]?.n?`<div class="snapshot-note"><p class="font-bold">Priority interview check</p><p>${text(gaps[0].skill)} <b data-no-translate>(${gaps[0].n}/${rows.length})</b></p><p class="text-xs">Not listed in CV; ask for a project example.</p></div>`:'');
  }
  function render() {
    if(!data) return;
    renderFilters(); const rows=filtered();
    document.getElementById('comparisonCount').textContent=rows.length;
    pie(rows); skillsChart(rows); snapshot(rows); table(rows); podium(rows);
    window.careerLensLocale?.apply();
  }
  function reset() { cmpPage = 1; Object.assign(state,{department:'',years:0,education:0,sort:'match',query:''}); document.getElementById('comparisonFilters').reset(); render(); }
  function shortlist(id,vid) {
    const candidate=data?.candidates.find(c=>c.id===id && Number(c.vacancy_id)===Number(vid));
    if(candidate)window.shortlistCandidate?.(id,vid);
  }
  async function invite(id,vid) {
    if(typeof window.showTab === 'function') await window.showTab('shortlisting');
  }
  document.addEventListener('change',e=>{if(e.target.id==='uiLanguage') setTimeout(render,0);});
  return {load,set,reset,invite,shortlist,filtered,refresh:render,allCandidates:()=>data?.candidates||[],setPage:p=>{cmpPage=p;render();}};
})();
