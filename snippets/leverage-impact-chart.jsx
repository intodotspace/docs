import { useState, useRef } from 'react';

export const LeverageImpactChart = () => {
  const [hoveredLine, setHoveredLine] = useState(null);
  const [mousePos, setMousePos] = useState(null);
  const [isTouching, setIsTouching] = useState(false);
  const svgRef = useRef(null);
  
  // Generate data for each leverage line
  const generateLeverageData = (leverage) => {
    const points = [];
    const entryPrice = 15; // 15% entry price
    
    for (let i = 0; i <= 100; i++) {
      const marketProb = i; // 0% to 100%
      const marketPrice = marketProb;
      
      // Calculate PnL percentage
      const priceDiff = marketPrice - entryPrice;
      const pnl = (priceDiff / entryPrice) * 100 * leverage;
      
      const svgX = 80 + (marketProb / 100) * 480;
      const svgY = 320 - ((pnl + 200) / 1000) * 280; // Scale from -200 to 800
      
      points.push({ 
        marketProb, 
        pnl: pnl.toFixed(0), 
        svgX, 
        svgY,
        leverage 
      });
    }
    return points;
  };

  const leverageLines = [
    { leverage: 1, color: '#3B82F6', label: '1× Leverage' },
    { leverage: 3, color: '#10B981', label: '3× Leverage' },
    { leverage: 5, color: '#F59E0B', label: '5× Leverage' },
    { leverage: 10, color: '#EF4444', label: '10× Leverage' }
  ];

  const allLines = leverageLines.map(line => ({
    ...line,
    points: generateLeverageData(line.leverage),
    pathData: generateLeverageData(line.leverage)
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.svgX} ${p.svgY}`)
      .join(' ')
  }));

  const updateInteraction = (clientX, clientY) => {
    if (!svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((clientX - rect.left) / rect.width) * 600;
    const svgY = ((clientY - rect.top) / rect.height) * 400;
    
    if (svgX >= 80 && svgX <= 560 && svgY >= 40 && svgY <= 320) {
      if (!isTouching) {
        setMousePos({ x: svgX, y: svgY });
      }
      
      // Find closest line at this X position
      const marketProb = ((svgX - 80) / 480) * 100;
      const closestIndex = Math.round(marketProb);
      
      if (closestIndex >= 0 && closestIndex <= 100) {
        // Find which line is closest to mouse Y position
        let closestLine = null;
        let minDistance = Infinity;
        
        allLines.forEach(line => {
          if (line.points[closestIndex]) {
            const distance = Math.abs(svgY - line.points[closestIndex].svgY);
            if (distance < minDistance && distance < 30) {
              minDistance = distance;
              closestLine = {
                ...line,
                point: line.points[closestIndex]
              };
            }
          }
        });
        
        setHoveredLine(closestLine);
      }
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
        <h2 className="text-xl font-semibold mb-2">Leverage Impact on PnL</h2>
        <p className="text-sm opacity-70">(Market: US Government Shutdown)</p>
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
            <pattern id="leverageGrid" width="60" height="35" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 35" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" opacity="0.3"/>
            </pattern>
            <filter id="dropShadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>
          
          {/* Grid */}
          <rect width="480" height="280" x="80" y="40" fill="url(#leverageGrid)"/>
          
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
          
          {/* Zero line */}
          <line x1="80" y1="264" x2="560" y2="264" stroke="currentColor" strokeWidth="1" strokeDasharray="5,5" opacity="0.4"/>
          
          {/* Entry price vertical line */}
          <line x1="152" y1="40" x2="152" y2="320" stroke="currentColor" strokeWidth="2" strokeDasharray="8,4" opacity="0.6">
            <animate attributeName="stroke-dashoffset" values="0;12;0" dur="3s" repeatCount="indefinite"/>
          </line>
          
          {/* Leverage lines */}
          {allLines.map((line, index) => (
            <g key={index}>
              <path 
                d={line.pathData} 
                fill="none" 
                stroke={line.color} 
                strokeWidth={hoveredLine?.leverage === line.leverage ? "4" : "3"}
                className="transition-all duration-300"
                opacity={hoveredLine && hoveredLine.leverage !== line.leverage ? 0.4 : 1}
              />
            </g>
          ))}
          
          {/* Interactive areas for each line */}
          {allLines.map((line, index) => (
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
          <text x="152" y="340" fill="currentColor" fontSize="12" textAnchor="middle" opacity="0.9" fontWeight="bold">15</text>
          <text x="200" y="340" fill="currentColor" fontSize="12" textAnchor="middle" opacity="0.7">20</text>
          <text x="280" y="340" fill="currentColor" fontSize="12" textAnchor="middle" opacity="0.7">40</text>
          <text x="360" y="340" fill="currentColor" fontSize="12" textAnchor="middle" opacity="0.7">60</text>
          <text x="440" y="340" fill="currentColor" fontSize="12" textAnchor="middle" opacity="0.7">80</text>
          <text x="560" y="340" fill="currentColor" fontSize="12" textAnchor="middle" opacity="0.7">100</text>
          
          {/* Y-axis labels */}
          <text x="70" y="325" fill="currentColor" fontSize="12" textAnchor="end" opacity="0.7">-200</text>
          <text x="70" y="290" fill="currentColor" fontSize="12" textAnchor="end" opacity="0.7">0</text>
          <text x="70" y="250" fill="currentColor" fontSize="12" textAnchor="end" opacity="0.7">200</text>
          <text x="70" y="180" fill="currentColor" fontSize="12" textAnchor="end" opacity="0.7">400</text>
          <text x="70" y="110" fill="currentColor" fontSize="12" textAnchor="end" opacity="0.7">600</text>
          <text x="70" y="45" fill="currentColor" fontSize="12" textAnchor="end" opacity="0.7">800</text>
          
          {/* Axis titles */}
          <text x="320" y="370" fill="currentColor" fontSize="14" textAnchor="middle" opacity="0.8">Market Probability (%)</text>
          <text x="30" y="180" fill="currentColor" fontSize="14" textAnchor="middle" transform="rotate(-90 30 180)" opacity="0.8">PnL (% of Margin)</text>
          
          {/* Legend */}
          <g transform="translate(400, 60)">
            <rect x="-10" y="-10" width="150" height="100" fill="currentColor" opacity="0.05" rx="4"/>
            {leverageLines.map((line, index) => (
              <g key={index} transform={`translate(0, ${index * 18})`}>
                <line x1="0" y1="0" x2="20" y2="0" stroke={line.color} strokeWidth="3"/>
                <text x="25" y="4" fill="currentColor" fontSize="12" opacity="0.8">{line.label}</text>
              </g>
            ))}
            <line x1="0" y1="72" x2="20" y2="72" stroke="currentColor" strokeWidth="2" strokeDasharray="4,4" opacity="0.6"/>
            <text x="25" y="76" fill="currentColor" fontSize="12" opacity="0.8">Entry Price (15%)</text>
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
                {hoveredLine.point.marketProb}% probability
              </text>
              <text 
                x={tooltipProps.x + 60} 
                y={tooltipProps.y + 32} 
                fill={hoveredLine.color} 
                fontSize="12" 
                textAnchor="middle"
                fontWeight="500">
                {hoveredLine.label}
              </text>
              <text 
                x={tooltipProps.x + 60} 
                y={tooltipProps.y + 46} 
                fill={hoveredLine.color} 
                fontSize="12" 
                textAnchor="middle"
                fontWeight="bold">
                {hoveredLine.point.pnl > 0 ? '+' : ''}{hoveredLine.point.pnl}% PnL
              </text>
            </g>
          )}
        </svg>
      </div>
      
      <div className="text-center mt-4">
        <span className="inline-flex items-center text-sm opacity-70">
          <div className="w-4 h-0.5 bg-[#5EDD2C] mr-2 animate-pulse"></div>
          Leverage Impact Analysis
        </span>
      </div>
    </div>
  );
};