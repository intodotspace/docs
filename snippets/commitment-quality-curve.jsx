import { useState } from 'react';

export const CommitmentQualityCurve = () => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  
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

  return (
    <div className="w-full p-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Commitment Quality Curve</h2>
        <p className="text-sm text-gray-400">Balanced Price ($0.50)</p>
      </div>
      
      <div className="flex justify-center relative">
        <svg width="600" height="400" viewBox="0 0 600 400" className="bg-transparent">
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5EDD2C" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#5EDD2C" stopOpacity="0.1"/>
            </linearGradient>
            <pattern id="grid" width="60" height="35" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 35" fill="none" stroke="#374151" strokeWidth="1" strokeDasharray="3,3"/>
            </pattern>
          </defs>
          
          {/* Grid */}
          <rect width="480" height="280" x="80" y="40" fill="url(#grid)"/>
          
          {/* Axes */}
          <line x1="80" y1="320" x2="560" y2="320" stroke="#9CA3AF" strokeWidth="2"/>
          <line x1="80" y1="40" x2="80" y2="320" stroke="#9CA3AF" strokeWidth="2"/>
          
          {/* Area under curve */}
          <path d={`${pathData} L 560 320 L 80 320 Z`} 
                fill="url(#areaGradient)"/>
          
          {/* Main curve line */}
          <path d={pathData} 
                fill="none" 
                stroke="#5EDD2C" 
                strokeWidth="3"
                className="transition-all duration-300 hover:stroke-width-4"/>
          
          {/* Interactive points */}
          {points.filter((_, i) => i % 5 === 0).map((point, i) => (
            <circle
              key={i}
              cx={point.svgX}
              cy={point.svgY}
              r="4"
              fill="#5EDD2C"
              className="cursor-pointer transition-all duration-200 hover:r-6 hover:fill-white hover:stroke-2"
              stroke="#5EDD2C"
              strokeWidth="0"
              onMouseEnter={() => setHoveredPoint(point)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
          
          {/* Vertical dashed line at x=0.5 with animation */}
          <line x1="320" y1="40" x2="320" y2="320" 
                stroke="#9CA3AF" 
                strokeWidth="2" 
                strokeDasharray="8,4"
                className="transition-opacity duration-300">
            <animate attributeName="stroke-dashoffset" values="0;12;0" dur="3s" repeatCount="indefinite"/>
          </line>
          
          {/* X-axis labels */}
          <text x="80" y="340" fill="#9CA3AF" fontSize="12" textAnchor="middle">0.0</text>
          <text x="200" y="340" fill="#9CA3AF" fontSize="12" textAnchor="middle">0.25</text>
          <text x="320" y="340" fill="#9CA3AF" fontSize="12" textAnchor="middle" className="font-bold">0.5</text>
          <text x="440" y="340" fill="#9CA3AF" fontSize="12" textAnchor="middle">0.75</text>
          <text x="560" y="340" fill="#9CA3AF" fontSize="12" textAnchor="middle">1.0</text>
          
          {/* Y-axis labels */}
          <text x="70" y="325" fill="#9CA3AF" fontSize="12" textAnchor="end">0.0</text>
          <text x="70" y="250" fill="#9CA3AF" fontSize="12" textAnchor="end">0.25</text>
          <text x="70" y="180" fill="#9CA3AF" fontSize="12" textAnchor="end">0.5</text>
          <text x="70" y="110" fill="#9CA3AF" fontSize="12" textAnchor="end">0.75</text>
          <text x="70" y="45" fill="#9CA3AF" fontSize="12" textAnchor="end">1.0</text>
          
          {/* Axis titles */}
          <text x="320" y="370" fill="#9CA3AF" fontSize="14" textAnchor="middle">Limit Order Price</text>
          <text x="30" y="180" fill="#9CA3AF" fontSize="14" textAnchor="middle" transform="rotate(-90 30 180)">Relative Reward Size</text>
          
          {/* Tooltip */}
          {hoveredPoint && (
            <g>
              <rect x={hoveredPoint.svgX - 40} y={hoveredPoint.svgY - 45} 
                    width="80" height="35" 
                    fill="#1F2937" 
                    stroke="#5EDD2C" 
                    strokeWidth="1" 
                    rx="4"
                    className="opacity-90"/>
              <text x={hoveredPoint.svgX} y={hoveredPoint.svgY - 30} 
                    fill="white" 
                    fontSize="10" 
                    textAnchor="middle">
                Price: ${hoveredPoint.x.toFixed(2)}
              </text>
              <text x={hoveredPoint.svgX} y={hoveredPoint.svgY - 18} 
                    fill="#5EDD2C" 
                    fontSize="10" 
                    textAnchor="middle">
                Reward: {hoveredPoint.reward}
              </text>
            </g>
          )}
        </svg>
      </div>
      
      <div className="text-center mt-4">
        <span className="inline-flex items-center text-sm text-gray-400">
          <div className="w-4 h-0.5 bg-[#5EDD2C] mr-2 animate-pulse"></div>
          Commitment Quality Reward Curve
        </span>
      </div>
    </div>
  );
};