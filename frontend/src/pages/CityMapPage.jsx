/* src/pages/CityMapPage.jsx */
import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import api from '../services/api';
import styles from './CityMapPage.module.css';
import Pusher from 'pusher-js';
import useSupercluster from 'use-supercluster';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// -------------------------------------------------------------------
// 1. HELPER: OUTSIDE COMPONENT TO PREVENT RE-CREATION
// -------------------------------------------------------------------
const getIcon = (type) => {
  if (type === 'parking') {
    return (
      <svg viewBox="0 0 45 45" fill="none" style={{ width: '100%', height: '100%', display: 'block' }}>
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
      <svg viewBox="0 0 15 15" fill="none" style={{ width: '100%', height: '100%', display: 'block' }}>
        <path d="M7.5 0.5L7.72361 0.0527866C7.58284 -0.0175955 7.41716 -0.0175955 7.27639 0.0527866L7.5 0.5ZM4.5 8.50001V8.00001H4V8.50001H4.5ZM8.5 8.50001H9V8.00001H8.5V8.50001ZM0 15H15V14H0V15ZM7.27639 0.0527866L1.27639 3.05279L1.72361 3.94722L7.72361 0.947213L7.27639 0.0527866ZM0 6.00001H15V5.00001H0V6.00001ZM13.7236 3.05279L7.72361 0.0527866L7.27639 0.947213L13.2764 3.94722L13.7236 3.05279ZM1 5.50001V14.5H2V5.50001H1ZM13 5.50001V14.5H14V5.50001H13ZM5 14.5V8.50001H4V14.5H5ZM4.5 9.00001H8.5V8.00001H4.5V9.00001ZM8 8.50001V14.5H9V8.50001H8Z" fill="currentColor"/>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: '100%', height: '100%', display: 'block' }}>
      <path fillRule="evenodd" clipRule="evenodd" d="M7 2a1 1 0 0 0-1 1v1.001c-.961.014-1.34.129-1.721.333a2.272 2.272 0 0 0-.945.945C3.116 5.686 3 6.09 3 7.205v10.59c0 1.114.116 1.519.334 1.926.218.407.538.727.945.945.407.218.811.334 1.926.334h11.59c1.114 0 1.519-.116 1.926-.334.407-.218.727-.538.945-.945.218-.407.334-.811.334-1.926V7.205c0-1.115-.116-1.519-.334-1.926a2.272 2.272 0 0 0-.945-.945C19.34 4.13 18.961 4.015 18 4V3a1 1 0 1 0-2 0v1H8V3a1 1 0 0 0-1-1zM5 9v8.795c0 .427.019.694.049.849.012.06.017.074.049.134a.275.275 0 0 0 .124.125c.06.031.073.036.134.048.155.03.422.049.849.049h11.59c.427 0 .694-.019.849-.049a.353.353 0 0 0 .134-.049.275.275 0 0 0 .125-.124.353.353 0 0 0 .048-.134c.03-.155.049-.422.049-.849L19.004 9H5zm8.75 4a.75.75 0 0 0-.75.75v2.5c0 .414.336.75.75.75h2.5a.75.75 0 0 0 .75-.75v-2.5a.75.75 0 0 0-.75-.75h-2.5z" fill="currentColor"/>
    </svg>
  );
};

