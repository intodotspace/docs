import { useState, useRef } from 'react';

export function LeverageImpactChart() {
  const [hoveredLine, setHoveredLine] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 15, y: 0 });
  const svgRef = useRef(null);

  const entryPrice = 15;
  const leverages = [
    { name: 'No Leverage', multiplier: 1, color: '#FF9D3D', label: 'No Leverage' },
    { name: '3x Leverage', multiplier: 3, color: '#5B9FFF', label: '3× Leverage' },
    { name: '5x Leverage', multiplier: 5, color: '#5EDD2C', label: '5× Leverage' },
    { name: '10x Leverage', multiplier: 10, color: '#B94FFF', label: '10× Leverage' }
  ];

  const calculatePnL = (probability, leverage) => {
    const priceChange = ((probability - entryPrice) / entryPrice) * 100;
    return priceChange * leverage;
  };

  const generatePath = (leverage) => {
    const points = [];
    for (let prob = 0; prob <= 100; prob += 0.5) {
      const x = 80 + (prob / 100) * 1080;
      const pnl = calculatePnL(prob, leverage);
      const y = 350 - (pnl / 800) * 280;
      points.push(`${x},${y}`);
    }
    return `M ${points.join(' L ')}`;
  };

  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * 1200;
    const probability = Math.max(0, Math.min(100, ((svgX - 80) / 1080) * 100));
    setMousePos({ x: probability, y: svgX });
  };

  const handleMouseLeave = () => {
    setHoveredLine(null);
  };

  const getTooltipData = (leverage) => {
    const pnl = calculatePnL(mousePos.x, leverage.multiplier);
    return {
      probability: mousePos.x.toFixed(0),
      leverage: leverage.label,
      pnl: pnl.toFixed(0),
      color: leverage.color
    };
  };

  return (
    <div className="w-full h-full bg-black flex items-center justify-center p-8">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Leverage Impact on PnL</h1>
          <p className="text-gray-400 text-lg">Market Example: US Government Shutdown</p>
        </div>

        <svg
          ref={svgRef}
          viewBox="0 0 1200 700"
          className="w-full"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ maxHeight: '600px' }}
        >
          <defs>
            {leverages.map((lev) => (
              <linearGradient key={lev.name} id={`gradient-${lev.name}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={lev.color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={lev.color} stopOpacity="0.05" />
              </linearGradient>
            ))}
          </defs>

          {/* Grid */}
          <g opacity="0.15">
            {[0, 100, 200, 300, 400, 500, 600, 700, 800].map((val) => {
              const y = 350 - (val / 800) * 280;
              return <line key={val} x1="80" y1={y} x2="1160" y2={y} stroke="#666" strokeWidth="1" strokeDasharray="4,4" />;
            })}
            {[-200, -100].map((val) => {
              const y = 350 - (val / 800) * 280;
              return <line key={val} x1="80" y1={y} x2="1160" y2={y} stroke="#666" strokeWidth="1" strokeDasharray="4,4" />;
            })}
            {[0, 20, 40, 60, 80, 100].map((prob) => {
              const x = 80 + (prob / 100) * 1080;
              return <line key={prob} x1={x} y1="70" x2={x} y2="630" stroke="#666" strokeWidth="1" strokeDasharray="4,4" />;
            })}
          </g>

          {/* Axes */}
          <line x1="80" y1="350" x2="1160" y2="350" stroke="#666" strokeWidth="2" />
          <line x1="80" y1="70" x2="80" y2="630" stroke="#666" strokeWidth="2" />

          {/* Entry price vertical line */}
          <line x1={80 + (entryPrice / 100) * 1080} y1="70" x2={80 + (entryPrice / 100) * 1080} y2="630" stroke="#888" strokeWidth="3" strokeDasharray="10,5" />
          <circle cx={80 + (entryPrice / 100) * 1080} cy="350" r="8" fill="white" stroke="#888" strokeWidth="2" />

          {/* Underglow areas - reversed order (10x bottom, No Leverage top) */}
          {[...leverages].reverse().map((lev) => {
            const path = generatePath(lev.multiplier);
            const closedPath = `${path} L 1160,630 L 80,630 Z`;
            return (
              <path
                key={`glow-${lev.name}`}
                d={closedPath}
                fill={`url(#gradient-${lev.name})`}
              />
            );
          })}

          {/* Lines - reversed order (10x bottom, No Leverage top) */}
          {[...leverages].reverse().map((lev) => (
            <path
              key={`line-${lev.name}`}
              d={generatePath(lev.multiplier)}
              fill="none"
              stroke={lev.color}
              strokeWidth="3"
              opacity={hoveredLine === null || hoveredLine === lev.name ? 1 : 0.3}
              onMouseEnter={() => setHoveredLine(lev.name)}
              style={{ cursor: 'pointer' }}
            />
          ))}

          {/* Y-axis labels */}
          {[800, 700, 600, 500, 400, 300, 200, 100, 0, -100, -200].map((val) => {
            const y = 350 - (val / 800) * 280;
            return (
              <text key={val} x="65" y={y + 5} fill="#999" fontSize="18" textAnchor="end">
                {val}
              </text>
            );
          })}

          {/* X-axis labels */}
          {[0, 20, 40, 60, 80, 100].map((prob) => {
            const x = 80 + (prob / 100) * 1080;
            return (
              <text key={prob} x={x} y="655" fill="#999" fontSize="18" textAnchor="middle">
                {prob}
              </text>
            );
          })}

          {/* Axis titles */}
          <text x="40" y="350" fill="#ccc" fontSize="20" textAnchor="middle" transform="rotate(-90 40 350)">
            PnL or Margin (%)
          </text>
          <text x="620" y="690" fill="#ccc" fontSize="20" textAnchor="middle">
            Market Probability (%)
          </text>

          {/* Entry price label */}
          <text x={80 + (entryPrice / 100) * 1080} y="50" fill="#ddd" fontSize="16" textAnchor="middle" opacity="0.8">
            Entry Price (15%)
          </text>

          {/* Legend */}
          <g transform="translate(900, 120)">
            {leverages.map((lev, idx) => (
              <g key={lev.name} transform={`translate(0, ${idx * 35})`}>
                <line x1="0" y1="0" x2="40" y2="0" stroke={lev.color} strokeWidth="4" />
                <text x="50" y="5" fill={lev.color} fontSize="18" opacity={hoveredLine === null || hoveredLine === lev.name ? 1 : 0.4}>
                  {lev.label}
                </text>
              </g>
            ))}
          </g>

          {/* Tooltip */}
          {hoveredLine && (
            <g>
              {leverages.filter(lev => lev.name === hoveredLine).map((lev) => {
                const data = getTooltipData(lev);
                const tooltipX = Math.min(Math.max(mousePos.y, 200), 1000);
                const pnl = calculatePnL(mousePos.x, lev.multiplier);
                const tooltipY = 350 - (pnl / 800) * 280;

                return (
                  <g key={lev.name}>
                    <rect
                      x={tooltipX - 110}
                      y={tooltipY - 75}
                      width="220"
                      height="70"
                      fill="#1a1a1a"
                      stroke={data.color}
                      strokeWidth="3"
                      rx="8"
                      opacity="0.95"
                    />
                    <text x={tooltipX} y={tooltipY - 45} fill="white" fontSize="16" textAnchor="middle" fontWeight="500">
                      {data.probability}% probability
                    </text>
                    <text x={tooltipX} y={tooltipY - 25} fill={data.color} fontSize="16" textAnchor="middle" fontWeight="500">
                      {data.leverage}
                    </text>
                    <text x={tooltipX} y={tooltipY - 5} fill={data.color} fontSize="18" textAnchor="middle" fontWeight="bold">
                      {data.pnl > 0 ? '+' : ''}{data.pnl}% PnL
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}