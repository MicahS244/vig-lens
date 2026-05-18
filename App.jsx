import { useState } from "react";

// ─── UTILITY FUNCTIONS ────────────────────────────────────────────────────────

const americanToDecimal = (american) => {
  const a = parseFloat(american);
  if (isNaN(a)) return null;
  return a > 0 ? (a / 100) + 1 : (100 / Math.abs(a)) + 1;
};

const decimalToAmerican = (decimal) => {
  if (!decimal || decimal <= 1) return null;
  return decimal >= 2
    ? Math.round((decimal - 1) * 100)
    : Math.round(-100 / (decimal - 1));
};

const decimalToImplied = (decimal) => {
  if (!decimal || decimal <= 0) return null;
  return (1 / decimal) * 100;
};

const americanToImplied = (american) => {
  const d = americanToDecimal(american);
  return d ? decimalToImplied(d) : null;
};

// Remove vig from two-sided market using multiplicative method
const noVigProb = (impliedA, impliedB) => {
  const total = impliedA + impliedB;
  return { noVigA: (impliedA / total) * 100, noVigB: (impliedB / total) * 100 };
};

// Convert no-vig prob back to American odds
const probToAmerican = (prob) => {
  const decimal = 100 / prob;
  return decimalToAmerican(decimal);
};

const formatAmerican = (n) => {
  if (n === null || isNaN(n)) return "—";
  return n > 0 ? `+${n}` : `${n}`;
};

const formatPct = (n) => {
  if (n === null || isNaN(n)) return "—";
  return `${n.toFixed(2)}%`;
};

const edgeColor = (edge) => {
  if (edge === null || isNaN(edge)) return "#6b7280";
  if (edge >= 5) return "#00ff88";
  if (edge >= 2) return "#a3e635";
  if (edge >= 0) return "#facc15";
  return "#f87171";
};

const edgeBg = (edge) => {
  if (edge === null || isNaN(edge)) return "transparent";
  if (edge >= 5) return "rgba(0,255,136,0.08)";
  if (edge >= 2) return "rgba(163,230,53,0.06)";
  if (edge >= 0) return "rgba(250,204,21,0.05)";
  return "rgba(248,113,113,0.05)";
};

