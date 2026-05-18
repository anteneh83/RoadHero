"use client";

import React, { useState, useEffect } from 'react';
import { 
    FileText, 
    Calendar, 
    BarChart3, 
    UploadCloud, 
    Plus, 
    Trash2, 
    CheckCircle, 
    Clock, 
    DollarSign, 
    Users, 
    Package, 
    Search, 
    Loader2,
    Send,
    AlertCircle,
    Copy,
    ExternalLink,
    TrendingUp,
    ShieldCheck,
    Tag,
    ChevronRight,
    Wrench
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { DashboardHeader } from '@/components/DashboardHeader';
import { jobService, quoteService, scheduleService, analyticsService, utilService } from '@/services/api.service';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function OperationsPage() {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'schedule' | 'analytics' | 'upload'>('schedule');
    const [isLoading, setIsLoading] = useState(false);

    // ==========================================
    // Tab 1: Quotes State
    // ==========================================
    const [quoteJobId, setQuoteJobId] = useState('');
    const [createQuoteNotes, setCreateQuoteNotes] = useState('');
    const [createQuoteValidUntil, setCreateQuoteValidUntil] = useState('');
    
    const [lookupQuoteId, setLookupQuoteId] = useState('');
    const [selectedQuote, setSelectedQuote] = useState<any>(null);
    
    // Add Line Item State
    const [lineItemType, setLineItemType] = useState<'PART' | 'LABOR'>('PART');
    const [lineItemDesc, setLineItemDesc] = useState('');
    const [lineItemQty, setLineItemQty] = useState('1');
    const [lineItemPrice, setLineItemPrice] = useState('');
    const [lineItemPartId, setLineItemPartId] = useState('');

    // ==========================================
    // Tab 2: Schedule State
    // ==========================================
    const [availabilitySlots, setAvailabilitySlots] = useState<any[]>([]);
    const [unavailableDates, setUnavailableDates] = useState<any[]>([]);
    
    // Add Slot State
    const [slotDay, setSlotDay] = useState('0');
    const [slotOpen, setSlotOpen] = useState('08:00');
    const [slotClose, setSlotClose] = useState('18:00');
    const [slotAvailable, setSlotAvailable] = useState(true);
    const [slotMaxJobs, setSlotMaxJobs] = useState('5');

    // Add Unavailable State
    const [unavailDate, setUnavailDate] = useState('');
    const [unavailReason, setUnavailReason] = useState('');

    // ==========================================
    // Tab 3: Analytics State
    // ==========================================
    const [analyticsDays, setAnalyticsDays] = useState(30);
    const [analyticsLimit, setAnalyticsLimit] = useState(10);
    const [revenueData, setRevenueData] = useState<any>(null);
    const [topPartsData, setTopPartsData] = useState<any[]>([]);
    const [techPerfData, setTechPerfData] = useState<any[]>([]);

    // ==========================================
    // Tab 4: Upload State
    // ==========================================
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState('');

    // ==========================================
    // Effects & Fetchers
    // ==========================================
    useEffect(() => {
        if (activeTab === 'schedule') {
            fetchScheduleData();
        } else if (activeTab === 'analytics') {
            fetchAnalyticsData();
        }
    }, [activeTab, analyticsDays, analyticsLimit]);

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
    };

    // --- Quotes Handlers ---
    const handleCreateQuote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quoteJobId) {
            showToast("Please enter a valid Job ID", 'error');
            return;
        }

        setIsLoading(true);
        try {
            const res = await jobService.createQuote(Number(quoteJobId), {
                notes: createQuoteNotes,
                valid_until: createQuoteValidUntil || new Date(Date.now() + 86400000 * 7).toISOString()
            });
            showToast("Quote created successfully!", 'success');
            const newQuote = res.data || res;
            setSelectedQuote(newQuote);
            setLookupQuoteId(newQuote.id?.toString() || '');
            setCreateQuoteNotes('');
            setCreateQuoteValidUntil('');
        } catch (error: any) {
            showToast(error.response?.data?.message || error.message || "Failed to create quote", 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLookupQuote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!lookupQuoteId) return;

        setIsLoading(true);
        try {
            const res = await quoteService.get(Number(lookupQuoteId));
            setSelectedQuote(res.data || res);
            showToast("Quote retrieved successfully", 'success');
        } catch (error: any) {
            showToast(error.response?.data?.message || error.message || "Quote not found", 'error');
            setSelectedQuote(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddLineItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedQuote?.id) return;

        setIsLoading(true);
        try {
            await quoteService.addItem(selectedQuote.id, {
                item_type: lineItemType,
                description: lineItemDesc,
                quantity: Number(lineItemQty),
                unit_price: Number(lineItemPrice),
                spare_part_id: lineItemPartId ? Number(lineItemPartId) : undefined
            });
            showToast("Line item added", 'success');
            const res = await quoteService.get(selectedQuote.id);
            setSelectedQuote(res.data || res);
            setLineItemDesc('');
            setLineItemPrice('');
            setLineItemPartId('');
        } catch (error: any) {
            showToast(error.response?.data?.message || error.message || "Failed to add line item", 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveLineItem = async (itemId: number) => {
        if (!selectedQuote?.id) return;

        setIsLoading(true);
        try {
            await quoteService.removeItem(selectedQuote.id, itemId);
            showToast("Line item removed", 'success');
            const res = await quoteService.get(selectedQuote.id);
            setSelectedQuote(res.data || res);
        } catch (error: any) {
            showToast(error.response?.data?.message || error.message || "Failed to remove line item", 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitQuote = async () => {
        if (!selectedQuote?.id) return;

        setIsLoading(true);
        try {
            await quoteService.submit(selectedQuote.id);
            showToast("Quote submitted to driver successfully!", 'success');
            const res = await quoteService.get(selectedQuote.id);
            setSelectedQuote(res.data || res);
        } catch (error: any) {
            showToast(error.response?.data?.message || error.message || "Failed to submit quote", 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Schedule Handlers ---
    const fetchScheduleData = async () => {
        setIsLoading(true);
        try {
            const [slotsRes, unavailRes] = await Promise.all([
                scheduleService.list().catch(() => ({ data: [] })),
                scheduleService.listUnavailable().catch(() => ({ data: [] }))
            ]);
            setAvailabilitySlots(slotsRes.data || slotsRes || []);
            setUnavailableDates(unavailRes.data || unavailRes || []);
        } catch (error) {
            console.error("Failed to fetch schedule data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSlot = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await scheduleService.add({
                day_of_week: Number(slotDay),
                open_time: slotOpen,
                close_time: slotClose,
                is_available: slotAvailable,
                max_concurrent_jobs: Number(slotMaxJobs)
            });
            showToast("Availability slot added", 'success');
            fetchScheduleData();
        } catch (error: any) {
            showToast(error.response?.data?.message || error.message || "Failed to add slot", 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveSlot = async (id: number) => {
        setIsLoading(true);
        try {
            await scheduleService.remove(id);
            showToast("Slot removed", 'success');
            fetchScheduleData();
        } catch (error: any) {
            showToast(error.response?.data?.message || error.message || "Failed to remove slot", 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddUnavailable = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!unavailDate) return;
        setIsLoading(true);
        try {
            await scheduleService.addUnavailable({
                date: unavailDate,
                reason: unavailReason || "Unavailable"
            });
            showToast("Unavailable date added", 'success');
            setUnavailDate('');
            setUnavailReason('');
            fetchScheduleData();
        } catch (error: any) {
            showToast(error.response?.data?.message || error.message || "Failed to add unavailable date", 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveUnavailable = async (id: number) => {
        setIsLoading(true);
        try {
            await scheduleService.removeUnavailable(id);
            showToast("Unavailable date removed", 'success');
            fetchScheduleData();
        } catch (error: any) {
            showToast(error.response?.data?.message || error.message || "Failed to remove unavailable date", 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Analytics Handlers ---
    const fetchAnalyticsData = async () => {
        setIsLoading(true);
        try {
            const [revRes, partsRes, techRes] = await Promise.all([
                analyticsService.getRevenue({ days: analyticsDays }).catch(() => ({ data: null })),
                analyticsService.getTopParts({ limit: analyticsLimit }).catch(() => ({ data: [] })),
                analyticsService.getTechnicianPerformance().catch(() => ({ data: [] }))
            ]);
            setRevenueData(revRes.data || revRes);
            setTopPartsData(partsRes.data || partsRes || []);
            setTechPerfData(techRes.data || techRes || []);
        } catch (error) {
            console.error("Failed to fetch analytics", error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Upload Handlers ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleDirectUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const res = await utilService.uploadDirect(formData);
            showToast("File uploaded successfully!", 'success');
            setUploadedUrl(res.data?.url || res.url || res.file_url || '');
        } catch (error: any) {
            showToast(error.response?.data?.message || error.message || "Upload failed", 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#0A0A0A] font-sans">
            <DashboardHeader 
                title={t('operations') || "Operations & Analytics"} 
                subtitle="Advanced Scheduling, Intelligence & Utilities"
            />

            <div className="p-8 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20 max-w-7xl mx-auto w-full">
                {/* Premium Navigation Tabs */}
                <div className="flex overflow-x-auto bg-white/70 dark:bg-white/5 backdrop-blur-md p-2.5 rounded-[28px] border border-white/40 dark:border-white/5 shadow-sm gap-3 scrollbar-none">
                    <button
                        onClick={() => setActiveTab('schedule')}
                        className={cn(
                            "flex items-center gap-3 px-7 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap group",
                            activeTab === 'schedule' 
                                ? "bg-primary text-white shadow-xl shadow-primary/30 scale-[1.02]" 
                                : "text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                        )}
                    >
                        <Calendar size={18} className={cn(activeTab === 'schedule' ? "animate-pulse" : "group-hover:scale-110 transition-transform")} />
                        Availability & Scheduling
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={cn(
                            "flex items-center gap-3 px-7 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap group",
                            activeTab === 'analytics' 
                                ? "bg-primary text-white shadow-xl shadow-primary/30 scale-[1.02]" 
                                : "text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                        )}
                    >
                        <BarChart3 size={18} className={cn(activeTab === 'analytics' ? "animate-pulse" : "group-hover:scale-110 transition-transform")} />
                        Analytics Intelligence
                    </button>
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={cn(
                            "flex items-center gap-3 px-7 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap group",
                            activeTab === 'upload' 
                                ? "bg-primary text-white shadow-xl shadow-primary/30 scale-[1.02]" 
                                : "text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                        )}
                    >
                        <UploadCloud size={18} className={cn(activeTab === 'upload' ? "animate-pulse" : "group-hover:scale-110 transition-transform")} />
                        Direct Utilities
                    </button>
                </div>

                {/* ========================================== */}
                {/* TAB 2: SCHEDULING & AVAILABILITY */}
                {/* ========================================== */}
                {activeTab === 'schedule' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-700">
                        {/* Weekly Slots */}
                        <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md p-8 lg:p-12 rounded-[32px] border border-white/40 dark:border-white/5 shadow-sm space-y-8 group hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 relative overflow-hidden">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-12 h-12 bg-gray-50/50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-primary dark:text-accent border border-white dark:border-white/10 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                    <Calendar size={22} />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">Weekly Availability Slots</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Configure recurring working hours</p>
                                </div>
                            </div>

                            {/* Add Slot Form */}
                            <form onSubmit={handleAddSlot} className="bg-gray-50/80 dark:bg-white/5 p-8 rounded-[28px] border border-gray-100 dark:border-white/10 space-y-6 shadow-inner relative z-10">
                                <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                    <Plus size={16} className="text-primary dark:text-accent" /> Add Slot
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Day</label>
                                        <select 
                                            value={slotDay} 
                                            onChange={(e) => setSlotDay(e.target.value)}
                                            className="w-full px-5 py-4 bg-white dark:bg-black border border-gray-100 dark:border-white/10 rounded-2xl text-xs font-black text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 dark:focus:ring-primary/20 transition-all shadow-sm"
                                        >
                                            {daysOfWeek.map((d, i) => (
                                                <option key={i} value={i}>{d}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Open Time</label>
                                        <input 
                                            type="time" 
                                            value={slotOpen} 
                                            onChange={(e) => setSlotOpen(e.target.value)}
                                            required
                                            className="w-full px-5 py-4 bg-white dark:bg-black border border-gray-100 dark:border-white/10 rounded-2xl text-xs font-black text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 dark:focus:ring-primary/20 transition-all shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Close Time</label>
                                        <input 
                                            type="time" 
                                            value={slotClose} 
                                            onChange={(e) => setSlotClose(e.target.value)}
                                            required
                                            className="w-full px-5 py-4 bg-white dark:bg-black border border-gray-100 dark:border-white/10 rounded-2xl text-xs font-black text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 dark:focus:ring-primary/20 transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 items-center">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Max Concurrent Jobs</label>
                                        <input 
                                            type="number" 
                                            value={slotMaxJobs} 
                                            onChange={(e) => setSlotMaxJobs(e.target.value)}
                                            min="1" 
                                            required
                                            className="w-full px-5 py-4 bg-white dark:bg-black border border-gray-100 dark:border-white/10 rounded-2xl text-xs font-black text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 dark:focus:ring-primary/20 transition-all shadow-sm"
                                        />
                                    </div>
                                    <div className="flex items-center gap-4 pt-6 px-2">
                                        <input 
                                            type="checkbox" 
                                            id="slotAvail" 
                                            checked={slotAvailable} 
                                            onChange={(e) => setSlotAvailable(e.target.checked)}
                                            className="w-5 h-5 text-primary rounded-lg border-gray-300 focus:ring-primary transition-all shadow-sm"
                                        />
                                        <label htmlFor="slotAvail" className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest cursor-pointer">Is Available</label>
                                    </div>
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="w-full py-4 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-primary/20 active:scale-95 flex items-center justify-center gap-2 mt-6"
                                >
                                    <Plus size={18} /> Add Slot
                                </button>
                            </form>

                            {/* Slots List */}
                            <div className="space-y-4 relative z-10">
                                {availabilitySlots.length > 0 ? (
                                    <div className="divide-y divide-gray-100 dark:divide-white/5 border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden shadow-inner bg-gray-50/50 dark:bg-white/[0.02]">
                                        {availabilitySlots.map((slot: any) => (
                                            <div key={slot.id} className="p-5 flex items-center justify-between gap-4 hover:bg-white dark:hover:bg-white/5 transition-all duration-300 group/slot">
                                                <div>
                                                    <p className="text-base font-black text-gray-900 dark:text-white group-hover/slot:text-primary transition-colors">{daysOfWeek[slot.day_of_week]}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                        {slot.open_time} - {slot.close_time} • Max Jobs: {slot.max_concurrent_jobs}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <span className={cn(
                                                        "px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                                        slot.is_available ? "bg-green-100 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30" : "bg-red-100 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30"
                                                    )}>
                                                        {slot.is_available ? 'Available' : 'Unavailable'}
                                                    </span>
                                                    <button 
                                                        onClick={() => handleRemoveSlot(slot.id)} 
                                                        disabled={isLoading}
                                                        className="p-3 bg-gray-100 dark:bg-white/5 rounded-xl text-gray-400 hover:text-white hover:bg-red-500 transition-all active:scale-90 shadow-sm"
                                                        title="Remove Slot"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl bg-gray-50/50 dark:bg-white/[0.02]">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No availability slots configured.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Unavailable Dates */}
                        <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md p-8 lg:p-12 rounded-[32px] border border-white/40 dark:border-white/5 shadow-sm space-y-8 group hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 relative overflow-hidden">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-12 h-12 bg-gray-50/50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-primary dark:text-accent border border-white dark:border-white/10 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                    <Clock size={22} />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">Unavailable Dates</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Manage closures and holidays</p>
                                </div>
                            </div>

                            {/* Add Unavailable Form */}
                            <form onSubmit={handleAddUnavailable} className="bg-gray-50/80 dark:bg-white/5 p-8 rounded-[28px] border border-gray-100 dark:border-white/10 space-y-6 shadow-inner relative z-10">
                                <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                    <Plus size={16} className="text-primary dark:text-accent" /> Add Closure Date
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Date</label>
                                        <input 
                                            type="date" 
                                            value={unavailDate} 
                                            onChange={(e) => setUnavailDate(e.target.value)}
                                            required
                                            className="w-full px-5 py-4 bg-white dark:bg-black border border-gray-100 dark:border-white/10 rounded-2xl text-xs font-black text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 dark:focus:ring-primary/20 transition-all shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Reason</label>
                                        <input 
                                            type="text" 
                                            value={unavailReason} 
                                            onChange={(e) => setUnavailReason(e.target.value)}
                                            placeholder="e.g. Public Holiday" 
                                            required
                                            className="w-full px-5 py-4 bg-white dark:bg-black border border-gray-100 dark:border-white/10 rounded-2xl text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 dark:focus:ring-primary/20 transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="w-full py-4 bg-gray-900 dark:bg-accent text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black dark:hover:bg-accent/80 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 mt-6"
                                >
                                    <Plus size={18} /> Add Unavailable Date
                                </button>
                            </form>

                            {/* Unavailable List */}
                            <div className="space-y-4 relative z-10">
                                {unavailableDates.length > 0 ? (
                                    <div className="divide-y divide-gray-100 dark:divide-white/5 border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden shadow-inner bg-gray-50/50 dark:bg-white/[0.02]">
                                        {unavailableDates.map((item: any) => (
                                            <div key={item.id} className="p-5 flex items-center justify-between gap-4 hover:bg-white dark:hover:bg-white/5 transition-all duration-300 group/unavail">
                                                <div>
                                                    <p className="text-base font-black text-gray-900 dark:text-white group-hover/unavail:text-primary transition-colors">{item.date}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{item.reason}</p>
                                                </div>
                                                <button 
                                                    onClick={() => handleRemoveUnavailable(item.id)} 
                                                    disabled={isLoading}
                                                    className="p-3 bg-gray-100 dark:bg-white/5 rounded-xl text-gray-400 hover:text-white hover:bg-red-500 transition-all active:scale-90 shadow-sm"
                                                    title="Remove Date"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl bg-gray-50/50 dark:bg-white/[0.02]">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No unavailable dates configured.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================== */}
                {/* TAB 3: ANALYTICS INTELLIGENCE */}
                {/* ========================================== */}
                {activeTab === 'analytics' && (
                    <div className="space-y-8 animate-in fade-in duration-700">
                        {/* Filter Bar */}
                        <div className="flex flex-wrap gap-6 items-center justify-between bg-white/70 dark:bg-white/5 backdrop-blur-md p-8 rounded-[32px] border border-white/40 dark:border-white/5 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 dark:bg-accent/10 rounded-2xl flex items-center justify-center text-primary dark:text-accent border border-primary/20 shadow-inner animate-pulse">
                                    <BarChart3 size={24} />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">Intelligence Filters</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Customize timeframe and leaderboard limits</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-6">
                                <div className="flex items-center gap-3 bg-gray-50 dark:bg-black/50 px-5 py-3.5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-inner">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Timeframe:</label>
                                    <select 
                                        value={analyticsDays} 
                                        onChange={(e) => setAnalyticsDays(Number(e.target.value))}
                                        className="bg-transparent text-xs font-black text-gray-900 dark:text-white focus:outline-none cursor-pointer"
                                    >
                                        <option value={7} className="bg-white dark:bg-[#0A0A0A]">Last 7 Days</option>
                                        <option value={30} className="bg-white dark:bg-[#0A0A0A]">Last 30 Days</option>
                                        <option value={90} className="bg-white dark:bg-[#0A0A0A]">Last 90 Days</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-3 bg-gray-50 dark:bg-black/50 px-5 py-3.5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-inner">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Top Parts Limit:</label>
                                    <select 
                                        value={analyticsLimit} 
                                        onChange={(e) => setAnalyticsLimit(Number(e.target.value))}
                                        className="bg-transparent text-xs font-black text-gray-900 dark:text-white focus:outline-none cursor-pointer"
                                    >
                                        <option value={5} className="bg-white dark:bg-[#0A0A0A]">Top 5</option>
                                        <option value={10} className="bg-white dark:bg-[#0A0A0A]">Top 10</option>
                                        <option value={20} className="bg-white dark:bg-[#0A0A0A]">Top 20</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Revenue Breakdown */}
                        <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md p-8 lg:p-12 rounded-[32px] border border-white/40 dark:border-white/5 shadow-sm space-y-8 group hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 relative overflow-hidden">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10 border-b border-gray-100 dark:border-white/10 pb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-50/50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-primary dark:text-accent border border-white dark:border-white/10 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                        <DollarSign size={22} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">Revenue Breakdown ({analyticsDays} Days)</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Total revenue trends and logged income</p>
                                    </div>
                                </div>
                                <div className="text-right bg-white/50 dark:bg-white/5 px-6 py-4 rounded-2xl border border-gray-100 dark:border-white/10 shadow-inner backdrop-blur-md">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Period Revenue</p>
                                    <p className="text-3xl font-black text-primary dark:text-accent">
                                        {(revenueData?.total_revenue || revenueData?.revenue_data?.reduce((a:any,b:any)=>a+(b.amount||b.total||0),0) || 0).toLocaleString()} ETB
                                    </p>
                                </div>
                            </div>

                            {/* Visual Bars */}
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-5 pt-4 relative z-10">
                                {(revenueData?.revenue_data || []).map((item: any, i: number) => (
                                    <div key={i} className="bg-white/80 dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 flex flex-col items-center justify-center text-center group/bar hover:border-primary dark:hover:border-accent hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 shadow-sm">
                                        <div className="w-10 h-10 bg-primary/5 dark:bg-accent/10 rounded-2xl flex items-center justify-center text-primary dark:text-accent mb-4 group-hover/bar:scale-110 group-hover/bar:rotate-12 transition-all duration-500 border border-primary/10">
                                            <DollarSign size={18} />
                                        </div>
                                        <span className="text-base font-black text-gray-900 dark:text-white group-hover/bar:text-primary dark:group-hover/bar:text-accent transition-colors">{(item.amount || item.total || 0).toLocaleString()} ETB</span>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1.5">{item.day || item.date}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Parts & Technician Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Top Parts */}
                            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md p-8 lg:p-12 rounded-[32px] border border-white/40 dark:border-white/5 shadow-sm space-y-8 group hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 relative overflow-hidden">
                                <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-12 h-12 bg-gray-50/50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-primary dark:text-accent border border-white dark:border-white/10 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                        <Package size={22} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">Top Selling Parts</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Most frequently utilized inventory items</p>
                                    </div>
                                </div>
                                <div className="space-y-4 relative z-10">
                                    {topPartsData.length > 0 ? (
                                        <div className="divide-y divide-gray-100 dark:divide-white/5 border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden shadow-inner bg-gray-50/50 dark:bg-white/[0.02]">
                                            {topPartsData.map((part: any, i: number) => (
                                                <div key={i} className="p-5 flex items-center justify-between gap-4 hover:bg-white dark:hover:bg-white/5 transition-all duration-300 group/part">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-10 h-10 bg-primary/10 dark:bg-accent/10 rounded-2xl flex items-center justify-center font-black text-primary dark:text-accent text-sm border border-primary/20 shadow-sm group-hover/part:scale-110 transition-transform">
                                                            #{i + 1}
                                                        </div>
                                                        <div>
                                                            <p className="text-base font-black text-gray-900 dark:text-white group-hover/part:text-primary transition-colors">{part.name || part.part_name}</p>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Quantity Sold: {part.quantity || part.count}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-base font-black text-gray-900 dark:text-white bg-white dark:bg-white/5 px-4 py-2 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm">
                                                        {(part.revenue || part.total_amount || 0).toLocaleString()} ETB
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-12 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl bg-gray-50/50 dark:bg-white/[0.02]">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No top parts data available.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Technician Performance */}
                            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md p-8 lg:p-12 rounded-[32px] border border-white/40 dark:border-white/5 shadow-sm space-y-8 group hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 relative overflow-hidden">
                                <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-12 h-12 bg-gray-50/50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-primary dark:text-accent border border-white dark:border-white/10 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                        <Users size={22} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">Technician Performance</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Efficiency, ratings, and completion metrics</p>
                                    </div>
                                </div>
                                <div className="space-y-4 relative z-10">
                                    {techPerfData.length > 0 ? (
                                        <div className="divide-y divide-gray-100 dark:divide-white/5 border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden shadow-inner bg-gray-50/50 dark:bg-white/[0.02]">
                                            {techPerfData.map((tech: any, i: number) => (
                                                <div key={i} className="p-5 flex items-center justify-between gap-4 hover:bg-white dark:hover:bg-white/5 transition-all duration-300 group/tech">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 bg-gray-100 dark:bg-white/10 rounded-2xl flex items-center justify-center font-black text-gray-900 dark:text-white text-base border border-gray-200 dark:border-white/10 shadow-sm group-hover/tech:scale-110 transition-transform">
                                                            {tech.name ? tech.name.charAt(0).toUpperCase() : 'T'}
                                                        </div>
                                                        <div>
                                                            <p className="text-base font-black text-gray-900 dark:text-white group-hover/tech:text-primary transition-colors">{tech.name || tech.technician_name}</p>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                                Jobs Completed: {tech.jobs_count || tech.completed_jobs} • Avg Time: {tech.avg_completion_time || '35 min'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end gap-1">
                                                        <span className="text-base font-black text-orange-500 flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/20 px-3 py-1 rounded-xl border border-orange-200 dark:border-orange-800/30 shadow-sm">
                                                            ★ {Number(tech.rating || tech.rating_avg || 5.0).toFixed(1)}
                                                        </span>
                                                        <span className="text-[9px] font-black text-green-500 uppercase tracking-widest px-1">Active</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-12 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl bg-gray-50/50 dark:bg-white/[0.02]">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No technician performance data available.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================== */}
                {/* TAB 4: DIRECT FILE UPLOAD */}
                {/* ========================================== */}
                {activeTab === 'upload' && (
                    <div className="max-w-3xl mx-auto bg-white/70 dark:bg-white/5 backdrop-blur-md p-8 lg:p-14 rounded-[32px] border border-white/40 dark:border-white/5 shadow-sm space-y-10 animate-in fade-in duration-700 relative overflow-hidden group/upload">
                        <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover/upload:bg-primary/10 transition-colors"></div>
                        <div className="text-center space-y-3 relative z-10">
                            <div className="w-20 h-20 bg-primary/10 dark:bg-accent/10 rounded-[30px] flex items-center justify-center text-primary dark:text-accent mx-auto mb-6 border border-primary/20 shadow-xl group-hover/upload:scale-110 group-hover/upload:rotate-6 transition-all duration-500">
                                <UploadCloud size={36} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Direct File Upload Utility</h3>
                            <p className="text-xs font-medium text-gray-500 dark:text-white/60 max-w-md mx-auto leading-relaxed">Upload business documents, verification licenses, or spare part images directly to secure S3 storage.</p>
                        </div>

                        <form onSubmit={handleDirectUpload} className="space-y-8 relative z-10">
                            <div className="border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-primary dark:hover:border-accent p-12 rounded-3xl text-center transition-all duration-500 group cursor-pointer relative bg-gray-50/50 dark:bg-white/[0.02] shadow-inner">
                                <input 
                                    type="file" 
                                    onChange={handleFileChange} 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="space-y-4">
                                    <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-primary dark:group-hover:text-accent border border-gray-100 dark:border-white/10 shadow-md mx-auto group-hover:scale-110 transition-all duration-500">
                                        <UploadCloud size={28} />
                                    </div>
                                    <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">
                                        {selectedFile ? selectedFile.name : "Click to select or drag and drop file"}
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Supports PDF, PNG, JPG (Max 10MB)</p>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isUploading || !selectedFile}
                                className={cn(
                                    "w-full py-5 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-95",
                                    (!selectedFile || isUploading) && "opacity-50 cursor-not-allowed shadow-none hover:bg-primary"
                                )}
                            >
                                {isUploading ? <Loader2 size={20} className="animate-spin" /> : <UploadCloud size={20} />}
                                {isUploading ? "Uploading to Cloud Storage..." : "Upload File Directly"}
                            </button>
                        </form>

                        {uploadedUrl && (
                            <div className="bg-green-50 dark:bg-green-950/20 p-8 rounded-3xl border border-green-200 dark:border-green-900/30 space-y-4 animate-in fade-in duration-500 relative z-10 shadow-sm">
                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-black text-xs uppercase tracking-widest">
                                    <CheckCircle size={18} /> File Uploaded Successfully
                                </div>
                                <div className="flex items-center gap-4 bg-white dark:bg-black p-4 rounded-2xl border border-gray-200 dark:border-white/10 shadow-inner">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={uploadedUrl} 
                                        className="w-full bg-transparent text-xs font-mono text-gray-600 dark:text-white/80 focus:outline-none"
                                    />
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(uploadedUrl);
                                            showToast("URL copied to clipboard", 'info');
                                        }}
                                        className="p-3 bg-gray-100 dark:bg-white/10 rounded-xl text-gray-600 dark:text-white hover:bg-primary hover:text-white transition-all active:scale-90 shadow-sm"
                                        title="Copy URL"
                                    >
                                        <Copy size={16} />
                                    </button>
                                    <a 
                                        href={uploadedUrl} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="p-3 bg-gray-100 dark:bg-white/10 rounded-xl text-gray-600 dark:text-white hover:bg-primary hover:text-white transition-all active:scale-90 shadow-sm"
                                        title="Open Link"
                                    >
                                        <ExternalLink size={16} />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
