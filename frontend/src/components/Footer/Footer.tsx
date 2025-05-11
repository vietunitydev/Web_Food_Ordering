import React from 'react';
import './Footer.css';

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
                    <div className= "social-icons">
                        <a href="https://www.instagram.com/doanviet.027/" aria-label="Insta"><img src={insta} alt="insta"/></a>
                        <a href="https://www.facebook.com/doanviet.027/" aria-label="Facebook"><img src={facebook} alt="facebook"/></a>
                    </div>
                </div>
                <div className="footer-section">
                    <h3>Mở cửa</h3>
                    <p>Mon-Fri: 09:00am-10:00pm</p>
                    <p>Sat-Sun: 09:00am-11:00pm</p>
                </div>
                <div className="footer-section">
                    <h3>Liên kết người dùng</h3>
                    <a href="https://www.instagram.com/doanviet.027/" aria-label="Insta">Về chúng tôi</a>
                    <a href="https://www.instagram.com/doanviet.027/" aria-label="Insta">Giao hàng</a>
                    <a href="https://www.instagram.com/doanviet.027/" aria-label="Insta">Thanh toán</a>
                    <a href="https://www.instagram.com/doanviet.027/" aria-label="Insta">Chính sách</a>
                </div>
                <div className="footer-section">
                    <h3>Thông tin liên hệ</h3>
                    <p>100 Nguyễn Xiển</p>
                    <p>Thanh Xuân, Hà Nội</p>
                    <p>+0123 456 7891</p>
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