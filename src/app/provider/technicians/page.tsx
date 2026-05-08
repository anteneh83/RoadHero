"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, X, UserPlus, Loader2, Trash2, Edit2, Copy, Check, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { technicianService, Technician } from '@/services/api.service';
import { DashboardHeader } from '@/components/DashboardHeader';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

const SPECIALTIES = ['Towing', 'Electrician', 'Mechanic', 'Tire Change', 'Battery', 'Fuel Delivery', 'Jumpstart', 'Oil Change'];

function toast(message: string, type: 'success' | 'error') {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
}

export default function TechnicianManagementPage() {
    const { t } = useLanguage();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);
    const [techToDelete, setTechToDelete] = useState<{ id: number; name: string } | null>(null);
    const [isDeletingTech, setIsDeletingTech] = useState(false);
    const [createdPin, setCreatedPin] = useState<string | null>(null);
    const [pinCopied, setPinCopied] = useState(false);
    const [pinDismissed, setPinDismissed] = useState(false);

    // Form
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [assignedVehicle, setAssignedVehicle] = useState('');
    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => { fetchTechnicians(); }, []);

    const fetchTechnicians = async () => {
        setIsLoading(true);
        try {
            const data = await technicianService.list();
            setTechnicians(Array.isArray(data) ? data : []);
        } catch {
            toast('Failed to load technicians', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const openDrawer = async (tech: Technician | null = null) => {
        setCreatedPin(null);
        setPinDismissed(false);
        setIsDrawerOpen(true);
        if (tech) {
            setEditingTechnician(tech);
            setIsLoadingDetail(true);
            try {
                const detail = await technicianService.get(tech.id);
                setFullName(detail.full_name);
                setPhoneNumber(detail.phone_number);
                setAssignedVehicle(detail.assigned_vehicle_plate || '');
                setSelectedSpecialties(detail.specialties || []);
                setIsActive(detail.is_active);
            } catch {
                setFullName(tech.full_name);
                setPhoneNumber(tech.phone_number);
                setAssignedVehicle(tech.assigned_vehicle_plate || '');
                setSelectedSpecialties(tech.specialties || []);
                setIsActive(tech.is_active);
            } finally {
                setIsLoadingDetail(false);
            }
        } else {
            setEditingTechnician(null);
            setFullName(''); setPhoneNumber(''); setAssignedVehicle('');
            setSelectedSpecialties([]); setIsActive(true);
            setIsLoadingDetail(false);
        }
    };

    const handleSave = async () => {
        if (!fullName) { toast('Full name is required', 'error'); return; }
        if (!editingTechnician && !phoneNumber) { toast('Phone number is required', 'error'); return; }
        setIsSaving(true);
        try {
            if (editingTechnician) {
                const updated = await technicianService.update(editingTechnician.id, {
                    full_name: fullName,
                    specialties: selectedSpecialties,
                    is_active: isActive,
                    assigned_vehicle_plate: assignedVehicle || undefined,
                });
                setTechnicians(prev => prev.map(t => t.id === editingTechnician.id ? { ...t, ...updated } : t));
                toast('Technician updated successfully', 'success');
                setIsDrawerOpen(false);
            } else {
                const created = await technicianService.add({ full_name: fullName, phone_number: phoneNumber, skills: selectedSpecialties });
                setTechnicians(prev => [created, ...prev]);
                if (created.initial_pin) {
                    setCreatedPin(created.initial_pin);
                    setPinDismissed(false);
                    setEditingTechnician(created);
                    setFullName(created.full_name);
                    setPhoneNumber(created.phone_number);
                    setAssignedVehicle('');
                    setSelectedSpecialties(created.specialties || []);
                    setIsActive(created.is_active);
                } else {
                    toast('Technician created successfully', 'success');
                    setIsDrawerOpen(false);
                }
            }
        } catch (error: any) {
            toast(error?.response?.data?.message || 'Failed to save technician', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        setIsDeletingTech(true);
        try {
            await technicianService.delete(id);
            toast('Technician deactivated', 'success');
            setTechToDelete(null);
            setTechnicians(prev => prev.filter(t => t.id !== id));
        } catch {
            toast('Failed to delete technician', 'error');
        } finally {
            setIsDeletingTech(false);
        }
    };

    const copyPin = async () => {
        if (!createdPin) return;
        await navigator.clipboard.writeText(createdPin);
        setPinCopied(true);
        setTimeout(() => setPinCopied(false), 2000);
    };

    const toggleSpecialty = (s: string) => {
        setSelectedSpecialties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
    };

    const filtered = technicians.filter(tech => {
        const matchSearch = tech.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tech.phone_number.toLowerCase().includes(searchQuery.toLowerCase());
        const status = tech.is_active ? 'On Duty' : 'Offline';
        const matchFilter = activeFilter === 'All' || status === activeFilter;
        return matchSearch && matchFilter;
    });

    return (
        <div className="relative min-h-screen flex flex-col gap-8 animate-in fade-in duration-1000 pb-20 font-sans">
            {/* Overlay */}
            {(isDrawerOpen || !!techToDelete) && (
                <div className="fixed inset-0 bg-gray-900/20 dark:bg-black/40 backdrop-blur-sm z-[100]"
                    onClick={() => { if (!createdPin || pinDismissed) { setIsDrawerOpen(false); } setTechToDelete(null); }} />
            )}

            {/* Delete Modal */}
            {techToDelete && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                    <div className="bg-white/90 dark:bg-[#1A1A1A]/90 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-[40px] p-10 max-w-md w-full shadow-[0_40px_100px_rgba(0,0,0,0.2)]">
                        <div className="space-y-8 text-center">
                            <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-[30px] flex items-center justify-center mx-auto border border-red-100 dark:border-red-500/20">
                                <Trash2 size={32} className="text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white">Remove Technician?</h3>
                                <p className="text-xs font-bold text-gray-400 mt-2">Delete <span className="text-red-500">"{techToDelete.name}"</span>? This action is permanent.</p>
                            </div>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => handleDelete(techToDelete.id)} disabled={isDeletingTech}
                                    className="w-full py-4 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                    {isDeletingTech ? <Loader2 className="animate-spin" size={16} /> : 'Confirm Deletion'}
                                </button>
                                <button onClick={() => setTechToDelete(null)}
                                    className="w-full py-4 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-200 dark:hover:bg-white/10 transition-all">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main */}
            <div className={cn("flex flex-col min-h-screen transition-all duration-500", (isDrawerOpen || techToDelete) ? "blur-[2px] scale-[0.98]" : "")}>
                <DashboardHeader title={t('technicians')} subtitle={t('technicians_subtitle')}>
                    <button onClick={() => openDrawer()}
                        className="bg-accent hover:bg-orange-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 group">
                        <UserPlus size={16} strokeWidth={3} />
                        <span>Hire New Hero</span>
                    </button>
                </DashboardHeader>

                <div className="p-8 lg:p-12 space-y-8 pb-20">
                    {/* Search & Filter */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search technicians..."
                                className="w-full pl-14 pr-6 py-4 text-xs font-medium outline-none text-gray-900 dark:text-white bg-transparent placeholder:text-gray-300 dark:placeholder:text-gray-600" />
                        </div>
                        <div className="flex bg-white dark:bg-white/5 p-1 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                            {['All', 'On Duty', 'Offline'].map(f => (
                                <button key={f} onClick={() => setActiveFilter(f)}
                                    className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        activeFilter === f ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300")}>
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-[40px] border border-white/40 dark:border-white/5 shadow-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-50 dark:border-white/5">
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Hero Info</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Specialties</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                    {isLoading ? (
                                        <tr><td colSpan={4} className="px-10 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <Loader2 className="animate-spin text-primary" size={32} />
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Technicians...</p>
                                            </div>
                                        </td></tr>
                                    ) : filtered.length === 0 ? (
                                        <tr><td colSpan={4} className="px-10 py-20 text-center">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No technicians found</p>
                                        </td></tr>
                                    ) : filtered.map(tech => (
                                        <tr key={tech.id} className="hover:bg-primary/5 dark:hover:bg-white/5 transition-all group/row">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-lg shrink-0 relative",
                                                        tech.is_active ? "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400" : "bg-gray-100 dark:bg-white/10 text-gray-400")}>
                                                        {tech.photo_url
                                                            ? <img src={tech.photo_url} alt="" className="w-full h-full object-cover rounded-2xl" />
                                                            : tech.full_name.charAt(0) + (tech.full_name.split(' ')[1]?.charAt(0) || '')}
                                                        <div className={cn("absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-4 border-white dark:border-[#0A0A0A]",
                                                            tech.is_active ? "bg-green-500 animate-pulse" : "bg-gray-300")} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-gray-900 dark:text-white">{tech.full_name}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{tech.phone_number}</p>
                                                        {tech.assigned_vehicle_plate && (
                                                            <p className="text-[9px] font-bold text-blue-400 mt-0.5">🚗 {tech.assigned_vehicle_plate}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                    {tech.specialties?.map(s => (
                                                        <span key={s} className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 text-[8px] font-black text-gray-500 uppercase tracking-widest rounded-lg">{s}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <span className={cn("px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border",
                                                    tech.is_active ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-100 dark:border-green-500/20"
                                                        : "bg-gray-100 dark:bg-white/5 text-gray-400 border-transparent")}>
                                                    {tech.is_active ? 'On Duty' : 'Offline'}
                                                </span>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                                    <button onClick={() => openDrawer(tech)}
                                                        className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 hover:bg-blue-100 transition-all">
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button onClick={() => setTechToDelete({ id: tech.id, name: tech.full_name })}
                                                        className="p-2 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 transition-all">
                                                        <Trash2 size={14} />
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
            </div>

            {/* Drawer */}
            <div className={cn("fixed right-0 top-0 bottom-0 w-[400px] bg-white dark:bg-[#0A0A0A] z-[110] shadow-[0_0_80px_rgba(0,0,0,0.15)] transition-transform duration-700 flex flex-col border-l border-gray-100 dark:border-white/5",
                isDrawerOpen ? "translate-x-0" : "translate-x-full")}>
                {/* Header */}
                <div className="flex justify-between items-center p-8 pb-6 border-b border-gray-50 dark:border-white/5">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white">{editingTechnician ? 'Update Hero' : 'Add New Hero'}</h2>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-0.5">{editingTechnician ? 'Modify details' : 'New team member'}</p>
                    </div>
                    <button onClick={() => { if (!createdPin || pinDismissed) setIsDrawerOpen(false); }}
                        className="p-2.5 text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl">
                        <X size={20} />
                    </button>
                </div>

                {/* PIN Banner */}
                {createdPin && !pinDismissed && (
                    <div className="mx-6 mt-6 rounded-2xl border-2 border-amber-400/40 bg-amber-50 dark:bg-amber-500/10 p-5">
                        <div className="flex items-start gap-3 mb-3">
                            <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">One-Time PIN</p>
                                <p className="text-[9px] text-amber-600 dark:text-amber-500 mt-1 leading-relaxed">
                                    ⚠️ This PIN will disappear once dismissed. Make sure the technician saves it now.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white dark:bg-black/30 rounded-xl px-4 py-3 border border-amber-200 dark:border-amber-500/20">
                            <span className="flex-1 text-2xl font-black tracking-[0.4em] text-gray-900 dark:text-white font-mono">{createdPin}</span>
                            <button onClick={copyPin}
                                className="p-2 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-200 transition-all">
                                {pinCopied ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                        </div>
                        <button onClick={() => { setPinDismissed(true); setCreatedPin(null); toast('Technician created successfully', 'success'); setIsDrawerOpen(false); }}
                            className="mt-3 w-full py-2.5 bg-amber-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all">
                            I've Saved the PIN — Close
                        </button>
                    </div>
                )}

                {/* Form */}
                <div className="flex-1 overflow-y-auto p-8 pt-6 space-y-6">
                    {isLoadingDetail ? (
                        <div className="h-full flex items-center justify-center">
                            <Loader2 className="animate-spin text-primary" size={28} />
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name *</label>
                                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Mike Smith"
                                    className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
                            </div>

                            {!editingTechnician && (
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number *</label>
                                    <input type="text" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="+251911888999"
                                        className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
                                </div>
                            )}

                            {editingTechnician && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Assigned Vehicle Plate</label>
                                        <input type="text" value={assignedVehicle} onChange={e => setAssignedVehicle(e.target.value)} placeholder="AA-A45210"
                                            className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                                        <div>
                                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Active Status</p>
                                            <p className="text-[9px] text-gray-400 mt-0.5">{isActive ? 'Technician is On Duty' : 'Technician is Offline'}</p>
                                        </div>
                                        <button onClick={() => setIsActive(p => !p)}
                                            className={cn("relative w-12 h-6 rounded-full transition-all duration-300", isActive ? "bg-green-500" : "bg-gray-200 dark:bg-white/10")}>
                                            <span className={cn("absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300", isActive ? "left-7" : "left-1")} />
                                        </button>
                                    </div>
                                </>
                            )}

                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Specialties</label>
                                <div className="flex flex-wrap gap-2">
                                    {SPECIALTIES.map(s => {
                                        const key = s.toLowerCase().replace(' ', '_');
                                        const active = selectedSpecialties.includes(key) || selectedSpecialties.includes(s);
                                        return (
                                            <button key={s} onClick={() => toggleSpecialty(key)}
                                                className={cn("px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                                    active ? "bg-primary text-white shadow-lg" : "border border-gray-100 dark:border-white/10 text-gray-400 hover:border-gray-300")}>
                                                {s}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Save Button */}
                {!(createdPin && !pinDismissed) && (
                    <div className="p-8 pt-4 border-t border-gray-50 dark:border-white/5">
                        <button onClick={handleSave} disabled={isSaving}
                            className="w-full py-4 bg-accent hover:bg-orange-600 disabled:opacity-50 rounded-2xl text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2">
                            {isSaving ? <Loader2 className="animate-spin" size={16} /> : (editingTechnician ? 'Update Hero Profile' : 'Create Technician')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
