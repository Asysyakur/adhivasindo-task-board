import React, { useRef, useState } from 'react';
import { Attachment } from '../../types/task';
import { UploadCloud, Trash2, Paperclip } from 'lucide-react';

interface AttachmentListProps {
  attachments: Attachment[];
  onAddAttachment: (attachment: Attachment) => void;
  onRemoveAttachment: (id: string) => void;
}

export const AttachmentList: React.FC<AttachmentListProps> = ({
  attachments,
  onAddAttachment,
  onRemoveAttachment,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = (fileList: FileList | File[]) => {
    Array.from(fileList).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileUrl = event.target?.result as string;
        const newAttachment: Attachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          type: file.type || 'file',
          size: `${(file.size / 1024).toFixed(1)} KB`,
          url: fileUrl || URL.createObjectURL(file),
        };
        onAddAttachment(newAttachment);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="attachment-section flex flex-col gap-3">
      <h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
        <span>Attachments</span>
        {attachments.length > 0 && (
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
            {attachments.length}
          </span>
        )}
      </h3>

      {/* Hidden File Input (multiple files supported) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        className="hidden"
      />

      {/* Drag & Drop Zone from Computer */}
      <div
        onClick={handleBrowseClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`upload-dropzone border-2 border-dashed rounded-xl p-5 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50/80 scale-[1.01] shadow-md'
            : 'border-slate-200 bg-slate-100/80 hover:bg-slate-200/60 hover:border-slate-300'
        }`}
      >
        <UploadCloud
          className={`w-5 h-5 transition-transform ${
            isDragging ? 'text-blue-600 scale-125' : 'text-slate-500'
          }`}
        />
        <span className="text-center">
          <strong className="font-semibold text-slate-700">
            {isDragging ? 'Drop files here to attach' : 'Drag & Drop files here'}
          </strong>{' '}
          or{' '}
          <span className="text-blue-600 font-medium underline underline-offset-2">
            browse from device
          </span>
        </span>
      </div>

      {/* List of Attachments */}
      {attachments.length > 0 && (
        <div className="space-y-2 mt-1">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Paperclip className="w-4 h-4" />
                </div>
                <div className="truncate">
                  {att.url ? (
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-slate-800 hover:text-blue-600 truncate block"
                    >
                      {att.name}
                    </a>
                  ) : (
                    <p className="text-xs font-semibold text-slate-800 truncate">{att.name}</p>
                  )}
                  <p className="text-[10px] text-slate-400 font-medium">{att.size || 'Attachment'}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onRemoveAttachment(att.id)}
                className="text-slate-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                title="Remove attachment"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
