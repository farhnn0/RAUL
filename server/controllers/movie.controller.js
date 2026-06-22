import axios from 'axios';
import { db } from '../configs/db.js';

const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY;

const reviewsCollection = db.collection('reviews');
const usersCollection = db.collection('users'); // [TAMBAHAN 1] Definisi collection users

// Parameter standard untuk TMDB requests
const tmdbParams = (params = {}) => {
    return {
        params: {
            api_key: API_KEY,
            language: 'id-ID', // Default bahasa Indonesia
            include_adult: false,
            ...params 
        }
    };
};

// Helper: Reset rating TMDB jadi 0
const resetRatings = (movies = []) => {
    return movies.map(movie => ({
        ...movie,
        vote_average: 0,
        vote_count: 0
    }));
};

// Helper: Cek apakah string mengandung karakter asing (Non-Latin)
const isForeign = (str) => /[^\u0000-\u007F]/.test(str);

// 1. Mengambil Film Populer
export const getPopularMovies = async (req, res, next) => {
    try {
        const page = req.query.page || 1; 
        // Pakai en-US agar daftar film aman dari judul asing
        const response = await axios.get(`${BASE_URL}/movie/popular`, tmdbParams({ page, language: 'en-US' }));
        
        const modifiedResults = resetRatings(response.data.results);

        res.status(200).json({
            ...response.data,
            results: modifiedResults
        });
    } catch (error) {
        next({ status: error.response?.status || 500, message: 'Gagal mengambil data dari TMDB' });
    }
};

// 2. Mengambil Detail Film (DENGAN WATCHLIST COUNT & RATING)
export const getMovieDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const tmdbId = Number(id);

        // A. Ambil data Default (Bahasa Indonesia)
        const response = await axios.get(
            `${BASE_URL}/movie/${id}`, 
            tmdbParams({ append_to_response: 'credits,videos' })
        );

        let movieData = response.data;

        // B. DETEKSI ANOMALI DATA
        const hasForeignTitle = isForeign(movieData.title);
        const isOverviewEmpty = !movieData.overview || movieData.overview.trim() === "";
        
        // Cek 5 pemain utama saja
        const topCast = movieData.credits?.cast?.slice(0, 5) || [];
        const hasForeignCast = topCast.some(actor => isForeign(actor.name));

        // Jika salah satu masalah terdeteksi, AMBIL DATA INGGRIS
        if (hasForeignTitle || isOverviewEmpty || hasForeignCast) {
            try {
                const englishResponse = await axios.get(`${BASE_URL}/movie/${id}`, {
                    params: { 
                        api_key: API_KEY, 
                        language: 'en-US', // Paksa Inggris
                        append_to_response: 'credits,videos' 
                    }
                });
                
                const engData = englishResponse.data;

                // FIX 1: Perbaiki Judul & Poster
                if (hasForeignTitle) {
                    movieData.title = engData.title;
                    movieData.original_title = engData.original_title;
                    if (engData.poster_path) movieData.poster_path = engData.poster_path;
                    if (engData.backdrop_path) movieData.backdrop_path = engData.backdrop_path;
                }

                // FIX 2: Isi Overview
                if (isOverviewEmpty) {
                    movieData.overview = engData.overview;
                    if (!movieData.tagline) movieData.tagline = engData.tagline;
                }

                // FIX 3: Timpa Credits
                if (engData.credits) {
                    movieData.credits = engData.credits;
                }

            } catch (err) {
                console.log("Gagal mengambil data fallback bahasa Inggris", err.message);
            }
        }

        // C. LOGIKA RATING SENDIRI
        const ratingStats = await reviewsCollection.aggregate([
            { $match: { tmdbMovieId: tmdbId } },
            { 
                $group: { 
                    _id: "$tmdbMovieId", 
                    averageRating: { $avg: "$rating" },
                    totalVotes: { $sum: 1 }
                } 
            }
        ]).toArray();

        if (ratingStats.length > 0) {
            movieData.vote_average = ratingStats[0].averageRating;
            movieData.vote_count = ratingStats[0].totalVotes;
        } else {
            movieData.vote_average = 0;
            movieData.vote_count = 0;
        }

        // D. [TAMBAHAN 2] HITUNG WATCHLIST COUNT
        // Mencari berapa banyak dokumen user yang array 'watchlist'-nya mengandung tmdbId ini
        const watchlistCount = await usersCollection.countDocuments({
            watchlist: tmdbId
        });
        
        // Masukkan hasilnya ke object movieData untuk dikirim ke frontend
        movieData.watchlistCount = watchlistCount;
        
        res.status(200).json(movieData);
    } catch (error) {
        next({ status: error.response?.status || 500, message: 'Gagal mengambil data film' });
    }
};

