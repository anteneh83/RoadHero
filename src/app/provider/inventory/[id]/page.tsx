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
    Info,
    ArrowDownCircle,
    Package,
    X,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { inventoryService, InventoryItem } from '@/services/api.service';
import { useLanguage } from '@/hooks/useLanguage';
import { DashboardHeader } from '@/components/DashboardHeader';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Link from 'next/link';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function InventoryDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { t } = useLanguage();

    // State
    const [item, setItem] = useState<InventoryItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form State (for editing)
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [lowStockThreshold, setLowStockThreshold] = useState('');
    const [description, setDescription] = useState('');

    // Deduct Form State
    const [deductQuantity, setDeductQuantity] = useState('1');
    const [isDeducting, setIsDeducting] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, [id]);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const response = await inventoryService.get(Number(id));
            const itemData = response.data || response;
            setItem(itemData);
            setName(itemData.name);
            setPrice(itemData.price?.toString() || '');
            setQuantity(itemData.quantity?.toString() || '');
            setLowStockThreshold(itemData.low_stock_threshold?.toString() || '0');
            setDescription(itemData.description || '');
        } catch (error) {
            console.error("[Inventory Detail] Fetch Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Failed to load inventory details", type: 'error' }
            }));
            router.push('/provider/inventory');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!name || !price || !quantity) return;
        setIsSaving(true);
        try {
            const payload = {
                name,
                price: parseFloat(price),
                quantity: parseInt(quantity),
                low_stock_threshold: parseInt(lowStockThreshold),
                description
            };
            await inventoryService.update(Number(id), payload);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Inventory updated successfully", type: 'success' }
            }));
            fetchInitialData();
        } catch (error) {
            console.error("[Inventory Detail] Save Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Failed to update inventory", type: 'error' }
            }));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeductStock = async () => {
        if (!deductQuantity || parseInt(deductQuantity) <= 0) return;
        setIsDeducting(true);
        try {
            await inventoryService.deduct(Number(id), { quantity: parseInt(deductQuantity) });
            setDeductQuantity('1');
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Stock deducted successfully", type: 'success' }
            }));
            fetchInitialData();
        } catch (error: any) {
            console.error("[Inventory Detail] Deduct Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: error.response?.data?.message || "Failed to deduct stock", type: 'error' }
            }));
        } finally {
            setIsDeducting(false);
        }
    };

    // Delete Confirmation Modal State
    const [isDeletingData, setIsDeletingData] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDelete = async () => {
        setIsDeletingData(true);
        try {
            await inventoryService.delete(Number(id));
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Item deleted successfully", type: 'success' }
            }));
            router.push('/provider/inventory');
        } catch (error) {
            console.error("[Inventory Detail] Delete Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Failed to delete item", type: 'error' }
            }));
        } finally {
            setIsDeletingData(false);
            setShowDeleteConfirm(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-primary" size={32} />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading details...</p>
                </div>
            </div>
        );
    }

    if (!item) return null;

    const isLowStock = item.quantity <= item.low_stock_threshold;

    return (
        <div className="relative min-h-screen flex flex-col gap-8 animate-in fade-in duration-1000 pb-20 font-sans">
            {showDeleteConfirm && (
                <div
                    className="fixed inset-0 bg-gray-900/20 dark:bg-black/40 backdrop-blur-sm z-[100] transition-all animate-in fade-in duration-300"
                    onClick={() => setShowDeleteConfirm(false)}
                />
            )}

            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in zoom-in duration-300">
                    <div className="bg-white/90 dark:bg-[#1A1A1A]/90 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-[40px] p-10 max-w-md w-full shadow-[0_40px_100px_rgba(0,0,0,0.2)] dark:shadow-black/60 relative overflow-hidden group">
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 blur-[60px] rounded-full group-hover:bg-red-500/20 transition-colors duration-1000" />

                        <div className="relative space-y-8 text-center">
                            <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-[30px] flex items-center justify-center mx-auto shadow-xl shadow-red-500/10 border border-red-100 dark:border-red-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                <Trash2 size={32} className="text-red-500 animate-pulse" />
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">Delete Item?</h3>
                                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-4">
                                    You are about to delete <span className="text-red-500">"{item.name}"</span>. This action cannot be undone.
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
                                    Keep Item
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={cn(
                "flex flex-col min-h-screen transition-all duration-500",
                showDeleteConfirm ? "blur-[2px] scale-[0.98]" : ""
            )}>
                <DashboardHeader
                    title={name || "Part Details"}
                    subtitle="Manage Inventory Item"
                >
                    <Link
                        href="/provider/inventory"
                        className="px-6 py-3 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-gray-900 dark:text-white text-xs font-black uppercase tracking-widest rounded-2xl backdrop-blur-md transition-all flex items-center gap-2 border border-gray-100 dark:border-white/5"
                    >
                        <ChevronLeft size={16} />
                        {t('back')}
                    </Link>
                </DashboardHeader>

                <div className="p-8 lg:p-12 space-y-8 max-w-7xl mx-auto w-full">
                    {/* Status Highlights */}
                    <div className="flex flex-wrap gap-4">
                        <div className={cn(
                            "px-6 py-3 rounded-2xl border flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] shadow-sm",
                            isLowStock
                                ? "bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400"
                                : "bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-500/20 text-green-600 dark:text-green-400"
                        )}>
                            {isLowStock ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                            {isLowStock ? t('low_stock') : t('in_stock')}
                            <span className="opacity-50 mx-2">|</span>
                            {item.quantity} UNITS
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                        {/* Details Editor */}
                        <div className="xl:col-span-2 space-y-8 text-left">
                            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-[40px] border border-white/40 dark:border-white/5 shadow-2xl shadow-black/5 overflow-hidden group">
                                <div className="p-8 lg:p-10 border-b border-gray-50 dark:border-white/5 flex items-center gap-6">
                                    <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-primary">
                                        <Info size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900 dark:text-white">Part Information</h2>
                                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Update part details and pricing</p>
                                    </div>
                                </div>
                                <div className="p-8 lg:p-10 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Part Name</label>
                                            <div className="relative group/input">
                                                <Package className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-primary transition-colors" size={16} />
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl pl-14 pr-6 py-5 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('amount_etb')}</label>
                                            <div className="relative group/input">
                                                <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-primary transition-colors" size={16} />
                                                <input
                                                    type="number"
                                                    value={price}
                                                    onChange={(e) => setPrice(e.target.value)}
                                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl pl-14 pr-6 py-5 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Total Quantity</label>
                                            <input
                                                type="number"
                                                value={quantity}
                                                onChange={(e) => setQuantity(e.target.value)}
                                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl px-6 py-5 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Low Stock Alert Level</label>
                                            <input
                                                type="number"
                                                value={lowStockThreshold}
                                                onChange={(e) => setLowStockThreshold(e.target.value)}
                                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl px-6 py-5 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Description</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl px-6 py-5 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-inner min-h-[120px] resize-none"
                                        />
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving || !name || !price || !quantity}
                                            className="min-w-[200px] py-5 bg-primary rounded-2xl text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                        >
                                            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <>
                                                <Save size={18} />
                                                Save Changes
                                            </>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Deduct Stock & Danger Zone */}
                        <div className="space-y-8">
                            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-[40px] border border-white/40 dark:border-white/5 shadow-2xl shadow-black/5 overflow-hidden text-left">
                                <div className="p-8 border-b border-gray-50 dark:border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                                            <ArrowDownCircle size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900 dark:text-white">{t('deduct_stock')}</h3>
                                            <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Remove units from warehouse</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('quantity_to_remove')}</label>
                                        <input
                                            type="number"
                                            value={deductQuantity}
                                            onChange={(e) => setDeductQuantity(e.target.value)}
                                            min="1"
                                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-accent/10 transition-all shadow-inner"
                                        />
                                    </div>
                                    <button
                                        onClick={handleDeductStock}
                                        disabled={isDeducting || !deductQuantity || parseInt(deductQuantity) <= 0 || parseInt(deductQuantity) > item.quantity}
                                        className="w-full py-4 bg-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-accent/20 hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {isDeducting ? <Loader2 className="animate-spin" size={16} /> : <>
                                            <ArrowDownCircle size={16} />
                                            {t('confirm_deduction')}
                                        </>}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-red-50/50 dark:bg-red-500/5 backdrop-blur-md rounded-[40px] border border-red-100/50 dark:border-red-500/10 overflow-hidden text-left">
                                <div className="p-8">
                                    <h3 className="text-sm font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-2">Danger Zone</h3>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-6">Once deleted, this inventory item will no longer be available. This action is permanent.</p>

                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="w-full py-4 bg-white dark:bg-white/5 border border-red-100 dark:border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={16} />
                                        Delete Part
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
