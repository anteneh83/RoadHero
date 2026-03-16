"use client";

import React from 'react';
import {
    Star,
    MessageCircle,
    TrendingUp,
    ArrowUpRight,
    ChevronRight,
    Bell,
    MoreHorizontal,
    Reply,
    CheckCircle2,
    AlertCircle,
    Plus,
    Search
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const reviews = [
    {
        id: 1,
        author: 'Yohannes Kassa',
        date: 'Oct 24, 2024',
        rating: 5,
        comment: '"The technician arrived exactly when promised. Biruk was very professional and fixed my battery issue in under 15 minutes. Highly recommend this shop for emergencies!"',
        action: 'Reply to Review'
    },
    {
        id: 2,
        author: 'Dawit Isaac',
        date: 'Oct 23, 2024',
        rating: 2,
        comment: '"The technician was helpful once he arrived, but it took over 45 minutes when the app said 20. The location tracking was also glitching near the Piassa area."',
        action: 'Resolve Issue',
        urgent: true
    },
    {
        id: 3,
        author: 'Sara Belay',
        date: 'Oct 21, 2024',
        rating: 4,
        comment: '"Great work on the towing. Fair pricing compared to other private operators in Addis. The driver was polite and knew the shortcuts well."',
        action: 'Reply to Review'
    },
];

export default function ReviewsPage() {
    const { t } = useLanguage();
    const [isOnline, setIsOnline] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState('');

    const filteredReviews = reviews.filter(r =>
        r.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.comment.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAction = (review: any) => {
        if (review.urgent) {
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Resolving issue for " + review.author + ". Contacting customer...", type: 'info' }
            }));
        } else {
            const reply = prompt("Enter your reply for " + review.author + ":");
            if (reply) {
                window.dispatchEvent(new CustomEvent('show-toast', {
                    detail: { message: "Reply sent to " + review.author, type: 'success' }
                }));
            }
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-xl font-black text-[#171717] dark:text-white transition-colors">{t('reviews')}</h1>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1 tracking-widest mt-1">{t('reviews_subtitle')}</p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 bg-white dark:bg-white/5 px-4 py-2 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm transition-colors">
                        <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('online_for_requests')}</span>
                        <button
                            onClick={() => setIsOnline(!isOnline)}
                            className={cn(
                                "w-10 h-5 rounded-full relative transition-colors duration-300",
                                isOnline ? "bg-green-500" : "bg-gray-200 dark:bg-white/10"
                            )}
                        >
                            <div className={cn(
                                "absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300",
                                isOnline ? "translate-x-6" : "translate-x-1"
                            )}></div>
                        </button>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-primary transition-colors" size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search reviews..."
                            className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl py-2.5 pl-12 pr-4 text-xs font-medium outline-none focus:ring-4 focus:ring-primary/5 dark:focus:ring-primary/20 transition-all shadow-sm w-64 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600"
                        />
                    </div>

                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('open-notifications'))}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors relative"
                    >
                        <Bell size={18} />
                        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 border-2 border-white dark:border-[#0A0A0A] rounded-full"></div>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md p-8 rounded-[32px] border border-white/40 dark:border-white/5 shadow-xl shadow-primary/5 space-y-4 hover:shadow-2xl transition-all duration-700 group relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-colors"></div>
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] leading-none relative z-10 transition-colors">{t('overall_reputation')}</p>
                    <div className="flex items-end gap-3 relative z-10 transition-transform duration-500 group-hover:translate-x-1">
                        <h2 className="text-5xl font-black text-[#171717] dark:text-white tracking-tighter transition-colors">4.8</h2>
                        <div className="flex items-center gap-1.5 pb-2 text-accent">
                            <Star size={18} fill="currentColor" />
                            <Star size={18} fill="currentColor" />
                            <Star size={18} fill="currentColor" />
                            <Star size={18} fill="currentColor" />
                            <Star size={18} className="text-gray-100 dark:text-gray-800" fill="currentColor" />
                        </div>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest relative z-10 transition-colors">{t('based_on_reviews').replace('{count}', '124')}</p>
                </div>

                <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md p-8 rounded-[32px] border border-white/40 dark:border-white/5 shadow-xl shadow-primary/5 space-y-6 hover:shadow-2xl transition-all duration-700 group relative">
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] leading-none transition-colors">{t('response_velocity')}</p>
                    <div className="space-y-3">
                        <div className="flex items-baseline justify-between">
                            <h2 className="text-4xl font-black text-green-500 tracking-tighter group-hover:scale-105 transition-transform origin-left">98%</h2>
                            <span className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded-lg transition-colors">{t('high_speed')}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden shadow-inner border border-gray-100 dark:border-white/5 transition-colors">
                            <div className="w-[98%] h-full bg-gradient-to-r from-green-400 to-green-600 dark:from-green-500 dark:to-green-700 rounded-full shadow-[0_0_12px_rgba(34,197,94,0.3)]"></div>
                        </div>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">{t('industry_leading')}</p>
                </div>

                <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md p-8 rounded-[32px] border border-white/40 dark:border-white/5 shadow-xl shadow-primary/5 relative overflow-hidden flex flex-col justify-between hover:shadow-2xl transition-all duration-700 group">
                    <div className="absolute -right-4 top-1/2 -translate-y-1/2 text-primary/5 dark:text-primary/10 transition-transform duration-700 group-hover:scale-125 group-hover:-rotate-12">
                        <MessageCircle size={120} strokeWidth={3} />
                    </div>
                    <div className="relative z-10 transition-colors">
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] leading-none transition-colors">{t('total_interactions')}</p>
                        <h2 className="text-5xl font-black text-primary dark:text-accent mt-4 tracking-tighter group-hover:translate-x-1 transition-transform transition-colors">142</h2>
                    </div>
                    <div className="flex items-center gap-2 relative z-10 mt-auto transition-colors">
                        <TrendingUp size={14} className="text-primary dark:text-accent" />
                        <p className="text-[10px] font-black text-primary dark:text-accent uppercase tracking-widest transition-colors">
                            {t('dynamic_feedback').replace('{count}', '12')}
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-4 ml-2">
                    <div className="w-1.5 h-6 bg-primary dark:bg-accent rounded-full transition-colors"></div>
                    <h3 className="text-[15px] font-black text-[#171717] dark:text-white uppercase tracking-widest transition-colors">Recent Customer Insights</h3>
                </div>

                <div className="space-y-6">
                    {filteredReviews.map((review) => (
                        <div
                            key={review.id}
                            className={cn(
                                "bg-white/90 dark:bg-white/5 backdrop-blur-sm rounded-[40px] py-10 px-12 border-2 transition-all duration-700 relative overflow-hidden group",
                                review.urgent
                                    ? "border-red-100 dark:border-red-500/20 bg-red-50/10 dark:bg-red-500/5 shadow-2xl shadow-red-900/5 dark:shadow-none"
                                    : "border-transparent dark:border-white/5 hover:border-primary/20 dark:hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 dark:hover:shadow-none"
                            )}
                        >
                            {review.urgent && (
                                <div className="absolute left-0 top-0 bottom-0 w-2 bg-red-500 animate-pulse"></div>
                            )}
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-10">
                                <div className="space-y-6 flex-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center text-[13px] font-black text-gray-400 dark:text-gray-600 uppercase shadow-inner group-hover:bg-primary dark:group-hover:bg-accent group-hover:text-white transition-all duration-500">
                                                {review.author.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-base font-black text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-accent transition-colors leading-none">{review.author}</h4>
                                                <p className="text-[10px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-[0.2em] transition-colors">{review.date}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-accent">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={16}
                                                    fill={i < review.rating ? "currentColor" : "none"}
                                                    className={cn(i >= review.rating && "text-gray-100 dark:text-gray-800", "transition-transform group-hover:scale-110")}
                                                    style={{ transitionDelay: `${i * 50}ms` }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className={cn(
                                        "text-sm font-medium leading-[1.8] max-w-4xl tracking-tight transition-all duration-500 group-hover:translate-x-1",
                                        review.urgent ? "text-red-700 dark:text-red-400 font-bold" : "text-gray-600 dark:text-gray-400"
                                    )}>
                                        {review.comment}
                                    </p>
                                </div>

                                <div className="flex flex-col items-end gap-3">
                                    {review.urgent && (
                                        <div className="flex items-center gap-2 bg-red-100 text-red-600 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest mb-2 animate-bounce">
                                            <AlertCircle size={12} />
                                            {t('critical_delay')}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => handleAction(review)}
                                        className={cn(
                                            "flex items-center gap-3 h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shrink-0 whitespace-nowrap shadow-xl",
                                            review.urgent
                                                ? "bg-red-500 text-white shadow-red-900/20 dark:shadow-none hover:bg-red-600"
                                                : "bg-[#1E3A8A] dark:bg-accent text-white shadow-blue-900/20 dark:shadow-none hover:bg-blue-950 dark:hover:bg-orange-600"
                                        )}>
                                        {review.urgent ? <AlertCircle size={16} /> : <Reply size={16} />}
                                        {review.urgent ? t('resolve_issue') : t('reply_to_review')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <p className="text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest pt-12">
                {t('reputation_note')}
            </p>
        </div>
    );
}
