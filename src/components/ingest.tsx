import { Upload, FileSpreadsheet, FileCode } from 'lucide-react';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';
import React, { useRef } from 'react';

interface IngestProps {
  onDataLoaded: (data: any[]) => void;
}

export const UploadCSV: React.FC<IngestProps> = ({ onDataLoaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.csv')) {
        parseCSV(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        parseXLSX(file);
      }
    }
  };

  const parseCSV = (file: File | string) => {
    Papa.parse(file as any, {
      header: true,
      download: typeof file === 'string',
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        onDataLoaded(results.data);
      },
      error: (error: any) => {
        console.error('Error parsing CSV:', error);
      }
    } as any);
  };

  const parseXLSX = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array', cellDates: true, dateNF: 'yyyy-mm-dd' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
      onDataLoaded(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  const loadSampleData = (e: React.MouseEvent) => {
    e.stopPropagation();
    parseCSV('/sample_data.csv');
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const convertXLSXtoCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array', cellDates: true, dateNF: 'yyyy-mm-dd' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const csvData = XLSX.utils.sheet_to_csv(worksheet);
      
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', file.name.replace(/\.[^/.]+$/, "") + ".csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    reader.readAsArrayBuffer(file);
    event.target.value = '';
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
          accept=".csv,.xlsx,.xls"
          className="hidden"
        />
        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
          <Upload className="w-8 h-8 text-zinc-600" />
        </div>
        <h3 className="text-xl font-semibold text-zinc-900">Upload Data</h3>
        <p className="text-zinc-500 mt-2 text-center max-w-xs">
          Click or drag and drop your CSV or Excel file here to start analyzing your data.
        </p>
        <div className="flex gap-4 mt-6">
          <button className="px-6 py-2 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors">
            Select File
          </button>
        </div>
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

      <div className="pt-4 border-t border-zinc-100">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Quick Tools</p>
        <div className="grid grid-cols-1 gap-2">
          <div className="relative">
            <input
              type="file"
              id="xlsx-convert"
              className="hidden"
              accept=".xlsx,.xls"
              onChange={convertXLSXtoCSV}
            />
            <button 
              onClick={() => document.getElementById('xlsx-convert')?.click()}
              className="w-full flex items-center gap-3 p-3 text-left border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all group"
            >
              <FileCode className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900" />
              <span className="text-xs font-semibold text-zinc-600 group-hover:text-zinc-900">Convert XLSX to CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadCSV;
