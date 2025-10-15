import { useState, useRef, useEffect } from 'react';

export const SpaceFlywheel = () => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const nodes = [
    { id: 0, label: 'More Trading\nVolume', angle: 0 },
    { id: 1, label: 'More Fees\nGenerated', angle: 45 },
    { id: 2, label: 'More $SPACE\nBought Back', angle: 90 },
    { id: 3, label: 'More $SPACE\nBurned', angle: 135 },
    { id: 4, label: 'Increased Scarcity\n& Token Value', angle: 180 },
    { id: 5, label: 'Higher\nRewards', angle: 225 },
    { id: 6, label: 'More Attractive\nEconomics', angle: 270 },
    { id: 7, label: 'More Users\nJoin', angle: 315 }
  ];

  const radius = 200;
  const centerX = 300;
  const centerY = 280;

  const getPosition = (angle) => {
    const rad = (angle - 90) * Math.PI / 180;
    return {
      x: centerX + radius * Math.cos(rad),
      y: centerY + radius * Math.sin(rad)
    };
  };

  const drawCurvedArrow = (startAngle, endAngle) => {
    const start = getPosition(startAngle);
    const end = getPosition(endAngle);
    const midAngle = (startAngle + endAngle) / 2;
    const mid = getPosition(midAngle);
    
    // Adjust control point to curve outward
    const controlRadius = radius + 30;
    const controlRad = (midAngle - 90) * Math.PI / 180;
    const control = {
      x: centerX + controlRadius * Math.cos(controlRad),
      y: centerY + controlRadius * Math.sin(controlRad)
    };
    
    return {
      path: `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`,
      arrowPos: end,
      arrowAngle: endAngle
    };
  };

  return (
    <div ref={containerRef} className="w-full max-w-full">
      <div className="w-full">
        <svg 
          width="100%" 
          height="auto" 
          viewBox="0 0 600 560" 
          preserveAspectRatio="xMidYMid meet" 
          className="bg-transparent w-full h-auto" 
          style={{ minHeight: '400px', maxHeight: '600px' }}
        >
          <defs>
            <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B7DD8" stopOpacity="0.15"/>
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.15"/>
            </linearGradient>
            <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5EDD2C"/>
              <stop offset="100%" stopColor="#4BC91F"/>
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Circular track/ring */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="5,5"
            opacity="0.15"
          />

          {/* Animated circular path */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="#5EDD2C"
            strokeWidth="2"
            opacity="0.2"
            strokeDasharray={`${2 * Math.PI * radius}`}
            strokeDashoffset={isVisible ? "0" : `${2 * Math.PI * radius}`}
            style={{
              transition: isVisible ? 'stroke-dashoffset 3s ease-out' : 'none'
            }}
          />

          {/* Curved arrows between nodes */}
          {nodes.map((node, i) => {
            const nextNode = nodes[(i + 1) % nodes.length];
            const arrow = drawCurvedArrow(node.angle, nextNode.angle);

            return (
              <g key={`arrow-${i}`}>
                <path
                  d={arrow.path}
                  fill="none"
                  stroke="#5EDD2C"
                  strokeWidth="2.5"
                  opacity="0.5"
                  style={{
                    animation: isVisible ? `fadeIn 0.8s ease-out ${i * 0.15}s both` : 'none'
                  }}
                />
                <polygon
                  points="-12,-7 0,0 -12,7"
                  fill="#5EDD2C"
                  opacity="0.8"
                  transform={`translate(${arrow.arrowPos.x}, ${arrow.arrowPos.y}) rotate(${arrow.arrowAngle})`}
                  style={{
                    animation: isVisible ? `fadeIn 0.8s ease-out ${i * 0.15 + 0.3}s both` : 'none'
                  }}
                />
              </g>
            );
          })}

          {/* Center circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r="90"
            fill="url(#centerGradient)"
            filter="url(#softGlow)"
            opacity={isVisible ? "1" : "0"}
            style={{
              transition: isVisible ? 'opacity 1s ease-out 0.5s' : 'none'
            }}
          />
          <circle
            cx={centerX}
            cy={centerY}
            r="90"
            fill="none"
            stroke="#3B7DD8"
            strokeWidth="2"
            opacity="0.4"
          />

          {/* Center text */}
          <text 
            x={centerX} 
            y={centerY - 15} 
            fill="currentColor" 
            fontSize="22" 
            fontWeight="600" 
            textAnchor="middle"
            opacity={isVisible ? "1" : "0"}
            style={{
              transition: isVisible ? 'opacity 1s ease-out 0.8s' : 'none'
            }}
          >
            Flywheel
          </text>
          <text 
            x={centerX} 
            y={centerY + 12} 
            fill="currentColor" 
            fontSize="22" 
            fontWeight="600" 
            textAnchor="middle"
            opacity={isVisible ? "1" : "0"}
            style={{
              transition: isVisible ? 'opacity 1s ease-out 0.8s' : 'none'
            }}
          >
            Effect
          </text>
          <text 
            x={centerX} 
            y={centerY + 33} 
            fill="currentColor" 
            fontSize="12" 
            textAnchor="middle" 
            opacity={isVisible ? "0.6" : "0"}
            style={{
              transition: isVisible ? 'opacity 1s ease-out 1s' : 'none'
            }}
          >
            Self-Sustaining Growth
          </text>

          {/* Nodes */}
          {nodes.map((node, i) => {
            const pos = getPosition(node.angle);
            
            return (
              <g 
                key={node.id}
                opacity={isVisible ? "1" : "0"}
                style={{
                  transition: isVisible ? `opacity 0.6s ease-out ${i * 0.15}s` : 'none'
                }}
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="55"
                  fill="url(#nodeGradient)"
                  stroke="#ffffff"
                  strokeWidth="3"
                  filter="url(#glow)"
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  fill="white"
                  fontSize="13"
                  fontWeight="600"
                  textAnchor="middle"
                  className="select-none"
                >
                  {node.label.split('\n').map((line, idx) => (
                    <tspan
                      key={idx}
                      x={pos.x}
                      dy={idx === 0 ? '-0.3em' : '1.2em'}
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
      
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}