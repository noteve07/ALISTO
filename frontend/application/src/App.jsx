import { useMemo, useState } from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';
import Dashboard from './Dashboard';
import LiveMonitoring from './LiveMonitoring';

function NavItem({ icon, label, to }) {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
      style={{
        display: 'flex', 
        alignItems: 'center', 
        gap: 12, 
        padding: '10px 12px',
      }}
    >
      {icon ? <span className="nav-item-icon">{icon}</span> : null}
      <span>{label}</span>
    </NavLink>
  );
}

// Icon component for better performance and to avoid React Hook issues
function Icon({ type }) {
  switch(type) {
    case 'dashboard':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 5a1 1 0 011-1h5a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M14 5a1 1 0 011-1h5a1 1 0 011 1v4a1 1 0 01-1 1h-5a1 1 0 01-1-1V5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M4 16a1 1 0 011-1h5a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M14 13a1 1 0 011-1h5a1 1 0 011 1v7a1 1 0 01-1 1h-5a1 1 0 01-1-1v-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'map':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 6.75V15M15 9v8.25M15.75 19.5l-6.75-3-6 3V4.5l6-3 6.75 3 6-3v15l-6 3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'risk':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 9v4m0 4h.01M8.997 5.235a2.21 2.21 0 013.702 0l5.546 9.313a2.509 2.509 0 01-2.148 3.777H7.601a2.509 2.509 0 01-2.148-3.777l5.544-9.313z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'chat':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21c4.418 0 8-3.134 8-7 0-3.866-3.582-7-8-7s-8 3.134-8 7c0 1.282.397 2.478 1.079 3.483.039.065.078.13.118.195a.585.585 0 01.07.486l-.442 1.642a.618.618 0 00.797.726l2.788-1.024a.585.585 0 01.456.026C8.816 20.151 10.35 21 12 21z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9.5 14h.01m2.49 0h.01m2.49 0h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}

function AppShell({ children }) {
  const nav = useMemo(() => ([
    { to: '/', label: 'Dashboard', icon: <Icon type="dashboard" /> },
    { to: '/live', label: 'Live Monitoring', icon: <Icon type="map" /> },
    { to: '/risk', label: 'Risk Evaluation', icon: <Icon type="risk" /> },
    { to: '/chatbot', label: 'ISA Chatbot', icon: <Icon type="chat" /> },
  ]), []);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="sidebar-logo-text">ALISTO</span>
        </div>
        
        <div className="sidebar-section">
          <div className="sidebar-section-title">Main Navigation</div>
          <div className="sidebar-nav">
            {nav.map(item => (
              <NavItem key={item.label} icon={item.icon} label={item.label} to={item.to} />
            ))}
          </div>
        </div>
        
        <div className="sidebar-section">
          <div className="sidebar-section-title">Monitoring</div>
          <div className="sidebar-nav">
            <NavItem 
              icon={<Icon type="risk" />} 
              label="Alert Settings" 
              to="/alerts" 
            />
          </div>
        </div>
      </aside>
      
      <main style={{ display: 'grid', gridTemplateRows: 'var(--header-height) 1fr', height: '100vh', overflow: 'hidden', width: '100%' }}>
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="badge success">● System Online</span>
            <div className="search-container">
              <input placeholder="Search..." className="input" style={{
                padding: "10px 16px",
                borderRadius: "8px",
                width: "240px",
                fontSize: "14px",
                border: "1px solid rgba(249, 115, 22, 0.1)",
                backgroundColor: "#FEF5EB"
              }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button className="btn secondary" style={{padding: "8px 12px"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div style={{ 
              width: "40px", 
              height: "40px", 
              borderRadius: "50%", 
              background: "linear-gradient(135deg, #FDBA74, #F97316)", 
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "16px"
            }}>
              AD
            </div>
          </div>
        </div>
        
        <div className="content" style={{ flex: 1, width: '100%', height: '100%' }}>{children}</div>
      </main>
    </div>
  );
}

function Feed() {
  const sample = [
    { id: 1, time: '2m ago', mag: 5.1, depth: 12, place: 'Eastern Samar', level: 'high' },
    { id: 2, time: '14m ago', mag: 4.2, depth: 33, place: 'Davao Occidental', level: 'medium' },
    { id: 3, time: '28m ago', mag: 3.1, depth: 18, place: 'Batangas', level: 'low' }
  ];
  
  const badgeFor = (lvl) => lvl === 'high' ? 'badge danger' : lvl === 'medium' ? 'badge accent' : 'badge success';
  
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
  );
}

function Risk() {
  const provinces = [
    { name: 'Albay', level: 'high' },
    { name: 'Batangas', level: 'medium' },
    { name: 'Cebu', level: 'low' }
  ];
  
  const colorFor = (lvl) => lvl === 'high' ? '#DC2626' : lvl === 'medium' ? '#F97316' : '#16A34A';
  
  return (
    <div className="full-height-grid">
      <div className="card map-container" style={{ padding:16 }}>
        <div className="card-header">
          <h3 className="card-title accent">Risk Overview</h3>
          <div className="legend">
            <div className="key"><span className="dot" style={{ background: colorFor('low') }}></span><span>Low</span></div>
            <div className="key"><span className="dot" style={{ background: colorFor('medium') }}></span><span>Medium</span></div>
            <div className="key"><span className="dot" style={{ background: colorFor('high') }}></span><span>High</span></div>
          </div>
        </div>
        <div className="map-content" style={{ background:'#E2E8F0', position: 'relative', minHeight: '400px' }} />
      </div>
      <div className="card" style={{ padding:16, height:'auto' }}>
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
  );
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
  );
}

function Volcano() { 
  return <Placeholder title="Volcano Advisories" note="Card-based advisories with alert levels and recent activity." />;
}

function Alerts() { 
  return <Placeholder title="Alerts" note="Geolocation-based preferences and test alert feature." />; 
}

function Analytics() { 
  return <Placeholder title="Analytics" note="Historical stats and charts since 2018." />; 
}

function Chatbot() {
  const suggestions = [
    "Show today's quakes",
    "What's the nearest active volcano?",
    "Risk level for Cebu"
  ];
  
  return (
    <div className="card" style={{ padding:0, height:'100%', display:'grid', gridTemplateRows:'auto 1fr auto' }}>
      <div className="chat-hero">
        <div className="avatar">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a7 7 0 0 0-7 7v2a4 4 0 0 0-3 4v2a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-2a4 4 0 0 0-3-4V9a7 7 0 0 0-7-7Zm-4 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm8 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/></svg>
          <span className="dot"></span>
        </div>
        <div className="title">Hi! I'm ISA</div>
        <div className="subtitle">Welcome to ALISTO's Intelligent Seismic Assistant. I can help with real-time earthquakes, volcano advisories, and risk levels across the Philippines.</div>
        <div className="hint">Try asking me about: today's quakes, nearest active volcano, or provincial risk.</div>
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
  );
}

function Settings() { 
  return <Placeholder title="Settings" note="Profile, theme toggle, location defaults, data units." />; 
}

function About() { 
  return <Placeholder title="About" note="Project info, sources, limitations, credits." />; 
}

function Login() { 
  return <Placeholder title="Login" note="Simple, secure login with app branding." />; 
}

function Register() { 
  return <Placeholder title="Register" note="Create your account to enable alerts and personalization." />; 
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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </AppShell>
  );
}