import {useEffect,useLayoutEffect,useRef,useState} from 'react'
import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import {ArrowRight,Rotate3d,ZoomIn,RotateCcw} from 'lucide-react'
import Scene from './Scene'
import {S} from './store'
gsap.registerPlugin(ScrollTrigger)

function Btn({children,href='#',ghost}){
  const r=useRef()
  return <a ref={r} href={href} className={'btn'+(ghost?' ghost':'')}
    onMouseMove={e=>{const b=r.current.getBoundingClientRect();gsap.to(r.current,{x:(e.clientX-b.left-b.width/2)*.25,y:(e.clientY-b.top-b.height/2)*.25,duration:.4,ease:'power3.out'})}}
    onMouseLeave={()=>gsap.to(r.current,{x:0,y:0,duration:.6,ease:'power3.out'})}>{children}<ArrowRight size={14}/></a>
}
const Lines=({a})=>a.map((t,i)=><span className="mask" key={i}><span className="h-line">{t}</span></span>)

function Count({to,dec=1,suf=''}){
  const r=useRef()
  useEffect(()=>{const o={v:0};const t=gsap.to(o,{v:to,duration:2.2,ease:'power2.out',scrollTrigger:{trigger:r.current,start:'top 90%'},onUpdate:()=>r.current.textContent=o.v.toFixed(dec)+suf});return()=>t.kill()},[])
  return <b ref={r}>0{suf}</b>
}

function Loader({onDone}){
  const [v,setV]=useState(0),el=useRef(),tl=useRef()
  const msgs=['INITIALIZING ARMOR','LOADING NEURAL SYSTEM','CALIBRATING POWER CORE','SYSTEM READY']
  const i=v>=95?3:v>=65?2:v>=30?1:0
  useEffect(()=>{
    const o={v:0}
    tl.current=gsap.timeline()
      .to(o,{v:100,duration:2.4,ease:'power1.inOut',onUpdate:()=>setV(Math.round(o.v))})
      .add(()=>gsap.to(S,{boot:1,duration:2.4,ease:'power3.out'}),1.4)
      .to(el.current,{opacity:0,duration:.8,onComplete:onDone},'>-.1')
    return()=>tl.current.kill()
  },[])
  return <div className="loader" ref={el}>
    <div className="ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44"/><circle cx="50" cy="50" r="44" className="p" style={{strokeDashoffset:276*(1-v/100)}}/></svg><span>{v}%</span></div>
    <p>{msgs[i]}{i<3?'...':''}</p>
    <button onClick={()=>tl.current.progress(1)}>SKIP</button>
  </div>
}

