"use client";

import React, { useState, useEffect } from 'react';
import {
    Star,
    MessageCircle,
    TrendingUp,
    Reply,
    CheckCircle2,
    AlertCircle,
    Search,
    Loader2,
    Send,
    ShieldCheck,
    X
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { reviewService, Review, ReviewStats } from '@/services/api.service';
import { DashboardHeader } from '@/components/DashboardHeader';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function ReviewsPage() {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState<ReviewStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Per-card inline reply state
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');
    const [markResolved, setMarkResolved] = useState(false);
    const [isSendingReply, setIsSendingReply] = useState(false);

    // Per-card resolve state
    const [resolvingId, setResolvingId] = useState<number | null>(null);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const response = await reviewService.list();
            const data = response.data || response;
            setStats(data);
        } catch (error: any) {
            console.error("[Reviews] Fetch Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Failed to load reviews", type: 'error' }
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenReply = (reviewId: number) => {
        setReplyingTo(reviewId);
        setReplyText('');
        setMarkResolved(false);
    };

    const handleCancelReply = () => {
        setReplyingTo(null);
        setReplyText('');
    };

    const handleSendReply = async (reviewId: number) => {
        if (!replyText.trim()) return;
        setIsSendingReply(true);
        try {
            await reviewService.reply(reviewId, {
                reply_message: replyText.trim(),
                mark_resolved: markResolved
            });
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Reply sent successfully", type: 'success' }
            }));
            setReplyingTo(null);
            setReplyText('');
            fetchReviews();
        } catch (error: any) {
            const msg = error?.response?.data?.message || "Failed to send reply";
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: msg, type: 'error' }
            }));
        } finally {
            setIsSendingReply(false);
        }
    };

    const handleResolve = async (reviewId: number) => {
        setResolvingId(reviewId);
        try {
            await reviewService.resolve(reviewId, {});
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Review marked as resolved", type: 'success' }
            }));
            fetchReviews();
        } catch (error: any) {
            const msg = error?.response?.data?.message || "Failed to resolve review";
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: msg, type: 'error' }
            }));
        } finally {
            setResolvingId(null);
        }
    };

    const filteredReviews = stats?.reviews.filter(r =>
        (r.author || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.comment || '').toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return (
        <div className="flex flex-col min-h-screen">
            <DashboardHeader
                title={t('reviews')}
                subtitle={t('reviews_subtitle')}
            />

            <div className="p-8 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Overall Rating */}
                    <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md p-8 rounded-[32px] border border-white/40 dark:border-white/5 shadow-xl shadow-primary/5 space-y-4 hover:shadow-2xl transition-all duration-700 group relative overflow-hidden text-left">
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] leading-none">{t('overall_reputation')}</p>
                        {isLoading ? <Loader2 className="animate-spin text-accent" /> : (
                            <div className="flex items-end gap-3 relative z-10 group-hover:translate-x-1 transition-transform duration-500">
                                <h2 className="text-5xl font-black text-[#171717] dark:text-white tracking-tighter">{stats?.overall_rating?.toFixed(1) || '0.0'}</h2>
                                <div className="flex items-center gap-1 pb-2 text-accent">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={18}
                                            fill={i < Math.round(stats?.overall_rating || 0) ? "currentColor" : "none"}
                                            className={i >= Math.round(stats?.overall_rating || 0) ? "text-gray-100 dark:text-gray-800" : ""}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            {t('based_on_reviews').replace('{count}', String(stats?.total_reviews || 0))}
                        </p>
                    </div>

                    {/* Response Rate */}
                    <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md p-8 rounded-[32px] border border-white/40 dark:border-white/5 shadow-xl shadow-primary/5 space-y-6 hover:shadow-2xl transition-all duration-700 group text-left">
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] leading-none">{t('response_velocity')}</p>
                        <div className="space-y-3">
                            <div className="flex items-baseline justify-between">
                                <h2 className="text-4xl font-black text-green-500 tracking-tighter group-hover:scale-105 transition-transform origin-left">
                                    {stats?.response_rate_percentage || 0}%
                                </h2>
                                <span className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded-lg">
                                    {t('high_speed')}
                                </span>
                            </div>
                            <div className="w-full h-2 bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                                <div
                                    className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000"
                                    style={{ width: `${stats?.response_rate_percentage || 0}%` }}
                                />
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('industry_leading')}</p>
                    </div>

                    {/* Total Reviews */}
                    <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md p-8 rounded-[32px] border border-white/40 dark:border-white/5 shadow-xl shadow-primary/5 relative overflow-hidden flex flex-col justify-between hover:shadow-2xl transition-all duration-700 group text-left">
                        <div className="absolute -right-4 top-1/2 -translate-y-1/2 text-primary/5 dark:text-primary/10 group-hover:scale-125 group-hover:-rotate-12 transition-transform duration-700">
                            <MessageCircle size={120} strokeWidth={3} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] leading-none">{t('total_interactions')}</p>
                            <h2 className="text-5xl font-black text-primary dark:text-accent mt-4 tracking-tighter group-hover:translate-x-1 transition-transform">{stats?.total_reviews || 0}</h2>
                        </div>
                        <div className="flex items-center gap-2 relative z-10 mt-auto">
                            <TrendingUp size={14} className="text-primary dark:text-accent" />
                            <p className="text-[10px] font-black text-primary dark:text-accent uppercase tracking-widest">
                                {t('dynamic_feedback').replace('{count}', '12')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="relative group max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-primary transition-colors" size={16} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by author or comment..."
                        className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl py-3 pl-12 pr-4 text-xs font-medium outline-none focus:ring-4 focus:ring-primary/5 dark:focus:ring-primary/20 transition-all shadow-sm dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600"
                    />
                </div>

                {/* Review Cards */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4 ml-2">
                        <div className="w-1.5 h-6 bg-primary dark:bg-accent rounded-full"></div>
                        <h3 className="text-[15px] font-black text-[#171717] dark:text-white uppercase tracking-widest">Recent Customer Insights</h3>
                    </div>

                    <div className="space-y-6">
                        {isLoading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4">
                                <Loader2 className="animate-spin text-primary" size={40} />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Fetching Reviews...</p>
                            </div>
                        ) : filteredReviews.length === 0 ? (
                            <div className="py-20 text-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">No reviews found</p>
                            </div>
                        ) : filteredReviews.map((review) => (
                            <div
                                key={review.id}
                                className={cn(
                                    "bg-white/90 dark:bg-white/5 backdrop-blur-sm rounded-[40px] py-10 px-12 border-2 transition-all duration-700 relative overflow-hidden group text-left",
                                    review.urgent
                                        ? "border-red-100 dark:border-red-500/20 bg-red-50/10 dark:bg-red-500/5 shadow-2xl shadow-red-900/5"
                                        : review.is_resolved
                                            ? "border-green-100 dark:border-green-500/20 bg-green-50/5 dark:bg-green-500/5"
                                            : "border-transparent dark:border-white/5 hover:border-primary/20 dark:hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5"
                                )}
                            >
                                {review.urgent && !review.is_resolved && (
                                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-red-500 animate-pulse rounded-l-[40px]" />
                                )}
                                {review.is_resolved && (
                                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-green-500 rounded-l-[40px]" />
                                )}

                                <div className="flex flex-col gap-6">
                                    {/* Header Row */}
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center text-[13px] font-black text-gray-400 dark:text-gray-600 uppercase shadow-inner group-hover:bg-primary dark:group-hover:bg-accent group-hover:text-white transition-all duration-500 shrink-0">
                                                {(review.author || '?').charAt(0)}
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-base font-black text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-accent transition-colors leading-none">{review.author}</h4>
                                                <p className="text-[10px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-[0.2em]">{review.date}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 flex-wrap shrink-0">
                                            {/* Stars */}
                                            <div className="flex items-center gap-1 text-accent">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={15}
                                                        fill={i < review.rating ? "currentColor" : "none"}
                                                        className={cn(i >= review.rating && "text-gray-100 dark:text-gray-800", "transition-transform group-hover:scale-110")}
                                                        style={{ transitionDelay: `${i * 50}ms` }}
                                                    />
                                                ))}
                                            </div>

                                            {/* Resolved Badge */}
                                            {review.is_resolved && (
                                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest">
                                                    <ShieldCheck size={11} /> Resolved
                                                </span>
                                            )}

                                            {/* Urgent Badge */}
                                            {review.urgent && !review.is_resolved && (
                                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest animate-pulse">
                                                    <AlertCircle size={11} /> Urgent
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Comment */}
                                    <p className={cn(
                                        "text-sm font-medium leading-[1.8] max-w-4xl tracking-tight",
                                        review.urgent && !review.is_resolved ? "text-red-700 dark:text-red-400 font-bold" : "text-gray-600 dark:text-gray-400"
                                    )}>
                                        {review.comment}
                                    </p>

                                    {/* Existing Reply */}
                                    {review.reply_message && (
                                        <div className="pl-6 border-l-2 border-primary/20 dark:border-accent/20 bg-primary/5 dark:bg-white/5 rounded-r-2xl py-3 pr-4">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-primary dark:text-accent mb-1">Your Reply</p>
                                            <p className="text-sm font-medium italic text-gray-600 dark:text-gray-400">{review.reply_message}</p>
                                        </div>
                                    )}

                                    {/* Inline Reply Form */}
                                    {replyingTo === review.id && (
                                        <div className="space-y-4 border-t border-gray-100 dark:border-white/5 pt-6 animate-in fade-in duration-300">
                                            <textarea
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder="Write your reply to the customer..."
                                                rows={3}
                                                autoFocus
                                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-medium text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none placeholder:text-gray-300 dark:placeholder:text-gray-600"
                                            />
                                            <label className="flex items-center gap-3 cursor-pointer w-fit">
                                                <input
                                                    type="checkbox"
                                                    checked={markResolved}
                                                    onChange={(e) => setMarkResolved(e.target.checked)}
                                                    className="w-4 h-4 accent-primary rounded"
                                                />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Also mark as resolved</span>
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleSendReply(review.id)}
                                                    disabled={!replyText.trim() || isSendingReply}
                                                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
                                                >
                                                    {isSendingReply ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                                    Send Reply
                                                </button>
                                                <button
                                                    onClick={handleCancelReply}
                                                    className="flex items-center gap-2 px-6 py-3 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                                                >
                                                    <X size={14} /> Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    {replyingTo !== review.id && (
                                        <div className="flex items-center gap-3 flex-wrap border-t border-gray-50 dark:border-white/5 pt-6">
                                            {/* Reply Button */}
                                            <button
                                                onClick={() => handleOpenReply(review.id)}
                                                className="flex items-center gap-2 px-5 py-3 bg-primary/10 dark:bg-primary/20 text-primary dark:text-blue-300 border border-primary/20 dark:border-primary/30 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all active:scale-95"
                                            >
                                                <Reply size={14} />
                                                {review.reply_message ? 'Update Reply' : 'Reply'}
                                            </button>

                                            {/* Resolve Button — only show if not yet resolved */}
                                            {!review.is_resolved && (
                                                <button
                                                    onClick={() => handleResolve(review.id)}
                                                    disabled={resolvingId === review.id}
                                                    className="flex items-center gap-2 px-5 py-3 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white hover:border-green-500 transition-all active:scale-95 disabled:opacity-50"
                                                >
                                                    {resolvingId === review.id
                                                        ? <Loader2 size={14} className="animate-spin" />
                                                        : <CheckCircle2 size={14} />
                                                    }
                                                    Mark Resolved
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest pt-12">
                    {t('reputation_note')}
                </p>
            </div>
        </div>
    );
}
