"use client";

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Bell,
    Settings2,
    Package,
    AlertCircle,
    ArrowDownCircle,
    MoreVertical,
    Edit2,
    Trash2,
    Search as SearchIcon,
    Loader2,
    X,
    CheckCircle2
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { inventoryService, InventoryItem, AddInventoryPayload, UpdateInventoryPayload } from '@/services/api.service';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function InventoryPage() {
    const { t } = useLanguage();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeducting, setIsDeducting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    // Drawer State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [lowStockThreshold, setLowStockThreshold] = useState('5');
    const [description, setDescription] = useState('');

    // Deduct Modal State
    const [isDeductModalOpen, setIsDeductModalOpen] = useState(false);
    const [deductItemId, setDeductItemId] = useState<number | null>(null);
    const [deductQuantity, setDeductQuantity] = useState('1');

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        setIsLoading(true);
        console.log("[Inventory] Fetching items...");
        try {
            const response = await inventoryService.list();
            console.log("[Inventory] List Response:", response);
            // Handle paginated response structure from API
            const data = response.data || response;
            const itemsList = Array.isArray(data) ? data : (data.results || []);
            setItems(itemsList);
        } catch (error: any) {
            console.error("[Inventory] Fetch Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Failed to load inventory", type: 'error' }
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDrawer = (item: InventoryItem | null = null) => {
        if (item) {
            setEditingItem(item);
            setName(item.name);
            setPrice(item.price.toString());
            setQuantity(item.quantity.toString());
            setLowStockThreshold(item.low_stock_threshold?.toString() || '5');
            setDescription(item.description || '');
        } else {
            setEditingItem(null);
            setName('');
            setPrice('');
            setQuantity('');
            setLowStockThreshold('5');
            setDescription('');
        }
        setIsDrawerOpen(true);
    };

    const handleSaveItem = async () => {
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

            if (editingItem) {
                console.log("[Inventory] Updating item:", editingItem.id, payload);
                await inventoryService.update(editingItem.id, payload);
            } else {
                console.log("[Inventory] Adding new item:", payload);
                await inventoryService.add(payload);
            }

            setIsDrawerOpen(false);
            fetchInventory();
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: `Item ${editingItem ? 'updated' : 'added'} successfully`, type: 'success' }
            }));
        } catch (error: any) {
            console.error("[Inventory] Save Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: error.response?.data?.message || "Failed to save item", type: 'error' }
            }));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeductStock = async () => {
        if (!deductItemId || !deductQuantity) return;

        setIsDeducting(true);
        try {
            await inventoryService.deduct(deductItemId, { quantity: parseInt(deductQuantity) });
            setIsDeductModalOpen(false);
            setDeductQuantity('1');
            fetchInventory();
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Stock deducted successfully", type: 'success' }
            }));
        } catch (error: any) {
            console.error("[Inventory] Deduct Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: error.response?.data?.message || "Failed to deduct stock", type: 'error' }
            }));
        } finally {
            setIsDeducting(false);
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        const isLowStock = item.quantity <= item.low_stock_threshold;
        const matchesFilter = activeFilter === 'All' || (activeFilter === 'Low Stock' && isLowStock);
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="relative min-h-screen flex flex-col gap-8 animate-in fade-in duration-1000 pb-20">
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
                        <h1 className="text-xl font-black text-[#171717] dark:text-white transition-colors">{t('inventory')}</h1>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">{t('inventory_subtitle')}</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => handleOpenDrawer()}
                            className="bg-white dark:bg-white/5 border-2 border-primary dark:border-primary/40 px-6 py-2.5 rounded-xl text-[10px] font-black text-primary dark:text-white uppercase tracking-widest hover:bg-primary/5 dark:hover:bg-primary/20 transition-all shadow-sm active:scale-95 transition-all flex items-center gap-2"
                        >
                            <Plus size={14} strokeWidth={3} />
                            {t('add_part')}
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

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden group focus-within:ring-4 focus-within:ring-primary/5 dark:focus-within:ring-primary/20 transition-all">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-primary transition-colors" size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('search_inventory')}
                            className="w-full pl-14 pr-6 py-4 text-xs font-medium outline-none text-gray-900 dark:text-white bg-transparent placeholder:text-gray-300 dark:placeholder:text-gray-600"
                        />
                    </div>
                    <div className="flex bg-white dark:bg-white/5 p-1 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden transition-colors">
                        {['All', 'Low Stock'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className={cn(
                                    "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    activeFilter === f ? "bg-primary text-white shadow-lg" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                                )}
                            >
                                {f === 'All' ? t('all') : t('low_stock')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Inventory Table */}
                <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-[40px] border border-white/40 dark:border-white/5 shadow-2xl shadow-black/5 overflow-hidden group transition-all duration-700">
                    <div className="overflow-x-auto scrollbar-none">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-50 dark:border-white/5">
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{t('part_details')}</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{t('amount_etb')}</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{t('stock_level')}</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{t('status')}</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] text-right">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-10 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <Loader2 className="animate-spin text-primary" size={32} />
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Inventory...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-10 py-20 text-center">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No inventory items found</p>
                                        </td>
                                    </tr>
                                ) : filteredItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-primary/5 dark:hover:bg-white/5 transition-all duration-300 group/row even:bg-gray-50/20 dark:even:bg-white/[0.02]">
                                        <td className="px-10 py-8" onClick={() => handleOpenDrawer(item)}>
                                            <div className="flex items-center gap-6 cursor-pointer">
                                                <div className="w-14 h-14 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-primary group-row-hover:scale-110 transition-transform duration-500">
                                                    <Package size={24} />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-black text-gray-900 dark:text-white transition-colors">{item.name}</span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate max-w-[200px]">{item.description || 'No description'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className="text-xs font-black text-gray-900 dark:text-white">{item.price.toLocaleString()}</span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-3">
                                                    <span className={cn(
                                                        "text-sm font-black transition-colors",
                                                        item.quantity <= item.low_stock_threshold ? "text-red-500" : "text-gray-900 dark:text-white"
                                                    )}>{item.quantity}</span>
                                                    <span className="text-[9px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest italic pt-1">{t('units_left')}</span>
                                                </div>
                                                <div className="w-24 h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full transition-all duration-1000",
                                                            item.quantity <= item.low_stock_threshold ? "bg-red-500" : "bg-primary"
                                                        )}
                                                        style={{ width: `${Math.min((item.quantity / (item.low_stock_threshold * 4)) * 100, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            {item.quantity <= item.low_stock_threshold ? (
                                                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 px-3 py-1.5 rounded-full border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 w-fit animate-pulse">
                                                    <AlertCircle size={10} strokeWidth={3} />
                                                    <span className="text-[8px] font-black uppercase tracking-widest italic">{t('low_stock')}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-500/10 px-3 py-1.5 rounded-full border border-green-100 dark:border-green-500/20 text-green-600 dark:text-green-400 w-fit">
                                                    <CheckCircle2 size={10} strokeWidth={3} />
                                                    <span className="text-[8px] font-black uppercase tracking-widest italic">{t('in_stock')}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-row-hover:opacity-100 transition-all translate-x-4 group-row-hover:translate-x-0">
                                                <button
                                                    onClick={() => {
                                                        setDeductItemId(item.id);
                                                        setIsDeductModalOpen(true);
                                                    }}
                                                    className="p-3 bg-accent/10 text-accent rounded-xl hover:bg-accent hover:text-white transition-all active:scale-90"
                                                    title={t('deduct_stock')}
                                                >
                                                    <ArrowDownCircle size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenDrawer(item)}
                                                    className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all active:scale-90"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Sliding Drawer */}
            <div className={cn(
                "fixed top-0 right-0 h-full w-[380px] bg-white dark:bg-[#0A0A0A] shadow-[-20px_0_80px_rgba(0,0,0,0.1)] z-[150] transition-all duration-500 ease-out transform p-10 flex flex-col gap-10",
                isDrawerOpen ? "translate-x-0" : "translate-x-full"
            )}>
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">{editingItem ? 'Edit Item' : t('add_part')}</h2>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{editingItem ? 'update inventory' : 'new warehouse entry'}</p>
                    </div>
                    <button
                        onClick={() => setIsDrawerOpen(false)}
                        className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all active:scale-90"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 space-y-8 overflow-y-auto pr-4 custom-scrollbar">
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Part Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Brake Pad Set (Toyota)"
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('amount_etb')}</label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="2500"
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Quantity</label>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    placeholder="15"
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Low Stock Alert Level</label>
                            <input
                                type="number"
                                value={lowStockThreshold}
                                onChange={(e) => setLowStockThreshold(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add technical details or part numbers..."
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl px-6 py-4 text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-inner min-h-[120px] resize-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={handleSaveItem}
                        disabled={!name || !price || !quantity || isSaving}
                        className="w-full py-5 bg-primary rounded-2xl text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {isSaving ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <>
                                <CheckCircle2 size={18} />
                                {editingItem ? 'Update Database' : 'Confirm Inventory'}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Deduct Stock Modal */}
            {isDeductModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-[#0A0A0A] w-full max-w-sm rounded-[40px] shadow-2xl border border-gray-100 dark:border-white/10 p-10 space-y-8 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight">{t('deduct_stock')}</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{t('remove_from_warehouse')}</p>
                            </div>
                            <button
                                onClick={() => setIsDeductModalOpen(false)}
                                className="p-3 text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('quantity_to_remove')}</label>
                                <input
                                    type="number"
                                    value={deductQuantity}
                                    onChange={(e) => setDeductQuantity(e.target.value)}
                                    min="1"
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleDeductStock}
                            disabled={!deductQuantity || parseInt(deductQuantity) <= 0 || isDeducting}
                            className="w-full py-5 bg-accent rounded-2xl text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-accent/20 hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {isDeducting ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <>
                                    <ArrowDownCircle size={18} />
                                    {t('confirm_deduction')}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
