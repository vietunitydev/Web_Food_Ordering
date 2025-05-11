import React, { useState, useEffect } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import { useAppContext, actions } from '../../components/AppContext/AppContext.tsx';
import axios from 'axios';
import './CartPage.css';
import { ContextCartItem } from '../../shared/types.ts';
import { toast } from "react-toastify";

const CartPage: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [promoCode, setPromoCode] = useState('');
    const [couponError, setCouponError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [serverCart, setServerCart] = useState<ContextCartItem[]>([]);
    const [isCartModified, setIsCartModified] = useState(false);
    const [inputValues, setInputValues] = useState<Record<string, string>>({});

    const formatPrice = (price: number | undefined | null): string => {
        if (price === undefined || price === null || isNaN(price)) {
            return '$0.00';
        }

        const numPrice = Number(price);
        if (numPrice >= 1000000) {
            return `$${(numPrice / 1000000).toFixed(1)}M`;
        } else if (numPrice >= 1000) {
            return `$${(numPrice / 1000).toFixed(1)}K`;
        }
        return `$${numPrice.toFixed(2)}`;
    };

    useEffect(() => {
        const fetchCart = async () => {
            if (state.role !== 'user') {
                toast.error('Bạn không có quyền truy cập trang này.');
                navigate('/login');
                return;
            }

            setIsLoading(true);
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/carts/my-cart`, {
                    headers: { Authorization: `Bearer ${state.token}` },
                });
                const cartItems = response.data.list.map((item: any) => ({
                    id: item.foodItemId._id,
                    name: item.foodItemId.title,
                    price: Number(item.foodItemId.price) || 0, // Chuyển đổi price thành number, mặc định 0 nếu không hợp lệ
                    quantity: item.quantity,
                    imageURL: item.foodItemId.imageURL,
                }));
                dispatch({ type: actions.SET_CART, payload: cartItems });
                setServerCart(JSON.parse(JSON.stringify(cartItems)));
                setIsCartModified(false);
            } catch (error) {
                console.error('Lỗi khi lấy giỏ hàng:', error);
                setCouponError('Lỗi khi lấy giỏ hàng.');
            } finally {
                setIsLoading(false);
            }
        };
        if (state.token && state.role === 'user') fetchCart();
    }, [dispatch, state.token, state.role, navigate]);

    const checkCartModified = () => {
        if (state.cart.length !== serverCart.length) {
            return true;
        }

        const serverCartMap = new Map();
        serverCart.forEach(item => {
            serverCartMap.set(item.id, item);
        });

        for (const item of state.cart) {
            const serverItem = serverCartMap.get(item.id);

            if (!serverItem || serverItem.quantity !== item.quantity) {
                return true;
            }
        }

        return false;
    };

    useEffect(() => {
        if (serverCart.length > 0) {
            setIsCartModified(checkCartModified());
        }
    }, [state.cart]);

    const validateQuantity = (value: string | number): number => {
        if (typeof value === 'number') {
            return Math.max(1, value);
        }

        if (value === '') {
            return 1;
        }

        const parsedValue = parseInt(value, 10);

        if (isNaN(parsedValue)) {
            return 1;
        }

        return Math.max(1, parsedValue);
    };

    const updateQuantityLocally = (id: string, newQuantity: number | string) => {
        const validatedQuantity = typeof newQuantity === 'string'
            ? validateQuantity(newQuantity)
            : newQuantity;

        if (validatedQuantity <= 0) {
            removeFromCart(id);
        } else {
            dispatch({ type: actions.UPDATE_QUANTITY, payload: { id, quantity: validatedQuantity } });
            setInputValues({ ...inputValues, [id]: validatedQuantity.toString() });
        }
    };

    const removeFromCart = async (id: string) => {
        const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?");
        if (!confirmDelete) return;

        setIsLoading(true);
        try {
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/carts/remove/${id}`,
                { headers: { Authorization: `Bearer ${state.token}` } }
            );
            dispatch({ type: actions.REMOVE_FROM_CART, payload: { id } });
            setServerCart(serverCart.filter(item => item.id !== id));
            setIsCartModified(false);
            toast.success('Đã xóa sản phẩm khỏi giỏ hàng!');
        } catch (error) {
            console.error('Lỗi khi xóa sản phẩm:', error);
            setCouponError('Lỗi khi xóa sản phẩm.');
            toast.error('Có lỗi khi xóa sản phẩm.');
        } finally {
            setIsLoading(false);
        }
    };

    const updateCartOnServer = async () => {
        setIsLoading(true);
        try {
            await axios.put(
                `${import.meta.env.VITE_API_URL}/api/carts/update-all`,
                { items: state.cart.map(item => ({ foodItemId: item.id, quantity: item.quantity })) },
                { headers: { Authorization: `Bearer ${state.token}` } }
            );
            setServerCart(JSON.parse(JSON.stringify(state.cart)));
            setIsCartModified(false);
            toast.success('Giỏ hàng đã được cập nhật!');
        } catch (error) {
            console.error('Lỗi khi cập nhật giỏ hàng:', error);
            setCouponError('Lỗi khi cập nhật giỏ hàng.');
            toast.error('Có lỗi khi cập nhật giỏ hàng.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuantityInputChange = (id: string, value: string) => {
        if (/^[0-9]*$/.test(value)) {
            setInputValues({ ...inputValues, [id]: value });
            if (value !== '') {
                const numValue = parseInt(value, 10);
                if (!isNaN(numValue)) {
                    dispatch({ type: actions.UPDATE_QUANTITY, payload: { id, quantity: numValue } });
                }
            }
        }
    };

    const handleQuantityBlur = (id: string, value: string) => {
        let validatedQuantity = 1;
        if (value !== '') {
            const numValue = parseInt(value, 10);
            if (!isNaN(numValue) && numValue > 0) {
                validatedQuantity = numValue;
            }
        }
        dispatch({ type: actions.UPDATE_QUANTITY, payload: { id, quantity: validatedQuantity } });
        setInputValues({ ...inputValues, [id]: validatedQuantity.toString() });
    };

    const handlePromoSubmit = async () => {
        if (!promoCode) {
            setCouponError('Vui lòng nhập mã giảm giá.');
            return;
        }

        if (state.appliedPromoCode) {
            setCouponError(`Mã "${state.appliedPromoCode}" đã được áp dụng. Xóa mã để thử mã khác.`);
            return;
        }

        setIsLoading(true);
        try {
            const subtotal = state.cart.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0); // Xử lý price không hợp lệ
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/coupons/apply`,
                { code: promoCode, orderTotal: subtotal },
                { headers: { Authorization: `Bearer ${state.token}` } }
            );

            if (response.data.success) {
                dispatch({
                    type: actions.SET_DISCOUNT,
                    payload: { discount: Number(response.data.data.discountAmount) || 0, promoCode },
                });
                setCouponError(null);
                toast.success(`Mã giảm giá "${promoCode}" đã được áp dụng! Giảm: ${formatPrice(Number(response.data.data.discountAmount) || 0)}`);
                setPromoCode('');
            } else {
                setCouponError(response.data.message || 'Mã giảm giá không hợp lệ.');
            }
        } catch (error: any) {
            console.error('Error applying coupon:', error);
            setCouponError(error.response?.data?.message || 'Lỗi khi áp dụng mã giảm giá.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearPromo = () => {
        dispatch({ type: actions.CLEAR_DISCOUNT });
        setCouponError(null);
    };

    const handleCheckout = async () => {
        if (isCartModified) {
            const confirmSave = window.confirm(
                "Giỏ hàng của bạn có thay đổi chưa được lưu. Bạn có muốn lưu các thay đổi trước khi thanh toán không?"
            );

            if (confirmSave) {
                try {
                    await updateCartOnServer();
                    navigate('/checkout');
                } catch (error) {
                    console.error('Lỗi khi lưu giỏ hàng:', error);
                    toast.error('Có lỗi xảy ra khi lưu giỏ hàng. Vui lòng thử lại.');
                }
            } else {
                navigate('/checkout');
            }
        } else {
            navigate('/checkout');
        }
    };

    const handleUpdateCart = () => {
        updateCartOnServer();
    };

    const subtotal = state.cart.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0); // Xử lý price không hợp lệ
    const deliveryFee = 2; // Đảm bảo là number
    const total = subtotal + deliveryFee - (Number(state.discount) || 0); // Xử lý discount không hợp lệ

    if (state.role !== 'user') {
        return <div>Bạn không có quyền truy cập trang này.</div>;
    }

    const LoadingSpinner = () => (
        <div className="loading-spinner">
            <div className="spinner"></div>
        </div>
    );

    return (
        <div className="cart-page">
            <h2 className="cart-title">Giỏ hàng</h2>
            {state.cart.length === 0 ? (
                <div className="cart-empty"><p>Giỏ hàng của bạn đang trống.</p></div>
            ) : (
                <>
                    <div className="cart-content">
                        {isLoading && <LoadingSpinner />}
                        <table className="cart-table">
                            <thead>
                            <tr>
                                <th className="col-image">Món</th>
                                <th className="col-name">Tên</th>
                                <th className="col-price">Giá</th>
                                <th className="col-quantity">Số lượng</th>
                                <th className="col-total">Tổng</th>
                                <th className="col-remove">Xoá</th>
                            </tr>
                            </thead>
                            <tbody>
                            {state.cart.map((item: ContextCartItem) => (
                                <tr key={item.id}>
                                    <Link to={`/food/${item.id}`} className="pizza-image-link">
                                        <td className="col-image">
                                            <img
                                                src={`${item.imageURL}`}
                                                alt={item.name}
                                                className="cart-item-image"
                                            />
                                        </td>
                                    </Link>
                                    <td className="col-name">{item.name}</td>
                                    <td className="col-price">{formatPrice(Number(item.price) || 0)}</td>
                                    <td className="col-quantity">
                                        <div className="quantity-control">
                                            <input
                                                type="text"
                                                pattern="[0-9]*"
                                                value={inputValues[item.id] !== undefined ? inputValues[item.id] : item.quantity}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleQuantityInputChange(item.id, e.target.value)}
                                                onBlur={(e: React.FocusEvent<HTMLInputElement>) => handleQuantityBlur(item.id, e.target.value)}
                                                className="quantity-input"
                                                min="1"
                                            />
                                            <div className="quantity-buttons">
                                                <button
                                                    onClick={() => updateQuantityLocally(item.id, item.quantity + 1)}
                                                    className="quantity-button quantity-increase"
                                                    disabled={isLoading}
                                                >
                                                    +
                                                </button>
                                                <button
                                                    onClick={() => updateQuantityLocally(item.id, item.quantity - 1)}
                                                    disabled={isLoading}
                                                    className="quantity-button quantity-decrease"
                                                >
                                                    −
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="col-total">{formatPrice((Number(item.price) || 0) * item.quantity)}</td>
                                    <td className="col-remove">
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="remove-button"
                                            disabled={isLoading}
                                        >
                                            ✕
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <div className="update-cart-container">
                            <div>
                                <button
                                    onClick={handleUpdateCart}
                                    className="update-cart-button"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Đang lưu...' : 'Lưu giỏ hàng'}
                                    {isLoading && <span className="button-spinner"></span>}
                                </button>
                            </div>
                            <div>
                                {isCartModified && !isLoading && (
                                    <span className="cart-modified-warning">
                                        Chưa lưu giỏ hàng
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="cart-summary">
                        <div className="summary-left">
                            <h3 className="summary-title">Tổng giỏ hàng</h3>
                            <div className="summary-row">
                                <span>Tổng giá món</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Phí giao hàng</span>
                                <span>{formatPrice(deliveryFee)}</span>
                            </div>
                            {state.discount > 0 && (
                                <div className="summary-row">
                                    <span>Giảm giá ({state.appliedPromoCode})</span>
                                    <span>-{formatPrice(Number(state.discount) || 0)}</span>
                                </div>
                            )}
                            <div className="summary-row total">
                                <span>Tổng</span>
                                <span>{formatPrice(total)}</span>
                            </div>
                            <button
                                onClick={handleCheckout}
                                className="checkout-button"
                                disabled={isLoading}
                            >
                                Tiến hành thanh toán
                            </button>
                        </div>
                        <div className="summary-right">
                            <div className="promo-section">
                                <p>NẾU BẠN CÓ MÃ GIẢM GIÁ, HÃY ĐIỀN Ở ĐÂY</p>
                                <div className="promo-input">
                                    <input
                                        type="text"
                                        placeholder="Mã giảm giá"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        disabled={!!state.appliedPromoCode || isLoading}
                                    />
                                    {!state.appliedPromoCode ? (
                                        <button
                                            onClick={handlePromoSubmit}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 'Đang xác nhận...' : 'Xác nhận'}
                                            {isLoading && <span className="button-spinner"></span>}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleClearPromo}
                                            disabled={isLoading}
                                        >
                                            Xóa mã
                                        </button>
                                    )}
                                </div>
                                {couponError && <p className="error-message">{couponError}</p>}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CartPage;