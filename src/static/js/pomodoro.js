/* A deadline-based timer: background tabs and refreshes do not reset the clock. */
window.PomodoroTimer = (() => {
  const durations = {focus:25*60, break:5*60};
  const instances = new WeakMap();
  const format = seconds => `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
  function mount({identity, container}) {
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
    const tr = text => window.careerLensLocale?.translate(text) || text;
    let audio = null;
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
      start.textContent=tr(state.deadline!==null?'Pause':state.remaining<durations[state.mode]?'Resume':state.mode==='focus'?'Start focus':'Start break');
      find('[data-timer-count]').textContent=String(state.completed);
      find('[data-timer-sound]').textContent=tr(state.sound?'Sound on':'Sound off');
      find('[data-timer-sound]').setAttribute('aria-pressed',String(state.sound));
      container.querySelectorAll('[data-timer-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.timerMode===state.mode)));
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
    const interval=window.setInterval(tick,1000);
    document.addEventListener('visibilitychange',tick);
    window.addEventListener('pageshow',tick);
    window.addEventListener('pagehide',save);
    instances.set(container,{interval});
    window.careerLensLocale?.apply();
  }
  return {mount};
})();
