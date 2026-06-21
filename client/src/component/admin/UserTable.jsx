import React from 'react';
import { Table, Button, Badge, Form } from 'react-bootstrap';

const UserTable = ({ users, onDelete, onRoleChange }) => {
    return (
        <div className="table-responsive">
            <h4 className="mb-3">Daftar Pengguna</h4>
            <Table striped hover variant="dark" className="custom-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr key={user._id}>
                            <td>{index + 1}</td>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>
                                {/* Dropdown Ganti Role */}
                                <Form.Select 
                                    size="sm"
                                    value={user.role}
                                    onChange={(e) => onRoleChange(user._id, e.target.value)}
                                    style={{ 
                                        width: '120px', 
                                        backgroundColor: user.role === 'admin' ? '#dc3545' : '#6c757d',
                                        color: 'white',
                                        border: 'none'
                                    }}
                                >
                                    <option value="customer">Customer</option>
                                    <option value="admin">Admin</option>
                                </Form.Select>
                            </td>
                            <td>
                                {user.role !== 'admin' && (
                                    <Button 
                                        variant="outline-danger" 
                                        size="sm"
                                        onClick={() => onDelete(user._id)}
                                    >
                                        Hapus
                                    </Button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default UserTable;