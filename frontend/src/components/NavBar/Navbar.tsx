import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import cart_icon from '../../assets/cart_icon.svg';
import grass_icon from '../../assets/grass_icon.png';
import avatar_icon from '../../assets/avatar_icon.png';
import './Navbar.css';
import { useAppContext, getTotalItems, actions } from '../AppContext/AppContext.tsx';

const Navbar: React.FC = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const { state, dispatch } = useAppContext();
    const totalItems = getTotalItems(state.cart);

    const handleLogout = () => {
        localStorage.removeItem('token');
        dispatch({ type: actions.LOGOUT });
        setShowDropdown(false);
        navigate('/home');
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        navigate(`/food?search=${searchTerm}`);
    };

    return (
        <nav className="navbar">
            <div className="logo">
                <Link to="/home">
                    <p>EATNOW.</p>
                </Link>
            </div>
            <ul className="nav-links">
                <li><Link to="/food?category=main">Món chính</Link></li>
                <li><Link to="/food?category=dessert">Tráng miệng</Link></li>
                <li><Link to="/food?category=fast_food">Đồ ăn nhanh</Link></li>
                <li><Link to="/food?category=drinks">Đồ uống</Link></li>
                <li><Link to="/food?category=other">Khác</Link></li>
            </ul>
            <div className="nav-actions">
                <div className="nav-actions-input-cart">
                    <img className="grass_icon" src={grass_icon} alt="grass_icon" />
                    <div className="search-box">
                        <form onSubmit={handleSearch}>
                            <input
                                type="text"
                                placeholder="Tìm kiếm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </form>
                    </div>
                    {state.role === 'user' && (
                        <>
                            <span className="separator">|</span>
                            <div className="cart-icon">
                                <Link to="/cart">
                                    <img src={cart_icon} alt="cart_icon" />
                                    <span className="cart-badge">{totalItems}</span>
                                </Link>
                            </div>
                        </>
                    )}
                </div>
                {state.token ? (
                    <div className="avatar-container">
                        <img
                            src={avatar_icon}
                            alt="Avatar"
                            className="avatar"
                            onClick={() => setShowDropdown(!showDropdown)}
                        />
                        {showDropdown && (
                            <div className="dropdown">
                                {state.role === 'user' && (
                                    <>
                                        <Link to="/profile" onClick={() => setShowDropdown(false)}>
                                            Sửa đổi thông tin cá nhân
                                        </Link>
                                        <Link to="/order-history" onClick={() => setShowDropdown(false)}>
                                            Xem lịch sử đặt hàng
                                        </Link>
                                    </>
                                )}
                                {state.role === 'admin' && (
                                    <Link to="/admin" onClick={() => setShowDropdown(false)}>
                                        Quản lý
                                    </Link>
                                )}
                                <button onClick={handleLogout}>Đăng xuất</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link to="/login" className="login-btn">Đăng nhập</Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;