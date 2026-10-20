const fs = require('fs');
const vm = require('vm');
const assert = require('node:assert/strict');
(async () => {
  const {parseHTML} = await import(process.env.CAREERLENS_DOM_MODULE || 'file:///C:/Users/Hui%20Shan/Documents/Codex/hackathon-high-five/work/qa/linkedom.mjs');
  const catalog = JSON.parse(fs.readFileSync('src/data/questionnaire_catalog.json', 'utf8'));
  for (const page of ['index', 'candidate', 'hr']) {
    const {window} = parseHTML(fs.readFileSync(`src/templates/${page}.html`, 'utf8'));
    const {document} = window;
    const ctx = {document, NodeFilter:{SHOW_TEXT:4}, MutationObserver:window.MutationObserver, localStorage:{getItem:()=>null,setItem(){}},setTimeout:()=>0,clearTimeout(){},console};
    ctx.window=ctx; ctx.matchMedia=()=>({matches:true,addEventListener(){}});
    vm.createContext(ctx);
    const fixture=document.createElement('section');
    fixture.innerHTML='<div id="test-nav">My Profile</div><input id="test-hint" placeholder="Highlight why you are interested in this role..."><p data-no-translate id="test-original">My Profile</p><select id="test-choice"></select><p id="test-dynamic">3 of 15 answered · draft saved on this device</p>';
    document.body.append(fixture);
    const options=[...Object.keys(catalog.roles),...Object.values(catalog.roles).flat(),...Object.keys(catalog.regions)];
    const select=document.getElementById('test-choice');
    options.forEach(t=>{const o=document.createElement('option');o.textContent=t;select.append(o)});
    for(const name of ['questionnaire-i18n','portal-i18n','auth-i18n','member3']) vm.runInContext(fs.readFileSync(`src/static/js/${name}.js`,'utf8'),ctx);
    function language(lang){const el=document.getElementById('uiLanguage');el.querySelectorAll('option').forEach(o=>o.removeAttribute('selected'));el.querySelector(`[value="${lang}"]`).setAttribute('selected','');el.dispatchEvent(new window.Event('change'));ctx.careerLensLocale.apply();assert.equal(ctx.careerLensLocale.getLanguage(),lang)}
    for(const lang of ['zh','ms','en','zh','en']) {
      language(lang);
      assert.equal(document.getElementById('test-nav').textContent, {en:'My Profile',ms:'Profil Saya',zh:'我的资料'}[lang]);
      assert.equal(document.getElementById('test-original').textContent,'My Profile');
      select.querySelectorAll('option').forEach((o,i)=>{
        assert.equal(o.value,options[i],'Canonical option must survive language changes');
        if(lang==='en') assert.equal(o.textContent,options[i]);
        if(lang==='zh') assert.notEqual(o.textContent,options[i],options[i]+' missing Chinese');
      });
      if(lang!=='en') {
        assert.notEqual(document.getElementById('test-hint').getAttribute('placeholder'),'Highlight why you are interested in this role...');
        assert.notEqual(document.getElementById('test-dynamic').textContent,'3 of 15 answered · draft saved on this device');
      }
    }
    console.log(`PASS ${page}: EN/CN/BM switching, ${options.length} catalog options, original values, private text, dynamic status and placeholders`);
  }
})();
