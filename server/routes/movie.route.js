import express from 'express';
import { getPopularMovies, getMovieDetails, discoverMovies, getGenres, searchMovies, getSimilarMovies } from '../controllers/movie.controller.js';

const router = express.Router();

router.get('/popular', getPopularMovies); // Endpoint untuk film populer
router.get('/discover', discoverMovies); // Endpoint untuk discover dengan filter
router.get('/genres', getGenres);
router.get('/search', searchMovies);
router.get('/:id/similar', getSimilarMovies); // Endpoint untuk film serupa
router.get('/:id', getMovieDetails);     // Endpoint untuk detail film

export default router;