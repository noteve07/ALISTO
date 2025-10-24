import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Component to add earthquake markers to the map
function EarthquakeMarker({ event, isLatest }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Color based purely on magnitude (red->yellow->green scale)
    const getMagColor = (mag) => {
      if (mag >= 5) return '#B91C1C'; // Deep red for high magnitude
      if (mag >= 4) return '#EA580C'; // Vibrant orange for medium-high magnitude
      if (mag >= 3) return '#FACC15'; // Warm yellow for medium magnitude
      if (mag >= 2) return '#10B981'; // Green for low-medium magnitude
      return '#6B7280'; // Gray for very low magnitude
    };

    const color = getMagColor(event.magnitude);
    
    // Calculate radius based on magnitude - larger for higher magnitudes
    const radius = event.magnitude * 2500;
    
    // For all earthquakes, add a circle marker
    const circle = L.circle([event.latitude, event.longitude], {
      color: color,
      fillColor: color,
      fillOpacity: 0.5,
      radius: radius
    }).addTo(map);

    // Add popup to the circle marker
    const popupContent = `
      <div class="earthquake-popup">
        <h3>Magnitude ${event.magnitude}</h3>
        <p><strong>Time:</strong> ${event.dateTime}</p>
        <p><strong>Depth:</strong> ${event.depth}km</p>
        <p><strong>Location:</strong> ${event.location}</p>
        <p><strong>Coordinates:</strong> ${event.latitude.toFixed(4)}, ${event.longitude.toFixed(4)}</p>
      </div>
    `;
    circle.bindPopup(popupContent);
    
    // Only add animation for the latest earthquake
    if (isLatest) {
      // Create signal animation
      const signalDiv = L.DomUtil.create('div');
      signalDiv.className = 'signal-circle';
      signalDiv.style.width = (event.magnitude * 20) + 'px';
      signalDiv.style.height = (event.magnitude * 20) + 'px';
      signalDiv.style.background = color;

      const signalIcon = L.divIcon({
        className: '',
        html: signalDiv,
        iconSize: [event.magnitude * 20, event.magnitude * 20],
        iconAnchor: [event.magnitude * 10, event.magnitude * 10]
      });
      
      const signalMarker = L.marker([event.latitude, event.longitude], {
        icon: signalIcon, 
        interactive: false
      }).addTo(map);
      
      return () => {
        map.removeLayer(circle);
        map.removeLayer(signalMarker);
      };
    } else {
      return () => {
        map.removeLayer(circle);
      };
    }
  }, [map, event, isLatest]);

  return null;
}

