import { hc } from 'hono/client'
import type { AppType } from 'app/api/[...route]/route'

export function getToken() {
    const token = localStorage.getItem('token')?.toString();
    if (!token) {
        return { error: "Not logged in" };
    }
    return token;
}

export function getApiClient() {
    const token = getToken();
    return hc<AppType>("http://localhost:3000/", {
        headers: token && typeof token === 'string' ? {
            Authorization: `Bearer ${token}`,
        } : {},
    });
}