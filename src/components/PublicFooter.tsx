"use client";

import React from 'react';
import { Logo } from './Logo';

export const PublicFooter = () => {
    return (
        <footer className="w-full py-16 px-8 text-center border-t border-gray-100 dark:border-white/5 bg-white dark:bg-black transition-colors duration-500">
            <div className="max-w-7xl mx-auto space-y-8">
                <Logo className="h-6 opacity-30 dark:opacity-20 mx-auto grayscale mb-6 text-gray-900 dark:text-white" />
                <div className="space-y-4">
                    <p className="text-[10px] font-bold text-gray-300 dark:text-gray-700 uppercase tracking-[0.3em] leading-loose">
                        Developed for the streets of Addis. <br />
                        © 2024 RoadHero Ethiopia. Partner Portal v4.2
                    </p>
                    <div className="flex justify-center gap-6">
                        {['Privacy Policy', 'Terms of Service', 'Support Center'].map((item) => (
                            <a key={item} href="#" className="text-[9px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-widest hover:text-primary dark:hover:text-accent transition-colors">
                                {item}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};
