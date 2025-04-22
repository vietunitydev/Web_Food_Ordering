import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppContext, actions } from '../../components/AppContext/AppContext.tsx';
import axios from 'axios';
import './FoodPage.css';
import { FoodItem } from '../../shared/types.ts';

const FoodPage: React.FC = () => {
    const [items, setItems] = useState<FoodItem[]>([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 20,
    });
    const [searchParams, setSearchParams] = useSearchParams();
    const { state, dispatch } = useAppContext();
    const navigate = useNavigate();

    const category = searchParams.get('category') || '';
    const searchTerm = searchParams.get('search') || '';
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';

    const categoryTitleMap: { [key: string]: string } = {
        main: 'Món chính',
        dessert: 'Tráng miệng',
        fast_food: 'Đồ ăn nhanh',
        drinks: 'Đồ uống',
        other: 'Khác',
    };

    const title = searchTerm
        ? `Kết quả tìm kiếm cho "${searchTerm}"`
        : categoryTitleMap[category] || 'Tất cả món ăn';

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const params = new URLSearchParams({
                    page,
                    limit,
                    ...(category && { category }),
                    ...(searchTerm && { search: searchTerm }),
                });

                const url = `http://localhost:4999/api/foodItems?${params.toString()}`;
                const response = await axios.get(url);

                setItems(response.data.items);
                setPagination(response.data.pagination);
            } catch (error) {
                console.error('Lỗi khi lấy danh sách sản phẩm:', error);
            }
        };
        fetchItems();
    }, [page, limit, category, searchTerm]);

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
                payload: { id: item._id, name: item.title, price: item.price },
            });
            console.log('Thêm vào giỏ hàng thành công:', response.data);
        } catch (error) {
            console.error('Lỗi khi thêm vào giỏ hàng:', error);
            alert('Lỗi khi thêm vào giỏ hàng!');
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setSearchParams({
                ...Object.fromEntries(searchParams),
                page: newPage.toString(),
            });
        }
    };

    return (
        <div className="food-page">
            <div className="food-header">
                <h2 className="food-title">{title}</h2>
                <p className="result-count">{pagination.totalItems} kết quả</p>
            </div>

            {items.length === 0 ? (
                <div className="empty-item">
                    <p>Không tìm thấy món ăn nào.</p>
                </div>
            ) : (
                <div className="pizza-grid">
                    {items.map((item) => (
                        <div key={item._id} className="pizza-card">
                            <img
                                src={`http://localhost:4999${item.imageURL}`}
                                alt={item.title}
                                className="pizza-image"
                            />
                            <h3 className="pizza-name">{item.title}</h3>
                            <p className="pizza-price">${item.price.toFixed(2)}</p>
                            <button
                                onClick={() => addToCart(item)}
                                className="add-to-cart-button"
                            >
                                Thêm vào giỏ hàng
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {pagination.totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                    >
                        {'<'}
                    </button>
                    {Array.from({ length: pagination.totalPages }, (_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => handlePageChange(index + 1)}
                            className={pagination.currentPage === index + 1 ? 'active' : ''}
                        >
                            {index + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                    >
                        {'>'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default FoodPage;