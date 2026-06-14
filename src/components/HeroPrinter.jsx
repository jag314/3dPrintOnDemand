import { useEffect, useState } from "react";

const HUD_TAGS = [
  { lines: ["FILAMENT // PLA+",  "DIAM: 1.75mm",        "SPOOL: 82% REMAINING"],          pos: { top: "8%",    right: "2%"  }, delay: "0s"   },
  { lines: ["HOTEND // ACTIVE",  "TEMP: 215°C",          "SPEED: 500mm/s", "FAN: 100%"],   pos: { top: "30%",   right: "0%"  }, delay: "1.2s" },
  { lines: ["NOZZLE: 0.4mm",    "LAYER: 0047/120",      "H: 0.20mm"],                     pos: { top: "48%",   right: "2%"  }, delay: "2.0s" },
  { lines: ["SYS // INITY3D",   "CR-UNIT-001",           "PWR: 98.3%"],                    pos: { top: "12%",   left:  "0%"  }, delay: "0.6s" },
  { lines: ["BUILD: 39.2%",     "ETA: 01:23:44",         "STATUS: PRINTING"],              pos: { top: "58%",   left:  "2%"  }, delay: "1.8s" },
  { lines: ["BED TEMP: 60°C",   "VOL: 260×260×300mm",   "ADHESION: OK"],                  pos: { bottom: "18%",left:  "5%"  }, delay: "3.0s" },
];

// 4 leader lines [anchorX%, anchorY%, tagEdgeX%, tagEdgeY%] in container-percentage space
// Calculated for a ~580×700px container with the printer centered via xMidYMid meet
const LEADER_LINES = [
  [52, 14, 70, 11],   // spool center → FILAMENT tag left edge
  [58, 37, 70, 33],   // hotend center → HOTEND tag left edge
  [42, 16, 22, 15],   // frame top-left → SYS tag right edge
  [58, 58, 27, 84],   // bed center → BED TEMP tag right edge
];

const CSS = `
  @keyframes hp-slide {
    0%, 100% { transform: translate(200px, 213px); }
    50%       { transform: translate(300px, 213px); }
  }
  @keyframes hp-spool-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes hp-dash-move {
    from { stroke-dashoffset: 0; }
    to   { stroke-dashoffset: -28; }
  }
  @keyframes hp-layer-blink {
    0%, 85%  { opacity: 1; }
    90%, 95% { opacity: 0.1; }
    100%     { opacity: 1; }
  }
  @keyframes hp-nozzle-pulse {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0.35; }
  }
  @keyframes hp-rail-breathe {
    0%, 100% { opacity: 0.75; }
    50%      { opacity: 1; }
  }
  @keyframes hp-hud-blink {
    0%, 88%  { opacity: 1;   border-color: #7c3aed; }
    92%, 96% { opacity: 0.3; border-color: #4c1d95; }
    100%     { opacity: 1;   border-color: #7c3aed; }
  }

  /* Print head slides on X rail; initial transform must match 0% keyframe */
  .hp-printhead {
    transform: translate(200px, 213px);
    animation: hp-slide 4s ease-in-out infinite;
  }
  .hp-spool-spin {
    transform-box: fill-box;
    transform-origin: center;
    animation: hp-spool-spin 4s linear infinite;
  }
  .hp-filament    { animation: hp-dash-move    1.5s linear      infinite; }
  .hp-layer-top   { animation: hp-layer-blink  2s   ease-in-out infinite; }
  .hp-nozzle      { animation: hp-nozzle-pulse 1.5s ease-in-out infinite; }
  .hp-nozzle-glow { animation: hp-nozzle-pulse 1.5s ease-in-out infinite; animation-direction: reverse; }
  .hp-rails       { animation: hp-rail-breathe 3s   ease-in-out infinite; }

  .hp-hud {
    position: absolute;
    font-family: 'Courier New', Courier, monospace;
    font-size: 9px;
    line-height: 1.7;
    color: #c084fc;
    background: rgba(8, 4, 24, 0.9);
    border: 1px solid #7c3aed;
    border-left: 3px solid #a855f7;
    padding: 5px 8px;
    white-space: nowrap;
    pointer-events: none;
    animation: hp-hud-blink 5s infinite;
  }
  @media (max-width: 768px) {
    .hp-hud { display: none !important; }
  }
`;

const BED_VLINES  = [168, 194, 220, 246, 272, 298, 324];
const BASE_VLINES = [140, 165, 190, 215, 240, 265, 290, 315, 340];

