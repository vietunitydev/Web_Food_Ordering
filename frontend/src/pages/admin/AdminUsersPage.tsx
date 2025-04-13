import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import './AdminUsersPage.css';
import { User } from "../../shared/types.ts";
import { useAppContext } from '../../components/AppContext/AppContext.tsx';
import axios from 'axios';

const AdminUsersPage: React.FC = () => {
    const { state } = useAppContext();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerms, setSearchTerms] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        role: '',
    });

    useEffect(() => {
        const fetchUsers = async () => {
            if (!state.token || state.role !== 'admin') {
                setError('Không có quyền truy cập.');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get('http://localhost:4999/api/users/all', {
                    headers: { Authorization: `Bearer ${state.token}` },
                });

                const formattedUsers: User[] = response.data.users.map((user: any) => ({
                    _id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    phone: user.phone || '',
                    address: user.address || '',
                    role: user.role || 'user',
                    avatar: user.avatar || '',
                }));

                setUsers(formattedUsers);
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Không thể tải danh sách người dùng. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [state.token, state.role]);

    const handleDelete = async (userId: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
            try {
                await axios.delete(`http://localhost:4999/api/users/${userId}`, {
                    headers: { Authorization: `Bearer ${state.token}` },
                });

                const updatedUsers = users.filter((user) => user._id !== userId);
                setUsers(updatedUsers);
                setError(null);
            } catch (err) {
                console.error('Error deleting user:', err);
                setError('Không thể xóa người dùng. Vui lòng thử lại.');
            }
        }
    };

    const handleSearchChange = (field: string, value: string) => {
        setSearchTerms((prev) => ({ ...prev, [field]: value }));
    };

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(searchTerms.name.toLowerCase()) &&
        user.email.toLowerCase().includes(searchTerms.email.toLowerCase()) &&
        (user.phone || '').toLowerCase().includes(searchTerms.phone.toLowerCase()) &&
        (user.address || '').toLowerCase().includes(searchTerms.address.toLowerCase()) &&
        user.role.toLowerCase().includes(searchTerms.role.toLowerCase())
    );

    if (loading) {
        return (
            <AdminLayout activePage="users">
                <div className="admin-users-page">Đang tải...</div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout activePage="users">
                <div className="admin-users-page">
                    <p className="error-message">{error}</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout activePage="users">
            <div className="admin-users-page">
                <h2>Users Management</h2>
                {users.length === 0 ? (
                    <p className="no-users">Chưa có người dùng nào.</p>
                ) : (
                    <>
                        <div className="search-form">
                            <input
                                type="text"
                                placeholder="Tìm tên"
                                value={searchTerms.name}
                                onChange={(e) => handleSearchChange('name', e.target.value)}
                                className="search-input"
                            />
                            <input
                                type="text"
                                placeholder="Tìm email"
                                value={searchTerms.email}
                                onChange={(e) => handleSearchChange('email', e.target.value)}
                                className="search-input"
                            />
                            <input
                                type="text"
                                placeholder="Tìm SĐT"
                                value={searchTerms.phone}
                                onChange={(e) => handleSearchChange('phone', e.target.value)}
                                className="search-input"
                            />
                            <input
                                type="text"
                                placeholder="Tìm địa chỉ"
                                value={searchTerms.address}
                                onChange={(e) => handleSearchChange('address', e.target.value)}
                                className="search-input"
                            />
                            <input
                                type="text"
                                placeholder="Tìm vai trò"
                                value={searchTerms.role}
                                onChange={(e) => handleSearchChange('role', e.target.value)}
                                className="search-input"
                            />
                        </div>

                        <table className="users-table">
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Address</th>
                                <th>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user._id}>
                                    <td className="fixed-width name">{user.name}</td>
                                    <td className="fixed-width">{user.email}</td>
                                    <td className="fixed-width">{user.phone || 'N/A'}</td>
                                    <td className="fixed-width address">{user.address || 'N/A'}</td>
                                    <td>
                                        <button className="delete-btn" onClick={() => handleDelete(user._id)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminUsersPage;