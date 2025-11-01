import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, Wind, Droplets, Eye, Gauge } from 'lucide-react';
import { toggleFavorite } from '../../store/slices/favoritesSlice';
import './WeatherCard.css';

const WeatherCard = ({ city, weather, unit, onClick }) => {
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites.cities);
  const isFavorite = favorites.some((fav) => fav.name === city.name);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    dispatch(toggleFavorite(city));
  };

  if (!weather) {
    return (
      <div className="weather-card loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const tempUnit = unit === 'metric' ? '°C' : '°F';
  const speedUnit = unit === 'metric' ? 'm/s' : 'mph';

  return (
    <div className="weather-card" onClick={onClick}>
      <button
        className={`favorite-btn ${isFavorite ? 'active' : ''}`}
        onClick={handleFavoriteClick}
      >
        <Heart fill={isFavorite ? 'currentColor' : 'none'} />
      </button>

      <div className="weather-card-header">
        <div>
          <h2>{weather.name}</h2>
          <p className="country">{weather.sys?.country}</p>
        </div>
        <img
          src={getWeatherIcon(weather.weather[0].icon)}
          alt={weather.weather[0].description}
          className="weather-icon-large"
        />
      </div>

      <div className="temperature">
        <span className="temp-value">{Math.round(weather.main.temp)}</span>
        <span className="temp-unit">{tempUnit}</span>
      </div>

      <p className="weather-description">{weather.weather[0].description}</p>

      <div className="weather-details">
        <div className="detail-item">
          <Droplets size={18} />
          <span>{weather.main.humidity}%</span>
        </div>
        <div className="detail-item">
          <Wind size={18} />
          <span>{weather.wind.speed} {speedUnit}</span>
        </div>
        <div className="detail-item">
          <Eye size={18} />
          <span>{(weather.visibility / 1000).toFixed(1)} km</span>
        </div>
        <div className="detail-item">
          <Gauge size={18} />
          <span>{weather.main.pressure} hPa</span>
        </div>
      </div>

      <div className="temp-range">
        <span>H: {Math.round(weather.main.temp_max)}{tempUnit}</span>
        <span>L: {Math.round(weather.main.temp_min)}{tempUnit}</span>
      </div>
    </div>
  );
};

export default WeatherCard;
