import axios from 'axios';
import { apiBaseUrl } from '@/api/config';
import { classifyApiStatus } from '@/features/auth/authRules';

export const apiUnauthorizedEvent = 'botanica:api-unauthorized';
export const apiForbiddenEvent = 'botanica:api-forbidden';

export const apiClient = axios.create({
	baseURL: apiBaseUrl,
	timeout: 10000,
});

apiClient.interceptors.response.use(
	(response) => response,
	(error: unknown) => {
		const status = axios.isAxiosError(error) ? error.response?.status : undefined;
		const disposition = classifyApiStatus(status);
		if (typeof window !== 'undefined' && disposition === 'unauthenticated') {
			window.dispatchEvent(new Event(apiUnauthorizedEvent));
		} else if (typeof window !== 'undefined' && disposition === 'access-denied') {
			window.dispatchEvent(new Event(apiForbiddenEvent));
		}
		return Promise.reject(error);
	},
);