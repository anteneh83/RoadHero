"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    Bell,
    CheckCircle2,
    AlertCircle,
    Info,
    MoreHorizontal,
    Trash2,
    Loader2,
    Search,
    ChevronLeft,
    Check
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { DashboardHeader } from '@/components/DashboardHeader';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { notificationService, Notification } from '@/services/api.service';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function NotificationsPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const response = await notificationService.list();

            // Robust data extraction
            const rawData = response.data || response;
            const notificationArray = Array.isArray(rawData)
                ? rawData
                : (rawData.results || (Array.isArray(rawData.data) ? rawData.data : []));

            setNotifications(notificationArray);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();

        // Poll for real-time updates every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const handleMarkAsRead = async (id: number) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleViewDetails = (notification: Notification) => {
        // Mark as read when viewing details
        if (!notification.is_read) {
            handleMarkAsRead(notification.id);
        }

        const message = notification.message?.toLowerCase() || '';
        const title = notification.title?.toLowerCase() || '';

        if (message.includes('review') || title.includes('review')) {
            router.push('/provider/reviews');
        } else if (message.includes('job') || title.includes('job') || message.includes('request')) {
            router.push('/provider/queue');
        } else if (message.includes('inventory') || title.includes('inventory') || message.includes('stock')) {
            router.push('/provider/inventory');
        } else if (message.includes('message') || title.includes('message')) {
            router.push('/provider/messages');
        } else {
            // Default or fallback details
            console.log('Viewing notification details:', notification);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'SUCCESS': return <CheckCircle2 className="text-green-500" size={18} />;
            case 'WARNING': return <AlertCircle className="text-orange-500" size={18} />;
            case 'ALERT': return <AlertCircle className="text-red-500" size={18} />;
            default: return <Info className="text-blue-500" size={18} />;
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

    const filteredNotifications = Array.isArray(notifications) ? notifications.filter(n =>
        n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message?.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];

    return (
        <div className="flex flex-col min-h-screen pb-20">
            <DashboardHeader
                title={t('notifications')}
                subtitle="Alerts & System Updates"
            />

            <div className="max-w-4xl mx-auto w-full p-8 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="relative group w-full md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 group-focus-within:text-primary transition-colors" size={14} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter alerts..."
                            className="w-full pl-11 pr-5 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm outline-none focus:ring-4 focus:ring-primary/5 dark:focus:ring-primary/20 transition-all text-[11px] font-medium text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-700"
                        />
                    </div>

                    <button
                        onClick={handleMarkAllAsRead}
                        className="w-full md:w-auto px-6 py-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                    >
                        <Check size={14} />
                        Mark All as Read
                    </button>
                </div>

                <div className="bg-white dark:bg-white/5 rounded-[40px] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden transition-colors">
                    <div className="p-8 border-b border-gray-50 dark:border-white/5 flex justify-between items-center transition-colors">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Recent Activity</h3>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-primary dark:text-accent uppercase tracking-widest bg-primary/5 dark:bg-primary/10 px-3 py-1.5 rounded-lg">
                                {notifications.filter(n => !n.is_read).length} Unread
                            </span>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-50 dark:divide-white/5 transition-colors">
                        {loading ? (
                            <div className="p-20 flex flex-col items-center justify-center gap-4">
                                <Loader2 className="text-primary animate-spin" size={32} />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Syncing Feed...</p>
                            </div>
                        ) : filteredNotifications.length > 0 ? (
                            filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "p-8 flex gap-6 group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-all relative overflow-hidden",
                                        !notification.is_read && "bg-primary/[0.02] dark:bg-primary/[0.05]"
                                    )}
                                >
                                    {/* Unread Indicator */}
                                    {!notification.is_read && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                                    )}

                                    <div className="shrink-0 pt-1">
                                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-center transition-colors">
                                            {getIcon(notification.type)}
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-sm font-black text-gray-900 dark:text-white transition-colors">{notification.title}</h4>
                                            <span className="text-[9px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest transition-colors">
                                                {getRelativeTime(notification.created_at)}
                                            </span>
                                        </div>
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed transition-colors">
                                            {notification.message}
                                        </p>

                                        <div className="flex items-center gap-4 pt-2">
                                            {!notification.is_read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    className="text-[9px] font-black text-primary dark:text-accent uppercase tracking-widest hover:underline transition-all"
                                                >
                                                    Mark as Read
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleViewDetails(notification)}
                                                className="text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest hover:text-gray-900 dark:hover:text-white transition-all"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>

                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 text-gray-300 dark:text-gray-700 hover:text-red-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-20 flex flex-col items-center justify-center text-center opacity-30 grayscale transform scale-90">
                                <div className="w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-[40px] flex items-center justify-center mb-6">
                                    <Bell size={40} className="text-gray-400" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-full animate-[spin_20s_linear_infinite]"></div>
                                </div>
                                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Inbox Zero</h3>
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mt-2 leading-relaxed">
                                    No notifications found in your feed at the moment
                                </p>
                            </div>
                        )}
                    </div>

                    {filteredNotifications.length > 0 && (
                        <div className="p-6 bg-gray-50/30 dark:bg-white/[0.01] border-t border-gray-50 dark:border-white/5 flex justify-center transition-colors">
                            <button
                                onClick={() => fetchNotifications()}
                                className="text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.3em] hover:text-primary transition-all"
                            >
                                Refresh Feed
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
