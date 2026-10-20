let questionnaireCatalog = null;
let questionnaireStep = 'basics';
let questionnaireBusy = false;
let questionnaireRequest = null;
let questionnaireContext = '';

const ansKey = () => `cl_answers_${user ? user.unique_uid : 'guest'}`;
const questionBundleKey = () => `${ansKey()}_questions_v3`;

function questionnaireFieldDefinitions() {
  const common = new Map(COMMON_Q.map(q => [q.id, q]));
  return [common.get('c1'), {id: 'cField', text: 'Preferred field / industry'},
    {...common.get('c2'), text: 'Preferred role'}, common.get('c3'),
    {id: 'cState', text: 'Preferred state / federal territory'},
    {...common.get('c4'), text: 'Preferred district / area'},
    ...(answers.c4 === 'Other area' ? [{id: 'cAreaOther', text: 'Enter your preferred area', type: 'text'}] : []),
    {id: 'cMode', text: 'Preferred work arrangement'}, common.get('c5'), common.get('c6'),
    {...common.get('c7'), text: 'Preferred working style'},
    {...common.get('c8'), text: 'Your goal for the next 3–5 years'}];
}

function questionnaireOptions(id) {
  if (!questionnaireCatalog) return [];
  if (id === 'cField') return Object.keys(questionnaireCatalog.roles);
  if (id === 'c2') return questionnaireCatalog.roles[answers.cField] || [];
  if (id === 'cState') return Object.keys(questionnaireCatalog.regions);
  if (id === 'c4') return [...new Set([...(questionnaireCatalog.regions[answers.cState] || []), ...(answers.cState ? ['Other area'] : [])])];
  return questionnaireCatalog.choices[id] || [];
}

function persistQuestionnaireAnswers() {
  try { localStorage.setItem(ansKey(), JSON.stringify(answers)); }
  catch (_) { document.getElementById('qProgText').textContent = 'Your browser could not save this draft. Keep this page open.'; }
}

function questionnaireFingerprint() {
  return JSON.stringify({provider: questionnaireCatalog?.provider || 'local', cv: cvRecord ? [cvRecord.file_sha256, cvRecord.updated_at, cvRecord.structured_cv] : null,
    basics: questionnaireFieldDefinitions().map(q => [q.id, answers[q.id] || ''])});
}

async function loadQuestionnaireCatalog() {
  const response = await api('/api/questionnaire/catalog');
  if (!response.ok || !response.data.roles || !response.data.regions) {
    document.getElementById('commonQ').textContent = 'Could not load the questionnaire. Please refresh and retry.';
    return;
  }
  questionnaireCatalog = response.data;
  const local = response.data.provider !== 'gemini';
  document.getElementById('questionnaireExternalConsentLabel')?.classList.toggle('hidden', local);
  document.getElementById('questionnaireProviderDescription').textContent = local
    ? 'Questions are tailored to your CV skills, target role and basic answers.'
    : 'Your CV summary and basic answers are sent to Google Gemini when you press Generate.';
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) answers = {};
  const cvField = cvRecord?.structured_cv?.industry;
  if (!answers.cField && response.data.roles[cvField]) answers.cField = cvField;
  questionnaireFieldDefinitions().forEach(q => {
    if (q.type !== 'text' && answers[q.id] && !questionnaireOptions(q.id).includes(answers[q.id])) delete answers[q.id];
  });
  try {
    const saved = JSON.parse(localStorage.getItem(questionBundleKey()) || 'null');
    if (saved && saved.context === questionnaireFingerprint() && Array.isArray(saved.questions)) {
      aiQuestions = saved.questions;
      questionnaireContext = saved.context;
    }
  } catch (_) {}
  persistQuestionnaireAnswers();
  renderQuestionnaire();
}

function answeredCount() {
  const basics = questionnaireFieldDefinitions().filter(q => q.type === 'text'
    ? String(answers[q.id] || '').trim().length >= 2 : questionnaireOptions(q.id).includes(answers[q.id])).length;
  return basics + aiQuestions.filter((q, index) => String(answers['ai' + index] || '').trim()).length;
}

