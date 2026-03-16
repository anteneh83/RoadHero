"use client";

import React, { useState } from 'react';
import {
    Plus,
    Wrench,
    Car,
    Zap,
    Fuel,
    Settings2,
    ShieldCheck,
    Bell,
    Search
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const initialServices = [
    { id: 'towing', name: 'Towing Service', icon: Car, price: '2,500.00', visible: true, verified: true },
    { id: 'tire', name: 'Tire Change', icon: Settings2, price: '800.00', visible: true, verified: true },
    { id: 'battery', name: 'Battery Jumpstart', icon: Zap, price: '500.00', visible: true, verified: true },
    { id: 'fuel', name: 'Fuel Delivery', icon: Fuel, price: '400.00', visible: true, verified: true },
    { id: 'tuning', name: 'Performance Tuning', icon: Settings2, price: '--', visible: false, verified: false },
];

export default function ServiceCatalogPage() {
    const { t } = useLanguage();
    const [services, setServices] = useState(initialServices);
    const [searchQuery, setSearchQuery] = useState('');

    const toggleVisibility = (id: string) => {
        setServices(prev => prev.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
    };

    const updatePrice = (id: string, newPrice: string) => {
        setServices(prev => prev.map(s => s.id === id ? { ...s, price: newPrice } : s));
    };

    const handlePriceBlur = (name: string) => {
        window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: `Updated price for ${name}`, type: 'success' }
        }));
    };

    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-xl font-black text-[#171717] dark:text-white transition-colors">{t('catalog')}</h1>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1 uppercase tracking-widest mt-1">{t('catalog_subtitle')}</p>
                </div>

                <div className="flex items-center gap-6">
                    <button
                        onClick={() => {
                            window.dispatchEvent(new CustomEvent('show-toast', {
                                detail: { message: "Custom service added successfully", type: 'success' }
                            }));
                        }}
                        className="bg-white dark:bg-white/5 border-2 border-primary dark:border-primary/40 px-6 py-2.5 rounded-xl text-[10px] font-black text-primary dark:text-white uppercase tracking-widest hover:bg-primary/5 dark:hover:bg-primary/20 transition-all shadow-sm active:scale-95 transition-all"
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
                {filteredServices.map((service) => (
                    <div
                        key={service.id}
                        className={cn(
                            "bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-[32px] border border-white/40 dark:border-white/5 p-8 shadow-sm transition-all duration-700 flex flex-col gap-8 group hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5",
                            !service.visible && "opacity-60 grayscale-[0.8]"
                        )}
                    >
                        {/* Card Header */}
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gray-50/50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-primary dark:text-accent border border-white dark:border-white/10 shadow-xl group-hover:scale-110 group-hover:rotate-[5deg] transition-all duration-500">
                                    <service.icon size={24} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-base font-black text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-accent transition-colors">{service.name}</h3>
                                    {service.verified && (
                                        <div className="flex items-center gap-1.5 bg-primary/5 dark:bg-primary/20 px-2.5 py-1 rounded-full border border-primary/10 dark:border-primary/40 text-primary dark:text-accent w-fit shadow-inner transition-colors">
                                            <ShieldCheck size={10} strokeWidth={3} className="animate-pulse" />
                                            <span className="text-[8px] font-black uppercase tracking-widest italic">{t('verified_shop')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Visibility Toggle */}
                        <div className="flex justify-between items-center py-5 border-y border-gray-50/50 dark:border-white/5 transition-colors">
                            <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('active_status')}</span>
                            <button
                                onClick={() => toggleVisibility(service.id)}
                                className={cn(
                                    "w-12 h-6 rounded-full relative transition-all duration-500 ring-4",
                                    service.visible ? "bg-accent ring-accent/10" : "bg-gray-100 ring-transparent"
                                )}
                            >
                                <div className={cn(
                                    "absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg transition-transform duration-500 ease-out",
                                    service.visible ? "translate-x-7 scale-110" : "translate-x-1"
                                )}></div>
                            </button>
                        </div>

                        {/* Pricing Input */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('base_rate')}</label>
                                <div className="flex items-center gap-1.5 text-[9px] font-black text-primary dark:text-accent uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                                    <Wrench size={10} />
                                    {t('editable')}
                                </div>
                            </div>
                            <div className="relative group/input">
                                <input
                                    type="text"
                                    value={service.price}
                                    onChange={(e) => updatePrice(service.id, e.target.value)}
                                    onBlur={() => handlePriceBlur(service.name)}
                                    disabled={!service.visible}
                                    className={cn(
                                        "w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-5 py-4 text-xl font-black text-gray-900 dark:text-white transition-all outline-none",
                                        service.visible ? "focus:ring-8 focus:ring-primary/5 dark:focus:ring-primary/20 focus:border-primary/20 dark:focus:border-primary/40 shadow-sm" : "bg-gray-50/50 dark:bg-white/[0.02] text-gray-300 dark:text-gray-700 cursor-not-allowed"
                                    )}
                                />
                                <span className={cn(
                                    "absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black tracking-widest uppercase",
                                    service.visible ? "text-gray-300 group-focus-within/input:text-primary transition-colors" : "text-gray-200"
                                )}>ETB</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
