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
  const nodeRadius = 55;

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
            <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2a5016"/>
              <stop offset="100%" stopColor="#000000"/>
            </linearGradient>
            <marker
              id="arrowhead"
              markerWidth="20"
              markerHeight="20"
              refX="10"
              refY="10"
              orient="auto"
            >
              <polygon points="0,5 0,15 15,10" fill="#ffffff" />
            </marker>
          </defs>

          {/* Connecting lines and arrows */}
          {nodes.map((node, i) => {
            const nextNode = nodes[(i + 1) % nodes.length];
            const currentPos = getPosition(node.angle);
            const nextPos = getPosition(nextNode.angle);
            
            // Calculate start and end points at circle edges
            const angleToNext = Math.atan2(nextPos.y - currentPos.y, nextPos.x - currentPos.x);
            const startX = currentPos.x + nodeRadius * Math.cos(angleToNext);
            const startY = currentPos.y + nodeRadius * Math.sin(angleToNext);
            
            const angleFromPrev = Math.atan2(currentPos.y - nextPos.y, currentPos.x - nextPos.x);
            const endX = nextPos.x + nodeRadius * Math.cos(angleFromPrev);
            const endY = nextPos.y + nodeRadius * Math.sin(angleFromPrev);
            
            // Calculate midpoint for arrow placement
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;
            
            // Arrow angle pointing in direction of flow
            const arrowAngle = (Math.atan2(endY - startY, endX - startX) * 180 / Math.PI);

            return (
              <g key={`connection-${i}`}>
                {/* Line */}
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke="#ffffff"
                  strokeWidth="4"
                  opacity="0.8"
                  style={{
                    animation: isVisible ? `fadeIn 0.8s ease-out ${i * 0.15}s both` : 'none'
                  }}
                />
                {/* Arrow */}
                <polygon
                  points="-20,-10 0,0 -20,10"
                  fill="#ffffff"
                  opacity="1"
                  transform={`translate(${midX}, ${midY}) rotate(${arrowAngle})`}
                  style={{
                    animation: isVisible ? `fadeIn 0.8s ease-out ${i * 0.15 + 0.3}s both` : 'none'
                  }}
                />
              </g>
            );
          })}

          {/* Center text - no background circle */}
          <text 
            x={centerX} 
            y={centerY - 15} 
            fill="#ffffff" 
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
            fill="#ffffff" 
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
                  stroke="#5EDD2C"
                  strokeWidth="3"
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