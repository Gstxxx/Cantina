import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Load environment variables
config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed...");

  // Criar tenant
  const tenant = await prisma.tenant.upsert({
    where: { id: "demo-tenant" },
    update: {},
    create: {
      id: "demo-tenant",
      name: "Sandra Café & Cozinha",
    },
  });
  console.log("✅ Tenant criado:", tenant.name);

  // Criar unidades
  const unidade1 = await prisma.unit.upsert({
    where: { id: "unit-1" },
    update: {},
    create: {
      id: "unit-1",
      tenantId: tenant.id,
      name: "Unidade São João",
      address: "Rua Dr. Altair Nogueira, 98, são João, VR",
    },
  });

  const unidade2 = await prisma.unit.upsert({
    where: { id: "unit-2" },
    update: {},
    create: {
      id: "unit-2",
      tenantId: tenant.id,
      name: "Unidade Konnen",
      address: "R. São João, 73 - Centro, Volta Redonda - RJ",
    },
  });
  console.log("✅ Unidades criadas:", unidade1.name, "e", unidade2.name);

  // Criar categorias
  const categorias = await Promise.all([
    prisma.productCategory.upsert({
      where: {
        tenantId_name: { tenantId: tenant.id, name: "Bebidas Quentes" },
      },
      update: {},
      create: {
        tenantId: tenant.id,
        name: "Bebidas Quentes",
        sort: 1,
      },
    }),
    prisma.productCategory.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: "Bebidas Frias" } },
      update: {},
      create: {
        tenantId: tenant.id,
        name: "Bebidas Frias",
        sort: 2,
      },
    }),
    prisma.productCategory.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: "Salgados" } },
      update: {},
      create: {
        tenantId: tenant.id,
        name: "Salgados",
        sort: 3,
      },
    }),
    prisma.productCategory.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: "Doces" } },
      update: {},
      create: {
        tenantId: tenant.id,
        name: "Doces",
        sort: 4,
      },
    }),
  ]);
  console.log("✅ Categorias criadas:", categorias.length);

  // Criar produtos
  const produtos = [
    { name: "Café Expresso", priceCents: 400, categoryName: "Bebidas Quentes" },
    {
      name: "Café com Leite",
      priceCents: 500,
      categoryName: "Bebidas Quentes",
    },
    { name: "Cappuccino", priceCents: 700, categoryName: "Bebidas Quentes" },
    { name: "Chá", priceCents: 350, categoryName: "Bebidas Quentes" },
    { name: "Suco Natural", priceCents: 600, categoryName: "Bebidas Frias" },
    {
      name: "Refrigerante Lata",
      priceCents: 500,
      categoryName: "Bebidas Frias",
    },
    { name: "Água Mineral", priceCents: 300, categoryName: "Bebidas Frias" },
    { name: "Coxinha", priceCents: 600, categoryName: "Salgados" },
    { name: "Pastel", priceCents: 650, categoryName: "Salgados" },
    { name: "Pão de Queijo", priceCents: 400, categoryName: "Salgados" },
    { name: "Empada", priceCents: 550, categoryName: "Salgados" },
    { name: "Bolo Caseiro (fatia)", priceCents: 500, categoryName: "Doces" },
    { name: "Brownie", priceCents: 600, categoryName: "Doces" },
    { name: "Brigadeiro", priceCents: 200, categoryName: "Doces" },
  ];

  for (const prod of produtos) {
    const categoria = categorias.find((c) => c.name === prod.categoryName);
    await prisma.product.upsert({
      where: {
        id: `prod-${prod.name.toLowerCase().replace(/\s+/g, "-")}`,
      },
      update: {},
      create: {
        id: `prod-${prod.name.toLowerCase().replace(/\s+/g, "-")}`,
        tenantId: tenant.id,
        categoryId: categoria?.id,
        name: prod.name,
        priceCents: prod.priceCents,
      },
    });
  }
  console.log("✅ Produtos criados:", produtos.length);

  // Criar mesas para unidade 1
  const mesas = ["Mesa 1", "Mesa 2", "Mesa 3", "Mesa 4", "Mesa 5"];
  for (const mesa of mesas) {
    await prisma.table.upsert({
      where: {
        unitId_name: { unitId: unidade1.id, name: mesa },
      },
      update: {},
      create: {
        tenantId: tenant.id,
        unitId: unidade1.id,
        name: mesa,
      },
    });
  }
  console.log("✅ Mesas criadas:", mesas.length);

  // Criar alguns clientes de exemplo
  const clientes = [
    { name: "João Silva", phone: "(11) 98765-4321" },
    { name: "Maria Santos", phone: "(11) 97654-3210" },
    { name: "Pedro Costa", phone: "(11) 96543-2109" },
  ];

  for (const cliente of clientes) {
    await prisma.customer.upsert({
      where: {
        id: `customer-${cliente.name.toLowerCase().replace(/\s+/g, "-")}`,
      },
      update: {},
      create: {
        id: `customer-${cliente.name.toLowerCase().replace(/\s+/g, "-")}`,
        tenantId: tenant.id,
        name: cliente.name,
        phone: cliente.phone,
      },
    });
  }
  console.log("✅ Clientes criados:", clientes.length);

  console.log("\n🎉 Seed concluído com sucesso!");
  console.log("\n📝 Próximos passos:");
  console.log("1. Acesse: http://localhost:3000/setup");
  console.log("2. Selecione a unidade: Unidade Centro ou Unidade Shopping");
  console.log("3. Comece a usar o sistema!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
