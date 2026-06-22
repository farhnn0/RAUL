import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../api/api';
import logoWeb from '../assets/logo/logoWeb.png';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [status, setStatus] = useState('idle');

    const { handleSubmit, register, watch, formState: { errors, isSubmitting } } = useForm();
    const password = watch("newPassword");

    const doSubmit = async (values) => {
        try {
            const res = await api.post('/auth/reset-password', { token, newPassword: values.newPassword });
            setStatus('success');
            toast.success(res.data.message);
            setTimeout(() => navigate('/signin'), 3000);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reset password.");
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-8">
                <div className="bg-surface-card border border-outline-variant/60 rounded-2xl p-10 text-center">
                    <span className="material-symbols-outlined text-[48px] text-red-400 mb-4 block">error</span>
                    <h3 className="text-lg font-bold text-text-primary mb-2">Invalid Link</h3>
                    <p className="text-text-secondary">Reset token not found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
            <div className="bg-surface-card border border-outline-variant/60 rounded-2xl shadow-2xl w-full max-w-md p-10">
                <div className="text-center mb-8">
                    <img src={logoWeb} alt="RAUL" className="w-14 h-14 mx-auto mb-3" />
                    <h2 className="text-2xl font-heading font-bold text-primary">Reset Password</h2>
                </div>

                {status === 'success' ? (
                    <div className="text-center">
                        <span className="material-symbols-outlined text-[48px] text-green-400 mb-3 block">check_circle</span>
                        <h3 className="text-lg font-bold text-green-400 mb-2">Success!</h3>
                        <p className="text-text-secondary mb-4">Your password has been updated. Redirecting to login...</p>
                        <button onClick={() => navigate('/signin')} className="bg-primary text-on-primary font-bold px-6 py-2.5 rounded-lg hover:bg-gold-hover transition-all text-sm uppercase tracking-wider">
                            Sign In
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(doSubmit)} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-1.5">New Password</label>
                            <input type="password" placeholder="New password"
                                {...register('newPassword', { required: 'Enter new password', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                                className="w-full bg-surface border border-outline-variant/60 rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors text-sm" />
                            {errors.newPassword && <p className="text-red-400 text-xs mt-1">{errors.newPassword.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-1.5">Confirm Password</label>
                            <input type="password" placeholder="Confirm password"
                                {...register('confirmPassword', { required: 'Confirm your password', validate: val => val === password || 'Passwords do not match' })}
                                className="w-full bg-surface border border-outline-variant/60 rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors text-sm" />
                            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
                        </div>
                        <button type="submit" disabled={isSubmitting}
                            className="w-full bg-primary text-on-primary font-bold py-3 rounded-lg hover:bg-gold-hover transition-all text-sm uppercase tracking-wider disabled:opacity-50 mt-2">
                            {isSubmitting ? 'Processing...' : 'Change Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
