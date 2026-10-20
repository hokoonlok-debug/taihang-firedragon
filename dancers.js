import * as T from 'three';
import {addInscription} from './inscription.js?v=20261020';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// Original rounded collectible characters; intentionally cute contemporary design.
// All bodies, clothing, hands and poles are geometry; no billboards or character images.
const V=(x,y,z)=>new T.Vector3(x,y,z);
export const dancerLayout=[
 {p:[-1.82,.515,1.45],to:[-1.106,3.154,1.014],yaw:.7,coat:0,step:.15},
 {p:[-.60,.515,2.12],to:[.061,4.088,1.116],yaw:.55,coat:1,step:-.10},
 {p:[.71,.515,1.98],to:[.303,4.082,1.077],yaw:-.4,coat:0,step:.13},
 {p:[2.02,.515,.86],to:[1.862,3.489,.226],yaw:-.5,coat:2,step:-.13},
 {p:[-1.74,.515,-1.53],to:[-1.592,4.284,-.314],yaw:2.5,coat:2,step:.10},
 {p:[.54,.515,-2.15],to:[1.375,5.079,.407],yaw:-2.6,coat:1,step:-.14},
 {p:[1.72,.515,1.83],to:[2.25,2.58,1.92],yaw:-.8,coat:1,step:.12,pearl:true}
];
export function createDancers(baseScene=null){
 const root=new T.Group();root.name='dancers';root.userData={part:'dancers',description:'七位約三頭身的街坊小隊收藏公仔；人數、衣色、表情與站位為文創設定'};
 const materials={
  skin:new T.MeshStandardMaterial({name:'奶油霧面公仔',color:'#f2d4b5',roughness:.65}),
  hair:new T.MeshStandardMaterial({name:'柔黑髮型',color:'#343d3c',roughness:.77}),
  red:new T.MeshStandardMaterial({name:'珊瑚朱紅上衣',color:'#da7862',roughness:.76}),
  white:new T.MeshStandardMaterial({name:'奶油白上衣',color:'#f2ead7',roughness:.78}),
  teal:new T.MeshStandardMaterial({name:'粉霧青上衣',color:'#82aaa0',roughness:.77}),
  trouser:new T.MeshStandardMaterial({name:'深霧青短褲',color:'#506968',roughness:.82}),
  sole:new T.MeshStandardMaterial({name:'米白鞋底',color:'#ded9cb',roughness:.9}),
  eye:new T.MeshStandardMaterial({name:'亮黑豆豆眼',color:'#222c2b',roughness:.24}),
  blush:new T.MeshStandardMaterial({name:'蜜桃腮紅',color:'#e89b85',roughness:.82}),
  pole:new T.MeshStandardMaterial({name:'竹竿',color:'#a28a55',roughness:.76}),
  pearl:new T.MeshStandardMaterial({name:'龍珠光點',color:'#e4ad67',emissive:'#8d4013',emissiveIntensity:.25,roughness:.55})
 };
 const coats=[materials.red,materials.white,materials.teal];
 dancerLayout.forEach((cfg,index)=>{
  const person=new T.Group();person.name=`舞龍者_${String(index+1).padStart(2,'0')}${cfg.pearl?'_引珠':'_持桿'}`;person.position.fromArray(cfg.p);person.rotation.y=cfg.yaw;root.add(person);
  const buckets=new Map();
  function add(g,m){if(!buckets.has(m))buckets.set(m,[]);if(g.index)g=g.toNonIndexed();g.deleteAttribute('uv');buckets.get(m).push(g);}
  function oval(p,s,m){const g=new T.SphereGeometry(1,24,16);g.scale(...s);g.translate(...p);add(g,m);}
  function line(points,r,m){const curve=new T.CatmullRomCurve3(points.map(p=>V(...p)));add(new T.TubeGeometry(curve,18,r,7,false),m);}
  // Smooth sectional garment surfaces with a subtle sewn, asymmetric silhouette.
  function section(points,widths,depths,m){
   const curve=new T.CatmullRomCurve3(points.map(p=>V(...p))),n=points.length*4,rad=12,frames=curve.computeFrenetFrames(n,false),pos=[],idx=[];
   for(let i=0;i<=n;i++){const t=i/n,q=t*(widths.length-1),a=Math.min(widths.length-2,Math.floor(q)),f=q-a,w=T.MathUtils.lerp(widths[a],widths[a+1],f),d=T.MathUtils.lerp(depths[a],depths[a+1],f),p=curve.getPointAt(t);
    for(let j=0;j<rad;j++){const angle=j/rad*Math.PI*2,fold=1+.025*Math.cos(angle*4+i*.31);const v=p.clone().addScaledVector(frames.normals[i],Math.cos(angle)*w*fold).addScaledVector(frames.binormals[i],Math.sin(angle)*d);pos.push(v.x,v.y,v.z);}
   }
   for(let i=0;i<n;i++)for(let j=0;j<rad;j++){const a=i*rad+j,b=i*rad+(j+1)%rad,c=a+rad,d=b+rad;idx.push(a,c,b,b,c,d);}
   const first=pos.length/3;pos.push(...points[0],...points.at(-1));for(let j=0;j<rad;j++){idx.push(first,j,(j+1)%rad,first+1,n*rad+(j+1)%rad,n*rad+j);}
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();add(g,m);
  }
  function rod(a,b,r,m){const av=V(...a),bv=V(...b),g=new T.CylinderGeometry(r,r,av.distanceTo(bv),10,1);g.applyQuaternion(new T.Quaternion().setFromUnitVectors(V(0,1,0),bv.clone().sub(av).normalize()));g.translate(...av.add(bv).multiplyScalar(.5).toArray());add(g,m);}
  const c=coats[cfg.coat],step=cfg.step;
  // Rounded shoes and short, plump legs give a stable collectible silhouette.
  const feet=[[-.15,.06,step*.70],[.15,.06,-step*.70]];
  person.updateMatrixWorld(true);baseScene?.updateMatrixWorld(true);
  feet.forEach((foot,k)=>{let floor=0;
   if(baseScene){const wp=person.localToWorld(V(foot[0],0,foot[2]));const ray=new T.Raycaster(V(wp.x,.9,wp.z),V(0,-1,0));const hit=ray.intersectObject(baseScene.getObjectByName('base'),true).find(h=>h.point.y<.8);if(hit)floor=Math.max(0,hit.point.y-cfg.p[1]+.004);}
   oval([foot[0],floor+.065,foot[2]+.05],[.123,.063,.174],materials.sole);
   oval([foot[0],floor+.108,foot[2]+.043],[.114,.077,.153],materials.white);
   line([[foot[0]-.05,floor+.16,foot[2]+.09],[foot[0],floor+.179,foot[2]+.08],[foot[0]+.05,floor+.16,foot[2]+.09]],.008,c);
   const sx=k===0?-1:1;section([[sx*.125,.48,.005],[sx*.158,.31+floor*.4,foot[2]],[foot[0],floor+.16,foot[2]]],[.115,.105,.080],[.105,.093,.075],materials.trouser);
  });
  // A continuous egg-shaped oversized tee, tucked collar and softly puffed sleeves.
  oval([0,.635,.022],[.252,.272,.185],c);
  oval([0,.465,.019],[.224,.066,.168],c);
  oval([.012,.875,.030],[.087,.035,.075],materials.white);
  oval([.012,.907,.030],[.065,.048,.063],materials.skin);
  // The head is about one third of total height, with cheeks and a rounded jaw.
  oval([.012,1.132,.047],[.244,.238,.218],materials.skin);
  oval([-.225,1.135,.040],[.041,.056,.043],materials.skin);
  oval([.249,1.135,.040],[.041,.056,.043],materials.skin);
  // Hair is a hemisphere cap, leaving the face unobstructed.
  const hairPos=[],hairIndex=[],rings=14,slices=40;
  for(let a=0;a<=rings;a++)for(let b=0;b<=slices;b++){
   const phi=b/slices*Math.PI*2,front=Math.sin(phi),limit=Math.PI*(.48-.14*Math.max(0,front)+.09*Math.max(0,-front)),theta=a/rings*limit;
   hairPos.push(.012-.253*Math.cos(phi)*Math.sin(theta),1.132+.247*Math.cos(theta),.047+.227*Math.sin(phi)*Math.sin(theta));
  }
  for(let a=0;a<rings;a++)for(let b=0;b<slices;b++){const i=a*(slices+1)+b,j=i+slices+1;hairIndex.push(i,j,i+1,i+1,j,j+1);}
  const cap=new T.BufferGeometry();cap.setAttribute('position',new T.Float32BufferAttribute(hairPos,3));cap.setIndex(hairIndex);cap.computeVertexNormals();add(cap,materials.hair);
  if(index%3===0){
   oval([-.087,1.301,.177],[.11,.060,.064],materials.hair);
   oval([.071,1.322,.159],[.095,.045,.058],materials.hair);
  }else if(index%3===1){
   oval([-.17,1.313,-.050],[.083,.082,.080],materials.hair);
   oval([.19,1.313,-.050],[.083,.082,.080],materials.hair);
  }else{
   oval([.018,1.370,-.004],[.086,.048,.081],materials.hair);
  }
  const headband=new T.TorusGeometry(.234,.013,8,40);headband.rotateX(Math.PI/2);headband.scale(1,1,.91);headband.translate(.012,1.226,.041);add(headband,materials.red);
  oval([.22,1.224,-.035],[.030,.023,.026],materials.red);
  line([[.225,1.222,-.04],[.255,1.165,-.10],[.266,1.104,-.091]],.012,materials.red);
  // Raised, fully three-dimensional expressions: open, smiling and winking eyes.
  [-.073,.097].forEach((x,k)=>{
   if(index===1||index===4||(index===6&&k===0))line([[x-.026,1.141,.244],[x,1.159,.251],[x+.026,1.141,.244]],.010,materials.eye);
   else{oval([x,1.146,.251],[.020,.029,.011],materials.eye);oval([x-.005,1.156,.261],[.0055,.006,.0035],materials.white);}
  });
  [-.145,.169].forEach(x=>oval([x,1.084,.225],[.040,.022,.009],materials.blush));
  oval([.012,1.092,.266],[.025,.019,.018],materials.skin);
  line([[-.031,1.057,.253],[.012,1.037,.263],[.055,1.057,.253]],.007,materials.eye);
  // A tiny moon badge makes the group read as one original product family.
  oval([-.064,.685,.200],[.047,.048,.010],materials.white);
  oval([-.050,.699,.209],[.034,.034,.006],c);
  person.updateMatrixWorld(true);
  const poleTop=person.worldToLocal(V(...cfg.to)),poleBottom=V(.22,.13,.39);
  function onPole(y){return poleBottom.clone().lerp(poleTop,(y-poleBottom.y)/(poleTop.y-poleBottom.y));}
  const hands=[onPole(index%2?.94:.98),onPole(.65)];
  hands.forEach((h,k)=>{const sx=k===0?-1:1,shoulder=[sx*.201,.78,.043],elbow=[sx*.248,k===0?.83:.64,.215];
   const sleeveEnd=V(...shoulder).lerp(V(...elbow),.7).toArray();
   section([shoulder,sleeveEnd],[.113,.105],[.097,.092],c);oval(sleeveEnd,[.106,.09,.09],c);
   section([sleeveEnd,elbow,h.toArray()],[.078,.073,.065],[.073,.068,.06],materials.skin);
   oval(h.toArray(),[.072,.074,.062],materials.skin);
   oval([h.x-.045,h.y+.041,h.z+.035],[.025,.034,.028],materials.skin);
   for(let f=0;f<2;f++){const y=h.y-.022+f*.027;line([[h.x-.044,y,h.z+.034],[h.x+.003,y,h.z+.064],[h.x+.044,y,h.z+.031]],.011,materials.skin);}
  });
  rod(poleBottom.toArray(),poleTop.toArray(),.018,materials.pole);
  if(cfg.pearl){oval(poleTop.toArray(),[.14,.15,.14],materials.pearl);for(let j=0;j<22;j++){const a=j*2.39996,z=1-2*(j+.5)/22,r=Math.sqrt(1-z*z),d=V(r*Math.cos(a),z,r*Math.sin(a));rod(poleTop.clone().addScaledVector(d,.13).toArray(),poleTop.clone().addScaledVector(d,.23).toArray(),.006,materials.pole);}}
  for(const [mat,geos]of buckets){const mesh=new T.Mesh(mergeGeometries(geos),mat);mesh.name=`${person.name}_${mat.name}`;mesh.userData.part='dancers';mesh.castShadow=mesh.receiveShadow=true;person.add(mesh);geos.forEach(g=>g.dispose());}
 });
 return root;
}

export function styleExhibit(root){
 addInscription(root);
 // Only contemporary base and moon-frame finishes change; straw/rope/incense stay intact.
 root.traverse(o=>{if(!o.isMesh)return;
  if(o.name==='倒角石色底座'){o.material=o.material.clone();o.material.color.set('#dfdfd3');o.material.roughness=.84;o.material.metalness=.04;}
  if(o.name==='抽象窄巷街塊'){o.material=o.material.clone();o.material.color.set('#7a9188');o.material.roughness=.77;o.material.metalness=.16;}
 });
}
