/* src/pages/CityMapPage.jsx */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css'; // <--- CRITICAL: Mapbox CSS
import api from '../services/api';
import styles from './CityMapPage.module.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const CityMapPage = () => {
  const navigate = useNavigate();
  
  // Default map view (Centered roughly on Mumbai, adjust as needed)
  const [viewState, setViewState] = useState({
    longitude: 72.8777, 
    latitude: 19.0760,
    zoom: 11,
    pitch: 45 // Gives it that cool 3D angled look
  });

  const [events, setEvents] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [parking, setParking] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const [eventsRes, facilitiesRes, parkingRes] = await Promise.all([
          api.get('/events/'),
          api.get('/facilities/'),
          api.get('/transport/parking/')
        ]);
        setEvents(eventsRes.data || []);
        setFacilities(facilitiesRes.data || []);
        setParking(parkingRes.data || []);
      } catch (error) {
        console.error("Error fetching map data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMapData();
  }, []);

  // Helper to filter out legacy items that don't have coordinates yet
  const hasValidCoords = (item) => item.latitude && item.longitude;

  const handleNavigate = (item) => {
    if (item.type === 'parking') navigate(`/parking/book/${item.id}`);
    if (item.type === 'facility') navigate(`/facilities/book/${item.id}`);
    if (item.type === 'event') navigate(`/events`); // Events use a modal, so send to events page
  };

  return (
    <div className={styles.container}>
      
      <div className={styles.header}>
        <h1 className={styles.title}>City Command Center</h1>
        <p className={styles.subtitle}>Live tracking of public infrastructure, events, and parking capacity.</p>
      </div>

      <div className={styles.mapWrapper}>
        {loading && <div className={styles.loadingOverlay}>Initializing Satellites...</div>}
        
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/dark-v11" // Sleek dark sci-fi theme
          mapboxAccessToken={MAPBOX_TOKEN}
        >
          {/* Zoom Controls */}
          <NavigationControl position="top-right" />

          {/* PARKING MARKERS */}
          {parking.filter(hasValidCoords).map(p => (
            <Marker key={`p-${p.id}`} longitude={Number(p.longitude)} latitude={Number(p.latitude)} anchor="bottom">
              <div className={styles.marker} onClick={(e) => { e.stopPropagation(); setSelectedMarker({ ...p, type: 'parking' }); }}>
                <span className={styles.markerIcon}>🅿️</span>
              </div>
            </Marker>
          ))}

          {/* EVENT MARKERS */}
          {events.filter(hasValidCoords).map(e => (
            <Marker key={`e-${e.id}`} longitude={Number(e.longitude)} latitude={Number(e.latitude)} anchor="bottom">
              <div className={styles.marker} onClick={(ev) => { ev.stopPropagation(); setSelectedMarker({ ...e, type: 'event' }); }}>
                <span className={styles.markerIcon}>🎟️</span>
              </div>
            </Marker>
          ))}

          {/* FACILITY MARKERS */}
          {facilities.filter(hasValidCoords).map(f => (
            <Marker key={`f-${f.id}`} longitude={Number(f.longitude)} latitude={Number(f.latitude)} anchor="bottom">
              <div className={styles.marker} onClick={(e) => { e.stopPropagation(); setSelectedMarker({ ...f, type: 'facility' }); }}>
                <span className={styles.markerIcon}>🏢</span>
              </div>
            </Marker>
          ))}

          {/* GLASSMORPHISM POPUP */}
          {selectedMarker && (
            <Popup
              longitude={Number(selectedMarker.longitude)}
              latitude={Number(selectedMarker.latitude)}
              anchor="bottom"
              offset={40}
              onClose={() => setSelectedMarker(null)}
              closeOnClick={false}
              className="custom-popup"
            >
              <div className={styles.popupCard}>
                <h3 className={styles.popupTitle}>{selectedMarker.title || selectedMarker.name}</h3>
                <p className={styles.popupLocation}>📍 {selectedMarker.location}</p>
                
                {/* Specific details based on type */}
                {selectedMarker.type === 'parking' && (
                  <p className={styles.popupMeta}>Rate: ₹{selectedMarker.rate_per_hour}/hr</p>
                )}
                {selectedMarker.type === 'facility' && (
                  <p className={styles.popupMeta}>Capacity: {selectedMarker.capacity} people</p>
                )}

                <button className={styles.popupBtn} onClick={() => handleNavigate(selectedMarker)}>
                  {selectedMarker.type === 'event' ? 'Find Tickets' : 'Book Now'}
                </button>
              </div>
            </Popup>
          )}
        </Map>
      </div>
    </div>
  );
};

export default CityMapPage;