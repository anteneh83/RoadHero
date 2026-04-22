"use client"
import React from 'react';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { Shield, Lock, Eye, FileText, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export default function PrivacyPolicyPage() {
    const { t } = useLanguage();

    const usages = [
        t('use_data_item1'),
        t('use_data_item2'),
        t('use_data_item3'),
        t('use_data_item4'),
        t('use_data_item5')
    ];

    return (
        <main className="min-h-screen bg-white dark:bg-black flex flex-col transition-colors duration-500">
            <PublicHeader />

            <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-20 md:py-32 pt-28 md:pt-40">
                <div className="space-y-4 mb-20 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 dark:bg-primary/10 rounded-full border border-primary/10">
                        <Lock size={12} className="text-primary dark:text-accent" />
                        <span className="text-[10px] font-black text-primary dark:text-accent uppercase tracking-widest">{t('legal_privacy')}</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">{t('privacy_policy')}</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium max-w-2xl leading-relaxed">
                        {t('privacy_policy_desc')}
                    </p>
                </div>

                <div className="space-y-16">
                    <section className="space-y-6">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-primary dark:text-accent border border-gray-100 dark:border-white/10 shadow-sm">
                                <Eye size={24} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t('info_collection')}</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="p-8 bg-gray-50 dark:bg-white/[0.02] rounded-[32px] border border-gray-100 dark:border-white/5 space-y-4">
                                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">{t('profile_data')}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                                    {t('profile_data_desc')}
                                </p>
                            </div>
                            <div className="p-8 bg-gray-50 dark:bg-white/[0.02] rounded-[32px] border border-gray-100 dark:border-white/5 space-y-4">
                                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">{t('location_data')}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                                    {t('location_data_desc')}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-10 py-16 border-y border-gray-100 dark:border-white/5">
                        <div className="max-w-2xl">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-6">{t('how_we_use_data')}</h2>
                            <ul className="space-y-6">
                                {usages.map((item, i) => (
                                    <li key={i} className="flex gap-4 group">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0 group-hover:scale-150 transition-transform" />
                                        <span className="text-gray-500 dark:text-gray-400 font-medium leading-tight">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    <section className="space-y-8">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t('data_security')}</h2>
                        <div className="prose dark:prose-invert max-w-none text-gray-500 dark:text-gray-400 font-medium leading-relaxed space-y-6">
                            <p>
                                {t('security_text')}
                            </p>
                            <p>
                                {t('data_sharing_text')}
                            </p>
                        </div>
                    </section>
                </div>
            </div>

            <PublicFooter />
        </main>
    );
}
