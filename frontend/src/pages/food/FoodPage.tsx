import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppContext, actions } from '../../components/AppContext/AppContext.tsx';
import axios from 'axios';
import './FoodPage.css';
import { FoodItem } from "../../shared/types.ts";

const ITEMS_PER_PAGE = 20;

const FoodPage: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [items, setItems] = useState<FoodItem[]>([]);
    const [searchParams] = useSearchParams();
    const { state, dispatch } = useAppContext();
    const navigate = useNavigate();

    const category = searchParams.get('category') || '';
    const searchTerm = searchParams.get('search') || '';

    const categoryTitleMap: { [key: string]: string } = {
        main: 'Món chính',
        dessert: 'Tráng miệng',
        fast_food: 'Đồ ăn nhanh',
        drinks: 'Đồ uống',
        other: 'Khác',
    };

    const title = searchTerm ? `Kết quả tìm kiếm cho "${searchTerm}"` : (categoryTitleMap[category] || 'Tất cả món ăn');

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await axios.get('http://localhost:4999/api/foodItems/all');
                setItems(response.data);
            } catch (error) {
                console.error('Lỗi khi lấy danh sách sản phẩm:', error);
            }
        };
        fetchItems();
    }, []);

    const addToCart = async (item: FoodItem) => {
        if (!state.token) {
            alert('Vui lòng đăng nhập để thêm vào giỏ hàng!');
            navigate('/login');
            return;
        }
        if (state.role !== 'user') {
            alert('Chỉ tài khoản người dùng mới có thể thêm vào giỏ hàng!');
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost:4999/api/carts/add',
                { foodItemId: item._id, quantity: 1 },
                { headers: { Authorization: `Bearer ${state.token}` } }
            );
            dispatch({
                type: actions.ADD_TO_CART,
                payload: { id: item._id, name: item.title, price: item.price }
            });
            console.log('Thêm vào giỏ hàng thành công:', response.data);
        } catch (error) {
            console.error('Lỗi khi thêm vào giỏ hàng:', error);
            alert('Lỗi khi thêm vào giỏ hàng!');
        }
    };

    // Lọc món ăn dựa trên category hoặc search
    const filteredItems = items.filter((item) => {
        if (searchTerm) {
            // Nếu có searchTerm, lọc theo title chứa chuỗi tìm kiếm
            return item.title.toLowerCase().includes(searchTerm.toLowerCase());
        } else if (category) {
            // Nếu có category mà không có searchTerm, lọc theo category
            return item.type === category;
        } else {
            // Nếu không có cả hai, hiển thị tất cả
            return true;
        }
    });

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [category, searchTerm]);

    return (
        <div className="food-page">
            <div className="food-header">
                <h2 className="food-title">{title}</h2>
                <p className="result-count">{filteredItems.length} kết quả</p>
            </div>

            {currentItems.length === 0 ? (<div className="empty-item"><p>Không tìm thấy món ăn nào.</p></div>) : (<p></p>)}


            <div className="pizza-grid">
                {currentItems.length === 0 ? (
                    <p></p>
                ) : (
                    currentItems.map((item) => (
                        <div key={item._id} className="pizza-card">
                            <img src={`http://localhost:4999${item.imageURL}`} alt={item.title} className="pizza-image" />
                            <h3 className="pizza-name">{item.title}</h3>
                            <p className="pizza-price">${item.price.toFixed(2)}</p>
                            <button onClick={() => addToCart(item)} className="add-to-cart-button">
                                Thêm vào giỏ hàng
                            </button>
                        </div>
                    ))
                )}
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>{'<'}</button>
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => handlePageChange(index + 1)}
                            className={currentPage === index + 1 ? 'active' : ''}
                        >
                            {index + 1}
                        </button>
                    ))}
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>{'>'}</button>
                </div>
            )}
        </div>
    );
};

export default FoodPage;