const assert=require('node:assert/strict');
const browserHarness=require('./browser-harness.cjs');

(async()=>{
  const b=await browserHarness();
  const {evaluate:e,wait,click,realClick,viewport,screenshot,send}=b;
  const choose=async(id,expression)=>e(`(()=>{const input=document.getElementById('question-${id}');input.value=${expression};input.dispatchEvent(new Event('change',{bubbles:true}));return true;})()`);
  let createdId, originalPreferences, originalAnswers;
  try {
    await b.navigate('/');
    await wait('typeof quickLogin==="function"');
    await e('quickLogin("job_seeker");true');
    await wait('location.pathname==="/workspace" && typeof user!=="undefined" && user && typeof roles!=="undefined" && roles.length && analysed');
    await e('showTab("dash").then(()=>true)');
    await wait('!!document.querySelector("[data-ca-create]")');
    const snapshot=await e('(async()=>await(await fetch("/api/career-actions")).json())()');
    originalPreferences=snapshot.preferences;
    originalAnswers=await e('JSON.parse(JSON.stringify(answers))');
    const index=await e(`roles.findIndex(role=>!${JSON.stringify(snapshot.actions)}.some(action=>action.status==='planned'&&action.kind==='role_test'&&action.role_title===role.title))`);
    assert(index>=0,'Need an unplanned real role for this test');
    await e(`(()=>{const select=document.querySelector('[data-ca="role"]');if(select){select.value=${index};select.dispatchEvent(new Event('change',{bubbles:true}));}return true;})()`);
    const select=async(name,value)=>{
      await e(`(()=>{const input=document.querySelector('[data-ca="${name}"]');input.value=${JSON.stringify(String(value))};input.dispatchEvent(new Event('change',{bubbles:true}));return true;})()`);
      await wait(`!document.querySelector('[data-ca="${name}"]').disabled`);
    };
    await select('goal','explore');await select('minutes',30);
    await realClick('[data-ca-create="0"]');
    await wait('current==="jobs"');
    const after=await e('(async()=>await(await fetch("/api/career-actions")).json())()');
    const created=after.actions.find(action=>!snapshot.actions.some(previous=>previous.id===action.id));
    assert(created,'Plan this must create a real account-owned action');
    createdId=created.id;assert.equal(created.kind,'role_test');
    await e('showTab("dash").then(()=>true)');
    await wait(`!!document.querySelector('[data-ca-note="${createdId}"]')`);
    await e(`(()=>{const input=document.querySelector('[data-ca-note="${createdId}"]');input.focus();input.value='Compared two real vacancy requirements.';input.dispatchEvent(new Event('input',{bubbles:true}));return true;})()`);
    await realClick(`[data-ca-status="${createdId}"]`);
    await wait(`document.querySelector('[data-ca-status="${createdId}"]').dataset.nextStatus==='planned'`);
    let actual=await e(`(async()=> (await(await fetch('/api/career-actions')).json()).actions.find(a=>a.id==='${createdId}'))()`);
    assert.equal(actual.status,'done');
    assert.equal(actual.note,'Compared two real vacancy requirements.','Clicking completion must not lose the reflection on blur');
    await e('window.__qaOldDocument=true;true');
    await send('Page.reload');
    await wait(`window.__qaOldDocument!==true && typeof user!=="undefined" && user && !!document.querySelector('[data-ca-status="${createdId}"]')`);
    assert.equal(await e('document.querySelector(\'[data-ca="minutes"]\').value'),'30');
    assert.equal(await e(`document.querySelector('[data-ca-note="${createdId}"]').value`),actual.note);
    await realClick(`[data-ca-status="${createdId}"]`);
    await wait(`document.querySelector('[data-ca-status="${createdId}"]').dataset.nextStatus==='done'`);
    await send('Network.setBlockedURLs',{urls:['*api/career-actions*']});
    await e('CareerActions.refresh().then(()=>true)');
    assert(await e('!!document.querySelector(".ca-error")'),'Network error must be explicit');
    await send('Network.setBlockedURLs',{urls:[]});
    await click('[data-ca="retry"]');
    await wait('!document.querySelector(".ca-error") && !!document.querySelector("[data-ca-create]")');
    for(const width of [320,390,768,1366]){
      await viewport(width);
      assert(await e('document.documentElement.scrollWidth<=innerWidth+1'),`Action dashboard overflow at ${width}`);
      await e('document.getElementById("careerActions").scrollIntoView({block:"start",behavior:"instant"});true');
      if(width===390||width===1366)await screenshot(`career-actions-${width}`);
    }
    await e(`window.__qaConfirm=window.confirm;window.confirm=()=>false;document.querySelector('[data-ca-remove="${createdId}"]').click();window.confirm=window.__qaConfirm;true`);
    assert(await e(`!!document.querySelector('[data-ca-note="${createdId}"]')`),'Cancel remove must retain action');
    await e(`window.confirm=()=>true;document.querySelector('[data-ca-remove="${createdId}"]').click();window.confirm=window.__qaConfirm;true`);
    await wait(`!document.querySelector('[data-ca-note="${createdId}"]')`);
    assert.equal((await e('(async()=>await(await fetch("/api/career-actions")).json())()')).actions.some(a=>a.id===createdId),false);
    createdId=null;
    await e('showTab("quest").then(()=>true)');
    await wait('!!questionnaireCatalog');
    assert.equal(await e('document.getElementById("optionalSkillPractice").open'),false);
    await click('#optionalSkillPractice summary');
    assert.equal(await e('document.getElementById("optionalSkillPractice").open'),true);
    await click('#optionalSkillPractice summary');
    await e('answers={};questionnaireFocusId=null;questionnaireFocusMode=true;renderQuestionnaire();true');
    assert.equal(await e('document.querySelectorAll("#commonQ .q-card:not([hidden])").length'),1);
    assert.equal(await e('questionnaireFocusId'),'c1');
    await choose('c1','questionnaireOptions("c1")[0]');
    assert.equal(await e('questionnaireFocusId'),'cField');
    await choose('cField','questionnaireOptions("cField")[0]');
    assert.equal(await e('questionnaireFocusId'),'c2');
    await choose('c2','questionnaireOptions("c2")[0]');
    assert.equal(await e('questionnaireFocusId'),'c3');
    await e('moveQuestionnaireFocus(-1);true');
    assert.equal(await e('document.getElementById("question-c2").value'),await e('answers.c2'));
    await e('toggleQuestionnaireFocus();true');
    assert.equal(await e('document.querySelectorAll("#commonQ .q-card[hidden]").length'),0);
    await e('toggleQuestionnaireFocus();questionnaireFocusId="cState";applyQuestionnaireFocus();true');
    await choose('cState','questionnaireOptions("cState")[0]');
    await choose('c4','"Other area"');
    assert.equal(await e('questionnaireFocusId'),'cAreaOther');
    assert.equal(await e('document.querySelectorAll("#commonQ .q-card:not([hidden])").length'),1);
    await e('document.getElementById("question-cAreaOther").value="Subang Jaya";setAnswer("cAreaOther","Subang Jaya");moveQuestionnaireFocus(1);true');
    assert.equal(await e('questionnaireFocusId'),'cMode');
    await viewport(390);
    await e('document.getElementById("questionnaireFocusControls").scrollIntoView({behavior:"instant",block:"start"});true');
    await screenshot('questionnaire-focus-mobile');
    for(const width of [320,768,1366]){await viewport(width);assert(await e('document.documentElement.scrollWidth<=innerWidth+1'));}
    await e(`answers=${JSON.stringify(originalAnswers)};persistQuestionnaireAnswers();renderQuestionnaire();true`);originalAnswers=null;
    await e(`fetch('/api/career-actions/preferences',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(${JSON.stringify(originalPreferences)})}).then(()=>true)`);originalPreferences=null;
    await e('signOut();true');
    await wait('location.pathname==="/" && typeof quickLogin==="function"');
    await e('quickLogin("hr_company");true');
    await wait('location.pathname==="/workspace" && typeof user!=="undefined" && user?.role==="hr_company"');
    await e('showTab("screening").then(()=>true)');
    await wait('typeof scrn!=="undefined" && scrn?.results?.length && !!document.querySelector("#screenReview h2")');
    await e('resetScreenFilters();true');
    const first=await e('filteredScreenRows()[0]');
    await e(`setScreenSearch(${JSON.stringify(first.name)});true`);
    assert((await e('filteredScreenRows()')).every(row=>row.name.includes(first.name)));
    await e('setScreenSearch("__no_matching_candidate__2026");true');
    assert.equal(await e('filteredScreenRows().length'),0);
    assert.match(await e('document.getElementById("screenReview").innerText'),/no candidate/i);
    await e('resetScreenFilters();true');
    const initial=await e('screenReviewCid');
    await e('screenReviewStep(1);true');
    assert.notEqual(await e('screenReviewCid'),initial);
    await e('setScreenDecisionFilter("Pending");true');
    assert(await e('filteredScreenRows().every(row=>getCandidateDecision(scrn.vacancy.id,row.candidate_id)==="Pending")'));
    await e('resetScreenFilters();true');
    const injectedName = `O'Neil "><img src=x onerror="window.__qaInjected=1">`;
    await e(`(()=>{
      const row=scrn.results[0];window.__qaRow=JSON.parse(JSON.stringify(row));
      row.name=${JSON.stringify(injectedName)};row.to_confirm=['<img src=x onerror="window.__qaInjected=1">'];
      screenReviewCid=row.candidate_id;renderScreen();
      window.__qaInterview=openInterviewForCandidate;
      openInterviewForCandidate=(id,name,role)=>{window.__qaInviteName=name;};
      return true;
    })()`);
    await realClick('#screenReview button[onclick^="openInterviewForCandidate"]');
    assert.equal(await e('window.__qaInviteName'),injectedName,'Names with quotes must survive action arguments without executing HTML or JS');
    await e('openInsight(scrn.results[0].candidate_id);true');
    assert.equal(await e('!!document.getElementById("insight").querySelector("[onerror]")'),false);
    assert.equal(await e('window.__qaInjected||0'),0);
    await e('closeInsight();Object.assign(scrn.results[0],window.__qaRow);openInterviewForCandidate=window.__qaInterview;renderScreen();true');
    assert.equal(await e('document.querySelector(".screening-guide").open'),false);
    for(const width of [320,390,768,1366]){
      await viewport(width);
      assert(await e('document.documentElement.scrollWidth<=innerWidth+1'),`Hiring review overflow at ${width}`);
      if(width===390){await e('document.getElementById("screenReview").scrollIntoView({behavior:"instant",block:"start"});true');await screenshot('hiring-review-mobile');}
    }
    assert.equal(b.exceptions.length,0,JSON.stringify(b.exceptions));
    console.log('PASS: real career-action create/reflection/completion/undo/delete, cancel safety, reload persistence, network retry, preference saves; focused questionnaire/back/conditional area; hiring search/filter/next review; 320/390/768/1366px; test records removed.');
  } finally {
    try{
      if(createdId)await e(`fetch('/api/career-actions/${createdId}',{method:'DELETE'}).then(()=>true)`);
      if(originalPreferences)await e(`fetch('/api/career-actions/preferences',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(${JSON.stringify(originalPreferences)})}).then(()=>true)`);
      if(originalAnswers)await e(`answers=${JSON.stringify(originalAnswers)};persistQuestionnaireAnswers();true`);
    }catch(_){} b.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
