const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync('samun.js','utf8');
const mock=[{d:'2025-09-07',sc:32,n:'기존',t:1,custom:'keep'}];
let fields={},html='',saved=0;
const context={st:()=>({mock}),dayOf:()=> '2026-10-05',now:()=>2,esc:s=>s,toast:()=>{},save:()=>saved++,closeSheet:()=>{},closeModal:()=>{},render:()=>{},openSheet:s=>{html=s;fields={};for(const id of ['mk-q','mk-no','mk-del','mk-ok','mk-d','mk-s','mk-n','mk-y','mk-mo','mk-g'])fields['#'+id]={value:'',querySelectorAll:()=>[]};},$:s=>fields[s]};
vm.createContext(context);vm.runInContext(source.slice(source.indexOf('function mockSheet(t)'),source.indexOf('\nfunction start(opt)')),context);
context.mockSheet();assert.match(html,/시험 연도/);assert.match(html,/9등급/);
function fill(vals){for(const[k,v]of Object.entries(vals))fields['#mk-'+k].value=v;}
fill({d:'2026-10-04',s:'43',n:'6월 모평',y:'2024',mo:'6',g:'2'});fields['#mk-ok'].onclick();
assert.equal(mock.length,2);assert.equal(mock[1].examYear,2024);assert.equal(mock[1].examMonth,6);assert.equal(mock[1].grade,2);assert.equal(mock[1].d,'2026-10-04');
context.mockSheet(2);assert.match(html,/value="2024" selected/);assert.match(html,/value="2" selected/);
fill({d:'2026-10-04',s:'44',n:'6월 모평',y:'2024',mo:'6',g:''});fields['#mk-ok'].onclick();assert.equal(mock[1].grade,null);assert.equal(mock.length,2);
context.mockSheet(1);fill({d:'2025-09-07',s:'33',n:'기존',y:'2025',mo:'9',g:'4'});fields['#mk-ok'].onclick();assert.equal(mock[0].custom,'keep');assert.equal(mock[0].t,1);assert.equal(mock[0].grade,4);
context.mockSheet();fill({d:'2026-10-04',s:'51',n:'',y:'2024',mo:'6',g:'2'});fields['#mk-ok'].onclick();assert.equal(saved,3);
const R=require('../record-safety.js');
const oldState={v:1,upd:1,sessions:[],churu:0,sm:{mock:[{t:1,d:'2025-09-07',sc:32}],hist:[]}};
const updated=R.clone(oldState);updated.sm.mock=[...mock];updated.upd=10;R.track(oldState,updated,10);
const merged=R.merge(updated,oldState);assert.equal(merged.sm.mock.find(m=>m.t===1).grade,4);assert.equal(merged.sm.mock.find(m=>m.t===2).examYear,2024);
console.log('PASS: exam year/month independent from solved date, grades, edit/clear, legacy metadata preservation, score validation');
