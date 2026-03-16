import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';

interface ChartProps {
  data: any[];
}

export const Chart: React.FC<ChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    if (data.length === 0) return [];
    
    // Find a date or category column for X axis
    const keys = Object.keys(data[0]);
    const xKey = keys.find(k => k.toLowerCase().includes('date') || k.toLowerCase().includes('category') || k.toLowerCase().includes('name')) || keys[0];
    
    // Find numeric columns for Y axis
    const yKey = keys.find(k => typeof data[0][k] === 'number') || keys[1];

    return data.map(item => ({
      name: item[xKey],
      value: Number(item[yKey]) || 0,
      original: item
    }));
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-zinc-50 rounded-xl border border-zinc-100 text-zinc-400">
        <p>No data to visualize</p>
      </div>
    );
  }

  // Detect outliers for coloring
  const values = chartData.map(d => d.value);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(values.map(x => Math.pow(x - avg, 2)).reduce((a, b) => a + b, 0) / values.length);
  
  const isOutlier = (val: number) => Math.abs(val - avg) > stdDev * 2;

  const CustomBarChart = BarChart as any;

  return (
    <div className="h-full w-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <CustomBarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#a1a1aa', fontSize: 10 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#a1a1aa', fontSize: 10 }}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            cursor={{ fill: '#f4f4f5' }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={isOutlier(entry.value) ? '#ef4444' : '#18181b'} 
                fillOpacity={isOutlier(entry.value) ? 0.8 : 1}
              />
            ))}
          </Bar>
        </CustomBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
