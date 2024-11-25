import React, { useEffect, useState, useRef, useCallback } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs, doc, onSnapshot } from 'firebase/firestore';

const MapLayout = ({ searchQuery, searchLocation, onBooking }) => {
    const [mapLoaded, setMapLoaded] = useState(false);
    const [parkingLocations, setParkingLocations] = useState([]);
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const currentInfoWindowRef = useRef(null);
    const googleRef = useRef(null);
    const searchMarkerRef = useRef(null);

    useEffect(() => {
        const loadGoogleMapsScript = () => {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = () => {
                console.log('Google Maps script loaded successfully');
                googleRef.current = window.google;
                setMapLoaded(true);
            };
            script.onerror = () => {
                console.error('Failed to load Google Maps script');
            };
            document.head.appendChild(script);
        };

        if (!window.google) {
            console.log('Google Maps not loaded, attempting to load script');
            loadGoogleMapsScript();
        } else {
            console.log('Google Maps already loaded');
            googleRef.current = window.google;
            setMapLoaded(true);
        }
    }, []);

    useEffect(() => {
        const fetchParkingLocations = async () => {
            try {
                const parkingLocationsCollection = collection(db, 'parkingLocations');
                const parkingLocationsSnapshot = await getDocs(parkingLocationsCollection);
                const locations = parkingLocationsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                console.log('Fetched parking locations:', locations);
                setParkingLocations(locations);
            } catch (error) {
                console.error("Error fetching parking locations:", error);
            }
        };

        fetchParkingLocations();
    }, []);

    const createInfoWindow = useCallback((location, marker, map) => {
        console.log('Creating info window for:', location.name);
        if (currentInfoWindowRef.current) {
            currentInfoWindowRef.current.close();
        }

        const infoWindow = new googleRef.current.maps.InfoWindow({
            content: `
                <div class="custom-info-window">
                    <h3>${location.name}</h3>
                    <p class="address">Address: ${location.address}</p>
                    <p class="available-spots">Available spots: <span id="spots-${location.id}">${location.availableSpots}</span></p>
                    <button id="book-now-${location.id}">Book Online</button>
                    <button id="get-directions-${location.id}">Get Directions</button>
                </div>
            `
        });

        infoWindow.open(map, marker);
        currentInfoWindowRef.current = infoWindow;

        const unsubscribe = onSnapshot(doc(db, 'parkingLocations', location.id), (doc) => {
            const updatedLocation = doc.data();
            const spotsElement = document.getElementById(`spots-${location.id}`);
            if (spotsElement) {
                spotsElement.textContent = updatedLocation.availableSpots;
            }
        });

        googleRef.current.maps.event.addListener(infoWindow, 'closeclick', () => {
            unsubscribe();
        });

        googleRef.current.maps.event.addListener(infoWindow, 'domready', () => {
            document.getElementById(`book-now-${location.id}`)?.addEventListener('click', () => {
                onBooking(location);
            });

            document.getElementById(`get-directions-${location.id}`)?.addEventListener('click', () => {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
                window.open(url, '_blank');
            });
        });
    }, [onBooking]);

    const initMap = useCallback(() => {
        console.log('Initializing map');
        if (!googleRef.current || !mapRef.current) {
            console.error('Google Maps or map container not available');
            return;
        }

        try {
            console.log('Creating map instance');
            mapInstanceRef.current = new googleRef.current.maps.Map(mapRef.current, {
                center: { lat: -33.8688, lng: 151.2093 },
                zoom: 13,
                fullscreenControl: false,
                mapTypeControl: false,
                streetViewControl: false,
            });
            console.log('Map instance created successfully');

            parkingLocations.forEach(location => {
                console.log('Adding marker for location:', location.name);
                const marker = new googleRef.current.maps.Marker({
                    position: { lat: location.latitude, lng: location.longitude },
                    map: mapInstanceRef.current,
                    title: location.name,
                    icon: {
                        url: 'favicon.svg',
                        scaledSize: new googleRef.current.maps.Size(25, 25),
                    }
                });

                markersRef.current.push(marker);

                marker.addListener("click", () => createInfoWindow(location, marker, mapInstanceRef.current));
            });
        } catch (error) {
            console.error("Error initializing map:", error);
        }
    }, [parkingLocations, createInfoWindow]);

    useEffect(() => {
        if (mapLoaded && parkingLocations.length > 0) {
            console.log('Map loaded and parking locations available, initializing map');
            initMap();
        }
    }, [mapLoaded, parkingLocations, initMap]);

    useEffect(() => {
        if (mapLoaded && googleRef.current && mapInstanceRef.current && searchLocation) {
            console.log('Updating map for search location:', searchLocation);
            mapInstanceRef.current.setCenter(searchLocation);
            mapInstanceRef.current.setZoom(15);

            if (searchMarkerRef.current) {
                searchMarkerRef.current.setMap(null);
            }

            searchMarkerRef.current = new googleRef.current.maps.Marker({
                map: mapInstanceRef.current,
                position: searchLocation,
                icon: {
                    url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                }
            });
        }
    }, [searchLocation, mapLoaded]);

    return (
        <div className="map-container">
            {mapLoaded ? (
                <div ref={mapRef} style={{ width: '100%', height: '400px' }}></div>
            ) : (
                <div>Loading map...</div>
            )}
        </div>
    );
};

export default MapLayout;