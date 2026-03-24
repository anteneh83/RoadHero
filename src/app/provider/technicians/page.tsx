"use client";

import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Star,
    ChevronRight,
    Settings,
    Bell,
    X,
    Camera,
    UserPlus,
    Loader2,
    Trash2,
    Edit2,
    MoreVertical
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { technicianService, Technician, AddTechnicianPayload, UpdateTechnicianPayload } from '@/services/api.service';
import { uploadToCloudinary } from '@/lib/cloudinary';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function TechnicianManagementPage() {
    const { t } = useLanguage();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    // API State
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);

    // Form State
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [assignedVehicle, setAssignedVehicle] = useState('');
    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
    const [photoUrl, setPhotoUrl] = useState('');

    useEffect(() => {
        fetchTechnicians();
    }, []);

    const fetchTechnicians = async () => {
        setIsLoading(true);
        console.log("[Technician Management] Fetching technicians...");
        try {
            const response = await technicianService.list();
            console.log("[Technician Management] List Response:", response);
            // Handle both { status: 'success', data: [...] } and direct array
            const data = response.data || response;
            setTechnicians(Array.isArray(data) ? data : []);
        } catch (error: any) {
            console.error("[Technician Management] Fetch Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Failed to load technicians", type: 'error' }
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDrawer = (tech: Technician | null = null) => {
        if (tech) {
            setEditingTechnician(tech);
            setFullName(tech.full_name);
            setPhoneNumber(tech.phone_number);
            setAssignedVehicle(tech.assigned_vehicle_plate || '');
            setSelectedSpecialties(tech.specialties || []);
            setPhotoUrl(tech.photo_url || '');
        } else {
            setEditingTechnician(null);
            setFullName('');
            setPhoneNumber('');
            setAssignedVehicle('');
            setSelectedSpecialties([]);
            setPhotoUrl('');
        }
        setIsDrawerOpen(true);
    };

    const handleSaveTechnician = async () => {
        if (!fullName || !phoneNumber) {
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Full name and phone number are required", type: 'error' }
            }));
            return;
        }

        setIsSaving(true);
        try {
            if (editingTechnician) {
                const payload: UpdateTechnicianPayload = {
                    full_name: fullName,
                    specialties: selectedSpecialties,
                    assigned_vehicle_plate: assignedVehicle,
                    photo_url: photoUrl,
                    is_active: editingTechnician.is_active
                };
                console.log(`[Technician Management] Updating technician ${editingTechnician.id}:`, payload);
                const response = await technicianService.update(editingTechnician.id, payload);
                console.log("[Technician Management] Update Response:", response);
            } else {
                const payload: AddTechnicianPayload = {
                    full_name: fullName,
                    phone_number: phoneNumber,
                    specialties: selectedSpecialties,
                    assigned_vehicle_plate: assignedVehicle,
                    photo_url: photoUrl
                };
                console.log("[Technician Management] Adding new technician:", payload);
                const response = await technicianService.add(payload);
                console.log("[Technician Management] Add Response:", response);
            }

            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: `Technician ${editingTechnician ? 'updated' : 'added'} successfully`, type: 'success' }
            }));
            setIsDrawerOpen(false);
            fetchTechnicians();
        } catch (error: any) {
            console.error("[Technician Management] Save Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: error.response?.data?.message || "Failed to save technician", type: 'error' }
            }));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteTechnician = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this technician?")) return;

        try {
            console.log(`[Technician Management] Deleting technician ${id}...`);
            await technicianService.delete(id);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Technician deleted successfully", type: 'success' }
            }));
            fetchTechnicians();
        } catch (error: any) {
            console.error("[Technician Management] Delete Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Failed to delete technician", type: 'error' }
            }));
        }
    };

    const toggleSpecialty = (s: string) => {
        setSelectedSpecialties(prev =>
            prev.includes(s) ? prev.filter(item => item !== s) : [...prev, s]
        );
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        console.log("[Technician Management] Uploading photo to Cloudinary...");
        try {
            const url = await uploadToCloudinary(file);
            if (url) {
                console.log("[Technician Management] Photo uploaded successfully:", url);
                setPhotoUrl(url);
                window.dispatchEvent(new CustomEvent('show-toast', {
                    detail: { message: "Photo uploaded successfully", type: 'success' }
                }));
            } else {
                throw new Error("Failed to get image URL");
            }
        } catch (error: any) {
            console.error("[Technician Management] Photo Upload Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Failed to upload photo", type: 'error' }
            }));
        } finally {
            setIsUploading(false);
        }
    };

    const filteredTechnicians = Array.isArray(technicians) ? technicians.filter(tech => {
        const matchesSearch = tech.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tech.phone_number.toLowerCase().includes(searchQuery.toLowerCase());
        const techStatus = tech.is_active ? 'On Duty' : 'Offline';
        const matchesFilter = activeFilter === 'All' || techStatus === activeFilter;
        return matchesSearch && matchesFilter;
    }) : [];

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
                        <h1 className="text-xl font-black text-[#171717] dark:text-white transition-colors">{t('technicians')}</h1>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">{t('technicians_subtitle')}</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('open-notifications'))}
                            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors relative"
                        >
                            <Bell size={18} />
                            <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 border-2 border-white dark:border-[#0A0A0A] rounded-full"></div>
                        </button>
                        <div className="bg-orange-50 dark:bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-100 dark:border-orange-500/20 transition-colors">
                            <span className="text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">Trial: 12 Days</span>
                        </div>
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
                            placeholder={t('search_hero')}
                            className="w-full pl-14 pr-6 py-4 text-xs font-medium outline-none text-gray-900 dark:text-white bg-transparent placeholder:text-gray-300 dark:placeholder:text-gray-600"
                        />
                    </div>
                    <div className="flex bg-white dark:bg-white/5 p-1 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden transition-colors">
                        {['All', 'On Duty', 'Offline'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className={cn(
                                    "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    activeFilter === f ? "bg-primary text-white shadow-lg" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                                )}
                            >
                                {t(f.toLowerCase().replace(' ', '_'))}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Hero List Table */}
                <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-[40px] border border-white/40 dark:border-white/5 shadow-2xl shadow-black/5 overflow-hidden group transition-all duration-700">
                    <div className="overflow-x-auto scrollbar-none">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-50 dark:border-white/5">
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{t('hero_info')}</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{t('specialty')}</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{t('status')}</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{t('vehicle')}</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-10 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <Loader2 className="animate-spin text-primary" size={32} />
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Technicians...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredTechnicians.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-10 py-20 text-center">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No technicians found</p>
                                        </td>
                                    </tr>
                                ) : filteredTechnicians.map((tech) => (
                                    <tr key={tech.id} className="hover:bg-primary/5 dark:hover:bg-white/5 transition-all duration-300 group/row even:bg-gray-50/20 dark:even:bg-white/[0.02]">
                                        <td className="px-10 py-8" onClick={() => handleOpenDrawer(tech)}>
                                            <div className="flex items-center gap-6 cursor-pointer">
                                                <div className={cn(
                                                    "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shadow-xl shrink-0 relative group-row-hover:scale-110 transition-transform duration-500",
                                                    tech.is_active ? "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400" : "bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-600"
                                                )}>
                                                    {tech.photo_url ? (
                                                        <img src={tech.photo_url} alt="" className="w-full h-full object-cover rounded-2xl" />
                                                    ) : (
                                                        tech.full_name.charAt(0) + (tech.full_name.split(' ')[1]?.charAt(0) || '')
                                                    )}
                                                    <div className={cn(
                                                        "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-white dark:border-[#0A0A0A]",
                                                        tech.is_active ? "bg-green-500 animate-pulse" : "bg-gray-300"
                                                    )}></div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[15px] font-black text-gray-900 dark:text-white group-row-hover:text-primary dark:group-row-hover:text-accent transition-colors leading-none">{tech.full_name}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{tech.phone_number}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                {tech.specialties?.map(s => (
                                                    <span key={s} className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 text-[8px] font-black text-gray-500 uppercase tracking-widest rounded-lg">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={cn(
                                                "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border transition-all",
                                                tech.is_active ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-100 dark:border-green-500/20" : "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 border-transparent"
                                            )}>
                                                {tech.is_active ? t('on_duty') : t('offline')}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 tabular-nums font-black text-[11px] text-gray-500 dark:text-gray-400">
                                            {tech.assigned_vehicle_plate || '—'}
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex items-center gap-2 justify-end opacity-0 group-row-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenDrawer(tech)}
                                                    className="p-2 text-gray-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-xl"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTechnician(tech.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors hover:bg-red-500/5 rounded-xl"
                                                >
                                                    <Trash2 size={16} />
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

            {/* Side Drawer: Add/Edit Hero */}
            <div className={cn(
                "fixed right-0 top-0 bottom-0 w-[380px] bg-white dark:bg-[#0A0A0A] z-[110] shadow-[0_0_80px_rgba(0,0,0,0.1)] dark:shadow-black/50 transition-transform duration-700 p-8 flex flex-col border-l border-gray-100 dark:border-white/5",
                isDrawerOpen ? "translate-x-0" : "translate-x-full"
            )}>
                <div className="flex justify-between items-center mb-10">
                    <div className="space-y-1">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight transition-colors">
                            {editingTechnician ? 'Update Hero' : t('add_new_hero')}
                        </h2>
                        <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            {editingTechnician ? 'Modify details' : t('new_team_member')}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsDrawerOpen(false)}
                        className="p-2.5 text-gray-300 dark:text-gray-600 hover:text-gray-900 dark:hover:text-white transition-colors hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 space-y-10 overflow-y-auto pr-4 custom-scrollbar">
                    {/* Photo Upload */}
                    <div className="space-y-4">
                        <input
                            type="file"
                            id="tech-photo-input"
                            className="hidden"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                        />
                        <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('hero_photo')}</p>
                        <div
                            onClick={() => document.getElementById('tech-photo-input')?.click()}
                            className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-[28px] border-2 border-dashed border-gray-100 dark:border-white/10 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-primary/50 dark:hover:border-accent/50 transition-all overflow-hidden relative"
                        >
                            {isUploading ? (
                                <Loader2 className="animate-spin text-primary" size={20} />
                            ) : photoUrl ? (
                                <>
                                    <img src={photoUrl} className="w-full h-full object-cover" alt="" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Camera size={20} className="text-white" />
                                    </div>
                                </>
                            ) : (
                                <Camera size={18} className="text-primary dark:text-accent group-hover:scale-125 transition-transform" />
                            )}
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('full_name')}</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Sami Solomon"
                                className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 dark:focus:ring-primary/20 transition-all shadow-sm"
                            />
                        </div>

                        {!editingTechnician && (
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('phone_number')}</label>
                                <input
                                    type="text"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="+251 9..."
                                    className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 dark:focus:ring-primary/20 transition-all shadow-sm"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('assigned_vehicle')}</label>
                            <input
                                type="text"
                                value={assignedVehicle}
                                onChange={(e) => setAssignedVehicle(e.target.value)}
                                placeholder="e.g. AA-A45210"
                                className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-medium text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 dark:focus:ring-primary/20 transition-all"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('specialty')}</label>
                            <div className="flex flex-wrap gap-2">
                                {['Towing', 'Electrician', 'Mechanic', 'Tire Change'].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => toggleSpecialty(s.toLowerCase().replace(' ', '_'))}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                            selectedSpecialties.includes(s.toLowerCase().replace(' ', '_'))
                                                ? "bg-primary text-white shadow-lg shadow-blue-900/10"
                                                : "border border-gray-100 dark:border-white/10 text-gray-300 dark:text-gray-600 hover:border-gray-200 dark:hover:border-white/20"
                                        )}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSaveTechnician}
                    disabled={isSaving}
                    className="mt-8 w-full py-4 bg-accent disabled:opacity-50 rounded-2xl text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-orange-900/10 hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    {isSaving ? (
                        <Loader2 className="animate-spin" size={16} />
                    ) : (
                        editingTechnician ? 'Update Hero Profile' : t('save_hero_profile')
                    )}
                </button>
            </div>

            {/* Floating Action Button */}
            {!isDrawerOpen && (
                <div className="fixed bottom-10 right-10 z-[120] animate-in slide-in-from-right-4 duration-500">
                    <button
                        onClick={() => handleOpenDrawer()}
                        className="flex items-center gap-4 bg-accent hover:bg-orange-600 text-white px-8 py-5 rounded-3xl shadow-2xl shadow-orange-900/30 transition-all active:scale-95 group font-black uppercase tracking-[0.2em] text-[10px]"
                    >
                        <UserPlus size={20} strokeWidth={3} className="group-hover:translate-x-1 group-hover:-rotate-12 transition-transform" />
                        <span>{t('hire_new_hero')}</span>
                    </button>
                </div>
            )}
        </div>
    );
}
