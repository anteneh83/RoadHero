"use client";

import React, { useState } from 'react';
import {
    Search,
    Paperclip,
    Send,
    Phone,
    MoreHorizontal,
    MapPin,
    ChevronRight,
    Plus,
    Bell,
    Check,
    LayoutDashboard
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const contacts = [
    { id: 1, name: 'Yohannes Kassa', initials: 'YK', status: 'Typing...', time: '14:22', online: true },
    { id: 2, name: 'Dawit Isaac', initials: 'DI', status: 'The spare tire is ready.', time: 'Yesterday', online: false },
    { id: 3, name: 'RoadHero Support', initials: '↓', status: 'Verification complete!', time: 'Oct 22', online: false, isSupport: true },
];

const messages = [
    { id: 1, sender: 'Yohannes Kassa', text: "I'm near the big roundabout. Are you dispatching the tow truck now?", time: '14:15', isMe: false },
    { id: 2, sender: 'Me', text: "Yes, Yohannes. Technician Biruk is already en route. ETA is 12 mins.", time: '14:18', isMe: true, isRead: true },
];

export default function MessageCenterPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [selectedContact, setSelectedContact] = useState(contacts[0]);
    const [searchQuery, setSearchQuery] = useState('');
    const [newMessage, setNewMessage] = useState('');

    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;
        window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: "Message sent to " + selectedContact.name, type: 'success' }
        }));
        setNewMessage('');
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-xl font-black text-[#171717] dark:text-white transition-colors">{t('messages')}</h1>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1 transition-colors">Direct support & customer chat</p>
                </div>

                <div className="flex items-center gap-6">
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('open-notifications'))}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors relative"
                    >
                        <Bell size={18} />
                        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 border-2 border-white dark:border-[#0A0A0A] rounded-full"></div>
                    </button>
                    <div className="bg-orange-50 dark:bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-100 dark:border-orange-500/20 shadow-sm transition-colors">
                        <span className="text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">3 New</span>
                    </div>
                </div>
            </div>

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
                        {filteredContacts.map((contact) => (
                            <div
                                key={contact.id}
                                onClick={() => setSelectedContact(contact)}
                                className={cn(
                                    "flex items-center gap-3.5 p-4 rounded-[24px] cursor-pointer transition-all duration-300",
                                    selectedContact.id === contact.id
                                        ? "bg-primary/5 dark:bg-primary/10 ring-1 ring-primary/10 dark:ring-primary/20 shadow-sm"
                                        : "hover:bg-gray-100/50 dark:hover:bg-white/5"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center font-black text-[10px] relative shrink-0 shadow-sm",
                                    contact.isSupport ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"
                                )}>
                                    {contact.initials}
                                    {contact.online && (
                                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-[#0A0A0A] rounded-full"></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h4 className="text-xs font-black text-gray-900 dark:text-white truncate transition-colors">{contact.name}</h4>
                                        <span className="text-[8px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest transition-colors">{contact.time}</span>
                                    </div>
                                    <p className={cn(
                                        "text-[10px] font-medium truncate transition-colors",
                                        contact.status === 'Typing...' ? "text-primary dark:text-accent italic animate-pulse" : "text-gray-400 dark:text-gray-500"
                                    )}>
                                        {contact.status}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Center Canvas: Chat */}
                <div className="flex-1 flex flex-col bg-white dark:bg-white/5 transition-colors">
                    <div className="px-8 py-6 border-b border-gray-50 dark:border-white/5 flex justify-between items-center transition-colors">
                        <div className="flex items-center gap-3.5">
                            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[10px]">
                                {selectedContact.initials}
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-gray-900 dark:text-white leading-none transition-colors">{selectedContact.name}</h3>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                    <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none transition-colors">Online</span>
                                </div>
                            </div>
                        </div>
                        <button className="p-2.5 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                            <Phone size={16} fill="currentColor" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                        {messages.map((msg) => (
                            <div key={msg.id} className={cn("flex flex-col gap-2", msg.isMe ? "items-end" : "items-start")}>
                                <div className={cn(
                                    "max-w-[80%] p-5 rounded-[24px] text-xs leading-relaxed",
                                    msg.isMe
                                        ? "bg-primary text-white rounded-tr-lg shadow-xl shadow-blue-100 dark:shadow-none"
                                        : "bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-gray-200 rounded-tl-lg transition-colors"
                                )}>
                                    <p className="font-medium">{msg.text}</p>
                                </div>
                                <div className="flex items-center gap-2 px-2 transition-colors">
                                    <span className="text-[8px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-widest transition-colors">{msg.time}</span>
                                    {msg.isMe && (
                                        <Check size={10} className={cn(msg.isRead ? "text-blue-400 dark:text-accent" : "text-gray-300 dark:text-gray-700")} strokeWidth={4} />
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        <div className="flex gap-1.5 px-4 animate-pulse">
                            <div className="w-1.5 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full transition-colors"></div>
                            <div className="w-1.5 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full transition-colors"></div>
                            <div className="w-1.5 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full transition-colors"></div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-50 dark:border-white/5 transition-colors">
                        <div className="bg-gray-50/50 dark:bg-white/[0.02] rounded-full px-6 py-2 flex items-center gap-3 group focus-within:bg-white dark:focus-within:bg-white/5 focus-within:ring-4 focus-within:ring-primary/5 dark:focus-within:ring-primary/20 transition-all border border-transparent dark:border-white/5 focus-within:border-gray-100 dark:focus-within:border-white/10">
                            <button className="text-gray-400 hover:text-primary transition-colors">
                                <Paperclip size={18} />
                            </button>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Message..."
                                className="flex-1 bg-transparent border-none outline-none py-2 text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-700 transition-colors"
                            />
                            <button
                                onClick={handleSendMessage}
                                className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-900/10 hover:bg-orange-600 transition-all active:scale-95"
                            >
                                <Send size={16} fill="currentColor" className="ml-0.5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Context */}
                <div className="w-80 flex flex-col p-6 bg-gray-50/30 dark:bg-white/[0.01] rounded-r-[28px] border-l border-gray-50 dark:border-white/5 overflow-y-auto custom-scrollbar transition-colors">
                    <div className="space-y-8">
                        <section className="space-y-4">
                            <h5 className="text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest ml-1 transition-colors">Job Context</h5>
                            <div className="bg-white dark:bg-white/5 rounded-[24px] p-5 shadow-sm border border-gray-50 dark:border-white/5 flex flex-col gap-5 transition-colors">
                                <div className="h-32 bg-gray-100 dark:bg-white/5 rounded-xl overflow-hidden relative transition-colors">
                                    {/* Map Preview */}
                                    <div className="absolute inset-0 bg-[#E5E7EB] opacity-50"></div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-secondary rounded-full ring-4 ring-orange-100"></div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-gray-900 dark:text-white leading-tight transition-colors">Towing Request</h4>
                                    <p className="text-[9px] font-black text-primary dark:text-accent uppercase tracking-widest mt-1 transition-colors">#RH-8921</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-widest transition-colors">Vehicle</p>
                                    <p className="text-xs font-black text-gray-900 dark:text-white transition-colors">Toyota Hilux</p>
                                </div>
                                <button
                                    onClick={() => router.push('/provider/tracker')}
                                    className="w-full h-10 bg-white dark:bg-white/5 border border-primary dark:border-primary/40 text-[9px] font-black text-primary dark:text-white uppercase tracking-widest rounded-xl hover:bg-primary/5 dark:hover:bg-primary/20 transition-all"
                                >
                                    Track Live
                                </button>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h5 className="text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest ml-1 transition-colors">Photos</h5>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="aspect-square bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-gray-300 dark:text-gray-700 cursor-pointer hover:bg-gray-200 dark:hover:bg-white/10 transition-all border border-dashed border-gray-200 dark:border-white/10">
                                    <Plus size={18} />
                                </div>
                                <div className="aspect-square bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-gray-300 dark:text-gray-700 cursor-pointer hover:bg-gray-200 dark:hover:bg-white/10 transition-all border border-dashed border-gray-200 dark:border-white/10">
                                    <Plus size={18} />
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
