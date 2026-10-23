/* Only the current account's local completions and labelled fictional examples. */
window.LearningCelebrations=(()=>{
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const examples=[['Maya','Introduction to Psychology'],['Daniel','Python for Everybody'],['Sofia','Financial Planning for Young Adults'],['Amir','Introduction to Sustainability']];
  const paused=new Map();
  function markup(identity,demo,tr=s=>s){
    const courses=window.LearningPath?.completedCourses(identity)||[];
    const unique=new Map();
    for(const c of courses){const title=c.title||c.course_title||c.skill||c.target_skill;if(typeof title==='string'&&title.trim())unique.set(c.url||title,{name:tr('You'),title,example:false});}
    const items=[...unique.values()].slice(0,6);
    if(demo)items.push(...examples.map(([name,title])=>({name,title,example:true})));
    const stopped=paused.get(identity)===true;
    const cards=items.map(item=>`<li class="celebration-item"><span class="celebration-star" aria-hidden="true">✦</span><span><strong data-no-translate>${esc(item.name)}</strong> <span>${esc(tr('completed'))}</span> <b data-no-translate title="${esc(item.title)}">${esc(item.title)}</b>${item.example?` <small>${esc(tr('Example'))}</small>`:''}</span><span aria-hidden="true">🎉</span></li>`).join('');
    if(!items.length)return '';
    return `<section class="learning-celebrations ${stopped?'is-paused':''}" aria-label="${esc(tr('Learning celebrations'))}"><div class="celebration-window" tabindex="0" role="button" aria-pressed="${stopped}" aria-label="${esc(tr(stopped?'Resume celebrations':'Pause celebrations'))}" data-celebration-toggle><div class="celebration-track"><ul>${cards}</ul><ul aria-hidden="true" inert>${cards}</ul></div></div></section>`;
  }
  function bind(container,identity,tr=s=>s){
    const row=container.querySelector('[data-celebration-toggle]');
    const toggle=()=>{const stopped=!(paused.get(identity)===true);paused.set(identity,stopped);row.closest('.learning-celebrations').classList.toggle('is-paused',stopped);row.setAttribute('aria-pressed',String(stopped));row.setAttribute('aria-label',tr(stopped?'Resume celebrations':'Pause celebrations'));};
    row?.addEventListener('click',toggle);
    row?.addEventListener('keydown',event=>{if(event.key===' '||event.key==='Enter'){event.preventDefault();toggle();}});
  }

  return {markup,bind};
})();
