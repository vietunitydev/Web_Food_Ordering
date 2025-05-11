import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import axios from 'axios';
import './AdminListFood.css';
import { useAppContext } from '../../components/AppContext/AppContext.tsx';
import { toast } from "react-toastify";

interface Item {
    _id: string;
    title: string;
    description: string;
    imageURL: string;
    price: number;
    type: string;
}

interface Pagination {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasMore: boolean;
}

const ListItemsPage: React.FC = () => {
    const { state } = useAppContext();
    const [items, setItems] = useState<Item[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasMore: false,
    });
    const [searchTerms, setSearchTerms] = useState({
        id: '',
        title: '',
        description: '',
        type: '',
        priceFrom: '',
        priceTo: '',
    });
    const [editItemId, setEditItemId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<Item>>({});
    const [newImage, setNewImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false); // Thêm trạng thái loading

    useEffect(() => {
        const fetchItems = async () => {
            if (state.role !== 'admin') return;
            setIsLoading(true);
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/foodItems/get_food_admin`, {
                    headers: { Authorization: `Bearer ${state.token}` },
                    params: {
                        page: pagination.currentPage,
                        limit: pagination.itemsPerPage,
                        id: searchTerms.id,
                        title: searchTerms.title,
                        description: searchTerms.description,
                        type: searchTerms.type,
                        priceFrom: searchTerms.priceFrom,
                        priceTo: searchTerms.priceTo,
                    },
                });
                setItems(response.data.items);
                setPagination(response.data.pagination);
            } catch (error) {
                console.error('Lỗi khi lấy danh sách sản phẩm:', error);
                toast.error('Lỗi khi lấy danh sách sản phẩm!');
            } finally {
                setIsLoading(false);
            }
        };
        if (state.token && state.role === 'admin') fetchItems();
    }, [state.token, state.role, pagination.currentPage, searchTerms]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            setIsLoading(true);
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/api/foodItems/${id}`, {
                    headers: { Authorization: `Bearer ${state.token}` },
                });
                setItems((prevItems) => prevItems.filter((item) => item._id !== id));
                toast.success('Sản phẩm đã được xóa!');
            } catch (error) {
                console.error('Lỗi khi xóa sản phẩm:', error);
                toast.error('Lỗi khi xóa sản phẩm!');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleEdit = (item: Item) => {
        setEditItemId(item._id);
        setEditData({ ...item });
        setNewImage(null);
        setImagePreview(null);
    };

    const handleCancel = () => {
        setEditItemId(null);
        setEditData({});
        setNewImage(null);
        setImagePreview(null);
    };

    const handleEditChange = (field: string, value: string | number) => {
        if (field === 'price') {
            const numericValue = parseFloat(value as string);
            if (numericValue < 0) return;
            setEditData((prev) => ({ ...prev, [field]: numericValue }));
        } else {
            setEditData((prev) => ({ ...prev, [field]: value }));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setNewImage(file);
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    const handleSave = async (id: string) => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', editData.title || '');
            formData.append('description', editData.description || '');
            formData.append('type', editData.type || '');
            formData.append('price', editData.price?.toString() || '0');
            if (newImage) {
                formData.append('image', newImage);
            }

            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/foodItems/${id}`,
                formData,
                { headers: { Authorization: `Bearer ${state.token}` } }
            );
            setItems((prevItems) =>
                prevItems.map((item) => (item._id === id ? response.data : item))
            );
            setEditItemId(null);
            setNewImage(null);
            setImagePreview(null);
            toast.success('Sản phẩm đã được cập nhật!');
        } catch (error) {
            console.error('Lỗi khi cập nhật sản phẩm:', error);
            toast.error('Lỗi khi cập nhật sản phẩm!');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchChange = (field: string, value: string) => {
        if (field === 'priceFrom' || field === 'priceTo') {
            const numericValue = parseFloat(value);
            if (numericValue < 0) return;
            setSearchTerms((prev) => ({ ...prev, [field]: isNaN(numericValue) ? '' : value }));
        } else {
            setSearchTerms((prev) => ({ ...prev, [field]: value }));
        }
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination((prev) => ({ ...prev, currentPage: newPage }));
        }
    };

    return (
        <AdminLayout activePage="list-items">
            <div className="list-items-page">
                <h2>Foods</h2>

                {/* Search Form */}
                <div className="search-form">
                    <input
                        type="text"
                        placeholder="Tìm tên"
                        value={searchTerms.title}
                        onChange={(e) => handleSearchChange('title', e.target.value)}
                        className="search-input"
                        disabled={isLoading}
                    />
                    <input
                        type="text"
                        placeholder="Tìm mô tả"
                        value={searchTerms.description}
                        onChange={(e) => handleSearchChange('description', e.target.value)}
                        className="search-input"
                        disabled={isLoading}
                    />
                    <input
                        type="number"
                        placeholder="Giá từ"
                        value={searchTerms.priceFrom}
                        onChange={(e) => handleSearchChange('priceFrom', e.target.value)}
                        className="search-input"
                        min="0"
                        disabled={isLoading}
                    />
                    <input
                        type="number"
                        placeholder="Giá đến"
                        value={searchTerms.priceTo}
                        onChange={(e) => handleSearchChange('priceTo', e.target.value)}
                        className="search-input"
                        min="0"
                        disabled={isLoading}
                    />
                    <select
                        value={searchTerms.type}
                        onChange={(e) => handleSearchChange('type', e.target.value)}
                        className="search-input"
                        disabled={isLoading}
                    >
                        <option value="">Tất cả danh mục</option>
                        <option value="main">Món chính</option>
                        <option value="dessert">Tráng miệng</option>
                        <option value="fast_food">Đồ ăn nhanh</option>
                        <option value="drinks">Đồ uống</option>
                        <option value="other">Khác</option>
                    </select>
                </div>

                {items.length === 0 ? (
                    <p className="no-items">Chưa có sản phẩm nào.</p>
                ) : (
                    <>
                        <table className="items-table">
                            <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Foods</th>
                                <th>Price</th>
                                <th>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {items.map((item) => (
                                <tr key={item._id}>
                                    <td>
                                        {editItemId === item._id ? (
                                            <div className="image-upload">
                                                <input
                                                    type="file"
                                                    id={`image-${item._id}`}
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    style={{ display: 'none' }}
                                                    disabled={isLoading}
                                                />
                                                <label htmlFor={`image-${item._id}`}>
                                                    <img
                                                        src={imagePreview || item.imageURL || 'placeholder-image-url'}
                                                        alt={item.title}
                                                        className="item-image"
                                                    />
                                                </label>
                                            </div>
                                        ) : item.imageURL ? (
                                            <img
                                                src={`${item.imageURL}`}
                                                alt={item.title}
                                                className="item-image"
                                            />
                                        ) : (
                                            'Không có ảnh'
                                        )}
                                    </td>
                                    <td className="fixed-width">
                                        {editItemId === item._id ? (
                                            <input
                                                type="text"
                                                value={editData.title || ''}
                                                onChange={(e) =>
                                                    handleEditChange('title', e.target.value)
                                                }
                                                disabled={isLoading}
                                            />
                                        ) : (
                                            <span className="text-ellipsis">{item.title}</span>
                                        )}
                                    </td>
                                    <td className="fixed-width">
                                        {editItemId === item._id ? (
                                            <input
                                                type="text"
                                                value={editData.description || ''}
                                                onChange={(e) =>
                                                    handleEditChange('description', e.target.value)
                                                }
                                                disabled={isLoading}
                                            />
                                        ) : (
                                            <span className="text-ellipsis">{item.description}</span>
                                        )}
                                    </td>
                                    <td className="fixed-width">
                                        {editItemId === item._id ? (
                                            <select
                                                value={editData.type || ''}
                                                onChange={(e) =>
                                                    handleEditChange('type', e.target.value)
                                                }
                                                disabled={isLoading}
                                            >
                                                <option value="main">Món chính</option>
                                                <option value="dessert">Tráng miệng</option>
                                                <option value="fast_food">Đồ ăn nhanh</option>
                                                <option value="drinks">Đồ uống</option>
                                                <option value="other">Khác</option>
                                            </select>
                                        ) : (
                                            <span className="text-ellipsis">{item.type}</span>
                                        )}
                                    </td>
                                    <td className="fixed-width">
                                        {editItemId === item._id ? (
                                            <input
                                                type="number"
                                                value={editData.price || 0}
                                                onChange={(e) =>
                                                    handleEditChange('price', e.target.value)
                                                }
                                                min="0"
                                                disabled={isLoading}
                                            />
                                        ) : (
                                            `$${item.price.toFixed(2)}`
                                        )}
                                    </td>
                                    <td>
                                        {editItemId === item._id ? (
                                            <div className="actions">
                                                <button
                                                    onClick={() => handleSave(item._id)}
                                                    className="save-btnn"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? 'Đang xử lý...' : 'Lưu'}
                                                </button>
                                                <button
                                                    onClick={handleCancel}
                                                    className="cancel-btnn"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? 'Đang xử lý...' : 'Hủy'}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="actions">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="update-btn"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? 'Đang xử lý...' : 'Sửa'}
                                                </button>
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => handleDelete(item._id)}
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? 'Đang xử lý...' : 'Xóa'}
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        {pagination.totalItems > 10 ? (
                            <div className="pagination-controls">
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    disabled={pagination.currentPage === 1}
                                >
                                    Trang trước
                                </button>
                                <span>
                                Page {pagination.currentPage} of {pagination.totalPages}
                            </span>
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={!pagination.hasMore}
                                >
                                    Trang sau
                                </button>
                            </div>
                        ) : (
                            <p></p>
                        )
                        }
                    </>
                )}
            </div>
        </AdminLayout>
    );
};

export default ListItemsPage;