// ─── BOOK LIST ────────────────────────────────────────────────────────────────
const SOFT_BOOKS = ["FanDuel", "DraftKings", "BetMGM", "Caesars", "BetRivers", "PointsBet", "ESPN Bet"];

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function BettingModel() {
  const [activeTab, setActiveTab] = useState("compare");

  return (
    <div style={{
      fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      background: "#080c10",
      minHeight: "100vh",
      color: "#c9d1d9",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=IBM+Plex+Sans:wght@300;400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #0d1117; }
        ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 2px; }
        input, select { outline: none; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        .tab-btn { cursor: pointer; transition: all 0.15s; }
        .tab-btn:hover { color: #58a6ff !important; }
        .input-field {
          background: #0d1117;
          border: 1px solid #1e3a5f;
          border-radius: 4px;
          color: #e6edf3;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          padding: 7px 10px;
          width: 100%;
          transition: border 0.15s;
        }
        .input-field:focus { border-color: #58a6ff; }
        .input-field::placeholder { color: #3d5068; }
        .btn-primary {
          background: linear-gradient(135deg, #1a6bc4, #0e4a8a);
          border: 1px solid #2d7dd2;
          border-radius: 4px;
          color: #e6edf3;
          cursor: pointer;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.05em;
          padding: 8px 18px;
          transition: all 0.15s;
          text-transform: uppercase;
        }
        .btn-primary:hover { background: linear-gradient(135deg, #2177d4, #1258a0); box-shadow: 0 0 12px rgba(45,125,210,0.3); }
        .btn-danger {
          background: transparent;
          border: 1px solid #3d1a1a;
          border-radius: 4px;
          color: #f87171;
          cursor: pointer;
          font-size: 11px;
          padding: 4px 8px;
          transition: all 0.15s;
        }
        .btn-danger:hover { background: rgba(248,113,113,0.1); border-color: #f87171; }
        .btn-sm {
          background: #0d1117;
          border: 1px solid #1e3a5f;
          border-radius: 3px;
          color: #8b949e;
          cursor: pointer;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          padding: 3px 8px;
          transition: all 0.15s;
        }
        .btn-sm:hover { border-color: #58a6ff; color: #58a6ff; }
        .card {
          background: #0d1117;
          border: 1px solid #1a2a3a;
          border-radius: 6px;
          padding: 16px;
        }
        .glow-green { box-shadow: 0 0 20px rgba(0,255,136,0.1); border-color: rgba(0,255,136,0.2) !important; }
        .pulse {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .fade-in {
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        label { font-size: 11px; color: #8b949e; letter-spacing: 0.08em; text-transform: uppercase; display: block; margin-bottom: 5px; }
        .tag {
          border-radius: 3px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          padding: 2px 7px;
          text-transform: uppercase;
        }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1a2a3a", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00ff88", boxShadow: "0 0 8px #00ff88" }} className="pulse" />
          <span style={{ fontFamily: "'IBM Plex Mono'", fontWeight: 700, fontSize: 15, color: "#e6edf3", letterSpacing: "0.12em" }}>SHARPLINE</span>
          <span style={{ color: "#3d5068", fontSize: 11 }}>// CLV & EDGE CALCULATOR</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { id: "compare", label: "BOOK COMPARE" },
            { id: "prizepicks", label: "PRIZEPICKS" },
            { id: "clv", label: "CLV TRACKER" },
            { id: "converter", label: "CONVERTER" },
          ].map(t => (
            <button
              key={t.id}
              className="tab-btn"
              onClick={() => setActiveTab(t.id)}
              style={{
                background: activeTab === t.id ? "rgba(88,166,255,0.1)" : "transparent",
                border: activeTab === t.id ? "1px solid rgba(88,166,255,0.35)" : "1px solid transparent",
                borderRadius: 4,
                color: activeTab === t.id ? "#58a6ff" : "#6b7280",
                cursor: "pointer",
                fontSize: 11,
                fontFamily: "'IBM Plex Mono'",
                fontWeight: 600,
                letterSpacing: "0.07em",
                padding: "5px 12px",
              }}
            >{t.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "20px", maxWidth: 1200, margin: "0 auto" }}>
        {activeTab === "compare" && <BookCompare />}
        {activeTab === "prizepicks" && <PrizePicksScanner />}
        {activeTab === "clv" && <CLVTracker />}
        {activeTab === "converter" && <OddsConverter />}
      </div>
    </div>
  );
}

// ─── BOOK COMPARE TAB ─────────────────────────────────────────────────────────
function BookCompare() {
  const [pinnacleA, setPinnacleA] = useState("");
  const [pinnacleB, setPinnacleB] = useState("");
  const [bookLines, setBookLines] = useState(
    SOFT_BOOKS.map(name => ({ name, oddsA: "", oddsB: "" }))
  );
  const [labelA, setLabelA] = useState("SIDE A");
  const [labelB, setLabelB] = useState("SIDE B");
  const [sport, setSport] = useState("");

  const impA = americanToImplied(pinnacleA);
  const impB = americanToImplied(pinnacleB);
  const hasVig = impA && impB;
  const { noVigA, noVigB } = hasVig ? noVigProb(impA, impB) : { noVigA: null, noVigB: null };
  const noVigAmA = noVigA ? probToAmerican(noVigA) : null;
  const noVigAmB = noVigB ? probToAmerican(noVigB) : null;
  const vigPct = hasVig ? (impA + impB - 100).toFixed(2) : null;

  const calcEdge = (odds, noVigProb) => {
    const implied = americanToImplied(odds);
    if (!implied || !noVigProb) return null;
    return noVigProb - implied;
  };

  return (
    <div className="fade-in">
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3", letterSpacing: "0.05em" }}>BOOK COMPARISON</div>
          <div style={{ fontSize: 11, color: "#3d5068", marginTop: 2 }}>No-vig Pinnacle fair odds vs soft books · spot your edge</div>
        </div>
        <input className="input-field" placeholder="Event / Market label..." value={sport} onChange={e => setSport(e.target.value)} style={{ width: 220 }} />
      </div>

      {/* Pinnacle Input */}
      <div className="card" style={{ marginBottom: 14, border: "1px solid #1a3a5a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ background: "#0e3a6a", border: "1px solid #1a5a9a", borderRadius: 3, padding: "2px 10px", fontSize: 11, fontWeight: 700, color: "#58a6ff", letterSpacing: "0.08em" }}>PINNACLE (SHARP)</div>
          <div style={{ fontSize: 11, color: "#3d5068" }}>Enter both sides to auto-remove vig</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 140px 140px", gap: 12 }}>
          <div>
            <label>Side A Label</label>
            <input className="input-field" value={labelA} onChange={e => setLabelA(e.target.value)} placeholder="e.g. Chiefs ML" />
          </div>
          <div>
            <label>Side B Label</label>
            <input className="input-field" value={labelB} onChange={e => setLabelB(e.target.value)} placeholder="e.g. Eagles ML" />
          </div>
          <div>
            <label>Side A Odds (American)</label>
            <input className="input-field" type="number" value={pinnacleA} onChange={e => setPinnacleA(e.target.value)} placeholder="-110 or +120" />
          </div>
          <div>
            <label>Side B Odds (American)</label>
            <input className="input-field" type="number" value={pinnacleB} onChange={e => setPinnacleB(e.target.value)} placeholder="-110 or +120" />
          </div>
        </div>

        {/* Fair Odds Output */}
        {hasVig && (
          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <StatPill label="Vig" value={`${vigPct}%`} color="#facc15" />
            <StatPill label={`${labelA} Implied`} value={formatPct(impA)} color="#8b949e" />
            <StatPill label={`${labelB} Implied`} value={formatPct(impB)} color="#8b949e" />
            <StatPill label={`${labelA} Fair`} value={formatAmerican(noVigAmA)} color="#00ff88" />
            <StatPill label={`${labelB} Fair`} value={formatAmerican(noVigAmB)} color="#00ff88" />
            <StatPill label={`${labelA} No-Vig%`} value={formatPct(noVigA)} color="#a3e635" />
            <StatPill label={`${labelB} No-Vig%`} value={formatPct(noVigB)} color="#a3e635" />
          </div>
        )}
      </div>

      {/* Book Comparison Table */}
      <div className="card">
        <div style={{ fontSize: 11, fontWeight: 600, color: "#8b949e", letterSpacing: "0.08em", marginBottom: 12 }}>SOFT BOOK LINES — EDGE VS PINNACLE NO-VIG</div>
        <div style={{ display: "grid", gridTemplateColumns: "110px 1fr 1fr 100px 100px 100px", gap: 0, borderRadius: 4, overflow: "hidden", border: "1px solid #1a2a3a" }}>
          {/* Header */}
          {["BOOK", `SIDE A ODDS`, `SIDE B ODDS`, "EDGE A", "EDGE B", "BEST SIDE"].map((h, i) => (
            <div key={i} style={{ background: "#0a0f14", borderBottom: "1px solid #1a2a3a", borderRight: i < 5 ? "1px solid #1a2a3a" : "none", color: "#3d5068", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", padding: "8px 10px", textAlign: i > 2 ? "center" : "left" }}>{h}</div>
          ))}
          {/* Rows */}
          {bookLines.map((book, idx) => {
            const edgeA = calcEdge(book.oddsA, noVigA);
            const edgeB = calcEdge(book.oddsB, noVigB);
            const bestSide = (edgeA !== null && edgeB !== null)
              ? (edgeA >= edgeB ? (edgeA > 0 ? labelA : null) : (edgeB > 0 ? labelB : null))
              : null;
            const rowBg = idx % 2 === 0 ? "#0d1117" : "#080c10";
            return [
              <div key={`n${idx}`} style={{ background: rowBg, borderBottom: "1px solid #0f1923", borderRight: "1px solid #1a2a3a", padding: "10px 10px", display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#c9d1d9" }}>{book.name}</span>
              </div>,
              <div key={`a${idx}`} style={{ background: rowBg, borderBottom: "1px solid #0f1923", borderRight: "1px solid #1a2a3a", padding: "6px 8px" }}>
                <input className="input-field" type="number" value={book.oddsA} onChange={e => {
                  const updated = [...bookLines];
                  updated[idx] = { ...updated[idx], oddsA: e.target.value };
                  setBookLines(updated);
                }} placeholder="-110" style={{ fontSize: 12 }} />
              </div>,
              <div key={`b${idx}`} style={{ background: rowBg, borderBottom: "1px solid #0f1923", borderRight: "1px solid #1a2a3a", padding: "6px 8px" }}>
                <input className="input-field" type="number" value={book.oddsB} onChange={e => {
                  const updated = [...bookLines];
                  updated[idx] = { ...updated[idx], oddsB: e.target.value };
                  setBookLines(updated);
                }} placeholder="-110" style={{ fontSize: 12 }} />
              </div>,
              <EdgeCell key={`ea${idx}`} edge={edgeA} rowBg={rowBg} isLast={false} />,
              <EdgeCell key={`eb${idx}`} edge={edgeB} rowBg={rowBg} isLast={false} />,
              <div key={`bs${idx}`} style={{ background: bestSide ? edgeBg(Math.max(edgeA || 0, edgeB || 0)) : rowBg, borderBottom: "1px solid #0f1923", padding: "10px 10px", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {bestSide
                  ? <span style={{ fontSize: 11, fontWeight: 700, color: edgeColor(Math.max(edgeA || 0, edgeB || 0)), letterSpacing: "0.06em" }}>{bestSide}</span>
                  : <span style={{ color: "#2d3d4d", fontSize: 10 }}>—</span>}
              </div>,
            ];
          })}
        </div>
        <div style={{ marginTop: 10, display: "flex", gap: 14, flexWrap: "wrap" }}>
          <LegendItem color="#00ff88" label="Edge ≥ 5% — Strong Value" />
          <LegendItem color="#a3e635" label="Edge 2-5% — Good Value" />
          <LegendItem color="#facc15" label="Edge 0-2% — Marginal" />
          <LegendItem color="#f87171" label="Negative Edge — Avoid" />
        </div>
      </div>
    </div>
  );
}

function EdgeCell({ edge, rowBg, isLast }) {
  return (
    <div style={{
      background: edge !== null ? edgeBg(edge) : rowBg,
      borderBottom: "1px solid #0f1923",
      borderRight: isLast ? "none" : "1px solid #1a2a3a",
      padding: "10px 10px",
      textAlign: "center",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      {edge !== null
        ? <span style={{ fontSize: 12, fontWeight: 700, color: edgeColor(edge) }}>{edge >= 0 ? "+" : ""}{edge.toFixed(2)}%</span>
        : <span style={{ color: "#2d3d4d", fontSize: 10 }}>—</span>}
    </div>
  );
}

// ─── PRIZEPICKS SCANNER ───────────────────────────────────────────────────────
function PrizePicksScanner() {
  const emptyProp = () => ({
    id: Date.now() + Math.random(),
    player: "", stat: "", line: "", sport: "",
    pinnacleOver: "", pinnacleUnder: "",
    ppLine: "", ppAdjusted: "",
    notes: "", bookmarked: false,
  });

  const [props, setProps] = useState([emptyProp()]);
  const [filter, setFilter] = useState("all");

  const updateProp = (id, field, value) => {
    setProps(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };
  const addProp = () => setProps(prev => [...prev, emptyProp()]);
  const removeProp = (id) => setProps(prev => prev.filter(p => p.id !== id));
  const toggleBookmark = (id) => setProps(prev => prev.map(p => p.id === id ? { ...p, bookmarked: !p.bookmarked } : p));

  const calcPropEdge = (prop) => {
    const impOver = americanToImplied(prop.pinnacleOver);
    const impUnder = americanToImplied(prop.pinnacleUnder);
    if (!impOver || !impUnder) return null;
    const { noVigA: noVigOver, noVigB: noVigUnder } = noVigProb(impOver, impUnder);

    const ppLine = parseFloat(prop.ppLine);
    const pinnLine = parseFloat(prop.line);

    let edge = null;
    let side = null;

    // If PP line equals Pinnacle line, compare implied
    if (!isNaN(ppLine) && !isNaN(pinnLine) && ppLine === pinnLine) {
      // PP is always ~-110 equivalent (no juice), but no-vig gives us fair prob
      // PP pays +100 (pick 2+) effectively, so edge = fair prob - 50%
      edge = noVigOver - 50;
      side = edge > 0 ? "OVER" : "UNDER";
    } else if (!isNaN(ppLine) && !isNaN(pinnLine)) {
      // Line discrepancy — adjust
      const diff = ppLine - pinnLine;
      edge = diff < 0 ? noVigOver - 50 : noVigUnder - 50;
      side = diff < 0 ? "OVER" : "UNDER";
    }

    return { noVigOver, noVigUnder, edge, side };
  };

  const filteredProps = props.filter(p => {
    if (filter === "bookmarked") return p.bookmarked;
    if (filter === "value") {
      const r = calcPropEdge(p);
      return r && r.edge !== null && Math.abs(r.edge) >= 2;
    }
    return true;
  });

  return (
    <div className="fade-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3", letterSpacing: "0.05em" }}>PRIZEPICKS SCANNER</div>
          <div style={{ fontSize: 11, color: "#3d5068", marginTop: 2 }}>Track DFS props vs sharp book lines · catch stale PrizePicks numbers</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["all", "value", "bookmarked"].map(f => (
            <button key={f} className="btn-sm" onClick={() => setFilter(f)} style={{ borderColor: filter === f ? "#58a6ff" : undefined, color: filter === f ? "#58a6ff" : undefined }}>
              {f.toUpperCase()}
            </button>
          ))}
          <button className="btn-primary" onClick={addProp}>+ ADD PROP</button>
        </div>
      </div>

      {/* Legend */}
      <div className="card" style={{ marginBottom: 12, padding: "10px 14px" }}>
        <div style={{ fontSize: 10, color: "#3d5068", lineHeight: 1.8 }}>
          <span style={{ color: "#facc15", fontWeight: 600 }}>HOW TO USE: </span>
          Enter the player prop stat line from Pinnacle (or sharpest available book) with both Over and Under juice. Enter the PrizePicks line for the same stat. Edge is calculated as: (Fair Over% − 50%) for the side you'd pick. PrizePicks lines often lag 15–30 min behind sharp books — this catches that window.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filteredProps.map(prop => (
          <PropRow key={prop.id} prop={prop} updateProp={updateProp} removeProp={removeProp} toggleBookmark={toggleBookmark} calcPropEdge={calcPropEdge} />
        ))}
        {filteredProps.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: "#3d5068", fontSize: 12 }}>No props match this filter.</div>
        )}
      </div>

      <button className="btn-primary" onClick={addProp} style={{ marginTop: 14, width: "100%" }}>+ ADD ANOTHER PROP</button>
    </div>
  );
}

function PropRow({ prop, updateProp, removeProp, toggleBookmark, calcPropEdge }) {
  const result = calcPropEdge(prop);

  return (
    <div className="card fade-in" style={{
      border: result?.edge && Math.abs(result.edge) >= 3 ? "1px solid rgba(0,255,136,0.2)" : "1px solid #1a2a3a",
      background: result?.edge && Math.abs(result.edge) >= 3 ? "rgba(0,255,136,0.02)" : "#0d1117",
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px 90px 90px 90px 90px 1fr", gap: 10, alignItems: "end" }}>
        <div>
          <label>Player Name</label>
          <input className="input-field" value={prop.player} onChange={e => updateProp(prop.id, "player", e.target.value)} placeholder="e.g. Shai Gilgeous-Alexander" />
        </div>
        <div>
          <label>Stat / Market</label>
          <input className="input-field" value={prop.stat} onChange={e => updateProp(prop.id, "stat", e.target.value)} placeholder="e.g. Points, Rebounds, PRA" />
        </div>
        <div>
          <label>Sharp Line</label>
          <input className="input-field" type="number" value={prop.line} onChange={e => updateProp(prop.id, "line", e.target.value)} placeholder="26.5" />
        </div>
        <div>
          <label>PIN Over</label>
          <input className="input-field" type="number" value={prop.pinnacleOver} onChange={e => updateProp(prop.id, "pinnacleOver", e.target.value)} placeholder="-115" />
        </div>
        <div>
          <label>PIN Under</label>
          <input className="input-field" type="number" value={prop.pinnacleUnder} onChange={e => updateProp(prop.id, "pinnacleUnder", e.target.value)} placeholder="-107" />
        </div>
        <div>
          <label>PP Line</label>
          <input className="input-field" type="number" value={prop.ppLine} onChange={e => updateProp(prop.id, "ppLine", e.target.value)} placeholder="27.5" />
        </div>
        <div>
          <label>Sport</label>
          <input className="input-field" value={prop.sport} onChange={e => updateProp(prop.id, "sport", e.target.value)} placeholder="NBA" />
        </div>
        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", paddingBottom: 2 }}>
          <button className="btn-sm" onClick={() => toggleBookmark(prop.id)} style={{ color: prop.bookmarked ? "#facc15" : undefined, borderColor: prop.bookmarked ? "#facc15" : undefined }}>
            {prop.bookmarked ? "★" : "☆"}
          </button>
          <button className="btn-danger" onClick={() => removeProp(prop.id)}>✕</button>
        </div>
      </div>

      {/* Results row */}
      {result && (
        <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {result.noVigOver && <StatPill label="Fair Over%" value={formatPct(result.noVigOver)} color="#58a6ff" />}
          {result.noVigUnder && <StatPill label="Fair Under%" value={formatPct(result.noVigUnder)} color="#58a6ff" />}
          {result.edge !== null && (
            <>
              <StatPill label="Edge" value={`${result.edge >= 0 ? "+" : ""}${result.edge.toFixed(2)}%`} color={edgeColor(Math.abs(result.edge) > 0 ? result.edge : -1)} />
              {result.side && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: edgeBg(result.edge), border: `1px solid ${edgeColor(result.edge)}33`, borderRadius: 4, padding: "4px 10px" }}>
                  <span style={{ fontSize: 10, color: "#8b949e", letterSpacing: "0.06em" }}>PLAY:</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: edgeColor(result.edge), letterSpacing: "0.08em" }}>{result.side} {prop.ppLine || prop.line}</span>
                  {prop.player && <span style={{ fontSize: 10, color: "#6b7280" }}>{prop.player} {prop.stat}</span>}
                </div>
              )}
              {parseFloat(prop.ppLine) !== parseFloat(prop.line) && prop.ppLine && prop.line && (
                <div className="tag" style={{ background: "rgba(250,204,21,0.1)", border: "1px solid rgba(250,204,21,0.25)", color: "#facc15" }}>
                  LINE MISMATCH: PIN {prop.line} vs PP {prop.ppLine}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Notes */}
      <div style={{ marginTop: 8 }}>
        <input className="input-field" value={prop.notes} onChange={e => updateProp(prop.id, "notes", e.target.value)} placeholder="Notes..." style={{ fontSize: 11, color: "#6b7280", borderColor: "#0f1923" }} />
      </div>
    </div>
  );
}

// ─── CLV TRACKER ──────────────────────────────────────────────────────────────
function CLVTracker() {
  const emptyBet = () => ({
    id: Date.now() + Math.random(),
    date: new Date().toISOString().split("T")[0],
    event: "", market: "", book: "FanDuel",
    side: "", betOdds: "", closingOdds: "",
    stake: "", result: "pending",
  });

  const [bets, setBets] = useState([]);
  const [newBet, setNewBet] = useState(emptyBet());

  const addBet = () => {
    if (!newBet.betOdds) return;
    setBets(prev => [{ ...newBet, id: Date.now() }, ...prev]);
    setNewBet(emptyBet());
  };

  const updateBet = (id, field, value) => {
    setBets(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const removeBet = (id) => setBets(prev => prev.filter(b => b.id !== id));

  const calcCLV = (betOdds, closingOdds) => {
    const betImp = americanToImplied(betOdds);
    const closingImp = americanToImplied(closingOdds);
    if (!betImp || !closingImp) return null;
    return closingImp - betImp; // positive = beat the close
  };

  const stats = bets.reduce((acc, b) => {
    const clv = calcCLV(b.betOdds, b.closingOdds);
    if (clv !== null) {
      acc.total++;
      if (clv > 0) acc.positive++;
      acc.totalCLV += clv;
    }
    if (b.result === "win") acc.wins++;
    if (b.result === "loss") acc.losses++;
    if (b.stake && !isNaN(parseFloat(b.stake))) {
      if (b.result === "win") {
        const dec = americanToDecimal(b.betOdds);
        acc.profit += parseFloat(b.stake) * (dec - 1);
      } else if (b.result === "loss") {
        acc.profit -= parseFloat(b.stake);
      }
    }
    return acc;
  }, { total: 0, positive: 0, totalCLV: 0, wins: 0, losses: 0, profit: 0 });

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3", letterSpacing: "0.05em" }}>CLV TRACKER</div>
        <div style={{ fontSize: 11, color: "#3d5068", marginTop: 2 }}>Closing Line Value — the gold standard for measuring long-term +EV betting</div>
      </div>

      {/* Stats Bar */}
      {bets.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 14 }}>
          {[
            { label: "BETS TRACKED", value: bets.length },
            { label: "CLV RATE", value: stats.total > 0 ? `${((stats.positive / stats.total) * 100).toFixed(0)}%` : "—", color: "#00ff88" },
            { label: "AVG CLV", value: stats.total > 0 ? `${stats.totalCLV >= 0 ? "+" : ""}${(stats.totalCLV / stats.total).toFixed(2)}%` : "—", color: stats.totalCLV >= 0 ? "#00ff88" : "#f87171" },
            { label: "WIN/LOSS", value: `${stats.wins}W / ${stats.losses}L` },
            { label: "P&L", value: `$${stats.profit >= 0 ? "+" : ""}${stats.profit.toFixed(2)}`, color: stats.profit >= 0 ? "#00ff88" : "#f87171" },
          ].map((s, i) => (
            <div key={i} className="card" style={{ textAlign: "center", padding: "12px 10px" }}>
              <div style={{ fontSize: 10, color: "#3d5068", letterSpacing: "0.08em", marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: s.color || "#e6edf3" }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Add Bet Form */}
      <div className="card" style={{ marginBottom: 14, border: "1px solid #1a3a5a" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#58a6ff", letterSpacing: "0.08em", marginBottom: 12 }}>LOG NEW BET</div>
        <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr 1fr 90px 90px 90px 90px 90px", gap: 10, alignItems: "end" }}>
          <div><label>Date</label><input className="input-field" type="date" value={newBet.date} onChange={e => setNewBet(p => ({ ...p, date: e.target.value }))} /></div>
          <div><label>Event</label><input className="input-field" value={newBet.event} onChange={e => setNewBet(p => ({ ...p, event: e.target.value }))} placeholder="Chiefs vs Eagles" /></div>
          <div><label>Market / Side</label><input className="input-field" value={newBet.side} onChange={e => setNewBet(p => ({ ...p, side: e.target.value }))} placeholder="Chiefs ML" /></div>
          <div>
            <label>Book</label>
            <select className="input-field" value={newBet.book} onChange={e => setNewBet(p => ({ ...p, book: e.target.value }))}>
              {SOFT_BOOKS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div><label>Bet Odds</label><input className="input-field" type="number" value={newBet.betOdds} onChange={e => setNewBet(p => ({ ...p, betOdds: e.target.value }))} placeholder="-110" /></div>
          <div><label>Closing Odds</label><input className="input-field" type="number" value={newBet.closingOdds} onChange={e => setNewBet(p => ({ ...p, closingOdds: e.target.value }))} placeholder="-125" /></div>
          <div><label>Stake ($)</label><input className="input-field" type="number" value={newBet.stake} onChange={e => setNewBet(p => ({ ...p, stake: e.target.value }))} placeholder="100" /></div>
          <div>
            <label>Result</label>
            <select className="input-field" value={newBet.result} onChange={e => setNewBet(p => ({ ...p, result: e.target.value }))}>
              <option value="pending">Pending</option>
              <option value="win">Win</option>
              <option value="loss">Loss</option>
              <option value="push">Push</option>
            </select>
          </div>
          <div style={{ paddingBottom: 2 }}>
            <button className="btn-primary" onClick={addBet} style={{ width: "100%", padding: "8px 0" }}>LOG</button>
          </div>
        </div>
      </div>

      {/* Bet Log */}
      {bets.length > 0 && (
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 600, color: "#8b949e", letterSpacing: "0.08em", marginBottom: 10 }}>BET LOG</div>
          <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 1fr 80px 80px 80px 80px 80px 60px 36px", gap: 0, borderRadius: 4, overflow: "hidden", border: "1px solid #1a2a3a" }}>
            {["DATE", "EVENT", "MARKET/SIDE", "BOOK", "BET ODDS", "CLOSE", "CLV", "STAKE", "RESULT", ""].map((h, i) => (
              <div key={i} style={{ background: "#0a0f14", borderBottom: "1px solid #1a2a3a", borderRight: i < 9 ? "1px solid #1a2a3a" : "none", color: "#3d5068", fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", padding: "7px 8px" }}>{h}</div>
            ))}
            {bets.map((b, idx) => {
              const clv = calcCLV(b.betOdds, b.closingOdds);
              const rowBg = idx % 2 === 0 ? "#0d1117" : "#080c10";
              const cells = [
                <span style={{ fontSize: 11, color: "#6b7280" }}>{b.date}</span>,
                <span style={{ fontSize: 11, color: "#c9d1d9" }}>{b.event}</span>,
                <span style={{ fontSize: 11, color: "#8b949e" }}>{b.side}</span>,
                <span style={{ fontSize: 11, color: "#6b7280" }}>{b.book}</span>,
                <span style={{ fontSize: 12, fontWeight: 600, color: "#e6edf3" }}>{formatAmerican(parseFloat(b.betOdds))}</span>,
                <span style={{ fontSize: 12, color: "#8b949e" }}>{b.closingOdds ? formatAmerican(parseFloat(b.closingOdds)) : "—"}</span>,
                <span style={{ fontSize: 12, fontWeight: 700, color: clv !== null ? edgeColor(clv) : "#3d5068" }}>{clv !== null ? `${clv >= 0 ? "+" : ""}${clv.toFixed(2)}%` : "—"}</span>,
                <span style={{ fontSize: 11, color: "#6b7280" }}>{b.stake ? `$${b.stake}` : "—"}</span>,
                <select style={{ background: "transparent", border: "none", color: b.result === "win" ? "#00ff88" : b.result === "loss" ? "#f87171" : b.result === "push" ? "#facc15" : "#6b7280", fontSize: 11, fontFamily: "'IBM Plex Mono'", cursor: "pointer", width: "100%" }} value={b.result} onChange={e => updateBet(b.id, "result", e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="win">Win ✓</option>
                  <option value="loss">Loss ✗</option>
                  <option value="push">Push</option>
                </select>,
                <button className="btn-danger" onClick={() => removeBet(b.id)} style={{ border: "none", fontSize: 10 }}>✕</button>,
              ];
              return cells.map((cell, ci) => (
                <div key={ci} style={{ background: rowBg, borderBottom: "1px solid #0f1923", borderRight: ci < 9 ? "1px solid #1a2a3a" : "none", padding: "9px 8px", display: "flex", alignItems: "center" }}>{cell}</div>
              ));
            })}
          </div>
        </div>
      )}

      {bets.length === 0 && (
        <div style={{ textAlign: "center", padding: 50, color: "#3d5068", fontSize: 12 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>📋</div>
          <div>No bets logged yet. Track your first bet above.</div>
          <div style={{ fontSize: 10, marginTop: 6, color: "#2d3d4d" }}>CLV = how much better your odds were vs closing line. Positive CLV over time = +EV bettor.</div>
        </div>
      )}
    </div>
  );
}

// ─── ODDS CONVERTER ───────────────────────────────────────────────────────────
function OddsConverter() {
  const [american, setAmerican] = useState("");
  const [decimal, setDecimalVal] = useState("");
  const [implied, setImplied] = useState("");

  const fromAmerican = (v) => {
    setAmerican(v);
    const d = americanToDecimal(v);
    if (d) {
      setDecimalVal(d.toFixed(4));
      setImplied((decimalToImplied(d)).toFixed(4));
    } else { setDecimalVal(""); setImplied(""); }
  };

  const fromDecimal = (v) => {
    setDecimalVal(v);
    const d = parseFloat(v);
    if (!isNaN(d) && d > 1) {
      const a = decimalToAmerican(d);
      setAmerican(a !== null ? String(a) : "");
      setImplied((decimalToImplied(d)).toFixed(4));
    }
  };

  const fromImplied = (v) => {
    setImplied(v);
    const prob = parseFloat(v);
    if (!isNaN(prob) && prob > 0 && prob < 100) {
      const d = 100 / prob;
      setDecimalVal(d.toFixed(4));
      const a = decimalToAmerican(d);
      setAmerican(a !== null ? String(a) : "");
    }
  };

  const dec = parseFloat(decimal);
  const imp = parseFloat(implied);
  const ev100 = dec ? ((dec - 1) * 100 - 100).toFixed(2) : null;

  return (
    <div className="fade-in" style={{ maxWidth: 520 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3", letterSpacing: "0.05em" }}>ODDS CONVERTER</div>
        <div style={{ fontSize: 11, color: "#3d5068", marginTop: 2 }}>American · Decimal · Implied Probability</div>
      </div>

      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label>American Odds</label>
          <input className="input-field" type="number" value={american} onChange={e => fromAmerican(e.target.value)} placeholder="-110  or  +150" style={{ fontSize: 18, fontWeight: 700 }} />
          <div style={{ fontSize: 10, color: "#3d5068", marginTop: 4 }}>Negative = favorite, Positive = underdog</div>
        </div>
        <div>
          <label>Decimal Odds</label>
          <input className="input-field" type="number" value={decimal} onChange={e => fromDecimal(e.target.value)} placeholder="1.9091" style={{ fontSize: 18, fontWeight: 700 }} />
          <div style={{ fontSize: 10, color: "#3d5068", marginTop: 4 }}>European format · payout per $1 stake including stake</div>
        </div>
        <div>
          <label>Implied Probability (%)</label>
          <input className="input-field" type="number" value={implied} onChange={e => fromImplied(e.target.value)} placeholder="52.38" style={{ fontSize: 18, fontWeight: 700 }} />
          <div style={{ fontSize: 10, color: "#3d5068", marginTop: 4 }}>Probability the market implies for this outcome</div>
        </div>

        {dec > 1 && (
          <div style={{ borderTop: "1px solid #1a2a3a", paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 11, color: "#3d5068", letterSpacing: "0.08em" }}>PAYOUT ON $100 STAKE</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <StatPill label="Profit" value={`$${((dec - 1) * 100).toFixed(2)}`} color="#00ff88" />
              <StatPill label="Return" value={`$${(dec * 100).toFixed(2)}`} color="#58a6ff" />
              <StatPill label="True Prob" value={formatPct(imp)} color="#a3e635" />
            </div>

            {/* Kelly Criterion */}
            <div style={{ borderTop: "1px solid #1a2a3a", paddingTop: 12, marginTop: 4 }}>
              <KellyCalc decimal={dec} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function KellyCalc({ decimal }) {
  const [edgePct, setEdgePct] = useState("2");
  const [bankroll, setBankroll] = useState("1000");
  const edge = parseFloat(edgePct) / 100;
  const b = decimal - 1;
  const p = edge + (1 / decimal); // approximate
  const q = 1 - p;
  const kelly = ((b * p - q) / b);
  const halfKelly = kelly / 2;
  const br = parseFloat(bankroll);

  return (
    <div>
      <div style={{ fontSize: 11, color: "#3d5068", letterSpacing: "0.08em", marginBottom: 10 }}>KELLY CRITERION STAKE SIZING</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <div>
          <label>Your Edge (%)</label>
          <input className="input-field" type="number" value={edgePct} onChange={e => setEdgePct(e.target.value)} placeholder="2" />
        </div>
        <div>
          <label>Bankroll ($)</label>
          <input className="input-field" type="number" value={bankroll} onChange={e => setBankroll(e.target.value)} placeholder="1000" />
        </div>
      </div>
      {kelly > 0 && !isNaN(kelly) && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <StatPill label="Full Kelly %" value={`${(kelly * 100).toFixed(2)}%`} color="#facc15" />
          <StatPill label="Half Kelly %" value={`${(halfKelly * 100).toFixed(2)}%`} color="#a3e635" />
          {!isNaN(br) && <StatPill label="Half Kelly $" value={`$${(halfKelly * br).toFixed(2)}`} color="#00ff88" />}
        </div>
      )}
      <div style={{ fontSize: 10, color: "#2d3d4d", marginTop: 8 }}>Most professionals use ¼–½ Kelly to reduce variance. Full Kelly maximizes growth rate but causes high drawdowns.</div>
    </div>
  );
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function StatPill({ label, value, color }) {
  return (
    <div style={{ background: "#080c10", border: "1px solid #1a2a3a", borderRadius: 4, padding: "5px 10px", display: "flex", alignItems: "center", gap: 7 }}>
      <span style={{ fontSize: 10, color: "#3d5068", letterSpacing: "0.07em", textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: color || "#e6edf3" }}>{value}</span>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
      <span style={{ fontSize: 10, color: "#6b7280" }}>{label}</span>
    </div>
  );
}
