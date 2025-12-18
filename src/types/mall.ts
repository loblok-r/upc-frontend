
export interface Product {
    id: string;
    name: string;
    description?: string;
    category: string; 
    pointsRequired: number;
    originalPrice?: number;
    stock: number;
    limitPerUser?: number;
    tag?: string;
    imageUrl: string;
    status: string; 
    sortOrder: number;
    createdAt: string;
}

export interface FlashSaleItem {
    id: string;
    productId: string;
    productName: string;
    description: string;
    salePrice: number;
    originalPrice: number;
    totalStock: number;
    remainingStock: number;
    startTime: string;
    endTime: string;
    dailyLimit: number;
    image: string;
    status: 'upcoming' | 'active' | 'ended';
}

export interface ProductsResponse {
    products: Product[];
    total: number;
    page: number;
    limit: number;
}

export interface ExchangeRequest {
    productId: string;
    quantity?: number;
}

export interface ExchangeResponse {
    orderId: string;
    success: boolean;
    message: string;
    virtualContent?: string;
}

export interface GrabFlashRequest {
    flashSaleId: string;
    quantity?: number;
}

export interface GrabFlashResponse {
    orderId: string;
    success: boolean;
    message: string;
    reserveExpiresAt?: string;
    virtualContent?: string;
}

export interface UserPointsResponse {
    balance: number;
    totalEarned: number;
    totalSpent: number;
}
