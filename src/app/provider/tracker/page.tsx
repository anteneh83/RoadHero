"use client";

import React, { useState, useEffect } from 'react';
import {
    X,
    MapPin,
    Phone,
    Car,
    Clock,
    CheckCircle2,
    Navigation,
    ChevronRight,
    ShieldCheck,
    Zap,
    Activity,
    Loader2,
    DollarSign,
    CreditCard,
    Check
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useRouter } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { jobService, Job, JobStatus, UpdateStatusPayload, FinalizeJobPayload } from '@/services/api.service';
import dynamic from 'next/dynamic';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), { ssr: false });

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const garageLocation: [number, number] = [9.0048, 38.7669];

const statusOrder: JobStatus[] = ['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'];

export default function JobTrackerPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    // Finalize Modal State
    const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
    const [totalAmount, setTotalAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchActiveJobs();
    }, []);

    const fetchActiveJobs = async () => {
        setIsLoading(true);
        try {
            // Fetch all active statuses
            const response = await jobService.list();
            const rawJobs = Array.isArray(response.data) ? response.data : (response.data?.results || response.results || (Array.isArray(response) ? response : []));

            const allJobs: Job[] = rawJobs.map((job: any) => ({
                ...job,
                customer_name: job.customer_name || job.driver_name || 'Unknown',
                customer_phone: job.customer_phone || job.driver_phone,
                customer_lat: job.customer_lat || job.latitude || 9.0049,
                customer_lng: job.customer_lng || job.longitude || 38.7670,
                distance: job.distance || job.address || 'Location provided'
            }));

            const activeJobs = allJobs.filter(j =>
                ['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(j.status)
            );

            setJobs(activeJobs);
            if (activeJobs.length > 0 && !selectedJobId) {
                setSelectedJobId(activeJobs[0].id);
            }
        } catch (error: any) {
            console.error("[Job Tracker] Fetch Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        const job = jobs.find(j => j.id === selectedJobId);
        if (!job) return;

        const currentIndex = statusOrder.indexOf(job.status);
        if (currentIndex === -1 || currentIndex >= statusOrder.length - 2) {
            // If IN_PROGRESS, the next step is Finalize (COMPLETED)
            if (job.status === 'IN_PROGRESS') {
                setIsFinalizeModalOpen(true);
            }
            return;
        }

        const nextStatus = statusOrder[currentIndex + 1] as UpdateStatusPayload['status'];

        setIsUpdating(true);
        try {
            await jobService.updateStatus(job.id, { status: nextStatus });
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: `Status updated to ${nextStatus}`, type: 'success' }
            }));
            fetchActiveJobs();
        } catch (error: any) {
            console.error("[Job Tracker] Update Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: error.response?.data?.message || "Failed to update status", type: 'error' }
            }));
        } finally {
            setIsUpdating(false);
        }
    };

    const handleFinalize = async () => {
        if (!selectedJobId || !totalAmount) return;

        setIsUpdating(true);
        try {
            const payload: FinalizeJobPayload = {
                total_amount_collected: parseFloat(totalAmount),
                payment_method: paymentMethod,
                internal_notes: notes
            };
            await jobService.finalize(selectedJobId, payload);

            setIsFinalizeModalOpen(false);
            setTotalAmount('');
            setNotes('');

            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Job finalized successfully!", type: 'success' }
            }));

            // Remove finalized job from view
            setJobs(prev => prev.filter(j => j.id !== selectedJobId));
            setSelectedJobId(null);
            fetchActiveJobs();
        } catch (error: any) {
            console.error("[Job Tracker] Finalize Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: error.response?.data?.message || "Failed to finalize job", type: 'error' }
            }));
        } finally {
            setIsUpdating(false);
        }
    };

    const selectedJob = jobs.find(j => j.id === selectedJobId);
    const currentStatusIndex = selectedJob ? statusOrder.indexOf(selectedJob.status) : 0;

    const steps = [
        { id: 'accepted', name: t('accepted'), done: currentStatusIndex >= 0, active: currentStatusIndex === 0 },
        { id: 'en_route', name: t('en_route'), done: currentStatusIndex >= 1, active: currentStatusIndex === 1 },
        { id: 'arrived', name: t('arrived'), done: currentStatusIndex >= 2, active: currentStatusIndex === 2 },
        { id: 'work_in_progress', name: t('working'), done: currentStatusIndex >= 3, active: currentStatusIndex === 3 },
    ];

    if (isLoading && jobs.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-4 py-20">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{t('connecting_missions')}</p>
            </div>
        );
    }

    if (jobs.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-10 text-center gap-6 animate-in fade-in duration-700">
                <div className="w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-[40px] flex items-center justify-center border-4 border-dashed border-gray-100 dark:border-white/5">
                    <Activity size={32} className="text-gray-200 dark:text-gray-800" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">{t('all_clear')}</h2>
                    <p className="text-xs font-medium text-gray-400 max-w-xs mx-auto">{t('no_active_missions')}</p>
                </div>
                <button
                    onClick={() => router.push('/provider/queue')}
                    className="px-8 py-4 bg-primary rounded-2xl text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                    {t('view_job_queue')}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-1000 h-full flex flex-col pb-20 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-6">
                    <div>
                        <h1 className="text-xl font-black text-[#171717] dark:text-white transition-colors">{t('tracker')}</h1>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">{t('tracker_subtitle')}</p>
                    </div>
                    {jobs.length > 1 && (
                        <div className="flex gap-2">
                            {jobs.map(job => (
                                <button
                                    key={job.id}
                                    onClick={() => setSelectedJobId(job.id)}
                                    className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black transition-all",
                                        selectedJobId === job.id
                                            ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110"
                                            : "bg-gray-100 dark:bg-white/5 text-gray-400 hover:bg-gray-200"
                                    )}
                                >
                                    {job.customer_name.charAt(0)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={fetchActiveJobs}
                        className="p-2 text-gray-400 hover:text-primary transition-colors"
                    >
                        <Activity size={18} />
                    </button>
                </div>
            </div>

            {selectedJob && (
                <>
                    {/* Progress Bar Container */}
                    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-[32px] border border-white/40 dark:border-white/5 shadow-xl shadow-primary/5 p-6 relative transition-all duration-700">
                        <div className="flex justify-between items-center max-w-4xl mx-auto relative px-10">
                            {/* Connecting Lines */}
                            <div className="absolute top-[18px] left-[60px] right-[60px] h-[3px] bg-gray-50 dark:bg-white/5 rounded-full transition-colors"></div>
                            <div
                                className="absolute top-[18px] left-[60px] h-[3px] bg-primary transition-all duration-1000 shadow-[0_0_10px_rgba(30,58,138,0.3)] rounded-full"
                                style={{ width: `${(currentStatusIndex / (statusOrder.length - 2)) * 100}%` }}
                            ></div>

                            {steps.map((step, i) => (
                                <div key={step.id} className="flex flex-col items-center gap-3 relative z-10">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center border-4 border-white transition-all duration-700 shadow-sm",
                                        step.active
                                            ? "bg-accent scale-125 shadow-2xl shadow-orange-500/30 z-20"
                                            : step.done
                                                ? "bg-primary dark:bg-accent"
                                                : "bg-gray-50 dark:bg-white/5 border-gray-50/50 dark:border-white/5"
                                    )}>
                                        {step.done && !step.active ? (
                                            <CheckCircle2 size={14} className="text-white" strokeWidth={3} />
                                        ) : (
                                            <div className={cn(
                                                "w-2 h-2 rounded-full",
                                                step.active ? "bg-white animate-pulse" : "bg-gray-300"
                                            )}></div>
                                        )}
                                    </div>
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-widest transition-all duration-500",
                                        step.active ? "text-accent translate-y-1" : step.done ? "text-primary dark:text-accent" : "text-gray-300 dark:text-gray-700"
                                    )}>
                                        {step.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Map Area */}
                    <div className="flex-1 bg-white dark:bg-white/5 rounded-[40px] border border-gray-100 dark:border-white/5 shadow-2xl shadow-black/5 p-4 flex flex-col relative overflow-hidden min-h-[500px] transition-all duration-700">
                        <div className="absolute inset-4 bg-gray-50 dark:bg-black/20 rounded-[32px] overflow-hidden border border-gray-100 dark:border-white/10 shadow-inner">
                            <InteractiveMap
                                center={[selectedJob.customer_lat, selectedJob.customer_lng]}
                                zoom={15}
                                markers={[
                                    { position: garageLocation, type: 'garage', label: 'Garage' },
                                    ...jobs.map(j => ({
                                        position: [j.customer_lat, j.customer_lng] as [number, number],
                                        type: j.id === selectedJobId ? 'customer' as const : 'default' as const,
                                        label: j.customer_name,
                                        onClick: () => setSelectedJobId(j.id)
                                    }))
                                ]}
                                polyline={[garageLocation, [selectedJob.customer_lat, selectedJob.customer_lng]]}
                            />
                        </div>

                        {/* Bottom Speed Info */}
                        <div className="mt-auto px-8 py-6 flex items-center justify-between bg-white/80 dark:bg-white/5 backdrop-blur-sm relative z-10 border-t border-gray-50 dark:border-white/5 transition-all duration-700">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping absolute inset-0"></div>
                                    <div className="w-2 h-2 bg-green-500 rounded-full relative"></div>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest">{selectedJob.technician_name || 'Technician Assigned'}</p>
                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{t('signal')}: <span className="text-green-600">Strong</span></p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">{t('distance')}</p>
                                    <p className="text-sm font-black text-gray-900 dark:text-white transition-colors">{selectedJob.distance || '0.0 KM'}</p>
                                </div>
                                <div className="w-px h-8 bg-gray-100 dark:bg-white/10 transition-colors"></div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">{t('eta')}</p>
                                    <p className="text-sm font-black text-primary dark:text-accent transition-colors">{selectedJob.eta_minutes || '--'} mins</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Global Status Action - Sticky Bottom */}
                    <div className="sticky bottom-8 self-end z-[120] w-full max-w-xs px-4 mt-auto">
                        <button
                            onClick={handleUpdateStatus}
                            disabled={isUpdating}
                            className="w-full h-14 bg-accent rounded-2xl text-white text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-orange-900/40 hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center border-4 border-white dark:border-white/10 disabled:opacity-50"
                        >
                            {isUpdating ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <>
                                    {selectedJob.status === 'IN_PROGRESS'
                                        ? "Finalize Job & Collect Payment"
                                        : `${t('update_status')}: ${steps[currentStatusIndex + 1]?.name || 'Next Phase'}`}
                                </>
                            )}
                        </button>
                    </div>
                </>
            )}

            {/* Finalize Modal */}
            {isFinalizeModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-[#0A0A0A] w-full max-w-md rounded-[40px] shadow-2xl border border-gray-100 dark:border-white/10 p-10 space-y-8 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight">{t('finalize_mission')}</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{t('complete_service_payment')}</p>
                            </div>
                            <button
                                onClick={() => setIsFinalizeModalOpen(false)}
                                className="p-3 text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('total_collected_etb')}</label>
                                <div className="relative group">
                                    <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        type="number"
                                        value={totalAmount}
                                        onChange={(e) => setTotalAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl pl-14 pr-6 py-4 text-xl font-black text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('payment_method_label')}</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {['CASH', 'TELEBIRR', 'AIBALANCE'].map(method => (
                                        <button
                                            key={method}
                                            onClick={() => setPaymentMethod(method)}
                                            className={cn(
                                                "py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all flex items-center justify-center gap-2",
                                                paymentMethod === method
                                                    ? "bg-primary/5 border-primary text-primary"
                                                    : "bg-white dark:bg-white/5 border-gray-50 dark:border-white/5 text-gray-400"
                                            )}
                                        >
                                            {method === 'CASH' && <DollarSign size={14} />}
                                            {method !== 'CASH' && <CreditCard size={14} />}
                                            {method}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('internal_notes')}</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Summary of work done..."
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-inner min-h-[100px] resize-none"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleFinalize}
                            disabled={!totalAmount || isUpdating}
                            className="w-full py-5 bg-primary rounded-2xl text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {isUpdating ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <>
                                    <Check size={18} />
                                    {t('finalize_job')}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
