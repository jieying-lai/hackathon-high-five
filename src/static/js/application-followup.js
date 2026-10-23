(() => {
  const list = document.getElementById('activeSharesList');
  const modal = document.getElementById('applicationFollowupModal');
  const subject = document.getElementById('applicationFollowupSubject');
  const draft = document.getElementById('applicationFollowupDraft');
  const status = document.getElementById('applicationFollowupStatus');
  if (!list || !modal || !subject || !draft || !status) return;

  const translate = text => window.careerLensLocale?.translate(text) ?? text;
  const language = () => window.careerLensLocale?.getLanguage() || 'en';
  const copy = async value => navigator.clipboard.writeText(value);

  list.addEventListener('click', event => {
    const button = event.target.closest('[data-application-followup]');
    if (!button) return;
    const company = button.dataset.company || translate('the hiring team');
    const role = button.dataset.role || translate('the role');
    const name = document.getElementById('pName')?.value.trim() || translate('Your name');
    const locale = language() === 'zh' ? 'zh-CN' : language() === 'ms' ? 'ms-MY' : 'en-MY';
    let appliedDate = translate('recently');
    if (button.dataset.applied) {
      const parsed = new Date(button.dataset.applied);
      if (!Number.isNaN(parsed.getTime())) appliedDate = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsed);
    }

    subject.value = `${translate('Follow-up:')} ${role}`;
    draft.value = [
      `${translate('Dear')} ${company} ${translate('hiring team,')}`,
      '',
      `${translate('I hope you are well. I am following up on my application for')} ${role}.`,
      `${translate('Application submitted:')} ${appliedDate}.`,
      translate('I remain interested in the opportunity and would appreciate any update you can share about next steps.'),
      '',
      translate('Thank you for your time.'),
      '',
      translate('Kind regards,'),
      name
    ].join('\n');
    document.getElementById('applicationFollowupContext').textContent = `${company} · ${role}`;
    status.textContent = '';
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    subject.focus();
  });

  const close = () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  };
  document.getElementById('applicationFollowupClose')?.addEventListener('click', close);
  modal.addEventListener('click', event => { if (event.target === modal) close(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !modal.classList.contains('hidden')) close(); });
  document.getElementById('applicationFollowupCopy')?.addEventListener('click', async () => {
    try {
      await copy(`${subject.value}\n\n${draft.value}`);
      status.textContent = translate('Follow-up draft copied.');
    } catch (_) {
      draft.focus();
      draft.select();
      status.textContent = translate('Select and copy the highlighted draft.');
    }
  });
})();
