import axios from 'axios';

// Using WeatherAPI.com - Free tier with excellent features
// Your API Key: b5b2bbc2833d4f9fb8d164526250111
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || 'b5b2bbc2833d4f9fb8d164526250111';
const BASE_URL = 'https://api.weatherapi.com/v1';

console.log('Using WeatherAPI.com');
console.log('API Key loaded:', API_KEY ? 'Yes (length: ' + API_KEY.length + ')' : 'No - MISSING!');

// Cache configuration
const CACHE_DURATION = 60000; // 60 seconds
const cache = new Map();

const getCacheKey = (endpoint, params) => {
  return `${endpoint}-${JSON.stringify(params)}`;
};

const isCacheValid = (timestamp) => {
  return Date.now() - timestamp < CACHE_DURATION;
};

const getFromCache = (key) => {
  const cached = cache.get(key);
  if (cached && isCacheValid(cached.timestamp)) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCache = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

// Map WeatherAPI condition codes to OpenWeatherMap-style icons
const getWeatherIcon = (code, isDay) => {
  const iconMap = {
    1000: isDay ? '01d' : '01n', // Clear
    1003: isDay ? '02d' : '02n', // Partly cloudy
    1006: isDay ? '03d' : '03n', // Cloudy
    1009: '04d', // Overcast
    1030: '50d', // Mist
    1063: '09d', // Patchy rain possible
    1066: '13d', // Patchy snow possible
    1069: '13d', // Patchy sleet possible
    1072: '09d', // Patchy freezing drizzle
    1087: '11d', // Thundery outbreaks
    1114: '13d', // Blowing snow
    1117: '13d', // Blizzard
    1135: '50d', // Fog
    1147: '50d', // Freezing fog
    1150: '09d', // Patchy light drizzle
    1153: '09d', // Light drizzle
    1168: '09d', // Freezing drizzle
    1171: '09d', // Heavy freezing drizzle
    1180: '09d', // Patchy light rain
    1183: '09d', // Light rain
    1186: '10d', // Moderate rain
    1189: '10d', // Moderate rain
    1192: '10d', // Heavy rain
    1195: '10d', // Heavy rain
    1198: '09d', // Light freezing rain
    1201: '09d', // Moderate or heavy freezing rain
    1204: '13d', // Light sleet
    1207: '13d', // Moderate or heavy sleet
    1210: '13d', // Patchy light snow
    1213: '13d', // Light snow
    1216: '13d', // Patchy moderate snow
    1219: '13d', // Moderate snow
    1222: '13d', // Patchy heavy snow
    1225: '13d', // Heavy snow
    1237: '13d', // Ice pellets
    1240: '09d', // Light rain shower
    1243: '10d', // Moderate or heavy rain shower
    1246: '10d', // Torrential rain shower
    1249: '13d', // Light sleet showers
    1252: '13d', // Moderate or heavy sleet showers
    1255: '13d', // Light snow showers
    1258: '13d', // Moderate or heavy snow showers
    1261: '13d', // Light showers of ice pellets
    1264: '13d', // Moderate or heavy showers of ice pellets
    1273: '11d', // Patchy light rain with thunder
    1276: '11d', // Moderate or heavy rain with thunder
    1279: '11d', // Patchy light snow with thunder
    1282: '11d', // Moderate or heavy snow with thunder
  };
  return iconMap[code] || (isDay ? '01d' : '01n');
};

// Transform WeatherAPI.com data to match our UI expectations
const transformCurrentWeather = (data, unit = 'metric') => {
  const isCelsius = unit === 'metric';

  return {
    name: data.location.name,
    sys: {
      country: data.location.country,
      sunrise: data.forecast?.forecastday[0]?.astro?.sunrise
        ? parseSunTime(data.forecast.forecastday[0].astro.sunrise)
        : Date.now() / 1000,
      sunset: data.forecast?.forecastday[0]?.astro?.sunset
        ? parseSunTime(data.forecast.forecastday[0].astro.sunset)
        : Date.now() / 1000,
    },
    coord: {
      lat: data.location.lat,
      lon: data.location.lon,
    },
    main: {
      temp: isCelsius ? data.current.temp_c : data.current.temp_f,
      feels_like: isCelsius ? data.current.feelslike_c : data.current.feelslike_f,
      temp_min: isCelsius
        ? (data.forecast?.forecastday[0]?.day?.mintemp_c || data.current.temp_c - 2)
        : (data.forecast?.forecastday[0]?.day?.mintemp_f || data.current.temp_f - 4),
      temp_max: isCelsius
        ? (data.forecast?.forecastday[0]?.day?.maxtemp_c || data.current.temp_c + 2)
        : (data.forecast?.forecastday[0]?.day?.maxtemp_f || data.current.temp_f + 4),
      pressure: data.current.pressure_mb,
      humidity: data.current.humidity,
    },
    weather: [
      {
        id: data.current.condition.code,
        main: data.current.condition.text,
        description: data.current.condition.text.toLowerCase(),
        icon: getWeatherIcon(data.current.condition.code, data.current.is_day),
      },
    ],
    wind: {
      speed: isCelsius ? data.current.wind_kph / 3.6 : data.current.wind_mph,
      deg: data.current.wind_degree,
      gust: isCelsius ? data.current.gust_kph / 3.6 : data.current.gust_mph,
    },
    visibility: data.current.vis_km * 1000, // Convert to meters
    clouds: {
      all: data.current.cloud,
    },
    // Additional detailed weather data
    details: {
      uv: data.current.uv,
      dewpoint_c: data.current.dewpoint_c,
      dewpoint_f: data.current.dewpoint_f,
      precip_mm: data.current.precip_mm,
      precip_in: data.current.precip_in,
      windchill_c: data.current.windchill_c,
      windchill_f: data.current.windchill_f,
      heatindex_c: data.current.heatindex_c,
      heatindex_f: data.current.heatindex_f,
    },
  };
};

// Parse sun time from WeatherAPI format (e.g., "06:30 AM")
const parseSunTime = (timeStr) => {
  try {
    const today = new Date().toDateString();
    return new Date(`${today} ${timeStr}`).getTime() / 1000;
  } catch {
    return Date.now() / 1000;
  }
};

const transformForecast = (data, unit = 'metric') => {
  const forecastList = [];
  const isCelsius = unit === 'metric';

  // Get hourly data for multiple days
  data.forecast.forecastday.forEach((day) => {
    day.hour.forEach((hour) => {
      forecastList.push({
        dt: hour.time_epoch,
        main: {
          temp: isCelsius ? hour.temp_c : hour.temp_f,
          feels_like: isCelsius ? hour.feelslike_c : hour.feelslike_f,
          temp_min: isCelsius ? hour.temp_c - 1 : hour.temp_f - 2,
          temp_max: isCelsius ? hour.temp_c + 1 : hour.temp_f + 2,
          pressure: hour.pressure_mb,
          humidity: hour.humidity,
        },
        weather: [
          {
            id: hour.condition.code,
            main: hour.condition.text,
            description: hour.condition.text.toLowerCase(),
            icon: getWeatherIcon(hour.condition.code, hour.is_day),
          },
        ],
        wind: {
          speed: isCelsius ? hour.wind_kph / 3.6 : hour.wind_mph,
          deg: hour.wind_degree,
          gust: isCelsius ? hour.gust_kph / 3.6 : hour.gust_mph,
        },
        clouds: {
          all: hour.cloud,
        },
        // Additional hourly details
        details: {
          uv: hour.uv,
          dewpoint_c: hour.dewpoint_c,
          dewpoint_f: hour.dewpoint_f,
          precip_mm: hour.precip_mm,
          precip_in: hour.precip_in,
          windchill_c: hour.windchill_c,
          windchill_f: hour.windchill_f,
          heatindex_c: hour.heatindex_c,
          heatindex_f: hour.heatindex_f,
          chance_of_rain: hour.chance_of_rain,
          chance_of_snow: hour.chance_of_snow,
          vis_km: hour.vis_km,
          vis_miles: hour.vis_miles,
        },
      });
    });
  });

  return {
    city: {
      name: data.location.name,
      country: data.location.country,
    },
    list: forecastList,
  };
};

export const weatherAPI = {
  async getCurrentWeather(city, unit = 'metric') {
    const cacheKey = getCacheKey('current', { city, unit });
    const cached = getFromCache(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get(`${BASE_URL}/forecast.json`, {
        params: {
          key: API_KEY,
          q: city,
          days: 1,
          aqi: 'no',
          alerts: 'no',
        },
      });

      const transformed = transformCurrentWeather(response.data, unit);
      setCache(cacheKey, transformed);
      return transformed;
    } catch (error) {
      throw new Error(error.response?.data?.error?.message || 'Failed to fetch weather data');
    }
  },

  async getForecast(city, unit = 'metric') {
    const cacheKey = getCacheKey('forecast', { city, unit });
    const cached = getFromCache(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get(`${BASE_URL}/forecast.json`, {
        params: {
          key: API_KEY,
          q: city,
          days: 7,
          aqi: 'no',
          alerts: 'no',
        },
      });

      const transformed = transformForecast(response.data, unit);
      setCache(cacheKey, transformed);
      return transformed;
    } catch (error) {
      throw new Error(error.response?.data?.error?.message || 'Failed to fetch forecast data');
    }
  },

  async searchCities(query) {
    if (!query || query.length < 2) {
      return [];
    }

    const cacheKey = getCacheKey('search', { query });
    const cached = getFromCache(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get(`${BASE_URL}/search.json`, {
        params: {
          key: API_KEY,
          q: query,
        },
      });

      // Transform to match expected format
      const results = response.data.map((city) => ({
        name: city.name,
        country: city.country,
        lat: city.lat,
        lon: city.lon,
        state: city.region,
      }));

      setCache(cacheKey, results);
      return results;
    } catch (error) {
      throw new Error(error.response?.data?.error?.message || 'Failed to search cities');
    }
  },

  clearCache() {
    cache.clear();
  },

  getCacheSize() {
    return cache.size;
  },
};
