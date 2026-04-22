"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { ShieldCheck, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { authService } from '@/services/api.service';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

function OTPForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [timer, setTimer] = useState(60);

    useEffect(() => {
        const phone = searchParams.get('phone');
        if (phone) setPhoneNumber(phone);

        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [searchParams]);

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) value = value.slice(-1);
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length < 6) {
            showToast("Please enter the full 6-digit OTP", "error");
            return;
        }

        setIsLoading(true);
        try {
            await authService.verifyOtp({
                phone_number: phoneNumber,
                otp: otpString
            });
            showToast("OTP Verified successfully!", "success");
            router.push('/auth/login');
        } catch (error: any) {
            const message = error.response?.data?.message || (error.message === "Network Error" ? "Network error: Connection blocked by server (CORS)" : "Verification failed");
            showToast(message, "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                    <ShieldCheck size={12} className="text-green-500" />
                    <span className="text-[9px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest">Identity Secured</span>
                </div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">Verify Phone</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium transition-colors">
                    We've sent a 6-digit code to <span className="text-primary dark:text-accent font-bold">{phoneNumber}</span>
                </p>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="flex justify-center gap-3">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            inputMode="numeric"
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="w-12 h-16 md:w-14 md:h-20 text-center text-xl font-black bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-2xl focus:border-primary dark:focus:border-accent focus:ring-4 focus:ring-primary/5 outline-none transition-all dark:text-white"
                            required
                        />
                    ))}
                </div>

                <div className="space-y-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-primary dark:bg-accent text-white rounded-[20px] text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-100 dark:shadow-none hover:bg-primary-dark dark:hover:bg-orange-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:scale-100"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Verify Identity
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>

                    <div className="flex flex-col items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors">
                        {timer > 0 ? (
                            <p className="text-gray-400">Resend code in <span className="text-primary dark:text-accent">{timer}s</span></p>
                        ) : (
                            <button
                                type="button"
                                className="text-primary dark:text-accent hover:underline flex items-center gap-2"
                                onClick={() => {
                                    setTimer(60);
                                    showToast("New code sent!", "info");
                                }}
                            >
                                <RefreshCw size={12} />
                                Resend verification code
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}

export default function VerifyOtpPage() {
    return (
        <main className="min-h-screen bg-white dark:bg-black flex flex-col transition-colors duration-500 overflow-x-hidden">
            <PublicHeader />

            <div className="flex-1 flex flex-col items-center justify-center p-8 pt-20 relative">
                {/* Background Decoration */}
                <div className="absolute top-1/4 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -z-10" />
                <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-accent/5 rounded-full blur-[100px] -z-10" />

                <Suspense fallback={<div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading...</div>}>
                    <OTPForm />
                </Suspense>
            </div>

            <PublicFooter />
        </main>
    );
}
