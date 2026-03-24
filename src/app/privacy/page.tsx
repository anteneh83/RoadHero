"use client";

import React from 'react';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { Shield, Lock, Eye, FileText, ChevronRight } from 'lucide-react';

export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen bg-white dark:bg-black flex flex-col transition-colors duration-500">
            <PublicHeader />

            <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-20 md:py-32">
                <div className="space-y-4 mb-20 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 dark:bg-primary/10 rounded-full border border-primary/10">
                        <Lock size={12} className="text-primary dark:text-accent" />
                        <span className="text-[10px] font-black text-primary dark:text-accent uppercase tracking-widest">Legal & Privacy</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Privacy Policy</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium max-w-2xl leading-relaxed">
                        Last Updated: March 19, 2024. Your privacy is our priority. This policy outlines how we collect, use, and protect your personal information within the RoadHero Partner Portal.
                    </p>
                </div>

                <div className="space-y-16">
                    <section className="space-y-6">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-primary dark:text-accent border border-gray-100 dark:border-white/10 shadow-sm">
                                <Eye size={24} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Information Collection</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="p-8 bg-gray-50 dark:bg-white/[0.02] rounded-[32px] border border-gray-100 dark:border-white/5 space-y-4">
                                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Profile Data</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                                    We collect your name, phone number, and business details to create and verify your service provider account.
                                </p>
                            </div>
                            <div className="p-8 bg-gray-50 dark:bg-white/[0.02] rounded-[32px] border border-gray-100 dark:border-white/5 space-y-4">
                                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Location Data</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                                    Precise GPS coordinates of your business are collected to connect you with drivers in need of assistance.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-10 py-16 border-y border-gray-100 dark:border-white/5">
                        <div className="max-w-2xl">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-6">How We Use Your Data</h2>
                            <ul className="space-y-6">
                                {[
                                    "Facilitating rescue requests and service management",
                                    "Verifying business credentials and professional identity",
                                    "Processing payments and generating financial reports",
                                    "Improving the platform through anonymous usage analytics",
                                    "Communicating critical system updates and support info"
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-4 group">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0 group-hover:scale-150 transition-transform" />
                                        <span className="text-gray-500 dark:text-gray-400 font-medium leading-tight">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    <section className="space-y-8">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Data Security</h2>
                        <div className="prose dark:prose-invert max-w-none text-gray-500 dark:text-gray-400 font-medium leading-relaxed space-y-6">
                            <p>
                                RoadHero employs industry-standard encryption protocols (SSL/TLS) for data transmission and multi-layered security for data storage. Access to your personal information is restricted to authorized personnel who require it for operational purposes.
                            </p>
                            <p>
                                We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.
                            </p>
                        </div>
                    </section>
                </div>
            </div>

            <PublicFooter />
        </main>
    );
}
