// ============================================================
// 🍷 Story Night — 共用常數、主題、元件
// ============================================================
import { useState, useEffect, useRef, useCallback } from "react";

// ============ CONSTANTS ============

export const TABLES = ["威士忌", "紅酒", "清酒", "琴酒", "白蘭地", "梅酒", "啤酒", "香檳", "伏特加", "龍舌蘭"];
export const TABLE_EMOJIS = ["🥃", "🍷", "🍶", "🍸", "🥂", "🍑", "🍺", "🥂", "🫙", "🌵"];
export const ALL_TOPICS = [
  ["最糗的故事", "最丟臉的經歷", "最瘋狂的冒險", "最離譜的巧合", "最搞笑的誤會", "最荒唐的決定"],
  ["最痛的一次成長", "最感恩的一件事", "改變我最多的人", "最黑暗中看見的光", "一句改變我人生的話", "最不敢面對的恐懼"],
  ["最意想不到的轉折", "最後悔沒做的事", "最勇敢的一次決定", "讓我重新開始的一天", "最珍貴的一句話", "最不像我會做的事"],
];
export const AWARD_NAMES = [
  { id: "tears", name: "💧 最佳淚腺攻擊獎", desc: "讓全場哭成一片" },
  { id: "spray", name: "🍷 全場噴酒獎", desc: "笑到酒從鼻子噴出來" },
  { id: "soul", name: "✨ 靈魂說書人", desc: "故事說得讓靈魂都震動" },
  { id: "brave", name: "🦁 最勇敢的心", desc: "敢說別人不敢說的" },
  { id: "plot", name: "🎬 最佳劇情轉折獎", desc: "沒有人猜到結局" },
];
export const DEMO_PARTICIPANTS = [
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

export const DEFAULT_GOSPEL = {
  title: "今晚最後一個故事",
  subtitle: "The Greatest Story Ever Told",
  paragraphs: [
    { text: "今晚我們聽了好多精彩的故事——有讓人笑到噴酒的，有讓人紅了眼眶的。", color: "text" },
    { text: "但有一個故事，兩千年來一直在被傳述。", color: "text" },
    { text: "那是關於一個人，他離開了天上的王座，走進了人間最破碎的故事裡。他碰觸了痲瘋病人，和罪人一起吃飯，在十字架上承擔了所有人的黑暗。", color: "warm" },
    { text: "他的名字是耶穌。而他說：「你的故事，我都知道。我來，不是要審判你，是要陪你走完這個故事。」", color: "goldLight" },
  ],
};

// 🔧 部署後改成你的 Railway API URL
export const API_URL = "https://story-night.up.railway.app";

// ============ THEME ============

export const T = {
  bg: "#0f0b07", bgCard: "rgba(30,22,14,0.85)",
  gold: "#d4a24e", goldLight: "#f0d48a", amber: "#c97d2a",
  warm: "#e8c88a", text: "#f5efe6", textMuted: "rgba(245,239,230,0.5)",
  red: "#c0392b", green: "#27ae60",
};

// ============ FONT & GLOBAL STYLES (inject once) ============

let _stylesInjected = false;
export function injectGlobalStyles() {
  if (_stylesInjected) return;
  _stylesInjected = true;

  const fontLink = document.createElement("link");
  fontLink.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Noto+Sans+TC:wght@300;400;500;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300&display=swap";
  fontLink.rel = "stylesheet";
  document.head.appendChild(fontLink);

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
}

// ============ SOUND EFFECTS ============

export const SFX = {
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

// ============ BROADCAST CHANNEL (前後台同步) ============

const CHANNEL_NAME = "story-night-sync";

export function useBroadcast() {
  const channelRef = useRef(null);
  const listenersRef = useRef(new Map());

  useEffect(() => {
    channelRef.current = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current.onmessage = (e) => {
      const { type, payload } = e.data;
      const cb = listenersRef.current.get(type);
      if (cb) cb(payload);
    };
    return () => channelRef.current?.close();
  }, []);

  const send = useCallback((type, payload) => {
    channelRef.current?.postMessage({ type, payload });
  }, []);

  const on = useCallback((type, cb) => {
    listenersRef.current.set(type, cb);
  }, []);

  return { send, on };
}

// ============ SHARED COMPONENTS ============

export function AnimatedBG() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", background: `radial-gradient(ellipse at 20% 50%,rgba(212,162,78,0.08) 0%,transparent 50%),radial-gradient(ellipse at 80% 20%,rgba(201,125,42,0.06) 0%,transparent 40%),radial-gradient(ellipse at 50% 80%,rgba(139,69,19,0.05) 0%,transparent 50%),${T.bg}` }}>
      {Array.from({ length: 15 }).map((_, i) => <div key={i} style={{ position: "absolute", width: 2 + Math.random() * 3, height: 2 + Math.random() * 3, borderRadius: "50%", background: T.gold, opacity: 0.1 + Math.random() * 0.15, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animation: `float${i % 3} ${8 + Math.random() * 12}s ease-in-out infinite`, animationDelay: `${Math.random() * 5}s` }} />)}
      <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
    </div>
  );
}

export function GoldButton({ children, onClick, style, disabled, small }) {
  const [h, setH] = useState(false);
  return <button onClick={onClick} disabled={disabled} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ background: disabled ? "rgba(212,162,78,0.2)" : h ? T.goldLight : T.gold, color: disabled ? T.textMuted : T.bg, border: "none", padding: small ? "8px 20px" : "14px 36px", borderRadius: 8, fontSize: small ? 14 : 17, fontWeight: 700, fontFamily: "'Noto Sans TC',sans-serif", cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.3s ease", transform: h && !disabled ? "translateY(-2px)" : "none", boxShadow: h && !disabled ? "0 8px 30px rgba(212,162,78,0.3)" : "0 4px 15px rgba(0,0,0,0.3)", letterSpacing: 1, ...style }}>{children}</button>;
}

