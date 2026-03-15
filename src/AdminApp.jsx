// ============================================================
// 🍷 Story Night — 後台（管理員頁面）
// 路由: /#/admin
// 功能: 活動建立、流程控制、投影模式、設定、跟進管理
// ============================================================
import { useState, useEffect, useRef, useCallback } from "react";
import {
  T, TABLES, TABLE_EMOJIS, ALL_TOPICS, DEMO_PARTICIPANTS, DEFAULT_GOSPEL, API_URL,
  AnimatedBG, GoldButton, ConfettiBurst, ScoreFlyIn, StoryTimer, QRCodeDisplay,
  SFX, useRealtime, useBroadcast, injectGlobalStyles, getTableReps,
} from "./shared.jsx";

injectGlobalStyles();

// ============ PROJECTOR VIEWS ============

function ProjLanding() {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 100) }, []);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24, textAlign: "center", position: "relative", zIndex: 1, opacity: show ? 1 : 0, transition: "all 1s ease" }}>
      <div style={{ fontSize: 120, marginBottom: 8 }}>🍷</div>
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(64px,12vw,120px)", fontWeight: 900, color: T.gold, lineHeight: 1.1, margin: "0 0 8px 0", textShadow: "0 0 40px rgba(212,162,78,0.3)" }}>我有酒</h1>
      <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(32px,6vw,56px)", fontWeight: 300, fontStyle: "italic", color: T.warm, margin: "0 0 32px 0", letterSpacing: 4 }}>你有故事嗎？</h2>
      <div style={{ width: 60, height: 1, background: `linear-gradient(90deg,transparent,${T.gold},transparent)`, margin: "0 auto 40px" }} />
      <p style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 24, letterSpacing: 4 }}>請掃描 QR Code 加入今晚的故事</p>
    </div>
  );
}

function ProjStoryteller({ rep, topic, currentIdx, totalCount, timerDuration, timerRunning, onTimeUp, voteCount, lastScore }) {
  const [showScore, setShowScore] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const prevVC = useRef(0);
  useEffect(() => {
    if (voteCount > prevVC.current && lastScore > 0) { setShowScore(true); if (lastScore >= 12) setShowConf(true); const a = setTimeout(() => setShowScore(false), 1500); const b = setTimeout(() => setShowConf(false), 2000); prevVC.current = voteCount; return () => { clearTimeout(a); clearTimeout(b) } }
    prevVC.current = voteCount;
  }, [voteCount, lastScore]);
  return (
    <div style={{ minHeight: "100vh", padding: "40px 32px", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <ScoreFlyIn score={lastScore} visible={showScore} />
      <ConfettiBurst active={showConf} />
      <div style={{ color: T.textMuted, fontFamily: "'Noto Sans TC'", fontSize: 22, marginBottom: 8, letterSpacing: 3 }}>主題：{topic}</div>
      <div style={{ color: T.textMuted, fontFamily: "'Noto Sans TC'", fontSize: 16, marginBottom: 16 }}>第 {currentIdx + 1}/{totalCount} 位說書人</div>
      <div style={{ fontSize: 80, marginBottom: 12 }}>{rep?.tableEmoji}</div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", color: T.goldLight, fontSize: 56, fontWeight: 700, margin: "0 0 4px 0" }}>{rep?.name}</h2>
      <p style={{ fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: 22, marginBottom: 32 }}>{rep?.tableName}桌代表</p>
      <StoryTimer duration={timerDuration} running={timerRunning} onTimeUp={onTimeUp} projector />
      {voteCount > 0 && <div style={{ marginTop: 24, fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 18, animation: "fadeSlideUp 0.3s ease" }}>已收到 {voteCount} 票</div>}
    </div>
  );
}

function ProjLeaderboard({ tableReps, roundScores, topic, round }) {
  const sorted = [...tableReps].sort((a, b) => (roundScores[b.id] || 0) - (roundScores[a.id] || 0));
  const mx = Math.max(...Object.values(roundScores), 1);
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <div style={{ minHeight: "100vh", padding: "40px 32px", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontSize: 64, marginBottom: 8, animation: "crownBounce 2s ease-in-out infinite" }}>🏆</div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", color: T.gold, fontSize: 48, marginBottom: 4 }}>{round === 1 ? "第一回合排行榜" : "最終排行榜"}</h2>
      <p style={{ fontFamily: "'Cormorant Garamond',serif", color: T.warm, fontSize: 24, fontStyle: "italic", marginBottom: 40, letterSpacing: 3 }}>主題：{topic}</p>
      <div style={{ width: "100%", maxWidth: 700 }}>
        {sorted.map((rep, i) => { const sc = roundScores[rep.id] || 0; return (
          <div key={rep.id} style={{ display: "flex", alignItems: "center", gap: 20, background: i === 0 ? "rgba(212,162,78,0.15)" : T.bgCard, borderRadius: 16, padding: "18px 28px", marginBottom: 12, border: `1px solid rgba(212,162,78,${i === 0 ? 0.4 : 0.1})`, animation: `slideInRight 0.5s ease ${i * 0.12}s both` }}>
            <span style={{ fontSize: 36, width: 44, textAlign: "center" }}>{i < 3 ? medals[i] : <span style={{ fontFamily: "'Playfair Display'", color: T.textMuted, fontSize: 24 }}>{i + 1}</span>}</span>
            <span style={{ fontSize: 32 }}>{rep.tableEmoji}</span>
            <div style={{ flex: 1 }}><div style={{ fontFamily: "'Noto Sans TC'", color: T.text, fontSize: 22, fontWeight: 600 }}>{rep.name}</div><div style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 15 }}>{rep.tableName}桌</div></div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 160, height: 10, borderRadius: 5, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}><div style={{ height: "100%", borderRadius: 5, background: `linear-gradient(90deg,${T.gold},${T.goldLight})`, width: `${(sc / mx) * 100}%`, animation: `barFill 1s ease ${i * 0.12 + 0.3}s both` }} /></div>
              <span style={{ fontFamily: "'Playfair Display'", color: T.goldLight, fontSize: 36, fontWeight: 700, minWidth: 50, textAlign: "right" }}>{sc}</span>
            </div>
          </div>
        ) })}
      </div>
    </div>
  );
}

function ProjSpin({ topics, round, spinTrigger, onResult }) {
  const canvasRef = useRef(null); const angleRef = useRef(0); const speedRef = useRef(0); const rafRef = useRef(null);
  const [spinning, setSpinning] = useState(false); const [result, setResult] = useState(null);
  const prevTrigger = useRef(0);
  const colors = ["#8B4513", "#A0522D", "#CD853F", "#D2691E", "#DEB887", "#B8860B"];
  const canvasSize = Math.min(520, typeof window !== "undefined" ? window.innerWidth - 80 : 520);
  const drawWheel = useCallback((angle) => {
    const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext("2d"); const size = canvas.width; const center = size / 2; const radius = center - 10; const sa = (2 * Math.PI) / topics.length;
    ctx.clearRect(0, 0, size, size);
    topics.forEach((topic, i) => { const s = angle + i * sa; const e = s + sa; ctx.beginPath(); ctx.moveTo(center, center); ctx.arc(center, center, radius, s, e); ctx.closePath(); ctx.fillStyle = colors[i % colors.length]; ctx.fill(); ctx.strokeStyle = "rgba(212,162,78,0.4)"; ctx.lineWidth = 2; ctx.stroke(); ctx.save(); ctx.translate(center, center); ctx.rotate(s + sa / 2); ctx.textAlign = "center"; ctx.fillStyle = "#f5efe6"; ctx.font = "bold 22px 'Noto Sans TC',sans-serif"; ctx.fillText(topic, radius * 0.6, 5); ctx.restore() });
    ctx.beginPath(); ctx.arc(center, center, 30, 0, 2 * Math.PI); ctx.fillStyle = T.gold; ctx.fill();
    ctx.beginPath(); ctx.arc(center, center, 25, 0, 2 * Math.PI); ctx.fillStyle = T.bg; ctx.fill();
    ctx.beginPath(); ctx.moveTo(center - 16, 6); ctx.lineTo(center + 16, 6); ctx.lineTo(center, 40); ctx.closePath(); ctx.fillStyle = T.gold; ctx.fill(); ctx.strokeStyle = T.bg; ctx.lineWidth = 2; ctx.stroke();
  }, [topics]);
  useEffect(() => { drawWheel(0) }, [drawWheel]);
  useEffect(() => {
    if (spinTrigger > prevTrigger.current && !spinning) {
      prevTrigger.current = spinTrigger; setSpinning(true); setResult(null);
      speedRef.current = 0.3 + Math.random() * 0.2; const dec = 0.0008 + Math.random() * 0.0005;
      let tc = 0;
      const animate = () => { angleRef.current += speedRef.current; speedRef.current -= dec; drawWheel(angleRef.current); tc++; if (tc % 3 === 0 && speedRef.current > 0.02) SFX.tick();
        if (speedRef.current > 0.001) { rafRef.current = requestAnimationFrame(animate) }
        else { setSpinning(false); SFX.result(); const sa = (2 * Math.PI) / topics.length; const pa = ((3 * Math.PI / 2 - angleRef.current) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI); const idx = Math.floor(pa / sa) % topics.length; const sel = topics[idx]; setResult(sel); if (onResult) onResult(sel) }
      }; rafRef.current = requestAnimationFrame(animate);
    }
  }, [spinTrigger]);
  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, []);
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1, padding: 40 }}>
      <div style={{ color: T.textMuted, fontFamily: "'Noto Sans TC'", fontSize: 20, marginBottom: 12, letterSpacing: 2 }}>{round === 1 ? "第一回合 · 輕鬆暖場" : "第二回合 · 深度故事"}</div>
      <canvas ref={canvasRef} width={canvasSize} height={canvasSize} style={{ borderRadius: "50%", boxShadow: "0 0 40px rgba(212,162,78,0.15)" }} />
      {result && <div style={{ marginTop: 20, textAlign: "center", animation: "fadeSlideUp 0.5s ease" }}><div style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 18 }}>本回合主題</div><div style={{ fontFamily: "'Playfair Display',serif", color: T.goldLight, fontSize: 48, fontWeight: 700, marginTop: 4 }}>{result}</div></div>}
      {spinning && <div style={{ marginTop: 20, fontFamily: "'Noto Sans TC'", color: T.amber, fontSize: 18 }}>命運之輪轉動中...</div>}
    </div>
  );
}

