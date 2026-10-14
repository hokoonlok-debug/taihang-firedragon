import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// Contemporary miniature sculptures, not a reconstruction of a particular procession.
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
 const root=new T.Group();root.name='dancers';root.userData={part:'dancers',description:'七位當代舞龍微型人偶；人數、衣色與站位為文創設定'};
 const materials={
  skin:new T.MeshStandardMaterial({name:'暖白霧面雕塑',color:'#e6c7a6',roughness:.78}),
  hair:new T.MeshStandardMaterial({name:'炭墨頭髮',color:'#343b39',roughness:.96}),
  red:new T.MeshStandardMaterial({name:'朱紅棉布',color:'#c6604d',roughness:.91}),
  white:new T.MeshStandardMaterial({name:'暖白棉布',color:'#e8e4d8',roughness:.94}),
  teal:new T.MeshStandardMaterial({name:'霧青棉布',color:'#668b86',roughness:.91}),
  trouser:new T.MeshStandardMaterial({name:'石墨棉褲',color:'#424f50',roughness:.95}),
  sole:new T.MeshStandardMaterial({name:'米白鞋底',color:'#ded9cb',roughness:.9}),
  pole:new T.MeshStandardMaterial({name:'竹竿',color:'#a28a55',roughness:.76}),
  pearl:new T.MeshStandardMaterial({name:'龍珠光點',color:'#e4ad67',emissive:'#8d4013',emissiveIntensity:.25,roughness:.55})
 };
 const coats=[materials.red,materials.white,materials.teal];
 dancerLayout.forEach((cfg,index)=>{
  const person=new T.Group();person.name=`舞龍者_${String(index+1).padStart(2,'0')}${cfg.pearl?'_引珠':'_持桿'}`;person.position.fromArray(cfg.p);person.rotation.y=cfg.yaw;root.add(person);
  const buckets=new Map();
  function add(g,m){if(!buckets.has(m))buckets.set(m,[]);if(g.index)g=g.toNonIndexed();g.deleteAttribute('uv');buckets.get(m).push(g);}
  function oval(p,s,m){const g=new T.SphereGeometry(1,16,12);g.scale(...s);g.translate(...p);add(g,m);}
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
  // Feet and bent legs keep a plausible weight-bearing stance.
  const feet=[[-.13,.055,step],[.14,.055,-step]];
  person.updateMatrixWorld(true);baseScene?.updateMatrixWorld(true);
  feet.forEach((foot,k)=>{let floor=0;
   if(baseScene){const wp=person.localToWorld(V(foot[0],0,foot[2]));const ray=new T.Raycaster(V(wp.x,.9,wp.z),V(0,-1,0));const hit=ray.intersectObject(baseScene.getObjectByName('base'),true).find(h=>h.point.y<.8);if(hit)floor=Math.max(0,hit.point.y-cfg.p[1]+.004);}
   oval([foot[0],floor+.058,foot[2]+.034],[.078,.057,.135],materials.sole);oval([foot[0],floor+.085,foot[2]+.02],[.071,.055,.119],materials.trouser);const sx=k===0?-1:1;section([[sx*.105,.69,0],[sx*.14,.38+floor*.3,foot[2]+.045],[foot[0],floor+.12,foot[2]]],[.10,.077,.057],[.08,.072,.056],materials.trouser);});
  section([[0,.65,0],[0,.81,.007],[.008,1.01,.035],[.012,1.11,.045]],[.15,.157,.205,.16],[.092,.092,.11,.075],c);
  // Hem, collar, neck, shaped head, ears, hair cap, nose and restrained facial detail.
  section([[0,.674,.004],[0,.708,.004]],[.16,.158],[.096,.096],materials.white);
  rod([.012,1.10,.045],[.012,1.21,.045],.047,materials.skin);
  oval([.012,1.118,.046],[.068,.015,.059],materials.white);
  oval([.012,1.305,.047],[.079,.108,.083],materials.skin);
  oval([.012,1.348,.026],[.082,.076,.079],materials.hair);
  oval([.012,1.30,.124],[.018,.033,.024],materials.skin);
  oval([-.067,1.30,.044],[.014,.028,.014],materials.skin);oval([.091,1.30,.044],[.014,.028,.014],materials.skin);
  [-.024,.048].forEach(x=>oval([x,1.325,.117],[.012,.005,.0035],materials.hair));
  if(index===1||index===4)oval([.015,1.343,-.056],[.039,.04,.03],materials.hair);
  const headband=new T.TorusGeometry(.080, .007, 5,32);headband.rotateX(Math.PI/2);headband.scale(1,1,.97);headband.translate(.012,1.35,.045);add(headband,materials.red);
  person.updateMatrixWorld(true);
  const poleTop=person.worldToLocal(V(...cfg.to)),poleBottom=V(.20,.15,.37);
  function onPole(y){return poleBottom.clone().lerp(poleTop,(y-poleBottom.y)/(poleTop.y-poleBottom.y));}
  const hands=[onPole(index%2?1.19:1.26),onPole(.89)];
  hands.forEach((h,k)=>{const sx=k===0?-1:1,shoulder=[sx*.174,1.055,.035],elbow=[sx*.25,k===0?1.055:.81,.22];
   const sleeveEnd=V(...shoulder).lerp(V(...elbow),.65).toArray();section([shoulder,sleeveEnd],[.076,.071],[.065,.062],c);
   section([sleeveEnd,elbow,h.toArray()],[.048,.041,.032],[.046,.039,.031],materials.skin);
   oval(h.toArray(),[.039,.047,.034],materials.skin);
   for(let f=0;f<3;f++){const y=h.y-.02+f*.014;section([[h.x-.028,y,h.z+.018],[h.x+.005,y,h.z+.042],[h.x+.034,y,h.z+.01]],[.009,.009,.008],[.009,.009,.008],materials.skin);}
  });
  rod(poleBottom.toArray(),poleTop.toArray(),.018,materials.pole);
  if(cfg.pearl){oval(poleTop.toArray(),[.14,.15,.14],materials.pearl);for(let j=0;j<22;j++){const a=j*2.39996,z=1-2*(j+.5)/22,r=Math.sqrt(1-z*z),d=V(r*Math.cos(a),z,r*Math.sin(a));rod(poleTop.clone().addScaledVector(d,.13).toArray(),poleTop.clone().addScaledVector(d,.23).toArray(),.006,materials.pole);}}
  for(const [mat,geos]of buckets){const mesh=new T.Mesh(mergeGeometries(geos),mat);mesh.name=`${person.name}_${mat.name}`;mesh.userData.part='dancers';mesh.castShadow=mesh.receiveShadow=true;person.add(mesh);geos.forEach(g=>g.dispose());}
 });
 return root;
}

export function styleExhibit(root){
 // Only contemporary base and moon-frame finishes change; straw/rope/incense stay intact.
 root.traverse(o=>{if(!o.isMesh)return;
  if(o.name==='倒角石色底座'){o.material=o.material.clone();o.material.color.set('#dfdfd3');o.material.roughness=.84;o.material.metalness=.04;}
  if(o.name==='抽象窄巷街塊'){o.material=o.material.clone();o.material.color.set('#7a9188');o.material.roughness=.77;o.material.metalness=.16;}
 });
}
