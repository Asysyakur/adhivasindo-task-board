import React, { useEffect, useState } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { CheckCircle2, Sparkles, AlertCircle, X } from 'lucide-react';

export const ToastNotification: React.FC = () => {
  const { toast, hideToast } = useTaskStore();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!toast) return;

    setProgress(100);
    const startTime = Date.now();
    const duration = 3200;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (elapsed >= duration) {
        clearInterval(interval);
        hideToast();
      }
    }, 30);

    return () => clearInterval(interval);
  }, [toast, hideToast]);

  if (!toast) return null;

  const getIconBadge = () => {
    switch (toast.type) {
      case 'success':
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center shrink-0 shadow-2xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        );
      case 'danger':
        return (
          <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 border border-red-200/80 flex items-center justify-center shrink-0 shadow-2xs">
            <AlertCircle className="w-5 h-5" />
          </div>
        );
      case 'info':
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles className="w-5 h-5" />
          </div>
        );
    }
  };

  const getProgressBarColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-emerald-500';
      case 'danger':
        return 'bg-red-500';
      case 'info':
      default:
        return 'bg-blue-600';
    }
  };

  return (
    <div className="fixed bottom-8 right-6 z-50 animate-toast-popup pointer-events-auto max-w-sm w-full">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl shadow-slate-900/15 overflow-hidden flex flex-col">
        <div className="p-3.5 flex items-center gap-3">
          {getIconBadge()}

          <div className="flex-1 min-w-0 pr-2">
            <div className="text-xs font-bold text-slate-800 tracking-tight leading-snug">
              {toast.title}
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-normal mt-0.5 break-words">
              {toast.message}
            </p>
          </div>

          <button
            onClick={hideToast}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title="Tutup Notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic shrinking progress bar */}
        <div className="w-full bg-slate-100 h-1 overflow-hidden">
          <div
            className={`h-full transition-all ease-linear ${getProgressBarColor()}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
