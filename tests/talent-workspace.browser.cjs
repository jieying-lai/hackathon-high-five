/* Run against the development workflow: node tests/talent-workspace.browser.cjs
 * Uses an isolated browser profile; does not save, replace or delete user CVs.
 */
const {spawn} = require('node:child_process');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const delay = ms => new Promise(r=>setTimeout(r,ms));
(async()=>{
  assert(process.env.REPLIT_DEV_DOMAIN,'REPLIT_DEV_DOMAIN is required');
  fs.mkdirSync('.test-tmp',{recursive:true});
  const port = 9226;
  const browser = spawn(process.env.CHROMIUM_PATH || '/repl/tools/bin/chromium',[
    '--headless','--no-sandbox','--disable-dev-shm-usage',`--remote-debugging-port=${port}`,
    `--user-data-dir=/tmp/careerlens-workspace-${Date.now()}`,'about:blank'
  ],{stdio:'ignore'});
  let ws;
  const errors=[];
  try {
    for(let i=0;i<100;i++){try{await fetch(`http://127.0.0.1:${port}/json/version`);break;}catch{await delay(100);}}
    const target=await(await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'})).json();
    ws=new WebSocket(target.webSocketDebuggerUrl);
    await new Promise(r=>ws.addEventListener('open',r,{once:true}));
    let id=0, loads=0;const callbacks=new Map();
    ws.addEventListener('message',event=>{
      const m=JSON.parse(event.data);
      if(m.method==='Page.loadEventFired')loads++;
      if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text+' '+(m.params.exceptionDetails.exception?.description||''));
      if(!m.id)return;
      const cb=callbacks.get(m.id);callbacks.delete(m.id);
      if(m.error)cb.reject(new Error(JSON.stringify(m.error)));else cb.resolve(m.result);
    });
    const send=(method,params={})=>new Promise((resolve,reject)=>{
      const key=++id;callbacks.set(key,{resolve,reject});ws.send(JSON.stringify({id:key,method,params}));
    });
    const evaluate=async expression=>{
      const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
      if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));
      return r.result.value;
    };
    const wait=async expression=>{
      for(let i=0;i<200;i++){
        try{if(await evaluate(expression))return;}
        catch(error){if(!/navigated or closed|Execution context was destroyed|Cannot find context/.test(error.message))throw error;}
        await delay(100);
      }
      throw Error('Timed out: '+expression);
    };
    const click=selector=>evaluate(`document.querySelector(${JSON.stringify(selector)}).click();true`);
    const viewport=async width=>{
      await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<768});
      await delay(120);
    };
    const screenshot=async name=>{
      const result=await send('Page.captureScreenshot',{format:'png'});
      fs.writeFileSync(`.test-tmp/workspace-${name}.png`,Buffer.from(result.data,'base64'));
    };
    await send('Page.enable');await send('Runtime.enable');
    await viewport(390);
    await send('Page.navigate',{url:`https://${process.env.REPLIT_DEV_DOMAIN}/`});
    await wait('typeof quickLogin==="function"');
    if (!process.env.EMPLOYER_ONLY) {
    await evaluate('quickLogin("job_seeker");true');
    await wait('location.pathname==="/workspace" && typeof user!=="undefined" && !!user && typeof showTab==="function"');
    await wait('typeof analysed!=="undefined" && analysed && !!roles.length');
    for(const tab of ['dash','jobs','companies','atlas','profile','cv-review','quest','applications','plan','discover','saved','completed','passport','radar']){
      await evaluate(`showTab(${JSON.stringify(tab)}).then(()=>true)`);
      if(tab==='radar')await wait('!!document.querySelector(".fr-scenario-grid")');
      await delay(250);
      for(const width of [320,390,768,1366]){
        await viewport(width);
        const layout=await evaluate(`(()=>{
          const section=document.getElementById('tab-${tab}');
          const nav=section.querySelector('.growth-navigation');
          const badButtons=nav?[...nav.querySelectorAll('button')].filter(b=>{
            const r=b.getBoundingClientRect(),n=nav.getBoundingClientRect();
            return r.height<43 || r.left<n.left-1 || r.right>n.right+1 || b.scrollWidth>b.clientWidth+1;
          }).map(b=>b.textContent.trim()):[];
          return {scroll:document.documentElement.scrollWidth,width:innerWidth,badButtons,
            navScroll:nav?nav.scrollWidth-nav.clientWidth:0,
            overflowing:[...section.querySelectorAll('*')].filter(el=>{
              const r=el.getBoundingClientRect();return r.width>0 && r.right>innerWidth+2 && getComputedStyle(el).position!=='absolute';
            }).slice(0,8).map(el=>el.id||el.className)};
        })()`);
        assert(layout.scroll<=layout.width+1,`${tab}@${width} overflow: ${JSON.stringify(layout)}`);
        assert.equal(layout.navScroll,0,`${tab}@${width} navigation scrolls`);
        assert.deepEqual(layout.badButtons,[],`${tab}@${width} clipped navigation buttons`);
        if(['plan','discover'].includes(tab) && width<701){
          assert(await evaluate(`(()=>{
            const timer=document.getElementById('learningPomodoro');
            return !timer.hidden && timer.parentElement.id==='tab-${tab}' &&
              getComputedStyle(timer).position==='relative';
          })()`),`${tab}@${width}: focus timer must be in-flow, not over course content`);
        }
        if(width===390 && ['dash','jobs','profile','plan','radar'].includes(tab)){
          await evaluate('window.scrollTo({top:0,behavior:"instant"});true');
          await screenshot(`${tab}-mobile`);
        }
      }
    }
    await viewport(390);
    await evaluate('openGlobalAtlas();true');
    await wait('!!document.querySelector("#tab-atlas .atlas-role-option")');
    assert.equal(await evaluate('document.getElementById("globalAtlasModal").parentElement.id'),'atlasPanelSlot');
    assert.equal(await evaluate('document.getElementById("globalAtlasModal").getAttribute("role")'),'region');
    assert.equal(await evaluate('document.getElementById("globalAtlasModal").hasAttribute("aria-modal")'),false);
    assert.notEqual(await evaluate('getComputedStyle(document.body).overflowY'),'hidden','Inline atlas must not lock page scrolling');
    assert.equal(await evaluate('document.querySelectorAll("#tab-atlas details[open]").length'),0);
    assert(await evaluate('document.querySelector("#tab-atlas canvas").getBoundingClientRect().height>100'));
    await evaluate('showCityCard("tokyo");true');
    assert.equal(await evaluate('document.querySelector(".atlas-field select").value'),'tokyo');
    assert.match(await evaluate('document.querySelector(".atlas-hub h4").innerText'),/Tokyo/);
    await click('.atlas-role-option:last-child');
    assert.equal(await evaluate('document.querySelectorAll(".atlas-role-option[aria-pressed=true]").length'),1);
    await click('.atlas-routine-disclosure summary');
    assert.equal(await evaluate('document.querySelector(".atlas-routine-disclosure").open'),true);
    await evaluate('shuffleAtlasRoutine();true');
    assert.match(await evaluate('document.getElementById("atlasRoutineVariantBadge").innerText'),/Variation/);
    await screenshot('inline-atlas-mobile');
    await evaluate('showTab("jobs").then(()=>true)');
    assert.equal(await evaluate('document.getElementById("tab-atlas").classList.contains("hidden")'),true);
    await evaluate('showTab("profile").then(()=>true)');
    await evaluate('openProfileTotemQuizModal();true');
    assert.match(await evaluate('document.getElementById("profileQuizCardBody").innerText'),/Question 1/);
    await evaluate('recordProfileAnswer(1,1);true');
    await wait('document.getElementById("profileQuizCardBody").innerText.includes("Question 2")');
    await evaluate('closeProfileTotemQuizModal();true');
    await evaluate('showTab("plan").then(()=>true)');
    await click('#learningPomodoro [data-timer-collapse]');
    assert.equal(await evaluate('document.querySelector("#learningPomodoro .pomodoro-body").hidden'),false);
    await click('#learningPomodoro [data-timer-start]');
    assert.equal(await evaluate('document.getElementById("learningPomodoro").dataset.running'),'true');
    await click('#learningPomodoro [data-timer-start]');
    assert.equal(await evaluate('document.getElementById("learningPomodoro").dataset.running'),'false');
    await click('#learningPomodoro [data-timer-reset]');
    await click('#learningPomodoro [data-timer-collapse]');
    await evaluate('showTab("radar").then(()=>true)');
    assert.equal(await evaluate('getComputedStyle(document.getElementById("legacyRadar")).display'),'none');
    assert.equal(await evaluate('document.querySelectorAll("#tab-dash [onclick*=openGlobalAtlas]").length'),0);
    assert.equal(await evaluate('document.querySelectorAll("#tab-radar [data-careers-navigation] button[onclick*=atlas]").length'),1);
    assert.equal(await evaluate('document.querySelectorAll(".fr-scenario-grid button").length'),3);
    assert.equal(await evaluate('document.querySelectorAll(".fr-planning-controls input[type=range]").length'),3);
    assert(await evaluate('Boolean(document.querySelector(".fr-matrix [role=cell] button"))'));
    const initialMatrix = await evaluate('document.getElementById("frMatrixPresentation").innerText');
    await evaluate('document.getElementById("frHorizon").focus();true');
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});
    await send('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});
    assert.equal(await evaluate('document.getElementById("frHorizon").value'),'30');
    assert.equal(await evaluate('document.activeElement.id'),'frHorizon','Range focus must survive live updates');
    for(const [id,value] of [['frHorizon',60],['frAdoption',100],['frHours',8]]){
      await evaluate(`(()=>{const el=document.getElementById("${id}");el.value="${value}";el.dispatchEvent(new Event("input",{bubbles:true}));return true;})()`);
    }
    assert.notEqual(await evaluate('document.getElementById("frMatrixPresentation").innerText'),initialMatrix);
    assert.match(await evaluate('document.querySelector(".fr-planning-insight").innerText'),/60 months.*8-hour/s);
    await click('[data-radar-action="matrix-unit"][data-value="share"]');
    assert.match(await evaluate('document.querySelector(".fr-matrix-legend").innerText'),/Share of practice/);
    await viewport(390);
    await evaluate('document.querySelector(".fr-planning").scrollIntoView({behavior:"instant",block:"start"});true');
    await screenshot('aurora-radar-matrix-mobile');
    await evaluate('document.querySelector(".fr-matrix").scrollIntoView({behavior:"instant",block:"start"});true');
    await screenshot('aurora-radar-matrix-cells-mobile');
    await viewport(1366);
    await evaluate('document.querySelector(".fr-planning").scrollIntoView({behavior:"instant",block:"start"});true');
    await screenshot('aurora-radar-matrix-desktop');
    await click('[data-radar-action="reset-planning"]');
    assert.equal(await evaluate('document.getElementById("frHorizon").value'),'24');
    assert.equal(await evaluate('document.getElementById("frAdoption").value'),'50');
    assert.equal(await evaluate('document.getElementById("frHours").value'),'4');
    await viewport(390);
    const observed=await evaluate('(async()=>{const d=await(await fetch("/api/market/signals")).json();return Object.fromEntries(d.remote.rows.map(r=>[r.skill,r.share_pct]));})()');
    for(const lens of ['steady','copilot','accelerated']){
      await click(`[data-radar-action="scenario"][data-value="${lens}"]`);
      assert.equal(await evaluate(`document.querySelector('.fr-scenario-grid [aria-pressed=true]').dataset.value`),lens);
      const displayed=await evaluate('[...document.querySelectorAll(".fr-signal")].map(b=>[b.dataset.value,b.querySelector("b").textContent])');
      for(const [skill,value] of displayed)assert.equal(value,observed[skill]+'%','Planning scenarios must not rewrite observations');
    }
    await click('[data-radar-action="skill"]');
    assert(await evaluate('Boolean(document.querySelector(".fr-evidence a[href^=\\"https://remotive.com/\\"]"))'));
    await click('[data-radar-action="follow"]');
    assert.equal(await evaluate('document.querySelector("[data-radar-action=follow]").getAttribute("aria-pressed")'),'true');
    await click('[data-radar-action="filter"][data-value="followed"]');
    assert.equal(await evaluate('document.querySelectorAll(".fr-signal").length'),1);
    await evaluate('document.querySelector(".fr-explorer").scrollIntoView({behavior:"instant",block:"start"});true');
    await screenshot('radar-skill-mobile');
    await click('[data-radar-action="dataset"][data-value="malaysia"]');
    await click('[data-radar-action="filter"][data-value="all"]');
    assert(await evaluate('Boolean(document.querySelector(".fr-paired"))'));
    assert.match(await evaluate('document.querySelector(".fr-source-strip").innerText'),/2025/);
    assert.match(await evaluate('document.querySelector(".fr-window-details").innerText'),/postings/);
    await viewport(1366);
    await evaluate('document.querySelector(".fr-explorer").scrollIntoView({behavior:"instant",block:"start"});true');
    await screenshot('radar-history-desktop');
    await click('[data-radar-action="refresh"]');
    await wait('!document.querySelector("[data-radar-action=refresh]").disabled');
    // Check the followed skill survives navigation and a full reload.
    const previousLoads=loads;
    await send('Page.reload');
    for(let i=0;i<200 && loads===previousLoads;i++)await delay(100);
    assert(loads>previousLoads,'Reload did not finish');
    await wait('typeof user!=="undefined" && !!user && typeof showTab==="function"');
    await evaluate('showTab("radar").then(()=>true)');
    await wait('!!document.querySelector(".fr-scenario-grid")');
    await click('[data-radar-action="filter"][data-value="followed"]');
    assert.equal(await evaluate('document.querySelectorAll(".fr-signal").length'),1);
    // Sign out through the real endpoint before the homepage's signed-in redirect.
    await evaluate('(async()=>{const response=await fetch("/api/auth/logout",{method:"POST"});if(!response.ok)throw new Error("Logout failed");return true;})()');
    }
    // Switch roles through the existing demo login, never by bypassing authentication.
    await send('Page.navigate',{url:`https://${process.env.REPLIT_DEV_DOMAIN}/`});
    await wait('typeof quickLogin==="function" && location.pathname==="/"');
    await evaluate('quickLogin("hr_company");true');
    await wait('location.pathname==="/workspace" && document.body?.classList.contains("responsive-employer") && typeof user!=="undefined" && !!user && typeof showTab==="function"');
    for(const tab of ['overview','vacancies','screening','heatmap','shortlisting','reskill']){
      await evaluate(`showTab(${JSON.stringify(tab)}).then(()=>true)`);
      await delay(300);
      for(const width of [320,390,768,1366]){
        await viewport(width);
        const layout=await evaluate(`(()=>{
          const section=document.getElementById('tab-${tab}');
          const nav=section.querySelector('.overview-subnav,.screening-nav');
          const buttons=nav?[...nav.querySelectorAll('button')]:[];
          const profile=section.querySelector('[data-outline-label="Company profile"]');
          const profileButtons=profile?[...profile.querySelectorAll('button')]:[];
          const clipped=[...buttons,...profileButtons].filter(el=>{
            const b=el.getBoundingClientRect();
            return b.width && (b.left < -1 || b.right>innerWidth+1 || el.scrollWidth>el.clientWidth+2);
          }).map(el=>el.textContent.trim());
          return {width:innerWidth,scroll:document.documentElement.scrollWidth,clipped,navScroll:nav?nav.scrollWidth-nav.clientWidth:0};
        })()`);
        assert(layout.scroll<=layout.width+1,`employer ${tab}@${width} overflows: ${JSON.stringify(layout)}`);
        assert.equal(layout.navScroll,0,`employer ${tab}@${width} navigation scrolls`);
        assert.deepEqual(layout.clipped,[],`employer ${tab}@${width} clipped controls`);
        if(width===390){
          await evaluate('window.scrollTo({top:0,behavior:"instant"});true');
          await screenshot('aurora-employer-'+tab+'-mobile');
        }
      }
    }
    await viewport(390);
    await evaluate('showTab("overview").then(()=>true)');
    for(const subtab of ['ovtab-pulse','ovtab-analytics','ovtab-strategy','ovtab-podium']){
      await evaluate(`showOvTab("${subtab}");true`);
      assert.equal(await evaluate(`document.getElementById("${subtab}").classList.contains("hidden")`),false);
      assert(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),`employer subtab ${subtab} overflows`);
    }
    await evaluate('showOvTab("ovtab-pulse");openAccountModal();true');
    assert(await evaluate('!document.getElementById("accountModalWrap").classList.contains("hidden")'));
    assert(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'company profile modal overflows');
    await screenshot('aurora-employer-profile-mobile');
    assert.deepEqual(errors,[],'Unhandled browser errors: '+errors.join('\n'));
    console.log(process.env.EMPLOYER_ONLY
      ? 'PASS: 6 employer screens at 320/390/768/1366px; four overview subtabs; unclipped company actions and navigation; company profile modal; no unhandled errors.'
      : 'PASS: 14 talent and 6 employer screens at 320/390/768/1366px; inline atlas city/role/routine controls without modal or scroll lock; company overview/profile; interactive matrix; unchanged observations; no unhandled errors.');
  } finally {ws?.close();browser.kill();}
})().catch(error=>{console.error(error);process.exitCode=1;});
