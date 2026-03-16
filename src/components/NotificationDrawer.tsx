"use client";

import React, { useState, useEffect } from 'react';
import { X, Bell, Info, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function NotificationDrawer() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-notifications', handleOpen);
        return () => window.removeEventListener('open-notifications', handleOpen);
    }, []);

    const notifications = [
        {
            id: 1,
            title: 'New Service Request',
            description: 'Yohannes Kassa needs towing at Bole Roundabout.',
            time: '2 mins ago',
            type: 'request',
            unread: true,
        },
        {
            id: 2,
            title: 'Payment Received',
            description: 'ETB 1,250.00 received for Job #RH-8921.',
            time: '1 hour ago',
            type: 'payment',
            unread: false,
        },
        {
            id: 3,
            title: 'Technician Offline',
            description: 'Elias Haile has checked out for the day.',
            time: '3 hours ago',
            type: 'system',
            unread: false,
        },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <div className="relative w-full max-w-sm bg-white/70 dark:bg-[#0A0A0A]/90 backdrop-blur-xl h-full shadow-2xl animate-in slide-in-from-right duration-700 border-l border-white/20 dark:border-white/5 flex flex-col transition-colors">
                <div className="p-10 border-b border-gray-100/50 dark:border-white/5 flex items-center justify-between transition-colors">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-4 transition-colors">
                            <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center text-primary dark:text-accent transition-colors">
                                <Bell size={20} />
                            </div>
                            Notifications
                        </h2>
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mt-2 transition-colors">Live system feed</p>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-3 hover:bg-gray-100/50 dark:hover:bg-white/5 rounded-2xl transition-all text-gray-300 dark:text-gray-600 hover:text-gray-900 dark:hover:text-white hover:rotate-90"
                    >
                        <X size={22} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    {notifications.map((n) => (
                        <div
                            key={n.id}
                            className={cn(
                                "p-6 rounded-[32px] border-2 transition-all duration-500 cursor-pointer group hover:-translate-y-1 relative overflow-hidden",
                                n.unread
                                    ? "bg-white dark:bg-white/5 border-primary/20 dark:border-primary/40 shadow-2xl shadow-primary/5 ring-4 ring-primary/5 dark:ring-primary/20"
                                    : "bg-white/50 dark:bg-white/[0.02] border-transparent hover:border-gray-100 dark:hover:border-white/10 hover:shadow-xl hover:shadow-black/5"
                            )}
                        >
                            {n.unread && (
                                <div className="absolute top-4 right-4 w-2 h-2 bg-primary dark:bg-accent rounded-full animate-pulse shadow-[0_0_8px_rgba(30,58,138,0.5)] transition-colors"></div>
                            )}
                            <div className="flex gap-5">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-500",
                                    n.type === 'request' ? "bg-accent/10 dark:bg-accent/20 text-accent transition-colors" :
                                        n.type === 'payment' ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 transition-colors" :
                                            "bg-primary/10 dark:bg-primary/20 text-primary dark:text-accent transition-colors"
                                )}>
                                    {n.type === 'request' ? <Clock size={20} /> :
                                        n.type === 'payment' ? <CheckCircle size={20} /> : <Info size={20} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2 mb-1">
                                        <h4 className="text-[13px] font-black text-gray-900 dark:text-white truncate group-hover:text-primary dark:group-hover:text-accent transition-colors">{n.title}</h4>
                                        <span className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest shrink-0 transition-colors">{n.time}</span>
                                    </div>
                                    <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                                        {n.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-8 border-t border-gray-100/50 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.02] backdrop-blur-md transition-colors">
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            window.dispatchEvent(new CustomEvent('show-toast', {
                                detail: { message: "All notifications marked as read", type: 'success' }
                            }));
                        }}
                        className="w-full py-5 bg-[#1E3A8A] dark:bg-primary text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-900/30 dark:shadow-none hover:bg-blue-950 dark:hover:bg-primary/80 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <CheckCircle size={14} />
                        Mark all as read
                    </button>
                </div>
            </div>
        </div>
    );
}
