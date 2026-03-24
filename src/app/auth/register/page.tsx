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
import { uploadToCloudinary } from '@/services/cloudinary.service';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), { ssr: false });

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const steps = [
    { id: 1, name: 'Profile', icon: User },
    { id: 2, name: 'Business', icon: Briefcase },
    { id: 3, name: 'Location', icon: MapPin },
    { id: 4, name: 'Verify', icon: ShieldCheck },
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
            const url = await uploadToCloudinary(file);
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
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Abebe Bikila"
                                        className="w-full px-5 py-3.5 rounded-[16px] border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] dark:text-white focus:bg-white dark:focus:bg-white/5 focus:border-primary dark:focus:border-accent focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium text-sm placeholder:text-gray-300 dark:placeholder:text-gray-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest ml-1">Personal Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="abebe@example.com"
                                        className="w-full px-5 py-3.5 rounded-[16px] border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] dark:text-white focus:bg-white dark:focus:bg-white/5 focus:border-primary dark:focus:border-accent focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium text-sm placeholder:text-gray-300 dark:placeholder:text-gray-700"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                                <input
                                    type="text"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="+251922334455"
                                    className="w-full px-5 py-3.5 rounded-[16px] border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] dark:text-white focus:bg-white dark:focus:bg-white/5 focus:border-primary dark:focus:border-accent focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium text-sm placeholder:text-gray-300 dark:placeholder:text-gray-700"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest ml-1">Create Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-5 py-3.5 rounded-[16px] border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] dark:text-white focus:bg-white dark:focus:bg-white/5 focus:border-primary dark:focus:border-accent focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium text-sm placeholder:text-gray-300 dark:placeholder:text-gray-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-5 py-3.5 rounded-[16px] border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] dark:text-white focus:bg-white dark:focus:bg-white/5 focus:border-primary dark:focus:border-accent focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium text-sm placeholder:text-gray-300 dark:placeholder:text-gray-700"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <section className="space-y-5">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white border-l-4 border-accent pl-4 tracking-tight">Business Details</h3>
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest ml-1">Business Name</label>
                                    <input
                                        type="text"
                                        value={businessName}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                        placeholder="Abyssinia Motors"
                                        className="w-full px-5 py-3.5 rounded-[16px] border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 dark:text-white focus:bg-white dark:focus:bg-white/5 focus:border-primary dark:focus:border-accent transition-all outline-none font-bold text-sm"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest ml-1">Service Category</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Mechanical Repair', 'Towing', 'Tire Change', 'Fuel Delivery', 'Electrician'].map((cat) => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => toggleCategory(cat)}
                                                className={cn(
                                                    "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm",
                                                    selectedCategories.includes(cat)
                                                        ? "bg-primary text-white border-primary shadow-blue-900/20 scale-105"
                                                        : "bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-white/10 hover:border-primary/40"
                                                )}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest ml-1">TIN Number</label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={tinNumber}
                                            onChange={(e) => setTinNumber(e.target.value)}
                                            placeholder="0045623XXX"
                                            className="w-full px-5 py-3.5 rounded-[16px] border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] dark:text-white focus:bg-white dark:focus:bg-white/5 focus:border-primary dark:focus:border-accent transition-all outline-none font-bold text-sm"
                                        />
                                        {tinNumber && (
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-green-500 text-[8px] font-black uppercase tracking-tighter">
                                                <Check size={12} /> Pending
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
                    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-5">
                            <div className="flex justify-between items-center px-1">
                                <h3 className="text-lg font-black text-gray-900 dark:text-white border-l-4 border-accent pl-3 tracking-tight transition-colors">Shop Location</h3>
                                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-500/10 px-3 py-1.5 rounded-full border border-green-100 dark:border-green-500/20 shadow-sm transition-colors">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-[8px] font-black text-green-700 dark:text-green-400 uppercase tracking-[0.2em]">GPS Active</span>
                                </div>
                            </div>

                            <div className="w-full h-[300px] bg-gray-100 dark:bg-white/5 rounded-[32px] relative overflow-hidden group border-4 border-white dark:border-white/5 shadow-xl transition-colors">
                                <InteractiveMap
                                    center={location}
                                    zoom={17}
                                    markers={[{
                                        position: location,
                                        type: 'garage',
                                        draggable: true,
                                        label: 'Your Garage',
                                        onDragEnd: (lat: number, lng: number) => setLocation([lat, lng])
                                    }]}
                                />
                            </div>
                        </div>

                        <div className="space-y-6 shrink-0 py-2">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest ml-1 transition-colors">Search Landmark</label>
                                <div className="relative group">
                                    <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-700 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        value={landmark}
                                        onChange={(e) => setLandmark(e.target.value)}
                                        placeholder="Bole, Addis Ababa"
                                        className="w-full pl-11 pr-4 py-3.5 rounded-[16px] border border-gray-100 dark:border-white/10 bg-white dark:bg-white/10 dark:text-white focus:border-primary dark:focus:border-accent outline-none text-[12px] font-black shadow-sm focus:ring-4 focus:ring-primary/5 transition-all transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="p-5 bg-gray-900 dark:bg-black rounded-[24px] shadow-xl space-y-3 border border-white/5 transition-colors">
                                <div className="flex justify-between items-center">
                                    <span className="text-[7px] font-black text-gray-500 uppercase tracking-[0.3em]">Precision Link</span>
                                    <div className="px-1.5 py-0.5 bg-green-500/10 text-green-500 text-[7px] font-black rounded uppercase">98%</div>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-medium text-gray-400 font-mono tracking-tight transition-colors">LAT: {location[0].toFixed(6)}</p>
                                    <p className="text-[9px] font-medium text-gray-400 font-mono tracking-tight transition-colors">LNG: {location[1].toFixed(6)}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest ml-1 transition-colors">Directions Note</label>
                                <textarea
                                    className="w-full px-4 py-3.5 rounded-[16px] border border-gray-100 dark:border-white/5 bg-white dark:bg-white/10 dark:text-white focus:ring-4 focus:ring-primary/5 transition-all outline-none text-[11px] h-24 resize-none font-medium placeholder:text-gray-300 dark:placeholder:text-gray-700"
                                    placeholder="e.g. Behind Dembel City Center, Gate 2."
                                    value={directionsNote}
                                    onChange={(e) => setDirectionsNote(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-6">
                            <div className="space-y-2 text-center">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight transition-colors uppercase">Verify Business</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium transition-colors mx-auto max-w-sm">Document upload for partner identity verification.</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest ml-1 transition-colors">Business License</label>
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
                                            "border-2 border-dashed rounded-[24px] p-6 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group shadow-inner",
                                            businessLicense ? "border-green-200 dark:border-green-500/20 bg-green-50/20 dark:bg-green-500/5" : "border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/5 hover:border-primary/30"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center transition-all duration-500 group-hover:scale-110",
                                            (isUploadingLicense || businessLicenseUrl) ? "bg-green-500 text-white" : "bg-white dark:bg-white/10 text-primary dark:text-accent"
                                        )}>
                                            {isUploadingLicense ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : businessLicenseUrl ? (
                                                <Check size={24} strokeWidth={3} />
                                            ) : (
                                                <Upload size={24} />
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-black text-gray-900 dark:text-white truncate max-w-[150px] transition-colors">
                                                {businessLicense || "Select PDF/IMG"}
                                            </p>
                                            {!businessLicense && <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Max. 5MB</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest ml-1 transition-colors">TIN Certificate</label>
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
                                            "border border-gray-100 dark:border-white/10 rounded-[24px] p-6 flex flex-col justify-center h-full bg-white dark:bg-white/[0.02] cursor-pointer hover:shadow-xl hover:shadow-black/5 transition-all group",
                                            tinCertificate && "bg-green-50/20 dark:bg-green-500/5 border-green-100 dark:border-green-500/10"
                                        )}
                                    >
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-10 h-10 bg-primary dark:bg-accent rounded-xl flex items-center justify-center text-white font-black text-[12px] shadow-lg shadow-blue-900/10 dark:shadow-none group-hover:rotate-6 transition-transform">PDF</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black text-gray-900 dark:text-white truncate transition-colors">{tinCertificate || 'Tax Certificate'}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Required</p>
                                            </div>
                                        </div>
                                        <div className="h-1 bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full transition-all duration-1000",
                                                    isUploadingTin ? "bg-primary w-1/2 animate-pulse" :
                                                        tinCertificateUrl ? "bg-green-500 w-full" : "bg-primary/20 w-0"
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest ml-1 transition-colors">Owner Identity</label>
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
                                        "border border-gray-100 dark:border-white/10 rounded-[32px] p-6 flex items-center gap-6 bg-white dark:bg-white/[0.02] cursor-pointer hover:shadow-xl hover:border-primary transition-all transition-colors group",
                                        ownerId && "bg-green-50/20 dark:bg-green-500/5 border-green-100 dark:border-green-500/10 shadow-none"
                                    )}
                                >
                                    <div className="w-14 h-14 bg-gray-50 dark:bg-white/5 rounded-[20px] flex items-center justify-center text-gray-300 dark:text-gray-700 group-hover:scale-110 group-hover:bg-primary-dark group-hover:text-white transition-all duration-500">
                                        {isUploadingId ? (
                                            <div className="w-6 h-6 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                                        ) : ownerIdUrl ? (
                                            <Check size={24} className="text-green-500" />
                                        ) : (
                                            <User size={24} />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-black text-gray-900 dark:text-white transition-colors uppercase tracking-tight">{ownerId || "National ID / Passport"}</h4>
                                        <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 transition-colors uppercase tracking-widest mt-0.5">Kebele or Passport</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center text-gray-300 dark:text-gray-700 group-hover:text-primary transition-colors">
                                        <ChevronRight size={20} />
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

            <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 lg:p-12 relative">
                {/* Background Blobs */}
                <div className="absolute top-1/4 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -z-10" />
                <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-accent/5 rounded-full blur-[100px] -z-10" />

                <div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-primary/5 dark:bg-primary/10 rounded-full border border-primary/10">
                            <Sparkles size={10} className="text-primary dark:text-accent" />
                            <span className="text-[8px] font-black text-primary dark:text-accent uppercase tracking-widest">Registration Flow</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">Partner Registration</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto font-medium transition-colors">Join the largest rescue network in Ethiopia.</p>
                    </div>

                    <div className="bg-white dark:bg-[#0A0A0A] rounded-[32px] shadow-2xl shadow-blue-900/5 border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col transition-colors">
                        {/* Stepper Navigation */}
                        <div className="border-b border-gray-50 dark:border-white/5 p-6 flex justify-center bg-gray-50/30 dark:bg-white/[0.01]">
                            <div className="flex items-center w-full max-w-xl relative">
                                <div className="absolute top-[16px] left-0 w-full h-[1.5px] bg-gray-100 dark:bg-white/5 z-0"></div>
                                <div
                                    className="absolute top-[16px] left-0 h-[1.5px] bg-accent transition-all duration-700 z-0"
                                    style={{ width: `${(currentStep - 1) * 33.33}%` }}
                                ></div>

                                {steps.map((step) => (
                                    <div key={step.id} className="flex-1 flex flex-col items-center relative z-10">
                                        <div
                                            className={cn(
                                                "w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all duration-500",
                                                currentStep > step.id ? "bg-green-500 text-white shadow-lg shadow-green-500/20" :
                                                    currentStep === step.id ? "bg-accent text-white scale-110 shadow-xl shadow-orange-500/20" :
                                                        "bg-white dark:bg-white/10 border-2 border-gray-100 dark:border-white/5 text-gray-300 dark:text-gray-700"
                                            )}
                                        >
                                            {currentStep > step.id ? <Check size={16} strokeWidth={3} /> : step.id}
                                        </div>
                                        <span className={cn(
                                            "text-[8px] font-black mt-3 uppercase tracking-[0.2em] transition-colors",
                                            currentStep === step.id ? "text-accent" : "text-gray-300 dark:text-gray-700"
                                        )}>
                                            {step.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Step Content */}
                        <div className="p-8 md:p-12 flex-1 min-h-[350px]">
                            {renderStep()}
                        </div>

                        {/* Action Footer */}
                        <div className="p-8 bg-gray-50/50 dark:bg-white/[0.01] border-t border-gray-100 dark:border-white/5 flex justify-between items-center transition-colors">
                            <button
                                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                                disabled={isLoading}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all",
                                    currentStep === 1 ? "invisible" : "text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
                                )}
                            >
                                <ChevronRight className="rotate-180" size={14} />
                                Back
                            </button>

                            <button
                                onClick={handleNextStep}
                                disabled={isLoading}
                                className="group relative flex items-center gap-3 bg-primary dark:bg-accent hover:bg-primary-dark dark:hover:bg-orange-600 px-10 py-4 rounded-[18px] text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-900/10 dark:shadow-none hover:scale-[1.03] active:scale-95 transition-all overflow-hidden disabled:opacity-70 disabled:scale-100"
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span className="relative z-10">{currentStep === 4 ? 'Complete Registration' : 'Next Step'}</span>
                                        <ArrowRight size={16} className="relative z-10 group-hover:translate-x-2 transition-transform duration-500" />
                                    </>
                                )}
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            </button>
                        </div>
                    </div>

                    <p className="text-center text-[9px] font-bold text-gray-300 dark:text-gray-800 uppercase tracking-[0.4em] transition-colors pb-6">
                        Step {currentStep} of 4 — Business Partner Verification
                    </p>
                </div>
            </div>

            <PublicFooter />
        </main>
    );
}
