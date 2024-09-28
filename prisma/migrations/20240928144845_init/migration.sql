-- CreateTable
CREATE TABLE "Cliente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Produto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "preco" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Variante" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "preco" INTEGER NOT NULL,
    "produtoId" INTEGER NOT NULL,
    CONSTRAINT "Variante_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RegistroCompra" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dataCompra" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clienteId" INTEGER NOT NULL,
    CONSTRAINT "RegistroCompra_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProdutoCompra" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "produtoId" INTEGER NOT NULL,
    "registroCompraId" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    CONSTRAINT "ProdutoCompra_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProdutoCompra_registroCompraId_fkey" FOREIGN KEY ("registroCompraId") REFERENCES "RegistroCompra" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Produto_nome_key" ON "Produto"("nome");
