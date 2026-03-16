"use client";

import React, { useState } from 'react';
import {
    X,
    MapPin,
    Phone,
    Car,
    Clock,
    CheckCircle2,
    Navigation,
    ChevronRight,
    ShieldCheck,
    Zap,
    Activity
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), { ssr: false });

const driverPosition: [number, number] = [9.0120, 38.7830];
const techPosition: [number, number] = [9.0060, 38.7750];

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

import dynamic from 'next/dynamic';

const steps = [
    { id: 'accepted', name: 'Accepted', done: true },
    { id: 'en_route', name: 'En Route', done: true, active: true },
    { id: 'arrived', name: 'Arrived', done: false },
    { id: 'work_in_progress', name: 'Work in Progress', done: false },
];

export default function JobTrackerPage() {
    const { t } = useLanguage();
    const [currentStatusIndex, setCurrentStatusIndex] = useState(1);

    const steps = [
        { id: 'accepted', name: t('accepted'), done: currentStatusIndex >= 0, active: currentStatusIndex === 0 },
        { id: 'en_route', name: t('en_route'), done: currentStatusIndex >= 1, active: currentStatusIndex === 1 },
        { id: 'arrived', name: t('arrived'), done: currentStatusIndex >= 2, active: currentStatusIndex === 2 },
        { id: 'work_in_progress', name: t('working'), done: currentStatusIndex >= 3, active: currentStatusIndex === 3 },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 h-full flex flex-col pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-xl font-black text-[#171717] dark:text-white transition-colors">{t('tracker')}</h1>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">{t('tracker_subtitle')}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-orange-50 dark:bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-100 dark:border-orange-500/20 transition-colors">
                        <span className="text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">Trial: 12 Days</span>
                    </div>
                </div>
            </div>

            {/* Progress Bar Container */}
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-[32px] border border-white/40 dark:border-white/5 shadow-xl shadow-primary/5 p-6 relative transition-all duration-700">
                <div className="flex justify-between items-center max-w-4xl mx-auto relative px-10">
                    {/* Connecting Lines */}
                    <div className="absolute top-[18px] left-[60px] right-[60px] h-[3px] bg-gray-50 dark:bg-white/5 rounded-full transition-colors"></div>
                    <div
                        className="absolute top-[18px] left-[60px] h-[3px] bg-primary transition-all duration-1000 shadow-[0_0_10px_rgba(30,58,138,0.3)] rounded-full"
                        style={{ width: `${(currentStatusIndex / (steps.length - 1)) * 100}%` }}
                    ></div>

                    {steps.map((step, i) => (
                        <div key={step.id} className="flex flex-col items-center gap-3 relative z-10">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center border-4 border-white transition-all duration-700 shadow-sm",
                                step.active
                                    ? "bg-accent scale-125 shadow-2xl shadow-orange-500/30 z-20"
                                    : step.done
                                        ? "bg-primary dark:bg-accent"
                                        : "bg-gray-50 dark:bg-white/5 border-gray-50/50 dark:border-white/5"
                            )}>
                                {step.done && !step.active ? (
                                    <CheckCircle2 size={14} className="text-white" strokeWidth={3} />
                                ) : (
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        step.active ? "bg-white animate-pulse" : "bg-gray-300"
                                    )}></div>
                                )}
                            </div>
                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-widest transition-all duration-500",
                                step.active ? "text-accent translate-y-1" : step.done ? "text-primary dark:text-accent" : "text-gray-300 dark:text-gray-700"
                            )}>
                                {step.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 bg-white dark:bg-white/5 rounded-[40px] border border-gray-100 dark:border-white/5 shadow-2xl shadow-black/5 p-4 flex flex-col relative overflow-hidden min-h-[500px] transition-all duration-700">
                <div className="absolute inset-4 bg-gray-50 dark:bg-black/20 rounded-[32px] overflow-hidden border border-gray-100 dark:border-white/10 shadow-inner">
                    <InteractiveMap
                        center={techPosition}
                        zoom={15}
                        markers={[
                            { position: techPosition, type: 'technician', label: 'Biruk K. (Technician)' },
                            { position: driverPosition, type: 'customer', label: 'Yohannes K. (Driver)' }
                        ]}
                        polyline={[techPosition, driverPosition]}
                    />
                </div>

                {/* Bottom Speed Info */}
                <div className="mt-auto px-8 py-6 flex items-center justify-between bg-white/80 dark:bg-white/5 backdrop-blur-sm relative z-10 border-t border-gray-50 dark:border-white/5 transition-all duration-700">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping absolute inset-0"></div>
                            <div className="w-2 h-2 bg-green-500 rounded-full relative"></div>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('signal')}: <span className="text-green-600">Strong (4G)</span></p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">{t('technician_speed')}</p>
                            <p className="text-sm font-black text-gray-900 dark:text-white transition-colors">28 km/h</p>
                        </div>
                        <div className="w-px h-8 bg-gray-100 dark:bg-white/10 transition-colors"></div>
                        <div className="text-right">
                            <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">{t('eta')}</p>
                            <p className="text-sm font-black text-primary dark:text-accent transition-colors">04:12 mins</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Global Status Action - Sticky Bottom */}
            <div className="sticky bottom-8 self-end z-[120] w-full max-w-xs px-4 mt-auto">
                <button
                    onClick={() => setCurrentStatusIndex(prev => Math.min(steps.length - 1, prev + 1))}
                    className="w-full h-14 bg-accent rounded-2xl text-white text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-orange-900/40 hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center border-4 border-white dark:border-white/10"
                >
                    {t('update_status')}: {steps[currentStatusIndex + 1]?.name || t('mission_completed')}
                </button>
            </div>
        </div>
    );
}
