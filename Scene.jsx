import React,{Suspense,useRef,useState,useEffect,useMemo} from 'react'
import {Canvas,useFrame} from '@react-three/fiber'
import {Environment,Lightformer,useGLTF} from '@react-three/drei'
import * as THREE from 'three'
import {S} from './store'
import suitUrl from './suit.jpg'

const MODEL='/models/ironman.glb'        // <- replace this file to swap the suit
const CHEST=[0,.85,.28]                  // reactor position (tweak for your GLB)
const mob=()=>innerWidth<768
// per-section camera keyframes: [camY, camZ, lookY, modelX]
const KF=[[.3,7.5,0,1.7],[1.2,4.6,1,-1.5],[1.8,3.8,1.55,1.5],[.3,7,0,0],[1.1,3.4,1.15,0],[.2,11,0,0]]

const glowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64)
g.addColorStop(0,'rgba(210,248,255,1)');g.addColorStop(.3,'rgba(143,223,255,.4)');g.addColorStop(1,'rgba(143,223,255,0)');x.fillStyle=g;x.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)})()

function useCutout(url){
  const [t,setT]=useState(null)
  useEffect(()=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=im.width;c.height=im.height
    const x=c.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,c.width,c.height),a=d.data
    for(let i=0;i<a.length;i+=4)a[i+3]=Math.min(255,Math.max(0,(Math.max(a[i],a[i+1],a[i+2])-10)*8))
    x.putImageData(d,0,0);const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;tx.anisotropy=8;setT(tx)};im.src=url},[url])
  return t
}
function Glow({p,s,c='#8FDFFF',k=1,pulse}){
  const r=useRef()
  useFrame(()=>{r.current.scale.setScalar(s*THREE.MathUtils.smoothstep(S.boot,.5,1)*(pulse?.9+.2*S.pulse:1))})
  return <sprite ref={r} position={p}><spriteMaterial map={glowTex} color={c} opacity={k} blending={THREE.AdditiveBlending} depthWrite={false} transparent/></sprite>
}
function ImageSuit(){ // your reference image, background keyed out
  const t=useCutout(suitUrl);if(!t)return null
  const H=3.6,W=H*548/1341
  return <group>
    <Glow p={[0,.2,-.4]} s={5.5} c="#B5121B" k={.35}/>
    <mesh><planeGeometry args={[W,H]}/><meshBasicMaterial map={t} transparent toneMapped={false} fog={false} depthWrite={false}/></mesh>
    <Glow p={[.19,1.17,.02]} s={.9} pulse/>
    <Glow p={[.01,1.56,.02]} s={.25}/><Glow p={[.17,1.56,.02]} s={.25}/>
  </group>
}

function GLB(){
  const {scene}=useGLTF(MODEL)
  const o=useMemo(()=>{const c=scene.clone(),b=new THREE.Box3().setFromObject(c),s=b.getSize(new THREE.Vector3()),t=b.getCenter(new THREE.Vector3()),k=3.4/s.y
    c.scale.setScalar(k);c.position.set(-t.x*k,-t.y*k,-t.z*k)
    c.traverse(n=>{if(n.isMesh&&n.material)n.material.envMapIntensity=1.6});return c},[scene])
  useEffect(()=>()=>o.traverse(n=>{n.geometry?.dispose?.()}),[o])
  return <primitive object={o}/>
}
class Boundary extends React.Component{state={e:0};static getDerivedStateFromError(){return{e:1}};render(){return this.state.e?this.props.fb:this.props.children}}

function Reactor(){
  const r=useRef(),l=useRef(),s=useRef()
  useFrame((_,dt)=>{
    const a=Math.max(0,(S.boot-.5)*2),p=S.pulse
    r.current.children.forEach((c,i)=>c.rotation.z+=dt*(i%2?-1:1)*(.6+i*.5))
    l.current.intensity=4*a*(.75+.25*p);s.current.scale.setScalar(.8*a*(.9+.2*p))
  })
  return <group position={CHEST}>
    <group ref={r}>{[.1,.15,.2].map((R,i)=><mesh key={i}><torusGeometry args={[R,.007+i*.004,12,i===1?6:64]}/><meshBasicMaterial color={i===1?'#ffffff':'#8FDFFF'}/></mesh>)}</group>
    <mesh position-z={.005}><circleGeometry args={[.07,32]}/><meshBasicMaterial color="#e6fbff"/></mesh>
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
    if(S.flat){S.rot=THREE.MathUtils.clamp(S.rot,-.7,.7);h.current.rotation.y=S.rot+Math.sin(T*.3)*.1+S.spin*Math.sin(T*1.2)*.5}
    else{S.rot+=dt*S.spin*1.2;h.current.rotation.y=S.rot+Math.sin(T*.3)*.35}
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
  const [has,setHas]=useState(false)
  useEffect(()=>{fetch(MODEL,{method:'HEAD'}).then(r=>setHas(r.ok&&!(r.headers.get('content-type')||'').includes('html'))).catch(()=>{})},[])
  const M_=mob();S.flat=!has
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
    <Rig>{has?<><Boundary fb={<ImageSuit/>}><Suspense fallback={<ImageSuit/>}><GLB/></Suspense></Boundary><Reactor/></>:<ImageSuit/>}</Rig>
    <Dust n={M_?60:160} size={.02}/><Dust n={M_?20:50} size={.05}/>
  </Canvas></div>
}