function setAnswer(id, value) {
  answers[id] = value;
  if (!id.startsWith('ai')) {
    questionnaireContext = '';
    aiQuestions = [];
    Object.keys(answers).filter(key => /^ai\d+$/.test(key)).forEach(key => delete answers[key]);
    try { localStorage.removeItem(questionBundleKey()); } catch (_) {}
    if (id === 'cField') { delete answers.c2; document.getElementById('roleRecommendations').replaceChildren(); }
    if (id === 'cState') { delete answers.c4; delete answers.cAreaOther; }
    if (['cField', 'cState', 'c4'].includes(id)) {
      renderQuestionnaire();
      document.getElementById('question-' + id)?.focus();
    }
  }
  persistQuestionnaireAnswers();
  document.getElementById('questionnaireSavedStatus').textContent = '';
  updateQProgress();
}

function updateQProgress() {
  const total = questionnaireFieldDefinitions().length + (aiQuestions.length || 4);
  const done = answeredCount(), pct = Math.min(100, Math.round(100 * done / total));
  document.getElementById('qRing').style.setProperty('--p', pct);
  document.querySelector('#qRing span').textContent = pct + '%';
  document.getElementById('qProgText').textContent = `${done} of ${total} answered · draft saved on this device`;
  document.getElementById('qBar').style.width = pct + '%';
}

function renderQuestionnaire() {
  if (!questionnaireCatalog) return;
  if (questionnaireContext && questionnaireContext !== questionnaireFingerprint()) {
    aiQuestions = [];
    questionnaireContext = '';
    document.getElementById('questionnaireAIStatus').textContent = 'Your CV or basic information changed. Generate fresh questions to continue.';
  }
  const recommendationPanel = document.getElementById('roleRecommendationPanel');
  recommendationPanel.remove();
  document.getElementById('commonQ').innerHTML = questionnaireFieldDefinitions().map((q, i) => {
    const value = answers[q.id] || '';
    const disabled = (q.id === 'c2' && !answers.cField) || (q.id === 'c4' && !answers.cState);
    const field = q.type === 'text'
      ? `<input id="question-${q.id}" name="${q.id}" type="text" minlength="2" maxlength="100" required class="input" value="${esc(value)}" oninput="setAnswer('${q.id}',this.value)" />`
      : `<select id="question-${q.id}" name="${q.id}" class="input" required ${disabled ? 'disabled' : ''} onchange="setAnswer('${q.id}',this.value)"><option value="">${disabled ? 'Choose the field above first' : 'Select…'}</option>${questionnaireOptions(q.id).map(option => `<option value="${esc(option)}" ${option === value ? 'selected' : ''}>${esc(option)}</option>`).join('')}</select>`;
    return `<div><label class="label" for="question-${q.id}">${i + 1}. ${esc(q.text)} <span aria-hidden="true">*</span></label>${field}</div>`;
  }).join('');
  document.getElementById('question-c2').parentElement.append(recommendationPanel);
  renderPersonalQuestions();
  updateQProgress();
  scheduleRoleRecommendation();
}

function renderPersonalQuestions() {
  document.getElementById('aiQ').innerHTML = aiQuestions.map((q, index) => `<div><label class="label" for="question-ai${index}"><span class="chip chip-pink">${esc(q.skill_tested)}</span> ${esc(q.question)}</label><textarea id="question-ai${index}" rows="4" class="input" required minlength="10" maxlength="4000" oninput="setAnswer('ai${index}',this.value)">${esc(answers['ai' + index] || '')}</textarea></div>`).join('');
  document.getElementById('completeQuestionnaireButton').classList.toggle('hidden', !aiQuestions.length);
}

function continueQuestionnaire() {
  if (!questionnaireCatalog) return;
  const form = document.getElementById('questionnaireBasics');
  if (!form.reportValidity()) return;
  if (!answers.cField || !answers.c2 || !answers.cState || !answers.c4) return;
  questionnaireStep = 'personal';
  form.classList.add('hidden');
  document.getElementById('questionnairePersonal').classList.remove('hidden');
  document.getElementById('personalQuestionsTitle').focus();
  document.getElementById('questionnairePersonal').scrollIntoView({block: 'start'});
}

function backToQuestionnaireBasics() {
  questionnaireRequest?.abort();
  questionnaireStep = 'basics';
  document.getElementById('questionnairePersonal').classList.add('hidden');
  document.getElementById('questionnaireBasics').classList.remove('hidden');
  document.getElementById('question-c1')?.focus();
}

