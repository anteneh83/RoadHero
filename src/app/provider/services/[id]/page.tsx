"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ChevronLeft,
    Settings,
    Eye,
    EyeOff,
    Trash2,
    Loader2,
    Save,
    Tag,
    DollarSign,
    Info
} from 'lucide-react';
import { serviceCatalogService, ServiceOffer, ServiceCategory } from '@/services/api.service';
import { useLanguage } from '@/hooks/useLanguage';
import { DashboardHeader } from '@/components/DashboardHeader';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function ServiceDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { t } = useLanguage();

    // State
    const [service, setService] = useState<ServiceOffer | null>(null);
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form State (for editing)
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        fetchInitialData();
    }, [id]);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const [serviceRes, categoriesRes] = await Promise.all([
                serviceCatalogService.get(Number(id)),
                serviceCatalogService.listCategories()
            ]);

            const serviceData = serviceRes.data || serviceRes;
            setService(serviceData);
            setName(serviceData.name);
            setPrice(serviceData.base_price.toString());
            setCategory(serviceData.category?.toString() || '');
            setIsVisible(serviceData.is_visible);

            setCategories(categoriesRes.data || categoriesRes);
        } catch (error) {
            console.error("[Service Detail] Fetch Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Failed to load service details", type: 'error' }
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!name || !price) return;
        setIsSaving(true);
        try {
            const payload = {
                name,
                base_price: parseFloat(price),
                is_visible: isVisible,
                category: category ? Number(category) : undefined
            };
            console.log("[Service Detail] Updating Service Payload:", payload);
            const response = await serviceCatalogService.update(Number(id), payload);
            console.log("[Service Detail] Update Service Response:", response);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Service updated successfully", type: 'success' }
            }));
            fetchInitialData();
        } catch (error) {
            console.error("[Service Detail] Save Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Failed to update service", type: 'error' }
            }));
        } finally {
            setIsSaving(false);
        }
    };

    // Delete Confirmation Modal State
    const [isDeletingData, setIsDeletingData] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDelete = async () => {
        setIsDeletingData(true);
        try {
            await serviceCatalogService.delete(Number(id));
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Service removed from catalog", type: 'success' }
            }));
            setShowDeleteConfirm(false);
            router.push('/provider/services');
        } catch (error) {
            console.error("[Service Detail] Delete Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Failed to delete service", type: 'error' }
            }));
        } finally {
            setIsDeletingData(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col">
                <DashboardHeader title="Service Details" />
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-primary" size={40} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading details...</p>
                </div>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="min-h-screen flex flex-col">
                <DashboardHeader title="Service Not Found" />
                <div className="flex-1 flex flex-col items-center justify-center gap-6">
                    <p className="text-gray-400">The service you're looking for doesn't exist.</p>
                    <button onClick={() => router.push('/provider/services')} className="text-primary font-black uppercase tracking-widest text-[10px]">Back to Catalog</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col gap-8 pb-20 font-sans relative">
            {/* Overlay for Modals */}
            {showDeleteConfirm && (
                <div
                    className="fixed inset-0 bg-gray-900/20 dark:bg-black/40 backdrop-blur-sm z-[100] transition-all animate-in fade-in duration-300"
                    onClick={() => setShowDeleteConfirm(false)}
                />
            )}

            {/* Custom Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in zoom-in duration-300">
                    <div className="bg-white/90 dark:bg-[#1A1A1A]/90 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-[40px] p-10 max-w-md w-full shadow-[0_40px_100px_rgba(0,0,0,0.2)] dark:shadow-black/60 relative overflow-hidden group">
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 blur-[60px] rounded-full group-hover:bg-red-500/20 transition-colors duration-1000" />

                        <div className="relative space-y-8 text-center">
                            <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-[30px] flex items-center justify-center mx-auto shadow-xl shadow-red-500/10 border border-red-100 dark:border-red-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                <Trash2 size={32} className="text-red-500 animate-pulse" />
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">Remove Service?</h3>
                                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-4">
                                    You are about to delete <span className="text-red-500">"{service.name}"</span>. This action is permanent.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeletingData}
                                    className="w-full py-5 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-red-500/20 hover:bg-red-600 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {isDeletingData ? <Loader2 className="animate-spin" size={18} /> : <>Confirm Deletion</>}
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="w-full py-5 bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-gray-100 dark:hover:bg-white/10"
                                >
                                    Keep Service
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <DashboardHeader
                title={service.name}
                subtitle={`Service ID: #${service.id}`}
            >
                <button
                    onClick={() => router.push('/provider/services')}
                    className="flex items-center gap-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <ChevronLeft size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
                </button>
            </DashboardHeader>

            <div className="px-8 lg:px-12 max-w-5xl mx-auto w-full space-y-10 animate-in fade-in duration-700">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-[40px] p-10 border border-white/40 dark:border-white/5 shadow-2xl shadow-black/5 space-y-10">
                            <div className="flex items-center gap-4 text-primary bg-primary/5 w-fit px-6 py-2 rounded-2xl">
                                <Settings size={20} />
                                <h3 className="text-xs font-black uppercase tracking-widest">General Configuration</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Service Name</label>
                                    <div className="relative group">
                                        <Info className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={16} />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Base Rate (ETB)</label>
                                    <div className="relative group">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={16} />
                                        <input
                                            type="number"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3 md:col-span-2">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Service Category</label>
                                    <div className="relative group">
                                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={16} />
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl pl-12 pr-12 py-4 text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none"
                                        >
                                            <option value="">No Category Assigned</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Status */}
                    <div className="space-y-8">
                        <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-[40px] p-8 border border-white/40 dark:border-white/5 shadow-2xl shadow-black/5 space-y-8">
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest transition-colors">Market Visibility</p>
                                        <p className="text-[8px] font-medium text-gray-400 uppercase tracking-widest">Visibility to drivers</p>
                                    </div>
                                    <button
                                        onClick={() => setIsVisible(!isVisible)}
                                        className={cn(
                                            "w-12 h-6 rounded-full relative transition-all duration-500",
                                            isVisible ? "bg-accent shadow-lg shadow-accent/20" : "bg-gray-100 dark:bg-white/10"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-500",
                                            isVisible ? "translate-x-7" : "translate-x-1"
                                        )}></div>
                                    </button>
                                </div>

                                <div className={cn(
                                    "p-4 rounded-2xl border flex items-center gap-4 transition-all duration-500",
                                    isVisible ? "bg-green-50/50 dark:bg-green-500/5 border-green-100 dark:border-green-500/10 text-green-600" : "bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-400"
                                )}>
                                    {isVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                        {isVisible ? "Active in Market" : "Hidden from Market"}
                                    </span>
                                </div>
                            </div>

                            <hr className="border-gray-100 dark:border-white/5" />

                            <div className="space-y-4">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="w-full py-4 bg-primary text-white rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Save Changes</>}
                                </button>

                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="w-full py-4 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500/5 transition-all"
                                >
                                    <Trash2 size={16} /> Remove Service
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
