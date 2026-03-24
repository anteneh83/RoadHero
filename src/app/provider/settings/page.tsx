"use client";

import React, { useState } from 'react';
import {
    User,
    Camera,
    Settings,
    ShieldCheck,
    Bell,
    HelpCircle,
    Plus,
    X,
    Facebook,
    Navigation,
    Lock,
    Save,
    Trash2,
    AlertCircle,
    ArrowUpRight,
    Loader2
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { providerService, ProfileSettingsPayload, ProfileData } from '@/services/api.service';
import { useEffect } from 'react';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const NotificationItem = ({ title, desc, active, onToggle }: { title: string, desc: string, active: boolean, onToggle: () => void }) => (
    <div className="flex items-center justify-between p-6 rounded-[28px] bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-primary/20 dark:hover:border-primary/40 transition-all group">
        <div className="space-y-1">
            <h4 className="text-sm font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors">{title}</h4>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500">{desc}</p>
        </div>
        <button
            onClick={onToggle}
            className={cn(
                "w-12 h-6 rounded-full relative transition-colors duration-500",
                active ? "bg-accent shadow-lg shadow-orange-500/20" : "bg-gray-200 dark:bg-white/10"
            )}
        >
            <div className={cn(
                "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-500 shadow-sm",
                active ? "translate-x-7" : "translate-x-1"
            )}></div>
        </button>
    </div>
);

type Tab = 'general' | 'gallery' | 'security' | 'notifications';

export default function SettingsPage() {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<Tab>('general');
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [publicPhone, setPublicPhone] = useState('');
    const [addressInstructions, setAddressInstructions] = useState('');
    const [facebookUrl, setFacebookUrl] = useState('');
    const [telegramChannel, setTelegramChannel] = useState('');
    const [profile, setProfile] = useState<ProfileData | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await providerService.getProfile();
                if (response.status === 'success' || response.success) {
                    const data: ProfileData = response.data;
                    setProfile(data);
                    setPublicPhone(data.public_phone || '');
                    setAddressInstructions(data.address_instructions || '');
                    setFacebookUrl(data.facebook_url || '');
                    setTelegramChannel(data.telegram_channel || '');
                    if (data.gallery_urls) {
                        setPhotos(data.gallery_urls.map((url, index) => ({ id: index, url })));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch profile settings:", error);
            }
        };

        fetchProfile();
    }, []);

    // Gallery State
    const [photos, setPhotos] = useState([
        { id: 1, url: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&q=80&w=800' },
        { id: 2, url: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&q=80&w=800' },
        { id: 3, url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800' },
    ]);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleAddPhoto = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPhotos(prev => [...prev, { id: Date.now(), url }]);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: "Photo added to gallery successfully!", type: 'success' }
            }));
        }
    };

    const handleDeletePhoto = (id: number) => {
        setPhotos(prev => prev.filter(p => p.id !== id));
        setUnsavedChanges(true); // Mark changes as unsaved
        window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: "Photo removed from gallery", type: 'info' }
        }));
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            const payload: ProfileSettingsPayload = {
                public_phone: publicPhone,
                address_instructions: addressInstructions,
                facebook_url: facebookUrl,
                telegram_channel: telegramChannel,
                gallery_urls: photos.map(p => p.url)
            };

            console.log("[Profile Settings] Saving Payload:", payload);

            const response = await providerService.updateProfileSettings(payload);
            console.log("[Profile Settings] API Response:", response);

            if (response.status === 'success' || response.success === true) {
                console.log("[Profile Settings] Successfully updated profile.");
                setUnsavedChanges(false);
                window.dispatchEvent(new CustomEvent('show-toast', {
                    detail: { message: response.message || "Settings saved successfully", type: 'success' }
                }));
            } else {
                console.warn("[Profile Settings] Response received but status was not 'success':", response);
                throw new Error(response.message || "Failed to save settings");
            }
        } catch (error: any) {
            console.error("[Profile Settings] Error:", error);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: error.response?.data?.message || error.message || "Failed to save settings", type: 'error' }
            }));
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: 'general', name: t('settings'), icon: User },
        { id: 'gallery', name: t('garage_gallery'), icon: Camera },
        { id: 'security', name: t('security_login'), icon: ShieldCheck },
        { id: 'notifications', name: t('notifications'), icon: Bell },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general':
            case 'gallery':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
                        {/* Photo Gallery Section */}
                        <section className="bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-[32px] border border-white/40 dark:border-white/5 p-8 space-y-6 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-700">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h3 className="text-base font-black text-gray-900 dark:text-white leading-tight transition-colors">{t('garage_gallery')}</h3>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">{t('showcase_shop')}</p>
                                </div>
                                <div className="w-10 h-10 bg-primary/5 dark:bg-accent/10 rounded-xl flex items-center justify-center text-primary dark:text-accent transition-colors">
                                    <Camera size={18} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                                {photos.map((photo) => (
                                    <div key={photo.id} className="aspect-square bg-gray-50 rounded-[24px] overflow-hidden border border-gray-100 relative group shadow-inner">
                                        <img src={photo.url} alt="Garage" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4 backdrop-blur-sm">
                                            <button
                                                onClick={() => handleDeletePhoto(photo.id)}
                                                className="bg-red-500 text-white p-2.5 rounded-2xl scale-75 group-hover:scale-100 transition-all shadow-xl shadow-red-900/40 active:scale-90"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={handleAddPhoto}
                                    className="aspect-square bg-white dark:bg-white/5 border-2 border-dashed border-gray-100 dark:border-white/10 rounded-[24px] flex flex-col items-center justify-center gap-3 group cursor-pointer hover:border-primary/50 dark:hover:border-accent/50 hover:bg-primary/5 dark:hover:bg-accent/5 transition-all duration-500"
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                    <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-300 dark:text-gray-600 group-hover:bg-primary dark:group-hover:bg-accent group-hover:text-white transition-all shadow-inner">
                                        <Plus size={20} className="group-hover:scale-110 transition-transform" />
                                    </div>
                                    <p className="text-[9px] font-black text-primary dark:text-accent uppercase tracking-[0.2em]">Add Photo</p>
                                </button>
                            </div>
                        </section>

                        {/* Public Contact & Address Section */}
                        <section className="bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-[32px] border border-white/40 dark:border-white/5 p-10 space-y-10 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-700">
                            <div className="flex items-center gap-4">
                                <div className="w-1.5 h-6 bg-primary dark:bg-accent rounded-full transition-colors"></div>
                                <h3 className="text-base font-black text-gray-900 dark:text-white leading-tight transition-colors">Public Contact & Address</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 transition-colors">Public Support Phone</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={publicPhone}
                                            onChange={(e) => {
                                                setPublicPhone(e.target.value);
                                                setUnsavedChanges(true);
                                            }}
                                            className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-gray-900 dark:text-white outline-none focus:ring-8 focus:ring-primary/5 dark:focus:ring-accent/10 focus:border-primary/20 dark:focus:border-accent/40 transition-all shadow-sm"
                                        />
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.5)] transition-all"></div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 transition-colors">Location Details</label>
                                    <div className="relative">
                                        <textarea
                                            rows={2}
                                            value={addressInstructions}
                                            onChange={(e) => {
                                                setAddressInstructions(e.target.value);
                                                setUnsavedChanges(true);
                                            }}
                                            className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-medium text-gray-900 dark:text-white outline-none focus:ring-8 focus:ring-primary/5 dark:focus:ring-accent/10 focus:border-primary/20 dark:focus:border-accent/40 transition-all resize-none shadow-sm pb-10"
                                        />
                                        <div className="absolute right-5 bottom-4 flex items-center gap-2">
                                            <Navigation size={12} className="text-primary dark:text-accent" />
                                            <span className="text-[8px] font-black text-primary dark:text-accent uppercase tracking-widest transition-colors">Map Link Active</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 transition-colors">Facebook URL</label>
                                    <input
                                        type="text"
                                        value={facebookUrl}
                                        placeholder="https://facebook.com/your-business"
                                        onChange={(e) => {
                                            setFacebookUrl(e.target.value);
                                            setUnsavedChanges(true);
                                        }}
                                        className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-medium text-gray-900 dark:text-white outline-none focus:ring-8 focus:ring-primary/5 transition-all shadow-sm"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 transition-colors">Telegram Channel</label>
                                    <input
                                        type="text"
                                        value={telegramChannel}
                                        placeholder="https://t.me/your-channel"
                                        onChange={(e) => {
                                            setTelegramChannel(e.target.value);
                                            setUnsavedChanges(true);
                                        }}
                                        className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-medium text-gray-900 dark:text-white outline-none focus:ring-8 focus:ring-primary/5 transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </section>
                    </div>
                );
            case 'security':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
                        <section className="bg-white dark:bg-white/5 backdrop-blur-md rounded-[32px] border border-gray-100 dark:border-white/5 p-8 space-y-6 transition-colors">
                            <div className="space-y-1">
                                <h3 className="text-base font-black text-gray-900 dark:text-white leading-tight transition-colors">Change Password</h3>
                                <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 transition-colors">Ensure your account is using a long, random password to stay secure.</p>
                            </div>

                            <div className="max-w-xl space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 transition-colors">Current Password</label>
                                    <input
                                        type="password"
                                        defaultValue="************"
                                        className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 dark:focus:ring-accent/10 transition-all"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 transition-colors">New Password</label>
                                    <input
                                        type="password"
                                        defaultValue="StrongPass123!"
                                        className="w-full bg-white dark:bg-white/5 border-2 border-primary/20 dark:border-primary/40 rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-primary dark:focus:border-accent focus:ring-4 focus:ring-primary/5 dark:focus:ring-accent/10 transition-all"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 transition-colors">Confirm New Password</label>
                                    <input
                                        type="password"
                                        defaultValue="StrongPass123!"
                                        className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 dark:focus:ring-accent/10 transition-all"
                                    />
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button className="bg-primary dark:bg-accent text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-900/10 dark:shadow-none hover:bg-blue-950 dark:hover:bg-accent/80 transition-all active:scale-95">
                                        Update Password
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                );
            case 'notifications':
                return (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700 pb-20">
                        {/* Summary Header */}
                        <div className="bg-primary dark:bg-primary/20 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20 dark:shadow-none border border-transparent dark:border-white/5 transition-colors">
                            <div className="absolute right-[-5%] top-[-10%] opacity-10 rotate-12">
                                <Bell size={240} strokeWidth={1} />
                            </div>
                            <div className="relative z-10 space-y-4">
                                <h3 className="text-2xl font-black">{t('notification_settings')}</h3>
                                <p className="text-sm font-medium text-white/70 dark:text-gray-400 max-w-md leading-relaxed transition-colors">
                                    Control how you receive alerts for new requests, payments, and system updates.
                                </p>
                            </div>
                        </div>

                        {/* Request Alerts */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 ml-2">
                                <div className="w-1.5 h-6 bg-accent rounded-full"></div>
                                <h4 className="text-[13px] font-black text-gray-900 dark:text-white uppercase tracking-widest">{t('active_requests')}</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <NotificationItem
                                    title={t('push_notifications')}
                                    desc={t('new_request_desc')}
                                    active={true}
                                    onToggle={() => { }}
                                />
                                <NotificationItem
                                    title={t('sms_alerts')}
                                    desc="Urgent SMS for new requests."
                                    active={false}
                                    onToggle={() => { }}
                                />
                            </div>
                        </div>

                        {/* Financial Alerts */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 ml-2">
                                <div className="w-1.5 h-6 bg-green-500 rounded-full"></div>
                                <h4 className="text-[13px] font-black text-gray-900 dark:text-white uppercase tracking-widest">{t('payment_confirmation')}</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <NotificationItem
                                    title={t('email_alerts')}
                                    desc={t('payment_desc')}
                                    active={true}
                                    onToggle={() => { }}
                                />
                                <NotificationItem
                                    title={t('push_notifications')}
                                    desc="Instant payment alerts."
                                    active={true}
                                    onToggle={() => { }}
                                />
                            </div>
                        </div>

                        {/* System & Audio */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 ml-2">
                                <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                                <h4 className="text-[13px] font-black text-gray-900 dark:text-white uppercase tracking-widest">System & Audio</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <NotificationItem
                                    title={t('sound_alerts')}
                                    desc={t('sound_desc')}
                                    active={true}
                                    onToggle={() => { }}
                                />
                                <NotificationItem
                                    title={t('system_updates')}
                                    desc={t('system_desc')}
                                    active={false}
                                    onToggle={() => { }}
                                />
                            </div>
                        </div>

                        <button className="w-full py-5 bg-gray-900 dark:bg-accent text-white rounded-[28px] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-black dark:hover:bg-accent/80 transition-all active:scale-95">
                            {t('save_preferences')}
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-full flex flex-col gap-8 pb-32">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-xl font-black text-[#171717] dark:text-white transition-colors">{t('settings')}</h1>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">{t('configure_profile')}</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-100 dark:border-orange-500/20 transition-colors">
                    <span className="text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">Trial: 12 Days</span>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Sidebar Tabs */}
                <div className="w-full lg:w-80 bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-[32px] border border-white/40 dark:border-white/5 shadow-xl shadow-primary/5 p-4 sticky top-10 hover:shadow-2xl transition-all duration-700">
                    <div className="space-y-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as Tab)}
                                className={cn(
                                    "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-500 text-left relative group overflow-hidden",
                                    activeTab === tab.id
                                        ? "bg-primary text-white shadow-2xl shadow-primary/20 scale-[1.02] z-10"
                                        : "text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50/80 dark:hover:bg-white/10"
                                )}
                            >
                                <tab.icon size={18} className={cn(
                                    "transition-all duration-500",
                                    activeTab === tab.id ? "scale-110" : "group-hover:scale-110 group-hover:text-primary"
                                )} />
                                <span className="text-[11px] font-black uppercase tracking-[0.15em]">{tab.name}</span>

                                {activeTab === tab.id && (
                                    <div className="ml-auto animate-pulse">
                                        <ArrowUpRight size={14} className="opacity-40" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100/50">
                        <a
                            href="/provider/help"
                            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-gray-400 hover:text-primary hover:bg-primary/5 transition-all duration-500 group"
                        >
                            <HelpCircle size={18} className="group-hover:rotate-12 transition-transform" />
                            <span className="text-[11px] font-black uppercase tracking-[0.15em]">System Help</span>
                        </a>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 w-full pb-32">
                    {renderTabContent()}
                </div>
            </div>

            {/* Sticky Footer for Changes - Now pinned to page bottom */}
            {unsavedChanges && (
                <div className="sticky bottom-4 z-50 animate-in slide-in-from-bottom-4 duration-500 mt-auto">
                    <div className="bg-gray-900/95 dark:bg-[#111111]/95 backdrop-blur-md rounded-[20px] p-2 pl-6 shadow-2xl border border-white/10 dark:border-white/5 flex items-center justify-between transition-colors">
                        <div>
                            <p className="text-white text-[9px] font-black uppercase tracking-widest opacity-80">Unsaved changes in profile</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setUnsavedChanges(false)}
                                disabled={isSaving}
                                className="px-5 py-2.5 rounded-xl border border-white/20 dark:border-white/10 text-white text-[8px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors disabled:opacity-50"
                            >
                                Discard
                            </button>
                            <button
                                onClick={handleSaveSettings}
                                disabled={isSaving}
                                className="px-7 py-2.5 rounded-xl bg-accent text-white text-[8px] font-black uppercase tracking-widest shadow-xl shadow-orange-900/40 dark:shadow-none hover:bg-orange-600 dark:hover:bg-accent/80 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70"
                            >
                                {isSaving ? (
                                    <Loader2 size={12} className="animate-spin" />
                                ) : (
                                    <Save size={12} />
                                )}
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
