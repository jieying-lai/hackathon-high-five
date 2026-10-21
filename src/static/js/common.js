/* Shared helpers & Lumi Mascot AI Chatbox Widget for CareerLens AI pages. */
// Every same-origin mutation carries the token belonging to this browser session.
const nativeFetch = window.fetch.bind(window);
let csrfTokenPromise;
window.fetch = async function(input, options = {}) {
  const target = new URL(typeof input === 'string' ? input : input.url, window.location.href);
  const method = (options.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
  if (target.origin === window.location.origin && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    if (!csrfTokenPromise) {
      csrfTokenPromise = nativeFetch('/api/auth/csrf', { credentials: 'same-origin', cache: 'no-store' })
        .then(async r => { if (!r.ok) throw new Error('Unable to start a secure session.'); return (await r.json()).csrf_token; })
        .catch(error => { csrfTokenPromise = null; throw error; });
    }
    const headers = new Headers(options.headers || (input instanceof Request ? input.headers : {}));
    headers.set('X-CSRF-Token', await csrfTokenPromise);
    options = { ...options, headers };
  }
  return nativeFetch(input, options);
};

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

async function api(url, options) {
  const res = await fetch(url, options);
  let data = {};
  try { data = await res.json(); } catch (e) {  }
  if (res.status === 401) { window.location.href = '/'; }
  return { ok: res.ok, status: res.status, data };
}

function postJson(url, body, method = 'POST') {
  return api(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}

function toast(message, type = 'ok') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = window.careerLensLocale?.translate(message) ?? message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

function localizedConfirm(message) {
  return window.confirm(window.careerLensLocale?.translate(message) ?? message);
}

async function signOut() {
  window.PagePosition?.clear();
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/';
}

(function initLumiChatbox() {
  let lumiOpen = false;
  let lumiHistory = [];
  let lumiQuickPrompts = [];
  let lumiPortal = 'guest';

  function formatLumiMarkdown(text) {
    let safe = esc(text || '');
    safe = safe.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    safe = safe.replace(/_(.+?)_/g, '<i>$1</i>');
    safe = safe.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-800 font-mono text-[11px]">$1</code>');
    safe = safe.replace(/\n/g, '<br/>');
    return safe;
  }

  function renderLumiMessages() {
    const box = document.getElementById('lumiMsgList');
    if (!box) return;
    box.innerHTML = lumiHistory.map((m, idx) => {
      if (m.role === 'user') {
        return `<div class="flex justify-end"><div data-no-translate class="lumi-msg-user px-4 py-2.5 text-xs leading-relaxed max-w-[84%] shadow-sm">${esc(m.text)}</div></div>`;
      }
      const cls = m.guardrail ? 'lumi-msg-guard' : 'lumi-msg-bot';
      const actBtns = (m.actions || []).length ? `
        <div class="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-slate-200/70">
          ${m.actions.map((a, ai) => `<button type="button" onclick="window._lumiRunAction(${idx},${ai})" class="chip chip-teal hover:bg-teal-100 cursor-pointer !text-[11px] !py-1 !px-2.5">${esc(a.label)} →</button>`).join('')}
        </div>` : '';
      return `
        <div class="flex items-start gap-2.5">
          <img src="/static/brand/lumi_mascot.svg" alt="Lumi" class="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 shrink-0 mt-0.5" />
          <div class="${cls} p-3.5 text-xs leading-relaxed flex-1 min-w-0 shadow-sm">
            <div>${formatLumiMarkdown(m.text)}</div>
            ${actBtns}
          </div>
        </div>`;
    }).join('');
    box.scrollTop = box.scrollHeight;
  }

  function renderQuickPrompts() {
    const bar = document.getElementById('lumiQuickBar');
    if (!bar) return;
    bar.innerHTML = lumiQuickPrompts.map((q, i) =>
      `<button type="button" onclick="window._lumiAskQuick(${i})" class="px-3 py-1.5 rounded-xl bg-indigo-50/90 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/80 text-[11px] font-bold text-center truncate transition cursor-pointer">${esc(q.label)}</button>`
    ).join('');
  }

  window._lumiRunAction = function(msgIdx, actIdx) {
    const msg = lumiHistory[msgIdx];
    const act = msg && msg.actions && msg.actions[actIdx];
    if (!act) return;
    if (act.tab && typeof window.showTab === 'function') {
      window.showTab(act.tab).then(() => {
        if (act.lat && act.lng && typeof window.applyLumiMapJump === 'function') {
          window.applyLumiMapJump(act);
        } else if (act.category && typeof window.setCompanyCategory === 'function') {
          window.setCompanyCategory(act.category);
          if (typeof window.setJobScope === 'function') window.setJobScope('all');
        }
      });
      toast(`Opened ${act.label.replace(/^[^\w]+/, '')}`);
    } else if (act.prompt) {
      window.sendLumiMessage(act.prompt);
    }
  };

  window._lumiAskQuick = function(idx) {
    const q = lumiQuickPrompts[idx];
    if (q && q.prompt) window.sendLumiMessage(q.prompt);
  };

  window.toggleLumiChat = function(forceState) {
    lumiOpen = typeof forceState === 'boolean' ? forceState : !lumiOpen;
    const panel = document.getElementById('lumiPanel');
    const badge = document.getElementById('lumiFabLabel');
    if (panel) panel.classList.toggle('hidden', !lumiOpen);
    if (badge) badge.textContent = lumiOpen ? 'Close Advisor' : 'Ask Lumi';
    if (lumiOpen) {
      const inp = document.getElementById('lumiInput');
      if (inp) setTimeout(() => inp.focus(), 80);
      renderLumiMessages();
    }
  };

  window.sendLumiMessage = async function(rawText) {
    const inp = document.getElementById('lumiInput');
    const text = (rawText !== undefined ? rawText : (inp ? inp.value : '')).trim();
    if (!text) return;
    if (inp && rawText === undefined) inp.value = '';

    lumiHistory.push({ role: 'user', text });
    renderLumiMessages();

    const typing = document.getElementById('lumiTyping');
    if (typing) typing.classList.remove('hidden');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          external_ai_consent: document.getElementById('lumiExternalConsent')?.checked === true,
          history: lumiHistory.slice(-6).map(m => ({ role: m.role, text: m.text })),
          user_location: window._careerLensUserLocation || null,
        }),
      });
      const data = await res.json();
      if (typing) typing.classList.add('hidden');
      lumiHistory.push({
        role: 'bot',
        text: data.reply || 'Please let me know how I can assist you.',
        guardrail: Boolean(data.guardrail_triggered),
        actions: data.actions || [],
      });
      renderLumiMessages();
    } catch (err) {
      if (typing) typing.classList.add('hidden');
      lumiHistory.push({
        role: 'bot',
        text: 'Unable to reach the advisory service right now. Please try again shortly.',
        guardrail: false,
        actions: [],
      });
      renderLumiMessages();
    }
  };

  async function mountWidget() {
    if (!document.body || document.getElementById('lumiFab')) return;

    try {
      const res = await fetch('/api/chat/context');
      const ctx = await res.json();
      lumiQuickPrompts = ctx.quick_prompts || [];
      lumiPortal = ctx.portal || 'guest';
    } catch (e) {
      lumiQuickPrompts = [];
    }

    const headerTitle = lumiPortal === 'hr_company'
      ? 'Lumi · Talent & Workforce Advisor'
      : 'Lumi · Career Advisor';
    const headerSub = lumiPortal === 'hr_company'
      ? 'Support for candidate screening & workforce planning'
      : 'Personalised guidance for your career, skills & job search';

    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <!-- Floating Launcher Button -->
      <button id="lumiFab" onclick="toggleLumiChat()" class="lumi-fab" title="Open Lumi Career Advisor">
        <div class="lumi-fab-avatar">
          <img src="/static/brand/lumi_mascot.svg" alt="Lumi" class="w-11 h-11" />
        </div>
        <div class="text-left pr-1.5">
          <div class="flex items-center gap-1.5">
            <span id="lumiFabLabel" class="text-xs font-extrabold text-slate-800">Ask Lumi</span>
            <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div class="text-[10px] font-semibold text-indigo-600">Career Advisor</div>
        </div>
      </button>

      <!-- Lumi Advisory Panel -->
      <aside id="lumiPanel" class="lumi-panel hidden" aria-label="Lumi Career Advisor">
        <div class="lumi-header flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="h-11 w-11 rounded-2xl bg-white/95 p-1 shadow grid place-items-center shrink-0">
              <img src="/static/brand/lumi_mascot.svg" alt="Lumi" class="w-9 h-9" />
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-extrabold text-sm truncate">${headerTitle}</span>
                <span class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 border border-white/30 shrink-0">
                  <span class="h-1.5 w-1.5 rounded-full bg-emerald-300"></span>Online
                </span>
              </div>
              <div class="text-[11px] text-white/90 truncate mt-0.5">${headerSub}</div>
            </div>
          </div>
          <button type="button" onclick="toggleLumiChat(false)" class="h-7 w-7 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs grid place-items-center shrink-0">✕</button>
        </div>

        <!-- Messages Container -->
        <div id="lumiMsgList" class="flex-1 p-4 space-y-3.5 overflow-y-auto"></div>

        <!-- Typing Indicator -->
        <div id="lumiTyping" class="hidden px-4 py-2 text-[11px] font-semibold text-indigo-600 flex items-center gap-1.5 bg-indigo-50/60">
          <span>Preparing your career insights...</span>
        </div>

        <!-- Neatly Aligned 2x2 Quick Selection Grid (Never clipped) -->
        
        <div id="lumiQuickBar" class="px-3.5 py-2.5 border-t border-slate-200/70 bg-slate-50/90 grid grid-cols-2 gap-1.5"></div>

        <!-- Input Bar -->
        <form onsubmit="event.preventDefault();sendLumiMessage();" class="p-3 bg-white border-t border-slate-200/80 flex items-center gap-2">
          <input id="lumiInput" type="text" class="input !py-2.5 !text-xs flex-1" placeholder="Ask about nearby roles, career paths, skills, or courses..." maxlength="280" />
          <button type="submit" class="btn btn-primary !py-2.5 !px-4 !text-xs shrink-0">Send</button>
        </form>
      </aside>
    `;
    document.body.appendChild(wrap);

    const welcomeText = lumiPortal === 'hr_company'
      ? "**Welcome! I am Lumi, your Talent & Workforce Advisor.**\nHow may I assist you with **candidate screening**, **submitted applications**, or **team skill readiness** today?"
      : lumiPortal === 'job_seeker'
      ? "**Welcome! I am Lumi, your Career Advisor.**\nI can help you explore **nearby job opportunities**, **future role matches**, **reskilling pathways**, or review your **CV profile**."
      : "**Welcome! I am Lumi, your Career Advisor.**\nAsk me about **career pathways, nearby job matching, skill development, or candidate screening**.";

    lumiHistory = [{
      role: 'bot',
      text: welcomeText,
      guardrail: false,
      actions: lumiQuickPrompts.slice(0, 2),
    }];
    renderQuickPrompts();
    renderLumiMessages();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountWidget);
  } else {
    mountWidget();
  }
})();

function buildPortalNavigation(items, groups) {
  const itemButton = item => `<button type="button" data-tab="${item.id}" onclick="showTab('${item.id}')" class="nav-item"><span aria-hidden="true">${item.ico}</span><span>${esc(item.label)}</span></button>`;
  const available = group => group.ids.map(id => items.find(item => item.id === id)).filter(Boolean);
  document.getElementById('sideNav').innerHTML = groups.map(group => {
    const children = available(group);
    if (children.length === 1 && !group.dropdown) return itemButton(children[0]);
    return `<details class="nav-group"><summary>${esc(group.label)}<span class="nav-chevron" aria-hidden="true">⌄</span></summary><div class="nav-group-panel">${children.map(itemButton).join('')}</div></details>`;
  }).join('');
  document.getElementById('topNav').innerHTML = groups.map(group => `<div class="mobile-nav-group"><div class="nav-group-label">${esc(group.label)}</div>${available(group).map(itemButton).join('')}</div>`).join('');
}

function closePortalMenu(restoreFocus = false) {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('topNav');
  if (!toggle || !nav) return;
  nav.hidden = true;
  toggle.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('portal-menu-open');
  if (restoreFocus) toggle.focus();
}

function setPortalNavigation(id) {
  const nav = document.getElementById('topNav');
  const restoreFocus = nav && nav.contains(document.activeElement);
  document.querySelectorAll('#sideNav [data-tab], #topNav [data-tab]').forEach(button => {
    const selected = button.dataset.tab === id;
    button.classList.toggle('active', selected);
    if (selected) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  document.querySelectorAll('[data-notification-button]').forEach(button => {
    const selected = id === 'notifications';
    button.classList.toggle('active', selected);
    if (selected) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  const selected = document.querySelector('#sideNav .active') || (id === 'notifications' ? document.querySelector('[data-notification-button]') : null);
  const label = document.getElementById('mobileCurrentSection');
  if (label && selected) label.textContent = selected.textContent.trim();
  document.querySelectorAll('.nav-group').forEach(group => {
    group.classList.toggle('has-current', Boolean(group.querySelector('.active')));
    if (group.contains(document.activeElement)) group.querySelector('summary').focus();
    group.open = false;
  });
  closePortalMenu(restoreFocus);
}

(function initPortalNavigation() {
  function mount() {
    const toggle = document.getElementById('navToggle');
    const nav = document.getElementById('topNav');
    if (!toggle || !nav) return;
    function sizePortalMenu() {
      if (nav.hidden) return;
      const viewport = window.visualViewport;
      const viewportBottom = viewport ? viewport.offsetTop + viewport.height : window.innerHeight;
      const headerBottom = toggle.closest('header').getBoundingClientRect().bottom;
      nav.style.setProperty('--portal-menu-space', `${Math.max(0, viewportBottom - headerBottom - 12)}px`);
    }
    const groups = () => [...document.querySelectorAll('.nav-group')];
    document.addEventListener('toggle', event => {
      const group = event.target;
      if (group.matches('.nav-group') && group.open) groups().forEach(other => { if (other !== group) other.open = false; });
    }, true);
    document.addEventListener('click', event => {
      groups().forEach(group => { if (!group.contains(event.target)) group.open = false; });
    });
    document.addEventListener('focusin', event => {
      groups().forEach(group => { if (!group.contains(event.target)) group.open = false; });
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') groups().forEach(group => {
        if (group.open) { group.open = false; group.querySelector('summary').focus(); }
      });
    });
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      nav.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('portal-menu-open', open);
      if (open) sizePortalMenu();
    });
    window.addEventListener('resize', sizePortalMenu);
    window.visualViewport?.addEventListener('resize', sizePortalMenu);
    if (window.ResizeObserver) new ResizeObserver(sizePortalMenu).observe(toggle.closest('header'));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !nav.hidden) closePortalMenu(true);
    });
    document.addEventListener('click', event => {
      if (!toggle.closest('header').contains(event.target)) closePortalMenu();
    });
    document.addEventListener('focusin', event => {
      if (!toggle.closest('header').contains(event.target)) closePortalMenu();
    });
    window.matchMedia('(min-width: 1280px)').addEventListener('change', event => {
      if (event.matches) closePortalMenu();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();

(function initHomepageNavigation() {
  function mount() {
    const toggle = document.getElementById('homeNavToggle');
    const nav = document.getElementById('homeNav');
    if (!toggle || !nav) return;
    function close(restoreFocus = false) {
      nav.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      if (restoreFocus) toggle.focus();
    }
    toggle.addEventListener('click', () => {
      nav.hidden = !nav.hidden;
      toggle.setAttribute('aria-expanded', String(!nav.hidden));
    });
    nav.addEventListener('click', event => { if (event.target.closest('a,button')) close(true); });
    document.addEventListener('click', event => { if (!toggle.closest('header').contains(event.target)) close(); });
    document.addEventListener('focusin', event => { if (!toggle.closest('header').contains(event.target)) close(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !nav.hidden) close(true); });
    window.matchMedia('(min-width: 1280px)').addEventListener('change', () => close());
    const links = [...document.querySelectorAll('.homepage-navigation a, #homeNav a')];
    links.forEach(link => link.addEventListener('click', event => {
      const landing = document.getElementById('landing');
      const auth = document.getElementById('auth');
      if (!landing || !auth || !landing.classList.contains('hidden')) return;

      const section = document.querySelector(link.hash);
      if (!section) return;
      event.preventDefault();
      auth.classList.add('hidden');
      landing.classList.remove('hidden');
      window.history.pushState(null, '', link.hash);
      requestAnimationFrame(() => section.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }));
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio-a.intersectionRatio)[0];
      if (!visible) return;
      links.forEach(link => {
        const active = link.hash === '#' + visible.target.id;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
      });
    }, {rootMargin: '-140px 0px -20% 0px', threshold: [0, .25, .5]});
    document.querySelectorAll('#home-intro, #home-portals').forEach(section => observer.observe(section));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
