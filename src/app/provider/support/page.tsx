"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    Search,
    MessageSquare,
    AlertCircle,
    Send,
    Loader2,
    CheckCircle,
    Paperclip,
    Archive,
    Check,
    Clock,
    User,
    FileText
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { DashboardHeader } from '@/components/DashboardHeader';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supportService, SupportThread, SupportMessage } from '@/services/api.service';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function SupportPage() {
    const { t } = useLanguage();

    const [threads, setThreads] = useState<SupportThread[]>([]);
    const [activeFilter, setActiveFilter] = useState<'ALL' | 'OPEN' | 'RESOLVED' | 'CLOSED'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoadingThreads, setIsLoadingThreads] = useState(true);

    const [selectedThread, setSelectedThread] = useState<SupportThread | null>(null);
    const [messages, setMessages] = useState<SupportMessage[]>([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isResolving, setIsResolving] = useState(false);

    // NEW THREAD MODAL
    const [isNewThreadModalOpen, setIsNewThreadModalOpen] = useState(false);
    const [ntParticipantId, setNtParticipantId] = useState('');
    const [ntType, setNtType] = useState<'SUPPORT' | 'DISPUTE'>('SUPPORT');
    const [ntSubject, setNtSubject] = useState('');
    const [ntJobId, setNtJobId] = useState('');
    const [ntMessage, setNtMessage] = useState('');
    const [isCreatingThread, setIsCreatingThread] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchThreads();
    }, [activeFilter]);

    useEffect(() => {
        if (selectedThread) {
            fetchMessages(selectedThread.id);
        } else {
            setMessages([]);
        }
    }, [selectedThread]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchThreads = async () => {
        setIsLoadingThreads(true);
        try {
            const filterMap: Record<string, 'OPEN' | 'RESOLVED' | 'CLOSED' | undefined> = {
                'OPEN': 'OPEN',
                'RESOLVED': 'RESOLVED',
                'CLOSED': 'CLOSED',
                'ALL': undefined
            };
            const response = await supportService.listThreads(filterMap[activeFilter]);
            const data = response.data || response;
            setThreads(Array.isArray(data) ? data : []);
        } catch (error: any) {
            console.error("[Support] Error fetching threads:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Failed to load support threads", type: 'error' }
            }));
        } finally {
            setIsLoadingThreads(false);
        }
    };

    const fetchMessages = async (threadId: number) => {
        setIsLoadingMessages(true);
        try {
            const response = await supportService.getMessages(threadId);
            const data = response.data || response;
            // Depending on architecture, data might be { messages: [] } or just []
            const msgList = data.messages ? data.messages : (Array.isArray(data) ? data : []);
            setMessages(msgList);
        } catch (error: any) {
            console.error("[Support] Error fetching messages:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Failed to load messages", type: 'error' }
            }));
        } finally {
            setIsLoadingMessages(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedThread || !newMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            await supportService.sendMessage(selectedThread.id, { content: newMessage });
            setNewMessage('');
            await fetchMessages(selectedThread.id);
        } catch (error: any) {
            console.error("[Support] Send Message Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Failed to send message", type: 'error' }
            }));
        } finally {
            setIsSending(false);
        }
    };

    const handleResolveThread = async () => {
        if (!selectedThread || isResolving) return;
        setIsResolving(true);
        try {
            await supportService.resolveThread(selectedThread.id, { resolution_note: "Resolved by provider" });
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Thread resolved successfully", type: 'success' }
            }));

            // Re-fetch threads to update status visually
            await fetchThreads();
            const updated = threads.find(t => t.id === selectedThread.id);
            if (updated) {
                setSelectedThread({ ...updated, status: 'RESOLVED' });
            } else {
                setSelectedThread(null);
            }
        } catch (error: any) {
            console.error("[Support] Resolve Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: error.response?.data?.message || "Failed to resolve thread", type: 'error' }
            }));
        } finally {
            setIsResolving(false);
        }
    };

    const handleCreateThread = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ntParticipantId || !ntMessage || isCreatingThread) return;

        setIsCreatingThread(true);
        try {
            await supportService.createThread({
                participant_id: parseInt(ntParticipantId),
                thread_type: ntType,
                subject: ntSubject || undefined,
                related_job_id: ntJobId ? parseInt(ntJobId) : undefined,
                message: ntMessage
            });
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Thread created successfully", type: 'success' }
            }));
            setIsNewThreadModalOpen(false);

            // clear form
            setNtParticipantId('');
            setNtSubject('');
            setNtJobId('');
            setNtMessage('');

            // refresh
            setActiveFilter('ALL');
            fetchThreads();
        } catch (error: any) {
            console.error("[Support] Create Thread Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: error.response?.data?.message || "Failed to create thread", type: 'error' }
            }));
        } finally {
            setIsCreatingThread(false);
        }
    };

    const filteredThreads = threads.filter(thread =>
        (thread.subject?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
        (thread.other_party?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || '')
    );

    const isThreadClosed = selectedThread?.status === 'RESOLVED' || selectedThread?.status === 'CLOSED';

    return (
        <div className="flex flex-col min-h-screen">
            <DashboardHeader
                title="Support & Disputes"
                subtitle="Manage support threads, respond to conflicts, and resolve issues."
            />

            <div className="flex-1 p-8 lg:p-12 animate-in fade-in duration-1000">
                <div className="bg-white dark:bg-white/5 rounded-[40px] border border-gray-100 dark:border-white/5 shadow-2xl shadow-black/5 overflow-hidden flex h-[calc(100vh-200px)]">

                    {/* LEFT PANEL: Filters + Thread List */}
                    <div className="w-96 flex flex-col border-r border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#080808]">
                        <div className="p-6 space-y-4">
                            <button
                                onClick={() => setIsNewThreadModalOpen(true)}
                                className="w-full py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2"
                            >
                                <MessageSquare size={16} /> Open New Thread
                            </button>

                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={16} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search threads..."
                                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                                />
                            </div>

                            <div className="flex bg-white dark:bg-white/5 p-1 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm overflow-x-auto scrollbar-none">
                                {['ALL', 'OPEN', 'RESOLVED', 'CLOSED'].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setActiveFilter(f as any)}
                                        className={cn(
                                            "flex-1 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                            activeFilter === f ? "bg-primary text-white shadow-md" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        )}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-2">
                            {isLoadingThreads ? (
                                <div className="p-10 flex justify-center">
                                    <Loader2 className="animate-spin text-primary" size={24} />
                                </div>
                            ) : filteredThreads.length === 0 ? (
                                <div className="p-10 text-center">
                                    <MessageSquare size={32} className="mx-auto text-gray-200 dark:text-gray-800 mb-3" />
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Threads Found</p>
                                </div>
                            ) : (
                                filteredThreads.map(thread => (
                                    <button
                                        key={thread.id}
                                        onClick={() => setSelectedThread(thread)}
                                        className={cn(
                                            "w-full text-left p-4 rounded-2xl transition-all block border",
                                            selectedThread?.id === thread.id
                                                ? "bg-white dark:bg-white/10 border-primary/20 dark:border-primary/40 shadow-sm"
                                                : "bg-transparent border-transparent hover:bg-white/60 dark:hover:bg-white/5"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                {thread.thread_type === 'DISPUTE' ? (
                                                    <AlertCircle size={14} className="text-red-500" />
                                                ) : (
                                                    <MessageSquare size={14} className="text-blue-500" />
                                                )}
                                                <span className="text-[10px] font-black text-gray-900 dark:text-white truncate max-w-[150px]">
                                                    {thread.subject || 'Support Ticket'}
                                                </span>
                                            </div>
                                            <span className="text-[9px] font-bold text-gray-400">
                                                {new Date(thread.last_message_at || thread.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 truncate pr-2">
                                                {thread.other_party?.name || 'Unknown User'}
                                            </p>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                                                thread.status === 'OPEN' ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" :
                                                    thread.status === 'RESOLVED' ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" :
                                                        "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                            )}>
                                                {thread.status}
                                            </span>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* RIGHT PANEL: Chat Area */}
                    <div className="flex-1 flex flex-col bg-white dark:bg-[#0A0A0A]">
                        {selectedThread ? (
                            <>
                                {/* Chat Header */}
                                <div className="px-8 py-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-white dark:bg-[#0A0A0A] z-10 shadow-sm relative">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg",
                                            selectedThread.thread_type === 'DISPUTE' ? "bg-red-50 dark:bg-red-500/10 text-red-500" : "bg-blue-50 dark:bg-blue-500/10 text-blue-500"
                                        )}>
                                            {selectedThread.other_party?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-gray-900 dark:text-white tracking-tight">
                                                {selectedThread.subject || 'Support Ticket'}
                                            </h3>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                                ID: #{selectedThread.id} • {selectedThread.other_party?.name} ({selectedThread.other_party?.role})
                                                {selectedThread.related_job_id ? ` • Job: #${selectedThread.related_job_id}` : ''}
                                            </p>
                                        </div>
                                    </div>

                                    {selectedThread.status === 'OPEN' && (
                                        <button
                                            onClick={handleResolveThread}
                                            disabled={isResolving}
                                            className="px-6 py-3 bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
                                        >
                                            {isResolving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                            Resolve Issue
                                        </button>
                                    )}
                                </div>

                                {/* Chat Messages Log */}
                                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/30 dark:bg-transparent">
                                    {isLoadingMessages ? (
                                        <div className="flex justify-center p-10">
                                            <Loader2 className="animate-spin text-primary" size={32} />
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="text-center">
                                                <Archive size={32} className="mx-auto text-gray-200 dark:text-gray-800 mb-4" />
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No messages in this thread yet.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        messages.map((msg, idx) => {
                                            const isProvider = msg.sender.role === 'SERVICE_PROVIDER' || msg.sender.role === 'ADMIN';
                                            return (
                                                <div key={msg.id || idx} className={cn(
                                                    "max-w-[70%] animate-in slide-in-from-bottom-2 duration-300",
                                                    isProvider ? "ml-auto" : "mr-auto"
                                                )}>
                                                    <div className={cn(
                                                        "flex items-center gap-2 mb-1.5",
                                                        isProvider ? "justify-end" : "justify-start"
                                                    )}>
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{msg.sender.name}</span>
                                                        <span className="text-[8px] font-medium text-gray-300 dark:text-gray-600">
                                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <div className={cn(
                                                        "p-4 rounded-2xl text-sm font-medium shadow-sm transition-all",
                                                        isProvider
                                                            ? "bg-primary text-white rounded-br-none"
                                                            : "bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 text-gray-800 dark:text-white rounded-bl-none"
                                                    )}>
                                                        {msg.content}
                                                        {msg.attachment_url && (
                                                            <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10 flex items-center gap-2">
                                                                <Paperclip size={14} className="opacity-50" />
                                                                <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold underline opacity-80 hover:opacity-100">Attached File</a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Chat Input Hub */}
                                <form onSubmit={handleSendMessage} className="p-6 bg-white dark:bg-[#0A0A0A] border-t border-gray-100 dark:border-white/5 relative z-10">
                                    {isThreadClosed ? (
                                        <div className="w-full py-4 text-center bg-gray-50 py-4 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">This thread has been {selectedThread.status.toLowerCase()}.</p>
                                        </div>
                                    ) : (
                                        <div className="relative flex items-center">
                                            <input
                                                type="text"
                                                disabled={isSending}
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Type your reply here..."
                                                className="w-full bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl pl-6 pr-20 py-4 text-sm font-medium text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-inner disabled:opacity-50"
                                            />
                                            <button
                                                type="submit"
                                                disabled={isSending || !newMessage.trim()}
                                                className="absolute right-3 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 shadow-xl shadow-primary/20"
                                            >
                                                {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-10 animate-in zoom-in-95 duration-500">
                                <div className="w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-[40px] flex items-center justify-center border-4 border-dashed border-gray-100 dark:border-white/5 mb-6">
                                    <MessageSquare size={32} className="text-gray-200 dark:text-gray-800" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Select a Support Thread</h3>
                                <p className="text-xs font-medium text-gray-500 max-w-xs">Pick a thread from the left or open a new one to communicate with drivers and resolve disputes.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* NEW THREAD MODAL */}
            {isNewThreadModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in zoom-in duration-300">
                    <div className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => !isCreatingThread && setIsNewThreadModalOpen(false)}></div>
                    <div className="bg-white dark:bg-[#151515] w-full max-w-lg rounded-[40px] shadow-2xl border border-gray-100 dark:border-white/10 p-10 relative z-10">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6">Open Support Thread</h2>
                        <form onSubmit={handleCreateThread} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Driver ID *</label>
                                    <input required type="number" value={ntParticipantId} onChange={e => setNtParticipantId(e.target.value)} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 transition-all" placeholder="ID (e.g. 10)" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Thread Type</label>
                                    <select value={ntType} onChange={e => setNtType(e.target.value as any)} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 transition-all appearance-none">
                                        <option value="SUPPORT">Support</option>
                                        <option value="DISPUTE">Dispute</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Subject</label>
                                    <input type="text" value={ntSubject} onChange={e => setNtSubject(e.target.value)} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 transition-all" placeholder="Follow-up on service..." />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Related Job ID</label>
                                    <input type="number" value={ntJobId} onChange={e => setNtJobId(e.target.value)} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 transition-all" placeholder="42" />
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Initial Message *</label>
                                <textarea required value={ntMessage} onChange={e => setNtMessage(e.target.value)} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none min-h-[100px]" placeholder="Explain the issue or support request clearly..." />
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button type="button" onClick={() => setIsNewThreadModalOpen(false)} className="flex-1 py-4 bg-gray-50 text-gray-600 dark:bg-white/5 dark:text-gray-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-white/10 transition-all">Cancel</button>
                                <button type="submit" disabled={isCreatingThread || !ntParticipantId || !ntMessage} className="flex-1 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 flex justify-center items-center gap-2">
                                    {isCreatingThread ? <Loader2 size={16} className="animate-spin" /> : <><Check size={16} /> Open Thread</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
