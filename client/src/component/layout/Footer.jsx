import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Footer = () => {
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const footerLinks = [
        { label: "Privacy Policy", path: "/privacy-policy" },
        { label: "Terms of Service", path: "#" },
        { label: "Contact Us", path: "#" },
        { label: "Press Kit", path: "#" },
        { label: "Careers", path: "#" },
    ];

    return (
        <>
            <footer className="bg-surface-container-lowest border-t border-outline-variant/40">
                <div className="max-w-[1280px] mx-auto px-6 py-16 flex flex-col md:flex-row justify-between items-center gap-8">
                    {/* Brand */}
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <span className="text-2xl font-heading font-bold text-primary tracking-tighter">RAUL</span>
                        <p className="text-xs text-text-muted max-w-xs text-center md:text-left tracking-wider font-medium uppercase">
                            The definitive journal for cinema critics and enthusiasts worldwide.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap justify-center gap-8">
                        {footerLinks.map((link) => (
                            <Link
                                key={link.label}
                                to={link.path}
                                className="text-sm text-text-muted hover:text-primary transition-colors opacity-80 hover:opacity-100"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Copyright */}
                    <p className="text-xs text-text-muted font-medium">
                        &copy; {new Date().getFullYear()} RAUL Film Journal. All rights reserved.
                    </p>
                </div>
            </footer>

            {/* Back to Top */}
            <button
                className={`fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg transition-all duration-300 hover:bg-gold-hover hover:scale-110 ${
                    showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                }`}
                onClick={scrollToTop}
                aria-label="Back to top"
            >
                <span className="material-symbols-outlined text-[24px] font-bold">arrow_upward</span>
            </button>
        </>
    );
};

export default Footer;