function ProjIntermission({ countdown }) {
  const mins = Math.floor(countdown / 60), secs = countdown % 60;
  const [dots] = useState(() => Array.from({ length: 30 }).map(() => ({ x: Math.random() * 100, y: Math.random() * 100, s: 0.5 + Math.random() * 2, d: 4 + Math.random() * 8 })));
  const phrases = ["喝一口酒 🍷", "聊聊剛才的故事", "認識隔壁桌的人", "為下一輪做準備"];
  const [phraseIdx, setPhraseIdx] = useState(0);
  useEffect(() => { const t = setInterval(() => setPhraseIdx(p => (p + 1) % phrases.length), 3000); return () => clearInterval(t) }, []);
  return (
    <div style={{ minHeight: "100vh", padding: 40, position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      {dots.map((d, i) => <div key={i} style={{ position: "absolute", left: `${d.x}%`, top: `${d.y}%`, width: d.s * 4, height: d.s * 4, borderRadius: "50%", background: T.gold, opacity: 0.12, animation: `float${i % 3} ${d.d}s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }} />)}
      <div style={{ fontSize: 120, marginBottom: 16, animation: "crownBounce 3s ease-in-out infinite" }}>🍷</div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", color: T.gold, fontSize: 64, marginBottom: 8, textShadow: "0 0 40px rgba(212,162,78,0.3)" }}>中場休息</h2>
      <p style={{ fontFamily: "'Cormorant Garamond',serif", color: T.warm, fontSize: 32, fontStyle: "italic", marginBottom: 40, letterSpacing: 4 }}>refill your glass, refresh your soul</p>
      <div style={{ fontFamily: "'Playfair Display',serif", color: T.goldLight, fontSize: 140, fontWeight: 700, textShadow: "0 0 60px rgba(212,162,78,0.4)" }}>{mins}:{secs.toString().padStart(2, "0")}</div>
      <div style={{ height: 40, overflow: "hidden", marginTop: 24 }}><div key={phraseIdx} style={{ fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: 24, animation: "fadeSlideUp 0.5s ease" }}>{phrases[phraseIdx]}</div></div>
    </div>
  );
}

function GospelView({ gospelContent, projector, onNext }) {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 300) }, []);
  const g = gospelContent || DEFAULT_GOSPEL;
  const cm = { text: T.text, warm: T.warm, goldLight: T.goldLight };
  return (
    <div style={{ minHeight: "100vh", padding: "40px 24px", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: show ? 1 : 0, transition: "all 1.5s ease" }}>
      <div style={{ width: 60, height: 1, background: `linear-gradient(90deg,transparent,${T.gold},transparent)`, marginBottom: 32 }} />
      <h2 style={{ fontFamily: "'Playfair Display',serif", color: T.gold, fontSize: projector ? "clamp(36px,8vw,64px)" : "clamp(24px,6vw,36px)", textAlign: "center", lineHeight: 1.4, marginBottom: 16 }}>{g.title}</h2>
      <p style={{ fontFamily: "'Cormorant Garamond',serif", color: T.warm, fontSize: projector ? 32 : 20, fontStyle: "italic", textAlign: "center", marginBottom: 32, letterSpacing: 2 }}>{g.subtitle}</p>
      <div style={{ background: T.bgCard, borderRadius: 16, padding: projector ? "48px 40px" : "32px 28px", maxWidth: projector ? 700 : 480, width: "100%", border: "1px solid rgba(212,162,78,0.2)", lineHeight: 2, fontSize: projector ? 22 : 16 }}>
        {g.paragraphs.map((p, i) => <p key={i} style={{ fontFamily: "'Noto Sans TC'", color: cm[p.color] || T.text, margin: i < g.paragraphs.length - 1 ? "0 0 16px 0" : "0", fontWeight: p.color === "goldLight" ? 500 : 400 }}>{p.text}</p>)}
      </div>
      {!projector && onNext && <GoldButton onClick={onNext} style={{ marginTop: 32 }}>繼續 →</GoldButton>}
    </div>
  );
}

function StoryRecapWall({ participants, tableCount, scores, projector }) {
  const tableReps = getTableReps(participants, tableCount);
  const sorted = [...tableReps].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));
  const medals = ["🥇", "🥈", "🥉"];
  const fs = projector ? { title: 48, sub: 20, card: 18, name: 22, emoji: 48 } : { title: 28, sub: 14, card: 14, name: 16, emoji: 36 };
  const demoStories = { "1001": "那年我在客戶面前把咖啡灑在筆電上，結果反而談成了最大的案子", "1003": "一個人背包旅行到冰島，暴風雪中被陌生人救了，後來成了我最好的朋友", "1005": "舞台上吉他弦斷了，我用剩下的五根弦完成了整首歌，全場起立鼓掌", "1007": "在紐約最孤獨的聖誕夜，收到一封來自台灣陌生人的手寫信", "1009": "三個孩子同時發燒的那個晚上，我在浴室裡哭完又笑著走出來", "1011": "聽完一個癌末病人的故事後，我決定辭掉高薪工作去當志工", "1013": "分手那天下著大雨，我在路邊淋了一小時，然後走進了一間教會", "1015": "第一次來這種活動，沒想到會哭，更沒想到會笑這麼多" };
  return (
    <div style={{ minHeight: "100vh", padding: projector ? "40px 32px" : "40px 20px", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontSize: projector ? 64 : 40, marginBottom: 8 }}>📖</div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", color: T.gold, fontSize: fs.title, marginBottom: 4, textAlign: "center" }}>今晚的故事牆</h2>
      <p style={{ fontFamily: "'Cormorant Garamond',serif", color: T.warm, fontSize: fs.sub, fontStyle: "italic", marginBottom: 32, letterSpacing: 2 }}>Stories worth remembering</p>
      <div style={{ width: "100%", maxWidth: projector ? 800 : 440, display: "grid", gridTemplateColumns: projector ? "1fr 1fr" : "1fr", gap: projector ? 16 : 12 }}>
        {sorted.map((rep, i) => { const sc = scores[rep.id] || 0; const story = demoStories[String(rep.id)] || "一個讓全場動容的真實故事..."; return (
          <div key={rep.id} style={{ background: T.bgCard, borderRadius: 16, padding: projector ? "24px 28px" : "20px 24px", border: `1px solid rgba(212,162,78,${i < 3 ? 0.3 : 0.1})`, animation: `fadeSlideUp 0.5s ease ${i * 0.08}s both`, position: "relative", overflow: "hidden" }}>
            {i < 3 && <div style={{ position: "absolute", top: 12, right: 14, fontSize: 20 }}>{medals[i]}</div>}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: fs.emoji }}>{rep.tableEmoji}</span>
              <div><div style={{ fontFamily: "'Noto Sans TC'", color: T.goldLight, fontSize: fs.name, fontWeight: 700 }}>{rep.name}</div><div style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 12 }}>{rep.tableName}桌代表{sc > 0 ? ` · ${sc} 分` : ""}</div></div>
            </div>
            <p style={{ fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: fs.card, lineHeight: 1.8, margin: 0, fontStyle: "italic" }}>「{story}」</p>
          </div>
        ) })}
      </div>
    </div>
  );
}

// ============ AWARD CEREMONY ============

function AwardCeremony({ tableReps, roundScores, round, awards, onNext, projector }) {
  const sorted = [...tableReps].sort((a, b) => (roundScores[b.id] || 0) - (roundScores[a.id] || 0));
  const top3 = sorted.slice(0, 3);
  const medals = ["🥇", "🥈", "🥉"];
  const [step, setStep] = useState(0);
  const fs = projector ? { t: 48, n: 28, s: 20, aw: 18 } : { t: 32, n: 20, s: 16, aw: 14 };
  const aw = awards || ["🏆 冠軍", "🥈 亞軍", "🥉 季軍"];

  const handleClick = () => {
    if (step < 3) { setStep(s => s + 1); SFX.fanfare(); }
    else if (step === 3) { setStep(4); }
    else { if (onNext) onNext(); }
  };
  const isRevealed = (rank) => step >= (3 - rank);

  if (step === 4) {
    const mx = Math.max(...Object.values(roundScores), 1);
    return (
      <div style={{ minHeight: "100vh", padding: projector ? "40px 32px" : "40px 20px", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontSize: projector ? 64 : 48, marginBottom: 8 }}>🏆</div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", color: T.gold, fontSize: fs.t, marginBottom: 4 }}>第 {round} 回合結果</h2>
        <p style={{ fontFamily: "'Cormorant Garamond',serif", color: T.warm, fontSize: fs.s, fontStyle: "italic", marginBottom: 32, letterSpacing: 2 }}>Final Standings</p>
        <div style={{ width: "100%", maxWidth: projector ? 700 : 440 }}>
          {sorted.map((rep, i) => { const sc = roundScores[rep.id] || 0; return (
            <div key={rep.id} style={{ display: "flex", alignItems: "center", gap: projector ? 20 : 14, background: i === 0 ? "rgba(212,162,78,0.12)" : T.bgCard, borderRadius: projector ? 16 : 12, padding: projector ? "18px 28px" : "14px 18px", marginBottom: projector ? 12 : 10, border: `1px solid rgba(212,162,78,${i === 0 ? 0.35 : 0.1})`, animation: `slideInRight 0.4s ease ${i * 0.1}s both` }}>
              <span style={{ fontSize: projector ? 36 : 24, width: projector ? 44 : 32, textAlign: "center" }}>{i < 3 ? medals[i] : <span style={{ fontFamily: "'Playfair Display'", color: T.textMuted, fontSize: projector ? 24 : 16 }}>{i + 1}</span>}</span>
              <span style={{ fontSize: projector ? 32 : 20 }}>{rep.tableEmoji}</span>
              <div style={{ flex: 1 }}><div style={{ fontFamily: "'Noto Sans TC'", color: T.text, fontSize: projector ? 22 : 15, fontWeight: 600 }}>{rep.name}</div><div style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 12 }}>{rep.tableName}桌</div></div>
              <div style={{ display: "flex", alignItems: "center", gap: projector ? 16 : 8 }}>
                <div style={{ width: projector ? 160 : 80, height: projector ? 10 : 6, borderRadius: 5, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}><div style={{ height: "100%", borderRadius: 5, background: `linear-gradient(90deg,${T.gold},${T.goldLight})`, width: `${(sc / mx) * 100}%`, animation: `barFill 1s ease ${i * 0.1 + 0.2}s both` }} /></div>
                <span style={{ fontFamily: "'Playfair Display'", color: T.goldLight, fontSize: projector ? 36 : 20, fontWeight: 700, minWidth: projector ? 50 : 30, textAlign: "right" }}>{sc}</span>
              </div>
            </div>
          ) })}
        </div>
        {!projector && <GoldButton onClick={handleClick} style={{ marginTop: 24 }}>{onNext ? "繼續 →" : "完成"}</GoldButton>}
      </div>
    );
  }

  const btnLabel = step === 0 ? "揭曉第三名 🥉" : step === 1 ? "揭曉第二名 🥈" : step === 2 ? "揭曉第一名 🥇" : "查看完整排名 📊";
  return (
    <div style={{ minHeight: "100vh", padding: projector ? "40px 32px" : "40px 20px", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <h2 style={{ fontFamily: "'Playfair Display',serif", color: T.gold, fontSize: fs.t, marginBottom: 4, textAlign: "center" }}>🏆 第 {round} 回合頒獎</h2>
      <p style={{ fontFamily: "'Cormorant Garamond',serif", color: T.warm, fontSize: fs.s, fontStyle: "italic", marginBottom: 40, letterSpacing: 2 }}>And the winners are...</p>
      <div style={{ display: "flex", gap: projector ? 24 : 16, alignItems: "flex-end", justifyContent: "center", marginBottom: 40 }}>
        {[2, 0, 1].map(rank => { const rep = top3[rank]; if (!rep) return null; const sc = roundScores[rep.id] || 0; const isGold = rank === 0; const show = isRevealed(rank);
          return (
            <div key={rank} style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: show ? 1 : 0.15, transform: show ? "translateY(0) scale(1)" : "translateY(20px) scale(0.9)", transition: "all 0.8s cubic-bezier(0.34,1.56,0.64,1)", width: projector ? 180 : 110 }}>
              <div style={{ fontSize: projector ? 48 : 32, marginBottom: 8, opacity: show ? 1 : 0, transition: "opacity 0.5s ease", animation: show && isGold ? "crownBounce 2s ease-in-out infinite" : "none" }}>{medals[rank]}</div>
              <div style={{ background: show ? (isGold ? "rgba(212,162,78,0.2)" : T.bgCard) : "rgba(255,255,255,0.02)", borderRadius: 16, padding: projector ? "20px 16px" : "14px 12px", width: "100%", textAlign: "center", border: `2px solid ${show ? (isGold ? T.gold : "rgba(212,162,78,0.3)") : "rgba(212,162,78,0.05)"}`, transition: "all 0.5s ease" }}>
                {show ? <>
                  <div style={{ fontSize: projector ? 40 : 28, animation: "awardReveal 0.6s ease" }}>{rep.tableEmoji}</div>
                  <div style={{ fontFamily: "'Playfair Display',serif", color: T.goldLight, fontSize: fs.n, fontWeight: 700, marginTop: 8, animation: "fadeSlideUp 0.5s ease 0.2s both" }}>{rep.name}</div>
                  <div style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 12, marginTop: 4 }}>{rep.tableName}桌</div>
                  <div style={{ fontFamily: "'Playfair Display'", color: isGold ? T.gold : T.warm, fontSize: projector ? 32 : 22, fontWeight: 700, marginTop: 8 }}>{sc} 分</div>
                  {aw[rank] && <div style={{ fontFamily: "'Noto Sans TC'", color: T.goldLight, fontSize: fs.aw, fontWeight: 600, marginTop: 8, padding: "4px 12px", background: "rgba(212,162,78,0.1)", borderRadius: 8, animation: "fadeSlideUp 0.5s ease 0.4s both" }}>{aw[rank]}</div>}
                </> : <>
                  <div style={{ fontSize: projector ? 40 : 28, opacity: 0.3 }}>❓</div>
                  <div style={{ fontFamily: "'Playfair Display',serif", color: T.textMuted, fontSize: fs.n, fontWeight: 700, marginTop: 8 }}>???</div>
                  <div style={{ fontFamily: "'Noto Sans TC'", color: "rgba(245,239,230,0.2)", fontSize: 12, marginTop: 4 }}>即將揭曉</div>
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

// ============ HOST PHONE VIEWS ============

function PhoneSpinView({ round, topics, topic, timerDuration, setTimerDuration, onSpinWheel, onResult, onStart }) {
  const canvasRef = useRef(null); const angleRef = useRef(0); const speedRef = useRef(0); const rafRef = useRef(null);
  const [spinning, setSpinning] = useState(false); const [result, setResult] = useState(null);
  const colors = ["#8B4513", "#A0522D", "#CD853F", "#D2691E", "#DEB887", "#B8860B"];
  const cSize = Math.min(340, typeof window !== "undefined" ? window.innerWidth - 60 : 340);
  const drawWheel = useCallback((angle) => { const c = canvasRef.current; if (!c) return; const ctx = c.getContext("2d"); const s = c.width; const ctr = s / 2; const r = ctr - 10; const sa = (2 * Math.PI) / topics.length; ctx.clearRect(0, 0, s, s); topics.forEach((t, i) => { const st = angle + i * sa; const en = st + sa; ctx.beginPath(); ctx.moveTo(ctr, ctr); ctx.arc(ctr, ctr, r, st, en); ctx.closePath(); ctx.fillStyle = colors[i % colors.length]; ctx.fill(); ctx.strokeStyle = "rgba(212,162,78,0.4)"; ctx.lineWidth = 2; ctx.stroke(); ctx.save(); ctx.translate(ctr, ctr); ctx.rotate(st + sa / 2); ctx.textAlign = "center"; ctx.fillStyle = "#f5efe6"; ctx.font = `bold ${s < 300 ? 12 : 15}px 'Noto Sans TC',sans-serif`; ctx.fillText(t, r * 0.6, 5); ctx.restore() }); ctx.beginPath(); ctx.arc(ctr, ctr, 22, 0, 2 * Math.PI); ctx.fillStyle = T.gold; ctx.fill(); ctx.beginPath(); ctx.arc(ctr, ctr, 18, 0, 2 * Math.PI); ctx.fillStyle = T.bg; ctx.fill(); ctx.beginPath(); ctx.moveTo(ctr - 12, 6); ctx.lineTo(ctr + 12, 6); ctx.lineTo(ctr, 30); ctx.closePath(); ctx.fillStyle = T.gold; ctx.fill(); ctx.strokeStyle = T.bg; ctx.lineWidth = 2; ctx.stroke() }, [topics]);
  useEffect(() => { drawWheel(0) }, [drawWheel]);
  const tickRef = useRef(0);
  const spin = () => { if (spinning) return; setSpinning(true); setResult(null); speedRef.current = 0.3 + Math.random() * 0.2; const dec = 0.0008 + Math.random() * 0.0005; if (onSpinWheel) onSpinWheel(); tickRef.current = 0; const animate = () => { angleRef.current += speedRef.current; speedRef.current -= dec; drawWheel(angleRef.current); tickRef.current++; if (tickRef.current % 3 === 0 && speedRef.current > 0.02) SFX.tick(); if (speedRef.current > 0.001) { rafRef.current = requestAnimationFrame(animate) } else { setSpinning(false); SFX.result(); const sa = (2 * Math.PI) / topics.length; const pa = ((3 * Math.PI / 2 - angleRef.current) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI); const idx = Math.floor(pa / sa) % topics.length; const sel = topics[idx]; setResult(sel); if (onResult) onResult(sel) } }; rafRef.current = requestAnimationFrame(animate) };
  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, []);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h2 style={{ fontFamily: "'Playfair Display',serif", color: T.gold, fontSize: 28, marginBottom: 4 }}>{round === 1 ? "第一回合" : "第二回合"}</h2>
      <p style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 14, marginBottom: 28 }}>轉動轉盤，決定今晚的故事主題</p>
      <canvas ref={canvasRef} width={cSize} height={cSize} style={{ borderRadius: "50%", boxShadow: "0 0 40px rgba(212,162,78,0.15)" }} />
      {result && <div style={{ marginTop: 20, textAlign: "center", animation: "fadeSlideUp 0.5s ease" }}><div style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 13 }}>本回合主題</div><div style={{ fontFamily: "'Playfair Display',serif", color: T.goldLight, fontSize: 26, fontWeight: 700, marginTop: 4 }}>{result}</div></div>}
      <GoldButton onClick={spin} disabled={spinning} style={{ marginTop: 20 }}>{spinning ? "轉動中..." : "🎰 轉動命運之輪"}</GoldButton>
      {topic && <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 12, background: T.bgCard, borderRadius: 12, padding: "12px 20px", border: "1px solid rgba(212,162,78,0.15)" }}>
        <span style={{ fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: 13 }}>說書限時</span>
        {[120, 180, 240].map(s => <button key={s} onClick={() => setTimerDuration(s)} style={{ background: timerDuration === s ? T.gold : "transparent", color: timerDuration === s ? T.bg : T.textMuted, border: `1px solid ${timerDuration === s ? T.gold : "rgba(212,162,78,0.3)"}`, borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontFamily: "'Noto Sans TC'", fontSize: 13, fontWeight: 600, transition: "all 0.2s" }}>{s / 60} 分鐘</button>)}
      </div>}
      {topic && <GoldButton onClick={onStart} style={{ marginTop: 20 }}>開始故事比賽 →</GoldButton>}
    </div>
  );
}

function PhoneStoryRound({ round, participants, tableCount, scores, setScores, onFinish, onSpinWheel, onTopicSet, onPhaseChange, onTimerState, onStoryteller, onVoteData }) {
  const [phase, setPhase] = useState("spin");
  const [topic, setTopic] = useState("");
  const [cur, setCur] = useState(0);
  const [voting, setVoting] = useState({ story: 3, expression: 3, resonance: 3 });
  const [roundScores, setRoundScores] = useState({});
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDuration, setTimerDuration] = useState(180);
  const [timerKey, setTimerKey] = useState(0);
  const [showSA, setShowSA] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const [voteCount, setVoteCount] = useState(0);
  const topics = ALL_TOPICS[(round - 1) % ALL_TOPICS.length];
  const tableReps = getTableReps(participants, tableCount);

  useEffect(() => { if (onPhaseChange) onPhaseChange(phase) }, [phase]);
  useEffect(() => { if (onTimerState) onTimerState({ running: timerRunning, duration: timerDuration, key: timerKey }) }, [timerRunning, timerDuration, timerKey]);
  useEffect(() => { if (onStoryteller) onStoryteller({ idx: cur, rep: tableReps[cur], total: tableReps.length }) }, [cur, tableReps.length]);
  useEffect(() => { if (onVoteData) onVoteData({ voteCount, lastScore, roundScores, tableReps }) }, [voteCount, lastScore, roundScores]);
  useEffect(() => { if (onTopicSet) onTopicSet(topic) }, [topic]);

  const handleSpinResult = (t) => { setTopic(t) };
  const startStorytelling = () => { setPhase("storytelling"); setTimerRunning(true); setTimerKey(k => k + 1); if (onSpinWheel) onSpinWheel() };
  const submitVote = () => {
    const rep = tableReps[cur]; const total = voting.story + voting.expression + voting.resonance;
    setLastScore(total); setVoteCount(v => v + 1); SFX.vote(); setShowSA(true); if (total >= 12) { setShowConf(true); SFX.fanfare() }
    setTimeout(() => { setShowSA(false); setShowConf(false) }, 2000);
    const newRS = { ...roundScores, [rep.id]: (roundScores[rep.id] || 0) + total }; setRoundScores(newRS);
    if (cur < tableReps.length - 1) { setTimeout(() => { setCur(p => p + 1); setVoting({ story: 3, expression: 3, resonance: 3 }); setTimerRunning(true); setTimerKey(k => k + 1); setVoteCount(0) }, 1800) }
    else { setTimeout(() => { setScores(prev => { const m = { ...prev }; Object.entries(newRS).forEach(([id, sc]) => { m[id] = (m[id] || 0) + sc }); return m }); onFinish() }, 1800) }
  };

  if (phase === "spin") return <PhoneSpinView round={round} topics={topics} topic={topic} timerDuration={timerDuration} setTimerDuration={setTimerDuration} onSpinWheel={onSpinWheel} onResult={handleSpinResult} onStart={startStorytelling} />;

  if (phase === "storytelling") {
    const rep = tableReps[cur];
    if (!rep) return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 40 }}><div style={{ fontSize: 48, marginBottom: 16 }}>🍷</div><h3 style={{ fontFamily: "'Noto Sans TC'", color: T.gold, fontSize: 20 }}>還沒有人簽到入座</h3></div>;
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <ScoreFlyIn score={lastScore} visible={showSA} /><ConfettiBurst active={showConf} />
        <div style={{ width: "100%", maxWidth: 400, height: 4, borderRadius: 2, background: "rgba(212,162,78,0.15)", marginBottom: 16 }}><div style={{ height: "100%", borderRadius: 2, background: `linear-gradient(90deg,${T.gold},${T.goldLight})`, width: `${((cur + 1) / tableReps.length) * 100}%`, transition: "width 0.5s ease" }} /></div>
        <div style={{ color: T.textMuted, fontFamily: "'Noto Sans TC'", fontSize: 13, marginBottom: 8 }}>主題：{topic}</div>
        <div style={{ background: T.bgCard, borderRadius: 16, padding: "20px 24px", width: "100%", maxWidth: 400, textAlign: "center", border: "1px solid rgba(212,162,78,0.2)", marginBottom: 16, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ flex: 1 }}><div style={{ color: T.warm, fontFamily: "'Noto Sans TC'", fontSize: 12, fontWeight: 500 }}>第 {cur + 1}/{tableReps.length} 位</div><div style={{ fontSize: 32, margin: "4px 0" }}>{rep?.tableEmoji}</div><div style={{ fontFamily: "'Playfair Display',serif", color: T.goldLight, fontSize: 20, fontWeight: 700 }}>{rep?.name}</div><div style={{ color: T.textMuted, fontFamily: "'Noto Sans TC'", fontSize: 12 }}>{rep?.tableName}桌代表</div></div>
          <StoryTimer key={timerKey} duration={timerDuration} running={timerRunning} onTimeUp={() => setTimerRunning(false)} />
        </div>
        <div style={{ background: T.bgCard, borderRadius: 16, padding: 24, width: "100%", maxWidth: 400, border: "1px solid rgba(212,162,78,0.15)", marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Noto Sans TC'", color: T.gold, fontSize: 16, fontWeight: 600, margin: "0 0 16px 0", textAlign: "center" }}>為這個故事打分</h3>
          {[{ k: "story", l: "📖 故事精彩度" }, { k: "expression", l: "🎭 表達感染力" }, { k: "resonance", l: "💝 共鳴度" }].map(({ k, l }) => (
            <div key={k} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}><span style={{ fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: 14 }}>{l}</span><span style={{ fontFamily: "'Playfair Display'", color: T.goldLight, fontSize: 20, fontWeight: 700 }}>{voting[k]}</span></div>
              <div style={{ display: "flex", gap: 6 }}>{[1, 2, 3, 4, 5].map(v => <button key={v} onClick={() => setVoting(p => ({ ...p, [k]: v }))} style={{ flex: 1, height: 40, borderRadius: 8, border: "none", background: v <= voting[k] ? `linear-gradient(135deg,${T.gold},${T.amber})` : "rgba(255,255,255,0.05)", color: v <= voting[k] ? T.bg : T.textMuted, fontSize: 16, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", fontFamily: "'Noto Sans TC'" }}>{v}</button>)}</div>
            </div>
          ))}
          <div style={{ textAlign: "center", marginTop: 8, paddingTop: 12, borderTop: "1px solid rgba(212,162,78,0.15)" }}><span style={{ color: T.textMuted, fontFamily: "'Noto Sans TC'", fontSize: 13 }}>總分：</span><span style={{ fontFamily: "'Playfair Display'", color: T.goldLight, fontSize: 28, fontWeight: 700, marginLeft: 8 }}>{voting.story + voting.expression + voting.resonance}</span><span style={{ color: T.textMuted, fontFamily: "'Noto Sans TC'", fontSize: 13 }}> / 15</span></div>
        </div>
        <GoldButton onClick={submitVote}>{cur < tableReps.length - 1 ? "送出評分，下一位 →" : "送出最後評分 🏆"}</GoldButton>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
      <div style={{ fontSize: 64, animation: "crownBounce 1s ease-in-out infinite" }}>🏆</div>
      <p style={{ fontFamily: "'Noto Sans TC'", color: T.gold, fontSize: 18, marginTop: 16 }}>準備頒獎...</p>
    </div>
  );
}

// ============ EVENT SETUP ============

function EventSetupScreen({ onEventCreated, config, setConfig }) {
  const [creating, setCreating] = useState(false);
  const [eventData, setEventData] = useState(null);
  const is = { width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212,162,78,0.2)", borderRadius: 8, padding: "12px 16px", color: T.text, fontFamily: "'Noto Sans TC'", fontSize: 16, outline: "none" };
  const labelStyle = { fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 };
  const sectionStyle = { background: T.bgCard, borderRadius: 16, padding: 24, width: "100%", maxWidth: 500, border: "1px solid rgba(212,162,78,0.15)", marginBottom: 16 };
  const chipBtn = (active) => ({ flex: 1, background: active ? T.gold : "transparent", color: active ? T.bg : T.textMuted, border: `1px solid ${active ? T.gold : "rgba(212,162,78,0.3)"}`, borderRadius: 8, padding: "10px", cursor: "pointer", fontFamily: "'Noto Sans TC'", fontSize: 15, fontWeight: 600, transition: "all 0.2s" });

  const createEvent = async () => {
    setCreating(true);
    if (API_URL) {
      try { const resp = await fetch(`${API_URL}/api/events`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: config.eventName, table_count: config.tableCount }) }); const data = await resp.json(); setEventData(data); } catch (err) { console.error(err); setEventData({ id: 1, name: config.eventName, demo: true }) }
    } else { setEventData({ id: 1, name: config.eventName, demo: true }); }
    setCreating(false);
  };

  const eventUrl = eventData ? (API_URL ? `${window.location.origin}?event=${eventData.id}` : `${window.location.origin}`) : "";

  if (eventData) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", color: T.gold, fontSize: 28, marginBottom: 4 }}>活動已建立</h2>
      <p style={{ fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: 16, marginBottom: 8 }}>{eventData.name}</p>
      <div style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 13, marginBottom: 24, textAlign: "center", lineHeight: 1.8 }}>
        {config.tableCount} 桌 · {config.totalRounds} 回合 · 每人 {config.timerDuration / 60} 分鐘
      </div>
      <div style={{ background: T.bgCard, borderRadius: 16, padding: 28, width: "100%", maxWidth: 400, border: "1px solid rgba(212,162,78,0.2)", textAlign: "center", marginBottom: 24 }}>
        <p style={{ fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: 14, marginBottom: 16 }}>📱 讓參加者掃描此 QR Code 加入活動</p>
        <QRCodeDisplay url={eventUrl} size={220} />
      </div>
      <GoldButton onClick={() => onEventCreated(eventData)}>進入活動控台 →</GoldButton>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 8 }}>🍷</div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", color: T.gold, fontSize: 28, marginBottom: 4 }}>建立今晚的活動</h2>
      <p style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 14, marginBottom: 32 }}>設定完成後會產生 QR Code 讓參加者加入</p>

      {/* 活動名稱 */}
      <div style={sectionStyle}>
        <div style={{ fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>📋 基本資訊</div>
        <label style={labelStyle}>活動名稱</label>
        <input value={config.eventName} onChange={e => setConfig(p => ({ ...p, eventName: e.target.value }))} placeholder="故事之夜 Vol.1" style={is} onFocus={e => e.target.style.borderColor = T.gold} onBlur={e => e.target.style.borderColor = "rgba(212,162,78,0.2)"} />
      </div>

      {/* 桌數 */}
      <div style={sectionStyle}>
        <div style={{ fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>🪑 桌數設定</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {[4, 5, 6, 7, 8, 9, 10].map(n => (
            <button key={n} onClick={() => setConfig(p => ({ ...p, tableCount: n }))} style={{ ...chipBtn(config.tableCount === n), flex: "0 0 auto", padding: "8px 14px", fontSize: 14 }}>{n}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 12 }}>自訂：</span>
          <input type="number" min={2} max={20} value={config.tableCount} onChange={e => { const v = parseInt(e.target.value); if (v >= 2 && v <= 20) setConfig(p => ({ ...p, tableCount: v })); }} style={{ ...is, width: 80, textAlign: "center", padding: "8px 12px" }} />
          <span style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 12 }}>桌（2~20）</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
          {Array.from({ length: config.tableCount }).map((_, i) => (
            <div key={i} style={{ background: "rgba(212,162,78,0.08)", borderRadius: 8, padding: "4px 10px", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 14 }}>{TABLE_EMOJIS[i] || "🍷"}</span>
              <span style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 11 }}>{TABLES[i] || `第${i + 1}桌`}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 回合數 */}
      <div style={sectionStyle}>
        <div style={{ fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>🎯 比賽回合數</div>
        <div style={{ display: "flex", gap: 8 }}>
          {[1, 2, 3].map(n => (
            <button key={n} onClick={() => setConfig(p => ({ ...p, totalRounds: n }))} style={chipBtn(config.totalRounds === n)}>{n} 回合</button>
          ))}
        </div>
        <p style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 12, marginTop: 8 }}>
          {config.totalRounds === 1 ? "單回合：適合小型聚會" : config.totalRounds === 2 ? "雙回合：暖場 + 深度故事，推薦！" : "三回合：完整賽制，適合大型活動"}
        </p>
      </div>

      {/* 說書時間 */}
      <div style={sectionStyle}>
        <div style={{ fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>⏱️ 每人說書時間</div>
        <div style={{ display: "flex", gap: 8 }}>
          {[90, 120, 180, 240, 300].map(s => (
            <button key={s} onClick={() => setConfig(p => ({ ...p, timerDuration: s }))} style={chipBtn(config.timerDuration === s)}>
              {s >= 60 ? `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}` : `${s}秒`}
            </button>
          ))}
        </div>
      </div>

      {/* 主題選項 */}
      <div style={sectionStyle}>
        <div style={{ fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>🎲 各回合主題池</div>
        {Array.from({ length: config.totalRounds }).map((_, ri) => (
          <div key={ri} style={{ marginBottom: ri < config.totalRounds - 1 ? 16 : 0 }}>
            <div style={{ fontFamily: "'Noto Sans TC'", color: T.goldLight, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>第 {ri + 1} 回合</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {(ALL_TOPICS[ri] || ALL_TOPICS[0]).map((t, ti) => (
                <span key={ti} style={{ background: "rgba(212,162,78,0.1)", border: "1px solid rgba(212,162,78,0.2)", borderRadius: 16, padding: "4px 12px", fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: 12 }}>{t}</span>
              ))}
            </div>
          </div>
        ))}
        <p style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 11, marginTop: 8 }}>主題會在比賽開始時由轉盤隨機選出，可在「進階設定」中自訂</p>
      </div>

      {/* 中場休息 */}
      {config.totalRounds > 1 && (
        <div style={sectionStyle}>
          <div style={{ fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>☕ 中場休息時間</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[180, 300, 600].map(s => (
              <button key={s} onClick={() => setConfig(p => ({ ...p, intermissionDuration: s }))} style={chipBtn(config.intermissionDuration === s)}>
                {Math.floor(s / 60)} 分鐘
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 建立按鈕 */}
      <div style={{ width: "100%", maxWidth: 500, marginTop: 8 }}>
        <div style={{ background: "rgba(212,162,78,0.05)", borderRadius: 12, padding: "16px 20px", marginBottom: 16, border: "1px solid rgba(212,162,78,0.1)" }}>
          <div style={{ fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>📊 活動摘要</div>
          <div style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 12, lineHeight: 2 }}>
            活動：{config.eventName || "（未命名）"}<br />
            桌數：{config.tableCount} 桌<br />
            回合：{config.totalRounds} 回合<br />
            每人時間：{config.timerDuration >= 60 ? `${Math.floor(config.timerDuration / 60)} 分 ${config.timerDuration % 60 > 0 ? `${config.timerDuration % 60} 秒` : ""}` : `${config.timerDuration} 秒`}<br />
            {config.totalRounds > 1 && <>中場休息：{Math.floor(config.intermissionDuration / 60)} 分鐘<br /></>}
            預估總時長：約 {Math.round((config.tableCount * config.timerDuration * config.totalRounds + (config.totalRounds > 1 ? config.intermissionDuration * (config.totalRounds - 1) : 0)) / 60)} 分鐘
          </div>
        </div>
        <GoldButton onClick={createEvent} disabled={!config.eventName.trim() || creating} style={{ width: "100%" }}>{creating ? "建立中..." : "🎲 建立活動 & 產生 QR Code"}</GoldButton>
      </div>
    </div>
  );
}

// ============ CHECK-IN MANAGEMENT ============

function CheckInManagement({ participants, setParticipants, tableCount, setTableCount }) {
  const [name, setName] = useState(""); const [oneLiner, setOneLiner] = useState(""); const [assigned, setAssigned] = useState(null);
  const handleCheckIn = () => { if (!name.trim()) return; const ti = participants.length % tableCount; const p = { id: Date.now(), name: name.trim(), oneLiner: oneLiner.trim(), table: ti }; setParticipants(prev => [...prev, p]); setAssigned(p); setName(""); setOneLiner("") };
  const is = { width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212,162,78,0.2)", borderRadius: 8, padding: "12px 16px", color: T.text, fontFamily: "'Noto Sans TC'", fontSize: 16, outline: "none" };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h2 style={{ fontFamily: "'Playfair Display',serif", color: T.gold, fontSize: 28, marginBottom: 4 }}>簽到管理</h2>
      <p style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 14, marginBottom: 24 }}>已報到 {participants.length} 人</p>
      <div style={{ background: T.bgCard, borderRadius: 12, padding: "16px 24px", marginBottom: 24, border: "1px solid rgba(212,162,78,0.15)", display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ color: T.warm, fontFamily: "'Noto Sans TC'", fontSize: 14 }}>桌數</span>
        {[6, 8, 10].map(n => <button key={n} onClick={() => setTableCount(n)} style={{ background: tableCount === n ? T.gold : "transparent", color: tableCount === n ? T.bg : T.textMuted, border: `1px solid ${tableCount === n ? T.gold : "rgba(212,162,78,0.3)"}`, borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontFamily: "'Noto Sans TC'", fontSize: 14, fontWeight: 600, transition: "all 0.2s" }}>{n} 桌</button>)}
      </div>
      <div style={{ background: T.bgCard, borderRadius: 16, padding: 28, width: "100%", maxWidth: 400, border: "1px solid rgba(212,162,78,0.15)", marginBottom: 24 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="參加者名字" style={{ ...is, marginBottom: 12 }} onFocus={e => e.target.style.borderColor = T.gold} onBlur={e => e.target.style.borderColor = "rgba(212,162,78,0.2)"} />
        <input value={oneLiner} onChange={e => setOneLiner(e.target.value)} placeholder="一句話介紹（選填）" style={{ ...is, marginBottom: 20 }} onFocus={e => e.target.style.borderColor = T.gold} onBlur={e => e.target.style.borderColor = "rgba(212,162,78,0.2)"} />
        <GoldButton onClick={handleCheckIn} disabled={!name.trim()} style={{ width: "100%" }}>🎲 分配酒桌</GoldButton>
      </div>
      {assigned && <div style={{ background: "rgba(212,162,78,0.1)", borderRadius: 16, padding: 20, width: "100%", maxWidth: 400, textAlign: "center", border: "1px solid rgba(212,162,78,0.3)", animation: "fadeSlideUp 0.5s ease", marginBottom: 24 }}><div style={{ fontSize: 36, marginBottom: 4 }}>{TABLE_EMOJIS[assigned.table]}</div><div style={{ fontFamily: "'Noto Sans TC'", color: T.goldLight, fontSize: 16, fontWeight: 700 }}>{assigned.name} → {TABLES[assigned.table]}桌</div></div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 12, width: "100%", maxWidth: 600 }}>
        {Array.from({ length: tableCount }).map((_, i) => { const c = participants.filter(p => p.table === i); return <div key={i} style={{ background: T.bgCard, borderRadius: 10, padding: "14px 12px", border: `1px solid rgba(212,162,78,${c.length > 0 ? 0.25 : 0.08})`, textAlign: "center" }}><div style={{ fontSize: 24 }}>{TABLE_EMOJIS[i]}</div><div style={{ fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: 13, fontWeight: 600, marginTop: 4 }}>{TABLES[i]}桌</div><div style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 12 }}>{c.length} 人</div>{c.map(p => <div key={p.id} style={{ fontFamily: "'Noto Sans TC'", color: T.text, fontSize: 11, marginTop: 2 }}>{p.name}</div>)}</div> })}
      </div>
    </div>
  );
}

// ============ INTERMISSION CONTROL ============

function IntermissionControl({ onNext }) {
  const [cd, setCd] = useState(300);
  useEffect(() => { const t = setInterval(() => setCd(p => (p > 0 ? p - 1 : 0)), 1000); return () => clearInterval(t) }, []);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
      <div style={{ fontSize: 64, marginBottom: 16, animation: "crownBounce 3s ease-in-out infinite" }}>🍷</div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", color: T.gold, fontSize: 32, marginBottom: 8 }}>中場休息</h2>
      <div style={{ fontFamily: "'Playfair Display',serif", color: T.goldLight, fontSize: 64, fontWeight: 700, marginBottom: 24 }}>{Math.floor(cd / 60)}:{(cd % 60).toString().padStart(2, "0")}</div>
      <GoldButton onClick={onNext}>開始下一回合 →</GoldButton>
    </div>
  );
}

// ============ FOLLOW-UP MANAGEMENT ============

function FollowUpManagement({ followUps, setFollowUps }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const is = { width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212,162,78,0.2)", borderRadius: 8, padding: "10px 14px", color: T.text, fontFamily: "'Noto Sans TC'", fontSize: 14, outline: "none" };

  const filtered = followUps.filter(f => {
    if (filter === "contacted" && !f.contacted) return false;
    if (filter === "pending" && f.contacted) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !(f.table || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleContacted = (id) => {
    setFollowUps(prev => prev.map(f => f.id === id ? { ...f, contacted: !f.contacted } : f));
  };

  const addNote = (id, note) => {
    setFollowUps(prev => prev.map(f => f.id === id ? { ...f, notes: note } : f));
  };

  const exportCSV = () => {
    const headers = ["姓名", "桌別", "手機", "IG", "LINE", "興趣", "回饋", "已聯繫", "備註"];
    const rows = followUps.map(f => [f.name, f.table || "", f.phone || "", f.ig || "", f.line || "", (f.interests || []).join("; "), f.feedback || "", f.contacted ? "是" : "否", f.notes || ""]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${(c || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `follow-ups-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const stats = { total: followUps.length, contacted: followUps.filter(f => f.contacted).length, pending: followUps.filter(f => !f.contacted).length };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h2 style={{ fontFamily: "'Playfair Display',serif", color: T.gold, fontSize: 28, marginBottom: 4 }}>跟進管理</h2>
      <p style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 14, marginBottom: 24 }}>查看與管理所有參與者的跟進表單</p>

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, width: "100%", maxWidth: 600 }}>
        {[{ label: "總提交", value: stats.total, color: T.gold }, { label: "已聯繫", value: stats.contacted, color: T.green }, { label: "待跟進", value: stats.pending, color: T.amber }].map(s => (
          <div key={s.label} style={{ flex: 1, background: T.bgCard, borderRadius: 12, padding: "14px 16px", textAlign: "center", border: "1px solid rgba(212,162,78,0.15)" }}>
            <div style={{ fontFamily: "'Playfair Display'", color: s.color, fontSize: 28, fontWeight: 700 }}>{s.value}</div>
            <div style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 12 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div style={{ display: "flex", gap: 8, width: "100%", maxWidth: 600, marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜尋姓名或桌別..." style={{ ...is, flex: 1 }} onFocus={e => e.target.style.borderColor = T.gold} onBlur={e => e.target.style.borderColor = "rgba(212,162,78,0.2)"} />
        {["all", "pending", "contacted"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? T.gold : "transparent", color: filter === f ? T.bg : T.textMuted, border: `1px solid ${filter === f ? T.gold : "rgba(212,162,78,0.3)"}`, borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontFamily: "'Noto Sans TC'", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
            {f === "all" ? "全部" : f === "pending" ? "待跟進" : "已聯繫"}
          </button>
        ))}
      </div>

      {/* Export */}
      <div style={{ width: "100%", maxWidth: 600, marginBottom: 16, textAlign: "right" }}>
        <button onClick={exportCSV} disabled={followUps.length === 0} style={{ background: "transparent", border: "1px solid rgba(212,162,78,0.3)", borderRadius: 8, padding: "6px 14px", color: T.warm, fontFamily: "'Noto Sans TC'", fontSize: 12, cursor: followUps.length > 0 ? "pointer" : "not-allowed", opacity: followUps.length > 0 ? 1 : 0.4 }}>📥 匯出 CSV</button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ background: T.bgCard, borderRadius: 16, padding: 40, width: "100%", maxWidth: 600, textAlign: "center", border: "1px solid rgba(212,162,78,0.1)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{followUps.length === 0 ? "📋" : "🔍"}</div>
          <p style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 14 }}>
            {followUps.length === 0 ? "尚未收到任何跟進表單" : "沒有符合條件的結果"}
          </p>
          {followUps.length === 0 && <p style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 12, marginTop: 8 }}>當參與者在前台提交跟進表單後，資料會顯示在這裡</p>}
        </div>
      ) : (
        <div style={{ width: "100%", maxWidth: 600, display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(f => {
            const expanded = expandedId === f.id;
            return (
              <div key={f.id} style={{ background: T.bgCard, borderRadius: 12, border: `1px solid rgba(212,162,78,${f.contacted ? 0.1 : 0.25})`, overflow: "hidden", transition: "all 0.2s" }}>
                {/* Summary row */}
                <div onClick={() => setExpandedId(expanded ? null : f.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", cursor: "pointer" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: f.contacted ? T.green : T.amber, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Noto Sans TC'", color: T.text, fontSize: 15, fontWeight: 600 }}>{f.name}</div>
                    <div style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 12, display: "flex", gap: 8, flexWrap: "wrap", marginTop: 2 }}>
                      {f.table && <span>{TABLE_EMOJIS[TABLES.indexOf(f.table)] || "🍷"} {f.table}桌</span>}
                      {f.phone && <span>📱 {f.phone}</span>}
                      {f.ig && <span>IG: {f.ig}</span>}
                      {f.line && <span>LINE: {f.line}</span>}
                    </div>
                  </div>
                  <span style={{ color: T.textMuted, fontSize: 16, transform: expanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▼</span>
                </div>
                {/* Expanded details */}
                {expanded && (
                  <div style={{ padding: "0 18px 16px", borderTop: "1px solid rgba(212,162,78,0.1)", animation: "fadeSlideUp 0.3s ease" }}>
                    {f.interests && f.interests.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: 12, fontWeight: 500, marginBottom: 6 }}>感興趣</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {f.interests.map((int, i) => <span key={i} style={{ background: "rgba(212,162,78,0.1)", border: "1px solid rgba(212,162,78,0.2)", borderRadius: 12, padding: "3px 10px", fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: 11 }}>{int}</span>)}
                        </div>
                      </div>
                    )}
                    {f.feedback && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: 12, fontWeight: 500, marginBottom: 4 }}>回饋</div>
                        <p style={{ fontFamily: "'Noto Sans TC'", color: T.text, fontSize: 13, margin: 0, lineHeight: 1.6, background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 12px" }}>{f.feedback}</p>
                      </div>
                    )}
                    {/* Notes */}
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: 12, fontWeight: 500, marginBottom: 4 }}>管理員備註</div>
                      <textarea value={f.notes || ""} onChange={e => addNote(f.id, e.target.value)} placeholder="新增備註..." rows={2} style={{ ...is, resize: "vertical", fontSize: 12 }} onFocus={e => e.target.style.borderColor = T.gold} onBlur={e => e.target.style.borderColor = "rgba(212,162,78,0.2)"} />
                    </div>
                    {/* Actions */}
                    <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                      <button onClick={() => toggleContacted(f.id)} style={{ background: f.contacted ? "rgba(39,174,96,0.15)" : "rgba(212,162,78,0.1)", border: `1px solid ${f.contacted ? "rgba(39,174,96,0.3)" : "rgba(212,162,78,0.2)"}`, borderRadius: 8, padding: "8px 16px", color: f.contacted ? T.green : T.warm, fontFamily: "'Noto Sans TC'", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        {f.contacted ? "✅ 已聯繫" : "📞 標記為已聯繫"}
                      </button>
                    </div>
                    <div style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 11, marginTop: 8 }}>
                      提交時間：{f.submittedAt ? new Date(f.submittedAt).toLocaleString("zh-TW") : "未知"}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============ SETTINGS PANEL ============

function SettingsPanel({ config, setConfig, roundAwards, setRoundAwards, gospelContent, setGospelContent }) {
  const is = { width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212,162,78,0.15)", borderRadius: 6, padding: "8px 12px", color: T.text, fontFamily: "'Noto Sans TC'", fontSize: 14, outline: "none" };
  const chipBtn = (active) => ({ flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${active ? T.gold : "rgba(212,162,78,0.2)"}`, background: active ? T.gold : "transparent", color: active ? T.bg : T.textMuted, fontFamily: "'Noto Sans TC'", fontSize: 15, fontWeight: 700, cursor: "pointer" });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h2 style={{ fontFamily: "'Playfair Display',serif", color: T.gold, fontSize: 28, marginBottom: 24 }}>進階設定</h2>
      <div style={{ width: "100%", maxWidth: 500 }}>
        {/* Round count */}
        <div style={{ background: T.bgCard, borderRadius: 16, padding: 24, border: "1px solid rgba(212,162,78,0.15)", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>🎯 比賽回合數</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[1, 2, 3].map(n => <button key={n} onClick={() => setConfig(p => ({ ...p, totalRounds: n }))} style={chipBtn(config.totalRounds === n)}>{n} 輪</button>)}
          </div>
        </div>
        {/* Table count */}
        <div style={{ background: T.bgCard, borderRadius: 16, padding: 24, border: "1px solid rgba(212,162,78,0.15)", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>🪑 桌數</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="number" min={2} max={20} value={config.tableCount} onChange={e => { const v = parseInt(e.target.value); if (v >= 2 && v <= 20) setConfig(p => ({ ...p, tableCount: v })); }} style={{ ...is, width: 80, textAlign: "center" }} />
            <span style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 12 }}>桌（2~20）</span>
          </div>
        </div>
        {/* Timer */}
        <div style={{ background: T.bgCard, borderRadius: 16, padding: 24, border: "1px solid rgba(212,162,78,0.15)", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>⏱️ 每人說書時間</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[90, 120, 180, 240, 300].map(s => <button key={s} onClick={() => setConfig(p => ({ ...p, timerDuration: s }))} style={chipBtn(config.timerDuration === s)}>{s >= 60 ? `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}` : `${s}秒`}</button>)}
          </div>
        </div>
        {/* Intermission */}
        {config.totalRounds > 1 && (
          <div style={{ background: T.bgCard, borderRadius: 16, padding: 24, border: "1px solid rgba(212,162,78,0.15)", marginBottom: 16 }}>
            <div style={{ fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>☕ 中場休息</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[180, 300, 600].map(s => <button key={s} onClick={() => setConfig(p => ({ ...p, intermissionDuration: s }))} style={chipBtn(config.intermissionDuration === s)}>{Math.floor(s / 60)} 分鐘</button>)}
            </div>
          </div>
        )}
        {/* Awards */}
        <div style={{ background: T.bgCard, borderRadius: 16, padding: 24, border: "1px solid rgba(212,162,78,0.15)", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>🏆 獎項名稱</div>
          {Array.from({ length: config.totalRounds }).map((_, ri) => <div key={ri} style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 12, marginBottom: 4 }}>第 {ri + 1} 回合</div>
            {["冠軍", "亞軍", "季軍"].map((place, pi) => <input key={pi} value={roundAwards[ri]?.[pi] || ""} onChange={e => { const na = [...roundAwards]; if (!na[ri]) na[ri] = ["", "", ""]; na[ri] = [...na[ri]]; na[ri][pi] = e.target.value; setRoundAwards(na) }} placeholder={`${place} 獎項名稱`} style={{ ...is, marginBottom: 4 }} onFocus={e => e.target.style.borderColor = T.gold} onBlur={e => e.target.style.borderColor = "rgba(212,162,78,0.15)"} />)}
          </div>)}
        </div>
        {/* Gospel */}
        <div style={{ background: T.bgCard, borderRadius: 16, padding: 24, border: "1px solid rgba(212,162,78,0.15)" }}>
          <div style={{ fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>✝️ 最後的故事（福音內容）</div>
          <input value={gospelContent.title} onChange={e => setGospelContent(p => ({ ...p, title: e.target.value }))} placeholder="標題" style={{ ...is, marginBottom: 8, color: T.goldLight, fontWeight: 600 }} onFocus={e => e.target.style.borderColor = T.gold} onBlur={e => e.target.style.borderColor = "rgba(212,162,78,0.15)"} />
          {gospelContent.paragraphs.map((p, i) => <textarea key={i} value={p.text} onChange={e => { const np = [...gospelContent.paragraphs]; np[i] = { ...np[i], text: e.target.value }; setGospelContent(prev => ({ ...prev, paragraphs: np })) }} rows={2} style={{ ...is, marginBottom: 4, resize: "vertical" }} onFocus={e => e.target.style.borderColor = T.gold} onBlur={e => e.target.style.borderColor = "rgba(212,162,78,0.15)"} />)}
          <button onClick={() => setGospelContent(p => ({ ...p, paragraphs: [...p.paragraphs, { text: "", color: "text" }] }))} style={{ background: "transparent", border: "1px dashed rgba(212,162,78,0.3)", borderRadius: 6, padding: "6px 12px", color: T.textMuted, fontFamily: "'Noto Sans TC'", fontSize: 12, cursor: "pointer", width: "100%", marginTop: 4 }}>+ 新增段落</button>
        </div>
      </div>
    </div>
  );
}

// ============ ADMIN SIDEBAR ============

function Sidebar({ screen, setScreen, totalRounds, projector, setProjector, eventData, followUpCount }) {
  const sections = [
    { id: "setup", icon: "⚙️", label: "活動設定" },
    { id: "checkin", icon: "✍️", label: "簽到管理" },
    ...Array.from({ length: totalRounds }).flatMap((_, i) => [
      { id: `round${i + 1}`, icon: `${i + 1}️⃣`, label: `第${i + 1}回合` },
      { id: `award${i + 1}`, icon: "🏆", label: `頒獎${i + 1}` },
      ...(i < totalRounds - 1 ? [{ id: "intermission", icon: "☕", label: "中場休息" }] : []),
    ]),
    { id: "recap", icon: "📖", label: "故事牆" },
    { id: "gospel", icon: "✝️", label: "福音" },
    { id: "followup", icon: "🤝", label: "跟進表單", badge: followUpCount || 0 },
    { id: "settings", icon: "🔧", label: "進階設定" },
  ];

  const btnStyle = (active) => ({
    display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 16px", background: active ? "rgba(212,162,78,0.15)" : "transparent", border: "none", borderLeft: active ? `3px solid ${T.gold}` : "3px solid transparent", color: active ? T.goldLight : T.textMuted, fontFamily: "'Noto Sans TC'", fontSize: 13, fontWeight: active ? 600 : 400, cursor: "pointer", transition: "all 0.2s", textAlign: "left",
  });

  return (
    <div style={{ width: 220, minHeight: "100vh", background: "rgba(15,11,7,0.95)", borderRight: "1px solid rgba(212,162,78,0.15)", display: "flex", flexDirection: "column", position: "fixed", left: 0, top: 0, zIndex: 50 }}>
      {/* Header */}
      <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(212,162,78,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 20 }}>🍷</span>
          <span style={{ fontFamily: "'Playfair Display',serif", color: T.gold, fontSize: 16, fontWeight: 700 }}>Story Night</span>
        </div>
        <div style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 11 }}>管理員後台</div>
        {eventData && <div style={{ fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: 11, marginTop: 4 }}>{eventData.name}</div>}
      </div>

      {/* Nav items */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {sections.map(s => (
          <button key={s.id} onClick={() => setScreen(s.id)} style={btnStyle(screen === s.id)}>
            <span style={{ fontSize: 15, width: 20, textAlign: "center" }}>{s.icon}</span>
            <span style={{ flex: 1 }}>{s.label}</span>
            {s.badge > 0 && <span style={{ background: T.amber, color: T.bg, borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700, fontFamily: "'Noto Sans TC'" }}>{s.badge}</span>}
          </button>
        ))}
      </div>

      {/* Projector toggle */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(212,162,78,0.15)" }}>
        <button onClick={() => setProjector(!projector)} style={{ width: "100%", padding: "10px 16px", borderRadius: 10, border: "none", background: projector ? "rgba(192,57,43,0.2)" : `linear-gradient(135deg,${T.gold},${T.amber})`, color: projector ? "#e74c3c" : T.bg, fontFamily: "'Noto Sans TC'", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
          {projector ? "📱 關閉投影" : "📽️ 開啟投影模式"}
        </button>
      </div>
    </div>
  );
}

// ============ LIVE VOTE INDICATOR ============

function LiveVoteIndicator({ connected, voteCount }) {
  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 100, display: "flex", alignItems: "center", gap: 8, background: "rgba(15,11,7,0.8)", borderRadius: 20, padding: "8px 16px", border: "1px solid rgba(212,162,78,0.2)", backdropFilter: "blur(10px)" }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: connected ? "#2ecc71" : "#e74c3c", boxShadow: connected ? "0 0 8px #2ecc71" : "0 0 8px #e74c3c" }} />
      <span style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 12 }}>{connected ? `即時連線中 · ${voteCount} 票` : "離線模式"}</span>
    </div>
  );
}

// ============ MAIN ADMIN APP ============

export default function AdminApp() {
  const [screen, setScreen] = useState("setup");
  const [eventData, setEventData] = useState(null);
  const [participants, setParticipants] = useState(DEMO_PARTICIPANTS);
  const [scores, setScores] = useState({});
  const [projector, setProjector] = useState(false);
  const [followUps, setFollowUps] = useState([]);

  // Unified config object
  const [config, setConfig] = useState({
    eventName: "故事之夜 Vol.1",
    tableCount: 8,
    totalRounds: 2,
    timerDuration: 180,
    intermissionDuration: 300,
  });

  const [nextRound, setNextRound] = useState(2);
  const [roundAwards, setRoundAwards] = useState([
    ["🏆 故事王", "🥈 銀舌獎", "🥉 勇氣獎"],
    ["🏆 靈魂說書人", "🥈 最佳淚腺攻擊", "🥉 全場噴酒獎"],
    ["🏆 傳奇說書人", "🥈 最佳劇情獎", "🥉 人氣獎"],
  ]);
  const [gospelContent, setGospelContent] = useState(DEFAULT_GOSPEL);

  const rt = useRealtime(eventData?.id);
  const broadcast = useBroadcast();

  // Projector sync state
  const [spinTrigger, setSpinTrigger] = useState(0);
  const [projPhase, setProjPhase] = useState("spin");
  const [projTopic, setProjTopic] = useState("");
  const [projTimer, setProjTimer] = useState({ running: false, duration: 180, key: 0 });
  const [projStoryteller, setProjStoryteller] = useState({ idx: 0, rep: null, total: 0 });
  const [projVote, setProjVote] = useState({ voteCount: 0, lastScore: 0, roundScores: {}, tableReps: [] });
  const [intermissionCd, setIntermissionCd] = useState(300);

  // Derived values from config
  const { tableCount, totalRounds } = config;

  useEffect(() => {
    if (screen === "intermission") { setIntermissionCd(config.intermissionDuration); const t = setInterval(() => setIntermissionCd(p => (p > 0 ? p - 1 : 0)), 1000); return () => clearInterval(t); }
  }, [screen, config.intermissionDuration]);

  // Broadcast state to public app whenever screen/phase changes
  useEffect(() => {
    broadcast.send("admin:state", {
      screen,
      phase: projPhase,
      topic: projTopic,
      storyteller: projStoryteller.rep ? {
        id: projStoryteller.rep.id,
        name: projStoryteller.rep.name,
        tableName: projStoryteller.rep.tableName,
        tableEmoji: projStoryteller.rep.tableEmoji,
      } : null,
      tableCount,
      participantCount: participants.length,
      eventName: eventData?.name || config.eventName,
      gospel: gospelContent,
    });
  }, [screen, projPhase, projTopic, projStoryteller.rep?.id, tableCount, participants.length]);

  // Listen for participant actions
  useEffect(() => {
    broadcast.on("vote:submit", (data) => {
      console.log("Vote received from participant:", data);
    });
    broadcast.on("participant:checkin", (data) => {
      console.log("Participant checked in:", data);
    });
    broadcast.on("participant:followup", (data) => {
      setFollowUps(prev => {
        if (prev.some(f => f.id === data.id)) return prev;
        return [...prev, { ...data, contacted: false, notes: "", submittedAt: Date.now() }];
      });
    });
  }, [broadcast]);

  const handleSpinWheel = () => setSpinTrigger(p => p + 1);
  const handleEventCreated = (data) => { setEventData(data); setScreen("checkin"); };
  const eventUrl = eventData ? (API_URL ? `${window.location.origin}?event=${eventData.id}` : `${window.location.origin}`) : "";

  const goAfterAward = (roundNum) => {
    if (roundNum < totalRounds) { setNextRound(roundNum + 1); setScreen("intermission"); }
    else { setScreen("recap"); }
  };

  // ---- Projector render ----
  const renderProjector = () => {
    for (let i = 1; i <= totalRounds; i++) {
      if (screen === `round${i}`) {
        const topics = ALL_TOPICS[(i - 1) % ALL_TOPICS.length];
        if (projPhase === "spin") return <ProjSpin topics={topics} round={i} spinTrigger={spinTrigger} onResult={(t) => setProjTopic(t)} />;
        if (projPhase === "storytelling") return <ProjStoryteller rep={projStoryteller.rep} topic={projTopic} currentIdx={projStoryteller.idx} totalCount={projStoryteller.total} timerDuration={projTimer.duration} timerRunning={projTimer.running} onTimeUp={() => { }} voteCount={projVote.voteCount} lastScore={projVote.lastScore} />;
        return <ProjLeaderboard tableReps={projVote.tableReps} roundScores={projVote.roundScores} topic={projTopic} round={i} />;
      }
      if (screen === `award${i}`) return <AwardCeremony tableReps={projVote.tableReps} roundScores={projVote.roundScores} round={i} awards={roundAwards[i - 1]} projector />;
    }
    switch (screen) {
      case "checkin": return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24, textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 120, marginBottom: 8 }}>🍷</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(64px,12vw,100px)", fontWeight: 900, color: T.gold, lineHeight: 1.1, margin: "0 0 32px 0" }}>我有酒</h1>
          <QRCodeDisplay url={eventUrl} size={260} />
          <p style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 20, marginTop: 20 }}>掃描加入 · 已有 {participants.length} 人入場</p>
        </div>
      );
      case "intermission": return <ProjIntermission countdown={intermissionCd} />;
      case "recap": return <StoryRecapWall participants={participants} tableCount={tableCount} scores={scores} projector />;
      case "gospel": return <GospelView gospelContent={gospelContent} projector />;
      default: return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24, textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 120, marginBottom: 8 }}>🍷</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(64px,12vw,120px)", fontWeight: 900, color: T.gold, lineHeight: 1.1, margin: "0 0 8px 0", textShadow: "0 0 40px rgba(212,162,78,0.3)" }}>我有酒</h1>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(32px,6vw,56px)", fontWeight: 300, fontStyle: "italic", color: T.warm, margin: "0 0 40px 0", letterSpacing: 4 }}>你有故事嗎？</h2>
          {eventUrl && <QRCodeDisplay url={eventUrl} size={280} />}
          <p style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 22, marginTop: 24, letterSpacing: 3 }}>掃描 QR Code 加入今晚的故事</p>
        </div>
      );
    }
  };

  // ---- Admin content render ----
  const renderContent = () => {
    for (let i = 1; i <= totalRounds; i++) {
      if (screen === `round${i}`) return <PhoneStoryRound key={`r${i}`} round={i} participants={participants} tableCount={tableCount} scores={scores} setScores={setScores} onFinish={() => setScreen(`award${i}`)} onSpinWheel={handleSpinWheel} onTopicSet={setProjTopic} onPhaseChange={setProjPhase} onTimerState={setProjTimer} onStoryteller={setProjStoryteller} onVoteData={setProjVote} />;
      if (screen === `award${i}`) return <AwardCeremony tableReps={projVote.tableReps} roundScores={projVote.roundScores} round={i} awards={roundAwards[i - 1]} onNext={() => goAfterAward(i)} />;
    }
    switch (screen) {
      case "setup": return <EventSetupScreen onEventCreated={handleEventCreated} config={config} setConfig={setConfig} />;
      case "checkin": return <CheckInManagement participants={participants} setParticipants={setParticipants} tableCount={tableCount} setTableCount={(n) => setConfig(p => ({ ...p, tableCount: n }))} />;
      case "intermission": return <IntermissionControl onNext={() => setScreen(`round${nextRound}`)} />;
      case "recap": return <div><StoryRecapWall participants={participants} tableCount={tableCount} scores={scores} /><div style={{ display: "flex", justifyContent: "center", padding: "0 20px 40px" }}><GoldButton onClick={() => setScreen("gospel")}>進入今晚最後一個故事 →</GoldButton></div></div>;
      case "gospel": return <GospelView gospelContent={gospelContent} onNext={() => setScreen("followup")} />;
      case "followup": return <FollowUpManagement followUps={followUps} setFollowUps={setFollowUps} />;
      case "settings": return <SettingsPanel config={config} setConfig={setConfig} roundAwards={roundAwards} setRoundAwards={setRoundAwards} gospelContent={gospelContent} setGospelContent={setGospelContent} />;
      default: return <EventSetupScreen onEventCreated={handleEventCreated} config={config} setConfig={setConfig} />;
    }
  };

  // Projector fullscreen mode
  if (projector) {
    return (
      <div style={{ minHeight: "100vh", fontFamily: "'Noto Sans TC',sans-serif", color: T.text, overflowX: "hidden" }}>
        <AnimatedBG />
        {rt.connected && <LiveVoteIndicator connected={rt.connected} voteCount={rt.voteCount} />}
        {renderProjector()}
        <button onClick={() => setProjector(false)} style={{ position: "fixed", bottom: 20, right: 20, zIndex: 300, width: 56, height: 56, borderRadius: "50%", border: "none", background: T.red, color: "#fff", fontSize: 20, cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>📱</button>
        <div style={{ position: "fixed", bottom: 20, left: 20, zIndex: 300, display: "flex", gap: 4, background: "rgba(15,11,7,0.9)", borderRadius: 12, padding: 6, border: "1px solid rgba(212,162,78,0.2)" }}>
          {["checkin", ...Array.from({ length: totalRounds }).flatMap((_, i) => [`round${i + 1}`, `award${i + 1}`, ...(i < totalRounds - 1 ? ["intermission"] : [])]), "recap", "gospel"].map(s => <button key={s} onClick={() => setScreen(s)} style={{ background: screen === s ? T.gold : "transparent", color: screen === s ? T.bg : T.textMuted, border: "none", borderRadius: 6, padding: "6px 10px", fontFamily: "'Noto Sans TC'", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{s.replace(/round(\d+)/, "R$1").replace(/award(\d+)/, "🏆$1").replace("intermission", "☕").replace("checkin", "✍️").replace("recap", "📖").replace("gospel", "✝️")}</button>)}
        </div>
      </div>
    );
  }

  // Normal admin layout with sidebar
  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Noto Sans TC',sans-serif", color: T.text, overflowX: "hidden", display: "flex" }}>
      <AnimatedBG />
      <Sidebar screen={screen} setScreen={setScreen} totalRounds={totalRounds} projector={projector} setProjector={setProjector} eventData={eventData} followUpCount={followUps.length} />
      <div style={{ marginLeft: 220, flex: 1, position: "relative", zIndex: 1, padding: "40px 24px", minHeight: "100vh" }}>
        {renderContent()}
      </div>
    </div>
  );
}
