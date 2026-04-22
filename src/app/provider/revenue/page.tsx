"use client";

import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    ArrowUpRight,
    Loader2,
    FileDown,
    Wallet,
    CheckCircle2
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { IncomeModal } from '@/components/modals/IncomeModal';
import { DashboardHeader } from '@/components/DashboardHeader';
import { revenueService } from '@/services/api.service';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface RawTransaction {
    id: number;
    type: string;           // 'JOB' | 'WALK_IN'
    amount: number;
    payment_method?: string;
    service_provided?: string;
    internal_notes?: string;
    created_at: string;
}

export default function RevenueJournalPage() {
    const { t } = useLanguage();
    const [transactions, setTransactions] = useState<RawTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
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

            // Robustly extract the list from various response shapes
            const rawBody = response.data || response;
            let list: RawTransaction[] = [];

            if (Array.isArray(rawBody)) {
                list = rawBody;
            } else if (Array.isArray(rawBody?.transactions)) {
                list = rawBody.transactions;
            } else if (Array.isArray(rawBody?.data)) {
                list = rawBody.data;
            } else if (Array.isArray(rawBody?.results)) {
                list = rawBody.results;
            }

            setTransactions(list);

            // Compute totals
            const total = list.reduce((sum, tx) => sum + (parseFloat(String(tx.amount)) || 0), 0);
            setTotalRevenue(total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
            setTotalJobs(list.length);
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
        setIsExporting(true);
        try {
            const blob = await revenueService.exportCSV();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `revenue_report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "CSV exported successfully", type: 'success' }
            }));
        } catch (error: any) {
            console.error("[Revenue] Export Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Failed to export CSV", type: 'error' }
            }));
        } finally {
            setIsExporting(false);
        }
    };

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch {
            return iso;
        }
    };

    const filteredData = transactions.filter(item => {
        const q = searchQuery.toLowerCase();
        return (
            String(item.id).includes(q) ||
            (item.service_provided || '').toLowerCase().includes(q) ||
            (item.payment_method || '').toLowerCase().includes(q) ||
            (item.type || '').toLowerCase().includes(q)
        );
    });

    return (
        <div className="flex flex-col min-h-screen">
            <DashboardHeader
                title={t('revenue')}
                subtitle={t('revenue_analysis')}
            >
                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-6 py-3 bg-white/70 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
                >
                    {isExporting ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
                    Export CSV
                </button>
            </DashboardHeader>

            <div className="p-8 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-28">

                {/* Summary Card */}
                <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-[32px] border border-white/40 dark:border-white/5 shadow-xl shadow-primary/5 p-8 flex justify-between items-center relative overflow-hidden group hover:shadow-2xl transition-all duration-700">
                    <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/5 dark:bg-accent/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>

                    <div className="space-y-2 relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 bg-primary dark:bg-accent rounded-full animate-pulse"></div>
                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none">{t('total_revenue')}</p>
                        </div>
                        <div className="flex items-baseline gap-2 group-hover:translate-x-1 transition-transform duration-500">
                            <h2 className="text-4xl font-black text-[#1E3A8A] dark:text-white tracking-tighter">{totalRevenue}</h2>
                            <span className="text-sm font-black text-primary/40 dark:text-accent/40 uppercase tracking-tighter">ETB</span>
                        </div>
                    </div>

                    <div className="text-right space-y-2 relative z-10">
                        <div className="bg-gray-50/50 dark:bg-white/5 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white dark:border-white/10 shadow-sm inline-block group-hover:border-primary/20 transition-colors">
                            <p className="text-[10px] font-black text-gray-900 dark:text-white leading-none mb-1">{t('total_jobs')}: <span className="text-primary dark:text-accent italic">{totalJobs}</span></p>
                            <div className="flex items-center gap-1 justify-end">
                                <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('growth')}:</p>
                                <span className="text-[10px] font-black text-green-500 flex items-center gap-0.5">
                                    <ArrowUpRight size={12} strokeWidth={3} /> 12%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="bg-white dark:bg-white/5 p-1 rounded-2xl flex gap-1 border border-gray-100 dark:border-white/5 shadow-sm w-full md:w-auto">
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
                            placeholder="Search by service, method, ID..."
                            className="w-full pl-12 pr-6 py-3.5 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-white/5 shadow-sm outline-none focus:ring-4 focus:ring-primary/5 dark:focus:ring-primary/20 transition-all text-xs font-medium text-black dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600"
                        />
                    </div>
                </div>

                {/* Revenue Table */}
                <div className="bg-white dark:bg-white/5 rounded-[40px] border border-gray-100 dark:border-white/5 shadow-2xl shadow-black/5 overflow-hidden">
                    <div className="overflow-x-auto scrollbar-none">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-50 dark:border-white/5">
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Date / Time</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Type</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Service</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Payment</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] text-right">Amount (ETB)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
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
                                        <td colSpan={5} className="px-10 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <Wallet size={32} className="text-gray-200 dark:text-gray-700" />
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No transactions found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredData.map((item) => (
                                    <tr key={item.id} className="hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-300 group/row even:bg-gray-50/20 dark:even:bg-white/[0.01]">
                                        <td className="px-10 py-7">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-primary/30 dark:bg-primary/40 group-hover/row:bg-primary transition-colors shrink-0"></div>
                                                <span className="text-[13px] font-black text-gray-900 dark:text-white">{formatDate(item.created_at)}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-7">
                                            <span className={cn(
                                                "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm",
                                                item.type === 'WALK_IN'
                                                    ? "bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-white/10"
                                                    : "bg-primary/10 dark:bg-primary/20 text-primary dark:text-blue-300 border border-primary/20"
                                            )}>
                                                {item.type === 'WALK_IN' ? 'Walk-in' : 'App Job'}
                                            </span>
                                        </td>
                                        <td className="px-10 py-7">
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-black text-gray-900 dark:text-white leading-none mb-1">
                                                    {item.service_provided || '—'}
                                                </span>
                                                <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                                    #{item.id}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-7">
                                            <span className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-500/20">
                                                {item.payment_method || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-10 py-7 text-right">
                                            <span className="text-lg font-black text-gray-900 dark:text-white tracking-tighter tabular-nums group-hover/row:text-primary dark:group-hover/row:text-accent transition-colors">
                                                {(parseFloat(String(item.amount)) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-8 border-t border-gray-50 dark:border-white/5 flex justify-between items-center text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest bg-gray-50/30 dark:bg-white/[0.01]">
                        <span>Showing {filteredData.length} of {totalJobs} records</span>
                        <div className="flex items-center gap-2 text-green-500">
                            <CheckCircle2 size={12} />
                            <span>Live from API</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Add Walk-in Button */}
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
