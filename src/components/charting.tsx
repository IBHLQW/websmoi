import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  data: any[];
  columns: string[];
}

export const Dashboard: React.FC<DashboardProps> = ({ data, columns }) => {
  const [xAxis, setXAxis] = useState(columns[0]);
  const [yAxis, setYAxis] = useState(columns.find(c => typeof data[0]?.[c] === 'number') || columns[1]);

  return (
    <div className="border p-4 rounded bg-white">
      <h3 className="font-bold mb-4">Chart</h3>
      <div className="flex gap-2 mb-4">
        <select value={xAxis} onChange={(e) => setXAxis(e.target.value)} className="border p-1 text-sm">
          {columns.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={yAxis} onChange={(e) => setYAxis(e.target.value)} className="border p-1 text-sm">
          {columns.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxis} />
            <YAxis />
            <Tooltip />
            <Bar dataKey={yAxis} fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
