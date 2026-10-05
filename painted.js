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
  // The lantern tassel sits just above the stocking in the source atlas.
  const clipShape=item.id==='stocking'?'<path d="M917 369H1060V350H1150V603H917Z"/>':'';
  item.svg=paintedSprite(core?'furniture.png':'seasonal.png',core?[1254,1254]:[1774,887],box.slice(0,4),'',clipShape);
});

function paintedCatSVG(includeAccessories=true){
  const poses=[
    ['idle',[48,87,421,420],[99,78,1.45]],
    ['walk',[497,92,528,414],[142,90,1.25]],
    ['sleep',[1044,169,487,350],[66,134,1.12]],
    ['study',[22,523,493,441],[112,100,1.3]],
    ['happy',[540,518,481,424],[99,78,1.45]],
  ];
  return `<svg class="cat painted-cat" viewBox="0 0 200 200" aria-hidden="true" data-art-source="approved-character-sheet">${poses.map(([name,box,acc])=>`<g class="paint-pose paint-${name}"><g class="paint-art" ${name==='walk'?'transform="translate(200 0) scale(-1 1)"':''}>${paintedSprite('lemon-poses.png',[1536,1024],box).replace('<svg ','<svg width="200" height="200" preserveAspectRatio="xMidYMax meet" ')}</g>${includeAccessories?`<g class="paint-accessories" transform="translate(${acc[0]} ${acc[1]}) scale(${acc[2]})">${headSVG()}</g>`:''}</g>`).join('')}</svg>`;
}
