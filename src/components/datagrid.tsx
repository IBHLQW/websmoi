import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, Table } from 'lucide-react';

interface DataTableProps {
  data: any[];
}

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);

  const columns = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];
    
    if (searchTerm) {
      result = result.filter(item => 
        Object.values(item).some(val => 
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    Object.entries(columnFilters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(item => 
          String(item[key]).toLowerCase().includes(value.toLowerCase())
        );
      }
    });

    if (sortConfig !== null) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();

        if (aStr < bStr) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aStr > bStr) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return result;
  }, [data, sortConfig, searchTerm, columnFilters]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (key: string, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setColumnFilters({});
    setSearchTerm('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Global search..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border flex items-center gap-2 ${
              showFilters 
                ? 'bg-zinc-900 text-white border-zinc-900' 
                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            <Table className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Show Column Filters'}
          </button>
          {(searchTerm || Object.values(columnFilters).some(v => v)) && (
            <button 
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
        
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 bg-zinc-50 border border-zinc-200 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
            {columns.map(col => (
              <div key={col} className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{col}</label>
                <input
                  type="text"
                  placeholder={`Filter ${col}...`}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                  value={columnFilters[col] || ''}
                  onChange={(e) => handleFilterChange(col, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto border border-zinc-200 rounded-xl">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="sticky top-0 bg-zinc-50 border-bottom border-zinc-200 z-10">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 font-semibold text-zinc-600 border-b border-zinc-200"
                >
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:text-zinc-900 transition-colors"
                    onClick={() => requestSort(col)}
                  >
                    {col}
                    {sortConfig?.key === col ? (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    ) : null}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredAndSortedData.map((row, i) => (
              <tr key={i} className="hover:bg-zinc-50 transition-colors">
                {columns.map((col) => (
                  <td key={col} className="px-4 py-3 text-zinc-600 font-mono text-xs">
                    {String(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAndSortedData.length === 0 && (
          <div className="p-12 text-center text-zinc-400">
            No matching records found.
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTable;
