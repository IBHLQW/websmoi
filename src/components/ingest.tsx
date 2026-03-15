import React from 'react';
import Papa from 'papaparse';

interface DataIngestionProps {
  onDataLoaded: (data: any[], columns: string[]) => void;
}

export const DataIngestion: React.FC<DataIngestionProps> = ({ onDataLoaded }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        onDataLoaded(results.data, results.meta.fields || []);
      }
    });
  };

  return (
    <div className="border p-4 rounded bg-white">
      <h3 className="font-bold mb-2">Upload CSV</h3>
      <input type="file" accept=".csv" onChange={handleFileChange} className="block w-full text-sm" />
    </div>
  );
};
