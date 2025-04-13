// RegisterForm.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './RegisterForm.css';

const RegisterForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!name || !email || !password || !confirmPassword || !address || !phone) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }

    setLoading(true);

    try {
      // Call the register API
      const response = await axios.post('http://localhost:4999/api/auth/register', {
        name,
        email,
        password,
        address,
        phone
      });

      if (response.data.success) {
        // Store token and user info in local storage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Redirect to home page after successful registration
        navigate('/home');
      } else {
        setError('Đăng ký không thành công.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký không thành công. Vui lòng thử lại.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="register-container">
        <div className="register-card">
          <h2 className="register-title">Đăng Ký</h2>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleRegister}>
            <div className="input-group">
              <input
                  type="text"
                  placeholder="Họ và tên"
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="input-group">
              <input
                  type="email"
                  placeholder="Email"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input-group">
              <input
                  type="password"
                  placeholder="Mật khẩu"
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="input-group">
              <input
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  className="input-field"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="input-group">
              <input
                  type="text"
                  placeholder="Địa chỉ"
                  className="input-field"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="input-group">
              <input
                  type="text"
                  placeholder="Số điện thoại"
                  className="input-field"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <button
                type="submit"
                className="register-button"
                disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Đăng Ký'}
            </button>
            <p className="policy-text">
              Bằng cách đăng nhập hoặc đăng ký, bạn đồng ý với{' '}
              <a href="#">Chính sách của EATNOW</a>.
            </p>
            <p>
              Đã có tài khoản? <Link to="/login">Đăng Nhập</Link>
            </p>
          </form>
        </div>
      </div>
  );
};

export default RegisterForm;