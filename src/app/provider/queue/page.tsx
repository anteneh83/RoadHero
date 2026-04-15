"use client";

import React, { useState, useEffect } from 'react';
import {
    MapPin,
    Clock,
    ChevronRight,
    Bell,
    Search,
    CheckCircle2,
    XCircle,
    Navigation,
    Car,
    Star,
    MoreHorizontal,
    Loader2,
    Check,
    X,
    User
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { jobService, technicianService, Job, Technician } from '@/services/api.service';
import { useLanguage } from '@/hooks/useLanguage';
import dynamic from 'next/dynamic';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), { ssr: false });

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const garageLocation: [number, number] = [9.0048, 38.7669];

export default function RequestQueuePage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

    // Accept Modal State
    const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
    const [selectedTechId, setSelectedTechId] = useState<number | string>('');
    const [eta, setEta] = useState('15');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reject Modal State
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        console.log("[Job Queue] Fetching data...");
        try {
            const [jobsRes, techsRes] = await Promise.all([
                jobService.list({ status: 'PENDING' }),
                technicianService.list()
            ]);

            console.log("[Job Queue] Jobs Response:", jobsRes);
            const rawJobs = Array.isArray(jobsRes.data) ? jobsRes.data : (jobsRes.data?.results || jobsRes.results || (Array.isArray(jobsRes) ? jobsRes : []));

            // Map the API response fields to what the UI expects (e.g., driver_name -> customer_name)
            const jobsData = rawJobs.map((job: any) => ({
                ...job,
                customer_name: job.customer_name || job.driver_name || 'Unknown',
                customer_phone: job.customer_phone || job.driver_phone,
                customer_lat: job.customer_lat || job.latitude || 9.0049,
                customer_lng: job.customer_lng || job.longitude || 38.7670,
                distance: job.distance || job.address || 'Location provided'
            }));

            setJobs(jobsData);

            const techsData = techsRes.data || techsRes;
            setTechnicians(Array.isArray(techsData) ? techsData.filter((t: any) => t.is_active) : []);

            if (jobsData.length > 0 && !selectedJobId) {
                setSelectedJobId(jobsData[0].id);
            }
        } catch (error: any) {
            console.error("[Job Queue] Fetch Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Failed to load requests", type: 'error' }
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleAccept = async () => {
        if (!selectedJobId || !selectedTechId) return;
        setIsSubmitting(true);
        try {
            await jobService.accept(selectedJobId, {
                technician_id: parseInt(selectedTechId.toString()),
                eta_minutes: parseInt(eta)
            });
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Job accepted! Redirecting to tracker...", type: 'success' }
            }));
            setTimeout(() => {
                router.push('/provider/tracker');
            }, 1000);
        } catch (error: any) {
            console.error("[Job Queue] Accept Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: error.response?.data?.message || "Failed to accept job", type: 'error' }
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!selectedJobId) return;
        setIsSubmitting(true);
        try {
            await jobService.reject(selectedJobId, { reason: rejectReason });
            setIsRejectModalOpen(false);
            setRejectReason('');
            fetchData();
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Job rejected", type: 'info' }
            }));
        } catch (error: any) {
            console.error("[Job Queue] Reject Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: error.response?.data?.message || "Failed to reject job", type: 'error' }
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.service_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (job.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase());
        // For now, simple filter logic
        const matchesFilter = activeFilter === 'all' ||
            (activeFilter === 'urgent' && job.description?.toLowerCase().includes('urgent')) ||
            (activeFilter === 'nearby' && (parseFloat(job.distance || '0') < 2));
        return matchesSearch && matchesFilter;
    });

    const selectedJob = jobs.find(j => j.id === selectedJobId);

    return (
        <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-xl font-black text-[#171717] dark:text-white transition-colors">{t('queue')}</h1>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">{t('queue_subtitle')}</p>
                </div>

                <div className="flex items-center gap-6">
                    <button
                        onClick={() => fetchData()}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <Clock size={18} />
                    </button>
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('open-notifications'))}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors relative"
                    >
                        <Bell size={18} />
                        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 border-2 border-white dark:border-[#0A0A0A] rounded-full"></div>
                    </button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-primary transition-colors" size={16} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('search_queue_placeholder')}
                        className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl py-3.5 pl-14 pr-6 text-xs font-medium outline-none focus:ring-4 focus:ring-primary/5 dark:focus:ring-primary/20 transition-all shadow-sm text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600"
                    />
                </div>
                <div className="flex bg-white dark:bg-white/5 p-1 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden transition-colors">
                    {['all', 'urgent', 'nearby'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={cn(
                                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                activeFilter === f ? "bg-primary text-white shadow-lg" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                            )}
                        >
                            {t(f)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column: Request List */}
                <div className="w-full lg:w-[400px] space-y-6">
                    <h2 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none transition-colors">{t('active_requests')} ({filteredJobs.length})</h2>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {isLoading ? (
                            <div className="py-20 flex flex-col items-center gap-4">
                                <Loader2 className="animate-spin text-primary" size={32} />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scanning network...</p>
                            </div>
                        ) : filteredJobs.length === 0 ? (
                            <div className="py-20 text-center">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No pending requests</p>
                            </div>
                        ) : filteredJobs.map((job) => (
                            <div
                                key={job.id}
                                onClick={() => setSelectedJobId(job.id)}
                                className={cn(
                                    "p-6 rounded-[32px] border-2 transition-all duration-500 cursor-pointer relative overflow-hidden group hover:-translate-y-1",
                                    selectedJobId === job.id
                                        ? "bg-white dark:bg-white/10 border-primary shadow-2xl shadow-primary/10 ring-8 ring-primary/5 dark:ring-primary/20"
                                        : "bg-white/50 dark:bg-white/5 border-transparent hover:border-gray-100 dark:hover:border-white/10 hover:shadow-lg hover:shadow-black/5"
                                )}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "p-2 rounded-xl transition-colors",
                                            selectedJobId === job.id ? "bg-primary text-white" : "bg-gray-50 dark:bg-white/5 text-primary group-hover:bg-primary/5 dark:group-hover:bg-primary/20"
                                        )}>
                                            <Navigation size={14} />
                                        </div>
                                        <h3 className="text-[13px] font-black uppercase tracking-widest text-gray-900 dark:text-white transition-colors">
                                            {job.service_type}
                                        </h3>
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-600 tabular-nums bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-lg border border-gray-100 dark:border-white/5">
                                        {new Date(job.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                <div className="space-y-2 pl-9">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={12} className="text-gray-400 dark:text-gray-600" />
                                        <p className="text-sm font-black text-gray-900 dark:text-white leading-none">{job.distance || 'Near you'}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Car size={12} className="text-gray-400 dark:text-gray-600" />
                                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest transition-colors">{job.vehicle_details || 'Vehicle Info N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Map & Detail */}
                <div className="flex-1 bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-[48px] border border-white/40 dark:border-white/5 shadow-2xl shadow-black/5 p-4 flex flex-col min-h-[600px] hover:shadow-primary/5 transition-all duration-700">
                    {selectedJob ? (
                        <>
                            <div className="flex-1 relative bg-gray-50 dark:bg-black/20 rounded-[40px] overflow-hidden mb-8 border border-gray-100 dark:border-white/5 shadow-inner group">
                                <InteractiveMap
                                    center={[selectedJob.customer_lat, selectedJob.customer_lng]}
                                    zoom={14}
                                    markers={[
                                        { position: garageLocation, type: 'garage', label: 'Garage' },
                                        { position: [selectedJob.customer_lat, selectedJob.customer_lng], type: 'customer', label: selectedJob.customer_name }
                                    ]}
                                    polyline={[garageLocation, [selectedJob.customer_lat, selectedJob.customer_lng]]}
                                />
                                <div className="absolute top-6 left-6 z-10">
                                    <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white dark:border-white/10 shadow-xl flex items-center gap-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-[9px] font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">{t('gps_tracking')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Detail */}
                            <div className="px-8 pb-8 space-y-8">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 flex items-center justify-center font-black text-primary dark:text-white text-xl shadow-inner group-hover:scale-105 transition-transform duration-500 uppercase">
                                            {selectedJob.customer_name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1.5">
                                                <h4 className="text-xl font-black text-gray-900 dark:text-white leading-none transition-colors">{selectedJob.customer_name}</h4>
                                                <div className="bg-orange-50 dark:bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-100 dark:border-orange-500/20 flex items-center gap-1 transition-colors">
                                                    <Star size={10} className="text-accent fill-accent" />
                                                    <span className="text-[9px] font-black text-orange-600 dark:text-orange-400">4.9</span>
                                                </div>
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] flex items-center gap-2">
                                                <MapPin size={10} />
                                                Near your location
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button className="p-4 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 text-primary dark:text-white hover:bg-primary hover:text-white dark:hover:bg-accent hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 group">
                                            <Bell size={18} className="group-hover:rotate-12" />
                                        </button>
                                        <button className="p-4 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 text-primary dark:text-white hover:bg-primary hover:text-white dark:hover:bg-accent hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 group">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-[32px] border border-primary/10 dark:border-primary/20 relative overflow-hidden group">
                                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                                        <Navigation size={64} className="text-primary dark:text-accent rotate-45" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 italic leading-relaxed relative z-10 transition-colors">
                                        “{selectedJob.description || 'No additional details provided.'}”
                                    </p>
                                </div>

                                <div className="flex gap-5">
                                    <button
                                        onClick={() => setIsRejectModalOpen(true)}
                                        className="flex-1 h-16 rounded-2xl border-2 border-gray-100 dark:border-white/5 text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em] hover:bg-gray-50 dark:hover:bg-white/5 hover:text-red-500 hover:border-red-100 transition-all duration-300"
                                    >
                                        {t('decline')}
                                    </button>
                                    <button
                                        onClick={() => setIsAcceptModalOpen(true)}
                                        className="flex-[2.5] h-16 rounded-2xl bg-accent text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-orange-950/20 hover:bg-orange-600 hover:shadow-orange-950/30 hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3"
                                    >
                                        {t('accept_request')}
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-10 gap-4 opacity-50">
                            <Navigation size={48} className="text-gray-300" />
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select a request to view details</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Accept Modal - Technician Assignment */}
            {isAcceptModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-[#0A0A0A] w-full max-w-sm rounded-[40px] shadow-2xl border border-gray-100 dark:border-white/10 p-10 space-y-8 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight">Assign Technician</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Select hero & ETA</p>
                            </div>
                            <button
                                onClick={() => setIsAcceptModalOpen(false)}
                                className="p-3 text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Hero</label>
                                <select
                                    value={selectedTechId}
                                    onChange={(e) => setSelectedTechId(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-inner appearance-none"
                                >
                                    <option value="" className="bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-white p-2">Select a Technician</option>
                                    {technicians.map(tech => (
                                        <option key={tech.id} value={tech.id} className="bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-white p-2">{tech.full_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ETA (Minutes)</label>
                                <input
                                    type="number"
                                    value={eta}
                                    onChange={(e) => setEta(e.target.value)}
                                    min="1"
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleAccept}
                            disabled={!selectedTechId || !eta || isSubmitting}
                            className="w-full py-5 bg-accent rounded-2xl text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-accent/20 hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <>
                                    <Check size={18} />
                                    Confirm Mission
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {isRejectModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-[#0A0A0A] w-full max-w-sm rounded-[40px] shadow-2xl border border-gray-100 dark:border-white/10 p-10 space-y-8 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight">Decline Request</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Provide a reason</p>
                            </div>
                            <button
                                onClick={() => setIsRejectModalOpen(false)}
                                className="p-3 text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="e.g. Fully booked, outside service area..."
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl px-6 py-4 text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-inner min-h-[120px] resize-none"
                            />
                        </div>

                        <button
                            onClick={handleReject}
                            disabled={isSubmitting}
                            className="w-full py-5 bg-red-500 rounded-2xl text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-red-500/20 hover:bg-red-600 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <>
                                    <X size={18} />
                                    Decline Mission
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
