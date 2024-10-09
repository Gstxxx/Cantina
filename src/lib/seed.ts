import * as bcrypt from 'bcrypt';
import { prisma } from 'lib/prisma';

export async function seed() {
    const hashedPassword = await bcrypt.hash('sandra0714', 10);
    await prisma.auth.create({
        data: {
            name: 'Sandra',
            email: 'dev@master.com',
            password: hashedPassword,
            type: 'Admin'
        }
    });
    for (let i = 1; i <= 100; i++) {
        await prisma.client.create({
            data: {
                name: `Client ${i}`,
                phone: `2${i.toString().padStart(3, '0')}`
            }
        });
    }

    for (let i = 1; i <= 50; i++) {
        await prisma.product.create({
            data: {
                name: `Product ${i}`,
                price: Math.floor(Math.random() * 1000) + 100
            }
        });
    }

    for (let i = 1; i <= 250; i++) {
        const randomClientId = Math.floor(Math.random() * 15) + 1;
        const randomProductId = Math.floor(Math.random() * 100) + 1;
        const randomQuantity = Math.floor(Math.random() * 10) + 1;
        const randomDay = Math.floor(Math.random() * 31) + 1;

        await prisma.purchaseRecord.create({
            data: {
                clientId: randomClientId,
                purchaseDate: new Date(`2024-10-${randomDay.toString().padStart(2, '0')}`),
                products: {
                    create: {
                        productId: randomProductId,
                        quantity: randomQuantity
                    }
                }
            }
        });
    }
}

seed();