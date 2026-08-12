import React, { useRef, useState } from 'react';
import { X, Download, Upload, ArrowUpDown, FileText, CheckCircle2 } from 'lucide-react';
import { useTaskStore } from '../../store/taskStore';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({ isOpen, onClose }) => {
  const { columns, tasks, boards, users, showToast } = useTaskStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  // Export board data as JSON file download
  const handleExport = () => {
    const dataToExport = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      boards,
      columns,
      tasks,
      users,
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(dataToExport, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `adhivasindo-kanban-backup-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('Data board berhasil di-export sebagai file JSON! 📥', 'success', 'Export Selesai');
  };

  // Import JSON file from computer
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.columns && json.tasks) {
          // Restore to localStorage
          const stateToSave = {
            state: {
              boards: json.boards || boards,
              activeBoardId: json.boards?.[0]?.id || 'board-1',
              columns: json.columns,
              tasks: json.tasks,
              users: json.users || users,
            },
            version: 0,
          };
          localStorage.setItem('adhivasindo-task-board-storage', JSON.stringify(stateToSave));
          setImportStatus('Data berhasil di-import! Reloading...');
          showToast('Data board berhasil di-restore! 🔄', 'success', 'Import Sukses');

          setTimeout(() => {
            window.location.reload();
          }, 1200);
        } else {
          alert('Invalid JSON structure. Missing columns or tasks data.');
        }
      } catch (err) {
        alert('Failed to parse JSON file. Please ensure it is a valid backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <ArrowUpDown className="w-5 h-5 text-blue-600 shrink-0" />
            <div className="text-base tracking-tight">Export / Import Board Data</div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex flex-col gap-4">
          {/* Export Box */}
          <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-slate-800">Export Papan (*.json)</span>
              <span className="text-[11px] text-slate-500 font-medium">
                Unduh backup lengkap task, kolom, dan subtask.
              </span>
            </div>
            <button
              onClick={handleExport}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>

          {/* Import Box */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-slate-800">Import / Restore Data</span>
              <span className="text-[11px] text-slate-500 font-medium">
                Pilih file backup JSON dari komputer Anda untuk memulihkan papan.
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 bg-white border border-slate-300 hover:border-blue-400 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs hover:bg-slate-50"
            >
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Pilih File Backup JSON...</span>
            </button>

            {importStatus && (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{importStatus}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
