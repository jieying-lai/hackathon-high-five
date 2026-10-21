const assert=require('node:assert/strict');
const create=require('../src/static/js/page-position.js');
function browser(storage=new Map(),maxY=5000,navigationType='reload'){
 const handlers={},docHandlers={},timers=new Map();let timerId=0;
 const win={performance:{getEntriesByType:()=>[{type:navigationType}]},location:{pathname:'/workspace'},history:{},scrollX:0,scrollY:0,maxY,
  sessionStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)},
  document:{body:{},visibilityState:'visible',addEventListener:(type,fn)=>docHandlers[type]=fn},
  addEventListener:(type,fn)=>handlers[type]=fn,
  setTimeout:(fn,delay)=>{timers.set(++timerId,{fn,delay});return timerId},clearTimeout:id=>timers.delete(id),
  requestAnimationFrame:fn=>queueMicrotask(fn),scrollTo:({left,top})=>{win.scrollX=left;win.scrollY=Math.min(top,win.maxY)},
  ResizeObserver:class {constructor(fn){win.resize=fn}observe(){}disconnect(){win.resize=null}},
 };
 win.fire=type=>handlers[type]?.();win.flush=delay=>{for(const [id,timer]of [...timers])if(timer.delay<=delay){timers.delete(id);timer.fn();}};
 return win;
}
(async()=>{
 const store=new Map();let view='dash';const win=browser(store),api=create(win);
 const options={identity:'user-a',portal:'talent',getView:()=>view,isValid:id=>['dash','radar','plan'].includes(id)};
 api.initialize(options);await api.restore(async(id,flags)=>{assert(flags.restore);view=id},'dash');
 view='radar';win.scrollY=930;win.scrollX=7;win.fire('pagehide');
 assert.equal(store.size,1);const key=[...store.keys()][0];assert.deepEqual(JSON.parse(store.get(key)),{view:'radar',x:7,y:930});
 const reload=browser(store,400),restored=create(reload);view='dash';restored.initialize(options);
 reload.scrollY=0;reload.fire('scroll');reload.flush(100);assert.equal(JSON.parse(store.get(key)).y,930,'Loading cannot overwrite saved position');
 await restored.restore(async id=>{await Promise.resolve();view=id},'dash');assert.equal(view,'radar');assert.equal(reload.scrollY,400);
 reload.maxY=5000;reload.resize();assert.equal(reload.scrollY,930,'Late layout changes restore original position');
 reload.fire('wheel');reload.scrollY=1200;reload.fire('scroll');reload.flush(100);assert.equal(JSON.parse(store.get(key)).y,1200);
 assert.equal(reload.resize,null,'User interaction stops automatic scrolling');
 const loginStore=new Map(store),login=browser(loginStore,5000,'navigate'),loginApi=create(login);view='dash';
 loginApi.initialize(options);await loginApi.restore(async id=>{view=id},'dash');assert.equal(view,'dash','Fresh login starts at Dashboard, not a stale profile page');
 const other=browser(store),otherApi=create(other);view='dash';otherApi.initialize({...options,identity:'user-b'});
 await otherApi.restore(async id=>{view=id},'dash');assert.equal(view,'dash');assert.equal(other.scrollY,0);
 const malformed=browser(new Map([[key,'{"view":"missing","x":0,"y":1000}']])),malformedApi=create(malformed);
 malformedApi.initialize(options);await malformedApi.restore(async id=>{view=id},'dash');assert.equal(view,'dash');
 const interrupted=browser(store),interruptApi=create(interrupted);view='dash';interruptApi.initialize(options);
 interruptApi.navigate();view='plan';interrupted.scrollY=250;interruptApi.complete();
 let rendered=false;await interruptApi.restore(()=>{rendered=true},'dash');assert.equal(rendered,false);assert.equal(view,'plan');assert.equal(interrupted.scrollY,250);
 const unavailable=browser();unavailable.sessionStorage={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')},removeItem(){throw Error('blocked')}};
 const fallback=create(unavailable);fallback.initialize(options);await fallback.restore(async id=>view=id,'dash');fallback.save();fallback.clear();
 api.clear();assert.equal(store.has(key),false,'Sign out clears the current account position');
 console.log('PASS: refresh retains active view and scroll, waits for async content, handles layout shifts/user interaction, isolates accounts, tolerates unavailable storage and clears on sign out.');
})().catch(error=>{console.error(error);process.exitCode=1});
