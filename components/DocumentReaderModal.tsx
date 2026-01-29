
import React, { useState, useEffect } from 'react';
import { X, Maximize2, ExternalLink, Loader2, FileText } from 'lucide-react';

interface DocumentReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string | undefined;
  fileName?: string;
  title?: string;
}

const DocumentReaderModal: React.FC<DocumentReaderModalProps> = ({ 
  isOpen, 
  onClose, 
  fileUrl, 
  fileName,
  title = "Manuscript Reader"
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && fileUrl) {
      const isData = fileUrl.startsWith('data:');
      if (isData) {
        try {
          const base64Content = fileUrl.split(',')[1];
          const byteCharacters = atob(base64Content);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const objectUrl = URL.createObjectURL(blob);
          setBlobUrl(objectUrl);
          return () => URL.revokeObjectURL(objectUrl);
        } catch (e) {
          setBlobUrl(fileUrl);
        }
      } else {
        setBlobUrl(fileUrl);
      }
    } else {
      setBlobUrl(null);
    }
  }, [isOpen, fileUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-6xl h-[92vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/10">
        <div className="p-5 bg-indigo-900 text-white border-b border-indigo-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/10 rounded-lg">
                <FileText size={18} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] leading-none">{title}</h3>
                {fileName && <p className="text-[8px] text-indigo-300 font-bold mt-1 truncate max-w-[200px]">{fileName}</p>}
              </div>
            </div>
            <div className="w-px h-8 bg-white/10 hidden sm:block"></div>
            <button 
              onClick={() => blobUrl && window.open(blobUrl, '_blank')} 
              className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-all active:scale-95"
            >
              <ExternalLink size={12} /> View in Native Browser
            </button>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 hover:bg-white/10 rounded-full transition-colors active:scale-90"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 bg-slate-100 relative">
          {blobUrl ? (
            <iframe 
              src={blobUrl} 
              className="w-full h-full border-none bg-white animate-in fade-in duration-500" 
              title="Manuscript Viewer" 
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="animate-spin" size={32} />
              <p className="text-[10px] font-bold uppercase tracking-widest">Hydrating Frame...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentReaderModal;
