import React, { createContext, useReducer, useEffect, useContext } from 'react';
import { ContextCartItem } from '../../shared/types';

interface AppState {
    cart: ContextCartItem[];
    token: string | null;
    role: string | null;
    discount: number;
    appliedPromoCode: string | null;
    isLoading: boolean;
}

interface AppContextType {
    state: AppState;
    dispatch: React.Dispatch<any>;
}

const initialState: AppState = {
    cart: [],
    token: null,
    role: null,
    discount: 0,
    appliedPromoCode: null,
    isLoading: true,
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const actionTypes = {
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    ADD_TO_CART: 'ADD_TO_CART',
    SET_CART: 'SET_CART',
    UPDATE_QUANTITY: 'UPDATE_QUANTITY',
    REMOVE_FROM_CART: 'REMOVE_FROM_CART',
    CLEAR_CART: 'CLEAR_CART',
    SET_DISCOUNT: 'SET_DISCOUNT',
    CLEAR_DISCOUNT: 'CLEAR_DISCOUNT',
    SET_LOADING: 'SET_LOADING',
};

const appReducer = (state: AppState, action: any): AppState => {
    switch (action.type) {
        case actionTypes.LOGIN:
            return { ...state, token: action.payload.token, role: action.payload.role, isLoading: false };
        case actionTypes.LOGOUT:
            return { ...state, token: null, role: null, cart: [], discount: 0, appliedPromoCode: null, isLoading: false };
        case actionTypes.ADD_TO_CART:
            const existingItem = state.cart.find((item) => item.id === action.payload.id);
            if (existingItem) {
                return {
                    ...state,
                    cart: state.cart.map((item) =>
                        item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item
                    ),
                };
            }
            return {
                ...state,
                cart: [...state.cart, { ...action.payload, quantity: 1 }],
            };
        case actionTypes.SET_CART:
            return { ...state, cart: action.payload };
        case actionTypes.UPDATE_QUANTITY:
            return {
                ...state,
                cart: state.cart.map((item) =>
                    item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
                ),
            };
        case actionTypes.REMOVE_FROM_CART:
            return {
                ...state,
                cart: state.cart.filter((item) => item.id !== action.payload.id),
            };
        case actionTypes.CLEAR_CART:
            return { ...state, cart: [], discount: 0, appliedPromoCode: null };
        case actionTypes.SET_DISCOUNT:
            return {
                ...state,
                discount: action.payload.discount,
                appliedPromoCode: action.payload.promoCode,
            };
        case actionTypes.CLEAR_DISCOUNT:
            return { ...state, discount: 0, appliedPromoCode: null };
        case actionTypes.SET_LOADING:
            return { ...state, isLoading: action.payload };
        default:
            return state;
    }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState, () => {
        const savedToken = localStorage.getItem('token');
        return {
            cart: [],
            token: savedToken,
            role: null,
            discount: 0,
            appliedPromoCode: null,
            isLoading: !!savedToken,
        };
    });

    useEffect(() => {
        const fetchRole = async () => {
            if (state.token) {
                dispatch({ type: actionTypes.SET_LOADING, payload: true });
                try {
                    const response = await fetch('http://localhost:4999/api/auth/me', {
                        headers: { Authorization: `Bearer ${state.token}` },
                    });
                    const data = await response.json();
                    if (response.ok) {
                        dispatch({ type: actionTypes.LOGIN, payload: { token: state.token, role: data.data.role } });
                    } else {
                        console.error('Failed to fetch role:', data.message);
                        localStorage.removeItem('token');
                        dispatch({ type: actionTypes.LOGOUT });
                    }
                } catch (err) {
                    console.error('Error fetching role:', err);
                    localStorage.removeItem('token');
                    dispatch({ type: actionTypes.LOGOUT });
                } finally {
                    dispatch({ type: actionTypes.SET_LOADING, payload: false });
                }
            } else {
                dispatch({ type: actionTypes.SET_LOADING, payload: false });
            }
        };
        fetchRole();

        localStorage.setItem('token', state.token || '');
    }, [state.token]);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

export const getTotalItems = (cart: ContextCartItem[]) => {
    return cart.reduce((total, item) => total + item.quantity, 0);
};

export const actions = actionTypes;