"use client";

import React from 'react';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { MessageSquare, Phone, Mail, HelpCircle, ChevronDown, Search, ArrowRight } from 'lucide-react';

const faqs = [
    {
        q: "How long does verification take?",
        a: "Typically 24-48 business hours once all documents are submitted and the orientation call is complete."
    },
    {
        q: "What equipment do I need?",
        a: "Providers must have at least one functional rescue vehicle (tow truck or service van) and standard repair tools."
    },
    {
        q: "How am I paid?",
        a: "Payments are processed instantly through Telebirr or bank transfer once a rescue mission is marked as complete."
    },
    {
        q: "Can I choose my service area?",
        a: "Yes, you can define your operational radius within the provider settings dashboard."
    }
];

export default function SupportCenterPage() {
    return (
        <main className="min-h-screen bg-white dark:bg-black flex flex-col transition-colors duration-500">
            <PublicHeader />

            {/* Hero Section */}
            <section className="relative py-24 md:py-32 overflow-hidden border-b border-gray-100 dark:border-white/5">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />

                <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 dark:bg-primary/10 rounded-full border border-primary/10">
                            <MessageSquare size={12} className="text-primary dark:text-accent" />
                            <span className="text-[10px] font-black text-primary dark:text-accent uppercase tracking-widest">Support Center</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight">How can we help?</h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">
                            Search our help documentation or get in touch with our 24/7 dedicated partner support team.
                        </p>
                    </div>

                    <div className="max-w-2xl mx-auto relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-700 group-focus-within:text-primary transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search help articles..."
                            className="w-full pl-16 pr-8 py-5 rounded-[24px] border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-neutral-900 dark:text-white font-bold text-sm focus:bg-white dark:focus:bg-black focus:border-primary dark:focus:border-accent focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                        />
                    </div>
                </div>
            </section>

            {/* Contact Grid */}
            <section className="max-w-7xl mx-auto w-full px-6 py-20">
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { title: 'Call Partner Hotline', icon: Phone, detail: '+251 911 000 000', label: '24/7 Priority Support' },
                        { title: 'Email Support', icon: Mail, detail: 'partners@roadhero.et', label: 'Response < 4 hours' },
                        { title: 'In-App Message', icon: MessageSquare, detail: 'Open Support Chat', label: 'Real-time Assistance' },
                    ].map((item, i) => (
                        <div key={i} className="p-8 bg-white dark:bg-[#0A0A0A] rounded-[32px] border border-gray-100 dark:border-white/5 shadow-xl shadow-blue-900/[0.02] hover:-translate-y-1 transition-all group cursor-pointer">
                            <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-primary dark:text-accent mb-6 group-hover:bg-primary group-hover:text-white dark:group-hover:bg-accent dark:group-hover:text-black transition-all">
                                <item.icon size={24} />
                            </div>
                            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-1">{item.title}</h3>
                            <p className="text-lg font-black text-[#1E3A8A] dark:text-white mb-4">{item.detail}</p>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ Section */}
            <section className="bg-gray-50 dark:bg-[#050505] py-24 transition-colors">
                <div className="max-w-4xl mx-auto px-6 space-y-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Frequently Asked Questions</h2>
                        <div className="w-20 h-1 bg-accent mx-auto rounded-full" />
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="bg-white dark:bg-white/[0.02] rounded-[24px] border border-gray-100 dark:border-white/5 overflow-hidden">
                                <button className="w-full p-6 text-left flex justify-between items-center group">
                                    <span className="text-sm font-black text-gray-900 dark:text-white tracking-tight">{faq.q}</span>
                                    <ChevronDown className="text-gray-300 dark:text-gray-700 group-hover:text-primary transition-colors" size={20} />
                                </button>
                                <div className="px-6 pb-6 text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                                    {faq.a}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <PublicFooter />
        </main>
    );
}