// -------------------------------------------------------------------
// 2. COMPONENT: MAP POPUP CARD
// -------------------------------------------------------------------
const MapPopupCard = memo(({ marker, handleNavigate, onClose }) => {
  return (
    <div className={styles.popupCard}>
      <h3 className={styles.popupTitle}>{marker.title || marker.name}</h3>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <p className={styles.popupLocation} style={{ margin: 0 }}>
          <svg viewBox="0 0 24 24" fill="none" style={{ width: '16px', height: '16px', marginRight: '6px', marginBottom: '-2px' }}>
            <path d="M9,6a3,3,0,0,1,3-3h0a3,3,0,0,1,3,3h0a3,3,0,0,1-3,3h0A3,3,0,0,1,9,6Zm3,3V21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
          </svg>
          {marker.displayCity}, {marker.displayState}
        </p>
        
        <a 
          href={`https://www.google.com/maps/dir/?api=1&destination=${marker.latitude},${marker.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '0.75rem', color: '#60a5fa', textDecoration: 'none', display: 'flex',
            alignItems: 'center', gap: '4px', fontWeight: 'bold', background: 'rgba(59, 130, 246, 0.15)',
            padding: '4px 8px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.3)',
          }}
        >
        <svg fill="#ffffff" width="30px" height="30px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M5.49550882,21.8682431 C4.6777361,22.3357383 3.72658785,21.5157506 4.06796534,20.6375537 L11.0650238,2.63755374 C11.3954683,1.78748209 12.5978053,1.78748209 12.9282498,2.63755374 L19.9253083,20.6375537 C20.2666858,21.5157506 19.3155375,22.3357383 18.4977648,21.8682431 L11.9966368,18.1517511 L5.49550882,21.8682431 Z M11.9966368,5.7590297 L6.95414707,18.7308829 L11.5007064,16.1317569 C11.8080098,15.956081 12.1852638,15.956081 12.4925673,16.1317569 L17.0391266,18.7308829 L11.9966368,5.7590297 Z"/>
        </svg>
        </a>
      </div>
      
      {marker.type === 'parking' && (
        <div className={styles.popupMetaGroup}>
          <p className={styles.popupMeta}>Rate: ₹{marker.rate_per_hour}/hr</p>
          <p className={styles.popupMeta} style={{ fontWeight: 'bold', color: marker.available_spaces > 0 ? '#10b981' : '#ef4444' }}>
            {marker.available_spaces > 0 ? `🟢 ${marker.available_spaces} Spots Available` : '🔴 LOT FULL'}
          </p>
        </div>
      )}
      {marker.type === 'facility' && <p className={styles.popupMeta}>Capacity: {marker.capacity} people</p>}

      <button 
        className={styles.popupBtn} 
        onClick={() => handleNavigate(marker)}
        disabled={marker.type === 'parking' && marker.available_spaces === 0}
        style={marker.type === 'parking' && marker.available_spaces === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
      >
        {marker.type === 'event' ? 'Find Tickets' : (marker.available_spaces === 0 ? 'Unavailable' : 'Book Now')}
      </button>
    </div>
  );
});

// -------------------------------------------------------------------
// 3. COMPONENT: SIDEBAR
// -------------------------------------------------------------------
const MapSidebar = memo(({ loading, groupedItems, expandedStates, selectedMarker, toggleAccordion, handleLocationClick }) => {
  return (
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
  );
});

// -------------------------------------------------------------------
// 4. MAIN PAGE COMPONENT
// -------------------------------------------------------------------
const CityMapPage = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null); 
  
  // FIX 1: Decouple strict viewState. Only track zoom and bounds for supercluster!
  const [zoom, setZoom] = useState(4.2);
  const [bounds, setBounds] = useState(null);
  
  const [mapItems, setMapItems] = useState([]); 
  const [groupedItems, setGroupedItems] = useState({}); 
  const [expandedStates, setExpandedStates] = useState({}); 
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [loading, setLoading] = useState(true);

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
        const parts = item.location.split(/[،,]/).map(s => s.trim());
        const streetName = parts[0] || 'Unknown Location';
        let cityName = 'Other Regions';
        if (parts.length > 1) cityName = parts[1].replace(/[0-9]/g, '').trim(); 
        
        const cleanItem = { ...item, displayCity: streetName, displayState: cityName };
        if (!grouped[cityName]) grouped[cityName] = [];
        grouped[cityName].push(cleanItem);
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

  useEffect(() => {
    const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, { cluster: import.meta.env.VITE_PUSHER_CLUSTER });
    const channel = pusher.subscribe('live_map');
    
    channel.bind('parking_update', function(update) {
      setMapItems(prevItems => prevItems.map(item => (item.type === 'parking' && item.id === update.id) ? { ...item, available_spaces: update.available_spots } : item));
      setGroupedItems(prevGrouped => {
        const newGrouped = { ...prevGrouped };
        for (let state in newGrouped) {
          newGrouped[state] = newGrouped[state].map(item => (item.type === 'parking' && item.id === update.id) ? { ...item, available_spaces: update.available_spots } : item);
        }
        return newGrouped;
      });
      setSelectedMarker(prev => {
        if (prev && prev.type === 'parking' && prev.id === update.id) return { ...prev, available_spaces: update.available_spots };
        return prev;
      });
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

  const points = useMemo(() => {
    return mapItems.map(item => ({
      type: "Feature",
      properties: { cluster: false, itemId: item.id, itemData: item, itemType: item.type },
      geometry: { type: "Point", coordinates: [Number(item.longitude), Number(item.latitude)] }
    }));
  }, [mapItems]);

  // FIX 2: Memoize the Supercluster options to stop infinite internal hook loops!
  const clusterOptions = useMemo(() => ({
    radius: 75,
    maxZoom: 14,
    map: (props) => ({ counts: { [props.itemType]: 1 } }),
    reduce: (accumulated, props) => {
      for (const type in props.counts) {
        accumulated.counts[type] = (accumulated.counts[type] || 0) + props.counts[type];
      }
    }
  }), []);

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom: zoom, // Feed simple zoom state
    options: clusterOptions
  });

  const toggleAccordion = useCallback((stateName) => {
    setExpandedStates(prev => ({ ...prev, [stateName]: !prev[stateName] }));
  }, []);

  const handleLocationClick = useCallback((item) => {
    setSelectedMarker(item);
    mapRef.current?.flyTo({
      center: [Number(item.longitude), Number(item.latitude)],
      zoom: 14, pitch: 50, duration: 2000, essential: true
    });
  }, []);

const handleNavigate = useCallback((item) => {
    
    if (item.type === 'parking') {
      // NEW: Navigate to main parking page and trigger Modal
      navigate('/parking', { state: { autoOpenParkingId: item.id } });
      
    } else if (item.type === 'facility') {
      // Navigate to main facilities page and trigger Modal
      navigate('/facilities', { state: { autoOpenFacilityId: item.id } });
      
    } else if (item.type === 'event') {
      // Navigate to main events page and trigger Modal
      navigate('/events', { state: { autoOpenEventId: item.id } });
    }
    
  }, [navigate]);

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.mapArea}>
        {loading && <div className={styles.loadingOverlay}>Initializing Satellites...</div>}
        
        <Map
          ref={mapRef} 
          // FIX 3: Use initialViewState instead of strict two-way binding. The map now manages its own microscopic panning adjustments.
          initialViewState={{
            longitude: 78.9629, 
            latitude: 20.5937,
            zoom: 4.2,
            pitch: 0 
          }}
          // FIX 4: Only record bounds and zoom when the map STOPS moving. Prevents 60fps re-renders.
          onMoveEnd={(evt) => {
            if (mapRef.current) {
              setBounds(mapRef.current.getMap().getBounds().toArray().flat());
              setZoom(evt.viewState.zoom);
            }
          }}
          onLoad={() => {
            if (mapRef.current) {
                setBounds(mapRef.current.getMap().getBounds().toArray().flat());
            }
          }}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl position="top-right" />

          {clusters.map(cluster => {
            const [longitude, latitude] = cluster.geometry.coordinates;
            const { cluster: isCluster, counts, itemData } = cluster.properties;

            if (isCluster) {
              return (
                <Marker key={`cluster-${cluster.id}`} longitude={longitude} latitude={latitude}>
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      const expansionZoom = Math.min(supercluster.getClusterExpansionZoom(cluster.id), 14);
                      mapRef.current?.flyTo({ center: [longitude, latitude], zoom: expansionZoom, duration: 1000 });
                    }}
                    style={{
                      display: 'flex', gap: '8px', padding: '6px 12px', background: '#18181b', 
                      border: '1px solid #27272a', borderRadius: '24px', color: 'white',
                      fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)', transition: 'transform 0.2s ease'
                    }}
                  >
                    {counts.parking && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#3b82f6' }}>
                            <span style={{ width: '16px', height: '16px' }}>{getIcon('parking')}</span>
                            {counts.parking}
                        </div>
                    )}
                    {counts.event && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>
                            <span style={{ width: '16px', height: '16px' }}>{getIcon('event')}</span>
                            {counts.event}
                        </div>
                    )}
                    {counts.facility && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b' }}>
                            <span style={{ width: '16px', height: '16px' }}>{getIcon('facility')}</span>
                            {counts.facility}
                        </div>
                    )}
                  </div>
                </Marker>
              );
            }

            return (
              <Marker key={`${itemData.type}-${itemData.id}`} longitude={longitude} latitude={latitude} anchor="bottom">
                <div className={styles.marker} onClick={(e) => { e.stopPropagation(); handleLocationClick(itemData); }}>
                  <span className={styles.markerIcon}>{getIcon(itemData.type)}</span>
                </div>
              </Marker>
            );
          })}

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
              <MapPopupCard 
                marker={selectedMarker} 
                handleNavigate={handleNavigate} 
                onClose={() => setSelectedMarker(null)} 
              />
            </Popup>
          )}
        </Map>
      </div>

      <MapSidebar 
        loading={loading}
        groupedItems={groupedItems}
        expandedStates={expandedStates}
        selectedMarker={selectedMarker}
        toggleAccordion={toggleAccordion}
        handleLocationClick={handleLocationClick}
      />
      
    </div>
  );
};

export default CityMapPage;