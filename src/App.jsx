import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// 🍷 我有酒，你有故事嗎？ - Story Night Event App v3
// Front-stage / Backstage separation for projector
// ============================================================

const TABLES = ["威士忌", "紅酒", "清酒", "琴酒", "白蘭地", "梅酒", "啤酒", "香檳", "伏特加", "龍舌蘭"];
const TABLE_EMOJIS = ["🥃", "🍷", "🍶", "🍸", "🥂", "🍑", "🍺", "🥂", "🫙", "🌵"];
const ALL_TOPICS = [
  ["最糗的故事", "最丟臉的經歷", "最瘋狂的冒險", "最離譜的巧合", "最搞笑的誤會", "最荒唐的決定"],
  ["最痛的一次成長", "最感恩的一件事", "改變我最多的人", "最黑暗中看見的光", "一句改變我人生的話", "最不敢面對的恐懼"],
  ["最意想不到的轉折", "最後悔沒做的事", "最勇敢的一次決定", "讓我重新開始的一天", "最珍貴的一句話", "最不像我會做的事"],
];
const AWARD_NAMES = [
  { id: "tears", name: "💧 最佳淚腺攻擊獎", desc: "讓全場哭成一片" },
  { id: "spray", name: "🍷 全場噴酒獎", desc: "笑到酒從鼻子噴出來" },
  { id: "soul", name: "✨ 靈魂說書人", desc: "故事說得讓靈魂都震動" },
  { id: "brave", name: "🦁 最勇敢的心", desc: "敢說別人不敢說的" },
  { id: "plot", name: "🎬 最佳劇情轉折獎", desc: "沒有人猜到結局" },
];
const DEMO_PARTICIPANTS = [
  { id: 1001, name: "小明", oneLiner: "愛喝威士忌的工程師", table: 0 },
  { id: 1002, name: "阿珍", oneLiner: "全世界最會講故事的媽媽", table: 0 },
  { id: 1003, name: "David", oneLiner: "旅行過 30 個國家", table: 1 },
  { id: 1004, name: "雅婷", oneLiner: "咖啡成癮者", table: 1 },
  { id: 1005, name: "Jason", oneLiner: "前搖滾樂團吉他手", table: 2 },
  { id: 1006, name: "小安", oneLiner: "夢想開一間書店", table: 2 },
  { id: 1007, name: "Emily", oneLiner: "剛從紐約搬回來", table: 3 },
  { id: 1008, name: "志偉", oneLiner: "消防員，見過太多故事", table: 3 },
  { id: 1009, name: "Rachel", oneLiner: "三個孩子的全職媽媽", table: 4 },
  { id: 1010, name: "阿凱", oneLiner: "在夜市賣雞排長大的", table: 4 },
  { id: 1011, name: "思涵", oneLiner: "喜歡聽別人說故事", table: 5 },
  { id: 1012, name: "Mark", oneLiner: "牧師但其實很搞笑", table: 5 },
  { id: 1013, name: "小琪", oneLiner: "剛結束一段關係", table: 6 },
  { id: 1014, name: "Peter", oneLiner: "AI 創業家", table: 6 },
  { id: 1015, name: "佳蓉", oneLiner: "第一次來這種活動", table: 7 },
  { id: 1016, name: "阿翔", oneLiner: "喜劇演員，但今天不演", table: 7 },
];

const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Noto+Sans+TC:wght@300;400;500;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

const T = {
  bg: "#0f0b07", bgCard: "rgba(30,22,14,0.85)",
  gold: "#d4a24e", goldLight: "#f0d48a", amber: "#c97d2a",
  warm: "#e8c88a", text: "#f5efe6", textMuted: "rgba(245,239,230,0.5)",
  red: "#c0392b", green: "#27ae60",
};

const gs = document.createElement("style");
gs.textContent = `
@keyframes fadeSlideUp{from{opacity:0;transform:translateY(15px)}to{opacity:1;transform:translateY(0)}}
@keyframes float0{0%,100%{transform:translateY(0) translateX(0)}50%{transform:translateY(-30px) translateX(15px)}}
@keyframes float1{0%,100%{transform:translateY(0) translateX(0)}50%{transform:translateY(20px) translateX(-20px)}}
@keyframes float2{0%,100%{transform:translateY(0) translateX(0)}50%{transform:translateY(-15px) translateX(-10px)}}
@keyframes scoreFlyIn{0%{opacity:0;transform:scale(0.3) translateY(40px)}60%{opacity:1;transform:scale(1.3) translateY(-10px)}100%{opacity:1;transform:scale(1) translateY(0)}}
@keyframes confettiPop{0%{opacity:1;transform:translateY(0) rotate(0deg) scale(1)}100%{opacity:0;transform:translateY(-120px) rotate(720deg) scale(0.2)}}
@keyframes pulseGlow{0%,100%{box-shadow:0 0 20px rgba(212,162,78,0.2)}50%{box-shadow:0 0 50px rgba(212,162,78,0.5)}}
@keyframes pulseRed{0%,100%{box-shadow:0 0 20px rgba(192,57,43,0.2)}50%{box-shadow:0 0 50px rgba(192,57,43,0.6)}}
@keyframes timerUrgent{0%,100%{color:#c0392b}50%{color:#e74c3c}}
@keyframes slideInRight{from{opacity:0;transform:translateX(60px)}to{opacity:1;transform:translateX(0)}}
@keyframes barFill{from{width:0%}}
@keyframes crownBounce{0%,100%{transform:translateY(0) rotate(0deg)}25%{transform:translateY(-8px) rotate(-5deg)}75%{transform:translateY(-4px) rotate(5deg)}}
@keyframes panelSlideIn{from{opacity:0;transform:translateY(20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes fabPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
@keyframes awardReveal{0%{opacity:0;transform:scale(0.5) rotateY(90deg)}50%{opacity:1;transform:scale(1.1) rotateY(0deg)}100%{opacity:1;transform:scale(1) rotateY(0deg)}}
@keyframes sparkle{0%,100%{opacity:0.3;transform:scale(0.8)}50%{opacity:1;transform:scale(1.2)}}
`;
document.head.appendChild(gs);

// ============ SOUND EFFECTS (Web Audio API) ============

const SFX = {
  _ctx: null,
  _getCtx() { if (!this._ctx) this._ctx = new (window.AudioContext || window.webkitAudioContext)(); return this._ctx; },
  tick() {
    try { const c = this._getCtx(), o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination); o.frequency.value = 800 + Math.random() * 400;
    o.type = "sine"; g.gain.value = 0.08; o.start(c.currentTime); o.stop(c.currentTime + 0.03); } catch(e){}
  },
  result() {
    try { const c = this._getCtx();
    [523, 659, 784, 1047].forEach((f, i) => {
      const o = c.createOscillator(), g = c.createGain();
      o.connect(g); g.connect(c.destination); o.frequency.value = f;
      o.type = "sine"; g.gain.value = 0.12; g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3 + i * 0.15 + 0.5);
      o.start(c.currentTime + i * 0.15); o.stop(c.currentTime + i * 0.15 + 0.5);
    }); } catch(e){}
  },
  fanfare() {
    try { const c = this._getCtx();
    [392, 494, 587, 784, 988, 784].forEach((f, i) => {
      const o = c.createOscillator(), g = c.createGain();
      o.connect(g); g.connect(c.destination); o.frequency.value = f;
      o.type = "triangle"; g.gain.value = 0.15; g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.12 + 0.4);
      o.start(c.currentTime + i * 0.12); o.stop(c.currentTime + i * 0.12 + 0.4);
    }); } catch(e){}
  },
  vote() {
    try { const c = this._getCtx(), o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination); o.frequency.value = 600;
    o.frequency.exponentialRampToValueAtTime(1200, c.currentTime + 0.15);
    o.type = "sine"; g.gain.value = 0.1; g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.2);
    o.start(c.currentTime); o.stop(c.currentTime + 0.2); } catch(e){}
  },
};

const DEFAULT_GOSPEL = {
  title: "今晚最後一個故事",
  subtitle: "The Greatest Story Ever Told",
  paragraphs: [
    {text:"今晚我們聽了好多精彩的故事——有讓人笑到噴酒的，有讓人紅了眼眶的。",color:"text"},
    {text:"但有一個故事，兩千年來一直在被傳述。",color:"text"},
    {text:"那是關於一個人，他離開了天上的王座，走進了人間最破碎的故事裡。他碰觸了痲瘋病人，和罪人一起吃飯，在十字架上承擔了所有人的黑暗。",color:"warm"},
    {text:"他的名字是耶穌。而他說：「你的故事，我都知道。我來，不是要審判你，是要陪你走完這個故事。」",color:"goldLight"},
  ],
};

// ============ SHARED COMPONENTS ============

