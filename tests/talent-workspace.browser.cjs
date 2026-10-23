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
      for(let i=0;i<200;i++){if(await evaluate(expression))return;await delay(100);}
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
    await evaluate('quickLogin("job_seeker");true');
    await wait('location.pathname==="/workspace" && typeof user!=="undefined" && !!user && typeof showTab==="function"');
    await wait('typeof analysed!=="undefined" && analysed && !!roles.length');
    for(const tab of ['dash','jobs','companies','profile','cv-review','quest','applications','plan','discover','saved','completed','passport','radar']){
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
    assert.equal(await evaluate('document.querySelectorAll("#tab-radar [data-careers-navigation] [onclick*=openGlobalAtlas]").length'),1);
    assert.equal(await evaluate('document.querySelectorAll(".fr-scenario-grid button").length'),3);
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
    assert.deepEqual(errors,[],'Unhandled browser errors: '+errors.join('\n'));
    console.log('PASS: 13 talent screens at 320/390/768/1366px; readable wrapping navigation; atlas access; three scenarios preserve observed values; evidence links; followed skills survive reload; historical window comparison; source refresh; no unhandled errors.');
  } finally {ws?.close();browser.kill();}
})().catch(error=>{console.error(error);process.exitCode=1;});
