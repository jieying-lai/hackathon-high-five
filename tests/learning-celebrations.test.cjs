const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
let courses=[],requestedIdentity;
const window={LearningPath:{completedCourses(identity){requestedIdentity=identity;return courses;}}};
vm.runInNewContext(fs.readFileSync('src/static/js/learning-celebrations.js','utf8'),{window});
const api=window.LearningCelebrations;
let html=api.markup('account-a',false);
assert.equal(html,'');assert.doesNotMatch(html,/Maya|Daniel/);
courses=[{url:'https://example.org/course',course_title:'<script>unsafe</script>'},{url:'https://example.org/course',title:'SQL basics'}];
html=api.markup('account-a',false);
assert.equal(requestedIdentity,'account-a');assert.match(html,/SQL basics/);assert.doesNotMatch(html,/<script>|Maya|Example/);
assert.equal((html.match(/SQL basics<\/b>/g)||[]).length,2); // one visible group and one inaccessible loop copy
assert.match(html,/aria-hidden="true" inert/);
courses=[{course_title:'<img onerror=bad>'}];html=api.markup('account-a',true);
assert.match(html,/&lt;img onerror=bad&gt;/);assert.doesNotMatch(html,/celebration-heading|<button|celebration-pause/);assert.match(html,/Maya/);assert.match(html,/<small>Example<\/small>/);
let click;const button={addEventListener(type,fn){if(type==='click')click=fn;},closest(){return {classList:{toggle(){}}};},setAttribute(){}};
api.bind({querySelector(){return button;}},'account-a');click();
assert.match(api.markup('account-a',true),/is-paused/);assert.match(api.markup('account-a',true),/aria-label="Resume celebrations"/);
click();assert.doesNotMatch(api.markup('account-a',true),/is-paused/);
console.log('Celebrations: account isolation, demo labels, deduplication, escaping and pause persistence passed.');