// 3. Discover Movies 
export const discoverMovies = async (req, res, next) => {
    try {
        const { page, genre, year, isAdult } = req.query;
        const showAdultContent = isAdult === 'true';

        let filterParams = { 
            page: page || 1,
            sort_by: 'popularity.desc',
            include_adult: false, 
            language: 'en-US' 
        };
        
        if (genre) filterParams.with_genres = genre;
        if (year) filterParams.primary_release_year = year; 

        if (!showAdultContent) {
            filterParams.certification_country = 'US';
            filterParams['certification.lte'] = 'PG-13'; 
            const forbiddenGenres = "27,80,53,10749";
            if (!genre || !forbiddenGenres.includes(genre)) {
                filterParams.without_genres = forbiddenGenres;
            }
        }

        const response = await axios.get(`${BASE_URL}/discover/movie`, tmdbParams(filterParams));
        const modifiedResults = resetRatings(response.data.results);

        res.status(200).json({ ...response.data, results: modifiedResults });

    } catch (error) {
        next({ status: error.response?.status || 500, message: 'Gagal mengambil data dari TMDB' });
    }
};

// 4. Search Movies
export const searchMovies = async (req, res, next) => {
    try {
        const { query, page, isAdult } = req.query;
        if (!query) return next({ status: 400, message: 'Query pencarian diperlukan' });

        const sanitizedQuery = query.replace(/[<>]/g, '');
        const currentPage = page || 1;
        const showAdultContent = isAdult === 'true';

        // Langkah 1: Cari Film
        const moviesByTitlePromise = axios.get(`${BASE_URL}/search/movie`, tmdbParams({ 
            query: sanitizedQuery, page: currentPage, include_adult: showAdultContent, language: 'en-US' 
        }));

        // Langkah 2: Cari Orang
        const personSearchPromise = axios.get(`${BASE_URL}/search/person`, {
            params: { api_key: API_KEY, query: sanitizedQuery, include_adult: showAdultContent, language: 'en-US' }
        });

        const [titleRes, personRes] = await Promise.all([moviesByTitlePromise, personSearchPromise]);

        let moviesByActor = [];
        let foundActorName = null;

        // Filter Hasil Search Manual
        let moviesResults = titleRes.data.results;
        if (!showAdultContent) {
            moviesResults = moviesResults.filter(movie => {
                const forbiddenGenres = [27, 80, 53, 10749, 14]; 
                const hasForbiddenGenre = movie.genre_ids.some(id => forbiddenGenres.includes(id));
                return !hasForbiddenGenre;
            });
        }

        if (personRes.data.results.length > 0) {
            const actor = personRes.data.results[0];
            foundActorName = actor.name;

            let actorFilterParams = {
                with_cast: actor.id,
                page: currentPage,
                sort_by: 'popularity.desc',
                include_adult: false,
                language: 'en-US'
            };

            if (!showAdultContent) {
                actorFilterParams.certification_country = 'US';
                actorFilterParams['certification.lte'] = 'PG-13';
                actorFilterParams.without_genres = "27,80,53,10749"; 
            }

            const moviesByActorRes = await axios.get(`${BASE_URL}/discover/movie`, tmdbParams(actorFilterParams));
            moviesByActor = moviesByActorRes.data.results;
        }

        const finalResultsByTitle = resetRatings(moviesResults);
        const finalResultsByActor = resetRatings(moviesByActor);

        res.status(200).json({
            page: parseInt(currentPage),
            total_pages: titleRes.data.total_pages,
            resultsByTitle: finalResultsByTitle, 
            resultsByActor: finalResultsByActor, 
            actorName: foundActorName 
        });

    } catch (error) {
        console.error("Search Error:", error);
        next({ status: error.response?.status || 500, message: 'Gagal mencari film' });
    }
};

// 5. Get Genres
export const getGenres = async (req, res, next) => {
    try {
        const response = await axios.get(`${BASE_URL}/genre/movie/list`, tmdbParams());
        res.status(200).json(response.data.genres); 
    } catch (error) {
        next({ status: error.response?.status || 500, message: 'Gagal mengambil data dari TMDB' });
    }
};

// 6. Mengambil Film Serupa (Similar Movies)
export const getSimilarMovies = async (req, res, next) => {
    try {
        const { id } = req.params;
        const response = await axios.get(
            `${BASE_URL}/movie/${id}/similar`,
            tmdbParams({ language: 'en-US' })
        );
        const modifiedResults = resetRatings(response.data.results);
        res.status(200).json(modifiedResults);
    } catch (error) {
        next({ status: error.response?.status || 500, message: 'Gagal mengambil data film serupa' });
    }
};