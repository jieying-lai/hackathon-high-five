/* Pure planning model: allocations, not projected demand or personal readiness. */
window.FutureRadarPlanning = {
  calculate(rows, weights, settings, isRemote) {
    const horizon = Math.max(6, Math.min(60, Number(settings.horizon) || 24));
    const adoption = Math.max(0, Math.min(100, Number(settings.adoption) || 0));
    const hours = Math.max(1, Math.min(12, Number(settings.hours) || 4));
    const months = [0, Math.round(horizon / 3), Math.round(2 * horizon / 3), horizon];
    const base = rows.map(row => Math.max(0, Number(isRemote ? row.share_pct : row.recent_per_1k) || 0));
    const columns = months.map(month => {
      const emphasis = rows.map((row, i) => {
        const sensitivity = {ai: 1, technical: .35, human: .15, routine: -.5}[row.kind] || 0;
        const multiplier = Math.max(.1, 1 + ((Number(weights[row.kind]) || 1) - 1) * month / 60
          + sensitivity * (adoption - 50) / 100 * month / 60);
        return base[i] * multiplier;
      });
      const total = emphasis.reduce((a, b) => a + b, 0);
      return emphasis.map(value => total ? value / total * 100 : 0);
    });
    return {
      months, hours, horizon, adoption,
      rows: rows.map((row, i) => ({
        skill: row.skill,
        cells: columns.map(column => ({share: column[i], minutes: column[i] * hours * 60 / 100}))
      }))
    };
  }
};

