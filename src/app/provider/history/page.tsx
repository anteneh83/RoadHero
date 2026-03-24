"use client";

import React, { useState } from 'react';
import {
    Search,
    Calendar,
    ChevronDown,
    Download,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    Bell
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const historyData = [
    { id: '#RH-8921', date: 'Oct 24, 14:20', customer: 'Yohannes Kassa', service: 'Fuel Delivery', amount: '1,250.00', status: 'SUCCESS' },
    { id: '#RH-8918', date: 'Oct 24, 11:05', customer: 'Sara Belay', service: 'Flat Tire', amount: '800.00', status: 'CANCELLED' },
    { id: '#RH-8915', date: 'Oct 23, 18:45', customer: 'Abebe Desta', service: 'Towing', amount: '4,500.00', status: 'SUCCESS' },
    { id: '#RH-8912', date: 'Oct 23, 10:15', customer: 'Markos T.', service: 'Engine Check', amount: '1,800.00', status: 'SUCCESS' },
];

export default function JobHistoryPage() {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredHistory = historyData.filter(item =>
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.service.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleExport = () => {
        window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: "Preparing CSV export for " + filteredHistory.length + " records...", type: 'success' }
        }));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-xl font-black text-[#171717] dark:text-white transition-colors">{t('job_history')}</h1>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1 tracking-widest mt-1">{t('history_subtitle')}</p>
                </div>

                <div className="flex items-center gap-6">
                    <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('total')}: <span className="text-gray-900 dark:text-white transition-colors">1,248</span></span>
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('open-notifications'))}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors relative"
                    >
                        <Bell size={18} />
                        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 border-2 border-white dark:border-[#0A0A0A] rounded-full"></div>
                    </button>
                </div>
            </div>

            {/* Filters and Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="flex-1 relative group w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-primary transition-colors" size={16} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('search_job_customer')}
                        className="w-full pl-14 pr-5 py-3.5 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm outline-none focus:ring-4 focus:ring-primary/5 dark:focus:ring-primary/20 transition-all text-xs font-medium dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600"
                    />
                </div>

                <div className="flex gap-3 w-full lg:w-auto">
                    <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm text-[10px] font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 transition-all">
                        <Calendar size={14} className="text-gray-400 dark:text-gray-500" />
                        <span>Oct 01 - 31</span>
                        <ChevronDown size={12} className="text-gray-400 dark:text-gray-500" />
                    </button>

                    <button
                        onClick={handleExport}
                        className="bg-white dark:bg-white/5 border-2 border-primary dark:border-primary/40 px-6 py-3 rounded-xl text-[10px] font-black text-primary dark:text-white uppercase tracking-widest hover:bg-primary/5 dark:hover:bg-primary/20 transition-all shadow-sm active:scale-95 transition-all"
                    >
                        {t('export')}
                    </button>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white dark:bg-white/5 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden transition-all duration-700">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 dark:bg-white/5">
                        <tr>
                            <th className="px-8 py-4 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">{t('job_id')}</th>
                            <th className="px-8 py-4 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">{t('date')}</th>
                            <th className="px-8 py-4 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">{t('customer')}</th>
                            <th className="px-8 py-4 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">{t('service')}</th>
                            <th className="px-8 py-4 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">{t('amount')}</th>
                            <th className="px-8 py-4 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">{t('status')}</th>
                            <th className="px-8 py-4 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap text-right">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                        {filteredHistory.map((item, i) => (
                            <tr key={i} className="hover:bg-primary/5 dark:hover:bg-white/5 transition-colors group cursor-pointer even:bg-gray-50/20 dark:even:bg-white/[0.02]">
                                <td className="px-8 py-5 text-xs font-black text-primary dark:text-accent group-hover:underline underline-offset-4">{item.id}</td>
                                <td className="px-8 py-5 text-xs font-bold text-gray-400 dark:text-gray-500 transition-colors">{item.date}</td>
                                <td className="px-8 py-5 text-xs font-black text-gray-900 dark:text-white transition-colors">{item.customer}</td>
                                <td className="px-8 py-5 text-xs font-bold text-gray-600 dark:text-gray-400 transition-colors">{item.service}</td>
                                <td className="px-8 py-5 text-xs font-black text-gray-900 dark:text-white transition-colors">{item.amount}</td>
                                <td className="px-8 py-5">
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all",
                                        item.status === 'SUCCESS' ? "bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400" : "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                                    )}>
                                        {t(item.status.toLowerCase())}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <button className="p-1.5 text-primary dark:text-accent hover:bg-primary/10 dark:hover:bg-accent/10 rounded-lg transition-all">
                                        <Download size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="p-8 border-t border-gray-50 dark:border-white/5 flex justify-center items-center transition-colors">
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-300 dark:text-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all">
                            <ChevronLeft size={16} />
                        </button>
                        {[1, 2, 3].map((n) => (
                            <button
                                key={n}
                                className={cn(
                                    "w-8 h-8 rounded-lg text-xs font-black transition-all",
                                    n === 1 ? "bg-primary dark:bg-accent text-white shadow-lg shadow-blue-100 dark:shadow-none" : "text-gray-400 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-white/5"
                                )}
                            >
                                {n}
                            </button>
                        ))}
                        <span className="text-gray-300 dark:text-gray-700 px-2 font-black">...</span>
                        <button className="p-2 text-gray-300 dark:text-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
