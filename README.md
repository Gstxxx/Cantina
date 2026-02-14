# Sandra Café & Cozinha - Sistema de Gestão

Sistema de gestão mobile-first para cantinas, desenvolvido para a **Cantina Sandra Café & Cozinha**.

## 🎨 Design

Interface com tema "caderno digital com carimbo de tinta" — cores quentes de papel envelhecido, café e madeira, com feedback tátil nas interações.

**Paleta:**
- Verde Oliva (`#6B7B4F`) — Brand principal
- Marrom Café (`#5A3E2B`) — Textos
- Bege Papel (`#F7F5F0`) — Fundo
- Cores semânticas para fiado, vendas, alertas

Veja documentação completa em `.interface-design/system.md`

## 🚀 Funcionalidades

### Mobile (Operação Diária)
- **Dashboard:** Resumo do dia (vendas, comandas abertas, fiado)
- **Comandas:** Criar, gerenciar e fechar comandas de mesa/balcão
- **Lançamento Rápido:** Vendas diretas sem comanda
- **Fiado:** Gestão de clientes, extrato, cobranças via WhatsApp
- **Produtos:** Cadastro e edição de cardápio

### Desktop (Análises)
- **Dashboard Analítico:** Métricas do mês, produtos mais vendidos
- Análises por produto, cliente e unidade
- Relatórios de caixa

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (React 19, App Router)
- **Banco:** PostgreSQL (Prisma ORM)
- **Estilo:** Tailwind CSS + CSS Variables (Design System)
- **Tipografia:** Inter
- **API:** REST (Next.js Route Handlers)

## 📁 Estrutura

```
app/
├── page.tsx              # Home mobile
├── comandas/             # Gestão de comandas
├── vendas/nova/          # Lançamento rápido
├── fiado/                # Sistema de fiado
├── produtos/             # Gestão de cardápio
├── dashboard/            # Analytics desktop
├── setup/                # Configuração inicial
├── api/                  # API routes
├── tokens.css            # Design tokens
└── globals.css           # Estilos globais

components/
├── ui/                   # Componentes base (Button, Input, Card...)
├── layout/               # Layout (Header, MobileNav, Container)
├── comandas/             # Componentes de comandas
├── fiado/                # Componentes de fiado
└── dashboard/            # Componentes de analytics

lib/
├── context/              # React Context (App state)
├── api-client.ts         # Cliente HTTP
├── format.ts             # Formatadores (moeda, data)
├── db.ts                 # Prisma client
└── validations/          # Schemas Zod

prisma/
└── schema.prisma         # Schema do banco
```

## 🏃 Como Rodar

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar banco
```bash
# Copiar .env.example para .env e configurar DATABASE_URL
cp .env.example .env

# Rodar migrations
npx prisma migrate dev

# (Opcional) Seed inicial
npx prisma db seed
```

### 3. Iniciar servidor
```bash
npm run dev
```

Acesse `http://localhost:3000`

### 4. Setup inicial
Na primeira vez, acesse `/setup` para configurar tenant e unidade.

## 📱 Fluxos Principais

### Abrir Comanda
1. Comandas → Nova
2. Selecionar Mesa ou Balcão
3. Adicionar produtos
4. Fechar como Pago ou Fiado

### Lançamento Rápido
1. Lançar Venda
2. Adicionar produtos
3. Finalizar com forma de pagamento

### Fiado
1. Fiado → Selecionar cliente
2. Ver extrato (consumo + pagamentos)
3. Registrar pagamento ou Enviar cobrança (WhatsApp)

## 🎯 API Routes

### Comandas
- `GET /api/tenants/[tid]/units/[uid]/orders` — Lista comandas
- `POST /api/tenants/[tid]/units/[uid]/orders` — Criar comanda
- `GET /api/tenants/[tid]/orders/[id]` — Detalhes
- `POST /api/tenants/[tid]/orders/[id]/close` — Fechar
- `POST /api/tenants/[tid]/orders/[id]/items` — Adicionar item

### Produtos
- `GET /api/tenants/[tid]/products` — Listar
- `POST /api/tenants/[tid]/products` — Criar
- `PATCH /api/tenants/[tid]/products/[id]` — Editar

### Clientes/Fiado
- `GET /api/tenants/[tid]/customers` — Listar
- `GET /api/tenants/[tid]/customers/[id]/balance` — Saldo
- `GET /api/tenants/[tid]/customers/[id]/statement` — Extrato
- `POST /api/tenants/[tid]/customers/[id]/payments` — Registrar pagamento

## 🎨 Design System

Todos os tokens de design estão em `app/tokens.css`:
- Cores (surfaces, textos, brand, semânticas)
- Espaçamento (escala 4px)
- Typography (Inter, 4 níveis de hierarquia)
- Shadows (card, overlay)
- Border radius (sm/md/lg)

Componentes usam apenas tokens, nunca valores diretos.

## 📝 Próximos Passos

- [ ] Implementar autenticação (PIN para operadores)
- [ ] Relatórios exportáveis (PDF/Excel)
- [ ] Gráficos interativos (Chart.js/Recharts)
- [ ] Notificações push
- [ ] Modo offline (PWA)
- [ ] Multi-idioma
- [ ] Impressão de comandas/cupons

## 📄 Licença

Uso privado - Sandra Café & Cozinha
