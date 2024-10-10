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

    const foods = ['Arroz', 'Feijão', 'Macarrão', 'Carne', 'Frango', 'Peixe', 'Salada', 'Sopa', 'Pizza', 'Hambúrguer', 'Cachorro-quente', 'Taco', 'Burrito', 'Sushi', 'Sashimi', 'Tempurá', 'Yakissoba', 'Guioza', 'Harumaki', 'Coxinha', 'Pastel', 'Esfiha', 'Kibe', 'Tabule', 'Quibebe', 'Baião de dois', 'Vatapá', 'Moqueca', 'Bobó de camarão', 'Caruru'];
    for (let i = 0; i < foods.length; i++) {
        await prisma.product.create({
            data: {
                name: foods[i],
                price: Math.floor(Math.random() * 1000) + 100
            }
        });
    }

    for (let i = 1; i <= 250; i++) {
        const randomClientId = Math.floor(Math.random() * 100) + 1;
        const randomProductId = Math.floor(Math.random() * foods.length) + 1; 
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