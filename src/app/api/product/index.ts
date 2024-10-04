import { prisma } from '../../../lib/prisma';
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { adminMiddleware, userMiddleware } from '../middlewere/authmiddlewere';

const zCreateProductSchema = z.object({
    name: z.string(),
    price: z.number().positive(),
});

const zUpdateProductSchema = z.object({
    id: z.number(),
    name: z.string().optional(),
    price: z.number().positive().optional(),
});

const zDeleteProductSchema = z.object({
    id: z.number().positive(),
});

const zGetInfoSchema = z.object({
    id: z.number().positive(),
});

const productApp = new Hono()
    .basePath("/product")
    .use(userMiddleware)
    .use(adminMiddleware)
    .get("/fetch", async (c) => {
        try {
            const clients = await prisma.product.findMany({
                where: { deleted_at: null },
            });
            return c.json(clients, 200);
        } catch (error) {
            console.error(error);
            return c.json({ error: 'Unable to fetch clients' }, 500);
        }
    })
    .post("/create", zValidator("json", zCreateProductSchema), async (c) => {
        try {
            const body = c.req.valid("json");

            if (!body.name || !body.price) {
                return c.json({ error: 'Name and price are required' }, 400);
            }

            const client = await prisma.product.create({
                data: body,
            });

            return c.json(client, 201);
        } catch (error) {
            console.error(error);
            return c.json({ error: 'Unable to create client' }, 500);
        }
    })
    .post("/update", zValidator("json", zUpdateProductSchema), async (c) => {
        try {
            const body = c.req.valid("json");

            if (!body.id) {
                return c.json({ error: 'ID is required' }, 400);
            }
            const get_product = await prisma.product.findUnique({
                where: { id: body.id },
            });
            if (!get_product) {
                return c.json({ error: "Product doesn't exist" }, 400);
            }

            const client = await prisma.product.update({
                where: { id: body.id },
                data: body,
            });

            return c.json(client, 200);
        } catch (error) {
            console.error(error);
            return c.json({ error: 'Unable to update client' }, 500);
        }
    })
    .post("/delete", zValidator("json", zDeleteProductSchema), async (c) => {
        try {
            const body = c.req.valid("json");

            if (!body.id) {
                return c.json({ error: 'ID is required' }, 400);
            }

            const get_product = await prisma.product.findUnique({
                where: { id: body.id },
            });
            if (!get_product) {
                return c.json({ error: "Product doesn't exist" }, 400);
            }

            const client = await prisma.product.update({
                where: { id: body.id },
                data: { deleted_at: new Date() },
            });

            return c.json(client, 200);
        } catch (error) {
            console.error(error);
            return c.json({ error: 'Unable to delete client' }, 500);
        }
    })
    .post("/remove-deletion", zValidator("json", zDeleteProductSchema), async (c) => {
        try {
            const body = c.req.valid("json");

            if (!body.id) {
                return c.json({ error: 'ID is required' }, 400);
            }

            const get_product = await prisma.product.findUnique({
                where: { id: body.id },
            });
            if (!get_product) {
                return c.json({ error: "Product doesn't exist" }, 400);
            }

            const client = await prisma.product.update({
                where: { id: body.id },
                data: { deleted_at: null },
            });

            return c.json(client, 200);
        } catch (error) {
            console.error(error);
            return c.json({ error: 'Unable to remove deletion' }, 500);
        }
    })
    .post("/get-info", zValidator("json", zGetInfoSchema), async (c) => {
        try {
            const body = c.req.valid("json");

            if (!body.id) {
                return c.json({ error: 'ID is required' }, 400);
            }

            const product = await prisma.product.findUnique({
                where: { id: body.id },
            });
            if (!product) {
                return c.json({ error: "Product doesn't exist" }, 400);
            }

            return c.json(product, 200);
        } catch (error) {
            console.error(error);
            return c.json({ error: 'Unable to get product info' }, 500);
        }
    });
export { productApp };