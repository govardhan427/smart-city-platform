/* src/pages/CityMapPage.jsx */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import api from '../services/api';
import styles from './CityMapPage.module.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const CityMapPage = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null); 
  
  const [viewState, setViewState] = useState({
    longitude: 78.9629, 
    latitude: 20.5937,
    zoom: 4.2,
    pitch: 0 
  });

  const [mapItems, setMapItems] = useState([]); 
  const [groupedItems, setGroupedItems] = useState({}); 
  const [expandedStates, setExpandedStates] = useState({}); 
  
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [loading, setLoading] = useState(true);

  const getIcon = (type) => {
    if (type === 'parking') {
      return (
        <svg viewBox="0 0 45 45" fill="none" style={{ width: '100%', height: '100%' }}>
          <path d="M32 29.6256H36V32.6256C36 33.1776 35.552 33.6256 35 33.6256H33C32.448 33.6256 32 33.1776 32 32.6256V29.6256Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M10 29.6256H14V32.6256C14 33.1776 13.552 33.6256 13 33.6256H11C10.448 33.6256 10 33.1776 10 32.6256V29.6256Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M14 19.6256H32C34.209 19.6256 36 21.4166 36 23.6256V28.6256C36 29.1776 35.552 29.6256 35 29.6256H11C10.448 29.6256 10 29.1776 10 28.6256V23.6256C10 21.4166 11.791 19.6256 14 19.6256Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M32 23.6256C32.552 23.6256 33 24.0736 33 24.6256C33 25.1776 32.552 25.6256 32 25.6256C31.448 25.6256 31 25.1776 31 24.6256C31 24.0736 31.448 23.6256 32 23.6256Z" fill="currentColor"/>
          <path d="M14 23.6256C14.552 23.6256 15 24.0736 15 24.6256C15 25.1776 14.552 25.6256 14 25.6256C13.448 25.6256 13 25.1776 13 24.6256C13 24.0736 13.448 23.6256 14 23.6256Z" fill="currentColor"/>
          <path d="M15.693 11.6256H30.307C30.724 11.6256 31.097 11.8846 31.243 12.2746L34 19.6256H12L14.757 12.2746C14.903 11.8846 15.276 11.6256 15.693 11.6256Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M9 16.6256H12V18.6256H9V16.6256Z" fill="currentColor"/>
          <path d="M34 16.6256H37V18.6256H34V16.6256Z" fill="currentColor"/>
          <path d="M17 24.6256H29" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    }
    
    if (type === 'facility') {
      return (
        <svg viewBox="0 0 15 15" fill="none" style={{ width: '100%', height: '100%' }}>
          <path d="M7.5 0.5L7.72361 0.0527866C7.58284 -0.0175955 7.41716 -0.0175955 7.27639 0.0527866L7.5 0.5ZM4.5 8.50001V8.00001H4V8.50001H4.5ZM8.5 8.50001H9V8.00001H8.5V8.50001ZM0 15H15V14H0V15ZM7.27639 0.0527866L1.27639 3.05279L1.72361 3.94722L7.72361 0.947213L7.27639 0.0527866ZM0 6.00001H15V5.00001H0V6.00001ZM13.7236 3.05279L7.72361 0.0527866L7.27639 0.947213L13.2764 3.94722L13.7236 3.05279ZM1 5.50001V14.5H2V5.50001H1ZM13 5.50001V14.5H14V5.50001H13ZM5 14.5V8.50001H4V14.5H5ZM4.5 9.00001H8.5V8.00001H4.5V9.00001ZM8 8.50001V14.5H9V8.50001H8Z" fill="currentColor"/>
        </svg>
      );
    }
    
    return (
      <svg viewBox="0 0 24 24" fill="none" style={{ width: '100%', height: '100%' }}>
        <path fillRule="evenodd" clipRule="evenodd" d="M7 2a1 1 0 0 0-1 1v1.001c-.961.014-1.34.129-1.721.333a2.272 2.272 0 0 0-.945.945C3.116 5.686 3 6.09 3 7.205v10.59c0 1.114.116 1.519.334 1.926.218.407.538.727.945.945.407.218.811.334 1.926.334h11.59c1.114 0 1.519-.116 1.926-.334.407-.218.727-.538.945-.945.218-.407.334-.811.334-1.926V7.205c0-1.115-.116-1.519-.334-1.926a2.272 2.272 0 0 0-.945-.945C19.34 4.13 18.961 4.015 18 4V3a1 1 0 1 0-2 0v1H8V3a1 1 0 0 0-1-1zM5 9v8.795c0 .427.019.694.049.849.012.06.017.074.049.134a.275.275 0 0 0 .124.125c.06.031.073.036.134.048.155.03.422.049.849.049h11.59c.427 0 .694-.019.849-.049a.353.353 0 0 0 .134-.049.275.275 0 0 0 .125-.124.353.353 0 0 0 .048-.134c.03-.155.049-.422.049-.849L19.004 9H5zm8.75 4a.75.75 0 0 0-.75.75v2.5c0 .414.336.75.75.75h2.5a.75.75 0 0 0 .75-.75v-2.5a.75.75 0 0 0-.75-.75h-2.5z" fill="currentColor"/>
      </svg>
    );
  };

  // 1. DATA FETCHING EFFECT
  useEffect(() => {
    const processMapData = (rawEvents, rawFacilities, rawParking) => {
      const combined = [
        ...rawEvents.map(e => ({ ...e, type: 'event' })),
        ...rawFacilities.map(f => ({ ...f, type: 'facility' })),
        ...rawParking.map(p => ({ ...p, type: 'parking' }))
      ].filter(item => item.latitude && item.longitude);

      setMapItems(combined);

      const grouped = {};
      combined.forEach(item => {
        const parts = item.location.split(',').map(s => s.trim());
        const city = parts[0] || 'Unknown City';
        const state = parts.length > 1 ? parts[1] : 'Other Regions';

        const cleanItem = { ...item, displayCity: city, displayState: state };

        if (!grouped[state]) grouped[state] = [];
        grouped[state].push(cleanItem);
      });

      const sortedGrouped = Object.keys(grouped).sort().reduce((acc, key) => {
        acc[key] = grouped[key];
        return acc;
      }, {});

      setGroupedItems(sortedGrouped);
      
      const firstState = Object.keys(sortedGrouped)[0];
      if (firstState) setExpandedStates({ [firstState]: true });
    };

    const fetchMapData = async () => {
      try {
        const CACHE_KEY = 'smartCityMapData';
        const CACHE_TIME_KEY = 'smartCityMapTime';
        const CACHE_DURATION = 5 * 60 * 1000;

        const cachedData = sessionStorage.getItem(CACHE_KEY);
        const cachedTime = sessionStorage.getItem(CACHE_TIME_KEY);

        if (cachedData && cachedTime && (Date.now() - Number(cachedTime) < CACHE_DURATION)) {
          const parsed = JSON.parse(cachedData);
          processMapData(parsed.events, parsed.facilities, parsed.parking);
          setLoading(false);
          return; 
        }

        const [eventsRes, facilitiesRes, parkingRes] = await Promise.all([
          api.get('/events/'),
          api.get('/facilities/'),
          api.get('/transport/parking/')
        ]);

        const freshData = {
          events: eventsRes.data || [],
          facilities: facilitiesRes.data || [],
          parking: parkingRes.data || []
        };

        sessionStorage.setItem(CACHE_KEY, JSON.stringify(freshData));
        sessionStorage.setItem(CACHE_TIME_KEY, Date.now().toString());

        processMapData(freshData.events, freshData.facilities, freshData.parking);

      } catch (error) {
        console.error("Error fetching map data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMapData();
  }, []);

  // 2. NEW: LIVE WEBSOCKET CONNECTION
  useEffect(() => {
    // Connect to Django Channels WebSocket. Use your actual local/prod URL here.
    const wsUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('http', 'ws') + '/ws/map/'
      : 'ws://127.0.0.1:8000/ws/map/';
      
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('🟢 Command Center Live Link Established');
    };

    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);

      if (update.type === 'parking') {
        console.log("Live Update Received:", update);

        // Update the Map Markers State
        setMapItems(prevItems => 
          prevItems.map(item => 
            (item.type === 'parking' && item.id === update.id) 
              ? { ...item, available_spaces: update.available_spots } // Inject live capacity
              : item
          )
        );

        // Update the Sidebar Accordion instantly
        setGroupedItems(prevGrouped => {
          const newGrouped = { ...prevGrouped };
          for (let state in newGrouped) {
            newGrouped[state] = newGrouped[state].map(item => 
              (item.type === 'parking' && item.id === update.id) 
                ? { ...item, available_spaces: update.available_spots } 
                : item
            );
          }
          return newGrouped;
        });

        // Update the Popup if the user happens to have it open!
        setSelectedMarker(prev => {
          if (prev && prev.type === 'parking' && prev.id === update.id) {
            return { ...prev, available_spaces: update.available_spots };
          }
          return prev;
        });
      }
    };

    ws.onclose = () => {
      console.log('🔴 Command Center Live Link Disconnected');
    };

    return () => ws.close(); 
  }, []);

  const toggleAccordion = (stateName) => {
    setExpandedStates(prev => ({
      ...prev,
      [stateName]: !prev[stateName]
    }));
  };

  const handleLocationClick = (item) => {
    setSelectedMarker(item);
    mapRef.current?.flyTo({
      center: [Number(item.longitude), Number(item.latitude)],
      zoom: 14,       
      pitch: 50,      
      duration: 2000, 
      essential: true
    });
  };

  const handleNavigate = (item) => {
    if (item.type === 'parking') navigate(`/parking/${item.id}/book`);
    if (item.type === 'facility') navigate(`/facilities/${item.id}/book`);
    if (item.type === 'event') navigate('/events', { state: { autoOpenEventId: item.id } }); 
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.mapArea}>
        {loading && <div className={styles.loadingOverlay}>Initializing Satellites...</div>}
        
        <Map
          ref={mapRef} 
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl position="top-right" />

          {mapItems.map(item => (
            <Marker key={`${item.type}-${item.id}`} longitude={Number(item.longitude)} latitude={Number(item.latitude)} anchor="bottom">
              <div className={styles.marker} onClick={(e) => { e.stopPropagation(); handleLocationClick(item); }}>
                <span className={styles.markerIcon}>{getIcon(item.type)}</span>
              </div>
            </Marker>
          ))}

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
                <p className={styles.popupLocation}>
                  <svg viewBox="0 0 24 24" fill="none" style={{ width: '16px', height: '16px', marginRight: '6px', marginBottom: '-2px' }}>
                    <path d="M9,6a3,3,0,0,1,3-3h0a3,3,0,0,1,3,3h0a3,3,0,0,1-3,3h0A3,3,0,0,1,9,6Zm3,3V21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                  </svg>
                  {selectedMarker.displayCity}, {selectedMarker.displayState}
                </p>                
                
                {/* UPGRADED POPUP INFO WITH LIVE DATA */}
                {selectedMarker.type === 'parking' && (
                  <div className={styles.popupMetaGroup}>
                    <p className={styles.popupMeta}>Rate: ₹{selectedMarker.rate_per_hour}/hr</p>
                    <p className={styles.popupMeta} style={{ fontWeight: 'bold', color: selectedMarker.available_spaces > 0 ? '#10b981' : '#ef4444' }}>
                      {selectedMarker.available_spaces > 0 ? `🟢 ${selectedMarker.available_spaces} Spots Available` : '🔴 LOT FULL'}
                    </p>
                  </div>
                )}
                {selectedMarker.type === 'facility' && <p className={styles.popupMeta}>Capacity: {selectedMarker.capacity} people</p>}

                <button 
                  className={styles.popupBtn} 
                  onClick={() => handleNavigate(selectedMarker)}
                  disabled={selectedMarker.type === 'parking' && selectedMarker.available_spaces === 0}
                  style={selectedMarker.type === 'parking' && selectedMarker.available_spaces === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  {selectedMarker.type === 'event' ? 'Find Tickets' : (selectedMarker.available_spaces === 0 ? 'Unavailable' : 'Book Now')}
                </button>
              </div>
            </Popup>
          )}
        </Map>
      </div>

      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
            <h1 className={styles.sidebarTitle}>Command Center</h1>
            <p className={styles.sidebarSubtitle}>Live Infrastructure</p>
        </div>

        <div className={styles.sidebarContent}>
            {loading ? (
                <div className={styles.loadingText}>Syncing Data...</div>
            ) : (
                Object.entries(groupedItems).map(([stateName, items]) => (
                    <div key={stateName} className={styles.accordionGroup}>
                        <button 
                            className={`${styles.accordionHeader} ${expandedStates[stateName] ? styles.activeHeader : ''}`}
                            onClick={() => toggleAccordion(stateName)}
                        >
                            <span className={styles.stateName}>{stateName}</span>
                            <span className={styles.badge}>{items.length}</span>
                        </button>

                        {expandedStates[stateName] && (
                            <div className={styles.accordionBody}>
                                {items.map(item => (
                                    <div 
                                        key={`${item.type}-${item.id}`} 
                                        className={`${styles.listItem} ${selectedMarker?.id === item.id ? styles.selectedItem : ''}`}
                                        onClick={() => handleLocationClick(item)}
                                    >
                                        <span className={styles.listIcon}>{getIcon(item.type)}</span>
                                        <div className={styles.listText}>
                                            <div className={styles.listCity}>{item.displayCity}</div>
                                            <div className={styles.listType}>
                                              {item.title || item.name}
                                              {/* LIVE SIDEBAR INDICATOR FOR PARKING */}
                                              {item.type === 'parking' && (
                                                <span style={{ fontSize: '0.7rem', marginLeft: '8px', fontWeight: 'bold', color: item.available_spaces > 0 ? '#10b981' : '#ef4444' }}>
                                                  ({item.available_spaces > 0 ? `${item.available_spaces} spots` : 'FULL'})
                                                </span>
                                              )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};

export default CityMapPage;