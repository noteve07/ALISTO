import { useMemo, useState } from 'react'
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './App.css'

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
    { to: '/chatbot', label: 'ISA Chatbot', icon: IconChat },
  ]), [])

  return (
    <div className="app-shell">
      <aside className="sidebar">
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="badge success">● System Online</span>
            <input placeholder="Search / Filter" className="input" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 999, background: 'linear-gradient(135deg, #FDBA74, #F59E0B)' }} />
          </div>
        </div>
        <div className="content">{children}</div>
      </main>
    </div>
  )
}

function Dashboard() {
  return (
    <div className="grid">
      <div className="grid grid-4">
        <div className="card kpi">
          <span className="muted">Today’s Earthquakes</span>
          <h2 style={{ fontSize: 28, fontWeight: 700 }}>12</h2>
          <span className="badge success">Low activity</span>
        </div>
        <div className="card kpi">
          <span className="muted">Strongest Magnitude</span>
          <h2 style={{ fontSize: 28, fontWeight: 700 }}>M 5.6</h2>
          <span className="badge accent">Moderate</span>
        </div>
        <div className="card kpi">
          <span className="muted">Active Volcano Advisories</span>
          <h2 style={{ fontSize: 28, fontWeight: 700 }}>3</h2>
          <span className="badge danger">Multiple alerts</span>
        </div>
        <div className="card kpi">
          <span className="muted">Nearby (50 km)</span>
          <h2 style={{ fontSize: 28, fontWeight: 700 }}>0</h2>
          <span className="badge primary">No recent events</span>
        </div>
      </div>
        <div className="card" style={{ padding: 16, height: 380 }}>
          <div className="card-header">
            <h3 className="card-title accent">Philippines Map</h3>
            <div className="badge info">Info</div>
          </div>
        <div style={{ width: '100%', height: 320, background: '#0a0f1a', border: 'var(--border)', borderRadius: 10 }} />
      </div>
      <div className="grid grid-2">
        <div className="card" style={{ padding: 16, height: 220 }}>
          <div className="card-header"><h3 className="card-title accent">Last 24h</h3></div>
          <div style={{ width: '100%', height: 150, background: '#0a0f1a', border: 'var(--border)', borderRadius: 10 }} />
        </div>
        <div className="card" style={{ padding: 16, height: 220 }}>
          <div className="card-header"><h3 className="card-title accent">Last 7d</h3></div>
          <div style={{ width: '100%', height: 150, background: '#0a0f1a', border: 'var(--border)', borderRadius: 10 }} />
        </div>
      </div>
    </div>
  )
}

function LiveMonitoring() {
  const [minMag, setMinMag] = useState(0)
  const [maxDepth, setMaxDepth] = useState(700)
  // Sample events; replace with API data
  const events = [
    { id: 1, lat: 14.5995, lng: 120.9842, mag: 3.2, depth: 20, place: 'Near Manila' },
    { id: 2, lat: 13.7563, lng: 121.0583, mag: 4.8, depth: 45, place: 'Mindoro Strait' },
    { id: 3, lat: 9.307, lng: 123.305, mag: 5.6, depth: 10, place: 'Negros Oriental' },
  ]
  const filtered = events.filter(e => e.mag >= minMag && e.depth <= maxDepth)
  return (
    <div className="grid">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontWeight: 700 }}>Live Monitoring</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="badge">Locate Me</button>
          <div className="badge accent" style={{ gap: 12 }}>
            <span>Min M</span>
            <input type="range" min="0" max="7" value={minMag} onChange={e => setMinMag(Number(e.target.value))} />
            <span>{minMag.toFixed(1)}</span>
          </div>
          <div className="badge" style={{ gap: 12 }}>
            <span>Max Depth</span>
            <input type="range" min="0" max="700" step="10" value={maxDepth} onChange={e => setMaxDepth(Number(e.target.value))} />
            <span>{maxDepth} km</span>
          </div>
        </div>
      </div>
      <div className="card" style={{ padding: 16 }}>
        <div className="card-header">
          <h3 className="card-title accent">Philippines Map (Live)</h3>
          <div className="badge primary">Leaflet map</div>
        </div>
        <div style={{ width: '100%', height: 560, border: 'var(--border)', borderRadius: 10, overflow: 'hidden' }}>
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
  const sample = [
    { id: 1, time: '2m ago', mag: 5.1, depth: 12, place: 'Eastern Samar', level: 'high' },
    { id: 2, time: '14m ago', mag: 4.2, depth: 33, place: 'Davao Occidental', level: 'medium' },
    { id: 3, time: '28m ago', mag: 3.1, depth: 18, place: 'Batangas', level: 'low' },
  ]
  const badgeFor = (lvl) => lvl === 'high' ? 'badge danger' : lvl === 'medium' ? 'badge accent' : 'badge success'
  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="card-header">
        <h3 className="card-title accent">Real-Time Feed</h3>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn">Filters</button>
          <button className="btn primary">Refresh</button>
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
          {sample.map(row => (
            <tr key={row.id} className={row.level === 'high' ? 'alert' : ''}>
              <td>{row.time}</td>
              <td><span className="badge primary">M {row.mag.toFixed(1)}</span></td>
              <td>{row.depth} km</td>
              <td>{row.place}</td>
              <td><span className={badgeFor(row.level)}>{row.level}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
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
function Analytics() { return <Placeholder title="Analytics" note="Historical stats and charts since 2018." /> }
function Chatbot() {
  const suggestions = [
    "Show today’s quakes",
    "What’s the nearest active volcano?",
    "Risk level for Cebu",
  ]
  return (
    <div className="card" style={{ padding:0, height:'72vh', display:'grid', gridTemplateRows:'auto 1fr auto' }}>
      <div className="chat-hero">
        <div className="avatar">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a7 7 0 0 0-7 7v2a4 4 0 0 0-3 4v2a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-2a4 4 0 0 0-3-4V9a7 7 0 0 0-7-7Zm-4 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm8 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/></svg>
          <span className="dot"></span>
        </div>
        <div className="title">Hi! I'm ISA</div>
        <div className="subtitle">Welcome to ALISTO's Intelligent Seismic Assistant. I can help with real-time earthquakes, volcano advisories, and risk levels across the Philippines.</div>
        <div className="hint">Try asking me about: today’s quakes, nearest active volcano, or provincial risk.</div>
      </div>
      <div className="chat" style={{ padding:'0 16px 12px 16px' }}>
        <div className="messages">
          <div className="row"><div className="bubble isa">How can I help you today?</div></div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {suggestions.map(s => (
              <span key={s} className="chip">{s}</span>
            ))}
          </div>
        </div>
        <div className="composer">
          <input className="input" placeholder="Ask ISA about seismic updates..." style={{ flex:1 }} />
          <button className="btn primary">Send</button>
        </div>
      </div>
    </div>
  )
}
function Settings() { return <Placeholder title="Settings" note="Profile, theme toggle, location defaults, data units." /> }
function About() { return <Placeholder title="About" note="Project info, sources, limitations, credits." /> }
function Login() { return <Placeholder title="Login" note="Simple, secure login with app branding." /> }
function Register() { return <Placeholder title="Register" note="Create your account to enable alerts and personalization." /> }

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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </AppShell>
  )
}
