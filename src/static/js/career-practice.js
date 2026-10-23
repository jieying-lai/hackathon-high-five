(function (root) {
  'use strict';
  const tasks = [
    {id:'data', label:'Data & decisions', title:'A campaign looks successful. Is it?', duration:'12 min', brief:'You are a junior analyst at a fictional Malaysian retailer. Last week: 1,000 visits, 80 orders, RM400 ad spend. This week: 2,000 visits, 100 orders, RM800 ad spend. Your manager wants to double the budget again.', deliverable:'Write a short recommendation: compare conversion and cost per order, explain one limitation, and propose a next test.', checks:['I calculated both conversion rates and cost per order.','I separated more orders from better efficiency.','I stated a limitation and a measurable next test.'], sample:'Conversion fell from 8% to 5%. Cost per order rose from RM5 to RM8. Orders increased 25%, but spending doubled. Pause a blanket increase; compare channel quality and profit per order before running a small controlled test. These two weeks alone cannot establish causation.'},
    {id:'service', label:'People & experience', title:'Turn a frustrated customer into a clear next step.', duration:'10 min', brief:'A fictional customer paid RM120 for a delivery due yesterday. Tracking has not updated. They need it for an event tomorrow. You may check with logistics or request a refund review, but cannot guarantee either outcome.', deliverable:'Draft a reply under 150 words that acknowledges the problem, offers realistic choices, and promises a specific follow-up you can control.', checks:['I acknowledged the specific inconvenience without blaming anyone.','I offered options without inventing a guarantee.','I gave a clear follow-up time and next action.'], sample:'I am sorry your order has not arrived before your event. I can check urgently with logistics or request a refund review if the timing no longer works. I cannot confirm delivery for tomorrow yet. Please share your order number through our secure support channel; I will update you by 3 pm today, even if the investigation is still open.'},
    {id:'green', label:'Operations & sustainability', title:'Make a small workplace change worth measuring.', duration:'15 min', brief:'A fictional 20-person office discards about 100 disposable cups per workday. You have RM300 for a two-week pilot. Staff say washing mugs is inconvenient. No reliable water or energy measurements are available.', deliverable:'Propose one achievable pilot: budget, staff participation, a baseline, and a success measure. Explain what you cannot claim yet.', checks:['My pilot fits the RM300 budget and addresses staff inconvenience.','I defined a baseline and a measurable two-week target.','I avoided unsupported carbon savings and described a trade-off.'], sample:'Use RM200 for shared mugs and RM100 for cleaning supplies and reminders. Agree a fair cleaning routine first. Count disposable cups for three baseline days, then daily during the pilot. Aim for 30% fewer cups per attendee-day; collect staff feedback. Track cleaning effort. Do not claim net carbon savings without lifecycle, water and energy evidence.'}
  ];
  function feedback(text, checks) {
    if (!String(text || '').trim()) return {ready:false, message:'Write a first draft before reviewing it. A few clear sentences are enough.'};
    const count = checks.filter(Boolean).length;
    return {ready:count === 3, message:count === 3 ? 'Your self-review is complete. Compare with the sample, revise your reasoning, then download your draft.' : `${count} of 3 self-checks marked. Revisit the remaining prompts before you call this draft ready.`};
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {tasks, feedback};
  if (!root.document) return;
  let dialog, opener, active = 0;
  const drafts = tasks.map(() => ({text:'', checks:[false,false,false]}));
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function remember() {
    const field = dialog?.querySelector('textarea');
    if(field) drafts[active] = {text:field.value, checks:[...dialog.querySelectorAll('[data-check]')].map(el=>el.checked)};
  }
  function render() {
    const task=tasks[active], draft=drafts[active];
    dialog.innerHTML=`<div class="practice-shell"><header><div><span class="practice-kicker">CAREER TRYOUT · ${task.duration}</span><p>Try the work before choosing the title.</p></div><button type="button" data-close aria-label="Close career tryout">✕</button></header>
      <nav aria-label="Choose a practice task">${tasks.map((t,i)=>`<button type="button" data-task="${i}" aria-pressed="${i===active}">${t.label}</button>`).join('')}</nav>
      <div class="practice-columns"><section class="practice-brief"><span class="practice-step">01 / YOUR BRIEF</span><h2 id="practice-title">${task.title}</h2><p>${task.brief}</p><div class="practice-deliverable"><strong>Your deliverable</strong><p>${task.deliverable}</p></div><p class="practice-disclaimer">Fictional practice · Self-review, not a verified assessment. Nothing is sent to employers. Drafts stay in this page until you refresh.</p></section>
      <section class="practice-work"><label for="practice-draft" class="practice-step">02 / MAKE YOUR FIRST DRAFT</label><textarea id="practice-draft" maxlength="6000" placeholder="What would you do, and why?">${escape(draft.text)}</textarea><small id="practice-count">${draft.text.length} / 6000 characters</small><fieldset><legend>03 / CHECK YOUR REASONING</legend>${task.checks.map((c,i)=>`<label><input type="checkbox" data-check="${i}" ${draft.checks[i]?'checked':''}> <span>${c}</span></label>`).join('')}</fieldset><p class="practice-feedback" role="status" id="practice-feedback">A useful draft explains your reasoning, not just your answer.</p><details><summary>Compare with one possible approach</summary><p>${task.sample}</p><p>Different answers can be valid. Explain your assumptions and trade-offs.</p></details><footer><button type="button" data-review>Review my draft</button><button type="button" data-download>Download draft ↓</button></footer></section></div></div>`;
  }
  function open() {
    opener=document.activeElement;
    if(!dialog) {
      dialog=document.createElement('dialog'); dialog.className='career-practice'; dialog.setAttribute('aria-labelledby','practice-title'); document.body.append(dialog);
      dialog.addEventListener('close',()=>{remember();opener?.focus();});
      dialog.addEventListener('input',e=>{if(e.target.matches('textarea'))dialog.querySelector('#practice-count').textContent=`${e.target.value.length} / 6000 characters`;});
      dialog.addEventListener('click',e=>{
        const button=e.target.closest('button'); if(!button)return;
        if(button.hasAttribute('data-close')){remember();dialog.close();return;}
        if(button.hasAttribute('data-task')){remember();active=Number(button.dataset.task);render();dialog.querySelector(`[data-task="${active}"]`).focus();return;}
        remember();const result=feedback(drafts[active].text,drafts[active].checks);
        dialog.querySelector('#practice-feedback').textContent=result.message;
        if(button.hasAttribute('data-download') && drafts[active].text.trim()){
          const t=tasks[active],d=drafts[active];
          const content=`# CareerLens practice draft: ${t.title}\n\nFictional exercise. Self-reviewed; not independently assessed or certified.\n\n## Brief\n${t.brief}\n\n## My response\n${d.text}\n\n## My self-check\n${t.checks.map((c,i)=>`- [${d.checks[i]?'x':' '}] ${c}`).join('\n')}\n`;
          const url=URL.createObjectURL(new Blob([content],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`careerlens-${t.id}-draft.md`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
          dialog.querySelector('#practice-feedback').textContent='Download requested. Keep the draft as a practice sample; it is not a certificate.';
        }
      });
    }
    render();dialog.showModal();dialog.querySelector('[data-task]').focus();
  }
  document.addEventListener('click',e=>{if(e.target.closest('[data-career-practice]'))open();});
})(typeof window !== 'undefined' ? window : globalThis);
