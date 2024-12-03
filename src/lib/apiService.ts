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
    const baseUrl = 'http://mkgwss8o0so8kgwwsswk0okw.89.117.32.118.sslip.io';
    return hc<AppType>(baseUrl, {
        headers: token && typeof token === 'string' ? {
            Authorization: `Bearer ${token}`,
        } : {},
    });
}