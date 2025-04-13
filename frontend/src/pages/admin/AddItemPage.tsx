import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import axios from 'axios';
import './AddItemPage.css';
import upload from '../../assets/upload.png';
import { useAppContext } from '../../components/AppContext/AppContext.tsx';

const AddItemPage: React.FC = () => {
    const { state } = useAppContext();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'main',
        price: '',
        image: null as File | null,
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData((prev) => ({
                ...prev,
                image: file,
            }));
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.description || !formData.type || !formData.price || !formData.image) {
            alert('Vui lòng nhập đầy đủ thông tin sản phẩm.');
            return;
        }

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('type', formData.type);
        data.append('price', formData.price);
        data.append('image', formData.image);

        try {
            await axios.post('http://localhost:4999/api/foodItems', data, {
                headers: { Authorization: `Bearer ${state.token}` }
            });
            alert('Sản phẩm đã được thêm thành công!');
            setFormData({ title: '', description: '', type: '', price: '', image: null });
            setImagePreview(null);
        } catch (error) {
            alert('Lỗi khi thêm sản phẩm!');
            console.error(error);
        }
    };

    return (
        <AdminLayout activePage="add-item">
            <div className="add-item-page">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="image">Tải ảnh lên</label>
                        <div className="image-upload">
                            <input
                                type="file"
                                id="image"
                                name="image"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="image" className="upload-label">
                                <img src={upload} alt="icon" />
                            </label>
                        </div>
                        {imagePreview && (
                            <div className="image-preview">
                                <img src={imagePreview} alt="Preview" />
                            </div>
                        )}
                    </div>
                    <div className="form-group">
                        <label htmlFor="title">Tên sản phẩm</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Mô tả sản phẩm</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="type">Danh mục sản phẩm</label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                            >
                                <option value="main">Món chính</option>
                                <option value="dessert">Tráng miệng</option>
                                <option value="fast_food">Đồ ăn nhanh</option>
                                <option value="drinks">Đồ uống</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="price">Giá sản phẩm</label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    <button type="submit" className="add-btn">Thêm sản phẩm</button>
                </form>
            </div>
        </AdminLayout>
    );
};

export default AddItemPage;