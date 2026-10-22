/* Interest-based exploration. No CV text or sensitive personal traits are used. */
window.DiscoveryLearning = (() => {
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const sdgTitle=s=>[s.reason,s.evidence_quote?`${s.evidence_field||'Evidence'}: ${s.evidence_quote}`:''].filter(Boolean).join(' · ');
  const topics=[['psychology','🧠','Psychology'],['money','💰','Money & everyday life'],['nature','🌿','Nature & ecology'],['people','🤝','People & inclusion'],['sustainability','♻️','Sustainable living']];
  const sdgNames={1:'No Poverty',2:'Zero Hunger',3:'Good Health and Well-Being',4:'Quality Education',5:'Gender Equality',6:'Clean Water and Sanitation',7:'Affordable and Clean Energy',8:'Decent Work and Economic Growth',9:'Industry, Innovation and Infrastructure',10:'Reduced Inequalities',11:'Sustainable Cities and Communities',12:'Responsible Consumption and Production',13:'Climate Action',14:'Life Below Water',15:'Life on Land',16:'Peace, Justice and Strong Institutions',17:'Partnerships for the Goals'};
  const catalogue=[
    {id:'starting-psychology',topic:'psychology',target_skill:'Understanding mind and behaviour',course_title:'Starting with psychology',provider:'OpenLearn · The Open University',sdg:'SDG 4',url:'https://www.open.edu/openlearn/health-sports-psychology/psychology/starting-psychology/content-section-0',outcome:'Keep a short reflection on how context, thoughts and behaviour can influence everyday wellbeing.'},
    {id:'yale-psychology',topic:'psychology',target_skill:'Exploring human psychology',course_title:'Introduction to Psychology',provider:'Open Yale Courses · Yale University',sdg:'SDG 4',url:'https://oyc.yale.edu/introduction-psychology/psyc-110',outcome:'Compare two explanations of a familiar human behaviour using ideas from the lectures.'},
    {id:'everyday-money',topic:'money',target_skill:'Personal finance literacy',course_title:'You and your money',provider:'OpenLearn · The Open University',sdg:'SDG 4',url:'https://www.open.edu/openlearn/money-business/personal-finance/you-and-your-money/content-section-0',outcome:'Create a sample monthly budget and explain the costs and risks of different borrowing choices.'},
    {id:'ecology',topic:'nature',target_skill:'Ecology and ecosystem awareness',course_title:'Introducing the environment: Ecology and ecosystems',provider:'OpenLearn · The Open University',sdg:'SDG 15',url:'https://www.open.edu/openlearn/nature-environment/environmental-studies/introducing-the-environment-ecology-and-ecosystems',outcome:'Map the relationships between living things in a small ecosystem near you.'},
    {id:'inclusion',topic:'people',target_skill:'Inclusive thinking and collaboration',course_title:'Diversity and inclusion in the workplace',provider:'OpenLearn · The Open University',sdg:'SDG 10',url:'https://www.open.edu/openlearn/money-business/diversity-and-inclusion-the-workplace/content-section-overview',outcome:'Suggest three practical ways to make a study group or community activity more inclusive.'},
    {id:'circular-resources',topic:'sustainability',target_skill:'Waste and resource awareness',course_title:'Waste management and environmentalism in China',provider:'OpenLearn · The Open University',sdg:'SDG 12',hours:8,url:'https://www.open.edu/openlearn/nature-environment/environmental-studies/waste-management-and-environmentalism-china/content-section-0',outcome:'Review a week of household waste and propose one change to reduce, reuse or recycle resources.'}
  ].map(c=>{const goal=Number(/SDG\s*(\d+)/i.exec(c.sdg)?.[1]||4),learningSupport=goal===4;return {...c,sdgs:[{goal,code:`SDG ${goal}`,name:sdgNames[goal],alignment_type:learningSupport?'learning_support':'course_topic',confidence:learningSupport?'fallback':'curated',label_source:learningSupport?'platform_rule':'curated',human_validated:false,reason:learningSupport?'This course supports learning and lifelong education. This is a general learning contribution, not a topic-specific impact claim.':'The course subject directly addresses this Sustainable Development Goal.'}],source:'discovery',cost_type:'Free learning',malaysia_badge:'Explore your interests'};});
  const views=new WeakMap();
  function favourite(saved,attribute,tr){
    const label=tr(saved?'Remove from wishlist':'Save course');
    return `<button type="button" class="course-favourite" ${attribute} aria-pressed="${!!saved}" aria-label="${esc(label)}" title="${esc(label)}"><span aria-hidden="true">${saved?'❤':'♡'}</span></button>`;
  }
  const courseKey=c=>JSON.stringify([c.target_skill,c.url]);
  const goal=c=>Number(/SDG\s*(\d+)/i.exec(c.sdg)?.[1]);
  function read(key,fallback){try{const value=JSON.parse(localStorage.getItem(key)||'null');return value??fallback;}catch{return fallback;}}
  function hash(value){let result=2166136261;for(const c of value){result^=c.charCodeAt(0);result=Math.imul(result,16777619);}return result>>>0;}
  function renderCurated(options){
    const {identity,container,refresh,locale}=options;
    if(!container)return;
    const tr=text=>locale?.translate(text)||text;
    let view=views.get(container);if(!view||view.identity!==identity){view={identity,all:false,goal:null};views.set(container,view);}view.options=options;
    const prefKey='cl_discovery_interests_v1:'+identity;
    const raw=read(prefKey,[]);
    const interests=Array.isArray(raw)?raw.filter(id=>topics.some(t=>t[0]===id)):[];
    const stored=read('cl_learning_'+identity,{});
    const activity=stored&&typeof stored==='object'&&!Array.isArray(stored)?stored:{};
    const earned=new Set();
    for(const entry of Object.values(activity))if(entry?.status==='completed')for(const match of String(entry.sdg||'').matchAll(/\bSDG\s*(1[0-7]|[1-9])(?!\d)/gi))earned.add(Number(match[1]));
    const activeTopics=new Set(catalogue.filter(c=>['learning','completed'].includes(activity[courseKey(c)]?.status)||activity[courseKey(c)]?.saved).map(c=>c.topic));
    function score(c){const state=activity[courseKey(c)]||{};return (interests.includes(c.topic)?100:0)+(state.saved?24:0)+(activeTopics.has(c.topic)?12:0)+(!earned.has(goal(c))?20:0)+(state.status==='learning'?35:0)-(state.status==='completed'?250:0);}
    const ranked=[...catalogue].sort((a,b)=>score(b)-score(a)||hash(identity+':'+a.id)-hash(identity+':'+b.id));
    const available=view.goal?ranked.filter(c=>goal(c)===view.goal):ranked;
    // Offer topic variety before filling the three recommendation slots.
    const chosen=[],seenTopics=new Set();
    for(const c of available)if(!seenTopics.has(c.topic)){chosen.push(c);seenTopics.add(c.topic);}
    for(const c of available)if(!chosen.includes(c))chosen.push(c);
    const visible=view.all?available:chosen.slice(0,3);
    function reason(c){
      if(interests.includes(c.topic))return tr('Matches an interest you chose.');
      if(activity[courseKey(c)]?.saved)return tr('You saved this for later.');
      if(activeTopics.has(c.topic))return tr('Builds on a topic you have explored.');
      if(!earned.has(goal(c)))return tr('Explore a new SDG learning stamp.');
      return tr('Try a fresh perspective.');
    }
    container.classList.add('discovery-learning');
    container.innerHTML=`<div class="discovery-heading" data-outline-label="Explore learning"><div><span class="discovery-eyebrow">✦ ${esc(tr('Follow your curiosity'))}</span><h2>${esc(tr('Explore a new side of you'))}</h2><p>${esc(tr('Choose your interests. Discover learning beyond your current career path.'))}</p></div></div>
      <div class="discovery-topics" role="group" aria-label="Learning interests">${topics.map(([id,icon,label])=>`<button type="button" data-discovery-topic="${id}" aria-pressed="${interests.includes(id)}"><span aria-hidden="true">${icon}</span> ${esc(tr(label))}</button>`).join('')}</div>
      <p class="discovery-personalisation">${esc(tr('Suggestions adapt to your interests, saved learning and stamps.'))}</p>
      ${view.goal?`<div class="discovery-goal-filter">SDG ${view.goal}<button type="button" data-clear-discovery-goal>${esc(tr('Show all goals'))} ×</button></div>`:''}
      <div class="discovery-grid" data-outline-label="Recommended courses">${visible.map(c=>{
        const state=activity[courseKey(c)]||{},topic=topics.find(t=>t[0]===c.topic);
        return `<article class="discovery-card ${state.status==='completed'?'discovery-completed':''}" data-discovery-id="${c.id}"><div class="discovery-card-top"><span class="discovery-icon" aria-hidden="true">${topic[1]}</span>${(c.sdgs||[]).map(s=>`<span class="chip chip-teal" title="${esc(sdgTitle(s))}">${esc(s.code)} · ${esc(tr(s.name))}${s.alignment_type==='learning_support'?' · '+esc(tr('learning support')):''}</span>`).join('')}</div><span class="discovery-provider" data-no-translate>${esc(c.provider)}</span><h3 data-no-translate>${esc(c.course_title)}</h3><p class="discovery-access">${esc(tr('Free learning'))} · ${esc(tr('Self-paced'))} · EN</p><div class="discovery-why"><strong>${esc(tr('Why this is recommended'))}</strong><p>${esc(reason(c))}</p></div><div class="discovery-outcome"><strong>${esc(tr('Try this after learning'))}</strong><p>${esc(tr(c.outcome))}</p></div><p class="discovery-stamp-note">${earned.has(goal(c))?'✓':'✦'} ${esc(tr(earned.has(goal(c))?'This SDG stamp is already in your passport.':'Complete this learning to collect its SDG stamp.'))}</p><div class="discovery-actions"><a class="btn btn-primary" href="${esc(c.url)}" target="_blank" rel="noopener" data-discovery-learn>${esc(tr('Learn skill ↗'))}</a>${favourite(state.saved,'data-discovery-save',tr)}</div><label class="discovery-status">${esc(tr('Learning status'))}<select class="input" data-discovery-status>${[['new','Not started'],['learning','Learning'],['completed','Completed']].map(([value,label])=>`<option value="${value}" ${(state.status||'new')===value?'selected':''}>${esc(tr(label))}</option>`).join('')}</select></label></article>`;
      }).join('')}</div>
      <div class="discovery-footer"><p>${esc(tr('SDG links are learning mappings by CareerLens. Mark Completed after finishing the resource.'))}</p><button type="button" class="btn btn-soft" data-discovery-more aria-expanded="${view.all}">${esc(tr(view.all?'Show recommendations':'Explore all topics'))}</button></div><p class="discovery-message" aria-live="polite" data-discovery-message></p>`;
    const redraw=()=>refresh?refresh():render(options);
    container.querySelectorAll('[data-discovery-topic]').forEach(button=>button.addEventListener('click',()=>{
      const id=button.dataset.discoveryTopic;
      const next=interests.includes(id)?interests.filter(t=>t!==id):[...interests,id];
      try{localStorage.setItem(prefKey,JSON.stringify(next));}catch{container.querySelector('[data-discovery-message]').textContent=tr('Could not save learning progress. Please retry.');return;}
      view.goal=null;redraw();
    }));
    container.querySelector('[data-discovery-more]').addEventListener('click',()=>{view.all=!view.all;render(options);});
    container.querySelector('[data-clear-discovery-goal]')?.addEventListener('click',()=>{view.goal=null;render(options);});
    function save(c,changes){
      if(window.LearningPath.record({identity,step:c,changes})){redraw();return true;}
      return false;
    }
    container.querySelectorAll('[data-discovery-id]').forEach(card=>{
      const c=catalogue.find(c=>c.id===card.dataset.discoveryId),state=activity[courseKey(c)]||{};
      card.querySelector('[data-discovery-learn]').addEventListener('click',()=>{
        if(window.LearningPath.record({identity,step:c,changes:{status:state.status==='completed'?'completed':'learning',updated:Date.now()}}))setTimeout(redraw,0);
      });
      card.querySelector('[data-discovery-save]').addEventListener('click',()=>save(c,{saved:!state.saved}));
      card.querySelector('[data-discovery-status]').addEventListener('change',event=>{
        const status=event.target.value;view.all=true;
        if(save(c,{status,updated:Date.now()})&&status==='completed'&&typeof toast==='function')toast(tr('Learning recorded. Open your passport to see your stamp.'));
      });
    });
    locale?.apply();
  }
  function render(options){
    const {container,identity}=options;
    if(!container)return;
    let view=views.get(container);
    if(!view||view.identity!==identity){view={identity,all:false,goal:null,round:0,query:'',results:null,signature:null,request:0};views.set(container,view);}
    view.options=options;
    if(view.goal)renderCurated(options);else renderModel(options,view);
  }
  function renderSaved(options){
    if(!options.container)return;
    options.container.innerHTML='';
    options.container.classList.add('discovery-saved-page');
    renderWishlist({...options,standalone:true});
  }
  function renderWishlist(options){
    const {container,identity,locale}=options,tr=s=>locale?.translate(s)||s;
    const raw=read('cl_learning_'+identity,{}),activity=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
    const saved=[];
    const knownCourses=new Map();
    for(const role of options.roles||[])for(const course of role.ordered_pathway||[])knownCourses.set(courseKey(course),course);
    for(const course of catalogue)knownCourses.set(courseKey(course),course);
    for(const [key,item] of Object.entries(activity)){
      if(!item?.saved)continue;
      let parts;try{parts=JSON.parse(key);}catch{continue;}
      if(!Array.isArray(parts)||parts.length!==2||parts.some(x=>typeof x!=='string'))continue;
      let url;try{url=new URL(parts[1]);}catch{continue;}
      if(!['http:','https:'].includes(url.protocol)||url.username||url.password)continue;
      const known=knownCourses.get(key);
      saved.push({key,state:item,step:{id:item.recommendation_id,target_skill:parts[0],url:parts[1],source:item.source||known?.source||'career',course_title:item.course_title||known?.course_title||parts[0],provider:item.provider||known?.provider||url.hostname,category:item.category||'',description:item.description||'',sdg:item.sdg||known?.sdg||'',sdgs:Array.isArray(item.sdgs)?item.sdgs:(known?.sdgs||[]),hours:item.hours??known?.hours}});
    }
    saved.sort((a,b)=>(Number(b.state.saved_at)||Number(b.state.updated)||0)-(Number(a.state.saved_at)||Number(a.state.updated)||0)||a.key.localeCompare(b.key));
    const section=document.createElement('section');
    section.className='discovery-wishlist';section.id='additionalCoursesWishlist';
    section.setAttribute('aria-labelledby','additionalCoursesTitle');
    section.innerHTML=`<div class="discovery-wishlist-heading" data-outline-label="Saved courses"><div><span class="discovery-eyebrow">♡ ${esc(tr('Your learning wishlist'))}</span><h3 id="additionalCoursesTitle">${esc(tr('Saved Courses'))} <span class="discovery-wishlist-count">${saved.length}</span></h3><p>${esc(tr('Your career courses and additional courses, saved in one place.'))}</p></div></div>
      ${saved.length?`<div class="discovery-wishlist-grid" data-outline-label="Your saved course list">${saved.map(({step:c,state},index)=>`<article class="discovery-saved-card" data-wishlist-index="${index}"><span class="discovery-provider" data-no-translate>${esc(c.provider)}</span><h4 data-no-translate>${esc(c.course_title)}</h4>${c.category?`<p class="discovery-access" data-no-translate>${esc(c.category)}</p>`:''}<div class="discovery-sdg-tags">${(c.sdgs||[]).map(s=>`<span class="chip chip-teal" title="${esc(sdgTitle(s))}">${esc(s.code||`SDG ${s.goal}`)} · ${esc(tr(s.name||''))}${s.alignment_type==='learning_support'?' · '+esc(tr('learning support')):''}</span>`).join('')||`<span class="chip chip-teal" data-no-translate>${esc(c.sdg||'SDG 4 · Quality Education')}</span>`}</div><div class="discovery-actions"><a class="btn btn-primary" href="${esc(c.url)}" target="_blank" rel="noopener" data-wishlist-learn>${esc(tr(state.status==='completed'?'Revisit course ↗':state.status==='learning'?'Continue learning ↗':'Start learning ↗'))}</a>${favourite(true,'data-wishlist-remove',tr)}</div><label class="discovery-status">${esc(tr('Learning status'))}<select class="input" data-wishlist-status>${[['new','Not started'],['learning','Learning'],['completed','Completed']].map(([value,label])=>`<option value="${value}" ${(state.status||'new')===value?'selected':''}>${esc(tr(label))}</option>`).join('')}</select></label></article>`).join('')}</div>`:`<div class="discovery-wishlist-empty" data-outline-label="Your saved course list">♡ <p>${esc(tr('Your wishlist is ready for a little curiosity.'))}</p><span>${esc(tr('Save any course from your plan or Explore Learning to find it here.'))}</span></div>`}`;
    container.appendChild(section);
    if(!options.standalone){
      const shortcut=document.createElement('button');shortcut.type='button';shortcut.className='btn btn-soft';
      shortcut.textContent='♡ '+tr('Additional courses')+' ('+saved.length+')';
      shortcut.addEventListener('click',()=>{section.scrollIntoView({behavior:'smooth',block:'start'});const heading=section.querySelector('h3');heading.tabIndex=-1;heading.focus({preventScroll:true});});
      container.querySelector('.discovery-heading')?.appendChild(shortcut);
    }
    if(options.standalone&&options.onExplore){
      const explore=document.createElement('button');explore.type='button';explore.className='btn btn-primary';
      explore.textContent=tr('Explore Learning')+' ↗';explore.addEventListener('click',options.onExplore);
      section.querySelector('.discovery-wishlist-heading').appendChild(explore);
    }
    const redraw=()=>options.refresh?options.refresh():options.standalone?renderSaved(options):render(options);
    section.querySelectorAll('[data-wishlist-index]').forEach(card=>{
      const {step,state}=saved[Number(card.dataset.wishlistIndex)];
      const source=document.createElement('span');source.className='chip chip-teal';source.textContent=tr(step.source==='discovery'?'Additional courses':'Career plan');card.prepend(source);
      card.querySelector('[data-wishlist-remove]').addEventListener('click',()=>{
        if(window.LearningPath.record({identity,step,changes:{saved:false}})){redraw();if(typeof toast==='function')toast(tr('Removed from Saved Courses. Your learning progress is kept.'));}
      });
      card.querySelector('[data-wishlist-status]').addEventListener('change',event=>{
        if(window.LearningPath.record({identity,step,changes:{status:event.target.value,updated:Date.now()}}))redraw();
      });
      card.querySelector('[data-wishlist-learn]').addEventListener('click',()=>{
        if(window.LearningPath.record({identity,step,changes:{status:state.status==='completed'?'completed':'learning',updated:Date.now()}}))setTimeout(redraw,0);
      });
    });
    locale?.apply();
  }
  function renderModel(options,view){
    const {container,identity,locale}=options,tr=s=>locale?.translate(s)||s;
    const moreTopics=[...topics,
      ['creative','🎨','Arts & creativity'],['technology','💻','Technology'],['business','💼','Business'],
      ['health','🧘','Health & wellbeing'],['languages','🗣️','Languages & communication'],
      ['science','🔬','Science & space'],['food','🍳','Food & cooking'],['sports','🏃','Sports & fitness'],
      ['travel','🌍','Travel & culture'],['history','🏛️','History & philosophy'],['animals','🦋','Animals & wildlife']];
    const prefKey='cl_discovery_interests_v1:'+identity,feedbackKey='cl_discovery_feedback_v1:'+identity;
    const raw=read(prefKey,[]),interests=Array.isArray(raw)?raw.filter(x=>moreTopics.some(t=>t[0]===x)):[];
    const rawFeedback=read(feedbackKey,{}),feedback=rawFeedback&&typeof rawFeedback==='object'&&!Array.isArray(rawFeedback)?rawFeedback:{};
    const rawActivity=read('cl_learning_'+identity,{}),activity=rawActivity&&typeof rawActivity==='object'&&!Array.isArray(rawActivity)?rawActivity:{};
    const liked=[],completed=[];
    for(const item of Object.values(activity))if(item?.recommendation_id){
      if(item.saved||['learning','completed'].includes(item.status))liked.push(item.recommendation_id);
      if(item.status==='completed')completed.push(item.recommendation_id);
    }
    const disliked=Array.isArray(feedback.disliked)?feedback.disliked:[];
    const seen=Array.isArray(feedback.seen)?feedback.seen:[];
    const payload={interests,query:view.query||'',liked,disliked,exclude:[...new Set([...seen,...completed])].slice(-2000),round:view.round||0};
    const signature=JSON.stringify({interests,query:view.query||'',round:view.round||0});
    const stale=view.signature!==signature;
    if(stale)view.replacing=null;
    const loading=stale||view.loading;
    container.classList.add('discovery-learning');
    const cards=stale?[]:(view.results||[]);
    function modelCardMarkup(c){
      if(c._empty)return `<article class="discovery-card discovery-replacement-empty"><p>${esc(tr('No replacement available. Try another topic or a new batch.'))}</p></article>`;
        const state=activity[courseKey(c)]||{};
        return `<article class="discovery-card" data-model-course="${esc(c.id)}"><div class="discovery-card-top"><span class="discovery-icon" aria-hidden="true">📚</span><span class="chip">${esc(tr('For you'))}</span></div><span class="discovery-provider" data-no-translate>${esc(c.provider)}</span><h3 data-no-translate>${esc(c.course_title)}</h3><p class="discovery-access" data-no-translate>${esc(c.category||'')}</p><div class="discovery-sdg-tags" aria-label="Sustainable Development Goal alignment">${(c.sdgs||[]).map(s=>`<span class="chip chip-teal" title="${esc(sdgTitle(s))}">${esc(s.code||`SDG ${s.goal}`)} · ${esc(tr(s.name||''))}${s.alignment_type==='learning_support'?' · '+esc(tr('learning support')):''}</span>`).join('')}</div><div class="discovery-why"><strong>${esc(tr('Why this is recommended'))}</strong><p>${esc(c.reason)}</p></div><details class="discovery-description"><summary>${esc(tr('About this course'))}</summary><p data-no-translate>${esc(c.description||tr('Open the provider page for course details.'))}</p></details><p class="discovery-access">${esc(tr('Check the provider page for current fees, language and availability.'))}</p><div class="discovery-actions"><a class="btn btn-primary" href="${esc(c.url)}" target="_blank" rel="noopener" data-model-learn>${esc(tr('Learn skill ↗'))}</a>${favourite(state.saved,'data-model-save',tr)}<button class="btn btn-soft" type="button" data-model-dislike>↻ ${esc(tr('Not interested'))}</button></div><label class="discovery-status">${esc(tr('Learning status'))}<select class="input" data-model-status>${[['new','Not started'],['learning','Learning'],['completed','Completed']].map(([value,label])=>`<option value="${value}" ${(state.status||'new')===value?'selected':''}>${esc(tr(label))}</option>`).join('')}</select></label></article>`;
    }
    container.innerHTML=`<div class="discovery-heading" data-outline-label="Explore learning"><div><span class="discovery-eyebrow">✦ ${esc(tr('Follow your curiosity'))}</span><h2>${esc(tr('Explore a new side of you'))}</h2><p>${esc(tr('Choose your interests. Discover learning beyond your current career path.'))}</p></div></div>
      <div class="discovery-topics" role="group" aria-label="Learning interests">${moreTopics.map(([id,icon,label])=>`<button type="button" data-model-topic="${id}" aria-pressed="${interests.includes(id)}">${icon} ${esc(tr(label))}</button>`).join('')}</div>
      <form class="discovery-query" data-model-form><label for="discovery-interest-query">${esc(tr('What would you like to learn?'))}</label><div><input class="input" id="discovery-interest-query" maxlength="500" value="${esc(view.draft??view.query??'')}" placeholder="${esc(tr('e.g. psychology, photography, personal finance (English keywords)'))}"><button class="btn btn-primary" type="submit">✦ ${esc(tr('Recommend for me'))}</button></div></form>
      <p class="discovery-personalisation">${esc(tr('Recommendations adapt to your interests, saved learning and feedback.'))}</p>
      <p role="status" aria-live="polite" class="discovery-model-status">${loading?esc(tr('Finding courses for you…')):view.error?esc(view.error):esc(tr('Courses in the recommendation model'))+': '+esc(view.total||0)}</p>
      <div class="discovery-grid" data-outline-label="Recommended courses" aria-busy="${!!loading}">${cards.map(modelCardMarkup).join('')}</div>
      ${!loading&&!view.error&&!cards.length?`<p class="discovery-empty">${esc(tr('No more matching courses. Change your interests or reset feedback to explore again.'))}</p>`:''}
      <div class="discovery-footer"><p>${esc(tr('Suggestions come from the course dataset. Your feedback is saved on this device for your account.'))}</p><div class="discovery-actions"><button class="btn btn-primary" type="button" data-model-next ${loading||view.replacing?'disabled':''}>↻ ${esc(tr('Recommend another batch'))}</button><button class="btn btn-soft" type="button" data-model-reset>${esc(tr('Reset feedback'))}</button></div></div>`;
    function persist(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{if(typeof toast==='function')toast(tr('Could not save learning progress. Please retry.'),'err');return false;}}
    const redraw=()=>{if(views.get(container)===view)render(options);};
    function next(){
      const latest=read(feedbackKey,{});
      const updated={disliked:Array.isArray(latest?.disliked)?latest.disliked:[],seen:[...new Set([...(Array.isArray(latest?.seen)?latest.seen:[]),...cards.filter(c=>!c._empty).map(c=>c.id)])].slice(-2000)};
      if(persist(feedbackKey,updated)){view.round=(view.round||0)+1;redraw();}
    }
    async function replaceOne(id){
      if(view.replacing||view.loading)return;
      const index=cards.findIndex(c=>c.id===id);if(index<0)return;
      const latest=read(feedbackKey,{});
      const updated={disliked:[...new Set([...(Array.isArray(latest?.disliked)?latest.disliked:[]),id])].slice(-2000),seen:[...new Set([...(Array.isArray(latest?.seen)?latest.seen:[]),id])].slice(-2000)};
      if(!persist(feedbackKey,updated))return;
      view.replacing=id;
      const version=view.request;
      const current=()=>views.get(container)===view&&view.signature===signature&&view.request===version&&!view.goal;
      const findCard=()=>[...container.querySelectorAll('[data-model-course]')].find(card=>card.dataset.modelCourse===id);
      findCard()?.setAttribute('aria-busy','true');findCard()?.classList.add('discovery-replacing');
      container.querySelectorAll('[data-model-dislike],[data-model-next]').forEach(button=>{button.disabled=true;});
      const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),20000);
      try{
        const response=await fetch('/api/discovery/recommend',{method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,
          body:JSON.stringify({...payload,limit:1,disliked:updated.disliked,exclude:[...new Set([...updated.seen,...completed,...cards.filter(c=>!c._empty).map(c=>c.id)])].slice(-2000)})});
        const data=await response.json();if(!response.ok||!data.ok)throw new Error(data.message||'Recommendations are unavailable. Please retry.');
        if(!current())return;
        const replacement=data.courses.find(c=>!cards.some(existing=>existing.id===c.id)&&!updated.disliked.includes(c.id));
        const target=findCard();
        cards[index]=replacement||{id:'empty-'+id,_empty:true};view.total=data.catalogue_size;
        const fresh=read('cl_learning_'+identity,{});if(fresh&&typeof fresh==='object'&&!Array.isArray(fresh))Object.assign(activity,fresh);
        if(target){
          const template=document.createElement('template');template.innerHTML=modelCardMarkup(cards[index]);
          const card=template.content.firstElementChild;target.replaceWith(card);
          if(replacement)bindModelCard(card);
          locale?.apply();
        }
      }catch(error){if(current()&&typeof toast==='function')toast(tr(error.name==='AbortError'?'Recommendations took too long. Please retry.':error.message),'err');}
      finally{
        clearTimeout(timeout);
        if(current()){
          view.replacing=null;
          findCard()?.removeAttribute('aria-busy');findCard()?.classList.remove('discovery-replacing');
          container.querySelectorAll('[data-model-dislike],[data-model-next]').forEach(button=>{button.disabled=false;});
        }
      }
    }
    container.querySelectorAll('[data-model-topic]').forEach(button=>button.addEventListener('click',()=>{
      const id=button.dataset.modelTopic,next=interests.includes(id)?interests.filter(t=>t!==id):[...interests,id];
      if(persist(prefKey,next)){view.round=0;redraw();}
    }));
    container.querySelector('#discovery-interest-query').addEventListener('input',e=>{view.draft=e.target.value;});
    container.querySelector('[data-model-form]').addEventListener('submit',event=>{event.preventDefault();view.query=container.querySelector('#discovery-interest-query').value.trim();view.draft=view.query;view.signature=null;redraw();});
    container.querySelector('[data-model-next]').addEventListener('click',()=>{if(view.error){view.signature=null;redraw();}else next();});
    container.querySelector('[data-model-reset]').addEventListener('click',()=>{if(persist(feedbackKey,{disliked:[],seen:[]})){view.round=0;view.signature=null;redraw();}});
    function bindModelCard(card){
      const c=cards.find(c=>c.id===card.dataset.modelCourse),state=activity[courseKey(c)]||{};
      const save=changes=>{if(window.LearningPath.record({identity,step:c,changes})){options.refresh?options.refresh():redraw();}};
      card.querySelector('[data-model-save]').addEventListener('click',()=>save({saved:!state.saved}));
      card.querySelector('[data-model-learn]').addEventListener('click',()=>{
        if(window.LearningPath.record({identity,step:c,changes:{status:state.status==='completed'?'completed':'learning',updated:Date.now()}}))setTimeout(()=>options.refresh?options.refresh():redraw(),0);
      });
      card.querySelector('[data-model-status]').addEventListener('change',e=>save({status:e.target.value,updated:Date.now()}));
      const dislike=card.querySelector('[data-model-dislike]');dislike.disabled=!!view.replacing;
      dislike.addEventListener('click',()=>replaceOne(c.id));
    }
    container.querySelectorAll('[data-model-course]').forEach(bindModelCard);
    locale?.apply();
    if(stale){
      view.signature=signature;view.loading=true;view.error=null;
      const requestId=++view.request,controller=new AbortController();
      const timeout=setTimeout(()=>controller.abort(),20000);
      fetch('/api/discovery/recommend',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal})
        .then(async response=>{const data=await response.json();if(!response.ok||!data.ok)throw new Error(data.message||'Recommendations are unavailable. Please retry.');return data;})
        .then(data=>{if(views.get(container)!==view||requestId!==view.request||view.goal)return;view.results=data.courses;view.total=data.catalogue_size;view.loading=false;view.error=null;
          redraw();})
        .catch(error=>{if(views.get(container)!==view||requestId!==view.request||view.goal)return;view.loading=false;view.results=[];view.error=error.name==='AbortError'?'Recommendations took too long. Please retry.':error.message;redraw();})
        .finally(()=>clearTimeout(timeout));
    }
  }
  function showGoal(container,number){const view=views.get(container);if(!view||!catalogue.some(c=>goal(c)===number))return false;view.request=(view.request||0)+1;view.signature=null;view.loading=false;view.goal=number;view.all=true;render(view.options);return true;}
  return {render,renderSaved,catalogue,showGoal};
})();
