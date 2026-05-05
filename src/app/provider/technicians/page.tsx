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
    MoreVertical,
    Eye,
    EyeOff
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { technicianService, Technician } from '@/services/api.service';
import { DashboardHeader } from '@/components/DashboardHeader';
import Link from 'next/link';

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
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);
    const [showPinModal, setShowPinModal] = useState(false);
    // Form State
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [assignedVehicle, setAssignedVehicle] = useState('');
    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
    const [photoUrl, setPhotoUrl] = useState('');
    const [photoFile, setPhotoFile] = useState<File | null>(null);

    useEffect(() => {
        fetchTechnicians();
    }, []);

    const fetchTechnicians = async () => {
        setIsLoading(true);

        try {
            const response = await technicianService.list();

            const list = response?.data?.data || response?.data || response;

            const normalized = Array.isArray(list)
                ? list.map((t: any) => ({
                    ...t,
                    specialties: t.specialties || t.skills || []
                }))
                : [];

            setTechnicians(normalized);

        } catch (error) {
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Failed to load technicians", type: 'error' }
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDrawer = async (tech: Technician | null = null) => {
        setIsDrawerOpen(true);

        if (tech) {
            setEditingTechnician(tech);
            setIsLoadingDetail(true);

            try {
                const response = await technicianService.get(tech.id);

                const detail = response?.data?.data || response?.data || response || {};

                setFullName(detail.full_name || tech.full_name);
                setPhoneNumber(detail.phone_number || tech.phone_number);
                setAssignedVehicle(detail.assigned_vehicle_plate || tech.assigned_vehicle_plate || '');

                const specialties = detail.specialties || detail.skills || tech.specialties || [];
                setSelectedSpecialties(specialties);

                setPhotoUrl(detail.photo_url || tech.photo_url || '');

                setInitialPin(detail.initial_pin || tech.initial_pin || null);

            } catch (error) {
                console.error("Detail fetch failed, using fallback");

                setFullName(tech.full_name);
                setPhoneNumber(tech.phone_number);
                setAssignedVehicle(tech.assigned_vehicle_plate || '');
                setSelectedSpecialties(tech.specialties || []);
                setPhotoUrl(tech.photo_url || '');
            } finally {
                setIsLoadingDetail(false);
            }
        } else {
            setEditingTechnician(null);
            setFullName('');
            setPhoneNumber('');
            setAssignedVehicle('');
            setSelectedSpecialties([]);
            setPhotoUrl('');
            setPhotoFile(null);
            setInitialPin(null);
        }
    };

    const handleSaveTechnician = async () => {
        if (!fullName || (!editingTechnician && !phoneNumber)) {
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Full name and phone number are required", type: 'error' }
            }));
            return;
        }

        setIsSaving(true);

        try {
            if (editingTechnician) {
                let response;

                if (photoFile) {
                    const formData = new FormData();
                    formData.append('full_name', fullName);
                    formData.append('assigned_vehicle_plate', assignedVehicle);
                    formData.append('specialties', JSON.stringify(selectedSpecialties));
                    formData.append('photo', photoFile);
                    formData.append('is_active', String(editingTechnician.is_active));

                    response = await technicianService.update(editingTechnician.id, formData);
                } else {
                    const payload = {
                        full_name: fullName,
                        specialties: selectedSpecialties,
                        assigned_vehicle_plate: assignedVehicle,
                        is_active: editingTechnician.is_active
                    };

                    response = await technicianService.update(editingTechnician.id, payload);
                }

                const updatedTechRaw = response?.data?.data || response?.data || response;

                const updatedTech: Technician = {
                    ...updatedTechRaw,
                    specialties: updatedTechRaw.specialties || updatedTechRaw.skills || []
                };

                setTechnicians(prev =>
                    prev.map(t => t.id === updatedTech.id ? updatedTech : t)
                );

            } else {
                const payload = {
                    full_name: fullName,
                    phone_number: phoneNumber,
                    skills: selectedSpecialties // backend expects skills
                };

                const response = await technicianService.add(payload);

                const newTechRaw = response?.data?.data || response?.data || response;

                const newTech: Technician = {
                    ...newTechRaw,
                    specialties: newTechRaw.skills || []
                };

                // ✅ Add to list
                setTechnicians(prev => [newTech, ...prev]);

                // ✅ Show PIN
                if (newTech.initial_pin) {
                    setInitialPin(newTech.initial_pin);
                    setShowPinModal(true);
                }
            }

            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: {
                    message: `Technician ${editingTechnician ? 'updated' : 'added'} successfully`,
                    type: 'success'
                }
            }));

            setIsDrawerOpen(false);

        } catch (error: any) {
            console.error("[Technician Management] Save Error:", error);

            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: {
                    message: error?.response?.data?.message || "Failed to save technician",
                    type: 'error'
                }
            }));
        } finally {
            setIsSaving(false);
        }
    };

    // Delete Confirmation Modal State
    const [isDeletingTech, setIsDeletingTech] = useState(false);
    const [techToDelete, setTechToDelete] = useState<{ id: number, name: string } | null>(null);
    const [visiblePins, setVisiblePins] = useState<Record<number, boolean>>({});
    const [initialPin, setInitialPin] = useState<string | null>(null);

    const togglePinVisibility = (id: number) => {
        setVisiblePins(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleDeleteTechnician = async (id: number) => {
        setIsDeletingTech(true);
        try {
            console.log(`[Technician Management] Deleting technician ${id}...`);
            await technicianService.delete(id);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Technician deleted successfully", type: 'success' }
            }));
            setTechToDelete(null);
            fetchTechnicians();
        } catch (error: any) {
            console.error("[Technician Management] Delete Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Failed to delete technician", type: 'error' }
            }));
        } finally {
            setIsDeletingTech(false);
        }
    };

    const toggleSpecialty = (s: string) => {
        setSelectedSpecialties(prev =>
            prev.includes(s) ? prev.filter(item => item !== s) : [...prev, s]
        );
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setPhotoFile(file);
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const filteredTechnicians = Array.isArray(technicians) ? technicians.filter(tech => {
        const matchesSearch = tech.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tech.phone_number.toLowerCase().includes(searchQuery.toLowerCase());
        const techStatus = tech.is_active ? 'On Duty' : 'Offline';
        const matchesFilter = activeFilter === 'All' || techStatus === activeFilter;
        return matchesSearch && matchesFilter;
    }) : [];

    return (
        <div className="relative min-h-screen flex flex-col gap-8 animate-in fade-in duration-1000 pb-20 font-sans">
            {(isDrawerOpen || !!techToDelete) && (
                <div
                    className="fixed inset-0 bg-gray-900/20 dark:bg-black/40 backdrop-blur-sm z-[100]"
                    onClick={() => {
                        setIsDrawerOpen(false);
                        setTechToDelete(null);
                    }}
                />
            )}

            {/* DELETE MODAL */}
            {techToDelete && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-[40px] p-10 max-w-md w-full shadow-2xl text-center space-y-6">
                        <Trash2 size={32} className="mx-auto text-red-500" />

                        <h3 className="text-xl font-black">Remove Hero?</h3>

                        <p className="text-xs text-gray-400">
                            Delete <span className="text-red-500">"{techToDelete.name}"</span> permanently
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => handleDeleteTechnician(techToDelete.id)}
                                disabled={isDeletingTech}
                                className="py-3 bg-red-500 text-white rounded-xl"
                            >
                                {isDeletingTech ? <Loader2 className="animate-spin mx-auto" /> : "Confirm"}
                            </button>

                            <button
                                onClick={() => setTechToDelete(null)}
                                className="py-3 bg-gray-100 rounded-xl"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ PIN MODAL (UNCHANGED LOGIC) */}
            {showPinModal && initialPin && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl p-8 max-w-md w-full text-center space-y-6">
                        <h2 className="text-xl font-black">🔐 Technician PIN Generated</h2>

                        <div className="text-3xl font-black tracking-widest bg-gray-100 dark:bg-white/10 py-4 rounded-xl">
                            {initialPin}
                        </div>

                        <button
                            onClick={() => navigator.clipboard.writeText(initialPin)}
                            className="text-xs text-blue-500 underline"
                        >
                            Copy PIN
                        </button>

                        <button
                            onClick={() => {
                                setShowPinModal(false);
                                setInitialPin(null);
                            }}
                            className="w-full py-3 bg-primary text-white rounded-xl font-black"
                        >
                            I HAVE SAVED IT
                        </button>
                    </div>
                </div>
            )}

            {/* MAIN */}
            <div className={cn("flex flex-col min-h-screen", isDrawerOpen ? "blur-sm" : "")}>
                <DashboardHeader title={t('technicians')} subtitle={t('technicians_subtitle')}>
                    <button onClick={() => handleOpenDrawer()} className="bg-accent text-white px-6 py-3 rounded-2xl flex items-center gap-2">
                        <UserPlus size={16} />
                        Hire New Hero
                    </button>
                </DashboardHeader>

                <div className="p-8 space-y-8">

                    {/* SEARCH */}
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('search_hero')}
                                className="w-full pl-10 py-3 border rounded-xl"
                            />
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="bg-white dark:bg-white/5 rounded-[40px] overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="px-10 py-6">{t('hero_info')}</th>
                                    <th className="px-10 py-6">{t('specialty')}</th>
                                    <th className="px-12 py-6">{t('status')}</th>
                                </tr>
                            </thead>

                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={3} className="text-center py-10">
                                            <Loader2 className="animate-spin mx-auto" />
                                        </td>
                                    </tr>
                                ) : filteredTechnicians.map((tech) => (
                                    <tr key={tech.id} className="hover:bg-gray-50 dark:hover:bg-gray-300">

                                        {/* INFO */}
                                        <td className="px-10 py-6 cursor-pointer" onClick={() => handleOpenDrawer(tech)}>
                                            <div>
                                                <p className=" dark:text-gray-400 font-bold">{tech.full_name}</p>
                                                <p className="text-xs text-gray-400">{tech.phone_number}</p>
                                            </div>
                                        </td>

                                        {/* SPECIALTIES */}
                                        <td className="px-10 py-6">
                                            <div className="flex flex-wrap gap-2">
                                                {(Array.isArray(tech.specialties) ? tech.specialties : [])
                                                    .filter((s: string): s is string => typeof s === "string" && s.trim().length > 0)
                                                    .map((s: string, i: number) => (
                                                        <span
                                                            key={`${s}-${i}`}
                                                            className="px-2 py-1 bg-gray-400 rounded text-xs"
                                                        >
                                                            {s}
                                                        </span>
                                                    ))}
                                            </div>
                                        </td>

                                        {/* STATUS */}
                                        <td className="px-12 py-6">
                                            <span className={cn(
                                                "px-3 py-1 rounded",
                                                tech.is_active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                                            )}>
                                                {tech.is_active ? t('on_duty') : t('offline')}
                                            </span>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* DRAWER */}
            <div className={cn(
                "fixed right-0 top-0 bottom-0 w-[380px] bg-white dark:bg-[#0A0A0A] z-[110] p-8",
                isDrawerOpen ? "translate-x-0" : "translate-x-full"
            )}>
                <div className="flex justify-between mb-6">
                    <h2 className="font-black">
                        {editingTechnician ? 'Update Hero' : t('add_new_hero')}
                    </h2>
                    <button onClick={() => setIsDrawerOpen(false)}>
                        <X />
                    </button>
                </div>

                {/* ❌ PHOTO SECTION REMOVED */}

                <div className="space-y-4">
                    <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full border p-3 rounded"
                    />

                    {!editingTechnician && (
                        <input
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="Phone"
                            className="w-full border p-3 rounded"
                        />
                    )}
                </div>

                <button
                    onClick={handleSaveTechnician}
                    className="mt-6 w-full py-3 bg-accent text-white rounded-xl"
                >
                    {editingTechnician ? 'Update' : 'Save'}
                </button>
            </div>
        </div>
    );
}
