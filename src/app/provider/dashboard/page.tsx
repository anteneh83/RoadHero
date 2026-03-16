"use client";

import React from 'react';
import {
    Car,
    Wallet,
    Users,
    Clock,
    ChevronRight,
    Bell,
    Search,
    MoreHorizontal,
    TrendingUp,
    Link as LinkIcon
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import { useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const stats = [
    { label: 'Jobs Today', value: '12', icon: Car, trend: null },
    { label: 'Logged Income (ETB)', value: '8,240.50', icon: Wallet, trend: null },
    { label: 'Active Technicians', value: '05', icon: Users, trend: null },
    { label: 'Avg. Response Time', value: '24 min', icon: Clock, trend: null },
];

const activity = [
    { type: 'completed', label: 'Towing Service: Yohannes Kassa', details: 'ETB 1,450.00 • Oct 24, 09:12 AM', color: 'bg-green-500' },
    { type: 'completed', label: 'Battery Jumpstart: Sara Belay', details: 'ETB 450.00 • Oct 23, 04:30 PM', color: 'bg-green-500' },
    { type: 'completed', label: 'Tire Change: Dawit Isaac', details: 'ETB 350.00 • Oct 22, 11:15 AM', color: 'bg-green-500' },
    { type: 'request', label: 'New Request: Bole Roundabout', details: 'Awaiting Acceptance • 2 mins ago', color: 'bg-orange-500' },
    { type: 'login', label: 'Technician Biruk Logged In', details: 'Available for Dispatch • 45 mins ago', color: 'bg-blue-600' },
];

export default function RefinedDashboardPage() {
    const { t } = useLanguage();
    const [isOnline, setIsOnline] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const stats = [
        { label: t('active_jobs'), value: '12', icon: Car, trend: null, href: '/provider/queue' },
        { label: t('total_revenue') + ' (ETB)', value: '8,240.50', icon: Wallet, trend: null, href: '/provider/revenue' },
        { label: t('technicians'), value: '05', icon: Users, trend: null, href: '/provider/technicians' },
        { label: t('completion_rate'), value: '24 min', icon: Clock, trend: null, href: '/provider/history' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-xl font-black text-[#171717] dark:text-white transition-colors">{t('dashboard')}</h1>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">{t('welcome_back')}, Abyssinia Motors</p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 bg-white dark:bg-white/5 px-4 py-2 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm transition-colors">
                        <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('online_for_requests')}</span>
                        <button
                            onClick={() => setIsOnline(!isOnline)}
                            className={cn(
                                "w-10 h-5 rounded-full relative transition-colors duration-300",
                                isOnline ? "bg-green-500" : "bg-gray-200 dark:bg-white/10"
                            )}
                        >
                            <div className={cn(
                                "absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300",
                                isOnline ? "translate-x-6" : "translate-x-1"
                            )}></div>
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-orange-50 dark:bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-100 dark:border-orange-500/20 transition-colors">
                            <span className="text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">Trial: 12 Days</span>
                        </div>
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('open-notifications'))}
                            className="p-2 text-gray-400 hover:text-gray-900 transition-colors relative"
                        >
                            <Bell size={18} />
                            <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 border-2 border-white rounded-full"></div>
                        </button>
                    </div>
                </div>
            </div>


            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map((stat) => (
                    <Link
                        key={stat.label}
                        href={stat.href}
                        className="bg-white/70 dark:bg-white/5 backdrop-blur-md p-6 rounded-[32px] border border-white/40 dark:border-white/5 shadow-sm space-y-4 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2 cursor-pointer group relative overflow-hidden"
                    >
                        {/* Subtle background glow */}
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>

                        <div className="w-12 h-12 bg-gray-50/50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-primary dark:text-orange-400 group-hover:bg-primary group-hover:text-white dark:group-hover:bg-accent dark:group-hover:text-white transition-all duration-500 group-hover:rotate-[10deg] shadow-inner border border-white dark:border-white/10">
                            <stat.icon size={22} className="group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight group-hover:text-primary dark:group-hover:text-accent transition-colors">{stat.value}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart Card */}
                <div className="lg:col-span-2 bg-white dark:bg-white/5 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm p-8 flex flex-col transition-all duration-500">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-sm font-black text-[#171717] dark:text-white">{t('revenue')} ({t('last_7_days')})</h3>
                        <div className="flex gap-2">
                            {['Week', 'Month', 'Year'].map((p) => (
                                <button key={p} className={cn(
                                    "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                    p === 'Week' ? "bg-primary text-white shadow-lg shadow-blue-900/20" : "text-gray-400 hover:text-gray-600"
                                )}>{p}</button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 relative min-h-[250px] flex items-end">
                        {/* Simple SVG Chart Mockup */}
                        <svg className="w-full h-full" viewBox="0 -10 700 300">
                            {/* Grid lines */}
                            <line x1="0" y1="50" x2="700" y2="50" stroke="currentColor" className="text-gray-100 dark:text-white/5" strokeWidth="1" />
                            <line x1="0" y1="150" x2="700" y2="150" stroke="currentColor" className="text-gray-100 dark:text-white/5" strokeWidth="1" />
                            <line x1="0" y1="250" x2="700" y2="250" stroke="currentColor" className="text-gray-100 dark:text-white/5" strokeWidth="1" />

                            {/* The Line */}
                            <path
                                d="M 50 150 L 150 120 L 250 180 L 350 70 L 450 130 L 550 40 L 650 80"
                                fill="none"
                                stroke="currentColor"
                                className="text-primary dark:text-accent"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* Points */}
                            {[
                                { x: 50, y: 150 }, { x: 150, y: 120 }, { x: 250, y: 180 },
                                { x: 350, y: 70 }, { x: 450, y: 130 }, { x: 550, y: 40 }, { x: 650, y: 80 }
                            ].map((p, i) => (
                                <circle key={i} cx={p.x} cy={p.y} r="6" fill="#F97316" stroke="white" strokeWidth="3" />
                            ))}
                        </svg>

                        {/* X Axis Labels */}
                        <div className="absolute bottom-[-10px] w-full flex justify-between px-6">
                            {['Oct 01', 'Oct 02', 'Oct 03', 'Oct 04', 'Oct 05', 'Oct 06', 'Oct 07'].map((day) => (
                                <span key={day} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{day}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Activity Card */}
                <div className="bg-white dark:bg-white/5 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm p-8 flex flex-col hover:shadow-lg dark:hover:shadow-primary/5 transition-all duration-500">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-sm font-black text-[#171717] dark:text-white">{t('recent_activity')}</h3>
                            <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">Live monitoring</p>
                        </div>
                        <Link href="/provider/history" className="bg-primary/5 dark:bg-white/10 px-4 py-2 rounded-xl text-[9px] font-black text-primary dark:text-white hover:bg-primary hover:text-white dark:hover:bg-accent transition-all uppercase tracking-widest">{t('view_all')}</Link>
                    </div>

                    <div className="flex-1 space-y-7">
                        {activity.map((item, i) => (
                            <div key={i} className="flex gap-5 items-start group cursor-pointer relative">
                                <div className={cn(
                                    "w-3 h-3 rounded-full mt-1.5 shrink-0 transition-all duration-500 border-2 border-white shadow-sm ring-2 ring-transparent group-hover:ring-primary/20",
                                    item.color
                                )}></div>
                                {i !== activity.length - 1 && (
                                    <div className="absolute left-[5px] top-6 bottom-[-20px] w-0.5 bg-gray-50 group-hover:bg-gray-100 transition-colors"></div>
                                )}
                                <div className="transition-all duration-300 group-hover:translate-x-1.5">
                                    <p className="text-[13px] font-black text-gray-900 dark:text-white leading-none mb-1.5 group-hover:text-primary dark:group-hover:text-accent transition-colors">{item.label}</p>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{item.details}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Link href="/provider/history" className="mt-10 flex items-center justify-center gap-2 group text-[10px] font-black text-primary dark:text-white uppercase tracking-[0.2em] bg-gray-50/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 py-4 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-primary/20 dark:hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all">
                        {t('job_history')}
                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
