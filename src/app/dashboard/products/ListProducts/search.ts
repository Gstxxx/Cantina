import { getApiClient, getToken } from "lib/apiService";

export async function submit(query: string = "") {
    const token = getToken();

    return await getApiClient().api.product.search.$get({
        query: {
            query: query
        },
    },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
}
