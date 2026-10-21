// A single click previews notifications; a double click opens the existing inbox.
(function notificationPreview(){
  function mount(){
    const buttons=[...document.querySelectorAll('[data-notification-button]')];
    if(!buttons.length)return;
    const panel=document.createElement('aside');
    panel.id='notificationPreview';panel.className='notification-preview';panel.hidden=true;
    panel.setAttribute('aria-label','Interview notifications');
    document.body.append(panel);
    let anchor=null,openInbox=null,version=0;
    const translate=()=>window.careerLensLocale?.apply();
    function close(focus=false){
      version++;panel.hidden=true;
      buttons.forEach(b=>b.setAttribute('aria-expanded','false'));
      if(focus)anchor?.focus();
    }
    function position(){
      if(!anchor)return;
      const rect=anchor.getBoundingClientRect();
      panel.style.top=Math.min(rect.bottom+10,window.innerHeight-100)+'px';
      panel.style.right=Math.max(12,window.innerWidth-rect.right)+'px';
    }
    async function preview(button,action){
      if(!panel.hidden&&anchor===button){close();return;}
      anchor=button;openInbox=action;const request=++version;
      buttons.forEach(b=>b.setAttribute('aria-expanded',String(b===button)));
      panel.hidden=false;position();
      panel.innerHTML='<h2>Interview notifications</h2><p>Loading notifications…</p>';
      translate();
      try{
        const hr=!!document.getElementById('hrInvitations');
        const result=await api(hr?'/api/hr/interviews':'/api/talent/interviews');
        if(request!==version)return;
        if(!result.ok)throw Error();
        const entries=result.data.invitations||[];
        panel.innerHTML='<h2>Interview notifications</h2><div class="notification-preview-list">'+(entries.slice(0,3).map(i=>`<div class="notification-preview-item"><strong data-no-translate>${esc(hr?i.candidate_name:i.company)}</strong><p data-no-translate>${esc(i.role)}</p><span>${esc(i.status)}</span></div>`).join('')||'<p>No interview invitations yet.</p>')+'</div><p class="notification-preview-hint">Double-click the bell to open all notifications.</p><button type="button" class="btn btn-soft">Open notifications</button>';
        panel.querySelector('button').addEventListener('click',()=>{const action=openInbox;close();action();});
      }catch{
        if(request!==version)return;
        panel.innerHTML='<h2>Interview notifications</h2><p>Could not load invitations. Please retry.</p>';
      }
      translate();
    }
    buttons.forEach(button=>{
      const original=button.onclick;
      if(!original)return;
      button.removeAttribute('onclick');
      button.setAttribute('aria-controls',panel.id);button.setAttribute('aria-expanded','false');
      const action=()=>original.call(button);
      button.addEventListener('click',event=>{if(event.detail<2)preview(button,action);});
      button.addEventListener('dblclick',()=>{close();action();});
    });
    document.addEventListener('click',event=>{if(!panel.contains(event.target)&&!event.target.closest('[data-notification-button]'))close();});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden)close(true);});
    window.addEventListener('resize',()=>close(),{passive:true});
    window.addEventListener('scroll',()=>{if(!panel.hidden)position();},{passive:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();

async function sendInterview(event) {
  event.preventDefault();
  if (!interviewPerson || !interviewForm.reportValidity()) return;
  const button = interviewForm.querySelector('[type="submit"]'); button.disabled = true;
  try {
    const result = await postJson('/api/hr/interviews', {candidate_id: interviewPerson.id, role: interviewRole.value, time: interviewTime.value, location: interviewLocation.value, message: interviewMessage.value});
    if (!result.ok) { interviewStatus.textContent = result.data.message || 'Could not update'; return; }
    const receipt = document.getElementById('latestInvitationReceipt');
    receipt.innerHTML = '<p class="font-bold" data-no-translate>'+esc(interviewPerson.name)+'</p><span>Invitation delivered to the candidate inbox.</span>';
    interviewDialog.close();
    interviewForm.reset();
    toast('Invitation saved');
    receipt.scrollIntoView?.({behavior: 'smooth', block: 'center'});
    await loadInvitations(true);
  } catch { interviewStatus.textContent = 'Could not update'; }
  finally { button.disabled = false; }
}
async function loadInvitations(hr) {
  const container = document.getElementById(hr ? 'hrInvitations' : 'talentInvitations');
  if (!container) return;
  try {
    const result = await api(hr ? '/api/hr/interviews' : '/api/talent/interviews');
    if (!result.ok) throw Error();
    container.innerHTML = result.data.invitations.map(i => `<article class="glass rounded-2xl p-4 mb-3 space-y-2"><h3 class="font-bold" data-no-translate>${esc(hr ? i.candidate_name : i.company)}</h3><p data-no-translate>${esc(i.role)} · ${esc(i.interview_time.replace('T',' '))} (UTC+8)</p><p data-no-translate>${esc(i.location)}</p><p data-no-translate>${esc(i.message)}</p><div class="flex flex-wrap items-center gap-3 pt-2"><span class="chip chip-indigo">${i.status}</span>${hr && !i.recipient_uid ? '<span class="chip">No linked account</span>' : ''}${hr ? `<button class="btn btn-danger" onclick="cancelInvitation(${i.id},this)">Cancel invitation</button>` : ''}</div>${!hr && i.status === 'Pending' ? `<div class="flex gap-3"><button class="btn btn-primary" onclick="replyInvitation(${i.id},'Accepted',this)">Accept interview</button><button class="btn btn-soft" onclick="replyInvitation(${i.id},'Declined',this)">Decline interview</button></div>` : ''}</article>`).join('') || '<p>No interview invitations yet.</p>';
  } catch { container.textContent = 'Could not load invitations. Please retry.'; }
}
async function cancelInvitation(id,button) {
  button.disabled = true;
  try {
    const r = await postJson(`/api/hr/interviews/${id}/cancel`,{});
    if (!r.ok) toast('Could not update','err');
    else { const receipt = document.getElementById('latestInvitationReceipt'); if (receipt) receipt.textContent = ''; }
    await loadInvitations(true);
  } catch { toast('Could not update','err'); }
  finally { button.disabled = false; }
}
async function replyInvitation(id,status,button) {
  button.disabled = true;
  try {
    const r = await postJson(`/api/talent/interviews/${id}/reply`,{status});
    if (!r.ok) toast('Could not update', 'err');
    await loadInvitations(false);
  } finally { button.disabled = false; }
}

// Refresh visible inboxes without interrupting forms or requiring a page reload.
setInterval(() => {
  if (document.hidden) return;
  if (document.getElementById('tab-notifications')?.classList.contains('hidden') === false) loadInvitations(false);
  if (document.getElementById('tab-shortlisting')?.classList.contains('hidden') === false) loadInvitations(true);
}, 30000);
