"use client";

import React, { useState } from 'react';
import {
    Check,
    X,
    ExternalLink,
    FileText,
    AlertCircle,
    Search,
    Filter,
    ArrowRight,
    ShieldAlert,
    Calendar
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const pendingProviders = [
    {
        id: 'PR-1024',
        name: 'Abyssinia Motors',
        owner: 'Abebe Solomon',
        date: 'Oct 24, 2024',
        services: ['Mechanical', 'Towing'],
        documents: ['Business License', 'TIN Certificate', 'ID Card'],
        status: 'Pending'
    },
    {
        id: 'PR-1025',
        name: 'Bole Garage',
        owner: 'Selam Kedir',
        date: 'Oct 25, 2024',
        services: ['Tire Change', 'Oil Change'],
        documents: ['Business License', 'TIN Certificate'],
        status: 'In Review'
    },
];

export default function AdminVerificationPage() {
    const [selectedId, setSelectedId] = useState(pendingProviders[0].id);
    const selected = pendingProviders.find(p => p.id === selectedId) || pendingProviders[0];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Provider Verification</h1>
                    <p className="text-gray-500 mt-1">Review and approve partners to maintain platform quality.</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending Review</span>
                        <span className="text-lg font-black text-primary">12 Applications</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* List Area */}
                <div className="w-full lg:w-[400px] space-y-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search providers..."
                            className="w-full pl-12 pr-4 py-4 rounded-3xl border border-gray-100 bg-white shadow-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium text-black"
                        />
                    </div>

                    <div className="space-y-3">
                        {pendingProviders.map((provider) => (
                            <div
                                key={provider.id}
                                onClick={() => setSelectedId(provider.id)}
                                className={cn(
                                    "p-6 rounded-[32px] border-2 transition-all cursor-pointer relative overflow-hidden",
                                    selectedId === provider.id
                                        ? "bg-white border-primary shadow-xl shadow-blue-50"
                                        : "bg-white border-transparent border-gray-50 hover:border-gray-100"
                                )}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 font-bold text-xs uppercase">
                                        {provider.id.split('-')[1]}
                                    </div>
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full",
                                        provider.status === 'Pending' ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"
                                    )}>
                                        {provider.status}
                                    </span>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">{provider.name}</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{provider.owner}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detail Area */}
                <div className="flex-1 space-y-8">
                    <div className="bg-white rounded-[48px] border border-gray-100 shadow-sm p-10 overflow-hidden relative">
                        <div className="flex justify-between items-start mb-10">
                            <div className="flex gap-6 items-center">
                                <div className="w-20 h-20 bg-primary/5 rounded-[32px] flex items-center justify-center text-primary font-black text-2xl">
                                    {selected.id.split('-')[1]}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">{selected.name}</h2>
                                    <p className="text-sm font-bold text-primary italic">“{selected.owner}”</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black text-gray-400 uppercase">Submitted</span>
                                    <span className="text-sm font-bold text-gray-900">{selected.date}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Business Details</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between p-4 bg-gray-50 rounded-2xl">
                                            <span className="text-xs font-bold text-gray-500">Service Category</span>
                                            <span className="text-xs font-black text-gray-900 uppercase">{selected.services.join(', ')}</span>
                                        </div>
                                        <div className="flex justify-between p-4 bg-gray-50 rounded-2xl">
                                            <span className="text-xs font-bold text-gray-500">Document Count</span>
                                            <span className="text-xs font-black text-gray-900">{selected.documents.length} Files</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</h4>
                                    <div className="flex gap-4">
                                        <button className="flex-1 bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-green-100 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
                                            <Check size={18} strokeWidth={3} /> Approve Partner
                                        </button>
                                        <button className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs text-left">
                                            <ShieldAlert size={18} strokeWidth={2} /> Reject
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verification Documents</h4>
                                <div className="space-y-3">
                                    {selected.documents.map((doc) => (
                                        <div key={doc} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-primary transition-all group cursor-pointer shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                                                    <FileText size={20} />
                                                </div>
                                                <span className="text-sm font-bold text-gray-700">{doc}</span>
                                            </div>
                                            <ExternalLink size={16} className="text-gray-300 group-hover:text-primary transition-colors" />
                                        </div>
                                    ))}
                                </div>

                                <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100/50 flex gap-4 items-start">
                                    <AlertCircle className="text-orange-500 shrink-0 mt-0.5" size={20} />
                                    <p className="text-[11px] text-orange-800 font-bold leading-relaxed">
                                        Ensure the TIN number in the document matches the one provided in the application form before final approval.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Grid for Admin context */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Approved</p>
                            <p className="text-2xl font-black text-gray-900">124</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Avg. Review Time</p>
                            <p className="text-2xl font-black text-gray-900">3.5h</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Now</p>
                            <p className="text-2xl font-black text-primary">82</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