export default function App(){
  const [ready,setReady]=useState(false),[scrolled,setScrolled]=useState(false),[act,setAct]=useState({})
  const tgl=k=>{const n=!act[k];setAct(a=>({...a,[k]:n}));if(k==='spin')S.spin=n?1:0;if(k==='zoom')S.zoom=n?1:0}
  const reset=()=>{S.spin=0;S.zoom=0;setAct({});gsap.to(S,{rot:0,duration:1.2,ease:'power3.inOut'})}

  useLayoutEffect(()=>{gsap.set('.h-line',{yPercent:110});gsap.set('.rv',{opacity:0,y:20})},[])
  useEffect(()=>{
    const st=ScrollTrigger.create({start:0,end:'max',onUpdate:s=>{S.p=s.progress}})
    const sc=()=>setScrolled(scrollY>40);addEventListener('scroll',sc)
    gsap.utils.toArray('.card,.spec,.sec h2 .h-line,.status').forEach(el=>{
      if(el.closest('.hero'))return
      gsap.fromTo(el,el.classList.contains('h-line')?{yPercent:110}:{y:50,opacity:0},{yPercent:0,y:0,opacity:1,duration:1.1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%'}})})
    return()=>{st.kill();removeEventListener('scroll',sc);ScrollTrigger.getAll().forEach(t=>t.kill())}
  },[])
  useEffect(()=>{if(!ready)return
    gsap.timeline().to('.hero .h-line',{yPercent:0,duration:1.2,stagger:.12,ease:'expo.out'})
      .to('.hero .rv',{opacity:1,y:0,duration:1,stagger:.1,ease:'power3.out'},'-=.8')
  },[ready])

  return <>
    <Scene/>
    {!ready&&<Loader onDone={()=>setReady(true)}/>}
    <nav className={scrolled?'nav on':'nav'}>
      <a href="#top" className="logo">STARK<br/>INDUSTRIES</a>
      <div className="links">{[['ARMOR','#armor'],['TECHNOLOGY','#tech'],['SYSTEM','#specs'],['ABOUT','#cta']].map(([t,h])=><a key={t} href={h}>{t}</a>)}</div>
      <a className="btn sm" href="#cta">ACCESS SYSTEM</a>
    </nav>
    <main id="top">
      <section className="sec hero">
        <div className="hud h1 rv"><i/><small>POWER CORE</small><b>97.8%</b></div>
        <div className="hud h2 rv"><i/><small>ARMOR INTEGRITY</small><b>100%</b></div>
        <div className="hud h3 rv"><i/><small>FLIGHT SYSTEM</small><b>ONLINE</b></div>
        <div className="hud h4 rv"><i/><small>AI CORE</small><b>ACTIVE</b></div>
        <div className="hud h5 rv"><i/><small>ENERGY OUTPUT</small><b>87.4 GW</b></div>
        <div className="col">
          <span className="tag rv">STARK INDUSTRIES // SYSTEM 07 &nbsp;·&nbsp; MARK VII</span>
          <h1><Lines a={['IRON','MAN']}/></h1>
          <h3 className="rv">NEXT GENERATION<br/>ARMOR TECHNOLOGY</h3>
          <p className="rv">An advanced powered armor platform engineered for strength, mobility, protection and intelligent combat assistance.</p>
          <div className="ctas rv"><Btn href="#armor">EXPLORE SUIT</Btn><Btn href="#tech" ghost>VIEW SYSTEM</Btn></div>
        </div>
      </section>

      <section className="sec right" id="tech"><div className="col">
        <span className="tag">01 // ARMOR TECHNOLOGY</span>
        <h2><Lines a={['ENGINEERED','FOR THE FUTURE']}/></h2>
        <div className="cards">{[['FLIGHT SYSTEM','Advanced propulsion architecture designed for high-speed aerial mobility.'],['POWER CORE','High-density energy generation system.'],['AI ASSISTANCE','Real-time tactical analysis and system monitoring.'],['NANOTECH ARMOR','Adaptive protective architecture.']].map(([t,d])=><div className="card" key={t}><h4>{t}</h4><p>{d}</p></div>)}</div>
      </div></section>

      <section className="sec" id="specs"><div className="col">
        <span className="tag">02 // SUIT SPECIFICATIONS</span>
        <h2><Lines a={['SYSTEM','SPECS']}/></h2>
        {[['ARMOR','TITANIUM-CERAMIC COMPOSITE'],['POWER','ARC REACTOR CORE'],['AI','TACTICAL ASSIST SYSTEM'],['PROPULSION','MICRO-THRUSTER ARRAY'],['DEFENSE','MULTI-LAYER ENERGY SHIELD']].map(([a,b])=><div className="spec" key={a}><small>{a}</small><span>{b}</span></div>)}
        <p className="note">Fictional concept specifications. Not real-world capabilities.</p>
      </div></section>

      <section className="sec center" id="armor">
        <span className="tag">03 // SHOWCASE</span>
        <h2><Lines a={['THE ARMOR']}/></h2>
        <div className="bottom">
          <div className="ctrls">
            <button className={act.spin?'on':''} onClick={()=>tgl('spin')}><Rotate3d size={14}/>ROTATE</button>
            <button className={act.zoom?'on':''} onClick={()=>tgl('zoom')}><ZoomIn size={14}/>ZOOM</button>
            <button onClick={reset}><RotateCcw size={14}/>RESET</button>
          </div>
          <div className="status"><small>SYSTEM STATUS</small><p>● ARMOR ONLINE</p><p>● NEURAL LINK STABLE</p><p>● POWER NOMINAL</p><em>Drag to rotate</em></div>
        </div>
      </section>

      <section className="sec center" id="reactor">
        <span className="tag">04 // ARC REACTOR</span>
        <h2><Lines a={['POWER','THE IMPOSSIBLE']}/></h2>
        <div className="stats">
          <div className="card"><small>POWER OUTPUT</small><Count to={87.4} suf=" GW"/></div>
          <div className="card"><small>CORE STABILITY</small><Count to={99.2} suf="%"/></div>
          <div className="card"><small>ENERGY LEVEL</small><Count to={97.8} suf="%"/></div>
        </div>
      </section>

      <section className="sec center cta" id="cta">
        <h2><Lines a={['SUIT UP.']}/></h2>
        <p className="lead">THE FUTURE OF PERSONAL ARMOR STARTS HERE.</p>
        <Btn href="#top">ENTER SYSTEM</Btn>
        <footer>© Stark Industries concept — fan-made, not affiliated with Marvel.</footer>
      </section>
    </main>
  </>
}
