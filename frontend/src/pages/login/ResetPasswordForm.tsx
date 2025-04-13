import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
// import './ResetPasswordForm.css';

const ResetPasswordForm: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [tokenValid, setTokenValid] = useState(true);

    const { resettoken } = useParams<{ resettoken: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        if (!resettoken) {
            setTokenValid(false);
            setError('Token không hợp lệ hoặc đã hết hạn.');
        }
    }, [resettoken]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!password || !confirmPassword) {
            setError('Vui lòng nhập đầy đủ mật khẩu.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Mật khẩu không khớp.');
            return;
        }

        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }

        setLoading(true);

        try {
            // Gọi API đặt lại mật khẩu
            const response = await axios.put(
                `http://localhost:4999/api/auth/reset-password/${resettoken}`,
                { password }
            );

            if (response.data.success) {
                setSuccess('Mật khẩu đã được đặt lại thành công!');

                // Chuyển hướng đến trang đăng nhập sau 3 giây
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(response.data.message || 'Không thể đặt lại mật khẩu.');
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
            setError(errorMsg);
            console.error('Reset password error:', err);

            // Nếu token không hợp lệ
            if (err.response?.status === 400 && errorMsg.includes('token')) {
                setTokenValid(false);
            }
        } finally {
            setLoading(false);
        }
    };

    // Nếu token không hợp lệ, hiển thị thông báo và liên kết đến yêu cầu mới
    if (!tokenValid) {
        return (
            <div className="login-container">
                <div className="login-card">
                    <h2 className="login-title">Đặt Lại Mật Khẩu</h2>
                    <p className="error-message">
                        {error || 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.'}
                    </p>
                    <div className="action-links">
                        <Link to="/forgot-password" className="primary-link">
                            Yêu cầu liên kết mới
                        </Link>
                        <Link to="/login" className="secondary-link">
                            Quay lại đăng nhập
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Đặt Lại Mật Khẩu</h2>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Mật khẩu mới"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Xác nhận mật khẩu mới"
                            className="input-field"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                    </button>

                    <div className="back-to-login">
                        <Link to="/login">Quay lại đăng nhập</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordForm;