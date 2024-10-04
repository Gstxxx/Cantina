import { InferRequestType } from "hono/client";
import { getApiClient } from "lib/apiService";

const action = getApiClient().api.refresh.$post;

type Request = InferRequestType<typeof action>["json"];
export async function submit(data: Request) {
    return await action({
        json: data
    });
}