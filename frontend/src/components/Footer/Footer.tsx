import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom'; // Thêm import Link

import insta from '../../assets/instagram.png';
import facebook from '../../assets/facebook.png';

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <p>
                        Thưởng thức món ngon mỗi ngày <br/>
                        Đặt đồ ăn nhanh chóng và tiện lợi cùng chúng tôi!
                    </p>
                    <div className="social-icons">
                        <a href="https://www.instagram.com/doanviet.027/" aria-label="Instagram"><img src={insta} alt="instagram"/></a>
                        <a href="https://www.facebook.com/doanviet.027/" aria-label="Facebook"><img src={facebook} alt="facebook"/></a>
                    </div>
                </div>
                <div className="footer-section">
                    <h3>Mở cửa</h3>
                    <p>Thứ 2 - Thứ 6: 09:00 - 22:00</p>
                    <p>Thứ 7 - CN: 09:00 - 23:00</p>
                </div>
                <div className="footer-section">
                    <h3>Liên kết người dùng</h3>
                    <Link to="/user-link/about">Về chúng tôi</Link>
                    <Link to="/user-link/delivery">Giao hàng</Link>
                    <Link to="/user-link/payment">Thanh toán</Link>
                    <Link to="/user-link/policy">Chính sách</Link>
                </div>
                <div className="footer-section">
                    <h3>Thông tin liên hệ</h3>
                    <p>100 Nguyễn Xiển</p>
                    <p>Thanh Xuân, Hà Nội</p>
                    <p>+84 973 870 244</p>
                    <div className="email-input">
                        <input type="email" placeholder="Nhập email của bạn..." />
                        <button type="submit">→</button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;