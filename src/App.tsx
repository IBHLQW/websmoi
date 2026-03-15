import React, { useState } from 'react';
import { DataIngestion } from './components/ingest';
import { DataGrid } from './components/datagrid';
import { Dashboard } from './components/charting';

function App() {
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  const handleDataLoaded = (newData: any[], newColumns: string[]) => {
    setData(newData);
    setColumns(newColumns);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Datalyse</h1>
      <div className="space-y-4">
        <DataIngestion onDataLoaded={handleDataLoaded} />
        {data.length > 0 && <DataGrid data={data} columns={columns} />}
        {data.length > 0 && <Dashboard data={data} columns={columns} />}
      </div>
    </div>
  );
}

export default App;