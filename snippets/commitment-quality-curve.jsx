import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';

const generateCurveData = (numPoints = 100) => {
  const data = [];
  for (let i = 0; i <= numPoints; i++) {
    const x = i / numPoints;
    const y = Math.exp(-Math.pow(x - 0.5, 2) / 0.04);
    data.push({ x, y });
  }
  return data;
};

export const CommitmentQualityCurve = () => {
  const curveData = generateCurveData();
  
  return (
    <div className="w-full p-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Commitment Quality Curve</h2>
        <p className="text-sm text-gray-400">Balanced Price ($0.50)</p>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart 
          data={curveData} 
          margin={{ top: 20, right: 30, left: 60, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          
          <XAxis 
            dataKey="x" 
            type="number"
            scale="linear"
            domain={[0, 1]}
            tickFormatter={(value) => value.toFixed(1)}
            tick={{ fill: '#9CA3AF' }}
            label={{ 
              value: 'Limit Order Price', 
              position: 'insideBottom', 
              offset: -10,
              style: { textAnchor: 'middle', fill: '#9CA3AF' }
            }}
          />
          
          <YAxis 
            domain={[0, 1.1]}
            tickFormatter={(value) => value.toFixed(1)}
            tick={{ fill: '#9CA3AF' }}
            label={{ 
              value: 'Relative Reward Size', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: '#9CA3AF' }
            }}
          />
          
          <Area
            dataKey="y"
            stroke="#5EDD2C"
            strokeWidth={3}
            fill="rgba(94, 221, 44, 0.4)"
            type="monotone"
          />
          
          <ReferenceLine 
            x={0.5} 
            stroke="#9CA3AF" 
            strokeWidth={2}
            strokeDasharray="8 4"
          />
        </AreaChart>
      </ResponsiveContainer>
      
      <div className="text-center mt-4">
        <span className="inline-flex items-center text-sm text-gray-400">
          <div className="w-4 h-0.5 bg-[#5EDD2C] mr-2"></div>
          Commitment Quality Reward Curve
        </span>
      </div>
    </div>
  );
};