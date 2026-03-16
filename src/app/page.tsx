"use client";

import React from 'react';
import Link from 'next/link';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import {
  Wrench,
  ArrowRight,
  ShieldCheck,
  Clock,
  Zap,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function LandingPage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-white dark:bg-black flex flex-col items-center transition-colors duration-500 overflow-x-hidden">
      {/* Dynamic Background Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-orange-50/30 dark:from-blue-900/10 dark:via-black dark:to-orange-900/10 -z-10" />

      <PublicHeader />

      {/* Hero Section */}
      <section className="w-full max-w-4xl px-8 pt-16 pb-20 text-center space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-primary/10 rounded-full border border-blue-100 dark:border-primary/20 shadow-sm transition-colors">
          <Sparkles size={12} className="text-primary dark:text-accent animate-pulse" />
          <span className="text-[9px] font-black text-primary dark:text-accent uppercase tracking-[0.2em]">{t('hero_badge')}</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white leading-[1.1] tracking-tight transition-colors">
          {t('hero_title_part1')} <br />
          <span className="text-primary dark:text-accent italic">{t('hero_title_part2')}</span>
        </h1>

        <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed transition-colors">
          {t('hero_desc')}
        </p>

        {/* CTA Section */}
        <div className="pt-8 flex flex-col items-center gap-6">
          <Link
            href="/auth/register"
            className="group p-1 bg-gradient-to-br from-orange-400 to-orange-600 dark:from-accent dark:to-orange-700 rounded-[32px] shadow-xl shadow-orange-100 dark:shadow-none hover:scale-[1.03] transition-all duration-500"
          >
            <div className="bg-white dark:bg-[#0A0A0A] rounded-[30px] px-8 py-6 flex items-center gap-6 relative overflow-hidden transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 dark:bg-accent/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />

              <div className="w-16 h-16 bg-orange-50 dark:bg-accent/10 rounded-2xl flex items-center justify-center text-orange-500 dark:text-accent relative z-10 group-hover:bg-accent group-hover:text-white transition-all duration-500 shadow-inner">
                <Wrench size={32} strokeWidth={2.5} />
              </div>

              <div className="text-left relative z-10">
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-0.5 group-hover:text-accent transition-colors">Join the Network</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Register your garage or towing service today.</p>
              </div>

              <div className="hidden md:flex items-center justify-center w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-full text-gray-300 dark:text-gray-600 group-hover:bg-accent group-hover:text-white transition-all duration-500 relative z-10">
                <ArrowRight size={20} />
              </div>
            </div>
          </Link>

          <p className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.3em] transition-colors">
            Already a partner? <Link href="/auth/login" className="text-primary dark:text-accent hover:underline decoration-2 underline-offset-4">Login here</Link>
          </p>
        </div>
      </section>

      {/* Features Bar */}
      <section className="w-full bg-gray-50/50 dark:bg-white/[0.02] py-20 mt-auto border-t border-gray-100 dark:border-white/5 transition-colors">
        <div className="max-w-5xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-10">
          <FeatureCard
            icon={<ShieldCheck size={24} />}
            title="Provider Verification"
            desc="Trusted by drivers. Every partner undergoes a rigorous document verification process."
            color="text-primary dark:text-accent"
          />
          <FeatureCard
            icon={<Clock size={24} />}
            title="Lead Management"
            desc="Get instant alerts for rescue requests near your location. Manage your queue effortlessly."
            color="text-orange-500 dark:text-accent"
          />
          <FeatureCard
            icon={<Zap size={24} />}
            title="Revenue Tracking"
            desc="Built-in Revenue Journal to track app income and manual walk-ins for your business."
            color="text-primary dark:text-accent"
          />
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

function FeatureCard({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) {
  return (
    <div className="group space-y-4 p-6 rounded-2xl hover:bg-white dark:hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-gray-100 dark:hover:border-white/10 hover:shadow-sm">
      <div className={cn("w-12 h-12 rounded-xl bg-white dark:bg-black shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-gray-100 dark:border-white/10", color)}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white transition-colors">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed transition-colors">
        {desc}
      </p>
    </div>
  );
}
