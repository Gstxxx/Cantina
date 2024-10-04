// import { hc } from 'hono/client'
// import type { mainApp } from 'app/api/[...route]/route'

// export function getToken() {
//     const token = localStorage.getItem('token')?.toString();
//     if (!token) {
//         return { error: "Not logged in" };
//     }
//     return token;
// }

// export function getApiClient() {
//     const token = getToken();
//     // return hc<mainApp>("https://uck0sss8ok0ggcc4scok4k4w.revenantcheats.com", {
//     return hc<mainApp>("http://localhost:3000/", {
//         headers: token && typeof token === 'string' ? {
//             Authorization: `Bearer ${token}`,
//         } : {},
//     }) as ReturnType<typeof hc<mainApp>>;
// }