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
              <stop offset="0%" stopColor="#3B7DD8" stopOpacity="0.2"/>
              <stop offset="100%" stopColor="#5EDD2C" stopOpacity="0.2"/>
            </linearGradient>
            <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5EDD2C" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#4BC91F" stopOpacity="0.9"/>
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
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
            opacity="0.2"
          />

          {/* Animated circular path */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="#5EDD2C"
            strokeWidth="2"
            opacity="0.3"
            strokeDasharray={`${2 * Math.PI * radius}`}
            strokeDashoffset={isVisible ? "0" : `${2 * Math.PI * radius}`}
            style={{
              transition: isVisible ? 'stroke-dashoffset 3s ease-out' : 'none'
            }}
          />

          {/* Arrows between nodes */}
          {nodes.map((node, i) => {
            const nextNode = nodes[(i + 1) % nodes.length];
            const startPos = getPosition(node.angle);
            const endPos = getPosition(nextNode.angle);
            
            const midAngle = (node.angle + nextNode.angle) / 2;
            const arrowPos = getPosition(midAngle);
            const arrowAngle = midAngle - 90;

            return (
              <g key={`arrow-${i}`}>
                <polygon
                  points="-10,-5 0,0 -10,5"
                  fill="#5EDD2C"
                  opacity="0.7"
                  transform={`translate(${arrowPos.x}, ${arrowPos.y}) rotate(${arrowAngle})`}
                  style={{
                    animation: isVisible ? `fadeIn 0.8s ease-out ${i * 0.15}s both` : 'none'
                  }}
                />
              </g>
            );
          })}

          {/* Center circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r="85"
            fill="url(#centerGradient)"
            filter="url(#softGlow)"
            opacity={isVisible ? "0.8" : "0"}
            style={{
              transition: isVisible ? 'opacity 1s ease-out 0.5s' : 'none'
            }}
          />
          <circle
            cx={centerX}
            cy={centerY}
            r="85"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.3"
          />

          {/* Center text */}
          <text 
            x={centerX} 
            y={centerY - 15} 
            fill="currentColor" 
            fontSize="20" 
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
            y={centerY + 10} 
            fill="currentColor" 
            fontSize="20" 
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
            y={centerY + 30} 
            fill="currentColor" 
            fontSize="12" 
            textAnchor="middle" 
            opacity={isVisible ? "0.7" : "0"}
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
                  r="48"
                  fill="url(#nodeGradient)"
                  stroke="#ffffff"
                  strokeWidth="2"
                  filter="url(#glow)"
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  fill="white"
                  fontSize="12"
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