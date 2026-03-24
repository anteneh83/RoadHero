"use client";

import React from 'react';
import Link from 'next/link';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { ShieldCheck, Clock, ArrowRight, Mail } from 'lucide-react';

export default function PendingVerificationPage() {
    return (
        <main className="min-h-screen bg-white dark:bg-black flex flex-col transition-colors duration-500 overflow-x-hidden">
            <PublicHeader />

            <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
                <div className="absolute top-1/4 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -z-10" />
                <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-accent/5 rounded-full blur-[100px] -z-10" />

                <div className="w-full max-w-lg text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-[32px] bg-orange-50 dark:bg-orange-500/10 text-orange-500 mb-4 relative">
                        <Clock size={48} className="animate-pulse" />
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white dark:bg-[#0A0A0A] flex items-center justify-center border border-orange-100 dark:border-orange-500/20 shadow-sm">
                            <ShieldCheck size={16} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight uppercase transition-colors">Verification Pending</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium max-w-sm mx-auto transition-colors">
                            Your account is currently under review by our team. This usually takes 24-48 hours.
                        </p>
                    </div>

                    <div className="grid gap-4 pt-4">
                        <div className="p-6 bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[24px] text-left space-y-4 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center shadow-sm">
                                    <Mail size={18} className="text-primary dark:text-accent" />
                                </div>
                                <div>
                                    <h4 className="text-[12px] font-black text-gray-900 dark:text-white uppercase tracking-wider">Check your email</h4>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 font-medium italic">We'll notify you once your documents are approved.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-3 bg-primary dark:bg-accent text-white px-8 py-4 rounded-[20px] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-900/10 dark:shadow-none hover:scale-[1.05] active:scale-95 transition-all"
                        >
                            Return Home
                            <ArrowRight size={16} />
                        </Link>
                    </div>

                    <p className="text-[10px] font-bold text-gray-300 dark:text-gray-800 uppercase tracking-[0.4em] pt-8 transition-colors">
                        RoadHero Ethiopia — Partner Portal
                    </p>
                </div>
            </div>

            <PublicFooter />
        </main>
    );
}
