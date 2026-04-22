"use client";

import React from 'react';
import {
    Car,
    Wallet,
    Users,
    Clock,
    ChevronRight,
    Bell,
    Search,
    MoreHorizontal,
    TrendingUp,
    Link as LinkIcon,
    Loader2,
    PieChart as PieIcon,
    BarChart3 as BarIcon,
    ChevronDown,
    ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import { useState, useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DashboardHeader } from '@/components/DashboardHeader';
import { providerService, jobService, DashboardMetrics, ProfileData, subscriptionService, SubscriptionStatus } from '@/services/api.service';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const stats = [
    { label: 'Jobs Today', value: '12', icon: Car, trend: null },
    { label: 'Logged Income (ETB)', value: '8,240.50', icon: Wallet, trend: null },
    { label: 'Active Technicians', value: '05', icon: Users, trend: null },
    { label: 'Avg. Response Time', value: '24 min', icon: Clock, trend: null },
];

const activity = [
    { type: 'completed', label: 'Towing Service: Yohannes Kassa', details: 'ETB 1,450.00 • Oct 24, 09:12 AM', color: 'bg-green-500' },
    { type: 'completed', label: 'Battery Jumpstart: Sara Belay', details: 'ETB 450.00 • Oct 23, 04:30 PM', color: 'bg-green-500' },
    { type: 'completed', label: 'Tire Change: Dawit Isaac', details: 'ETB 350.00 • Oct 22, 11:15 AM', color: 'bg-green-500' },
    { type: 'request', label: 'New Request: Bole Roundabout', details: 'Awaiting Acceptance • 2 mins ago', color: 'bg-orange-500' },
    { type: 'login', label: 'Technician Biruk Logged In', details: 'Available for Dispatch • 45 mins ago', color: 'bg-blue-600' },
];

const technicianAnalytics = [
    { name: 'Biruk L.', jobs: 18, rating: 4.9 },
    { name: 'Dawit I.', jobs: 14, rating: 4.7 },
    { name: 'Yohannes K.', jobs: 12, rating: 4.8 },
    { name: 'Sara B.', jobs: 10, rating: 4.6 },
    { name: 'Abebe T.', jobs: 9, rating: 4.5 },
];

const categoryAnalytics = [
    { name: 'Towing', count: 42, color: '#F97316' }, // Orange
    { name: 'Mechanical', count: 28, color: '#3B82F6' }, // Blue
    { name: 'Battery', count: 18, color: '#10B981' }, // Green
    { name: 'Tire', count: 12, color: '#8B5CF6' }, // Purple
];

const revenueData = [
    { day: 'Oct 01', amount: 8450 },
    { day: 'Oct 02', amount: 12200 },
    { day: 'Oct 03', amount: 7800 },
    { day: 'Oct 04', amount: 15600 },
    { day: 'Oct 05', amount: 11400 },
    { day: 'Oct 06', amount: 18900 },
    { day: 'Oct 07', amount: 14500 },
];

export default function RefinedDashboardPage() {
    const { t } = useLanguage();
    const [isOnline, setIsOnline] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [analysisMetric, setAnalysisMetric] = useState<'revenue' | 'technicians' | 'categories' | 'performance'>('revenue');
    const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line');

    useEffect(() => {
        fetchMetrics();

        // Real-time Dashboard Polling
        const interval = setInterval(() => {
            fetchMetrics(true);
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    const fetchMetrics = async (isPolling = false) => {
        try {
            if (!isPolling) setIsLoading(true);

            // Read profile from cache if available to optimize performance
            const cachedUser = localStorage.getItem('userProfile');
            if (cachedUser) {
                try {
                    const parsed = JSON.parse(cachedUser);
                    const profData = parsed.provider_profile || parsed;
                    setProfile({ ...profData, phone_number: parsed.phone_number });
                    if (!isPolling) setIsOnline(profData.is_online);
                } catch (e) {
                    console.error("Failed to parse cached user in dashboard:", e);
                }
            }

            const metricsRes = await providerService.getDashboardMetrics().catch(() => null);

            if (!cachedUser) {
                const profileRes = await providerService.getProfile().catch(() => null);
                if (profileRes && (profileRes.status === 'success' || profileRes.success)) {
                    setProfile(profileRes.data || profileRes);
                    if (!isPolling) setIsOnline(profileRes.data?.is_online || false);
                }
            }

            if (metricsRes && (metricsRes.status === 'success' || metricsRes.success || metricsRes.data)) {
                const metricsData = metricsRes.data || metricsRes;
                console.log("Dashboard Metrics Response:", metricsData); // Log the dashboard matrix response
                setMetrics(metricsData);

                // If subscription data is in metrics, update that too
                if (metricsData.subscription_status) {
                    setSubscriptionStatus({
                        status: metricsData.subscription_status,
                        days_remaining: metricsData.subscription_days_remaining,
                        expires_on: ''
                    });
                }
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            if (!isPolling) setIsLoading(false);
        }
    };

    const handleToggleOnline = async () => {
        setIsUpdatingStatus(true);
        console.log(`[Availability Toggle] Attempting to change status: ${isOnline ? 'Online' : 'Offline'} -> ${!isOnline ? 'Online' : 'Offline'}`);

        try {
            const nextStatus = !isOnline;
            const payload = { is_online: nextStatus };
            console.log("[Availability Toggle] Payload:", payload);

            const response = await providerService.updateAvailability(payload);
            console.log("[Availability Toggle] API Response:", response);

            // Check success more broadly to handle potential format variations
            if (response.status === 'success' || response.success === true) {
                console.log(`[Availability Toggle] Successfully updated to ${nextStatus ? 'Online' : 'Offline'}`);
                setIsOnline(nextStatus);
                window.dispatchEvent(new CustomEvent('show-toast', {
                    detail: { message: response.message || `You are now ${nextStatus ? 'online' : 'offline'}.`, type: 'success' }
                }));
            } else {
                console.warn("[Availability Toggle] Response received but status was not 'success':", response);
                throw new Error(response.message || "Failed to update availability");
            }
        } catch (error: any) {
            console.error("[Availability Toggle] Error:", error);
            const message = error.response?.data?.message || error.message || "Failed to update status";
            const errorCode = error.response?.data?.error_code;

            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: {
                    message: errorCode === 'SUBSCRIPTION_EXPIRED' ? "Subscription expired. Please renew to continue." : message,
                    type: 'error'
                }
            }));
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const statsConfig = [
        {
            label: t('active_jobs'),
            value: (metrics?.today_jobs ?? 0).toString(),
            icon: Car,
            trend: null,
            href: '/provider/queue'
        },
        {
            label: t('pending_requests'),
            value: (metrics?.pending_requests ?? 0).toString(),
            icon: Bell,
            trend: null,
            href: '/provider/queue'
        },
        {
            label: t('monthly_jobs'),
            value: (metrics?.total_jobs_this_month ?? 0).toString(),
            icon: TrendingUp,
            trend: null,
            href: '/provider/history'
        },
        {
            label: t('total_revenue') + ' (ETB)',
            value: ((metrics?.total_revenue_today) || (metrics?.revenue_data?.reduce((acc, curr) => acc + (curr.amount || curr.total || 0), 0)) || 0).toLocaleString(),
            icon: Wallet,
            trend: null,
            href: '/provider/revenue'
        },
        {
            label: t('technicians'),
            value: (metrics?.active_technicians ?? 0).toString().padStart(2, '0'),
            icon: Users,
            trend: null,
            href: '/provider/technicians'
        },
        {
            label: t('avg_rating'),
            value: (metrics?.avg_rating ?? 0).toFixed(1),
            icon: Clock,
            trend: null,
            href: '/provider/reviews'
        },
    ];

    const renderChart = () => {
        if (analysisMetric === 'performance' && chartType !== 'bar') {
            const performanceMetrics = [
                { label: 'Active Jobs', value: metrics?.today_jobs || 0, icon: Car, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
                { label: 'Pending Requests', value: metrics?.pending_requests || 0, icon: Bell, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
                { label: 'Monthly Jobs', value: metrics?.total_jobs_this_month || 0, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-500/10' },
                { label: 'Total Revenue (ETB)', value: metrics?.total_revenue_today?.toLocaleString() || '0.00', icon: Wallet, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
                { label: 'Technicians', value: metrics?.active_technicians?.toString().padStart(2, '0') || '00', icon: Users, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-500/10' },
                { label: 'avg_rating', value: metrics?.avg_rating?.toFixed(1) || '0.0', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-500/10' },
            ];

            return (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full h-full p-2 animate-in zoom-in-95 duration-500">
                    {performanceMetrics.map((m, i) => (
                        <div key={i} className="flex flex-col items-center justify-center p-4 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-primary/50 transition-all group">
                            <div className={cn("p-2 rounded-xl mb-3 group-hover:scale-110 transition-transform", m.bg)}>
                                <m.icon className={cn("w-4 h-4", m.color)} />
                            </div>
                            <span className="text-[10px] font-black text-gray-400 capitalize mb-1 text-center">{m.label}</span>
                            <span className="text-sm font-black text-gray-900 dark:text-white">{m.value}</span>
                        </div>
                    ))}
                </div>
            );
        }

        if (analysisMetric === 'categories') {
            // Pie Chart for Categories
            const activeCategoryData = metrics?.category_data?.length ? metrics.category_data : categoryAnalytics;
            const total = activeCategoryData.reduce((acc, curr) => acc + (curr.count || 0), 0);
            let currentAngle = 0;

            return (
                <div className="flex items-center gap-12 w-full h-full p-4 animate-in fade-in duration-700">
                    <div className="relative w-48 h-48">
                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                            {activeCategoryData.map((cat, i) => {
                                const angle = ((cat.count || 0) / total) * 360;
                                const x1 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
                                const y1 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
                                currentAngle += angle;
                                const x2 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
                                const y2 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);

                                const largeArcFlag = angle > 180 ? 1 : 0;
                                const d = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                                return (
                                    <path
                                        key={cat.name}
                                        d={d}
                                        fill={cat.color}
                                        className="transition-all duration-500 hover:opacity-80 cursor-pointer"
                                        stroke="white"
                                        strokeWidth="1"
                                    />
                                );
                            })}
                            <circle cx="50" cy="50" r="25" fill="white" className="dark:fill-[#111111]" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-xl font-black text-gray-900 dark:text-white">{total}</span>
                            <span className="text-[8px] font-bold text-gray-400 uppercase">Jobs</span>
                        </div>
                    </div>
                    <div className="flex-1 space-y-3">
                        {activeCategoryData.map((cat: any) => (
                            <div key={cat.name} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{cat.name}</span>
                                </div>
                                <span className="text-xs font-black text-gray-900 dark:text-white">{Math.round((cat.count / total) * 100)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if (chartType === 'bar' || analysisMetric === 'technicians') {
            // Bar Chart
            let data: any[] = [];
            let maxValue = 0;

            if (analysisMetric === 'performance') {
                data = [
                    { label: 'Active', value: metrics?.today_jobs || 0 },
                    { label: 'Pending', value: metrics?.pending_requests || 0 },
                    { label: 'Monthly', value: metrics?.total_jobs_this_month || 0 },
                    { label: 'Technicians', value: metrics?.active_technicians || 0 },
                    { label: 'Rating', value: metrics?.avg_rating || 0 },
                ];
                maxValue = Math.max(...data.map(d => d.value));
            } else {
                data = analysisMetric === 'technicians' ? (metrics?.technician_data?.length ? metrics.technician_data : technicianAnalytics) : (metrics?.revenue_data?.length ? metrics.revenue_data : revenueData);
                maxValue = Math.max(...data.map((d: any) => 'jobs' in d ? d.jobs : 'amount' in d ? d.amount : 'total' in d ? d.total : 0));
            }

            return (
                <div className="w-full h-full flex items-end justify-between px-4 pb-4 animate-in slide-in-from-bottom-4 duration-700">
                    {data.map((d, i) => {
                        const value = 'value' in d ? d.value : 'jobs' in d ? d.jobs : 'amount' in d ? d.amount : 0;
                        const label = 'label' in d ? d.label : 'name' in d ? d.name : 'day' in d ? d.day : '';
                        const height = maxValue > 0 ? Math.max((value / maxValue) * 80, value > 0 ? 5 : 0) : 0;

                        return (
                            <div key={i} className="flex flex-col items-center gap-3 group flex-1">
                                <div className="w-full px-2">
                                    <div
                                        style={{ height: `${height}%` }}
                                        className="w-full bg-primary/10 dark:bg-accent/10 rounded-t-xl group-hover:bg-primary dark:group-hover:bg-accent transition-all duration-500 relative flex justify-center"
                                    >
                                        <div className="absolute -top-8 bg-gray-900 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                            {value} {'jobs' in d ? 'Jobs' : 'ETB'}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest rotate-[-45deg] origin-top-right group-hover:text-primary dark:group-hover:text-accent transition-colors">
                                    {label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            );
        }

        // Default: Line Chart (for Revenue)
        const activeRevenueData = metrics?.revenue_data?.length ? metrics.revenue_data : revenueData;
        const maxVal = Math.max(...activeRevenueData.map((d: any) => d.amount || d.total || 0));
        const maxValue = maxVal > 0 ? maxVal : 1;
        const points = activeRevenueData.map((d: any, i: number) => {
            const val = d.amount || d.total || 0;
            const x = 50 + (i * 100);
            const y = 250 - (val / maxValue) * 200;
            return `${x} ${y}`;
        }).join(' L ');

        return (
            <div className="w-full h-full flex items-end animate-in fade-in duration-1000">
                <svg className="w-full h-full" viewBox="0 -20 700 300">
                    {/* Grid lines */}
                    <line x1="0" y1="50" x2="700" y2="50" stroke="currentColor" className="text-gray-100 dark:text-white/5" strokeWidth="1" />
                    <line x1="0" y1="150" x2="700" y2="150" stroke="currentColor" className="text-gray-100 dark:text-white/5" strokeWidth="1" />
                    <line x1="0" y1="250" x2="700" y2="250" stroke="currentColor" className="text-gray-100 dark:text-white/5" strokeWidth="1" />

                    {/* Gradient Area */}
                    <path
                        d={`M 50 250 L ${points} L 650 250 Z`}
                        fill="url(#chartGradient)"
                        className="opacity-50"
                    />
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#F97316" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* The Line */}
                    <path
                        d={`M ${points}`}
                        fill="none"
                        stroke="currentColor"
                        className="text-primary dark:text-accent"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Points */}
                    {activeRevenueData.map((d: any, i: number) => {
                        const val = d.amount || d.total || 0;
                        const x = 50 + (i * 100);
                        const y = 250 - (val / maxValue) * 200;
                        return (
                            <g key={i} className="group/dot cursor-pointer">
                                <circle cx={x} cy={y} r="6" fill="#F97316" stroke="white" strokeWidth="3" className="transition-all duration-300 group-hover/dot:r-8" />
                                <foreignObject x={x - 40} y={y - 45} width="80" height="40" className="opacity-0 group-hover/dot:opacity-100 transition-opacity pointer-events-none">
                                    <div className="bg-gray-900 text-white text-[8px] font-black px-2 py-1 rounded text-center whitespace-nowrap shadow-xl">
                                        {val.toLocaleString()} ETB
                                    </div>
                                </foreignObject>
                            </g>
                        );
                    })}
                </svg>

                {/* X Axis Labels */}
                <div className="absolute bottom-[-10px] w-full flex justify-between px-6">
                    {activeRevenueData.map((d: any, i: number) => (
                        <span key={i} className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{d.day || d.date}</span>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col min-h-screen">
            <DashboardHeader
                title={t('dashboard')}
                subtitle={`${t('welcome_back')}, ${profile?.business_name || 'Partner'} • Coverage Radius: ${profile?.coverage_radius_km || '10.00'} km`}
            />

            <div className="p-8 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
                {/* Subscription Status Bar */}
                {subscriptionStatus && (
                    <div className={cn(
                        "bg-white/70 dark:bg-white/5 backdrop-blur-md px-8 py-4 rounded-[24px] border border-white/40 dark:border-white/5 flex items-center justify-between group",
                        subscriptionStatus.days_remaining < 7 ? "border-red-200 dark:border-red-900/30" : "border-white/40"
                    )}>
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                subscriptionStatus.status === 'ACTIVE'
                                    ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                                    : "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                            )}>
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('subscription_status')}</p>
                                <p className="text-sm font-black text-gray-900 dark:text-white uppercase">
                                    {subscriptionStatus.status} <span className="mx-2 opacity-20">•</span>
                                    <span className={cn(
                                        subscriptionStatus.days_remaining < 7 ? "text-red-500" : "text-primary dark:text-accent"
                                    )}>
                                        {subscriptionStatus.days_remaining} {t('days_left')}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <Link href="/provider/subscription" className="px-6 py-2.5 bg-gray-900 dark:bg-accent text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-black dark:hover:bg-accent/80 transition-all active:scale-95 shadow-xl shadow-black/10 dark:shadow-none">
                            {t('renew_now')}
                        </Link>
                    </div>
                )}


                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {isLoading ? (
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className="bg-white/70 dark:bg-white/5 backdrop-blur-md p-6 rounded-[32px] border border-white/40 dark:border-white/5 shadow-sm space-y-4 animate-pulse">
                                <div className="w-12 h-12 bg-gray-100 dark:bg-white/10 rounded-2xl"></div>
                                <div className="space-y-2">
                                    <div className="h-2 w-16 bg-gray-100 dark:bg-white/10 rounded"></div>
                                    <div className="h-6 w-24 bg-gray-100 dark:bg-white/10 rounded"></div>
                                </div>
                            </div>
                        ))
                    ) : (
                        statsConfig.map((stat) => (
                            <Link
                                key={stat.label}
                                href={stat.href}
                                className="bg-white/70 dark:bg-white/5 backdrop-blur-md p-6 rounded-[32px] border border-white/40 dark:border-white/5 shadow-sm space-y-4 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2 cursor-pointer group relative overflow-hidden"
                            >
                                {/* Subtle background glow */}
                                <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>

                                <div className="w-12 h-12 bg-gray-50/50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-primary dark:text-orange-400 group-hover:bg-primary group-hover:text-white dark:group-hover:bg-accent dark:group-hover:text-white transition-all duration-500 group-hover:rotate-[10deg] shadow-inner border border-white dark:border-white/10">
                                    <stat.icon size={22} className="group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                                    <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight group-hover:text-primary dark:group-hover:text-accent transition-colors">{stat.value}</p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Revenue Chart Card */}
                    <div className="lg:col-span-2 bg-white dark:bg-white/5 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm p-8 flex flex-col transition-all duration-500 relative group/card">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-sm font-black text-[#171717] dark:text-white uppercase tracking-tight">
                                        {analysisMetric === 'performance' ? 'Overall Performance' : analysisMetric === 'revenue' ? t('revenue') : analysisMetric === 'technicians' ? 'Technician Performance' : 'Service Categories'}
                                    </h3>
                                    {(analysisMetric === 'revenue' || analysisMetric === 'technicians' || analysisMetric === 'performance') && (
                                        <div className="flex bg-gray-50 dark:bg-white/5 p-1 rounded-lg border border-gray-100 dark:border-white/10">
                                            <button
                                                onClick={() => setChartType('line')}
                                                className={cn(
                                                    "p-1.5 rounded-md transition-all",
                                                    chartType === 'line' ? "bg-white dark:bg-white shadow-sm text-primary" : "text-gray-400 hover:text-gray-600"
                                                )}
                                            >
                                                <TrendingUp size={12} />
                                            </button>
                                            <button
                                                onClick={() => setChartType('bar')}
                                                className={cn(
                                                    "p-1.5 rounded-md transition-all ml-1",
                                                    chartType === 'bar' ? "bg-white dark:bg-white shadow-sm text-primary" : "text-gray-400 hover:text-gray-600"
                                                )}
                                            >
                                                <BarIcon size={12} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Interactive Analysis Mode</p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <div className="relative group/dropdown">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-gray-100 dark:border-white/10">
                                        Metric: <span className="text-primary dark:text-accent">
                                            {analysisMetric === 'revenue' ? 'Revenue' : analysisMetric === 'technicians' ? 'Heros' : analysisMetric === 'categories' ? 'Services' : 'Performance'}
                                        </span>
                                        <ChevronDown size={14} className="text-gray-400 group-hover/dropdown:rotate-180 transition-transform" />
                                    </button>
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#151515] border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl opacity-0 scale-95 pointer-events-none group-hover/dropdown:opacity-100 group-hover/dropdown:scale-100 group-hover/dropdown:pointer-events-auto transition-all z-[60] p-2">
                                        <button onClick={() => setAnalysisMetric('revenue')} className="w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">Revenue Growth</button>
                                        <button onClick={() => setAnalysisMetric('performance')} className="w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all mt-1">Overall Performance</button>
                                        <button onClick={() => setAnalysisMetric('technicians')} className="w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all mt-1">Hero Efficiency</button>
                                        <button onClick={() => setAnalysisMetric('categories')} className="w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all mt-1">Service Mix</button>
                                    </div>
                                </div>

                                {['Week', 'Month', 'Year'].map((p) => (
                                    <button key={p} className={cn(
                                        "px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        p === 'Week' ? "bg-primary text-white shadow-lg shadow-blue-900/20" : "bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-gray-600"
                                    )}>{p}</button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 relative min-h-[300px] flex items-center justify-center">
                            {renderChart()}
                        </div>
                    </div>

                    {/* Recent Activity Card */}
                    <div className="bg-white dark:bg-white/5 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm p-8 flex flex-col hover:shadow-lg dark:hover:shadow-primary/5 transition-all duration-500">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-sm font-black text-[#171717] dark:text-white">{t('recent_activity')}</h3>
                                <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">Live monitoring</p>
                            </div>
                            <Link href="/provider/history" className="bg-primary/5 dark:bg-white/10 px-4 py-2 rounded-xl text-[9px] font-black text-primary dark:text-white hover:bg-primary hover:text-white dark:hover:bg-accent transition-all uppercase tracking-widest">{t('view_all')}</Link>
                        </div>

                        <div className="flex-1 space-y-7">
                            {(metrics?.recent_activity?.length ? metrics.recent_activity : activity).map((item: any, i: number) => (
                                <div key={i} className="flex gap-5 items-start group cursor-pointer relative">
                                    <div className={cn(
                                        "w-3 h-3 rounded-full mt-1.5 shrink-0 transition-all duration-500 border-2 border-white shadow-sm ring-2 ring-transparent group-hover:ring-primary/20",
                                        item.color
                                    )}></div>
                                    {i !== activity.length - 1 && (
                                        <div className="absolute left-[5px] top-6 bottom-[-20px] w-0.5 bg-gray-50 group-hover:bg-gray-100 transition-colors"></div>
                                    )}
                                    <div className="transition-all duration-300 group-hover:translate-x-1.5">
                                        <p className="text-[13px] font-black text-gray-900 dark:text-white leading-none mb-1.5 group-hover:text-primary dark:group-hover:text-accent transition-colors">{item.label}</p>
                                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{item.details}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Link href="/provider/history" className="mt-10 flex items-center justify-center gap-2 group text-[10px] font-black text-primary dark:text-white uppercase tracking-[0.2em] bg-gray-50/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 py-4 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-primary/20 dark:hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all">
                            {t('job_history')}
                            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
