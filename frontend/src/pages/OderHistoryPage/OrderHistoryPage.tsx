import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './OrderHistoryPage.css';

interface OrderItem {
    foodItemId: {
        _id: string;
        title: string;
        price: number;
    };
    quantity: number;
}

interface Order {
    _id: string;
    createdAt: string;
    items: OrderItem[];
    totalAmount: number;
    shippingFee: number;
    status: string;
    name: string;
    address: string;
    phone?: string;
    email?: string;
}

const OrderHistoryPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrderHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('Please log in to view order history.');
                    navigate('/login');
                    return;
                }

                const response = await axios.get('http://localhost:4999/api/orders/history', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const fetchedOrders: Order[] = response.data.orders;

                console.log("value " + JSON.stringify(response.data, null, 2));

                setOrders(fetchedOrders);
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    setError(err.response?.data?.message || 'Failed to fetch order history.');
                } else {
                    setError('An unexpected error occurred.');
                }
                console.error('Error fetching order history:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderHistory();
    }, [navigate]);

    const handleBackToHome = () => {
        navigate('/');
    };

    if (loading) {
        return <div className="order-history-page">Loading...</div>;
    }

    if (error) {
        return (
            <div className="order-history-page">
                <div className="order-history-container">
                    <h2>Lịch sử đặt hàng</h2>
                    <p className="error">{error}</p>
                    <button className="back-btn" onClick={handleBackToHome}>
                        Quay lại trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="order-history-page">
            <div className="order-history-container">
                <div className="order-history-header">
                    <h2>Lịch sử đặt hàng</h2>
                    <button className="back-btn" onClick={handleBackToHome}>
                        Quay lại trang chủ
                    </button>
                </div>
                {orders.length === 0 ? (
                    <p className="no-orders">Bạn chưa có đơn hàng nào.</p>
                ) : (
                    <div className="order-list">
                        {orders.map((order) => (
                            <div key={order._id} className="order-item">
                                <div className="order-header">
                                    <h3>Đơn hàng #{order._id}</h3>
                                    <span
                                        className={`status ${
                                            order.status === 'pending' ? 'processing' : 'completed'
                                        }`}
                                    >
                                        {order.status}
                                    </span>
                                    <button
                                        className="toggle-details-btn"
                                        onClick={() =>
                                            setExpandedOrderId(
                                                expandedOrderId === order._id ? null : order._id
                                            )
                                        }
                                    >
                                        {expandedOrderId === order._id ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                                    </button>
                                </div>
                                <p className="order-date">
                                    Ngày đặt: {new Date(order.createdAt).toLocaleString()}
                                </p>
                                {expandedOrderId === order._id && (
                                    <>
                                        <div className="order-details">
                                            <h4>Chi tiết đơn hàng</h4>
                                            <table className="order-table">
                                                <thead>
                                                <tr>
                                                    <th>Sản phẩm</th>
                                                    <th>Số lượng</th>
                                                    <th>Giá</th>
                                                    <th>Tổng</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {order.items.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{item.foodItemId.title}</td>
                                                        <td>{item.quantity}</td>
                                                        <td>${item.foodItemId.price.toFixed(2)}</td>
                                                        <td>
                                                            ${(
                                                            item.foodItemId.price * item.quantity
                                                        ).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                            <div className="order-summary">
                                                <p>Phí giao hàng: ${order.shippingFee.toFixed(2)}</p>
                                                <p>Tổng cộng: ${order.totalAmount.toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <div className="delivery-info">
                                            <h4>Thông tin giao hàng</h4>
                                            <p>Họ tên: {order.name}</p>
                                            {order.email && <p>Email: {order.email}</p>}
                                            <p>Địa chỉ: {order.address}</p>
                                            {order.phone && <p>Số điện thoại: {order.phone}</p>}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistoryPage;