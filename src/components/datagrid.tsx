import React from 'react';

interface DataGridProps {
  data: any[];
  columns: string[];
}

export const DataGrid: React.FC<DataGridProps> = ({ data, columns }) => {
  return (
    <div className="border p-4 rounded bg-white overflow-auto max-h-64">
      <h3 className="font-bold mb-2">Data Table</h3>
      <table>
        <thead>
          <tr>
            {columns.map(c => <th key={c}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 10).map((row, i) => (
            <tr key={i}>
              {columns.map(c => <td key={c}>{String(row[c])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
