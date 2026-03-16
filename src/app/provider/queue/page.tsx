"use client";

import React, { useState } from 'react';
import {
    MapPin,
    Clock,
    ChevronRight,
    Bell,
    Search,
    CheckCircle2,
    XCircle,
    Navigation,
    Car,
    Star,
    MoreHorizontal
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), { ssr: false });

const garageLocation: [number, number] = [9.0048, 38.7669];
const customerLocations: Record<number, [number, number]> = {
    1: [9.0120, 38.7830],
    2: [8.9950, 38.7520],
    3: [9.0200, 38.7750],
};

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

import { useLanguage } from '@/hooks/useLanguage';
import dynamic from 'next/dynamic';

const mockRequests = [
    { id: 1, type: 'FLAT TIRE', distance: '0.8 KM', car: 'Toyota Hilux (Silver)', time: '02:40', urgency: 'high', status: 'pending' },
    { id: 2, type: 'TOWING', distance: '3.2 KM', car: 'Hyundai Atos (White)', time: '00:30', urgency: 'low', status: 'pending' },
    { id: 3, type: 'FUEL DELIVERY', distance: '1.5 KM', car: 'Suzuki Swift (Blue)', time: '00:15', urgency: 'low', status: 'pending' },
];

export default function RefinedRequestQueuePage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [selectedId, setSelectedId] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');

    const filteredRequests = mockRequests.filter(req => {
        const matchesSearch = req.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.car.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'all' ||
            (activeFilter === 'urgent' && req.urgency === 'high') ||
            (activeFilter === 'nearby' && parseFloat(req.distance) < 2);
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-xl font-black text-[#171717] dark:text-white transition-colors">{t('queue')}</h1>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">{t('queue_subtitle')}</p>
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

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-primary transition-colors" size={16} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('search_queue_placeholder')}
                        className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl py-3.5 pl-14 pr-6 text-xs font-medium outline-none focus:ring-4 focus:ring-primary/5 dark:focus:ring-primary/20 transition-all shadow-sm text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600"
                    />
                </div>
                <div className="flex bg-white dark:bg-white/5 p-1 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden transition-colors">
                    {['all', 'urgent', 'nearby'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={cn(
                                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                activeFilter === f ? "bg-primary text-white shadow-lg" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                            )}
                        >
                            {t(f)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column: Request List */}
                <div className="w-full lg:w-[400px] space-y-6">
                    <h2 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none transition-colors">{t('active_requests')} ({filteredRequests.length})</h2>

                    <div className="space-y-4">
                        {filteredRequests.map((req) => (
                            <div
                                key={req.id}
                                onClick={() => setSelectedId(req.id)}
                                className={cn(
                                    "p-6 rounded-[32px] border-2 transition-all duration-500 cursor-pointer relative overflow-hidden group hover:-translate-y-1",
                                    selectedId === req.id
                                        ? "bg-white dark:bg-white/10 border-primary shadow-2xl shadow-primary/10 ring-8 ring-primary/5 dark:ring-primary/20"
                                        : "bg-white/50 dark:bg-white/5 border-transparent hover:border-gray-100 dark:hover:border-white/10 hover:shadow-lg hover:shadow-black/5"
                                )}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "p-2 rounded-xl transition-colors",
                                            selectedId === req.id ? "bg-primary text-white" : "bg-gray-50 dark:bg-white/5 text-primary group-hover:bg-primary/5 dark:group-hover:bg-primary/20"
                                        )}>
                                            <Navigation size={14} />
                                        </div>
                                        <h3 className={cn(
                                            "text-[13px] font-black uppercase tracking-widest transition-colors",
                                            req.urgency === 'high' ? "text-orange-600 dark:text-orange-400" : "text-gray-900 dark:text-white group-hover:text-primary transition-colors"
                                        )}>
                                            {req.type}
                                        </h3>
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-600 tabular-nums bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-lg border border-gray-100 dark:border-white/5">{req.time}</span>
                                </div>

                                <div className="space-y-2 pl-9">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={12} className="text-gray-400 dark:text-gray-600" />
                                        <p className="text-sm font-black text-gray-900 dark:text-white leading-none">{req.distance}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Car size={12} className="text-gray-400 dark:text-gray-600" />
                                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest transition-colors">{req.car}</p>
                                    </div>
                                </div>

                                {selectedId === req.id && (
                                    <div className="absolute top-0 right-0 p-3 animate-in fade-in zoom-in-50 duration-500">
                                        <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Map & Detail */}
                <div className="flex-1 bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-[48px] border border-white/40 dark:border-white/5 shadow-2xl shadow-black/5 p-4 flex flex-col min-h-[600px] hover:shadow-primary/5 transition-all duration-700">
                    <div className="flex-1 relative bg-gray-50 dark:bg-black/20 rounded-[40px] overflow-hidden mb-8 border border-gray-100 dark:border-white/5 shadow-inner group">
                        <InteractiveMap
                            center={customerLocations[selectedId] || garageLocation}
                            zoom={14}
                            markers={[
                                { position: garageLocation, type: 'garage', label: 'Abyssinia Motors' },
                                { position: customerLocations[selectedId], type: 'customer', label: 'Customer Location' }
                            ]}
                            polyline={[garageLocation, customerLocations[selectedId]]}
                        />
                        <div className="absolute top-6 left-6 z-10">
                            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white dark:border-white/10 shadow-xl flex items-center gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-[9px] font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">{t('gps_tracking')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Customer Detail */}
                    <div className="px-8 pb-8 space-y-8">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 flex items-center justify-center font-black text-gray-300 dark:text-gray-700 text-xl shadow-inner group-hover:scale-105 transition-transform duration-500">
                                    YK
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1.5">
                                        <h4 className="text-xl font-black text-gray-900 dark:text-white leading-none transition-colors">Yohannes Kassa</h4>
                                        <div className="bg-orange-50 dark:bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-100 dark:border-orange-500/20 flex items-center gap-1 transition-colors">
                                            <Star size={10} className="text-accent fill-accent" />
                                            <span className="text-[9px] font-black text-orange-600 dark:text-orange-400">4.9</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] flex items-center gap-2">
                                        <MapPin size={10} />
                                        Bole, Near Meskel Square
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button className="p-4 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 text-primary dark:text-white hover:bg-primary hover:text-white dark:hover:bg-accent hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 group">
                                    <Bell size={18} className="group-hover:rotate-12" />
                                </button>
                                <button className="p-4 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 text-primary dark:text-white hover:bg-primary hover:text-white dark:hover:bg-accent hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 group">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-[32px] border border-primary/10 dark:border-primary/20 relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                                <Navigation size={64} className="text-primary dark:text-accent rotate-45" />
                            </div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 italic leading-relaxed relative z-10 transition-colors">
                                “My front-right tire blew out while driving. I have a spare tire in the trunk but need help with the heavy lifting and tools. Please assist as soon as possible.”
                            </p>
                        </div>

                        <div className="flex gap-5">
                            <button
                                onClick={() => setSelectedId(0)}
                                className="flex-1 h-16 rounded-2xl border-2 border-gray-100 dark:border-white/5 text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em] hover:bg-gray-50 dark:hover:bg-white/5 hover:text-red-500 hover:border-red-100 transition-all duration-300"
                            >
                                {t('decline')}
                            </button>
                            <button
                                onClick={() => router.push('/provider/tracker')}
                                className="flex-[2.5] h-16 rounded-2xl bg-accent text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-orange-950/20 hover:bg-orange-600 hover:shadow-orange-950/30 hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3"
                            >
                                {t('accept_request')}
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
