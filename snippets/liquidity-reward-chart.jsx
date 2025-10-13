import { useState, useRef } from 'react';

export const LiquidityRewardChart = () => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [mousePos, setMousePos] = useState(null);
  const [isTouching, setIsTouching] = useState(false);
  const svgRef = useRef(null);
  
  // Generate logarithmic curve points
  const generatePoints = () => {
    const points = [];
    for (let i = 0; i <= 100; i++) {
      const days = (i / 100) * 350; // 0 to 350 days
      // Logarithmic curve: starts at 1.2, approaches 2.35
      const multiplier = 1.2 + 1.15 * Math.log(1 + days / 50) / Math.log(8);
      const svgX = 80 + (days / 350) * 480;
      const svgY = 320 - ((multiplier - 1.0) / 1.4) * 280; // Scale from 1.0 to 2.4
      points.push({ days: Math.round(days), multiplier: multiplier.toFixed(2), svgX, svgY });
    }
    return points;
  };

  const points = generatePoints();
  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.svgX} ${p.svgY}`).join(' ');

  const findClosestPoint = (svgX, svgY) => {
    let closestPoint = null;
    let minDistance = 40;
    
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
    setTimeout(() => {
      if (isTouching === false) {
        setHoveredPoint(null);
      }
    }, 2000);
  };

  const getTooltipProps = (point) => {
    if (!point) return {};
    
    let x = point.svgX - 60;
    let y = point.svgY - 55;
    
    if (x < 10) x = 10;
    if (x > 480) x = 480;
    if (y < 10) y = point.svgY + 20;
    
    return { x, y };
  };

  const tooltipProps = getTooltipProps(hoveredPoint);

  return (
    <div className="w-full max-w-full">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Liquidity Reward Multiplier vs. Time to Resolution</h2>
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
            <pattern id="liquidityGrid" width="50" height="25" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 25" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" opacity="0.2"/>
            </pattern>
            <filter id="dropShadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>
          
          {/* Grid */}
          <rect width="480" height="280" x="80" y="40" fill="url(#liquidityGrid)"/>
          
          {/* Crosshair lines */}
          {mousePos && (
            <g opacity="0.4">
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
          
          {/* Main curve line */}
          <path d={pathData} 
                fill="none" 
                stroke="#F59E0B" 
                strokeWidth="4"
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
          {points.filter((_, i) => i % 15 === 0).map((point, i) => (
            <circle
              key={`visible-${i}`}
              cx={point.svgX}
              cy={point.svgY}
              r={hoveredPoint === point ? "6" : "3"}
              fill="#F59E0B"
              className="transition-all duration-200"
              stroke={hoveredPoint === point ? "#ffffff" : "none"}
              strokeWidth={hoveredPoint === point ? "2" : "0"}
            />
          ))}
          
          {/* X-axis labels */}
          <text x="80" y="340" fill="currentColor" fontSize="12" textAnchor="middle" opacity="0.7">0</text>
          <text x="180" y="340" fill="currentColor" fontSize="12" textAnchor="middle" opacity="0.7">50</text>
          <text x="280" y="340" fill="currentColor" fontSize="12" textAnchor="middle" opacity="0.7">100</text>
          <text x="380" y="340" fill="currentColor" fontSize="12" textAnchor="middle" opacity="0.7">150</text>
          <text x="480" y="340" fill="currentColor" fontSize="12" textAnchor="middle" opacity="0.7">200</text>
          <text x="560" y="340" fill="currentColor" fontSize="12" textAnchor="middle" opacity="0.7">350</text>
          
          {/* Y-axis labels */}
          <text x="70" y="325" fill="currentColor" fontSize="12" textAnchor="end" opacity="0.7">1.0</text>
          <text x="70" y="275" fill="currentColor" fontSize="12" textAnchor="end" opacity="0.7">1.2</text>
          <text x="70" y="225" fill="currentColor" fontSize="12" textAnchor="end" opacity="0.7">1.4</text>
          <text x="70" y="175" fill="currentColor" fontSize="12" textAnchor="end" opacity="0.7">1.6</text>
          <text x="70" y="125" fill="currentColor" fontSize="12" textAnchor="end" opacity="0.7">1.8</text>
          <text x="70" y="75" fill="currentColor" fontSize="12" textAnchor="end" opacity="0.7">2.0</text>
          <text x="70" y="45" fill="currentColor" fontSize="12" textAnchor="end" opacity="0.7">2.4</text>
          
          {/* Axis titles */}
          <text x="320" y="370" fill="currentColor" fontSize="14" textAnchor="middle" opacity="0.8">Days until resolution</text>
          <text x="30" y="180" fill="currentColor" fontSize="14" textAnchor="middle" transform="rotate(-90 30 180)" opacity="0.8">Reward multiplier (relative)</text>
          
          {/* Enhanced tooltip */}
          {hoveredPoint && (
            <g filter="url(#dropShadow)">
              <rect 
                x={tooltipProps.x} 
                y={tooltipProps.y} 
                width="120" 
                height="45" 
                fill="#1a1a1a" 
                stroke="#F59E0B" 
                strokeWidth="2" 
                rx="6"
                opacity="0.95"
              />
              <text 
                x={tooltipProps.x + 60} 
                y={tooltipProps.y + 18} 
                fill="#ffffff" 
                fontSize="12" 
                textAnchor="middle"
                fontWeight="500">
                {hoveredPoint.days} days
              </text>
              <text 
                x={tooltipProps.x + 60} 
                y={tooltipProps.y + 32} 
                fill="#F59E0B" 
                fontSize="12" 
                textAnchor="middle"
                fontWeight="500">
                {hoveredPoint.multiplier}× multiplier
              </text>
            </g>
          )}
        </svg>
      </div>
      
      <div className="text-center mt-4">
        <span className="inline-flex items-center text-sm opacity-70">
          <div className="w-4 h-0.5 bg-[#F59E0B] mr-2"></div>
          Liquidity Reward Multiplier
        </span>
      </div>
    </div>
  );
};