const HeroPrinter = () => {
  const [mobile, setMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const h  = (e) => setMobile(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  useEffect(() => {
    if (document.getElementById("hp-styles")) return;
    const el = document.createElement("style");
    el.id = "hp-styles";
    el.textContent = CSS;
    document.head.appendChild(el);
  }, []);

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      right: '0',
      transform: 'translateY(-50%)',
      width: '480px',
      maxWidth: '48%',
      height: '520px',
      overflow: 'visible',
      pointerEvents: 'none',
      zIndex: 10,
    }}>

      {/* ── Main printer SVG ──────────────────────────────────────────────── */}
      <svg
        width="480"
        height="520"
        viewBox="0 0 680 580"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <filter id="hp-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3.5" result="blur"/>
          </filter>
        </defs>

        {/* ── All static printer parts — scaled 0.75, offset (60,40) ──── */}
        <g transform="translate(60, 40) scale(0.75)">

          {/* Vertical rails */}
          <g className="hp-rails">
            <line x1="160" y1="80"  x2="160" y2="480" stroke="#7c3aed" strokeWidth="2"/>
            <line x1="163" y1="80"  x2="163" y2="480" stroke="#4c1d95" strokeWidth="0.5"/>
            <line x1="340" y1="80"  x2="340" y2="480" stroke="#7c3aed" strokeWidth="2"/>
            <line x1="337" y1="80"  x2="337" y2="480" stroke="#4c1d95" strokeWidth="0.5"/>
          </g>

          {/* Lead screws (dashed) */}
          <line x1="155" y1="90" x2="155" y2="470" stroke="#3b0d8a" strokeWidth="0.6" strokeDasharray="3,3"/>
          <line x1="345" y1="90" x2="345" y2="470" stroke="#3b0d8a" strokeWidth="0.6" strokeDasharray="3,3"/>

          {/* Top horizontal bar */}
          <rect x="148" y="72" width="204" height="14" rx="2" fill="#0a0618" stroke="#7c3aed" strokeWidth="1.5"/>
          <line x1="148" y1="79" x2="352" y2="79" stroke="#4c1d95" strokeWidth="0.5"/>

          {/* Mid cross bar */}
          <rect x="148" y="210" width="204" height="10" rx="1" fill="#0a0618" stroke="#6d28d9" strokeWidth="1"/>

          {/* Corner accent marks */}
          <path d="M148 86 L135 86 L135 98"    fill="none" stroke="#7c3aed" strokeWidth="1.2"/>
          <path d="M352 86 L365 86 L365 98"    fill="none" stroke="#7c3aed" strokeWidth="1.2"/>
          <path d="M148 466 L135 466 L135 454"  fill="none" stroke="#7c3aed" strokeWidth="1.2"/>
          <path d="M352 466 L365 466 L365 454"  fill="none" stroke="#7c3aed" strokeWidth="1.2"/>

          {/* Base plate */}
          <rect x="120" y="468" width="260" height="16" rx="3" fill="#0a0618" stroke="#7c3aed" strokeWidth="1.5"/>
          {BASE_VLINES.map((x) => (
            <line key={x} x1={x} y1="468" x2={x} y2="484" stroke="#3b0d8a" strokeWidth="0.6"/>
          ))}
          <rect x="122" y="480" width="16" height="10" rx="2" fill="none" stroke="#6d28d9" strokeWidth="1"/>
          <rect x="362" y="480" width="16" height="10" rx="2" fill="none" stroke="#6d28d9" strokeWidth="1"/>

          {/* Print bed */}
          <rect x="145" y="390" width="210" height="12" rx="2" fill="#0d0820" stroke="#7c3aed" strokeWidth="1.5"/>
          {BED_VLINES.map((x) => (
            <line key={x} x1={x} y1="390" x2={x} y2="402" stroke="#3b0d8a" strokeWidth="0.5"/>
          ))}
          <line x1="145" y1="394" x2="355" y2="394" stroke="#3b0d8a" strokeWidth="0.5"/>
          <line x1="145" y1="398" x2="355" y2="398" stroke="#3b0d8a" strokeWidth="0.5"/>

          {/* X-axis rail */}
          <rect x="148" y="226" width="204" height="10" rx="3" fill="#0a0618" stroke="#a855f7" strokeWidth="1.5"/>

          {/* Printed object — stacked layers (widest at bottom = most recent) */}
          <rect x="208" y="343" width="84"  height="5" rx="0" fill="none" stroke="#5b21b6" strokeWidth="0.7"/>
          <rect x="205" y="348" width="90"  height="6" rx="0" fill="none" stroke="#6d28d9" strokeWidth="0.8"/>
          <rect x="202" y="354" width="96"  height="6" rx="0" fill="none" stroke="#7c3aed" strokeWidth="0.9"/>
          <rect x="199" y="360" width="102" height="6" rx="0" fill="none" stroke="#9333ea" strokeWidth="1"/>
          <rect x="196" y="366" width="108" height="6" rx="0" fill="none" stroke="#a855f7" strokeWidth="1.1"/>
          <rect x="193" y="372" width="114" height="6" rx="0" fill="none" stroke="#c084fc" strokeWidth="1.2" className="hp-layer-top"/>

          {/* Filament spool — centered above top bar */}
          <g transform="translate(210, 55)">
            {/* static outer ring */}
            <ellipse cx="0" cy="0" rx="45" ry="15" fill="none" stroke="#7c3aed" strokeWidth="1.5"/>
            {/* rotating inner hub + spokes */}
            <g className="hp-spool-spin">
              <ellipse cx="0" cy="0" rx="30" ry="10"  fill="none" stroke="#4c1d95" strokeWidth="1"/>
              <ellipse cx="0" cy="0" rx="12" ry="4"   fill="none" stroke="#7c3aed" strokeWidth="1.2"/>
              <line x1="-12" y1="0"  x2="-30" y2="0"  stroke="#4c1d95" strokeWidth="0.8"/>
              <line x1="12"  y1="0"  x2="30"  y2="0"  stroke="#4c1d95" strokeWidth="0.8"/>
              <line x1="0"  y1="-4"  x2="0"  y2="-10" stroke="#4c1d95" strokeWidth="0.8"/>
              <line x1="0"  y1="4"   x2="0"  y2="10"  stroke="#4c1d95" strokeWidth="0.8"/>
            </g>
            {/* filament path descending toward X rail */}
            <path
              d="M-5 14 Q-15 44 -52 168"
              fill="none"
              stroke="#6d28d9"
              strokeWidth="1"
              strokeDasharray="4,3"
              className="hp-filament"
            />
          </g>

        </g>{/* end scale group */}

        {/* ── Print head — outside scale group, elements manually ×0.75 ── */}
        {/*    CSS animation positions in SVG viewport coords (0-420 × 0-580) */}
        <g className="hp-printhead">
          {/* carriage body */}
          <rect x="-22.5" y="-30" width="45" height="52.5" rx="3" fill="#0d0820" stroke="#a855f7" strokeWidth="1.4"/>
          {/* fan grill — 3 concentric circles */}
          <circle cx="0" cy="-7.5" r="13.5" fill="none" stroke="#7c3aed" strokeWidth="0.9"/>
          <circle cx="0" cy="-7.5" r="7.5"  fill="none" stroke="#4c1d95" strokeWidth="0.6"/>
          <circle cx="0" cy="-7.5" r="3"    fill="none" stroke="#7c3aed" strokeWidth="0.75"/>
          <line x1="0"     y1="-21"  x2="0"    y2="6"    stroke="#3b0d8a" strokeWidth="0.4"/>
          <line x1="-13.5" y1="-7.5" x2="13.5" y2="-7.5" stroke="#3b0d8a" strokeWidth="0.4"/>
          {/* heat block */}
          <rect x="-7.5" y="18" width="15" height="12" rx="1.5" fill="#0a0618" stroke="#a855f7" strokeWidth="0.9"/>
          {/* nozzle body */}
          <path d="M-4.5 30 L0 41 L4.5 30" fill="none" stroke="#c084fc" strokeWidth="1.2"/>
          {/* nozzle glow halo */}
          <circle cx="0" cy="42" r="6" fill="#7c3aed" opacity="0.22" filter="url(#hp-glow)" className="hp-nozzle-glow"/>
          {/* nozzle tip dot */}
          <circle cx="0" cy="42" r="2" fill="#c084fc" className="hp-nozzle"/>
        </g>

      </svg>

      {/* ── Leader lines (0–100 percentage-space overlay SVG) ─────────── */}
      {!mobile && (
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{
            position: "absolute", top: 0, left: 0,
            width: "100%", height: "100%",
            pointerEvents: "none", overflow: "visible",
          }}
        >
          {LEADER_LINES.map(([x1, y1, x2, y2], i) => (
            <g key={i}>
              <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#7c3aed" strokeWidth="0.8" opacity="0.6"
              />
              <circle cx={x1} cy={y1} r="0.6" fill="#7c3aed" opacity="0.9"/>
            </g>
          ))}
        </svg>
      )}

      {/* ── HUD tag boxes ─────────────────────────────────────────────── */}
      {!mobile && (
        <div style={{
          position: "absolute", top: 0, left: 0,
          width: "100%", height: "100%",
          pointerEvents: "none", overflow: "visible",
        }}>
          {HUD_TAGS.map((tag, i) => (
            <div
              key={i}
              className="hp-hud"
              style={{ ...tag.pos, animationDelay: tag.delay }}
            >
              {tag.lines.map((line, li) => <div key={li}>{line}</div>)}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default HeroPrinter;
