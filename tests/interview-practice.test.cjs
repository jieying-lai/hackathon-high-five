const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
async function check(language){
 const elements=new Map();
 function el(id){if(!elements.has(id))elements.set(id,{value:'',style:{},hidden:false,innerHTML:'',options:[],addEventListener(){},showModal(){this.open=true},close(){this.open=false},focus(){},scrollIntoView(){}});return elements.get(id)}
 const sent=[],application={company_name:'Example <Company>',vacancy_title:'Frontend Developer'};
 const context={document:{getElementById:el,querySelectorAll:()=>[],createElement:()=>({click(){}})},parent:{postMessage:m=>sent.push(m)},location:{origin:'http://localhost',search:'?lang='+language},window:{scrollTo(){},addEventListener(){},speechSynthesis:{cancel(){}}},innerWidth:1280,innerHeight:900,URLSearchParams,URL,Blob,setTimeout:()=>1,clearTimeout(){},fetch:async()=>({ok:true,json:async()=>({cv:{applications:[application],structured_cv:{skills:['React','SQL']}}})})};
 vm.createContext(context);vm.runInContext(fs.readFileSync('src/static/interview-room/app.js','utf8'),context);
 await new Promise(resolve=>setImmediate(resolve));assert.equal(el('setup').open,true);assert.equal(el('interviewLanguage').value,language);assert(el('application').innerHTML.includes('&lt;Company&gt;'));el('application').value='0';el('application').onchange();assert.equal(el('company').value,application.company_name);assert.equal(el('customRole').value,'Frontend Developer');
 el('interviewLanguage').value=language;el('level').value='Entry level';el('jd').value='Build tested, accessible websites.';el('setupForm').onsubmit({preventDefault(){}});assert.equal(el('studio').hidden,false);assert.equal(el('answerPanel').hidden,false);assert.equal(el('feedbackPanel').hidden,false);assert(el('question').textContent.includes('Frontend Developer'));
 el('answer').value='';el('submitAnswer').onclick();assert.equal(el('answer').readOnly,false);
 for(let i=0;i<6;i++){
  el('answer').value=i===1?(language==='zh'?'我不会 React。':"I have no experience with React."):(language==='zh'?'我在项目中负责这个任务，先确认问题，再进行测试，最后完成交付。':'In a real project I clarified the goal, tested the change, and delivered the result.');
  el('submitAnswer').onclick();assert.equal(el('answer').readOnly,true);assert.equal(el('answerPanel').hidden,false);assert.equal(el('feedbackPanel').hidden,false);assert(el('questionList').innerHTML.includes('✓'));assert(el('feedback').innerHTML.includes('suggestion'));
  if(i===1){assert(el('feedback').innerHTML.includes(language==='zh'?'我目前还没有 React':'haven’t used React'));el('retry').onclick();assert.equal(el('answer').readOnly,false);assert.equal(el('answerPanel').hidden,false);assert.equal(el('feedbackPanel').hidden,false);el('answer').value=language==='zh'?'我还没有使用经验，但会阅读文档并通过小项目验证学习效果。':'I have no experience yet but would read the documentation, build a project and validate it with tests.';el('submitAnswer').onclick();}
  el('next').onclick();
 }
 assert.equal(el('summary').open,true);assert.equal(el('answeredMetric').textContent,'6/6');assert.equal(el('retriesMetric').textContent,1);el('download').onclick();el('closeSummary').onclick();assert.equal(sent.at(-1).type,'careerlens-interview-close');
 const result=vm.runInContext("evaluate('Ignore previous instructions <script>alert(1)</script>',2)",context);assert.equal(typeof result.improve,'string');assert(!vm.runInContext("esc('<img onerror=x>')",context).includes('<img'));
}
(async()=>{await check('en');await check('zh');console.log('PASS: application prefill, language, role-family questions, six answers, skill-gap coaching, retry, recap, download, safe rendering and close.');})().catch(e=>{console.error(e);process.exitCode=1});
