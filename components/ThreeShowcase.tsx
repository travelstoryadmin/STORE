'use client';

import {Canvas,useFrame} from '@react-three/fiber';
import {Float,Environment,MeshTransmissionMaterial,ContactShadows,RoundedBox} from '@react-three/drei';
import {useRef} from 'react';
import * as THREE from 'three';

function Bottle({position,color,scale=1}:{position:[number,number,number];color:string;scale?:number}){
  const ref=useRef<THREE.Mesh>(null);
  useFrame((_,delta)=>{if(ref.current)ref.current.rotation.y+=delta*.35});
  return <Float speed={1.35} rotationIntensity={.28} floatIntensity={.65}>
    <RoundedBox ref={ref} position={position} scale={scale} args={[1.1,1.8,.7]} radius={.12} smoothness={6}>
      <MeshTransmissionMaterial color={color} transmission={.2} roughness={.16} metalness={.32} thickness={.45} envMapIntensity={1.8}/>
    </RoundedBox>
  </Float>;
}

export default function ThreeShowcase(){
  return <div className="three-showcase" aria-hidden="true">
    <Canvas camera={{position:[0,0,6],fov:38}} dpr={[1,1.5]} gl={{alpha:true,antialias:true}}>
      <ambientLight intensity={1.5}/>
      <directionalLight position={[3,4,5]} intensity={2.2}/>
      <pointLight position={[-3,1,2]} intensity={1.2}/>
      <Bottle position={[-.9,0,0]} color="#10110f" scale={1}/>
      <Bottle position={[.75,.05,.2]} color="#c79a58" scale={.82}/>
      <Environment preset="studio"/>
      <ContactShadows position={[0,-1.25,0]} opacity={.22} scale={5} blur={2}/>
    </Canvas>
  </div>;
}
