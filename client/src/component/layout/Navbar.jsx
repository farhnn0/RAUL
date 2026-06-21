import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Dropdown, Form, InputGroup, Button } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import { useAuth } from '../../App';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import api from '../../api/api';
import logoWeb from '../../assets/logo/logoWeb.png';
import '../../styles/navbar.css';

const Header = () => {
    const [input, setInput] = useState("");
    const [genres, setGenres] = useState([]);
    const [showGenreDropdown, setShowGenreDropdown] = useState(false);
    const [showYearDropdown, setShowYearDropdown] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();
    const isAdultParam = searchParams.get('isAdult') === 'true';
    const [isAdult, setIsAdult] = useState(isAdultParam);

    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const currentYear = new Date().getFullYear();
    const years = Array.from(new Array(30), (val, index) => currentYear - index);

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

    const handleLogout = () => {
        setIsAdult(false);
        logout();
        navigate('/');
    };

    const toggleAdultFilter = () => {
        const newValue = !isAdult;
        setIsAdult(newValue);

        // Update URL agar halaman (MovieList/Search) mendeteksi perubahan dan refresh data
        const newParams = new URLSearchParams(searchParams);
        if (newValue) {
            newParams.set('isAdult', 'true');
        } else {
            newParams.delete('isAdult'); // Hapus param jika false agar URL bersih
        }
        
        // Tetap di halaman yang sama, cuma ubah query params
        setSearchParams(newParams);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (input.trim()) {
            // Sertakan status isAdult saat search
            navigate(`/search?query=${input.trim()}&isAdult=${isAdult}`);
            setInput("");
        }
    };

    const getLink = (path) => {
        return isAdult ? `${path}?isAdult=true` : path;
    };

    // Kelompokkan genre menjadi 3 kolom
    const genreColumns = [
        genres.slice(0, Math.ceil(genres.length / 3)),
        genres.slice(Math.ceil(genres.length / 3), Math.ceil(genres.length / 3) * 2),
        genres.slice(Math.ceil(genres.length / 3) * 2)
    ];

    const yearColumns = [
        years.slice(0, 10),
        years.slice(10, 20),
        years.slice(20)
    ];

    return (
        <Navbar expand="lg" className="navbar navbar-fixed">
            <Container fluid>
                <Navbar.Brand as={Link} to="/" className="navbar-brand">
                    <img src={logoWeb} alt="RAUL Logo" className="logo-icon" />
                    <span className="logo-brand">RAUL</span>
                </Navbar.Brand>

                {/* Dropdown Genre */}
                <div
                    className="dropdown-container d-none d-lg-block"
                    onMouseEnter={() => setShowGenreDropdown(true)}
                    onMouseLeave={() => setShowGenreDropdown(false)}
                >
                    <button className="kategori-btn">
                        <span>☰</span> Genre
                        <span className={`dropdown-icon ${showGenreDropdown ? 'active' : ''}`}>▼</span>
                    </button>

                    <div className={`mega-dropdown ${showGenreDropdown ? 'show' : ''}`}>
                        <div className="dropdown-grid">
                            {genreColumns.map((column, colIndex) => (
                                <div key={colIndex} className="dropdown-column">
                                    {column.map((genre) => (
                                        <Link
                                            key={genre.id}
                                            to={getLink(`/genre/${genre.id}`)}
                                            className="mega-dropdown-item"
                                            onClick={() => setShowGenreDropdown(false)}
                                        >
                                            {genre.name}
                                        </Link>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Dropdown Tahun */}
                <div
                    className="dropdown-container d-none d-lg-block"
                    onMouseEnter={() => setShowYearDropdown(true)}
                    onMouseLeave={() => setShowYearDropdown(false)}
                >
                    <button className="kategori-btn">
                        📅 Tahun
                        <span className={`dropdown-icon ${showYearDropdown ? 'active' : ''}`}>▼</span>
                    </button>

                    <div className={`mega-dropdown mega-dropdown-year ${showYearDropdown ? 'show' : ''}`}>
                        <div className="dropdown-grid">
                            {yearColumns.map((column, colIndex) => (
                                <div key={colIndex} className="dropdown-column">
                                    {column.map((year) => (
                                        <Link
                                            key={year}
                                            to={getLink(`/year/${year}`)}
                                            className="mega-dropdown-item"
                                            onClick={() => setShowYearDropdown(false)}
                                        >
                                            {year}
                                        </Link>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Search Bar & 18+ Toggle */}
                <div className="d-flex align-items-center ms-3 flex-grow-1 justify-content-end" style={{ maxWidth: '600px' }}>
                    <Form onSubmit={handleSearch} className="seach-bar-container w-100 me-2">
                        <InputGroup className="input-wrapper">
                            <InputGroup.Text className="bg-transparent border-0">
                                <FaSearch />
                            </InputGroup.Text>
                            <Form.Control
                                type="search"
                                placeholder="Cari film atau aktor..."
                                className="inputsearch border-0 bg-transparent"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                aria-label="Search"
                            />
                        </InputGroup>
                    </Form>

                    <div className="adult-toggle-wrapper">
                        <button
                            className={`adult-toggle-btn ${isAdult ? "active" : ""}`}
                            onClick={toggleAdultFilter}
                        >
                            {isAdult ? "18+" : "SU"}
                        </button>
                    </div>

                </div>

                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <div className="auth-buttons-container ms-auto">
                        {user ? (
                            <Dropdown align="end">
                                <Dropdown.Toggle
                                    variant="link"
                                    id="user-dropdown"
                                    className="btn login-btn user-dropdown-btn text-decoration-none"
                                >
                                    {user.displayName || user.username}
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="profile-dropdown-menu">
                                    {user.role === 'admin' && (
                                        <>
                                            <Dropdown.Item 
                                                as={Link} 
                                                to="/admin" 
                                                className="text-black fw-bold"
                                            >
                                                Dashboard Admin
                                            </Dropdown.Item>
                                            <Dropdown.Divider />
                                        </>
                                    )}
                                    <Dropdown.Item as={Link} to="/profile">Profil</Dropdown.Item>
                                    <Dropdown.Item as={Link} to="/watchlist">Watchlist</Dropdown.Item>
                                    <Dropdown.Item as={Link} to="/my-reviews">Review</Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        ) : (
                            <>
                                <Nav.Link
                                    as={Link}
                                    to="/signin"
                                    state={{ from: location.pathname }}
                                    className="btn login-btn btn-masuk"
                                >
                                    Masuk
                                </Nav.Link>
                                <Nav.Link
                                    as={Link}
                                    to="/signup"
                                    className="btn login-btn btn-daftar"
                                >
                                    Daftar
                                </Nav.Link>
                            </>
                        )}
                    </div>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;