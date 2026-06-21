import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logoWeb from '../../assets/logo/logoWeb.png';
import '../../styles/Footer.css';

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

    return (
        <>
            <footer className="modern-footer">
                <div className="footer-container">
                    {/* Brand Section */}
                    <div className="footer-brand-section">
                        <div className="footer-logo-wrapper">
                            <img src={logoWeb} alt="RAUL Logo" className="footer-logo" />
                            <h3 className="footer-brand-name">RAUL</h3>
                        </div>
                        <p className="footer-tagline">
                            Platform terbaik untuk menemukan film favorit Anda
                        </p>
                    </div>

                    {/* Links Section - Only Privacy Policy */}
                    <div className="footer-links-section">
                        <h4 className="footer-links-title">Informasi</h4>
                        <Link to="/privacy-policy" className="footer-link">
                            Kebijakan Privasi
                        </Link>
                    </div>
                </div>

                {/* Copyright */}
                <div className="footer-bottom">
                    <p className="footer-copyright">
                        © 2025 <span className="brand-highlight">RAUL</span>. Made with{' '}
                        <span className="footer-heart">❤</span> by Team RAUL
                    </p>
                </div>
            </footer>

            {/* Back to Top Button */}
            <button
                className={`back-to-top-btn ${showBackToTop ? 'show' : ''}`}
                onClick={scrollToTop}
                aria-label="Back to top"
            >
                <svg 
                    width="22" 
                    height="22" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                >
                    <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
            </button>
        </>
    );
};

export default Footer;