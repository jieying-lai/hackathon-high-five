const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
async function check(ok){
 let closed=0,reset=0;
 const button={},receipt={},status={};
 const c={setInterval(){},document:{getElementById:id=>id==='latestInvitationReceipt'?receipt:null},interviewPerson:{id:'c1',name:'Candidate'},interviewForm:{reportValidity:()=>true,querySelector:()=>button,reset(){reset++}},interviewDialog:{close(){closed++}},interviewRole:{value:'Audit'},interviewTime:{value:'2026-12-01T10:00'},interviewLocation:{value:'Office'},interviewMessage:{value:''},interviewStatus:status,postJson:async()=>({ok,data:ok?{claim_code:'private-code'}:{message:'Failed'}}),esc:s=>s,toast(){}};
 vm.createContext(c);vm.runInContext(fs.readFileSync('src/static/js/interviews.js','utf8'),c);
 await vm.runInContext('sendInterview({preventDefault(){}})',c);
 assert.equal(closed,ok?1:0);assert.equal(reset,ok?1:0);assert.equal(button.disabled,false);
 if(ok) assert.match(receipt.innerHTML,/Invitation delivered/); else assert.equal(status.textContent,'Failed');
}
(async()=>{await check(true);await check(false);console.log('Invitation success closes dialog and retains code; failure preserves form.');})();
