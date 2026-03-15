// ============================================================
// 🍷 Story Night — 前台（參與者頁面）
// 路由: /#/ (預設)
// 流程: 歡迎 → 簽到 → 等待/投票 → 跟進 → 感謝
// ============================================================
import { useState, useEffect, useRef } from "react";
import {
  T, TABLES, TABLE_EMOJIS, ALL_TOPICS,
  AnimatedBG, GoldButton, ConfettiBurst, ScoreFlyIn, StoryTimer,
  SFX, writeToAPI, useBroadcast, injectGlobalStyles,
} from "./shared.jsx";

injectGlobalStyles();

// ============ 歡迎頁 ============

function LandingPage({ onNext }) {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 100) }, []);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24, textAlign: "center", position: "relative", zIndex: 1, opacity: show ? 1 : 0, transition: "all 1s ease" }}>
      <div style={{ fontSize: 72, marginBottom: 8 }}>🍷</div>
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(36px,8vw,64px)", fontWeight: 900, color: T.gold, lineHeight: 1.1, margin: "0 0 8px 0", textShadow: "0 0 40px rgba(212,162,78,0.3)" }}>我有酒</h1>
      <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(20px,5vw,34px)", fontWeight: 300, fontStyle: "italic", color: T.warm, margin: "0 0 32px 0", letterSpacing: 4 }}>你有故事嗎？</h2>
      <div style={{ width: 60, height: 1, background: `linear-gradient(90deg,transparent,${T.gold},transparent)`, margin: "0 auto 32px" }} />
      <p style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 15, maxWidth: 360, lineHeight: 1.8, marginBottom: 48 }}>每個人都有一個值得被聽見的故事<br />今晚，讓我們用一杯酒的時間<br />交換彼此生命中最真實的片段</p>
      <GoldButton onClick={onNext}>進入今晚的故事</GoldButton>
      <p style={{ fontFamily: "'Noto Sans TC'", color: "rgba(245,239,230,0.2)", fontSize: 12, marginTop: 40 }}>Powered by Wechurch</p>
    </div>
  );
}

// ============ 簽到頁 ============

