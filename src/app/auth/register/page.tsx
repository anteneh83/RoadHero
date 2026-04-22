"use client";

import React, { useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { Check, Info, MapPin, ShieldCheck, Upload, User, Briefcase, ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import dynamic from 'next/dynamic';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { authService, onboardingService } from '@/services/api.service';
import { uploadService } from '@/services/upload.service';
import { useLanguage } from '@/hooks/useLanguage';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), { ssr: false });

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const steps = [
    { id: 1, name: 'step_profile', icon: User },
    { id: 2, name: 'step_business', icon: Briefcase },
    { id: 3, name: 'step_location', icon: MapPin },
    { id: 4, name: 'step_verify', icon: ShieldCheck },
];

export default function RegisterProviderPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <RegisterContent />
        </Suspense>
    );
}

function RegisterContent() {
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const stepParam = searchParams.get('step');
    const [currentStep, setCurrentStep] = useState(stepParam ? Math.min(Math.max(parseInt(stepParam), 1), 4) : 1);
    const [isLoading, setIsLoading] = useState(false);

    // Step 1: Profile
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Step 2: Business details
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [tinNumber, setTinNumber] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>(['Mechanical Repair', 'Towing']);

    // Step 3: Location
    const [location, setLocation] = useState<[number, number]>([9.0048, 38.7669]);
    const [landmark, setLandmark] = useState('');
    const [directionsNote, setDirectionsNote] = useState('');

    // Step 4: Verification
    const [businessLicense, setBusinessLicense] = useState<string | null>(null);
    const [businessLicenseUrl, setBusinessLicenseUrl] = useState<string | null>(null);
    const [isUploadingLicense, setIsUploadingLicense] = useState(false);

    const [tinCertificate, setTinCertificate] = useState<string | null>(null);
    const [tinCertificateUrl, setTinCertificateUrl] = useState<string | null>(null);
    const [isUploadingTin, setIsUploadingTin] = useState(false);

    const [ownerId, setOwnerId] = useState<string | null>(null);
    const [ownerIdUrl, setOwnerIdUrl] = useState<string | null>(null);
    const [isUploadingId, setIsUploadingId] = useState(false);

    const licenseRef = useRef<HTMLInputElement>(null);
    const tinRef = useRef<HTMLInputElement>(null);
    const ownerIdRef = useRef<HTMLInputElement>(null);

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
    };

    const handleFileUpload = async (
        file: File,
        setFileName: (name: string | null) => void,
        setUrl: (url: string | null) => void,
        setUploading: (loading: boolean) => void
    ) => {
        if (!file) return;

        setUploading(true);
        setFileName(file.name);
        try {
            const url = await uploadService.uploadFile(file);
            setUrl(url);
            showToast(`${file.name} uploaded successfully!`, "success");
        } catch (error: any) {
            console.error(error);
            showToast(error.message || "Failed to upload file", "error");
            setFileName(null);
            setUrl(null);
        } finally {
            setUploading(false);
        }
    };

    const handleNextStep = async () => {
        if (currentStep === 1) {
            if (!fullName || !phoneNumber || !password) {
                showToast("Please fill in required fields", "error");
                return;
            }
            if (password !== confirmPassword) {
                showToast("Passwords do not match", "error");
                return;
            }

            setIsLoading(true);
            try {
                // Step 1: Register the provider
                const regResponse = await authService.register({
                    full_name: fullName,
                    phone_number: phoneNumber,
                    email: email || undefined,
                    password: password
                });

                // Save token if returned
                const accessToken = regResponse.data?.token || regResponse.data?.access;
                const refreshToken = regResponse.data?.refresh;
                if (accessToken) {
                    localStorage.setItem('access_token', accessToken);
                    if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
                }

                setCurrentStep(2);
                showToast("Account created successfully!", "success");
            } catch (error: any) {
                const message = error.response?.data?.message || (error.message === "Network Error" ? "Network error: Connection blocked by server (CORS)" : "Registration failed");
                showToast(message, "error");
            } finally {
                setIsLoading(false);
            }
        } else if (currentStep === 2) {
            if (!businessName || selectedCategories.length === 0) {
                showToast("Please fill in required business details", "error");
                return;
            }

            setIsLoading(true);
            try {
                // Step 2: Update business info
                await onboardingService.updateBusiness({
                    business_name: businessName,
                    tin_number: tinNumber || undefined,
                    service_categories: selectedCategories
                });

                setCurrentStep(3);
                showToast("Business details updated!", "success");
            } catch (error: any) {
                const message = error.response?.data?.message || (error.message === "Network Error" ? "Network error: Connection blocked by server (CORS)" : "Update failed");
                showToast(message, "error");
            } finally {
                setIsLoading(false);
            }
        } else if (currentStep === 3) {
            setIsLoading(true);
            try {
                await onboardingService.updateLocation({
                    lat: location[0],
                    lng: location[1],
                    search_area: landmark || undefined,
                    specific_instructions: directionsNote || undefined
                });
                setCurrentStep(4);
                showToast("Location updated!", "success");
            } catch (error: any) {
                const message = error.response?.data?.message || (error.message === "Network Error" ? "Network error: Connection blocked by server (CORS)" : "Location update failed");
                showToast(message, "error");
            } finally {
                setIsLoading(false);
            }
        } else if (currentStep === 4) {
            if (!businessLicenseUrl) {
                showToast("Business license upload is required", "error");
                return;
            }
            setIsLoading(true);
            try {
                await onboardingService.submitVerification({
                    business_license_url: businessLicenseUrl,
                    tin_certificate_url: tinCertificateUrl || undefined,
                    owner_id_front_url: ownerIdUrl || undefined
                });
                showToast("Verification submitted successfully!", "success");
                window.location.href = '/auth/register/success';
            } catch (error: any) {
                const message = error.response?.data?.message || (error.message === "Network Error" ? "Network error: Connection blocked by server (CORS)" : "Submission failed");
                showToast(message, "error");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const toggleCategory = (cat: string) => {
        setSelectedCategories(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-white/50 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">{t('full_name_label')}</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder={t('full_name_placeholder')}
                                        className="w-full px-5 py-4 rounded-[20px] border border-white/20 dark:border-white/10 bg-white/20 dark:bg-white/[0.03] text-gray-900 dark:text-white focus:bg-white dark:focus:bg-white/[0.1] focus:border-primary dark:focus:border-accent shadow-sm transition-all outline-none font-bold text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-white/50 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">{t('email_label')}</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={t('email_placeholder')}
                                        className="w-full px-5 py-4 rounded-[20px] border border-white/20 dark:border-white/10 bg-white/20 dark:bg-white/[0.03] text-gray-900 dark:text-white focus:bg-white dark:focus:bg-white/[0.1] focus:border-primary dark:focus:border-accent shadow-sm transition-all outline-none font-bold text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black text-white/50 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">{t('phone_label')}</label>
                                <input
                                    type="text"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder={t('phone_placeholder')}
                                    className="w-full px-5 py-4 rounded-[20px] border border-white/20 dark:border-white/10 bg-white/20 dark:bg-white/[0.03] text-gray-900 dark:text-white focus:bg-white dark:focus:bg-white/[0.1] focus:border-primary dark:focus:border-accent shadow-sm transition-all outline-none font-bold text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-white/50 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">{t('password_label')}</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-5 py-4 rounded-[20px] border border-white/20 dark:border-white/10 bg-white/20 dark:bg-white/[0.03] text-gray-900 dark:text-white focus:bg-white dark:focus:bg-white/[0.1] focus:border-primary dark:focus:border-accent shadow-sm transition-all outline-none font-bold text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-white/50 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">{t('confirm_password_label')}</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-5 py-4 rounded-[20px] border border-white/20 dark:border-white/10 bg-white/20 dark:bg-white/[0.03] text-gray-900 dark:text-white focus:bg-white dark:focus:bg-white/[0.1] focus:border-primary dark:focus:border-accent shadow-sm transition-all outline-none font-bold text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <section className="space-y-6">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white border-l-4 border-accent pl-4 tracking-tight">{t('business_details')}</h3>
                            <div className="space-y-6">
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-white/50 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">{t('business_name_label')}</label>
                                    <input
                                        type="text"
                                        value={businessName}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                        placeholder={t('business_name_placeholder')}
                                        className="w-full px-5 py-4 rounded-[20px] border border-white/20 dark:border-white/10 bg-white/20 dark:bg-white/[0.05] text-gray-900 dark:text-white focus:bg-white dark:focus:bg-white/[0.1] focus:border-primary dark:focus:border-accent transition-all outline-none font-bold text-sm shadow-sm"
                                    />
                                </div>
                                <div className="space-y-3.5">
                                    <label className="text-[10px] font-black text-white/50 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">{t('service_category_label')}</label>
                                    <div className="flex flex-wrap gap-3">
                                        {['Mechanical Repair', 'Towing', 'Tire Change', 'Fuel Delivery', 'Electrician'].map((cat) => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => toggleCategory(cat)}
                                                className={cn(
                                                    "px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm",
                                                    selectedCategories.includes(cat)
                                                        ? "bg-primary text-white border-primary shadow-blue-900/40 scale-105"
                                                        : "bg-white/10 dark:bg-white/5 text-white/60 dark:text-gray-400 border-white/20 dark:border-white/10 hover:border-primary/40 hover:bg-white/20"
                                                )}
                                            >
                                                {t(cat.toLowerCase().replace(' ', '_')) || cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-white/50 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">{t('tin_number_label')}</label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={tinNumber}
                                            onChange={(e) => setTinNumber(e.target.value)}
                                            placeholder={t('tin_number_placeholder')}
                                            className="w-full px-5 py-4 rounded-[20px] border border-white/20 dark:border-white/10 bg-white/20 dark:bg-white/[0.02] text-gray-900 dark:text-white focus:bg-white dark:focus:bg-white/[0.1] focus:border-primary dark:focus:border-accent transition-all outline-none font-bold text-sm shadow-sm"
                                        />
                                        {tinNumber && (
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-green-500 text-[9px] font-black uppercase tracking-tighter bg-green-500/10 px-2 py-1 rounded-full">
                                                <Check size={14} /> {t('accepted')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                );
            case 3:
                return (
                    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="space-y-6">
                            <div className="flex justify-between items-center px-1">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white border-l-4 border-accent pl-3 tracking-tight transition-colors">{t('shop_location')}</h3>
                                <div className="flex items-center gap-2.5 bg-green-500/10 dark:bg-green-500/20 px-4 py-2 rounded-full border border-green-500/20 shadow-sm transition-colors">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                    <span className="text-[9px] font-black text-green-600 dark:text-green-400 uppercase tracking-[0.2em]">{t('gps_tracking')}</span>
                                </div>
                            </div>

                            <div className="w-full h-[320px] bg-white/10 dark:bg-white/5 rounded-[40px] relative overflow-hidden group border-4 border-white/40 dark:border-white/10 shadow-2xl transition-all">
                                <InteractiveMap
                                    center={location}
                                    zoom={17}
                                    markers={[{
                                        position: location,
                                        type: 'garage',
                                        draggable: true,
                                        label: t('step_location'),
                                        onDragEnd: (lat: number, lng: number) => setLocation([lat, lng])
                                    }]}
                                />
                            </div>
                        </div>

                        <div className="space-y-8 shrink-0">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/50 dark:text-gray-400 uppercase tracking-[0.2em] ml-1 transition-colors">{t('search_landmark')}</label>
                                <div className="relative group">
                                    <MapPin size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 dark:text-gray-600 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        value={landmark}
                                        onChange={(e) => setLandmark(e.target.value)}
                                        placeholder={t('search_landmark_placeholder')}
                                        className="w-full pl-14 pr-6 py-4.5 rounded-[22px] border border-white/20 dark:border-white/10 bg-white/20 dark:bg-white/10 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-white/[0.1] focus:border-primary dark:focus:border-accent outline-none text-[13px] font-bold shadow-sm focus:ring-8 focus:ring-primary/5 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="p-6 bg-gray-900/90 dark:bg-black/80 backdrop-blur-md rounded-[32px] shadow-2xl space-y-4 border border-white/10 transition-all">
                                <div className="flex justify-between items-center">
                                    <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em]">{t('spatial_accuracy')}</span>
                                    <div className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[8px] font-black rounded uppercase tracking-widest border border-green-500/20">98% Verified</div>
                                </div>
                                <div className="space-y-1 text-center py-1">
                                    <p className="text-[11px] font-bold text-white/60 font-mono tracking-tight transition-colors flex items-center justify-center gap-2">
                                        <span className="text-white/20">{t('lat_label')}</span> {location[0].toFixed(6)}
                                    </p>
                                    <p className="text-[11px] font-bold text-white/60 font-mono tracking-tight transition-colors flex items-center justify-center gap-2">
                                        <span className="text-white/20">{t('lng_label')}</span> {location[1].toFixed(6)}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/50 dark:text-gray-500 uppercase tracking-[0.2em] ml-1 transition-colors">{t('directions_note_label')}</label>
                                <textarea
                                    className="w-full px-6 py-4.5 rounded-[24px] border border-white/20 dark:border-white/10 bg-white/20 dark:bg-white/10 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-white/[0.1] focus:ring-8 focus:ring-primary/5 transition-all outline-none text-[12px] h-32 resize-none font-bold placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm"
                                    placeholder={t('directions_note_placeholder')}
                                    value={directionsNote}
                                    onChange={(e) => setDirectionsNote(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="space-y-6">
                            <div className="space-y-3 text-center">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight transition-colors uppercase">{t('verify_business_title')}</h3>
                                <p className="text-sm text-white/50 dark:text-gray-400 font-medium transition-colors mx-auto max-w-sm">{t('verify_business_desc')}</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-white/50 dark:text-gray-400 uppercase tracking-[0.2em] ml-1 transition-colors">{t('business_license_label')}</label>
                                    <input
                                        type="file"
                                        ref={licenseRef}
                                        className="hidden"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], setBusinessLicense, setBusinessLicenseUrl, setIsUploadingLicense)}
                                    />
                                    <div
                                        onClick={() => licenseRef.current?.click()}
                                        className={cn(
                                            "border-3 border-dashed rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group shadow-inner",
                                            businessLicense ? "border-green-500/40 bg-green-500/10" : "border-white/20 dark:border-white/10 bg-white/10 dark:bg-white/[0.02] hover:bg-white/30 dark:hover:bg-white/5 hover:border-primary/40"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-16 h-16 rounded-[24px] shadow-2xl flex items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:rotate-6",
                                            (isUploadingLicense || businessLicenseUrl) ? "bg-green-500 text-white" : "bg-white dark:bg-white/10 text-primary dark:text-accent border border-white/20"
                                        )}>
                                            {isUploadingLicense ? (
                                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : businessLicenseUrl ? (
                                                <Check size={32} strokeWidth={3} />
                                            ) : (
                                                <Upload size={32} />
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-black text-gray-900 dark:text-white truncate max-w-[180px] transition-colors">
                                                {businessLicense || t('select_file')}
                                            </p>
                                            {!businessLicense && <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1.5">{t('max_size')}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-white/50 dark:text-gray-400 uppercase tracking-[0.2em] ml-1 transition-colors">{t('tin_certificate_label')}</label>
                                    <input
                                        type="file"
                                        ref={tinRef}
                                        className="hidden"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], setTinCertificate, setTinCertificateUrl, setIsUploadingTin)}
                                    />
                                    <div
                                        onClick={() => tinRef.current?.click()}
                                        className={cn(
                                            "border border-white/20 dark:border-white/10 rounded-[32px] p-8 flex flex-col justify-center h-full bg-white/10 dark:bg-white/[0.02] cursor-pointer hover:shadow-2xl hover:bg-white/30 transition-all group",
                                            tinCertificate && "bg-green-500/10 border-green-500/20"
                                        )}
                                    >
                                        <div className="flex items-center gap-5 mb-6">
                                            <div className="w-12 h-12 bg-primary dark:bg-accent rounded-2xl flex items-center justify-center text-white font-black text-[14px] shadow-xl shadow-blue-900/10 group-hover:scale-110 group-hover:-rotate-3 transition-all">PDF</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-md font-black text-gray-900 dark:text-white truncate transition-colors uppercase tracking-tight">{tinCertificate || t('tax_certificate')}</p>
                                                <p className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1">{t('required_doc')}</p>
                                            </div>
                                        </div>
                                        <div className="h-1.5 bg-white/10 dark:bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full transition-all duration-1000 shadow-[0_0_10px_rgba(34,197,94,0.4)]",
                                                    isUploadingTin ? "bg-primary w-1/2 animate-pulse" :
                                                        tinCertificateUrl ? "bg-green-500 w-full" : "bg-primary/20 w-0"
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-white/50 dark:text-gray-400 uppercase tracking-[0.2em] ml-1 transition-colors">{t('owner_id_label')}</label>
                                <input
                                    type="file"
                                    ref={ownerIdRef}
                                    className="hidden"
                                    accept=".jpg,.jpeg,.png"
                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], setOwnerId, setOwnerIdUrl, setIsUploadingId)}
                                />
                                <div
                                    onClick={() => ownerIdRef.current?.click()}
                                    className={cn(
                                        "border border-white/20 dark:border-white/10 rounded-[40px] p-7 flex items-center gap-7 bg-white/10 dark:bg-white/[0.02] cursor-pointer hover:shadow-2xl hover:border-primary/50 transition-all group",
                                        ownerId && "bg-green-500/10 border-green-500/20 shadow-none"
                                    )}
                                >
                                    <div className="w-16 h-16 bg-white/20 dark:bg-white/5 rounded-[24px] flex items-center justify-center text-primary/40 dark:text-gray-600 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-700 shadow-inner">
                                        {isUploadingId ? (
                                            <div className="w-7 h-7 border-3 border-gray-300 border-t-primary rounded-full animate-spin" />
                                        ) : ownerIdUrl ? (
                                            <Check size={32} className="text-green-500" />
                                        ) : (
                                            <User size={32} />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-md font-black text-gray-900 dark:text-white transition-colors uppercase tracking-tight">{ownerId || t('national_id_passport')}</h4>
                                        <p className="text-[11px] font-medium text-white/40 dark:text-gray-500 transition-colors uppercase tracking-[0.1em] mt-1">{t('kebele_id_passport')}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-white/10 dark:bg-white/5 border border-white/10 flex items-center justify-center text-white/30 group-hover:text-primary group-hover:bg-white transition-all">
                                        <ChevronRight size={24} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <main className="min-h-screen bg-white dark:bg-black flex flex-col transition-colors duration-500 overflow-x-hidden">
            <PublicHeader />

            <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 lg:p-12 pt-24 md:pt-28 lg:pt-32 relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark/95 to-white dark:via-black dark:to-black transition-colors duration-1000">
                {/* Background Decoration - Immersive Glows */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse opacity-50" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px] -ml-40 -mb-40" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-white/10 via-transparent to-orange-50/5 dark:from-white/5 dark:to-transparent -z-10" />

                <div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                            <Sparkles size={12} className="text-accent animate-pulse" />
                            <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">{t('partner_portal_version')}</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight transition-colors drop-shadow-sm">{t('registration_title')}</h2>
                        <p className="text-sm text-white/50 max-w-md mx-auto font-medium transition-colors mt-2">{t('registration_subtitle')}</p>
                    </div>

                    <div className="bg-white/40 dark:bg-white/[0.02] backdrop-blur-2xl rounded-[40px] shadow-[0_32px_120px_-15px_rgba(0,0,0,0.1)] dark:shadow-none border border-white/40 dark:border-white/5 overflow-hidden flex flex-col transition-all duration-500">
                        {/* Stepper Navigation */}
                        <div className="border-b border-white/20 dark:border-white/5 p-8 flex justify-center bg-white/20 dark:bg-white/[0.01]">
                            <div className="flex items-center w-full max-w-xl relative">
                                <div className="absolute top-[16px] left-0 w-full h-[2px] bg-white/20 dark:bg-white/5 z-0"></div>
                                <div
                                    className="absolute top-[16px] left-0 h-[2px] bg-accent shadow-[0_0_15px_rgba(249,115,22,0.5)] transition-all duration-1000 z-0"
                                    style={{ width: `${(currentStep - 1) * 33.33}%` }}
                                ></div>

                                {steps.map((step) => (
                                    <div key={step.id} className="flex-1 flex flex-col items-center relative z-10">
                                        <div
                                            className={cn(
                                                "w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs transition-all duration-700",
                                                currentStep > step.id ? "bg-green-500 text-white shadow-xl shadow-green-500/20" :
                                                    currentStep === step.id ? "bg-accent text-white scale-125 shadow-2xl shadow-orange-500/40" :
                                                        "bg-white/20 dark:bg-white/5 backdrop-blur-md border border-white/30 dark:border-white/10 text-white/40"
                                            )}
                                        >
                                            {currentStep > step.id ? <Check size={18} strokeWidth={3} /> : step.id}
                                        </div>
                                        <span className={cn(
                                            "text-[9px] font-black mt-4 uppercase tracking-[0.2em] transition-all duration-500",
                                            currentStep === step.id ? "text-white translate-y-1" : "text-white/30"
                                        )}>
                                            {t(step.name)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Step Content */}
                        <div className="p-8 md:p-14 flex-1 min-h-[400px]">
                            {renderStep()}
                        </div>

                        {/* Action Footer */}
                        <div className="p-8 bg-white/20 dark:bg-white/[0.01] border-t border-white/20 dark:border-white/10 flex justify-between items-center transition-all">
                            <button
                                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                                disabled={isLoading}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                                    currentStep === 1 ? "invisible" : "text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-50"
                                )}
                            >
                                <ChevronRight className="rotate-180" size={14} />
                                {t('back')}
                            </button>

                            <button
                                onClick={handleNextStep}
                                disabled={isLoading}
                                className="group relative flex items-center gap-3 bg-primary dark:bg-accent border border-white/20 dark:border-none px-12 py-4.5 rounded-[22px] text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-900/20 dark:shadow-none hover:scale-[1.05] active:scale-95 transition-all overflow-hidden disabled:opacity-70 disabled:scale-100"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span className="relative z-10">{currentStep === 4 ? t('complete_registration') : t('next_step')}</span>
                                        <ArrowRight size={18} className="relative z-10 group-hover:translate-x-2 transition-transform duration-500" />
                                    </>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000"></div>
                            </button>
                        </div>
                    </div>

                    <p className="text-center text-[10px] font-black text-white/30 uppercase tracking-[0.5em] transition-colors pb-12">
                        {t('step_indicator').replace('{current}', currentStep.toString())}
                    </p>
                </div>
            </div>

            <PublicFooter />
        </main>
    );
}
