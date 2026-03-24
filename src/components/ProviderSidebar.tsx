"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { useTheme } from '@/hooks/useTheme';
import {
    LayoutDashboard,
    Activity,
    BookOpen,
    Zap,
    Users,
    Package,
    Settings,
    CreditCard,
    MessageSquare,
    Star,
    LogOut,
    Briefcase,
    Globe,
    Moon,
    Sun
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { providerService, ProfileData } from '@/services/api.service';
import { useState, useEffect } from 'react';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const menuItems = [
    { key: 'dashboard', icon: LayoutDashboard, href: '/provider/dashboard' },
    { key: 'queue', icon: Activity, href: '/provider/queue' },
    { key: 'revenue', icon: BookOpen, href: '/provider/revenue' },
    { key: 'tracker', icon: Zap, href: '/provider/tracker' },
    { key: 'technicians', icon: Users, href: '/provider/technicians' },
    { key: 'services', icon: Briefcase, href: '/provider/services' },
    { key: 'inventory', icon: Package, href: '/provider/inventory' },
    { key: 'subscription', icon: CreditCard, href: '/provider/subscription', badge: true },
    { key: 'messages', icon: MessageSquare, href: '/provider/messages' },
    { key: 'history', icon: BookOpen, href: '/provider/history' },
    { key: 'reviews', icon: Star, href: '/provider/reviews' },
    { key: 'settings', icon: Settings, href: '/provider/settings' },
    { key: 'help', icon: Globe, href: '/provider/help' },
];

import { useLanguage } from '@/hooks/useLanguage';

export const ProviderSidebar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { language, setLanguage, t } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const [profile, setProfile] = useState<ProfileData | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await providerService.getProfile();
                if (response.status === 'success' || response.success) {
                    setProfile(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            }
        };

        fetchProfile();
    }, []);

    const userInitial = profile?.business_name ? profile.business_name.charAt(0).toUpperCase() : 'A';
    const businessName = profile?.business_name || 'RoadHero Partner';
    const isVerified = profile?.account_status === 'APPROVED';

    return (
        <aside className="w-[300px] bg-white dark:bg-black border-r border-gray-100 dark:border-white/5 min-h-screen flex flex-col text-gray-600 dark:text-white/70 h-screen sticky top-0 transition-colors duration-500">
            {/* Logo Section */}
            <div className="p-8 pt-10">
                <Logo className="h-7 text-gray-900 dark:text-white transition-colors duration-500" />
            </div>

            {/* Navigation - Scrollable Area */}
            <nav className="flex-1 overflow-y-auto px-4 py-6 scrollbar-none space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 relative group",
                                isActive
                                    ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white shadow-lg shadow-black/5 dark:shadow-black/10 backdrop-blur-md"
                                    : "text-gray-500 dark:text-white/50 hover:bg-accent/10 hover:text-accent"
                            )}
                        >
                            <item.icon size={20} className={cn(
                                "transition-all duration-300 group-hover:scale-110",
                                isActive ? "text-accent scale-110" : "text-gray-400 dark:text-white/40 group-hover:text-accent"
                            )} />

                            <span className={cn(
                                "flex-1 text-[13px] tracking-wide transition-all duration-300",
                                isActive ? "font-black" : "font-medium group-hover:translate-x-1"
                            )}>{t(item.key)}</span>

                            {item.badge && (
                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)] animate-pulse"></div>
                            )}

                            {isActive && (
                                <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-1 h-6 bg-orange-500 rounded-r-full shadow-lg shadow-orange-500/50"></div>
                            )}
                        </Link>
                    );
                })}

                {/* Language Switcher */}
                <div className="mx-2 mt-8 p-1.5 bg-gray-100/50 dark:bg-black/10 backdrop-blur-xl rounded-[20px] flex gap-1 border border-gray-200/50 dark:border-white/5 shadow-inner">
                    <button
                        onClick={() => setLanguage('en')}
                        className={cn(
                            "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-[14px] transition-all duration-500",
                            language === 'en' ? "bg-white dark:bg-white text-gray-900 shadow-sm dark:shadow-xl scale-100" : "text-gray-500 dark:text-white/30 hover:text-gray-900 dark:hover:text-white scale-95"
                        )}
                    >
                        English
                    </button>
                    <button
                        onClick={() => setLanguage('am')}
                        className={cn(
                            "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-[14px] transition-all duration-500",
                            language === 'am' ? "bg-white dark:bg-white text-gray-900 shadow-sm dark:shadow-xl scale-100" : "text-gray-500 dark:text-white/30 hover:text-gray-900 dark:hover:text-white scale-95"
                        )}
                    >
                        አማርኛ
                    </button>
                </div>

                {/* Theme Toggle */}
                <div className="mx-2 mt-2 p-1.5 bg-gray-100/50 dark:bg-black/10 backdrop-blur-xl rounded-[20px] flex gap-1 border border-gray-200/50 dark:border-white/5 shadow-inner">
                    <button
                        onClick={toggleTheme}
                        className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-[14px] transition-all duration-500 bg-white dark:bg-white/5 text-gray-600 dark:text-white/50 hover:bg-gray-50 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white flex items-center justify-center gap-3 active:scale-95 shadow-sm dark:shadow-none"
                    >
                        {theme === 'light' ? (
                            <>
                                <Moon size={14} className="text-gray-400" />
                                <span>Dark Mode</span>
                            </>
                        ) : (
                            <>
                                <Sun size={14} className="text-orange-400" />
                                <span className="text-white">Light Mode</span>
                            </>
                        )}
                    </button>
                </div>
            </nav>

            {/* Footer Profile Section */}
            <div className="p-8 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-black transition-colors duration-500">
                <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center font-bold text-gray-900 dark:text-white text-lg shrink-0 border border-gray-200 dark:border-white/10">
                        {userInitial}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{businessName}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className={cn(
                                "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]",
                                isVerified ? "bg-green-500" : "bg-orange-500"
                            )}></div>
                            <span className="text-[9px] font-medium text-gray-500 dark:text-white/30 uppercase tracking-widest">
                                {isVerified ? t('verified_shop') : t('pending_verification')}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            window.dispatchEvent(new CustomEvent('show-toast', {
                                detail: { message: "Logging out of RoadHero...", type: 'info' }
                            }));
                            setTimeout(() => {
                                router.push('/');
                            }, 1000);
                        }}
                        className="text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors p-2"
                    >
                        <LogOut size={22} />
                    </button>
                </div>
            </div>
        </aside>
    );
};
