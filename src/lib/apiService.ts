import { hc } from 'hono/client'
import type { AppType } from 'app/api/[...route]/route'
import { getCookie } from 'cookies-next'

export function getToken() {
    const token = getCookie('token')?.toString();
    if (!token) {
        return { error: "Not logged in" };
    }
    return token;
}

export function getApiClient() {
    const token = getToken();
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    return hc<AppType>(baseUrl, {
        headers: token && typeof token === 'string' ? {
            Authorization: `Bearer ${token}`,
        } : {},
    });
}