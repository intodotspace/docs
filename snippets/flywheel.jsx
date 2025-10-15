import { useState, useRef, useEffect } from 'react';

export const SpaceFlywheel = () => {
  const nodes = [
    { id: 0, label: 'More Trading\nVolume', color: '#5EDD2C', x: 300, y: 50 },
    { id: 1, label: 'More Fees\nGenerated', color: '#4BC91F', x: 500, y: 120 },
    { id: 2, label: 'More $SPACE\nBought Back', color: '#3AB512', x: 550, y: 280 },
    { id: 3, label: 'More $SPACE\nBurned', color: '#2AA105', x: 450, y: 420 },
    { id: 4, label: 'Increased Scarcity\n& Token Value', color: '#1A8D00', x: 300, y: 470 },
    { id: 5, label: 'Higher\nRewards', color: '#2AA105', x: 150, y: 420 },
    { id: 6, label: 'More Attractive\nEconomics', color: '#3AB512', x: 50, y: 280 },
    { id: 7, label: 'More Users\nJoin', color: '#4BC91F', x: 100, y: 120 }
  ];

  const getNodePosition = (index) => {
    const angle = (index / nodes.length) * Math.PI * 2 - Math.PI / 2;
    const radius = 180;
    return {
      x: 300 + Math.cos(angle) * radius,
      y: 260 + Math.sin(angle) * radius
    };
  };

  const drawArrow = (from, to) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);
    const length = Math.sqrt(dx * dx + dy * dy);
    
    const startOffset = 45;
    const endOffset = 45;
    const startX = from.x + Math.cos(angle) * startOffset;
    const startY = from.y + Math.sin(angle) * startOffset;
    const endX = to.x - Math.cos(angle) * endOffset;
    const endY = to.y - Math.sin(angle) * endOffset;
    
    const controlDist = length * 0.15;
    const perpAngle = angle + Math.PI / 2;
    const cx = (startX + endX) / 2 + Math.cos(perpAngle) * controlDist;
    const cy = (startY + endY) / 2 + Math.sin(perpAngle) * controlDist;
    
    const pathLength = length * 1.5;
    
    return {
      path: `M ${startX} ${startY} Q ${cx} ${cy} ${endX} ${endY}`,
      arrowX: endX,
      arrowY: endY,
      angle: Math.atan2(endY - cy, endX - cx),
      pathLength
    };
  };

  return (
    <div className="w-full max-w-full">
      <div className="w-full">
        <svg width="100%" height="auto" viewBox="0 0 600 520" preserveAspectRatio="xMidYMid meet" className="bg-transparent w-full h-auto" style={{ minHeight: '300px', maxHeight: '500px' }}>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B7DD8" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#3B7DD8" stopOpacity="0.9"/>
            </linearGradient>
          </defs>

          {/* Central circle */}
          <circle
            cx="300"
            cy="260"
            r="70"
            fill="url(#arrowGradient)"
            opacity="0.2"
            filter="url(#glow)"
          >
            <animate
              attributeName="r"
              values="70;80;70"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Center text */}
          <text x="300" y="255" fill="currentColor" fontSize="18" fontWeight="600" textAnchor="middle">Flywheel</text>
          <text x="300" y="275" fill="currentColor" fontSize="18" fontWeight="600" textAnchor="middle">Effect</text>
          <text x="300" y="290" fill="currentColor" fontSize="11" textAnchor="middle" opacity="0.7">Self-Sustaining Growth</text>

          {/* Arrows between nodes */}
          {nodes.map((node, i) => {
            const nextNode = nodes[(i + 1) % nodes.length];
            const currentPos = getNodePosition(i);
            const nextPos = getNodePosition((i + 1) % nodes.length);
            const arrow = drawArrow(currentPos, nextPos);

            return (
              <g key={`arrow-${i}`}>
                <path
                  d={arrow.path}
                  fill="none"
                  stroke="#5EDD2C"
                  strokeWidth="3"
                  opacity="0.6"
                  strokeDasharray={`${arrow.pathLength}`}
                  strokeDashoffset={`${arrow.pathLength}`}
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from={arrow.pathLength}
                    to="0"
                    dur="2s"
                    begin={`${i * 0.25}s`}
                    repeatCount="indefinite"
                  />
                </path>
                <polygon
                  points="-8,-4 0,0 -8,4"
                  fill="#5EDD2C"
                  transform={`translate(${arrow.arrowX}, ${arrow.arrowY}) rotate(${arrow.angle * 180 / Math.PI})`}
                />
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node, i) => {
            const pos = getNodePosition(i);
            
            return (
              <g key={node.id}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="40"
                  fill={node.color}
                  stroke="#ffffff"
                  strokeWidth="2"
                  filter="url(#glow)"
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  fill="white"
                  fontSize="11"
                  fontWeight="600"
                  textAnchor="middle"
                  className="select-none"
                >
                  {node.label.split('\n').map((line, idx) => (
                    <tspan
                      key={idx}
                      x={pos.x}
                      dy={idx === 0 ? '-0.3em' : '1.1em'}
                    >
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}