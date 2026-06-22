import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background pt-20">
            <div className="max-w-3xl mx-auto px-6 py-12">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-8 text-sm font-semibold">
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span> Back
                </button>

                <h1 className="text-3xl font-heading font-bold text-text-primary mb-8">Privacy Policy</h1>

                <div className="prose prose-invert max-w-none space-y-6 text-text-secondary leading-relaxed">
                    <p>
                        Welcome to <strong className="text-primary">RAUL</strong>! Your privacy is important to us.
                        This page explains how we collect, use, and protect your personal data.
                    </p>

                    <section>
                        <h2 className="text-xl font-heading font-semibold text-text-primary mt-8 mb-3">Information Collection</h2>
                        <p>
                            We may collect personal information such as name, email address, and other data
                            when you register or use our services. We also collect non-personal information,
                            such as device type and usage patterns, to improve your experience.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-heading font-semibold text-text-primary mt-8 mb-3">Use of Information</h2>
                        <p>Your personal data is used to:</p>
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                            <li>Manage your account and preferences</li>
                            <li>Provide better customer service</li>
                            <li>Send relevant offers, promotions, or surveys</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="text-xl font-heading font-semibold text-text-primary mt-8 mb-3">Data Security</h2>
                        <p>
                            We use current security technologies to protect your personal data from
                            unauthorized access, loss, or misuse. However, no security system is 100% secure.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-heading font-semibold text-text-primary mt-8 mb-3">Cookies</h2>
                        <p>
                            Our website uses cookies to personalize your experience. You can manage
                            cookie preferences through your browser settings.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-heading font-semibold text-text-primary mt-8 mb-3">Policy Updates</h2>
                        <p>
                            This privacy policy may be updated at any time. We will notify you via email
                            or a website notice if there are significant changes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-heading font-semibold text-text-primary mt-8 mb-3">Contact Us</h2>
                        <p>
                            If you have questions about this privacy policy, contact us at{' '}
                            <a href="mailto:support@raul.app" className="text-primary hover:text-gold-hover font-semibold">
                                support@raul.app
                            </a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
