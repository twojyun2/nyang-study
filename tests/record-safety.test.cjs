const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const R=require('../record-safety.js');
const base={v:1,me:'test',upd:10,sessions:[{t:1,d:'2026-10-01',m:25,c:2}],churu:12,rests:[],bought:[],rmBought:[],roomBought:['basic'],frameBought:['basic'],album:[],sm:{c:{one:{l:10,n:1}},mock:[{t:8,sc:30}],hist:[],rounds:{}}};
const a=R.clone(base),b=R.clone(base);
a.sessions.push({t:2,m:50,c:3});a.churu+=3;a.upd=20;R.track(base,a,20);
b.sessions.push({t:3,m:25,c:2});b.churu+=2;b.upd=21;R.track(base,b,21);
let merged=R.merge(a,b);assert.equal(merged.sessions.length,3);assert.equal(merged.churu,17);
assert.equal(R.merge(merged,b).churu,17);assert.equal(R.merge(merged,a).sessions.length,3);
const deleted=R.clone(merged);deleted.sessions=deleted.sessions.filter(x=>x.t!==1);deleted.churu-=2;deleted.upd=30;R.track(merged,deleted,30);
assert.deepEqual(R.merge(deleted,a).sessions.map(x=>x.t),[2,3]);
const edited=R.clone(a);edited.sessions[0].t=5;edited.upd=40;R.track(a,edited,40);
assert.deepEqual(R.merge(edited,base).sessions.map(x=>x.t),[2,5]);
const mock=R.clone(base);mock.sm.mock=[];mock.upd=20;R.track(base,mock,20);assert.equal(R.merge(mock,base).sm.mock.length,0);
const own=R.clone(b);own.rmBought=['desk'];own.purchaseCosts={'rmBought:desk':5};own.churu-=5;own.upd=22;
const purchased=R.merge(a,own);assert.deepEqual(purchased.rmBought,['desk']);assert.equal(purchased.churu,12);
const fresh={...R.clone(base),sessions:[],sm:{c:{two:{l:30}}},upd:1,churu:0};
const restored=R.merge(fresh,base);assert.equal(restored.sessions.length,1);assert.ok(restored.sm.c.one);assert.ok(restored.sm.c.two);
let map=new Map();const storage={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};
R.backup(storage,'nyang.v1',base,'migration');R.backup(storage,'nyang.v1',a,'sync');assert.deepEqual(JSON.parse(map.get('nyang.v1.before-painted')),base);
for(let i=0;i<8;i++)R.backup(storage,'nyang.v1',{...base,upd:100+i},'sync');assert.equal(JSON.parse(map.get('nyang.v1.snapshots')).length,5);
const html=fs.readFileSync('index.html','utf8');for(const x of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(x[1]);
for(const file of ['deco.js','painted.js','samun.js','sw.js','record-safety.js'])new vm.Script(fs.readFileSync(file,'utf8'));
console.log('PASS: independent study records, repeat merges, rewards, deletions, edits, mock records, purchases, legacy state, immutable backup, JS syntax');
// Exercise the actual sync code with an in-memory server; no real user data/network.
const block=html.slice(html.indexOf('let syncFlight=null;'),html.indexOf('function syncLink()'));
async function scenario({failRead=false,staleOnce=false,writeDuring=false,upgradeRewards=false}={}){
  let server=R.clone(b),posts=0,reads=0,backups=0;
  const context={S:R.clone(a),syncK:'test-only',SYNC_URL:'test',syncT:null,lastSync:0,RecordSafety:R,clearTimeout,Date,JSON,Promise,
    normalizeState:upgradeRewards?R.upgradeStudyRewards:x=>x,backupState:()=>backups++,persistState(){},syncSW(){},applyFur(){},applyRoom(){},applyFrame(){},homeCat:null,focusCat:null,decoCat:null,
    $:()=>({classList:{remove(){}}}),renderAll(){},renderSyncCard(){},syncSoon(){},packS:async x=>JSON.stringify(x),unpackS:async x=>JSON.parse(x),
    fetch:async(url,options={})=>{
      if(!options.method){reads++;if(failRead)throw Error('offline');return {ok:true,json:async()=>({upd:server.upd,data:JSON.stringify(server)})}}
      posts++;const sent=JSON.parse(options.body);assert.equal(sent.force,undefined);
      if(staleOnce&&posts===1){server.sessions.push({t:99,m:25,c:2});server.churu+=2;server.upd=sent.upd+1;return {json:async()=>({stale:true})}}
      server=JSON.parse(sent.data);
      if(writeDuring){context.S.sessions.push({t:100,m:25,c:2});context.S.upd++;}
      return {json:async()=>({ok:true})};
    }};
  if(upgradeRewards)context.S=R.upgradeStudyRewards(context.S);
  vm.createContext(context);vm.runInContext(block,context);
  const status=await vm.runInContext('syncPull()',context);
  if(failRead){assert.equal(posts,0);assert.equal(context.S.sessions.length,2);assert.equal(status,'err');}
  else {assert.equal(status,'pulled');assert.ok(backups);assert.ok(reads);assert.ok(server.sessions.some(x=>x.t===2));assert.ok(server.sessions.some(x=>x.t===3));}
  if(staleOnce)assert.ok(server.sessions.some(x=>x.t===99));
  if(writeDuring)assert.ok(context.S.sessions.some(x=>x.t===100));
  if(upgradeRewards){assert.equal(server.churu,30);assert.equal(context.S.churu,30);await vm.runInContext('syncPull()',context);assert.equal(server.churu,30);assert.equal(context.S.churu,30);}
}
(async()=>{await scenario();await scenario({failRead:true});await scenario({staleOnce:true});await scenario({writeDuring:true});await scenario({upgradeRewards:true});console.log('PASS: read before write, offline preservation, stale-server retry, changes during upload, remote historical reward upgrade');})().catch(e=>{console.error(e);process.exitCode=1});
const normalizer=html.slice(html.indexOf('function defaultsS()'),html.indexOf('function backupState('));
const normContext={defaultDday:()=> '2026-11-19',Date,RecordSafety:R,RETIRED_ACC_COSTS:{scarf:35,bunny:25},RETIRED_FURNITURE_COSTS:{desk:25,window:10}};vm.createContext(normContext);vm.runInContext(normalizer,normContext);
normContext.old={...R.clone(base),rm:{wallB:'window'},room:'pink',wear:['bow'],rmBought:[],fur:'black',look:'photo'};
const migrated=vm.runInContext('normalizeState(old)',normContext);
assert.equal(migrated.rm.wallB,null);assert.equal(migrated.look,'draw');assert.equal(migrated.churu,15);
assert.equal(migrated.sessions[0].c,5);assert.equal(migrated.sessions[0].m,base.sessions[0].m);assert.equal(migrated.sessions[0].t,base.sessions[0].t);assert.equal(JSON.stringify(migrated.sm),JSON.stringify(base.sm));assert.deepEqual(Array.from(migrated.wear),[]);
normContext.old.rmBought=['desk'];const decorated=vm.runInContext('normalizeState(old)',normContext);assert.equal(decorated.rm.wallB,null);assert.equal(decorated.roomRefundTotal,25);assert.deepEqual(Array.from(decorated.rmBought),[]);
normContext.old.rmBought=['desk','window'];const ownedWindow=vm.runInContext('normalizeState(old)',normContext);assert.equal(ownedWindow.rm.wallB,null);assert.equal(ownedWindow.roomRefundTotal,35);
console.log('PASS: pre-update study/quiz/balance preservation, accessory retirement and empty-room migration');
const retired={...R.clone(base),churu:4,bought:['scarf','bunny'],wear:['scarf'],purchaseCosts:{'bought:scarf':0,'bought:bunny':20},accessoryRefundV:0};
const refunded=R.refundRetiredAccessories(retired,{scarf:35,bunny:25});
assert.equal(refunded.churu,24);assert.equal(refunded.accessoryRefundTotal,20);assert.deepEqual(refunded.bought,[]);assert.deepEqual(refunded.wear,[]);
assert.deepEqual(R.refundRetiredAccessories(refunded,{scarf:35,bunny:25}),refunded);
assert.equal(retired.churu,4);
const legacy=R.refundRetiredAccessories({...R.clone(base),bought:['scarf'],accessoryRefundV:0},{scarf:35});assert.equal(legacy.churu,47);
const otherDevice=R.refundRetiredAccessories({...retired,upd:11},{scarf:35,bunny:25});
assert.equal(R.merge(refunded,otherDevice).churu,24);
const staleNewer={...R.clone(base),churu:4,upd:99,accessoryRefundV:1,accessoryRefundTotal:0,accessoryRefundPending:0};
const rescued=R.merge(refunded,staleNewer);assert.equal(rescued.churu,24);assert.equal(rescued.accessoryRefundPending,20);
const seen={...refunded,accessoryRefundPending:0,upd:100};assert.equal(R.merge(seen,otherDevice).accessoryRefundPending,0);
console.log('PASS: actual paid accessory refund, free purchase, legacy price, repeat migration and device merge');
const oldFurniture={...R.clone(base),churu:5,rmBought:['desk','window'],rm:{floorR:'desk',wallB:'window'},purchaseCosts:{'rmBought:desk':17,'rmBought:window':0},roomUpgradeV:0};
const furnitureRefund=R.refundRetiredFurniture(oldFurniture,{desk:25,window:10});
assert.equal(furnitureRefund.churu,22);assert.equal(furnitureRefund.roomRefundTotal,17);assert.deepEqual(furnitureRefund.rmBought,[]);assert.equal(furnitureRefund.rm.floorR,null);
assert.deepEqual(R.refundRetiredFurniture(furnitureRefund,{desk:25,window:10}),furnitureRefund);
const upgradedRoom={...furnitureRefund,roomLevels:{basic:2},churu:4,upd:200,purchaseCosts:{...furnitureRefund.purchaseCosts,'roomLevel:basic:1':8,'roomLevel:basic:2':10}};
const roomOther={...furnitureRefund,roomLevels:{basic:0},upd:210};
assert.equal(R.merge(upgradedRoom,roomOther).roomLevels.basic,2);
assert.equal(R.merge(upgradedRoom,roomOther).churu,4);
console.log('PASS: retired furniture refund, zero-cost gifts, progressive room upgrades and multi-device balance');
// Backpay only the unpaid difference, including zero/missing old rewards and quizzes.
const underpaid={...R.clone(base),churu:7,rmBought:['desk'],purchaseCosts:{'rmBought:desk':25},sessions:[{t:1,m:25,c:2},{t:2,m:60,c:3},{t:3,m:5,c:0},{t:4,m:120},{t:5,m:20,h:'quiz',c:2},{t:6,m:1,c:1}]};
const paid=R.upgradeStudyRewards(underpaid);assert.equal(paid.churu,43);assert.equal(paid.studyRewardBackpay,36);
assert.deepEqual(paid.sessions.map(x=>x.c),[5,12,1,24,4,1]);assert.deepEqual(paid.rmBought,['desk']);assert.deepEqual(paid.purchaseCosts,underpaid.purchaseCosts);
assert.deepEqual(R.upgradeStudyRewards(paid),paid);assert.equal(underpaid.churu,7);assert.equal(underpaid.sessions[0].c,2);
const paidOther=R.upgradeStudyRewards({...R.clone(underpaid),upd:100});
assert.equal(R.upgradeStudyRewards(R.merge(paid,paidOther)).churu,43);
const newerStudy=R.clone(paid);newerStudy.sessions.push({t:7,m:10,c:2});newerStudy.churu+=2;newerStudy.upd=200;R.track(paid,newerStudy,200);
assert.equal(R.upgradeStudyRewards(R.merge(newerStudy,paidOther)).churu,45);
assert.equal(R.studyReward(5),1);assert.equal(R.studyReward(25),5);assert.equal(R.studyReward(60),12);assert.equal(R.studyReward(720),144);
for(const [minutes,count] of [[0,0],[4,0],[9,1],[10,2],[14,2],[15,3],[19,3],[20,4]])assert.equal(R.studyReward(minutes),count);
console.log('PASS: five-minute rewards, historical compensation, repeated loading and multi-device merge without duplicate backpay');
