import api from '@/lib/axios';

export interface RegisterPayload {
    full_name: string;
    phone_number: string;
    email?: string;
    password: string;
}

export interface LoginPayload {
    phone_number: string;
    password: string;
}

export interface BusinessOnboardingPayload {
    business_name: string;
    tin_number?: string;
    service_categories: string[];
}

export interface LocationOnboardingPayload {
    lat: number;
    lng: number;
    search_area?: string;
    specific_instructions?: string;
}

export interface VerificationPayload {
    business_license_url: string;
    tin_certificate_url?: string;
    owner_id_front_url?: string;
}

export interface DashboardMetrics {
    today_jobs: number;
    total_revenue_today: number;
    active_technicians: number;
    pending_requests: number;
    avg_rating: number;
    total_jobs_this_month: number;
    subscription_status: string;
    subscription_days_remaining: number;
    revenue_data?: Array<{ day?: string, date?: string, amount?: number, total?: number }>;
    technician_data?: Array<{ name?: string, jobs?: number, rating?: number }>;
    category_data?: Array<{ name?: string, count?: number, color?: string }>;
    recent_activity?: Array<{ type?: string, label?: string, details?: string, color?: string }>;
}

export interface ProfileSettingsPayload {
    public_phone?: string;
    facebook_url?: string;
    telegram_channel?: string;
    address_instructions?: string;
    gallery_urls?: string[];
}

export interface NotificationPreferences {
    push_notifications: boolean;
    email_notifications: boolean;
}

export interface ChangePasswordPayload {
    current_password: string;
    new_password: string;
    confirm_password: string;
}

export interface ServiceCategory {
    id: number;
    name: string;
    icon_url: string;
}

export interface ServiceOffer {
    id: number;
    name: string;
    base_price: number;
    is_visible: boolean;
    category?: number | string;
}

export interface Technician {
    id: number;
    full_name: string;
    phone_number: string;
    specialties: string[];
    is_active: boolean;
    assigned_vehicle_plate?: string;
    photo_url?: string;
    rating?: string;
    created_at?: string;
}

export interface ProfileData {
    id: number;
    business_name: string;
    full_name: string;
    phone_number: string;
    email: string;
    account_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
    is_online: boolean;
    onboarding_step: number;
    public_phone?: string;
    facebook_url?: string;
    telegram_channel?: string;
    address_instructions?: string;
    gallery_urls?: string[];
    coverage_radius_km?: number | string;
}

export interface AvailabilityPayload {
    is_online: boolean;
}

export interface Technician {
    id: number;
    full_name: string;
    phone_number: string;
    specialties: string[];
    assigned_vehicle_plate?: string;
    photo_url?: string;
    is_active: boolean;
}

export interface AddTechnicianPayload {
    full_name: string;
    phone_number: string;
    specialties?: string[];
    assigned_vehicle_plate?: string;
    photo_url?: string;
}

export interface UpdateTechnicianPayload {
    full_name?: string;
    specialties?: string[];
    is_active?: boolean;
    assigned_vehicle_plate?: string;
    photo_url?: string;
}

export interface Service {
    id: number;
    name: string;
    base_price: number;
    is_visible: boolean;
}

export interface AddServicePayload {
    name: string;
    base_price: number;
    is_visible?: boolean;
}

export interface UpdateServicePayload {
    name?: string;
    base_price?: number;
    is_visible?: boolean;
}

// Utility Interfaces
export interface UploadUrlPayload {
    file_name: string;
    content_type?: string;
}

export interface UploadUrlResponse {
    url: string;
    fields: Record<string, string>;
    file_url: string;
}

// Revenue Interfaces
export interface Transaction {
    id: string | number;
    date: string;
    source: string;
    service: string;
    technician: string;
    amount: string | number;
}

export interface ListTransactionsParams {
    date_from?: string;
    date_to?: string;
    type?: string; // WALK_IN, JOB, or all
}

export interface WalkInPayload {
    amount: number;
    payment_method?: string;
    service_provided?: string;
    technician_id?: number;
}

// Subscription Interfaces
export interface SubscriptionStatus {
    status: string;
    days_remaining: number;
    expires_on: string;
}

export interface SubmitProofPayload {
    transaction_reference: string;
    receipt_url?: string;
    payment_method?: string;
}

export interface PaymentInitiationResponse {
    checkout_url: string;
    tx_ref: string;
}

// Review Interfaces
export interface Review {
    id: number;
    author: string;
    date: string;
    rating: number;
    comment: string;
    reply_message?: string;
    is_resolved?: boolean;
    urgent?: boolean;
}

export interface ReviewStats {
    overall_rating: number;
    response_rate_percentage: number;
    total_reviews: number;
    reviews: Review[];
}

export interface ReplyReviewPayload {
    reply_message: string;
    mark_resolved?: boolean;
}

export interface InventoryItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    low_stock_threshold: number;
    description?: string;
}

export interface AddInventoryPayload {
    name: string;
    price: number;
    quantity: number;
    low_stock_threshold?: number;
    description?: string;
}