async function requestQuestionnaireAI(action, button, status) {
  if (questionnaireBusy) return null;
  if (questionnaireCatalog?.provider === 'gemini' && !document.getElementById('questionnaireExternalConsent')?.checked) { status.textContent = 'Choose whether to allow Google Gemini processing above first.'; return null; }
  if (!cvRecord) { status.textContent = 'Upload your PDF CV in Profile & Skills first.'; return null; }
  if (!answers.cField) { status.textContent = 'Choose your field first.'; document.getElementById('question-cField')?.focus(); return null; }
  questionnaireBusy = true;
  questionnaireRequest = new AbortController();
  button.disabled = true;
  status.className = 'questionnaire-loading';
  status.setAttribute('aria-busy', 'true');
  status.textContent = 'Reading your CV and preparing a response…';
  const started = Date.now();
  const ticker = setInterval(() => {
    const seconds = Math.round((Date.now() - started) / 1000);
    status.textContent = seconds >= 15 ? `Still working on your CV (${seconds}s). You can go back; your draft is saved.` : `Preparing a response… ${seconds}s`;
  }, 1000);
  const timeout = setTimeout(() => questionnaireRequest?.abort(), 70000);
  try {
    const response = await fetch('/api/questionnaire/' + action, {method: 'POST', signal: questionnaireRequest.signal,
      headers: {'Content-Type': 'application/json'}, body: JSON.stringify({external_ai_consent: document.getElementById('questionnaireExternalConsent')?.checked === true, field: answers.cField, answers,
        language: window.careerLensLocale?.getLanguage() || 'en'})});
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.message || 'AI is unavailable. Please retry.');
    status.textContent = data.mode === 'local' ? '' : ('Ready · Generated by ' + data.provider);
    return data;
  } catch (error) {
    status.textContent = error.name === 'AbortError' ? 'Request stopped or timed out. Your draft is saved. Please retry.' : error.message;
    return null;
  } finally {
    clearInterval(ticker); clearTimeout(timeout);
    questionnaireBusy = false;
    questionnaireRequest = null;
    button.disabled = false;
    status.classList.remove('questionnaire-loading');
    status.setAttribute('aria-busy', 'false');
  }
}

let roleRecommendationTimer;
let roleRecommendationController;
let roleRecommendationKey = '';
let roleRecommendationResult = null;

function roleRecommendationFingerprint() {
  return JSON.stringify([answers.cField, cvRecord?.file_sha256, cvRecord?.updated_at, cvRecord?.structured_cv,
    questionnaireCatalog?.provider, window.careerLensLocale?.getLanguage() || 'en']);
}

function scheduleRoleRecommendation() {
  if (!questionnaireCatalog || current !== 'quest') return;
  clearTimeout(roleRecommendationTimer);
  if (questionnaireCatalog?.provider === 'gemini' && !document.getElementById('questionnaireExternalConsent')?.checked) { roleRecommendationController?.abort(); roleRecommendationKey = ''; document.getElementById('roleRecommendationStatus').textContent = 'Google processing is off. Choose a role yourself or allow processing above.'; return; }
  const status = document.getElementById('roleRecommendationStatus');
  if (!cvRecord || !answers.cField) {
    roleRecommendationController?.abort();
    roleRecommendationKey = '';
    roleRecommendationResult = null;
    document.getElementById('roleRecommendations').replaceChildren();
    status.textContent = !cvRecord ? 'Upload your CV to receive a role suggestion.' : 'Choose a field to see your suggested role.';
    return;
  }
  const key = roleRecommendationFingerprint();
  if (key === roleRecommendationKey) {
    if (roleRecommendationResult) renderRoleSuggestion(roleRecommendationResult);
    return;
  }
  roleRecommendationController?.abort();
  document.getElementById('roleRecommendations').replaceChildren();
  status.textContent = 'Finding your best matching role…';
  roleRecommendationTimer = setTimeout(() => recommendQuestionnaireRoles(key), 250);
}

async function recommendQuestionnaireRoles(key = roleRecommendationFingerprint()) {
  roleRecommendationController?.abort();
  const controller = new AbortController();
  roleRecommendationController = controller;
  roleRecommendationKey = key;
  roleRecommendationResult = null;
  const status = document.getElementById('roleRecommendationStatus');
  status.setAttribute('aria-busy', 'true');
  const timeout = setTimeout(() => controller.abort(), 65000);
  try {
    const response = await fetch('/api/questionnaire/recommendations', {method: 'POST', signal: controller.signal,
      headers: {'Content-Type': 'application/json'}, body: JSON.stringify({external_ai_consent: document.getElementById('questionnaireExternalConsent')?.checked === true, field: answers.cField,
        language: window.careerLensLocale?.getLanguage() || 'en'})});
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.message || 'Suggestion unavailable.');
    if (key !== roleRecommendationFingerprint() || controller !== roleRecommendationController) return;
    roleRecommendationResult = data.recommendations[0] || null;
    status.textContent = roleRecommendationResult ? '' : 'No suitable role found in this field.';
    if (roleRecommendationResult) renderRoleSuggestion(roleRecommendationResult);
  } catch (error) {
    if (key !== roleRecommendationFingerprint() || controller !== roleRecommendationController) return;
    roleRecommendationKey = '';
    status.textContent = 'Suggestion unavailable. You can still choose your role. ';
    const retry = document.createElement('button'); retry.type = 'button'; retry.className = 'role-suggestion-retry'; retry.textContent = 'Retry';
    retry.addEventListener('click', scheduleRoleRecommendation); status.append(retry);
  } finally {
    clearTimeout(timeout);
    if (controller === roleRecommendationController) status.setAttribute('aria-busy', 'false');
  }
}

