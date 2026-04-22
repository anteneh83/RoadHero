"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import {
    Search,
    Paperclip,
    Send,
    Phone,
    Bell,
    Check,
    Loader2
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { jobService, Job, Message } from '@/services/api.service';
import { DashboardHeader } from '@/components/DashboardHeader';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

function MessageCenterContent() {
    const { t } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();
    const jobIdParam = searchParams.get('jobId');

    const [activeJobs, setActiveJobs] = useState<Job[]>([]);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [messagesLoading, setMessagesLoading] = useState(false);

    const fetchJobs = useCallback(async () => {
        try {
            setLoading(true);
            // Fetch jobs that are currently active or recently completed for context
            const response = await jobService.list();
            // Data is in response.data or response depending on API structure.
            // Based on api.service.ts, it returns response.data
            const jobs = response.data || response;

            // Filter for jobs that are likely to have active chat
            const filtered = jobs.filter((j: Job) =>
                ['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(j.status)
            );

            setActiveJobs(filtered);

            // Auto-select job from URL or first available
            if (jobIdParam) {
                const job = filtered.find((j: Job) => j.id === parseInt(jobIdParam));
                if (job) setSelectedJob(job);
            } else if (filtered.length > 0 && !selectedJob) {
                setSelectedJob(filtered[0]);
            }
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        } finally {
            setLoading(false);
        }
    }, [jobIdParam, selectedJob]);

    const fetchMessages = useCallback(async (jobId: number, currentCustomerName?: string) => {
        try {
            setMessagesLoading(true);
            const response = await jobService.getMessages(jobId);
            const rawMessages = response.data || response || [];

            if (currentCustomerName) {
                // Dynamically deduce if the message is from the provider by checking if it isn't the customer
                const mappedMessages = rawMessages.map((msg: any) => ({
                    ...msg,
                    is_me: msg.sender_name !== currentCustomerName
                }));
                setMessages(mappedMessages);
            } else {
                setMessages(rawMessages);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setMessagesLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    useEffect(() => {
        if (selectedJob) {
            fetchMessages(selectedJob.id, selectedJob.customer_name);

            // Poll for new messages every 10 seconds
            const interval = setInterval(() => {
                fetchMessages(selectedJob.id, selectedJob.customer_name);
            }, 10000);

            return () => clearInterval(interval);
        }
    }, [selectedJob, fetchMessages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedJob || sending) return;

        try {
            setSending(true);
            await jobService.sendMessage(selectedJob.id, { content: newMessage });

            // Optimistic update
            const tempMsg: Message = {
                id: Date.now(),
                sender_name: 'Me',
                content: newMessage,
                created_at: new Date().toISOString(),
                is_me: true
            };
            setMessages(prev => [...prev, tempMsg]);
            setNewMessage('');

            // Re-fetch to sync with server
            fetchMessages(selectedJob.id);
        } catch (error) {
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Failed to send message", type: 'error' }
            }));
        } finally {
            setSending(false);
        }
    };

    const filteredContacts = activeJobs.filter(j =>
        (j.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.id.toString().includes(searchQuery)
    );

    const getInitials = (name?: string) => {
        if (!name) return 'UN';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const getRelativeTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.round(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.round(diffMins / 60)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="flex flex-col min-h-screen">
            <DashboardHeader
                title={t('messages')}
                subtitle="Direct support & customer chat"
            />

            <div className="flex-1 p-8 lg:p-12 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 min-h-0">

                <div className="flex-1 flex gap-6 min-h-0 bg-white dark:bg-white/5 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden p-1.5 transition-colors">
                    {/* Left Sidebar: Contacts */}
                    <div className="w-72 flex flex-col border-r border-gray-50 dark:border-white/5 bg-gray-50/20 dark:bg-white/[0.02] rounded-l-[28px] transition-colors">
                        <div className="p-4">
                            <div className="relative group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 group-focus-within:text-primary transition-colors" size={14} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full pl-12 pr-5 py-3 rounded-xl bg-white dark:bg-white/5 border border-transparent dark:border-white/5 shadow-sm outline-none focus:ring-4 focus:ring-primary/5 dark:focus:ring-primary/20 transition-all text-[11px] font-medium text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-700"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-2 space-y-1.5 custom-scrollbar">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-40 gap-3">
                                    <Loader2 className="animate-spin text-primary" size={24} />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Loading chats...</span>
                                </div>
                            ) : filteredContacts.length > 0 ? (
                                filteredContacts.map((job) => (
                                    <div
                                        key={job.id}
                                        onClick={() => setSelectedJob(job)}
                                        className={cn(
                                            "flex items-center gap-3.5 p-4 rounded-[24px] cursor-pointer transition-all duration-300",
                                            selectedJob?.id === job.id
                                                ? "bg-primary/5 dark:bg-primary/10 ring-1 ring-primary/10 dark:ring-primary/20 shadow-sm"
                                                : "hover:bg-gray-100/50 dark:hover:bg-white/5"
                                        )}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[10px] relative shrink-0 shadow-sm">
                                            {getInitials(job.customer_name)}
                                            {job.status === 'IN_PROGRESS' && (
                                                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-[#0A0A0A] rounded-full"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <h4 className="text-xs font-black text-gray-900 dark:text-white truncate transition-colors">{job.customer_name}</h4>
                                                <span className="text-[8px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest transition-colors">#{job.id}</span>
                                            </div>
                                            <p className="text-[10px] font-medium truncate text-gray-400 dark:text-gray-500 transition-colors">
                                                {job.service_type} • {job.status}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No active chats</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Center Canvas: Chat */}
                    <div className="flex-1 flex flex-col bg-white dark:bg-white/5 transition-colors">
                        {selectedJob ? (
                            <>
                                <div className="px-8 py-6 border-b border-gray-50 dark:border-white/5 flex justify-between items-center transition-colors">
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[10px]">
                                            {getInitials(selectedJob.customer_name)}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-gray-900 dark:text-white leading-none transition-colors">{selectedJob.customer_name}</h3>
                                            <div className="flex items-center gap-1.5 mt-1.5">
                                                <div className={cn("w-1.5 h-1.5 rounded-full", selectedJob.status === 'COMPLETED' ? "bg-gray-400" : "bg-green-500")}></div>
                                                <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none transition-colors">
                                                    {selectedJob.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="p-2.5 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                                        <Phone size={16} fill="currentColor" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                                    {messagesLoading && messages.length === 0 ? (
                                        <div className="flex justify-center py-10">
                                            <Loader2 className="animate-spin text-primary" size={24} />
                                        </div>
                                    ) : messages.length > 0 ? (
                                        messages.map((msg) => (
                                            <div key={msg.id} className={cn("flex flex-col gap-2", msg.is_me ? "items-end" : "items-start")}>
                                                <div className={cn(
                                                    "max-w-[80%] p-5 rounded-[24px] text-xs leading-relaxed",
                                                    msg.is_me
                                                        ? "bg-primary text-white rounded-tr-lg shadow-xl shadow-blue-100 dark:shadow-none"
                                                        : "bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-gray-200 rounded-tl-lg transition-colors"
                                                )}>
                                                    <p className="font-medium">{msg.content}</p>
                                                </div>
                                                <div className="flex items-center gap-2 px-2 transition-colors">
                                                    <span className="text-[8px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-widest transition-colors">
                                                        {getRelativeTime(msg.created_at)}
                                                    </span>
                                                    {msg.is_me && (
                                                        <Check size={10} className="text-blue-400 dark:text-accent" strokeWidth={4} />
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full opacity-30 text-center grayscale">
                                            <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                                                <Send size={24} />
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Start the conversation</p>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 border-t border-gray-50 dark:border-white/5 transition-colors">
                                    <form
                                        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                                        className="bg-gray-50/50 dark:bg-white/[0.02] rounded-full px-6 py-2 flex items-center gap-3 group focus-within:bg-white dark:focus-within:bg-white/5 focus-within:ring-4 focus-within:ring-primary/5 dark:focus-within:ring-primary/20 transition-all border border-transparent dark:border-white/5 focus-within:border-gray-100 dark:focus-within:border-white/10"
                                    >
                                        <button type="button" className="text-gray-400 hover:text-primary transition-colors">
                                            <Paperclip size={18} />
                                        </button>
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Message..."
                                            className="flex-1 bg-transparent border-none outline-none py-2 text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-700 transition-colors"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim() || sending}
                                            className={cn(
                                                "w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-900/10 hover:bg-orange-600 transition-all active:scale-95",
                                                (!newMessage.trim() || sending) && "opacity-50 cursor-not-allowed scale-90"
                                            )}
                                        >
                                            {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} fill="currentColor" className="ml-0.5" />}
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                                <div className="w-20 h-20 bg-primary/5 dark:bg-primary/10 rounded-[32px] flex items-center justify-center mb-6">
                                    <Loader2 className="text-primary animate-pulse" size={32} />
                                </div>
                                <h3 className="text-sm font-black text-gray-900 dark:text-white mb-2 uppercase tracking-widest transition-colors">Select a Conversation</h3>
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] max-w-[200px] leading-relaxed transition-colors">
                                    Choose a job from the left to start messaging the customer
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar: Context */}
                    <div className="w-80 flex flex-col p-6 bg-gray-50/30 dark:bg-white/[0.01] rounded-r-[28px] border-l border-gray-50 dark:border-white/5 overflow-y-auto custom-scrollbar transition-colors">
                        <div className="space-y-8">
                            {selectedJob && (
                                <section className="space-y-4">
                                    <h5 className="text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest ml-1 transition-colors">Job Context</h5>
                                    <div className="bg-white dark:bg-white/5 rounded-[24px] p-5 shadow-sm border border-gray-50 dark:border-white/5 flex flex-col gap-5 transition-colors">
                                        <div className="h-32 bg-gray-100 dark:bg-white/5 rounded-xl overflow-hidden relative transition-colors">
                                            <div className="absolute inset-0 bg-[#E5E7EB] opacity-50 flex items-center justify-center overflow-hidden">
                                                {/* Minimalistic Map Pattern */}
                                                <div className="w-full h-full opacity-20 bg-[radial-gradient(#00C1F7_1px,transparent_1px)] [background-size:20px_20px]"></div>
                                            </div>
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-secondary rounded-full ring-4 ring-orange-100 dark:ring-orange-500/20 shadow-lg"></div>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-gray-900 dark:text-white leading-tight transition-colors">{selectedJob.service_type}</h4>
                                            <p className="text-[9px] font-black text-primary dark:text-accent uppercase tracking-widest mt-1 transition-colors">#RH-{selectedJob.id}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-widest transition-colors">Vehicle Info</p>
                                            <p className="text-xs font-black text-gray-900 dark:text-white transition-colors">{selectedJob.vehicle_details || 'No details provided'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-widest transition-colors">Created At</p>
                                            <p className="text-xs font-black text-gray-900 dark:text-white transition-colors">{new Date(selectedJob.created_at).toLocaleString()}</p>
                                        </div>
                                        <button
                                            onClick={() => router.push(`/provider/tracker?jobId=${selectedJob.id}`)}
                                            className="w-full h-10 bg-white dark:bg-white/5 border border-primary dark:border-primary/40 text-[9px] font-black text-primary dark:text-white uppercase tracking-widest rounded-xl hover:bg-primary/5 dark:hover:bg-primary/20 transition-all"
                                        >
                                            Track Live
                                        </button>
                                    </div>
                                </section>
                            )}

                            <section className="space-y-4">
                                <h5 className="text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest ml-1 transition-colors">System Support</h5>
                                <div
                                    onClick={() => router.push('/support')}
                                    className="bg-orange-50 dark:bg-orange-500/5 rounded-[24px] p-5 cursor-pointer hover:scale-[0.98] transition-all border border-orange-100 dark:border-orange-500/10"
                                >
                                    <p className="text-xs font-black text-orange-900 dark:text-orange-400 transition-colors">Need Help?</p>
                                    <p className="text-[9px] font-medium text-orange-700 dark:text-orange-500/60 mt-1 leading-relaxed transition-colors">Contact RoadHero Support for any issues regarding this job.</p>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function MessageCenterPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Support Center...</p>
            </div>
        }>
            <MessageCenterContent />
        </Suspense>
    );
}
