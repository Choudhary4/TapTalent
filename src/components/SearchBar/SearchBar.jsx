import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, X } from 'lucide-react';
import { searchCities, clearSearchResults } from '../../store/slices/weatherSlice';
import { toggleFavorite } from '../../store/slices/favoritesSlice';
import './SearchBar.css';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const dispatch = useDispatch();
  const searchResults = useSelector((state) => state.weather.searchResults);
  const favorites = useSelector((state) => state.favorites.cities);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.length >= 2) {
        dispatch(searchCities(query));
        setShowResults(true);
      } else {
        dispatch(clearSearchResults());
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, dispatch]);

  const handleCitySelect = (city) => {
    const cityData = {
      name: city.name,
      country: city.country,
      lat: city.lat,
      lon: city.lon,
    };
    dispatch(toggleFavorite(cityData));
    setQuery('');
    setShowResults(false);
    dispatch(clearSearchResults());
  };

  const handleClear = () => {
    setQuery('');
    setShowResults(false);
    dispatch(clearSearchResults());
  };

  const isCityFavorite = (cityName) => {
    return favorites.some((fav) => fav.name === cityName);
  };

  return (
    <div className="search-bar-container">
      <div className="search-bar">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          placeholder="Search for a city..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowResults(true)}
        />
        {query && (
          <button className="clear-btn" onClick={handleClear}>
            <X size={20} />
          </button>
        )}
      </div>

      {showResults && searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((city, index) => (
            <div
              key={`${city.name}-${city.country}-${index}`}
              className="search-result-item"
              onClick={() => handleCitySelect(city)}
            >
              <div className="city-info">
                <span className="city-name">{city.name}</span>
                <span className="city-details">
                  {city.state && `${city.state}, `}
                  {city.country}
                </span>
              </div>
              {isCityFavorite(city.name) && (
                <span className="favorite-badge">Favorited</span>
              )}
            </div>
          ))}
        </div>
      )}

      {showResults && query.length >= 2 && searchResults.length === 0 && (
        <div className="search-results">
          <div className="no-results">No cities found</div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
