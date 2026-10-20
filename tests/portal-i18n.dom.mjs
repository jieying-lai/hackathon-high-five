import {execFileSync} from 'node:child_process';
const {parseHTML} = await import(process.env.CAREERLENS_DOM_MODULE || 'linkedom');
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const python=process.platform==='win32' ? '.venv/Scripts/python.exe' : 'python3';
const fixtures=JSON.parse(execFileSync(python,['scripts/locale-fixtures.py'],{encoding:'utf8'}));
const results=[];
for(const page of ['candidate','hr','index']) {
 const html=fs.readFileSync(`src/templates/${page}.html`,'utf8');
 const {window}=parseHTML(html);
 const document=window.document;
 const storage=new Map();
 const context={document,NodeFilter:{SHOW_TEXT:4},MutationObserver:window.MutationObserver,
  localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
  setTimeout,clearTimeout,setInterval(){},console,scrollTo(){},fixtures};
 context.window=context;
 document.querySelectorAll('[id]').forEach(el=>context[el.id]=el);
 vm.createContext(context);
 const evaluate=source=>vm.runInContext(source,context);
 evaluate(fs.readFileSync('src/static/js/common.js','utf8'));
 const inline=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n').replace(/\binit\(\);\s*$/,'');
 evaluate(inline);
 evaluate(fs.readFileSync('src/static/js/interviews.js','utf8')); 
 for(const file of ['questionnaire-i18n','portal-i18n','auth-i18n','member3'])evaluate(fs.readFileSync(`src/static/js/${file}.js`,'utf8'));
 function language(lang) {
  const select=document.getElementById('uiLanguage');
  for(const option of select.options)option.selected=false; select.querySelector('option[value='+lang+']').selected=true;
  select.dispatchEvent(new window.Event('change'));
  context.careerLensLocale.apply(); assert.equal(context.careerLensLocale.getLanguage(),lang);
 }
 const text=selector=>document.querySelector(selector).textContent;
 if(page==='candidate') {
  evaluate(`user={full_name:'Aisha Rahman',unique_uid:'TEST'};personas=fixtures.personas;analysed=true;buildNav();`);
  for(let index=0;index<fixtures.analyses.length;index++) {
   evaluate(`roles=fixtures.analyses[${index}].recommended_roles;aiQuestions=fixtures.analyses[${index}].verification_questions;trend=fixtures.trend;renderDash();renderRoles();renderRadar();renderPlanSelect();renderQuestionnaire();`);
   for(let role=0;role<4;role++) {
    evaluate(`selected=${role};renderPlan();renderPassport();`);
    for(const lang of ['zh','ms','en','zh','en']) {
     language(lang);
     const expected=fixtures.analyses[index].recommended_roles[role];
     if(lang==='en')assert.ok(text('#passport').includes(expected.title));
     else {
      assert.ok(!text('#passport').includes(expected.title),'untranslated role '+lang+' '+context.careerLensLocale.translate(expected.title)+' '+text('#passport').slice(0,800));
      assert.ok(!text('#passport').includes('Contribution to the SDGs'));
      assert.ok(!text('#passport').includes('Skills to build'));
      assert.ok(!text('#passport').includes('to close gap'));
      assert.ok(!text('#passport').includes('Estimates only.'));
      for(const tag of expected.sdg_tags)assert.ok(!text('#passport').includes(tag.reason));
      for(const skill of expected.skills_gap)if(context.careerLensLocale.translate(skill)!==skill)assert.ok(![...document.querySelectorAll('#passport .chip')].some(c=>c.textContent===skill),'untranslated skill '+skill);
     }
    }
   }
  }
  evaluate("answers={c1:'Working Professional',c2:'My original answer 中文'};renderQuestionnaire();selected=0;renderPlan();renderPassport();");
 } else if(page==='hr') {
  evaluate(`user={unique_uid:'TEST'};vacancies=fixtures.vacancies;heat=fixtures.heat;assignments=[];scrn=fixtures.screen;buildNav();renderOverview();renderVacancies();renderScreenSelect();renderScreen();renderHeatmap();renderReskill();`);
 }
 if(page==='candidate') {
  const numbers=evaluate("NAV.filter(n=>n.id!=='dash' && n.id!=='notifications').map(n=>n.eyebrow)");
  assert.equal(new Set(numbers).size,6);
  assert.equal(numbers.join(','),'Function 01,Function 02,Function 03,Function 04,Function 05,Function 06');
  for(const lang of ['zh','ms','en']) {
   language(lang);
   for(const [index,tab] of ['profile','quest','radar','match','plan','passport'].entries()) {
    evaluate(`showTab('${tab}')`);language(lang);
    assert.equal(text('#pgEyebrow'),(lang==='zh'?'功能 ':lang==='ms'?'Fungsi ':'Function ')+String(index+1).padStart(2,'0'));
   }
  }
 }
 if(page==='index') {
  document.getElementById('regName').value='Original 名字';
  document.getElementById('regEmail').value='test@example.com';
  document.getElementById('regPw').value='Secure@123';
  document.getElementById('regPw2').value='Secure@123';
  document.getElementById('sType').querySelector('option').selected=true;
  for(const lang of ['zh','ms','en','zh','en']) {
   language(lang);
   const title=document.querySelector('#landing h1').textContent;
   assert.ok(title.includes(lang==='zh'?'找到你在':lang==='ms'?'Cari tempat anda dalam':'Find your place in the'));
   assert.ok(title.includes(lang==='zh'?'AI 时代的位置':lang==='ms'?'era AI':'AI era'));
   evaluate("openAuth('login');openSso('Google');");language(lang);
   assert.equal(text('#ssoTitle'),lang==='zh'?'使用 Google 继续':lang==='ms'?'Teruskan dengan Google':'Continue with Google');
   for(const role of ['job_seeker','hr_company']) {
    evaluate(`openAuth('register','${role}');liveCheck();toggleTerms(true);`);language(lang);
    assert.equal(document.getElementById('regRole').value,role);
    assert.equal(document.getElementById('sType').value,'Fresh Graduate');
    assert.equal(document.getElementById('regName').value,'Original 名字');
    assert.equal(document.getElementById('regPw').value,'Secure@123');
    assert.equal(text('#ePw2'),lang==='zh'?'✅ 两次密码一致':lang==='ms'?'✅ Kata laluan sepadan':'✅ Passwords match');
   }
   const authSource=fs.readFileSync('src/auth_db.py','utf8');
   const errors=[...authSource.matchAll(/return False, "([^"]+)"/g)].map(match=>match[1]);
   for(const message of errors) {
    context.testMessage=message;evaluate('showAlert(testMessage)');language(lang);
    if(lang==='en')assert.equal(text('#alertBox'),message);
    else assert.notEqual(text('#alertBox'),message);
   }
  }
  evaluate("document.getElementById('alertBox').textContent='';");
 }
 if(page==='hr') {
  evaluate(`setHeatPreset('Insurance')`);
  assert.match(document.getElementById('hmBody').textContent,/No comparison data/);
  evaluate(`setHeatPreset('Accounting & audit')`);
  assert.equal(document.querySelectorAll('#hmBody tr').length,5);
  evaluate(`hmSearch.value='Mei Ling';renderHeatmap()`);
  assert.equal(document.querySelectorAll('#hmBody tr').length,1);
  evaluate(`heatSkills=new Set(['Financial Auditing']);renderHeatmap()`);
  assert.match(document.getElementById('hmBody').textContent,/100%/);
  assert.match(document.getElementById('hmRecommendation').textContent,/Mei Ling Tan/);
  assert.equal(document.querySelectorAll('#hmRecommendation article').length,1);
  evaluate(`heatSkills=new Set(['React']);renderHeatmap()`);
  assert.match(document.getElementById('hmBody').textContent,/To confirm/);
  assert.match(document.getElementById('hmBody').textContent,/0%/);
  assert.equal(document.querySelectorAll('#hmRecommendation article').length,0);
  assert.match(document.getElementById('hmRecommendation').textContent,/No recommendations/);
  evaluate(`resetHeatFilters()`);
  assert.equal(document.querySelectorAll('#hmBody tr').length,fixtures.heat.employees.length);
 }
 if(page==='hr') {
  const invitation=evaluate(`buildInterviewEmail({name:'Test Candidate'}, {email:'candidate+test@example.com',role:'Audit & Risk',time:'2026-11-01T10:00',location:'https://example.com/meeting?a=1&b=2',message:'Please bring your CV.'},text=>text)`);
  const url=new URL(invitation);
  assert.equal(decodeURIComponent(url.pathname),'candidate+test@example.com');
  assert.equal(url.searchParams.get('subject'),'Interview invitation — Audit & Risk');
  assert.match(url.searchParams.get('body'),/2026-11-01 10:00/);
  assert.match(url.searchParams.get('body'),/meeting\?a=1&b=2/);
  assert.match(url.searchParams.get('body'),/Test Candidate/);
 }
 if(page==='hr' && fixtures.screen) {
  for(const result of fixtures.screen.results) {
   evaluate(`openInsight(${JSON.stringify(result.candidate_id)});`);
   for(const lang of ['zh','ms','en']) {
    language(lang);
    for(const field of document.querySelectorAll('textarea[data-generated-source]')) {
     if(lang==='en')assert.equal(field.value,field.dataset.generatedSource);
     else assert.notEqual(field.value,field.dataset.generatedSource);
    }
   }
  }
  const field=document.querySelector('textarea[data-generated-source]');
  field.value='Edited by HR 中文';language('zh');language('ms');assert.equal(field.value,'Edited by HR 中文');
 }
 language('zh');
 const walker=document.createTreeWalker(document.body,4);let node;const leftovers=new Set();
 while((node=walker.nextNode())) {
  if(node.parentElement.closest('script,style,textarea,input,[data-no-translate]'))continue;
  const value=node.textContent.trim();
  if(/[A-Za-z]{3,}/.test(value)&&!/[\u3400-\u9fff]/.test(value))leftovers.add(value);
 }
 results.push({page,englishLeftovers:[...leftovers]});
 const allowed=new Set(['CareerLens AI','SDG 4 · 8','SQL','Python','HTML/CSS/JS','LLM / RAG','REST API','Git','React','Docker','DeepLearning.AI','Aisha Rahman','TEST','Google','Microsoft','Nexus Digital & Finance Sdn Bhd','Aura Creative & Media Group MY','Pacific Smart Logistics Sdn Bhd','Daniel Tan · Nexus Digital Sdn Bhd','Kuala Lumpur','Selangor','Penang','Johor Bahru','name@domain.com','name@company.com','aisha.demo@careerlens.my','hr.demo@nexussme.my','CL-JS-2026','CL-HR-2026',
  ...fixtures.personas.map(p=>p.name.split(' (')[0]),
  ...fixtures.heat.employees.map(p=>p.name),
  ...(fixtures.screen?.results || []).map(p=>p.name)]);
 for(const value of leftovers) {
  const plain=value.replace(/^[✓+🌱🌐🏢👤]\s*/u,'');
  assert.ok(allowed.has(plain) || /^SDG \d+\.\d+$/.test(plain) || /^VAC-\d{4}-\d+$/.test(plain),`Unexpected English UI text in ${page}: ${value}`);
 }
 if(page==='candidate') {
  for(const lang of ['ms','en','zh']) {
   language(lang);
   assert.equal(document.querySelector('#commonQ select').value,'Working Professional');
   assert.equal(document.querySelector('#commonQ textarea').value,'My original answer 中文');
  }
 }
 console.log(page+': rendered DOM language round trips passed');
}
fs.writeFileSync('work/locale-validation.json',JSON.stringify({mode:'Rendered DOM; not browser visual acceptance',personas:3,scenarios:2,targetRoles:4,languageRoundTrips:['zh','ms','en','zh','en'],results},null,2));





