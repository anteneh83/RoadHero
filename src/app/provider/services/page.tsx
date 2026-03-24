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
    CheckCircle2
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { serviceCatalogService, Service, AddServicePayload, UpdateServicePayload } from '@/services/api.service';

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
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Drawer State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
    const [newName, setNewName] = useState('');
    const [newPrice, setNewPrice] = useState('');

    useEffect(() => {
        fetchServices();
    }, []);

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

    const handleOpenDrawer = (service?: Service) => {
        if (service) {
            setEditingServiceId(service.id);
            setNewName(service.name);
            setNewPrice(service.base_price.toString());
        } else {
            setEditingServiceId(null);
            setNewName('');
            setNewPrice('');
        }
        setIsDrawerOpen(true);
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
            if (editingServiceId) {
                const payload: UpdateServicePayload = {
                    name: newName,
                    base_price: parseFloat(newPrice)
                };
                await serviceCatalogService.update(editingServiceId, payload);
                window.dispatchEvent(new CustomEvent('show-toast', {
                    detail: { message: "Service updated successfully", type: 'success' }
                }));
            } else {
                const payload: AddServicePayload = {
                    name: newName,
                    base_price: parseFloat(newPrice),
                    is_visible: true
                };
                await serviceCatalogService.add(payload);
                window.dispatchEvent(new CustomEvent('show-toast', {
                    detail: { message: "Service added successfully", type: 'success' }
                }));
            }

            setIsDrawerOpen(false);
            setNewName('');
            setNewPrice('');
            setEditingServiceId(null);
            fetchServices();
        } catch (error: any) {
            console.error("[Service Catalog] Save Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: error.response?.data?.message || "Failed to save service", type: 'error' }
            }));
        } finally {
            setIsAdding(false);
        }
    };

    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="relative min-h-screen space-y-8 animate-in fade-in duration-1000 pb-20">
            {/* Overlay for Drawer */}
            {isDrawerOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/20 dark:bg-black/40 backdrop-blur-sm z-[100] transition-all animate-in fade-in duration-300"
                    onClick={() => setIsDrawerOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <div className={cn(
                "flex flex-col gap-8 transition-all duration-500",
                isDrawerOpen ? "pr-[380px] blur-[2px] scale-[0.98]" : "pr-0"
            )}>
                {/* Header Area */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-xl font-black text-[#171717] dark:text-white transition-colors">{t('catalog')}</h1>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">{t('catalog_subtitle')}</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => handleOpenDrawer()}
                            className="bg-white dark:bg-white/5 border-2 border-primary dark:border-primary/40 px-6 py-2.5 rounded-xl text-[10px] font-black text-primary dark:text-white uppercase tracking-widest hover:bg-primary/5 dark:hover:bg-primary/20 transition-all shadow-sm active:scale-95 flex items-center gap-2"
                        >

                            {t('add_custom')}
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
                                                <ShieldCheck size={10} strokeWidth={3} className="animate-pulse" />
                                                <span className="text-[8px] font-black uppercase tracking-widest italic">{t('verified_shop')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-2 bg-primary/5 dark:bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                                        <Settings2 size={16} className="text-primary dark:text-accent" />
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

                                {/* Pricing Display */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('base_rate')}</label>
                                        <div className="flex items-center gap-1.5 text-[9px] font-black text-primary dark:text-accent uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                                            <Wrench size={10} />
                                            {t('click_to_edit')}
                                        </div>
                                    </div>
                                    <div className="relative group/input">
                                        <div className={cn(
                                            "w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-5 py-4 text-xl font-black text-gray-900 dark:text-white transition-all outline-none flex justify-between items-center",
                                            service.is_visible ? "shadow-sm group-hover:border-primary/20" : "bg-gray-50/50 dark:bg-white/[0.02] text-gray-300 dark:text-gray-700"
                                        )}>
                                            <span>{service.base_price.toLocaleString()}</span>
                                            <span className={cn(
                                                "text-[10px] font-black tracking-widest uppercase",
                                                service.is_visible ? "text-gray-300" : "text-gray-200 dark:text-gray-800"
                                            )}>ETB</span>
                                        </div>
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
                    {/* Form Fields */}
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
                            <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Base Price (ETB)</label>
                            <input
                                type="number"
                                value={newPrice}
                                onChange={(e) => setNewPrice(e.target.value)}
                                placeholder="1200.00"
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-gray-600 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
                            />
                        </div>
                    </div>
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
    );
}
