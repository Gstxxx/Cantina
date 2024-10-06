export interface Auth {
    id: number;
    email: string;
    name: string;
    password: string;
    type: string;
    refreshTokens: RefreshToken[];
}

export interface RefreshToken {
    id: number;
    token: string;
    authId: number | null;
}

export interface Client {
    id: number;
    name: string;
    phone: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    purchases: PurchaseRecord[];
}

export interface Product {
    id: number;
    name: string;
    price: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    products: ProductPurchase[];
}

export interface PurchaseRecord {
    id: number;
    purchaseDate: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    clientId: number;
    client: Client;
    products: ProductPurchase[];
}

export interface ProductPurchase {
    id: number;
    productId: number;
    purchaseRecordId: number;
    quantity: number;
    product: Product;
    record: PurchaseRecord;
}

export interface GenerateReportRequest {
    month: string;
    data: PurchaseRecord[];
}