export function ConfettiBurst({ active }) {
  if (!active) return null;
  const c = [T.gold, T.goldLight, T.amber, T.warm, "#e74c3c", "#3498db", "#2ecc71"];
  return <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 200, overflow: "hidden" }}>{Array.from({ length: 40 }).map((_, i) => <div key={i} style={{ position: "absolute", left: `${30 + Math.random() * 40}%`, top: `${40 + Math.random() * 20}%`, width: 6 + Math.random() * 8, height: 6 + Math.random() * 8, borderRadius: Math.random() > 0.5 ? "50%" : "2px", background: c[Math.floor(Math.random() * c.length)], animation: `confettiPop ${0.8 + Math.random() * 1.2}s ease-out forwards`, animationDelay: `${Math.random() * 0.3}s`, transform: `rotate(${Math.random() * 360}deg)` }} />)}</div>;
}

export function ScoreFlyIn({ score, visible }) {
  if (!visible) return null;
  return <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 150 }}><div style={{ fontFamily: "'Playfair Display',serif", fontSize: 120, fontWeight: 900, color: T.goldLight, textShadow: "0 0 60px rgba(212,162,78,0.6),0 0 120px rgba(212,162,78,0.3)", animation: "scoreFlyIn 0.8s ease-out forwards" }}>{score}</div></div>;
}

export function StoryTimer({ duration, running, onTimeUp, projector }) {
  const [tl, setTl] = useState(duration);
  const ref = useRef(null);
  useEffect(() => { setTl(duration) }, [duration]);
  useEffect(() => {
    if (running && tl > 0) { ref.current = setInterval(() => { setTl(p => { if (p <= 1) { clearInterval(ref.current); if (onTimeUp) onTimeUp(); return 0 } return p - 1 }) }, 1000) }
    return () => clearInterval(ref.current);
  }, [running]);
  const mins = Math.floor(tl / 60), secs = tl % 60, pct = (tl / duration) * 100;
  const urgent = tl <= 30, critical = tl <= 10;
  const sz = projector ? { f: 96, r: 200, s: 10 } : { f: 42, r: 100, s: 6 };
  const circ = 2 * Math.PI * (sz.r / 2 - sz.s);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: critical ? "pulseRed 0.5s ease-in-out infinite" : urgent ? "pulseGlow 1s ease-in-out infinite" : "none", borderRadius: "50%", padding: projector ? 20 : 8 }}>
      <div style={{ position: "relative", width: sz.r, height: sz.r }}>
        <svg width={sz.r} height={sz.r} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={sz.r / 2} cy={sz.r / 2} r={sz.r / 2 - sz.s} fill="none" stroke="rgba(212,162,78,0.15)" strokeWidth={sz.s} />
          <circle cx={sz.r / 2} cy={sz.r / 2} r={sz.r / 2 - sz.s} fill="none" stroke={critical ? T.red : urgent ? T.amber : T.gold} strokeWidth={sz.s} strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear,stroke 0.5s ease" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontSize: sz.f, fontWeight: 700, color: critical ? T.red : urgent ? T.amber : T.goldLight, animation: critical ? "timerUrgent 0.5s ease-in-out infinite" : "none" }}>{mins}:{secs.toString().padStart(2, "0")}</div>
      </div>
      {!projector && <div style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 11, marginTop: 6 }}>{critical ? "⚡ 時間快到了！" : urgent ? "⏳ 剩不到 30 秒" : "說書時間"}</div>}
    </div>
  );
}

export function QRCodeDisplay({ url, size = 200 }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&bgcolor=0f0b07&color=d4a24e&format=svg`;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ background: "rgba(15,11,7,0.9)", borderRadius: 16, padding: 20, border: "1px solid rgba(212,162,78,0.3)", boxShadow: "0 0 40px rgba(212,162,78,0.15)" }}>
        <img src={qrUrl} alt="QR Code" width={size} height={size} style={{ display: "block", borderRadius: 8 }} />
      </div>
      <div style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 12, textAlign: "center", maxWidth: size, wordBreak: "break-all" }}>{url}</div>
    </div>
  );
}

// ============ API HELPERS ============

export async function writeToAPI(data) {
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

// ============ REAL-TIME HOOK (Socket.io) ============

export function useRealtime(eventId) {
  const [connected, setConnected] = useState(false);
  const [liveVotes, setLiveVotes] = useState([]);
  const [voteCount, setVoteCount] = useState(0);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!API_URL || !eventId) return;
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.min.js";
    script.onload = () => {
      const socket = window.io(API_URL, { transports: ["websocket", "polling"] });
      socketRef.current = socket;
      socket.on("connect", () => { setConnected(true); socket.emit("join:event", eventId); });
      socket.on("vote:new", (data) => { setLiveVotes(prev => [data, ...prev].slice(0, 50)); setVoteCount(prev => prev + 1); });
      socket.on("disconnect", () => setConnected(false));
    };
    document.head.appendChild(script);
    return () => { if (socketRef.current) socketRef.current.disconnect() };
  }, [eventId]);

  const emit = (event, data) => { if (socketRef.current) socketRef.current.emit(event, data) };
  return { connected, liveVotes, voteCount, emit };
}

// ============ UTILITY: Build table reps from participants ============

export function getTableReps(participants, tableCount) {
  return Array.from({ length: tableCount }).map((_, i) => {
    const m = participants.filter(p => p.table === i);
    return m.length > 0 ? { ...m[0], tableName: TABLES[i], tableEmoji: TABLE_EMOJIS[i] } : null;
  }).filter(Boolean);
}
