const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
(async()=>{
 const python=process.platform==='win32'?'.venv/Scripts/python.exe':'python3';
 const {html,catalog}=JSON.parse(execFileSync(python,['-c',"import sys,json; sys.path.insert(0,'src'); from main import app; from questionnaire_engine import CATALOG; r=app.test_client().get('/'); assert r.status_code==200; print(json.dumps({'html':r.get_data(as_text=True),'catalog':CATALOG}))"],{encoding:'utf8'}));
 const {parseHTML}=await import(process.env.CAREERLENS_DOM_MODULE||'../work/qa/linkedom.mjs');
 const {window}=parseHTML(html),{document}=window;
 let payload;
 const ctx={document,console,NodeFilter:{SHOW_TEXT:4},MutationObserver:window.MutationObserver,
  setTimeout:()=>0,clearTimeout(){},matchMedia:()=>({matches:true,addEventListener(){}}),
  localStorage:{getItem:()=>null,setItem(){}},location:{},postJson:async(url,data)=>{payload=data;return {data:{ok:true}}}};
 ctx.window=ctx;document.querySelectorAll('[id]').forEach(el=>ctx[el.id]=el);vm.createContext(ctx);
 for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g))vm.runInContext(m[1],ctx);
 for(const f of ['questionnaire-i18n','portal-i18n','auth-i18n','member3'])vm.runInContext(fs.readFileSync('src/static/js/'+f+'.js','utf8'),ctx);
 ctx.uiLanguage=document.getElementById('uiLanguage');
 const options=id=>[...document.getElementById(id).querySelectorAll('option')].map(o=>o.value).filter(Boolean);
 function choose(id,value){const select=document.getElementById(id);select.querySelectorAll('option').forEach(o=>o.removeAttribute('selected'));const option=[...select.querySelectorAll('option')].find(o=>o.value===value);assert(option,`${id}: ${value}`);option.setAttribute('selected','');}
 // Linkedom omits the native select.value setter; emulate it for selection events.
 Object.defineProperty(ctx.sLocState,'value',{
  get(){return [...this.querySelectorAll('option')].find(o=>o.hasAttribute('selected'))?.value || '';},
  set(value){this.querySelectorAll('option').forEach(o=>{if(o.value===value)o.setAttribute('selected','');else o.removeAttribute('selected');});},
 });
 assert(!ctx.sLoc.disabled,'District menu must open before a state is chosen');
 assert(options('sLoc').includes('Petaling'));
 choose('sLoc','Petaling');vm.runInContext('updateRegistrationOtherArea()',ctx);
 assert.equal(ctx.sLocState.value,'Selangor');assert.equal(ctx.sLoc.value,'Petaling');
 assert.deepEqual(options('sIndustry'),Object.keys(catalog.roles));
 assert.deepEqual(options('sLocState'),Object.keys(catalog.regions));
 for(const [state,areas]of Object.entries(catalog.regions)){
  choose('sLocState',state);vm.runInContext('updateRegistrationDistricts()',ctx);
  assert.deepEqual(options('sLoc'),[...new Set([...areas,'Other area'])]);
 }
 choose('sIndustry','Engineering');choose('sLocState','Selangor');vm.runInContext('updateRegistrationDistricts()',ctx);choose('sLoc','Petaling');
 for(const id of ['sIndustry','sLocState','sLoc','sLocOther'])ctx[id].reportValidity=()=>!ctx[id].hasAttribute('required')||!!ctx[id].value.trim();
 for(const lang of ['zh','ms','en','zh','en']){
  choose('uiLanguage',lang);ctx.uiLanguage.dispatchEvent(new window.Event('change'));
  assert.equal(document.querySelector('label[for=\"sLoc\"]').textContent,{en:'District / area',zh:'地区／县区',ms:'Daerah / kawasan'}[lang]);
  assert.equal(ctx.sIndustry.value,'Engineering');assert.equal(ctx.sLocState.value,'Selangor');assert.equal(ctx.sLoc.value,'Petaling');
 }
 await vm.runInContext('submitRegistration()',ctx);
 assert.equal(payload.role_details.industry,'Engineering');assert.equal(payload.role_details.location,'Petaling, Selangor');
 assert.equal(payload.role_details.location_state,'Selangor');assert.equal(payload.role_details.location_district,'Petaling');
 choose('sLoc','Other area');vm.runInContext('updateRegistrationOtherArea()',ctx);ctx.sLocOther.value='Custom Area';
 await vm.runInContext('submitRegistration()',ctx);assert.equal(payload.role_details.location,'Custom Area, Selangor');assert.equal(payload.role_details.location_area_other,'Custom Area');
 choose('sLocState','Johor');vm.runInContext('updateRegistrationDistricts()',ctx);
 assert.equal(ctx.sLoc.value,'');assert.equal(ctx.sLocOther.value,'');assert(ctx.sLocOther.disabled);
 payload=null;await vm.runInContext('submitRegistration()',ctx);assert.equal(payload,null,'Missing district must block registration');
 const questionnaire={
  user:{role_details:{industry:'Engineering',location_state:'Selangor',location_district:'Other area',location_area_other:'Custom Area'}},
  cvRecord:null,answers:{},COMMON_Q:Array.from({length:8},(_,i)=>({id:'c'+(i+1)})),
  localStorage:{setItem(){}},api:async()=>({ok:true,data:catalog}),
  document:{getElementById:()=>({classList:{toggle(){}}})},
 };
 vm.createContext(questionnaire);
 vm.runInContext(fs.readFileSync('src/static/js/questionnaire.js','utf8'),questionnaire);
 vm.runInContext('renderQuestionnaire=()=>{}',questionnaire);
 await vm.runInContext('loadQuestionnaireCatalog()',questionnaire);
 assert.equal(questionnaire.answers.cField,'Engineering');assert.equal(questionnaire.answers.cState,'Selangor');
 assert.equal(questionnaire.answers.c4,'Other area');assert.equal(questionnaire.answers.cAreaOther,'Custom Area');
 questionnaire.answers={cField:'Legal',cState:'Johor',c4:'Johor Bahru'};
 await vm.runInContext('loadQuestionnaireCatalog()',questionnaire);
 assert.equal(questionnaire.answers.cField,'Legal');assert.equal(questionnaire.answers.cState,'Johor');assert.equal(questionnaire.answers.c4,'Johor Bahru');
 console.log(`PASS registration: ${Object.keys(catalog.roles).length} shared industries, ${Object.keys(catalog.regions).length} states, all dependent districts, other-area entry, language switching, payload and validation.`);
})().catch(error=>{console.error(error);process.exitCode=1});

