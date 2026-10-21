const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
(async () => {
  const {parseHTML} = await import(process.env.CAREERLENS_DOM_MODULE || '../work/qa/linkedom.mjs');
  const {chineseRows} = require('../src/static/js/portal-i18n.js');
  const dynamic = [
    'Question 3 of 3 · Domain & Ethics Standard', 'Verification score: 86/100',
    'In a real-world project for a Software Developer, how would you handle unexpected technical roadblocks or tight deadlines?',
    '12 matched', '2 accesses', 'Keyword coverage 80', 'Impact wording 65',
    '800 words · avg 5 chars/word · 12 numeric metrics', '3 page(s)',
    'Expand Radius to 30 km', '2.5 km away', 'Expires 2026-11-01',
    'View CV shared by Aisha', 'Aisha accessed summary',
    'No matching location found for "Test Street". Try entering the area or street name.',
    'Extraction method: Local PDF text extraction. Missing information is left blank; correct the draft using the original PDF.',
    'Replace the current PDF and organised profile? This will withdraw 2 active application(s) and revoke their access. You must review and apply again to share the new CV. Any links shared with named recipients will also be revoked. Previously downloaded copies cannot be retracted.',
    '⚡ Generate My 3 Questions', '✕ Clear Company Filter', '🛡️ Sharing is your choice',
    'Saving these edits will withdraw existing applications and revoke recipient sharing. Continue?',
  ];
  const allowed = /^(?:CareerLens(?: AI)?|SDG 4 · 8|.*@.*|Google|Microsoft|Daniel Tan · Nexus Digital Sdn Bhd|Nexus Digital & Finance Sdn Bhd|Aura Creative & Media Group MY|Pacific Smart Logistics Sdn Bhd|Lumi|SPM／UEC|PDF|CV|UTC\+8)$/;
  for (const page of ['index', 'candidate', 'hr', 'shared_cv']) {
    const html = fs.readFileSync(`src/templates/${page}.html`, 'utf8');
    const {window} = parseHTML(html);
    const {document} = window;
    const storage = new Map();
    const ctx = {document, NodeFilter:{SHOW_TEXT:4}, MutationObserver:window.MutationObserver,
      localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
      setTimeout, clearTimeout, matchMedia:()=>({matches:true,addEventListener(){}})};
    ctx.window = ctx;
    vm.createContext(ctx);
    for (const f of ['questionnaire-i18n','portal-i18n','auth-i18n','member3'])
      vm.runInContext(fs.readFileSync(`src/static/js/${f}.js`, 'utf8'), ctx);
    const language = lang => {
      const selector = document.getElementById('uiLanguage');
      selector.querySelectorAll('option').forEach(o=>o.removeAttribute('selected'));
      selector.querySelector(`[value="${lang}"]`).setAttribute('selected','');
      selector.dispatchEvent(new window.Event('change'));
      ctx.careerLensLocale.apply();
    };
    if (page === 'candidate') {
      ctx.esc = value => String(value ?? '');
      const verificationScript = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
      vm.runInContext(verificationScript, ctx);
      vm.runInContext(`render3AiQuestions([{category:'Domain & Ethics Standard',difficulty:'Scenario-Based',question_text:'How do you ensure data integrity, fairness, or best industry practices when deploying solutions in team environments?'}])`, ctx);
      const answer = document.getElementById('ai3Ans_0');
      answer.value = 'My answer 中文';
      language('zh');
      assert.match(document.getElementById('ai3QuestionsContainer').textContent, /领域与道德规范/);
      assert.equal(answer.getAttribute('placeholder'),'在此填写你的答案或实际做法……');
      language('en');
      assert.match(document.getElementById('ai3QuestionsContainer').textContent, /Domain & Ethics Standard/);
      assert.equal(answer.value,'My answer 中文');
    }
    let confirmation;
    ctx.confirm = message => { confirmation = message; return true; };
    const common = fs.readFileSync('src/static/js/common.js','utf8');
    vm.runInContext(common.match(/function localizedConfirm\(message\) \{[\s\S]*?\n\}/)[0],ctx);
    language('zh');
    assert.equal(vm.runInContext("localizedConfirm('Delete this vacancy?')",ctx),true);
    assert.equal(confirmation,'删除此招聘职位？');
    language('en');
    vm.runInContext("localizedConfirm('Delete this vacancy?')",ctx);
    assert.equal(confirmation,'Delete this vacancy?');
    const fixture = document.createElement('section');
    const sources = [...new Set([...chineseRows.map(r=>r[0]), ...dynamic])];
    const nodes = sources.map(source => {const el=document.createElement('p');el.textContent=source;fixture.append(el);return el;});
    const privateText = document.createElement('p'); privateText.dataset.noTranslate=''; privateText.textContent='Search';fixture.append(privateText);
    const input=document.createElement('input');input.value='Search 中文';input.placeholder='Search';fixture.append(input);
    document.body.append(fixture);
    for(const lang of ['zh','en','zh','en']) {
      language(lang);
      nodes.forEach((el,i)=>assert.equal(el.textContent, lang==='en'?sources[i]:ctx.careerLensLocale.translate(sources[i]),`${page}: ${sources[i]}`));
      if(lang==='zh')dynamic.forEach(source=>assert.notEqual(ctx.careerLensLocale.translate(source),source,source));
      assert.equal(privateText.textContent,'Search');assert.equal(input.value,'Search 中文');
      assert.equal(input.placeholder,lang==='zh'?'搜索':'Search');
    }
    language('zh');
    // Audit real static UI, including previously excluded account/map/question panels.
    const leftovers=[];const walker=document.createTreeWalker(document.body,4);let node;
    while(node=walker.nextNode()) {
      if(node.parentElement.closest('script,style,textarea,input,[data-no-translate]')||fixture.contains(node))continue;
      const text=node.textContent.trim();
      if(/[a-z]{3}/i.test(text)&&!/[\u3400-\u9fff{}]/.test(text)&&!allowed.test(text)&&!/^[🌐🏢]\s*(Google|Microsoft)$/u.test(text))leftovers.push(text);
    }
    assert.deepEqual([...new Set(leftovers)],[],`${page}: untranslated static UI`);
    // A dynamically changed placeholder must be translated without a language change.
    input.setAttribute('placeholder','Enter current password');
    await new Promise(resolve=>setTimeout(resolve,60));
    assert.equal(input.getAttribute('placeholder'),'输入当前密码');
    language('en');assert.equal(input.getAttribute('placeholder'),'Enter current password');
    // UI code can insert already translated copy; switching back must recover English.
    const inserted=document.createElement('span');language('zh');inserted.textContent=ctx.careerLensLocale.translate('Revoke access');document.body.append(inserted);ctx.careerLensLocale.apply();
    language('en');assert.equal(inserted.textContent,'Revoke access');
    console.log(`PASS ${page}: ${sources.length} UI strings, dynamic copy, EN/中文 round trips, private data and changing attributes`);
  }
})().catch(error=>{console.error(error);process.exitCode=1;});


