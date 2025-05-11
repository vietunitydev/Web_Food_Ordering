import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './FoodDetailPage.css';
import {actions, useAppContext} from '../../components/AppContext/AppContext.tsx';
import { toast } from 'react-toastify';

interface FoodItem {
    _id: string;
    title: string;
    description: string;
    imageURL: string;
    price: number;
    type: string;
    rating: string;
    isFeature: boolean;
}

const FoodDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { state, dispatch } = useAppContext();
    const [foodItem, setFoodItem] = useState<FoodItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Lấy thông tin món ăn từ API
    useEffect(() => {
        const fetchFoodItem = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/foodItems/get/${id}`);
                setFoodItem(response.data);
            } catch (err) {
                console.error('Lỗi khi lấy thông tin món ăn:', err);
                setError('Không thể tải thông tin món ăn. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };
        fetchFoodItem();
    }, [id]);

    const addToCart = async () => {
        if (!state.token) {
            toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng!');
            navigate('/login');
            return;
        }
        if (state.role !== 'user') {
            toast.error('Chỉ tài khoản người dùng mới có thể thêm vào giỏ hàng!');
            return;
        }

        try {
            if(foodItem == null){
                return
            }
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/carts/add`,
                { foodItemId: foodItem._id, quantity: 1 },
                { headers: { Authorization: `Bearer ${state.token}` } }
            );
            dispatch({
                type: actions.ADD_TO_CART,
                payload: { id: foodItem._id, name: foodItem.title, price: foodItem.price },
            });
            toast.success('Đã thêm vào giỏ hàng!');
            console.log('Thêm vào giỏ hàng thành công:', response.data);
        } catch (error) {
            console.error('Lỗi khi thêm vào giỏ hàng:', error);
            toast.error('Lỗi khi thêm vào giỏ hàng!');
        }
    };
    if (loading) {
        return <div className="food-detail-page">Đang tải...</div>;
    }

    if (error || !foodItem) {
        return (
            <div className="food-detail-page">
                <h2>{error || 'Món ăn không tồn tại'}</h2>
                <Link to="/food" className="back-btn">Quay về</Link>
            </div>
        );
    }

    return (
        <div className="food-detail-page">
            <div className="food-detail-container">
                <div className="food-image">
                    <img src={foodItem.imageURL} alt={foodItem.title} />
                </div>
                <div className="food-info">
                    <h2>{foodItem.title}</h2>
                    <p className="description">Mô tả: {foodItem.description}</p>
                    <p className="price">Giá: ${foodItem.price}</p>
                    <p className="rating">Đánh giá: {foodItem.rating} / 5</p>
                    {foodItem.isFeature && <p className="feature">Món ăn nổi bật</p>}
                    <div className="buttons">
                        <button onClick={addToCart} className="add-to-cart-btn">
                            Thêm vào giỏ hàng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FoodDetailPage;