import React from 'react';

function Dashboard() {
  return (
    <div className="full-height-grid">
      {/* First row: KPI cards */}
      <div className="grid grid-4">
        <div className="card kpi">
          <span className="muted">Today's Earthquakes</span>
          <h2 style={{ fontSize: 32, fontWeight: 700 }}>12</h2>
          <span className="badge success">Low activity</span>
        </div>
        <div className="card kpi">
          <span className="muted">Strongest Magnitude</span>
          <h2 style={{ fontSize: 32, fontWeight: 700 }}>M 5.6</h2>
          <span className="badge accent">Moderate</span>
        </div>
        <div className="card kpi">
          <span className="muted">Active Volcano Advisories</span>
          <h2 style={{ fontSize: 32, fontWeight: 700 }}>3</h2>
          <span className="badge danger">Multiple alerts</span>
        </div>
        <div className="card kpi">
          <span className="muted">Nearby (50 km)</span>
          <h2 style={{ fontSize: 32, fontWeight: 700 }}>0</h2>
          <span className="badge primary">No recent events</span>
        </div>
      </div>
      
      {/* Second row: 3 stat cards */}
      <div className="grid grid-3">
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(249, 115, 22, 0.1)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#F97316" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="muted">Risk Level</span>
            <h3 style={{ fontSize: 24, fontWeight: 600, color: '#F97316' }}>Moderate</h3>
            <div className="stat-trend up">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>+12% from yesterday</span>
            </div>
          </div>
        </div>
        
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="muted">Active Advisories</span>
            <h3 style={{ fontSize: 24, fontWeight: 600, color: '#3B82F6' }}>24 Regions</h3>
            <div className="stat-trend down">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 7L7 17M7 17H16M7 17V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>-3% from last week</span>
            </div>
          </div>
        </div>
        
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M20.6179 5.98434C20.4132 5.99472 20.2072 5.99997 20 5.99997C16.9265 5.99997 14.123 4.84453 11.9999 2.94434C9.87691 4.84446 7.07339 5.99985 4 5.99985C3.79277 5.99985 3.58678 5.9946 3.38213 5.98422C3.1327 6.94783 3 7.95842 3 9.00001C3 14.5915 6.82432 19.2898 12 20.622C17.1757 19.2898 21 14.5915 21 9.00001C21 7.95847 20.8673 6.94791 20.6179 5.98434Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="muted">Safety Rating</span>
            <h3 style={{ fontSize: 24, fontWeight: 600, color: '#10B981' }}>92% Safe</h3>
            <div className="stat-trend up">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>+4% from last month</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Third row: Line chart and pie chart */}
      <div className="grid grid-2">
        {/* Line Chart */}
        <div className="card" style={{ padding: 16 }}>
          <div className="card-header">
            <h3 className="card-title accent">Seismic Activity</h3>
            <div className="badge info">Last 30 days</div>
          </div>
          <div className="analytics-chart">
            <div className="line-chart">
              <div className="line-path"></div>
              <div className="line-markers">
                <div className="line-marker" style={{ bottom: '20%', left: '10%' }}></div>
                <div className="line-marker" style={{ bottom: '35%', left: '20%' }}></div>
                <div className="line-marker" style={{ bottom: '28%', left: '30%' }}></div>
                <div className="line-marker" style={{ bottom: '45%', left: '40%' }}></div>
                <div className="line-marker" style={{ bottom: '38%', left: '50%' }}></div>
                <div className="line-marker" style={{ bottom: '62%', left: '60%' }}></div>
                <div className="line-marker" style={{ bottom: '75%', left: '70%' }}></div>
                <div className="line-marker active" style={{ bottom: '58%', left: '80%' }}></div>
                <div className="line-marker" style={{ bottom: '40%', left: '90%' }}></div>
              </div>
              <div className="line-grid">
                <div className="line-grid-row"></div>
                <div className="line-grid-row"></div>
                <div className="line-grid-row"></div>
                <div className="line-grid-row"></div>
              </div>
              <div className="chart-y-axis">
                <div>M 6.0</div>
                <div>M 4.0</div>
                <div>M 2.0</div>
                <div>M 0</div>
              </div>
              <div className="chart-x-axis">
                <div>Sep 15</div>
                <div>Sep 22</div>
                <div>Sep 29</div>
                <div>Oct 6</div>
                <div>Oct 13</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Pie Chart */}
        <div className="card" style={{ padding: 16 }}>
          <div className="card-header">
            <h3 className="card-title accent">Event Distribution</h3>
            <div className="badge primary">By Region</div>
          </div>
          <div className="pie-chart-container">
            <div className="pie-chart"></div>
            <div className="pie-chart-legend">
              <div className="pie-legend-item">
                <div className="pie-legend-color" style={{ background: 'var(--primary)' }}></div>
                <div className="pie-legend-label">Luzon</div>
                <div className="pie-legend-value">45%</div>
              </div>
              <div className="pie-legend-item">
                <div className="pie-legend-color" style={{ background: 'var(--info)' }}></div>
                <div className="pie-legend-label">Visayas</div>
                <div className="pie-legend-value">20%</div>
              </div>
              <div className="pie-legend-item">
                <div className="pie-legend-color" style={{ background: 'var(--success)' }}></div>
                <div className="pie-legend-label">Mindanao</div>
                <div className="pie-legend-value">15%</div>
              </div>
              <div className="pie-legend-item">
                <div className="pie-legend-color" style={{ background: 'var(--accent)' }}></div>
                <div className="pie-legend-label">Other</div>
                <div className="pie-legend-value">20%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;