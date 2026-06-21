import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
    Container, Spinner, Alert, Button, Card, Row, Col, Image, 
    Modal, Form, FloatingLabel
} from 'react-bootstrap';
import api from '../api/api';
import logo from '../assets/logo/logoWeb.png';
import img from '../assets/logo/log1.png';
import '../styles/style.css';
import toast from 'react-hot-toast';

function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('Sedang memverifikasi email Anda...');
    const navigate = useNavigate();

    const token = searchParams.get('token');

    // --- State baru untuk Modal Kirim Ulang ---
    const [showResendModal, setShowResendModal] = useState(false);
    const [email, setEmail] = useState(''); 
    const [isResending, setIsResending] = useState(false);
    // -----------------------------------------

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Token verifikasi tidak ditemukan. Link tidak valid.');
            return;
        }

        const verifyToken = async () => {
            try {
                const res = await api.post('/auth/verify-email', { token });
                setStatus('success');
                setMessage(res.data.message || 'Email berhasil diverifikasi! Anda akan diarahkan ke halaman login.');
                
                setTimeout(() => {
                    navigate('/signin');
                }, 3000);

            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Gagal memverifikasi email. Token mungkin kedaluwarsa atau tidak valid.');
            }
        };

        verifyToken();
        
    }, [token, navigate]);

    // --- Fungsi baru untuk Modal ---
    const handleCloseResendModal = () => {
        setShowResendModal(false);
        setEmail(''); // Kosongkan email saat modal ditutup
    };
    const handleShowResendModal = () => setShowResendModal(true);

    const handleResendSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            return toast.error("Silakan masukkan email Anda.");
        }
        setIsResending(true);
        try {
            // Panggil API backend
            const res = await api.post('/auth/resend-verification', { email });
            handleCloseResendModal();
            toast.success(res.data.message);
        } catch (error) {
            console.error("Resend verification failed:", error);
            toast.error("Terjadi kesalahan pada server. Coba lagi nanti.");
        } finally {
            setIsResending(false);
        }
    };
    // -----------------------------


    // Fungsi untuk menampilkan konten berdasarkan status
    const renderStatus = () => {
        if (status === 'verifying') {
            return (
                <>
                    <h2 className="mb-4 archivo title-form align-title">Verifikasi Akun</h2>
                    <Spinner animation="border" variant="warning" className="mb-3" style={{ width: '3rem', height: '3rem' }} />
                    <h5 className="text-dark">{message}</h5>
                    <p className="text-muted">Harap tunggu sebentar...</p>
                </>
            );
        }
        if (status === 'success') {
            return (
                <Alert variant="success" className="w-100">
                    <Alert.Heading>Verifikasi Berhasil!</Alert.Heading>
                    <p>{message}</p>
                    <hr />
                    <Button as={Link} to="/signin" variant="success">
                        Login Sekarang
                    </Button>
                </Alert>
            );
        }
        if (status === 'error') {
            return (
                <Alert variant="danger" className="w-100">
                    <Alert.Heading>Verifikasi Gagal!</Alert.Heading>
                    <p>{message}</p>
                    <hr />
                    {/* --- PERUBAHAN DI SINI --- */}
                    <Button variant="danger" onClick={handleShowResendModal}>
                        Kirim Ulang Email Verifikasi
                    </Button>
                    {/* --- AKHIR PERUBAHAN --- */}
                </Alert>
            );
        }
    };

    return (
        <Container
            fluid
            className="d-flex justify-content-center align-items-center signup-container"
        >
            <Card className="p-5 w-75 card">
                <Row>
                    {/* Left Side (Sama seperti Signin) */}
                    <Col md={6} className="text-center left-side">
                        <div className="d-flex justify-content-center align-items-center mb-3 mt-3">
                            <Image src={logo} roundedCircle className="logo me-2 mb-2" />
                            <h2 className="mb-1 archivo title-logo title-form align-title">RAUL</h2>
                        </div>
                        <div className="d-flex justify-content-center">
                            <Image src={img} rounded className="log1" />
                        </div>
                    </Col>

                    {/* Right Side (Menampilkan Status Verifikasi) */}
                    <Col md={6} className="right-side d-flex flex-column justify-content-center align-items-center text-center">
                        {renderStatus()}
                    </Col>
                </Row>
            </Card>

            {/* --- MODAL BARU UNTUK KIRIM ULANG --- */}
            <Modal show={showResendModal} onHide={handleCloseResendModal} centered data-bs-theme="dark">
                <Form onSubmit={handleResendSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>Kirim Ulang Email Verifikasi</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p className="text-muted">Masukkan email yang Anda gunakan untuk mendaftar. Kami akan mengirimkan link verifikasi baru.</p>
                        <FloatingLabel controlId="floatingEmail" label="Email" className="mb-3">
                            <Form.Control
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </FloatingLabel>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseResendModal}>
                            Batal
                        </Button>
                        <Button variant="warning" type="submit" disabled={isResending}>
                            {isResending ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                    {' '}Mengirim...
                                </>
                            ) : (
                                'Kirim'
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
}

export default VerifyEmail;