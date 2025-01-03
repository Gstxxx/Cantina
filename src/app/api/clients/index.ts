import { prisma } from '../../../lib/prisma';
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { adminMiddleware, userMiddleware } from '../middlewere/authmiddlewere';
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

const zPaginateSchema = z.object({
    page: z.string(),
});

const zSearchSchema = z.object({
    query: z.string(),
});

const clientApp = new Hono()
    .use(userMiddleware)
    .use(adminMiddleware)
    .basePath("/client")
    .get("/fetch", zValidator("query", zPaginateSchema), async (c) => {
        try {

            const page = c.req.query("page");
            if (!page) {
                return c.json({ error: "Page is required" }, 400);
            }
            const keysPerPage = 20;
            const skip = keysPerPage * (Number(page) - 1);

            const [clients, totalCount] = await Promise.all([
                prisma.client.findMany({
                    where: {
                        deleted_at: null,
                    },
                    skip: skip,
                    take: keysPerPage,
                    include: {
                        purchases: true,
                    },
                }),
                prisma.client.count({
                    where: {
                        deleted_at: null,
                    },
                }),
            ]);

            if (!clients || clients.length === 0) {
                return c.json({ error: "No Clients found" }, 404);
            }

            const totalPages = Math.ceil(totalCount / keysPerPage);

            return c.json({ clients: clients, totalPages, totalCount, }, 200);
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
    })
    .get("/search", zValidator("query", zSearchSchema), async (c) => {
        try {
            const query = c.req.query("query");
            if (!query) {
                return c.json({ error: "Query is required" }, 400);
            }

            const clients = await prisma.client.findMany({
                where: {
                    OR: [
                        { name: { contains: query } },
                        { phone: { contains: query } },
                    ],
                    deleted_at: null,
                },
                include: {
                    purchases: true,
                },
            });

            if (!clients || clients.length === 0) {
                return c.json({ error: "No Clients found" }, 404);
            }

            return c.json({ clients: clients }, 200);
        } catch (error) {
            console.error(error);
            return c.json({ error: 'Unable to search clients' }, 500);
        }
    });
export { clientApp };