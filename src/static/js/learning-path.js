/* Learning activity is self-reported and stored per account on this device. */
window.LearningPath = (() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const text = value => `<span>${esc(value)}</span>`;
  let reminderOptions = null, reminderDismissed = false;
  function savedSkills() {
    if (!reminderOptions) return [];
    let activity = {};
    try { activity = JSON.parse(localStorage.getItem('cl_learning_' + reminderOptions.identity) || '{}') || {}; } catch {}
    return Object.entries(activity).flatMap(([key, value]) => {
      if (!value?.saved || value.status === 'completed') return [];
      try {
        const [skill, url] = JSON.parse(key);
        return typeof skill === 'string' && typeof url === 'string' && /^https?:\/\//i.test(url) ? [{key, skill, url}] : [];
      } catch { return []; }
    });
  }
  function updateSavedBadge(count) {
    document.querySelectorAll('[data-notification-button]').forEach(button => {
      let badge = button.querySelector('[data-saved-learning-count]');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'saved-learning-count';
        badge.dataset.savedLearningCount = '';
        badge.dataset.noTranslate = '';
        button.append(badge);
      }
      badge.hidden = !count;
      badge.textContent = String(count);
      badge.setAttribute('aria-label', `${count} saved skills to learn`);
    });
  }
  function updateReminder() {
    if (!reminderOptions) return;
    const {identity, container, onChange} = reminderOptions;
    updateSavedBadge(savedSkills().length);
    if (reminderDismissed) { container.hidden = true; return; }
    let activity = {};
    try { activity = JSON.parse(localStorage.getItem('cl_learning_' + identity) || '{}') || {}; } catch {}
    const saved = Object.entries(activity).flatMap(([key, value]) => {
      if (!value?.saved || value.status === 'completed') return [];
      try {
        const [skill, url] = JSON.parse(key);
        if (typeof skill !== 'string' || typeof url !== 'string' || !/^https?:\/\//i.test(url)) return [];
        return [{key, skill, url}];
      } catch { return []; }
    });
    container.hidden = !saved.length;
    if (!saved.length) return;
    container.innerHTML = `<div class="flex justify-between items-start gap-3"><div><p class="font-extrabold text-indigo-800">${text('Your saved skills are waiting')} <span data-no-translate>(${saved.length})</span></p><p class="text-xs text-slate-600 mt-1">Pick up a saved skill when you are ready.</p></div><button type="button" class="btn btn-soft !py-1 !px-3" aria-label="Dismiss learning reminder" data-dismiss-reminder>×</button></div><details class="mt-3"><summary class="text-sm font-bold text-indigo-700 cursor-pointer">View saved skills</summary><ul class="space-y-3 mt-3">${saved.map((s,i) => `<li class="flex flex-wrap justify-between items-center gap-2 text-xs"><span>${esc(s.skill)}</span><a class="font-extrabold text-indigo-700" data-reminder-learn="${i}" href="${esc(s.url)}" target="_blank" rel="noopener">Learn skill ↗</a></li>`).join('')}</ul></details>`;
    container.querySelector('[data-dismiss-reminder]').addEventListener('click', () => { reminderDismissed = true; container.hidden = true; });
    container.querySelectorAll('[data-reminder-learn]').forEach(link => link.addEventListener('click', () => {
      const item = saved[Number(link.dataset.reminderLearn)];
      activity[item.key] = {...activity[item.key], status:'learning', updated:Date.now()};
      try { localStorage.setItem('cl_learning_' + identity, JSON.stringify(activity)); }
      catch { if (typeof toast === 'function') toast('Could not save learning progress. Please retry.', 'err'); return; }
      setTimeout(() => onChange?.(), 0);
    }));
    window.careerLensLocale?.apply();
  }
  function reminder(options) {
    reminderOptions = options;
    reminderDismissed = false;
    updateReminder();
    const saved = savedSkills();
    if (saved.length && typeof toast === 'function') {
      const message = window.careerLensLocale?.translate('Your saved skills are waiting') || 'Your saved skills are waiting';
      toast(`${message} (${saved.length})`);
    }
  }
  const outcomes = {
    'LLM Orchestration (LangChain/LlamaIndex)': 'Build a small AI assistant that connects a language model to a tool.',
    'Vector Databases & RAG': 'Build a prototype that answers questions using a PDF and cites its sources.',
    'AI Guardrails & Evaluation': 'Create a small evaluation set to check an AI assistant for unsafe or unsupported answers.',
    'Python': 'Create a Python script that automates a repetitive task and document the result.',
    'SQL': 'Write queries that answer a practical business question using a sample dataset.',
    'REST APIs': 'Build a small application that reads and displays data from an API.'
  };
  function render({role, identity, timeline, progress, goal, refresh, locale}) {
    const key = 'cl_learning_' + identity;
    let activity;
    try { activity = JSON.parse(localStorage.getItem(key) || '{}'); } catch { activity = {}; }
    if (!activity || typeof activity !== 'object' || Array.isArray(activity)) activity = {};
    const steps = role.ordered_pathway || [];
    const id = step => JSON.stringify([step.target_skill, step.url]);
    const state = step => activity[id(step)] || {};
    // Retain course-to-SDG evidence if this course later leaves the skills-gap list.
    let enriched = false;
    for (const step of steps) {
      if (activity[id(step)] && !activity[id(step)].sdg) {
        activity[id(step)] = {...state(step), sdg:step.sdg, course_title:step.course_title, hours:step.hours};
        enriched = true;
      }
    }
    if (enriched) { try { localStorage.setItem(key, JSON.stringify(activity)); } catch {} }
    const outcome = step => outcomes[step.target_skill] || 'Create a small portfolio example using this skill and explain your decisions.';
    function save(step, changes) {
      if (!record({identity,step,changes})) return false;
      try { activity = JSON.parse(localStorage.getItem(key) || '{}'); } catch {}
      return true;
    }
    const completed = steps.filter(s => state(s).status === 'completed').length;
    const resume = [...steps].filter(s => state(s).status === 'learning').sort((a,b) => (state(b).updated||0)-(state(a).updated||0))[0];
    const next = resume || steps.find(s => state(s).status !== 'completed');
    progress.innerHTML = `<div class="flex flex-wrap justify-between gap-3 items-center"><p class="font-bold text-sm">${text('Learning progress')}: <span data-no-translate>${completed} / ${steps.length}</span></p><span class="reskilling-progress-percent" data-no-translate>${steps.length?Math.round(completed/steps.length*100):100}%</span></div><progress class="w-full h-2 accent-indigo-600" max="${Math.max(1,steps.length)}" value="${steps.length?completed:1}" aria-label="Learning progress"></progress><p class="hint">Progress is self-reported and saved on this device for your account.</p>`;
    timeline.innerHTML = steps.length ? steps.map((s,i) => `<div class="relative pl-12 learning-step ${state(s).status==='completed'?'learning-step-completed':''}" id="learningStep${i}"><span class="step-dot absolute left-0 top-0 bg-gradient-to-br from-indigo-500 to-pink-500 text-white">${i+1}${state(s).status==='completed'?'<span class="learning-step-check" aria-hidden="true">✓</span>':''}</span><article class="tint tint-indigo rounded-2xl p-4 space-y-3">
      <div class="flex flex-wrap justify-between gap-2"><span class="text-[11px] font-extrabold text-indigo-600">${esc(s.phase)} · ${esc(s.difficulty)}</span><span class="chip chip-amber">${esc(s.hours)} h · ${esc(s.cost_type)}</span></div>
      <h3 class="text-sm font-extrabold">${esc(s.target_skill)}</h3><p class="text-xs text-slate-600">${esc(s.course_title)} · <i>${esc(s.provider)}</i></p>
      <p class="learning-step-outcome text-xs text-slate-600">${esc(outcome(s))}</p><details class="learning-step-details rounded-xl bg-white/60 p-3 text-xs space-y-2"><summary class="font-extrabold text-indigo-700 cursor-pointer">Why this is recommended</summary>${role.matched_core_skills?.length ? `<p>${text('Your profile already includes')}: ${role.matched_core_skills.slice(0,3).map(text).join(', ')}.</p>` : ''}<p>${text('Skill to build for your target role')}: ${text(s.target_skill)} · ${text(role.title)}</p></details>
      <div class="flex flex-wrap gap-2"><span class="chip chip-teal">${esc(s.malaysia_badge)}</span><span class="chip chip-emerald">${esc(s.sdg)}</span></div>
      <div class="flex flex-wrap gap-2 items-center"><a class="btn btn-primary !py-2 !text-xs" href="${esc(s.url)}" target="_blank" rel="noopener" data-learn="${i}">Learn skill ↗</a><button type="button" class="btn btn-soft !py-2 !text-xs" data-save="${i}" aria-pressed="${!!state(s).saved}">${state(s).saved?'Saved to courses':'Save course'}</button><label class="text-xs font-bold flex items-center gap-2">${text('Learning status')}<select class="input !py-2 !text-xs !w-auto" data-status="${i}">${[['new','Not started'],['learning','Learning'],['completed','Completed']].map(([value,label])=>`<option value="${value}" ${(state(s).status||'new')===value?'selected':''}>${label}</option>`).join('')}</select></label></div>
      </article></div>`).join('') : '<p class="text-sm font-bold text-emerald-700">🎉 You already cover every core skill for this role.</p>';
    goal.innerHTML = next ? `<div class="learning-next-card"><div class="learning-next-content"><h2>Your next learning goal</h2><h3>${esc(next.target_skill)}</h3><p>${esc(outcome(next))}</p></div><div class="learning-next-action"><p>${text('Estimated study time')}: <b data-no-translate>${esc(next.hours)} h</b></p><a class="btn btn-primary" href="${esc(next.url)}" target="_blank" rel="noopener" data-learn="${steps.indexOf(next)}">${resume?'Continue learning ↗':'Learn skill ↗'}</a></div></div>` : '<div class="learning-next-card learning-next-done"><div class="learning-next-content"><h2>Your next learning goal</h2><p>All learning steps are complete. Add your practice project to your CV.</p></div></div>';
    for (const root of [timeline, progress, goal]) {
      root.querySelectorAll('[data-learn]').forEach(link => link.addEventListener('click', () => {
        const step = steps[Number(link.dataset.learn)];
        if (save(step, {status:state(step).status==='completed'?'completed':'learning', updated:Date.now()})) setTimeout(refresh, 0);
      }));
      root.querySelectorAll('[data-save]').forEach(button => button.addEventListener('click', () => {
        const step = steps[Number(button.dataset.save)];
        if (save(step, {saved:!state(step).saved})) refresh();
      }));
      root.querySelectorAll('[data-status]').forEach(select => select.addEventListener('change', () => {
        if (save(steps[Number(select.dataset.status)], {status:select.value,updated:Date.now()})) refresh();
      }));
    }
    locale?.apply();
  }
  function completedCourses(identity,roles=[]) {
    let activity={};try{activity=JSON.parse(localStorage.getItem('cl_learning_'+identity)||'{}')||{};}catch{}
    if(typeof activity!=='object'||Array.isArray(activity))return [];
    const known=new Map();
    for(const role of roles)for(const step of role.ordered_pathway||[])known.set(JSON.stringify([step.target_skill,step.url]),step);
    for(const step of window.DiscoveryLearning?.catalogue||[])known.set(JSON.stringify([step.target_skill,step.url]),step);
    const courses=[];
    for(const [key,item] of Object.entries(activity)){
      if(item?.status!=='completed')continue;
      let parts;try{parts=JSON.parse(key);}catch{continue;}
      if(!Array.isArray(parts)||parts.length!==2||parts.some(v=>typeof v!=='string'))continue;
      let url;try{url=new URL(parts[1]);}catch{continue;}
      if(!['http:','https:'].includes(url.protocol)||url.username||url.password)continue;
      const step=known.get(key)||{};
      const source=item.source||(step.source==='discovery'?'discovery':'career');
      const itemHours=Number(item.hours),stepHours=Number(step.hours);
      const hasKnownHours=(Number.isFinite(itemHours)&&itemHours>0)||(Number.isFinite(stepHours)&&stepHours>0);
      const estimatedHours=!hasKnownHours&&source==='discovery';
      courses.push({key,skill:parts[0],url:parts[1],title:item.course_title||step.course_title||parts[0],provider:item.provider||step.provider||url.hostname,
        hours:hasKnownHours?(Number.isFinite(itemHours)&&itemHours>0?itemHours:stepHours):(estimatedHours?2:0),hours_estimated:estimatedHours,sdg:item.sdg||step.sdg||'',sdgs:Array.isArray(item.sdgs)?item.sdgs:(step.sdgs||[]),source,
        completed_at:Number.isFinite(item.completed_at)&&item.completed_at>0&&item.completed_at<=8640000000000000?item.completed_at:null});
    }
    const unique=new Map();
    for(const course of courses){const prior=unique.get(course.url);if(!prior||(course.completed_at||0)>(prior.completed_at||0))unique.set(course.url,course);}
    return [...unique.values()].sort((a,b)=>(b.completed_at||0)-(a.completed_at||0)||a.title.localeCompare(b.title));
  }
  const completedViews=new WeakMap();
  function renderCompleted(options) {
    const {identity,container,roles,locale,onExplore}=options;if(!container)return;
    const tr=s=>locale?.translate(s)||s;
    let view=completedViews.get(container);if(!view||view.identity!==identity){view={identity,filter:'all'};completedViews.set(container,view);}
    const courses=completedCourses(identity,roles),hours=courses.reduce((n,c)=>n+(c.hours>0?c.hours:0),0);
    const visible=courses.filter(c=>view.filter==='all'||c.source===view.filter);
    container.innerHTML=`<section class="completed-learning"><div class="completed-summary" data-outline-label="Your learning progress"><div><strong data-no-translate>${courses.length}</strong><span>${esc(tr('Completed courses'))}</span></div><div><strong data-no-translate>${hours.toLocaleString(undefined,{maximumFractionDigits:1})} h</strong><span>${esc(tr('Learning hours'))}</span></div><div><strong data-no-translate>${courses.filter(c=>c.source==='discovery').length}</strong><span>${esc(tr('Additional courses completed'))}</span></div></div><p class="hint">${esc(tr('Completion is self-reported. Provider hours are used when available; additional courses without a listed duration are estimated at 2 hours each. These are estimates, not tracked study time.'))}</p>
      <div data-outline-label="Community impact" data-learning-impact></div>
      <div class="discovery-topics" role="group" aria-label="Completed learning filters">${[['all','All learning'],['career','Career plan'],['discovery','Additional courses']].map(([value,label])=>`<button type="button" data-completed-filter="${value}" aria-pressed="${view.filter===value}">${esc(tr(label))}</button>`).join('')}</div>
      <div class="completed-course-list" ${visible.length?'data-outline-label="Completed courses"':''}>${visible.map(c=>`<article class="completed-course"><span class="completed-check" aria-hidden="true">✓</span><div><p class="discovery-provider" data-no-translate>${esc(c.provider)}</p><h3 data-no-translate>${esc(c.title)}</h3><p class="completed-course-meta">${esc(tr(c.source==='discovery'?'Additional courses':'Career plan'))} · ${c.completed_at?esc(tr('Completed on'))+' <time datetime="'+esc(new Date(c.completed_at).toISOString())+'" data-no-translate>'+esc(new Date(c.completed_at).toLocaleDateString())+'</time>':esc(tr('Completion date not recorded'))}${c.hours>0?' · '+esc(c.hours)+' h'+(c.hours_estimated?' '+esc(tr('estimated')):''):''}</p><div class="discovery-sdg-tags">${(c.sdgs||[]).map(s=>`<span class="chip chip-teal" title="${esc(s.reason||'')}">${esc(s.code||`SDG ${s.goal}`)} · ${esc(tr(s.name||''))}${s.alignment_type==='learning_support'?' · '+esc(tr('learning support')):''}</span>`).join('')||`<span class="chip chip-teal" data-no-translate>${esc(c.sdg||'SDG 4')}</span>`}</div></div><a class="btn btn-soft" href="${esc(c.url)}" target="_blank" rel="noopener">${esc(tr('Revisit course ↗'))}</a></article>`).join('')}</div>
      ${!visible.length?`<div class="discovery-wishlist-empty" data-outline-label="Completed courses">✓<p>${esc(tr('Your completed learning will appear here.'))}</p><span>${esc(tr('Mark a course Completed after you finish learning.'))}</span></div>`:''}<button type="button" class="btn btn-primary" data-completed-explore>${esc(tr('Explore Learning'))} ↗</button></section>`;
    window.LearningImpact?.render({identity,container:container.querySelector('[data-learning-impact]'),locale});
    container.querySelectorAll('[data-completed-filter]').forEach(button=>button.addEventListener('click',()=>{view.filter=button.dataset.completedFilter;renderCompleted(options);}));
    container.querySelector('[data-completed-explore]').addEventListener('click',()=>onExplore?.());
    locale?.apply();
  }
  window.addEventListener('storage', event => {
    if (reminderOptions && (event.key === null || event.key === 'cl_learning_' + reminderOptions.identity)) updateReminder();
  });
  function record({identity,step,changes}) {
    const key='cl_learning_'+identity;
    let activity={};
    try {activity=JSON.parse(localStorage.getItem(key)||'{}')||{};} catch {}
    if(typeof activity!=='object'||Array.isArray(activity))activity={};
    const id=JSON.stringify([step.target_skill,step.url]), prior=activity[id]||{};
    if(changes.status==='completed'&&prior.status!=='completed')changes={...changes,completed_at:Date.now()};
    if(changes.saved===true&&!prior.saved)changes={...changes,saved_at:Date.now()};
    activity[id]={...prior,sdg:step.sdg,sdgs:Array.isArray(step.sdgs)?step.sdgs:prior.sdgs,course_title:step.course_title,hours:step.hours,source:step.source||'career',recommendation_id:step.id||prior.recommendation_id,provider:step.provider??prior.provider,category:step.category??prior.category,description:step.description??prior.description,...changes};
    try {localStorage.setItem(key,JSON.stringify(activity));}
    catch {if(typeof toast==='function')toast('Could not save learning progress. Please retry.','err');return false;}
    updateReminder();
    if(changes.status==='completed')window.dispatchEvent(new CustomEvent('careerlens:learning-change',{detail:{identity}}));
    if(changes.saved===true&&!prior.saved&&typeof toast==='function')toast(window.careerLensLocale?.translate('Added to Saved Courses.')||'Added to Saved Courses.');
    return true;
  }
  return {render, reminder, savedSkills, record, completedCourses, renderCompleted};
})();
