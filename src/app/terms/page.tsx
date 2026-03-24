"use client";

import React from 'react';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { Scale, Gavel, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function TermsOfServicePage() {
    return (
        <main className="min-h-screen bg-white dark:bg-black flex flex-col transition-colors duration-500">
            <PublicHeader />

            <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-20 md:py-32">
                <div className="space-y-4 mb-20 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/5 dark:bg-accent/10 rounded-full border border-accent/10">
                        <Scale size={12} className="text-accent" />
                        <span className="text-[10px] font-black text-accent uppercase tracking-widest">Partnership Agreement</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Terms of Service</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium max-w-2xl leading-relaxed">
                        By using the RoadHero Partner Portal, you agree to comply with the following terms and conditions. Please read them carefully.
                    </p>
                </div>

                <div className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {[
                            { title: 'Quality', icon: CheckCircle2, desc: 'Maintain high service standards for all rescues.' },
                            { title: 'Identity', icon: Gavel, desc: 'Provide accurate and verified business credentials.' },
                            { title: 'Compliance', icon: Info, desc: 'Adhere to local laws and RoadHero safety guidelines.' },
                        ].map((item, i) => (
                            <div key={i} className="p-6 bg-gray-50 dark:bg-white/[0.02] rounded-[24px] border border-gray-100 dark:border-white/5 hover:border-accent/30 transition-all group">
                                <item.icon size={20} className="text-accent mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-widest mb-2">{item.title}</h3>
                                <p className="text-xs text-gray-400 font-bold leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-16">
                        <section className="space-y-6">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">1. Provider Eligibility</h2>
                            <div className="prose dark:prose-invert max-w-none text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                                <p>To become a RoadHero Service Provider, you must possess a valid business license for automotive services in Ethiopia. You are responsible for ensuring all staff performing rescues are properly trained and insured.</p>
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">2. Service Standards</h2>
                            <div className="prose dark:prose-invert max-w-none text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                                <p>Providers agree to respond to accepted rescue requests promptly. Professional conduct is required at all times when interacting with RoadHero customers. Failure to maintain a high rating may lead to account suspension.</p>
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">3. Payments & Fees</h2>
                            <div className="prose dark:prose-invert max-w-none text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                                <p>RoadHero facilitates payments between customers and providers. A platform service fee is deducted from each successful transaction. Details of current fee structures are available in the provider dashboard.</p>
                            </div>
                        </section>

                        <section className="p-8 bg-black dark:bg-white/[0.02] rounded-[32px] text-white">
                            <div className="flex gap-4 items-start">
                                <AlertCircle className="text-accent shrink-0 mt-1" />
                                <div className="space-y-2">
                                    <h3 className="text-lg font-black tracking-tight">Important Notice</h3>
                                    <p className="text-sm text-gray-400 font-medium leading-relaxed">
                                        RoadHero is a platform connecting customers with independent service providers. We do not employ providers and are not responsible for the quality of individual mechanical repairs.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            <PublicFooter />
        </main>
    );
}
