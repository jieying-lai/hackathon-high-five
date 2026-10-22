/* Milestone ledger UI. Pledges and recorded transfers are displayed separately. */
window.LearningImpact=(()=>{
  const accounts=new Map();let activeIdentity=null,view=null;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=cents=>'USD '+(Number(cents||0)/100).toFixed(2);
  function account(identity){if(!accounts.has(identity))accounts.set(identity,{data:null,error:null,pending:false,busy:false});return accounts.get(identity);}
  function initialize({identity}){activeIdentity=identity;sync(identity);}
  async function sync(identity){
    if(!identity||identity!==activeIdentity)return;
    const state=account(identity);state.pending=true;if(state.busy)return;
    state.busy=true;state.error=null;paint();
    while(state.pending){
      state.pending=false;
      try{
        const urls=(window.LearningPath?.completedCourses(identity)||[]).map(c=>c.url);
        const response=await fetch('/api/learning-impact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({completed_urls:urls})});
        const data=await response.json();if(!response.ok||!data.ok)throw new Error();
        state.data=data;state.error=null;
        if(identity===activeIdentity&&data.newly_earned?.length&&typeof toast==='function')toast(window.careerLensLocale?.translate('Learning badge unlocked! View your milestones in Completed Learning.')||'Learning badge unlocked! View your milestones in Completed Learning.');
      }catch{state.error='Could not sync learning milestones. Please retry.';}
    }
    state.busy=false;paint();
  }
  function render(options){view=options;paint();}
  function paint(){
    if(!view||!view.container?.isConnected||view.identity!==activeIdentity)return;
    const {identity,container,locale}=view,state=account(identity),data=state.data,tr=s=>locale?.translate(s)||s;
    if(!data){
      container.innerHTML=`<section class="learning-impact"><h2>${esc(tr('Learning milestones'))}</h2><p role="status">${esc(tr(state.error||'Syncing your learning milestones…'))}</p>${state.error?`<button type="button" class="btn btn-soft" data-impact-retry>${esc(tr('Retry'))}</button>`:''}<div class="impact-bank"><div class="impact-piggy"><img src="/static/illustrations/learning-piggy-empty.png" width="1254" height="1254" alt="${esc(tr('A little piggy bank for shared kindness'))}"><div><span>${esc(tr('Your unlocked pledge'))}</span><strong>—</strong><p>${esc(tr('Funded by CareerLens, not charged to you.'))}</p></div></div></div></section>`;
      container.querySelector('[data-impact-retry]')?.addEventListener('click',()=>sync(identity));return;
    }
    const earned=new Set(data.earned.map(b=>b.target)),count=data.lifetime_completed,next=data.milestones.find(target=>!earned.has(target));
    const piggyImage=Number(data.company_pending_cents)>0?'learning-piggy-full.png':'learning-piggy-empty.png';
    const date=value=>value?new Date(value+'T12:00:00').toLocaleDateString():tr('To be announced');
    const pledge=money(data.pledge_per_badge_cents);
    container.innerHTML=`<section class="learning-impact" aria-label="Learning milestones and company giving"><div class="impact-heading"><div><span class="discovery-eyebrow">✦ ${esc(tr('Small steps, shared kindness'))}</span><h2>${esc(tr('Learn. Earn a badge. Make a little difference.'))}</h2><p>${esc(tr('Complete 10, 20, 30, 40 and 50 courses to collect five milestone badges.'))}</p></div><span class="impact-pledge-chip">${esc(tr('1 badge = USD 0.10 company pledge'))}</span></div>
      <div class="impact-badges" role="list">${data.milestones.map((target,i)=>`<article class="impact-badge ${earned.has(target)?'is-earned':'is-locked'}" role="listitem"><span class="impact-badge-art" style="--badge-x:${i*25}%" role="img" aria-label="${target} ${esc(tr('Completed courses'))}"></span><strong>${target} ${esc(tr('Completed courses'))}</strong><span class="impact-badge-status">${earned.has(target)?'✓ '+esc(tr('Earned'))+' · '+esc(pledge):esc(tr('Not yet earned'))}</span><progress max="${target}" value="${Math.min(count,target)}" aria-label="${target} ${esc(tr('Completed courses'))}"></progress><span class="impact-badge-count" data-no-translate>${Math.min(count,target)} / ${target}</span></article>`).join('')}</div>
      <p class="impact-next">${next?esc(tr('Next milestone'))+': '+next+' · '+Math.max(0,next-count)+' '+esc(tr('more courses to go')):esc(tr('You have collected all five learning badges!'))}</p>
      <div class="impact-bank"><div class="impact-piggy"><img src="/static/illustrations/${piggyImage}" width="1254" height="1254" alt="${esc(tr('A little piggy bank for shared kindness'))}"><div><span>${esc(tr('Your unlocked pledge'))}</span><strong data-no-translate>${money(data.personal_pledged_cents)}</strong><p>${esc(tr('Funded by CareerLens, not charged to you.'))}</p></div></div><div class="impact-bank-details"><h3>${esc(tr('Our kindness piggy bank'))}</h3><p>${esc(tr('For every milestone badge earned, CareerLens pledges USD 0.10 towards hunger relief.'))}</p><div class="impact-totals"><div><span>${esc(tr('All users’ accumulated pledges'))}</span><strong data-no-translate>${money(data.company_pledged_cents)}</strong></div><div><span>${esc(tr('Awaiting transfer'))}</span><strong data-no-translate>${money(data.company_pending_cents)}</strong></div><div><span>${esc(tr('Recorded as sent'))}</span><strong data-no-translate>${money(data.company_sent_cents)}</strong></div></div><dl class="impact-schedule"><div><dt>${esc(tr('Next transfer'))}</dt><dd>${esc(date(data.schedule.next_transfer_date))}</dd></div><div><dt>${esc(tr('Recipient'))}</dt><dd>${data.schedule.recipient_url?`<a href="${esc(data.schedule.recipient_url)}" target="_blank" rel="noopener">${esc(data.schedule.recipient)} ↗</a>`:esc(data.schedule.recipient||tr('To be announced'))}</dd></div></dl><p class="impact-ledger-note">${esc(tr('This shared total combines all registered users on this platform. Transfers are recorded after receipt confirmation.'))}</p><p class="impact-community"><span data-no-translate>${data.registered_users}</span> ${esc(tr('registered users'))} · <span data-no-translate>${data.badge_contributors}</span> ${esc(tr('badge contributors'))}</p>${data.demo?`<p class="impact-demo">${esc(tr('Includes a USD 5 demo opening balance.'))} ${esc(tr('Demo campaign: these are demonstration pledges. No money is transferred automatically.'))}</p>`:''}</div></div>
      <details class="impact-transparency"><summary>${esc(tr('Donation plans & transparency'))}</summary><p>${esc(tr('Milestones use self-reported, unique completed courses. Each badge is awarded once per account and remains earned.'))}</p><p>${esc(tr('Selected recipient: WFP. Transfer dates are awaiting confirmation. Listing a recipient does not imply a formal partnership.'))}</p><div class="impact-recipient-links">${data.schedule.suggested_organisations.map(org=>`<a href="${esc(org.url)}" target="_blank" rel="noopener">${esc(org.name)} ↗</a>`).join('')}</div><h4>${esc(tr('Transfer receipts'))}</h4>${data.receipts.length?`<ul>${data.receipts.map(receipt=>`<li><a href="${esc(receipt.receipt_url)}" target="_blank" rel="noopener">${esc(date(receipt.paid_at))} · ${esc(receipt.recipient)} · ${money(receipt.amount_cents)} ↗</a></li>`).join('')}</ul>`:`<p>${esc(tr('No transfer receipts have been recorded yet.'))}</p>`}</details>
      ${state.error?`<p class="impact-error" role="status">${esc(tr(state.error))}</p><button class="btn btn-soft" type="button" data-impact-retry>${esc(tr('Retry'))}</button>`:''}</section>`;
    container.querySelector('[data-impact-retry]')?.addEventListener('click',()=>sync(identity));locale?.apply();
  }
  window.addEventListener('careerlens:learning-change',event=>{if(event.detail?.identity===activeIdentity)sync(activeIdentity);});
  return {initialize,render,sync};
})();