/* Evidence first. Alternative futures change learning emphasis, not observed data. */
window.FutureRadar = (() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const date = value => {
    if (!value) return 'Not available';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString(undefined, {day:'numeric',month:'short',year:'numeric'});
  };
  let root, options, data, pending = false, dataset = 'remote', scenario = 'copilot', filter = 'all';
  let selected = '', watched = [], all = false, error = '', notice = '';
  const planning = {horizon: 24, adoption: 50, hours: 4};
  let matrixUnit = 'minutes';
  const storageKey = () => 'cl_market_watch_v1:' + options.identity;
  function readWatch() {
    try {
      const raw = JSON.parse(localStorage.getItem(storageKey()) || '[]');
      watched = Array.isArray(raw) ? raw.filter(x => typeof x === 'string' && x.length < 160).slice(0,20) : [];
    } catch { watched = []; }
  }
  function sourceRows() { return data?.[dataset]?.rows || []; }
  function currentScenario() { return data?.scenarios.find(s => s.id === scenario) || data?.scenarios[0]; }
  function visibleRows() {
    const weights = currentScenario()?.weights || {};
    return sourceRows().filter(r => filter === 'all' || (filter === 'followed' ? watched.includes(r.skill) : r.kind === filter))
      .map(r => ({...r, emphasis: (dataset === 'remote' ? r.count : Math.max(0,r.change_pct)) * (weights[r.kind] || 1)}))
      .sort((a,b) => b.emphasis - a.emphasis || a.skill.localeCompare(b.skill));
  }
  function button(action, text, active, attrs = '') {
    return `<button type="button" data-radar-action="${action}" ${attrs} ${active === undefined ? '' : `aria-pressed="${active}"`}>${text}</button>`;
  }
  function matrixMarkup() {
    const model = window.FutureRadarPlanning.calculate(sourceRows(), currentScenario()?.weights || {}, planning, dataset === 'remote');
    const shown = visibleRows().slice(0, all ? Infinity : 6);
    const max = Math.max(1, ...model.rows.flatMap(row => row.cells.map(cell => matrixUnit === 'minutes' ? cell.minutes : cell.share)));
    const value = cell => matrixUnit === 'minutes' ? cell.minutes : cell.share;
    const display = cell => value(cell) > 0 && value(cell) < 1 ? '<1' : String(Math.round(value(cell)));
    const suffix = matrixUnit === 'minutes' ? 'm' : '%';
    const selectedRow = model.rows.find(row => row.skill === selected);
    const last = selectedRow?.cells[3];
    return `
      <div class="fr-matrix-legend"><span>${matrixUnit === 'minutes' ? 'Suggested practice · minutes / week' : 'Share of practice across tracked skills'}</span>
        <span class="fr-matrix-scale"><span>0${suffix}</span><i aria-hidden="true"></i><span>${Math.ceil(max)}${suffix}</span></span></div>
      <div class="fr-matrix" role="table" aria-label="Hypothetical learning allocation by skill and planning horizon">
        <div class="fr-matrix-row fr-matrix-axis" role="row"><span role="columnheader">Skill / horizon</span>${model.months.map(month => `<span role="columnheader">${month ? `${month}m` : 'Now'}</span>`).join('')}</div>
        ${shown.map(row => {
          const planned = model.rows.find(item => item.skill === row.skill);
          return `<div class="fr-matrix-row ${row.skill === selected ? 'fr-matrix-selected' : ''}" role="row">
            <button role="rowheader" type="button" data-radar-action="skill" data-value="${esc(row.skill)}" data-radar-focus="matrix-${esc(row.skill)}">${esc(row.skill)}</button>
            ${planned.cells.map((cell, i) => {
              const t = value(cell) / max;
              const color = [243,239,255].map((v,j) => Math.round(v + ([120,82,190][j] - v) * t));
              const label = `${row.skill}, ${model.months[i] ? `in ${model.months[i]} months` : 'now'}: ${Math.round(cell.minutes)} suggested minutes per week, ${cell.share.toFixed(1)} percent of practice. Planning assumption, not a forecast.`;
              return `<span role="cell"><button type="button" class="fr-matrix-cell" data-radar-action="skill" data-value="${esc(row.skill)}" data-radar-focus="matrix-${esc(row.skill)}-${i}" aria-label="${esc(label)}" style="background:rgb(${color.join(',')});color:${t > .57 ? '#fff' : '#312454'}">${display(cell)}<small>${suffix}</small></button></span>`;
            }).join('')}</div>`;
        }).join('') || '<p class="fr-empty">No observed skills in this view. Choose another filter or source to build a planning matrix.</p>'}
      </div>
      <p class="fr-matrix-note">Each column divides your weekly budget across <strong>all ${model.rows.length} tracked skills</strong>; filters only change what is visible. Rounding may not total exactly 100%. “Now” uses the source mix without future modifiers.</p>
      ${last ? `<div class="fr-planning-insight" role="status"><strong>${esc(selected)}</strong><span>At ${model.horizon} months: about <b>${Math.round(last.minutes)} min / week</b> of your ${model.hours}-hour budget (${last.share.toFixed(1)}%).</span><small>A suggested starting allocation, not a personal skills assessment.</small></div>` : ''}
    `;
  }
  function planningMarkup() {
    return `<section class="fr-planning" aria-labelledby="frPlanningTitle">
      <div class="fr-section-heading"><div><span class="fr-eyebrow">Your what-if studio</span><h3 id="frPlanningTitle">Shape your next horizon.</h3><p>Adjust the assumptions. See how you could divide your practice time.</p></div>
      ${button('reset-planning','Reset controls',undefined,'class="fr-reset" data-radar-focus="reset-planning"')}</div>
      <div class="fr-planning-controls">
        <label for="frHorizon"><span>Planning horizon <output id="frHorizonValue" for="frHorizon">${planning.horizon} months</output></span><input id="frHorizon" data-planning-control="horizon" data-radar-focus="horizon" type="range" min="6" max="60" step="6" value="${planning.horizon}"><small>6 months <span>5 years</span></small></label>
        <label for="frAdoption"><span>AI adoption assumption <output id="frAdoptionValue" for="frAdoption">${planning.adoption}%</output></span><input id="frAdoption" data-planning-control="adoption" data-radar-focus="adoption" type="range" min="0" max="100" step="5" value="${planning.adoption}"><small>Slower uptake <span>Faster uptake</span></small></label>
        <label for="frHours"><span>Weekly practice budget <output id="frHoursValue" for="frHours">${planning.hours} hours</output></span><input id="frHours" data-planning-control="hours" data-radar-focus="hours" type="range" min="1" max="12" step="1" value="${planning.hours}"><small>1 hour <span>12 hours</span></small></label>
      </div>
      <div class="fr-matrix-toolbar"><span class="fr-label">Planning simulation · not a job forecast</span><div role="group" aria-label="Matrix units">${button('matrix-unit','Practice time',matrixUnit === 'minutes','data-value="minutes" data-radar-focus="unit-minutes"')}${button('matrix-unit','Attention share',matrixUnit === 'share','data-value="share" data-radar-focus="unit-share"')}</div></div>
      <div id="frMatrixPresentation">${matrixMarkup()}</div>
      <details class="fr-model-explanation"><summary>How do these controls change the matrix?</summary><p>The starting mix comes from observed skill mentions in the selected source, normalised across tracked skills. For each future column, the selected scenario weight is gradually applied over 60 months. The AI assumption adds a transparent sensitivity of AI ×1, technical ×0.35, people ×0.15 and routine ×−0.5, centred at 50%. These are design assumptions—not measured adoption rates. Each column is then normalised to your weekly practice budget.</p><p>The timeline is a planning horizon, not a date for predicted hiring. Practice hours change suggested minutes, not employer demand or assumed competence. Source counts and dates below never change when you move a control.</p></details>
    </section>`;
  }
  function onPlanningInput(event) {
    const key = event.target.dataset.planningControl;
    if (!['horizon','adoption','hours'].includes(key)) return;
    planning[key] = Number(event.target.value);
    root.querySelector('#frHorizonValue').textContent = `${planning.horizon} months`;
    root.querySelector('#frAdoptionValue').textContent = `${planning.adoption}%`;
    root.querySelector('#frHoursValue').textContent = `${planning.hours} hours`;
    root.querySelector('#frMatrixPresentation').innerHTML = matrixMarkup();
  }
  function render() {
    if (!root || !data) return;
    const focused = root.contains(document.activeElement) ? document.activeElement.dataset.radarFocus : null;
    const remote = data.remote, historical = data.malaysia, isRemote = dataset === 'remote';
    const rows = visibleRows(), visible = all ? rows : rows.slice(0,6);
    if (!rows.some(r => r.skill === selected)) selected = rows[0]?.skill || '';
    const chosen = rows.find(r => r.skill === selected), future = currentScenario();
    const max = Math.max(1, ...sourceRows().flatMap(r => [r.baseline_per_1k || 0,r.recent_per_1k || 0]));
    const b = historical.metadata.baseline_window || {}, r = historical.metadata.recent_window || {};
    root.innerHTML = `
      <header class="fr-heading">
        <div><span class="fr-eyebrow">Future skills radar</span><h2>Your future. In focus.</h2>
        <p>Explore the signals. Adjust your horizon. Turn possibilities into a practical learning plan.</p></div>
        <button type="button" class="fr-refresh" data-radar-action="refresh" data-radar-focus="refresh" ${pending?'disabled':''}>${pending?'Checking sources…':'Check for updates'} <span aria-hidden="true">↻</span></button>
      </header>
      ${error ? `<p role="alert" class="fr-warning">${esc(error)}</p>` : ''}
      <div class="fr-datasets" role="group" aria-label="Market evidence">
        ${button('dataset','Remote market sample',isRemote,'data-value="remote" data-radar-focus="remote"')}
        ${button('dataset','Malaysia · historical',!isRemote,'data-value="malaysia" data-radar-focus="malaysia"')}
      </div>
      <section class="fr-source-strip" aria-label="Source freshness">
        <div><span class="fr-status-dot ${isRemote && remote.status !== 'cached'?'fr-offline':''}"></span><strong>${isRemote ? `Source: Remotive · ${remote.sample_size} postings` : 'Source: JobStreet Malaysia (68.4k jobs) & DOSM 2025 Benchmarks'}</strong>
        <p>${isRemote ? `Retrieved ${esc(date(remote.fetched_at))} · latest posting ${esc(date(remote.latest_posted))}` : `Data through ${esc(date(historical.metadata.data_through))} · DOSM Salaries & Wages 2025 Verified`}</p></div>
        <a href="${esc(isRemote?remote.source_url:historical.source_url)}" target="_blank" rel="noopener noreferrer">Visit source ↗</a>
      </section>
      ${!isRemote ? `
      <div class="fr-dosm-banner" role="complementary" aria-label="Official DOSM 2025 Wage Benchmarks">
        <div>
          <span class="fr-status-dot"></span><strong>DOSM 2025 Official Malaysian Wage Benchmarks:</strong>
          <span>National Median: <b>RM 2,940</b> · High-Skilled: <b>RM 5,057</b> · Tech/Professionals: <b>RM 6,124</b> · Tertiary Degree Premium: <b>+105.3%</b> (SPM RM 2,227 vs Degree RM 4,571).</span>
        </div>
        <a href="https://open.dosm.gov.my/publications/salaries_wages_2025" target="_blank" rel="noopener noreferrer">DOSM 2025 Report ↗</a>
      </div>` : ''}
      ${isRemote && remote.error ? `<p class="fr-warning" role="status">${esc(remote.error)} ${remote.sample_size?'Showing the last saved sample with its original date.':'Try the historical Malaysia view while this source is unavailable.'}</p>` : ''}
      <p class="fr-scope">${esc(isRemote?remote.scope:historical.scope)} ${isRemote && remote.sample_size < 30 ? '<strong>Small sample: treat this as a starting point, not a market verdict.</strong>' : ''}</p>
      <section class="fr-futures" aria-labelledby="frFuturesTitle">
        <div class="fr-section-heading"><div><span class="fr-eyebrow">Explore possibilities, not predictions</span><h3 id="frFuturesTitle">What if work changes differently?</h3></div><span class="fr-label">No assigned probabilities</span></div>
        <div class="fr-scenario-grid" role="group" aria-label="Future planning scenarios">${data.scenarios.map((s,i) => `
          <button type="button" data-radar-action="scenario" data-value="${esc(s.id)}" data-radar-focus="${esc(s.id)}" aria-pressed="${s.id===scenario}">
            <span class="fr-scenario-number">0${i+1} <span aria-hidden="true">${s.id===scenario?'✓':'↗'}</span></span>
            <strong>${esc(s.name)}</strong><span>${esc(s.subtitle)}</span>
          </button>`).join('')}</div>
        <div class="fr-scenario-story"><p><strong>Assumption:</strong> ${esc(future.assumption)}</p><p><strong>Watch for:</strong> ${esc(future.watch_for)}</p></div>
      </section>
      ${planningMarkup()}
      <section class="fr-explorer" aria-labelledby="frSignalsTitle">
        <div class="fr-section-heading"><div><span class="fr-eyebrow">Click a skill to investigate</span><h3 id="frSignalsTitle">${isRemote?'What employers are mentioning':'How skill mentions changed'}</h3></div></div>
        <div class="fr-filters" role="group" aria-label="Filter skills">
          ${[['all','All signals'],['ai','AI'],['technical','Technical'],['human','People skills'],['followed',`Following (${watched.length})`]].map(([id,label]) => button('filter',esc(label),filter===id,`data-value="${id}" data-radar-focus="filter-${id}"`)).join('')}
        </div>
        <p class="fr-chart-caption">${isRemote ? 'Observed share of this source sample · ordered by your selected planning lens.' : 'Mentions per 1,000 postings · earlier vs later window. These are not automation-risk scores.'}</p>
        ${!isRemote?'<div class="fr-legend"><span>Earlier window</span><span>Later window</span></div>':''}
        <div class="fr-explorer-layout">
          <div class="fr-signals" role="group" aria-label="Observed skill signals">
            ${visible.map(row => `<button type="button" class="fr-signal" data-radar-action="skill" data-value="${esc(row.skill)}" data-radar-focus="skill-${esc(row.skill)}" aria-pressed="${selected===row.skill}">
              <span class="fr-signal-title"><strong>${esc(row.skill)}</strong><b>${isRemote?`${row.share_pct}%`:`${row.change_pct>0?'+':''}${row.change_pct}%`}</b></span>
              ${isRemote ? `<span class="fr-track"><i style="width:${Math.max(0,Math.min(100,row.share_pct))}%"></i></span><span class="fr-signal-meta">${row.count} / ${remote.sample_size} postings · ${row.evidence==='small_sample'?'few mentions':'sample observation'}</span>` :
                `<span class="fr-paired"><i style="width:${100*(row.baseline_per_1k||0)/max}%"></i><i style="width:${100*(row.recent_per_1k||0)/max}%"></i></span><span class="fr-signal-meta">${row.baseline_per_1k ?? '—'} → ${row.recent_per_1k ?? '—'} mentions / 1,000</span>`}
            </button>`).join('') || `<div class="fr-empty">${filter==='followed'?'You are not following any skills in this view yet. Select a skill and choose “Follow this skill”.':filter!=='all'?'No matching signals in this sample. Try All signals.':'No usable observations are available from this source yet.'}</div>`}
            ${rows.length>6?button('more',all?'Show fewer signals':`See all ${rows.length} signals`,undefined,'class="fr-more" data-radar-focus="more"'):''}
          </div>
          <aside id="frSkillDetail" class="fr-detail" aria-label="Selected skill evidence" aria-live="polite">
            ${chosen ? `<span class="fr-eyebrow">Inside the signal</span><h4>${esc(chosen.skill)}</h4>
              <p>${isRemote?`Mentioned in <strong>${chosen.count} of ${remote.sample_size}</strong> sampled postings. This is a snapshot, not growth.`:`The posting share changed by <strong>${chosen.change_pct>0?'+':''}${chosen.change_pct}%</strong> between the two historical windows.`}</p>
              ${isRemote ? `<ul class="fr-evidence">${chosen.examples.map(j => `<li><a href="${esc(j.url)}" target="_blank" rel="noopener noreferrer">${esc(j.title)} ↗</a><span>${esc(j.company)} · ${esc(date(j.published))}</span><span>${esc(j.location)} · via Remotive</span></li>`).join('')}</ul>` :
                `<dl class="fr-window-details"><div><dt>Earlier · ${esc(b.start)} – ${esc(b.end)}</dt><dd>${chosen.baseline_count} skill mentions / ${b.postings} postings</dd></div><div><dt>Later · ${esc(r.start)} – ${esc(r.end)}</dt><dd>${chosen.recent_count} skill mentions / ${r.postings} postings</dd></div></dl>`}
              ${button('follow',watched.includes(chosen.skill)?'Following · remove':'Follow this skill',watched.includes(chosen.skill),'class="fr-follow" data-radar-focus="follow"')}
              <small>Saved in this browser for your account, not added to your CV.</small>` : '<h4>No skill selected</h4><p>Choose a source or filter with available evidence.</p>'}
          </aside>
        </div>
      </section>
      <section class="fr-next-step"><div><span class="fr-eyebrow">One experiment for this future</span><h3>${esc(future.name)}: try it, then reassess.</h3><p>${esc(future.action)}</p></div>${button('learn','Open my learning plan →',undefined,'class="fr-learn"')}</section>
      <p class="fr-notice" role="status">${esc(notice)}</p>
      <details class="fr-method"><summary>Sources, refresh schedule & uncertainty</summary>
        <p>${esc(data.scenario_method)}</p>
        <p>The weights are design assumptions, not learned forecasts. For this lens: ${Object.entries(future.weights).map(([kind,weight])=>`${esc(kind)} × ${weight}`).join(' · ')}. They change learning order only.</p>
        <h4>Remote sample</h4><p>${esc(remote.method)}</p><ul>${remote.caveats.map(c=>`<li>${esc(c)}</li>`).join('')}</ul>
        <p>Next source check eligible: ${esc(new Date(remote.next_refresh_at).toLocaleString())}. “Check for updates” rereads the saved sample until then.</p>
        <h4>Malaysia snapshot</h4><p>${esc(historical.metadata.method || 'No historical data available.')}</p>
        <ul>${(historical.metadata.caveats || []).map(c=>`<li>${esc(c)}</li>`).join('')}</ul>
        <p>${historical.low_sample_count} tracked skills have insufficient samples and are excluded. Refreshing rereads the local dataset; newer Malaysian postings must first be imported and rebuilt.</p>
        <p>Neither sample covers the entire job market. A fall in posting share is not proof that AI caused it. No personal competence, job-loss probability or “safe career” grade is inferred.</p>
      </details>`;
    if (focused) [...root.querySelectorAll('[data-radar-focus]')].find(el=>el.dataset.radarFocus===focused)?.focus({preventScroll:true});
  }
  async function refresh() {
    if (pending) return;
    pending = true; error = ''; notice = '';
    if (data) render();
    else root.innerHTML = '<div class="fr-loading" role="status"><span class="fr-eyebrow">Connecting the evidence</span><h2>Checking market sources…</h2><p>We will show the source date and any gaps, not fill them with guesses.</p></div>';
    const controller = new AbortController(), timer = setTimeout(()=>controller.abort(),15000);
    try {
      const response = await fetch('/api/market/signals', {signal:controller.signal,headers:{Accept:'application/json'}});
      if (!response.ok) throw new Error('Market evidence could not load. Please retry.');
      const next = await response.json();
      if (!next.ok || !Array.isArray(next.scenarios) || !next.remote || !next.malaysia) throw new Error('The market source returned an unreadable response.');
      data = next;
      notice = 'Sources checked. Observed values stay separate from planning assumptions.';
    } catch (e) {
      error = e.name === 'AbortError' ? 'The source check took too long. Please retry.' : e.message;
    } finally {
      clearTimeout(timer); pending = false;
      if (data) render();
      else root.innerHTML = `<div class="fr-loading"><h2>Market signals are unavailable</h2><p role="alert">${esc(error)}</p>${button('refresh','Try again')}</div>`;
    }
  }
  function onClick(event) {
    const el = event.target.closest('[data-radar-action]');
    if (!el || !root.contains(el)) return;
    const action = el.dataset.radarAction, value = el.dataset.value;
    if (action === 'refresh') return refresh();
    if (action === 'learn') return options.onLearn?.();
    if (action === 'dataset') { dataset = value; all = false; selected = ''; }
    if (action === 'scenario') scenario = value;
    if (action === 'filter') { filter = value; all = false; }
    if (action === 'skill') selected = value;
    if (action === 'more') all = !all;
    if (action === 'matrix-unit') matrixUnit = value === 'share' ? 'share' : 'minutes';
    if (action === 'reset-planning') Object.assign(planning,{horizon:24,adoption:50,hours:4});
    if (action === 'follow') {
      const next = watched.includes(selected) ? watched.filter(x=>x!==selected) : [...watched,selected].slice(-20);
      try { localStorage.setItem(storageKey(),JSON.stringify(next)); watched = next; notice = 'Your followed skills were updated in this browser.'; }
      catch { notice = 'Browser storage is unavailable. Your followed skills could not be saved.'; }
    }
    render();
    if (action === 'skill' && matchMedia('(max-width: 700px)').matches) {
      root.querySelector('#frSkillDetail')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});
    }
  }
  function mount(config) {
    const target = document.getElementById('futureRadarApp');
    if (!target || !config.identity) return;
    if (root === target && options?.identity === config.identity) return;
    root?.removeEventListener('click',onClick);
    root?.removeEventListener('input',onPlanningInput);
    root = target; options = config; readWatch();
    root.addEventListener('click',onClick);
    root.addEventListener('input',onPlanningInput);
    if (data) render(); else refresh();
  }
  return {mount,refresh};
})();
