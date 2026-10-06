/* Approved painted artwork. SVG viewports only crop the original PNG atlases;
   they do not redraw or approximate the illustrations. */
const PAINTED_ROOT = 'assets/painted/';
let paintedUID=0;
function paintedSprite(file, size, box, extra='', clipShape='') {
  const clip='paint-clip-'+(++paintedUID);
  return `<svg class="painted-asset ${extra}" viewBox="${box.join(' ')}" aria-hidden="true"><defs><clipPath id="${clip}">${clipShape||`<rect x="${box[0]}" y="${box[1]}" width="${box[2]}" height="${box[3]}"/>`}</clipPath></defs><image clip-path="url(#${clip})" href="${PAINTED_ROOT+file}" width="${size[0]}" height="${size[1]}"/></svg>`;
}
const PAINTED_FURNITURE = {
  window:[18,48,425,437,145], shelf:[460,25,360,490,128], desk:[815,130,428,375,180],
  cloudrug:[5,578,461,269,250], cushion:[467,563,387,295,135], plant:[903,511,328,352,112],
  clock:[93,913,258,298,64], box:[462,912,355,300,122], tower:[910,866,313,372,126],
};
const PAINTED_SEASONAL = {
  moon:[20,60,267,267,94], songpyeon:[298,118,296,205,140], screen:[608,74,281,254,148],
  lantern:[954,22,160,342,58], magpie:[1177,94,287,233,112], pouch:[1490,82,276,245,76],
  kite:[14,333,269,265,88], ddeok:[293,376,306,230,142], tree:[615,338,253,278,134],
  stocking:[917,350,233,253,72], snowwin:[1171,341,291,263,145], gifts:[1475,369,287,228,138],
  sakuratree:[19,593,277,279,142], lunch:[301,608,290,254,122], pumpkin:[608,625,265,235,108],
  bats:[876,653,300,173,142], mochi:[1175,642,284,213,128], banner:[1460,617,304,237,138],
};
RM_ITEMS.forEach(item => {
  const core=PAINTED_FURNITURE[item.id], box=core||PAINTED_SEASONAL[item.id];
  if(!box)return;
  item.w=box[4];
  item.artRatio=box[2]/box[3];
  // The lantern tassel sits just above the stocking in the source atlas.
  const clipShape=item.id==='stocking'?'<path d="M917 369H1060V350H1150V603H917Z"/>':'';
  item.svg=paintedSprite(core?'furniture.png':'seasonal.png',core?[1254,1254]:[1774,887],box.slice(0,4),'',clipShape);
});

/* Cat costumes are painted into each complete pose. No separate wearable layer. */
const CAT_THEMES={basic:{file:'lemon-poses.png',boxes:[[48,87,421,420],[497,92,528,414],[1044,169,487,350],[22,523,493,441],[540,518,481,424]]},
  halloween:{file:'cat-halloween.webp'},chuseok:{file:'cat-chuseok.webp'},christmas:{file:'cat-christmas.webp'},spring:{file:'cat-spring.webp'},seollal:{file:'cat-seollal.webp'}};
