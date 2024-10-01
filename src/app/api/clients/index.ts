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

const zCreateUserSchema = z.object({
    name: z.string(),
    phone: z.string(),
});

const clientApp = new Hono()
    .basePath("/client")
    .get("/fetch", async (c) => {
        try {
            const clients = await prisma.client.findMany({
                where: { deleted_at: null },
            });
            if (clients.length === 0) {
                return c.json({ message: 'No clients found' }, 404);
            }
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

            const [check_client, check_number] = await Promise.all([
                prisma.client.findUnique({ where: { name: body.name } }),
                prisma.client.findUnique({ where: { phone: body.phone } }),
            ]);

            if (check_client) {
                return c.json({ error: "Client already exist" }, 400);
            }
            if (check_number) {
                return c.json({ error: "Number already exist" }, 400);
            }

            const client = await prisma.client.create({
                data: body,
            });

            return c.json(client, 201);
        } catch (error) {
            console.error(error);
            return c.json({ error: 'Unable to create client' }, 500);
        }
    })
    .post("/get-info", zValidator("json", zFetch), async (c) => {
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
            const find_client = await prisma.client.findUnique({
                where: { id: body.id, deleted_at: null },
            });
            if (!find_client) {
                return c.json({ error: "Client doesn't exist" }, 400);
            }
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
            const find_client = await prisma.client.findUnique({
                where: { id: body.id, deleted_at: null },
            });
            if (!find_client) {
                return c.json({ error: "Client doesn't exist or already deleted" }, 404);
            }
            const deletedClient = await prisma.client.update({
                where: { id: Number(body.id) },
                data: { deleted_at: new Date() },
            });

            return c.json(deletedClient);
        } catch (error) {
            console.error(error);
            return c.json({ error: 'Unable to delete client' }, 500);
        }
    })
    .post("/remove-deletion", zValidator("json", zFetch), async (c) => {
        const body = c.req.valid("json");
        try {
            const find_client = await prisma.client.findUnique({
                where: { id: body.id },
            });
            if (!find_client) {
                return c.json({ error: "Client doesn't exist" }, 400);
            }

            const restoredClient = await prisma.client.update({
                where: { id: Number(body.id) },
                data: { deleted_at: null },
            });

            return c.json(restoredClient, 200);
        } catch (error) {
            console.error(error);
            return c.json({ error: 'Unable to remove deletion' }, 500);
        }
    });
export { clientApp };