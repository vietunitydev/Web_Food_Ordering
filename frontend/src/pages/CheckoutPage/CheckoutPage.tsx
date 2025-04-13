import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './CheckoutPage.css';
import { useAppContext, actions } from '../../components/AppContext/AppContext.tsx';
import { loadStripe } from '@stripe/stripe-js';

// Khởi tạo Stripe với Publishable Key (thay bằng key thực từ Stripe Dashboard)
const stripePromise = loadStripe('pk_test_51RD0ydRgiEpj183BNS1qmXIfvMGeHnDX8at8L6oHYi8spx00cttJZyaVuh17v70Cdg9lfq1h6M14vufdIWNWUKqS000qHhnhM5');

const CheckoutPage: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number }[]>([]);
    const [formData, setFormData] = useState({
        firstName: '',
        email: '',
        address: '',
        phone: '',
    });
    const [isLoading, setIsLoading] = useState(false); // Thêm trạng thái loading
    const [errorMessage, setErrorMessage] = useState<string | null>(null); // Thêm trạng thái lỗi
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchCart = async () => {

            if (state.isLoading) {
                return;
            }

            if (state.role !== 'user') {
                setErrorMessage('Bạn không có quyền truy cập trang này.');
                navigate('/login');
                return;
            }
            setIsLoading(true);
            try {
                const response = await axios.get('http://localhost:4999/api/carts/my-cart', {
                    headers: { Authorization: `Bearer ${state.token}` },
                });

                const cartItems = response.data.list.map((item: any) => ({
                    id: item.foodItemId._id,
                    name: item.foodItemId.title,
                    price: item.foodItemId.price,
                    quantity: item.quantity,
                }));

                setCart(cartItems);

                const userResponse = await axios.get('http://localhost:4999/api/auth/me', {
                    headers: { Authorization: `Bearer ${state.token}` },
                });
                const user = userResponse.data.data;
                setFormData({
                    firstName: user.name || '',
                    email: user.email || '',
                    address: user.address || '',
                    phone: user.phone || '',
                });
            } catch (error) {
                console.error('Error fetching cart or user data:', error);
                setErrorMessage('Không thể tải giỏ hàng hoặc thông tin người dùng.');
            } finally {
                setIsLoading(false);
            }
        };

        const checkPaymentStatus = async () => {
            const params = new URLSearchParams(location.search);
            const sessionId = params.get('session_id');
            if (sessionId) {
                setIsLoading(true);
                try {
                    const response = await axios.get(`http://localhost:4999/api/orders/verify-session/${sessionId}`, {
                        headers: { Authorization: `Bearer ${state.token}` },
                    });
                    if (response.data.success) {
                        dispatch({ type: actions.CLEAR_CART });
                        dispatch({ type: actions.CLEAR_DISCOUNT });
                        alert('Đặt hàng thành công! Bạn có thể xem lịch sử đơn hàng ở trang "Order History".');
                        console.log("success", response.data);
                        navigate('/order-history', { replace: true });
                    } else {
                        setErrorMessage('Thanh toán không thành công. Vui lòng thử lại.');
                        navigate('/checkout', { replace: true });
                    }
                } catch (error: any) {
                    console.error('Error verifying session:', error);
                    setErrorMessage(error.response?.data?.message || 'Lỗi khi xác minh thanh toán.');
                    navigate('/checkout', { replace: true });
                } finally {
                    setIsLoading(false);
                }
            }
        };

        if (state.token && state.role === 'user') {
            fetchCart();
            checkPaymentStatus();
        }
    }, [navigate, state.token, state.role, location.search]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleProceedToPayment = async () => {
        if (!formData.firstName || !formData.email || !formData.address || !formData.phone) {
            setErrorMessage('Vui lòng điền đầy đủ thông tin giao hàng.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;
        const phoneRegex = /^\d{10,11}$/;

        if (!emailRegex.test(formData.email)) {
            setErrorMessage('Email không hợp lệ.');
            return;
        }

        if (!phoneRegex.test(formData.phone)) {
            setErrorMessage('Số điện thoại không hợp lệ. Vui lòng nhập 10-11 số.');
            return;
        }

        setIsLoading(true);
        try {
            const deliveryFee = 2;

            const checkoutData = {
                items: cart,
                discount: state.discount,
                promoCode: state.appliedPromoCode,
                shippingFee: deliveryFee,
                customerDetails: {
                    name: formData.firstName,
                    email: formData.email,
                    address: formData.address,
                    phone: formData.phone,
                },
            };

            console.log('Checkout data:', checkoutData);

            const response = await axios.post('http://localhost:4999/api/orders/create-checkout-session', checkoutData, {
                headers: { Authorization: `Bearer ${state.token}` },
            });

            const { sessionId } = response.data;

            console.log('response data:', response.data);

            const stripe = await stripePromise;
            if (stripe) {
                await stripe.redirectToCheckout({ sessionId });
            } else {
                throw new Error('Lỗi khi tải Stripe.');
            }
        } catch (error: any) {
            console.error('Error initiating checkout:', error);
            setErrorMessage(error.response?.data?.message || 'Lỗi khi khởi tạo thanh toán.');
        } finally {
            setIsLoading(false);
        }
    };

    if (state.role !== 'user') {
        return <div>Bạn không có quyền truy cập trang này.</div>;
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = 2;
    const total = subtotal + deliveryFee - state.discount;

    return (
        <div className="checkout-page">
            {isLoading ? (
                <div className="loading">Đang xử lý...</div>
            ) : errorMessage ? (
                <div className="error-message">{errorMessage}</div>
            ) : (
                <div className="checkout-container">
                    <div className="delivery-info">
                        <h3 className="section-title">Delivery Information</h3>
                        <div className="form-row">
                            <input
                                type="text"
                                name="firstName"
                                placeholder="First Name"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className="form-input"
                                required
                            />
                        </div>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                        />
                        <input
                            type="text"
                            name="address"
                            placeholder="Address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                        />
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="cart-total">
                        <h3 className="section-title">Cart Total</h3>
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Delivery fee</span>
                            <span>${deliveryFee.toFixed(2)}</span>
                        </div>
                        {state.discount > 0 && (
                            <div className="summary-row">
                                <span>Discount ({state.appliedPromoCode})</span>
                                <span>-${state.discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <button
                            onClick={handleProceedToPayment}
                            className="payment-button"
                            disabled={cart.length === 0 || isLoading}
                        >
                            Proceed to Payment
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutPage;