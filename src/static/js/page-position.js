/* Per-browser-tab view and scroll restoration. No form contents are stored. */
(function(root,factory){
 if(typeof module==='object'&&module.exports)module.exports=factory;
 else root.PagePosition=factory(root);
})(typeof window==='undefined'?globalThis:window,function(win){
 let key=null,readView=null,isValid=null,pending=null,ready=false,navigating=false,interrupted=false;
 let timer=null,observer=null,unlockTimer=null,locked=false,target=null;
 try{win.history.scrollRestoration='manual';}catch(_){}
 function read(){try{return JSON.parse(win.sessionStorage.getItem(key)||'null');}catch(_){return null;}}
 function save(){
  if(!key||!ready||locked)return;
  const view=readView();if(!isValid(view))return;
  try{win.sessionStorage.setItem(key,JSON.stringify({view,x:navigating?0:Math.max(0,win.scrollX||0),y:navigating?0:Math.max(0,win.scrollY||0)}));}catch(_){}
 }
 function unlock(){
  if(observer)observer.disconnect();observer=null;
  if(unlockTimer!==null)win.clearTimeout(unlockTimer);unlockTimer=null;
  locked=false;save();
 }
 function navigate(){interrupted=true;pending=null;unlock();navigating=true;ready=true;}
 function complete(){navigating=false;save();}
 function isReload(){
  try{
   const entry=win.performance?.getEntriesByType?.('navigation')?.[0];
   if(entry)return entry.type==='reload';
   return win.performance?.navigation?.type===1;
  }catch(_){return false;}
 }
 function initialize(options){
  key='cl_page_position_v1:'+win.location.pathname+':'+options.portal+':'+options.identity;
  readView=options.getView;isValid=options.isValid;ready=false;interrupted=false;navigating=false;
  // A fresh login/navigation starts at the portal dashboard. Only an actual
  // browser refresh may reuse the last view and scroll position for this tab.
  const saved=isReload()?read():null;
  if(!saved){try{win.sessionStorage.removeItem(key);}catch(_){}}
  pending=saved&&isValid(saved.view)&&Number.isFinite(saved.x)&&Number.isFinite(saved.y)&&saved.x>=0&&saved.y>=0?saved:null;
 }
 const frame=()=>new Promise(resolve=>win.requestAnimationFrame(resolve));
 async function restore(render,fallback){
  if(interrupted){ready=true;save();return;}
  const saved=pending;pending=null;
  await render(saved?saved.view:fallback,{restore:true});
  if(interrupted)return;
  await frame();await frame();
  if(interrupted)return;
  target=saved?{left:saved.x,top:saved.y,behavior:'instant'}:{left:0,top:0,behavior:'instant'};
  locked=true;ready=true;
  win.scrollTo(target);
  if(win.ResizeObserver&&saved){
   observer=new win.ResizeObserver(()=>{if(locked)win.scrollTo(target);});observer.observe(win.document.body);
   unlockTimer=win.setTimeout(unlock,1500);
  }else unlock();
 }
 function clear(){try{if(key)win.sessionStorage.removeItem(key);}catch(_){}key=null;ready=false;pending=null;unlock();}
 win.addEventListener('scroll',()=>{if(timer!==null)win.clearTimeout(timer);timer=win.setTimeout(save,100);},{passive:true});
 win.addEventListener('pagehide',()=>{if(locked)unlock();save();});
 win.document.addEventListener('visibilitychange',()=>{if(win.document.visibilityState==='hidden')save();});
 for(const type of ['wheel','touchstart','pointerdown','keydown'])win.addEventListener(type,()=>{
  if(locked)unlock();
  else if(key&&!ready){pending=null;}
 },{passive:true});
 return {initialize,restore,navigate,complete,save,clear};
});
