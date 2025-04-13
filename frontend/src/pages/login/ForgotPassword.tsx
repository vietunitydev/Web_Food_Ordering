import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
// import './ForgotPasswordForm.css';

const ForgotPasswordForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!email) {
            setError('Vui lòng nhập email của bạn.');
            return;
        }

        setLoading(true);

        try {
            // Gọi API quên mật khẩu
            const response = await axios.post('http://localhost:4999/api/auth/forgot-password', {
                email
            });

            if (response.data.success) {
                setSuccess('Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.');
                setEmail(''); // Xóa trường email sau khi gửi thành công
            } else {
                setError(response.data.message || 'Không thể gửi email đặt lại mật khẩu.');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.');
            console.error('Forgot password error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Quên Mật Khẩu</h2>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}

                <p className="instruction-text">
                    Nhập email của bạn để nhận liên kết đặt lại mật khẩu.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="email"
                            placeholder="Email"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? 'Đang xử lý...' : 'Gửi liên kết đặt lại'}
                    </button>

                    <div className="back-to-login">
                        <Link to="/login">Quay lại đăng nhập</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordForm;