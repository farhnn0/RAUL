import React from 'react';
import toast from 'react-hot-toast';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Card from 'react-bootstrap/Card';
import Image from 'react-bootstrap/Image';
import logo from '../assets/logo/logoWeb.png';
import img from '../assets/logo/log1.png';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/api'; 
import '../styles/style.css';

export default function Signup() {
    const {
        handleSubmit,
        register,
        formState: { errors, isSubmitting },
        watch // <-- TAMBAHAN: untuk validasi konfirmasi password
    } = useForm();
    
    // Amati nilai password
    const password = watch("password");

    const navigate = useNavigate();
    const location = useLocation();

    const doSubmit = async values => {
        try {
            const res = await api.post('/auth/signup', values);

            // Sesuaikan dengan respons backend baru (201 Created)
            if (res.status === 201) {
                // Tampilkan pesan sukses dari server (cth: "Cek email Anda...")
                toast.success(res.data.message, {
                    duration: 4000, // Beri waktu lebih agar user bisa baca
                });
                
                // Arahkan ke halaman login
                setTimeout(() => {
                    navigate('/signin', { 
                        state: { from: location.state?.from } 
                    });
                }, 2000);
            } else {
                // Jaga-jaga jika ada status sukses lain
                toast.error(res.data.message || 'Pendaftaran gagal.');
            }
        } catch (error) {
            // Tangkap error dari backend (cth: email sudah ada)
            toast.error(error.response?.data?.message || 'Terjadi kesalahan');
        }
    };

    return (
        <Container
            fluid
            className="d-flex justify-content-center align-items-center signup-container"
        >
            <Card className="p-5 w-75 card">
                <Row>
                    {/* Left Side */}
                    <Col md={6} className="text-center left-side">
                        <div className="d-flex justify-content-center align-items-center mb-3 mt-3">
                            <Image src={logo} roundedCircle className="logo me-2 mb-2" />
                            <h2 className="mb-1 archivo title-logo title-form align-title">RAUL</h2>
                        </div>
                        <div className="d-flex justify-content-center">
                            <Image src={img} rounded className="log1" />
                        </div>
                    </Col>

                    {/* Right Side */}
                    <Col md={6} className="right-side">
                        <Form onSubmit={handleSubmit(doSubmit)} className="text-center">
                            <h2 className="mb-4 archivo title-form align-title">Daftar Akun RAUL</h2>

                            {/* Email Field */}
                            <FloatingLabel controlId="floatingInputEmail" label="Email" className="mb-3">
                                <Form.Control
                                    type="email"
                                    placeholder="name@example.com"
                                    {...register('email', { 
                                        required: 'Masukkan email',
                                        pattern: { // Validasi format email
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Email tidak valid"
                                        }
                                    })}
                                />
                                {errors.email && (
                                    <Form.Text className="text-danger">{errors.email.message}</Form.Text>
                                )}
                            </FloatingLabel>

                            {/* Username Field */}
                            <FloatingLabel controlId="floatingInputUsername" label="Nama Lengkap" className="mb-3">
                                <Form.Control
                                    type="text"
                                    placeholder="Alexandro Dronolo"
                                    {...register('username', { required: 'Masukkan Nama Lengkap' })}
                                />
                                {errors.username && (
                                    <Form.Text className="text-danger">{errors.username.message}</Form.Text>
                                )}
                            </FloatingLabel>

                            {/* Password Field */}
                            <FloatingLabel controlId="floatingPassword" label="Kata Sandi">
                                <Form.Control
                                    type="password"
                                    placeholder="Password"
                                    className="mb-3"
                                    {...register('password', { 
                                        required: 'Masukkan Kata Sandi',
                                        minLength: { value: 6, message: "Password minimal 6 karakter" }
                                    })}
                                />
                                {errors.password && (
                                    <Form.Text className="text-danger">{errors.password.message}</Form.Text>
                                )}
                            </FloatingLabel>

                            {/* Confirm Password Field */}
                            <FloatingLabel controlId="floatingConfirmPassword" label="Ulangi Kata Sandi">
                                <Form.Control
                                    type="password"
                                    placeholder="Password"
                                    className="mb-3"
                                    {...register('confirmPassword', { 
                                        required: 'Masukkan konfirmasi kata sandi',
                                        validate: value => // Validasi pencocokan
                                            value === password || "Kata sandi tidak cocok"
                                    })}
                                />
                                {errors.confirmPassword && (
                                    <Form.Text className="text-danger">
                                        {errors.confirmPassword.message}
                                    </Form.Text>
                                )}
                            </FloatingLabel>

                            <Form.Check
                                type="checkbox"
                                id="agreementCheckbox"
                                label={
                                    <span className="dm-sans">
                                        Saya menyetujui{' '}
                                        <a href="privacy-policy" className="link-dark">
                                            <b>kebijakan privasi</b>
                                        </a>{' '}
                                        RAUL
                                    </span>
                                }
                                className="mb-3"
                                {...register('agreement', { required: 'Anda harus menyetujui kebijakan privasi' })}
                            />
                            {errors.agreement && (
                                <Form.Text className="text-danger">{errors.agreement.message}</Form.Text>
                            )}

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn btn-info mt-2 wide-button dm-sans mb-3"
                            >
                                {isSubmitting ? 'Loading...' : <strong>Daftar</strong>}
                            </Button>
                            <p className="mt-3 mb-5 dm-sans">
                                Sudah Punya Akun?{' '}
                                <span 
                                    onClick={() => navigate('/signin', { state: { from: location.state?.from } })}
                                    className="link-dark"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <b>Masuk</b>
                                </span>
                            </p>
                        </Form>
                    </Col>
                </Row>
            </Card>
        </Container>
    );
}