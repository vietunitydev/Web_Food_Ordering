import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import axios from 'axios';
import './AdminListFood.css';
import { useAppContext } from '../../components/AppContext/AppContext.tsx';

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

    useEffect(() => {
        const fetchItems = async () => {
            if (state.role !== 'admin') return;
            try {
                const response = await axios.get('http://localhost:4999/api/foodItems/get_food_admin', {
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
            }
        };
        if (state.token && state.role === 'admin') fetchItems();
    }, [state.token, state.role, pagination.currentPage, searchTerms]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            try {
                await axios.delete(`http://localhost:4999/api/foodItems/${id}`, {
                    headers: { Authorization: `Bearer ${state.token}` },
                });
                setItems((prevItems) => prevItems.filter((item) => item._id !== id));
                alert('Sản phẩm đã được xóa!');
            } catch (error) {
                console.error('Lỗi khi xóa sản phẩm:', error);
                alert('Lỗi khi xóa sản phẩm!');
            }
        }
    };

    const handleEdit = (item: Item) => {
        setEditItemId(item._id);
        setEditData({ ...item });
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

    const handleSave = async (id: string) => {
        try {
            const response = await axios.put(
                `http://localhost:4999/api/foodItems/${id}`,
                editData,
                { headers: { Authorization: `Bearer ${state.token}` } }
            );
            setItems((prevItems) =>
                prevItems.map((item) => (item._id === id ? response.data : item))
            );
            setEditItemId(null);
            alert('Sản phẩm đã được cập nhật!');
        } catch (error) {
            console.error('Error updating food item:', error);
            alert('Lỗi khi cập nhật sản phẩm!');
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
        // Reset to page 1 when search terms change
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
                <h2>All Food List</h2>

                {/* Search Form */}
                <div className="search-form">
                    <input
                        type="text"
                        placeholder="Tìm tên"
                        value={searchTerms.title}
                        onChange={(e) => handleSearchChange('title', e.target.value)}
                        className="search-input"
                    />
                    <input
                        type="text"
                        placeholder="Tìm mô tả"
                        value={searchTerms.description}
                        onChange={(e) => handleSearchChange('description', e.target.value)}
                        className="search-input"
                    />
                    <input
                        type="number"
                        placeholder="Giá từ"
                        value={searchTerms.priceFrom}
                        onChange={(e) => handleSearchChange('priceFrom', e.target.value)}
                        className="search-input"
                        min="0"
                    />
                    <input
                        type="number"
                        placeholder="Giá đến"
                        value={searchTerms.priceTo}
                        onChange={(e) => handleSearchChange('priceTo', e.target.value)}
                        className="search-input"
                        min="0"
                    />
                    <select
                        value={searchTerms.type}
                        onChange={(e) => handleSearchChange('type', e.target.value)}
                        className="search-input"
                    >
                        <option value="">Tất cả danh mục</option>
                        <option value="main">Món chính</option>
                        <option value="dessert">Tráng miệng</option>
                        <option value="fast-food">Đồ ăn nhanh</option>
                        <option value="drink">Đồ uống</option>
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
                                <th>Category</th>
                                <th>Price</th>
                                <th>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {items.map((item) => (
                                <tr key={item._id}>
                                    <td>
                                        {item.imageURL ? (
                                            <img
                                                src={`http://localhost:4999${item.imageURL}`}
                                                alt={item.title}
                                                className="item-image"
                                            />
                                        ) : (
                                            'No Image'
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
                                            />
                                        ) : (
                                            <span className="text-ellipsis">{item.description}</span>
                                        )}
                                    </td>
                                    <td className="fixed-width">
                                        {editItemId === item._id ? (
                                            <input
                                                type="text"
                                                value={editData.type || ''}
                                                onChange={(e) =>
                                                    handleEditChange('type', e.target.value)
                                                }
                                            />
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
                                                    className="save-btn"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => handleDelete(item._id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="actions">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="update-btn"
                                                >
                                                    Update
                                                </button>
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => handleDelete(item._id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
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

export default ListItemsPage;