const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const scenario=require('../src/static/js/scenario-slider.js');
(async()=>{
 const python=process.platform==='win32'?'.venv/Scripts/python.exe':'python3';
 const fixture=JSON.parse(execFileSync(python,['-c',"import sys,json;sys.path.insert(0,'src');from trend_signals import get_trend_radar;from ai_matcher import match_user_to_roles;m={'source_name':'Test source','last_updated':'Test','live_status':'CACHED_FALLBACK','recent_signals':[]};p={'industry':'Finance & Accounting','skills':['Financial Auditing']};print(json.dumps({'trends':{s:get_trend_radar(s,m) for s in ['moderate','fast']},'matches':{s:match_user_to_roles(p,s) for s in ['moderate','fast']}}))"],{encoding:'utf8'}));
 const original=JSON.stringify(fixture);
 for(let n=0;n<=100;n++){
  const trend=scenario.blendTrend(fixture.trends.moderate,fixture.trends.fast,n/100);
  const roles=scenario.blendRoles(fixture.matches.moderate.recommended_roles,fixture.matches.fast.recommended_roles,n/100);
  trend.emerging_skills.forEach((row,i)=>{assert(row.growth_pct>=fixture.trends.moderate.emerging_skills[i].growth_pct);assert(row.growth_pct<=fixture.trends.fast.emerging_skills[i].growth_pct)});
  assert(roles.every(row=>Number.isFinite(row.match_score)&&row.match_score<=98));
 }
 assert.equal(JSON.stringify(fixture),original,'Interpolation cannot mutate benchmark data');
 assert.deepEqual(scenario.blendRoles(fixture.matches.moderate.recommended_roles,fixture.matches.fast.recommended_roles,0),fixture.matches.moderate.recommended_roles);
 assert.deepEqual(scenario.blendRoles(fixture.matches.moderate.recommended_roles,fixture.matches.fast.recommended_roles,1),fixture.matches.fast.recommended_roles);
 const {parseHTML}=await import(process.env.CAREERLENS_DOM_MODULE||'../work/qa/linkedom.mjs');
 const html=fs.readFileSync('src/templates/candidate.html','utf8');const {window}=parseHTML(html),{document}=window;
 const frames=new Map();let frameId=0,requests=0,commits=0;
 const ctx={document,NodeFilter:{SHOW_TEXT:4},MutationObserver:window.MutationObserver,setTimeout:()=>0,clearTimeout(){},localStorage:{getItem:()=>null,setItem(){}},matchMedia:()=>({matches:true,addEventListener(){}}),console,
  CareerLensScenario:scenario,scenario:'moderate',skills:[],trend:null,roles:[],selected:0,current:'radar',analysed:false,
  api:async()=>{requests++;return {ok:true,data:{scenario_endpoints:fixture.trends}}},
  postJson:async()=>{requests++;return {ok:true,data:{scenario_endpoints:fixture.matches,fairness_audit:'Test audit'}}},
  requestAnimationFrame:fn=>{frames.set(++frameId,fn);return frameId},cancelAnimationFrame:id=>frames.delete(id),
  renderRoles(){commits++},renderPlanSelect(){},renderPlan(){},renderPassport(){},renderQuestionnaire(){},renderDash(){},toast(){},esc:String};
 ctx.window=ctx;document.querySelectorAll('[id]').forEach(el=>ctx[el.id]=el);vm.createContext(ctx);
 for(const file of ['questionnaire-i18n','portal-i18n','auth-i18n','member3'])vm.runInContext(fs.readFileSync('src/static/js/'+file+'.js','utf8'),ctx);
 const inline=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
 vm.runInContext(inline.slice(inline.indexOf('    let analysisVersion ='),inline.indexOf('    /* ---------- dashboard')),ctx);
 vm.runInContext(inline.slice(inline.indexOf('    function renderRadar('),inline.indexOf('    /* ---------- matches')),ctx);
 await vm.runInContext('runAnalysis()',ctx);assert.equal(requests,2);
 const polygon=document.getElementById('radarData'),initial=polygon.getAttribute('points');
 for(const value of [.1,.2,.35,.51])vm.runInContext(`setScenario(${value},false)`,ctx);
 assert.equal(frames.size,1,'Drag updates coalesce to one animation frame');
 const flush=()=>{const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn());};flush();
 assert.equal(document.getElementById('radarData'),polygon,'Dragging must retain the same SVG');
 assert.notEqual(polygon.getAttribute('points'),initial);
 assert.equal(document.getElementById('scenarioIntensity').textContent,'51%');assert.equal(requests,2);
 assert.equal(commits,1,'Heavy role rendering waits until release');
 vm.runInContext('setScenario(0.51)',ctx);assert.equal(commits,2);assert.equal(requests,2);
 vm.runInContext("setScenario('fast')",ctx);assert.equal(ctx.trend.emerging_skills[0].growth_pct,fixture.trends.fast.emerging_skills[0].growth_pct);
 for(const lang of ['zh','ms','en']){
  const select=document.getElementById('uiLanguage');select.querySelectorAll('option').forEach(o=>o.removeAttribute('selected'));select.querySelector(`[value=${lang}]`).setAttribute('selected','');select.dispatchEvent(new window.Event('change'));
  vm.runInContext('setScenario(0.35)',ctx);
  assert(document.getElementById('scenarioSlider').getAttribute('aria-valuetext').includes('35%'));
  if(lang!=='en')assert(!document.getElementById('trendScenarioLabel').textContent.includes('Blended AI adoption scenario'));
 }
 console.log('PASS: 101 slider positions, exact benchmark endpoints, immutable data, live SVG reuse, frame coalescing, zero drag requests, release updates and EN/中文/BM.');
})().catch(error=>{console.error(error);process.exitCode=1});
