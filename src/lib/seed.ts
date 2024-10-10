import * as bcrypt from 'bcrypt';
import { prisma } from 'lib/prisma';
import { faker } from '@faker-js/faker';

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
                name: faker.person.fullName(),
                phone: faker.phone.number({ style: 'national' })
            }
        });
    }

    for (let i = 1; i <= 50; i++) {
        await prisma.product.create({
            data: {
                name: faker.food.dish(),
                price: Number(faker.commerce.price({ min: 100, max: 2000, dec: 0 }))
            }
        });
    }

    for (let i = 1; i <= 2500; i++) {
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