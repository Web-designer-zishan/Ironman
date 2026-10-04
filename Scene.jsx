import React,{Suspense,useRef,useState,useEffect,useMemo} from 'react'
import {Canvas,useFrame} from '@react-three/fiber'
import {Environment,Lightformer,useGLTF,Edges} from '@react-three/drei'
import * as THREE from 'three'
import {S} from './store'
import modelUrl from './ironman.glb?url'

const MODEL=modelUrl                     // ironman.glb in the project root (optimised from your file)
const CHEST=[0,1.05,.27]                  // reactor position for the built-in fallback suit
const GL_CHEST=[.12,1.03,.38],GL_EYES=[[-.013,1.43,.28],[.107,1.43,.28]] // positions on your GLB                  // reactor position (tweak for your GLB)
const mob=()=>innerWidth<768
// per-section camera keyframes: [camY, camZ, lookY, modelX]
const KF=[[.3,7.5,0,1.7],[1.2,4.6,1,-1.5],[1.8,3,1.55,1.5],[.3,7,0,0],[1.1,2.5,1.05,0],[.2,11,0,0]]

const glowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64)
g.addColorStop(0,'rgba(210,248,255,1)');g.addColorStop(.3,'rgba(143,223,255,.4)');g.addColorStop(1,'rgba(143,223,255,0)');x.fillStyle=g;x.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)})()

const red=new THREE.MeshPhysicalMaterial({color:'#a30f18',metalness:.85,roughness:.25,clearcoat:1,clearcoatRoughness:.12})
const gold=new THREE.MeshPhysicalMaterial({color:'#d1a03a',metalness:1,roughness:.24,clearcoat:.5})
const gun=new THREE.MeshStandardMaterial({color:'#24272b',metalness:.9,roughness:.45})
const eye=new THREE.MeshStandardMaterial({color:'#000',emissive:'#bfeaff',emissiveIntensity:0})
const P=({g='c',a,p,r,s,m,e=1,children})=><mesh position={p} rotation={r} scale={s} material={m}>
  {g==='c'?<cylinderGeometry args={a}/>:g==='s'?<sphereGeometry args={a}/>:<boxGeometry args={a}/>}
  {e&&!mob()?<Edges threshold={30} color="#120000"/>:null}{children}</mesh>

function Suit(){ // procedural Mark VII, modelled from the reference sheet
  useFrame(()=>{eye.emissiveIntensity=6*THREE.MathUtils.smoothstep(S.boot,.6,1)})
  return <group scale={.93} position={[0,.26,0]}>
    <group position={[0,1.42,0]}>{/* helmet */}
      <P g="s" a={[.21,24,18]} s={[1,1.2,1.08]} m={red}/>
      <P g="b" a={[.27,.3,.1]} p={[0,-.05,.19]} m={gold}/>
      <P a={[.11,.06,.14,6]} p={[0,-.25,.19]} m={gold}/>
      {[-1,1].map(x=><group key={x}>
        <P g="b" a={[.1,.025,.02]} p={[x*.08,.03,.245]} r={[0,0,x*.2]} m={eye} e={0}/>
        <P a={[.065,.065,.03,16]} p={[x*.215,0,0]} r={[0,0,Math.PI/2]} m={gold}/></group>)}
    </group>
    <P a={[.09,.11,.2,10]} p={[0,1.2,0]} m={gun} e={0}/>
    <P a={[.44,.3,.62,8]} p={[0,.75,0]} s={[1.15,1,.62]} m={red}/>{/* chest */}
    <P g="b" a={[.13,.5,.05]} p={[0,.72,-.27]} m={gold}/>{/* spine plate */}
    <P g="b" a={[.34,.12,.05]} p={[0,.95,-.26]} m={gold}/>
    <P a={[.2,.2,.5,8]} p={[0,.12,0]} s={[1,1,.7]} m={gun} e={0}/>{/* waist core */}
    <P a={[.28,.25,.17,8]} p={[0,.3,0]} s={[1,1,.75]} m={red}/>
    <P a={[.25,.23,.15,8]} p={[0,.14,0]} s={[1,1,.75]} m={red}/>
    <P a={[.23,.27,.15,8]} p={[0,-.02,0]} s={[1,1,.75]} m={red}/>
    <P a={[.3,.34,.2,8]} p={[0,-.22,0]} s={[1.2,1,.8]} m={red}/>
    {[-1,1].map(x=><group key={x}>
      <P g="s" a={[.24,20,16]} p={[x*.56,1.02,0]} s={[1.1,.9,1]} m={red}/>
      <group position={[x*.6,.98,0]} rotation={[.1,0,x*.12]}>{/* arm */}
        <P a={[.13,.11,.5,12]} p={[0,-.27,0]} m={red}/>
        <P g="s" a={[.1,12,12]} p={[0,-.52,0]} m={gun} e={0}/>
        <group position={[0,-.52,0]} rotation={[-.5,0,0]}>
          <P a={[.12,.15,.5,12]} p={[0,-.3,0]} m={red}/>
          <P a={[.115,.115,.08,12]} p={[0,-.1,0]} m={gold}/>
          <P g="b" a={[.2,.2,.22]} p={[0,-.64,.03]} m={red}/>
        </group>
      </group>
      <group position={[x*.2,-.38,0]} rotation={[0,0,x*.05]}>{/* leg */}
        <P a={[.2,.15,.8,10]} p={[0,-.42,0]} s={[1,1,.9]} m={gold}/>
        <P a={[.21,.2,.12,10]} p={[0,-.05,0]} s={[1,1,.9]} m={red}/>
        <group position={[0,-.84,0]}>
          <P g="s" a={[.13,12,12]} m={gun} e={0}/>
          <P g="b" a={[.2,.13,.12]} p={[0,.02,.1]} m={red}/>
          <P a={[.15,.11,.8,10]} p={[0,-.42,0]} s={[1,1,1.1]} m={red}/>
          <P g="s" a={[.14,12,12]} p={[0,-.25,-.07]} s={[1,1.6,1]} m={red}/>
          <P g="b" a={[.24,.14,.5]} p={[0,-.9,.1]} m={red}/>
          <P g="b" a={[.22,.1,.2]} p={[0,-.92,.32]} m={red}/>
        </group>
      </group>
    </group>)}
  </group>
}

