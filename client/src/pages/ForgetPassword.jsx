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
import '../styles/style.css';
import api from '../api/api';

export default function ForgetPassword() {
    const {
        handleSubmit,
        register,
        formState: { errors, isSubmitting },
    } = useForm();

    const doSubmit = async (data) => {
        try {
            const res = await api.post('/auth/forgot-password', { email: data.email });
            
            // Tampilkan pesan sukses generik dari backend
            toast.success(res.data.message, { duration: 5000 });
            
        } catch (error) {
            toast.error("Terjadi kesalahan. Silakan coba lagi.");
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
                            <h2 className="mb-1 archivo title-logo title-form align-title">Not Books</h2>
                        </div>
                        <div className="d-flex justify-content-center">
                            <Image src={img} rounded className="log1" />
                        </div>
                    </Col>

                    {/* Right Side */}
                    <Col md={6} className="right-side">
                        <Form onSubmit={handleSubmit(doSubmit)} className="text-center">
                            <h2 className="mb-4 archivo title-form align-title">Lupa Kata Sandi</h2>
                            <div className='text-center'>
                                <span className="dm-sans">
                                    <p><b> Silahkan masukkan email yang sudah<br /> terdaftar, kami akan mengirimkan link<br/> untuk mengatur ulang kata sandimu</b></p>
                                </span>
                            </div>
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
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn btn-info mt-2 wide-button dm-sans"
                            >
                                {isSubmitting ? 'Loading...' : <strong>Kirim</strong>}
                            </Button>
                        </Form>
                    </Col>
                </Row>
            </Card>
        </Container>
    );
}