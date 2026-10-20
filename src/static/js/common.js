
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
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

async function signOut() {
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
    safe = safe.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-indigo-100/80 text-indigo-800 font-mono text-[10px]">$1</code>');
    safe = safe.replace(/\n/g, '<br/>');
    return safe;
  }

  function renderLumiMessages() {
    const box = document.getElementById('lumiMsgList');
    if (!box) return;
    box.innerHTML = lumiHistory.map((m, idx) => {
      if (m.role === 'user') {
        return `<div class="flex justify-end"><div class="lumi-msg-user px-3.5 py-2.5 text-xs max-w-[82%] shadow-sm">${esc(m.text)}</div></div>`;
      }
      const cls = m.guardrail ? 'lumi-msg-guard' : 'lumi-msg-bot';
      const badge = m.guardrail
        ? `<div class="mb-1"><span class="chip chip-rose !text-[9px]">🛡️ Out-of-Scope Guardrail</span></div>`
        : `<div class="mb-1 flex items-center gap-1.5"><span class="chip chip-indigo !text-[9px]">🦉 Lumi AI · In-Scope</span></div>`;
      const actBtns = (m.actions || []).length ? `
        <div class="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-slate-200/60">
          ${m.actions.map((a, ai) => `<button onclick="window._lumiRunAction(${idx},${ai})" class="chip chip-teal hover:bg-teal-100 cursor-pointer !text-[10px]">${esc(a.label)} →</button>`).join('')}
        </div>` : '';
      return `
        <div class="flex items-start gap-2">
          <img src="/static/brand/lumi_mascot.svg" alt="Lumi" class="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 shrink-0 mt-0.5" />
          <div class="${cls} p-3 text-xs leading-relaxed max-w-[85%] shadow-sm">
            ${badge}
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
      `<button onclick="window._lumiAskQuick(${i})" class="chip chip-indigo hover:bg-indigo-100 cursor-pointer whitespace-nowrap !text-[10px] shrink-0">${esc(q.label)}</button>`
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
    if (badge) badge.textContent = lumiOpen ? 'Close Lumi' : 'Ask Lumi AI';
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
          history: lumiHistory.slice(-6).map(m => ({ role: m.role, text: m.text })),
          user_location: window._careerLensUserLocation || null,
        }),
      });
      const data = await res.json();
      if (typing) typing.classList.add('hidden');
      lumiHistory.push({
        role: 'bot',
        text: data.reply || 'Hoot! Let me check that for you.',
        guardrail: Boolean(data.guardrail_triggered),
        actions: data.actions || [],
      });
      renderLumiMessages();
    } catch (err) {
      if (typing) typing.classList.add('hidden');
      lumiHistory.push({
        role: 'bot',
        text: 'Hoot! I could not reach the CareerLens server right now. Please try again.',
        guardrail: false,
        actions: [],
      });
      renderLumiMessages();
    }
  };

  async function mountWidget() {
    if (!document.body || document.getElementById('lumiFab')) return;

    const wrap = document.createElement('div');
    wrap.setAttribute('data-no-translate', '');
    wrap.innerHTML = `
      <!-- Floating Cute Mascot Launcher Button -->
      <button id="lumiFab" onclick="toggleLumiChat()" class="lumi-fab" title="Chat with Lumi — Domain-Scoped CareerLens AI Mascot">
        <div class="lumi-fab-avatar">
          <img src="/static/brand/lumi_mascot.svg" alt="Lumi Mascot" class="w-11 h-11" />
        </div>
        <div class="text-left pr-1">
          <div class="flex items-center gap-1.5">
            <span id="lumiFabLabel" class="text-xs font-extrabold text-slate-800">Ask Lumi AI</span>
            <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div class="text-[10px] font-semibold text-indigo-600">Career &amp; HR Copilot</div>
        </div>
      </button>

      <!-- Lumi Chat Panel -->
      <aside id="lumiPanel" class="lumi-panel hidden" aria-label="Lumi AI Copilot">
        <div class="lumi-header flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <div class="h-11 w-11 rounded-2xl bg-white/95 p-1 shadow grid place-items-center shrink-0">
              <img src="/static/brand/lumi_mascot.svg" alt="Lumi" class="w-9 h-9" />
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="font-extrabold text-sm">Lumi · AI Owl Copilot</span>
                <span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/20 border border-white/30">Scoped AI</span>
              </div>
              <div class="text-[10px] text-white/85">Trained strictly on CV, Reskilling &amp; Fair HR</div>
            </div>
          </div>
          <button onclick="toggleLumiChat(false)" class="h-7 w-7 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs grid place-items-center">✕</button>
        </div>

        <!-- Scope Notice Strip -->
        <div class="px-3.5 py-1.5 bg-indigo-50/90 border-b border-indigo-100 flex items-center justify-between text-[10px] text-indigo-900 font-semibold">
          <span>🛡️ Domain-Trained: Answers Career/HR queries only</span>
          <button onclick="sendLumiMessage('What is the weather or a pizza recipe?')" class="underline text-rose-600 font-bold" title="Test out-of-scope guardrail">Test Guardrail</button>
        </div>

        <!-- Messages Container -->
        <div id="lumiMsgList" class="flex-1 p-3.5 space-y-3 overflow-y-auto"></div>

        <!-- Typing Indicator -->
        <div id="lumiTyping" class="hidden px-4 py-1.5 text-[11px] font-bold text-indigo-600 flex items-center gap-1.5">
          <span>🦉 Lumi is analysing your live workspace data...</span>
        </div>

        <!-- Quick Prompts Carousel -->
        <div id="lumiQuickBar" class="px-3 py-2 border-t border-slate-200/70 bg-white/70 flex gap-1.5 overflow-x-auto hidden-scroll"></div>

        <!-- Input Bar -->
        <form onsubmit="event.preventDefault();sendLumiMessage();" class="p-3 bg-white/95 border-t border-slate-200/80 flex items-center gap-2">
          <input id="lumiInput" type="text" class="input !py-2 !text-xs flex-1" placeholder="Ask about your PDF CV, role match, courses, or HR..." maxlength="280" />
          <button type="submit" class="btn btn-primary !py-2 !px-3.5 !text-xs">Send</button>
        </form>
      </aside>
    `;
    document.body.appendChild(wrap);

    try {
      const res = await fetch('/api/chat/context');
      const ctx = await res.json();
      lumiQuickPrompts = ctx.quick_prompts || [];
      lumiPortal = ctx.portal || 'guest';
    } catch (e) {
      lumiQuickPrompts = [];
    }

    const welcomeText = lumiPortal === 'hr_company'
      ? "🦉 **Hi! I'm Lumi, your Employer AI Copilot.**\nAsk me about **top screened candidates**, **applied PDF CVs**, or **team skill gaps**."
      : lumiPortal === 'job_seeker'
      ? "🦉 **Hi! I'm Lumi, your CareerLens AI Owl.**\nAsk me about **nearby jobs for your CV**, **career goals**, **role matches**, or **courses**."
      : "🦉 **Hi! I'm Lumi.**\nI help with **private PDF CVs, nearby job matching, reskilling & fair HR screening**.";

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
    if (children.length === 1) return itemButton(children[0]);
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
    });
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
