import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentUser: null,
  watchlist: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.currentUser = action.payload;
    },
    clearUser: (state) => {
      state.currentUser = null;
      state.watchlist = [];
    },
    setWatchlist: (state, action) => {
      state.watchlist = action.payload;
    },
    toggleWatchlistState: (state, action) => {
      const movieId = action.payload;
      if (state.watchlist.includes(movieId)) {
        state.watchlist = state.watchlist.filter(id => id !== movieId);
      } else {
        state.watchlist.push(movieId);
      }
    },
  },
});

export const { setUser, clearUser, setWatchlist, toggleWatchlistState } = userSlice.actions;
export default userSlice.reducer;