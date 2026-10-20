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
  if (document.getElementById('tab-heatmap')?.classList.contains('hidden') === false) loadInvitations(true);
}, 30000);
