const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('src/templates/candidate.html','utf8');
test('both portal inline scripts parse and external scripts have no ignored code',()=>{
  for(const file of ['candidate','hr']){
    const text=fs.readFileSync(`src/templates/${file}.html`,'utf8');
    const inline=[];
    for(const [,attrs,body] of text.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){
      if(attrs.includes('src=')) assert.equal(body.trim(),'');
      else if(!attrs.includes('application/')) inline.push(body);
    }
    new vm.Script(inline.join('\n'));
  }
});
function companion(saved,local){
  const elements = new Map();
  const element=id=>{if(!elements.has(id)) elements.set(id,{src:'',textContent:''});return elements.get(id)};
  const code=html.slice(html.indexOf('const COMPANION_MASCOTS'),html.indexOf('function setUploadMode'));
  const ctx=vm.createContext({document:{getElementById:element},localStorage:{getItem:()=>JSON.stringify(local)},fetch:async()=>({ok:true,json:async()=>({totem:saved})})});
  vm.runInContext(code,ctx);
  return {ctx,element};
}
test('CV companion uses the signed-in saved quiz animal',async()=>{
  const {ctx,element}=companion({key:'fox'},{key:'owl'});
  await vm.runInContext('initCompanionUpload()',ctx);
  assert.match(element('companionAvatarImg').src,/fox.svg$/);
});
test('guest quiz companion survives before account result is saved',async()=>{
  const {ctx,element}=companion(null,{key:'whale'});
  await vm.runInContext('initCompanionUpload()',ctx);
  assert.match(element('companionAvatarImg').src,/whale.svg$/);
});
test('unknown quiz animal safely uses the default companion',async()=>{
  const {ctx,element}=companion({key:'unknown'},null);
  await vm.runInContext('initCompanionUpload()',ctx);
  assert.match(element('companionAvatarImg').src,/retriever.svg$/);
});
