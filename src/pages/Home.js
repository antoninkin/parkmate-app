import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MapLayout from '../component/MapLayout';
import SearchCarPark from '../component/SearchCarPark';
import debounce from 'lodash/debounce';

const Home = () => {
    const [searchLocation, setSearchLocation] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkGoogleMapsLoaded = () => {
            if (window.google && window.google.maps) {
                setIsGoogleMapsLoaded(true);
            } else {
                setTimeout(checkGoogleMapsLoaded, 100);
            }
        };
        checkGoogleMapsLoaded();
    }, []);

    const handleSearch = useCallback((query, location) => {
        setSearchQuery(query);
        if (location) {
            setSearchLocation(location);
            console.log("Searching for:", query, location);
        } else {
            console.log("Partial search for:", query);
        }
    }, []);

    const debouncedHandleSearch = useMemo(
        () => debounce(handleSearch, 300),
        [handleSearch]
    );

    useEffect(() => {
        return () => {
            debouncedHandleSearch.cancel();
        };
    }, [debouncedHandleSearch]);

    const handleBooking = (locationData) => {
        navigate('/book-online', { state: locationData });
    };

    return (
        <div className="home-page">
            <div className="container">
                <SearchCarPark onSearch={debouncedHandleSearch} />
                {isGoogleMapsLoaded ? (
                    <MapLayout
                        searchQuery={searchQuery}
                        searchLocation={searchLocation}
                        onBooking={handleBooking}
                    />
                ) : (
                    <div>Loading Google Maps...</div>
                )}
            </div>
        </div>
    );
}

export default Home;