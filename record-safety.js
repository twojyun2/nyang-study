/* Records remain at nyang.v1. No account keys or records belong in GitHub. */
const RecordSafety = (() => {
  const clone = x => JSON.parse(JSON.stringify(x));
  const paths = ['sessions', 'album', 'sm.mock', 'sm.hist'];
  const get = (o,p) => p.split('.').reduce((v,k)=>v?.[k],o);
  const set = (o,p,v) => {const a=p.split('.'),k=a.pop();let t=o;for(const n of a)t=t[n]||(t[n]={});t[k]=v;};
  const id = (p,x) => String(p==='album'?x.d:p==='sm.hist'?(x.t||x.d+':'+x.sc):x.id||x.t);
  const equal = (a,b) => JSON.stringify(a)===JSON.stringify(b);
  const studyReward = minutes => Number.isFinite(Number(minutes))?Math.floor(Math.max(0,Number(minutes))/5):0;
  const recordReward = x => x.c??(x.h==='quiz'?1:1+(x.m>=25?1:0)+(x.m>=50?1:0));
  function upgradeStudyRewards(state){
    const out={...state,sessions:(state.sessions||[]).map(x=>({...x}))};
    let extra=0;
    for(const x of out.sessions){
      const paid=recordReward(x),owed=Math.max(paid,studyReward(x.m));
      if(x.h==='quiz')x.quizBonus=x.quizBonus??Math.min(2,paid);
      extra+=owed-paid;x.c=owed;
    }
    out.churu=(state.churu||0)+extra;
    out.studyRewardBackpay=(state.studyRewardBackpay||0)+extra;
    out.studyRewardV=2;out.churuFix=1;
    return out;
  }
  function refundRetiredAccessories(state,prices){
    if(state.accessoryRefundV===1)return state;
    const out=clone(state),paid=out.purchaseCosts||{};
    const owned=new Set((out.bought||[]).filter(id=>Object.hasOwn(prices,id)));
    const amount=[...owned].reduce((total,id)=>{
      const key='bought:'+id;
      return total+(Object.hasOwn(paid,key)?Math.max(0,Number(paid[key])||0):prices[id]);
    },0);
    out.churu=(Number(out.churu)||0)+amount;
    out.accessoryRefundTotal=(Number(out.accessoryRefundTotal)||0)+amount;
    out.accessoryRefundPending=(Number(out.accessoryRefundPending)||0)+amount;
    out.bought=(out.bought||[]).filter(id=>!Object.hasOwn(prices,id));
    out.wear=[];out.seenAcc=[];out.look='draw';out.accessoryRefundV=1;
    return out;
  }
  function refundRetiredFurniture(state,prices){
    if(state.roomUpgradeV===1)return state;
    const out=clone(state),paid=out.purchaseCosts||{};
    const owned=new Set((out.rmBought||[]).filter(id=>Object.hasOwn(prices,id)));
    const amount=[...owned].reduce((total,id)=>{
      const key='rmBought:'+id;
      return total+(Object.hasOwn(paid,key)?Math.max(0,Number(paid[key])||0):prices[id]);
    },0);
    out.churu=(Number(out.churu)||0)+amount;
    out.roomRefundTotal=(Number(out.roomRefundTotal)||0)+amount;
    out.roomRefundPending=(Number(out.roomRefundPending)||0)+amount;
    out.rmBought=(out.rmBought||[]).filter(id=>!Object.hasOwn(prices,id));
    out.rm={wallA:null,wallB:null,floorC:null,floorL:null,floorR:null};
    out.roomLevels={basic:0};out.roomUpgradeV=1;
    return out;
  }
  function track(before, after, time) {
    after.recordChanges=clone(after.recordChanges||{});
    for(const p of paths){
      const old=new Map((get(before,p)||[]).map(x=>[id(p,x),x]));
      const cur=new Map((get(after,p)||[]).map(x=>[id(p,x),x]));
      const stamps=after.recordChanges[p]||(after.recordChanges[p]={});
      for(const [k,x] of old)if(!cur.has(k))stamps[k]={at:time,deleted:true};
      for(const [k,x] of cur)if(!equal(old.get(k),x))stamps[k]={at:time,deleted:false};
    }
    return after;
  }
  function merge(a,b) {
    const newer=(a.upd||0)>=(b.upd||0)?a:b, older=newer===a?b:a;
    const out={...clone(older),...clone(newer)};
    out.recordChanges={};
    for(const p of paths){
      if(!get(a,p)&&!get(b,p))continue;
      const am=new Map((get(a,p)||[]).map(x=>[id(p,x),x])),bm=new Map((get(b,p)||[]).map(x=>[id(p,x),x]));
      const ac=a.recordChanges?.[p]||{},bc=b.recordChanges?.[p]||{}, stamps={}, values=[];
      for(const k of new Set([...am.keys(),...bm.keys(),...Object.keys(ac),...Object.keys(bc)])){
        const av=ac[k]||{at:a.upd||0,deleted:false},bv=bc[k]||{at:b.upd||0,deleted:false};
        // An absent legacy row is not a deletion. Explicit deletions survive a stale device.
        const hasA=am.has(k)||!!ac[k],hasB=bm.has(k)||!!bc[k];
        const fromA=hasA&&(!hasB||av.at>bv.at||(av.at===bv.at&&(av.deleted||newer===a)));
        const stamp=fromA?av:bv,x=fromA?am.get(k):bm.get(k);
        stamps[k]=stamp;if(!stamp.deleted&&x)values.push(clone(x));
      }
      set(out,p,values.sort((x,y)=>String(id(p,x)).localeCompare(String(id(p,y)))));out.recordChanges[p]=stamps;
    }
    for(const p of ['rests','bought','rmBought','roomBought','frameBought','seenAcc','seasonSeen'])
      out[p]=[...new Set([...(a[p]||[]),...(b[p]||[])])].sort();
    if(a.sm||b.sm){
      out.sm={...clone(older.sm||{}),...out.sm};
      for(const p of ['c','r','d','rounds'])out.sm[p]={...(older.sm?.[p]||{}),...(newer.sm?.[p]||{})};
      for(const [k,v] of Object.entries(older.sm?.c||{}))if((v.l||0)>(out.sm.c[k]?.l||0))out.sm.c[k]=clone(v);
      for(const [k,v] of Object.entries(older.sm?.rounds||{}))out.sm.rounds[k]=Math.max(v,out.sm.rounds[k]||0);
    }
    out.purchaseCosts={...(older.purchaseCosts||{}),...(newer.purchaseCosts||{})};
    const reward=s=>(s.sessions||[]).reduce((n,x)=>n+recordReward(x),0);
    let extraCost=0;
    for(const p of ['bought','rmBought','roomBought','frameBought'])for(const k of out[p])
      if(!(newer[p]||[]).includes(k))extraCost+=out.purchaseCosts[p+':'+k]||0;
    for(const [room,level] of Object.entries(older.roomLevels||{}))
      for(let step=(newer.roomLevels?.[room]||0)+1;step<=level;step++)
        extraCost+=out.purchaseCosts['roomLevel:'+room+':'+step]||0;
    const refunded=Math.max(a.accessoryRefundTotal||0,b.accessoryRefundTotal||0);
    const refundMissing=Math.max(0,refunded-(newer.accessoryRefundTotal||0));
    const roomRefunded=Math.max(a.roomRefundTotal||0,b.roomRefundTotal||0);
    const roomRefundMissing=Math.max(0,roomRefunded-(newer.roomRefundTotal||0));
    out.accessoryRefundTotal=refunded;
    out.accessoryRefundPending=(newer.accessoryRefundPending||0)+refundMissing;
    out.accessoryRefundV=Math.max(a.accessoryRefundV||0,b.accessoryRefundV||0);
    out.roomRefundTotal=roomRefunded;
    out.roomRefundPending=(newer.roomRefundPending||0)+roomRefundMissing;
    out.roomUpgradeV=Math.max(a.roomUpgradeV||0,b.roomUpgradeV||0);
    out.roomLevels={...(older.roomLevels||{}),...(newer.roomLevels||{})};
    for(const [id,level] of Object.entries(older.roomLevels||{}))out.roomLevels[id]=Math.max(level,out.roomLevels[id]||0);
    out.churu=Math.max(0,(newer.churu||0)+reward(out)-reward(newer)-extraCost+refundMissing+roomRefundMissing);
    out.run=a.run;out.push=a.push;
    return out;
  }
  function backup(storage,key,state,reason){
    if(!state||state.v!==1)return;
    const raw=JSON.stringify(state), first=key+'.before-painted';
    // One immutable pre-update copy plus the five most recent pre-merge snapshots.
    if(!storage.getItem(first))storage.setItem(first,raw);
    const k=key+'.snapshots',list=JSON.parse(storage.getItem(k)||'[]');
    if(list[0]?.data===raw)return;
    list.unshift({at:Date.now(),reason,data:raw});storage.setItem(k,JSON.stringify(list.slice(0,5)));
  }
  return {merge,track,backup,clone,studyReward,recordReward,upgradeStudyRewards,refundRetiredAccessories,refundRetiredFurniture};
})();
if(typeof module!=='undefined')module.exports=RecordSafety;
