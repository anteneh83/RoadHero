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
  Sparkles,
  Navigation,
  UserCheck,
  ListFilter
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
    <main className="min-h-screen bg-transparent flex flex-col items-center transition-colors duration-500 overflow-x-hidden relative">
      {/* Dynamic Background Gradient - Fixed & Transparent */}
      <div className="fixed inset-0 bg-white/30 dark:bg-black/30 backdrop-blur-[100px] -z-20" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-orange-100/20 dark:from-blue-900/20 dark:via-transparent dark:to-orange-900/20 -z-10" />

      <PublicHeader />

      {/* Hero Section */}
      <section className="w-full max-w-5xl px-8 pt-48 pb-20 text-center space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-full border border-gray-200/50 dark:border-white/10 shadow-xl shadow-blue-900/[0.02] transition-all hover:scale-105">
          <Sparkles size={14} className="text-primary dark:text-accent animate-pulse" />
          <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">{t('hero_badge')}</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-6xl md:text-8xl font-black text-gray-900 dark:text-white leading-[0.95] tracking-tighter transition-colors">
            {t('hero_title_part1')} <br />
            <span className="bg-gradient-to-r from-primary to-blue-600 dark:from-accent dark:to-orange-500 bg-clip-text text-transparent italic">
              {t('hero_title_part2')}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium">
            {t('hero_desc')}
          </p>
        </div>

        {/* CTA Section */}
        <div className="pt-8 flex flex-col items-center gap-8">
          <Link
            href="/auth/register"
            className="group p-1.5 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-white/10 dark:via-white/5 dark:to-white/10 rounded-[40px] shadow-2xl shadow-blue-900/10 hover:shadow-primary/20 dark:hover:shadow-accent/20 transition-all duration-500 hover:-translate-y-1 active:scale-95"
          >
            <div className="bg-white/90 dark:bg-black/95 backdrop-blur-xl rounded-[36px] px-10 py-8 flex items-center gap-8 relative overflow-hidden transition-colors border border-white/50 dark:border-white/5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 dark:bg-accent/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

              <div className="w-20 h-20 bg-primary/5 dark:bg-accent/10 rounded-2xl flex items-center justify-center text-primary dark:text-accent relative z-10 group-hover:bg-primary group-hover:text-white dark:group-hover:bg-accent dark:group-hover:text-black transition-all duration-500 shadow-inner overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Wrench size={44} strokeWidth={2.5} />
              </div>

              <div className="text-left relative z-10">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1 group-hover:text-primary dark:group-hover:text-accent transition-colors">
                  {t('join_network_title')}
                </h3>
                <p className="text-base text-gray-500 dark:text-gray-400 font-medium tracking-tight">
                  {t('join_network_desc')}
                </p>
              </div>

              <div className="hidden lg:flex items-center justify-center w-14 h-14 bg-gray-50 dark:bg-white/5 rounded-full text-gray-400 dark:text-gray-600 group-hover:bg-primary group-hover:text-white dark:group-hover:bg-accent dark:group-hover:text-black transition-all duration-500 relative z-10">
                <ArrowRight size={28} />
              </div>
            </div>
          </Link>

          <p className="text-[11px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.3em] transition-colors">
            {t('already_partner')}{' '}
            <Link href="/auth/login" className="text-primary dark:text-accent hover:text-blue-700 dark:hover:text-white transition-colors underline decoration-2 underline-offset-8">
              {t('login_here')}
            </Link>
          </p>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="w-full max-w-6xl px-8 py-24 grid grid-cols-1 md:grid-cols-3 gap-12 relative animate-in fade-in duration-1000 delay-300">
        <FeatureCard
          icon={<ShieldCheck size={28} />}
          title={t('feature_verification_title')}
          desc={t('feature_verification_desc')}
          color="text-green-500"
        />
        <FeatureCard
          icon={<Clock size={28} />}
          title={t('feature_leads_title')}
          desc={t('feature_leads_desc')}
          color="text-orange-500"
        />
        <FeatureCard
          icon={<Zap size={28} />}
          title={t('feature_revenue_title')}
          desc={t('feature_revenue_desc')}
          color="text-primary dark:text-accent"
        />
      </section>

      {/* Platform Modern Capabilities */}
      <section className="w-full py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/[0.02] dark:bg-accent/[0.02] -z-10" />
        <div className="max-w-6xl mx-auto px-8 space-y-20">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">The All-in-One Provider Ecosystem</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Everything you need to run a modern, efficient, and data-driven roadside assistance business in Ethiopia.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <CapabilityCard
              title={t('feature_tracker_title')}
              desc={t('feature_tracker_desc')}
              icon={<Navigation size={20} />}
            />
            <CapabilityCard
              title={t('feature_technicians_title')}
              desc={t('feature_technicians_desc')}
              icon={<UserCheck size={20} />}
            />
            <CapabilityCard
              title={t('feature_services_title')}
              desc={t('feature_services_desc')}
              icon={<ListFilter size={20} />}
            />
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

function CapabilityCard({ title, desc, icon }: { title: string, desc: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white/40 dark:bg-white/[0.03] backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-[32px] p-8 space-y-4 hover:border-primary/20 dark:hover:border-accent/30 transition-all duration-500 hover:-translate-y-1">
      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:text-primary transition-colors">
        {icon}
      </div>
      <h4 className="text-lg font-black text-gray-900 dark:text-white transition-colors">{title}</h4>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function FeatureCard({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) {
  return (
    <div className="group space-y-6 p-10 rounded-[40px] hover:bg-white/50 dark:hover:bg-white/[0.05] transition-all duration-500 border border-transparent hover:border-gray-200 dark:hover:border-white/10 hover:shadow-2xl hover:shadow-blue-900/5 hover:-translate-y-2 backdrop-blur-sm">
      <div className={cn("w-16 h-16 rounded-2xl bg-white dark:bg-black/50 shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-gray-100 dark:border-white/10", color)}>
        {icon}
      </div>
      <div className="space-y-3">
        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{title}</h3>
        <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
          {desc}
        </p>
      </div>
    </div>
  );
}