function AnimatedBG() {
  return (
    <div style={{position:"fixed",inset:0,zIndex:0,overflow:"hidden",background:`radial-gradient(ellipse at 20% 50%,rgba(212,162,78,0.08) 0%,transparent 50%),radial-gradient(ellipse at 80% 20%,rgba(201,125,42,0.06) 0%,transparent 40%),radial-gradient(ellipse at 50% 80%,rgba(139,69,19,0.05) 0%,transparent 50%),${T.bg}`}}>
      {Array.from({length:15}).map((_,i)=><div key={i} style={{position:"absolute",width:2+Math.random()*3,height:2+Math.random()*3,borderRadius:"50%",background:T.gold,opacity:0.1+Math.random()*0.15,left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,animation:`float${i%3} ${8+Math.random()*12}s ease-in-out infinite`,animationDelay:`${Math.random()*5}s`}}/>)}
      <div style={{position:"absolute",inset:0,opacity:0.03,backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`}}/>
    </div>
  );
}

function GoldButton({children,onClick,style,disabled,small}) {
  const [h,setH]=useState(false);
  return <button onClick={onClick} disabled={disabled} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{background:disabled?"rgba(212,162,78,0.2)":h?T.goldLight:T.gold,color:disabled?T.textMuted:T.bg,border:"none",padding:small?"8px 20px":"14px 36px",borderRadius:8,fontSize:small?14:17,fontWeight:700,fontFamily:"'Noto Sans TC',sans-serif",cursor:disabled?"not-allowed":"pointer",transition:"all 0.3s ease",transform:h&&!disabled?"translateY(-2px)":"none",boxShadow:h&&!disabled?"0 8px 30px rgba(212,162,78,0.3)":"0 4px 15px rgba(0,0,0,0.3)",letterSpacing:1,...style}}>{children}</button>;
}

function ConfettiBurst({active}) {
  if(!active) return null;
  const c=[T.gold,T.goldLight,T.amber,T.warm,"#e74c3c","#3498db","#2ecc71"];
  return <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:200,overflow:"hidden"}}>{Array.from({length:40}).map((_,i)=><div key={i} style={{position:"absolute",left:`${30+Math.random()*40}%`,top:`${40+Math.random()*20}%`,width:6+Math.random()*8,height:6+Math.random()*8,borderRadius:Math.random()>0.5?"50%":"2px",background:c[Math.floor(Math.random()*c.length)],animation:`confettiPop ${0.8+Math.random()*1.2}s ease-out forwards`,animationDelay:`${Math.random()*0.3}s`,transform:`rotate(${Math.random()*360}deg)`}}/>)}</div>;
}

function ScoreFlyIn({score,visible}) {
  if(!visible) return null;
  return <div style={{position:"fixed",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none",zIndex:150}}><div style={{fontFamily:"'Playfair Display',serif",fontSize:120,fontWeight:900,color:T.goldLight,textShadow:"0 0 60px rgba(212,162,78,0.6),0 0 120px rgba(212,162,78,0.3)",animation:"scoreFlyIn 0.8s ease-out forwards"}}>{score}</div></div>;
}

function StoryTimer({duration,running,onTimeUp,projector}) {
  const [tl,setTl]=useState(duration);
  const ref=useRef(null);
  useEffect(()=>{setTl(duration)},[duration]);
  useEffect(()=>{
    if(running&&tl>0){ref.current=setInterval(()=>{setTl(p=>{if(p<=1){clearInterval(ref.current);if(onTimeUp)onTimeUp();return 0}return p-1})},1000)}
    return()=>clearInterval(ref.current);
  },[running]);
  const mins=Math.floor(tl/60),secs=tl%60,pct=(tl/duration)*100;
  const urgent=tl<=30,critical=tl<=10;
  const sz=projector?{f:96,r:200,s:10}:{f:42,r:100,s:6};
  const circ=2*Math.PI*(sz.r/2-sz.s);
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",animation:critical?"pulseRed 0.5s ease-in-out infinite":urgent?"pulseGlow 1s ease-in-out infinite":"none",borderRadius:"50%",padding:projector?20:8}}>
      <div style={{position:"relative",width:sz.r,height:sz.r}}>
        <svg width={sz.r} height={sz.r} style={{transform:"rotate(-90deg)"}}>
          <circle cx={sz.r/2} cy={sz.r/2} r={sz.r/2-sz.s} fill="none" stroke="rgba(212,162,78,0.15)" strokeWidth={sz.s}/>
          <circle cx={sz.r/2} cy={sz.r/2} r={sz.r/2-sz.s} fill="none" stroke={critical?T.red:urgent?T.amber:T.gold} strokeWidth={sz.s} strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)} strokeLinecap="round" style={{transition:"stroke-dashoffset 1s linear,stroke 0.5s ease"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Playfair Display',serif",fontSize:sz.f,fontWeight:700,color:critical?T.red:urgent?T.amber:T.goldLight,animation:critical?"timerUrgent 0.5s ease-in-out infinite":"none"}}>{mins}:{secs.toString().padStart(2,"0")}</div>
      </div>
      {!projector&&<div style={{fontFamily:"'Noto Sans TC'",color:T.textMuted,fontSize:11,marginTop:6}}>{critical?"⚡ 時間快到了！":urgent?"⏳ 剩不到 30 秒":"說書時間"}</div>}
    </div>
  );
}

// ============ PROJECTOR-ONLY VIEWS (Front Stage, 100% clean) ============

function ProjLanding() {
  const [show,setShow]=useState(false);
  useEffect(()=>{setTimeout(()=>setShow(true),100)},[]);
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:24,textAlign:"center",position:"relative",zIndex:1,opacity:show?1:0,transition:"all 1s ease"}}>
      <div style={{fontSize:120,marginBottom:8}}>🍷</div>
      <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(64px,12vw,120px)",fontWeight:900,color:T.gold,lineHeight:1.1,margin:"0 0 8px 0",textShadow:"0 0 40px rgba(212,162,78,0.3)"}}>我有酒</h1>
      <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(32px,6vw,56px)",fontWeight:300,fontStyle:"italic",color:T.warm,margin:"0 0 32px 0",letterSpacing:4}}>你有故事嗎？</h2>
      <div style={{width:60,height:1,background:`linear-gradient(90deg,transparent,${T.gold},transparent)`,margin:"0 auto 40px"}}/>
      <p style={{fontFamily:"'Noto Sans TC'",color:T.textMuted,fontSize:24,letterSpacing:4}}>請掃描 QR Code 加入今晚的故事</p>
      <p style={{fontFamily:"'Noto Sans TC'",color:"rgba(245,239,230,0.15)",fontSize:14,marginTop:60}}>Powered by Wechurch</p>
    </div>
  );
}

function ProjStoryteller({rep,topic,currentIdx,totalCount,timerDuration,timerRunning,onTimeUp,voteCount,lastScore}) {
  const [showScore,setShowScore]=useState(false);
  const [showConf,setShowConf]=useState(false);
  const prevVC=useRef(0);
  useEffect(()=>{
    if(voteCount>prevVC.current&&lastScore>0){setShowScore(true);if(lastScore>=12)setShowConf(true);const a=setTimeout(()=>setShowScore(false),1500);const b=setTimeout(()=>setShowConf(false),2000);prevVC.current=voteCount;return()=>{clearTimeout(a);clearTimeout(b)}}
    prevVC.current=voteCount;
  },[voteCount,lastScore]);
  return (
    <div style={{minHeight:"100vh",padding:"40px 32px",position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      <ScoreFlyIn score={lastScore} visible={showScore}/>
      <ConfettiBurst active={showConf}/>
      <div style={{color:T.textMuted,fontFamily:"'Noto Sans TC'",fontSize:22,marginBottom:8,letterSpacing:3}}>主題：{topic}</div>
      <div style={{color:T.textMuted,fontFamily:"'Noto Sans TC'",fontSize:16,marginBottom:16}}>第 {currentIdx+1}/{totalCount} 位說書人</div>
      <div style={{fontSize:80,marginBottom:12}}>{rep?.tableEmoji}</div>
      <h2 style={{fontFamily:"'Playfair Display',serif",color:T.goldLight,fontSize:56,fontWeight:700,margin:"0 0 4px 0"}}>{rep?.name}</h2>
      <p style={{fontFamily:"'Noto Sans TC'",color:T.warm,fontSize:22,marginBottom:32}}>{rep?.tableName}桌代表</p>
      <StoryTimer duration={timerDuration} running={timerRunning} onTimeUp={onTimeUp} projector/>
      {voteCount>0&&<div style={{marginTop:24,fontFamily:"'Noto Sans TC'",color:T.textMuted,fontSize:18,animation:"fadeSlideUp 0.3s ease"}}>已收到 {voteCount} 票</div>}
    </div>
  );
}

function ProjLeaderboard({tableReps,roundScores,topic,round}) {
  const sorted=[...tableReps].sort((a,b)=>(roundScores[b.id]||0)-(roundScores[a.id]||0));
  const mx=Math.max(...Object.values(roundScores),1);
  const medals=["🥇","🥈","🥉"];
  return (
    <div style={{minHeight:"100vh",padding:"40px 32px",position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center"}}>
      <div style={{fontSize:64,marginBottom:8,animation:"crownBounce 2s ease-in-out infinite"}}>🏆</div>
      <h2 style={{fontFamily:"'Playfair Display',serif",color:T.gold,fontSize:48,marginBottom:4}}>{round===1?"第一回合排行榜":"最終排行榜"}</h2>
      <p style={{fontFamily:"'Cormorant Garamond',serif",color:T.warm,fontSize:24,fontStyle:"italic",marginBottom:40,letterSpacing:3}}>主題：{topic}</p>
      <div style={{width:"100%",maxWidth:700}}>
        {sorted.map((rep,i)=>{const sc=roundScores[rep.id]||0;return(
          <div key={rep.id} style={{display:"flex",alignItems:"center",gap:20,background:i===0?"rgba(212,162,78,0.15)":T.bgCard,borderRadius:16,padding:"18px 28px",marginBottom:12,border:`1px solid rgba(212,162,78,${i===0?0.4:0.1})`,animation:`slideInRight 0.5s ease ${i*0.12}s both`}}>
            <span style={{fontSize:36,width:44,textAlign:"center"}}>{i<3?medals[i]:<span style={{fontFamily:"'Playfair Display'",color:T.textMuted,fontSize:24}}>{i+1}</span>}</span>
            <span style={{fontSize:32}}>{rep.tableEmoji}</span>
            <div style={{flex:1}}><div style={{fontFamily:"'Noto Sans TC'",color:T.text,fontSize:22,fontWeight:600}}>{rep.name}</div><div style={{fontFamily:"'Noto Sans TC'",color:T.textMuted,fontSize:15}}>{rep.tableName}桌</div></div>
            <div style={{display:"flex",alignItems:"center",gap:16}}>
              <div style={{width:160,height:10,borderRadius:5,background:"rgba(255,255,255,0.05)",overflow:"hidden"}}><div style={{height:"100%",borderRadius:5,background:`linear-gradient(90deg,${T.gold},${T.goldLight})`,width:`${(sc/mx)*100}%`,animation:`barFill 1s ease ${i*0.12+0.3}s both`}}/></div>
              <span style={{fontFamily:"'Playfair Display'",color:T.goldLight,fontSize:36,fontWeight:700,minWidth:50,textAlign:"right"}}>{sc}</span>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}

function ProjSpin({topics,round,spinTrigger,onResult}) {
  const canvasRef=useRef(null);const angleRef=useRef(0);const speedRef=useRef(0);const rafRef=useRef(null);
  const [spinning,setSpinning]=useState(false);const [result,setResult]=useState(null);
  const prevTrigger=useRef(0);
  const colors=["#8B4513","#A0522D","#CD853F","#D2691E","#DEB887","#B8860B"];
  const canvasSize=Math.min(520,typeof window!=="undefined"?window.innerWidth-80:520);
  const drawWheel=useCallback((angle)=>{
    const canvas=canvasRef.current;if(!canvas)return;const ctx=canvas.getContext("2d");const size=canvas.width;const center=size/2;const radius=center-10;const sa=(2*Math.PI)/topics.length;
    ctx.clearRect(0,0,size,size);
    topics.forEach((topic,i)=>{const s=angle+i*sa;const e=s+sa;ctx.beginPath();ctx.moveTo(center,center);ctx.arc(center,center,radius,s,e);ctx.closePath();ctx.fillStyle=colors[i%colors.length];ctx.fill();ctx.strokeStyle="rgba(212,162,78,0.4)";ctx.lineWidth=2;ctx.stroke();ctx.save();ctx.translate(center,center);ctx.rotate(s+sa/2);ctx.textAlign="center";ctx.fillStyle="#f5efe6";ctx.font="bold 22px 'Noto Sans TC',sans-serif";ctx.fillText(topic,radius*0.6,5);ctx.restore()});
    ctx.beginPath();ctx.arc(center,center,30,0,2*Math.PI);ctx.fillStyle=T.gold;ctx.fill();ctx.beginPath();ctx.arc(center,center,25,0,2*Math.PI);ctx.fillStyle=T.bg;ctx.fill();
    ctx.beginPath();ctx.moveTo(center-16,6);ctx.lineTo(center+16,6);ctx.lineTo(center,40);ctx.closePath();ctx.fillStyle=T.gold;ctx.fill();ctx.strokeStyle=T.bg;ctx.lineWidth=2;ctx.stroke();
  },[topics]);
  useEffect(()=>{drawWheel(0)},[drawWheel]);
  useEffect(()=>{
    if(spinTrigger>prevTrigger.current&&!spinning){
      prevTrigger.current=spinTrigger;setSpinning(true);setResult(null);
      speedRef.current=0.3+Math.random()*0.2;const dec=0.0008+Math.random()*0.0005;let tc=0;
      const animate=()=>{angleRef.current+=speedRef.current;speedRef.current-=dec;drawWheel(angleRef.current);tc++;if(tc%3===0&&speedRef.current>0.02)SFX.tick();
        if(speedRef.current>0.001){rafRef.current=requestAnimationFrame(animate)}
        else{setSpinning(false);SFX.result();const sa=(2*Math.PI)/topics.length;const pa=((3*Math.PI/2-angleRef.current)%(2*Math.PI)+2*Math.PI)%(2*Math.PI);const idx=Math.floor(pa/sa)%topics.length;const sel=topics[idx];setResult(sel);if(onResult)onResult(sel)}
      };rafRef.current=requestAnimationFrame(animate);
    }
  },[spinTrigger]);
  useEffect(()=>()=>{if(rafRef.current)cancelAnimationFrame(rafRef.current)},[]);
  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",zIndex:1,padding:40}}>
      <div style={{color:T.textMuted,fontFamily:"'Noto Sans TC'",fontSize:20,marginBottom:12,letterSpacing:2}}>{round===1?"第一回合 · 輕鬆暖場":"第二回合 · 深度故事"}</div>
      <canvas ref={canvasRef} width={canvasSize} height={canvasSize} style={{borderRadius:"50%",boxShadow:"0 0 40px rgba(212,162,78,0.15)"}}/>
      {result&&<div style={{marginTop:20,textAlign:"center",animation:"fadeSlideUp 0.5s ease"}}><div style={{fontFamily:"'Noto Sans TC'",color:T.textMuted,fontSize:18}}>本回合主題</div><div style={{fontFamily:"'Playfair Display',serif",color:T.goldLight,fontSize:48,fontWeight:700,marginTop:4}}>{result}</div></div>}
      {spinning&&<div style={{marginTop:20,fontFamily:"'Noto Sans TC'",color:T.amber,fontSize:18}}>命運之輪轉動中...</div>}
    </div>
  );
}



// ============ PHONE-ONLY VIEWS (Backstage when projector ON, or main when OFF) ============

function PhoneLanding({onNext}) {
  const [show,setShow]=useState(false);
  useEffect(()=>{setTimeout(()=>setShow(true),100)},[]);
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:24,textAlign:"center",position:"relative",zIndex:1,opacity:show?1:0,transition:"all 1s ease"}}>
      <div style={{fontSize:72,marginBottom:8}}>🍷</div>
      <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(36px,8vw,64px)",fontWeight:900,color:T.gold,lineHeight:1.1,margin:"0 0 8px 0",textShadow:"0 0 40px rgba(212,162,78,0.3)"}}>我有酒</h1>
      <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(20px,5vw,34px)",fontWeight:300,fontStyle:"italic",color:T.warm,margin:"0 0 32px 0",letterSpacing:4}}>你有故事嗎？</h2>
      <div style={{width:60,height:1,background:`linear-gradient(90deg,transparent,${T.gold},transparent)`,margin:"0 auto 32px"}}/>
      <p style={{fontFamily:"'Noto Sans TC'",color:T.textMuted,fontSize:15,maxWidth:360,lineHeight:1.8,marginBottom:48}}>每個人都有一個值得被聽見的故事<br/>今晚，讓我們用一杯酒的時間<br/>交換彼此生命中最真實的片段</p>
      <GoldButton onClick={onNext}>進入今晚的故事</GoldButton>
      <p style={{fontFamily:"'Noto Sans TC'",color:"rgba(245,239,230,0.2)",fontSize:12,marginTop:40}}>Powered by Wechurch</p>
    </div>
  );
}

function CheckInScreen({onNext,participants,setParticipants,tableCount,setTableCount}) {
  const [name,setName]=useState("");const [oneLiner,setOneLiner]=useState("");const [assigned,setAssigned]=useState(null);
  const handleCheckIn=()=>{if(!name.trim())return;const ti=participants.length%tableCount;const p={id:Date.now(),name:name.trim(),oneLiner:oneLiner.trim(),table:ti};setParticipants(prev=>[...prev,p]);setAssigned(p);setName("");setOneLiner("")};
  const is={width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(212,162,78,0.2)",borderRadius:8,padding:"12px 16px",color:T.text,fontFamily:"'Noto Sans TC'",fontSize:16,outline:"none"};
  return (
    <div style={{minHeight:"100vh",padding:"40px 20px",position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center"}}>
      <h2 style={{fontFamily:"'Playfair Display',serif",color:T.gold,fontSize:32,marginBottom:4}}>簽到入場</h2>
      <p style={{fontFamily:"'Noto Sans TC'",color:T.textMuted,fontSize:14,marginBottom:32}}>找到你今晚的酒桌</p>
      <div style={{background:T.bgCard,borderRadius:12,padding:"16px 24px",marginBottom:24,border:"1px solid rgba(212,162,78,0.15)",display:"flex",alignItems:"center",gap:16}}>
        <span style={{color:T.warm,fontFamily:"'Noto Sans TC'",fontSize:14}}>桌數</span>
        {[6,8,10].map(n=><button key={n} onClick={()=>setTableCount(n)} style={{background:tableCount===n?T.gold:"transparent",color:tableCount===n?T.bg:T.textMuted,border:`1px solid ${tableCount===n?T.gold:"rgba(212,162,78,0.3)"}`,borderRadius:6,padding:"6px 14px",cursor:"pointer",fontFamily:"'Noto Sans TC'",fontSize:14,fontWeight:600,transition:"all 0.2s"}}>{n} 桌</button>)}
      </div>
      <div style={{background:T.bgCard,borderRadius:16,padding:28,width:"100%",maxWidth:400,border:"1px solid rgba(212,162,78,0.15)",marginBottom:24}}>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="你的名字" style={{...is,marginBottom:12}} onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor="rgba(212,162,78,0.2)"}/>
        <input value={oneLiner} onChange={e=>setOneLiner(e.target.value)} placeholder="一句話介紹自己（選填）" style={{...is,marginBottom:20}} onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor="rgba(212,162,78,0.2)"}/>
        <GoldButton onClick={handleCheckIn} disabled={!name.trim()} style={{width:"100%"}}>🎲 抽取我的酒桌</GoldButton>
      </div>
      {assigned&&<div style={{background:"rgba(212,162,78,0.1)",borderRadius:16,padding:28,width:"100%",maxWidth:400,textAlign:"center",border:"1px solid rgba(212,162,78,0.3)",animation:"fadeSlideUp 0.5s ease",marginBottom:24}}><div style={{fontSize:48,marginBottom:8}}>{TABLE_EMOJIS[assigned.table]}</div><div style={{fontFamily:"'Noto Sans TC'",color:T.gold,fontSize:14,fontWeight:500,marginBottom:4}}>你的酒桌是</div><div style={{fontFamily:"'Playfair Display',serif",color:T.goldLight,fontSize:28,fontWeight:700}}>{TABLES[assigned.table]}桌</div><div style={{color:T.textMuted,fontFamily:"'Noto Sans TC'",fontSize:13,marginTop:8}}>第 {assigned.table+1} 桌 · 目前 {participants.filter(p=>p.table===assigned.table).length} 人</div></div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:12,width:"100%",maxWidth:600,marginBottom:32}}>
        {Array.from({length:tableCount}).map((_,i)=>{const c=participants.filter(p=>p.table===i).length;return <div key={i} style={{background:T.bgCard,borderRadius:10,padding:"14px 12px",border:`1px solid rgba(212,162,78,${c>0?0.25:0.08})`,textAlign:"center"}}><div style={{fontSize:24}}>{TABLE_EMOJIS[i]}</div><div style={{fontFamily:"'Noto Sans TC'",color:T.warm,fontSize:13,fontWeight:600,marginTop:4}}>{TABLES[i]}桌</div><div style={{fontFamily:"'Noto Sans TC'",color:T.textMuted,fontSize:12}}>{c} 人</div></div>})}
      </div>
      <GoldButton onClick={onNext} disabled={participants.length<2}>分組完成，開始活動 →</GoldButton>
    </div>
  );
}

function PhoneSpinView({round,topics,topic,timerDuration,setTimerDuration,onSpinWheel,onResult,onStart}) {
  const canvasRef=useRef(null);const angleRef=useRef(0);const speedRef=useRef(0);const rafRef=useRef(null);
  const [spinning,setSpinning]=useState(false);const [result,setResult]=useState(null);
  const colors=["#8B4513","#A0522D","#CD853F","#D2691E","#DEB887","#B8860B"];
  const cSize=Math.min(340,typeof window!=="undefined"?window.innerWidth-60:340);
  const drawWheel=useCallback((angle)=>{const c=canvasRef.current;if(!c)return;const ctx=c.getContext("2d");const s=c.width;const ctr=s/2;const r=ctr-10;const sa=(2*Math.PI)/topics.length;ctx.clearRect(0,0,s,s);topics.forEach((t,i)=>{const st=angle+i*sa;const en=st+sa;ctx.beginPath();ctx.moveTo(ctr,ctr);ctx.arc(ctr,ctr,r,st,en);ctx.closePath();ctx.fillStyle=colors[i%colors.length];ctx.fill();ctx.strokeStyle="rgba(212,162,78,0.4)";ctx.lineWidth=2;ctx.stroke();ctx.save();ctx.translate(ctr,ctr);ctx.rotate(st+sa/2);ctx.textAlign="center";ctx.fillStyle="#f5efe6";ctx.font=`bold ${s<300?12:15}px 'Noto Sans TC',sans-serif`;ctx.fillText(t,r*0.6,5);ctx.restore()});ctx.beginPath();ctx.arc(ctr,ctr,22,0,2*Math.PI);ctx.fillStyle=T.gold;ctx.fill();ctx.beginPath();ctx.arc(ctr,ctr,18,0,2*Math.PI);ctx.fillStyle=T.bg;ctx.fill();ctx.beginPath();ctx.moveTo(ctr-12,6);ctx.lineTo(ctr+12,6);ctx.lineTo(ctr,30);ctx.closePath();ctx.fillStyle=T.gold;ctx.fill();ctx.strokeStyle=T.bg;ctx.lineWidth=2;ctx.stroke()},[topics]);
  useEffect(()=>{drawWheel(0)},[drawWheel]);
  const tickRef=useRef(0);
  const spin=()=>{if(spinning)return;setSpinning(true);setResult(null);speedRef.current=0.3+Math.random()*0.2;const dec=0.0008+Math.random()*0.0005;if(onSpinWheel)onSpinWheel();tickRef.current=0;const animate=()=>{angleRef.current+=speedRef.current;speedRef.current-=dec;drawWheel(angleRef.current);tickRef.current++;if(tickRef.current%3===0&&speedRef.current>0.02)SFX.tick();if(speedRef.current>0.001){rafRef.current=requestAnimationFrame(animate)}else{setSpinning(false);SFX.result();const sa=(2*Math.PI)/topics.length;const pa=((3*Math.PI/2-angleRef.current)%(2*Math.PI)+2*Math.PI)%(2*Math.PI);const idx=Math.floor(pa/sa)%topics.length;const sel=topics[idx];setResult(sel);if(onResult)onResult(sel)}};rafRef.current=requestAnimationFrame(animate)};
  useEffect(()=>()=>{if(rafRef.current)cancelAnimationFrame(rafRef.current)},[]);
  return (
    <div style={{minHeight:"100vh",padding:"40px 20px",position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center"}}>
      <h2 style={{fontFamily:"'Playfair Display',serif",color:T.gold,fontSize:28,marginBottom:4}}>{round===1?"第一回合":"第二回合"}</h2>
      <p style={{fontFamily:"'Noto Sans TC'",color:T.textMuted,fontSize:14,marginBottom:28}}>轉動轉盤，決定今晚的故事主題</p>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
        <div style={{color:T.textMuted,fontFamily:"'Noto Sans TC'",fontSize:13,marginBottom:12,letterSpacing:2}}>{round===1?"第一回合 · 輕鬆暖場":"第二回合 · 深度故事"}</div>
        <canvas ref={canvasRef} width={cSize} height={cSize} style={{borderRadius:"50%",boxShadow:"0 0 40px rgba(212,162,78,0.15)"}}/>
        {result&&<div style={{marginTop:20,textAlign:"center",animation:"fadeSlideUp 0.5s ease"}}><div style={{fontFamily:"'Noto Sans TC'",color:T.textMuted,fontSize:13}}>本回合主題</div><div style={{fontFamily:"'Playfair Display',serif",color:T.goldLight,fontSize:26,fontWeight:700,marginTop:4}}>{result}</div></div>}
        <GoldButton onClick={spin} disabled={spinning} style={{marginTop:20}}>{spinning?"轉動中...":"🎰 轉動命運之輪"}</GoldButton>
      </div>
      {topic&&<div style={{marginTop:20,display:"flex",alignItems:"center",gap:12,background:T.bgCard,borderRadius:12,padding:"12px 20px",border:"1px solid rgba(212,162,78,0.15)"}}>
        <span style={{fontFamily:"'Noto Sans TC'",color:T.warm,fontSize:13}}>說書限時</span>
        {[120,180,240].map(s=><button key={s} onClick={()=>setTimerDuration(s)} style={{background:timerDuration===s?T.gold:"transparent",color:timerDuration===s?T.bg:T.textMuted,border:`1px solid ${timerDuration===s?T.gold:"rgba(212,162,78,0.3)"}`,borderRadius:6,padding:"5px 12px",cursor:"pointer",fontFamily:"'Noto Sans TC'",fontSize:13,fontWeight:600,transition:"all 0.2s"}}>{s/60} 分鐘</button>)}
      </div>}
      {topic&&<GoldButton onClick={onStart} style={{marginTop:20}}>開始故事比賽 →</GoldButton>}
    </div>
  );
}

function PhoneStoryRound({round,participants,tableCount,scores,setScores,onFinish,onSpinWheel,onTopicSet,onPhaseChange,onTimerState,onStoryteller,onVoteData}) {
  const [phase,setPhase]=useState("spin");
  const [topic,setTopic]=useState("");
  const [cur,setCur]=useState(0);
  const [voting,setVoting]=useState({story:3,expression:3,resonance:3});
  const [roundScores,setRoundScores]=useState({});
  const [timerRunning,setTimerRunning]=useState(false);
  const [timerDuration,setTimerDuration]=useState(180);
  const [timerKey,setTimerKey]=useState(0);
  const [showSA,setShowSA]=useState(false);
  const [showConf,setShowConf]=useState(false);
  const [lastScore,setLastScore]=useState(0);
  const [voteCount,setVoteCount]=useState(0);
  const topics=ALL_TOPICS[(round-1)%ALL_TOPICS.length];
  const tableReps=Array.from({length:tableCount}).map((_,i)=>{const m=participants.filter(p=>p.table===i);return m.length>0?{...m[0],tableName:TABLES[i],tableEmoji:TABLE_EMOJIS[i]}:null}).filter(Boolean);

  // Sync state up to parent for projector
  useEffect(()=>{if(onPhaseChange)onPhaseChange(phase)},[phase]);
  useEffect(()=>{if(onTimerState)onTimerState({running:timerRunning,duration:timerDuration,key:timerKey})},[timerRunning,timerDuration,timerKey]);
  useEffect(()=>{if(onStoryteller)onStoryteller({idx:cur,rep:tableReps[cur],total:tableReps.length})},[cur,tableReps.length]);
  useEffect(()=>{if(onVoteData)onVoteData({voteCount,lastScore,roundScores,tableReps})},[voteCount,lastScore,roundScores]);
  useEffect(()=>{if(onTopicSet)onTopicSet(topic)},[topic]);

  const handleSpinResult=(t)=>{setTopic(t)};
  const startStorytelling=()=>{setPhase("storytelling");setTimerRunning(true);setTimerKey(k=>k+1);if(onSpinWheel)onSpinWheel()};
  const submitVote=()=>{
    const rep=tableReps[cur];const total=voting.story+voting.expression+voting.resonance;
    setLastScore(total);setVoteCount(v=>v+1);SFX.vote();setShowSA(true);if(total>=12){setShowConf(true);SFX.fanfare()}
    setTimeout(()=>{setShowSA(false);setShowConf(false)},2000);
    const newRS={...roundScores,[rep.id]:(roundScores[rep.id]||0)+total};setRoundScores(newRS);
    if(cur<tableReps.length-1){setTimeout(()=>{setCur(p=>p+1);setVoting({story:3,expression:3,resonance:3});setTimerRunning(true);setTimerKey(k=>k+1);setVoteCount(0)},1800)}
    else{setTimeout(()=>{setScores(prev=>{const m={...prev};Object.entries(newRS).forEach(([id,sc])=>{m[id]=(m[id]||0)+sc});return m});onFinish()},1800)}
  };

  if(phase==="spin") return <PhoneSpinView round={round} topics={topics} topic={topic} timerDuration={timerDuration} setTimerDuration={setTimerDuration} onSpinWheel={onSpinWheel} onResult={handleSpinResult} onStart={startStorytelling}/>;

  if(phase==="storytelling"){
    const rep=tableReps[cur];
    if(!rep) return <div style={{minHeight:"100vh",padding:"40px 20px",position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center"}}><div style={{fontSize:48,marginBottom:16}}>🍷</div><h3 style={{fontFamily:"'Noto Sans TC'",color:T.gold,fontSize:20}}>還沒有人簽到入座</h3></div>;
    return (
      <div style={{minHeight:"100vh",padding:"40px 20px",position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center"}}>
        <ScoreFlyIn score={lastScore} visible={showSA}/><ConfettiBurst active={showConf}/>
        <div style={{width:"100%",maxWidth:400,height:4,borderRadius:2,background:"rgba(212,162,78,0.15)",marginBottom:16}}><div style={{height:"100%",borderRadius:2,background:`linear-gradient(90deg,${T.gold},${T.goldLight})`,width:`${((cur+1)/tableReps.length)*100}%`,transition:"width 0.5s ease"}}/></div>
        <div style={{color:T.textMuted,fontFamily:"'Noto Sans TC'",fontSize:13,marginBottom:8}}>主題：{topic}</div>
        <div style={{background:T.bgCard,borderRadius:16,padding:"20px 24px",width:"100%",maxWidth:400,textAlign:"center",border:"1px solid rgba(212,162,78,0.2)",marginBottom:16,display:"flex",alignItems:"center",gap:16}}>
          <div style={{flex:1}}><div style={{color:T.warm,fontFamily:"'Noto Sans TC'",fontSize:12,fontWeight:500}}>第 {cur+1}/{tableReps.length} 位</div><div style={{fontSize:32,margin:"4px 0"}}>{rep?.tableEmoji}</div><div style={{fontFamily:"'Playfair Display',serif",color:T.goldLight,fontSize:20,fontWeight:700}}>{rep?.name}</div><div style={{color:T.textMuted,fontFamily:"'Noto Sans TC'",fontSize:12}}>{rep?.tableName}桌代表</div></div>
          <StoryTimer key={timerKey} duration={timerDuration} running={timerRunning} onTimeUp={()=>setTimerRunning(false)}/>
        </div>
        <div style={{background:T.bgCard,borderRadius:16,padding:24,width:"100%",maxWidth:400,border:"1px solid rgba(212,162,78,0.15)",marginBottom:20}}>
          <h3 style={{fontFamily:"'Noto Sans TC'",color:T.gold,fontSize:16,fontWeight:600,margin:"0 0 16px 0",textAlign:"center"}}>為這個故事打分</h3>
          {[{k:"story",l:"📖 故事精彩度"},{k:"expression",l:"🎭 表達感染力"},{k:"resonance",l:"💝 共鳴度"}].map(({k,l})=>(
            <div key={k} style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontFamily:"'Noto Sans TC'",color:T.warm,fontSize:14}}>{l}</span><span style={{fontFamily:"'Playfair Display'",color:T.goldLight,fontSize:20,fontWeight:700}}>{voting[k]}</span></div>
              <div style={{display:"flex",gap:6}}>{[1,2,3,4,5].map(v=><button key={v} onClick={()=>setVoting(p=>({...p,[k]:v}))} style={{flex:1,height:40,borderRadius:8,border:"none",background:v<=voting[k]?`linear-gradient(135deg,${T.gold},${T.amber})`:"rgba(255,255,255,0.05)",color:v<=voting[k]?T.bg:T.textMuted,fontSize:16,fontWeight:700,cursor:"pointer",transition:"all 0.2s",fontFamily:"'Noto Sans TC'"}}>{v}</button>)}</div>
            </div>
          ))}
          <div style={{textAlign:"center",marginTop:8,paddingTop:12,borderTop:"1px solid rgba(212,162,78,0.15)"}}><span style={{color:T.textMuted,fontFamily:"'Noto Sans TC'",fontSize:13}}>總分：</span><span style={{fontFamily:"'Playfair Display'",color:T.goldLight,fontSize:28,fontWeight:700,marginLeft:8}}>{voting.story+voting.expression+voting.resonance}</span><span style={{color:T.textMuted,fontFamily:"'Noto Sans TC'",fontSize:13}}> / 15</span></div>
        </div>
        <GoldButton onClick={submitVote}>{cur<tableReps.length-1?"送出評分，下一位 →":"送出最後評分 🏆"}</GoldButton>
      </div>
    );
  }

  // Transition state (briefly shown while switching to award ceremony)
  return (
    <div style={{minHeight:"100vh",position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      <div style={{fontSize:64,animation:"crownBounce 1s ease-in-out infinite"}}>🏆</div>
      <p style={{fontFamily:"'Noto Sans TC'",color:T.gold,fontSize:18,marginTop:16}}>準備頒獎...</p>
    </div>
  );
}

function PhoneIntermission({onNext}) {
  const [cd,setCd]=useState(300);
  const [dots]=useState(()=>Array.from({length:20}).map(()=>({x:Math.random()*100,y:Math.random()*100,s:0.5+Math.random()*1.5,d:3+Math.random()*6})));
  useEffect(()=>{const t=setInterval(()=>setCd(p=>(p>0?p-1:0)),1000);return()=>clearInterval(t)},[]);
  const phrases=["喝一口酒 🍷","聊聊剛才的故事","認識隔壁桌的人","為下一輪做準備"];
  const [phraseIdx,setPhraseIdx]=useState(0);
  useEffect(()=>{const t=setInterval(()=>setPhraseIdx(p=>(p+1)%phrases.length),3000);return()=>clearInterval(t)},[]);
  return (
    <div style={{minHeight:"100vh",padding:40,position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
      {dots.map((d,i)=><div key={i} style={{position:"absolute",left:`${d.x}%`,top:`${d.y}%`,width:d.s*3,height:d.s*3,borderRadius:"50%",background:T.gold,opacity:0.15,animation:`float${i%3} ${d.d}s ease-in-out infinite`,animationDelay:`${i*0.3}s`}}/>)}
      <div style={{fontSize:80,marginBottom:16,animation:"crownBounce 3s ease-in-out infinite"}}>🍷</div>
      <h2 style={{fontFamily:"'Playfair Display',serif",color:T.gold,fontSize:36,marginBottom:8,textShadow:"0 0 30px rgba(212,162,78,0.3)"}}>中場休息</h2>
      <p style={{fontFamily:"'Cormorant Garamond',serif",color:T.warm,fontSize:20,fontStyle:"italic",marginBottom:32,letterSpacing:3}}>refill your glass, refresh your soul</p>
      <div style={{fontFamily:"'Playfair Display',serif",color:T.goldLight,fontSize:72,fontWeight:700,textShadow:"0 0 40px rgba(212,162,78,0.3)",marginBottom:24}}>{Math.floor(cd/60)}:{(cd%60).toString().padStart(2,"0")}</div>
      <div style={{height:28,overflow:"hidden",marginBottom:32}}><div key={phraseIdx} style={{fontFamily:"'Noto Sans TC'",color:T.warm,fontSize:16,animation:"fadeSlideUp 0.5s ease"}}>{phrases[phraseIdx]}</div></div>
      <GoldButton onClick={onNext}>開始下一回合 →</GoldButton>
    </div>
  );
}

function ProjIntermission({countdown}) {
  const mins=Math.floor(countdown/60),secs=countdown%60;
  const [dots]=useState(()=>Array.from({length:30}).map(()=>({x:Math.random()*100,y:Math.random()*100,s:0.5+Math.random()*2,d:4+Math.random()*8})));
  const phrases=["喝一口酒 🍷","聊聊剛才的故事","認識隔壁桌的人","為下一輪做準備"];
  const [phraseIdx,setPhraseIdx]=useState(0);
  useEffect(()=>{const t=setInterval(()=>setPhraseIdx(p=>(p+1)%phrases.length),3000);return()=>clearInterval(t)},[]);
  return (
    <div style={{minHeight:"100vh",padding:40,position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
      {dots.map((d,i)=><div key={i} style={{position:"absolute",left:`${d.x}%`,top:`${d.y}%`,width:d.s*4,height:d.s*4,borderRadius:"50%",background:T.gold,opacity:0.12,animation:`float${i%3} ${d.d}s ease-in-out infinite`,animationDelay:`${i*0.2}s`}}/>)}
      <div style={{fontSize:120,marginBottom:16,animation:"crownBounce 3s ease-in-out infinite"}}>🍷</div>
      <h2 style={{fontFamily:"'Playfair Display',serif",color:T.gold,fontSize:64,marginBottom:8,textShadow:"0 0 40px rgba(212,162,78,0.3)"}}>中場休息</h2>
      <p style={{fontFamily:"'Cormorant Garamond',serif",color:T.warm,fontSize:32,fontStyle:"italic",marginBottom:40,letterSpacing:4}}>refill your glass, refresh your soul</p>
      <div style={{fontFamily:"'Playfair Display',serif",color:T.goldLight,fontSize:140,fontWeight:700,textShadow:"0 0 60px rgba(212,162,78,0.4)"}}>{mins}:{secs.toString().padStart(2,"0")}</div>
      <div style={{height:40,overflow:"hidden",marginTop:24}}><div key={phraseIdx} style={{fontFamily:"'Noto Sans TC'",color:T.warm,fontSize:24,animation:"fadeSlideUp 0.5s ease"}}>{phrases[phraseIdx]}</div></div>
    </div>
  );
}

// ============ AWARD CEREMONY (click-through) ============

function AwardCeremony({tableReps,roundScores,round,awards,onNext,projector}) {
  const sorted=[...tableReps].sort((a,b)=>(roundScores[b.id]||0)-(roundScores[a.id]||0));
  const top3=sorted.slice(0,3);
  const medals=["🥇","🥈","🥉"];
  // step: 0=waiting, 1=3rd revealed, 2=2nd revealed, 3=1st revealed, 4=full results
  const [step,setStep]=useState(0);
  const fs=projector?{t:48,n:28,s:20,aw:18}:{t:32,n:20,s:16,aw:14};
  const aw=awards||["🏆 冠軍","🥈 亞軍","🥉 季軍"];

  const handleClick=()=>{
    if(step<3){
      setStep(s=>s+1);
      SFX.fanfare();
    } else if(step===3){
      setStep(4);
    } else {
      if(onNext) onNext();
    }
  };

  const isRevealed=(rank)=>step>=(3-rank); // rank 0=1st(step3), 1=2nd(step2), 2=3rd(step1)

  // Step 4: Full results leaderboard
  if(step===4){
    const mx=Math.max(...Object.values(roundScores),1);
    return (
      <div style={{minHeight:"100vh",padding:projector?"40px 32px":"40px 20px",position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center"}}>
        <div style={{fontSize:projector?64:48,marginBottom:8}}>🏆</div>
        <h2 style={{fontFamily:"'Playfair Display',serif",color:T.gold,fontSize:fs.t,marginBottom:4}}>第 {round} 回合結果</h2>
        <p style={{fontFamily:"'Cormorant Garamond',serif",color:T.warm,fontSize:fs.s,fontStyle:"italic",marginBottom:32,letterSpacing:2}}>Final Standings</p>
        <div style={{width:"100%",maxWidth:projector?700:440}}>
          {sorted.map((rep,i)=>{const sc=roundScores[rep.id]||0;return(
            <div key={rep.id} style={{display:"flex",alignItems:"center",gap:projector?20:14,background:i===0?"rgba(212,162,78,0.12)":T.bgCard,borderRadius:projector?16:12,padding:projector?"18px 28px":"14px 18px",marginBottom:projector?12:10,border:`1px solid rgba(212,162,78,${i===0?0.35:0.1})`,animation:`slideInRight 0.4s ease ${i*0.1}s both`}}>
              <span style={{fontSize:projector?36:24,width:projector?44:32,textAlign:"center"}}>{i<3?medals[i]:<span style={{fontFamily:"'Playfair Display'",color:T.textMuted,fontSize:projector?24:16}}>{i+1}</span>}</span>
              <span style={{fontSize:projector?32:20}}>{rep.tableEmoji}</span>
              <div style={{flex:1}}><div style={{fontFamily:"'Noto Sans TC'",color:T.text,fontSize:projector?22:15,fontWeight:600}}>{rep.name}</div><div style={{fontFamily:"'Noto Sans TC'",color:T.textMuted,fontSize:12}}>{rep.tableName}桌</div></div>
              <div style={{display:"flex",alignItems:"center",gap:projector?16:8}}>
                <div style={{width:projector?160:80,height:projector?10:6,borderRadius:5,background:"rgba(255,255,255,0.05)",overflow:"hidden"}}><div style={{height:"100%",borderRadius:5,background:`linear-gradient(90deg,${T.gold},${T.goldLight})`,width:`${(sc/mx)*100}%`,animation:`barFill 1s ease ${i*0.1+0.2}s both`}}/></div>
                <span style={{fontFamily:"'Playfair Display'",color:T.goldLight,fontSize:projector?36:20,fontWeight:700,minWidth:projector?50:30,textAlign:"right"}}>{sc}</span>
              </div>
            </div>
          )})}
        </div>
        {!projector&&<GoldButton onClick={handleClick} style={{marginTop:24}}>
          {onNext?"繼續 →":"完成"}
        </GoldButton>}
      </div>
    );
  }

  // Steps 0-3: Award reveal
  const btnLabel=step===0?"揭曉第三名 🥉":step===1?"揭曉第二名 🥈":step===2?"揭曉第一名 🥇":"查看完整排名 📊";
  return (
    <div style={{minHeight:"100vh",padding:projector?"40px 32px":"40px 20px",position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      <h2 style={{fontFamily:"'Playfair Display',serif",color:T.gold,fontSize:fs.t,marginBottom:4,textAlign:"center"}}>🏆 第 {round} 回合頒獎</h2>
      <p style={{fontFamily:"'Cormorant Garamond',serif",color:T.warm,fontSize:fs.s,fontStyle:"italic",marginBottom:40,letterSpacing:2}}>And the winners are...</p>
      <div style={{display:"flex",gap:projector?24:16,alignItems:"flex-end",justifyContent:"center",marginBottom:40}}>
        {[2,0,1].map(rank=>{const rep=top3[rank];if(!rep)return null;const sc=roundScores[rep.id]||0;const isGold=rank===0;const show=isRevealed(rank);
          return (
            <div key={rank} style={{display:"flex",flexDirection:"column",alignItems:"center",opacity:show?1:0.15,transform:show?"translateY(0) scale(1)":"translateY(20px) scale(0.9)",transition:"all 0.8s cubic-bezier(0.34,1.56,0.64,1)",width:projector?180:110}}>
              <div style={{fontSize:projector?48:32,marginBottom:8,opacity:show?1:0,transition:"opacity 0.5s ease",animation:show&&isGold?"crownBounce 2s ease-in-out infinite":"none"}}>{medals[rank]}</div>
              <div style={{background:show?(isGold?"rgba(212,162,78,0.2)":T.bgCard):"rgba(255,255,255,0.02)",borderRadius:16,padding:projector?"20px 16px":"14px 12px",width:"100%",textAlign:"center",border:`2px solid ${show?(isGold?T.gold:"rgba(212,162,78,0.3)"):"rgba(212,162,78,0.05)"}`,transition:"all 0.5s ease"}}>
                {show?<>
                  <div style={{fontSize:projector?40:28,animation:"awardReveal 0.6s ease"}}>{rep.tableEmoji}</div>
                  <div style={{fontFamily:"'Playfair Display',serif",color:T.goldLight,fontSize:fs.n,fontWeight:700,marginTop:8,animation:"fadeSlideUp 0.5s ease 0.2s both"}}>{rep.name}</div>
                  <div style={{fontFamily:"'Noto Sans TC'",color:T.textMuted,fontSize:12,marginTop:4}}>{rep.tableName}桌</div>
                  <div style={{fontFamily:"'Playfair Display'",color:isGold?T.gold:T.warm,fontSize:projector?32:22,fontWeight:700,marginTop:8}}>{sc} 分</div>
                  {aw[rank]&&<div style={{fontFamily:"'Noto Sans TC'",color:T.goldLight,fontSize:fs.aw,fontWeight:600,marginTop:8,padding:"4px 12px",background:"rgba(212,162,78,0.1)",borderRadius:8,animation:"fadeSlideUp 0.5s ease 0.4s both"}}>{aw[rank]}</div>}
                </>:<>
                  <div style={{fontSize:projector?40:28,opacity:0.3}}>❓</div>
                  <div style={{fontFamily:"'Playfair Display',serif",color:T.textMuted,fontSize:fs.n,fontWeight:700,marginTop:8}}>???</div>
                  <div style={{fontFamily:"'Noto Sans TC'",color:"rgba(245,239,230,0.2)",fontSize:12,marginTop:4}}>即將揭曉</div>
                </>}
              </div>
            </div>
          );
        })}
      </div>
      <GoldButton onClick={handleClick}>{btnLabel}</GoldButton>
    </div>
  );
}

// ============ GOSPEL (configurable) ============

function GospelView({onNext,gospelContent,projector}) {
  const [show,setShow]=useState(false);
  useEffect(()=>{setTimeout(()=>setShow(true),300)},[]);
  const g=gospelContent||DEFAULT_GOSPEL;
  const cm={text:T.text,warm:T.warm,goldLight:T.goldLight};
  return (
    <div style={{minHeight:"100vh",padding:"40px 24px",position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",opacity:show?1:0,transition:"all 1.5s ease"}}>
      <div style={{width:60,height:1,background:`linear-gradient(90deg,transparent,${T.gold},transparent)`,marginBottom:32}}/>
      <h2 style={{fontFamily:"'Playfair Display',serif",color:T.gold,fontSize:projector?"clamp(36px,8vw,64px)":"clamp(24px,6vw,36px)",textAlign:"center",lineHeight:1.4,marginBottom:16}}>{g.title}</h2>
      <p style={{fontFamily:"'Cormorant Garamond',serif",color:T.warm,fontSize:projector?32:20,fontStyle:"italic",textAlign:"center",marginBottom:32,letterSpacing:2}}>{g.subtitle}</p>
      <div style={{background:T.bgCard,borderRadius:16,padding:projector?"48px 40px":"32px 28px",maxWidth:projector?700:480,width:"100%",border:"1px solid rgba(212,162,78,0.2)",lineHeight:2,fontSize:projector?22:16}}>
        {g.paragraphs.map((p,i)=><p key={i} style={{fontFamily:"'Noto Sans TC'",color:cm[p.color]||T.text,margin:i<g.paragraphs.length-1?"0 0 16px 0":"0",fontWeight:p.color==="goldLight"?500:400}}>{p.text}</p>)}
      </div>
      {!projector&&onNext&&<div style={{marginTop:32,textAlign:"center"}}><p style={{fontFamily:"'Noto Sans TC'",color:T.textMuted,fontSize:14,marginBottom:8}}>如果今晚的故事讓你心裡有些觸動</p><p style={{fontFamily:"'Noto Sans TC'",color:T.warm,fontSize:15}}>我們很想繼續聽你的故事 ❤️</p><GoldButton onClick={onNext} style={{marginTop:24}}>留下聯繫方式，讓故事繼續</GoldButton></div>}
    </div>
  );
}

// ============ STORY RECAP WALL ============

function StoryRecapWall({participants,tableCount,scores,projector}) {
  const tableReps=Array.from({length:tableCount}).map((_,i)=>{const m=participants.filter(p=>p.table===i);return m.length>0?{...m[0],tableName:TABLES[i],tableEmoji:TABLE_EMOJIS[i]}:null}).filter(Boolean);
  const sorted=[...tableReps].sort((a,b)=>(scores[b.id]||0)-(scores[a.id]||0));
  const medals=["🥇","🥈","🥉"];
  const fs=projector?{title:48,sub:20,card:18,name:22,emoji:48}:{title:28,sub:14,card:14,name:16,emoji:36};
  // Demo story summaries
  const demoStories={"1001":"那年我在客戶面前把咖啡灑在筆電上，結果反而談成了最大的案子","1003":"一個人背包旅行到冰島，暴風雪中被陌生人救了，後來成了我最好的朋友","1005":"舞台上吉他弦斷了，我用剩下的五根弦完成了整首歌，全場起立鼓掌","1007":"在紐約最孤獨的聖誕夜，收到一封來自台灣陌生人的手寫信","1009":"三個孩子同時發燒的那個晚上，我在浴室裡哭完又笑著走出來","1011":"聽完一個癌末病人的故事後，我決定辭掉高薪工作去當志工","1013":"分手那天下著大雨，我在路邊淋了一小時，然後走進了一間教會","1015":"第一次來這種活動，沒想到會哭，更沒想到會笑這麼多"};
  return (
    <div style={{minHeight:"100vh",padding:projector?"40px 32px":"40px 20px",position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center"}}>
      <div style={{fontSize:projector?64:40,marginBottom:8}}>📖</div>
      <h2 style={{fontFamily:"'Playfair Display',serif",color:T.gold,fontSize:fs.title,marginBottom:4,textAlign:"center"}}>今晚的故事牆</h2>
      <p style={{fontFamily:"'Cormorant Garamond',serif",color:T.warm,fontSize:fs.sub,fontStyle:"italic",marginBottom:32,letterSpacing:2}}>Stories worth remembering</p>
      <div style={{width:"100%",maxWidth:projector?800:440,display:"grid",gridTemplateColumns:projector?"1fr 1fr":"1fr",gap:projector?16:12}}>
        {sorted.map((rep,i)=>{const sc=scores[rep.id]||0;const story=demoStories[String(rep.id)]||"一個讓全場動容的真實故事...";return(
          <div key={rep.id} style={{background:T.bgCard,borderRadius:16,padding:projector?"24px 28px":"20px 24px",border:`1px solid rgba(212,162,78,${i<3?0.3:0.1})`,animation:`fadeSlideUp 0.5s ease ${i*0.08}s both`,position:"relative",overflow:"hidden"}}>
            {i<3&&<div style={{position:"absolute",top:12,right:14,fontSize:20}}>{medals[i]}</div>}
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
              <span style={{fontSize:fs.emoji}}>{rep.tableEmoji}</span>
              <div><div style={{fontFamily:"'Noto Sans TC'",color:T.goldLight,fontSize:fs.name,fontWeight:700}}>{rep.name}</div><div style={{fontFamily:"'Noto Sans TC'",color:T.textMuted,fontSize:12}}>{rep.tableName}桌代表{sc>0?` · ${sc} 分`:""}</div></div>
            </div>
            <p style={{fontFamily:"'Noto Sans TC'",color:T.warm,fontSize:fs.card,lineHeight:1.8,margin:0,fontStyle:"italic"}}>「{story}」</p>
          </div>
        )})}
      </div>
      {!projector&&<p style={{fontFamily:"'Noto Sans TC'",color:T.textMuted,fontSize:12,marginTop:24,textAlign:"center"}}>每個故事都值得被記住 ❤️</p>}
    </div>
  );
}

function ProjRecap({participants,tableCount,scores}) {
  return <StoryRecapWall participants={participants} tableCount={tableCount} scores={scores} projector={true}/>;
}

// ============ FOLLOW-UP with PostgreSQL API ============

// 🔧 部署後改成你的 Railway API URL
const API_URL = "https://story-night.up.railway.app";

// ============ QR CODE COMPONENT ============

function QRCodeDisplay({url,size=200}) {
  const qrUrl=`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&bgcolor=0f0b07&color=d4a24e&format=svg`;
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
      <div style={{background:"rgba(15,11,7,0.9)",borderRadius:16,padding:20,border:"1px solid rgba(212,162,78,0.3)",boxShadow:"0 0 40px rgba(212,162,78,0.15)"}}>
        <img src={qrUrl} alt="QR Code" width={size} height={size} style={{display:"block",borderRadius:8}}/>
      </div>
      <div style={{fontFamily:"'Noto Sans TC'",color:T.textMuted,fontSize:12,textAlign:"center",maxWidth:size,wordBreak:"break-all"}}>{url}</div>
    </div>
  );
}

// ============ REAL-TIME HOOK (Socket.io) ============

function useRealtime(eventId) {
  const [connected,setConnected]=useState(false);
  const [liveVotes,setLiveVotes]=useState([]);
  const [voteCount,setVoteCount]=useState(0);
  const socketRef=useRef(null);

  useEffect(()=>{
    if(!API_URL||!eventId) return;
    // Dynamically load Socket.io client
    const script=document.createElement("script");
    script.src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.min.js";
    script.onload=()=>{
      const socket=window.io(API_URL,{transports:["websocket","polling"]});
      socketRef.current=socket;
      socket.on("connect",()=>{
        setConnected(true);
        socket.emit("join:event",eventId);
      });
      socket.on("vote:new",(data)=>{
        setLiveVotes(prev=>[data,...prev].slice(0,50));
        setVoteCount(prev=>prev+1);
      });
      socket.on("disconnect",()=>setConnected(false));
    };
    document.head.appendChild(script);
    return()=>{if(socketRef.current)socketRef.current.disconnect()};
  },[eventId]);

  const emit=(event,data)=>{if(socketRef.current)socketRef.current.emit(event,data)};
  return {connected,liveVotes,voteCount,emit};
}

// ============ EVENT SETUP SCREEN (New!) ============

function EventSetupScreen({onEventCreated}) {
  const [eventName,setEventName]=useState("故事之夜 Vol.1");
  const [tableCount,setTableCount]=useState(8);
  const [creating,setCreating]=useState(false);
  const [eventData,setEventData]=useState(null);
  const is={width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(212,162,78,0.2)",borderRadius:8,padding:"12px 16px",color:T.text,fontFamily:"'Noto Sans TC'",fontSize:16,outline:"none"};

  const createEvent=async()=>{
    setCreating(true);
    if(API_URL){
      try{
        const resp=await fetch(`${API_URL}/api/events`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:eventName,table_count:tableCount})});
        const data=await resp.json();
        setEventData(data);
      }catch(err){console.error(err);setEventData({id:1,name:eventName,demo:true})}
    } else {
      setEventData({id:1,name:eventName,demo:true});
    }
    setCreating(false);
  };

  const eventUrl=eventData? (API_URL?`${window.location.origin}?event=${eventData.id}`:`${window.location.origin}`):"";

  if(eventData) return (
    <div style={{minHeight:"100vh",padding:"40px 20px",position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center"}}>
      <div style={{fontSize:48,marginBottom:8}}>🎉</div>
      <h2 style={{fontFamily:"'Playfair Display',serif",color:T.gold,fontSize:28,marginBottom:4}}>活動已建立</h2>
      <p style={{fontFamily:"'Noto Sans TC'",color:T.warm,fontSize:16,marginBottom:24}}>{eventData.name}</p>
      <div style={{background:T.bgCard,borderRadius:16,padding:28,width:"100%",maxWidth:400,border:"1px solid rgba(212,162,78,0.2)",textAlign:"center",marginBottom:24}}>
        <p style={{fontFamily:"'Noto Sans TC'",color:T.warm,fontSize:14,marginBottom:16}}>📱 讓參加者掃描此 QR Code 加入活動</p>
        <QRCodeDisplay url={eventUrl} size={220}/>
      </div>
      {!API_URL&&<div style={{background:"rgba(212,162,78,0.1)",borderRadius:10,padding:"12px 20px",marginBottom:16,maxWidth:400}}><p style={{fontFamily:"'Noto Sans TC'",color:T.amber,fontSize:12,margin:0}}>⚡ Demo 模式 — 部署 API 後 QR Code 會連到實際活動頁面</p></div>}
      <GoldButton onClick={()=>onEventCreated(eventData)}>進入活動控台 →</GoldButton>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",padding:"40px 20px",position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center"}}>
      <div style={{fontSize:48,marginBottom:8}}>🍷</div>
      <h2 style={{fontFamily:"'Playfair Display',serif",color:T.gold,fontSize:28,marginBottom:4}}>建立今晚的活動</h2>
      <p style={{fontFamily:"'Noto Sans TC'",color:T.textMuted,fontSize:14,marginBottom:32}}>設定完成後會產生 QR Code 讓參加者加入</p>
      <div style={{background:T.bgCard,borderRadius:16,padding:28,width:"100%",maxWidth:400,border:"1px solid rgba(212,162,78,0.15)"}}>
        <div style={{marginBottom:16}}><label style={{fontFamily:"'Noto Sans TC'",color:T.warm,fontSize:13,fontWeight:500,display:"block",marginBottom:6}}>活動名稱</label>
          <input value={eventName} onChange={e=>setEventName(e.target.value)} placeholder="故事之夜 Vol.1" style={is} onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor="rgba(212,162,78,0.2)"}/>
        </div>
        <div style={{marginBottom:20}}><label style={{fontFamily:"'Noto Sans TC'",color:T.warm,fontSize:13,fontWeight:500,display:"block",marginBottom:8}}>桌數</label>
          <div style={{display:"flex",gap:8}}>{[6,8,10].map(n=><button key={n} onClick={()=>setTableCount(n)} style={{flex:1,background:tableCount===n?T.gold:"transparent",color:tableCount===n?T.bg:T.textMuted,border:`1px solid ${tableCount===n?T.gold:"rgba(212,162,78,0.3)"}`,borderRadius:8,padding:"10px",cursor:"pointer",fontFamily:"'Noto Sans TC'",fontSize:15,fontWeight:600,transition:"all 0.2s"}}>{n} 桌</button>)}</div>
        </div>
        <GoldButton onClick={createEvent} disabled={!eventName.trim()||creating} style={{width:"100%"}}>{creating?"建立中...":"🎲 建立活動 & 產生 QR Code"}</GoldButton>
      </div>
    </div>
  );
}

// ============ LIVE VOTE INDICATOR (shown on projector) ============

function LiveVoteIndicator({connected,voteCount}) {
  return (
    <div style={{position:"fixed",top:20,right:20,zIndex:100,display:"flex",alignItems:"center",gap:8,background:"rgba(15,11,7,0.8)",borderRadius:20,padding:"8px 16px",border:"1px solid rgba(212,162,78,0.2)",backdropFilter:"blur(10px)"}}>
      <div style={{width:8,height:8,borderRadius:"50%",background:connected?"#2ecc71":"#e74c3c",boxShadow:connected?"0 0 8px #2ecc71":"0 0 8px #e74c3c"}}/>
      <span style={{fontFamily:"'Noto Sans TC'",color:T.textMuted,fontSize:12}}>{connected?`即時連線中 · ${voteCount} 票`:"離線模式"}</span>
    </div>
  );
}

async function writeToAPI(data) {
  if (!API_URL) {
    console.log("[Demo Mode] Would POST to /api/participants/followup:", data);
    return { success: true, demo: true };
  }
  try {
    const resp = await fetch(`${API_URL}/api/participants/followup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_id: data.event_id || 1,
        name: data.name,
        phone: data.phone,
        table_name: data.table,
        interests: data.interests,
      }),
    });
    const result = await resp.json();
    return { success: true, result };
  } catch (err) {
    console.error("API write error:", err);
    return { success: false, error: err.message };
  }
}