const THEME_POSE_BOXES=[[20,30,460,480],[495,30,540,480],[1055,30,481,480],[0,515,530,470],[550,515,480,470]];
function paintedCatSVG(theme='basic'){
  const art=CAT_THEMES[theme]||CAT_THEMES.basic,boxes=art.boxes||THEME_POSE_BOXES;
  const names=['idle','walk','sleep','study','happy'];
  return `<svg class="cat painted-cat" viewBox="0 0 200 200" aria-hidden="true" data-cat-theme="${theme}">${names.map((name,i)=>`<g class="paint-pose paint-${name}"><g class="paint-art" ${name==='walk'?'transform="translate(200 0) scale(-1 1)"':''}>${paintedSprite(art.file,[1536,1024],boxes[i]).replace('<svg ','<svg width="200" height="200" preserveAspectRatio="xMidYMax meet" ')}</g></g>`).join('')}</svg>`;
}
/* Legacy accessory artwork follows solely for old saved-data IDs and historical previews. */
const PAINTED_ACCESSORIES = {};
[
 ['a',['bow','bell','flower','glasses','crown','headband','bowtie','scarf'],[[50,108,365,286],[487,140,369,226],[938,128,341,222],[1320,150,436,188],[73,523,320,225],[469,480,394,305],[922,540,377,205],[1369,465,340,336]]],
 ['b',['heartpin','garland','moon','ears','pearls','lace','wreath','santa'],[[83,201,290,153],[472,181,391,192],[991,189,250,177],[1353,119,389,283],[27,586,391,157],[453,588,428,165],[918,561,385,198],[1348,515,399,277]]],
 ['c',['snowpin','bunny','saekdong','luckpouch','sakurapin','witch','pumpkinpin','pencil'],[[79,148,324,302],[483,81,369,369],[896,138,409,313],[1397,180,327,258],[47,537,370,290],[470,520,415,290],[963,602,305,190],[1378,630,349,130]]]
].forEach(([sheet,ids,boxes])=>ids.forEach((id,i)=>PAINTED_ACCESSORIES[id]={file:`accessories-${sheet}.png`,size:[1774,887],box:boxes[i]}));
function paintedAccessoryIcon(id){const a=PAINTED_ACCESSORIES[id];return a?paintedSprite(a.file,a.size,a.box):'';}
const PAINTED_WORN_NECK={};
['bell','bowtie','scarf','pearls','lace','luckpouch'].forEach((id,i)=>{
 const front=[[38,129,428,259],[560,135,422,240],[1073,128,428,327],[52,589,433,218],[532,583,479,212],[1068,579,424,336]][i];
 const side=[[54,157,392,271],[555,162,435,268],[1069,162,431,319],[48,590,431,218],[548,585,473,243],[1077,576,428,350]][i];
 PAINTED_WORN_NECK[id]={front:{file:'neck-front.png',size:[1536,1024],box:front},side:{file:'neck-profile.png',size:[1536,1024],box:side}};
});
const PAINTED_WORN_HEAD={};
['headband','bunny','ears','crown','santa','witch'].forEach((id,i)=>PAINTED_WORN_HEAD[id]={file:'head-worn.png',size:[1536,1024],box:[[33,241,479,210],[512,48,461,403],[1060,201,440,250],[45,598,467,270],[512,564,512,304],[1024,561,497,315]][i]});
const PAINTED_NECK_FIT={bell:[-23,14,46,27,0],bowtie:[-22,16,44,26,0],scarf:[-29,11,58,40,0],pearls:[-23,18,46,24,0],lace:[-25,16,50,24,0],luckpouch:[-18,17,36,37,0]};
const PAINTED_HEAD_FIT={headband:[-38,-48,76,34,0],bunny:[-39,-65,78,62,0],ears:[-40,-56,80,47,0],crown:[-26,-56,52,32,0],santa:[-35,-61,70,46,0],witch:[-38,-64,76,47,-5]};
// Head-local positions: x, y, width, height, tilt. Every pose shares the same artwork.
const PAINTED_ACC_FIT={
 bow:[8,-40,26,24,16],bell:[-23,22,46,23,0],flower:[-30,-36,25,18,-12],glasses:[-41,-18,82,37,0],
 crown:[-19,-48,38,27,0],headband:[-28,-42,56,31,0],bowtie:[-18,24,36,20,0],scarf:[-25,22,50,33,0],
 heartpin:[-31,-34,24,14,-14],garland:[-26,-30,52,24,0],moon:[10,-38,23,19,18],ears:[-33,-55,66,43,0],
 pearls:[-23,26,46,18,0],lace:[-27,23,54,20,0],wreath:[-30,-39,60,27,0],santa:[-30,-58,60,44,0],
 snowpin:[-30,-35,23,23,-12],bunny:[-28,-68,56,57,0],saekdong:[7,-42,29,25,15],luckpouch:[-15,24,30,27,0],
 sakurapin:[-32,-38,30,25,-12],witch:[-32,-62,64,45,-6],pumpkinpin:[-31,-32,26,18,-12],pencil:[8,-31,27,12,25]
};
function paintedAccessories(pose){
 const side=pose==='walk'||pose==='sleep';
 return Object.entries(PAINTED_ACC_FIT).map(([id,fit])=>{
  if(pose==='study'&&PAINTED_WORN_NECK[id])return '';// The open book hides the chest.
  let [x,y,w,h,angle]=fit,asset=PAINTED_ACCESSORIES[id],art;
  if(PAINTED_WORN_NECK[id]){
    asset=PAINTED_WORN_NECK[id][pose==='walk'?'side':'front'];
    [x,y,w,h,angle]=PAINTED_NECK_FIT[id];
    if(pose==='walk'){x=-24;y=11;w=id==='luckpouch'?35:39;h=id==='scarf'?33:29;angle=-5;}
    if(pose==='sleep'){x=-18;y=8;w=id==='scarf'?39:34;h=id==='luckpouch'?28:23;angle=-20;}
  }else if(PAINTED_WORN_HEAD[id]){
    asset=PAINTED_WORN_HEAD[id];
    [x,y,w,h,angle]=PAINTED_HEAD_FIT[id];
    if(pose==='walk'){x=x*.65+6;w*=.72;angle-=10;}
    if(pose==='sleep'){x=x*.72-5;w*=.77;angle+=16;}
  }else if(side){x=x*.7+(pose==='walk'?3:-3);w*=.78;angle+=pose==='walk'?-10:16;}
  if(pose==='study')angle-=8;
  if(id==='glasses'&&pose==='walk'){asset={file:'glasses-side.png',size:PAINTED_SIDE_SIZE,box:PAINTED_SIDE_BOX};x=-24;y=-15;w=60;h=30;angle=-8;}
  if(id==='glasses'&&pose==='sleep'){asset=PAINTED_ACCESSORIES[id];x=-34;y=-16;w=68;h=32;angle=-12;}
  art=paintedSprite(asset.file,asset.size,asset.box);
  return `<g class="acc acc-${id}" transform="rotate(${angle} ${x+w/2} ${y+h/2})">${art.replace('<svg ',`<svg x="${x}" y="${y}" width="${w}" height="${h}" `)}</g>`;
 }).join('');
}
const paintedWearStyle=document.createElement('style');
paintedWearStyle.textContent='.painted-cat .acc{display:none}'+Object.keys(PAINTED_ACCESSORIES).map(id=>`.w-${id} .acc-${id}{display:inline}`).join('');
document.head.appendChild(paintedWearStyle);

