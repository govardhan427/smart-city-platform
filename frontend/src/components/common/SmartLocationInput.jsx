/* src/components/common/SmartLocationInput.jsx */
import React, { useState, useEffect, useRef } from 'react';
import styles from './SmartLocationInput.module.css';

// Read the token from your .env file
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN; // Use process.env.REACT_APP_MAPBOX_TOKEN if using CRA

const SmartLocationInput = ({ onLocationSelect, defaultLocation = '' }) => {
  const [query, setQuery] = useState(defaultLocation);
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close dropdown if user clicks outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions from Mapbox Geocoding API
  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchLocations = async () => {
      try {
        // We use Mapbox's free Forward Geocoding API
        const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=5`;
        const response = await fetch(endpoint);
        const data = await response.json();
        setSuggestions(data.features || []);
      } catch (error) {
        console.error("Error fetching locations from Mapbox:", error);
      }
    };

    // Debounce the API call to save Mapbox API requests (waits 300ms after you stop typing)
    const timeoutId = setTimeout(fetchLocations, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (place) => {
    const placeName = place.place_name;
    // Mapbox returns coordinates as [longitude, latitude]
    const [lng, lat] = place.center; 

    setQuery(placeName);
    setIsOpen(false);

    // Send the data back up to the parent form!
    onLocationSelect({
      location: placeName,
      latitude: lat,
      longitude: lng
    });
  };

  return (
    <div className={styles.container} ref={wrapperRef}>
      <label className={styles.label}>Location Search</label>
      <input
        type="text"
        className={styles.input}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        placeholder="Start typing an address..."
        autoComplete="off"
      />

      {/* Floating Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <ul className={styles.dropdown}>
          {suggestions.map((place) => (
            <li 
              key={place.id} 
              className={styles.suggestionItem}
              onClick={() => handleSelect(place)}
            >
              <span className={styles.icon}>📍</span>
              {place.place_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SmartLocationInput;