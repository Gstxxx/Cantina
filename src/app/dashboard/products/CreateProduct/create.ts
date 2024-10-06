
import { InferRequestType } from "hono/client";
import { getApiClient, getToken } from "lib/apiService";

const action = getApiClient().api.product.create.$post;

type Request = InferRequestType<typeof action>["json"];
export async function submit(data: Request) {

    const token = getToken();

    return await action({
        json: data
    },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
}