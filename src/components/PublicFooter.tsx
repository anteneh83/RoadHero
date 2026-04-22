"use client";

import React from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { useLanguage } from '@/hooks/useLanguage';

export const PublicFooter = () => {
    const { t } = useLanguage();

    return (
        <footer className="w-full py-24 px-8 border-t-2 border-primary/20 dark:border-primary/40 bg-[linear-gradient(135deg,_#f0f7ff_0%,_#ffffff_40%,_#e0f2fe_100%)] dark:bg-[linear-gradient(135deg,_#0f172a_0%,_#000000_60%,_#1e3a8a_100%)] backdrop-blur-2xl transition-all duration-700 mt-auto relative overflow-hidden">
            {/* Artistic Elements */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px]" />

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-left relative z-10">
                {/* Brand Section */}
                <div className="md:col-span-2 space-y-6">
                    <Logo className="h-6 grayscale opacity-60 dark:opacity-40 text-gray-900 dark:text-white" />
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed transition-colors">
                        {t('footer_mission')}
                    </p>
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest transition-colors">
                        {t('footer_rights')}
                    </p>
                </div>

                {/* Quick Links */}
                <div className="space-y-6">
                    <h4 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] transition-colors">{t('footer_links')}</h4>
                    <nav className="flex flex-col gap-4">
                        <Link href="/privacy" className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-accent transition-colors">
                            {t('privacy_policy')}
                        </Link>
                        <Link href="/terms" className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-accent transition-colors">
                            {t('terms_of_service')}
                        </Link>
                    </nav>
                </div>

                {/* Support Section */}
                <div className="space-y-6">
                    <h4 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] transition-colors">{t('footer_support')}</h4>
                    <nav className="flex flex-col gap-4">
                        <Link href="/support" className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-accent transition-colors">
                            {t('support_center')}
                        </Link>
                        <Link href="/provider/help" className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-accent transition-colors">
                            {t('help')}
                        </Link>
                    </nav>
                </div>
            </div>
        </footer>
    );
};
