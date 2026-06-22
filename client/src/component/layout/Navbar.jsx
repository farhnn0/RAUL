import React, { useState, useEffect, useRef } from "react";
import { useAuth } from '../../App';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import api from '../../api/api';
import logoWeb from '../../assets/logo/logoWeb.png';

const Header = () => {
    const [input, setInput] = useState("");
    const [genres, setGenres] = useState([]);
    const [showGenreDropdown, setShowGenreDropdown] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();
    const isAdultParam = searchParams.get('isAdult') === 'true';
    const [isAdult, setIsAdult] = useState(isAdultParam);

    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const genreRef = useRef(null);
    const userRef = useRef(null);

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await api.get('/movies/genres');
                setGenres(response.data);
            } catch (error) {
                console.error("Gagal mengambil genre:", error);
            }
        };
        fetchGenres();
    }, []);

    useEffect(() => {
        setIsAdult(searchParams.get('isAdult') === 'true');
    }, [searchParams]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (genreRef.current && !genreRef.current.contains(event.target)) {
                setShowGenreDropdown(false);
            }
            if (userRef.current && !userRef.current.contains(event.target)) {
                setShowUserDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        setIsAdult(false);
        logout();
        setShowUserDropdown(false);
        setMobileMenuOpen(false);
        navigate('/');
    };

    const toggleAdultFilter = () => {
        const newValue = !isAdult;
        setIsAdult(newValue);
        const newParams = new URLSearchParams(searchParams);
        if (newValue) {
            newParams.set('isAdult', 'true');
        } else {
            newParams.delete('isAdult');
        }
        setSearchParams(newParams);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (input.trim()) {
            navigate(`/search?query=${input.trim()}&isAdult=${isAdult}`);
            setInput("");
            setMobileMenuOpen(false);
        }
    };

    const getLink = (path) => isAdult ? `${path}?isAdult=true` : path;

    const navLinks = [
        { label: "Trending", path: "/" },
        { label: "Latest", path: "/movie" },
        { label: "Top Rated", path: "/movie?sort=rating" },
    ];

    return (
        <header className="fixed top-0 w-full z-50 bg-background border-b border-border-color h-20">
            <div className="max-w-container mx-auto px-margin-page flex items-center justify-between h-full">

                {/* Left: Brand + Nav */}
                <div className="flex items-center gap-12">
                    <Link to={getLink("/")} className="flex items-center gap-3 group">
                        <img src={logoWeb} alt="RAUL Logo" className="w-9 h-9 object-contain group-hover:scale-105 transition-transform" />
                        <span className="font-heading text-headline-md font-extrabold text-primary tracking-tighter group-hover:text-gold-hover transition-colors">
                            RAUL
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link key={link.label} to={getLink(link.path)}
                                className="text-label-lg text-on-surface-variant font-medium hover:text-gold-hover transition-colors duration-200 uppercase tracking-wider">
                                {link.label}
                            </Link>
                        ))}

                        {/* Genres Dropdown */}
                        <div ref={genreRef} className="relative"
                            onMouseEnter={() => setShowGenreDropdown(true)}
                            onMouseLeave={() => setShowGenreDropdown(false)}>
                            <button className="flex items-center gap-1.5 text-label-lg text-on-surface-variant font-medium hover:text-gold-hover transition-colors duration-200 uppercase tracking-wider">
                                Genres
                                <span className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${showGenreDropdown ? 'rotate-180' : ''}`}>
                                    keyboard_arrow_down
                                </span>
                            </button>

                            {showGenreDropdown && (
                                <div className="absolute top-full left-0 mt-0 pt-2 w-[540px] z-50">
                                    <div className="bg-surface-card border border-border-color rounded-xl p-6 shadow-2xl grid grid-cols-3 gap-3">
                                        {(() => {
                                            const cols = [[], [], []];
                                            genres.forEach((g, i) => cols[i % 3].push(g));
                                            return cols.map((column, colIndex) => (
                                                <div key={colIndex} className="flex flex-col gap-1.5">
                                                    {column.map((genre) => (
                                                        <Link key={genre.id} to={getLink(`/genre/${genre.id}`)}
                                                            className="text-body-sm text-text-secondary hover:text-primary transition-colors hover:translate-x-1 duration-150 py-1 px-2 rounded hover:bg-surface/50"
                                                            onClick={() => setShowGenreDropdown(false)}>
                                                            {genre.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>

                {/* Right: Search + Toggle + Auth */}
                <div className="hidden lg:flex items-center gap-6">
                    {/* ── Shadcn-style InputGroup Search ── */}
                    <form onSubmit={handleSearch}
                        className="group flex items-center w-64 bg-surface border border-border-color rounded-full overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
                        <span className="material-symbols-outlined text-text-muted pl-3.5 text-[18px] group-focus-within:text-primary transition-colors">
                            search
                        </span>
                        <input
                            type="search"
                            placeholder="Search films..."
                            className="flex-1 bg-transparent border-none outline-none py-2.5 pr-4 text-body-sm text-text-primary placeholder:text-text-muted"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </form>



                    {/* Auth */}
                    {user ? (
                        <div ref={userRef} className="relative">
                            <button onClick={() => setShowUserDropdown(!showUserDropdown)}
                                className="flex items-center gap-2 text-text-primary hover:text-primary font-medium transition-colors focus:outline-none">
                                <span className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-sm">
                                    {(user.displayName || user.username || "U").charAt(0).toUpperCase()}
                                </span>
                                <span className="text-label-lg max-w-[100px] truncate">{user.displayName || user.username}</span>
                                <span className="material-symbols-outlined text-[18px]">arrow_drop_down</span>
                            </button>

                            {showUserDropdown && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-surface-card border border-border-color rounded-xl py-2 shadow-2xl z-50">
                                    {user.role === 'admin' && (
                                        <>
                                            <Link to="/admin" className="block px-4 py-2 text-body-sm text-primary font-bold hover:bg-surface transition-colors"
                                                onClick={() => setShowUserDropdown(false)}>Dashboard Admin</Link>
                                            <div className="border-b border-border-color my-1"></div>
                                        </>
                                    )}
                                    <Link to="/profile" className="block px-4 py-2 text-body-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                                        onClick={() => setShowUserDropdown(false)}>Profil</Link>
                                    <Link to="/watchlist" className="block px-4 py-2 text-body-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                                        onClick={() => setShowUserDropdown(false)}>Watchlist</Link>
                                    <Link to="/my-reviews" className="block px-4 py-2 text-body-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                                        onClick={() => setShowUserDropdown(false)}>Review Saya</Link>
                                    <div className="border-b border-border-color my-1"></div>
                                    <button onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-body-sm text-red-400 hover:text-red-300 hover:bg-surface transition-colors">
                                        Keluar
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/signin" state={{ from: location.pathname }}
                                className="text-label-lg text-on-surface-variant hover:text-text-primary transition-colors font-medium">
                                Sign In
                            </Link>
                            <Link to="/signup"
                                className="bg-primary text-on-primary text-label-lg font-bold px-6 py-2.5 rounded-full hover:bg-gold-hover active:scale-95 transition-all">
                                Join Now
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile menu button */}
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-text-primary focus:outline-none">
                    <span className="material-symbols-outlined text-[28px]">{mobileMenuOpen ? 'close' : 'menu'}</span>
                </button>
            </div>

            {/* Mobile Drawer */}
            {mobileMenuOpen && (
                <div className="lg:hidden absolute top-20 left-0 w-full bg-surface border-b border-border-color p-6 flex flex-col gap-6 z-40 max-h-[85vh] overflow-y-auto">
                    {/* Mobile search — shadcn input-group style */}
                    <form onSubmit={handleSearch}
                        className="group flex items-center w-full bg-surface-container border border-border-color rounded-full overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
                        <span className="material-symbols-outlined text-text-muted pl-4 text-[20px] group-focus-within:text-primary transition-colors">search</span>
                        <input type="search" placeholder="Search films..."
                            className="flex-1 bg-transparent border-none outline-none py-3 pr-4 text-body-sm text-text-primary placeholder:text-text-muted"
                            value={input} onChange={(e) => setInput(e.target.value)} />
                    </form>

                    <div className="flex flex-col gap-4">
                        <span className="text-label-md text-text-muted uppercase tracking-wider">Menu</span>
                        {navLinks.map((link) => (
                            <Link key={link.label} to={getLink(link.path)} className="text-body-md text-text-primary hover:text-primary"
                                onClick={() => setMobileMenuOpen(false)}>{link.label}</Link>
                        ))}

                    </div>

                    <div className="flex flex-col gap-4 border-t border-border-color pt-6">
                        {user ? (
                            <>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-lg">
                                        {(user.displayName || user.username || "U").charAt(0).toUpperCase()}
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-text-primary">{user.displayName || user.username}</span>
                                        <span className="text-xs text-text-muted">{user.role}</span>
                                    </div>
                                </div>
                                {user.role === 'admin' && (
                                    <Link to="/admin" className="text-body-md text-primary font-bold" onClick={() => setMobileMenuOpen(false)}>Dashboard Admin</Link>
                                )}
                                <Link to="/profile" className="text-body-md text-text-secondary" onClick={() => setMobileMenuOpen(false)}>Profil</Link>
                                <Link to="/watchlist" className="text-body-md text-text-secondary" onClick={() => setMobileMenuOpen(false)}>Watchlist</Link>
                                <Link to="/my-reviews" className="text-body-md text-text-secondary" onClick={() => setMobileMenuOpen(false)}>Review Saya</Link>
                                <button onClick={handleLogout} className="text-left text-body-md text-red-400 font-semibold">Keluar</button>
                            </>
                        ) : (
                            <div className="flex gap-4">
                                <Link to="/signin" state={{ from: location.pathname }} className="flex-1 py-3 text-center border border-border-color text-text-primary rounded-lg font-semibold"
                                    onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                                <Link to="/signup" className="flex-1 py-3 text-center bg-primary text-on-primary rounded-lg font-semibold hover:bg-gold-hover"
                                    onClick={() => setMobileMenuOpen(false)}>Join Now</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
