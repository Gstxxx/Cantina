import { prisma } from '../../../lib/prisma';
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const zFetch = z.object({
    id: z.number(),
});
const zUpdate = z.object({
    id: z.number(),
    name: z.string(),
    phone: z.string(),
});

const clientApp = new Hono()
    .basePath("/client")
    .post("/fetch", zValidator("json", zFetch), async (c) => {
        const body = c.req.valid("json");
        try {

            const client = await prisma.client.findUnique({
                where: { id: Number(body.id), deleted_at: null },
                include: { purchases: true },
            });

            if (!client) {
                return c.json({ error: 'Client not found' }, 404);
            }

            return c.json(client);
        } catch (error) {
            console.error(error);
            return c.json({ error: 'Unable to fetch client' }, 500);
        }
    })
    .post("/update", zValidator("json", zUpdate), async (c) => {
        const body = c.req.valid("json");
        try {
            const updatedClient = await prisma.client.update({
                where: { id: Number(body.id) },
                data: body,
            });

            return c.json(updatedClient, 200);
        } catch (error) {
            console.error(error);
            return c.json({ error: 'Unable to update client' }, 500);
        }
    })
    .post("/delete", zValidator("json", zFetch), async (c) => {
        const body = c.req.valid("json");
        try {
            const deletedClient = await prisma.client.update({
                where: { id: Number(body.id) },
                data: { deleted_at: new Date() },
            });

            return c.json(deletedClient);
        } catch (error) {
            console.error(error);
            return c.json({ error: 'Unable to delete client' }, 500);
        }
    });
export { clientApp };