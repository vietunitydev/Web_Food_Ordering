import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext, actions } from '../../components/AppContext/AppContext.tsx';
import axios from 'axios';
import './CartPage.css';
import { ContextCartItem } from '../../shared/types.ts';

const CartPage: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [promoCode, setPromoCode] = useState('');
    const [couponError, setCouponError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
    const navigate = useNavigate();
    const [serverCart, setServerCart] = useState<ContextCartItem[]>([]);
    const [isCartModified, setIsCartModified] = useState(false);

    useEffect(() => {
        const fetchCart = async () => {
            if (state.role !== 'user') {
                alert('Bạn không có quyền truy cập trang này.');
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
                    price: item.foodItemId.price,
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

    const updateQuantityLocally = async (id: string, newQuantity: number | string) => {
        const validatedQuantity = typeof newQuantity === 'string'
            ? validateQuantity(newQuantity)
            : newQuantity;

        if (validatedQuantity <= 0) {
            const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?");
            if (confirmDelete) {
                await removeFromCartLocally(id);
            }
        } else {
            dispatch({ type: actions.UPDATE_QUANTITY, payload: { id, quantity: validatedQuantity } });
        }
    };

    const removeFromCartLocally = async (id: string) => {
        setUpdatingItemId(id);
        setIsLoading(true);

        try {
            dispatch({ type: actions.REMOVE_FROM_CART, payload: { id } });
            await updateCartOnServer();
        } finally {
            setUpdatingItemId(null);
            setIsLoading(false);
        }
    };

    const updateCartOnServer = async () => {
        setIsLoading(true);
        try {
            for (const item of state.cart) {
                await axios.put(
                    `${import.meta.env.VITE_API_URL}/api/carts/update`,
                    { foodItemId: item.id, quantity: item.quantity },
                    { headers: { Authorization: `Bearer ${state.token}` } }
                );
            }
            setServerCart(JSON.parse(JSON.stringify(state.cart)));
            setIsCartModified(false);
        } catch (error) {
            console.error('Lỗi khi cập nhật giỏ hàng:', error);
            setCouponError('Lỗi khi cập nhật giỏ hàng.');
        } finally {
            setIsLoading(false);
        }
    };

    // Lưu trữ giá trị đang nhập cho mỗi input
    const [inputValues, setInputValues] = useState<Record<string, string>>({});

    const handleQuantityInputChange = (id: string, value: string) => {
        if (/^[0-9]*$/.test(value)) {
            setInputValues({...inputValues, [id]: value});

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

        setUpdatingItemId(id);

        // Cập nhật giá trị đã xác thực và gọi API
        dispatch({ type: actions.UPDATE_QUANTITY, payload: { id, quantity: validatedQuantity } });

        // Đồng bộ lại input value với state
        setInputValues({...inputValues, [id]: validatedQuantity.toString()});

        // updateCartOnServer().then(() => setUpdatingItemId(null));
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
            const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/coupons/apply`,
                { code: promoCode, orderTotal: subtotal },
                { headers: { Authorization: `Bearer ${state.token}` } }
            );

            if (response.data.success) {
                dispatch({
                    type: actions.SET_DISCOUNT,
                    payload: { discount: response.data.data.discountAmount, promoCode },
                });
                setCouponError(null);
                alert(`Mã giảm giá "${promoCode}" đã được áp dụng! Giảm: $${response.data.data.discountAmount.toFixed(2)}`);
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
                    alert('Có lỗi xảy ra khi lưu giỏ hàng. Vui lòng thử lại.');
                }
            } else {
                navigate('/checkout');
            }
        } else {
            navigate('/checkout');
        }
    };

    const handleUpdateCart = () => {
        setIsLoading(true);
        updateCartOnServer().then(() => {
            alert('Giỏ hàng đã được cập nhật!');
        });
    };

    const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = 2;
    const total = subtotal + deliveryFee - state.discount;

    if (state.role !== 'user') {
        return <div>Bạn không có quyền truy cập trang này.</div>;
    }

    // Thành phần hiển thị loading
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
                                <th>Món</th>
                                <th>Tên</th>
                                <th>Giá</th>
                                <th>Số lượng</th>
                                <th>Tổng</th>
                                <th>Xoá</th>
                            </tr>
                            </thead>
                            <tbody>
                            {state.cart.map((item: ContextCartItem) => (
                                <tr key={item.id} className={updatingItemId === item.id ? 'updating-row' : ''}>
                                    <td>
                                        <img
                                            src={`${item.imageURL}`}
                                            alt={item.name}
                                            className="cart-item-image"
                                        />
                                    </td>
                                    <td>{item.name}</td>
                                    <td>${item.price.toFixed(2)}</td>
                                    <td>
                                        <div className="quantity-control">
                                            <input
                                                type="text"
                                                pattern="[0-9]*"
                                                value={inputValues[item.id] !== undefined ? inputValues[item.id] : item.quantity}
                                                onChange={(e) => handleQuantityInputChange(item.id, e.target.value)}
                                                onBlur={(e) => handleQuantityBlur(item.id, e.target.value)}
                                                className="quantity-input"
                                                min="1"
                                            />
                                            <div className="quantity-buttons">
                                                <button
                                                    onClick={() => {
                                                        setUpdatingItemId(item.id);
                                                        updateQuantityLocally(item.id, item.quantity + 1);
                                                    }}
                                                    className="quantity-button quantity-increase"
                                                    disabled={isLoading}
                                                >
                                                    +
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setUpdatingItemId(item.id);
                                                        updateQuantityLocally(item.id, item.quantity - 1);
                                                    }}
                                                    disabled={item.quantity <= 1 || isLoading}
                                                    className="quantity-button quantity-decrease"
                                                >
                                                    −
                                                </button>
                                            </div>
                                            {updatingItemId === item.id && (
                                                <div className="item-loading-indicator">
                                                    <div className="item-spinner"></div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td>${(item.price * item.quantity).toFixed(2)}</td>
                                    <td>
                                        <button
                                            onClick={() => removeFromCartLocally(item.id)}
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
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Phí giao hàng</span>
                                <span>${deliveryFee.toFixed(2)}</span>
                            </div>
                            {state.discount > 0 && (
                                <div className="summary-row">
                                    <span>Giảm giá ({state.appliedPromoCode})</span>
                                    <span>-${state.discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="summary-row total">
                                <span>Tổng</span>
                                <span>${total.toFixed(2)}</span>
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