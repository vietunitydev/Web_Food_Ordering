import './Home.css';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAppContext, actions } from '../../components/AppContext/AppContext.tsx';

import clock from '../../assets/clock.png';
import location from '../../assets/location.png';
import phone from '../../assets/phone.png';
import fork from '../../assets/fork-2.png';
import fork2 from '../../assets/fork2-2.png';
import delivery from '../../assets/delivery-2.png';
import computer from '../../assets/computer.png';
import fired_chicken from '../../assets/fired-chicken.png';
import package1 from '../../assets/package.png';
import burger from '../../assets/burger1.png';
import star from '../../assets/star.png';

interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
}

interface Product {
    id: string;
    name: string;
    rating: number;
    price: number;
    image: string;
}

interface ServiceSection {
    id: number;
    title: string;
    description: string;
    icon: string;
}

interface FoodItem {
    _id: string;
    title: string;
    price: number;
}

const services: ServiceSection[] = [
    { id: 1, title: 'Thực phẩm chất lượng', description: 'Chúng tôi cam kết cung cấp thực phẩm ngon, an toàn và đa dạng để bạn chọn lựa.', icon: fork },
    { id: 2, title: 'Tốt cho sức khỏe', description: 'Món ăn chất lượng tốt, bổ dưỡng, phù hợp với chế độ ăn lành mạnh.', icon: fork2 },
    { id: 3, title: 'Giao hàng nhanh', description: 'Dịch vụ giao hàng nhanh chóng, đảm bảo món ăn nóng hổi, giúp bạn nhận ngay tại nhà.', icon: delivery },
];

