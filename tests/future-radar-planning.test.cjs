const {readFileSync} = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const context = {window:{}};
vm.runInNewContext(readFileSync('src/static/js/future-radar.js','utf8'),context);
const calculate = context.window.FutureRadarPlanning.calculate;
const rows = [
  {skill:'AI',kind:'ai',share_pct:50,recent_per_1k:10},
  {skill:'People',kind:'human',share_pct:70,recent_per_1k:20},
  {skill:'Cloud',kind:'technical',share_pct:30,recent_per_1k:30},
  {skill:'Routine',kind:'routine',share_pct:10,recent_per_1k:5}
];
const original = JSON.stringify(rows);
const weights = {ai:1.5,human:1.1,technical:1.2,routine:.7};
const config = {horizon:24,adoption:50,hours:4};
const model = calculate(rows,weights,config,true);
assert.equal(JSON.stringify(model.months),'[0,8,16,24]');
for(let column=0;column<4;column++){
  assert(Math.abs(model.rows.reduce((n,r)=>n+r.cells[column].share,0)-100)<1e-8);
  assert(Math.abs(model.rows.reduce((n,r)=>n+r.cells[column].minutes,0)-240)<1e-8);
}
const faster=calculate(rows,weights,{...config,adoption:100},true);
assert.equal(faster.rows[0].cells[0].share,model.rows[0].cells[0].share,'Now is independent of assumptions');
assert(faster.rows[0].cells[3].share>model.rows[0].cells[3].share,'AI uptake changes future emphasis');
const farther=calculate(rows,weights,{...config,horizon:60},true);
assert(farther.rows[0].cells[3].share>model.rows[0].cells[3].share,'Horizon changes future emphasis');
const hours=calculate(rows,weights,{...config,hours:8},true);
for(let i=0;i<rows.length;i++){
  assert.equal(hours.rows[i].cells[3].share,model.rows[i].cells[3].share);
  assert.equal(hours.rows[i].cells[3].minutes,2*model.rows[i].cells[3].minutes);
}
const history=calculate(rows,weights,config,false);
assert(history.rows[2].cells[0].share>history.rows[0].cells[0].share,'Historical baseline uses actual mention rate');
const empty=calculate([],weights,config,true);
assert.equal(empty.rows.length,0);
const zero=calculate([{skill:'None',kind:'ai',share_pct:0}],weights,config,true);
assert(zero.rows[0].cells.every(c=>c.share===0&&c.minutes===0),'No observations means no invented allocation');
assert.equal(JSON.stringify(rows),original,'Never mutate observed data');
console.log('PASS: planning model normalisation, four horizons, AI assumptions, practice budget, historical source, empty evidence and immutable observations.');
