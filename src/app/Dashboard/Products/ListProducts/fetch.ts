import { getApiClient, getToken } from "lib/apiService";

export async function submit(page: number = 1) {
    const token = getToken();

    return await getApiClient().api.product.fetch.$get({
        query: { page: page.toString() },

    },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
}