"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function ProviderLoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        router.push('/provider/dashboard');
    };

    return (
        <main className="min-h-screen bg-white dark:bg-black flex flex-col transition-colors duration-500 overflow-x-hidden">
            <PublicHeader />

            <div className="flex-1 flex flex-col md:flex-row relative">
                {/* Background Decoration */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-orange-50/20 dark:from-blue-900/5 dark:to-orange-900/5 -z-10" />

                {/* Left Side - Visual Branding */}
                <div className="hidden md:flex md:w-[40%] bg-primary dark:bg-primary-dark p-12 lg:p-16 flex-col justify-center relative overflow-hidden transition-colors duration-500">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-40 -mt-40 transition-all duration-1000 group-hover:bg-white/10" />
                    <div className="absolute bottom-0 left-0 w-56 h-56 bg-accent/20 rounded-full blur-3xl -ml-28 -mb-28 animate-pulse" />

                    <div className="relative z-10 space-y-6 animate-in fade-in slide-in-from-left-8 duration-1000">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                            <Sparkles size={12} className="text-accent animate-pulse" />
                            <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Partner Portal v4.2</span>
                        </div>

                        <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                            Drive Your <br />
                            <span className="text-accent italic">Business</span> <br />
                            Forward.
                        </h1>

                        <p className="text-white/60 text-base max-w-xs leading-relaxed font-medium">
                            Join thousands of service providers in Ethiopia expanding their reach with RoadHero.
                        </p>

                        <div className="pt-6 grid grid-cols-2 gap-4 border-t border-white/10">
                            <div>
                                <p className="text-2xl font-black text-white">5k+</p>
                                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">Active Drivers</p>
                            </div>
                            <div>
                                <p className="text-2xl font-black text-white">200+</p>
                                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">Pro Partners</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 lg:p-24">
                    <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">Welcome back</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium transition-colors">Sign in to manage your rescue operations.</p>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest ml-1 transition-colors">Email or Phone</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-700 group-focus-within:text-primary transition-colors" size={16} />
                                    <input
                                        type="text"
                                        placeholder="contact@garage.et"
                                        className="w-full pl-11 pr-4 py-3.5 rounded-[16px] border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] dark:text-white focus:bg-white dark:focus:bg-white/5 focus:border-primary dark:focus:border-accent focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium text-sm placeholder:text-gray-300 dark:placeholder:text-gray-700"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest transition-colors">Password</label>
                                    <Link href="#" className="text-[11px] font-black text-primary dark:text-accent uppercase tracking-widest hover:underline transition-colors">Forgot?</Link>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-700 group-focus-within:text-primary transition-colors" size={16} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••••••"
                                        className="w-full pl-11 pr-11 py-3.5 rounded-[16px] border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] dark:text-white focus:bg-white dark:focus:bg-white/5 focus:border-primary dark:focus:border-accent focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium text-sm placeholder:text-gray-300 dark:placeholder:text-gray-700"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-700 hover:text-primary transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-primary dark:bg-accent text-white rounded-[20px] text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-100 dark:shadow-none hover:bg-primary-dark dark:hover:bg-orange-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-gray-100 dark:border-white/5"></div>
                            <span className="flex-shrink mx-4 text-[9px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-[0.3em]">Continue with</span>
                            <div className="flex-grow border-t border-gray-100 dark:border-white/5"></div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex items-center justify-center gap-2 py-3.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest shadow-sm">
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-3.5 h-3.5" />
                                Google
                            </button>
                            <button className="flex items-center justify-center gap-2 py-3.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest shadow-sm">
                                <span className="w-3.5 h-3.5 bg-[#1877F2] text-white rounded flex items-center justify-center text-[7px] font-black">f</span>
                                Facebook
                            </button>
                        </div>

                        <p className="text-center text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest transition-colors">
                            Don't have an account? <Link href="/auth/register" className="text-primary dark:text-accent hover:underline decoration-2 underline-offset-4">Join the Network</Link>
                        </p>
                    </div>
                </div>
            </div>

            <PublicFooter />
        </main>
    );
}
