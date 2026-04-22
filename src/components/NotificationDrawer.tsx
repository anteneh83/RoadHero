"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { X, Bell, Info, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { notificationService, Notification } from '@/services/api.service';
import { useRouter } from 'next/navigation';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function NotificationDrawer() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await notificationService.list();

            // Robust data extraction
            const rawData = response.data || response;
            const notificationArray = Array.isArray(rawData)
                ? rawData
                : (rawData.results || (Array.isArray(rawData.data) ? rawData.data : []));

            setNotifications(notificationArray);
        } catch (error) {
            console.error('Failed to fetch notifications in drawer:', error);
        }
    }, []);

    useEffect(() => {
        const handleOpen = () => {
            setIsOpen(true);
            fetchNotifications();
        };
        window.addEventListener('open-notifications', handleOpen);

        // Initial fetch if open (unlikely but safe)
        if (isOpen) fetchNotifications();

        // Polling for real-time updates every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);

        return () => {
            window.removeEventListener('open-notifications', handleOpen);
            clearInterval(interval);
        };
    }, [isOpen, fetchNotifications]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'SUCCESS': return <CheckCircle size={20} />;
            case 'WARNING': return <AlertTriangle size={20} />;
            case 'ALERT': return <AlertTriangle size={20} />;
            default: return <Info size={20} />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'SUCCESS': return "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 transition-colors";
            case 'WARNING': return "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 transition-colors";
            case 'ALERT': return "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors";
            default: return "bg-primary/10 dark:bg-primary/20 text-primary dark:text-accent transition-colors";
        }
    };

    const getRelativeTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.round(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.round(diffMins / 60)}h ago`;
        return date.toLocaleDateString();
    };

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
                    {notifications.length > 0 ? (
                        notifications.map((n) => (
                            <div
                                key={n.id}
                                onClick={() => {
                                    setIsOpen(false);
                                    router.push('/provider/notifications');
                                }}
                                className={cn(
                                    "p-6 rounded-[32px] border-2 transition-all duration-500 cursor-pointer group hover:-translate-y-1 relative overflow-hidden",
                                    !n.is_read
                                        ? "bg-white dark:bg-white/5 border-primary/20 dark:border-primary/40 shadow-2xl shadow-primary/5 ring-4 ring-primary/5 dark:ring-primary/20"
                                        : "bg-white/50 dark:bg-white/[0.02] border-transparent hover:border-gray-100 dark:hover:border-white/10 hover:shadow-xl hover:shadow-black/5"
                                )}
                            >
                                {!n.is_read && (
                                    <div className="absolute top-4 right-4 w-2 h-2 bg-primary dark:bg-accent rounded-full animate-pulse shadow-[0_0_8px_rgba(30,58,138,0.5)] transition-colors"></div>
                                )}
                                <div className="flex gap-5">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-500 text-white",
                                        getTypeColor(n.type)
                                    )}>
                                        {getIcon(n.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2 mb-1">
                                            <h4 className="text-[13px] font-black text-gray-900 dark:text-white truncate group-hover:text-primary dark:group-hover:text-accent transition-colors">{n.title}</h4>
                                            <span className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest shrink-0 transition-colors">
                                                {getRelativeTime(n.created_at)}
                                            </span>
                                        </div>
                                        <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                                            {n.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center opacity-30 grayscale transform scale-90">
                            <Bell size={40} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No activities</p>
                        </div>
                    )}
                </div>

                <div className="p-8 border-t border-gray-100/50 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.02] backdrop-blur-md transition-colors">
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            router.push('/provider/notifications');
                        }}
                        className="w-full py-5 bg-[#1E3A8A] dark:bg-primary text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-900/30 dark:shadow-none hover:bg-blue-950 dark:hover:bg-primary/80 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        View All Activity
                    </button>
                </div>
            </div>
        </div>
    );
}
