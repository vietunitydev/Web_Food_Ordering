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

const ListItemsPage: React.FC = () => {
    const { state } = useAppContext();
    const [items, setItems] = useState<Item[]>([]);
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
                const response = await axios.get('http://localhost:4999/api/foodItems/all', {
                    headers: { Authorization: `Bearer ${state.token}` }
                });
                setItems(response.data);
            } catch (error) {
                console.error('Lỗi khi lấy danh sách sản phẩm:', error);
            }
        };
        if (state.token && state.role === 'admin') fetchItems();
    }, [state.token, state.role]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            try {
                await axios.delete(`http://localhost:4999/api/foodItems/${id}`, {
                    headers: { Authorization: `Bearer ${state.token}` }
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
        if (field === 'price' || field === 'priceFrom' || field === 'priceTo') {
            const numericValue = parseFloat(value as string);
            if (numericValue < 0) return; // Prevent negative numbers
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
            const updatedItems = items.map((item) =>
                item._id === id ? response.data : item
            );
            setItems(updatedItems);
            setEditItemId(null);
            // alert('Sản phẩm đã được cập nhật!');
        } catch (error) {
            console.error('Error updating food item:', error);
            alert('Lỗi khi cập nhật sản phẩm!');
        }
    };

    const handleSearchChange = (field: string, value: string) => {
        if (field === 'priceFrom' || field === 'priceTo') {
            const numericValue = parseFloat(value);
            if (numericValue < 0) return; // Prevent negative numbers in search
            setSearchTerms((prev) => ({ ...prev, [field]: isNaN(numericValue) ? '' : value }));
        } else {
            setSearchTerms((prev) => ({ ...prev, [field]: value }));
        }
    };

    const filteredItems = items.filter((item) =>
        item._id.toLowerCase().includes(searchTerms.id.toLowerCase()) &&
        item.title.toLowerCase().includes(searchTerms.title.toLowerCase()) &&
        item.description.toLowerCase().includes(searchTerms.description.toLowerCase()) &&
        item.type.toLowerCase().includes(searchTerms.type.toLowerCase()) &&
        (!searchTerms.priceFrom || item.price >= parseFloat(searchTerms.priceFrom)) &&
        (!searchTerms.priceTo || item.price <= parseFloat(searchTerms.priceTo))
    );

    return (
        <AdminLayout activePage="list-items">
            <div className="list-items-page">
                <h2>All Food List</h2>

                {/* New Search Form */}
                <div className="search-form">
                    {/*<input*/}
                    {/*    type="text"*/}
                    {/*    placeholder="Tìm ID"*/}
                    {/*    value={searchTerms.id}*/}
                    {/*    onChange={(e) => handleSearchChange('id', e.target.value)}*/}
                    {/*    className="search-input"*/}
                    {/*/>*/}
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
                        min="0" // Prevent negative numbers in HTML
                    />
                    <input
                        type="number"
                        placeholder="Giá đến"
                        value={searchTerms.priceTo}
                        onChange={(e) => handleSearchChange('priceTo', e.target.value)}
                        className="search-input"
                        min="0" // Prevent negative numbers in HTML
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
                        {filteredItems.map((item) => (
                            <tr key={item._id}>
                                <td>
                                    {item.imageURL ? (
                                        <img src={`http://localhost:4999${item.imageURL}`} alt={item.title} className="item-image" />
                                    ) : (
                                        'No Image'
                                    )}
                                </td>
                                <td className="fixed-width">
                                    {editItemId === item._id ? (
                                        <input
                                            type="text"
                                            value={editData.title || ''}
                                            onChange={(e) => handleEditChange('title', e.target.value)}
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
                                            onChange={(e) => handleEditChange('description', e.target.value)}
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
                                            onChange={(e) => handleEditChange('type', e.target.value)}
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
                                            onChange={(e) => handleEditChange('price', parseFloat(e.target.value))}
                                            min="0" // Prevent negative numbers in HTML
                                        />
                                    ) : (
                                        `$${item.price.toFixed(2)}`
                                    )}
                                </td>
                                <td>
                                    {editItemId === item._id ? (
                                        <div className="actions">
                                            <button onClick={() => handleSave(item._id)} className="save-btn">
                                                Save
                                            </button>
                                            <button className="delete-btn" onClick={() => handleDelete(item._id)}>
                                                Delete
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="actions">
                                            <button onClick={() => handleEdit(item)} className="update-btn">
                                                Update
                                            </button>
                                            <button className="delete-btn" onClick={() => handleDelete(item._id)}>
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </AdminLayout>
    );
};

export default ListItemsPage;