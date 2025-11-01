import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { weatherAPI } from '../../services/weatherAPI';

export const fetchCurrentWeather = createAsyncThunk(
  'weather/fetchCurrent',
  async ({ city, unit = 'metric' }, { rejectWithValue }) => {
    try {
      const data = await weatherAPI.getCurrentWeather(city, unit);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchForecast = createAsyncThunk(
  'weather/fetchForecast',
  async ({ city, unit = 'metric' }, { rejectWithValue }) => {
    try {
      const data = await weatherAPI.getForecast(city, unit);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchCities = createAsyncThunk(
  'weather/searchCities',
  async (query, { rejectWithValue }) => {
    try {
      const data = await weatherAPI.searchCities(query);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const weatherSlice = createSlice({
  name: 'weather',
  initialState: {
    currentWeather: {},
    forecasts: {},
    searchResults: [],
    loading: false,
    error: null,
    lastUpdated: {},
  },
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Current Weather
      .addCase(fetchCurrentWeather.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentWeather.fulfilled, (state, action) => {
        state.loading = false;
        const cityName = action.payload.name;
        state.currentWeather[cityName] = action.payload;
        state.lastUpdated[cityName] = Date.now();
      })
      .addCase(fetchCurrentWeather.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Forecast
      .addCase(fetchForecast.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchForecast.fulfilled, (state, action) => {
        state.loading = false;
        const cityName = action.payload.city.name;
        state.forecasts[cityName] = action.payload;
      })
      .addCase(fetchForecast.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search Cities
      .addCase(searchCities.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchCities.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchCities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSearchResults, clearError } = weatherSlice.actions;
export default weatherSlice.reducer;
