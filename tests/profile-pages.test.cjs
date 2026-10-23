const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(process.env.PROFILE_HTML || 'src/templates/candidate.html', 'utf8');
const between = (a,b) => html.slice(html.indexOf(a),html.indexOf(b,html.indexOf(a)));
const init = between('    async function init() {', '    profileFieldIds.filter');
const card = between('    function renderAccountProfileCard()', '/* ---------- Account Profile View');

function setup(failures = false) {
  const account = {full_name:'Mira Example',unique_uid:'TEST-42',email:'mira@example.test',role:'job_seeker',role_details:{}};
  const elements = Object.fromEntries(['accCardName','accCardAvatar','accCardUid','accCardEmail','accCardJoined','accCardRole','accCardIndustry','accCardWorkMode','accCardPhone','accCardLocation','accCardBio','uName','uAvatar','dropName','dropEmail','dropAvatar'].map(id=>[id,{textContent:''}]));
  const events = [];
  const c = vm.createContext({...elements, window:{...elements,location:{},addEventListener(){}},document:{getElementById:id=>elements[id]},
    user:null,cvRecord:null,current:'dash',roles:[],selected:0,personas:[],answers:{},
    localStorage:{getItem:()=>null},ansKey:()=> 'answers',esc:String,
    buildNav(){},bindDropzone(){},renderDiscoveryLearning(){},syncGrowthHeaderOffset(){},showTab:async id=>events.push(id),
    renderDash:()=>events.push('renderDash'),renderProfileHighlights(){},
    api:async url=> url==='/api/auth/me'?{ok:true,data:{user:account}}:{ok:true,data:[]},
    skillSuggest:{innerHTML:''},skillInput:{addEventListener(){}},
    loadMyCv:async()=>{events.push('cv');if(failures)throw Error('offline');},
    loadQuestionnaireCatalog:async()=>{if(failures)throw Error('offline');},
    runAnalysis:async()=>{events.push('analysis');if(failures)throw Error('offline');},
    toast:()=>events.push('notice')});
  vm.runInContext(card+init,c);
  return {c,elements,events};
}

test('demo login renders identity and dashboard without the removed uUid element or optional plugins',async()=>{
  const {c,elements,events}=setup();
  await c.init();
  assert.equal(elements.accCardName.textContent,'Mira Example');
  assert.equal(elements.uName.textContent,'Mira Example');
  assert.equal(elements.accCardUid.textContent,'TEST-42');
  assert.ok(events.indexOf('dash') < events.indexOf('cv'));
  assert.ok(events.includes('renderDash'));
});
test('optional service failures do not leave the logged-in dashboard blank',async()=>{
  const {c,elements,events}=setup(true);
  await c.init();
  assert.equal(elements.accCardName.textContent,'Mira Example');
  assert.ok(events.includes('dash'));
  assert.ok(events.includes('renderDash'));
  assert.equal(events.filter(e=>e==='notice').length,3);
});
test('missing account details do not impersonate demo contact or employment details',async()=>{
  const {c,elements}=setup();await c.init();
  for(const id of ['accCardRole','accCardIndustry','accCardWorkMode','accCardPhone','accCardLocation'])assert.equal(elements[id].textContent,'Not added');
});
test('profile, upload, review and application controls belong to distinct sections',()=>{
  const starts=[...html.matchAll(/<section id="tab-([^"]+)"[^>]*>/g)];
  const sections=Object.fromEntries(starts.map((m,i)=>[m[1],html.slice(m.index,starts[i+1]?.index ?? html.length)]));
  assert.match(sections.profile,/id="accCardName"/);
  assert.match(sections.profile,/id="profileHighlights"/);
  assert.doesNotMatch(sections.profile,/id="(?:pdfInput|pSummary|activeSharesList)"/);
  assert.match(sections['cv-upload'],/id="pdfInput"/);
  assert.doesNotMatch(sections['cv-upload'],/id="pSummary"/);
  assert.match(sections['cv-review'],/id="pSummary"/);
  assert.match(sections.applications,/id="activeSharesList"/);
  assert.match(sections.applications,/id="namedSharesList"/);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(ids.length,new Set(ids).size,'DOM IDs must be unique');
});
test('upload success takes the owner to review and navigation keeps unsaved CV edits',()=>{
  assert.match(between('    async function uploadPdfRequest','    async function handlePdfSelect'),/await showTab\('cv-review'\)/);
  assert.match(between('    async function loadMyCv','    async function reloadVault'),/profileDirty/);
  assert.doesNotMatch(between('    async function showTab','    const profileFieldIds'),/profileDirty\s*=\s*false/);
});
