import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import toast from 'react-hot-toast';
import logoWeb from '../assets/logo/logoWeb.png';

function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('Verifying your email...');
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [showResend, setShowResend] = useState(false);
    const [email, setEmail] = useState('');
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        if (!token) { setStatus('error'); setMessage('Verification token not found. Invalid link.'); return; }
        const verifyToken = async () => {
            try {
                const res = await api.post('/auth/verify-email', { token });
                setStatus('success');
                setMessage(res.data.message || 'Email verified! Redirecting to login...');
                setTimeout(() => navigate('/signin'), 3000);
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed. Token may be expired or invalid.');
            }
        };
        verifyToken();
    }, [token, navigate]);

    const handleResend = async (e) => {
        e.preventDefault();
        if (!email) { toast.error("Please enter your email."); return; }
        setIsResending(true);
        try {
            const res = await api.post('/auth/resend-verification', { email });
            setShowResend(false);
            toast.success(res.data.message);
        } catch (error) {
            toast.error("An error occurred. Please try again later.");
        } finally { setIsResending(false); }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
            <div className="bg-surface-card border border-outline-variant/60 rounded-2xl shadow-2xl w-full max-w-lg p-10 text-center">
                <img src={logoWeb} alt="RAUL" className="w-14 h-14 mx-auto mb-6" />
                <h2 className="text-2xl font-heading font-bold text-primary mb-6">Email Verification</h2>

                {status === 'verifying' && (
                    <>
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mx-auto mb-4"></div>
                        <p className="text-text-secondary">{message}</p>
                    </>
                )}

                {status === 'success' && (
                    <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6">
                        <span className="material-symbols-outlined text-[48px] text-green-400 mb-3 block">check_circle</span>
                        <h3 className="text-lg font-bold text-green-400 mb-2">Verified!</h3>
                        <p className="text-text-secondary">{message}</p>
                        <button onClick={() => navigate('/signin')} className="mt-4 bg-primary text-on-primary font-bold px-6 py-2.5 rounded-lg hover:bg-gold-hover transition-all text-sm uppercase tracking-wider">
                            Sign In Now
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
                        <span className="material-symbols-outlined text-[48px] text-red-400 mb-3 block">error</span>
                        <h3 className="text-lg font-bold text-red-400 mb-2">Verification Failed</h3>
                        <p className="text-text-secondary mb-4">{message}</p>
                        <button onClick={() => setShowResend(true)} className="bg-primary text-on-primary font-bold px-6 py-2.5 rounded-lg hover:bg-gold-hover transition-all text-sm uppercase tracking-wider">
                            Resend Verification Email
                        </button>
                    </div>
                )}

                {/* Resend Modal */}
                {showResend && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowResend(false)} />
                        <div className="relative bg-surface-card border border-outline-variant/60 rounded-2xl w-full max-w-sm p-8 shadow-2xl z-10">
                            <h3 className="text-lg font-heading font-bold text-text-primary mb-4">Resend Verification</h3>
                            <form onSubmit={handleResend} className="flex flex-col gap-4">
                                <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required
                                    className="w-full bg-surface border border-outline-variant/60 rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary text-sm" />
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setShowResend(false)} className="flex-1 py-2.5 border border-outline-variant/60 rounded-lg text-text-secondary text-sm font-semibold">Cancel</button>
                                    <button type="submit" disabled={isResending} className="flex-1 py-2.5 bg-primary text-on-primary rounded-lg font-bold text-sm hover:bg-gold-hover disabled:opacity-50">
                                        {isResending ? 'Sending...' : 'Send'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VerifyEmail;
