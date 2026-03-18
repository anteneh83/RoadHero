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

    return (
        <aside className="w-[300px] bg-gray-950 dark:bg-black dark:border-r dark:border-white/5 min-h-screen flex flex-col text-white/70 h-screen sticky top-0 transition-colors duration-500">
            {/* Logo Section */}
            <div className="p-8 pt-10">
                <Logo className="h-7 text-white" />
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
                                    ? "bg-white/10 text-white shadow-lg shadow-black/10 backdrop-blur-md"
                                    : "text-white/50 hover:bg-accent/10 hover:text-accent"
                            )}
                        >
                            <item.icon size={20} className={cn(
                                "transition-all duration-300 group-hover:scale-110",
                                isActive ? "text-accent scale-110" : "text-white/40 group-hover:text-accent"
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
                <div className="mx-2 mt-8 p-1.5 bg-black/10 backdrop-blur-xl rounded-[20px] flex gap-1 border border-white/5 shadow-inner">
                    <button
                        onClick={() => setLanguage('en')}
                        className={cn(
                            "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-[14px] transition-all duration-500",
                            language === 'en' ? "bg-white text-gray-950 shadow-xl scale-100" : "text-white/30 hover:text-white scale-95"
                        )}
                    >
                        English
                    </button>
                    <button
                        onClick={() => setLanguage('am')}
                        className={cn(
                            "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-[14px] transition-all duration-500",
                            language === 'am' ? "bg-white text-gray-950 shadow-xl scale-100" : "text-white/30 hover:text-white scale-95"
                        )}
                    >
                        አማርኛ
                    </button>
                </div>

                {/* Theme Toggle */}
                <div className="mx-2 mt-2 p-1.5 bg-black/10 backdrop-blur-xl rounded-[20px] flex gap-1 border border-white/5 shadow-inner">
                    <button
                        onClick={toggleTheme}
                        className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-[14px] transition-all duration-500 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white flex items-center justify-center gap-3 active:scale-95"
                    >
                        {theme === 'light' ? (
                            <>
                                <Moon size={14} className="text-white/40" />
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
            <div className="p-8 border-t border-white/10 bg-gray-950 dark:bg-black transition-colors duration-500">
                <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-white/20 dark:bg-white/5 rounded-full flex items-center justify-center font-bold text-white text-lg shrink-0 border border-white/10">
                        A
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">Abyssinia Motors</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                            <span className="text-[9px] font-medium text-white/40 dark:text-white/30 uppercase tracking-widest">{t('verified_shop')}</span>
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
                        className="text-white/40 hover:text-white transition-colors p-2"
                    >
                        <LogOut size={22} />
                    </button>
                </div>
            </div>
        </aside>
    );
};
