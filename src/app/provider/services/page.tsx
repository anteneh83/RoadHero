"use client";

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Wrench,
    Car,
    Zap,
    Fuel,
    Settings2,
    ShieldCheck,
    Bell,
    Search,
    Loader2,
    X,
    CheckCircle2,
    ChevronRight,
    Settings,
    Trash2,
    Tag
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { serviceCatalogService, ServiceOffer, ServiceCategory } from '@/services/api.service';
import { DashboardHeader } from '@/components/DashboardHeader';
import Link from 'next/link';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Icon mapping based on service name
const getServiceIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('towing')) return Car;
    if (n.includes('tire')) return Settings2;
    if (n.includes('battery') || n.includes('jumpstart')) return Zap;
    if (n.includes('fuel')) return Fuel;
    if (n.includes('electric')) return Zap;
    return Wrench;
};

export default function ServiceCatalogPage() {
    const { t } = useLanguage();
    const [services, setServices] = useState<ServiceOffer[]>([]);
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Drawer State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
    const [newName, setNewName] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        fetchCategories();
        fetchServices();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await serviceCatalogService.listCategories();
            setCategories(response.data || response);
        } catch (error) {
            console.error("[Service Catalog] Category Fetch Error:", error);
        }
    };

    const fetchServices = async () => {
        setIsLoading(true);
        console.log("[Service Catalog] Fetching services...");
        try {
            const response = await serviceCatalogService.list();
            console.log("[Service Catalog] List Response:", response);
            // Handle paginated response structure if present
            const data = response.data || response;
            const servicesList = Array.isArray(data) ? data : (data.results || []);
            setServices(servicesList);
        } catch (error: any) {
            console.error("[Service Catalog] Fetch Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Failed to load services", type: 'error' }
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDrawer = async (service?: ServiceOffer) => {
        setIsDrawerOpen(true);
        if (service) {
            setEditingServiceId(service.id);
            setIsLoadingDetail(true);
            try {
                console.log(`[Service Catalog] Fetching details for ${service.id}...`);
                const response = await serviceCatalogService.get(service.id);
                const detail = response.data || response;
                setNewName(detail.name);
                setNewPrice(detail.base_price.toString());
                setSelectedCategory(detail.category?.toString() || '');
                setIsVisible(detail.is_visible);
            } catch (error) {
                console.error("[Service Catalog] Detail Fetch Error:", error);
                // Fallback to list data if GET fail
                setNewName(service.name);
                setNewPrice(service.base_price.toString());
                setSelectedCategory(service.category?.toString() || '');
                setIsVisible(service.is_visible);
            } finally {
                setIsLoadingDetail(false);
            }
        } else {
            setEditingServiceId(null);
            setNewName('');
            setNewPrice('');
            setSelectedCategory('');
            setIsVisible(true);
            setIsLoadingDetail(false);
        }
    };

    const handleToggleVisibility = async (id: number, currentVisible: boolean) => {
        console.log(`[Service Catalog] Toggling visibility for ${id} to ${!currentVisible}`);
        try {
            await serviceCatalogService.update(id, { is_visible: !currentVisible });
            setServices(prev => prev.map(s => s.id === id ? { ...s, is_visible: !currentVisible } : s));
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: `Service ${currentVisible ? 'hidden' : 'activated'}`, type: 'success' }
            }));
        } catch (error: any) {
            console.error("[Service Catalog] Toggle Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Failed to toggle visibility", type: 'error' }
            }));
        }
    };

    const handlePriceUpdate = async (id: number, price: string, name: string) => {
        const basePrice = parseFloat(price.replace(/,/g, ''));
        if (isNaN(basePrice)) return;

        console.log(`[Service Catalog] Updating price for ${id} to ${basePrice}`);
        try {
            await serviceCatalogService.update(id, { base_price: basePrice });
            setServices(prev => prev.map(s => s.id === id ? { ...s, base_price: basePrice } : s));
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: `Updated price for ${name}`, type: 'success' }
            }));
        } catch (error: any) {
            console.error("[Service Catalog] Price Update Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Failed to update price", type: 'error' }
            }));
            fetchServices();
        }
    };

    const handleSaveService = async () => {
        if (!newName || !newPrice) return;

        setIsAdding(true);
        try {
            const payload: Partial<ServiceOffer> = {
                name: newName,
                base_price: parseFloat(newPrice),
                is_visible: isVisible,
                category: selectedCategory ? Number(selectedCategory) : undefined
            };

            let response;
            if (editingServiceId) {
                console.log("[Service Catalog] Updating Service Payload:", payload);
                response = await serviceCatalogService.update(editingServiceId, payload);
                console.log("[Service Catalog] Update Service Response:", response);
                const updatedService = response.data || response;
                setServices(prev => prev.map(s => s.id === editingServiceId ? { ...s, ...updatedService } : s));
                window.dispatchEvent(new CustomEvent('show-toast', {
                    detail: { message: "Service updated successfully", type: 'success' }
                }));
            } else {
                console.log("[Service Catalog] Creating Service Payload:", payload);
                response = await serviceCatalogService.add(payload);
                console.log("[Service Catalog] Create Service Response:", response);
                const newService = response.data || response;
                setServices(prev => [newService, ...prev]);
                window.dispatchEvent(new CustomEvent('show-toast', {
                    detail: { message: "Service added successfully", type: 'success' }
                }));
            }

            setIsDrawerOpen(false);
            // fetchServices();
        } catch (error: any) {
            console.error("[Service Catalog] Save Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: error.response?.data?.message || "Failed to save service", type: 'error' }
            }));
        } finally {
            setIsAdding(false);
        }
    };

    // Delete Confirmation Modal State
    const [isDeleting, setIsDeleting] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<{ id: number, name: string } | null>(null);

    const handleDeleteService = async (id: number) => {
        setIsDeleting(true);
        try {
            await serviceCatalogService.delete(id);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Service deleted successfully", type: 'success' }
            }));
            setServiceToDelete(null);
            fetchServices();
        } catch (error) {
            console.error("[Service Catalog] Delete Error:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="relative min-h-screen space-y-8 animate-in fade-in duration-1000 pb-20 font-sans">
            {/* Overlay for Drawer & Modals */}
            {(isDrawerOpen || !!serviceToDelete) && (
                <div
                    className="fixed inset-0 bg-gray-900/20 dark:bg-black/40 backdrop-blur-sm z-[100] transition-all animate-in fade-in duration-300"
                    onClick={() => {
                        setIsDrawerOpen(false);
                        setServiceToDelete(null);
                    }}
                />
            )}

            {/* Custom Delete Confirmation Modal */}
            {serviceToDelete && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in zoom-in duration-300">
                    <div className="bg-white/90 dark:bg-[#1A1A1A]/90 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-[40px] p-10 max-w-md w-full shadow-[0_40px_100px_rgba(0,0,0,0.2)] dark:shadow-black/60 relative overflow-hidden group">
                        {/* Ambient Glow */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 blur-[60px] rounded-full group-hover:bg-red-500/20 transition-colors duration-1000" />

                        <div className="relative space-y-8 text-center">
                            <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-[30px] flex items-center justify-center mx-auto shadow-xl shadow-red-500/10 border border-red-100 dark:border-red-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                <Trash2 size={32} className="text-red-500 animate-pulse" />
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">Remove Service?</h3>
                                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-4">
                                    You are about to delete <span className="text-red-500">"{serviceToDelete.name}"</span>. This action is permanent.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={() => handleDeleteService(serviceToDelete.id)}
                                    disabled={isDeleting}
                                    className="w-full py-5 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-red-500/20 hover:bg-red-600 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {isDeleting ? <Loader2 className="animate-spin" size={18} /> : <>Confirm Deletion</>}
                                </button>
                                <button
                                    onClick={() => setServiceToDelete(null)}
                                    className="w-full py-5 bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-gray-100 dark:hover:bg-white/10"
                                >
                                    Back to Catalog
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex flex-col min-h-screen">
                <DashboardHeader
                    title={t('catalog')}
                    subtitle={t('catalog_subtitle')}
                >
                    <button
                        onClick={() => handleOpenDrawer()}
                        className="bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 group"
                    >
                        <Plus size={16} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                        <span>Add New Service</span>
                    </button>
                </DashboardHeader>

                <div className={cn(
                    "p-8 lg:p-12 space-y-8 animate-in fade-in duration-1000 pb-20 transition-all duration-500",
                    isDrawerOpen ? "pr-[380px] blur-[2px] scale-[0.98]" : "pr-0"
                )}>

                    <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-white dark:bg-white/5 p-4 rounded-[28px] border border-gray-100 dark:border-white/5 shadow-sm transition-all duration-700">
                        <p className="text-xs font-medium text-gray-400 max-w-md leading-relaxed ml-2">
                            {t('catalog_description')}
                        </p>
                        <div className="relative w-full md:w-80 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-primary transition-colors" size={16} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('search_services')}
                                className="w-full pl-12 pr-6 py-3 rounded-2xl border border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 outline-none focus:ring-4 focus:ring-primary/5 dark:focus:ring-primary/20 focus:bg-white dark:focus:bg-white/10 transition-all text-xs font-medium dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600"
                            />
                        </div>
                    </div>

                    {/* Services Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {isLoading ? (
                            <div className="col-span-full py-20 flex flex-col items-center gap-4 text-gray-400">
                                <Loader2 className="animate-spin text-primary" size={32} />
                                <p className="text-[10px] font-black uppercase tracking-widest">Loading Catalog...</p>
                            </div>
                        ) : filteredServices.length === 0 ? (
                            <div className="col-span-full py-20 text-center text-gray-400">
                                <p className="text-[10px] font-black uppercase tracking-widest">No services found in your catalog</p>
                            </div>
                        ) : filteredServices.map((service) => {
                            const Icon = getServiceIcon(service.name);
                            return (
                                <div
                                    key={service.id}
                                    onClick={() => handleOpenDrawer(service)}
                                    className={cn(
                                        "bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-[32px] border border-white/40 dark:border-white/5 p-8 shadow-sm transition-all duration-700 flex flex-col gap-8 group hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5 cursor-pointer relative",
                                        !service.is_visible && "opacity-60 grayscale-[0.8]"
                                    )}
                                >
                                    {/* Card Header */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-gray-50/50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-primary dark:text-accent border border-white dark:border-white/10 shadow-xl group-hover:scale-110 group-hover:rotate-[5deg] transition-all duration-500">
                                                <Icon size={24} />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-base font-black text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-accent transition-colors">{service.name}</h3>
                                                <div className="flex items-center gap-1.5 bg-primary/5 dark:bg-primary/20 px-2.5 py-1 rounded-full border border-primary/10 dark:border-primary/40 text-primary dark:text-accent w-fit shadow-inner transition-colors">
                                                    <Tag size={10} strokeWidth={3} />
                                                    <span className="text-[8px] font-black uppercase tracking-widest">
                                                        {categories.find(c => c.id.toString() === service.category?.toString())?.name || 'General'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Visibility Toggle */}
                                    <div className="flex justify-between items-center py-5 border-y border-gray-50/50 dark:border-white/5 transition-colors">
                                        <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('active_status')}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggleVisibility(service.id, service.is_visible);
                                            }}
                                            className={cn(
                                                "w-12 h-6 rounded-full relative transition-all duration-500 ring-4",
                                                service.is_visible ? "bg-accent ring-accent/10" : "bg-gray-100 dark:bg-white/10 ring-transparent"
                                            )}
                                        >
                                            <div className={cn(
                                                "absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg transition-transform duration-500 ease-out",
                                                service.is_visible ? "translate-x-7 scale-110" : "translate-x-1"
                                            )}></div>
                                        </button>
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="flex-1 flex justify-between items-center px-6 py-5 bg-white/70 dark:bg-[#0A0A0A]/50 backdrop-blur-md rounded-3xl mt-4 border border-white/50 dark:border-white/5 mx-2 group-hover:bg-white dark:group-hover:bg-white/5 transition-all duration-500">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Base Rate</span>
                                            <span className="text-[13px] font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors">{service.base_price} ETB</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenDrawer(service);
                                                }}
                                                className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl text-gray-400 hover:text-primary transition-all group/edit"
                                                title="Quick Edit"
                                            >
                                                <Settings2 size={14} className="group-hover/edit:rotate-90 transition-transform duration-500" />
                                            </button>
                                            <Link
                                                href={`/provider/services/${service.id}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-3 bg-primary/5 rounded-xl text-primary hover:bg-primary hover:text-white transition-all shadow-lg active:scale-95 group/btn"
                                                title="View Full Details"
                                            >
                                                <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Sliding Drawer */}
                <div className={cn(
                    "fixed top-0 right-0 h-full w-[380px] bg-white dark:bg-[#0A0A0A] shadow-[-20px_0_80px_rgba(0,0,0,0.1)] z-[150] transition-all duration-500 ease-out transform p-10 flex flex-col gap-10",
                    isDrawerOpen ? "translate-x-0" : "translate-x-full"
                )}>
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                                {editingServiceId ? t('update_service') : t('add_custom')}
                            </h2>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">catalog offering</p>
                        </div>
                        <button
                            onClick={() => setIsDrawerOpen(false)}
                            className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all active:scale-90"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 space-y-10 overflow-y-auto pr-4 custom-scrollbar">
                        {isLoadingDetail ? (
                            <div className="h-full flex flex-col items-center justify-center gap-4 text-gray-400">
                                <Loader2 className="animate-spin text-primary" size={32} />
                                <p className="text-[10px] font-black uppercase tracking-widest">Fetching Details...</p>
                            </div>
                        ) : (
                            /* Form Fields */
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Service Name</label>
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="e.g. Engine Oil Change"
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-gray-600 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Category</label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-gray-600 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-inner appearance-none"
                                    >
                                        <option value="" className="bg-white dark:bg-[#0A0A0A]">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id} className="bg-white dark:bg-[#0A0A0A]">{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Base Price (ETB)</label>
                                    <input
                                        type="number"
                                        value={newPrice}
                                        onChange={(e) => setNewPrice(e.target.value)}
                                        placeholder="1200.00"
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-gray-600 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
                                    />
                                </div>

                                <div className="flex justify-between items-center px-2">
                                    <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Visible to Drivers</label>
                                    <button
                                        onClick={() => setIsVisible(!isVisible)}
                                        className={cn(
                                            "w-12 h-6 rounded-full relative transition-all duration-500 ring-4",
                                            isVisible ? "bg-accent ring-accent/10" : "bg-gray-100 dark:bg-white/10 ring-transparent"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg transition-transform duration-500 ease-out",
                                            isVisible ? "translate-x-7 scale-110" : "translate-x-1"
                                        )}></div>
                                    </button>
                                </div>

                                {editingServiceId && (
                                    <button
                                        onClick={() => setServiceToDelete({ id: editingServiceId, name: newName })}
                                        className="w-full py-4 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-500/5 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={14} />
                                        Remove Service
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleSaveService}
                        disabled={!newName || !newPrice || isAdding}
                        className="w-full py-5 bg-primary rounded-2xl text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {isAdding ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <>
                                <CheckCircle2 size={18} />
                                {editingServiceId ? t('update_service') : t('save_service')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