function GLB(){
  const {scene}=useGLTF(MODEL)
  const o=useMemo(()=>{const c=scene.clone(),b=new THREE.Box3().setFromObject(c),s=b.getSize(new THREE.Vector3()),t=b.getCenter(new THREE.Vector3()),k=3.4/s.y
    c.scale.setScalar(k);c.position.set(-t.x*k,-t.y*k,-t.z*k)
    c.traverse(n=>{if(n.isMesh&&n.material)n.material.envMapIntensity=1.6});return c},[scene])
  useEffect(()=>()=>o.traverse(n=>{n.geometry?.dispose?.()}),[o])
  return <><primitive object={o}/><Reactor p={GL_CHEST} rings={false} sz={.55}/>{GL_EYES.map((e,i)=><Eye key={i} p={e}/>)}</>
}
function Eye({p}){
  const r=useRef()
  useFrame(()=>r.current.scale.setScalar(.16*THREE.MathUtils.smoothstep(S.boot,.6,1)))
  return <sprite ref={r} position={p}><spriteMaterial map={glowTex} blending={THREE.AdditiveBlending} depthWrite={false} transparent/></sprite>
}
const Fallback=()=><><Suit/><Reactor/></>
useGLTF.preload(MODEL)
class Boundary extends React.Component{state={e:0};static getDerivedStateFromError(){return{e:1}};render(){return this.state.e?this.props.fb:this.props.children}}

function Reactor({p=CHEST,rings=true,sz=.8}){
  const r=useRef(),l=useRef(),s=useRef()
  useFrame((_,dt)=>{
    const a=Math.max(0,(S.boot-.5)*2),p=S.pulse
    r.current?.children.forEach((c,i)=>c.rotation.z+=dt*(i%2?-1:1)*(.6+i*.5))
    l.current.intensity=4*a*(.75+.25*p);s.current.scale.setScalar(sz*a*(.9+.2*p))
  })
  return <group position={p}>
    {rings&&<><group ref={r}>{[.1,.15,.2].map((R,i)=><mesh key={i}><torusGeometry args={[R,.007+i*.004,12,i===1?6:64]}/><meshBasicMaterial color={i===1?'#ffffff':'#8FDFFF'}/></mesh>)}</group>
    <mesh position-z={.005}><circleGeometry args={[.07,32]}/><meshBasicMaterial color="#e6fbff"/></mesh></>}
    <sprite ref={s}><spriteMaterial map={glowTex} blending={THREE.AdditiveBlending} depthWrite={false} transparent/></sprite>
    <pointLight ref={l} color="#8FDFFF" distance={4}/>
  </group>
}

