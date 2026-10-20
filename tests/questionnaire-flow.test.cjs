const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const catalog = JSON.parse(fs.readFileSync('src/data/questionnaire_catalog.json', 'utf8'));
const source = fs.readFileSync('src/static/js/questionnaire.js', 'utf8');

function setup() {
  const elements = new Map();
  const element = id => {
    if (!elements.has(id)) elements.set(id, {textContent: '', hidden: true, disabled: false,
      classList: {add() {}, remove() {}, toggle() {}}, setAttribute() {}, focus() {},
      reportValidity() { return false; }});
    return elements.get(id);
  };
  const ctx = vm.createContext({console, setTimeout, clearTimeout, setInterval, clearInterval,
    AbortController, Date, user: {unique_uid: 'test-user'}, cvRecord: {structured_cv: {skills: ['Excel']}},
    aiQuestions: [], answers: {}, COMMON_Q: Array.from({length: 8}, (_, i) => ({id: 'c' + (i + 1), text: 'Question'})),
    document: {getElementById: element}, localStorage: {setItem() {}, removeItem() {}}, window: {}});
  vm.runInContext(source, ctx);
  ctx.data = catalog;
  vm.runInContext('questionnaireCatalog = data', ctx);
  return {ctx, element, run: code => vm.runInContext(code, ctx)};
}

test('role and area options follow selected field and state', () => {
  const {run} = setup();
  run("answers.cField='Finance & Accounting'; answers.cState='Selangor'");
  assert.ok(run("questionnaireOptions('c2').includes('Accountant')"));
  assert.equal(run("questionnaireOptions('c2').includes('Software Engineer')"), false);
  assert.ok(run("questionnaireOptions('c4').includes('Petaling')"));
  assert.equal(run("questionnaireOptions('c4').includes('Kuching')"), false);
});

test('blank required basics prevent entering the personalised view', () => {
  const {run, element} = setup();
  run('continueQuestionnaire()');
  assert.equal(run('questionnaireStep'), 'basics');
  assert.equal(element('questionnairePersonal').hidden, true);
});

test('AI waits visibly and restores the retry button after provider failure', async () => {
  const {ctx, run, element} = setup();
  run("answers.cField='Finance & Accounting'");
  let finish;
  ctx.fetch = () => new Promise(resolve => { finish = resolve; });
  const pending = run("requestQuestionnaireAI('recommendations', document.getElementById('testButton'), document.getElementById('testStatus'))");
  assert.equal(element('testButton').disabled, true);
  assert.match(element('testStatus').textContent, /preparing/);
  finish({ok: false, json: async () => ({message: 'Temporary AI outage'})});
  assert.equal(await pending, null);
  assert.equal(element('testButton').disabled, false);
  assert.equal(element('testStatus').textContent, 'Temporary AI outage');
});

test('missing CV prevents API transmission', async () => {
  const {ctx, run, element} = setup();
  ctx.cvRecord = null;
  ctx.fetch = () => { throw new Error('Must not call provider'); };
  const result = await run("requestQuestionnaireAI('questions', document.getElementById('testButton'), document.getElementById('testStatus'))");
  assert.equal(result, null);
  assert.match(element('testStatus').textContent, /Upload your PDF CV/);
});
