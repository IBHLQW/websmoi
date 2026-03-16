import { Upload, FileSpreadsheet } from 'lucide-react';
import Papa from 'papaparse';
import React, { useRef } from 'react';

interface IngestProps {
  onDataLoaded: (data: any[]) => void;
}

export const UploadCSV: React.FC<IngestProps> = ({ onDataLoaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      parseFile(file);
    }
  };

  const parseFile = (file: File | string) => {
    Papa.parse(file as any, {
      header: true,
      download: typeof file === 'string',
      dynamicTyping: true,
      complete: (results: any) => {
        onDataLoaded(results.data);
      },
      error: (error: any) => {
        console.error('Error parsing CSV:', error);
      }
    } as any);
  };

  const loadSampleData = (e: React.MouseEvent) => {
    e.stopPropagation();
    parseFile('/sample_data.csv');
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div 
        className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-300 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer" 
        onClick={triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv"
          className="hidden"
        />
        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
          <Upload className="w-8 h-8 text-zinc-600" />
        </div>
        <h3 className="text-xl font-semibold text-zinc-900">Upload CSV Data</h3>
        <p className="text-zinc-500 mt-2 text-center max-w-xs">
          Click or drag and drop your CSV file here to start analyzing your data.
        </p>
        <button className="mt-6 px-6 py-2 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors">
          Select File
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-zinc-200" />
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest">Or</span>
        <div className="flex-1 h-px bg-zinc-200" />
      </div>

      <button 
        onClick={loadSampleData}
        className="w-full flex items-center justify-center gap-3 p-4 border border-zinc-200 rounded-2xl hover:bg-zinc-50 transition-all group"
      >
        <FileSpreadsheet className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
        <div className="text-left">
          <p className="text-sm font-semibold text-zinc-900">Load Sample Dataset</p>
          <p className="text-xs text-zinc-500">See Datalyse in action with pre-made sales data.</p>
        </div>
      </button>
    </div>
  );
};

export default UploadCSV;
