import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Container, Card, Row, Col, Form, Button, FloatingLabel, Image, Alert } from 'react-bootstrap';
import api from '../api/api';
import logo from '../assets/logo/logoWeb.png';
import img from '../assets/logo/log1.png';
import '../styles/style.css';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [status, setStatus] = useState('idle');

    const {
        handleSubmit,
        register,
        watch,
        formState: { errors, isSubmitting },
    } = useForm();

    const password = watch("newPassword");

    const doSubmit = async (values) => {
        try {
            const res = await api.post('/auth/reset-password', {
                token: token,
                newPassword: values.newPassword
            });

            setStatus('success');
            toast.success(res.data.message);
            
            setTimeout(() => {
                navigate('/signin');
            }, 3000);

        } catch (error) {
            setStatus('error');
            toast.error(error.response?.data?.message || "Gagal mereset password.");
        }
    };

    // Jika tidak ada token di URL
    if (!token) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
                <Alert variant="danger">Link tidak valid. Token tidak ditemukan.</Alert>
            </Container>
        );
    }

    return (
        <Container fluid className="d-flex justify-content-center align-items-center signup-container">
            <Card className="p-5 w-75 card">
                <Row>
                    <Col md={6} className="text-center left-side">
                        <div className="d-flex justify-content-center align-items-center mb-3 mt-3">
                            <Image src={logo} roundedCircle className="logo me-2 mb-2" />
                            <h2 className="mb-1 archivo title-logo title-form align-title">RAUL</h2>
                        </div>
                        <div className="d-flex justify-content-center">
                            <Image src={img} rounded className="log1" />
                        </div>
                    </Col>

                    <Col md={6} className="right-side">
                        {status === 'success' ? (
                            <div className="text-center">
                                <h3 className="text-success mb-3">Berhasil!</h3>
                                <p>Kata sandi Anda telah diperbarui.</p>
                                <p>Mengalihkan ke halaman login...</p>
                                <Button as={Link} to="/signin" variant="success">Login Sekarang</Button>
                            </div>
                        ) : (
                            <Form onSubmit={handleSubmit(doSubmit)} className="text-center">
                                <h2 className="mb-4 archivo title-form align-title">Buat Kata Sandi Baru</h2>
                                
                                <FloatingLabel controlId="floatingPassword" label="Kata Sandi Baru" className="mb-3">
                                    <Form.Control
                                        type="password"
                                        placeholder="Password"
                                        {...register('newPassword', { 
                                            required: 'Masukkan kata sandi baru',
                                            minLength: { value: 6, message: 'Minimal 6 karakter' }
                                        })}
                                    />
                                    {errors.newPassword && <Form.Text className="text-danger">{errors.newPassword.message}</Form.Text>}
                                </FloatingLabel>

                                <FloatingLabel controlId="floatingConfirm" label="Ulangi Kata Sandi" className="mb-4">
                                    <Form.Control
                                        type="password"
                                        placeholder="Password"
                                        {...register('confirmPassword', { 
                                            required: 'Konfirmasi kata sandi',
                                            validate: val => val === password || 'Kata sandi tidak cocok'
                                        })}
                                    />
                                    {errors.confirmPassword && <Form.Text className="text-danger">{errors.confirmPassword.message}</Form.Text>}
                                </FloatingLabel>

                                <Button type="submit" disabled={isSubmitting} className="btn btn-info mt-2 wide-button dm-sans">
                                    {isSubmitting ? 'Memproses...' : <strong>Ubah Kata Sandi</strong>}
                                </Button>
                            </Form>
                        )}
                    </Col>
                </Row>
            </Card>
        </Container>
    );
}