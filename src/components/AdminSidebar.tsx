"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/Logo';
import {
    BarChart3,
    ShieldCheck,
    Globe,
    Megaphone,
    Users,
    Settings,
    LogOut,
    AlertCircle,
    Activity
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const adminMenuItems = [
    { name: 'Overview', icon: BarChart3, href: '/admin/dashboard' },
    { name: 'Provider Verification', icon: ShieldCheck, href: '/admin/verification', badge: true },
    { name: 'Live Activities', icon: Activity, href: '/admin/activities' },
    { name: 'System Announcements', icon: Megaphone, href: '/admin/broadcasts' },
    { name: 'User Management', icon: Users, href: '/admin/users' },
    { name: 'Global Settings', icon: Globe, href: '/admin/settings' },
];

export const AdminSidebar = () => {
    const pathname = usePathname();

    return (
        <aside className="w-72 bg-gray-900 min-h-screen flex flex-col text-gray-400 overflow-y-auto border-r border-white/5">
            <div className="p-8">
                <Logo className="h-8 text-white" />
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {adminMenuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group hover:text-white",
                                isActive ? "bg-white/10 text-white font-bold" : "hover:bg-white/5"
                            )}
                        >
                            <item.icon size={20} className={cn(isActive ? "text-white" : "text-gray-600 group-hover:text-white")} />
                            <span className="flex-1 text-sm">{item.name}</span>
                            {item.badge && (
                                <div className="bg-accent text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-orange-900/20">
                                    4
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-white/5 mt-auto">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-bold text-white border border-white/10">
                        A
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">Admin Account</p>
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Super Admin</p>
                    </div>
                    <button className="text-gray-600 hover:text-white transition-colors">
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </aside>
    );
};
