"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
    CreditCard,
    CheckCircle2,
    Clock,
    AlertCircle,
    Plus,
    Upload,
    MoreHorizontal,
    Bell,
    Wallet,
    Building2,
    Copy,
    Info,
    Loader2,
    ExternalLink
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { subscriptionService, SubscriptionStatus } from '@/services/api.service';
import { uploadToCloudinary } from '@/services/cloudinary.service';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function SubscriptionCenterPage() {
    const { t } = useLanguage();

    const [status, setStatus] = useState<SubscriptionStatus | null>(null);
    const [isLoadingStatus, setIsLoadingStatus] = useState(true);

    // State for submission
    const [referenceNo, setReferenceNo] = useState('');
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('CBE');

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        setIsLoadingStatus(true);
        try {
            const response = await subscriptionService.getStatus();
            setStatus(response.data || response);
        } catch (error: any) {
            console.error("[Subscription] Status Fetch Error:", error);
        } finally {
            setIsLoadingStatus(false);
        }
    };

    const handleSubmit = async () => {
        if (!referenceNo || !receiptFile) {
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: 'Please provide Reference No. and Receipt screenshot', type: 'info' }
            }));
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Upload to Cloudinary
            const receiptUrl = await uploadToCloudinary(receiptFile);

            // 2. Submit Proof to Backend
            await subscriptionService.submitProof({
                transaction_reference: referenceNo,
                receipt_url: receiptUrl,
                payment_method: paymentMethod
            });

            setIsSubmitted(true);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: 'Proof submitted successfully! We will verify it shortly.', type: 'success' }
            }));
        } catch (error: any) {
            console.error("[Subscription] Proof Submission Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: error.message || 'Failed to submit proof', type: 'error' }
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePay = async () => {
        try {
            const response = await subscriptionService.pay();
            const data = response.data || response;
            if (data.checkout_url) {
                window.open(data.checkout_url, '_blank');
                window.dispatchEvent(new CustomEvent('show-toast', {
                    detail: { message: 'Redirecting to payment gateway...', type: 'info' }
                }));
            }
        } catch (error: any) {
            console.error("[Subscription] Payment Initiation Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: 'Failed to initiate payment', type: 'error' }
            }));
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-xl font-black text-[#171717] dark:text-white transition-colors">{t('subscription')}</h1>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Manage your platform access</p>
                </div>

                <div className="flex items-center gap-6">
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('open-notifications'))}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors relative"
                    >
                        <Bell size={18} />
                        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 border-2 border-white dark:border-[#0A0A0A] rounded-full"></div>
                    </button>
                    {status && (
                        <div className={cn(
                            "px-3 py-1.5 rounded-xl border transition-colors shadow-sm",
                            status.status === 'ACTIVE'
                                ? "bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-500/20"
                                : "bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20"
                        )}>
                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-widest",
                                status.status === 'ACTIVE' ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"
                            )}>
                                {status.status}: {status.days_remaining} Days
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Status Card */}
                    <div className="bg-white dark:bg-white/5 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm p-8 relative overflow-hidden flex flex-col gap-5 transition-all">
                        <div className={cn(
                            "absolute left-0 top-0 bottom-0 w-1.5",
                            status?.status === 'ACTIVE' ? "bg-green-500" : "bg-orange-500"
                        )}></div>

                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none transition-colors">Current Status</p>
                            {isLoadingStatus ? (
                                <Loader2 className="animate-spin text-primary" size={24} />
                            ) : (
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight transition-colors">
                                    {status?.status === 'ACTIVE' ? 'Subscription Active' : 'Trial / Pending'}
                                </h2>
                            )}
                        </div>

                        {!isLoadingStatus && status && (
                            <div className="flex flex-wrap gap-4 items-center">
                                <div className={cn(
                                    "px-5 py-2 rounded-xl border transition-colors",
                                    status.status === 'ACTIVE'
                                        ? "bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-500/20"
                                        : "bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20"
                                )}>
                                    <span className={cn(
                                        "text-xs font-black tracking-tight",
                                        status.status === 'ACTIVE' ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"
                                    )}>
                                        {status.days_remaining} Days Remaining
                                    </span>
                                </div>
                                <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">
                                    Expires: <span className="text-primary dark:text-accent">{formatDate(status.expires_on)}</span>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Payment Section */}
                    <div className="bg-white dark:bg-white/5 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm p-8 space-y-8 transition-all">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="text-base font-black text-gray-900 dark:text-white leading-tight transition-colors">Platform Fee Payment</h3>
                                <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 transition-colors">Transfer 500 ETB monthly to keep your garage active.</p>
                            </div>
                            <button
                                onClick={handlePay}
                                className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/10 transition-all active:scale-95"
                            >
                                <CreditCard size={14} />
                                Pay via Gateway
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Bank Option */}
                            <div
                                onClick={() => setPaymentMethod('CBE')}
                                className={cn(
                                    "flex items-center gap-5 p-5 rounded-[24px] border transition-all cursor-pointer group",
                                    paymentMethod === 'CBE'
                                        ? "bg-white dark:bg-white/10 border-blue-200 dark:border-primary/40 shadow-md"
                                        : "bg-gray-50/50 dark:bg-white/[0.02] border-gray-50 dark:border-white/5 hover:border-blue-100 dark:hover:border-primary/20"
                                )}
                            >
                                <div className="w-11 h-11 bg-[#1E3A8A] dark:bg-primary rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-900/10 dark:shadow-none">
                                    <span className="font-black text-[10px] uppercase tracking-tighter">CBE</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black text-gray-900 dark:text-white truncate transition-colors">Commercial Bank</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-base font-black text-primary dark:text-accent tracking-tight transition-colors">1000234567891</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigator.clipboard.writeText('1000234567891');
                                                window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Number Copied', type: 'success' } }));
                                            }}
                                            className="p-1 text-gray-300 dark:text-gray-600 hover:text-primary dark:hover:text-accent transition-colors"
                                        >
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Telebirr Option */}
                            <div
                                onClick={() => setPaymentMethod('TELEBIRR')}
                                className={cn(
                                    "flex items-center gap-5 p-5 rounded-[24px] border transition-all cursor-pointer group",
                                    paymentMethod === 'TELEBIRR'
                                        ? "bg-white dark:bg-white/10 border-blue-200 dark:border-primary/40 shadow-md"
                                        : "bg-gray-50/50 dark:bg-white/[0.02] border-gray-50 dark:border-white/5 hover:border-blue-100 dark:hover:border-primary/20"
                                )}
                            >
                                <div className="w-11 h-11 bg-[#00AEEF] dark:bg-blue-400 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/10 dark:shadow-none">
                                    <Wallet size={18} fill="white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black text-gray-900 dark:text-white truncate transition-colors">Telebirr Merchant</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-base font-black text-primary dark:text-accent tracking-tight transition-colors">782910</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigator.clipboard.writeText('782910');
                                                window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Number Copied', type: 'success' } }));
                                            }}
                                            className="p-1 text-gray-300 dark:text-gray-600 hover:text-primary dark:hover:text-accent transition-colors"
                                        >
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 text-primary/60 dark:text-accent/60 transition-colors">
                            <Info size={14} />
                            <p className="text-[9px] font-bold uppercase tracking-widest">Verification takes 1-2 hours.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Submit Proof Card */}
                    <div className="bg-white dark:bg-white/5 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm p-8 flex flex-col gap-8 relative overflow-hidden transition-all">
                        {isSubmitted && (
                            <div className="absolute inset-0 bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-500">
                                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-green-200 dark:shadow-none">
                                    <CheckCircle2 size={32} strokeWidth={3} />
                                </div>
                                <h4 className="text-lg font-black text-gray-900 dark:text-white mb-1 transition-colors">Under Review</h4>
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-relaxed transition-colors">
                                    We've received your proof.<br />Verification in progress.
                                </p>
                                <button
                                    onClick={() => { setIsSubmitted(false); setReferenceNo(''); setReceiptFile(null); }}
                                    className="mt-6 text-[10px] font-black text-primary dark:text-accent uppercase tracking-widest hover:underline transition-colors"
                                >
                                    Submit Another
                                </button>
                            </div>
                        )}

                        <h3 className="text-base font-black text-gray-900 dark:text-white leading-tight transition-colors">Submit Proof</h3>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 transition-colors">Reference No.</label>
                                <input
                                    type="text"
                                    value={referenceNo}
                                    onChange={(e) => setReferenceNo(e.target.value)}
                                    placeholder="FT2410..."
                                    className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl px-5 py-3 text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 dark:focus:ring-primary/20 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 transition-colors">Receipt Screenshot</label>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                                />
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={cn(
                                        "w-full h-24 rounded-[20px] border-2 border-dashed flex flex-col items-center justify-center gap-2 group cursor-pointer transition-all",
                                        receiptFile
                                            ? "border-green-200 dark:border-green-500/20 bg-green-50/30 dark:bg-green-500/5"
                                            : "border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] hover:border-primary/50 dark:hover:border-primary/20"
                                    )}
                                >
                                    {receiptFile ? (
                                        <div className="flex flex-col items-center gap-1">
                                            <CheckCircle2 size={24} className="text-green-500" />
                                            <p className="text-[10px] font-black text-green-700 dark:text-green-400 truncate max-w-[180px] transition-colors">{receiptFile.name}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <Plus size={16} className="text-accent group-hover:scale-125 transition-transform" />
                                            <p className="text-[9px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest transition-colors">Select Image</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={cn(
                                    "w-full py-4 rounded-xl text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl dark:shadow-none transition-all flex items-center justify-center gap-3",
                                    isSubmitting ? "bg-gray-400 dark:bg-gray-800 cursor-not-allowed" : "bg-accent shadow-orange-900/10 hover:bg-orange-600 active:scale-95"
                                )}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Submit for Approval'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Verification Progress Card */}
                    <div className="bg-white dark:bg-white/5 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm p-8 flex flex-col gap-6 transition-all">
                        <h3 className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">Progress</h3>

                        <div className="space-y-0 text-left">
                            <div className="flex items-center gap-4 relative">
                                <div className={cn(
                                    "w-7 h-7 rounded-full flex items-center justify-center text-white z-10 shrink-0 transition-colors",
                                    isSubmitted || status?.status === 'ACTIVE' ? "bg-green-500" : "bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-600"
                                )}>
                                    <CheckCircle2 size={14} strokeWidth={3} />
                                </div>
                                <div className="space-y-0.5">
                                    <p className={cn("text-xs font-black leading-none transition-colors", (isSubmitted || status?.status === 'ACTIVE') ? "text-gray-900 dark:text-white" : "text-gray-300 dark:text-gray-700")}>Submitted</p>
                                    <p className="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">{(isSubmitted || status?.status === 'ACTIVE') ? 'Completed' : '-'}</p>
                                </div>
                                <div className={cn("absolute left-3.5 top-7 w-[2px] h-8 transition-colors", (isSubmitted || status?.status === 'ACTIVE') ? "bg-green-500" : "bg-gray-100 dark:bg-white/10")}></div>
                            </div>

                            <div className="flex items-center gap-4 relative py-8 transition-colors">
                                <div className={cn(
                                    "w-7 h-7 rounded-full border-2 flex items-center justify-center z-10 shrink-0 relative transition-colors",
                                    isSubmitted || status?.status === 'ACTIVE' ? "border-accent bg-accent/10 text-accent" : "border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 text-gray-200 dark:text-gray-800"
                                )}>
                                    {(isSubmitted && status?.status !== 'ACTIVE') && <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse transition-colors"></div>}
                                    {status?.status === 'ACTIVE' && <CheckCircle2 size={14} strokeWidth={3} className="text-accent" />}
                                </div>
                                <div className="space-y-0.5">
                                    <p className={cn("text-xs font-black leading-none transition-colors", (isSubmitted || status?.status === 'ACTIVE') ? "text-gray-900 dark:text-white" : "text-gray-300 dark:text-gray-700")}>Verifying</p>
                                    {isSubmitted && status?.status !== 'ACTIVE' && <p className="text-[8px] font-black text-accent uppercase tracking-widest transition-colors">&lt; 1 hour</p>}
                                    {status?.status === 'ACTIVE' && <p className="text-[8px] font-black text-accent uppercase tracking-widest transition-colors">Verified</p>}
                                </div>
                                <div className={cn("absolute left-3.5 top-[60px] w-[2px] h-8 transition-colors", status?.status === 'ACTIVE' ? "bg-green-500" : "bg-gray-100 dark:bg-white/10")}></div>
                            </div>

                            <div className="flex items-center gap-4 relative transition-colors">
                                <div className={cn(
                                    "w-7 h-7 rounded-full border-2 flex items-center justify-center z-10 shrink-0 transition-colors",
                                    status?.status === 'ACTIVE' ? "border-green-500 bg-green-500 text-white" : "border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 text-gray-300 dark:text-gray-800 opacity-50"
                                )}>
                                    {status?.status === 'ACTIVE' && <CheckCircle2 size={14} strokeWidth={3} />}
                                </div>
                                <div>
                                    <p className={cn("text-xs font-black leading-none transition-colors", status?.status === 'ACTIVE' ? "text-gray-900 dark:text-white" : "text-gray-300 dark:text-gray-800 opacity-50")}>Active</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-center text-[9px] font-bold text-gray-300 dark:text-gray-700 uppercase tracking-widest pt-12 transition-colors">
                All subscription payments are non-refundable. Monthly Fee: 500 ETB. RoadHero Partner Portal v4.2
            </p>
        </div>
    );
}
