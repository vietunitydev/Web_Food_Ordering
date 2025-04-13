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
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCart = async () => {
            if (state.role !== 'user') {
                alert('Bạn không có quyền truy cập trang này.');
                navigate('/login');
                return;
            }
            try {
                const response = await axios.get('http://localhost:4999/api/carts/my-cart', {
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
            } catch (error) {
                console.error('Lỗi khi lấy giỏ hàng:', error);
                setCouponError('Lỗi khi lấy giỏ hàng.');
            }
        };
        if (state.token && state.role === 'user') fetchCart();
    }, [dispatch, state.token, state.role, navigate]);

    const updateQuantityLocally = (id: string, newQuantity: number) => {
        if (isNaN(newQuantity) || newQuantity < 1) return;
        dispatch({ type: actions.UPDATE_QUANTITY, payload: { id, quantity: newQuantity } });
    };

    const removeFromCartLocally = (id: string) => {
        dispatch({ type: actions.REMOVE_FROM_CART, payload: { id } });
    };

    const updateCartOnServer = async () => {
        try {
            for (const item of state.cart) {
                await axios.put(
                    'http://localhost:4999/api/carts/update',
                    { foodItemId: item.id, quantity: item.quantity },
                    { headers: { Authorization: `Bearer ${state.token}` } }
                );
            }
            alert('Giỏ hàng đã được cập nhật trên server!');
        } catch (error) {
            console.error('Lỗi khi cập nhật giỏ hàng:', error);
            setCouponError('Lỗi khi cập nhật giỏ hàng.');
        }
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

        try {
            const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const response = await axios.post(
                'http://localhost:4999/api/coupons/apply',
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
        }
    };

    const handleClearPromo = () => {
        dispatch({ type: actions.CLEAR_DISCOUNT });
        setCouponError(null);
    };

    const handleCheckout = () => {
        navigate('/checkout');
    };

    const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = 2;
    const total = subtotal + deliveryFee - state.discount;

    if (state.role !== 'user') {
        return <div>Bạn không có quyền truy cập trang này.</div>;
    }

    return (
        <div className="cart-page">
            <h2 className="cart-title">Giỏ hàng</h2>
            {state.cart.length === 0 ? (
                <div className="cart-empty"><p>Giỏ hàng của bạn đang trống.</p></div>
            ) : (
                <>
                    <div className="cart-content">
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
                                <tr key={item.id}>
                                    <td>
                                        <img
                                            src={`http://localhost:4999${item.imageURL}`}
                                            alt={item.name}
                                            className="cart-item-image"
                                        />
                                    </td>
                                    <td>{item.name}</td>
                                    <td>${item.price.toFixed(2)}</td>
                                    <td>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => updateQuantityLocally(item.id, parseInt(e.target.value))}
                                            min="1"
                                            className="quantity-input"
                                        />
                                    </td>
                                    <td>${(item.price * item.quantity).toFixed(2)}</td>
                                    <td>
                                        <button
                                            onClick={() => removeFromCartLocally(item.id)}
                                            className="remove-button"
                                        >
                                            ✕
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <div className="update-cart-container">
                            <button onClick={updateCartOnServer} className="update-cart-button">
                                Lưu giỏ hàng
                            </button>
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
                            <button onClick={handleCheckout} className="checkout-button">
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
                                        disabled={!!state.appliedPromoCode}
                                    />
                                    {!state.appliedPromoCode ? (
                                        <button onClick={handlePromoSubmit}>Xác nhận</button>
                                    ) : (
                                        <button onClick={handleClearPromo}>Xóa mã</button>
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