import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import './AdminOrdersPage.css';
import { OrderItem } from "../../shared/types.ts";
import { useAppContext } from '../../components/AppContext/AppContext.tsx';
import axios from "axios";

const AdminOrdersPage: React.FC = () => {
    const { state } = useAppContext();
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerms, setSearchTerms] = useState({
        _id: '',
        createdAtFrom: '', // From date
        createdAtTo: '',   // To date
        name: '',
        payment: '',
        status: '',
        paymentMethod: '', // Will hold the selected payment method
    });

    useEffect(() => {
        const fetchOrderHistory = async () => {
            if (!state.token || state.role !== 'admin') {
                setError('Không có quyền truy cập.');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get('http://localhost:4999/api/orders/all', {
                    headers: { Authorization: `Bearer ${state.token}` },
                });

                const formattedOrders: OrderItem[] = response.data.orders;
                setOrders(formattedOrders);
            } catch (err) {
                console.error('Error fetching order history:', err);
                setError('Không thể tải lịch sử đơn hàng. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderHistory();
    }, [state.token, state.role]);

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        const updatedOrders = orders.map((order) =>
            order._id === id ? { ...order, status: newStatus as OrderItem['status'] } : order
        );
        setOrders(updatedOrders);

        try {
            await axios.put(
                `http://localhost:4999/api/orders/${id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${state.token}` } }
            );
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    const handleSearchChange = (field: string, value: string) => {
        setSearchTerms((prev) => ({ ...prev, [field]: value }));
    };

    const filteredOrders = orders.filter((order) => {
        const createdAtDate = new Date(order.createdAt);
        const fromDate = searchTerms.createdAtFrom ? new Date(searchTerms.createdAtFrom) : null;
        const toDate = searchTerms.createdAtTo ? new Date(searchTerms.createdAtTo) : null;

        return (
            order._id.toLowerCase().includes(searchTerms._id.toLowerCase()) &&
            (!fromDate || !isNaN(fromDate.getTime()) && createdAtDate >= fromDate) &&
            (!toDate || !isNaN(toDate.getTime()) && createdAtDate <= toDate) &&
            order.name.toLowerCase().includes(searchTerms.name.toLowerCase()) &&
            order.payment.toString().includes(searchTerms.payment) &&
            (searchTerms.status === '' || order.status.toLowerCase().includes(searchTerms.status.toLowerCase())) &&
            (searchTerms.paymentMethod === '' || order.paymentMethod.toLowerCase().includes(searchTerms.paymentMethod.toLowerCase()))
        );
    });

    const toggleOrderDetails = (id: string) => {
        setExpandedOrderId(expandedOrderId === id ? null : id);
    };

    if (loading) {
        return (
            <AdminLayout activePage="orders">
                <div className="admin-orders-page">Đang tải...</div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout activePage="orders">
                <div className="admin-orders-page">
                    <p className="error-message">{error}</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout activePage="orders">
            <div className="admin-orders-page">
                <h2>Order Page</h2>
                {orders.length === 0 ? (
                    <p className="no-orders">Chưa có đơn hàng nào.</p>
                ) : (
                    <>
                        <div className="search-form">
                            <input
                                type="text"
                                placeholder="Tìm ID"
                                value={searchTerms._id}
                                onChange={(e) => handleSearchChange('_id', e.target.value)}
                                className="search-input"
                            />
                            <input
                                type="text"
                                placeholder="Tìm tên"
                                value={searchTerms.name}
                                onChange={(e) => handleSearchChange('name', e.target.value)}
                                className="search-input"
                            />
                            <input
                                type="text"
                                placeholder="Tìm tổng"
                                value={searchTerms.payment}
                                onChange={(e) => handleSearchChange('payment', e.target.value)}
                                className="search-input"
                            />
                            <input
                                type="date"
                                value={searchTerms.createdAtFrom}
                                onChange={(e) => handleSearchChange('createdAtFrom', e.target.value)}
                                className="search-input"
                            />
                            <input
                                type="date"
                                value={searchTerms.createdAtTo}
                                onChange={(e) => handleSearchChange('createdAtTo', e.target.value)}
                                className="search-input"
                            />
                            <select
                                value={searchTerms.status}
                                onChange={(e) => handleSearchChange('status', e.target.value)}
                                className="search-input"
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="pending">Đang chờ</option>
                                <option value="processing">Đang xử lý</option>
                                <option value="shipped">Đang giao</option>
                                <option value="delivered">Hoàn thành</option>
                                <option value="cancelled">Đã hủy</option>
                            </select>
                            <select
                                value={searchTerms.paymentMethod}
                                onChange={(e) => handleSearchChange('paymentMethod', e.target.value)}
                                className="search-input"
                            >
                                <option value="">Tất cả phương thức</option>
                                <option value="Cash">Tiền mặt</option>
                                <option value="Stripe">Stripe</option>
                                {/* Add more payment methods as needed */}
                            </select>
                        </div>

                        <table className="orders-table">
                            <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Total</th>
                                <th>Method</th>
                                <th>Action</th>
                                <th>Details</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredOrders.map((order) => (
                                <React.Fragment key={order._id}>
                                    <tr>
                                        <td className="fixed-width">#{order._id}</td>
                                        <td className="fixed-width">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="fixed-width customer">{order.name}</td>
                                        <td className="fixed-width total">${order.payment.toFixed(2)}</td>
                                        <td className="fixed-width">{order.paymentMethod}</td>
                                        <td>
                                            <select value={order.status} onChange={(e) => handleUpdateStatus(order._id, e.target.value)}>
                                                <option value="pending">Đang chờ</option>
                                                <option value="processing">Đang xử lý</option>
                                                <option value="shipped">Đang giao</option>
                                                <option value="delivered">Hoàn thành</option>
                                                <option value="cancelled">Đã hủy</option>
                                            </select>
                                        </td>
                                        <td>
                                            <button onClick={() => toggleOrderDetails(order._id)} className="details-btn">
                                                {expandedOrderId === order._id ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedOrderId === order._id && (
                                        <tr className="order-details-row">
                                            <td colSpan={7}>
                                                <div className="order-details">
                                                    <h4>Chi tiết đơn hàng</h4>
                                                    <table className="order-items-table">
                                                        <thead>
                                                        <tr>
                                                            <th>Tên sản phẩm</th>
                                                            <th>Giá</th>
                                                            <th>Số lượng</th>
                                                            <th>Tổng</th>
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {order.items.map((item) => (
                                                            <tr key={item.foodItemId._id}>
                                                                <td>{item.foodItemId.title || 'Unknown'}</td>
                                                                <td>${item.foodItemId.price?.toFixed(2) || '0.00'}</td>
                                                                <td>{item.quantity}</td>
                                                                <td>${((item.foodItemId.price || 0) * item.quantity).toFixed(2)}</td>
                                                            </tr>
                                                        ))}
                                                        </tbody>
                                                    </table>
                                                    <div className="delivery-info">
                                                        <h4>Thông tin giao hàng</h4>
                                                        <p>Email: {order.email || 'N/A'}</p>
                                                        <p>Địa chỉ: {order.address}</p>
                                                        <p>Số điện thoại: {order.phone || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                            </tbody>
                        </table>
                    </>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminOrdersPage;