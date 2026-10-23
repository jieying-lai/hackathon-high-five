(function () {
  'use strict';

  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]));

  function mount(container, context) {
    if (!container) return { refresh: async () => {} };
    const identity = context?.identity;
    const identityKey = typeof identity === 'string' || typeof identity === 'number'
      ? String(identity)
      : String(identity?.unique_uid || identity?.id || identity?.email || 'account');
    const storageKey = `careerActionsRole:${identityKey}`;
    const roles = Array.isArray(context?.roles) ? context.roles : [];
    window.__careerActionsRoleMemory = window.__careerActionsRoleMemory || {};

    let persistedRoleTitle = '';
    let roleStorageBlocked = false;
    try {
      persistedRoleTitle = localStorage.getItem(storageKey) || '';
    } catch (_) {
      roleStorageBlocked = true;
    }
    const preferredRoleTitle = persistedRoleTitle || window.__careerActionsRoleMemory[identityKey] || '';
    let selected = preferredRoleTitle
      ? Math.max(0, roles.findIndex(role => String(role?.title || '') === preferredRoleTitle))
      : (Number.isInteger(context?.selected) && roles[context.selected] ? context.selected : 0);
    let state = window.__careerActionsStates?.[identityKey];
    if (!state) {
      state = {
        actions: [], preferences: { goal: 'explore', minutes: 10 }, loaded: false,
        loading: false, refreshPromise: null, error: '', busy: false,
        preferencesBusy: false, drafts: {}, feedback: '', showAllActions: false,
        selectedRoleTitle: preferredRoleTitle || String(roles[selected]?.title || ''),
        roleStorageBlocked,
      };
      window.__careerActionsStates = window.__careerActionsStates || {};
      window.__careerActionsStates[identityKey] = state;
    } else {
      state.roleStorageBlocked = state.roleStorageBlocked || roleStorageBlocked;
      const currentTitle = state.selectedRoleTitle || preferredRoleTitle;
      if (currentTitle) {
        const found = roles.findIndex(role => String(role?.title || '') === currentTitle);
        if (found >= 0) selected = found;
      }
    }
    if (state.selectedRoleTitle) {
      const current = roles.findIndex(role => String(role?.title || '') === state.selectedRoleTitle);
      if (current >= 0) selected = current;
    }

    const views = state.views || (state.views = new Map());
    function activeRole() { return roles[selected] || null; }
    function notify() {
      for (const [view, renderView] of views) {
        if (!view.isConnected) { views.delete(view); continue; }
        renderView();
      }
    }
    function nav(tab) {
      if (typeof context?.onNavigate === 'function') context.onNavigate(tab);
    }
    function skills(role) {
      return Array.isArray(role?.skills_gap)
        ? role.skills_gap.map(item => typeof item === 'string' ? item : item?.name || item?.skill || '').filter(Boolean)
        : [];
    }
    function roleOptionHtml() {
      return roles.map((role, index) =>
        `<option value="${index}" ${index === selected ? 'selected' : ''}>${esc(role.title || 'Role direction')}</option>`
      ).join('');
    }
    function availableChoices() {
      const role = activeRole();
      if (!role) return [];
      const gaps = skills(role);
      const explore = { kind: 'role_test', role_title: role.title || '', skill: '', label: 'Test this direction', detail: 'Find one real-world signal.', tab: 'jobs' };
      const practice = gaps[0] ? {
        kind: 'skill_practice', role_title: role.title || '', skill: gaps[0],
        label: `Try ${gaps[0]}`, detail: `Use ${state.preferences.minutes} minutes on this skill gap.`, tab: 'plan',
      } : null;
      const review = context?.cvReady && context?.cvReviewed ? {
        kind: 'application_review', role_title: role.title || '', skill: '',
        label: 'Review one application', detail: 'Check your CV against a real vacancy.', tab: 'cv-review',
      } : null;
      if (state.preferences.goal === 'learn') return [practice, explore, review].filter(Boolean).slice(0, 3);
      if (state.preferences.goal === 'apply') return [review, explore, practice].filter(Boolean).slice(0, 3);
      return [explore, practice, review].filter(Boolean).slice(0, 3);
    }
    function render() {
      if (state.selectedRoleTitle) {
        const roleMatch = roles.findIndex(item => String(item?.title || '') === state.selectedRoleTitle);
        if (roleMatch >= 0) selected = roleMatch;
      }
      const role = activeRole();
      const activeCount = state.actions.filter(action => action.status === 'planned').length;
      const recent = [...state.actions].sort((a, b) => {
        const activeOrder = Number(b.status === 'planned') - Number(a.status === 'planned');
        return activeOrder || String(b.updated_at || b.created_at || '').localeCompare(String(a.updated_at || a.created_at || ''));
      });
      const visibleActions = state.showAllActions ? recent : recent.slice(0, 4);
      const errorBlock = state.error ? `<div class="ca-error" role="alert"><span>${esc(state.error)}</span><button type="button" data-ca="retry" class="ca-link">Retry</button></div>` : '';
      const rolePicker = roles.length > 1 ? `<label class="ca-role-picker"><span>Role direction</span><select data-ca="role">${roleOptionHtml()}</select></label>` : '';
      const roleWarning = state.roleStorageBlocked
        ? '<p class="ca-storage-note" role="status">This browser cannot save your role choice; it will be remembered for this visit only.</p>' : '';
      const noRole = !roles.length ? `
        <div class="ca-empty">
          <div class="ca-empty-kicker">Start with a direction</div><h3>No role matches yet</h3>
          <p>Explore real role matches before choosing a skill action.</p>
          <div class="ca-actions"><button type="button" data-ca-tab="match">Explore matches</button><button type="button" data-ca-tab="radar">Future roles</button></div>
        </div>` : '';
      const noCv = roles.length && !context?.cvReviewed ? `
        <div class="ca-notice"><div><strong>${context?.cvReady ? 'Check your CV before applying' : 'Application prep needs a CV'}</strong><span>Exploring and learning are available now.</span></div>
          <div class="ca-actions"><button type="button" data-ca-tab="${context?.cvReady ? 'cv-review' : 'cv-upload'}">${context?.cvReady ? 'Review CV' : 'Add CV'}</button></div></div>` : '';
      const choices = state.loaded && !state.loading && role ? availableChoices() : [];
      const duplicate = choice => state.actions.some(action => action.status === 'planned' &&
        action.kind === choice.kind && action.role_title === choice.role_title && (action.skill || '') === choice.skill);
      const goalLabel = { explore: 'Explore', learn: 'Learn', apply: 'Apply' }[state.preferences.goal] || 'Explore';
      const feedback = state.feedback ? `<p class="ca-feedback" role="status" aria-live="polite">${esc(state.feedback)}</p>` : '<p class="ca-feedback" role="status" aria-live="polite"></p>';
      const recentContent = !state.loaded
        ? `<div class="ca-progress-empty"><span class="ca-progress-line" aria-hidden="true"></span><div><strong>Recent progress unavailable</strong><p>Recorded actions will appear when your account data loads.</p></div></div>`
        : visibleActions.length ? `<div class="ca-action-list">${visibleActions.map(action => {
          const id = String(action.id);
          const draft = Object.prototype.hasOwnProperty.call(state.drafts, id) ? state.drafts[id] : (action.note || '');
          const dirty = draft !== (action.note || '');
          return `<article class="ca-action-row ${action.status === 'done' ? 'is-done' : ''}">
            <div class="ca-action-status"><span>${action.status === 'done' ? 'Done' : 'Planned'}</span><strong>${esc(action.title || action.skill || action.role_title || 'Career action')}</strong>
              <small>${esc([action.role_title, action.skill].filter(Boolean).join(' · '))}</small></div>
            <div class="ca-action-tools">
              <div class="ca-note-row"><label class="ca-note"><span class="sr-only">Reflection for ${esc(action.title || 'this action')}</span>
                <input data-ca-note="${esc(id)}" maxlength="180" value="${esc(draft)}" placeholder="Optional reflection" /></label>
                <button type="button" class="ca-note-save" data-ca-save-note="${esc(id)}" ${dirty && !state.busy ? '' : 'hidden'} ${state.busy ? 'disabled' : ''}>Save note</button></div>
              <button type="button" data-ca-status="${esc(id)}" data-next-status="${action.status === 'done' ? 'planned' : 'done'}" ${state.busy ? 'disabled' : ''}>${action.status === 'done' ? 'Undo' : 'Mark done'}</button>
              ${action.status === 'planned' ? `<button type="button" data-ca-open="${esc(id)}">Open action →</button>` : ''}
              <button type="button" data-ca-remove="${esc(id)}" ${state.busy ? 'disabled' : ''} aria-label="Remove ${esc(action.title)}">Remove</button>
            </div>
            <details class="ca-details"><summary>What to try</summary><p>${esc(action.kind === 'role_test'
              ? 'Compare two vacancies for this role. Note one repeated task and whether you would enjoy it.'
              : action.kind === 'skill_practice'
                ? `Try one small ${action.skill} exercise. Note what you made or what you still need to learn.`
                : 'Compare your reviewed CV with one real vacancy. Note one requirement you can evidence and one to clarify.')}</p></details>
          </article>`;
        }).join('')}</div>${recent.length > 4 ? `<button type="button" class="ca-show-all" data-ca="show-all" aria-expanded="${state.showAllActions}">${state.showAllActions ? 'Show less' : `Show all ${recent.length} recent actions`}</button>` : ''}`
        : `<div class="ca-progress-empty"><span class="ca-progress-line" aria-hidden="true"></span><div><strong>Your first step starts here</strong><p>Plans and self-reported progress are recorded here.</p></div></div>`;

      container.innerHTML = `
        <section class="career-actions" aria-labelledby="ca-title">
          <div class="ca-heading"><div><span class="ca-kicker">A small next move</span><h2 id="ca-title">One small step today</h2>
            <p>Pick a role, choose a small move, then record what happened.</p></div>
            <span class="ca-count">${state.loaded ? `${activeCount} planned` : 'Progress unavailable'}</span></div>
          <div class="ca-controls">
            <label><span>Current goal</span><select data-ca="goal" aria-label="Career goal" ${state.preferencesBusy ? 'disabled' : ''}>
              <option value="explore" ${state.preferences.goal === 'explore' ? 'selected' : ''}>Explore</option>
              <option value="learn" ${state.preferences.goal === 'learn' ? 'selected' : ''}>Learn</option>
              <option value="apply" ${state.preferences.goal === 'apply' ? 'selected' : ''}>Prepare to apply</option>
            </select></label>
            <label><span>Time available</span><select data-ca="minutes" aria-label="Available time" ${state.preferencesBusy ? 'disabled' : ''}>
              ${[10, 20, 30].map(minutes => `<option value="${minutes}" ${state.preferences.minutes === minutes ? 'selected' : ''}>${minutes} min</option>`).join('')}
            </select></label>
            ${rolePicker}
          </div>
          ${roleWarning}${errorBlock}${feedback}
          ${state.loading && !state.loaded ? '<div class="ca-loading" aria-label="Loading career actions"><i></i><i></i><i></i></div>' : ''}
          ${noRole}${noCv}
          ${role && state.loaded ? `<div class="ca-choice-area">
            <div class="ca-section-label"><span>Choose one next action</span><span>${esc(goalLabel)} · ${state.preferences.minutes} min</span></div>
            <div class="ca-choice-list">${choices.length ? choices.map((choice, index) => `
              <article class="ca-choice ${index === 0 ? 'is-featured' : ''}">
                <div class="ca-choice-mark" aria-hidden="true">${String(index + 1).padStart(2, '0')}</div>
                <div class="ca-choice-copy"><strong>${esc(choice.label)}</strong><span>${esc(choice.detail)}</span>
                  ${choice.skill ? `<small>Skill gap · ${esc(choice.skill)}</small>` : ''}</div>
                <button type="button" data-ca-create="${index}" ${state.busy || duplicate(choice) ? 'disabled' : ''}>${duplicate(choice) ? 'Already planned' : 'Plan this'}</button>
              </article>`).join('') : `<div class="ca-empty ca-empty-compact"><h3>No listed skill gaps</h3><p>Explore this role through real vacancies instead.</p><button type="button" data-ca-tab="jobs">Browse jobs</button></div>`}</div>
          </div>` : ''}
          <div class="ca-progress">
            <div class="ca-progress-heading"><div><span class="ca-section-label">Recent recorded actions</span><p>Latest actions returned by your account.</p></div>
              ${context?.cvReviewed ? '<span class="ca-review-state">CV reviewed</span>' : ''}</div>
            ${recentContent}
          </div>
          <details class="ca-details"><summary>About your progress</summary>
            <p>CareerLens keeps up to 100 recent actions. Plans and completion are self-reported: they do not verify a skill, promise a job, or count visits as progress. Matching scores are estimates only.</p>
          </details>
        </section>`;

      container.querySelectorAll('[data-ca-tab]').forEach(button => button.addEventListener('click', () => nav(button.dataset.caTab)));
      const roleSelect = container.querySelector('[data-ca="role"]');
      roleSelect?.addEventListener('change', () => {
        selected = Number(roleSelect.value);
        const title = String(roles[selected]?.title || '');
        state.selectedRoleTitle = title;
        window.__careerActionsRoleMemory[identityKey] = title;
        try { localStorage.setItem(storageKey, title); }
        catch (_) { state.roleStorageBlocked = true; }
        context.onRole?.(selected);
        notify();
      });
      container.querySelector('[data-ca="goal"]')?.addEventListener('change', event => updatePreferences({ goal: event.target.value }));
      container.querySelector('[data-ca="minutes"]')?.addEventListener('change', event => updatePreferences({ minutes: Number(event.target.value) }));
      container.querySelector('[data-ca="retry"]')?.addEventListener('click', refresh);
      container.querySelectorAll('[data-ca-create]').forEach(button => button.addEventListener('click', () => createAction(Number(button.dataset.caCreate))));
      container.querySelectorAll('[data-ca-note]').forEach(input => {
        input.addEventListener('input', () => {
          state.drafts[input.dataset.caNote] = input.value;
          const save = container.querySelector(`[data-ca-save-note="${CSS.escape(input.dataset.caNote)}"]`);
          if (save) save.hidden = input.value === (state.actions.find(action => String(action.id) === input.dataset.caNote)?.note || '');
        });
        input.addEventListener('keydown', event => {
          if (event.key === 'Enter') { event.preventDefault(); updateAction(input.dataset.caNote, null, input.value); }
        });
      });
      container.querySelectorAll('[data-ca-open]').forEach(button => button.addEventListener('click', () => {
        const action = state.actions.find(item => String(item.id) === button.dataset.caOpen);
        if (!action) return;
        const index = roles.findIndex(role => role.title === action.role_title);
        if (index >= 0) { selected = index; context.onRole?.(selected); }
        nav({ role_test: 'jobs', skill_practice: 'plan', application_review: 'cv-review' }[action.kind] || 'match');
      }));
      container.querySelectorAll('[data-ca-remove]').forEach(button => button.addEventListener('click', async () => {
        if (state.busy || !window.confirm('Remove this personal action and its reflection? This cannot be undone.')) return;
        const id = button.dataset.caRemove;
        state.busy = true; state.error = ''; notify();
        try {
          await request(`/api/career-actions/${encodeURIComponent(id)}`, { method: 'DELETE' });
          state.actions = state.actions.filter(action => String(action.id) !== id);
          delete state.drafts[id];
          state.feedback = 'Action removed.';
        } catch (error) { state.error = error.message || 'This action could not be removed.'; }
        finally { state.busy = false; notify(); }
      }));
      container.querySelectorAll('[data-ca-save-note]').forEach(button => button.addEventListener('click', () => {
        const id = button.dataset.caSaveNote;
        updateAction(id, null, Object.prototype.hasOwnProperty.call(state.drafts, id) ? state.drafts[id] : '');
      }));
      container.querySelectorAll('[data-ca-status]').forEach(button => button.addEventListener('click', () => {
        const id = button.dataset.caStatus;
        const note = Object.prototype.hasOwnProperty.call(state.drafts, id)
          ? state.drafts[id] : (state.actions.find(action => String(action.id) === id)?.note || '');
        updateAction(id, button.dataset.nextStatus, note);
      }));
      container.querySelector('[data-ca="show-all"]')?.addEventListener('click', () => {
        state.showAllActions = !state.showAllActions;
        notify();
      });
    }
    async function request(url, options = {}) {
      const response = await fetch(url, { credentials: 'same-origin', ...options });
      let data = {};
      try { data = await response.json(); } catch (_) {}
      if (!response.ok || data.ok === false) throw new Error(data.message || `Could not save right now (${response.status}).`);
      return data;
    }
    async function refresh() {
      if (state.refreshPromise) return state.refreshPromise;
      state.loading = true;
      state.error = '';
      notify();
      state.refreshPromise = (async () => {
        try {
          const data = await request('/api/career-actions');
          state.actions = Array.isArray(data.actions) ? data.actions : [];
          if (data.preferences) state.preferences = {
            goal: ['explore', 'learn', 'apply'].includes(data.preferences.goal) ? data.preferences.goal : 'explore',
            minutes: [10, 20, 30].includes(Number(data.preferences.minutes)) ? Number(data.preferences.minutes) : 10,
          };
          state.loaded = true;
        } catch (error) {
          state.error = error.message || 'Career actions could not be loaded.';
        } finally {
          state.loading = false;
          state.refreshPromise = null;
          notify();
        }
      })();
      return state.refreshPromise;
    }
    async function updatePreferences(patch) {
      if (state.preferencesBusy) return;
      const previous = { ...state.preferences };
      state.preferencesBusy = true;
      state.error = '';
      state.feedback = '';
      state.preferences = { ...state.preferences, ...patch };
      notify();
      try {
        const data = await request('/api/career-actions/preferences', {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(state.preferences),
        });
        state.actions = Array.isArray(data.actions) ? data.actions : state.actions;
        if (data.preferences) state.preferences = {
          goal: ['explore', 'learn', 'apply'].includes(data.preferences.goal) ? data.preferences.goal : state.preferences.goal,
          minutes: [10, 20, 30].includes(Number(data.preferences.minutes)) ? Number(data.preferences.minutes) : state.preferences.minutes,
        };
        state.feedback = 'Preferences saved.';
      } catch (error) {
        state.preferences = previous;
        state.error = error.message || 'Your preference was not saved.';
      } finally {
        state.preferencesBusy = false;
        notify();
      }
    }
    async function createAction(index) {
      if (state.busy || !state.loaded) return;
      const choice = availableChoices()[index];
      if (!choice || state.actions.some(action => action.status === 'planned' &&
        action.kind === choice.kind && action.role_title === choice.role_title && (action.skill || '') === choice.skill)) return;
      state.busy = true;
      state.error = '';
      state.feedback = '';
      notify();
      try {
        const data = await request('/api/career-actions', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kind: choice.kind, role_title: choice.role_title, skill: choice.skill }),
        });
        state.actions = [data.action, ...state.actions.filter(action => String(action.id) !== String(data.action?.id))];
        state.feedback = 'Action planned.';
        if (choice.tab) nav(choice.tab);
      } catch (error) {
        state.error = error.message || 'This action could not be planned.';
      } finally {
        state.busy = false;
        notify();
      }
    }
    async function updateAction(id, status, note) {
      if (state.busy) return;
      const old = state.actions.find(action => String(action.id) === String(id));
      if (!old || (status === null && (old.note || '') === note)) return;
      const submittedNote = String(note ?? '');
      state.busy = true;
      state.error = '';
      state.feedback = '';
      notify();
      try {
        const data = await request(`/api/career-actions/${encodeURIComponent(id)}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: status || old.status, note: submittedNote }),
        });
        state.actions = state.actions.map(action => String(action.id) === String(id) ? data.action : action);
        if (state.drafts[String(id)] === submittedNote) delete state.drafts[String(id)];
        state.feedback = status === null ? 'Reflection saved.' : status === 'done' ? 'Action marked done.' : 'Action returned to planned.';
      } catch (error) {
        state.error = error.message || 'This update could not be saved.';
      } finally {
        state.busy = false;
        notify();
      }
    }

    views.set(container, render);
    render();
    if (!state.loaded && !state.loading) refresh();
    else if (state.loading && state.refreshPromise) state.refreshPromise.then(notify);
    window.CareerActions.refresh = refresh;
    return { refresh };
  }

  window.CareerActions = { mount, refresh: async () => {} };
})();