function legacyPaintedCatSVG(includeAccessories=true){
  const poses=[
    ['idle',[48,87,421,420],[86.5,92,1.45]],
    ['walk',[497,92,528,414],[144,108,1.25]],
    ['sleep',[1044,169,487,350],[61,149,1.12]],
    ['study',[22,523,493,441],[101,111,1.15]],
    ['happy',[540,518,481,424],[86.5,92,1.45]],
  ];
  return `<svg class="cat painted-cat" viewBox="0 0 200 200" aria-hidden="true" data-art-source="approved-character-sheet">${poses.map(([name,box,acc])=>`<g class="paint-pose paint-${name}"><g class="paint-art" ${name==='walk'?'transform="translate(200 0) scale(-1 1)"':''}>${paintedSprite('lemon-poses.png',[1536,1024],box).replace('<svg ','<svg width="200" height="200" preserveAspectRatio="xMidYMax meet" ')}</g>${includeAccessories?`<g class="paint-accessories" transform="translate(${acc[0]} ${acc[1]}) scale(${acc[2]})">${paintedAccessories(name)}</g>`:''}</g>`).join('')}</svg>`;
}

const PAINTED_SIDE_SIZE=[1774,887],PAINTED_SIDE_BOX=[60,198,1685,480];
const PAINTED_FRAMES={};
['basic','mint','butter','lav','tape','gold','pola','kraft','double','gingham','dots','stripe','wood','sakura','night','rose'].forEach((id,i)=>{
 PAINTED_FRAMES[id]={file:'frames-a.png',size:[1254,1254],box:[[12,331,639,940][i%4],[23,316,606,896][Math.floor(i/4)],300,290]};
});
['circle','arch','heart','petal','badge','hex','window','museum','film','saekdong','candy','spooky'].forEach((id,i)=>{
 PAINTED_FRAMES[id]={file:'frames-b.png',size:[1448,1086],box:[[20,35,346,337],[376,36,337,333],[711,41,386,329],[1103,47,334,321],[16,386,336,334],[380,397,333,301],[721,372,363,341],[1120,377,299,336],[28,760,325,261],[377,724,337,315],[711,738,382,287],[1094,712,348,326]][i]};
});
function paintedFrameVars(id){
 const f=PAINTED_FRAMES[id]||PAINTED_FRAMES.basic,[x,y,w,h]=f.box,[sw,sh]=f.size;
 const masks={circle:'circle(49% at 50% 50%)',candy:'circle(49% at 50% 50%)',museum:'ellipse(39% 49% at 50% 50%)',hex:'polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)',heart:'polygon(50% 97%,5% 52%,0 25%,10% 5%,30% 0,50% 18%,70% 0,90% 5%,100% 25%,95% 52%)',window:'inset(0 19% 0 19% round 45% 45% 0 0)',petal:'polygon(35% 4%,65% 4%,70% 25%,93% 30%,96% 53%,80% 66%,81% 90%,52% 100%,26% 88%,24% 68%,4% 54%,8% 30%,30% 24%)'};
 return {'--frame-art':`url('${PAINTED_ROOT+f.file}')`,'--frame-art-size':`${sw/w*100}% ${sh/h*100}%`,'--frame-art-pos':`${x/(sw-w)*100}% ${y/(sh-h)*100}%`,'--photo-mask':masks[id]||'inset(0 round 15%)','--photo-inset':id==='heart'?'8% 7% 2%':id==='film'?'19% 6%':id==='spooky'?'30% 16% 12%':id==='pola'?'10% 10% 20%':'12%'};
}
