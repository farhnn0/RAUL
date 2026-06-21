import api from './api';

// Mengambil film populer
export const fetchPopularMovies = async (page = 1, isAdult = false) => {
    try {
        const res = await api.get('/movies/popular', {
            params: { page, isAdult },
        });
        return res.data;
    } catch (error) {
        console.error("Gagal mengambil data populer:", error);
        throw error;
    }
};

// Mengambil detail satu film
export const fetchMovieDetail = async (id) => {
    try {
        const res = await api.get(`/movies/${id}`);
        return res.data;
    } catch (error) {
        console.error("Gagal mengambil detail film:", error);
        throw error;
    }
};

//Mengambil daftar semua genre
export const fetchGenres = async () => {
    try {
        const res = await api.get('/movies/genres');
        return res.data; // Mengembalikan array genre [{id, name}, ...]
    } catch (error) {
        console.error("Gagal mengambil daftar genre:", error);
        throw error;
    }
};

// Mencari film berdasarkan query (kata kunci)
export const searchMovies = async (query, page = 1, isAdult = false) => {
    try {
        const res = await api.get('/movies/search', {
            params: { query, page, isAdult }
        });
        return res.data;
    } catch (error) {
        console.error("Gagal mencari film:", error);
        throw error;
    }
};

// Discover film dengan filter (genre, tahun, dll)
export const discoverMovies = async (params) => {
    try {
        const res = await api.get('/movies/discover', {
            params: params 
        });
        return res.data;
    } catch (error) {
        console.error("Gagal melakukan discover film:", error);
        throw error;
    }
};