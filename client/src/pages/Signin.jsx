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
import { useAuth } from '../App';
import '../styles/style.css';

export default function Signin() {
    const {
        handleSubmit,
        register,
        formState: { errors, isSubmitting },
    } = useForm();

    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const doSubmit = async (data) => {
        try {
            await login(data.email, data.password);
            toast.success('Sign in Successful');
            const from = location.state?.from?.pathname || '/';
            setTimeout(() => {
                navigate(from, { replace: true });
            }, 500);
            
        } catch (error) {
            toast.error('Gagal Login: ' + (error.response?.data?.message || error.message));
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
                            <h2 className="mb-4 archivo title-form align-title">Masuk Akun RAUL</h2>

                            {/* Email Field */}
                            <FloatingLabel controlId="floatingInput" label="Email" className="mb-3">
                                <Form.Control
                                    type="email"
                                    placeholder="name@example.com"
                                    {...register('email', { required: 'Masukkan email' })}
                                />
                                {errors.email && (
                                    <Form.Text className="text-danger">{errors.email.message}</Form.Text>
                                )}
                            </FloatingLabel>

                            {/* Password Field */}
                            <FloatingLabel controlId="floatingPassword" label="Kata Sandi">
                                <Form.Control
                                    type="password"
                                    placeholder="Password"
                                    className="mb-3"
                                    {...register('password', { required: 'Masukkan Kata Sandi' })}
                                />
                                {errors.password && (
                                    <Form.Text className="text-danger">{errors.password.message}</Form.Text>
                                )}
                            </FloatingLabel>
                            <div className='text-end'>
                                <span className="dm-sans">
                                    <a href="/forget-password" className="link-dark">
                                        <b>Lupa Password</b>
                                    </a>
                                </span>
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn btn-info mt-2 wide-button dm-sans"
                            >
                                {isSubmitting ? 'Loading...' : <strong>Masuk</strong>}
                            </Button>
                            <p className="mt-3 mb-5 dm-sans">
                                Belum Punya Akun?{' '}
                                <span 
                                    onClick={() => navigate('/signup', { state: { from: location.state?.from } })}
                                    className="link-dark"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <b>Daftar</b>
                                </span>
                            </p>
                        </Form>
                    </Col>
                </Row>
            </Card>
        </Container>
    );
}