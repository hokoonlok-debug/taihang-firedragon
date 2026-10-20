import * as T from 'three';
import {glyphs} from './inscription-glyphs.js?v=20261020';

// Genuine recessed strokes, curved to the base, retained in GLB exports.
export function addInscription(root){
 const base=root.getObjectByName('base');if(!base||base.getObjectByName('底盤刻字_龍脈・大坑'))return;
 const old=base.getObjectByName('龍脈字章底片');if(old)old.removeFromParent();
 const group=new T.Group();group.name='底盤刻字_龍脈・大坑';
 group.userData={part:'base',text:'龍脈・大坑',typeface:'霞鶩文楷 TC Bold',finish:'弧面陰刻・古銅凹槽'};base.add(group);
 const ivory=new T.MeshStandardMaterial({name:'刻字面_暖白礦物',color:'#dfdfd3',roughness:.84,metalness:.04});
 const bronze=new T.MeshStandardMaterial({name:'刻字細框_霧面古銅',color:'#9a7146',roughness:.63,metalness:.55});
 const recess=new T.MeshStandardMaterial({name:'陰刻槽底_深古銅',color:'#493528',roughness:.8,metalness:.22});
 const rectangle=(w,h)=>{const s=new T.Shape();s.moveTo(-w/2,-h/2);s.lineTo(w/2,-h/2);s.lineTo(w/2,h/2);s.lineTo(-w/2,h/2);s.closePath();return s;};
 function mesh(shape,depth,z,material,name){
  const raw=new T.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:false,curveSegments:10}),source=raw.attributes.position,vertices=[];
  // Subdivide before bending: a four-corner backing would otherwise cut across the base.
  function split(a,b,c){
   const edges=[[a,b,c],[b,c,a],[c,a,b]].sort((u,v)=>Math.abs(v[0][0]-v[1][0])-Math.abs(u[0][0]-u[1][0]));
   const [p,q,r]=edges[0];if(Math.abs(p[0]-q[0])<.09){vertices.push(...a,...b,...c);return;}
   const mid=p.map((n,i)=>(n+q[i])/2);split(p,mid,r);split(mid,q,r);
  }
  for(let i=0;i<source.count;i+=3)split([source.getX(i),source.getY(i),source.getZ(i)],[source.getX(i+1),source.getY(i+1),source.getZ(i+1)],[source.getX(i+2),source.getY(i+2),source.getZ(i+2)]);
  raw.dispose();const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));const p=g.attributes.position;
  for(let i=0;i<p.count;i++){const a=p.getX(i)/2.95,r=2.95+z+p.getZ(i);p.setXYZ(i,Math.sin(a)*r,p.getY(i)+.278,Math.cos(a)*r);}
  g.computeVertexNormals();const m=new T.Mesh(g,material);m.name=name;m.userData.part='base';m.castShadow=m.receiveShadow=true;group.add(m);return m;
 }
 const face=rectangle(2.07,.364),islands=[];
 for(const [ch,cx] of [['龍',-.725],['脈',-.305],['大',.305],['坑',.725]]){
  const d=glyphs[ch],s=.34/d.em,b=d.bounds,ox=(b[0]+b[2])/2,oy=(b[1]+b[3])/2,path=new T.ShapePath();
  for(const [op,...v]of d.commands){const q=v.map((n,i)=>(n-(i%2?oy:ox))*s+(i%2?0:cx));
   if(op==='M')path.moveTo(...q);else if(op==='L')path.lineTo(...q);else if(op==='Q')path.quadraticCurveTo(...q);else if(op==='C')path.bezierCurveTo(...q);else path.currentPath.closePath();
  }
  for(const shape of path.toShapes()){
   const cut=new T.Path();cut.curves=shape.curves;face.holes.push(cut);
   for(const hole of shape.holes){const island=new T.Shape();island.curves=hole.curves;islands.push(island);}
  }
 }
 const dot=new T.Path();dot.absarc(0,0,.018,0,Math.PI*2,false);face.holes.push(dot);
 mesh(rectangle(2.10,.394),.008,.003,bronze,'底盤刻字_古銅細邊');
 mesh(rectangle(2.07,.364),.004,.012,recess,'底盤刻字_凹槽底');
 mesh([face,...islands],.018,.017,ivory,'底盤刻字_陰刻字壁與字面');
}
