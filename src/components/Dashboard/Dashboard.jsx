import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCurrentWeather } from '../../store/slices/weatherSlice';
import WeatherCard from '../WeatherCard/WeatherCard';
import SearchBar from '../SearchBar/SearchBar';
import './Dashboard.css';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const favorites = useSelector((state) => state.favorites.cities);
  const currentWeather = useSelector((state) => state.weather.currentWeather);
  const unit = useSelector((state) => state.settings.unit);
  const lastUpdated = useSelector((state) => state.weather.lastUpdated);

  useEffect(() => {
    // Fetch weather for all favorite cities
    if (favorites.length > 0) {
      favorites.forEach((city) => {
        const lastUpdate = lastUpdated[city.name];
        const shouldUpdate = !lastUpdate || Date.now() - lastUpdate > 60000;

        if (shouldUpdate) {
          dispatch(fetchCurrentWeather({ city: city.name, unit }));
        }
      });
    }
  }, [favorites, unit, dispatch]);

  // Set up auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (favorites.length > 0) {
        favorites.forEach((city) => {
          dispatch(fetchCurrentWeather({ city: city.name, unit }));
        });
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [favorites, unit, dispatch]);

  const handleCardClick = (cityName) => {
    navigate(`/city/${cityName}`);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Weather Dashboard</h1>
        <SearchBar />
      </div>

      <div className="dashboard-content">
        {favorites.length === 0 ? (
          <div className="empty-state">
            <h2>No favorite cities yet</h2>
            <p>Search for a city above and add it to your favorites</p>
          </div>
        ) : (
          <div className="weather-grid">
            {favorites.map((city) => {
              const weather = currentWeather[city.name];
              return (
                <WeatherCard
                  key={city.name}
                  city={city}
                  weather={weather}
                  unit={unit}
                  onClick={() => handleCardClick(city.name)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