function Rig({children}){
  const g=useRef(),h=useRef(),m=useRef({x:0,y:0})
  useEffect(()=>{
    let lx=0
    const mv=e=>{m.current.x=e.clientX/innerWidth-.5;m.current.y=e.clientY/innerHeight-.5;if(S.drag){S.rot+=(e.clientX-lx)*.01;lx=e.clientX}}
    const dn=e=>{if(e.target.closest('button,a'))return;S.drag=true;lx=e.clientX}
    const up=()=>S.drag=false
    addEventListener('pointermove',mv);addEventListener('pointerdown',dn);addEventListener('pointerup',up);addEventListener('pointercancel',up)
    return()=>{removeEventListener('pointermove',mv);removeEventListener('pointerdown',dn);removeEventListener('pointerup',up);removeEventListener('pointercancel',up)}
  },[])
  useFrame((st,dt)=>{
    dt=Math.min(dt,.05);const T=st.clock.elapsedTime,b=S.boot,c=st.camera,Mb=mob()
    const f=THREE.MathUtils.clamp(S.p,0,1)*5,i=Math.min(Math.floor(f),4),t=THREE.MathUtils.smoothstep(f-i,0,1)
    const k=KF[i].map((v,j)=>v+(KF[i+1][j]-v)*t),d=1-Math.exp(-dt*3.5)
    c.position.x+=((Mb?0:m.current.x*.9)-c.position.x)*d
    c.position.y+=(k[0]-m.current.y*.5-c.position.y)*d
    c.position.z+=(k[1]*(Mb?1.6:1)-S.zoom*1.6+(1-b)*4-c.position.z)*d
    c.lookAt(0,k[2]+(Mb?.5:0),0)
    g.current.position.x+=((Mb?0:k[3])-g.current.position.x)*d
    g.current.position.y=Math.sin(T*.8)*.06
    g.current.scale.setScalar(.85+.15*b)
    S.rot+=dt*S.spin*1.2;h.current.rotation.y=S.rot+Math.sin(T*.3)*.35
    S.pulse=.5+.5*Math.sin(T*2.2)
    document.documentElement.style.setProperty('--pulse',S.pulse.toFixed(3))
  })
  return <group ref={g}><group ref={h}>{children}</group>
    <mesh rotation-x={-Math.PI/2} position-y={-1.74}><ringGeometry args={[1.05,1.1,64]}/><meshBasicMaterial color="#E21E2A"/></mesh>
    <mesh rotation-x={-Math.PI/2} position-y={-1.75}><circleGeometry args={[1.6,64]}/><meshStandardMaterial color="#0a0a0a" metalness={1} roughness={.35}/></mesh>
  </group>
}

function Dust({n,size}){
  const ref=useRef()
  const pos=useMemo(()=>{const a=new Float32Array(n*3);for(let i=0;i<n*3;i+=3){a[i]=(Math.random()-.5)*16;a[i+1]=(Math.random()-.5)*10;a[i+2]=-Math.random()*8-1}return a},[n])
  useFrame((s,dt)=>{ref.current.rotation.y+=dt*.01;ref.current.position.y=Math.sin(s.clock.elapsedTime*.2)*.2})
  return <points ref={ref}><bufferGeometry><bufferAttribute attach="attributes-position" args={[pos,3]}/></bufferGeometry>
    <pointsMaterial size={size} color="#8FDFFF" transparent opacity={.5} depthWrite={false}/></points>
}

export default function Scene(){
  const M_=mob()
  return <div className="cv"><Canvas dpr={[1,M_?1.5:2]} camera={{fov:35,position:[0,.3,11]}} gl={{antialias:!M_,toneMapping:THREE.ACESFilmicToneMapping}}>
    <color attach="background" args={['#050505']}/><fog attach="fog" args={['#050505',9,22]}/>
    <Environment resolution={256}>
      <Lightformer form="rect" intensity={4} position={[0,5,-5]} scale={[10,3,1]}/>
      <Lightformer form="rect" intensity={3} color="#E21E2A" position={[-5,1,-2]} scale={[3,6,1]} rotation-y={Math.PI/2}/>
      <Lightformer form="rect" intensity={2.5} color="#8FDFFF" position={[5,2,-3]} scale={[3,6,1]} rotation-y={-Math.PI/2}/>
    </Environment>
    <directionalLight position={[3,5,4]} intensity={1.6}/>
    <pointLight color="#E21E2A" position={[-3,1,2]} intensity={25}/>
    <pointLight color="#c8f1ff" position={[3,3,-3]} intensity={30}/>
    <Rig><Boundary fb={<Fallback/>}><Suspense fallback={null}><GLB/></Suspense></Boundary></Rig>
    <Dust n={M_?60:160} size={.02}/><Dust n={M_?20:50} size={.05}/>
  </Canvas></div>
}
