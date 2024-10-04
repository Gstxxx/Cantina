

import * as bcrypt from 'bcrypt';
import { prisma } from 'lib/prisma';

export async function seed() {
    const hashedPassword = await bcrypt.hash('sandra0714', 10);

    await prisma.auth.create({
        data: {
            name: 'Sandra',
            email: 'sandraazevedofestas@outlook.com',
            password: hashedPassword,
            type: 'Admin'
        }
    });

    await prisma.client.create({
        data: {
            name: 'Sandra',
            phone: '11999999999'
        }
    });

    const products = [
        { name: 'Café', price: 200 },
        { name: 'Água', price: 150 },
        { name: 'Suco de Laranja', price: 300 },
        { name: 'Sanduíche de Frango', price: 500 },
        { name: 'Salada de Frutas', price: 400 },
        { name: 'Pão de Queijo', price: 250 },
        { name: 'Bolinho de Bacalhau', price: 350 },
        { name: 'Coxinha', price: 220 },
        { name: 'Pastel', price: 320 },
        { name: 'Açaí', price: 450 }
    ];

    for (const product of products) {
        await prisma.product.create({
            data: product
        });
    }

}

seed();