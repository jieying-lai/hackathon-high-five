/* Real public quiz -> results -> guided CV. No account or CV is created. */
const {spawn} = require('node:child_process');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const delay = ms => new Promise(r=>setTimeout(r,ms));
(async()=>{
  fs.mkdirSync('.test-tmp',{recursive:true});
  const port=9227;
  const browser=spawn('/repl/tools/bin/chromium',['--headless','--no-sandbox','--disable-dev-shm-usage',`--remote-debugging-port=${port}`,`--user-data-dir=/tmp/careerlens-dialog-${Date.now()}`,'about:blank'],{stdio:'ignore'});
  let ws;
  try {
    for(let i=0;i<100;i++){try{await fetch(`http://127.0.0.1:${port}/json/version`);break;}catch{await delay(100);}}
    const target=await(await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'})).json();
    ws=new WebSocket(target.webSocketDebuggerUrl);
    await new Promise(r=>ws.addEventListener('open',r,{once:true}));
    const callbacks=new Map(),errors=[];let seq=0;
    ws.addEventListener('message',event=>{
      const m=JSON.parse(event.data);
      if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
      if(!m.id)return;
      const cb=callbacks.get(m.id);callbacks.delete(m.id);
      m.error?cb.reject(new Error(JSON.stringify(m.error))):cb.resolve(m.result);
    });
    const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;callbacks.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
    const evaluate=async expression=>{
      const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
      if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));
      return r.result.value;
    };
    const wait=async expression=>{
      for(let i=0;i<150;i++){if(await evaluate(expression))return;await delay(100);}
      throw Error('Timed out: '+expression);
    };
    const click=selector=>evaluate(`document.querySelector(${JSON.stringify(selector)}).click();true`);
    const answer=async value=>{
      await evaluate(`(()=>{const el=document.getElementById("guidedAnswer");el.focus();el.value=${JSON.stringify(value)};el.dispatchEvent(new Event("input",{bubbles:true}));return true;})()`);
    };
    const step=()=>evaluate('JSON.parse(sessionStorage.getItem("careerlens_guided_cv_draft")).step');
    const layout=async()=>{
      for(const width of [320,390,768,1366]){
        await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<768});
        await delay(60);
        assert(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),`Conversation overflow at ${width}px`);
      }
      await send('Emulation.setDeviceMetricsOverride',{width:390,height:900,deviceScaleFactor:1,mobile:true});
    };
    const screenshot=async name=>{
      const image=await send('Page.captureScreenshot',{format:'png'});
      fs.writeFileSync(`.test-tmp/guided-${name}.png`,Buffer.from(image.data,'base64'));
    };
    await send('Page.enable');await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride',{width:390,height:900,deviceScaleFactor:1,mobile:true});
    await send('Page.navigate',{url:`https://${process.env.REPLIT_DEV_DOMAIN}/`});
    await wait('typeof startTotemQuiz==="function"');
    await evaluate('startTotemQuiz();true');
    await evaluate('recordAnswer(1,1);true');await delay(320);
    // Going back cancels a pending auto-advance, rather than moving again after Back.
    await evaluate('recordAnswer(2,1);prevQuestion();true');await delay(330);
    assert(await evaluate('document.querySelector("#totemQuizCard .likert-btn").getAttribute("onclick").includes("recordAnswer(1,")'));
    for(let q=1;q<=10;q++){await evaluate(`recordAnswer(${q},1);true`);await delay(310);}
    await wait('!!document.querySelector("[data-guided-step=\\"1\\"]")');
    assert.equal(await evaluate('document.querySelector(".guided-extra").open'),false);
    await click('[data-guided-action=deep]');
    assert.equal(await evaluate('document.querySelectorAll(".role-model-choice").length'),3);
    await click('[data-guided-action=model]');
    assert.equal(await evaluate('document.getElementById("guidedRoleModelDetail").hidden'),false);
    await click('[data-guided-action=careers]');
    assert.equal(await evaluate('document.querySelector(".guided-extra").open'),false);
    await click('[data-guided-action=cv]');
    assert.equal(await step(),0);
    await answer('Software Engineer');
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
    await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
    assert.equal(await step(),1);
    assert.equal(await evaluate('document.querySelectorAll("[data-guided-action=next]").length'),0);
    await layout();await screenshot('single-choice-mobile');
    await click('[data-guided-action=choice][data-value="Still studying"]');
    assert.equal(await step(),2,'Single answer should advance without Continue');
    await click('[data-guided-action=back]');
    assert.equal(await step(),1);
    assert.equal(await evaluate('document.querySelector("[data-value=\\"Still studying\\"]").getAttribute("aria-pressed")'),'true');
    await click('[data-guided-action=choice][data-value="3–5 years"]');
    await click('[data-guided-action=choice][data-value="Hybrid"]');
    assert.equal(await step(),3);
    await click('[data-guided-action=choice][data-value="Communication"]');
    await click('[data-guided-action=choice][data-value="Programming"]');
    assert.equal(await step(),3,'Multi-select should wait for explicit confirmation');
    await click('[data-guided-action=back]');
    assert.equal(await step(),2);
    assert.equal(await evaluate('document.querySelector("[data-value=Hybrid]").getAttribute("aria-pressed")'),'true');
    await click('[data-guided-action=choice][data-value="Remote"]');
    assert.equal(await evaluate('document.querySelectorAll(".cv-dialog-options [aria-pressed=true]").length'),2,'Skills must survive Back');
    await layout();await screenshot('multiple-choice-mobile');
    await click('[data-guided-action=next]');
    assert.equal(await step(),4);
    await answer('Built a study planner.');
    await click('[data-guided-action=next]');
    await answer('Computing');
    await click('[data-guided-action=next]');
    assert.equal(await step(),6);
    assert.equal(await evaluate('document.querySelector(".guided-extra").open'),false);
    await click('.guided-extra summary');
    assert.match(await evaluate('document.querySelector(".cv-dialog-preview").innerText'),/Software Engineer.*3–5 years.*Remote.*Programming.*Computing/s);
    await click('[data-guided-action=back]');
    assert.equal(await evaluate('document.getElementById("guidedAnswer").value'),'Computing');
    await click('[data-guided-action=next]');
    await layout();
    await click('[data-guided-action=finish]');
    await wait('!document.getElementById("auth").classList.contains("hidden")');
    assert.equal(await evaluate('JSON.parse(sessionStorage.getItem("careerlens_guided_cv_draft")).ready'),true);
    assert.equal(await evaluate('JSON.parse(sessionStorage.getItem("careerlens_guided_cv_draft")).answers.work_mode'),'Remote');
    assert.deepEqual(errors,[]);
    console.log('PASS: actual public quiz, safe Back during auto-advance, concise expandable results, one-tap single answers, editable previous answers, explicit multi-select confirmation, draft review and login handoff; 320/390/768/1366px; no CV created.');
  } finally {ws?.close();browser.kill();}
})().catch(error=>{console.error(error);process.exitCode=1;});
