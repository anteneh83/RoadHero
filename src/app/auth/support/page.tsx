"use client";

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Mail, Phone, MessageSquare, ArrowLeft, Clock } from 'lucide-react';

export default function OnboardingSupportPage() {
    return (
        <main className="min-h-screen bg-gray-50 flex flex-col">
            {/* Standard Registration-Style Header */}
            <header className="bg-white border-b border-gray-100 px-8 py-5 flex justify-between items-center shadow-sm relative z-50">
                <Logo />
                <Link
                    href="/auth/register"
                    className="bg-gray-50 border border-gray-200 px-6 py-2 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary hover:border-primary transition-all shadow-sm flex items-center gap-2"
                >
                    <ArrowLeft size={14} />
                    Back to Registration
                </Link>
            </header>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-xl bg-white rounded-[40px] shadow-sm p-10 md:p-12 text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
                        <MessageSquare size={32} />
                    </div>

                    <h1 className="text-2xl font-black text-[#1E3A8A] mb-3 tracking-tight">Need Help Onboarding?</h1>
                    <p className="text-gray-400 font-medium mb-10 text-[13px] leading-relaxed">
                        Our support team is available 24/7 to help you set up your garage profile and verify your documents.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary/20 transition-colors">
                            <Phone className="text-accent mb-3" size={20} />
                            <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-widest mb-1">Call Us</h4>
                            <p className="text-[13px] font-bold text-primary">+251 911 223 344</p>
                        </div>

                        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary/20 transition-colors">
                            <Mail className="text-accent mb-3" size={20} />
                            <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-widest mb-1">Email</h4>
                            <p className="text-[13px] font-bold text-primary">support@roadhero.et</p>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <Clock size={14} className="text-accent" />
                        Response time: &lt; 5 minutes
                    </div>
                </div>
            </div>
        </main>
    );
}
