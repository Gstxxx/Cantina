import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { prisma } from '../../../lib/prisma';
import { adminMiddleware, userMiddleware } from '../middlewere/authmiddlewere';

const zCreatePurchase = z.object({
    clientId: z.number(),
    products: z.array(
        z.object({
            productId: z.number(),
            quantity: z.number().min(1)
        })
    )
});

const zDeletePurchase = z.object({
    purchaseId: z.number()
});

const zFetchReport = z.object({
    start: z.string(),
    end: z.string()
});

const purchaseApp = new Hono()
    .basePath('/purchases')
    .use(userMiddleware)
    .use(adminMiddleware)
    .post('/create', zValidator('json', zCreatePurchase), async (c) => {
        const body = c.req.valid('json');

        try {
            const client = await prisma.client.findUnique({
                where: { id: body.clientId, deleted_at: null },
            });

            if (!client) {
                return c.json({ error: 'Client not found' }, 404);
            }

            const purchase = await prisma.purchaseRecord.create({
                data: {
                    clientId: body.clientId,
                    products: {
                        create: body.products.map((p: { productId: number, quantity: number }) => ({
                            productId: p.productId,
                            quantity: p.quantity,
                        })),
                    },
                },
                include: {
                    products: true,
                },
            });

            return c.json(purchase, 201);
        } catch (error) {
            console.error(error);
            return c.json({ error: 'Unable to create purchase' }, 500);
        }
    })
    .get('/client/:clientId', async (c) => {
        const clientId = Number(c.req.param('clientId'));

        try {
            const client = await prisma.client.findUnique({
                where: { id: clientId, deleted_at: null },
                include: {
                    purchases: {
                        include: {
                            products: {
                                include: {
                                    product: true,
                                },
                            },
                        },
                    },
                },
            });

            if (!client) {
                return c.json({ error: 'Client not found' }, 404);
            }

            return c.json(client.purchases);
        } catch (error) {
            console.error(error);
            return c.json({ error: 'Unable to fetch purchases' }, 500);
        }
    })
    .post('/delete', zValidator('json', zDeletePurchase), async (c) => {
        const body = c.req.valid('json');

        try {
            const purchase = await prisma.purchaseRecord.findUnique({
                where: { id: body.purchaseId, deleted_at: null },
            });

            if (!purchase) {
                return c.json({ error: 'Purchase not found or already deleted' }, 404);
            }

            const deletedPurchase = await prisma.purchaseRecord.update({
                where: { id: body.purchaseId },
                data: { deleted_at: new Date() },
            });

            return c.json(deletedPurchase, 200);
        } catch (error) {
            console.error(error);
            return c.json({ error: 'Unable to delete purchase' }, 500);
        }
    })
    .post('/report', zValidator('json', zFetchReport), async (c) => {
        const { start, end } = c.req.valid('json');

        try {
            const purchases = await prisma.purchaseRecord.findMany({
                where: {
                    deleted_at: null,
                    purchaseDate: {
                        gte: new Date(start),
                        lte: new Date(end),
                    },
                },
                include: {
                    client: true,
                    products: {
                        include: {
                            product: true,
                        },
                    },
                },
            });

            return c.json(purchases, 200);
        } catch (error) {
            console.error(error);
            return c.json({ error: 'Unable to fetch report' }, 500);
        }
    });

export { purchaseApp };
