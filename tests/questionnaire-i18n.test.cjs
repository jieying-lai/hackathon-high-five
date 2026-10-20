const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const {translate} = require('../src/static/js/questionnaire-i18n.js');
const template = fs.readFileSync(path.join(root, 'src/templates/candidate.html'), 'utf8');
const questions = vm.runInNewContext(template.match(/const COMMON_Q = (\[[\s\S]*?\n    \]);/)[1]);

for (const language of ['zh', 'ms']) {
  test(`${language}: every actual numbered common question is translated`, () => {
    assert.equal(questions.length, 8);
    questions.forEach((question, i) => {
      const original = `${i+1}. ${question.text}`;
      const translated = translate(original, language);
      assert.notEqual(translated, original);
      assert.ok(translated.startsWith(`${i+1}. `));
      assert.equal(translate(original, 'en'), original);
    });
  });
  test(`${language}: dropdown choices and placeholder translated; currency unchanged`, () => {
    assert.notEqual(translate('Select…', language), 'Select…');
    questions.flatMap(q => q.options || []).forEach(option => {
      if (option.startsWith('RM ')) assert.equal(translate(option, language), option);
      else assert.notEqual(translate(option, language), option);
    });
  });
  test(`${language}: generated verification questions from the actual Python engine translate`, () => {
    const python = process.platform === 'win32' ? path.join(root,'.venv/Scripts/python.exe') : 'python3';
    const code = "import sys,json;sys.path.insert(0,'src');from ai_matcher import load_json,match_user_to_roles;print(json.dumps([q for p in load_json('sample_cvs.json') for q in match_user_to_roles(p)['verification_questions']]))";
    const generated = JSON.parse(execFileSync(python, ['-c', code], {cwd:root,encoding:'utf8'}));
    assert.equal(generated.length, 9);
    generated.forEach(q => {
      const localized = translate(q.question, language);
      assert.notEqual(localized, q.question);
      assert.ok(!localized.includes('Your profile lists'));
      assert.ok(!localized.includes('repetitive tasks are shifting'));
      assert.equal(translate(q.question, 'en'), q.question);
    });
  });
  test(`${language}: progress count updates in selected language`, () => {
    for (const count of [0,1,11]) {
      const result = translate(`${count} of 11 answered · saved on this device`, language);
      assert.ok(result.includes(String(count)));
      assert.ok(result.includes('11'));
      assert.ok(!result.includes('saved on this device'));
    }
  });
}

test('arbitrary user skill names are preserved inside translated question templates', () => {
  const skill = 'Custom Skill <v2>';
  const question = `Your profile lists '${skill}'. Can you describe a real project or workflow where you applied ${skill} independently to solve a bottleneck?`;
  assert.ok(translate(question, 'zh').includes(skill));
  assert.ok(translate(question, 'ms').includes(skill));
});

test('translated select labels cannot change stored values; answers are skipped by text translator', () => {
  const questionnaire = fs.readFileSync(path.join(root,'src/static/js/questionnaire.js'),'utf8');
  assert.ok(questionnaire.includes('<option value="${esc(option)}" ${option === value'));
  const ui = fs.readFileSync(path.join(root,'src/static/js/member3.js'),'utf8');
  assert.ok(ui.includes("closest('script,style,textarea,input,[data-no-translate]')"));
  assert.ok(ui.includes("option.setAttribute('value', option.textContent)"));
  assert.ok(template.indexOf('/static/js/questionnaire-i18n.js') < template.indexOf('/static/js/member3.js'));
});
