const test=require('node:test');const assert=require('node:assert/strict');const {project,hubs}=require('../src/static/js/career-earth.js');
test('selected cities project to the centre of the visible hemisphere',()=>{for(const h of hubs){const [x,y,z]=project(h[2],h[3],h[2],h[3]);assert(Math.abs(x)<1e-10);assert(Math.abs(y)<1e-10);assert(Math.abs(z-1)<1e-10);}});
test('antipodes remain behind the globe rather than clickable in front',()=>{const [x,y,z]=project(-12,-75,12,105);assert(Math.abs(x)<1e-10);assert(Math.abs(y)<1e-10);assert(z<-.999);});
test('projection preserves the unit sphere and handles date-line rotation',()=>{for(let lat=-90;lat<=90;lat+=15)for(let lon=-180;lon<=180;lon+=30){const p=project(lat,lon,35,540);assert(Math.abs(p.reduce((n,v)=>n+v*v,0)-1)<1e-9);}});
test('all city timezones can be formatted',()=>{for(const h of hubs)assert.doesNotThrow(()=>new Intl.DateTimeFormat('en',{timeZone:h[4]}).format(new Date()));});
