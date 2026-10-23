const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {tasks,feedback}=require('../src/static/js/career-practice.js');
test('self-review never marks an empty response ready',()=>assert.equal(feedback('   ',[true,true,true]).ready,false));
test('self-review distinguishes incomplete and complete checklists without claiming certification',()=>{
 assert.equal(feedback('My reasoning',[true,false,true]).ready,false);
 assert.equal(feedback('My reasoning',[true,true,true]).ready,true);
 assert.match(feedback('My reasoning',[true,true,true]).message,/self-review/);
 assert.equal(new Set(tasks.map(t=>t.id)).size,3);
});
const html=fs.readFileSync('src/templates/candidate.html','utf8');
const fn=html.slice(html.indexOf('    async function openApplyModalByKey'),html.indexOf('    function openApplyModal(vid)'));
function setup(reviewed,job={key:'1',id:1,title:'Test role',company_name:'Fictional employer',can_apply_in_app:true}){
 const calls=[],nav=[]; const c=vm.createContext({jobsList:[job],activeApplyJob:null,cvRecord:{file_sha256:'test'},isReviewed:()=>reviewed,toast:()=>{},showTab:async id=>nav.push(id),postJson:async()=>calls.push('write'),user:{},document:{getElementById:()=>null,activeElement:null},rm:String,esc:String,Boolean,amTitle:{},amMeta:{},amShareOrg:{checked:true},amSharePdf:{checked:true},amSalary:{value:'old',focus(){}},amNote:{},applyModalWrap:{classList:{remove(){}}}});vm.runInContext(fn,c);return{c,calls,nav};
}
test('unreviewed application routes to review without silently updating CV',async()=>{const {c,calls,nav}=setup(false);await c.openApplyModalByKey('1');assert.deepEqual(calls,[]);assert.deepEqual(nav,['cv-review']);});
test('new application does not preselect sharing or invent an applicant identity',async()=>{const {c}=setup(true);await c.openApplyModalByKey('1');assert.equal(c.amShareOrg.checked,false);assert.equal(c.amSharePdf.checked,false);assert.equal(c.amSalary.value,'');});
test('editing an application preserves its explicitly selected permissions',async()=>{const {c}=setup(true,{key:'1',can_apply_in_app:true,application:{applied:true,share_organised_cv:true,share_original_pdf:false}});await c.openApplyModalByKey('1');assert.equal(c.amShareOrg.checked,true);assert.equal(c.amSharePdf.checked,false);});
test('external jobs cannot open an in-app submission flow',async()=>{const {c,calls,nav}=setup(true,{key:'1',can_apply_in_app:false});await c.openApplyModalByKey('1');assert.deepEqual(calls,[]);assert.deepEqual(nav,[]);});
