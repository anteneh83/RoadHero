"use client";

import React, { useState } from 'react';
import {
    Search,
    MessageSquare,
    PlayCircle,
    ChevronDown,
    ChevronUp,
    ArrowRight,
    Bell,
    HelpCircle,
    Video,
    ExternalLink,
    Zap,
    BookOpen
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const faqs = [
    {
        id: 1,
        question: 'How do I log income from a Walk-in customer?',
        answer: 'To log a manual walk-in, click the orange "+" button at the bottom right of the Revenue Journal page. Enter the amount, payment method (Cash, CBE Birr, etc.), and the service provided. This keeps your accounting accurate.'
    },
    {
        id: 2,
        question: 'What happens when my 30-day trial ends?',
        answer: 'Once your trial ends, you will need to pay the monthly platform fee (500 ETB) to continue receiving requests from the driver app and accessing your revenue journal. You can pay via CBE or Telebirr in the Subscription Center.'
    },
    {
        id: 3,
        question: 'How can I change the assigned technician for a live job?',
        answer: 'Currently, technicians are assigned at the start of a job. If you need to reassign, please contact RoadHero support directly through the chat button on the right.'
    },
    {
        id: 4,
        question: 'Is my business data shared with competing garages?',
        answer: 'No. All your revenue, staff, and job data are strictly private and encrypted. Only platform administrators have access for verification and support purposes.'
    },
];

const tutorials = [
    { id: 1, title: 'Logging Income', duration: '2:45', thumbnail: 'blue' },
    { id: 2, title: 'Renewing Subscription', duration: '1:20', thumbnail: 'orange' },
];

export default function HelpPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [openFaq, setOpenFaq] = useState<number | null>(1);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-xl font-black text-[#171717] dark:text-white transition-colors">{t('help')}</h1>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Provider support & resource center</p>
                </div>

                <div className="flex items-center gap-6">
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('open-notifications'))}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors relative"
                    >
                        <Bell size={18} />
                        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 border-2 border-white dark:border-[#0A0A0A] rounded-full"></div>
                    </button>
                    <div className="bg-orange-50 dark:bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-100 dark:border-orange-500/20 shadow-sm transition-colors">
                        <span className="text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">Trial: 12 Days Left</span>
                    </div>
                </div>
            </div>

            {/* Hero Search Area */}
            <div className="bg-[#1E3A8A] rounded-[32px] p-10 text-center space-y-8 relative overflow-hidden">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

                <h2 className="text-2xl font-black text-white relative z-10 tracking-tight">How can we help?</h2>

                <div className="max-w-xl mx-auto relative z-10 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for guides, troubleshooting, or billing..."
                        className="w-full pl-16 pr-6 py-4 rounded-2xl bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-2xl shadow-blue-900/40 dark:shadow-none outline-none focus:ring-8 focus:ring-white/10 transition-all font-medium text-xs placeholder:text-gray-300 dark:placeholder:text-gray-600"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* FAQ Section */}
                <div className="lg:col-span-2 space-y-8">
                    <h3 className="text-sm font-black text-gray-900 dark:text-white ml-2 transition-colors">Frequently Asked Questions</h3>

                    <div className="space-y-3">
                        {filteredFaqs.length > 0 ? (
                            filteredFaqs.map((faq) => (
                                <div
                                    key={faq.id}
                                    className={cn(
                                        "bg-white dark:bg-white/5 rounded-[28px] border transition-all duration-300 overflow-hidden",
                                        openFaq === faq.id ? "border-primary/20 dark:border-primary/40 shadow-xl shadow-blue-50/50 dark:shadow-none" : "border-gray-100 dark:border-white/5"
                                    )}
                                >
                                    <button
                                        onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                                        className="w-full px-8 py-6 flex items-center justify-between text-left group"
                                    >
                                        <span className={cn(
                                            "text-sm font-black transition-colors",
                                            openFaq === faq.id ? "text-primary dark:text-accent" : "text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-accent"
                                        )}>
                                            {faq.question}
                                        </span>
                                        {openFaq === faq.id ? (
                                            <ChevronUp size={18} className="text-primary dark:text-accent" />
                                        ) : (
                                            <ChevronDown size={18} className="text-gray-300 dark:text-gray-600 group-hover:text-primary dark:group-hover:text-accent transition-colors" />
                                        )}
                                    </button>

                                    <div className={cn(
                                        "px-8 overflow-hidden transition-all duration-500 ease-in-out",
                                        openFaq === faq.id ? "max-h-96 pb-8" : "max-h-0"
                                    )}>
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl transition-colors">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-[32px] border border-dashed border-gray-200 dark:border-white/10 transition-colors">
                                <HelpCircle size={40} className="mx-auto text-gray-200 dark:text-gray-800 mb-4" />
                                <p className="text-xs font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">No matching FAQs found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Support Sidebars */}
                <div className="space-y-8">
                    {/* Live Support CTA */}
                    <div className="bg-[#F97316] dark:bg-orange-600 rounded-[32px] p-8 flex flex-col gap-8 shadow-xl shadow-orange-950/10 dark:shadow-none relative overflow-hidden group transition-all">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2"></div>

                        <div className="space-y-3 relative z-10 text-white">
                            <MessageSquare size={24} fill="white" className="group-hover:rotate-12 transition-transform duration-500" />
                            <h4 className="text-xl font-black leading-tight">Need instant help?</h4>
                            <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest leading-relaxed">
                                Our support team is available<br />Mon-Sat, 8AM to 8PM.
                            </p>
                        </div>

                        <button
                            onClick={() => router.push('/provider/messages')}
                            className="w-full py-4 bg-white dark:bg-white/10 rounded-xl text-[9px] font-black text-[#F97316] dark:text-white uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg dark:shadow-none relative z-10"
                        >
                            Chat with RoadHero Admin
                        </button>
                    </div>

                    {/* Video Tutorials */}
                    <div className="space-y-4">
                        <h3 className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-2 transition-colors">Video Tutorials</h3>
                        <div className="space-y-3">
                            {tutorials.map((tutorial) => (
                                <div key={tutorial.id} className="bg-white dark:bg-white/5 rounded-[24px] border border-gray-100 dark:border-white/5 p-5 flex items-center gap-4 group cursor-pointer hover:border-primary/20 dark:hover:border-primary/40 hover:shadow-lg dark:hover:shadow-none transition-all">
                                    <div className={cn(
                                        "w-16 h-16 rounded-xl flex items-center justify-center shrink-0 border border-transparent group-hover:scale-105 transition-transform",
                                        tutorial.thumbnail === 'blue' ? "bg-blue-50 dark:bg-blue-500/10 text-primary dark:text-blue-400 border-blue-100 dark:border-blue-500/20" : "bg-orange-50 dark:bg-orange-500/10 text-orange-500 dark:text-orange-400 border-orange-100 dark:border-orange-500/20"
                                    )}>
                                        <PlayCircle size={20} fill="currentColor" strokeWidth={1} className="text-white bg-current rounded-full" />
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="text-xs font-black text-gray-900 dark:text-white mb-1 group-hover:text-primary dark:group-hover:text-accent transition-colors">{tutorial.title}</h5>
                                        <p className="text-[9px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest transition-colors">{tutorial.duration} • Watch</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-center text-[9px] font-bold text-gray-300 dark:text-gray-700 uppercase tracking-widest pt-12 transition-colors">
                RoadHero Partner Support • Version 4.2.0 • Last updated: March 2026
            </p>
        </div>
    );
}
