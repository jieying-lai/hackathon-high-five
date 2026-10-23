/* A deadline-based timer: background tabs and refreshes do not reset the clock. */
window.PomodoroTimer = (() => {
  const durations = {focus:25*60, break:5*60};
  const instances = new WeakMap();
  const format = seconds => `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
  function mount({identity, container, floating=false}) {
    if (!container || instances.has(container)) return;
    const key = 'cl_pomodoro_v1:' + identity;
    let state = {mode:'focus', remaining:durations.focus, deadline:null, completed:0,
      sound:true, collapsed:window.matchMedia('(max-width:1023px)').matches};
    try {
      const saved = JSON.parse(sessionStorage.getItem(key) || 'null');
      if (saved && Object.hasOwn(durations,saved.mode) && Number.isFinite(saved.remaining)
          && saved.remaining>=0 && saved.remaining<=durations[saved.mode]
          && (saved.deadline===null || (Number.isFinite(saved.deadline) && saved.deadline<=Date.now()+durations[saved.mode]*1000))
          && Number.isSafeInteger(saved.completed) && saved.completed>=0) {
        state={...state,...saved, sound:saved.sound!==false, collapsed:!!saved.collapsed};
      }
    } catch {}
    if(floating){
      // Start the floating presentation as a small buddy on its first visit.
      try{if(!localStorage.getItem('cl_pomodoro_position_v1:'+identity))state.collapsed=true;}catch{state.collapsed=true;}
    }
    const tr = text => window.careerLensLocale?.translate(text) || text;
    let audio = null, floatingControls=null;
    const save = () => {try {sessionStorage.setItem(key,JSON.stringify(state));} catch {}};
    container.classList.add('pomodoro');
    container.innerHTML = `<div class="pomodoro-head"><span aria-hidden="true">🍅</span><h2 class="pomodoro-title">Pomodoro buddy</h2><span class="pomodoro-mini" data-timer-mini data-no-translate></span><button type="button" class="pomodoro-toggle" aria-controls="pomodoroBody" data-timer-collapse></button></div>
      <div id="pomodoroBody" class="pomodoro-body"><div class="pomodoro-modes" role="group" aria-label="Timer mode"><button type="button" data-timer-mode="focus">Focus · 25 min</button><button type="button" data-timer-mode="break">Break · 5 min</button></div>
      <div class="pomodoro-art"><img src="/static/illustrations/pomodoro-tomato.png" width="150" height="150" alt="A cheerful tomato study buddy" /></div>
      <div class="pomodoro-clock" role="timer" aria-label="Time remaining" aria-live="off" data-timer-clock data-no-translate></div>
      <p class="pomodoro-status" role="status" aria-live="polite" data-timer-status></p>
      <div class="pomodoro-actions"><button type="button" class="pomodoro-start" data-timer-start></button><button type="button" class="pomodoro-reset" data-timer-reset>↻ <span>Reset</span></button></div>
      <div class="pomodoro-foot"><span><span>Focus sessions</span>: <b data-timer-count data-no-translate></b></span><button type="button" class="pomodoro-sound" data-timer-sound></button></div></div>`;
    const find = selector => container.querySelector(selector);
    const clock=find('[data-timer-clock]'), mini=find('[data-timer-mini]'), body=find('.pomodoro-body');
    const start=find('[data-timer-start]'), collapse=find('[data-timer-collapse]'), status=find('[data-timer-status]');
    function message(text) {status.textContent=tr(text);}
    function remaining() {
      return state.deadline===null ? state.remaining : Math.max(0,Math.ceil((state.deadline-Date.now())/1000));
    }
    function draw() {
      const display=format(remaining());
      clock.textContent=display;mini.textContent=display;
      mini.hidden=!state.collapsed;
      body.hidden=state.collapsed;
      collapse.textContent=state.collapsed?'+':'−';
      collapse.setAttribute('aria-expanded',String(!state.collapsed));
      collapse.setAttribute('aria-label',state.collapsed?'Expand timer':'Minimise timer');
      container.dataset.running=String(state.deadline!==null);
      container.dataset.collapsed=String(state.collapsed);
      if(floating){
        const tomato=container.querySelector('.pomodoro-head>span:first-child');
        tomato.setAttribute('role','button');tomato.tabIndex=state.collapsed?0:-1;
        tomato.removeAttribute('aria-hidden');tomato.setAttribute('aria-label',tr('Expand timer'));
        tomato.setAttribute('aria-expanded',String(!state.collapsed));
      }
      start.textContent=tr(state.deadline!==null?'Pause':state.remaining<durations[state.mode]?'Resume':state.mode==='focus'?'Start focus':'Start break');
      find('[data-timer-count]').textContent=String(state.completed);
      find('[data-timer-sound]').textContent=tr(state.sound?'Sound on':'Sound off');
      find('[data-timer-sound]').setAttribute('aria-pressed',String(state.sound));
      container.querySelectorAll('[data-timer-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.timerMode===state.mode)));
      floatingControls?.reposition();
    }
    function enableAudio() {
      if (!state.sound) return;
      try {
        const Audio=window.AudioContext||window.webkitAudioContext;
        if (Audio && !audio) audio=new Audio();
        audio?.resume().catch(()=>{});
      } catch {}
    }
    function chime() {
      if (!state.sound || audio?.state!=='running') return;
      try {
        for (const [offset,frequency] of [[0,660],[.23,880],[.46,1046]]) {
          const note=audio.createOscillator(), volume=audio.createGain(), at=audio.currentTime+offset;
          note.type='sine';note.frequency.value=frequency;
          volume.gain.setValueAtTime(0,at);volume.gain.linearRampToValueAtTime(.12,at+.02);
          volume.gain.exponentialRampToValueAtTime(.001,at+.35);
          note.connect(volume);volume.connect(audio.destination);note.start(at);note.stop(at+.36);
        }
      } catch {}
    }
    function tick() {
      if (state.deadline!==null && remaining()===0) {
        const focused=state.mode==='focus';
        if (focused) state.completed++;
        state.mode=focused?'break':'focus';state.remaining=durations[state.mode];state.deadline=null;
        const text=focused?'Nice work! Your tomato is ready. Take a little break.':'Break is over. Ready for another small step?';
        message(text);chime();save();
        if (typeof toast==='function') toast(tr(text));
      }
      draw();
    }
    start.addEventListener('click',()=>{
      tick();
      if (state.deadline!==null) {state.remaining=remaining();state.deadline=null;message('Paused. Your tomato will wait.');}
      else {enableAudio();state.deadline=Date.now()+state.remaining*1000;message(state.mode==='focus'?'One small step. You have got this!':'Relax your eyes and stretch a little.');}
      save();draw();
    });
    find('[data-timer-reset]').addEventListener('click',()=>{
      state.deadline=null;state.remaining=durations[state.mode];message('A fresh start, whenever you are ready.');save();draw();
    });
    container.querySelectorAll('[data-timer-mode]').forEach(button=>button.addEventListener('click',()=>{
      if (state.mode===button.dataset.timerMode) return;
      state.mode=button.dataset.timerMode;state.deadline=null;state.remaining=durations[state.mode];
      message(state.mode==='focus'?'One tomato, one small step.':'Time for a little breather.');save();draw();
    }));
    collapse.addEventListener('click',()=>{state.collapsed=!state.collapsed;save();draw();});
    find('[data-timer-sound]').addEventListener('click',()=>{state.sound=!state.sound;enableAudio();save();draw();});
    message(state.deadline!==null?'Welcome back. Your timer is still running.':'One tomato, one small step.');
    tick();
    if(floating)floatingControls=makeFloating(container,identity,tr,()=>{if(state.collapsed){state.collapsed=false;save();draw();}});
    const interval=window.setInterval(tick,1000);
    document.addEventListener('visibilitychange',tick);
    window.addEventListener('pageshow',tick);
    window.addEventListener('pagehide',save);
    instances.set(container,{interval,reposition:()=>floatingControls?.reposition()});
    window.careerLensLocale?.apply();
  }
  function makeFloating(container,identity,tr,expand){
    const key='cl_pomodoro_position_v1:'+identity;
    container.classList.add('pomodoro-floating');
    document.body.appendChild(container);
    const head=container.querySelector('.pomodoro-head');
    head.tabIndex=0;
    head.setAttribute('aria-label',tr('Move Pomodoro buddy with arrow keys. Press Home to return to the left.'));
    head.removeAttribute('title');
    const tomato=head.firstElementChild;
    const tip=document.createElement('div');tip.className='pomodoro-tooltip';tip.id='pomodoroBuddyTooltip';tip.setAttribute('role','tooltip');tip.hidden=true;
    const tipTitle=document.createElement('strong'),tipIntro=document.createElement('p'),tipHelp=document.createElement('p');
    tipHelp.className='pomodoro-tooltip-help';tip.append(tipTitle,tipIntro,tipHelp);document.body.appendChild(tip);
    tomato.setAttribute('aria-describedby',tip.id);
    function hideTip(){tip.hidden=true;}
    function placeTip(){
      if(tip.hidden)return;
      const anchor=tomato.getBoundingClientRect(),box=tip.getBoundingClientRect();
      const right=anchor.right+12;
      const left=right+box.width<=window.innerWidth-12?right:anchor.left-box.width-12;
      tip.style.left=Math.max(12,Math.min(left,window.innerWidth-box.width-12))+'px';
      tip.style.top=Math.max(12,Math.min(anchor.top+(anchor.height-box.height)/2,window.innerHeight-box.height-12))+'px';
    }
    function showTip(){
      if(container.hidden||container.dataset.collapsed!=='true'||container.classList.contains('pomodoro-dragging'))return;
      tipTitle.textContent=tr('Pomodoro buddy');
      tipIntro.textContent=tr('Your little study companion: 25 minutes of focus, then a 5-minute break.');
      tipHelp.textContent=tr('Click to open. Drag the tomato to move.');
      tip.hidden=false;placeTip();
    }
    tomato.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')showTip();});
    tomato.addEventListener('pointerleave',hideTip);tomato.addEventListener('focus',showTip);tomato.addEventListener('blur',hideTip);
    tomato.addEventListener('keydown',event=>{if(event.key==='Escape')hideTip();});
    tomato.addEventListener('click',()=>{
      if(container.classList.contains('pomodoro-inline')&&container.dataset.collapsed==='true')expand();
    });
    let point={x:18,y:window.innerHeight-90},size={width:300,height:null},drag=null,resizing=null;
    try{
      const saved=JSON.parse(localStorage.getItem(key)||'null');
      if(Number.isFinite(saved?.x)&&Number.isFinite(saved?.y))point={x:saved.x,y:saved.y};
      if(Number.isFinite(saved?.width))size.width=Math.max(240,Math.min(600,saved.width));
      if(Number.isFinite(saved?.height))size.height=Math.max(260,Math.min(900,saved.height));
    }catch{}
    const persist=()=>{try{localStorage.setItem(key,JSON.stringify({...point,...size}));}catch{}};
    function reposition(){
      const inline=window.matchMedia('(max-width: 700px)').matches;
      container.classList.toggle('pomodoro-inline',inline);
      if(inline){
        const section=document.querySelector('#tab-plan:not(.hidden), #tab-discover:not(.hidden)');
        const navigation=section?.querySelector('[data-growth-navigation]');
        if(navigation && container.parentElement!==section)navigation.after(container);
        head.setAttribute('aria-label',tr('Focus timer'));
        hideTip();
        return;
      }
      if(container.parentElement!==document.body)document.body.appendChild(container);
      head.setAttribute('aria-label',tr('Move Pomodoro buddy with arrow keys. Press Home to return to the left.'));
      container.style.setProperty('--buddy-width',Math.min(size.width,Math.max(0,window.innerWidth-24))+'px');
      container.style.setProperty('--buddy-height',size.height===null?'auto':Math.min(size.height,Math.max(0,window.innerHeight-24))+'px');
      container.dataset.compact=String(size.width<280||(size.height!==null&&size.height<440));
      if(container.hidden){hideTip();return;}
      if(container.dataset.collapsed!=='true')hideTip();
      const box=container.getBoundingClientRect();
      point.x=Math.max(12,Math.min(point.x,Math.max(12,window.innerWidth-box.width-12)));
      point.y=Math.max(12,Math.min(point.y,Math.max(12,window.innerHeight-box.height-12)));
      container.style.left=point.x+'px';container.style.top=point.y+'px';
      placeTip();
    }
    head.addEventListener('pointerdown',event=>{
      hideTip();
      if(container.classList.contains('pomodoro-inline'))return;
      if(event.button!==0||event.target.closest('button,a,input,select'))return;
      if(container.dataset.collapsed==='true'&&event.target!==head.firstElementChild)return;
      reposition();drag={id:event.pointerId,x:event.clientX,y:event.clientY,startX:point.x,startY:point.y,moved:false,collapsed:container.dataset.collapsed==='true'};
      head.setPointerCapture(event.pointerId);container.classList.add('pomodoro-dragging');event.preventDefault();
    });
    head.addEventListener('pointermove',event=>{
      if(!drag||event.pointerId!==drag.id)return;
      if(Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>6)drag.moved=true;
      if(!drag.moved)return;
      point={x:drag.startX+event.clientX-drag.x,y:drag.startY+event.clientY-drag.y};reposition();
    });
    function stop(event){
      if(!drag||event.pointerId!==drag.id)return;
      const tapped=event.type==='pointerup'&&drag.collapsed&&!drag.moved&&Math.hypot(event.clientX-drag.x,event.clientY-drag.y)<=6;
      if(head.hasPointerCapture(event.pointerId))head.releasePointerCapture(event.pointerId);
      drag=null;container.classList.remove('pomodoro-dragging');persist();
      if(tapped)expand();
    }
    head.addEventListener('pointerup',stop);head.addEventListener('pointercancel',stop);
    head.addEventListener('keydown',event=>{
      if((event.target===head.firstElementChild||event.target===head)&&container.dataset.collapsed==='true'&&(event.key==='Enter'||event.key===' ')){event.preventDefault();expand();return;}
      if(event.target!==head)return;
      if(container.classList.contains('pomodoro-inline'))return;
      const step=event.shiftKey?48:16;
      if(event.key==='Home')point={x:18,y:window.innerHeight-container.getBoundingClientRect().height-18};
      else if(event.key==='ArrowLeft')point.x-=step;
      else if(event.key==='ArrowRight')point.x+=step;
      else if(event.key==='ArrowUp')point.y-=step;
      else if(event.key==='ArrowDown')point.y+=step;
      else return;
      event.preventDefault();reposition();persist();
    });
    container.querySelector('[data-timer-mini]').addEventListener('click',()=>{if(container.dataset.collapsed==='true')expand();});
    const handle=document.createElement('button');handle.type='button';handle.className='pomodoro-resize-handle';
    handle.textContent='↘';handle.title=tr('Drag to resize. Arrow keys adjust size; Home resets.');
    handle.setAttribute('aria-label',tr('Resize Pomodoro buddy'));
    container.appendChild(handle);
    handle.addEventListener('pointerdown',event=>{
      if(event.button!==0)return;
      const box=container.getBoundingClientRect();
      resizing={id:event.pointerId,x:event.clientX,y:event.clientY,width:box.width,height:box.height};
      handle.setPointerCapture(event.pointerId);event.preventDefault();event.stopPropagation();
    });
    function setSize(width,height){
      size={width:Math.max(240,Math.min(600,width)),height:Math.max(260,Math.min(900,height))};
      reposition();
    }
    handle.addEventListener('pointermove',event=>{
      if(!resizing||event.pointerId!==resizing.id)return;
      setSize(resizing.width+event.clientX-resizing.x,resizing.height+event.clientY-resizing.y);
    });
    function stopResize(event){
      if(!resizing||event.pointerId!==resizing.id)return;
      if(handle.hasPointerCapture(event.pointerId))handle.releasePointerCapture(event.pointerId);
      resizing=null;persist();
    }
    handle.addEventListener('pointerup',stopResize);handle.addEventListener('pointercancel',stopResize);
    function resetSize(){size={width:300,height:null};reposition();persist();}
    handle.addEventListener('dblclick',resetSize);
    handle.addEventListener('keydown',event=>{
      const box=container.getBoundingClientRect(),step=event.shiftKey?40:16;
      if(event.key==='Home')resetSize();
      else if(event.key==='ArrowLeft')setSize(box.width-step,box.height);
      else if(event.key==='ArrowRight')setSize(box.width+step,box.height);
      else if(event.key==='ArrowUp')setSize(box.width,box.height-step);
      else if(event.key==='ArrowDown')setSize(box.width,box.height+step);
      else return;
      event.preventDefault();persist();
    });
    window.addEventListener('resize',()=>{reposition();persist();});
    reposition();persist();
    return {reposition};
  }
  function setVisible(container,visible){
    if(!container)return;
    container.hidden=!visible;
    instances.get(container)?.reposition();
  }
  return {mount,setVisible};
})();
