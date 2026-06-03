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

export interface TechLoginPayload {
    phone_number: string;
    pin: string;
    device_token?: string;
}

export interface BusinessOnboardingPayload {
    business_name: string;
    business_type: string;
    phone_number: string;
    email?: string;
    description?: string;
}

export interface LocationOnboardingPayload {
    latitude: number;
    longitude: number;
    address: string;
    operating_hours?: string;
}

export interface VerificationPayload {
    business_license_url: string;
    id_document_url: string;
}

export interface DashboardMetrics {
    // Today's stats
    today_jobs: number;
    today_revenue: number;
    pending_actions: number;
    // Active jobs
    active_jobs: number;
    active_technicians?: number;
    avg_rating: number;
    avg_response_time_mins?: number;
    total_jobs_this_month?: number;
    total_revenue_today?: number;
    // Subscription
    subscription_status: string;
    subscription_days_remaining: number;
    // Recent activity feed
    recent_activity_feed?: Array<{ type?: string, label?: string, details?: string, color?: string, timestamp?: string }>;
    // Legacy / extended fields kept for backward compatibility
    pending_requests?: number;
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
    user_id?: number;
    full_name: string;
    phone_number: string;
    /** The API may call this field `skills` (create response) or `specialties` (list/detail/update). Both are normalized to `specialties` by the service layer. */
    specialties: string[];
    skills?: string[];
    is_active: boolean;
    assigned_vehicle_plate?: string;
    photo_url?: string;
    rating?: string;
    created_at?: string;
    /** Only returned once, immediately after creation. */
    initial_pin?: string;
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

/** POST /api/v1/provider/technicians/ — uses `skills`, not `specialties` */
export interface AddTechnicianPayload {
    full_name: string;
    phone_number: string;
    skills?: string[];
}

/** PUT /api/v1/provider/technicians/{id} — uses `specialties` */
export interface UpdateTechnicianPayload {
    full_name?: string;
    specialties?: string[];
    is_active?: boolean;
    assigned_vehicle_plate?: string;
}

// Normalize technician objects from API so the UI can always rely on `specialties: string[]`.
function normalizeTechnician(t: any) {
    if (!t) return t;
    let specialties: any = [];
    if (Array.isArray(t.specialties)) {
        specialties = t.specialties;
    } else if (typeof t.specialties === 'string') {
        try {
            const parsed = JSON.parse(t.specialties);
            specialties = Array.isArray(parsed) ? parsed : [parsed];
        } catch (_e) {
            specialties = [t.specialties];
        }
    } else if (Array.isArray(t.skills)) {
        specialties = t.skills;
    } else if (typeof t.skills === 'string') {
        try {
            const parsed = JSON.parse(t.skills);
            specialties = Array.isArray(parsed) ? parsed : [parsed];
        } catch (_e) {
            specialties = [t.skills];
        }
    } else {
        specialties = [];
    }

    return { ...t, specialties };
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

export type JobStatus = 'PENDING' | 'ACCEPTED' | 'EN_ROUTE' | 'ARRIVED' | 'DIAGNOSING' | 'QUOTE_PENDING' | 'QUOTE_ACCEPTED' | 'APPROVED' | 'QUOTE_APPROVED' | 'ACCEPTED_QUOTE' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';

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
    status: 'EN_ROUTE' | 'ARRIVED' | 'DIAGNOSING' | 'IN_PROGRESS';
}

export interface FinalizeJobPayload {
    total_amount_collected: number;
    payment_method: string;
    internal_notes?: string;
    notes?: string;
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
    techLogin: async (payload: TechLoginPayload) => {
        const response = await api.post('provider/auth/tech/login/', payload);
        return response.data;
    },
};

export const onboardingService = {
    getBusiness: async () => {
        const response = await api.get('provider/onboarding/business');
        return response.data;
    },
    saveBusiness: async (payload: BusinessOnboardingPayload) => {
        const response = await api.post('provider/onboarding/business', payload);
        return response.data;
    },
    getLocation: async () => {
        const response = await api.get('provider/onboarding/location');
        return response.data;
    },
    saveLocation: async (payload: LocationOnboardingPayload) => {
        const response = await api.post('provider/onboarding/location', payload);
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
        const raw = response.data?.data ?? response.data;

        // Normalize backend field names to DashboardMetrics interface
        const normalized: DashboardMetrics = {
            today_jobs: raw.jobs_today ?? raw.today_jobs ?? 0,
            today_revenue: raw.logged_income_today ?? raw.today_revenue ?? 0,
            pending_actions: raw.pending_jobs ?? raw.pending_requests ?? 0,
            active_jobs: raw.active_jobs ?? 0,
            avg_rating: raw.rating_avg ?? raw.avg_rating ?? 0,
            subscription_status: raw.subscription_status ?? '',
            subscription_days_remaining: raw.subscription_days_remaining ?? 0,
            total_jobs_this_month: raw.jobs_this_month ?? raw.total_jobs_this_month ?? 0,
            total_revenue_today: raw.logged_income_today ?? raw.total_logged_income ?? raw.today_revenue ?? 0,
            pending_requests: raw.pending_jobs ?? raw.pending_requests ?? 0,
            active_technicians: raw.active_technicians ?? 0,
            avg_response_time_mins: raw.avg_response_time_mins ?? 0,
            recent_activity: raw.recent_activity ?? raw.recent_activity_feed ?? raw.activity ?? [],
            revenue_data: raw.revenue_trend?.map((r: any) => ({ date: r.date, amount: r.amount })) ?? raw.revenue_data ?? [],
            category_data: raw.category_data ?? raw.service_mix ?? [],
            technician_data: raw.technician_data ?? raw.technicians ?? [],
            recent_activity_feed: raw.recent_activity ?? raw.recent_activity_feed ?? [],
        };

        return { status: response.data?.status ?? 'success', data: normalized };
    },
    getHistory: async (params?: { page?: number; page_size?: number }) => {
        const response = await api.get('provider/dashboard/history', { params });
        // The API returns an envelope { status, data: [...] }
        const raw = response.data?.data ?? response.data;
        return { status: response.data?.status ?? 'success', data: raw };
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
    /**
     * GET /api/v1/provider/technicians/
     * Returns a normalized Technician[] (specialties always an array).
     */
    list: async (): Promise<Technician[]> => {
        const response = await api.get('provider/technicians/');
        // Unwrap { status, data: [...] } envelope or plain array
        const raw = response.data?.data ?? response.data;
        const arr = Array.isArray(raw) ? raw : (raw ? [raw] : []);
        return arr.map(normalizeTechnician) as Technician[];
    },

    /**
     * POST /api/v1/provider/technicians/
     * Payload: { full_name, phone_number, skills? }
     * Returns the created Technician (with initial_pin included).
     */
    add: async (payload: AddTechnicianPayload): Promise<Technician> => {
        const response = await api.post('provider/technicians/', payload);
        // Unwrap { status, data: { id, ..., initial_pin } } envelope
        const raw = response.data?.data ?? response.data;
        return normalizeTechnician(raw) as Technician;
    },

    /**
     * GET /api/v1/provider/technicians/{id}
     * Returns full Technician detail.
     */
    get: async (id: number): Promise<Technician> => {
        const response = await api.get(`provider/technicians/${id}`);
        const raw = response.data?.data ?? response.data;
        return normalizeTechnician(raw) as Technician;
    },

    /**
     * PUT /api/v1/provider/technicians/{id}
     * Payload: { full_name?, specialties?, is_active?, assigned_vehicle_plate? }
     */
    update: async (id: number, payload: UpdateTechnicianPayload): Promise<Technician> => {
        const response = await api.put(`provider/technicians/${id}`, payload);
        const raw = response.data?.data ?? response.data;
        return normalizeTechnician(raw) as Technician;
    },

    /**
     * DELETE /api/v1/provider/technicians/{id}
     * Soft-deletes (deactivates) the technician.
     */
    delete: async (id: number): Promise<any> => {
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
    createQuote: async (id: number, payload: { notes: string; valid_until: string }) => {
        const response = await api.post(`provider/jobs/${id}/quotes`, payload);
        return response.data;
    },
};

export const quoteService = {
    get: async (id: number) => {
        const response = await api.get(`provider/quotes/${id}`);
        return response.data;
    },
    addItem: async (quoteId: number, payload: { item_type: 'PART' | 'LABOR'; description: string; quantity: number; unit_price: number; spare_part_id?: number }) => {
        const response = await api.post(`provider/quotes/${quoteId}/items`, payload);
        return response.data;
    },
    removeItem: async (quoteId: number, itemId: number) => {
        const response = await api.delete(`provider/quotes/${quoteId}/items/${itemId}`);
        return response.data;
    },
    submit: async (quoteId: number) => {
        const response = await api.post(`provider/quotes/${quoteId}/submit`);
        return response.data;
    },
};

export const notificationService = {
    list: async () => {
        const response = await api.get('provider/notifications/');
        return response.data;
    },
    markAsRead: async (id: number) => {
        const response = await api.patch(`provider/notifications/${id}/read`);
        return response.data;
    },
    markAllAsRead: async () => {
        const response = await api.patch('provider/notifications/read-all');
        return response.data;
    },
};

export const utilService = {
    getUploadUrl: async (payload: UploadUrlPayload) => {
        const response = await api.post('provider/utils/upload-url/', payload);
        return response.data;
    },
    uploadDirect: async (formData: FormData) => {
        const response = await api.post('provider/utils/upload/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
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

export const scheduleService = {
    list: async () => {
        const response = await api.get('provider/availability/');
        return response.data;
    },
    add: async (payload: { day_of_week: number; open_time: string; close_time: string; is_available: boolean; max_concurrent_jobs: number }) => {
        const response = await api.post('provider/availability/', payload);
        return response.data;
    },
    remove: async (id: number) => {
        const response = await api.delete(`provider/availability/${id}/`);
        return response.data;
    },
    listUnavailable: async () => {
        const response = await api.get('provider/availability/unavailable/');
        return response.data;
    },
    addUnavailable: async (payload: { date: string; reason: string }) => {
        const response = await api.post('provider/availability/unavailable/', payload);
        return response.data;
    },
    removeUnavailable: async (id: number) => {
        const response = await api.delete(`provider/availability/unavailable/${id}/`);
        return response.data;
    },
};

export const analyticsService = {
    getRevenue: async (params?: { days?: number }) => {
        const response = await api.get('provider/analytics/revenue/', { params });
        return response.data;
    },
    getTopParts: async (params?: { limit?: number }) => {
        const response = await api.get('provider/analytics/top-parts/', { params });
        return response.data;
    },
    getTechnicianPerformance: async () => {
        const response = await api.get('provider/analytics/technicians/');
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
