import React from 'react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/api';
import logoWeb from '../assets/logo/logoWeb.png';

export default function Signup() {
    const { handleSubmit, register, formState: { errors, isSubmitting }, watch } = useForm();
    const password = watch("password");
    const navigate = useNavigate();
    const location = useLocation();

    const doSubmit = async (values) => {
        try {
            const res = await api.post('/auth/signup', values);
            if (res.status === 201) {
                toast.success(res.data.message, { duration: 4000 });
                setTimeout(() => navigate('/signin', { state: { from: location.state?.from } }), 2000);
            } else {
                toast.error(res.data.message || 'Signup failed.');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'An error occurred');
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
                        Join the community of cinema critics and enthusiasts.
                    </p>
                </div>

                {/* Right Side - Form */}
                <div className="md:w-1/2 p-10 flex flex-col justify-center">
                    <h2 className="text-2xl font-heading font-bold text-text-primary mb-8 text-center">Create Account</h2>
                    <form onSubmit={handleSubmit(doSubmit)} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-1.5">Email</label>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email" }
                                })}
                                className="w-full bg-surface border border-outline-variant/60 rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors text-sm"
                            />
                            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-1.5">Full Name</label>
                            <input
                                type="text"
                                placeholder="Your Name"
                                {...register('username', { required: 'Full name is required' })}
                                className="w-full bg-surface border border-outline-variant/60 rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors text-sm"
                            />
                            {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-1.5">Password</label>
                            <input
                                type="password"
                                placeholder="Password"
                                {...register('password', { required: 'Password is required', minLength: { value: 6, message: "Password must be at least 6 characters" } })}
                                className="w-full bg-surface border border-outline-variant/60 rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors text-sm"
                            />
                            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-1.5">Confirm Password</label>
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                {...register('confirmPassword', {
                                    required: 'Please confirm your password',
                                    validate: value => value === password || "Passwords do not match"
                                })}
                                className="w-full bg-surface border border-outline-variant/60 rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors text-sm"
                            />
                            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                            <input type="checkbox" id="agreement" {...register('agreement', { required: 'You must agree to the privacy policy' })} className="accent-primary" />
                            <label htmlFor="agreement" className="text-text-secondary text-sm">
                                I agree to the{' '}
                                <a href="/privacy-policy" className="text-primary hover:text-gold-hover font-semibold">Privacy Policy</a>
                            </label>
                        </div>
                        {errors.agreement && <p className="text-red-400 text-xs">{errors.agreement.message}</p>}

                        <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-on-primary font-bold py-3 rounded-lg hover:bg-gold-hover transition-all text-sm uppercase tracking-wider disabled:opacity-50 mt-2">
                            {isSubmitting ? 'Loading...' : 'Create Account'}
                        </button>

                        <p className="text-center text-text-secondary text-sm mt-4">
                            Already have an account?{' '}
                            <span onClick={() => navigate('/signin', { state: { from: location.state?.from } })} className="text-primary hover:text-gold-hover font-semibold cursor-pointer transition-colors">
                                Sign In
                            </span>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
