/* Named recipients are existing accounts; creating a grant sends no message. */
let namedShares = [], namedShareBusy = false;
async function loadNamedShares() {
  const r = await api('/api/cv/shares');
  if (!r.ok) throw new Error(r.data.message || 'Could not load recipient access.');
  namedShares = r.data.shares || [];
  namedSharesList.innerHTML = namedShares.length ? namedShares.map((s, i) => `
    <div class="rounded-xl border border-slate-200 p-3 space-y-2 text-xs">
      <b data-no-translate>${esc(s.recipient_name)}</b><p data-no-translate>${esc(s.recipient_email)}</p>
      <p>${s.share_summary ? 'Summary' : ''}${s.share_summary && s.share_pdf ? ' + ' : ''}${s.share_pdf ? 'Original PDF' : ''} · Expires ${esc(new Date(s.expires_at).toLocaleString())}</p>
      <label class="label">Recipient-only link<input readonly class="input !text-xs" value="${esc(location.origin + s.url)}" onclick="this.select()" aria-label="Recipient-only share link"></label>
      <button onclick="revokeNamedShare(${i})" class="btn btn-danger !text-xs !py-1.5">Revoke access</button>
    </div>`).join('') : '<p class="text-xs text-slate-500">No active recipient shares.</p>';
  receivedSharesList.innerHTML = (r.data.received || []).map(s => `<p class="text-xs"><a class="text-indigo-700 underline" href="${esc(s.url)}">View CV shared by ${esc(s.owner_name)}</a></p>`).join('');
  namedShareEvents.innerHTML = (r.data.events || []).slice(0, 10).map(e => `<p class="text-[11px] text-slate-500">${esc(e.recipient_name)} accessed ${esc(e.resource)} · ${esc(new Date(e.viewed_at).toLocaleString())}</p>`).join('');
}

async function createNamedShare() {
  if (namedShareBusy || profileBusy || uploadBusy) return;
  if (!isReviewed() || profileDirty) return toast('Save your reviewed profile before sharing.', 'err');
  if (!nRecipient.checkValidity() || !nRecipient.value.trim()) { nRecipient.reportValidity(); return; }
  if (!nSummary.checked && !nPdf.checked) return toast('Choose the content to share.', 'err');
  namedShareBusy = true; namedShareBtn.disabled = true;
  try {
    const r = await postJson('/api/cv/shares', {
      recipient_email: nRecipient.value.trim(), share_summary: nSummary.checked, share_pdf: nPdf.checked,
      expires_in_days: Number(nExpiry.value), expected_file_sha256: cvRecord.file_sha256,
    });
    if (!r.ok || !r.data.ok) throw new Error(r.data.message || 'Could not create share.');
    toast(r.data.message); nSummary.checked = false; nPdf.checked = false;
    await loadNamedShares();
  } catch (error) { toast(error.message, 'err'); }
  finally { namedShareBusy = false; namedShareBtn.disabled = false; }
}

async function revokeNamedShare(index) {
  const share = namedShares[index];
  if (!share || namedShareBusy) return;
  namedShareBusy = true;
  try {
    const r = await api('/api/cv/shares/' + encodeURIComponent(share.grant_id), { method: 'DELETE' });
    if (!r.ok) throw new Error(r.data.message || 'Could not revoke access.');
    await loadNamedShares(); toast('Recipient access revoked.');
  } catch (error) { toast(error.message, 'err'); }
  finally { namedShareBusy = false; }
}
