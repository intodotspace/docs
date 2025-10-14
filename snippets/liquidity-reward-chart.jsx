import { useState, useRef } from 'react';

export const LiquidityRewardChart = () => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [mousePos, setMousePos] = useState(null);
  const [isTouching, setIsTouching] = useState(false);
  const svgRef = useRef(null);
  
  // Smooth easing function calibrated to exact anchor points
  const dayToSvgX = (days) => {
    // Anchor points: day 0→80, day 30→152, day 90→320, day 365→560
    const startX = 80;
    
    if (days <= 90) {
      // 0-90 days: Use quadratic ease that hits exact points
      // At 30 days: should be at x=152 (72 pixels from start)
      // At 90 days: should be at x=320 (240 pixels from start)
      // Solve for smooth curve: x = a*t^2 + b*t where t is normalized time
      const t = days / 90;
      // Calibrated coefficients to hit anchor points smoothly
      return startX + 240 * (0.4 * t + 0.6 * t * t);
    } else {
      // 90-365 days: Linear mapping from x=320 to x=560
      const t = (days - 90) / (365 - 90);
      return 320 + 240 * t;
    }
  };
  
  // Inverse function: svgX to days (for tooltip)
  const svgXToDay = (svgX) => {
    if (svgX <= 320) {
      // Reverse the quadratic equation for 0-90 days
      // x = 80 + 240 * (0.4*t + 0.6*t^2)
      // Solve: 0.6*t^2 + 0.4*t - (x-80)/240 = 0
      const normalized = (svgX - 80) / 240;
      const a = 0.6, b = 0.4, c = -normalized;
      const t = (-b + Math.sqrt(b*b - 4*a*c)) / (2*a);
      return Math.round(t * 90);
    } else {
      // Linear region 90-365 days
      const t = (svgX - 320) / 240;
      return Math.round(90 + t * 275);
    }
  };
  
  // Generate curve points for duration-based multiplier
  const generatePoints = () => {
    const points = [];
    // Generate dense points for ultra-smooth curve
    for (let i = 0; i <= 365; i += 0.25) {
      const days = i;
      const multiplier = 1 + Math.log(1 + days / 30) * 0.8;
      
      const svgX = dayToSvgX(days);
      const svgY = 320 - ((multiplier - 1) / 3) * 280;
      
      points.push({ 
        days: Math.round(days * 4) / 4, // Round to nearest 0.25
        multiplier: multiplier.toFixed(2), 
        svgX, 
        svgY 
      });
    }
    return points;
  };

  const points = generatePoints();
  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.svgX} ${p.svgY}`).join(' ');

  // Get specific day points - find closest to exact days
  const day30Point = points.find(p => Math.abs(p.days - 30) < 0.3);
  const day90Point = points.find(p => Math.abs(p.days - 90) < 0.3);

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
      <div className="text-center mb-0">
        <h2 className="text-xl font-semibold mb-0">Liquidity Reward Multiplier</h2>
        <p className="text-sm opacity-70">Duration-Based Incentives</p>
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
            <linearGradient id="multiplierGradient" x1="0%" y1="0%" x2="0%" y2="100%">
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
                fill="url(#multiplierGradient)"/>
          
          {/* Main curve line */}
          <path d={pathData} 
                fill="none" 
                stroke="#5EDD2C" 
                strokeWidth="3"
                className="transition-all duration-300"/>
          
          {/* Interactive points (invisible larger hit areas) */}
          {points.filter((_, i) => i % 20 === 0).map((point, i) => (
            <circle
              key={i}
              cx={point.svgX}
              cy={point.svgY}
              r="12"
              fill="transparent"
              className="cursor-pointer"
            />
          ))}
          
          {/* Milestone indicator circles at 30 and 90 days */}
          {day30Point && (
            <circle
              cx={day30Point.svgX}
              cy={day30Point.svgY}
              r="5"
              fill="#5EDD2C"
              stroke="#ffffff"
              strokeWidth="2"
              opacity="0.9"
            />
          )}
          {day90Point && (
            <circle
              cx={day90Point.svgX}
              cy={day90Point.svgY}
              r="5"
              fill="#5EDD2C"
              stroke="#ffffff"
              strokeWidth="2"
              opacity="0.9"
            />
          )}
          
          {/* Key milestone lines at exact x positions */}
          <line x1="152" y1="40" x2="152" y2="320" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeDasharray="8,4"
                opacity="0.6">
            <animate attributeName="stroke-dashoffset" values="0;12;0" dur="3s" repeatCount="indefinite"/>
          </line>
          <line x1="320" y1="40" x2="320" y2="320" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeDasharray="8,4"
                opacity="0.6">
            <animate attributeName="stroke-dashoffset" values="0;12;0" dur="3s" repeatCount="indefinite"/>
          </line>
          
          {/* X-axis labels */}
          <text x="80" y="340" fill="currentColor" fontSize="12" textAnchor="middle" opacity="0.7">0</text>
          <text x="152" y="340" fill="currentColor" fontSize="12" textAnchor="middle" className="font-bold" opacity="0.9">30</text>
          <text x="224" y="340" fill="currentColor" fontSize="12" textAnchor="middle" opacity="0.7">60</text>
          <text x="320" y="340" fill="currentColor" fontSize="12" textAnchor="middle" className="font-bold" opacity="0.9">90</text>
          <text x="440" y="340" fill="currentColor" fontSize="12" textAnchor="middle" opacity="0.7">180</text>
          <text x="560" y="340" fill="currentColor" fontSize="12" textAnchor="middle" opacity="0.7">365</text>
          
          {/* Y-axis labels */}
          <text x="70" y="325" fill="currentColor" fontSize="12" textAnchor="end" opacity="0.7">1.0×</text>
          <text x="70" y="250" fill="currentColor" fontSize="12" textAnchor="end" opacity="0.7">1.5×</text>
          <text x="70" y="180" fill="currentColor" fontSize="12" textAnchor="end" opacity="0.7">2.0×</text>
          <text x="70" y="110" fill="currentColor" fontSize="12" textAnchor="end" opacity="0.7">2.5×</text>
          <text x="70" y="45" fill="currentColor" fontSize="12" textAnchor="end" opacity="0.7">3.0×</text>
          
          {/* Axis titles */}
          <text x="320" y="370" fill="currentColor" fontSize="14" textAnchor="middle" opacity="0.8">Days to Market Resolution</text>
          <text x="30" y="180" fill="currentColor" fontSize="14" textAnchor="middle" transform="rotate(-90 30 180)" opacity="0.8">Reward Multiplier</text>
          
          {/* Annotations - aligned to actual curve positions */}
          <g>
            {/* 30-day annotation */}
            {day30Point && (
              <>
                <text x="120" y={day30Point.svgY - 20} fill="currentColor" fontSize="11" opacity="0.7">30 days:</text>
                <text x="120" y={day30Point.svgY - 5} fill="currentColor" fontSize="11" opacity="0.7">Early boost</text>
              </>
            )}
            
            {/* 90-day annotation - same height as long-term */}
            <text x="250" y="210" fill="currentColor" fontSize="11" opacity="0.7">90 days:</text>
            <text x="250" y="225" fill="currentColor" fontSize="11" opacity="0.7">Significant multiplier</text>
            
            {/* Long-term annotation - same height as 90-day */}
            <text x="420" y="210" fill="currentColor" fontSize="11" opacity="0.7">Long-term markets:</text>
            <text x="420" y="225" fill="currentColor" fontSize="11" opacity="0.7">Highest rewards</text>
          </g>
          
          {/* Enhanced tooltip */}
          {hoveredPoint && (
            <g filter="url(#dropShadow)">
              <rect 
                x={tooltipProps.x} 
                y={tooltipProps.y} 
                width="120" 
                height="55" 
                fill="#1a1a1a" 
                stroke="#5EDD2C" 
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
                {Math.round(hoveredPoint.days)} days
              </text>
              <text 
                x={tooltipProps.x + 60} 
                y={tooltipProps.y + 32} 
                fill="#5EDD2C" 
                fontSize="12" 
                textAnchor="middle"
                fontWeight="500">
                Reward Multiplier
              </text>
              <text 
                x={tooltipProps.x + 60} 
                y={tooltipProps.y + 46} 
                fill="#5EDD2C" 
                fontSize="12" 
                textAnchor="middle"
                fontWeight="bold">
                {hoveredPoint.multiplier}×
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};