export interface UpdateInventoryPayload {
    name?: string;
    price?: number;
    quantity?: number;
    low_stock_threshold?: number;
    description?: string;
}

export interface DeductInventoryPayload {
    quantity: number;
}

export type JobStatus = 'PENDING' | 'ACCEPTED' | 'EN_ROUTE' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';

export interface Job {
    id: number;
    status: JobStatus;
    customer_name: string;
    customer_phone?: string;
    customer_lat: number;
    customer_lng: number;
    service_type: string;
    vehicle_details?: string;
    description?: string;
    distance?: string;
    created_at: string;
    accepted_at?: string;
    technician_id?: number;
    technician_name?: string;
    eta_minutes?: number;
    total_amount_collected?: number;
    payment_method?: string;
}

export interface Message {
    id: number;
    sender_name: string;
    content: string;
    created_at: string;
    is_me?: boolean;
}

export interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
    is_read: boolean;
    created_at: string;
}

export interface AcceptJobPayload {
    technician_id?: number;
    technician?: number;
    eta_minutes?: number;
}

export interface RejectJobPayload {
    reason?: string;
}

export interface UpdateStatusPayload {
    status: 'EN_ROUTE' | 'ARRIVED' | 'IN_PROGRESS';
}

export interface FinalizeJobPayload {
    total_amount_collected: number;
    payment_method: string;
    internal_notes?: string;
}

export const authService = {
    register: async (payload: RegisterPayload) => {
        const response = await api.post('provider/auth/register', payload);
        return response.data;
    },
    verifyOtp: async (payload: { phone_number: string; otp: string }) => {
        const response = await api.post('provider/auth/verify-otp', payload);
        return response.data;
    },
    login: async (payload: LoginPayload) => {
        const response = await api.post('provider/auth/login', payload);
        return response.data;
    },
    refreshToken: async (refresh: string) => {
        const response = await api.post('provider/auth/token/refresh', { refresh });
        return response.data;
    },
};

export const onboardingService = {
    updateBusiness: async (payload: BusinessOnboardingPayload) => {
        const response = await api.put('provider/onboarding/business', payload);
        return response.data;
    },
    updateLocation: async (payload: LocationOnboardingPayload) => {
        const response = await api.put('provider/onboarding/location', payload);
        return response.data;
    },
    submitVerification: async (payload: VerificationPayload) => {
        const response = await api.post('provider/onboarding/submit-verification', payload);
        return response.data;
    },
};

export const providerService = {
    getDashboardMetrics: async () => {
        const response = await api.get('provider/dashboard/metrics');
        return response.data;
    },
    getProfile: async () => {
        const response = await api.get('provider/profile/settings');
        return response.data;
    },
    updateProfileSettings: async (payload: ProfileSettingsPayload | FormData) => {
        const headers = payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
        const response = await api.patch('provider/profile/settings', payload, { headers });
        return response.data;
    },
    getAvailability: async () => {
        const response = await api.get('provider/profile/availability');
        return response.data;
    },
    updateAvailability: async (payload: AvailabilityPayload) => {
        const response = await api.patch('provider/profile/availability', payload);
        return response.data;
    },
    getNotificationPreferences: async () => {
        const response = await api.get('provider/profile/notification-preferences');
        return response.data;
    },
    updateNotificationPreferences: async (payload: Partial<NotificationPreferences>) => {
        const response = await api.patch('provider/profile/notification-preferences', payload);
        return response.data;
    },
    changePassword: async (payload: ChangePasswordPayload) => {
        const response = await api.post('provider/profile/change-password', payload);
        return response.data;
    },
};

export const technicianService = {
    list: async () => {
        const response = await api.get('provider/technicians/');
        return response.data;
    },
    add: async (formData: FormData) => {
        const response = await api.post('provider/technicians/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    get: async (id: number) => {
        const response = await api.get(`provider/technicians/${id}`);
        return response.data;
    },
    update: async (id: number, payload: Partial<Technician> | FormData) => {
        const headers = payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
        const response = await api.put(`provider/technicians/${id}`, payload, { headers });
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`provider/technicians/${id}`);
        return response.data;
    },
};

export const serviceCatalogService = {
    listCategories: async () => {
        const response = await api.get('provider/services/categories');
        return response.data;
    },
    list: async () => {
        const response = await api.get('provider/services/');
        return response.data;
    },
    add: async (payload: Partial<ServiceOffer>) => {
        const response = await api.post('provider/services/', payload);
        return response.data;
    },
    get: async (id: number) => {
        const response = await api.get(`provider/services/${id}`);
        return response.data;
    },
    update: async (id: number, payload: Partial<ServiceOffer>) => {
        const response = await api.patch(`provider/services/${id}`, payload);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`provider/services/${id}`);
        return response.data;
    },
};

