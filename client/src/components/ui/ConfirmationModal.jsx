import React from 'react';
import { X, AlertCircle } from 'lucide-react';

const ConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText = "Confirmer", 
    cancelText = "Annuler",
    loading = false,
    variant = "danger" // danger, success, info
}) => {
    if (!isOpen) return null;

    const variants = {
        danger: {
            iconContainer: "bg-red-500/10 text-red-500",
            button: "bg-red-600 hover:bg-red-500 shadow-red-600/20",
        },
        success: {
            iconContainer: "bg-emerald-500/10 text-emerald-500",
            button: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20",
        },
        info: {
            iconContainer: "bg-amber-500/10 text-amber-500",
            button: "bg-amber-600 hover:bg-amber-500 shadow-amber-600/20",
        }
    };

    const style = variants[variant] || variants.info;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-[#021024]/80 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={!loading ? onClose : undefined}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300 border border-white/20">
                <div className="p-8 sm:p-10">
                    <button 
                        onClick={onClose}
                        disabled={loading}
                        className="absolute top-6 right-6 p-2 rounded-xl hover:bg-slate-50 transition-colors text-slate-400"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${style.iconContainer}`}>
                            <AlertCircle size={32} />
                        </div>

                        <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-4">
                            {title}
                        </h3>
                        
                        <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10">
                            {message}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 w-full">
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="flex-1 px-8 py-4 rounded-2xl border border-slate-100 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={loading}
                                className={`flex-1 px-8 py-4 rounded-2xl text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl disabled:opacity-50 ${style.button}`}
                            >
                                {loading ? "Traitement..." : confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
