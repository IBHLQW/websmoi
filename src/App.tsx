import React, { useState, useMemo, useEffect } from 'react';
import { UploadCSV } from './components/ingest.tsx';
import { DataTable } from './components/datagrid.tsx';
import { Chart } from './components/charting.tsx';
import { LayoutDashboard, Table, PieChart, ArrowUpRight, Activity, Sparkles, Download, FileText, FileSpreadsheet, ChevronDown, CheckCircle2 } from 'lucide-react';
import * as _ from 'lodash';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
const exportToPDF = (data: any[]) => {
  if (!data || data.length === 0) return;

  const doc = new jsPDF();
  autoTable(doc, { /* ... */ });
  doc.save('datalyse_report.pdf');
};

const App: React.FC = () => {
  const [data, setData] = useState<any[] | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'table' | 'charts'>('dashboard');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info'} | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleDataLoaded = (newData: any[]) => {
    const filteredData = newData.filter(row => Object.values(row).some(val => val !== null && val !== ''));
    setData(filteredData);
    setNotification({ message: `Loaded ${filteredData.length} records`, type: 'info' });
  };

  const polishData = () => {
    if (!data || data.length === 0) return;
    const initialCount = data.length;
    let polished = _.uniqWith(data, _.isEqual);
    const afterUniqCount = polished.length;
    const numericKeys = Object.keys(data[0]).filter(key => 
      data.some(row => typeof row[key] === 'number')
    );
    numericKeys.forEach(key => {
      const values = polished
        .map(row => row[key])
        .filter(val => typeof val === 'number')
        .sort((a, b) => a - b);
      if (values.length < 4) return;
      const q1 = values[Math.floor(values.length * 0.25)];
      const q3 = values[Math.floor(values.length * 0.75)];
      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;
      polished = polished.filter(row => {
        const val = row[key];
        if (typeof val !== 'number') return true;
        return val >= lowerBound && val <= upperBound;
      });
    });
    const finalCount = polished.length;
    const removedCount = initialCount - finalCount;
    setData(polished);
    setNotification({ 
      message: `Polished! Removed ${removedCount} records (${initialCount - afterUniqCount} duplicates, ${afterUniqCount - finalCount} outliers).`, 
      type: 'success' 
    });
  };

  const exportToCSV = () => {
    if (!data) return;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'datalyse_export.csv');
    setIsExportOpen(false);
  };

  const exportToExcel = () => {
    if (!data) return;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'datalyse_export.xlsx');
    setIsExportOpen(false);
  };

  const exportToPDF = () => {
    if (!data || data.length === 0) return;
    console.log('Exporting to PDF...');
    const doc = new jsPDF();
    console.log('doc initialized:', doc);
    doc.setFontSize(18);
    doc.text('Datalyse Export Report', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Total Records: ${data.length}`, 14, 36);
    const headers = Object.keys(data[0]);
    const body = data.map(row => headers.map(header => row[header]));
    console.log('Calling autoTable with doc:', doc, 'and autoTable function:', autoTable);
    autoTable(doc, {
      head: [headers],
      body: body,
      startY: 45,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [20, 20, 20] },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });
    doc.save('datalyse_report.pdf');
    setIsExportOpen(false);
  };

  const anomaliesCount = useMemo(() => {
    if (!data || data.length === 0) return 0;
    let count = 0;
    const numericKeys = Object.keys(data[0]).filter(key => 
      data.some(row => typeof row[key] === 'number')
    );
    numericKeys.forEach(key => {
      const values = data
        .map(row => row[key])
        .filter(val => typeof val === 'number')
        .sort((a, b) => a - b);
      if (values.length < 4) return;
      const q1 = values[Math.floor(values.length * 0.25)];
      const q3 = values[Math.floor(values.length * 0.75)];
      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;
      data.forEach(row => {
        const val = row[key];
        if (typeof val === 'number' && (val < lowerBound || val > upperBound)) {
          count++;
        }
      });
    });
    const uniqueCount = _.uniqWith(data, _.isEqual).length;
    count += (data.length - uniqueCount);
    return count;
  }, [data]);

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      {notification && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl border ${notification.type === 'success' ? 'bg-emerald-900 border-emerald-800 text-emerald-50' : 'bg-zinc-900 border-zinc-800 text-zinc-50'}`}>
            <CheckCircle2 className={`w-4 h-4 ${notification.type === 'success' ? 'text-emerald-400' : 'text-zinc-400'}`} />
            <span className="text-sm font-semibold tracking-tight">{notification.message}</span>
          </div>
        </div>
      )}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-zinc-200 p-6 flex flex-col z-20">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Datalyse</span>
        </div>
        <nav className="flex-1 space-y-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-200' : 'text-zinc-500 hover:bg-zinc-100'}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-sm font-semibold">Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'table' ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-200' : 'text-zinc-500 hover:bg-zinc-100'}`}
          >
            <Table className="w-4 h-4" />
            <span className="text-sm font-semibold">Explorer</span>
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'charts' ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-200' : 'text-zinc-500 hover:bg-zinc-100'}`}
          >
            <PieChart className="w-4 h-4" />
            <span className="text-sm font-semibold">Analytics</span>
          </button>
        </nav>
        <div className="mt-auto pt-6 border-t border-zinc-100">
          <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">System Status</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${data ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                <span className="text-xs font-bold text-zinc-600">
                  {data ? 'Processing' : 'Idle'}
                </span>
              </div>
              {data && <span className="text-[10px] font-mono text-zinc-400">{data.length} rows</span>}
            </div>
          </div>
        </div>
      </aside>
      <main className="ml-64 p-12 max-w-[1600px]">
        {!data ? (
          <div className="max-w-xl mx-auto mt-32">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-zinc-900 tracking-tight mb-4 italic serif">Analyze. Visualize.</h1>
              <p className="text-zinc-500 text-lg font-medium leading-relaxed">
                The modern data interface for technical teams. 
                Upload your CSV to generate instant insights.
              </p>
            </div>
            <UploadCSV onDataLoaded={handleDataLoaded} />
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex items-end justify-between border-b border-zinc-200 pb-8">
              <div>
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Workspace</span>
                  <span className="text-zinc-300">/</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-900">{activeTab}</span>
                </div>
                <h2 className="text-4xl font-bold text-zinc-900 tracking-tight italic serif">
                  {activeTab === 'dashboard' ? 'Data Overview' : activeTab === 'table' ? 'Data Explorer' : 'Advanced Analytics'}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={polishData}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-all uppercase tracking-widest group"
                >
                  <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                  Polish Data
                </button>
                <div className="relative">
                  <button
                    onClick={() => setIsExportOpen(!isExportOpen)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white text-zinc-900 text-xs font-bold rounded-xl border border-zinc-200 hover:border-zinc-900 transition-all uppercase tracking-widest"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isExportOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isExportOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-zinc-200 shadow-2xl p-2 z-30 animate-in fade-in zoom-in-95 duration-200">
                      <button 
                        onClick={exportToCSV}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-xl transition-colors"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        CSV Spreadsheet
                      </button>
                      <button 
                        onClick={exportToExcel}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-xl transition-colors"
                      >
                        <Table className="w-4 h-4" />
                        Excel Workbook
                      </button>
                      <button 
                        onClick={exportToPDF}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-xl transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        PDF Report
                      </button>
                    </div>
                  )}
                </div>
                <div className="w-px h-8 bg-zinc-200 mx-1" />
                <button
                  onClick={() => setData(null)}
                  className="px-4 py-2.5 text-xs font-bold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest border border-zinc-200 rounded-xl hover:bg-white"
                >
                  Reset
                </button>
              </div>
            </header>
            <div className="min-h-[600px]">
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Total Records</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold tracking-tighter">{data.length}</span>
                        <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
                          <ArrowUpRight className="w-3 h-3" /> 12%
                        </span>
                      </div>
                    </div>
                    <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Data Density</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold tracking-tighter">{Object.keys(data[0] || {}).length}</span>
                        <span className="text-xs font-bold text-zinc-400">Dimensions</span>
                      </div>
                    </div>
                    <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Issues Detected</p>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-4xl font-bold tracking-tighter ${anomaliesCount > 0 ? 'text-amber-500' : 'text-zinc-900'}`}>{anomaliesCount}</span>
                        <span className="text-xs font-bold text-zinc-400 flex items-center gap-0.5">
                          Outliers & Duplicates
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
                      <div className="flex items-center justify-between mb-8">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Trend Analysis</h4>
                        <div className="flex gap-2">
                          <div className="w-2 h-2 rounded-full bg-zinc-900" />
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                        </div>
                      </div>
                      <Chart data={data} />
                    </div>
                    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6">Recent Activity</h4>
                      <div className="space-y-6">
                        {data.slice(0, 5).map((row, i) => {
                          const values = Object.values(row);
                          const dateVal = values[0];
                          const displayDate = (!dateVal || dateVal === 0 || dateVal === '0') ? 'N/A' : String(dateVal);
                          
                          return (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-0">
                              <div className="space-y-1">
                                <p className="text-xs font-bold text-zinc-900">{displayDate}</p>
                                <p className="text-[10px] text-zinc-400 font-mono uppercase">{String(values[1] || 'Unknown')}</p>
                              </div>
                              <span className="text-xs font-bold font-mono">+{Number(values[2]) || 0}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'table' && (
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8 h-[700px]">
                  <DataTable data={data} />
                </div>
              )}
              {activeTab === 'charts' && (
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8 h-[700px]">
                  <div className="mb-8">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Distribution View</h4>
                    <p className="text-sm text-zinc-500">Visualizing patterns and outliers across the dataset.</p>
                  </div>
                  <Chart data={data} />
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
