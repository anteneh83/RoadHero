"use client";

import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    ArrowUpRight,
    Bell,
    Loader2,
    FileDown
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { IncomeModal } from '@/components/modals/IncomeModal';
import { revenueService, Transaction } from '@/services/api.service';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function RevenueJournalPage() {
    const { t } = useLanguage();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [totalRevenue, setTotalRevenue] = useState('0.00');
    const [totalJobs, setTotalJobs] = useState(0);

    useEffect(() => {
        fetchTransactions();
    }, [filter]);

    const fetchTransactions = async () => {
        setIsLoading(true);
        try {
            const typeParam = filter === 'App Requests' ? 'JOB' : filter === 'Walk-ins' ? 'WALK_IN' : undefined;
            const response = await revenueService.listTransactions({ type: typeParam });

            // Handle different response structures robustly
            const rawBody = response.data || response;
            let list: Transaction[] = [];

            if (Array.isArray(rawBody)) {
                list = rawBody;
            } else if (rawBody.transactions && Array.isArray(rawBody.transactions)) {
                list = rawBody.transactions;
            } else if (rawBody.data && Array.isArray(rawBody.data)) {
                list = rawBody.data;
            } else if (rawBody.results && Array.isArray(rawBody.results)) {
                list = rawBody.results;
            }

            setTransactions(list);

            // Handle Stats
            const statsSource = rawBody.stats || rawBody;
            const revenue = statsSource.total_revenue || statsSource.total_amount_collected;
            const count = statsSource.total_count || statsSource.total_jobs || list.length;

            if (revenue !== undefined) {
                setTotalRevenue(typeof revenue === 'number' ? revenue.toLocaleString() : revenue);
                setTotalJobs(count);
            } else {
                const total = list.reduce((sum: number, tx: Transaction) => sum + parseFloat(String(tx.amount).replace(/,/g, '')), 0);
                setTotalRevenue(total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
                setTotalJobs(list.length);
            }
        } catch (error: any) {
            console.error("[Revenue] Fetch Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Failed to load transactions", type: 'error' }
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const blob = await revenueService.exportCSV();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `revenue_report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error: any) {
            console.error("[Revenue] Export Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Failed to export CSV", type: 'error' }
            }));
        }
    };

    const filteredData = transactions.filter(item => {
        const matchesSearch = String(item.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.technician.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.service.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-xl font-black text-[#171717] dark:text-white transition-colors">{t('revenue')}</h1>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">{t('revenue_analysis')}</p>
                </div>

                <div className="flex items-center gap-6">
                    <button
                        onClick={handleExport}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors relative group"
                        title="Export CSV"
                    >
                        <FileDown size={20} />
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Export CSV</span>
                    </button>
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('open-notifications'))}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors relative"
                    >
                        <Bell size={18} />
                        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 border-2 border-white dark:border-[#0A0A0A] rounded-full"></div>
                    </button>
                    <div className="bg-orange-50 dark:bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-100 dark:border-orange-500/20 transition-colors">
                        <span className="text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">Trial: 12 Days</span>
                    </div>
                </div>
            </div>

            {/* Summary Card */}
            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-[32px] border border-white/40 dark:border-white/5 shadow-xl shadow-primary/5 p-8 flex justify-between items-center relative overflow-hidden group hover:shadow-2xl transition-all duration-700">
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/5 dark:bg-accent/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>

                <div className="space-y-2 relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 bg-primary dark:bg-accent rounded-full animate-pulse"></div>
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none transition-colors">{t('total_revenue')}</p>
                    </div>
                    <div className="flex items-baseline gap-2 group-hover:translate-x-1 transition-transform duration-500">
                        <h2 className="text-4xl font-black text-[#1E3A8A] dark:text-white tracking-tighter transition-colors">{totalRevenue}</h2>
                        <span className="text-sm font-black text-primary/40 dark:text-accent/40 uppercase tracking-tighter transition-colors">ETB</span>
                    </div>
                </div>

                <div className="text-right space-y-2 relative z-10">
                    <div className="bg-gray-50/50 dark:bg-white/5 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white dark:border-white/10 shadow-sm inline-block group-hover:border-primary/20 transition-colors">
                        <p className="text-[10px] font-black text-gray-900 dark:text-white leading-none mb-1 transition-colors">{t('total_jobs')}: <span className="text-primary dark:text-accent italic">{totalJobs}</span></p>
                        <div className="flex items-center gap-1 justify-end">
                            <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">{t('growth')}:</p>
                            <span className="text-[10px] font-black text-green-500 flex items-center gap-0.5 transition-colors">
                                <ArrowUpRight size={12} strokeWidth={3} /> 12%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="bg-white dark:bg-white/5 p-1 rounded-2xl flex gap-1 border border-gray-100 dark:border-white/5 shadow-sm w-full md:w-auto overflow-hidden transition-colors">
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'app_requests', label: 'App Requests' },
                        { key: 'walk_ins', label: 'Walk-ins' }
                    ].map((item) => (
                        <button
                            key={item.key}
                            onClick={() => setFilter(item.label)}
                            className={cn(
                                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                filter === item.label ? "bg-primary text-white shadow-lg" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                            )}
                        >
                            {t(item.key)}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-primary transition-colors" size={16} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('search_job_id')}
                        className="w-full pl-12 pr-6 py-3.5 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-white/5 shadow-sm outline-none focus:ring-4 focus:ring-primary/5 dark:focus:ring-primary/20 transition-all text-xs font-medium text-black dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600"
                    />
                </div>
            </div>

            {/* Revenue Table */}
            <div className="bg-white dark:bg-white/5 rounded-[40px] border border-gray-100 dark:border-white/5 shadow-2xl shadow-black/5 overflow-hidden group transition-colors">
                <div className="overflow-x-auto scrollbar-none">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-50 dark:border-white/5 transition-colors">
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{t('date')} / {t('time')}</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{t('source')}</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{t('service')}</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{t('technician')}</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] text-right">{t('amount_etb')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5 transition-colors">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-10 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="animate-spin text-primary" size={32} />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Transactions...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-10 py-20 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        No transactions found
                                    </td>
                                </tr>
                            ) : filteredData.map((item, i) => (
                                <tr key={i} className="hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-300 group/row cursor-pointer even:bg-gray-50/20 dark:even:bg-white/[0.01]">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-primary/20 dark:bg-primary/40 group-row-hover:bg-primary transition-colors"></div>
                                            <span className="text-[13px] font-black text-gray-900 dark:text-white transition-colors">{item.date}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className={cn(
                                            "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm transition-all",
                                            item.source === 'Walk-in' || item.source === 'WALK_IN' ? "bg-white dark:bg-white/5 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-white/5" : "bg-primary text-white"
                                        )}>
                                            {item.id.toString().startsWith('#') ? item.id : `#${item.id}`}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-black text-gray-900 dark:text-white leading-none mb-1 transition-colors">{item.service}</span>
                                            <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">{item.source}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-[10px] font-black border border-gray-100 dark:border-white/5 group-row-hover:border-primary/20 dark:group-row-hover:border-primary/40 text-gray-400 dark:text-gray-500 uppercase transition-colors">
                                                {item.technician?.split(' ').map(n => n[0]).join('') || '?'}
                                            </div>
                                            <span className="text-[13px] font-black text-gray-900 dark:text-white group-row-hover:text-primary dark:group-row-hover:text-accent transition-colors">{item.technician}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <span className="text-lg font-black text-gray-900 dark:text-white tracking-tighter tabular-nums group-row-hover:text-[#1E3A8A] dark:group-row-hover:text-accent transition-colors">
                                            {typeof item.amount === 'number' ? item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : item.amount}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 border-t border-gray-50 dark:border-white/5 flex justify-between items-center text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest bg-gray-50/30 dark:bg-white/[0.01] transition-colors">
                    <span>{t('showing_records').replace('{count}', `1-${filteredData.length}`).replace('{total}', String(totalJobs))}</span>
                </div>
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-10 right-10 z-[120]">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-4 bg-accent hover:bg-orange-600 text-white px-8 py-5 rounded-3xl shadow-2xl shadow-orange-900/30 transition-all active:scale-95 group font-black uppercase tracking-[0.2em] text-[10px]"
                >
                    <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                    <span>{t('add_job_entry')}</span>
                </button>
            </div>

            <IncomeModal isOpen={isModalOpen} onClose={(success) => {
                setIsModalOpen(false);
                if (success === true) fetchTransactions();
            }} />
        </div>
    );
}
