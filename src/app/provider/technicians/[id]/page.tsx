"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ChevronLeft,
    Settings,
    Star,
    Trash2,
    Loader2,
    User,
    Phone,
    CarFront,
    Calendar,
    Activity,
    ShieldCheck
} from 'lucide-react';
import { technicianService, Technician } from '@/services/api.service';
import { useLanguage } from '@/hooks/useLanguage';
import { DashboardHeader } from '@/components/DashboardHeader';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function TechnicianDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { t } = useLanguage();

    const [tech, setTech] = useState<Technician | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Delete Confirmation Modal State
    const [isDeletingData, setIsDeletingData] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        fetchTechnician();
    }, [id]);

    const fetchTechnician = async () => {
        setIsLoading(true);
        try {
            const response = await technicianService.get(Number(id));
            const techData = response.data || response;
            setTech(techData);
        } catch (error) {
            console.error("[Technician Detail] Fetch Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Failed to load technician details", type: 'error' }
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        setIsDeletingData(true);
        try {
            await technicianService.delete(Number(id));
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Technician removed from team", type: 'success' }
            }));
            setShowDeleteConfirm(false);
            router.push('/provider/technicians');
        } catch (error) {
            console.error("[Technician Detail] Delete Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Failed to delete technician", type: 'error' }
            }));
        } finally {
            setIsDeletingData(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col">
                <DashboardHeader title="Hero Details" />
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-primary" size={40} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading details...</p>
                </div>
            </div>
        );
    }

    if (!tech) {
        return (
            <div className="min-h-screen flex flex-col">
                <DashboardHeader title="Hero Not Found" />
                <div className="flex-1 flex flex-col items-center justify-center gap-6">
                    <p className="text-gray-400">The team member you're looking for doesn't exist.</p>
                    <button onClick={() => router.push('/provider/technicians')} className="text-primary font-black uppercase tracking-widest text-[10px]">Back to Team</button>
                </div>
            </div>
        );
    }

    const joinedDate = tech.created_at ? new Date(tech.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown';

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
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">Remove Hero?</h3>
                                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-4">
                                    You are about to delete <span className="text-red-500">"{tech.full_name}"</span>. This action is permanent.
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
                                    Keep Team Member
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <DashboardHeader
                title={tech.full_name}
                subtitle={`Hero ID: #${tech.id}`}
            >
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/provider/technicians')}
                        className="flex items-center gap-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <ChevronLeft size={20} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Back to Team</span>
                    </button>
                    {/* The edit flow is still handled in the main list's drawer, or we can just view data here. For editing, they can return to the main list. */}
                </div>
            </DashboardHeader>

            <div className="px-8 lg:px-12 max-w-6xl mx-auto w-full space-y-10 animate-in fade-in duration-700">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* Main Information Panel */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-[40px] p-10 border border-white/40 dark:border-white/5 shadow-2xl shadow-black/5 space-y-10 relative overflow-hidden">
                            {/* Decorative background accent */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

                            <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center relative z-10">
                                <div className="w-32 h-32 rounded-3xl overflow-hidden bg-gray-100 dark:bg-white/10 ring-4 ring-white dark:ring-black/20 shadow-xl shrink-0">
                                    {tech.photo_url ? (
                                        <img src={tech.photo_url} alt={tech.full_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl font-black text-gray-300 dark:text-gray-600">
                                            {tech.full_name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-4 flex-1">
                                    <div>
                                        <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">{tech.full_name}</h2>
                                        <div className="flex items-center gap-3 mt-2">
                                            <div className="flex items-center gap-1.5 text-accent">
                                                <Star size={16} fill="currentColor" />
                                                <span className="text-sm font-bold">{tech.rating || 'New'}</span>
                                            </div>
                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border transition-all",
                                                tech.is_active ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-100 dark:border-green-500/20" : "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 border-transparent"
                                            )}>
                                                {tech.is_active ? 'On Duty' : 'Offline'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {tech.specialties?.map(s => (
                                            <span key={s} className="px-4 py-1.5 bg-primary/5 dark:bg-white/5 text-primary dark:text-gray-300 text-[10px] font-black uppercase tracking-widest rounded-xl border border-primary/10 dark:border-white/5">
                                                {s}
                                            </span>
                                        ))}
                                        {(!tech.specialties || tech.specialties.length === 0) && (
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No specialties listed</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-100 dark:border-white/5 relative z-10" />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Phone size={14} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Contact Number</span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white px-1">{tech.phone_number}</p>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <CarFront size={14} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Assigned Vehicle</span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white px-1">
                                        {tech.assigned_vehicle_plate || 'No vehicle assigned'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Status Panel */}
                    <div className="space-y-8">
                        <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-[40px] p-8 border border-white/40 dark:border-white/5 shadow-2xl shadow-black/5 space-y-8">

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <ShieldCheck size={24} />
                                </div>
                                <div className="space-y-1 pt-1">
                                    <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Verification</h4>
                                    <p className="text-[10px] text-gray-400 font-medium">Background checked & approved profile</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-black/20 rounded-3xl p-6 space-y-4 border border-gray-100 dark:border-white/5 text-center">
                                <div className="w-10 h-10 mx-auto bg-white dark:bg-white/5 rounded-full flex items-center justify-center shadow-sm text-gray-400 border border-gray-100 dark:border-white/5">
                                    <Calendar size={16} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Joined Date</p>
                                    <p className="text-xs font-bold text-gray-900 dark:text-white">{joinedDate}</p>
                                </div>
                            </div>

                            <hr className="border-gray-100 dark:border-white/5" />

                            <div className="space-y-4">
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="w-full py-4 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500/5 transition-all"
                                >
                                    <Trash2 size={16} /> Remove Hero
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