function FollowUpScreen({participants,tableCount,currentUserTable}) {
  const [phase,setPhase]=useState("form");
  const [fd,setFd]=useState({name:"",phone:"",ig:"",line:"",table:currentUserTable||"",interests:[],feedback:""});
  const [saveStatus,setSaveStatus]=useState("");
  const interestOpts=["想繼續聽故事 📖","想認識新朋友 🤝","想參加下次活動 🎉","只是來喝酒的 😄"];
  const is={width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(212,162,78,0.2)",borderRadius:8,padding:"12px 16px",color:T.text,fontFamily:"'Noto Sans TC'",fontSize:16,outline:"none"};

  const handleSubmit=async()=>{
    if(!fd.name.trim())return;
    setPhase("saving");setSaveStatus("正在儲存...");
    const contact=[fd.phone&&`📱${fd.phone}`,fd.ig&&`IG:${fd.ig}`,fd.line&&`LINE:${fd.line}`].filter(Boolean).join(" | ");
    const result=await writeToAPI({...fd,phone:contact});
    setSaveStatus(result.success?"✅ 已儲存":"⚠️ 稍後同步");
    setTimeout(()=>setPhase("done"),1200);
  };

  if(phase==="done") return (
    <div style={{minHeight:"100vh",padding:"40px 20px",position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center"}}>
      <div style={{fontSize:64,marginBottom:16}}>🙏</div>
      <h2 style={{fontFamily:"'Playfair Display',serif",color:T.gold,fontSize:32,marginBottom:8}}>感謝你的故事</h2>
      <p style={{fontFamily:"'Cormorant Garamond',serif",color:T.warm,fontSize:20,fontStyle:"italic",marginBottom:24,letterSpacing:2}}>Your story matters</p>
      <div style={{width:60,height:1,background:`linear-gradient(90deg,transparent,${T.gold},transparent)`,marginBottom:24}}/>
      <p style={{fontFamily:"'Noto Sans TC'",color:T.text,fontSize:16,maxWidth:360,lineHeight:1.8,marginBottom:16}}>願你今晚聽到的每一個故事<br/>都成為你生命中的養分 ✨</p>
      {saveStatus&&<div style={{background:"rgba(212,162,78,0.1)",borderRadius:8,padding:"8px 16px",marginBottom:24}}><p style={{fontFamily:"'Noto Sans TC'",color:T.warm,fontSize:12,margin:0}}>{saveStatus}</p></div>}
      <div style={{background:T.bgCard,borderRadius:16,padding:"24px 28px",border:"1px solid rgba(212,162,78,0.2)",maxWidth:380,width:"100%",marginBottom:16}}>
        <p style={{fontFamily:"'Noto Sans TC'",color:T.warm,fontSize:14,margin:"0 0 12px 0",fontWeight:600}}>📖 繼續你的故事旅程</p>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <a href="https://trip.wechurch.online" target="_blank" rel="noopener" style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"12px 16px",textDecoration:"none",border:"1px solid rgba(212,162,78,0.15)"}}>
            <span style={{fontSize:20}}>🌍</span>
            <div><div style={{fontFamily:"'Noto Sans TC'",color:T.goldLight,fontSize:14,fontWeight:600}}>WeChurch 旅程平台</div><div style={{fontFamily:"'Noto Sans TC'",color:T.textMuted,fontSize:11}}>探索聖經世界的數位旅程</div></div>
          </a>
          <a href="#" style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"12px 16px",textDecoration:"none",border:"1px solid rgba(212,162,78,0.15)"}}>
            <span style={{fontSize:20}}>💬</span>
            <div><div style={{fontFamily:"'Noto Sans TC'",color:T.goldLight,fontSize:14,fontWeight:600}}>加入故事社群</div><div style={{fontFamily:"'Noto Sans TC'",color:T.textMuted,fontSize:11}}>LINE 社群 · 每週更新</div></div>
          </a>
          <a href="#" style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"12px 16px",textDecoration:"none",border:"1px solid rgba(212,162,78,0.15)"}}>
            <span style={{fontSize:20}}>🎧</span>
            <div><div style={{fontFamily:"'Noto Sans TC'",color:T.goldLight,fontSize:14,fontWeight:600}}>Re:Jesus Podcast</div><div style={{fontFamily:"'Noto Sans TC'",color:T.textMuted,fontSize:11}}>52 集故事 · 輕鬆好聽</div></div>
          </a>
        </div>
      </div>
      <p style={{fontFamily:"'Noto Sans TC'",color:"rgba(245,239,230,0.15)",fontSize:12,marginTop:32}}>Wechurch · 讓每個生命的故事被聽見</p>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",padding:"40px 20px",position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center"}}>
      <h2 style={{fontFamily:"'Playfair Display',serif",color:T.gold,fontSize:28,marginBottom:4}}>讓故事繼續</h2>
      <p style={{fontFamily:"'Noto Sans TC'",color:T.textMuted,fontSize:14,marginBottom:24}}>留下你的資料，讓我們保持聯繫</p>
      {/* Auto table badge */}
      {fd.table&&<div style={{background:"rgba(212,162,78,0.1)",borderRadius:20,padding:"6px 16px",marginBottom:20,display:"flex",alignItems:"center",gap:6,border:"1px solid rgba(212,162,78,0.2)"}}>
        <span>{TABLE_EMOJIS[TABLES.indexOf(fd.table)]||"🍷"}</span>
        <span style={{fontFamily:"'Noto Sans TC'",color:T.goldLight,fontSize:13,fontWeight:600}}>{fd.table}桌</span>
      </div>}
      <div style={{background:T.bgCard,borderRadius:16,padding:28,width:"100%",maxWidth:400,border:"1px solid rgba(212,162,78,0.15)"}}>
        <div style={{marginBottom:16}}><label style={{fontFamily:"'Noto Sans TC'",color:T.warm,fontSize:13,fontWeight:500,display:"block",marginBottom:6}}>姓名</label><input value={fd.name} onChange={e=>setFd(p=>({...p,name:e.target.value}))} placeholder="你的名字" style={is} onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor="rgba(212,162,78,0.2)"}/></div>
        {/* Contact - 3 fields in a row */}
        <div style={{marginBottom:16}}><label style={{fontFamily:"'Noto Sans TC'",color:T.warm,fontSize:13,fontWeight:500,display:"block",marginBottom:6}}>聯繫方式（至少填一個）</label>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontFamily:"'Noto Sans TC'",color:T.textMuted,fontSize:13,minWidth:40}}>📱</span><input value={fd.phone} onChange={e=>setFd(p=>({...p,phone:e.target.value}))} placeholder="手機號碼" style={{...is,marginBottom:0}} onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor="rgba(212,162,78,0.2)"}/></div>
            <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontFamily:"'Noto Sans TC'",color:T.textMuted,fontSize:13,minWidth:40}}>IG</span><input value={fd.ig} onChange={e=>setFd(p=>({...p,ig:e.target.value}))} placeholder="Instagram 帳號" style={{...is,marginBottom:0}} onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor="rgba(212,162,78,0.2)"}/></div>
            <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontFamily:"'Noto Sans TC'",color:T.textMuted,fontSize:13,minWidth:40}}>LINE</span><input value={fd.line} onChange={e=>setFd(p=>({...p,line:e.target.value}))} placeholder="LINE ID" style={{...is,marginBottom:0}} onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor="rgba(212,162,78,0.2)"}/></div>
          </div>
        </div>
        {/* Interests */}
        <div style={{marginBottom:16}}><label style={{fontFamily:"'Noto Sans TC'",color:T.warm,fontSize:13,fontWeight:500,display:"block",marginBottom:8}}>你對什麼有興趣？（可複選）</label><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{interestOpts.map(opt=>{const sel=fd.interests.includes(opt);return <button key={opt} onClick={()=>setFd(p=>({...p,interests:sel?p.interests.filter(x=>x!==opt):[...p.interests,opt]}))} style={{background:sel?"rgba(212,162,78,0.2)":"rgba(255,255,255,0.03)",border:`1px solid ${sel?T.gold:"rgba(212,162,78,0.15)"}`,borderRadius:20,padding:"8px 16px",color:sel?T.goldLight:T.textMuted,fontFamily:"'Noto Sans TC'",fontSize:13,cursor:"pointer",transition:"all 0.2s"}}>{opt}</button>})}</div></div>
        {/* Feedback */}
        <div style={{marginBottom:20}}><label style={{fontFamily:"'Noto Sans TC'",color:T.warm,fontSize:13,fontWeight:500,display:"block",marginBottom:6}}>給我們的回饋 💬</label><textarea value={fd.feedback} onChange={e=>setFd(p=>({...p,feedback:e.target.value}))} placeholder="今晚的活動你覺得如何？有什麼建議嗎？" rows={3} style={{...is,resize:"vertical"}} onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor="rgba(212,162,78,0.2)"}/></div>
        {phase==="saving"&&<div style={{textAlign:"center",marginBottom:12}}><div style={{fontFamily:"'Noto Sans TC'",color:T.amber,fontSize:13}}>{saveStatus}</div></div>}
        <GoldButton onClick={handleSubmit} disabled={!fd.name.trim()||phase==="saving"} style={{width:"100%"}}>{phase==="saving"?"儲存中...":"送出 🙌"}</GoldButton>
      </div>
    </div>
  );
}

