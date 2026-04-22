import axios from 'axios';

const api = axios.create({
    baseURL: 'https://roadhero.online/api/v1/',
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.request.use(
    (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;

            // Debug: log token presence for key endpoints
            if (config.url?.includes('metrics') || config.url?.includes('availability')) {
                console.log(`[Axios Request] Endpoint: ${config.url}, Token: ${token.substring(0, 8)}...`);
            }
        } else {
            if (config.url?.includes('metrics') || config.url?.includes('availability')) {
                console.warn(`[Axios Request] No token found for ${config.url}`);
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers['Authorization'] = 'Bearer ' + token;
                        return api(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;

            if (!refreshToken) {
                isRefreshing = false;
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('access_token');
                    window.location.href = '/auth/login';
                }
                return Promise.reject(error);
            }

            try {
                const response = await axios.post('/api/v1/provider/auth/token/refresh/', {
                    refresh: refreshToken,
                });

                // Support both { data: { access: '...' } } and { data: { token: '...' } }
                // and variations where status/data wraps are present
                const rawData = response.data.data || response.data;
                const access = rawData.access || rawData.token;

                if (!access) throw new Error("No token in refresh response");

                localStorage.setItem('access_token', access);
                api.defaults.headers.common['Authorization'] = 'Bearer ' + access;
                originalRequest.headers['Authorization'] = 'Bearer ' + access;

                processQueue(null, access);
                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/auth/login';
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
