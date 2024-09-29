import { prisma } from '../../../lib/prisma.js';
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const zCreateUserSchema = z.object({
    name: z.string(),
    phone: z.string(),
});

const clientsApp = new Hono()
    .basePath("/clients")
    .get("/fetch", async (c) => {
        try {
            const clients = await prisma.client.findMany({
                where: { deleted_at: null },
            });
            return c.json(clients, 200);
        } catch (error) {
            console.error(error);
            return c.json({ error: 'Unable to fetch clients' }, 500);
        }
    })
    .post("/create", zValidator("json", zCreateUserSchema), async (c) => {
        try {
            const body = c.req.valid("json");

            if (!body.name || !body.phone) {
                return c.json({ error: 'Name and phone are required' }, 400);
            }

            const client = await prisma.client.create({
                data: body,
            });

            return c.json(client, 201);
        } catch (error) {
            console.error(error);
            return c.json({ error: 'Unable to create client' }, 500);
        }
    });
export { clientsApp };