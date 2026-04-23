'use client';

import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ColumnMapping {
  key: string;
  label: string;
}

interface ExportButtonProps {
  type: string;
  data: any[];
  filename?: string;
  disabled?: boolean;
  columns?: ColumnMapping[];
}

export function ExportButton({ type, data, filename, disabled, columns }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!data || data.length === 0) return;

    setLoading(true);
    try {
      let exportData = data;

      if (columns && columns.length > 0) {
        exportData = data.map(row => {
          const newRow: any = {};
          columns.forEach(col => {
            newRow[col.label] = row[col.key];
          });
          return newRow;
        });
      }

      const res = await fetch('/api/reports/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data: exportData, filename }),
      });

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename || type}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export error:', err);
      alert('Export xatosi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled || loading || !data || data.length === 0}
      className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
      Export
    </button>
  );
}