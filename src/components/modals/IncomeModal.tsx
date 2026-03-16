"use client";

import React from 'react';
import { X, Info, ChevronDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface IncomeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const IncomeModal = ({ isOpen, onClose }: IncomeModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="bg-white dark:bg-[#111111] w-full max-w-md rounded-[32px] shadow-2xl relative z-10 p-8 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 border border-transparent dark:border-white/5 transition-all">
                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 p-1.5 text-gray-400 dark:text-gray-600 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="mb-8">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-1 transition-colors">Finalize Job & Record Income</h2>
                    <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 transition-colors">Enter the total amount collected from the customer.</p>
                </div>

                <div className="space-y-8">
                    {/* Amount Field */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 transition-colors">Total Amount Received</label>
                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-primary dark:text-accent text-[10px] tracking-widest pointer-events-none transition-colors">ETB</div>
                            <input
                                type="text"
                                defaultValue="1,250.00"
                                className="w-full bg-white dark:bg-white/[0.02] border-2 border-primary/20 dark:border-primary/40 rounded-2xl pl-16 pr-6 py-4 text-xl font-black text-gray-900 dark:text-white focus:border-primary dark:focus:border-accent focus:ring-4 focus:ring-primary/5 dark:focus:ring-primary/20 transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 transition-colors">Payment Method</label>
                        <div className="relative group">
                            <select className="w-full bg-gray-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-xl px-5 py-3 text-xs font-bold text-gray-900 dark:text-white appearance-none outline-none focus:ring-2 focus:ring-primary/10 dark:focus:ring-primary/30 transition-all cursor-pointer">
                                <option>Telebirr</option>
                                <option>CBE Birr</option>
                                <option>Cash</option>
                                <option>Chapa Transfer</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600 group-hover:text-primary dark:group-hover:text-accent transition-colors pointer-events-none" />
                        </div>
                    </div>

                    {/* Notes Field */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 transition-colors">Internal Notes (Optional)</label>
                        <textarea
                            placeholder="Details of repair, parts used..."
                            rows={3}
                            className="w-full bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[24px] px-5 py-4 text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-700 outline-none focus:ring-2 focus:ring-primary/10 dark:focus:ring-primary/30 transition-all resize-none shadow-sm"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={onClose}
                        className="w-full h-14 bg-[#F97316] dark:bg-accent rounded-2xl text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-orange-900/10 dark:shadow-none hover:bg-orange-600 dark:hover:bg-accent/80 active:scale-95 transition-all"
                    >
                        Log Income & Finish
                    </button>

                    {/* Footer Tip */}
                    <div className="flex items-center gap-3 justify-center text-primary/60 dark:text-accent/60 transition-colors">
                        <Info size={16} />
                        <p className="text-[10px] font-bold uppercase tracking-widest">This data will be synced to your Revenue Journal.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
