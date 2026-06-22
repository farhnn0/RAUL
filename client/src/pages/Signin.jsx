import React from 'react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import logoWeb from '../assets/logo/logoWeb.png';

export default function Signin() {
    const { handleSubmit, register, formState: { errors, isSubmitting } } = useForm();
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const doSubmit = async (data) => {
        try {
            await login(data.email, data.password);
            toast.success('Sign in successful');
            const from = location.state?.from?.pathname || '/';
            setTimeout(() => navigate(from, { replace: true }), 500);
        } catch (error) {
            toast.error('Login failed: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
            <div className="bg-surface-card border border-outline-variant/60 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row">
                {/* Left Side - Brand */}
                <div className="md:w-1/2 bg-surface p-10 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-outline-variant/40">
                    <img src={logoWeb} alt="RAUL" className="w-16 h-16 mb-4" />
                    <h2 className="text-3xl font-heading font-bold text-primary mb-3 tracking-tighter">RAUL</h2>
                    <p className="text-text-secondary text-sm max-w-xs">
                        The definitive journal for cinema critics and enthusiasts worldwide.
                    </p>
                </div>

                {/* Right Side - Form */}
                <div className="md:w-1/2 p-10 flex flex-col justify-center">
                    <h2 className="text-2xl font-heading font-bold text-text-primary mb-8 text-center">Sign In</h2>
                    <form onSubmit={handleSubmit(doSubmit)} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-1.5">Email</label>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                {...register('email', { required: 'Email is required' })}
                                className="w-full bg-surface border border-outline-variant/60 rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors text-sm"
                            />
                            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-1.5">Password</label>
                            <input
                                type="password"
                                placeholder="Password"
                                {...register('password', { required: 'Password is required' })}
                                className="w-full bg-surface border border-outline-variant/60 rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors text-sm"
                            />
                            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                        </div>

                        <div className="text-right">
                            <a href="/forget-password" className="text-primary hover:text-gold-hover text-sm font-semibold transition-colors">
                                Forgot Password?
                            </a>
                        </div>

                        <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-on-primary font-bold py-3 rounded-lg hover:bg-gold-hover transition-all text-sm uppercase tracking-wider disabled:opacity-50 mt-2">
                            {isSubmitting ? 'Loading...' : 'Sign In'}
                        </button>

                        <p className="text-center text-text-secondary text-sm mt-4">
                            Don't have an account?{' '}
                            <span onClick={() => navigate('/signup', { state: { from: location.state?.from } })} className="text-primary hover:text-gold-hover font-semibold cursor-pointer transition-colors">
                                Sign Up
                            </span>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
