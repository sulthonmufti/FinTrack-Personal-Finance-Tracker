import { AlertTriangle, X } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, description }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 text-center">
          {/* Icon Warning */}
          <div className="mx-auto w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-4">
            <AlertTriangle size={32} />
          </div>
          
          <h3 className="text-xl font-bold text-slate-800 mb-2">Confirm Delete</h3>
          <p className="text-slate-500 text-sm mb-6">
            Are you sure you want to delete <span className="font-bold text-slate-700">"{description}"</span>? This action cannot be undone.
          </p>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-all">
              Cancel
            </button>
            <button onClick={onConfirm} className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold shadow-lg shadow-rose-100 transition-all">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}