function renderRoleSuggestion(item) {
  const container = document.getElementById('roleRecommendations');
  container.replaceChildren();
  const locale = window.careerLensLocale?.getLanguage() || 'en';
  const copy = {en: ['Suggested', 'skill coverage', 'Use', 'Selected', 'Why this role?', 'Limited evidence'],
    ms: ['Cadangan', 'liputan kemahiran', 'Pilih', 'Dipilih', 'Mengapa jawatan ini?', 'Bukti terhad'],
    zh: ['推荐', '技能覆盖', '采用', '已选', '推荐依据', '依据不足']}[locale] || ['Suggested', 'skill coverage', 'Use', 'Selected', 'Why this role?', 'Limited evidence'];
  const pct = Number.isFinite(item.skill_coverage_pct) ? item.skill_coverage_pct : null;
  const level = pct === null ? 'partial' : pct >= 75 ? 'strong' : pct >= 50 ? 'partial' : 'limited';
  const card = document.createElement('div'); card.className = 'role-suggestion role-recommendation--' + level;
  const row = document.createElement('div'); row.className = 'role-suggestion-row';
  const label = document.createElement('span'); label.className = 'role-suggestion-label'; label.textContent = (pct === 0 ? copy[5] : copy[0]) + ': ';
  const title = document.createElement('strong'); title.textContent = item.role; label.append(title);
  row.append(label);
  if (pct !== null) {
    const score = document.createElement('span'); score.className = 'role-suggestion-percent'; score.textContent = pct + '%';
    score.title = `${copy[1]}: ${item.matched_skills.length}/${item.skills_total}`;
    score.setAttribute('aria-label', `${pct}% ${copy[1]}`); row.append(score);
  }
  const use = document.createElement('button'); use.type = 'button'; use.className = 'role-suggestion-use';
  use.textContent = answers.c2 === item.role ? copy[3] : copy[2]; use.disabled = answers.c2 === item.role;
  use.addEventListener('click', () => { setAnswer('c2', item.role); renderQuestionnaire(); document.getElementById('question-c2').focus(); });
  row.append(use);
  const details = document.createElement('details'); details.className = 'role-suggestion-details';
  const summary = document.createElement('summary'); summary.textContent = copy[4];
  const reason = document.createElement('p'); reason.textContent = item.reason;
  details.append(summary, reason); card.append(row, details); container.append(card);
}

async function generateQuestionnaireQuestions() {
  const context = questionnaireFingerprint();
  const status = document.getElementById('questionnaireAIStatus');
  const data = await requestQuestionnaireAI('questions', document.getElementById('generateQuestionsButton'), status);
  if (!data || context !== questionnaireFingerprint()) return;
  aiQuestions = data.questions;
  Object.keys(answers).filter(key => /^ai\d+$/.test(key)).forEach(key => delete answers[key]);
  questionnaireContext = context;
  try { localStorage.setItem(questionBundleKey(), JSON.stringify({context, questions: aiQuestions})); } catch (_) {}
  persistQuestionnaireAnswers();
  renderPersonalQuestions(); updateQProgress();
  document.getElementById('generateQuestionsButton').textContent = 'Regenerate questions';
}

function completeQuestionnaire() {
  if (!aiQuestions.length || !document.getElementById('questionnaireAIForm').reportValidity()) return;
  if (aiQuestions.some((q, index) => String(answers['ai' + index] || '').trim().length < 10)) {
    document.getElementById('questionnaireSavedStatus').textContent = 'Please enter at least 10 characters for every answer.';
    return;
  }
  persistQuestionnaireAnswers();
  document.getElementById('questionnaireSavedStatus').textContent = 'Questionnaire saved on this device. You can return to edit it at any time.';
}
