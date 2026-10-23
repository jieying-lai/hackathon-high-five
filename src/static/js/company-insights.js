/* Company explorer: uses the exact location records returned to the jobs map. */
window.CompanyInsights = (() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const url = value => { try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } };
  let selected = '', section = 'about', query = '', category = '', profiles = {}, loaded = false;
  let datasetLookup = null;
  let wikiProfiles = null;
  let disclosureNotes = null;
  let recommendedRoles = new Map();
  const datasetKey = value => String(value ?? '').normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
  function datasetEvidence(c) { return ''; }
  function wikiEvidence(c) {
    const d = datasetLookup?.get(datasetKey(c.name));
    const w = d && wikiProfiles?.[d.company_id];
    if (!w) return '';
    const description = String(w.description || '');
    const firstSentence = description.match(/^.*?[.!?](?=\s|$)/)?.[0];
    const intro = firstSentence && firstSentence.length <= 350 ? firstSentence : description.length > 300 ? description.slice(0, 300).replace(/\s+\S*$/, '') + '…' : description;
    const link = (href, label) => url(href) ? `<a href="${esc(url(href))}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>` : '';
    const industries = (w.industries || []).filter(v => !/classification|ISIC/i.test(v)).slice(0, 2);
    const facts = [['Headquarters', (w.headquarters || []).join(' · ')], ['Founded', (w.inception_years || []).join(', ')], ['Industry', industries.join(' · ')]].filter(([, value]) => value);
    return `<section class="ci-wiki-background">${w.scope === 'group' ? '<span class="ci-scope-label">Group overview</span>' : ''}<p class="ci-description">${esc(intro)}</p>${description !== intro ? `<details class="ci-read-more"><summary>Read more</summary><p>${esc(description)}</p></details>` : ''}<dl class="ci-fact-grid">${facts.map(([label,value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl><details class="ci-sources"><summary>Sources & information</summary><p>${w.scope === 'group' ? 'Company background describes the group; local office details may differ. ' : ''}Headquarters is not a local office address.</p><p>${link(w.source_url, 'Wikipedia contributors')} · ${link(w.license_url, w.license)} · ${link(w.history_url, 'Author history')} · ${link(w.revision_url, 'Source revision')}</p><p>Text shortened for display; full excerpt available above. ${link(w.wikidata_url, 'Wikidata (CC0)')} · Updated ${esc(w.checked_at)}.</p></details></section>`;
  }
  function sourcedCompanyProfile(p) {
    return `<section><p class="ci-description">${esc(p.description)}</p><dl class="ci-fact-grid">${(p.facts || []).map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>${p.services?.length ? `<div class="ci-overview-chips">${p.services.map(value=>`<span class="ci-overview-chip">${esc(value)}</span>`).join('')}</div>` : ''}${p.highlights?.length ? `<div class="ci-company-highlights">${p.highlights.map(([title,text])=>`<article><h4>${esc(title)}</h4><p>${esc(text)}</p></article>`).join('')}</div>` : ''}${p.parent_description ? `<details class="ci-read-more"><summary>About the parent company</summary><p>${esc(p.parent_description)}</p></details>` : ''}<details class="ci-sources"><summary>Sources & information</summary><p>${esc(p.source_note || '')}</p><div class="ci-actions">${(p.sources || []).filter(([,href])=>url(href)).map(([label,href])=>`<a href="${esc(url(href))}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`).join('')}</div>${p.checked_at ? `<p>Checked ${esc(p.checked_at)}.</p>` : ''}</details></section>`;
  }
  function companyOverviewFallback(c) {
    const d = datasetLookup?.get(datasetKey(c.name));
    const categories = [...new Set(d?.job_categories || (c.category ? [c.category] : []))];
    const roles = [...new Set(c.roles || c.featured_roles || [])];
    const locations = [...new Set(d?.locations || (c.location ? [c.location] : []))];
    const chips = values => values.slice(0, 4).map(value => `<span class="ci-overview-chip">${esc(value)}</span>`).join('');
    const cards = [
      ['Hiring areas', categories], ['Roles to explore', roles], ['Locations in job listings', locations]
    ].filter(([, values]) => values.length);
    return `<section class="ci-overview-fallback"><p class="ci-description">Explore opportunities at ${esc(c.name)}${c.location ? ` in ${esc(c.location)}` : ''}.</p><div class="ci-overview-grid">${cards.map(([label, values]) => `<article><h4>${label}</h4><div class="ci-overview-chips">${chips(values)}</div>${values.length > 4 ? `<details class="ci-overview-more"><summary>View all ${values.length}</summary><div class="ci-overview-chips">${values.slice(4).map(value => `<span class="ci-overview-chip">${esc(value)}</span>`).join('')}</div></details>` : ''}</article>`).join('')}</div><p class="ci-overview-caption">Based on job listings. Roles and locations may change.</p></section>`;
  }
  function payContent(c) {
    const state = recommendedRoles.get(c.id);
    if (!state) return '<h3>Recommended roles & pay</h3><p class="ci-muted">Loading recommended roles…</p>';
    const rows = state.jobs;
    const money = value => 'RM ' + Number(value).toLocaleString('en-MY', {maximumFractionDigits:2});
    const salary = row => row.salary_min && row.salary_max ? (row.salary_min === row.salary_max ? money(row.salary_min) : `${money(row.salary_min)} – ${money(row.salary_max)}`) : row.salary_min ? `${money(row.salary_min)}+` : row.salary_max ? `Up to ${money(row.salary_max)}` : 'Salary not disclosed';
    return `<section class="ci-pay"><h3>Recommended roles & pay</h3><p class="ci-muted">The same roles and advertised pay shown in your job recommendations.</p>${rows.length ? `<div class="ci-pay-list">${rows.map(row=>`<article><div><h4>${esc(row.title)}</h4><small>${esc(row.location || '')}${row.match_score != null ? ` · ${esc(row.match_score)}% CV match` : ''}</small></div><strong>${esc(salary(row))}</strong></article>`).join('')}</div>` : !state.loading && !state.error ? `<div class="ci-pay-empty">No recommended roles in your current map area.<p>${c.isExample ? 'Microsoft is a featured example. Change your map area to explore its roles.' : 'Try changing your map area or updating your CV.'}</p></div>` : ''}${state.loading ? '<p role="status" class="ci-muted">Loading…</p>' : ''}${state.error ? `<p role="alert">${esc(state.error)}</p><button type="button" class="btn btn-soft" data-more-pay>Retry</button>` : state.has_more ? '<button type="button" class="btn btn-soft" data-more-pay>Show more recommended roles</button>' : ''}</section>`;
  }
  function externalInterviewContent(p) {
    if (!p.external_interviews?.length) return '';
    return `<section class="ci-external-interviews"><h3>${p.external_interviews.every(r=>r.is_demo) ? 'Interview experience · Demo' : 'Interview experiences · Other locations'}</h3>${p.external_interviews.map(r=>`<article class="ci-review-card"><div class="ci-review-meta"><span>${esc(r.location)}</span>${r.posted_date ? `<time>Posted ${esc(r.posted_date)}</time>` : ''}</div><h4>${esc(r.title)}</h4><div class="ci-overview-chips">${[r.outcome,r.experience,r.difficulty].map(value=>`<span class="ci-overview-chip">${esc(value)}</span>`).join('')}</div><p><b>Application${r.interview_date ? ` · ${esc(r.interview_date)}` : ''}</b>${esc(r.application)}</p><p><b>Interview</b>${esc(r.interview)}</p><details class="ci-sources"><summary>Review source & location</summary><p>${esc(r.source_note)}</p></details></article>`).join('')}</section>`;
  }
  function disclosureNote(c) {
    const id = datasetLookup?.get(datasetKey(c.name))?.company_id;
    const record = id && disclosureNotes?.profiles?.[id];
    if (!record) return '';
    const latest = record.latest;
    return `<details class="ci-sources"><summary>Environmental & social disclosure note · ${esc(latest.year)}</summary><p>Reported company: ${esc(record.reported_company_name)}. Environment: ${latest.environment == null ? 'Not available' : esc(latest.environment) + ' / 101'}. Social: ${latest.social == null ? 'Not available' : esc(latest.social) + ' / 90'}.</p><p>Historical reporting coverage, not a current sustainability rating. Governance is not included.</p><p>Source: ${esc(disclosureNotes.metadata.title)}. Available years: ${esc(disclosureNotes.metadata.years.join(', '))}.</p></details>`;
  }
  function historicalStars(c) {
    const candidates = datasetLookup?.get(datasetKey(c.name))?.review_candidates || [];
    // Do not combine independently rounded summaries or guess between sources.
    const r = candidates.length === 1 ? candidates[0] : null;
    const score = r && typeof r.average_rating === 'number' && r.average_rating >= 1 && r.average_rating <= 5 && r.valid_rating_rows > 0 ? r.average_rating : null;
    const stars = `<span style="position:relative;display:inline-block;font-size:30px;line-height:1.3;white-space:nowrap;color:#d9d0e5" aria-hidden="true">★★★★★<span style="position:absolute;left:0;top:0;overflow:hidden;width:${score === null ? 0 : score / 5 * 100}%;color:#8954cf;white-space:nowrap">★★★★★</span></span>`;
    return `<h3>Historical review candidate</h3><div class="ci-rating-empty"><div role="img" aria-label="${score === null ? 'No rating available' : esc(score.toFixed(2)) + ' out of 5'}">${stars}</div><p>${score === null ? 'No rating available' : `<b>${esc(score.toFixed(2))} / 5</b> · ${esc(r.valid_rating_rows)} ratings`}</p><small>${score === null ? 'Be the first to share your experience.' : 'Historical reviews · Company match pending verification'}</small>${r ? `<details class="ci-sources"><summary>Review information</summary><p>Source: Glassdoor historical reviews. ${esc(r.valid_rating_rows)} valid rating rows; not verified unique reviewers. Company association and location coverage await verification.</p><p>Review period: ${esc(String(r.earliest_review || 'Unknown').slice(0,10))} – ${esc(String(r.latest_review || 'Unknown').slice(0,10))}. This is not a current website rating or a CareerLens community score.</p></details>` : ''}</div>`;
  }
  async function mount(options) {
    const {container, companies: mapCompanies, identity, onMap, onJobs, loadCompanyJobs, applications = []} = options;
    if (!loaded) {
      try { const r = await fetch('/static/data/company-profiles.json?v=20261023-6'); if (r.ok) { profiles = await r.json(); loaded = true; } } catch { /* Core map records remain usable. */ }
    }
    if (!datasetLookup) {
      try {
        const response = await fetch('/static/data/company-datasets.json?v=20261023-2');
        if (!response.ok) throw new Error('Dataset unavailable');
        const rows = await response.json();
        const buckets = new Map();
        for (const row of rows) {
          for (const name of [row.company_name, ...(row.name_variants || [])]) {
            const key = datasetKey(name);
            if (!buckets.has(key)) buckets.set(key, new Map());
            buckets.get(key).set(row.company_id, row);
          }
        }
        datasetLookup = new Map([...buckets].filter(([, rows]) => rows.size === 1).map(([key, rows]) => [key, rows.values().next().value]));
      } catch { /* Keep map and company browsing available. */ }
    }
    if (!wikiProfiles) {
      try {
        const response = await fetch('/static/data/company-wiki-profiles.json?v=20261023-1');
        if (response.ok) wikiProfiles = await response.json();
      } catch { /* Wikipedia enrichment is optional; map data remains available. */ }
    }
    const appliedCompanies = new Map();
    for (const application of applications) {
      const name = String(application.company_name || '').trim();
      if (!name || name === 'Employer') continue;
      const key = datasetKey(name);
      if (!appliedCompanies.has(key)) appliedCompanies.set(key, []);
      appliedCompanies.get(key).push(application);
    }
    if (!disclosureNotes) {
      try {
        const response = await fetch('/static/data/company-sustainability.json?v=20261023-1');
        if (response.ok) disclosureNotes = await response.json();
      } catch { /* Supplementary notes are optional. */ }
    }
    const companies = mapCompanies.filter(c => datasetKey(c.name) === 'microsoft' || appliedCompanies.has(datasetKey(c.name)) || Number(c.matched || 0) > 0 || Number(c.best_score || 0) >= 50).map(c => ({...c, isApplied:appliedCompanies.has(datasetKey(c.name))}));
    for (const [name, records] of appliedCompanies) {
      if (!companies.some(c => datasetKey(c.name) === name)) {
        const info = datasetLookup?.get(name);
        companies.push({id:`applied:${name}`, name:records[0].company_name,
          isApplied:true, isAppliedOnly:true, location:'Applied company', jobs:records.length,
          roles:[...new Set(records.map(r=>r.vacancy_title).filter(Boolean))], category:info?.job_categories?.[0] || ''});
      }
    }
    if (!companies.some(c => datasetKey(c.name) === 'microsoft')) {
      const example = datasetLookup?.get('microsoft');
      if (example) companies.unshift({
        id: `example:${example.company_id}`, name: example.company_name,
        location: (example.locations || []).join(' · '),
        category: example.job_categories?.[0] || '', jobs: example.dataset_job_count,
        roles: [], isExample: true, isApplied:appliedCompanies.has('microsoft')
      });
    }
    recommendedRoles = new Map();
    const rankedMatches = companies.filter(c => !c.isExample && !c.isAppliedOnly && Number(c.best_score || 0) > 0);
    const bestMatchScore = Math.max(0, ...rankedMatches.map(c => Number(c.best_score)));
    for (const company of companies) {
      company.isBestMatch = rankedMatches.includes(company) && Number(company.best_score) === bestMatchScore;
    }
    const mountToken = Symbol();
    container.companyReviewMount = mountToken;
    let communityId = '', community = null, communityLoading = false, communityError = '';
    async function loadCommunity(id) {
      communityId = id; communityLoading = true; communityError = '';
      try {
        const response = await fetch(`/api/companies/${encodeURIComponent(id)}/reviews`, {cache:'no-store'});
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data.message || 'Could not load reviews.');
        if (communityId !== id) return;
        community = data;
      } catch(error) { if (communityId === id) communityError = error.message || 'Could not load reviews.'; }
      finally { if (communityId === id) { communityLoading = false; if (container.companyReviewMount === mountToken) paint(); } }
    }
    function communityContent(c) {
      if (communityId !== datasetLookup?.get(datasetKey(c.name))?.company_id || communityLoading || !community) return `<p class="ci-muted">${esc(communityError || 'Loading community reviews…')}</p>`;
      const stars = n => '★'.repeat(n) + '☆'.repeat(5-n);
      return `<section class="ci-community"><h3>Community reviews ${community.count ? `<span class="ci-review-count">${esc(community.count)}</span>` : ''}</h3>${community.count ? `<p class="ci-muted">${esc(community.average)} / 5 · ${esc(community.count)} published reviews</p>` : '<p class="ci-muted">No community reviews yet. Share your experience below.</p>'}<div class="ci-review-list">${community.reviews.map(r => `<article class="ci-review-card"><div class="ci-review-meta"><span class="ci-review-stars" aria-label="${r.rating} out of 5">${stars(r.rating)}</span><span>${esc(r.relationship)}${r.is_mine ? ' · Your review' : ''}</span><time>${esc(r.updated_at.slice(0,10))}</time></div><h4>${esc(r.title)}</h4><p><b>What went well</b>${esc(r.pros)}</p>${r.cons ? `<p><b>Could improve</b>${esc(r.cons)}</p>` : ''}</article>`).join('')}</div></section>`;
    }
    const key = id => `careerlens:company-review-draft:${identity}:${id}`;
    const read = id => { try { return JSON.parse(localStorage.getItem(key(id)) || 'null'); } catch { return null; } };
    function paint() {
      const list = companies.filter(c => (!category || c.category === category) && `${c.name} ${c.location} ${c.category}`.toLowerCase().includes(query.toLowerCase())).sort((a,b) => (Number(datasetKey(b.name) === 'microsoft') - Number(datasetKey(a.name) === 'microsoft')) || Number(Boolean(b.isApplied)) - Number(Boolean(a.isApplied)) || Number(b.best_score || 0) - Number(a.best_score || 0) || Number(b.matched || 0) - Number(a.matched || 0) || Number(a.distance_km ?? Infinity) - Number(b.distance_km ?? Infinity));
      if (!list.some(c => c.id === selected)) selected = list[0]?.id || '';
      const c = list.find(c => c.id === selected), p = profiles[selected] || profiles.by_company_name?.[datasetKey(c?.name)] || {};
      const wiki = wikiProfiles?.[datasetLookup?.get(datasetKey(c?.name))?.company_id];
      const website = url(p.website_url) || url(wiki?.website_url);
      const websiteLabel = !url(p.website_url) && wiki?.scope === 'group' ? 'Group website ↗' : 'Official website ↗';
      container.innerHTML = `<div class="ci-intro"><div><span class="ci-eyebrow">BEFORE YOUR NEXT CHAPTER</span><h2>Get to know your next workplace.</h2><p>Microsoft first, then your applied companies and CV recommendations.</p></div><span class="ci-count">${companies.length} company profiles</span></div>
        <div class="ci-search"><label>Search companies<input data-search type="search" placeholder="Company name, industry or location" value="${esc(query)}"></label><label>Industry<select data-category><option value="">All industries</option>${[...new Set(companies.map(c=>c.category).filter(Boolean))].sort().map(v=>`<option ${v===category?'selected':''}>${esc(v)}</option>`).join('')}</select></label><button data-map-settings>Change map area</button></div>
        <div class="ci-layout"><aside class="ci-directory" aria-label="Company locations"><p class="ci-muted">${list.length} results · CV recommendations</p>${list.map(x=>`<button class="ci-company ${x.id===selected?'is-selected':''} ${x.isApplied?'is-applied':''} ${x.isBestMatch?'is-best-match':''}" data-company="${esc(x.id)}" aria-pressed="${x.id===selected}"><span class="ci-avatar">${esc(x.name.slice(0,2).toUpperCase())}</span><span><strong>${esc(x.name)}</strong>${x.isApplied ? '<span class="ci-applied-badge">✓ Applied</span>' : ''}${x.isBestMatch ? '<span class="ci-best-match-badge">★ Best match</span>' : ''}<small>${esc(x.location)}${x.isExample ? ' · Featured example' : x.isAppliedOnly ? '' : ` · ${esc(x.distance_km)} km`}</small><small>${esc(x.jobs)} ${x.isAppliedOnly ? 'applications' : x.isExample ? 'recorded roles' : 'listed roles'}</small></span><span aria-hidden="true">›</span></button>`).join('') || '<div class="ci-empty">No matching recommendations. Update your CV, change your map area or adjust your search.</div>'}</aside>
        <div class="ci-detail">${c ? `<header class="ci-profile"><div class="ci-cover"><span>DISCOVER YOUR NEXT WORKPLACE</span></div><div class="ci-profile-body"><span class="ci-avatar ci-avatar-large">${esc(c.name.slice(0,2).toUpperCase())}</span><div class="ci-profile-heading"><div><h2>${esc(c.name)}</h2>${p.registration_number ? `<small class="ci-registration">Registration No. ${esc(p.registration_number)}</small>` : ''}<p>${esc(c.category || 'Industry not provided')} · ${esc(c.location)}</p></div><button class="ci-primary" data-write>Write a review</button></div><div class="ci-actions"><span class="ci-pill">${c.isApplied ? '✓ Applied company' : c.isExample ? 'Featured example' : '◎ Same company as your map'}</span>${c.isExample || c.isAppliedOnly ? '' : '<button data-map>View on map ↗</button>'}${website ? `<a href="${esc(website)}" target="_blank" rel="noopener noreferrer">${esc(websiteLabel)}</a>` : `<a href="https://www.google.com/search?q=${encodeURIComponent(c.name + ' official website')}" target="_blank" rel="noopener noreferrer">Search company website ↗</a>`}</div></div><nav class="ci-tabs" aria-label="Company information">${[['about','Overview'],['benefits','Pay & benefits'],['reviews','Ratings & reviews'],['jobs','Jobs']].map(([id,label])=>`<button data-section="${id}" aria-current="${section===id?'page':'false'}">${label}</button>`).join('')}</nav></header><div class="ci-panel">${content(c,p)}</div>` : ''}</div></div>`;
      const search = container.querySelector('[data-search]');
      search.oninput = e => { const start = e.target.selectionStart; query = e.target.value; paint(); const input = container.querySelector('[data-search]'); input.focus(); input.setSelectionRange(start,start); };
      container.querySelector('[data-category]').onchange = e => { category=e.target.value; paint(); };
      container.querySelectorAll('[data-map-settings]').forEach(button => button.onclick = () => onMap(null));
      container.querySelectorAll('[data-company]').forEach(b=>b.onclick=()=>{selected=b.dataset.company; section='about';paint();});
      container.querySelectorAll('[data-section]').forEach(b=>b.onclick=()=>{section=b.dataset.section;paint();});
      container.querySelector('[data-map]')?.addEventListener('click',()=>onMap(c));
      container.querySelector('[data-jobs]')?.addEventListener('click',()=>onJobs(c));
      container.querySelector('[data-write]')?.addEventListener('click',()=>{section='reviews';paint();container.querySelector('[name=title]')?.focus();});
      async function fetchRecommendedRoles() {
        const state = recommendedRoles.get(c.id) || {jobs:[],has_more:false,loading:false,error:''};
        if (state.loading) return;
        state.loading=true; state.error=''; recommendedRoles.set(c.id,state);
        try {
          if (!loadCompanyJobs) throw new Error('Please refresh to load recommendations.');
          const response = await loadCompanyJobs(c,state.jobs.length);
          state.jobs=[...state.jobs,...(response.jobs || [])]; state.has_more=Boolean(response.has_more);
        } catch(error) { state.error=error.message || 'Could not load roles.'; }
        finally { state.loading=false; if (container.companyReviewMount === mountToken && selected === c.id && ['benefits','jobs'].includes(section)) paint(); }
      }
      container.querySelector('[data-more-pay]')?.addEventListener('click',()=>{fetchRecommendedRoles();paint();});
      if (c && ['benefits','jobs'].includes(section) && !recommendedRoles.has(c.id)) fetchRecommendedRoles();
      const form = container.querySelector('form');
      if (form) {
        const companyId = datasetLookup?.get(datasetKey(c?.name))?.company_id;
        if (companyId && communityId !== companyId) {
          community = null;
          loadCommunity(companyId);
        }
        const status = container.querySelector('[data-status]');
        const submit = form.querySelector('[type=submit]');
        const clear = container.querySelector('[data-delete]');
        const values = read(selected) || community?.mine;
        if (values) for (const [k,v] of Object.entries(values)) {
          const input = form.elements.namedItem(k);
          if (input) input.value = v;
        }
        const updateStars = () => {
          const value = Number(form.elements.namedItem('rating').value || 0);
          form.querySelectorAll('[data-star]').forEach(label => label.classList.toggle('is-filled', Number(label.dataset.star) <= value));
          form.querySelector('[data-rating-label]').textContent = value ? `${value} / 5` : 'Choose a rating';
        };
        updateStars();
        form.addEventListener('change', updateStars);
        const unavailable = !companyId || communityLoading || !community;
        form.querySelectorAll('input,select,textarea,button').forEach(el => el.disabled = unavailable);
        if (!companyId) status.textContent = 'Reviews are not available for this company yet.';
        else if (communityError) status.textContent = communityError + ' Reopen this page to retry.';
        submit.textContent = community?.mine ? 'Update my review' : 'Publish review';
        clear.hidden = !community?.mine;
        clear.textContent = 'Delete my review';
        form.onsubmit = async e => {
          e.preventDefault();
          if (!companyId || !form.reportValidity()) return;
          const payload = Object.fromEntries(new FormData(form));
          submit.disabled = true; clear.disabled = true;
          status.textContent = 'Publishing…';
          try {
            const response = await fetch(`/api/companies/${encodeURIComponent(companyId)}/reviews`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)});
            const data = await response.json();
            if (!response.ok || !data.ok) throw new Error(data.message || 'Could not publish review.');
            try { localStorage.removeItem(key(selected)); } catch {}
            community = data;
            if (container.companyReviewMount === mountToken && communityId === companyId) {
              paint(); container.querySelector('[data-status]').textContent = 'Your review is published.';
            }
          } catch(error) { status.textContent = error.message || 'Could not publish review.'; }
          finally { submit.disabled = false; clear.disabled = false; }
        };
        clear.onclick = async () => {
          if (!window.confirm('Delete your published review?')) return;
          clear.disabled = true; submit.disabled = true;
          try {
            const response = await fetch(`/api/companies/${encodeURIComponent(companyId)}/reviews`, {method:'DELETE'});
            const data = await response.json();
            if (!response.ok || !data.ok) throw new Error(data.message || 'Could not delete review.');
            try { localStorage.removeItem(key(selected)); } catch {}
            await loadCommunity(companyId);
          } catch(error) { status.textContent = error.message || 'Could not delete review.'; }
          finally { clear.disabled = false; submit.disabled = false; }
        };
      }
    }
    function content(c,p) {
      const source=url(p.source_url), evidence=source?`<p class="ci-muted">Source: <a href="${esc(source)}" target="_blank" rel="noopener noreferrer">Company information ↗</a>${p.checked_at?` · Checked ${esc(p.checked_at)}`:''}</p>`:'';
      if(section==='about') return `<div class="ci-stats"><div><strong>${esc(c.jobs)}</strong><span>${c.isAppliedOnly ? 'Applications' : c.isExample ? 'Recorded roles' : 'Roles in this area'}</span></div><div><strong>${c.isExample || c.isAppliedOnly ? '—' : `${esc(c.distance_km)} km`}</strong><span>${c.isAppliedOnly ? 'Applied company' : c.isExample ? 'Featured company' : 'From your location'}</span></div><div><strong>${esc(c.location || 'Malaysia')}</strong><span>Job location</span></div></div><h3>About ${esc(p.legal_name || c.name)}</h3>${p.description ? (p.facts ? sourcedCompanyProfile(p) : `<p class="ci-description">${esc(p.description)}</p>${evidence}`) : wikiProfiles?.[datasetLookup?.get(datasetKey(c.name))?.company_id] ? wikiEvidence(c) : companyOverviewFallback(c)}${disclosureNote(c)}<p class="ci-location-note">${c.isExample ? 'Example profile · Recorded roles may no longer be available.' : 'Map location is approximate.'}</p>`;
      if(section==='benefits') return `${payContent(c)}<h3>Benefits & everyday life</h3><p class="ci-muted">Benefits can differ by office, role and employment type.</p><div class="ci-benefits">${[['Health & wellbeing','health'],['Leave & flexibility','leave'],['Learning & growth','learning'],['Financial benefits','financial']].map(([label,k])=>`<article><span class="ci-benefit-icon">${{health:'♡',leave:'☀',learning:'✦',financial:'◇'}[k]}</span><h4>${label}</h4><p>${esc(p.benefits?.[k] || 'Not provided yet')}</p></article>`).join('')}</div>${evidence}`;
      if(section==='jobs') return `${payContent(c)}${c.isExample ? '' : '<button class="ci-primary" data-jobs>View company jobs →</button>'}`;
      return `${historicalStars(c)}${externalInterviewContent(p)}${communityContent(c)}<form><h3>Share your experience</h3><p class="ci-note">Your review will be visible to other members. Your name and email will not be displayed. Share your own experience without personal details.</p><div class="ci-form-grid"><label>Your relationship<select name="relationship" required><option value="">Choose one</option><option>Current employee</option><option>Former employee</option><option>Interview candidate</option><option>Intern</option></select></label><fieldset class="ci-star-field"><legend>Overall rating</legend><div class="ci-star-picker">${[1,2,3,4,5].map(n=>`<label data-star="${n}"><input type="radio" name="rating" value="${n}" required aria-label="${n} ${n===1?'star':'stars'}"><span aria-hidden="true">★</span></label>`).join('')}</div><span class="ci-muted" data-rating-label>Choose a rating</span></fieldset></div><label>Review title<input name="title" maxlength="120" required placeholder="What would you like others to know?"></label><label>What went well?<textarea name="pros" maxlength="2000" required placeholder="Describe your experience with the team, work or learning opportunities."></textarea></label><label>What could improve?<textarea name="cons" maxlength="2000" placeholder="Keep feedback specific and constructive."></textarea></label><div class="ci-actions"><button class="ci-primary" type="submit">Publish review</button><button type="button" data-delete>Delete my review</button></div><p data-status role="status" class="ci-muted"></p></form>`;
    }
    paint();
  }
  return {mount};
})();
