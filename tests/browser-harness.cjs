const {spawn} = require('node:child_process');
const fs = require('node:fs');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = async function browserHarness(port=9228) {
  const profile = fs.mkdtempSync('/tmp/careerlens-browser-');
  const chrome = spawn('/repl/tools/bin/chromium', [
    '--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu',
    `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank',
  ], {stdio:'ignore'});
  let target;
  for(let i=0;i<100;i++) {
    try {
      const tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      target = tabs.find(tab=>tab.type==='page');
      if(target) break;
    } catch(_) {}
    await delay(100);
  }
  if(!target) {chrome.kill();throw Error('Chromium did not start');}
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(resolve=>socket.addEventListener('open',resolve,{once:true}));
  let sequence=0;const callbacks=new Map();const exceptions=[];
  socket.addEventListener('message',event=>{
    const message=JSON.parse(event.data);
    if(message.method==='Runtime.exceptionThrown')exceptions.push(message.params.exceptionDetails);
    const callback=callbacks.get(message.id);
    if(callback){callbacks.delete(message.id);message.error?callback.reject(Error(JSON.stringify(message.error))):callback.resolve(message.result);}
  });
  const send=(method,params={})=>new Promise((resolve,reject)=>{
    const id=++sequence;callbacks.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));
  });
  const evaluate=async expression=>{
    const result=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
    if(result.exceptionDetails)throw Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
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
  const realClick=async selector=>{
    const point=await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});el.scrollIntoView({block:'center',behavior:'instant'});const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
    await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});
    await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});
  };
  const viewport=async width=>{
    await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<768});
    await delay(120);
  };
  const screenshot=async name=>{
    fs.mkdirSync('.test-tmp',{recursive:true});
    const result=await send('Page.captureScreenshot',{format:'png'});
    fs.writeFileSync(`.test-tmp/${name}.png`,Buffer.from(result.data,'base64'));
  };
  await send('Page.enable');await send('Runtime.enable');await send('Network.enable');
  await viewport(390);
  return {send,evaluate,wait,click,realClick,viewport,screenshot,exceptions,delay,
    navigate: path=>send('Page.navigate',{url:`https://${process.env.REPLIT_DEV_DOMAIN}${path}`}),
    close:()=>{socket.close();chrome.kill();setTimeout(()=>{try{fs.rmSync(profile,{recursive:true,force:true});}catch(_){}},500).unref();},
  };
};