function LiveMonitoring() {
  const [minMag, setMinMag] = useState(0);
  const [maxDepth, setMaxDepth] = useState(700);
  const [earthquakeData, setEarthquakeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch earthquake data
  useEffect(() => {
    const fetchEarthquakes = async () => {
      try {
        setLoading(true);
        // Use the proxied path configured in vite.config.js
        const response = await fetch('/api/v1/live');
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error(`Expected JSON response but got ${contentType || 'unknown content type'}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          const getTimestamp = (dateValue) => {
            const parsed = Date.parse(dateValue);
            return Number.isNaN(parsed) ? 0 : parsed;
          };

          // Transform data to our expected format and sort by newest first
          const transformedData = data.data
            .map((eq, index) => ({
              id: index,
              latitude: eq.latitude,
              longitude: eq.longitude,
              magnitude: eq.magnitude,
              depth: eq.depth,
              location: eq.location,
              dateTime: eq.date_time,
              timestamp: getTimestamp(eq.date_time)
            }))
            .sort((a, b) => b.timestamp - a.timestamp)
            .map(({ timestamp, ...rest }) => {
              void timestamp;
              return rest;
            });
          
          setEarthquakeData(transformedData);
        } else {
          throw new Error('Invalid data structure received from API');
        }
      } catch (err) {
        console.error("Error fetching earthquake data:", err);
        setError(err.message);
        const fallbackEvents = [
          { id: 1, latitude: 11.05, longitude: 124.08, magnitude: 2.0, depth: 29, location: '010km N 88° E of City Of Bogo (Cebu)', dateTime: '13 October 2025 - 07:39 AM', rawDateTime: '2025-10-13T07:39:00+08:00' },
          { id: 2, latitude: 10.98, longitude: 123.93, magnitude: 2.7, depth: 7, location: '009km S 35° W of City Of Bogo (Cebu)', dateTime: '13 October 2025 - 07:29 AM', rawDateTime: '2025-10-13T07:29:00+08:00' },
          { id: 3, latitude: 11.03, longitude: 123.99, magnitude: 2.1, depth: 2, location: '002km S 22° E of City Of Bogo (Cebu)', dateTime: '13 October 2025 - 07:12 AM', rawDateTime: '2025-10-13T07:12:00+08:00' },
          { id: 4, latitude: 11.02, longitude: 124.02, magnitude: 3.1, depth: 4, location: '005km S 64° E of City Of Bogo (Cebu)', dateTime: '13 October 2025 - 07:09 AM', rawDateTime: '2025-10-13T07:09:00+08:00' },
          { id: 5, latitude: 11.21, longitude: 124.13, magnitude: 2.4, depth: 33, location: '024km N 43° E of City Of Bogo (Cebu)', dateTime: '13 October 2025 - 07:04 AM', rawDateTime: '2025-10-13T07:04:00+08:00' }
        ]
          .map((event) => ({
            ...event,
            timestamp: Date.parse(event.rawDateTime)
          }))
          .sort((a, b) => b.timestamp - a.timestamp)
          .map(({ timestamp, rawDateTime, ...rest }) => {
            void timestamp;
            void rawDateTime;
            return rest;
          });

        setEarthquakeData(fallbackEvents);
      } finally {
        setLoading(false);
      }
    };

    fetchEarthquakes();
    
    // Set up polling interval (every 30 seconds)
    const intervalId = setInterval(() => {
      fetchEarthquakes();
    }, 30000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);
  
  // Filter events based on magnitude and depth
  const filtered = earthquakeData.filter(e => e.magnitude >= minMag && e.depth <= maxDepth);
  
  return (
    <div className="full-height-grid" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - var(--header-height) - 32px)" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontWeight: 700 }}>Live Monitoring</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="badge">Locate Me</button>
          <div className="badge accent" style={{ gap: 12 }}>
            <span>Min M</span>
            <input type="range" min="0" max="7" value={minMag} onChange={e => setMinMag(Number(e.target.value))} />
            <span>{minMag.toFixed(1)}</span>
          </div>
          <div className="badge info" style={{ gap: 12 }}>
            <span>Max Depth</span>
            <input type="range" min="0" max="700" step="10" value={maxDepth} onChange={e => setMaxDepth(Number(e.target.value))} />
            <span>{maxDepth}km</span>
          </div>
        </div>
      </div>
      
      <div className="map-container" style={{ flex: 1, height: "calc(100vh - 170px)" }}>
        <div className="map-content" style={{ width: "100%", height: "100%", position: "relative" }}>
          {loading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p>Loading earthquake data...</p>
            </div>
          )}
          
          {error && (
            <div className="error-message">
              <h3>Unable to connect to API</h3>
              <p>Using sample earthquake data while we try to reconnect.</p>
              <div className="error-details">
                <details>
                  <summary>Technical details</summary>
                  <p>{error}</p>
                </details>
              </div>
              <button className="btn primary" onClick={() => window.location.reload()}>Retry Connection</button>
            </div>
          )}
          
          <MapContainer 
            center={[12.8797, 121.7740]} 
            zoom={6} 
            scrollWheelZoom={true} 
            style={{ width: "100%", height: "100%" }}
            minZoom={5}
            maxZoom={12}
            maxBounds={[[4.5, 116.0], [21.5, 127.5]]}
            maxBoundsViscosity={1.0}
            worldCopyJump={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              noWrap={true}
            />
            
            {filtered.map((event, index) => (
              <React.Fragment key={event.id}>
                {/* Only use the EarthquakeMarker component which handles both markers and popups */}
                <EarthquakeMarker 
                  event={event} 
                  isLatest={index === 0} // First item is the latest earthquake
                />
              </React.Fragment>
            ))}
          </MapContainer>
        </div>
      </div>
      
      {filtered.length > 0 && (
        <div className="latest-info">
          <div className="badge accent" style={{ marginRight: '8px' }}>Latest Earthquake</div>
          <span>{filtered[0]?.dateTime} | {filtered[0]?.location} | Magnitude {filtered[0]?.magnitude}</span>
        </div>
      )}
    </div>
  );
}

export default LiveMonitoring;