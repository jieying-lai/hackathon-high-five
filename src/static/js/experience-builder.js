(() => {
  const nameField = document.getElementById('experienceBuilderName');
  const typeField = document.getElementById('experienceBuilderType');
  const contributionField = document.getElementById('experienceBuilderContribution');
  const skillsField = document.getElementById('experienceBuilderSkills');
  const outcomeField = document.getElementById('experienceBuilderOutcome');
  const result = document.getElementById('experienceBuilderResult');
  const bulletField = document.getElementById('experienceBuilderBullet');
  const status = document.getElementById('experienceBuilderStatus');
  if (!nameField || !typeField || !contributionField || !bulletField || !result) return;

  document.getElementById('experienceBuilderDraft')?.addEventListener('click', () => {
    const name = nameField.value.trim();
    const contribution = contributionField.value.trim().replace(/[.\s]+$/, '');
    if (!name || !contribution) {
      status.textContent = 'Add a project name and describe what you personally did.';
      (!name ? nameField : contributionField).focus();
      return;
    }
    const skills = skillsField.value.trim();
    const outcome = outcomeField.value.trim().replace(/[.\s]+$/, '');
    const clauses = [`${name} (${typeField.value})`, contribution];
    if (skills) clauses.push(`Skills and tools: ${skills}`);
    if (outcome) clauses.push(`Outcome: ${outcome}`);
    bulletField.value = `• ${clauses.join(' — ')}`;
    result.classList.remove('hidden');
    status.textContent = 'Draft created. Check that every detail is accurate before saving.';
    bulletField.focus();
  });

  document.getElementById('experienceBuilderAdd')?.addEventListener('click', () => {
    const profileProjects = document.getElementById('pProjects');
    const bullet = bulletField.value.trim();
    if (!bullet || !profileProjects) return;
    if (profileProjects.disabled) {
      status.textContent = 'Upload a CV and create your profile before adding this to it.';
      return;
    }
    const existing = profileProjects.value.split(/\r?\n/).map(line => line.trim());
    if (existing.includes(bullet)) {
      status.textContent = 'This draft is already in Projects & achievements.';
      return;
    }
    profileProjects.value = [profileProjects.value.trim(), bullet].filter(Boolean).join('\n');
    profileProjects.dispatchEvent(new Event('input', { bubbles: true }));
    status.textContent = 'Added to Projects & achievements. Review and save your profile below.';
  });

  document.getElementById('experienceBuilderCopy')?.addEventListener('click', async () => {
    const bullet = bulletField.value.trim();
    if (!bullet) return;
    try {
      await navigator.clipboard.writeText(bullet);
      status.textContent = 'Draft copied.';
    } catch (_) {
      bulletField.focus();
      bulletField.select();
      status.textContent = 'Select and copy the highlighted draft.';
    }
  });
})();
