/* The public discovery journey: one primary next step on every screen. */
(() => {
  'use strict';
  const DRAFT_KEY = 'careerlens_guided_cv_draft';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
  const sectors = {tech: 'Technology', health: 'Healthcare', creative: 'Creative', green: 'Climate & sustainability', finance: 'Finance'};
  const questions = [
    {key: 'role', title: 'Your next role?', help: 'Keep this direction, or type another.', type: 'text', max: 120},
    {key: 'years', title: 'Where are you now?', options: ['Still studying', 'Just starting', '1–2 years', '3–5 years', '6+ years']},
    {key: 'work_mode', title: 'Your preferred setup?', options: ['Remote', 'Hybrid', 'On-site']},
    {key: 'skills', title: 'What are your strengths?', help: 'Choose a few skills you have.', options: ['Communication', 'Problem solving', 'Data analysis', 'Design', 'Programming', 'Project coordination'], type: 'skills'},
    {key: 'experience_highlight', title: 'A moment you are proud of?', help: 'Work, study or volunteering. Your own words.', type: 'textarea', max: 2000, optional: true},
    {key: 'education', title: 'What have you studied?', help: 'A qualification, course or subject.', type: 'textarea', max: 1000, optional: true}
  ];
  let state = {sector: 'tech', selectedRole: 0, model: -1, busy: false};
  let root;
  const bound = new WeakSet();
  const image = () => state.t?.characterImage || '/static/illustrations/totem_characters/owl.svg';
  const roleList = () => state.roles?.[state.sector]?.[state.solo ? 'solo' : 'social'] || [];

  function readDraft() {
    try {
      const value = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || 'null');
      return value?.version === 1 && value.answers && Array.isArray(value.answers.skills)
        && Number.isInteger(value.step) && value.step >= 0 && value.step <= questions.length ? value : null;
    } catch { return null; }
  }
  function persist() {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(state.draft));
      return true;
    } catch {
      state.error = 'Your browser could not keep this draft. Allow site storage before continuing to login.';
      return false;
    }
  }
  function bind(element) {
    root = element;
    if (bound.has(element)) return;
    bound.add(element);
    element.addEventListener('click', event => {
      const button = event.target.closest('[data-guided-action]');
      if (!button || button.disabled) return;
      const action = button.dataset.guidedAction;
      if (action === 'deep') deep();
      if (action === 'careers') careers();
      if (action === 'cv') cv(roleList()[state.selectedRole]?.title || '');
      if (action === 'model') { state.model = state.model === Number(button.dataset.index) ? -1 : Number(button.dataset.index); deep(false); }
      if (action === 'role') { state.selectedRole = Number(button.dataset.index); careers(false); }
      if (action === 'choice') {
        const q = questions[state.draft.step];
        if (!q || !root.contains(button)) return;
        if (q.type === 'skills') {
          const chosen = new Set(state.draft.answers.skills || []);
          chosen.has(button.dataset.value) ? chosen.delete(button.dataset.value) : chosen.add(button.dataset.value);
          state.draft.answers.skills = [...chosen];
        } else state.draft.answers[q.key] = button.dataset.value;
        state.error = '';
        if (q.type === 'skills') {
          persist();
          renderCv(false);
          root.querySelector(`[data-guided-action="choice"][data-value="${CSS.escape(button.dataset.value)}"]`)?.focus({preventScroll:true});
        } else {
          nextQuestion();
        }
      }
      if (action === 'next') nextQuestion();
      if (action === 'skip') { state.draft.answers[questions[state.draft.step].key] = ''; state.draft.step++; persist(); renderCv(); }
      if (action === 'back') { state.draft.step = Math.max(0, state.draft.step - 1); state.error = ''; persist(); renderCv(); }
      if (action === 'finish') finish();
    });
    element.addEventListener('input', event => {
      if (!event.target.matches('[data-guided-input]') || !state.draft) return;
      state.draft.answers[event.target.dataset.guidedInput] = event.target.value;
      persist();
    });
    element.addEventListener('change', event => {
      if (event.target.id === 'guidedSector') { state.sector = event.target.value; state.selectedRole = 0; careers(false); }
      if (event.target.matches('[data-guided-replace]')) {
        state.replace = event.target.checked;
        const button = root.querySelector('[data-guided-action="finish"]');
        if (button) button.disabled = !state.replace;
      }
    });
    element.addEventListener('keydown', event => {
      if (event.key === 'Enter' && event.target.matches('input[data-guided-input]')) {
        event.preventDefault();
        nextQuestion();
      }
    });
  }
  function show(step, content, shouldScroll = true) {
    root.innerHTML = `<div class="guided-flow" data-guided-step="${step}">
      ${step === 4 ? '' : `<div class="guided-progress"><span>YOUR NEXT CHAPTER</span><span>${['Your style', 'Your personality', 'Your direction'][step - 1]} · ${step} / 4</span></div>`}
      ${content}</div>`;
    if (shouldScroll) {
      root.scrollIntoView({behavior: 'instant', block: 'start'});
      const heading = root.querySelector('h2');
      if (heading) { heading.tabIndex = -1; heading.focus({preventScroll: true}); }
    }
  }
  const onward = (action, disabled = false) => `<button type="button" class="guided-continue" data-guided-action="${action}" ${disabled ? 'disabled' : ''}>Continue <span aria-hidden="true">→</span></button>`;
  function overview() {
    show(1, `<section class="glass-panel guided-reveal">
      <div class="guided-animal-orb"><img src="${escape(image())}" alt="" /></div>
      <p class="guided-eyebrow">Meet your work-style companion</p>
      <h2>${escape(state.t.badge)}</h2><p class="guided-tagline">${escape(state.t.tagline)}</p>
      <div class="guided-strengths">${(state.t.strengths || []).slice(0, 3).map(s => `<span>${escape(s)}</span>`).join('')}</div>
      <details class="guided-extra"><summary>About this style</summary><p>${escape(state.t.brief)}</p></details>
      <p class="guided-note">A reflection, not a fixed label or clinical assessment.</p>
      ${onward('deep')}</section>`);
  }
  function deep(shouldScroll = true) {
    const poles = state.t.mbtiPoles || {};
    const models = (state.t.roleModels || []).slice(0, 3);
    const selected = models[state.model];
    show(2, `<section class="glass-panel">
      <p class="guided-eyebrow">A little more you</p><h2>Your personality spectrum</h2>
      <div class="guided-spectrum">${Object.values(poles).map((p, i) => {
        const pct = Math.max(0, Math.min(100, Number(p.leftPct) || 0));
        return `<div class="spectrum-row" style="--tube-hue:${i * 25}deg">
          <div class="spectrum-labels"><span>${escape(p.leftName)} <strong>${pct}%</strong></span><span>${escape(p.rightName)} <strong>${100 - pct}%</strong></span></div>
          <div class="spectrum-tube" role="img" aria-label="${escape(p.leftName)} ${pct} percent; ${escape(p.rightName)} ${100 - pct} percent">
            <div class="spectrum-fill" style="width:${pct}%"></div><span class="spectrum-marker" style="left:${pct}%"></span>
          </div></div>`;
      }).join('')}</div>
    </section><section class="glass-panel">
      <p class="guided-eyebrow">Shared sparks</p><h2>Who walks your path?</h2>
      <p class="guided-note">Tap a story. Inspiration, not prediction.</p>
      <div class="role-model-grid">${models.map((model, i) => `<button type="button" class="role-model-choice" data-guided-action="model" data-index="${i}" aria-expanded="${state.model === i}" aria-pressed="${state.model === i}" aria-controls="guidedRoleModelDetail">
        <img src="${escape(model.photo || image())}" alt="" loading="lazy" /><strong>${escape(model.name)}</strong><span>${state.model === i ? 'Close story −' : 'Read story +'}</span>
      </button>`).join('')}</div>
      <div id="guidedRoleModelDetail" class="guided-model-detail" ${selected ? '' : 'hidden'} aria-live="polite">
        ${selected ? `<h3>${escape(selected.name)}</h3><p class="guided-eyebrow">${escape(selected.field)}</p>
        <p><strong>The beginning</strong><br>${escape(selected.struggle)}</p>
        <p><strong>The turning point</strong><br>${escape(selected.milestone)}</p>
        <blockquote>“${escape(selected.wisdom)}”</blockquote>` : ''}
      </div>
    </section>${onward('careers')}`, shouldScroll);
    if (!shouldScroll) root.querySelector(`[data-guided-action="model"][data-index="${Math.max(0, state.model)}"]`)?.focus({preventScroll: true});
  }
  function careerArt(index) {
    const icons = {
      tech: '<rect x="42" y="24" width="76" height="66" rx="14"/><path d="M60 48l-12 10 12 10m40-20 12 10-12 10M88 43L72 73M65 104h30M80 90v14"/>',
      health: '<path d="M68 25h24v25h25v24H92v25H68V74H43V50h25z"/><path d="M28 65h14m76 0h14"/>',
      creative: '<path d="M80 20l52 42-52 42-52-42zM28 79l52 29 52-29"/><circle cx="80" cy="62" r="17"/>',
      green: '<path d="M124 23C47 15 26 59 56 84c30 25 72-4 68-61zM42 106l62-62M69 77V52m0 25h25"/>',
      finance: '<path d="M32 102h98M44 86V64h18v22m16 0V44h18v42m16 0V26h18v60M35 45l29-20 25 5 30-18"/>'
    };
    return `<svg viewBox="0 0 160 128" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="${index ? 98 : 62}" cy="62" r="54" fill="currentColor" opacity=".05" stroke="none"/>${icons[state.sector] || icons.tech}</svg>`;
  }
  function careers(shouldScroll = true) {
    const list = roleList();
    show(3, `<section class="glass-panel">
      <p class="guided-eyebrow">Possibilities, not boxes</p><h2>Where could you go next?</h2>
      <label class="guided-sector-label" for="guidedSector">Explore a field</label>
      <select id="guidedSector">${Object.entries(sectors).map(([key, title]) => `<option value="${key}" ${state.sector === key ? 'selected' : ''}>${title}</option>`).join('')}</select>
      <div class="career-visual-grid">${list.map((role, i) => `<button type="button" class="career-visual-card ${i === state.selectedRole ? 'selected' : ''}" data-guided-action="role" data-index="${i}" aria-pressed="${i === state.selectedRole}">
        <span class="career-card-art">${careerArt(i)}</span><span class="career-card-copy"><span class="guided-eyebrow">${escape(role.vibe)}</span>
        <strong>${escape(role.title)}</strong><small>${i === state.selectedRole ? 'Selected ✓' : 'Explore →'}</small></span>
      </button>`).join('')}</div>
      ${list[state.selectedRole] ? `<details class="guided-extra"><summary>Why this direction?</summary><p>${escape(list[state.selectedRole].why)}</p></details>` : ''}
      <p class="guided-note">Explore a possibility—not a job-fit assessment.</p>
      ${onward('cv', !list.length)}</section>`, shouldScroll);
  }
  function cv(prefillRole = '') {
    const saved = readDraft();
    state.draft = saved && (!prefillRole || saved.answers.role === prefillRole) ? saved : {
      version: 1, step: 0, ready: false, answers: {role: prefillRole, skills: []},
      companion: {badge: state.t?.badge || 'Your career companion', characterImage: image()}
    };
    state.error = '';
    persist();
    renderCv();
  }
  function renderCv(shouldScroll = true) {
    const draft = state.draft;
    const step = Math.min(questions.length, Math.max(0, Number(draft.step) || 0));
    draft.step = step;
    const q = questions[step];
    const singleChoice = q?.options && q.type !== 'skills';
    const answers = draft.answers;
    const review = !q;
    const current = q ? answers[q.key] : '';
    const input = q && (q.type === 'text' || q.type === 'textarea') ? `<label class="sr-only" for="guidedAnswer">${escape(q.title)}</label>
      ${q.type === 'textarea' ? `<textarea id="guidedAnswer" class="cv-dialog-input" data-guided-input="${q.key}" maxlength="${q.max}" rows="4" placeholder="${q.optional ? 'Your words, when you are ready…' : ''}">${escape(current || '')}</textarea>` :
      `<input id="guidedAnswer" class="cv-dialog-input" data-guided-input="${q.key}" maxlength="${q.max}" value="${escape(current || '')}" autocomplete="off" />`}` : '';
    const options = q?.options ? `<div class="cv-dialog-options">${q.options.map(value => {
      const selected = q.type === 'skills' ? (answers.skills || []).includes(value) : current === value;
      return `<button type="button" data-guided-action="choice" data-value="${escape(value)}" aria-pressed="${selected}">${escape(value)}<span aria-hidden="true">${selected ? '✓' : singleChoice ? '→' : '+'}</span></button>`;
    }).join('')}</div>` : '';
    show(4, `<section class="cv-dialog">
      <div class="cv-companion-heading"><img src="${escape(image())}" alt="" /><div><p class="guided-eyebrow">Your story</p><span>${review ? 'Review' : `${step + 1} / ${questions.length}`}</span></div></div>
      <div class="cv-dialog-progress" role="progressbar" aria-label="CV conversation progress" aria-valuemin="0" aria-valuemax="${questions.length}" aria-valuenow="${step}"><span style="display:block;width:${step / questions.length * 100}%"></span></div>
      ${step > 0 ? '<button type="button" class="guided-back" data-guided-action="back">← Back</button>' : state.roles ? '<button type="button" class="guided-back" data-guided-action="careers">← Directions</button>' : ''}
      <div class="cv-dialog-message" aria-live="polite"><h2>${review ? 'Your story is ready.' : escape(q.title)}</h2>${review ? '<p>Only what you shared. Edit any answer.</p>' : q.help ? `<p>${escape(q.help)}</p>` : ''}</div>
      ${review ? `<details class="guided-extra"><summary>Review your answers</summary><dl class="cv-dialog-preview">${questions.map(item => {
        const value = item.key === 'skills' ? combinedSkills().join(', ') : answers[item.key];
        return `<div><dt>${({role:'Your direction',years:'Your experience',work_mode:'Preferred setting',skills:'Your skills',experience_highlight:'Your highlight',education:'Your learning'})[item.key]}</dt><dd>${escape(value || 'Not added')}</dd></div>`;
      }).join('')}</dl></details>
      ${state.existingCv ? `<label class="guided-replace-warning"><input type="checkbox" data-guided-replace ${state.replace ? 'checked' : ''} /> I agree to replace my current CV. This also withdraws earlier applications and revokes employer access; I will need to apply again to share the new version.</label>` : ''}
      <p class="guided-note">${document.getElementById('profileTotemCard') ? 'Continue saves your CV privately.' : 'Sign in next to save. Your draft stays in this tab.'}</p>` :
      `${input}${options}${q.type === 'skills' ? `<label for="guidedSkills" class="guided-sector-label">Add a skill (comma-separated)</label><input id="guidedSkills" class="cv-dialog-input" data-guided-input="extra_skills" maxlength="800" value="${escape(answers.extra_skills || '')}" placeholder="Excel, video editing…" />` : ''}
      ${q.optional ? '<button type="button" class="guided-back" data-guided-action="skip">Skip for now</button>' : ''}`}
      <p class="guided-error" role="status">${escape(state.error || '')}</p>
      ${singleChoice ? '' : onward(review ? 'finish' : 'next', state.busy || (review && state.existingCv && !state.replace))}
    </section>`, shouldScroll);
  }
  function combinedSkills() {
    return [...new Set([...(state.draft.answers.skills || []), ...(state.draft.answers.extra_skills || '').split(',').map(x => x.trim()).filter(Boolean)])];
  }
  function nextQuestion() {
    const q = questions[state.draft.step];
    if (!q) return;
    const answer = q.type === 'skills' ? combinedSkills() : state.draft.answers[q.key];
    state.error = '';
    if (!q.optional && (!answer || !answer.length || (typeof answer === 'string' && !answer.trim()))) {
      state.error = q.type === 'skills' ? 'Choose at least one skill, or add one of your own.' : 'Choose or type an answer to continue.';
      renderCv(false);
      root.querySelector('#guidedAnswer, #guidedSkills, [data-guided-action="choice"]')?.focus({preventScroll: true});
      return;
    }
    if (q.key === 'role' && String(answer).trim().length < 2) {
      state.error = 'Please enter a role with at least two characters.';
      renderCv(false);
      return;
    }
    state.draft.step++;
    if (!persist()) state.draft.step--;
    renderCv();
  }
  async function finish() {
    if (state.busy) return;
    state.draft.ready = true;
    if (!persist()) { renderCv(false); return; }
    state.busy = true;
    state.error = '';
    renderCv(false);
    try {
      const meResponse = await fetch('/api/auth/me');
      if (!meResponse.ok) throw new Error('Could not check your account. Please try again.');
      const me = await meResponse.json();
      if (!me.user || me.user.role !== 'job_seeker') {
        if (typeof window.openAuth !== 'function') throw new Error('Please sign in with a Talent account to save your CV.');
        window.openAuth('login', 'job_seeker');
        return;
      }
      const existingResponse = await fetch('/api/cv/me');
      if (!existingResponse.ok) throw new Error('Could not check your existing CV. Your draft is still here.');
      const existing = await existingResponse.json();
      if (existing.cv && !state.replace) {
        state.existingCv = true;
        throw new Error('You already have a CV. Confirm replacement below, or go back to keep editing this draft.');
      }
      const response = await fetch('/api/cv/guided-build', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({...state.draft.answers, skills: combinedSkills(), replace_existing: Boolean(state.replace)})
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        if (response.status === 409) state.existingCv = true;
        throw new Error(data.message || 'Your CV could not be saved. Please try again.');
      }
      sessionStorage.removeItem(DRAFT_KEY);
      document.getElementById('guidedDraftBanner')?.remove();
      window.dispatchEvent(new CustomEvent('careerlens:cv-saved'));
      show(4, `<section class="glass-panel guided-reveal"><div class="guided-animal-orb"><img src="${escape(image())}" alt="" /></div>
        <p class="guided-eyebrow">One step forward</p><h2>Your story is ready.</h2><p class="guided-description">Your CV is saved in your private workspace. Review it before sharing it with an employer.</p>
        <a class="guided-continue" href="/api/cv/me/pdf" download>Download my CV <span aria-hidden="true">↓</span></a></section>`);
      state.draft = null;
    } catch (error) {
      state.error = error.message || 'Something went wrong. Your draft has not been lost.';
    } finally {
      state.busy = false;
      if (state.draft) renderCv(false);
    }
  }
  window.GuidedCareerFlow = {
    start(t, context) {
      const element = document.getElementById('totemResultCard');
      if (!element) throw new Error('The career discovery result container is missing.');
      state = {t, roles: context.roles, solo: context.solo, sector: 'tech', selectedRole: 0, model: -1, busy: false};
      bind(element);
      document.getElementById('landingHomeContent')?.classList.add('hidden');
      document.getElementById('totemWelcomeCard')?.classList.add('hidden');
      document.getElementById('totemQuizCard')?.classList.add('hidden');
      root.classList.remove('hidden');
      window.renderTotemOverview = overview;
      window.showDeepProfileView = deep;
      window.showElevatedCareersView = careers;
      window.showCompanionCvStudio = cv;
      overview();
    }
  };
  // Login redirects into the same tab; the user explicitly resumes before saving.
  const draft = readDraft();
  const dashboard = document.getElementById('tab-dash');
  if (draft?.ready && dashboard && document.getElementById('profileTotemCard')) {
    const banner = document.createElement('section');
    banner.id = 'guidedDraftBanner';
    banner.className = 'glass-panel guided-draft-banner';
    banner.innerHTML = '<div><p class="guided-eyebrow">Welcome back to your story</p><h2>Your CV draft came with you.</h2><p>Review your answers, then save your CV in your private workspace.</p></div><button type="button" class="guided-continue">Continue →</button>';
    dashboard.prepend(banner);
    banner.querySelector('button').addEventListener('click', () => {
      let panel = document.getElementById('guidedDraftResume');
      if (!panel) { panel = document.createElement('div'); panel.id = 'guidedDraftResume'; dashboard.insertBefore(panel, banner.nextSibling); }
      bind(panel);
      state = {t: draft.companion, draft, busy: false};
      renderCv();
    });
  }
})();
