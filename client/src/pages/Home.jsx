import React from "react";
import MovieGrid from "../component/grid/MovieGrid.jsx";
import "../styles/home.css";

export default function Home() {
    return (
        <div className="home-container">
            <MovieGrid />
        </div>
    );
}