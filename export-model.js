import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {createDancers,styleExhibit} from './dancers.js?v=20261022-brush2';
export async function exportCompleteModel(){
 const root=(await new GLTFLoader().loadAsync('./model.glb')).scene;
 root.add(createDancers(root));styleExhibit(root);
 root.name='龍脈・大坑_社區共舞';
 const bytes=await new GLTFExporter().parseAsync(root,{binary:true,onlyVisible:true});
 const url=URL.createObjectURL(new Blob([bytes],{type:'model/gltf-binary'}));
 const a=document.createElement('a');a.href=url;a.download='龍脈大坑_火龍與舞龍人偶.glb';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
 root.traverse(o=>{if(o.isMesh)o.geometry.dispose();});
}
