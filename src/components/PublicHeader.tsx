"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { Moon, Sun, Globe, ChevronDown, Check } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const PublicHeader = () => {
    const { t, language, setLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const [isLangOpen, setIsLangOpen] = useState(false);

    return (
        <header className="w-full bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 sticky top-0 z-[100] transition-colors duration-500">
            <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
                <Link href="/" className="hover:opacity-80 transition-opacity">
                    <Logo className="h-8 w-auto text-gray-900 dark:text-white" />
                </Link>

                <div className="flex items-center gap-4 md:gap-8">
                    {/* Language Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsLangOpen(!isLangOpen)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-primary/20 transition-all group"
                        >
                            <Globe size={14} className="text-gray-400 dark:text-gray-500 group-hover:text-primary transition-colors" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white">{language}</span>
                            <ChevronDown size={12} className={cn("text-gray-400 transition-transform duration-300", isLangOpen && "rotate-180")} />
                        </button>

                        {isLangOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsLangOpen(false)} />
                                <div className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl p-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                                    <button
                                        onClick={() => { setLanguage('en'); setIsLangOpen(false); }}
                                        className={cn(
                                            "w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                            language === 'en' ? "bg-primary/10 text-primary" : "text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                                        )}
                                    >
                                        English
                                        {language === 'en' && <Check size={12} />}
                                    </button>
                                    <button
                                        onClick={() => { setLanguage('am'); setIsLangOpen(false); }}
                                        className={cn(
                                            "w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                            language === 'am' ? "bg-primary/10 text-primary" : "text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                                        )}
                                    >
                                        አማርኛ
                                        {language === 'am' && <Check size={12} />}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-accent hover:border-primary/20 transition-all relative overflow-hidden group"
                    >
                        <div className="relative z-10">
                            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        </div>
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    <div className="h-6 w-[1px] bg-gray-100 dark:bg-white/10 hidden md:block" />

                    <div className="hidden md:flex gap-4 items-center">
                        <Link href="/auth/login" className="text-[10px] font-black text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-accent uppercase tracking-[0.2em] transition-all px-4 py-2">
                            {t('partner_login')}
                        </Link>
                        <Link href="/auth/register" className="bg-primary hover:bg-primary-dark dark:bg-accent dark:hover:bg-orange-600 px-6 py-2.5 rounded-full text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-100 dark:shadow-none hover:scale-[1.05] active:scale-95 transition-all">
                            {t('join_network')}
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
};
