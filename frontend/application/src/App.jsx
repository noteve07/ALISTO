import { useMemo, useState } from 'react'
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './App.css'
import { useEarthquakes } from './hooks/useEarthquakes'
import { useWebSocket } from './services/websocket'
import { useChatbot } from './hooks/useChatbot'
import { useAuth } from './hooks/useAuth'
import { EarthquakeTimelineChart, MagnitudeDistributionChart, DailyCountChart, DepthMagnitudeChart, LocationFrequencyChart } from './components/Charts'
import { Login, Register } from './components/Auth'
import { NotificationSettings } from './components/NotificationSettings'
import { AdvancedFilters } from './components/AdvancedFilters'

function NavItem({ icon, label, to }) {
  return (
    <NavLink to={to} style={({ isActive }) => ({
      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
      color: 'var(--text)', borderRadius: 8,
      background: isActive ? 'var(--nav-active-bg)' : 'transparent',
      border: isActive ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid transparent',
      boxShadow: isActive ? 'inset 3px 0 0 var(--primary)' : 'none'
    })} className="nav-item">
      {icon ? <span aria-hidden>{icon}</span> : null}
      <span style={{ fontWeight: 600 }}>{label}</span>
    </NavLink>
  )
}

function AppShell({ children }) {
  const { status: wsStatus } = useWebSocket();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
// Simple inline SVG icons (no external assets)
const IconDashboard = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="8" height="8" rx="2" stroke="var(--primary)" strokeWidth="2"/>
    <rect x="13" y="3" width="8" height="5" rx="2" stroke="var(--primary)" strokeWidth="2"/>
    <rect x="13" y="10" width="8" height="11" rx="2" stroke="var(--primary)" strokeWidth="2"/>
    <rect x="3" y="13" width="8" height="8" rx="2" stroke="var(--primary)" strokeWidth="2"/>
  </svg>
)
const IconMap = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z" stroke="var(--primary)" strokeWidth="2" fill="none"/>
    <path d="M9 3v15M15 6v15" stroke="var(--primary)" strokeWidth="2"/>
  </svg>
)
const IconRisk = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3l9 16H3l9-16z" stroke="var(--primary)" strokeWidth="2" fill="none"/>
    <path d="M12 9v5M12 18h.01" stroke="var(--primary)" strokeWidth="2"/>
  </svg>
)
const IconChat = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 12c0 4.418-4.03 8-9 8-1.052 0-2.06-.147-3-.42L3 21l1.42-5C4.147 14.06 4 13.052 4 12 4 7.582 8.03 4 13 4s8 3.582 8 8z" stroke="var(--primary)" strokeWidth="2" fill="none"/>
    <circle cx="11" cy="12" r="1" fill="var(--primary)"/>
    <circle cx="14" cy="12" r="1" fill="var(--primary)"/>
    <circle cx="17" cy="12" r="1" fill="var(--primary)"/>
  </svg>
)

  const nav = useMemo(() => ([
    { to: '/', label: 'Dashboard', icon: IconDashboard },
    { to: '/live', label: 'Live Monitoring', icon: IconMap },
    { to: '/risk', label: 'Risk Evaluation', icon: IconRisk },
    { to: '/analytics', label: 'Analytics', icon: IconDashboard },
    { to: '/chatbot', label: 'ISA Chatbot', icon: IconChat },
  ]), [])

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, marginBottom: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: 999, background: 'var(--primary)', boxShadow: '0 0 12px var(--primary)' }} />
          <h3 style={{ fontWeight: 700 }}>ALISTO</h3>
        </div>
        <div style={{ display: 'grid', gap: 4 }}>
          {nav.map(item => (
            <NavItem key={item.label} icon={item.icon} label={item.label} to={item.to} />
          ))}
        </div>
      </aside>
      <main style={{ display: 'grid', gridTemplateRows: '56px 1fr', minHeight: '100vh' }}>
        <div className="topbar">
          <button 
            className="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: 'none' }}
          >
            ☰
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className={`badge ${wsStatus === 'connected' ? 'success' : wsStatus === 'connecting' ? 'accent' : 'danger'} live-indicator`}>
              ● {wsStatus === 'connected' ? 'Live Updates' : wsStatus === 'connecting' ? 'Connecting...' : 'Offline'}
            </span>
            <div style={{ position: 'relative' }}>
              <input placeholder="Search earthquakes, locations..." className="input" style={{ paddingLeft: '40px', width: '300px' }} />
              <svg width="16" height="16" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '14px', color: 'var(--muted)' }}>{new Date().toLocaleDateString()}</span>
              <span style={{ fontSize: '14px', color: 'var(--muted)' }}>{new Date().toLocaleTimeString()}</span>
            </div>
            <button className="btn icon" style={{ position: 'relative' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: 'var(--danger)', borderRadius: '50%' }}></span>
            </button>
            <div style={{ position: 'relative' }}>
              <div style={{ width: 36, height: 36, borderRadius: 999, background: 'linear-gradient(135deg, #FDBA74, #F59E0B)', cursor: 'pointer', transition: 'transform 0.2s ease' }} 
                   onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                   onMouseLeave={(e) => e.target.style.transform = 'scale(1)'} />
              {user && (
                <div style={{ 
                  position: 'absolute', 
                  top: '40px', 
                  right: '0', 
                  background: 'var(--surface)', 
                  border: 'var(--border)', 
                  borderRadius: '8px', 
                  padding: '8px', 
                  minWidth: '150px',
                  boxShadow: 'var(--shadow)',
                  zIndex: 1000
                }}>
                  <div style={{ padding: '4px 8px', fontSize: '12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>
                    {user.name}
                  </div>
                  <button 
                    onClick={logout}
                    className="btn"
                    style={{ width: '100%', marginTop: '4px', fontSize: '12px' }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="content">{children}</div>
      </main>
    </div>
  )
}

function Dashboard() {
  const { stats, loading, error, lastUpdated, earthquakes } = useEarthquakes(50, true);

  const getActivityLevel = (count) => {
    if (count === 0) return { level: 'No activity', badge: 'badge primary' };
    if (count <= 5) return { level: 'Low activity', badge: 'badge success' };
    if (count <= 15) return { level: 'Moderate activity', badge: 'badge accent' };
    return { level: 'High activity', badge: 'badge danger' };
  };

  const getMagnitudeLevel = (mag) => {
    if (mag === 0) return { level: 'No data', badge: 'badge primary' };
    if (mag < 4) return { level: 'Light', badge: 'badge success' };
    if (mag < 6) return { level: 'Moderate', badge: 'badge accent' };
    return { level: 'Strong', badge: 'badge danger' };
  };

  const activityLevel = getActivityLevel(stats.totalToday);
  const magnitudeLevel = getMagnitudeLevel(stats.strongestMagnitude);

  if (loading) {
    return (
      <div className="grid">
        <div className="grid grid-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card kpi loading" style={{ height: '120px' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid">
      <div className="grid grid-4">
        <div className="card kpi" style={{ background: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="muted">Today's Earthquakes</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="var(--primary)" strokeWidth="2"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="var(--primary)" strokeWidth="2"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 700, margin: '8px 0' }}>{stats.totalToday}</h2>
          <span className={activityLevel.badge}>{activityLevel.level}</span>
        </div>
        <div className="card kpi" style={{ background: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span className="muted">Strongest Magnitude</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="var(--danger)" strokeWidth="2"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 700, margin: '8px 0' }}>
            {stats.strongestMagnitude > 0 ? `M ${stats.strongestMagnitude.toFixed(1)}` : 'N/A'}
          </h2>
          <span className={magnitudeLevel.badge}>{magnitudeLevel.level}</span>
        </div>
        <div className="card kpi" style={{ background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="muted">Average Magnitude</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#D97706" strokeWidth="2"/>
              <path d="M8 12l4 4 4-4" stroke="#D97706" strokeWidth="2"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 700, margin: '8px 0' }}>
            {stats.averageMagnitude > 0 ? `M ${stats.averageMagnitude.toFixed(1)}` : 'N/A'}
          </h2>
          <span className="badge accent">Recent average</span>
        </div>
        <div className="card kpi" style={{ background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span className="muted">Nearby (50 km)</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="var(--success)" strokeWidth="2"/>
              <path d="M12 6v6l4 2" stroke="var(--success)" strokeWidth="2"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 700, margin: '8px 0' }}>{stats.nearbyEvents}</h2>
          <span className={stats.nearbyEvents > 0 ? 'badge danger' : 'badge primary'}>
            {stats.nearbyEvents > 0 ? 'Events detected' : 'No recent events'}
          </span>
        </div>
      </div>
      {lastUpdated && (
        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <span className="muted" style={{ fontSize: '12px' }}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      )}
        <div className="card" style={{ padding: 16, height: 380 }}>
          <div className="card-header">
            <h3 className="card-title accent">Philippines Map</h3>
            <div className="badge info">Info</div>
          </div>
        <div style={{ width: '100%', height: 320, background: '#0a0f1a', border: 'var(--border)', borderRadius: 10 }} />
      </div>
      <div className="grid grid-2">
        <div className="card" style={{ padding: 16, height: 280 }}>
          <div className="card-header">
            <h3 className="card-title accent">Magnitude Timeline</h3>
            <div className="badge primary">Live</div>
          </div>
          {loading ? (
            <div className="loading" style={{ height: '200px' }}></div>
          ) : (
            <EarthquakeTimelineChart data={earthquakes} />
          )}
        </div>
        <div className="card" style={{ padding: 16, height: 280 }}>
          <div className="card-header">
            <h3 className="card-title accent">Magnitude Distribution</h3>
            <div className="badge success">Analysis</div>
          </div>
          {loading ? (
            <div className="loading" style={{ height: '200px' }}></div>
          ) : (
            <MagnitudeDistributionChart data={earthquakes} />
          )}
        </div>
      </div>
      <div className="grid grid-1">
        <div className="card" style={{ padding: 16, height: 280 }}>
          <div className="card-header">
            <h3 className="card-title accent">Daily Earthquake Count</h3>
            <div className="badge accent">Trend</div>
          </div>
          {loading ? (
            <div className="loading" style={{ height: '200px' }}></div>
          ) : (
            <DailyCountChart data={earthquakes} />
          )}
        </div>
      </div>
    </div>
  )
}

function LiveMonitoring() {
  const [minMag, setMinMag] = useState(0)
  const [maxDepth, setMaxDepth] = useState(700)
  const [filteredEarthquakes, setFilteredEarthquakes] = useState([])
  const { earthquakes, loading, error, refresh } = useEarthquakes(20, true)
  
  const filtered = filteredEarthquakes.length > 0 ? filteredEarthquakes : earthquakes.filter(e => e.mag >= minMag && e.depth <= maxDepth)
  return (
    <div className="grid">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontWeight: 700 }}>Live Monitoring</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="badge" onClick={refresh} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>
      
      {/* Advanced Filters */}
      <AdvancedFilters 
        earthquakes={earthquakes} 
        onFilteredData={setFilteredEarthquakes}
      />
      <div className="card" style={{ padding: 16 }}>
        <div className="card-header">
          <h3 className="card-title accent">Philippines Map (Live)</h3>
          <div className="badge primary">Leaflet map</div>
        </div>
        <div className="map-container" style={{ width: '100%', height: 560 }}>
          <MapContainer
            center={[12.8797, 121.7740]}
            zoom={6}
            minZoom={5}
            maxZoom={12}
            scrollWheelZoom
            style={{ width: '100%', height: '100%' }}
            maxBounds={[[4.5, 116.0], [21.5, 127.5]]}
            maxBoundsViscosity={1.0}
            worldCopyJump={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              noWrap
            />
            {filtered.map(e => (
              <CircleMarker key={e.id} center={[e.lat, e.lng]} radius={4 + e.mag}
                className="marker"
                pathOptions={{ color: e.mag >= 5 ? '#DC2626' : e.mag >= 4 ? '#F97316' : '#2563EB', weight: 2, fillOpacity: 0.6 }}>
                <Popup>
                  <div style={{ minWidth: 180 }}>
                    <strong>M {e.mag.toFixed(1)}</strong>
                    <div className="muted">Depth: {e.depth} km</div>
                    <div>{e.place}</div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  )
}

function Placeholder({ title, note }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="card-header">
        <h3 className="card-title accent">{title}</h3>
        <button className="btn">Action</button>
      </div>
      <p className="muted" style={{ marginTop: 4 }}>{note}</p>
      <div style={{ height: 320, marginTop: 12, background: '#0a0f1a', border: 'var(--border)', borderRadius: 10 }} />
    </div>
  )
}

function Feed() {
  const [filteredEarthquakes, setFilteredEarthquakes] = useState([])
  const { earthquakes, loading, refresh } = useEarthquakes(10, true)
  
  const getTimeAgo = (dateString) => {
    const now = new Date()
    const eventTime = new Date(dateString)
    const diffMs = now - eventTime
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }
  
  const getSeverityLevel = (mag) => {
    if (mag >= 6) return 'high'
    if (mag >= 4) return 'medium'
    return 'low'
  }
  
  const badgeFor = (lvl) => lvl === 'high' ? 'badge danger' : lvl === 'medium' ? 'badge accent' : 'badge success'
  
  const displayEarthquakes = filteredEarthquakes.length > 0 ? filteredEarthquakes : earthquakes;
  
  return (
    <div className="grid">
      <AdvancedFilters 
        earthquakes={earthquakes} 
        onFilteredData={setFilteredEarthquakes}
      />
    <div className="card" style={{ padding: 16 }}>
      <div className="card-header">
        <h3 className="card-title accent">Real-Time Feed</h3>
        <div style={{ display:'flex', gap:8 }}>
            <button className="btn primary" onClick={refresh} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
        </div>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Magnitude</th>
            <th>Depth</th>
            <th>Location</th>
            <th>Severity</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                <div className="loading" style={{ height: '20px' }}></div>
              </td>
            </tr>
          ) : displayEarthquakes.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>
                No earthquake data available
              </td>
            </tr>
          ) : (
            displayEarthquakes.slice(0, 10).map(row => {
              const severity = getSeverityLevel(row.mag)
              return (
                <tr key={row.id} className={severity === 'high' ? 'alert' : ''}>
                  <td>{getTimeAgo(row.time)}</td>
              <td><span className="badge primary">M {row.mag.toFixed(1)}</span></td>
              <td>{row.depth} km</td>
              <td>{row.place}</td>
                  <td><span className={badgeFor(severity)}>{severity}</span></td>
            </tr>
              )
            })
          )}
        </tbody>
      </table>
      </div>
    </div>
  )
}

function Risk() {
  const provinces = [
    { name: 'Albay', level: 'high' },
    { name: 'Batangas', level: 'medium' },
    { name: 'Cebu', level: 'low' },
  ]
  const colorFor = (lvl) => lvl === 'high' ? '#DC2626' : lvl === 'medium' ? '#F97316' : '#16A34A'
  return (
    <div className="grid">
      <div className="card" style={{ padding:16 }}>
        <div className="card-header">
          <h3 className="card-title accent">Risk Overview</h3>
          <div className="legend">
            <div className="key"><span className="dot" style={{ background:'#16A34A' }}></span><span>Low</span></div>
            <div className="key"><span className="dot" style={{ background:'#F97316' }}></span><span>Medium</span></div>
            <div className="key"><span className="dot" style={{ background:'#DC2626' }}></span><span>High</span></div>
          </div>
        </div>
        <div style={{ width:'100%', height:360, background:'#E2E8F0', border:'var(--border)', borderRadius:10 }} />
      </div>
      <div className="card" style={{ padding:16 }}>
        <div className="card-header">
          <h3 className="card-title accent">Provinces</h3>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Province</th>
              <th>Risk</th>
            </tr>
          </thead>
          <tbody>
            {provinces.map(p => (
              <tr key={p.name}>
                <td>{p.name}</td>
                <td><span className={p.level === 'high' ? 'badge danger' : p.level === 'medium' ? 'badge accent' : 'badge success'} style={{ textTransform:'capitalize' }}>{p.level}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
function Volcano() { return <Placeholder title="Volcano Advisories" note="Card-based advisories with alert levels and recent activity." /> }
function Alerts() { return <Placeholder title="Alerts" note="Geolocation-based preferences and test alert feature." /> }
function Analytics() {
  const { earthquakes, loading, stats } = useEarthquakes(100, true);

  return (
    <div className="grid">
      <div className="grid grid-2">
        <div className="card" style={{ padding: 16, height: 400 }}>
          <div className="card-header">
            <h3 className="card-title accent">Depth vs Magnitude Analysis</h3>
            <div className="badge info">Correlation</div>
          </div>
          {loading ? (
            <div className="loading" style={{ height: '320px' }}></div>
          ) : (
            <DepthMagnitudeChart data={earthquakes} />
          )}
        </div>
        <div className="card" style={{ padding: 16, height: 400 }}>
          <div className="card-header">
            <h3 className="card-title accent">Location Frequency</h3>
            <div className="badge primary">Top Areas</div>
          </div>
          {loading ? (
            <div className="loading" style={{ height: '320px' }}></div>
          ) : (
            <LocationFrequencyChart data={earthquakes} />
          )}
        </div>
      </div>
      <div className="grid grid-2">
        <div className="card" style={{ padding: 16, height: 400 }}>
          <div className="card-header">
            <h3 className="card-title accent">Magnitude Distribution</h3>
            <div className="badge success">Detailed</div>
          </div>
          {loading ? (
            <div className="loading" style={{ height: '320px' }}></div>
          ) : (
            <MagnitudeDistributionChart data={earthquakes} />
          )}
        </div>
        <div className="card" style={{ padding: 16, height: 400 }}>
          <div className="card-header">
            <h3 className="card-title accent">Daily Trends</h3>
            <div className="badge accent">7-Day View</div>
          </div>
          {loading ? (
            <div className="loading" style={{ height: '320px' }}></div>
          ) : (
            <DailyCountChart data={earthquakes} />
          )}
        </div>
      </div>
      <div className="card" style={{ padding: 16 }}>
        <div className="card-header">
          <h3 className="card-title accent">Analytics Summary</h3>
          <div className="badge primary">Insights</div>
        </div>
        <div className="grid grid-4">
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)' }}>{stats.totalToday}</h3>
            <p className="muted">Today's Events</p>
          </div>
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--danger)' }}>{stats.strongestMagnitude.toFixed(1)}</h3>
            <p className="muted">Strongest Magnitude</p>
          </div>
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent)' }}>{stats.averageMagnitude.toFixed(1)}</h3>
            <p className="muted">Average Magnitude</p>
          </div>
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success)' }}>{stats.nearbyEvents}</h3>
            <p className="muted">Nearby Events</p>
          </div>
        </div>
      </div>
    </div>
  );
}
function Chatbot() {
  const { messages, isTyping, inputValue, setInputValue, sendMessage, sendSuggestion, clearChat } = useChatbot();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="card" style={{ padding:0, height:'72vh', display:'grid', gridTemplateRows:'auto 1fr auto', background: 'linear-gradient(135deg, #FFF7ED, #F8FAFC)' }}>
      <div className="chat-hero">
        <div className="avatar" style={{ position: 'relative', animation: 'pulse 3s infinite' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2a7 7 0 0 0-7 7v2a4 4 0 0 0-3 4v2a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-2a4 4 0 0 0-3-4V9a7 7 0 0 0-7-7Zm-4 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm8 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/>
          </svg>
          <span className="dot" style={{ background: '#16A34A', animation: 'pulse 2s infinite' }}></span>
        </div>
        <div className="title" style={{ background: 'linear-gradient(135deg, var(--primary), #FDBA74)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Hi! I'm ISA</div>
        <div className="subtitle">Welcome to ALISTO's Intelligent Seismic Assistant. I can help with real-time earthquakes, volcano advisories, and risk levels across the Philippines.</div>
        <div className="hint" style={{ background: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.2)' }}>Try asking me about: today's quakes, nearest active volcano, or provincial risk.</div>
      </div>
      <div className="chat" style={{ padding:'0 20px 16px 20px' }}>
        <div className="messages" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {messages.map((msg, index) => (
            <div key={msg.id} className={`row ${msg.role === 'user' ? 'end' : ''}`} style={{ marginBottom: '12px' }}>
              <div className={`bubble ${msg.role === 'user' ? 'user' : 'isa'}`} style={{ 
                background: msg.role === 'user' 
                  ? 'linear-gradient(135deg, #EFF6FF, #DBEAFE)' 
                  : 'linear-gradient(135deg, #FFF7ED, #FFEDD5)', 
                border: msg.role === 'user' 
                  ? '1px solid rgba(37, 99, 235, 0.2)'
                  : '1px solid rgba(249, 115, 22, 0.2)',
                boxShadow: msg.role === 'user' 
                  ? '0 4px 12px rgba(37, 99, 235, 0.1)'
                  : '0 4px 12px rgba(249, 115, 22, 0.1)',
                whiteSpace: 'pre-line'
              }}>
                {msg.message}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="row">
              <div className="bubble isa" style={{ 
                background: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)', 
                border: '1px solid rgba(249, 115, 22, 0.2)',
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>ISA is typing</span>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    <div style={{ width: '4px', height: '4px', background: 'var(--primary)', borderRadius: '50%', animation: 'pulse 1s infinite' }}></div>
                    <div style={{ width: '4px', height: '4px', background: 'var(--primary)', borderRadius: '50%', animation: 'pulse 1s infinite 0.2s' }}></div>
                    <div style={{ width: '4px', height: '4px', background: 'var(--primary)', borderRadius: '50%', animation: 'pulse 1s infinite 0.4s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {messages.length > 1 && messages[messages.length - 1]?.suggestions && (
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop: '12px' }}>
              {messages[messages.length - 1].suggestions.map(s => (
                <span key={s} className="chip" style={{ 
                  background: 'rgba(249, 115, 22, 0.1)', 
                  border: '1px solid rgba(249, 115, 22, 0.2)',
                  color: '#C2410C',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onClick={() => sendSuggestion(s)}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(249, 115, 22, 0.2)'
                  e.target.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(249, 115, 22, 0.1)'
                  e.target.style.transform = 'translateY(0)'
                }}>
                  {s}
                </span>
            ))}
          </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="composer" style={{ 
          background: 'rgba(255, 255, 255, 0.8)', 
          padding: '12px', 
          borderRadius: '16px',
          border: '1px solid rgba(249, 115, 22, 0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <input 
            className="input" 
            placeholder="Ask ISA about seismic updates..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isTyping}
            style={{ 
              flex:1, 
              border: 'none', 
              background: 'transparent',
              fontSize: '14px'
            }} 
          />
          <button 
            type="submit"
            className="btn primary" 
            disabled={isTyping || !inputValue.trim()}
            style={{ 
              background: 'linear-gradient(135deg, var(--primary), #FDBA74)',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 16px',
              opacity: isTyping || !inputValue.trim() ? 0.6 : 1
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Send
          </button>
        </form>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
          <button 
            onClick={clearChat}
            className="btn" 
            style={{ fontSize: '12px', padding: '4px 8px' }}
          >
            Clear Chat
          </button>
        </div>
      </div>
    </div>
  )
}
function Settings() {
  return (
    <div className="grid">
      <NotificationSettings />
      <div className="card" style={{ padding: '20px' }}>
        <div className="card-header">
          <h3 className="card-title accent">General Settings</h3>
        </div>
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              Theme
            </label>
            <select className="input" style={{ width: '100%' }}>
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              Units
            </label>
            <select className="input" style={{ width: '100%' }}>
              <option value="metric">Metric (km, °C)</option>
              <option value="imperial">Imperial (miles, °F)</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              Language
            </label>
            <select className="input" style={{ width: '100%' }}>
              <option value="en">English</option>
              <option value="fil">Filipino</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
function About() { return <Placeholder title="About" note="Project info, sources, limitations, credits." /> }
function LoginPage() { 
  const navigate = useNavigate();
  return <Login onSuccess={() => navigate('/')} />;
}
function RegisterPage() { 
  const navigate = useNavigate();
  return <Register onSuccess={() => navigate('/')} />;
}

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/live" element={<LiveMonitoring />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/risk" element={<Risk />} />
        <Route path="/volcano" element={<Volcano />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </AppShell>
  )
}