function CheckInPage({ onCheckedIn, eventState }) {
  const [name, setName] = useState("");
  const [oneLiner, setOneLiner] = useState("");
  const [assigned, setAssigned] = useState(null);
  const tableCount = eventState.tableCount || 8;
  const participantCount = eventState.participantCount || 0;

  const handleCheckIn = () => {
    if (!name.trim()) return;
    const ti = participantCount % tableCount;
    const p = { id: Date.now(), name: name.trim(), oneLiner: oneLiner.trim(), table: ti, tableName: TABLES[ti], tableEmoji: TABLE_EMOJIS[ti] };
    setAssigned(p);
  };

  const is = { width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212,162,78,0.2)", borderRadius: 8, padding: "12px 16px", color: T.text, fontFamily: "'Noto Sans TC'", fontSize: 16, outline: "none" };

  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h2 style={{ fontFamily: "'Playfair Display',serif", color: T.gold, fontSize: 32, marginBottom: 4 }}>簽到入場</h2>
      <p style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 14, marginBottom: 32 }}>找到你今晚的酒桌</p>

      {!assigned ? (
        <div style={{ background: T.bgCard, borderRadius: 16, padding: 28, width: "100%", maxWidth: 400, border: "1px solid rgba(212,162,78,0.15)", marginBottom: 24 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="你的名字" style={{ ...is, marginBottom: 12 }} onFocus={e => e.target.style.borderColor = T.gold} onBlur={e => e.target.style.borderColor = "rgba(212,162,78,0.2)"} />
          <input value={oneLiner} onChange={e => setOneLiner(e.target.value)} placeholder="一句話介紹自己（選填）" style={{ ...is, marginBottom: 20 }} onFocus={e => e.target.style.borderColor = T.gold} onBlur={e => e.target.style.borderColor = "rgba(212,162,78,0.2)"} />
          <GoldButton onClick={handleCheckIn} disabled={!name.trim()} style={{ width: "100%" }}>🎲 抽取我的酒桌</GoldButton>
        </div>
      ) : (
        <div style={{ animation: "fadeSlideUp 0.5s ease" }}>
          <div style={{ background: "rgba(212,162,78,0.1)", borderRadius: 16, padding: 28, width: "100%", maxWidth: 400, textAlign: "center", border: "1px solid rgba(212,162,78,0.3)", marginBottom: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>{assigned.tableEmoji}</div>
            <div style={{ fontFamily: "'Noto Sans TC'", color: T.gold, fontSize: 14, fontWeight: 500, marginBottom: 4 }}>你的酒桌是</div>
            <div style={{ fontFamily: "'Playfair Display',serif", color: T.goldLight, fontSize: 28, fontWeight: 700 }}>{assigned.tableName}桌</div>
            <div style={{ color: T.textMuted, fontFamily: "'Noto Sans TC'", fontSize: 13, marginTop: 8 }}>第 {assigned.table + 1} 桌</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <GoldButton onClick={() => onCheckedIn(assigned)}>確認入座 →</GoldButton>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ 等待中頁面 ============

function WaitingPage({ eventState }) {
  const [dots] = useState(() => Array.from({ length: 15 }).map(() => ({ x: Math.random() * 100, y: Math.random() * 100, s: 0.5 + Math.random() * 1.5, d: 3 + Math.random() * 6 })));
  const phrases = ["放鬆心情 🍷", "認識隔壁的人", "準備好你的故事", "今晚會很精彩"];
  const [phraseIdx, setPhraseIdx] = useState(0);
  useEffect(() => { const t = setInterval(() => setPhraseIdx(p => (p + 1) % phrases.length), 3000); return () => clearInterval(t) }, []);

  return (
    <div style={{ minHeight: "100vh", padding: 40, position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      {dots.map((d, i) => <div key={i} style={{ position: "absolute", left: `${d.x}%`, top: `${d.y}%`, width: d.s * 3, height: d.s * 3, borderRadius: "50%", background: T.gold, opacity: 0.15, animation: `float${i % 3} ${d.d}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }} />)}
      <div style={{ fontSize: 64, marginBottom: 16, animation: "crownBounce 3s ease-in-out infinite" }}>🍷</div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", color: T.gold, fontSize: 28, marginBottom: 8 }}>
        {eventState.screen === "intermission" ? "中場休息" : "活動即將開始"}
      </h2>
      <p style={{ fontFamily: "'Cormorant Garamond',serif", color: T.warm, fontSize: 18, fontStyle: "italic", marginBottom: 32, letterSpacing: 3 }}>
        {eventState.screen === "intermission" ? "refill your glass, refresh your soul" : "sit back, relax, and enjoy the stories"}
      </p>
      <div style={{ height: 28, overflow: "hidden" }}><div key={phraseIdx} style={{ fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: 16, animation: "fadeSlideUp 0.5s ease" }}>{phrases[phraseIdx]}</div></div>
      {eventState.eventName && <p style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 13, marginTop: 40 }}>{eventState.eventName}</p>}
    </div>
  );
}

// ============ 投票頁面 ============

function VotingPage({ eventState, myInfo, broadcast }) {
  const [voting, setVoting] = useState({ story: 3, expression: 3, resonance: 3 });
  const [submitted, setSubmitted] = useState(false);
  const [showSA, setShowSA] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const prevStoryteller = useRef(null);

  // Reset when storyteller changes
  useEffect(() => {
    const sid = eventState.storyteller?.id;
    if (sid && sid !== prevStoryteller.current) {
      prevStoryteller.current = sid;
      setVoting({ story: 3, expression: 3, resonance: 3 });
      setSubmitted(false);
    }
  }, [eventState.storyteller?.id]);

  const rep = eventState.storyteller;
  const topic = eventState.topic || "";

  const submitVote = () => {
    const total = voting.story + voting.expression + voting.resonance;
    setLastScore(total);
    setSubmitted(true);
    SFX.vote();
    setShowSA(true);
    if (total >= 12) { setShowConf(true); SFX.fanfare(); }
    setTimeout(() => { setShowSA(false); setShowConf(false) }, 2000);

    // Broadcast vote to admin
    broadcast.send("vote:submit", {
      storytellerId: rep?.id,
      voterName: myInfo?.name || "匿名",
      scores: voting,
      total,
    });
  };

  if (!rep) {
    return (
      <div style={{ minHeight: "100vh", padding: "40px 20px", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎙️</div>
        <h3 style={{ fontFamily: "'Noto Sans TC'", color: T.gold, fontSize: 20 }}>等待說書人上場...</h3>
        {topic && <p style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 14, marginTop: 8 }}>本回合主題：{topic}</p>}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <ScoreFlyIn score={lastScore} visible={showSA} />
      <ConfettiBurst active={showConf} />

      <div style={{ color: T.textMuted, fontFamily: "'Noto Sans TC'", fontSize: 13, marginBottom: 8 }}>主題：{topic}</div>

      {/* Current storyteller card */}
      <div style={{ background: T.bgCard, borderRadius: 16, padding: "20px 24px", width: "100%", maxWidth: 400, textAlign: "center", border: "1px solid rgba(212,162,78,0.2)", marginBottom: 16 }}>
        <div style={{ fontSize: 40, margin: "4px 0" }}>{rep.tableEmoji}</div>
        <div style={{ fontFamily: "'Playfair Display',serif", color: T.goldLight, fontSize: 22, fontWeight: 700 }}>{rep.name}</div>
        <div style={{ color: T.textMuted, fontFamily: "'Noto Sans TC'", fontSize: 12 }}>{rep.tableName}桌代表</div>
      </div>

      {submitted ? (
        <div style={{ background: "rgba(39,174,96,0.1)", borderRadius: 16, padding: 28, width: "100%", maxWidth: 400, textAlign: "center", border: "1px solid rgba(39,174,96,0.3)", animation: "fadeSlideUp 0.5s ease" }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
          <div style={{ fontFamily: "'Noto Sans TC'", color: T.green, fontSize: 18, fontWeight: 600, marginBottom: 4 }}>已送出評分！</div>
          <div style={{ fontFamily: "'Playfair Display'", color: T.goldLight, fontSize: 36, fontWeight: 700 }}>{lastScore}<span style={{ fontSize: 16, color: T.textMuted }}> / 15</span></div>
          <div style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 13, marginTop: 8 }}>等待下一位說書人...</div>
        </div>
      ) : (
        <div style={{ background: T.bgCard, borderRadius: 16, padding: 24, width: "100%", maxWidth: 400, border: "1px solid rgba(212,162,78,0.15)", marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Noto Sans TC'", color: T.gold, fontSize: 16, fontWeight: 600, margin: "0 0 16px 0", textAlign: "center" }}>為這個故事打分</h3>
          {[{ k: "story", l: "📖 故事精彩度" }, { k: "expression", l: "🎭 表達感染力" }, { k: "resonance", l: "💝 共鳴度" }].map(({ k, l }) => (
            <div key={k} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: 14 }}>{l}</span>
                <span style={{ fontFamily: "'Playfair Display'", color: T.goldLight, fontSize: 20, fontWeight: 700 }}>{voting[k]}</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {[1, 2, 3, 4, 5].map(v => <button key={v} onClick={() => setVoting(p => ({ ...p, [k]: v }))} style={{ flex: 1, height: 40, borderRadius: 8, border: "none", background: v <= voting[k] ? `linear-gradient(135deg,${T.gold},${T.amber})` : "rgba(255,255,255,0.05)", color: v <= voting[k] ? T.bg : T.textMuted, fontSize: 16, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", fontFamily: "'Noto Sans TC'" }}>{v}</button>)}
              </div>
            </div>
          ))}
          <div style={{ textAlign: "center", marginTop: 8, paddingTop: 12, borderTop: "1px solid rgba(212,162,78,0.15)" }}>
            <span style={{ color: T.textMuted, fontFamily: "'Noto Sans TC'", fontSize: 13 }}>總分：</span>
            <span style={{ fontFamily: "'Playfair Display'", color: T.goldLight, fontSize: 28, fontWeight: 700, marginLeft: 8 }}>{voting.story + voting.expression + voting.resonance}</span>
            <span style={{ color: T.textMuted, fontFamily: "'Noto Sans TC'", fontSize: 13 }}> / 15</span>
          </div>
          <GoldButton onClick={submitVote} style={{ width: "100%", marginTop: 16 }}>送出評分 🗳️</GoldButton>
        </div>
      )}
    </div>
  );
}

// ============ 福音頁 ============

function GospelPage({ eventState }) {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 300) }, []);
  const g = eventState.gospel || { title: "今晚最後一個故事", subtitle: "The Greatest Story Ever Told", paragraphs: [] };
  const cm = { text: T.text, warm: T.warm, goldLight: T.goldLight };
  return (
    <div style={{ minHeight: "100vh", padding: "40px 24px", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: show ? 1 : 0, transition: "all 1.5s ease" }}>
      <div style={{ width: 60, height: 1, background: `linear-gradient(90deg,transparent,${T.gold},transparent)`, marginBottom: 32 }} />
      <h2 style={{ fontFamily: "'Playfair Display',serif", color: T.gold, fontSize: "clamp(24px,6vw,36px)", textAlign: "center", lineHeight: 1.4, marginBottom: 16 }}>{g.title}</h2>
      <p style={{ fontFamily: "'Cormorant Garamond',serif", color: T.warm, fontSize: 20, fontStyle: "italic", textAlign: "center", marginBottom: 32, letterSpacing: 2 }}>{g.subtitle}</p>
      <div style={{ background: T.bgCard, borderRadius: 16, padding: "32px 28px", maxWidth: 480, width: "100%", border: "1px solid rgba(212,162,78,0.2)", lineHeight: 2, fontSize: 16 }}>
        {g.paragraphs.map((p, i) => <p key={i} style={{ fontFamily: "'Noto Sans TC'", color: cm[p.color] || T.text, margin: i < g.paragraphs.length - 1 ? "0 0 16px 0" : "0", fontWeight: p.color === "goldLight" ? 500 : 400 }}>{p.text}</p>)}
      </div>
    </div>
  );
}

// ============ 跟進表單頁 ============

function FollowUpPage({ myInfo, broadcast }) {
  const [phase, setPhase] = useState("form");
  const [fd, setFd] = useState({ name: myInfo?.name || "", phone: "", ig: "", line: "", table: myInfo?.tableName || "", interests: [], feedback: "" });
  const [saveStatus, setSaveStatus] = useState("");
  const interestOpts = ["想繼續聽故事 📖", "想認識新朋友 🤝", "想參加下次活動 🎉", "只是來喝酒的 😄"];
  const is = { width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212,162,78,0.2)", borderRadius: 8, padding: "12px 16px", color: T.text, fontFamily: "'Noto Sans TC'", fontSize: 16, outline: "none" };

  const handleSubmit = async () => {
    if (!fd.name.trim()) return;
    setPhase("saving"); setSaveStatus("正在儲存...");
    const contact = [fd.phone && `📱${fd.phone}`, fd.ig && `IG:${fd.ig}`, fd.line && `LINE:${fd.line}`].filter(Boolean).join(" | ");
    const result = await writeToAPI({ ...fd, phone: contact });
    // Broadcast follow-up data to admin
    broadcast.send("participant:followup", { id: Date.now(), name: fd.name, phone: fd.phone, ig: fd.ig, line: fd.line, table: fd.table, interests: fd.interests, feedback: fd.feedback });
    setSaveStatus(result.success ? "✅ 已儲存" : "⚠️ 稍後同步");
    setTimeout(() => setPhase("done"), 1200);
  };

  if (phase === "done") return (
    <div style={{ minHeight: "100vh", padding: "40px 20px", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🙏</div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", color: T.gold, fontSize: 32, marginBottom: 8 }}>感謝你的故事</h2>
      <p style={{ fontFamily: "'Cormorant Garamond',serif", color: T.warm, fontSize: 20, fontStyle: "italic", marginBottom: 24, letterSpacing: 2 }}>Your story matters</p>
      <div style={{ width: 60, height: 1, background: `linear-gradient(90deg,transparent,${T.gold},transparent)`, marginBottom: 24 }} />
      <p style={{ fontFamily: "'Noto Sans TC'", color: T.text, fontSize: 16, maxWidth: 360, lineHeight: 1.8, marginBottom: 16 }}>願你今晚聽到的每一個故事<br />都成為你生命中的養分 ✨</p>
      {saveStatus && <div style={{ background: "rgba(212,162,78,0.1)", borderRadius: 8, padding: "8px 16px", marginBottom: 24 }}><p style={{ fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: 12, margin: 0 }}>{saveStatus}</p></div>}
      <div style={{ background: T.bgCard, borderRadius: 16, padding: "24px 28px", border: "1px solid rgba(212,162,78,0.2)", maxWidth: 380, width: "100%", marginBottom: 16 }}>
        <p style={{ fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: 14, margin: "0 0 12px 0", fontWeight: 600 }}>📖 繼續你的故事旅程</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <a href="https://trip.wechurch.online" target="_blank" rel="noopener" style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "12px 16px", textDecoration: "none", border: "1px solid rgba(212,162,78,0.15)" }}>
            <span style={{ fontSize: 20 }}>🌍</span>
            <div><div style={{ fontFamily: "'Noto Sans TC'", color: T.goldLight, fontSize: 14, fontWeight: 600 }}>WeChurch 旅程平台</div><div style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 11 }}>探索聖經世界的數位旅程</div></div>
          </a>
          <a href="#" style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "12px 16px", textDecoration: "none", border: "1px solid rgba(212,162,78,0.15)" }}>
            <span style={{ fontSize: 20 }}>💬</span>
            <div><div style={{ fontFamily: "'Noto Sans TC'", color: T.goldLight, fontSize: 14, fontWeight: 600 }}>加入故事社群</div><div style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 11 }}>LINE 社群 · 每週更新</div></div>
          </a>
        </div>
      </div>
      <p style={{ fontFamily: "'Noto Sans TC'", color: "rgba(245,239,230,0.15)", fontSize: 12, marginTop: 32 }}>Wechurch · 讓每個生命的故事被聽見</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h2 style={{ fontFamily: "'Playfair Display',serif", color: T.gold, fontSize: 28, marginBottom: 4 }}>讓故事繼續</h2>
      <p style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 14, marginBottom: 24 }}>留下你的資料，讓我們保持聯繫</p>
      {fd.table && <div style={{ background: "rgba(212,162,78,0.1)", borderRadius: 20, padding: "6px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 6, border: "1px solid rgba(212,162,78,0.2)" }}>
        <span>{TABLE_EMOJIS[TABLES.indexOf(fd.table)] || "🍷"}</span>
        <span style={{ fontFamily: "'Noto Sans TC'", color: T.goldLight, fontSize: 13, fontWeight: 600 }}>{fd.table}桌</span>
      </div>}
      <div style={{ background: T.bgCard, borderRadius: 16, padding: 28, width: "100%", maxWidth: 400, border: "1px solid rgba(212,162,78,0.15)" }}>
        <div style={{ marginBottom: 16 }}><label style={{ fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>姓名</label><input value={fd.name} onChange={e => setFd(p => ({ ...p, name: e.target.value }))} placeholder="你的名字" style={is} onFocus={e => e.target.style.borderColor = T.gold} onBlur={e => e.target.style.borderColor = "rgba(212,162,78,0.2)"} /></div>
        <div style={{ marginBottom: 16 }}><label style={{ fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>聯繫方式（至少填一個）</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 13, minWidth: 40 }}>📱</span><input value={fd.phone} onChange={e => setFd(p => ({ ...p, phone: e.target.value }))} placeholder="手機號碼" style={{ ...is, marginBottom: 0 }} onFocus={e => e.target.style.borderColor = T.gold} onBlur={e => e.target.style.borderColor = "rgba(212,162,78,0.2)"} /></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 13, minWidth: 40 }}>IG</span><input value={fd.ig} onChange={e => setFd(p => ({ ...p, ig: e.target.value }))} placeholder="Instagram 帳號" style={{ ...is, marginBottom: 0 }} onFocus={e => e.target.style.borderColor = T.gold} onBlur={e => e.target.style.borderColor = "rgba(212,162,78,0.2)"} /></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontFamily: "'Noto Sans TC'", color: T.textMuted, fontSize: 13, minWidth: 40 }}>LINE</span><input value={fd.line} onChange={e => setFd(p => ({ ...p, line: e.target.value }))} placeholder="LINE ID" style={{ ...is, marginBottom: 0 }} onFocus={e => e.target.style.borderColor = T.gold} onBlur={e => e.target.style.borderColor = "rgba(212,162,78,0.2)"} /></div>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}><label style={{ fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: 13, fontWeight: 500, display: "block", marginBottom: 8 }}>你對什麼有興趣？（可複選）</label><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{interestOpts.map(opt => { const sel = fd.interests.includes(opt); return <button key={opt} onClick={() => setFd(p => ({ ...p, interests: sel ? p.interests.filter(x => x !== opt) : [...p.interests, opt] }))} style={{ background: sel ? "rgba(212,162,78,0.2)" : "rgba(255,255,255,0.03)", border: `1px solid ${sel ? T.gold : "rgba(212,162,78,0.15)"}`, borderRadius: 20, padding: "8px 16px", color: sel ? T.goldLight : T.textMuted, fontFamily: "'Noto Sans TC'", fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}>{opt}</button> })}</div></div>
        <div style={{ marginBottom: 20 }}><label style={{ fontFamily: "'Noto Sans TC'", color: T.warm, fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>給我們的回饋 💬</label><textarea value={fd.feedback} onChange={e => setFd(p => ({ ...p, feedback: e.target.value }))} placeholder="今晚的活動你覺得如何？" rows={3} style={{ ...is, resize: "vertical" }} onFocus={e => e.target.style.borderColor = T.gold} onBlur={e => e.target.style.borderColor = "rgba(212,162,78,0.2)"} /></div>
        {phase === "saving" && <div style={{ textAlign: "center", marginBottom: 12 }}><div style={{ fontFamily: "'Noto Sans TC'", color: T.amber, fontSize: 13 }}>{saveStatus}</div></div>}
        <GoldButton onClick={handleSubmit} disabled={!fd.name.trim() || phase === "saving"} style={{ width: "100%" }}>{phase === "saving" ? "儲存中..." : "送出 🙌"}</GoldButton>
      </div>
    </div>
  );
}

// ============ 主應用 ============

export default function PublicApp() {
  const [page, setPage] = useState("landing"); // landing, checkin, main
  const [myInfo, setMyInfo] = useState(null);
  const broadcast = useBroadcast();

  // Event state synced from admin via BroadcastChannel
  const [eventState, setEventState] = useState({
    screen: "landing",     // admin's current screen
    phase: "waiting",      // waiting, storytelling, voting, intermission, followup, gospel, done
    topic: "",
    storyteller: null,     // { id, name, tableName, tableEmoji }
    tableCount: 8,
    participantCount: 0,
    eventName: "",
    gospel: null,
  });

  // Listen for admin broadcasts
  useEffect(() => {
    broadcast.on("admin:state", (payload) => {
      setEventState(prev => ({ ...prev, ...payload }));
    });
    broadcast.on("admin:goto", (payload) => {
      // Admin can force participants to a specific page
      if (payload.page) setPage(payload.page);
    });
  }, [broadcast]);

  // Determine what to show based on admin state
  const getEffectivePage = () => {
    if (page === "landing" || page === "checkin") return page;
    // After check-in, follow admin's screen
    const s = eventState.screen;
    if (s === "followup") return "followup";
    if (s === "gospel") return "gospel";
    if (s?.startsWith("round") && eventState.phase === "storytelling") return "voting";
    return "waiting";
  };

  const effectivePage = getEffectivePage();

  const handleCheckedIn = (info) => {
    setMyInfo(info);
    setPage("main");
    broadcast.send("participant:checkin", { name: info.name, table: info.table });
  };

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Noto Sans TC',sans-serif", color: T.text, overflowX: "hidden" }}>
      <AnimatedBG />
      {effectivePage === "landing" && <LandingPage onNext={() => setPage("checkin")} />}
      {effectivePage === "checkin" && <CheckInPage onCheckedIn={handleCheckedIn} eventState={eventState} />}
      {effectivePage === "waiting" && <WaitingPage eventState={eventState} />}
      {effectivePage === "voting" && <VotingPage eventState={eventState} myInfo={myInfo} broadcast={broadcast} />}
      {effectivePage === "gospel" && <GospelPage eventState={eventState} />}
      {effectivePage === "followup" && <FollowUpPage myInfo={myInfo} broadcast={broadcast} />}
    </div>
  );
}
