import { useState, useRef } from 'react';

export const DynamicFeeCurves = () => {
  const [hoveredLine, setHoveredLine] = useState(null);
  const [mousePos, setMousePos] = useState(null);
  const [isTouching, setIsTouching] = useState(false);
  const svgRef = useRef(null);
  
  // Generate buy fee curve data (downward arch)
  const generateBuyFeeData = () => {
    const points = [];
    const Fmax = 2.00; // 2% at 0%
    const Fmin = 0.02; // 0.02% at 100%
    const alpha = 1.3;
    
    for (let i = 0; i <= 100; i++) {
      const p = i;
      const fee = Fmin + (Fmax - Fmin) * (1 - Math.pow(p / 100, alpha));
      
      const svgX = 80 + (p / 100) * 480;
      const svgY = 320 - (fee / 2.2) * 280; // Scale from 0 to 2.2%
      
      points.push({ 
        probability: p, 
        fee: fee.toFixed(3), 
        svgX, 
        svgY 
      });
    }
    return points;
  };

  // Generate sell fee curve data (bell curve)
  const generateSellFeeData = () => {
    const points = [];
    const Fpeak = 1.00; // 1% at 50%
    const Fmin = 0.02; // 0.02% at extremes
    const sigma = 25; // Controls curve width
    
    for (let i = 0; i <= 100; i++) {
      const p = i;
      const fee = Fmin + (Fpeak - Fmin) * Math.exp(-0.5 * Math.pow((p - 50) / sigma, 2));
      
      const svgX = 80 + (p / 100) * 480;
      const svgY = 320 - (fee / 2.2) * 280; // Scale from 0 to 2.2%
      
      points.push({ 
        probability: p, 
        fee: fee.toFixed(3), 
        svgX, 
        svgY 
      });
    }
    return points;
  };

  const feeLines = [
    { 
      type: 'buy', 
      color: '#5EDD2C', 
      label: 'Buy-Side Fee', 
      points: generateBuyFeeData(),
      pathData: generateBuyFeeData().map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.svgX} ${p.svgY}`).join(' ')
    },
    { 
      type: 'sell', 
      color: '#DC2626', 
      label: 'Sell-Side Fee', 
      points: generateSellFeeData(),
      pathData: generateSellFeeData().map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.svgX} ${p.svgY}`).join(' ')
    }
  ];

  const updateInteraction = (clientX, clientY) => {
    if (!svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((clientX - rect.left) / rect.width) * 600;
    const svgY = ((clientY - rect.top) / rect.height) * 400;
    
    if (svgX >= 80 && svgX <= 560 && svgY >= 40 && svgY <= 320) {
      if (!isTouching) {
        setMousePos({ x: svgX, y: svgY });
      }
      
      const probability = Math.round(((svgX - 80) / 480) * 100);
      
      let closestLine = null;
      let minDistance = Infinity;
      
      feeLines.forEach(line => {
        if (line.points[probability]) {
          const distance = Math.abs(svgY - line.points[probability].svgY);
          if (distance < minDistance && distance < 40) {
            minDistance = distance;
            closestLine = {
              ...line,
              point: line.points[probability]
            };
          }
        }
      });
      
      setHoveredLine(closestLine);
    } else {
      if (!isTouching) {
        setMousePos(null);
      }
      setHoveredLine(null);
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
      setHoveredLine(null);
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
        setHoveredLine(null);
      }
    }, 2000);
  };

  const getTooltipProps = (line) => {
    if (!line || !line.point) return {};
    
    let x = line.point.svgX - 60;
    let y = line.point.svgY - 55;
    
    if (x < 10) x = 10;
    if (x > 480) x = 480;
    if (y < 10) y = line.point.svgY + 20;
    
    return { x, y };
  };

  const tooltipProps = getTooltipProps(hoveredLine);

  return (
    <div className="w-full max-w-full">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Space Dynamic Fee Curves</h2>
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
            <linearGradient id="gradientBuy" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5EDD2C" stopOpacity="0.4">
                <animate attributeName="stop-opacity" values="0.4;0.5;0.4" dur="4s" repeatCount="indefinite"/>
              </stop>
              <stop offset="100%" stopColor="#5EDD2C" stopOpacity="0.067">
                <animate attributeName="stop-opacity" values="0.067;0.1;0.067" dur="4s" repeatCount="indefinite"/>
              </stop>
            </linearGradient>
            <linearGradient id="gradientSell" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#DC2626" stopOpacity="0.4">
                <animate attributeName="stop-opacity" values="0.4;0.5;0.4" dur="4s" repeatCount="indefinite"/>
              </stop>
              <stop offset="100%" stopColor="#DC2626" stopOpacity="0.067">
                <animate attributeName="stop-opacity" values="0.067;0.1;0.067" dur="4s" repeatCount="indefinite"/>
              </stop>
            </linearGradient>
            <pattern id="feeGrid" width="50" height="35" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 35" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" opacity="0.2"/>
            </pattern>
            <filter id="dropShadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>
          
          {/* Grid */}
          <rect width="480" height="280" x="80" y="40" fill="url(#feeGrid)"/>
          
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
          
          {/* Fee curves */}
          {feeLines.map((line, index) => {
            const gradientId = line.type === 'buy' ? 'gradientBuy' : 'gradientSell';
            const areaPath = `${line.pathData} L 560 320 L 80 320 Z`;
            
            return (
              <g key={index}>
                <path 
                  d={areaPath}
                  fill={`url(#${gradientId})`}
                  opacity={hoveredLine && hoveredLine.type !== line.type ? 0.3 : 1}
                  className="transition-all duration-300"
                />
                <path 
                  d={line.pathData} 
                  fill="none" 
                  stroke={line.color} 
                  strokeWidth={hoveredLine?.type === line.type ? "4" : "3"}
                  className="transition-all duration-300"
                  opacity={hoveredLine && hoveredLine.type !== line.type ? 0.4 : 1}
                />
              </g>
            );
          })}
          
          {/* Interactive areas */}
          {feeLines.map((line, index) => (
            <g key={`interactive-${index}`}>
              {line.points.filter((_, i) => i % 2 === 0).map((point, i) => (
                <circle
                  key={i}
                  cx={point.svgX}
                  cy={point.svgY}
                  r="8"
                  fill="transparent"
                  className="cursor-pointer"
                />
              ))}
            </g>
          ))}
          
          {/* X-axis labels */}
          <text x="80" y="340" fill="currentColor" fontSize="12" textAnchor="middle" opacity="0.7">0</text>
          <text x="180" y="340" fill="currentColor" fontSize="12" textAnchor="middle" opacity="0.7">20</text>
          <text x="280" y="340" fill="currentColor" fontSize="12" textAnchor="middle" opacity="0.7">40</text>
          <text x="320" y="340" fill="currentColor" fontSize="12" textAnchor="middle" opacity="0.9" fontWeight="bold">50</text>
          <text x="380" y="340" fill="currentColor" fontSize="12" textAnchor="middle" opacity="0.7">60</text>
          <text x="480" y="340" fill="currentColor" fontSize="12" textAnchor="middle" opacity="0.7">80</text>
          <text x="560" y="340" fill="currentColor" fontSize="12" textAnchor="middle" opacity="0.7">100</text>
          
          {/* Y-axis labels */}
          <text x="70" y="325" fill="currentColor" fontSize="12" textAnchor="end" opacity="0.7">0.00</text>
          <text x="70" y="290" fill="currentColor" fontSize="12" textAnchor="end" opacity="0.7">0.25</text>
          <text x="70" y="250" fill="currentColor" fontSize="12" textAnchor="end" opacity="0.7">0.50</text>
          <text x="70" y="210" fill="currentColor" fontSize="12" textAnchor="end" opacity="0.7">0.75</text>
          <text x="70" y="170" fill="currentColor" fontSize="12" textAnchor="end" opacity="0.7">1.00</text>
          <text x="70" y="130" fill="currentColor" fontSize="12" textAnchor="end" opacity="0.7">1.25</text>
          <text x="70" y="90" fill="currentColor" fontSize="12" textAnchor="end" opacity="0.7">1.50</text>
          <text x="70" y="50" fill="currentColor" fontSize="12" textAnchor="end" opacity="0.7">2.00</text>
          
          {/* Axis titles */}
          <text x="320" y="370" fill="currentColor" fontSize="14" textAnchor="middle" opacity="0.8">Market Probability (YES %)</text>
          <text x="30" y="180" fill="currentColor" fontSize="14" textAnchor="middle" transform="rotate(-90 30 180)" opacity="0.8">Fee (%)</text>
          
          {/* Legend */}
          <g transform="translate(420, 60)">
            <rect x="-15" y="-15" width="160" height="70" fill="currentColor" opacity="0.05" rx="6"/>
            {feeLines.map((line, index) => (
              <g key={index} transform={`translate(0, ${index * 25})`}>
                <line x1="0" y1="0" x2="20" y2="0" stroke={line.color} strokeWidth="3"/>
                <text x="25" y="4" fill="currentColor" fontSize="12" opacity="0.8">{line.label}</text>
              </g>
            ))}
          </g>
          
          {/* Annotations */}
          <g>
            {/* Early phase annotation */}
            <text x="140" y="60" fill="currentColor" fontSize="11" opacity="0.7">Early phase:</text>
            <text x="140" y="75" fill="currentColor" fontSize="11" opacity="0.7">High buy fee (2%)</text>
            
            {/* Midpoint annotation */}
            <text x="270" y="130" fill="currentColor" fontSize="11" opacity="0.7">Midpoint uncertainty:</text>
            <text x="270" y="145" fill="currentColor" fontSize="11" opacity="0.7">Sell fee peaks near 50%</text>
            
            {/* Certainty annotation */}
            <text x="380" y="285" fill="currentColor" fontSize="11" opacity="0.7">Certainty phase:</text>
            <text x="380" y="300" fill="currentColor" fontSize="11" opacity="0.7">Minimal fees (0.02%)</text>
          </g>
          
          {/* Enhanced tooltip */}
          {hoveredLine && hoveredLine.point && (
            <g filter="url(#dropShadow)">
              <rect 
                x={tooltipProps.x} 
                y={tooltipProps.y} 
                width="120" 
                height="55" 
                fill="#1a1a1a" 
                stroke={hoveredLine.color} 
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
                {hoveredLine.point.probability}% probability
              </text>
              <text 
                x={tooltipProps.x + 60} 
                y={tooltipProps.y + 32} 
                fill={hoveredLine.color} 
                fontSize="12" 
                textAnchor="middle"
                fontWeight="500">
                {hoveredLine.type === 'buy' ? 'Buy Fee' : 'Sell Fee'}
              </text>
              <text 
                x={tooltipProps.x + 60} 
                y={tooltipProps.y + 46} 
                fill={hoveredLine.color} 
                fontSize="12" 
                textAnchor="middle"
                fontWeight="bold">
                {hoveredLine.point.fee}%
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};