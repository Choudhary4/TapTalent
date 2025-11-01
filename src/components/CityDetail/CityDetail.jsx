import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentWeather, fetchForecast } from '../../store/slices/weatherSlice';
import { ArrowLeft, Wind, Droplets, Eye, Gauge, Sunrise, Sunset, Navigation, Sun, Thermometer, CloudRain } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './CityDetail.css';

const CityDetail = () => {
  const { cityName } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const currentWeather = useSelector((state) => state.weather.currentWeather[cityName]);
  const forecast = useSelector((state) => state.weather.forecasts[cityName]);
  const unit = useSelector((state) => state.settings.unit);
  const loading = useSelector((state) => state.weather.loading);

  useEffect(() => {
    dispatch(fetchCurrentWeather({ city: cityName, unit }));
    dispatch(fetchForecast({ city: cityName, unit }));

    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      dispatch(fetchCurrentWeather({ city: cityName, unit }));
      dispatch(fetchForecast({ city: cityName, unit }));
    }, 60000);

    return () => clearInterval(interval);
  }, [cityName, unit, dispatch]);

  if (loading && !currentWeather) {
    return (
      <div className="city-detail loading-container">
        <div className="loading-spinner"></div>
        <p>Loading weather data...</p>
      </div>
    );
  }

  if (!currentWeather || !forecast) {
    return <div className="city-detail">Loading...</div>;
  }

  const tempUnit = unit === 'metric' ? '°C' : '°F';
  const speedUnit = unit === 'metric' ? 'm/s' : 'mph';

  // Process hourly forecast data (next 24 hours)
  const hourlyData = forecast.list.slice(0, 24).map((item) => ({
    time: new Date(item.dt * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true,
    }),
    temp: Math.round(item.main.temp),
    feelsLike: Math.round(item.main.feels_like),
    humidity: item.main.humidity,
    wind: item.wind.speed,
    precipitation: item.details?.precip_mm || 0,
    uv: item.details?.uv || 0,
  }));

  // Process daily forecast data (5-7 days)
  const dailyData = [];
  const dailyMap = new Map();

  forecast.list.forEach((item) => {
    const date = new Date(item.dt * 1000).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    if (!dailyMap.has(date)) {
      dailyMap.set(date, {
        date,
        maxTemp: item.main.temp_max,
        minTemp: item.main.temp_min,
        humidity: item.main.humidity,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
      });
    } else {
      const existing = dailyMap.get(date);
      existing.maxTemp = Math.max(existing.maxTemp, item.main.temp_max);
      existing.minTemp = Math.min(existing.minTemp, item.main.temp_min);
    }
  });

  dailyMap.forEach((value) => {
    dailyData.push({
      ...value,
      maxTemp: Math.round(value.maxTemp),
      minTemp: Math.round(value.minTemp),
    });
  });

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="city-detail">
      <button className="back-button" onClick={() => navigate('/')}>
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <div className="detail-header">
        <div className="header-content">
          <div>
            <h1>{currentWeather.name}</h1>
            <p className="location">
              {currentWeather.sys.country} • {currentWeather.coord.lat.toFixed(2)}°,{' '}
              {currentWeather.coord.lon.toFixed(2)}°
            </p>
          </div>
          <div className="current-temp-large">
            <img
              src={`https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@4x.png`}
              alt={currentWeather.weather[0].description}
            />
            <div>
              <span className="temp">{Math.round(currentWeather.main.temp)}{tempUnit}</span>
              <p className="description">{currentWeather.weather[0].description}</p>
              <p className="feels-like">
                Feels like {Math.round(currentWeather.main.feels_like)}{tempUnit}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <h3>Weather Details</h3>
          <div className="details-list">
            <div className="detail-row">
              <div className="detail-label">
                <Droplets size={20} />
                <span>Humidity</span>
              </div>
              <span className="detail-value">{currentWeather.main.humidity}%</span>
            </div>
            <div className="detail-row">
              <div className="detail-label">
                <Wind size={20} />
                <span>Wind Speed</span>
              </div>
              <span className="detail-value">
                {currentWeather.wind.speed} {speedUnit}
              </span>
            </div>
            <div className="detail-row">
              <div className="detail-label">
                <Navigation size={20} />
                <span>Wind Direction</span>
              </div>
              <span className="detail-value">{currentWeather.wind.deg}°</span>
            </div>
            <div className="detail-row">
              <div className="detail-label">
                <Gauge size={20} />
                <span>Pressure</span>
              </div>
              <span className="detail-value">{currentWeather.main.pressure} hPa</span>
            </div>
            <div className="detail-row">
              <div className="detail-label">
                <Eye size={20} />
                <span>Visibility</span>
              </div>
              <span className="detail-value">
                {(currentWeather.visibility / 1000).toFixed(1)} km
              </span>
            </div>
            <div className="detail-row">
              <div className="detail-label">
                <Sunrise size={20} />
                <span>Sunrise</span>
              </div>
              <span className="detail-value">{formatTime(currentWeather.sys.sunrise)}</span>
            </div>
            <div className="detail-row">
              <div className="detail-label">
                <Sunset size={20} />
                <span>Sunset</span>
              </div>
              <span className="detail-value">{formatTime(currentWeather.sys.sunset)}</span>
            </div>
            {currentWeather.details && (
              <>
                <div className="detail-row">
                  <div className="detail-label">
                    <Sun size={20} />
                    <span>UV Index</span>
                  </div>
                  <span className="detail-value">{currentWeather.details.uv}</span>
                </div>
                <div className="detail-row">
                  <div className="detail-label">
                    <Thermometer size={20} />
                    <span>Dew Point</span>
                  </div>
                  <span className="detail-value">
                    {Math.round(unit === 'metric' ? currentWeather.details.dewpoint_c : currentWeather.details.dewpoint_f)}{tempUnit}
                  </span>
                </div>
                <div className="detail-row">
                  <div className="detail-label">
                    <CloudRain size={20} />
                    <span>Precipitation</span>
                  </div>
                  <span className="detail-value">{currentWeather.details.precip_mm} mm</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="detail-card chart-card">
          <h3>Hourly Temperature Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="temp"
                stroke="#667eea"
                strokeWidth={2}
                name={`Temperature (${tempUnit})`}
              />
              <Line
                type="monotone"
                dataKey="feelsLike"
                stroke="#764ba2"
                strokeWidth={2}
                strokeDasharray="5 5"
                name={`Feels Like (${tempUnit})`}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="detail-card chart-card">
          <h3>Hourly Wind & Humidity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="wind"
                fill="#667eea"
                name={`Wind (${speedUnit})`}
              />
              <Bar yAxisId="right" dataKey="humidity" fill="#3498db" name="Humidity (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="detail-card chart-card">
          <h3>Precipitation & UV Index</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" label={{ value: 'Precipitation (mm)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'UV Index', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="precipitation"
                fill="#3498db"
                name="Precipitation (mm)"
              />
              <Bar yAxisId="right" dataKey="uv" fill="#f39c12" name="UV Index" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="detail-card">
          <h3>Hour-by-Hour Forecast (Next 24 Hours)</h3>
          <div className="hourly-forecast-grid">
            {hourlyData.slice(0, 12).map((hour, index) => (
              <div key={index} className="hourly-forecast-item">
                <div className="hourly-time">{hour.time}</div>
                <div className="hourly-temp">{hour.temp}{tempUnit}</div>
                <div className="hourly-feels">Feels {hour.feelsLike}{tempUnit}</div>
                <div className="hourly-stats">
                  <div><Droplets size={14} /> {hour.humidity}%</div>
                  <div><Wind size={14} /> {hour.wind.toFixed(1)} {speedUnit}</div>
                  {hour.precipitation > 0 && (
                    <div><CloudRain size={14} /> {hour.precipitation} mm</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="detail-card">
          <h3>7-Day Forecast</h3>
          <div className="daily-forecast">
            {dailyData.slice(0, 7).map((day, index) => (
              <div key={index} className="daily-item">
                <span className="day-name">{day.date}</span>
                <img
                  src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                  alt={day.description}
                  className="day-icon"
                />
                <div className="day-temps">
                  <span className="temp-high">{day.maxTemp}{tempUnit}</span>
                  <span className="temp-low">{day.minTemp}{tempUnit}</span>
                </div>
                <span className="day-description">{day.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CityDetail;