export const inventoryService = {
    list: async (params?: { search?: string, category?: string }) => {
        const response = await api.get('provider/inventory/', { params });
        return response.data;
    },
    add: async (payload: AddInventoryPayload) => {
        const response = await api.post('provider/inventory/', payload);
        return response.data;
    },
    get: async (id: number) => {
        const response = await api.get(`provider/inventory/${id}`);
        return response.data;
    },
    update: async (id: number, payload: UpdateInventoryPayload) => {
        const response = await api.put(`provider/inventory/${id}`, payload);
        return response.data;
    },
    deduct: async (id: number, payload: DeductInventoryPayload) => {
        const response = await api.patch(`provider/inventory/${id}/deduct`, payload);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`provider/inventory/${id}`);
        return response.data;
    },
};

export const jobService = {
    list: async (params?: { status?: string }) => {
        const response = await api.get('provider/jobs/', { params });
        return response.data;
    },
    accept: async (id: number, payload: AcceptJobPayload) => {
        const response = await api.post(`provider/jobs/${id}/accept`, payload);
        return response.data;
    },
    reject: async (id: number, payload: RejectJobPayload) => {
        const response = await api.post(`provider/jobs/${id}/reject`, payload);
        return response.data;
    },
    updateStatus: async (id: number, payload: UpdateStatusPayload) => {
        const response = await api.patch(`provider/jobs/${id}/status`, payload);
        return response.data;
    },
    finalize: async (id: number, payload: FinalizeJobPayload) => {
        const response = await api.post(`provider/jobs/${id}/finalize`, payload);
        return response.data;
    },
    getMessages: async (id: number) => {
        const response = await api.get(`provider/jobs/${id}/messages`);
        return response.data;
    },
    sendMessage: async (id: number, payload: { content: string }) => {
        const response = await api.post(`provider/jobs/${id}/messages`, payload);
        return response.data;
    },
};

export const notificationService = {
    list: async () => {
        const response = await api.get('provider/notifications/');
        return response.data;
    },
};

export const utilService = {
    getUploadUrl: async (payload: UploadUrlPayload) => {
        const response = await api.post('provider/utils/upload-url', payload);
        return response.data;
    },
};

export const revenueService = {
    listTransactions: async (params?: ListTransactionsParams) => {
        const response = await api.get('provider/revenue/transactions', { params });
        return response.data;
    },
    addWalkIn: async (payload: WalkInPayload) => {
        const response = await api.post('provider/revenue/walk-in', payload);
        return response.data;
    },
    exportCSV: async (params?: { date_from?: string, date_to?: string }) => {
        const response = await api.get('provider/revenue/export', { params, responseType: 'blob' });
        return response.data;
    },
};

export const subscriptionService = {
    getStatus: async () => {
        const response = await api.get('provider/subscriptions/status');
        return response.data;
    },
    submitProof: async (payload: SubmitProofPayload) => {
        const response = await api.post('provider/subscriptions/submit-proof', payload);
        return response.data;
    },
    pay: async () => {
        const response = await api.post('provider/subscriptions/pay');
        return response.data;
    },
};

export const reviewService = {
    list: async (params?: any) => {
        const response = await api.get('provider/reviews/', { params });
        return response.data;
    },
    reply: async (id: number, payload: ReplyReviewPayload) => {
        const response = await api.post(`provider/reviews/${id}/reply`, payload);
        return response.data;
    },
    resolve: async (id: number, payload?: { resolution_note?: string }) => {
        const response = await api.patch(`provider/reviews/${id}/resolve`, payload || {});
        return response.data;
    },
};

// ==========================================
// Support & Disputes Services
// ==========================================

export interface SupportThread {
    id: number;
    thread_type: 'SUPPORT' | 'DISPUTE';
    status: 'OPEN' | 'RESOLVED' | 'CLOSED';
    subject: string;
    other_party?: {
        id: number;
        name: string;
        role: string;
    };
    related_job_id?: number | null;
    last_message?: string;
    last_message_at?: string;
    created_at: string;
}

export interface SupportMessage {
    id: number;
    sender: {
        id: number;
        name: string;
        role: string;
    };
    content: string;
    attachment_url?: string;
    created_at: string;
}

export interface CreateThreadPayload {
    participant_id: number;
    thread_type?: 'SUPPORT' | 'DISPUTE';
    subject?: string;
    related_job_id?: number;
    message?: string;
}

export interface SendMessagePayload {
    content: string;
    attachment_url?: string;
}

export interface ResolveThreadPayload {
    resolution_note?: string;
}

export const supportService = {
    listThreads: async (status?: 'OPEN' | 'RESOLVED' | 'CLOSED') => {
        const response = await api.get('provider/support/threads', { params: status ? { status } : {} });
        return response.data;
    },
    createThread: async (payload: CreateThreadPayload) => {
        const response = await api.post('provider/support/threads', payload);
        return response.data;
    },
    getMessages: async (threadId: number) => {
        const response = await api.get(`provider/support/threads/${threadId}/messages`);
        return response.data;
    },
    sendMessage: async (threadId: number, payload: SendMessagePayload) => {
        const response = await api.post(`provider/support/threads/${threadId}/messages`, payload);
        return response.data;
    },
    resolveThread: async (threadId: number, payload?: ResolveThreadPayload) => {
        const response = await api.patch(`provider/support/threads/${threadId}/resolve`, payload || {});
        return response.data;
    }
};
