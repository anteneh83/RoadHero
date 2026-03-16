"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function Toast() {
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    useEffect(() => {
        const handleToast = (e: any) => {
            setToast(e.detail);
            setTimeout(() => setToast(null), 3000);
        };
        window.addEventListener('show-toast', handleToast);
        return () => window.removeEventListener('show-toast', handleToast);
    }, []);

    if (!toast) return null;

    return (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-5 duration-500">
            <div className={cn(
                "px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[300px] border transition-colors",
                toast.type === 'success' ? "bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-500/20 text-green-900 dark:text-green-400" :
                    toast.type === 'error' ? "bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-900 dark:text-red-400" :
                        "bg-blue-50 dark:bg-primary/10 border-blue-100 dark:border-primary/20 text-blue-900 dark:text-accent"
            )}>
                {toast.type === 'success' && <CheckCircle size={20} className="text-green-500" />}
                {toast.type === 'error' && <AlertCircle size={20} className="text-red-500" />}
                {toast.type === 'info' && <Info size={20} className="text-blue-500" />}

                <p className="text-xs font-black uppercase tracking-widest flex-1">{toast.message}</p>

                <button onClick={() => setToast(null)} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors text-current opacity-50 hover:opacity-100">
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
