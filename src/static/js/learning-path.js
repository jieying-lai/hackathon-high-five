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
    const outcome = step => outcomes[step.target_skill] || 'Create a small portfolio example using this skill and explain your decisions.';
    function save(step, changes) {
      activity[id(step)] = {...state(step), ...changes};
      try { localStorage.setItem(key, JSON.stringify(activity)); }
      catch { if (typeof toast === 'function') toast('Could not save learning progress. Please retry.', 'err'); return false; }
      updateReminder();
      return true;
    }
    const completed = steps.filter(s => state(s).status === 'completed').length;
    const resume = [...steps].filter(s => state(s).status === 'learning').sort((a,b) => (state(b).updated||0)-(state(a).updated||0))[0];
    const next = resume || steps.find(s => state(s).status !== 'completed');
    progress.innerHTML = `<div class="flex flex-wrap justify-between gap-3 items-center"><p class="font-bold text-sm">${text('Learning progress')}: <span data-no-translate>${completed} / ${steps.length}</span></p>${resume ? `<a class="btn btn-primary !py-2 !text-xs" href="${esc(resume.url)}" target="_blank" rel="noopener" data-learn="${steps.indexOf(resume)}">Continue learning ↗</a>` : ''}</div><progress class="w-full h-2 accent-indigo-600" max="${Math.max(1,steps.length)}" value="${completed}" aria-label="Learning progress"></progress><p class="hint">Progress is self-reported and saved on this device for your account.</p>`;
    timeline.innerHTML = steps.length ? steps.map((s,i) => `<div class="relative pl-12 learning-step ${state(s).status==='completed'?'learning-step-completed':''}" id="learningStep${i}"><span class="step-dot absolute left-0 top-0 bg-gradient-to-br from-indigo-500 to-pink-500 text-white">${esc(s.step)}</span><article class="tint tint-indigo rounded-2xl p-4 space-y-3">
      <div class="flex flex-wrap justify-between gap-2"><span class="text-[11px] font-extrabold text-indigo-600">${esc(s.phase)} · ${esc(s.difficulty)}</span><span class="chip chip-amber">${esc(s.hours)} h · ${esc(s.cost_type)}</span></div>
      <h3 class="text-sm font-extrabold">${esc(s.target_skill)}</h3><p class="text-xs text-slate-600">${esc(s.course_title)} · <i>${esc(s.provider)}</i></p>
      <div class="rounded-xl bg-white/60 p-3 text-xs space-y-2"><p class="font-extrabold text-indigo-700">Why this is recommended</p>${role.matched_core_skills?.length ? `<p>${text('Your profile already includes')}: ${role.matched_core_skills.slice(0,3).map(text).join(', ')}.</p>` : ''}<p>${text('Skill to build for your target role')}: ${text(s.target_skill)} · ${text(role.title)}</p><p class="font-extrabold text-teal-700">Suggested practice outcome</p><p>${esc(outcome(s))}</p></div>
      <div class="flex flex-wrap gap-2"><span class="chip chip-teal">${esc(s.malaysia_badge)}</span><span class="chip chip-emerald">${esc(s.sdg)}</span></div>
      <div class="flex flex-wrap gap-2 items-center"><a class="btn btn-primary !py-2 !text-xs" href="${esc(s.url)}" target="_blank" rel="noopener" data-learn="${i}">Learn skill ↗</a><button type="button" class="btn btn-soft !py-2 !text-xs" data-save="${i}" aria-pressed="${!!state(s).saved}">${state(s).saved?'Saved for later':'Save for later'}</button><label class="text-xs font-bold flex items-center gap-2">${text('Learning status')}<select class="input !py-2 !text-xs !w-auto" data-status="${i}">${[['new','Not started'],['learning','Learning'],['completed','Completed']].map(([value,label])=>`<option value="${value}" ${(state(s).status||'new')===value?'selected':''}>${label}</option>`).join('')}</select></label></div>
      </article></div>`).join('') : '<p class="text-sm font-bold text-emerald-700">🎉 You already cover every core skill for this role.</p>';
    goal.innerHTML = next ? `<div class="glass rounded-2xl p-5 space-y-3 border border-indigo-200"><h2 class="font-extrabold">Your next learning goal</h2><p class="font-bold text-indigo-700">${esc(next.target_skill)}</p><p class="text-sm">${esc(outcome(next))}</p><p class="text-xs">${text('Estimated study time')}: ${esc(next.hours)} h</p><p class="text-xs">${text('Target role')}: ${text(role.title)}</p><a class="btn btn-primary !py-2 !text-xs" href="${esc(next.url)}" target="_blank" rel="noopener" data-learn="${steps.indexOf(next)}">${resume?'Continue learning ↗':'Learn skill ↗'}</a></div>` : '<div class="glass rounded-2xl p-5 space-y-2"><h2 class="font-extrabold">Your next learning goal</h2><p>All learning steps are complete. Add your practice project to your CV.</p></div>';
    const saved = steps.filter(s => state(s).saved);
    if (saved.length) goal.innerHTML += `<details class="glass rounded-2xl p-4 mt-4"><summary class="text-sm font-bold cursor-pointer">Saved for later <span data-no-translate>(${saved.length})</span></summary><ul class="space-y-3 mt-3">${saved.map(s => `<li class="text-xs"><p class="font-bold mb-1">${esc(s.target_skill)}</p><a class="text-indigo-700 font-bold" href="${esc(s.url)}" target="_blank" rel="noopener" data-learn="${steps.indexOf(s)}">Learn skill ↗</a></li>`).join('')}</ul></details>`;
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
  window.addEventListener('storage', event => {
    if (reminderOptions && (event.key === null || event.key === 'cl_learning_' + reminderOptions.identity)) updateReminder();
  });
  return {render, reminder, savedSkills};
})();
