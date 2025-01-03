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
const zUpdatePurchase = z.object({
    id: z.number(),
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
const zFetchReportPaginate = z.object({
    start: z.string(),
    end: z.string(),
    page: z.number()
});

const zGeneratePDF = z.object({
    clientId: z.number(),
    start: z.string(),
    end: z.string()
});

const zSearchQuery = z.object({
    query: z.string(),
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
    }).post('/edit', zValidator('json', zUpdatePurchase), async (c) => {
        const body = c.req.valid('json');

        try {
            const purchase = await prisma.purchaseRecord.findUnique({
                where: { id: body.id, deleted_at: null },
                include: {
                    products: true,
                },
            });

            if (!purchase) {
                return c.json({ error: 'Purchase not found' }, 404);
            }

            type UpdateOperation = {
                where: { id: number };
                data: { quantity: number };
            };

            const updateOperations: UpdateOperation[] = [];
            const createOperations: { productId: number, quantity: number }[] = [];
            const deleteOperations: number[] = []; 

            body.products.forEach((p: { productId: number, quantity: number }) => {
                const existingProduct = purchase.products.find(prod => prod.productId === p.productId);

                if (existingProduct) {
                    if (existingProduct.quantity !== p.quantity) {
                        updateOperations.push({
                            where: { id: existingProduct.id },
                            data: { quantity: p.quantity },
                        });
                    }
                } else {
                    createOperations.push({
                        productId: p.productId,
                        quantity: p.quantity,
                    });
                }
            });

            purchase.products.forEach((existingProduct) => {
                const isStillPresent = body.products.some(p => p.productId === existingProduct.productId);
                if (!isStillPresent) {
                    deleteOperations.push(existingProduct.id);
                }
            });

            for (const updateOp of updateOperations) {
                await prisma.productPurchase.update({
                    where: updateOp.where,
                    data: updateOp.data,
                });
            }

            if (createOperations.length > 0) {
                await prisma.purchaseRecord.update({
                    where: { id: body.id },
                    data: {
                        products: {
                            create: createOperations,
                        },
                    },
                });
            }

            for (const productId of deleteOperations) {
                await prisma.productPurchase.delete({
                    where: { id: productId },
                });
            }

            return c.json({ message: 'Purchase updated successfully' }, 200);
        } catch (error) {
            console.error(error);
            return c.json({ error: 'Unable to update purchase' }, 500);
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
    })
    .post('/paginate', zValidator('json', zFetchReportPaginate), async (c) => {
        const { start, end, page } = c.req.valid('json');
        const keysPerPage = 10;
        const skip = keysPerPage * (page - 1);

        try {
            const [PurchaseRecord, totalCount] = await Promise.all([
                prisma.purchaseRecord.findMany({
                    where: {
                        deleted_at: null,
                        purchaseDate: {
                            gte: new Date(start),
                            lte: new Date(end),
                        },
                    },
                    skip: skip,
                    take: keysPerPage,
                    include: {
                        client: true,
                        products: {
                            include: {
                                product: true,
                            },
                        },
                    },
                }),
                prisma.purchaseRecord.count({
                    where: {
                        deleted_at: null,
                        purchaseDate: {
                            gte: new Date(start),
                            lte: new Date(end),
                        },
                    },
                }),
            ]);

            if (!PurchaseRecord || PurchaseRecord.length === 0) {
                return c.json({ error: "No purchases found" }, 404);
            }

            const totalPages = Math.ceil(totalCount / keysPerPage);

            return c.json({ PurchaseRecord, totalPages, totalCount }, 200);
        } catch (error) {
            console.error(error);
            return c.json({ error: 'Unable to fetch report' }, 500);
        }
    })
    .post('/generate-pdf', zValidator('json', zGeneratePDF), async (c) => {
        const { clientId, start, end } = c.req.valid('json');

        try {
            // Fetch client details
            const client = await prisma.client.findUnique({
                where: { id: clientId, deleted_at: null },
            });

            if (!client) {
                return c.json({ error: 'Client not found' }, 404);
            }

            const purchases = await prisma.purchaseRecord.findMany({
                where: {
                    clientId: clientId,
                    purchaseDate: {
                        gte: new Date(start),
                        lt: new Date(end)
                    }
                },
                include: {
                    products: {
                        include: {
                            product: true,
                        },
                    },
                },
            });

            if (!purchases || purchases.length === 0) {
                return c.json({ error: 'No purchases found for the specified period' }, 404);
            }

            // Prepare data for frontend
            const dataForFrontend = {
                client: {
                    id: client.id,
                    name: client.name,
                },
                purchases: purchases.map(purchase => ({
                    date: purchase.purchaseDate,
                    products: purchase.products.map(product => ({
                        name: product.product.name,
                        quantity: product.quantity,
                        price: product.product.price,
                    })),
                })),
            };

            return c.json(dataForFrontend, 200);
        } catch (error) {
            console.error(error);
            return c.json({ error: 'Unable to generate PDF' }, 500);
        }
    })
    .get('/search', zValidator('query', zSearchQuery), async (c) => {
        const { query } = c.req.valid('query');
        if (!query) {
            return c.json({ error: "Query is required" }, 400);
        }
        try {
            const purchases = await prisma.purchaseRecord.findMany({
                where: {
                    deleted_at: null,
                    id: Number(query)
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

            if (!purchases || purchases.length === 0) {
                return c.json({ error: 'No purchases found matching the query' }, 404);
            }

            return c.json(purchases, 200);
        } catch (error) {
            console.error(error);
            return c.json({ error: 'Unable to search purchases' }, 500);
        }
    });

export { purchaseApp };
