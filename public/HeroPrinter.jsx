export default function HeroPrinter() {
  return (
    <div style={{
      position: 'absolute',
      top: '-50px',
      right: '-30px',
      width: '52%',
      height: 'calc(100% + 50px)',
      overflow: 'visible',
      pointerEvents: 'none',
      zIndex: 10,
    }}>
      <svg width="100%" height="100%" viewBox="0 0 680 580" role="img" style={{overflow:'visible'}}>
        <title>Impresora 3D FDM wireframe Inity3D</title>
        <desc>Impresora FDM en wireframe púrpura con HUD tags animados</desc>
        <style>{`
          @keyframes carriage{0%,100%{transform:translateX(0)}50%{transform:translateX(90px)}}
          @keyframes blink1{0%,88%{opacity:1}92%,96%{opacity:.25}100%{opacity:1}}
          @keyframes blink2{0%,88%{opacity:1}92%,96%{opacity:.25}100%{opacity:1}}
          @keyframes blink3{0%,88%{opacity:1}92%,96%{opacity:.25}100%{opacity:1}}
          @keyframes blink4{0%,88%{opacity:1}92%,96%{opacity:.25}100%{opacity:1}}
          @keyframes blink5{0%,88%{opacity:1}92%,96%{opacity:.25}100%{opacity:1}}
          @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
          @keyframes spool{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
          .hp-tag1{animation:blink1 5s infinite}
          .hp-tag2{animation:blink2 5s 1.2s infinite}
          .hp-tag3{animation:blink3 5s 2.4s infinite}
          .hp-tag4{animation:blink4 5s .6s infinite}
          .hp-tag5{animation:blink5 5s 3s infinite}
          .hp-carriage{animation:carriage 4s ease-in-out infinite}
          .hp-toplayer{animation:pulse 1.8s ease-in-out infinite}
          .hp-spoolinner{transform-origin:340px 78px;animation:spool 8s linear infinite}
        `}</style>

        <rect width="680" height="580" fill="transparent"/>

        {/* Left rail */}
        <line x1="255" y1="130" x2="255" y2="490" stroke="#7c3aed" strokeWidth="1.8"/>
        <line x1="258" y1="130" x2="258" y2="490" stroke="#3b0d8a" strokeWidth=".5"/>

        {/* Right rail */}
        <line x1="425" y1="130" x2="425" y2="490" stroke="#7c3aed" strokeWidth="1.8"/>
        <line x1="422" y1="130" x2="422" y2="490" stroke="#3b0d8a" strokeWidth=".5"/>

        {/* Top bar */}
        <rect x="244" y="122" width="192" height="14" rx="2" fill="#0d0820" stroke="#7c3aed" strokeWidth="1.6"/>
        <line x1="244" y1="129" x2="436" y2="129" stroke="#3b0d8a" strokeWidth=".5"/>

        {/* Corner marks */}
        <path d="M244 136 L230 136 L230 150" fill="none" stroke="#7c3aed" strokeWidth="1.2"/>
        <path d="M436 136 L450 136 L450 150" fill="none" stroke="#7c3aed" strokeWidth="1.2"/>
        <path d="M244 476 L230 476 L230 462" fill="none" stroke="#7c3aed" strokeWidth="1.2"/>
        <path d="M436 476 L450 476 L450 462" fill="none" stroke="#7c3aed" strokeWidth="1.2"/>

        {/* Mid cross bar */}
        <rect x="244" y="232" width="192" height="10" rx="1" fill="#0a0618" stroke="#6d28d9" strokeWidth="1"/>

        {/* Z lead screws */}
        <line x1="263" y1="140" x2="263" y2="478" stroke="#3b0d8a" strokeWidth=".7" strokeDasharray="3,3"/>
        <line x1="417" y1="140" x2="417" y2="478" stroke="#3b0d8a" strokeWidth=".7" strokeDasharray="3,3"/>

        {/* Base plate */}
        <rect x="228" y="478" width="224" height="14" rx="2" fill="#0d0820" stroke="#7c3aed" strokeWidth="1.6"/>
        {[248,268,288,308,328,348,368,388,408].map(x => (
          <line key={x} x1={x} y1="478" x2={x} y2="492" stroke="#3b0d8a" strokeWidth=".6"/>
        ))}
        <rect x="230" y="488" width="18" height="10" rx="2" fill="none" stroke="#6d28d9" strokeWidth="1"/>
        <rect x="432" y="488" width="18" height="10" rx="2" fill="none" stroke="#6d28d9" strokeWidth="1"/>

        {/* Print bed */}
        <rect x="265" y="408" width="150" height="10" rx="1" fill="#0d0820" stroke="#7c3aed" strokeWidth="1.4"/>
        {[282,299,316,333,350,367,384].map(x => (
          <line key={x} x1={x} y1="408" x2={x} y2="418" stroke="#3b0d8a" strokeWidth=".5"/>
        ))}
        <line x1="265" y1="411" x2="415" y2="411" stroke="#3b0d8a" strokeWidth=".5"/>
        <line x1="265" y1="415" x2="415" y2="415" stroke="#3b0d8a" strokeWidth=".5"/>

        {/* Printed object layers */}
        <rect x="305" y="396" width="70" height="5" fill="none" stroke="#5b21b6" strokeWidth=".7"/>
        <rect x="302" y="390" width="76" height="5" fill="none" stroke="#6d28d9" strokeWidth=".8"/>
        <rect x="299" y="384" width="82" height="5" fill="none" stroke="#7c3aed" strokeWidth=".9"/>
        <rect x="296" y="378" width="88" height="5" fill="none" stroke="#9333ea" strokeWidth="1"/>
        <rect x="293" y="372" width="94" height="5" fill="none" stroke="#a855f7" strokeWidth="1.1"/>
        <rect x="290" y="367" width="100" height="4" fill="none" stroke="#c084fc" strokeWidth="1.3" className="hp-toplayer"/>

        {/* X axis rail */}
        <rect x="248" y="246" width="184" height="9" rx="3" fill="#0a0618" stroke="#a855f7" strokeWidth="1.5"/>

        {/* Print head animated */}
        <g className="hp-carriage" style={{transformOrigin:'270px 250px'}}>
          <g transform="translate(270,246)">
            <rect x="-28" y="-2" width="56" height="62" rx="3" fill="#0d0820" stroke="#a855f7" strokeWidth="1.8"/>
            <circle cx="0" cy="18" r="17" fill="none" stroke="#7c3aed" strokeWidth="1.2"/>
            <circle cx="0" cy="18" r="10" fill="none" stroke="#4c1d95" strokeWidth=".8"/>
            <circle cx="0" cy="18" r="4" fill="none" stroke="#7c3aed" strokeWidth="1"/>
            <line x1="0" y1="1" x2="0" y2="35" stroke="#3b0d8a" strokeWidth=".6"/>
            <line x1="-17" y1="18" x2="17" y2="18" stroke="#3b0d8a" strokeWidth=".6"/>
            <rect x="-9" y="44" width="18" height="14" rx="2" fill="#0a0618" stroke="#a855f7" strokeWidth="1.2"/>
            <path d="M-5 58 L0 70 L5 58" fill="none" stroke="#c084fc" strokeWidth="1.5"/>
            <circle cx="0" cy="71" r="2.5" fill="#c084fc"/>
          </g>
        </g>

        {/* Filament path */}
        <path d="M340 122 Q340 160 310 246" fill="none" stroke="#6d28d9" strokeWidth="1" strokeDasharray="4,3"/>

        {/* Filament spool */}
        <ellipse cx="340" cy="78" rx="50" ry="18" fill="none" stroke="#7c3aed" strokeWidth="1.5"/>
        <g className="hp-spoolinner">
          <ellipse cx="340" cy="78" rx="32" ry="11" fill="none" stroke="#4c1d95" strokeWidth="1"/>
          <line x1="308" y1="78" x2="324" y2="78" stroke="#4c1d95" strokeWidth=".8"/>
          <line x1="356" y1="78" x2="372" y2="78" stroke="#4c1d95" strokeWidth=".8"/>
          <line x1="340" y1="67" x2="340" y2="89" stroke="#4c1d95" strokeWidth=".8"/>
        </g>
        <ellipse cx="340" cy="78" rx="12" ry="4" fill="none" stroke="#7c3aed" strokeWidth="1.2"/>

        {/* HUD Tag 1 — FILAMENT */}
        <line x1="390" y1="78" x2="460" y2="92" stroke="#7c3aed" strokeWidth=".8" opacity=".6"/>
        <circle cx="390" cy="78" r="2" fill="#7c3aed"/>
        <g className="hp-tag1">
          <rect x="460" y="76" width="148" height="46" fill="#08040f" stroke="#7c3aed" strokeWidth=".9"/>
          <rect x="460" y="76" width="3" height="46" fill="#a855f7"/>
          <text x="470" y="92" fontFamily="'Courier New',monospace" fontSize="9.5" fill="#c084fc">FILAMENT // PLA+</text>
          <text x="470" y="105" fontFamily="'Courier New',monospace" fontSize="9.5" fill="#9333ea">DIAM: 1.75mm</text>
          <text x="470" y="118" fontFamily="'Courier New',monospace" fontSize="9.5" fill="#9333ea">SPOOL: 82% REMAINING</text>
        </g>

        {/* HUD Tag 2 — HOTEND */}
        <line x1="426" y1="270" x2="476" y2="265" stroke="#a855f7" strokeWidth=".8" opacity=".6"/>
        <circle cx="426" cy="270" r="2" fill="#a855f7"/>
        <g className="hp-tag2">
          <rect x="476" y="248" width="140" height="56" fill="#08040f" stroke="#a855f7" strokeWidth=".9"/>
          <rect x="476" y="248" width="3" height="56" fill="#7c3aed"/>
          <text x="486" y="264" fontFamily="'Courier New',monospace" fontSize="9.5" fill="#c084fc">HOTEND // ACTIVE</text>
          <text x="486" y="277" fontFamily="'Courier New',monospace" fontSize="9.5" fill="#9333ea">TEMP: 215°C</text>
          <text x="486" y="290" fontFamily="'Courier New',monospace" fontSize="9.5" fill="#9333ea">SPEED: 500mm/s</text>
          <text x="486" y="303" fontFamily="'Courier New',monospace" fontSize="9.5" fill="#6d28d9">FAN: 100%</text>
        </g>

        {/* HUD Tag 3 — NOZZLE */}
        <line x1="426" y1="355" x2="476" y2="370" stroke="#c084fc" strokeWidth=".8" opacity=".6"/>
        <circle cx="426" cy="355" r="2" fill="#c084fc"/>
        <g className="hp-tag3">
          <rect x="476" y="355" width="140" height="46" fill="#08040f" stroke="#c084fc" strokeWidth=".9"/>
          <rect x="476" y="355" width="3" height="46" fill="#c084fc"/>
          <text x="486" y="371" fontFamily="'Courier New',monospace" fontSize="9.5" fill="#c084fc">NOZZLE: 0.4mm</text>
          <text x="486" y="384" fontFamily="'Courier New',monospace" fontSize="9.5" fill="#9333ea">LAYER: 0047/120</text>
          <text x="486" y="397" fontFamily="'Courier New',monospace" fontSize="9.5" fill="#9333ea">H: 0.20mm</text>
        </g>

        {/* HUD Tag 4 — SYS */}
        <line x1="254" y1="162" x2="204" y2="150" stroke="#6d28d9" strokeWidth=".8" opacity=".6"/>
        <circle cx="254" cy="162" r="2" fill="#6d28d9"/>
        <g className="hp-tag4">
          <rect x="64" y="134" width="138" height="46" fill="#08040f" stroke="#6d28d9" strokeWidth=".9"/>
          <rect x="64" y="134" width="3" height="46" fill="#6d28d9"/>
          <text x="74" y="150" fontFamily="'Courier New',monospace" fontSize="9.5" fill="#c084fc">SYS // INITY3D</text>
          <text x="74" y="163" fontFamily="'Courier New',monospace" fontSize="9.5" fill="#9333ea">CR-UNIT-001</text>
          <text x="74" y="176" fontFamily="'Courier New',monospace" fontSize="9.5" fill="#9333ea">PWR: 98.3%</text>
        </g>

        {/* HUD Tag 5 — BUILD */}
        <line x1="254" y1="385" x2="202" y2="390" stroke="#7c3aed" strokeWidth=".8" opacity=".6"/>
        <circle cx="254" cy="385" r="2" fill="#7c3aed"/>
        <g className="hp-tag5">
          <rect x="64" y="375" width="136" height="46" fill="#08040f" stroke="#7c3aed" strokeWidth=".9"/>
          <rect x="64" y="375" width="3" height="46" fill="#7c3aed"/>
          <text x="74" y="391" fontFamily="'Courier New',monospace" fontSize="9.5" fill="#c084fc">BUILD: 39.2%</text>
          <text x="74" y="404" fontFamily="'Courier New',monospace" fontSize="9.5" fill="#9333ea">ETA: 01:23:44</text>
          <text x="74" y="417" fontFamily="'Courier New',monospace" fontSize="9.5" fill="#9333ea">STATUS: PRINTING</text>
        </g>

        {/* Nozzle crosshair */}
        <line x1="266" y1="317" x2="274" y2="317" stroke="#c084fc" strokeWidth=".6"/>
        <line x1="270" y1="313" x2="270" y2="321" stroke="#c084fc" strokeWidth=".6"/>
      </svg>
    </div>
  )
}
