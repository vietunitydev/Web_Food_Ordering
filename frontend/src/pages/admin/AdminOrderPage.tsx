import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import './AdminOrdersPage.css';
import { OrderItem } from "../../shared/types.ts";
import { useAppContext } from '../../components/AppContext/AppContext.tsx';
import axios from "axios";

interface Pagination {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasMore: boolean;
}

const AdminOrdersPage: React.FC = () => {
    const { state } = useAppContext();
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasMore: false,
    });
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    // const [error, setError] = useState<string | null>(null);
    const [searchTerms, setSearchTerms] = useState({
        id: '',
        createdAtFrom: '',
        createdAtTo: '',
        name: '',
        payment: '',
        status: '',
        paymentMethod: '',
    });

    useEffect(() => {
        const fetchOrderHistory = async () => {
            // if (!state.token || state.role !== 'admin') {
            //     setError('Không có quyền truy cập.');
            //     setLoading(false);
            //     return;
            // }

            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/`, {
                    headers: { Authorization: `Bearer ${state.token}` },
                    params: {
                        page: pagination.currentPage,
                        limit: pagination.itemsPerPage,
                        id: searchTerms.id,
                        name: searchTerms.name,
                        payment: searchTerms.payment,
                        status: searchTerms.status,
                        paymentMethod: searchTerms.paymentMethod,
                        createdAtFrom: searchTerms.createdAtFrom,
                        createdAtTo: searchTerms.createdAtTo,
                    },
                });

                setOrders(response.data.orders);
                setPagination(response.data.pagination);
            } catch (err) {
                console.error('Error fetching order history:', err);
                // setError('Không thể tải lịch sử đơn hàng. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderHistory();
    }, [state.token, state.role, pagination.currentPage, searchTerms]);

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        const updatedOrders = orders.map((order) =>
            order._id === id ? { ...order, status: newStatus as OrderItem['status'] } : order
        );
        setOrders(updatedOrders);

        try {
            await axios.put(
                `${import.meta.env.VITE_API_URL}/api/orders/${id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${state.token}` } }
            );
            // Optionally show a success message
            alert('Trạng thái đơn hàng đã được cập nhật!');
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Lỗi khi cập nhật trạng thái đơn hàng!');
        }
    };

    const handleSearchChange = (field: string, value: string) => {
        setSearchTerms((prev) => ({ ...prev, [field]: value }));
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination((prev) => ({ ...prev, currentPage: newPage }));
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLSelectElement>, id: string, newStatus: string) => {
        if (e.key === 'Enter') {
            handleUpdateStatus(id, newStatus);
        }
    };

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

    // if (error) {
    //     return (
    //         <AdminLayout activePage="orders">
    //             <div className="admin-orders-page">
    //                 <p className="error-message">{error}</p>
    //             </div>
    //         </AdminLayout>
    //     );
    // }

    return (
        <AdminLayout activePage="orders">
            <div className="admin-orders-page">
                <h2>Order Page</h2>

                <div className="search-form">
                    <input
                        type="text"
                        placeholder="Tìm ID"
                        value={searchTerms.id}
                        onChange={(e) => handleSearchChange('id', e.target.value)}
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
                        type="number"
                        placeholder="Tìm tổng"
                        value={searchTerms.payment}
                        onChange={(e) => handleSearchChange('payment', e.target.value)}
                        className="search-input"
                        min="0"
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
                    </select>
                </div>

                {orders.length === 0 ? (
                    <p className="no-orders">Chưa có đơn hàng nào.</p>
                ) : (
                    <>
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
                            {orders.map((order) => (
                                <React.Fragment key={order._id}>
                                    <tr>
                                        <td className="fixed-width">#{order._id}</td>
                                        <td className="fixed-width">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="fixed-width customer">{order.name}</td>
                                        <td className="fixed-width total">${order.payment.toFixed(2)}</td>
                                        <td className="fixed-width">{order.paymentMethod}</td>
                                        <td>
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                                                onKeyPress={(e) => handleKeyPress(e, order._id, e.currentTarget.value)}
                                            >
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

                        <div className="pagination-controls">
                            <button
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1}
                            >
                                Previous
                            </button>
                            <span>
                                Page {pagination.currentPage} of {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={!pagination.hasMore}
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminOrdersPage;