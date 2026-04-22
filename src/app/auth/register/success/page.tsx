"use client";

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import {
    CheckCircle2,
    ArrowRight
} from 'lucide-react';

export default function VerificationSuccessPage() {
    return (
        <main className="min-h-screen bg-gray-50 dark:bg-black flex flex-col transition-colors duration-500">
            {/* Standard Registration Heapromisesder */}
            <header className="bg-white dark:bg-black border-b border-gray-100 dark:border-white/5 px-6 py-3 flex justify-between items-center shadow-sm relative z-50 transition-colors">
                <Logo />
                <Link
                    href="/auth/support"
                    className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-5 py-1.5 rounded-full text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-primary dark:hover:text-accent hover:border-primary dark:hover:border-accent transition-all shadow-sm"
                >
                    Support
                </Link>
            </header>

            {/* Main Card Area */}
            <div className="flex-1 flex flex-col justify-center items-center p-4">
                <div className="w-full max-w-[420px] bg-white dark:bg-[#0A0A0A] rounded-[32px] shadow-2xl shadow-blue-900/5 p-8 md:p-10 flex flex-col items-center text-center relative overflow-hidden border border-gray-100 dark:border-white/5 transition-colors">
                    {/* Top Illustration Area - Scaled Down */}
                    <div className="relative mb-5">
                        <div className="absolute inset-0 bg-blue-50/50 dark:bg-blue-500/5 rounded-full scale-[1.8] blur-3xl"></div>
                        <div className="w-20 h-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-50 to-white dark:from-white/5 dark:to-transparent rounded-full flex items-center justify-center relative z-10 transition-colors">
                            {/* Document with Magnifying Glass Illustration - Highly Scaled Down */}
                            <div className="relative scale-50">
                                {/* The Paper */}
                                <div className="w-12 h-16 border-2 border-primary dark:border-accent rounded-lg bg-white dark:bg-black relative">
                                    <div className="absolute top-4 left-3 right-3 h-0.5 bg-blue-100 dark:bg-white/10"></div>
                                    <div className="absolute top-8 left-3 right-3 h-0.5 bg-blue-100 dark:bg-white/10"></div>
                                    <div className="absolute top-12 left-3 right-8 h-0.5 bg-blue-100 dark:bg-white/10"></div>
                                </div>

                                {/* The Magnifying Glass */}
                                <div className="absolute -bottom-4 -right-4 w-10 h-10">
                                    <div className="w-8 h-8 rounded-full border-[3px] border-orange-500 bg-white dark:bg-black relative flex items-center justify-center shadow-lg transition-colors">
                                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white scale-75">
                                            <CheckCircle2 size={12} strokeWidth={4} />
                                        </div>
                                        {/* Handle */}
                                        <div className="absolute bottom-[-5px] right-[-5px] w-[2.5px] h-3.5 bg-orange-500 rounded-full rotate-[-45deg] origin-top"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h1 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight transition-colors">Documents Received!</h1>
                    <p className="text-gray-400 dark:text-gray-500 font-medium max-w-[220px] mx-auto mb-6 text-[10px] leading-relaxed transition-colors">
                        We’ve started the verification process for <span className="text-primary dark:text-accent font-bold">Abyssinia Motors.</span>
                    </p>

                    {/* Stepper Status - Compact */}
                    <div className="w-full max-w-[200px] mx-auto space-y-0 mb-6 text-left">
                        <div className="flex items-center gap-3 relative">
                            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white z-10 shrink-0">
                                <CheckCircle2 size={12} strokeWidth={3} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-900 dark:text-white leading-none transition-colors">Account Created</p>
                            </div>
                            <div className="absolute left-2.5 top-5 w-[1px] h-5 bg-green-500"></div>
                        </div>

                        <div className="flex items-center gap-3 relative py-5">
                            <div className="w-5 h-5 rounded-full border-[2px] border-primary dark:border-accent bg-primary dark:bg-accent flex items-center justify-center text-white z-10 shrink-0">
                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse transition-colors"></div>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-black text-gray-900 dark:text-white leading-none transition-colors">Admin Verification</p>
                                <p className="text-[7px] text-gray-400 dark:text-gray-600 font-bold uppercase tracking-widest transition-colors">Within 24 hours.</p>
                            </div>
                            <div className="absolute left-2.5 top-[40px] w-[1px] h-5 bg-gray-100 dark:bg-white/5"></div>
                        </div>

                        <div className="flex items-center gap-3 relative">
                            <div className="w-5 h-5 rounded-full border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 flex items-center justify-center text-gray-300 dark:text-gray-800 z-10 shrink-0 transition-colors">
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-200 dark:text-gray-800 leading-none transition-colors">Trial Activation</p>
                            </div>
                        </div>
                    </div>

                    {/* Promo Banner - Extremely Compact */}
                    <div className="w-full bg-primary/5 dark:bg-primary/10 rounded-[20px] p-5 mb-6 flex items-start gap-4 text-left relative overflow-hidden border border-primary/10 transition-colors">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent transition-colors"></div>
                        <div className="space-y-1 relative z-10">
                            <h3 className="text-xs font-black text-gray-900 dark:text-white transition-colors">Trial Ready</h3>
                            <p className="text-[9px] text-gray-500 dark:text-gray-400 leading-normal font-medium transition-colors">
                                Your free trial starts once approved.
                                Full portal access is included.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Subtext */}
                <p className="mt-8 text-center text-[8px] font-bold text-gray-300 dark:text-gray-800 uppercase tracking-[0.4em] leading-relaxed transition-colors">
                    ID: RH-ET-452109 • SMS to +251 911 223 344
                </p>
            </div>
        </main>
    );
}
