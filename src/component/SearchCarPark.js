import React, { useState, useEffect, useRef, useCallback } from 'react';
import './SearchCarPark.css';

const SearchCarPark = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);

  const handlePlaceSelect = useCallback(() => {
    const place = autocompleteRef.current.getPlace();
    if (place.geometry && place.geometry.location) {
      setSearchQuery(place.name);
      onSearch(place.name, place.geometry.location.toJSON());
    }
  }, [onSearch]);

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = () => {
    if (autocompleteRef.current) {
      autocompleteRef.current.set('types', ['geocode']);
      const place = autocompleteRef.current.getPlace();
      if (place && place.geometry && place.geometry.location) {
        onSearch(place.name, place.geometry.location.toJSON());
      } else {
        // If no place is selected, search with the current input value
        onSearch(searchQuery);
      }
    } else {
      // If autocomplete is not initialized, just search with the query
      onSearch(searchQuery);
    }
  };

  useEffect(() => {
    if (window.google && window.google.maps && inputRef.current) {
      const sydneyBounds = {
        north: -33.4,
        south: -34.2,
        west: 150.5,
        east: 151.5,
      };

      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        bounds: new window.google.maps.LatLngBounds(
          new window.google.maps.LatLng(sydneyBounds.south, sydneyBounds.west),
          new window.google.maps.LatLng(sydneyBounds.north, sydneyBounds.east)
        ),
        componentRestrictions: { country: 'au' },
        fields: ['geometry', 'name'],
        strictBounds: false,
        types: []  // This will disable suggestions
      });

      autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
    }
  }, [handlePlaceSelect]);

  return (
    <div className="search-container">
      <h2>Where do you need to go?</h2>
      <div className="search-carpark">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search location in Sydney"
          value={searchQuery}
          onChange={handleInputChange}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
    </div>
  );
};

export default SearchCarPark;