// ============ HOST FLOATING PANEL (Backstage controls in projector mode) ============

function HostFloatingPanel({screen,setScreen,projector,setProjector,onSpinWheel,totalRounds,setTotalRounds,roundAwards,setRoundAwards,gospelContent,setGospelContent}) {
  const [open,setOpen]=useState(false);
  const [tab,setTab]=useState("nav"); // nav | settings
  const allScreens=[
    {id:"setup",label:"⚙️ 設定"},{id:"landing",label:"🏠 首頁"},{id:"checkin",label:"✍️ 簽到"},
    ...Array.from({length:totalRounds}).flatMap((_,i)=>[
      {id:`round${i+1}`,label:`${i+1}️⃣ 第${i+1}回合`},
      {id:`award${i+1}`,label:`🏆 頒獎${i+1}`},
      ...(i<totalRounds-1?[{id:"intermission",label:"☕ 中場"}]:[]),
    ]),
    {id:"recap",label:"📖 故事牆"},{id:"gospel",label:"✝️ 福音"},{id:"followup",label:"🤝 跟進"},
  ];

  const tabBtnStyle=(active)=>({background:active?"rgba(212,162,78,0.2)":"transparent",color:active?T.goldLight:T.textMuted,border:"none",borderBottom:active?`2px solid ${T.gold}`:"2px solid transparent",padding:"8px 16px",fontFamily:"'Noto Sans TC'",fontSize:12,fontWeight:600,cursor:"pointer",flex:1,textAlign:"center"});

  return (
    <>
      <button onClick={()=>setOpen(!open)} style={{position:"fixed",bottom:20,right:20,zIndex:300,width:56,height:56,borderRadius:"50%",border:"none",background:open?T.red:`linear-gradient(135deg,${T.gold},${T.amber})`,color:open?"#fff":T.bg,fontSize:24,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 20px rgba(0,0,0,0.5)",transition:"all 0.3s ease",animation:open?"none":"fabPulse 2s ease-in-out infinite",display:"flex",alignItems:"center",justifyContent:"center"}}>
        {open?"✕":"🎙️"}
      </button>
      {open&&<div style={{position:"fixed",bottom:86,right:20,zIndex:300,width:320,maxHeight:"70vh",background:"rgba(15,11,7,0.97)",borderRadius:16,border:"1px solid rgba(212,162,78,0.3)",boxShadow:"0 8px 40px rgba(0,0,0,0.6)",backdropFilter:"blur(15px)",animation:"panelSlideIn 0.3s ease",overflow:"hidden",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"12px 20px",borderBottom:"1px solid rgba(212,162,78,0.15)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontFamily:"'Noto Sans TC'",color:T.gold,fontSize:14,fontWeight:700}}>🎙️ 主持人後台</span>
          <span style={{fontFamily:"'Noto Sans TC'",color:T.textMuted,fontSize:11}}>{projector?"📽️ 投影中":"📱 手機模式"}</span>
        </div>
        {/* Tab bar */}
        <div style={{display:"flex",borderBottom:"1px solid rgba(212,162,78,0.1)"}}>
          <button onClick={()=>setTab("nav")} style={tabBtnStyle(tab==="nav")}>📍 導航</button>
          <button onClick={()=>setTab("settings")} style={tabBtnStyle(tab==="settings")}>⚙️ 活動設定</button>
        </div>
        <div style={{overflowY:"auto",flex:1}}>
          {tab==="nav"&&<>
            <div style={{padding:"10px 20px",background:"rgba(212,162,78,0.05)"}}>
              <div style={{fontFamily:"'Noto Sans TC'",color:T.textMuted,fontSize:11,marginBottom:2}}>目前畫面</div>
              <div style={{fontFamily:"'Noto Sans TC'",color:T.goldLight,fontSize:14,fontWeight:600}}>{allScreens.find(s=>s.id===screen)?.label||screen}</div>
            </div>
            <div style={{padding:"10px 14px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
              {allScreens.map(s=><button key={s.id} onClick={()=>setScreen(s.id)} style={{background:screen===s.id?"rgba(212,162,78,0.2)":"rgba(255,255,255,0.03)",color:screen===s.id?T.goldLight:T.textMuted,border:`1px solid ${screen===s.id?"rgba(212,162,78,0.4)":"rgba(212,162,78,0.1)"}`,borderRadius:8,padding:"7px 5px",cursor:"pointer",fontFamily:"'Noto Sans TC'",fontSize:11,fontWeight:500,transition:"all 0.2s",textAlign:"center"}}>{s.label}</button>)}
            </div>
          </>}
          {tab==="settings"&&<div style={{padding:"14px 18px"}}>
            {/* Round count */}
            <div style={{marginBottom:16}}>
              <div style={{fontFamily:"'Noto Sans TC'",color:T.warm,fontSize:12,fontWeight:600,marginBottom:8}}>🎯 比賽回合數</div>
              <div style={{display:"flex",gap:6}}>
                {[1,2,3].map(n=><button key={n} onClick={()=>setTotalRounds(n)} style={{flex:1,padding:"8px",borderRadius:8,border:`1px solid ${totalRounds===n?T.gold:"rgba(212,162,78,0.2)"}`,background:totalRounds===n?T.gold:"transparent",color:totalRounds===n?T.bg:T.textMuted,fontFamily:"'Noto Sans TC'",fontSize:13,fontWeight:700,cursor:"pointer",transition:"all 0.2s"}}>{n} 輪</button>)}
              </div>
            </div>
            {/* Award names per round */}
            <div style={{marginBottom:16}}>
              <div style={{fontFamily:"'Noto Sans TC'",color:T.warm,fontSize:12,fontWeight:600,marginBottom:8}}>🏆 獎項名稱</div>
              {Array.from({length:totalRounds}).map((_,ri)=><div key={ri} style={{marginBottom:10}}>
                <div style={{fontFamily:"'Noto Sans TC'",color:T.textMuted,fontSize:11,marginBottom:4}}>第 {ri+1} 回合</div>
                {["冠軍","亞軍","季軍"].map((place,pi)=><input key={pi} value={roundAwards[ri]?.[pi]||""} onChange={e=>{const na=[...roundAwards];if(!na[ri])na[ri]=["","",""];na[ri]=[...na[ri]];na[ri][pi]=e.target.value;setRoundAwards(na)}} placeholder={`${place} 獎項名稱`} style={{width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(212,162,78,0.15)",borderRadius:6,padding:"6px 10px",color:T.text,fontFamily:"'Noto Sans TC'",fontSize:12,outline:"none",marginBottom:4}} onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor="rgba(212,162,78,0.15)"}/>)}
              </div>)}
            </div>
            {/* Gospel editor */}
            <div style={{marginBottom:16}}>
              <div style={{fontFamily:"'Noto Sans TC'",color:T.warm,fontSize:12,fontWeight:600,marginBottom:8}}>✝️ 最後的故事（福音內容）</div>
              <input value={gospelContent.title} onChange={e=>setGospelContent(p=>({...p,title:e.target.value}))} placeholder="標題" style={{width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(212,162,78,0.15)",borderRadius:6,padding:"6px 10px",color:T.goldLight,fontFamily:"'Noto Sans TC'",fontSize:13,fontWeight:600,outline:"none",marginBottom:6}} onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor="rgba(212,162,78,0.15)"}/>
              {gospelContent.paragraphs.map((p,i)=><textarea key={i} value={p.text} onChange={e=>{const np=[...gospelContent.paragraphs];np[i]={...np[i],text:e.target.value};setGospelContent(prev=>({...prev,paragraphs:np}))}} rows={2} style={{width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(212,162,78,0.15)",borderRadius:6,padding:"6px 10px",color:T.text,fontFamily:"'Noto Sans TC'",fontSize:11,outline:"none",marginBottom:4,resize:"vertical"}} onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor="rgba(212,162,78,0.15)"}/>)}
              <button onClick={()=>setGospelContent(p=>({...p,paragraphs:[...p.paragraphs,{text:"",color:"text"}]}))} style={{background:"transparent",border:"1px dashed rgba(212,162,78,0.3)",borderRadius:6,padding:"4px 12px",color:T.textMuted,fontFamily:"'Noto Sans TC'",fontSize:11,cursor:"pointer",width:"100%"}}>+ 新增段落</button>
            </div>
          </div>}
        </div>
        {/* Projector toggle */}
        <div style={{padding:"10px 18px",borderTop:"1px solid rgba(212,162,78,0.1)"}}>
          <button onClick={()=>setProjector(!projector)} style={{width:"100%",padding:"8px 16px",borderRadius:10,border:"none",background:projector?"rgba(192,57,43,0.2)":`linear-gradient(135deg,${T.gold},${T.amber})`,color:projector?"#e74c3c":T.bg,fontFamily:"'Noto Sans TC'",fontSize:13,fontWeight:700,cursor:"pointer",transition:"all 0.2s"}}>{projector?"📱 切回手機模式":"📽️ 開啟投影模式"}</button>
        </div>
      </div>}
    </>
  );
}

// ============ BOTTOM BAR (Phone mode only) ============

function HostBar({screen,setScreen,setProjector,totalRounds}) {
  const screens=[
    {id:"setup",label:"設定"},{id:"landing",label:"首頁"},{id:"checkin",label:"簽到"},
    ...Array.from({length:totalRounds||2}).flatMap((_,i)=>[
      {id:`round${i+1}`,label:`R${i+1}`},
      {id:`award${i+1}`,label:`🏆${i+1}`},
      ...(i<(totalRounds||2)-1?[{id:"intermission",label:"中場"}]:[]),
    ]),
    {id:"recap",label:"故事牆"},{id:"gospel",label:"福音"},{id:"followup",label:"跟進"},
  ];
  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:100,background:"rgba(15,11,7,0.95)",borderTop:"1px solid rgba(212,162,78,0.2)",padding:"8px 12px",display:"flex",gap:4,alignItems:"center",overflowX:"auto",backdropFilter:"blur(10px)"}}>
      <span style={{color:T.textMuted,fontFamily:"'Noto Sans TC'",fontSize:11,marginRight:6,whiteSpace:"nowrap"}}>🎙️</span>
      <button onClick={()=>setProjector(true)} style={{background:"rgba(255,255,255,0.08)",color:T.textMuted,border:"none",borderRadius:6,padding:"6px 10px",fontFamily:"'Noto Sans TC'",fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",marginRight:4}}>📽️ 投影</button>
      {screens.map(s=><button key={s.id} onClick={()=>setScreen(s.id)} style={{background:screen===s.id?T.gold:"rgba(255,255,255,0.05)",color:screen===s.id?T.bg:T.textMuted,border:"none",borderRadius:6,padding:"6px 12px",fontFamily:"'Noto Sans TC'",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.2s"}}>{s.label}</button>)}
    </div>
  );
}

// ============ MAIN APP ============

export default function StoryNightApp() {
  const [screen,setScreen]=useState("landing");
  const [eventData,setEventData]=useState(null);
  const [participants,setParticipants]=useState(DEMO_PARTICIPANTS);
  const [tableCount,setTableCount]=useState(8);
  const [scores,setScores]=useState({});
  const [projector,setProjector]=useState(false);

  // ---- Configurable settings (host can edit) ----
  const [totalRounds,setTotalRounds]=useState(2);
  const [nextRound,setNextRound]=useState(2); // tracks which round comes after intermission
  const [roundAwards,setRoundAwards]=useState([
    ["🏆 故事王","🥈 銀舌獎","🥉 勇氣獎"],
    ["🏆 靈魂說書人","🥈 最佳淚腺攻擊","🥉 全場噴酒獎"],
    ["🏆 傳奇說書人","🥈 最佳劇情獎","🥉 人氣獎"],
  ]);
  const [gospelContent,setGospelContent]=useState(DEFAULT_GOSPEL);

  // Real-time connection
  const rt=useRealtime(eventData?.id);

  // Shared state for projector sync
  const [spinTrigger,setSpinTrigger]=useState(0);
  const [projPhase,setProjPhase]=useState("spin");
  const [projTopic,setProjTopic]=useState("");
  const [projTimer,setProjTimer]=useState({running:false,duration:180,key:0});
  const [projStoryteller,setProjStoryteller]=useState({idx:0,rep:null,total:0});
  const [projVote,setProjVote]=useState({voteCount:0,lastScore:0,roundScores:{},tableReps:[]});
  const [intermissionCd,setIntermissionCd]=useState(300);

  useEffect(()=>{
    if(screen==="intermission"){
      setIntermissionCd(300);
      const t=setInterval(()=>setIntermissionCd(p=>(p>0?p-1:0)),1000);
      return()=>clearInterval(t);
    }
  },[screen]);

  const handleSpinWheel=()=>setSpinTrigger(p=>p+1);
  const handleEventCreated=(data)=>{setEventData(data);if(data.table_count)setTableCount(data.table_count);setScreen("landing")};

  const eventUrl=eventData?(API_URL?`${window.location.origin}?event=${eventData.id}`:`${window.location.origin}`):"";

  // Projector front-stage render
  const renderProjector=()=>{
    // Dynamic round routing
    for(let i=1;i<=totalRounds;i++){
      if(screen===`round${i}`){
        const topics=ALL_TOPICS[(i-1)%ALL_TOPICS.length];
        if(projPhase==="spin") return <ProjSpin topics={topics} round={i} spinTrigger={spinTrigger} onResult={(t)=>setProjTopic(t)}/>;
        if(projPhase==="storytelling") return <ProjStoryteller rep={projStoryteller.rep} topic={projTopic} currentIdx={projStoryteller.idx} totalCount={projStoryteller.total} timerDuration={projTimer.duration} timerRunning={projTimer.running} onTimeUp={()=>{}} voteCount={projVote.voteCount} lastScore={projVote.lastScore}/>;
        return <ProjLeaderboard tableReps={projVote.tableReps} roundScores={projVote.roundScores} topic={projTopic} round={i}/>;
      }
      if(screen===`award${i}`) return <AwardCeremony tableReps={projVote.tableReps} roundScores={projVote.roundScores} round={i} awards={roundAwards[i-1]} projector/>;
    }
    switch(screen){
      case "setup": return <ProjLanding/>;
      case "landing": return (
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:24,textAlign:"center",position:"relative",zIndex:1}}>
          <div style={{fontSize:120,marginBottom:8}}>🍷</div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(64px,12vw,120px)",fontWeight:900,color:T.gold,lineHeight:1.1,margin:"0 0 8px 0",textShadow:"0 0 40px rgba(212,162,78,0.3)"}}>我有酒</h1>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(32px,6vw,56px)",fontWeight:300,fontStyle:"italic",color:T.warm,margin:"0 0 40px 0",letterSpacing:4}}>你有故事嗎？</h2>
          <QRCodeDisplay url={eventUrl} size={280}/>
          <p style={{fontFamily:"'Noto Sans TC'",color:T.textMuted,fontSize:22,marginTop:24,letterSpacing:3}}>掃描 QR Code 加入今晚的故事</p>
          {eventData&&<p style={{fontFamily:"'Noto Sans TC'",color:"rgba(245,239,230,0.25)",fontSize:14,marginTop:16}}>{eventData.name}</p>}
        </div>
      );
      case "intermission": return <ProjIntermission countdown={intermissionCd}/>;
      case "recap": return <ProjRecap participants={participants} tableCount={tableCount} scores={scores}/>;
      case "gospel": return <GospelView gospelContent={gospelContent} projector/>;
      case "followup": return <ProjRecap participants={participants} tableCount={tableCount} scores={scores}/>;
      default: return <ProjLanding/>;
    }
  };

  // Handle checkin for projector (show landing with QR)
  const renderProjectorCheckin=()=>(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:24,textAlign:"center",position:"relative",zIndex:1}}>
      <div style={{fontSize:120,marginBottom:8}}>🍷</div>
      <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(64px,12vw,100px)",fontWeight:900,color:T.gold,lineHeight:1.1,margin:"0 0 32px 0"}}>我有酒</h1>
      <QRCodeDisplay url={eventUrl} size={260}/>
      <p style={{fontFamily:"'Noto Sans TC'",color:T.textMuted,fontSize:20,marginTop:20}}>掃描加入 · 已有 {participants.length} 人入場</p>
    </div>
  );

  // Override projector for checkin
  const renderProjectorFinal=()=>{
    if(screen==="checkin") return renderProjectorCheckin();
    return renderProjector();
  };

  // Phone backstage/main render
  const goAfterAward=(roundNum)=>{
    if(roundNum<totalRounds){
      setNextRound(roundNum+1);
      setScreen("intermission");
    } else {
      setScreen("recap");
    }
  };

  const renderPhone=()=>{
    // Dynamic round routing
    for(let i=1;i<=totalRounds;i++){
      if(screen===`round${i}`) return <PhoneStoryRound key={`r${i}`} round={i} participants={participants} tableCount={tableCount} scores={scores} setScores={setScores} onFinish={()=>setScreen(`award${i}`)} onSpinWheel={handleSpinWheel} onTopicSet={setProjTopic} onPhaseChange={setProjPhase} onTimerState={setProjTimer} onStoryteller={setProjStoryteller} onVoteData={setProjVote}/>;
      if(screen===`award${i}`) return <AwardCeremony tableReps={projVote.tableReps} roundScores={projVote.roundScores} round={i} awards={roundAwards[i-1]} onNext={()=>goAfterAward(i)}/>;
    }
    switch(screen){
      case "setup": return <EventSetupScreen onEventCreated={handleEventCreated}/>;
      case "landing": return <PhoneLanding onNext={()=>setScreen("checkin")}/>;
      case "checkin": return <CheckInScreen onNext={()=>setScreen("round1")} participants={participants} setParticipants={setParticipants} tableCount={tableCount} setTableCount={setTableCount}/>;
      case "intermission": return <PhoneIntermission onNext={()=>setScreen(`round${nextRound}`)}/>;
      case "recap": return <div style={{position:"relative",zIndex:1}}><StoryRecapWall participants={participants} tableCount={tableCount} scores={scores}/><div style={{display:"flex",justifyContent:"center",padding:"0 20px 40px"}}><GoldButton onClick={()=>setScreen("gospel")}>進入今晚最後一個故事 →</GoldButton></div></div>;
      case "gospel": return <GospelView gospelContent={gospelContent} onNext={()=>setScreen("followup")}/>;
      case "followup": return <FollowUpScreen participants={participants} tableCount={tableCount}/>;
      default: return <PhoneLanding onNext={()=>setScreen("checkin")}/>;
    }
  };

  return (
    <div style={{minHeight:"100vh",fontFamily:"'Noto Sans TC',sans-serif",color:T.text,overflowX:"hidden",paddingBottom:projector?0:52}}>
      <AnimatedBG/>
      {projector && rt.connected && <LiveVoteIndicator connected={rt.connected} voteCount={rt.voteCount}/>}
      {projector ? renderProjectorFinal() : renderPhone()}
      {projector
        ? <HostFloatingPanel screen={screen} setScreen={setScreen} projector={projector} setProjector={setProjector} onSpinWheel={handleSpinWheel} totalRounds={totalRounds} setTotalRounds={setTotalRounds} roundAwards={roundAwards} setRoundAwards={setRoundAwards} gospelContent={gospelContent} setGospelContent={setGospelContent}/>
        : <HostBar screen={screen} setScreen={setScreen} setProjector={setProjector} totalRounds={totalRounds}/>
      }
    </div>
  );
}
