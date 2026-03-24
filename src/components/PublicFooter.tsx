"use client";

import React from 'react';
import Link from 'next/link';
import { Logo } from './Logo';

export const PublicFooter = () => {
    return (
        <footer className="w-full py-16 px-8 text-center border-t border-gray-100 dark:border-white/5 bg-white dark:bg-black transition-colors duration-500">
            <div className="max-w-7xl mx-auto space-y-8">
                <Logo className="h-6 opacity-60 dark:opacity-50 mx-auto grayscale mb-6 text-gray-900 dark:text-white" />
                <div className="space-y-4">
                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.3em] leading-loose">
                        Developed for the streets of Addis. <br />
                        © 2024 RoadHero Ethiopia. Partner Portal v4.2
                    </p>
                    <div className="flex justify-center gap-6">
                        <Link href="/privacy" className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest hover:text-primary dark:hover:text-accent transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest hover:text-primary dark:hover:text-accent transition-colors">
                            Terms of Service
                        </Link>
                        <Link href="/support" className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest hover:text-primary dark:hover:text-accent transition-colors">
                            Support Center
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
