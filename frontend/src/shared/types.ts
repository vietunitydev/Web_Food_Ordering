export interface FoodItem {
    _id: string;
    title: string;
    price: number;
    type: string;
    imageURL: string;
}

export interface ApiCartItem {
    _id: string;
    foodItemId: {
        _id: string;
        title: string;
        price: number;
        imageURL: string;
        type: string;
    };
    quantity: number;
}

export interface ApiCart {
    _id: string;
    userId: string;
    list: ApiCartItem[];
}

export interface ContextCartItem {
    id: string;
    name: string;
    price: number;
    imageURL: string;
    quantity: number;
}


export interface User {
    _id: string;
    email: string;
    name: string;
    phone: string;
    address: string;
    role: string;
}

export interface UserProfile {
    email: string;
    name: string;
    phone: string;
    address: string;
}

export interface OrderItem {
    _id: string;
    userId: string;
    name: string;
    address: string;
    email: string;
    phone: string;
    status: string;
    shippingFee: string;
    totalAmount: number;
    payment: number;
    paymentMethod: string;
    discount: number;
    items: [{
        foodItemId: FoodItem;
        quantity: number;
    }]
    createdAt: Date;
    updatedAt: Date;
}