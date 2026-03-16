"use client";

import React, { useState } from 'react';
import {
    Search,
    Plus,
    Star,
    ChevronRight,
    Settings,
    Bell,
    X,
    Camera,
    UserPlus
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const heroes = [
    { id: 1, initials: 'BK', name: 'Biruk Kassahun', phone: '+251 911 223 344', specialty: 'Heavy Duty Towing', rating: '4.9', color: 'bg-green-100 text-green-700', status: 'On Duty' },
    { id: 2, initials: 'EH', name: 'Elias Haile', phone: '+251 922 445 566', specialty: 'Tire Specialist', rating: '4.7', color: 'bg-orange-100 text-orange-700', status: 'Offline' },
    { id: 3, initials: 'TM', name: 'Tewodros M.', phone: '+251 944 556 778', specialty: 'Auto Electrician', rating: '4.8', color: 'bg-blue-100 text-blue-700', status: 'On Duty' },
];

export default function TechnicianManagementPage() {
    const { t } = useLanguage();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const filteredHeroes = heroes.filter(hero => {
        const matchesSearch = hero.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            hero.phone.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'All' ||
            hero.status === activeFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="relative min-h-screen flex flex-col gap-8 animate-in fade-in duration-1000 pb-20">
            {/* Overlay for Drawer */}
            {isDrawerOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/20 dark:bg-black/40 backdrop-blur-sm z-[100] transition-all animate-in fade-in duration-300"
                    onClick={() => setIsDrawerOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <div className={cn(
                "flex flex-col gap-8 transition-all duration-500",
                isDrawerOpen ? "pr-[380px] blur-[2px] scale-[0.98]" : "pr-0"
            )}>
                {/* Header Area */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-xl font-black text-[#171717] dark:text-white transition-colors">{t('technicians')}</h1>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1 tracking-widest mt-1">{t('technicians_subtitle')}</p>
                    </div>

                    <div className="flex items-center gap-6">
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

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden group focus-within:ring-4 focus-within:ring-primary/5 dark:focus-within:ring-primary/20 transition-all">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-primary transition-colors" size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('search_hero')}
                            className="w-full pl-14 pr-6 py-4 text-xs font-medium outline-none text-gray-900 dark:text-white bg-transparent placeholder:text-gray-300 dark:placeholder:text-gray-600"
                        />
                    </div>
                    <div className="flex bg-white dark:bg-white/5 p-1 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden transition-colors">
                        {['All', 'On Duty', 'Offline'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className={cn(
                                    "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    activeFilter === f ? "bg-primary text-white shadow-lg" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                                )}
                            >
                                {t(f.toLowerCase().replace(' ', '_'))}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Hero List Table */}
                <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-[40px] border border-white/40 dark:border-white/5 shadow-2xl shadow-black/5 overflow-hidden group transition-all duration-700">
                    <div className="overflow-x-auto scrollbar-none">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-50 dark:border-white/5">
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{t('hero_info')}</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{t('specialty')}</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{t('status')}</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] text-right">{t('rating')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredHeroes.map((hero) => (
                                    <tr key={hero.id} className="hover:bg-primary/5 dark:hover:bg-white/5 transition-all duration-300 group/row cursor-pointer even:bg-gray-50/20 dark:even:bg-white/[0.02]">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-6">
                                                <div className={cn(
                                                    "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shadow-xl shrink-0 relative group-row-hover:scale-110 transition-transform duration-500",
                                                    hero.status === 'On Duty' ? "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400" : "bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-600"
                                                )}>
                                                    {hero.initials}
                                                    <div className={cn(
                                                        "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-white dark:border-[#0A0A0A]",
                                                        hero.status === 'On Duty' ? "bg-green-500 animate-pulse" : "bg-gray-300"
                                                    )}></div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[15px] font-black text-gray-900 dark:text-white group-row-hover:text-primary dark:group-row-hover:text-accent transition-colors leading-none">{hero.name}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{hero.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 dark:bg-accent/40"></div>
                                                <span className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest transition-colors">{hero.specialty}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={cn(
                                                "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border transition-all",
                                                hero.status === 'On Duty' ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-100 dark:border-green-500/20" : "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 border-transparent"
                                            )}>
                                                {t(hero.status.toLowerCase().replace(' ', '_'))}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex items-center gap-1.5 justify-end">
                                                <Star size={14} className="text-accent fill-accent" />
                                                <span className="text-lg font-black text-gray-900 dark:text-white tabular-nums transition-colors">{hero.rating}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Side Drawer: Add New Hero */}
            <div className={cn(
                "fixed right-0 top-0 bottom-0 w-[380px] bg-white dark:bg-[#0A0A0A] z-[110] shadow-[0_0_80px_rgba(0,0,0,0.1)] dark:shadow-black/50 transition-transform duration-700 p-8 flex flex-col border-l border-gray-100 dark:border-white/5",
                isDrawerOpen ? "translate-x-0" : "translate-x-full"
            )}>
                <div className="flex justify-between items-center mb-10">
                    <div className="space-y-1">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight transition-colors">{t('add_new_hero')}</h2>
                        <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('new_team_member')}</p>
                    </div>
                    <button
                        onClick={() => setIsDrawerOpen(false)}
                        className="p-2.5 text-gray-300 dark:text-gray-600 hover:text-gray-900 dark:hover:text-white transition-colors hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 space-y-10 overflow-y-auto pr-4 custom-scrollbar">
                    {/* Photo Upload */}
                    <div className="space-y-4">
                        <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('hero_photo')}</p>
                        <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-[28px] border-2 border-dashed border-gray-100 dark:border-white/10 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-primary/50 dark:hover:border-accent/50 transition-all">
                            <Plus size={18} className="text-primary dark:text-accent group-hover:scale-125 transition-transform" />
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('full_name')}</label>
                            <input
                                type="text"
                                placeholder="Sami Solomon"
                                className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 dark:focus:ring-primary/20 transition-all shadow-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('phone_number')}</label>
                            <input
                                type="text"
                                placeholder="+251 9..."
                                className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 dark:focus:ring-primary/20 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('assigned_vehicle')}</label>
                            <input
                                type="text"
                                placeholder="e.g. AA-A45210"
                                className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-medium text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 dark:focus:ring-primary/20 transition-all"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('specialty')}</label>
                            <div className="flex flex-wrap gap-2">
                                {['Towing', 'Electrician', 'Mechanic'].map((s) => (
                                    <button key={s} className={cn(
                                        "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                        s === 'Towing' ? "bg-primary text-white shadow-lg shadow-blue-900/10" : "border border-gray-100 dark:border-white/10 text-gray-300 dark:text-gray-600 hover:border-gray-200 dark:hover:border-white/20"
                                    )}>
                                        {t(s.toLowerCase())}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => {
                        setIsDrawerOpen(false);
                        window.dispatchEvent(new CustomEvent('show-toast', {
                            detail: { message: "Hero profile saved successfully", type: 'success' }
                        }));
                    }}
                    className="mt-8 w-full py-4 bg-accent rounded-2xl text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-orange-900/10 hover:bg-orange-600 active:scale-95 transition-all"
                >
                    {t('save_hero_profile')}
                </button>
            </div>

            {/* Floating Action Button */}
            {!isDrawerOpen && (
                <div className="fixed bottom-10 right-10 z-[120] animate-in slide-in-from-right-4 duration-500">
                    <button
                        onClick={() => setIsDrawerOpen(true)}
                        className="flex items-center gap-4 bg-accent hover:bg-orange-600 text-white px-8 py-5 rounded-3xl shadow-2xl shadow-orange-900/30 transition-all active:scale-95 group font-black uppercase tracking-[0.2em] text-[10px]"
                    >
                        <UserPlus size={20} strokeWidth={3} className="group-hover:translate-x-1 group-hover:-rotate-12 transition-transform" />
                        <span>{t('hire_new_hero')}</span>
                    </button>
                </div>
            )}
        </div>
    );
}
