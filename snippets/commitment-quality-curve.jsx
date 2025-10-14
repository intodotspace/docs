import { useState, useRef } from 'react';

export const CommitmentQualityCurve = () => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [mousePos, setMousePos] = useState(null);
  const [isTouching, setIsTouching] = useState(false);
  const svgRef = useRef(null);
  
  // Generate curve points for interaction
  const generatePoints = () => {
    const points = [];
    for (let i = 0; i <= 100; i++) {
      const x = i / 100;
      const y = Math.exp(-Math.pow(x - 0.5, 2) / 0.04);
      const svgX = 80 + (x * 480);
      const svgY = 320 - (y * 280);
      points.push({ x, y, svgX, svgY, reward: y.toFixed(3) });
    }
    return points;
  };

  const points = generatePoints();
  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.svgX} ${p.svgY}`).join(' ');

  const findClosestPoint = (svgX, svgY) => {
    let closestPoint = null;
    let minDistance = 40; // Increased for better mobile interaction
    
    points.forEach(point => {
      const distance = Math.sqrt(
        Math.pow(svgX - point.svgX, 2) + Math.pow(svgY - point.svgY, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
      }
    });
    
    return closestPoint;
  };

  const updateInteraction = (clientX, clientY) => {
    if (!svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((clientX - rect.left) / rect.width) * 600;
    const svgY = ((clientY - rect.top) / rect.height) * 400;
    
    // Only show crosshair within chart area
    if (svgX >= 80 && svgX <= 560 && svgY >= 40 && svgY <= 320) {
      if (!isTouching) {
        setMousePos({ x: svgX, y: svgY });
      }
      
      const closestPoint = findClosestPoint(svgX, svgY);
      setHoveredPoint(closestPoint);
    } else {
      if (!isTouching) {
        setMousePos(null);
      }
      setHoveredPoint(null);
    }
  };

  // Mouse events
  const handleMouseMove = (e) => {
    if (!isTouching) {
      updateInteraction(e.clientX, e.clientY);
    }
  };

  const handleMouseLeave = () => {
    if (!isTouching) {
      setMousePos(null);
      setHoveredPoint(null);
    }
  };

  // Touch events
  const handleTouchStart = (e) => {
    e.preventDefault();
    setIsTouching(true);
    const touch = e.touches[0];
    updateInteraction(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    updateInteraction(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    setIsTouching(false);
    setMousePos(null);
    // Keep tooltip visible for a moment on mobile
    setTimeout(() => {
      if (isTouching === false) {
        setHoveredPoint(null);
      }
    }, 2000);
  };

  // Smart tooltip positioning
  const getTooltipProps = (point) => {
    if (!point) return {};
    
    let x = point.svgX - 50;
    let y = point.svgY - 55;
    
    // Keep tooltip in bounds
    if (x < 10) x = 10;
    if (x > 500) x = 500;
    if (y < 10) y = point.svgY + 20;
    
    return { x, y };
  };

  const tooltipProps = getTooltipProps(hoveredPoint);

  return (
    <div className="w-full max-w-full">
      <div className="text-center mb-0">
        <h2 className="text-xl font-semibold mb-0">Commitment Quality Curve</h2>
        <p className="text-sm opacity-70">Balanced Price ($0.50)</p>
      </div>
      
      <div className="w-full">
        <svg 
          ref={svgRef}
          width="100%" 
          height="auto"
          viewBox="0 0 600 400" 
          preserveAspectRatio="xMidYMid meet"
          className="bg-transparent cursor-crosshair w-full h-auto touch-none"
          style={{ minHeight: '300px', maxHeight: '500px' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5EDD2C" stopOpacity="0.6">
                <animate attributeName="stop-opacity" values="0.6;0.75;0.6" dur="4s" repeatCount="indefinite"/>
              </stop>
              <stop offset="100%" stopColor="#5EDD2C" stopOpacity="0.1">
                <animate attributeName="stop-opacity" values="0.1;0.15;0.1" dur="4s" repeatCount="indefinite"/>
              </stop>
            </linearGradient>
            <pattern id="grid" width="60" height="35" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 35" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" opacity="0.3"/>
            </pattern>
            <filter id="dropShadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>
          
          {/* Grid */}
          <rect width="480" height="280" x="80" y="40" fill="url(#grid)"/>
          
          {/* Crosshair lines */}
          {mousePos && (
            <g opacity="0.5">
              <line 
                x1="80" y1={mousePos.y} 
                x2="560" y2={mousePos.y} 
                stroke="currentColor" 
                strokeWidth="1" 
                strokeDasharray="2,2"
              />
              <line 
                x1={mousePos.x} y1="40" 
                x2={mousePos.x} y2="320" 
                stroke="currentColor" 
                strokeWidth="1" 
                strokeDasharray="2,2"
              />
            </g>
          )}
          
          {/* Axes */}
          <line x1="80" y1="320" x2="560" y2="320" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
          <line x1="80" y1="40" x2="80" y2="320" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
          
          {/* Area under curve */}
          <path d={`${pathData} L 560 320 L 80 320 Z`} 
                fill="url(#areaGradient)"/>
          
          {/* Main curve line */}
          <path d={pathData} 
                fill="none" 
                stroke="#5EDD2C" 
                strokeWidth="3"
                className="transition-all duration-300"/>
          
          {/* Interactive points (invisible larger hit areas) */}
          {points.filter((_, i) => i % 2 === 0).map((point, i) => (
            <circle
              key={i}
              cx={point.svgX}
              cy={point.svgY}
              r="12"
              fill="transparent"
              className="cursor-pointer"
            />
          ))}
          
          {/* Visible curve points */}
          {points.filter((_, i) => i % 10 === 0).map((point, i) => (
            <circle
              key={`visible-${i}`}
              cx={point.svgX}
              cy={point.svgY}
              r={hoveredPoint === point ? "6" : "3"}
              fill="#5EDD2C"
              className="transition-all duration-200"
              stroke={hoveredPoint === point ? "#ffffff" : "none"}
              strokeWidth={hoveredPoint === point ? "2" : "0"}
            />
          ))}
          
          {/* Vertical dashed line at x=0.5 with animation */}
          <line x1="320" y1="40" x2="320" y2="320" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeDasharray="8,4"
                opacity="0.6">
            <animate attributeName="stroke-dashoffset" values="0;12;0" dur="3s" repeatCount="indefinite"/>
          </line>
          
          {/* X-axis labels */}
          <text x="80" y="340" fill="currentColor" fontSize="12" textAnchor="middle" opacity="0.7">0.0</text>
          <text x="200" y="340" fill="currentColor" fontSize="12" textAnchor="middle" opacity="0.7">0.25</text>
          <text x="320" y="340" fill="currentColor" fontSize="12" textAnchor="middle" className="font-bold" opacity="0.9">0.5</text>
          <text x="440" y="340" fill="currentColor" fontSize="12" textAnchor="middle" opacity="0.7">0.75</text>
          <text x="560" y="340" fill="currentColor" fontSize="12" textAnchor="middle" opacity="0.7">1.0</text>
          
          {/* Y-axis labels */}
          <text x="70" y="325" fill="currentColor" fontSize="12" textAnchor="end" opacity="0.7">0.0</text>
          <text x="70" y="250" fill="currentColor" fontSize="12" textAnchor="end" opacity="0.7">0.25</text>
          <text x="70" y="180" fill="currentColor" fontSize="12" textAnchor="end" opacity="0.7">0.5</text>
          <text x="70" y="110" fill="currentColor" fontSize="12" textAnchor="end" opacity="0.7">0.75</text>
          <text x="70" y="45" fill="currentColor" fontSize="12" textAnchor="end" opacity="0.7">1.0</text>
          
          {/* Axis titles */}
          <text x="320" y="370" fill="currentColor" fontSize="14" textAnchor="middle" opacity="0.8">Limit Order Price</text>
          <text x="30" y="180" fill="currentColor" fontSize="14" textAnchor="middle" transform="rotate(-90 30 180)" opacity="0.8">Relative Reward Size</text>
          
          {/* Enhanced tooltip */}
          {hoveredPoint && (
            <g filter="url(#dropShadow)">
              <rect 
                x={tooltipProps.x} 
                y={tooltipProps.y} 
                width="100" 
                height="45" 
                fill="#1a1a1a" 
                stroke="#5EDD2C" 
                strokeWidth="2" 
                rx="6"
                opacity="0.95"
              />
              <text 
                x={tooltipProps.x + 50} 
                y={tooltipProps.y + 18} 
                fill="#ffffff" 
                fontSize="12" 
                textAnchor="middle"
                fontWeight="500">
                Price: ${hoveredPoint.x.toFixed(2)}
              </text>
              <text 
                x={tooltipProps.x + 50} 
                y={tooltipProps.y + 32} 
                fill="#5EDD2C" 
                fontSize="12" 
                textAnchor="middle"
                fontWeight="500">
                Reward: {hoveredPoint.reward}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};