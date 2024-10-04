// types.ts (You can create this file to keep your types organized)
export interface Auth {
    id: number;
    email: string;
    password: string;
    type: string;
    refreshToken: string;
}
export interface Product {
    id: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    productId: number;
    purchaseRecordId: number;
    quantity: number;
    product: {
        id: number;
        name: string;
        price: number;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
    };
}

export interface Client {
    id: number;
    name: string;
    phone: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface PurchaseRecord {
    id: number;
    purchaseDate: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    clientId: number;
    client: Client;
    products: Product[];
}

export interface GenerateReportRequest {
    month: string;
    data: PurchaseRecord[];
}
