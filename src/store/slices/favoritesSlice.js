import { createSlice } from '@reduxjs/toolkit';

const loadFavoritesFromStorage = () => {
  try {
    const saved = localStorage.getItem('favorites');
    if (saved) {
      return JSON.parse(saved);
    }

    // Default cities to load on first visit
    const defaultCities = [
      { name: 'Bangalore', country: 'IN' },
      { name: 'Jaipur', country: 'IN' }
    ];

    // Save default cities to localStorage
    saveFavoritesToStorage(defaultCities);
    return defaultCities;
  } catch (error) {
    console.error('Error loading favorites:', error);
    return [
      { name: 'Bangalore', country: 'IN' },
      { name: 'Jaipur', country: 'IN' }
    ];
  }
};

const saveFavoritesToStorage = (favorites) => {
  try {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  } catch (error) {
    console.error('Error saving favorites:', error);
  }
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: {
    cities: loadFavoritesFromStorage(),
  },
  reducers: {
    addFavorite: (state, action) => {
      const city = action.payload;
      if (!state.cities.find(c => c.name === city.name)) {
        state.cities.push(city);
        saveFavoritesToStorage(state.cities);
      }
    },
    removeFavorite: (state, action) => {
      const cityName = action.payload;
      state.cities = state.cities.filter(c => c.name !== cityName);
      saveFavoritesToStorage(state.cities);
    },
    toggleFavorite: (state, action) => {
      const city = action.payload;
      const index = state.cities.findIndex(c => c.name === city.name);
      if (index !== -1) {
        state.cities.splice(index, 1);
      } else {
        state.cities.push(city);
      }
      saveFavoritesToStorage(state.cities);
    },
  },
});

export const { addFavorite, removeFavorite, toggleFavorite } = favoritesSlice.actions;
export default favoritesSlice.reducer;