const Home = () => {
    const { state, dispatch } = useAppContext();
    const navigate = useNavigate();
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Lấy 4 món nổi bật cho hero section
                const menuResponse = await axios.get('http://localhost:4999/api/foodItems?featured=true&limit=4');
                const menuData = menuResponse.data.map((item: any) => ({
                    id: item._id,
                    name: item.title,
                    description: item.description || 'Delicious dish',
                    price: item.price.toFixed(2),
                    image: `http://localhost:4999${item.imageURL}`,
                }));
                setMenuItems(menuData);

                // Lấy top 6 món theo rating cho product grid
                const productResponse = await axios.get('http://localhost:4999/api/foodItems?sort=rating&order=desc&limit=6');
                const productData = productResponse.data.map((item: any) => ({
                    id: item._id,
                    name: item.title,
                    rating: item.rating || 4.5,
                    price: item.price.toFixed(2),
                    image: `http://localhost:4999${item.imageURL}`,
                }));
                setProducts(productData);
            } catch (err: any) {
                console.error('Error fetching data:', err);
                setError(err.response?.data?.message || 'Không thể tải dữ liệu món ăn.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
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
            // alert('Đã thêm vào giỏ hàng!');
        } catch (error) {
            console.error('Lỗi khi thêm vào giỏ hàng:', error);
            alert('Lỗi khi thêm vào giỏ hàng!');
        }
    };

    if (isLoading) {
        return <div className="loading">Đang tải...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="home">
            <section className="hero">
                <div className="hero-container">
                    <div className="hero-content">
                        <h1 className="title">
                            <span className="black">Giao Nhanh</span>
                            <br />
                            <span className="black">Hơn</span>
                            <br />
                            <span className="orange">The Flash</span>
                        </h1>
                        <p>
                            Ứng dụng mang đến trải nghiệm tiện lợi, giúp bạn dễ dàng đặt món ăn yêu thích.
                            Giao diện trực quan, tối ưu hóa cho người dùng, đảm bảo quá trình đặt hàng nhanh chóng và thuận tiện.
                            Thiết kế hiện đại, phù hợp với mọi nhu cầu, từ các món ăn phổ biến đến những lựa chọn cao cấp.
                        </p>
                        <Link to="/food" className="hero-button">Đặt ngay</Link>
                    </div>
                    <div className="hero-menu">
                        <div className="menu-grid">
                            {menuItems.map((item) => (
                                <div key={item.id} className="menu-item">
                                    <img src={item.image} alt={item.name} className="menu-item-image" />
                                    <div className="menu-item-content">
                                        <h3>{item.name}</h3>
                                        <p>{item.description}</p>
                                        <p className="price">${item.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <div className="info-bar-container">
                <div className="info-bar">
                    <div className="info-item">
                        <img src={clock} alt="item" />
                        <span>24/7</span>
                        <span>Giờ hoạt động</span>
                    </div>
                    <div className="info-item">
                        <img src={location} alt="item" />
                        <span>Thanh Xuân, Hà Nội</span>
                        <span>Địa Chỉ</span>
                    </div>
                    <div className="info-item">
                        <img src={phone} alt="item" />
                        <span>+84 973 870 244</span>
                        <span>Số điện thoại</span>
                    </div>
                </div>
            </div>

            <section className="product-grid">
                <p>Sản phẩm</p>
                <h2>Những món đặc ưa thích</h2>
                <div className="products-container">
                    {products.map((product) => (
                        <div key={product.id} className="product-item">
                            <img src={product.image} alt={product.name} />
                            <div className="product-content">
                                <div className="left-group">
                                    <h3>{product.name}</h3>
                                    <button
                                        className="add-to-cart"
                                        onClick={() => addToCart({ _id: product.id, title: product.name, price: product.price })}
                                    >
                                        Add To Cart
                                    </button>
                                </div>
                                <div className="right-group">
                                    <div className="rating">
                                        <img src={star} alt="star" />
                                        <p>{product.rating}</p>
                                    </div>
                                    <p className="price">${product.price}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <Link to="/food" className="see-more">
                    <p>Xem nhiều sản phẩm hơn</p>
                    <div className="o"></div>
                </Link>
            </section>

            <section className="services-section">
                <h2>Dịch vụ</h2>
                <h1>Vì Sao Nên Chọn Món Ăn Yêu Thích Của Chúng Tôi?</h1>
                <div className="services-grid">
                    {services.map((service) => (
                        <div key={service.id} className="service-item">
                            <div className={`service-icon ${service.icon}`}>
                                <img src={service.icon} alt="icon" />
                            </div>
                            <h3>{service.title}</h3>
                            <p>{service.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <div className="food-delivery-container">
                <h2>Hoạt động thế nào</h2>
                <h1 className="main-title">Thực phẩm là một phần quan trọng của chế độ ăn cân bằng.</h1>
                <div className="steps-container">
                    <div className="step">
                        <img src={computer} alt="Laptop" className="step-image" />
                        <h2 className="step-title">CHỌN</h2>
                        <p className="step-description">
                            Bạn muốn giảm cân, tập thể dục <br />
                            hoặc tuân theo một chế độ ăn trị liệu? <br />
                            Chuyên gia dinh dưỡng của chúng tôi sẽ <br />
                            giúp bạn chọn chương trình phù hợp! <br />
                        </p>
                    </div>
                    <div className="step">
                        <h2 className="step-title">CHUẨN BỊ</h2>
                        <p className="step-description">
                            Bạn muốn giảm cân, tập thể dục <br />
                            hoặc tuân theo một chế độ ăn trị liệu? <br />
                            Chuyên gia dinh dưỡng của chúng tôi sẽ <br />
                            giúp bạn chọn chương trình phù hợp! <br />
                        </p>
                        <img src={fired_chicken} alt="Food" className="step-image" />
                    </div>
                    <div className="step">
                        <img src={package1} alt="Delivery" className="step-image" />
                        <h2 className="step-title">GIAO HÀNG</h2>
                        <p className="step-description">
                            Bạn muốn giảm cân, tập thể dục <br />
                            hoặc tuân theo một chế độ ăn trị liệu? <br />
                            Chuyên gia dinh dưỡng của chúng tôi sẽ <br />
                            giúp bạn chọn chương trình phù hợp! <br />
                        </p>
                    </div>
                </div>
            </div>

            <div className="newsletter-container">
                <img src={burger} alt="Burger" className="burger-image" />
                <div className="text-form-container">
                    <h2>Đăng ký nhận bản tin của chúng tôi</h2>
                    <form className="email-form">
                        <input type="email" placeholder="Type your email..." />
                        <button type="submit">SUBSCRIBE</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Home;