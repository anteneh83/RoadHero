"use client";

import React, { useState, useEffect } from 'react';
import { Bell, Clock, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { providerService, ProfileData } from '@/services/api.service';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface DashboardHeaderProps {
    title: string;
    subtitle?: string;
    showStatusToggle?: boolean;
    children?: React.ReactNode;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, subtitle, showStatusToggle = true, children }) => {
    const { t } = useLanguage();
    const [isOnline, setIsOnline] = useState(true);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                const response = await providerService.getAvailability();
                if (response.status === 'success' || response.success === true) {
                    // API returns { data: { is_online: boolean } }
                    setIsOnline(response.data?.is_online || false);
                }
            } catch (error) {
                console.error("Failed to fetch availability in header:", error);
            }
        };

        if (showStatusToggle) {
            fetchAvailability();
        }
    }, [showStatusToggle]);

    const handleToggleOnline = async () => {
        setIsUpdatingStatus(true);
        try {
            const nextStatus = !isOnline;
            const response = await providerService.updateAvailability({ is_online: nextStatus });
            if (response.status === 'success' || response.success === true) {
                setIsOnline(nextStatus);
                window.dispatchEvent(new CustomEvent('show-toast', {
                    detail: { message: response.message || `You are now ${nextStatus ? 'online' : 'offline'}.`, type: 'success' }
                }));
            } else {
                throw new Error(response.message || "Failed to update availability");
            }
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || "Failed to update status";
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message, type: 'error' }
            }));
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-gradient-to-b from-white/95 via-white/80 to-white/70 dark:from-[#0A0A0A]/95 dark:via-[#0A0A0A]/80 dark:to-[#0A0A0A]/70 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 transition-all duration-500">
            <div className="px-8 lg:px-12 py-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-xl font-black text-[#171717] dark:text-white transition-colors">{title}</h1>
                    {subtitle && (
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-6">
                    {children}

                    {showStatusToggle && (
                        <div className="flex items-center gap-3 bg-white/50 dark:bg-white/5 px-4 py-2 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm transition-colors backdrop-blur-md">
                            <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('online_for_requests')}</span>
                            <button
                                onClick={handleToggleOnline}
                                disabled={isUpdatingStatus}
                                className={cn(
                                    "w-10 h-5 rounded-full relative transition-colors duration-300",
                                    isOnline ? "bg-green-500" : "bg-gray-200 dark:bg-white/10",
                                    isUpdatingStatus && "opacity-50"
                                )}
                            >
                                <div className={cn(
                                    "absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300",
                                    isOnline ? "translate-x-6" : "translate-x-1"
                                )}></div>
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('open-notifications'))}
                            className="p-2.5 bg-white/50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all relative group"
                        >
                            <Bell size={18} className="group-hover:rotate-12 transition-transform" />
                            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 border-2 border-white dark:border-[#0A0A0A] rounded-full"></div>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};
