import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import axios from 'axios';
import './AdminCouponsPage.css';
import { useAppContext } from '../../components/AppContext/AppContext.tsx';

interface Coupon {
    _id: string;
    code: string;
    discount: number;
    discountType: 'fixed' | 'percentage';
    expiresAt?: string;
    maxUses?: number;
    usedCount: number;
    status: 'active' | 'inactive';
    createdAt: string;
}

interface Pagination {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasMore: boolean;
}

const AdminCouponsPage: React.FC = () => {
    const { state } = useAppContext();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasMore: false,
    });
    const [loading, setLoading] = useState(true);
    const [searchTerms, setSearchTerms] = useState({
        code: '',
        discountType: '',
        status: '',
        expiresFrom: '',
        expiresTo: '',
    });
    const [editCouponId, setEditCouponId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<Coupon>>({});
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        discount: 0,
        discountType: 'fixed' as 'fixed' | 'percentage',
        expiresAt: '',
        maxUses: 0,
        status: 'active' as 'active' | 'inactive',
    });
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        const fetchCoupons = async () => {
            if (!state.token || state.role !== 'admin') {
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/coupons`, {
                    headers: { Authorization: `Bearer ${state.token}` },
                    params: {
                        page: pagination.currentPage,
                        limit: pagination.itemsPerPage,
                        code: searchTerms.code,
                        discountType: searchTerms.discountType,
                        status: searchTerms.status,
                        expiresFrom: searchTerms.expiresFrom,
                        expiresTo: searchTerms.expiresTo,
                    },
                });

                setCoupons(response.data.data.coupons);
                setPagination(response.data.data.pagination);
            } catch (err) {
                console.error('Error fetching coupons:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCoupons();
    }, [state.token, state.role, pagination.currentPage, searchTerms]);

    const handleCreateCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCoupon.code || !newCoupon.discount || !newCoupon.discountType) {
            return;
        }

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/coupons`,
                newCoupon,
                { headers: { Authorization: `Bearer ${state.token}` } }
            );
            setCoupons([...coupons, response.data.data]);
            setNewCoupon({
                code: '',
                discount: 0,
                discountType: 'fixed',
                expiresAt: '',
                maxUses: 0,
                status: 'active',
            });
            setShowCreateForm(false);
            alert('Mã giảm giá đã được tạo!');
        } catch (err) {
            console.error('Error creating coupon:', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) {
            try {
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/coupons/${id}`, {
                    headers: { Authorization: `Bearer ${state.token}` },
                });
                setCoupons(coupons.filter((coupon) => coupon._id !== id));
                alert('Mã giảm giá đã được xóa!');
            } catch (err) {
                console.error('Error deleting coupon:', err);
            }
        }
    };

    const handleEdit = (coupon: Coupon) => {
        setEditCouponId(coupon._id);
        setEditData({ ...coupon });
    };

    const handleEditChange = (field: string, value: string | number) => {
        setEditData((prev) => ({
            ...prev,
            [field]: value === '' && (field === 'maxUses' || field === 'discount') ? 0 : value,
        }));
    };

    const handleSave = async (id: string) => {
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/api/coupons/${id}`,
                editData,
                { headers: { Authorization: `Bearer ${state.token}` } }
            );
            const updatedCoupons = coupons.map((coupon) =>
                coupon._id === id ? response.data.data : coupon
            );
            setCoupons(updatedCoupons);
            setEditCouponId(null);
            alert('Mã giảm giá đã được cập nhật!');
        } catch (error) {
            console.error('Error updating coupon:', error);
            alert('Lỗi khi cập nhật mã giảm giá!');
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

    if (loading) {
        return (
            <AdminLayout activePage="coupons">
                <div className="admin-coupons-page">Đang tải...</div>
            </AdminLayout>
        );
    }


    return (
        <AdminLayout activePage="coupons">
            <div className="admin-coupons-page">
                <h2>Coupons Management</h2>

                {!showCreateForm && (
                    <div className="create-btn-container">
                        <button onClick={() => setShowCreateForm(true)} className="create-btn">
                            Tạo mã giảm giá mới
                        </button>
                    </div>
                )}

                {showCreateForm && (
                    <form onSubmit={handleCreateCoupon} className="coupon-form">
                        <h3>Tạo mã giảm giá mới</h3>
                        <div className="form-group">
                            <label>Mã</label>
                            <input
                                type="text"
                                value={newCoupon.code}
                                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Giảm giá</label>
                            <input
                                type="number"
                                value={newCoupon.discount}
                                onChange={(e) => setNewCoupon({ ...newCoupon, discount: parseFloat(e.target.value) || 0 })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Loại giảm giá</label>
                            <select
                                value={newCoupon.discountType}
                                onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value as 'fixed' | 'percentage' })}
                                required
                            >
                                <option value="fixed">Số tiền cố định</option>
                                <option value="percentage">Phần trăm</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Ngày hết hạn</label>
                            <input
                                type="date"
                                value={newCoupon.expiresAt}
                                onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Số lần sử dụng tối đa</label>
                            <input
                                type="number"
                                value={newCoupon.maxUses || ''}
                                onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Trạng thái</label>
                            <select
                                value={newCoupon.status}
                                onChange={(e) => setNewCoupon({ ...newCoupon, status: e.target.value as 'active' | 'inactive' })}
                                required
                            >
                                <option value="active">Kích hoạt</option>
                                <option value="inactive">Không kích hoạt</option>
                            </select>
                        </div>
                        <div className="form-buttons">
                            <button type="submit" className="save-btn">Tạo mã</button>
                            <button type="button" onClick={() => setShowCreateForm(false)} className="cancel-btn">
                                Hủy
                            </button>
                        </div>
                    </form>
                )}

                <div className="search-form">
                    <div className="search-group">
                        <input
                            type="text"
                            value={searchTerms.code}
                            onChange={(e) => handleSearchChange('code', e.target.value)}
                            className="search-input"
                            placeholder="Tìm mã..."
                        />
                    </div>
                    <div className="search-group">
                        <select
                            value={searchTerms.discountType}
                            onChange={(e) => handleSearchChange('discountType', e.target.value)}
                            className="search-input"
                        >
                            <option value="">Tất cả loại</option>
                            <option value="fixed">Số tiền cố định</option>
                            <option value="percentage">Phần trăm</option>
                        </select>
                    </div>
                    <div className="search-group">
                        <input
                            type="date"
                            value={searchTerms.expiresFrom}
                            onChange={(e) => handleSearchChange('expiresFrom', e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="search-group">
                        <input
                            type="date"
                            value={searchTerms.expiresTo}
                            onChange={(e) => handleSearchChange('expiresTo', e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="search-group">
                        <select
                            value={searchTerms.status}
                            onChange={(e) => handleSearchChange('status', e.target.value)}
                            className="search-input"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="active">Kích hoạt</option>
                            <option value="inactive">Không kích hoạt</option>
                        </select>
                    </div>
                </div>

                {coupons.length == 0 ?
                    <p className="no-coupons">Không có mã giảm giá nào.</p>
                    : (
                    <>
                        <table className="coupons-table">
                            <thead>
                            <tr>
                                <th>Code</th>
                                <th>Discount</th>
                                <th>Type</th>
                                <th>Expires At</th>
                                <th>Max Uses</th>
                                <th>Used Count</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {coupons.map((coupon) => (
                                <tr key={coupon._id}>
                                    <td>
                                        {editCouponId === coupon._id ? (
                                            <input
                                                type="text"
                                                value={editData.code || ''}
                                                onChange={(e) => handleEditChange('code', e.target.value)}
                                            />
                                        ) : (
                                            coupon.code
                                        )}
                                    </td>
                                    <td>
                                        {editCouponId === coupon._id ? (
                                            <input
                                                type="number"
                                                value={editData.discount || 0}
                                                onChange={(e) => handleEditChange('discount', parseFloat(e.target.value) || 0)}
                                            />
                                        ) : (
                                            coupon.discount
                                        )}
                                    </td>
                                    <td>
                                        {editCouponId === coupon._id ? (
                                            <select
                                                value={editData.discountType || ''}
                                                onChange={(e) => handleEditChange('discountType', e.target.value as 'fixed' | 'percentage')}
                                            >
                                                <option value="fixed">Số tiền cố định</option>
                                                <option value="percentage">Phần trăm</option>
                                            </select>
                                        ) : (
                                            coupon.discountType
                                        )}
                                    </td>
                                    <td>
                                        {editCouponId === coupon._id ? (
                                            <input
                                                type="date"
                                                value={editData.expiresAt || ''}
                                                onChange={(e) => handleEditChange('expiresAt', e.target.value)}
                                            />
                                        ) : (
                                            coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'N/A'
                                        )}
                                    </td>
                                    <td>
                                        {editCouponId === coupon._id ? (
                                            <input
                                                type="number"
                                                value={editData.maxUses || 0}
                                                onChange={(e) => handleEditChange('maxUses', parseInt(e.target.value) || 0)}
                                            />
                                        ) : (
                                            coupon.maxUses || 'Unlimited'
                                        )}
                                    </td>
                                    <td>{coupon.usedCount}</td>
                                    <td>
                                        {editCouponId === coupon._id ? (
                                            <select
                                                value={editData.status || ''}
                                                onChange={(e) => handleEditChange('status', e.target.value as 'active' | 'inactive')}
                                            >
                                                <option value="active">Kích hoạt</option>
                                                <option value="inactive">Không kích hoạt</option>
                                            </select>
                                        ) : (
                                            coupon.status
                                        )}
                                    </td>
                                    <td>
                                        {editCouponId === coupon._id ? (
                                            <button onClick={() => handleSave(coupon._id)} className="save-btn">
                                                Save
                                            </button>
                                        ) : (
                                            <button onClick={() => handleEdit(coupon)} className="update-btn">
                                                Update
                                            </button>
                                        )}
                                        <button className="delete-btn" onClick={() => handleDelete(coupon._id)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
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

export default AdminCouponsPage;