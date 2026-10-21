/* Learning stamps reflect self-reported course completion, never a role-match score. */
window.SDGPassport = (() => {
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const goals=[
    ['No Poverty','#e5243b'],['Zero Hunger','#dda63a'],['Good Health and Well-being','#4c9f38'],
    ['Quality Education','#c5192d'],['Gender Equality','#ff3a21'],['Clean Water and Sanitation','#26bde2'],
    ['Affordable and Clean Energy','#fcc30b'],['Decent Work and Economic Growth','#a21942'],
    ['Industry, Innovation and Infrastructure','#fd6925'],['Reduced Inequalities','#dd1367'],
    ['Sustainable Cities and Communities','#fd9d24'],['Responsible Consumption and Production','#bf8b2e'],
    ['Climate Action','#3f7e44'],['Life Below Water','#0a97d9'],['Life on Land','#56c02b'],
    ['Peace, Justice and Strong Institutions','#00689d'],['Partnerships for the Goals','#19486a']];
  const sprites=[[210,130],[493,130],[765,130],[1041,130],[1322,130],[208,379],[490,379],[765,379],[1041,379],[1320,379],[199,629],[489,629],[762,629],[1034,629],[1320,629],[615,870],[906,870]];
  const cells=[[5.25,26.4],[20.4,26.4],[35,26.4],[5.25,45],[20.4,45],[35,45],[5.25,63.6],[20.4,63.6],[35,63.6],[51.6,26.4],[66.5,26.4],[81.3,26.4],[51.6,45],[66.5,45],[81.3,45],[51.6,63.6],[66.5,63.6]];
  const states=new WeakMap();
  function stamp(number,animate=false,index=0){
    const [x,y]=sprites[number-1];
    return `<span class="passport-stamp-art ${animate?'passport-stamp-new':''}" aria-hidden="true" style="background-position:${(x-130)/1276*100}% ${(y-130)/764*100}%;--stamp-tilt:${number%2?-9:7}deg;--stamp-delay:${Math.min(index,5)*100}ms"></span>`;
  }
  function render({container,user,role,roles,onLearn,locale}){
    if(!container||!user)return;
    const tr=text=>locale?.translate(text)||text;
    let state=states.get(container);
    if(!state||state.identity!==user.unique_uid){state={identity:user.unique_uid,open:false,selected:4};states.set(container,state);}
    let activity={};
    try{activity=JSON.parse(localStorage.getItem('cl_learning_'+user.unique_uid)||'{}')||{};}catch{}
    const courses=new Map();
    for(const r of roles||[])for(const course of r.ordered_pathway||[])courses.set(JSON.stringify([course.target_skill,course.url]),course);
    for(const course of window.DiscoveryLearning?.catalogue||[])courses.set(JSON.stringify([course.target_skill,course.url]),course);
    const completed=[];
    for(const [key,item] of Object.entries(activity)){
      if(item?.status!=='completed')continue;
      let parsed;try{parsed=JSON.parse(key);}catch{continue;}
      if(!Array.isArray(parsed)||parsed.length!==2||parsed.some(s=>typeof s!=='string'))continue;
      const course=courses.get(key)||(typeof item.sdg==='string'?{target_skill:parsed[0],url:parsed[1],sdg:item.sdg,course_title:item.course_title,hours:item.hours}:null);
      if(course)completed.push({...course,updated:Number.isFinite(item.completed_at)?item.completed_at:Number.isFinite(item.updated)?item.updated:null});
    }
    const evidence=Array.from({length:17},()=>[]);
    for(const course of completed){
      const seen=new Set();
      for(const match of String(course.sdg||'').matchAll(/\bSDG\s*(1[0-7]|[1-9])(?!\d)(?:\.\d+)?/gi)){
        const number=Number(match[1]);if(!seen.has(number)){evidence[number-1].push(course);seen.add(number);}
      }
    }
    const earned=evidence.map((items,i)=>items.length?i+1:null).filter(Boolean);
    const seenKey='cl_passport_seen_v1:'+user.unique_uid;
    let seen=[];try{const raw=JSON.parse(sessionStorage.getItem(seenKey)||'[]');if(Array.isArray(raw))seen=raw;}catch{}
    const newGoals=earned.filter(n=>!seen.includes(n));
    const hours=completed.reduce((sum,c)=>sum+(Number.isFinite(c.hours)&&c.hours>0?c.hours:0),0);
    const date=value=>new Date(value).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'});
    container.classList.add('sdg-passport');
    container.innerHTML=`<div class="passport-cover-view" ${state.open?'hidden':''}>
      <button type="button" class="passport-cover-button" data-passport-open aria-label="Open your SDG passport" aria-expanded="false" aria-controls="passportInterior"></button>
      <h2 data-no-translate>${esc(user.full_name)}</h2><p>${esc(tr('A little learning. A lasting journey.'))}</p>
      <button type="button" class="passport-cover-open" data-passport-open aria-expanded="false" aria-controls="passportInterior">${esc(tr('Open my passport'))} <span aria-hidden="true">↗</span></button>
      <p class="mt-3">${earned.length} / 17 ${esc(tr('learning stamps collected'))}</p></div>
      <div id="passportInterior" class="passport-interior" ${state.open?'':'hidden'}>
       <div class="passport-toolbar"><div><h2>${esc(tr('Every small step leaves a mark.'))}</h2><p>${esc(tr('Your personal SDG learning journey'))}</p></div><div class="passport-tools"><button type="button" class="passport-action" data-passport-close>↶ ${esc(tr('Close passport'))}</button><button type="button" class="passport-action" data-passport-print>↗ ${esc(tr('Print / save as PDF'))}</button></div></div>
       <div class="passport-profile"><div><small>${esc(tr('Passport holder'))}</small><h3 data-no-translate>${esc(user.full_name)}</h3><code data-no-translate>${esc(user.unique_uid)}</code></div><div class="passport-role-summary"><small>${esc(tr('Target role'))}</small><strong data-no-translate>${esc(role?.title||'Choose your next career goal')}</strong><p>${completed.length} ${esc(tr('completed courses'))} · ${hours} h ${esc(tr('recorded learning'))}</p></div><div class="passport-total"><b data-no-translate>${earned.length}<span>/ 17</span></b><span>${esc(tr('learning stamps'))}</span></div></div>
       <div class="passport-book" role="group" aria-label="SDG stamp collection">
        <img class="passport-book-art" src="/static/passport/open-passport.png" width="1448" height="1086" alt="" aria-hidden="true" />
        ${goals.map(([name,color],i)=>`<button type="button" class="passport-goal" data-passport-goal="${i+1}" aria-pressed="${state.selected===i+1}" aria-controls="passportEvidence" aria-label="SDG ${i+1}: ${esc(name)}. ${evidence[i].length?'Stamp earned':'Not yet earned'}. View learning milestone." style="left:${cells[i][0]}%;top:${cells[i][1]}%;--sdg-color:${color}"><span class="passport-goal-name"><b>SDG ${i+1}</b>${esc(tr(name))}</span>${evidence[i].length?stamp(i+1,state.open&&newGoals.includes(i+1),i):'<span class="passport-empty-stamp" aria-hidden="true">SDG '+(i+1)+'</span>'}</button>`).join('')}
        <span class="passport-book-count" data-no-translate>${earned.length}</span>
       </div>
       <p class="passport-book-legend">${esc(tr('Gold stamp = completed learning. Empty circle = a milestone to explore.'))}</p>
       <section id="passportEvidence" class="passport-evidence" aria-live="polite"></section>
       ${role?`<details class="passport-career-details"><summary>${esc(tr('My career details'))}</summary><div class="passport-career-columns"><div><h3>${esc(tr('Skills to build'))}</h3><p>${esc(role.skills_gap?.join(' · ')||tr('No skill gap'))}</p><p>${Number.isFinite(role.match_score)?role.match_score:0}% ${esc(tr('match'))} · ${Number.isFinite(role.estimated_total_hours)?role.estimated_total_hours:0} h ${esc(tr('estimated learning'))}</p></div><div><h3>${esc(tr('SDG alignment'))}</h3>${(role.sdg_tags||[]).map(tag=>`<p><strong>${esc(tag.code)}</strong> · ${esc(tag.reason)}</p>`).join('')}<p>${esc(tr('Role alignment suggests a direction; completed learning earns a stamp.'))}</p></div></div></details>`:''}
       <footer class="passport-footer"><span>${esc(tr('Self-reported learning milestones, saved on this device.'))}</span><span data-no-translate>CAREERLENS / ${esc(user.unique_uid)}</span></footer>
      </div>`;
    const cover=container.querySelector('.passport-cover-view'),interior=container.querySelector('.passport-interior');
    function markSeen(){try{sessionStorage.setItem(seenKey,JSON.stringify(earned));}catch{}}
    function showEvidence(number,focus=false){
      state.selected=number;
      container.querySelectorAll('[data-passport-goal]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.passportGoal)===number)));
      const items=evidence[number-1];
      const mapped=[...courses.values()].filter(c=>new RegExp('\\bSDG\\s*'+number+'(?!\\d)(?:\\.\\d+)?','i').test(c.sdg||''));
      const unique=[...new Map(mapped.map(c=>[JSON.stringify([c.target_skill,c.url]),c])).values()];
      const title=`SDG ${number} · ${goals[number-1][0]}`;
      const panel=container.querySelector('#passportEvidence');
      panel.innerHTML=`<div class="passport-evidence-symbol" aria-hidden="true">${items.length?stamp(number):number}</div><div><span class="passport-evidence-label ${items.length?'':'is-locked'}">${esc(tr(items.length?'Stamp earned':'Not yet earned'))}</span><h3 tabindex="-1">${esc(title)}</h3>${items.length?`<p>${esc(tr('Your completed learning behind this stamp'))}</p><ul>${items.map(c=>`<li><strong>${esc(c.target_skill)}</strong> · ${esc(c.sdg)}${c.updated?' · '+esc(date(c.updated)):''}</li>`).join('')}</ul>`:unique.length?`<p>${esc(tr('Complete a mapped course and mark it Completed to collect this stamp.'))}</p><ul>${unique.slice(0,4).map(c=>`<li>${esc(c.target_skill)} · ${esc(c.sdg)}</li>`).join('')}</ul>`:`<p>${esc(tr('No course in your current learning paths maps to this goal yet. It stays open for a future milestone.'))}</p>`}<button type="button" class="passport-action" data-passport-learn>${esc(tr('Go to my learning plan'))} →</button></div>`;
      panel.querySelector('[data-passport-learn]').addEventListener('click',()=>onLearn?.(number));
      if(focus){
        panel.querySelector('h3').focus({preventScroll:true});
        panel.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
      }
    }
    function open(){
      state.open=true;cover.hidden=true;interior.hidden=false;
      container.querySelectorAll('[data-passport-open]').forEach(b=>b.setAttribute('aria-expanded','true'));
      newGoals.forEach((number,i)=>{
        const art=container.querySelector(`[data-passport-goal="${number}"] .passport-stamp-art`);
        art?.classList.add('passport-stamp-new');art?.style.setProperty('--stamp-delay',`${Math.min(i,5)*100}ms`);
      });
      markSeen();container.querySelector('[data-passport-close]').focus({preventScroll:true});
    }
    container.querySelectorAll('[data-passport-open]').forEach(button=>button.addEventListener('click',open));
    container.querySelector('[data-passport-close]').addEventListener('click',event=>{
      event.preventDefault();
      event.stopPropagation();
      state.open=false;interior.hidden=true;cover.hidden=false;
      container.querySelectorAll('[data-passport-open]').forEach(b=>b.setAttribute('aria-expanded','false'));
      container.querySelector('[data-passport-open]').focus({preventScroll:true});
      // The interior is much taller: bring the cover back into view on this same click.
      container.scrollIntoView({behavior:'instant',block:'start'});
    });
    container.querySelectorAll('[data-passport-goal]').forEach(button=>button.addEventListener('click',()=>showEvidence(Number(button.dataset.passportGoal),true)));
    container.querySelector('[data-passport-print]').addEventListener('click',()=>{
      document.body.classList.add('passport-printing');
      window.addEventListener('afterprint',()=>document.body.classList.remove('passport-printing'),{once:true});
      window.print();
    });
    showEvidence(state.selected);
    if(state.open)markSeen();
    locale?.apply();
  }
  return {render};
})();
