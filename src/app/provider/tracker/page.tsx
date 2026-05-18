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
    Check,
    FileText,
    Plus,
    Trash2,
    Send,
    Tag,
    Search,
    RefreshCw,
    Calendar
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useRouter } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { jobService, technicianService, quoteService, Job, JobStatus, UpdateStatusPayload, FinalizeJobPayload } from '@/services/api.service';
import { DashboardHeader } from '@/components/DashboardHeader';
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

    // ==========================================
    // Quote Engine State
    // ==========================================
    const [quote, setQuote] = useState<any>(null);
    const [quoteNotes, setQuoteNotes] = useState('');
    const [quoteValidUntil, setQuoteValidUntil] = useState('');
    const [isLoadingQuote, setIsLoadingQuote] = useState(false);
    const [lookupQuoteId, setLookupQuoteId] = useState('');

    // Line Item State
    const [lineItemType, setLineItemType] = useState<'PART' | 'LABOR'>('PART');
    const [lineItemDesc, setLineItemDesc] = useState('');
    const [lineItemQty, setLineItemQty] = useState('1');
    const [lineItemPrice, setLineItemPrice] = useState('');
    const [lineItemPartId, setLineItemPartId] = useState('');

    useEffect(() => {
        fetchActiveJobs();
    }, []);

    // Effect to load existing quote when selectedJobId changes
    useEffect(() => {
        if (selectedJobId) {
            loadExistingQuote(selectedJobId);
        } else {
            setQuote(null);
        }
    }, [selectedJobId]);

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
    };

    const fetchActiveJobs = async () => {
        setIsLoading(true);
        try {
            const response = await jobService.list();
            const rawJobs = Array.isArray(response.data) ? response.data : (response.data?.results || response.results || (Array.isArray(response) ? response : []));

            const allJobs: Job[] = rawJobs.map((job: any) => ({
                ...job,
                customer_name: job.customer_name || job.driver_name || 'Unknown',
                customer_phone: job.customer_phone || job.driver_phone,
                customer_lat: Number(job.customer_lat || job.latitude || job.lat || job.driver_lat || job.location_lat || 9.0049),
                customer_lng: Number(job.customer_lng || job.longitude || job.lng || job.driver_lng || job.location_lng || 38.7670),
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

        if (job.status === 'IN_PROGRESS') {
            setIsFinalizeModalOpen(true);
            return;
        }

        const currentIndex = statusOrder.indexOf(job.status);
        if (currentIndex === -1 || currentIndex >= statusOrder.length - 2) {
            return;
        }

        const nextStatus = statusOrder[currentIndex + 1] as UpdateStatusPayload['status'];

        if (job.status === 'ARRIVED' && nextStatus === 'IN_PROGRESS') {
            if (quote && quote.status === 'REJECTED') {
                showToast("Driver declined the quote. Please update the price/items and submit a new quote before proceeding.", 'error');
                return;
            }
            if (quote && quote.status !== 'ACCEPTED' && quote.status !== 'APPROVED') {
                showToast(`Cannot proceed to In Progress. Quote status is currently ${quote.status || 'PENDING'}. Waiting for driver approval.`, 'info');
                return;
            }
            if (!quote) {
                showToast("No diagnostic quote created. Please create and submit a quote for driver approval before proceeding.", 'info');
                return;
            }
        }

        setIsUpdating(true);
        try {
            await jobService.updateStatus(job.id, { status: nextStatus });
            showToast(`Status updated to ${nextStatus}`, 'success');
            fetchActiveJobs();
        } catch (error: any) {
            console.error("[Job Tracker] Update Error:", error);
            showToast(error.response?.data?.message || "Failed to update status", 'error');
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

            // Auto-offline the technician upon completing the job
            const selectedJob = jobs.find(j => j.id === selectedJobId);
            if (selectedJob && selectedJob.technician_id) {
                try {
                    const tech = await technicianService.get(selectedJob.technician_id);
                    await technicianService.update(tech.id, {
                        full_name: tech.full_name,
                        specialties: tech.specialties || [],
                        assigned_vehicle_plate: tech.assigned_vehicle_plate || '',
                        is_active: false
                    });
                } catch (e) {
                    console.log("[Job Tracker] Auto-offline failed:", e);
                }
            }

            setIsFinalizeModalOpen(false);
            setTotalAmount('');
            setNotes('');

            showToast("Job finalized successfully!", 'success');

            // Remove finalized job from view
            setJobs(prev => prev.filter(j => j.id !== selectedJobId));
            setSelectedJobId(null);
            fetchActiveJobs();
        } catch (error: any) {
            console.error("[Job Tracker] Finalize Error:", error);
            showToast(error.response?.data?.message || "Failed to finalize job", 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    // ==========================================
    // Quote Engine Handlers
    // ==========================================
    const loadExistingQuote = async (jobId: number) => {
        setIsLoadingQuote(true);
        try {
            // Check localStorage first
            const cachedQuoteId = localStorage.getItem(`job_${jobId}_quote_id`);
            if (cachedQuoteId) {
                const res = await quoteService.get(Number(cachedQuoteId));
                setQuote(res.data || res);
                setIsLoadingQuote(false);
                return;
            }

            // Fallback: check if job object has quote_id
            const currentJob = jobs.find(j => j.id === jobId);
            const possibleQuoteId = (currentJob as any)?.quote_id || (currentJob as any)?.quote?.id;
            if (possibleQuoteId) {
                const res = await quoteService.get(Number(possibleQuoteId));
                setQuote(res.data || res);
                localStorage.setItem(`job_${jobId}_quote_id`, possibleQuoteId.toString());
                setIsLoadingQuote(false);
                return;
            }

            setQuote(null);
        } catch (error) {
            console.error("[Quote Engine] Load existing quote error:", error);
            setQuote(null);
        } finally {
            setIsLoadingQuote(false);
        }
    };

    const handleCreateQuote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedJobId) return;

        setIsLoadingQuote(true);
        try {
            const res = await jobService.createQuote(selectedJobId, {
                notes: quoteNotes || "Diagnostic inspection completed. Recommended parts and labor estimate.",
                valid_until: quoteValidUntil || new Date(Date.now() + 86400000 * 7).toISOString()
            });
            showToast("Quote initialized successfully!", 'success');
            const newQuote = res.data || res;
            setQuote(newQuote);
            if (newQuote?.id) {
                localStorage.setItem(`job_${selectedJobId}_quote_id`, newQuote.id.toString());
            }
            setQuoteNotes('');
            setQuoteValidUntil('');
        } catch (error: any) {
            showToast(error.response?.data?.message || error.message || "Failed to create quote", 'error');
        } finally {
            setIsLoadingQuote(false);
        }
    };

    const handleLookupQuote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!lookupQuoteId || !selectedJobId) return;

        setIsLoadingQuote(true);
        try {
            const res = await quoteService.get(Number(lookupQuoteId));
            const fetchedQuote = res.data || res;
            setQuote(fetchedQuote);
            localStorage.setItem(`job_${selectedJobId}_quote_id`, fetchedQuote.id.toString());
            showToast("Quote linked successfully", 'success');
            setLookupQuoteId('');
        } catch (error: any) {
            showToast(error.response?.data?.message || error.message || "Quote not found", 'error');
        } finally {
            setIsLoadingQuote(false);
        }
    };

    const handleAddLineItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quote?.id) return;

        setIsLoadingQuote(true);
        try {
            await quoteService.addItem(quote.id, {
                item_type: lineItemType,
                description: lineItemDesc,
                quantity: Number(lineItemQty),
                unit_price: Number(lineItemPrice),
                spare_part_id: lineItemPartId ? Number(lineItemPartId) : undefined
            });
            showToast("Line item added", 'success');
            const res = await quoteService.get(quote.id);
            setQuote(res.data || res);
            setLineItemDesc('');
            setLineItemPrice('');
            setLineItemPartId('');
        } catch (error: any) {
            showToast(error.response?.data?.message || error.message || "Failed to add line item", 'error');
        } finally {
            setIsLoadingQuote(false);
        }
    };

    const handleRemoveLineItem = async (itemId: number) => {
        if (!quote?.id) return;

        setIsLoadingQuote(true);
        try {
            await quoteService.removeItem(quote.id, itemId);
            showToast("Line item removed", 'success');
            const res = await quoteService.get(quote.id);
            setQuote(res.data || res);
        } catch (error: any) {
            showToast(error.response?.data?.message || error.message || "Failed to remove line item", 'error');
        } finally {
            setIsLoadingQuote(false);
        }
    };

    const handleSubmitQuote = async () => {
        if (!quote?.id) return;

        setIsLoadingQuote(true);
        try {
            await quoteService.submit(quote.id);
            showToast("Quote submitted to driver successfully!", 'success');
            const res = await quoteService.get(quote.id);
            setQuote(res.data || res);
        } catch (error: any) {
            showToast(error.response?.data?.message || error.message || "Failed to submit quote", 'error');
        } finally {
            setIsLoadingQuote(false);
        }
    };

    const selectedJob = jobs.find(j => j.id === selectedJobId);
    const currentStatusIndex = selectedJob ? statusOrder.indexOf(selectedJob.status) : 0;

    const steps = [
        { id: 'accepted', name: t('accepted') || 'Accepted', done: currentStatusIndex >= 0, active: currentStatusIndex === 0 },
        { id: 'en_route', name: t('en_route') || 'En Route', done: currentStatusIndex >= 1, active: currentStatusIndex === 1 },
        { id: 'arrived', name: t('arrived') || 'Arrived', done: currentStatusIndex >= 2, active: currentStatusIndex === 2 },
        { id: 'work_in_progress', name: t('in_progress') || 'In Progress', done: currentStatusIndex >= 3, active: currentStatusIndex === 3 },
    ];

    if (isLoading && jobs.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-4 py-20">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{t('connecting_missions') || 'Connecting to active missions...'}</p>
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
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">{t('all_clear') || 'No Active Missions'}</h2>
                    <p className="text-xs font-medium text-gray-400 max-w-xs mx-auto">{t('no_active_missions') || 'You have no ongoing jobs at the moment.'}</p>
                </div>
                <button
                    onClick={() => router.push('/provider/queue')}
                    className="px-8 py-4 bg-primary rounded-2xl text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                    {t('view_job_queue') || 'View Job Queue'}
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#0A0A0A] font-sans">
            <DashboardHeader
                title={t('tracker') || 'Mission Tracker'}
                subtitle={t('tracker_subtitle') || 'Live GPS, Status Progression & Diagnostic Quote Management'}
            />

            <div className="p-8 lg:p-12 space-y-8 animate-in fade-in duration-1000 h-full flex flex-col pb-20 max-w-7xl mx-auto w-full relative">

                {jobs.length > 1 && (
                    <div className="flex flex-wrap gap-3 bg-white/70 dark:bg-white/5 backdrop-blur-md p-3 rounded-[28px] border border-white/40 dark:border-white/5 shadow-sm">
                        {jobs.map(job => (
                            <button
                                key={job.id}
                                onClick={() => setSelectedJobId(job.id)}
                                className={cn(
                                    "px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-500 border text-left flex items-center gap-3",
                                    job.id === selectedJobId
                                        ? "bg-primary text-white border-primary shadow-xl shadow-primary/30 scale-[1.02]"
                                        : "bg-white/80 dark:bg-white/5 text-gray-500 dark:text-white/50 border-gray-100 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                                )}
                            >
                                <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    job.id === selectedJobId ? "bg-white animate-pulse" : "bg-primary dark:bg-accent"
                                )}></div>
                                <div>
                                    {job.customer_name || 'Customer'}
                                    <span className="block font-bold text-[9px] opacity-80 capitalize mt-0.5">
                                        {job.service_type || job.distance || 'Active Request'}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {selectedJob && (
                    <>
                        {/* Progress Bar Container */}
                        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-[32px] border border-white/40 dark:border-white/5 shadow-xl shadow-primary/5 p-8 relative transition-all duration-700 overflow-hidden">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-3xl"></div>
                            <div className="flex justify-between items-center max-w-5xl mx-auto relative px-4 md:px-12">
                                {/* Connecting Lines */}
                                <div className="absolute top-[22px] left-[60px] right-[60px] h-[4px] bg-gray-100 dark:bg-white/5 rounded-full transition-colors"></div>
                                <div
                                    className="absolute top-[22px] left-[60px] h-[4px] bg-primary transition-all duration-1000 shadow-[0_0_15px_rgba(30,58,138,0.5)] rounded-full"
                                    style={{ width: `calc((100% - 120px) * ${(currentStatusIndex / (statusOrder.length - 2))})` }}
                                ></div>

                                {steps.map((step, i) => (
                                    <div key={step.id} className="flex flex-col items-center gap-3 relative z-10">
                                        <div className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center border-4 border-white dark:border-[#121212] transition-all duration-700 shadow-md",
                                            step.active
                                                ? "bg-accent scale-125 shadow-2xl shadow-orange-500/40 z-20 ring-4 ring-accent/20"
                                                : step.done
                                                    ? "bg-primary dark:bg-accent"
                                                    : "bg-gray-100 dark:bg-white/5 border-gray-100 dark:border-white/5"
                                        )}>
                                            {step.done && !step.active ? (
                                                <CheckCircle2 size={18} className="text-white" strokeWidth={3} />
                                            ) : (
                                                <div className={cn(
                                                    "w-2.5 h-2.5 rounded-full",
                                                    step.active ? "bg-white animate-pulse" : "bg-gray-300 dark:bg-gray-600"
                                                )}></div>
                                            )}
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest transition-all duration-500 text-center",
                                            step.active ? "text-accent translate-y-1" : step.done ? "text-primary dark:text-accent" : "text-gray-400 dark:text-gray-600"
                                        )}>
                                            {step.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Main Grid: Map & Optional Quote Engine */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                            {/* Left Column (2 spans): Map Area */}
                            <div className={cn(
                                "bg-white dark:bg-white/5 rounded-[40px] border border-gray-100 dark:border-white/5 shadow-2xl shadow-black/5 p-6 flex flex-col gap-6 min-h-[550px] transition-all duration-700",
                                (selectedJob.status === 'ARRIVED' || selectedJob.status === 'IN_PROGRESS') ? "lg:col-span-2" : "lg:col-span-3"
                            )}>
                                {/* Info Card ABOVE the map */}
                                <div className="px-8 py-6 flex flex-col sm:flex-row items-center justify-between bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5 shadow-inner transition-all duration-700 gap-4">
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                        <div className="relative flex-shrink-0">
                                            <div className="w-3 h-3 bg-green-500 rounded-full animate-ping absolute inset-0"></div>
                                            <div className="w-3 h-3 bg-green-500 rounded-full relative shadow-md"></div>
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">{selectedJob.technician_name || 'Technician Assigned'}</p>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t('signal') || 'Signal'}: <span className="text-green-600 dark:text-green-400 font-black">Strong GPS Lock</span></p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 w-full sm:w-auto justify-end">
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">{t('distance') || 'Distance'}</p>
                                            <p className="text-sm font-black text-gray-900 dark:text-white transition-colors">{selectedJob.distance || '0.0 KM'}</p>
                                        </div>
                                        <div className="w-px h-8 bg-gray-200 dark:bg-white/10 transition-colors"></div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">{t('eta') || 'ETA'}</p>
                                            <p className="text-sm font-black text-primary dark:text-accent transition-colors">{selectedJob.eta_minutes || '--'} mins</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Map Area BELOW the info card */}
                                <div className="flex-1 w-full min-h-[400px] bg-gray-50 dark:bg-black/20 rounded-[32px] overflow-hidden border border-gray-100 dark:border-white/10 shadow-inner relative">
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
                            </div>

                            {/* Right Column (1 span): Optional Quote Engine (Visible during ARRIVED & IN_PROGRESS) */}
                            {(selectedJob.status === 'ARRIVED' || selectedJob.status === 'IN_PROGRESS') && (
                                <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md p-8 rounded-[32px] border border-white/40 dark:border-white/5 shadow-sm space-y-6 relative overflow-hidden group/quote animate-in fade-in slide-in-from-right-4 duration-700">
                                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover/quote:bg-primary/10 transition-colors"></div>
                                    
                                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-6 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-primary/10 dark:bg-accent/10 rounded-2xl flex items-center justify-center text-primary dark:text-accent border border-primary/20 shadow-inner group-hover/quote:scale-110 group-hover/quote:rotate-6 transition-all duration-500">
                                                <FileText size={22} />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">Job Quote</h3>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Optional Diagnostic Estimate</p>
                                            </div>
                                        </div>
                                        {quote && (
                                            <button
                                                onClick={() => selectedJobId && loadExistingQuote(selectedJobId)}
                                                className="p-2.5 bg-gray-50 dark:bg-white/5 hover:bg-primary/10 hover:text-primary dark:hover:bg-accent/10 dark:hover:text-accent rounded-xl text-gray-400 transition-all shadow-sm"
                                                title="Refresh Quote Status"
                                            >
                                                <RefreshCw size={16} className={cn(isLoadingQuote && "animate-spin")} />
                                            </button>
                                        )}
                                    </div>

                                    {isLoadingQuote ? (
                                        <div className="py-20 flex flex-col items-center justify-center gap-4 text-gray-400">
                                            <Loader2 className="animate-spin text-primary" size={32} />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Syncing Quote Data...</p>
                                        </div>
                                    ) : quote ? (
                                        /* Active Quote View */
                                        <div className="space-y-6 relative z-10">
                                            <div className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-inner flex justify-between items-center">
                                                <div>
                                                    <p className="text-xs font-black text-gray-900 dark:text-white">Quote #{quote.id}</p>
                                                    <span className={cn(
                                                        "text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full mt-1 inline-block",
                                                        quote.status === 'ACCEPTED' || quote.status === 'APPROVED' ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400" :
                                                        quote.status === 'PENDING' ? "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400" :
                                                        "bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-white/70"
                                                    )}>
                                                        {quote.status || 'DRAFT'}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Amount</p>
                                                    <p className="text-lg font-black text-primary dark:text-accent">
                                                        {(quote.total_amount || quote.items?.reduce((a:any,b:any)=>a+(b.unit_price*b.quantity),0) || 0).toLocaleString()} ETB
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Line Items List */}
                                            <div className="space-y-3">
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Tag size={12} className="text-primary dark:text-accent" /> Line Items ({quote.items?.length || 0})
                                                </h4>
                                                {quote.items && quote.items.length > 0 ? (
                                                    <div className="divide-y divide-gray-100 dark:divide-white/5 border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden shadow-inner bg-gray-50/50 dark:bg-white/[0.02]">
                                                        {quote.items.map((item: any) => (
                                                            <div key={item.id} className="p-4 flex items-center justify-between gap-3 hover:bg-white dark:hover:bg-white/5 transition-colors group/item">
                                                                <div>
                                                                    <p className="text-xs font-black text-gray-900 dark:text-white group-hover/item:text-primary transition-colors">{item.description}</p>
                                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                                                        {item.quantity}x @ {Number(item.unit_price).toLocaleString()} ETB ({item.item_type})
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-xs font-black text-gray-900 dark:text-white">
                                                                        {(item.quantity * item.unit_price).toLocaleString()} ETB
                                                                    </span>
                                                                    <button 
                                                                        onClick={() => handleRemoveLineItem(item.id)}
                                                                        className="p-2 bg-gray-100 dark:bg-white/5 rounded-lg text-gray-400 hover:text-white hover:bg-red-500 transition-all active:scale-90 shadow-sm"
                                                                        title="Remove Item"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="p-8 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50/50 dark:bg-white/[0.02]">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No line items added yet.</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Add Line Item Form */}
                                            <form onSubmit={handleAddLineItem} className="bg-gray-50/80 dark:bg-white/5 p-5 rounded-2xl border border-gray-100 dark:border-white/10 space-y-4 shadow-inner">
                                                <h5 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                                    <Plus size={14} className="text-primary dark:text-accent" /> Add Line Item
                                                </h5>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <select 
                                                        value={lineItemType} 
                                                        onChange={(e) => setLineItemType(e.target.value as any)}
                                                        className="px-4 py-3 bg-white dark:bg-black border border-gray-100 dark:border-white/10 rounded-xl text-xs font-black text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                                                    >
                                                        <option value="PART">Spare Part</option>
                                                        <option value="LABOR">Labor</option>
                                                    </select>
                                                    <input 
                                                        type="number" 
                                                        value={lineItemPartId} 
                                                        onChange={(e) => setLineItemPartId(e.target.value)}
                                                        placeholder="Part ID (Opt)" 
                                                        className="px-4 py-3 bg-white dark:bg-black border border-gray-100 dark:border-white/10 rounded-xl text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                                                    />
                                                </div>
                                                <input 
                                                    type="text" 
                                                    value={lineItemDesc} 
                                                    onChange={(e) => setLineItemDesc(e.target.value)}
                                                    placeholder="Description (e.g. Brake Pads)" 
                                                    required
                                                    className="w-full px-4 py-3 bg-white dark:bg-black border border-gray-100 dark:border-white/10 rounded-xl text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                                                />
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Qty</label>
                                                        <input 
                                                            type="number" 
                                                            value={lineItemQty} 
                                                            onChange={(e) => setLineItemQty(e.target.value)}
                                                            min="1" 
                                                            required
                                                            className="w-full px-4 py-3 bg-white dark:bg-black border border-gray-100 dark:border-white/10 rounded-xl text-xs font-black text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Unit Price</label>
                                                        <input 
                                                            type="number" 
                                                            value={lineItemPrice} 
                                                            onChange={(e) => setLineItemPrice(e.target.value)}
                                                            placeholder="ETB" 
                                                            required
                                                            className="w-full px-4 py-3 bg-white dark:bg-black border border-gray-100 dark:border-white/10 rounded-xl text-xs font-black text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                                                        />
                                                    </div>
                                                </div>
                                                <button 
                                                    type="submit"
                                                    className="w-full py-3 bg-gray-900 dark:bg-accent text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black dark:hover:bg-accent/80 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 mt-2"
                                                >
                                                    <Plus size={16} /> Add Item
                                                </button>
                                            </form>

                                            {/* Submit Quote Button */}
                                            <button 
                                                onClick={handleSubmitQuote}
                                                disabled={!quote.items?.length}
                                                className={cn(
                                                    "w-full py-4 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95",
                                                    !quote.items?.length && "opacity-50 cursor-not-allowed shadow-none hover:bg-primary"
                                                )}
                                            >
                                                <Send size={16} /> Submit Quote to Driver
                                            </button>
                                        </div>
                                    ) : (
                                        /* Initialize or Lookup Quote Forms */
                                        <div className="space-y-6 relative z-10">
                                            <form onSubmit={handleCreateQuote} className="space-y-4 bg-gray-50/50 dark:bg-white/5 p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-inner">
                                                <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">Initialize New Quote</h4>
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Diagnostic Notes</label>
                                                    <textarea 
                                                        value={quoteNotes}
                                                        onChange={(e) => setQuoteNotes(e.target.value)}
                                                        placeholder="Enter diagnosis details..." 
                                                        rows={3}
                                                        className="w-full px-4 py-3 bg-white dark:bg-black border border-gray-100 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 shadow-sm resize-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Valid Until (Opt)</label>
                                                    <input 
                                                        type="datetime-local" 
                                                        value={quoteValidUntil}
                                                        onChange={(e) => setQuoteValidUntil(e.target.value)}
                                                        className="w-full px-4 py-3 bg-white dark:bg-black border border-gray-100 dark:border-white/10 rounded-xl text-xs font-black text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                                                    />
                                                </div>
                                                <button 
                                                    type="submit"
                                                    className="w-full py-4 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-primary/20 active:scale-95 flex items-center justify-center gap-2"
                                                >
                                                    <Plus size={16} /> Create Job Quote
                                                </button>
                                            </form>

                                            <div className="relative flex items-center justify-center">
                                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-white/10"></div></div>
                                                <span className="relative bg-white dark:bg-[#0A0A0A] px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">OR</span>
                                            </div>

                                            <form onSubmit={handleLookupQuote} className="flex gap-2">
                                                <input 
                                                    type="number" 
                                                    value={lookupQuoteId} 
                                                    onChange={(e) => setLookupQuoteId(e.target.value)}
                                                    placeholder="Link existing Quote ID..." 
                                                    className="flex-1 px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-xs font-black text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 shadow-inner"
                                                />
                                                <button 
                                                    type="submit"
                                                    className="px-5 py-3 bg-gray-900 dark:bg-accent text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black dark:hover:bg-accent/80 transition-all shadow-md active:scale-95 flex items-center justify-center"
                                                >
                                                    <Search size={16} />
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Global Status Action */}
                        <div className="flex justify-end z-[120] w-full mt-6">
                            <button
                                onClick={handleUpdateStatus}
                                disabled={isUpdating}
                                className="px-12 py-5 bg-accent rounded-2xl text-white text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-orange-900/40 hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center border-2 border-white dark:border-white/10 disabled:opacity-50 min-w-[300px]"
                            >
                                {isUpdating ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <>
                                        {selectedJob.status === 'IN_PROGRESS'
                                            ? "Finalize Job & Collect Payment"
                                            : `${t('update_status') || 'Update Status'}: ${steps[currentStatusIndex + 1]?.name || 'Next Phase'}`}
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}

                {/* Finalize Modal */}
                {isFinalizeModalOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white dark:bg-[#0A0A0A] w-full max-w-md rounded-[40px] shadow-2xl border border-gray-100 dark:border-white/10 p-10 space-y-8 animate-in zoom-in-95 duration-300">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight">{t('finalize_mission') || 'Finalize Mission'}</h2>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{t('complete_service_payment') || 'Complete service & payment'}</p>
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
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('total_collected_etb') || 'Total Collected (ETB)'}</label>
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
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('payment_method_label') || 'Payment Method'}</label>
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
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('internal_notes') || 'Internal Notes'}</label>
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
                                        {t('finalize_job') || 'Finalize Job'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
