import React from 'react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import api from '../api/api';
import logoWeb from '../assets/logo/logoWeb.png';

export default function ForgetPassword() {
    const { handleSubmit, register, formState: { errors, isSubmitting } } = useForm();

    const doSubmit = async (data) => {
        try {
            const res = await api.post('/auth/forgot-password', { email: data.email });
            toast.success(res.data.message, { duration: 5000 });
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
            <div className="bg-surface-card border border-outline-variant/60 rounded-2xl shadow-2xl w-full max-w-md p-10">
                <div className="text-center mb-8">
                    <img src={logoWeb} alt="RAUL" className="w-14 h-14 mx-auto mb-3" />
                    <h2 className="text-2xl font-heading font-bold text-primary">Forgot Password</h2>
                </div>
                <p className="text-text-secondary text-sm text-center mb-6">
                    Enter your registered email address. We'll send you a link to reset your password.
                </p>
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
                    <button type="submit" disabled={isSubmitting}
                        className="w-full bg-primary text-on-primary font-bold py-3 rounded-lg hover:bg-gold-hover transition-all text-sm uppercase tracking-wider disabled:opacity-50 mt-2">
                        {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
            </div>
        </div>
    );
}
