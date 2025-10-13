import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

// Color scheme for charts
const COLORS = {
  primary: '#F97316',
  secondary: '#FDBA74',
  success: '#16A34A',
  danger: '#DC2626',
  accent: '#F59E0B',
  info: '#2563EB'
};

// Earthquake magnitude over time chart
export const EarthquakeTimelineChart = ({ data }) => {
  const chartData = data?.slice(0, 10).map((eq, index) => ({
    time: new Date(eq.time).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    magnitude: eq.mag,
    depth: eq.depth,
    name: eq.place.split(',')[0] // First part of location
  })) || [];

  return (
    <div style={{ width: '100%', height: '200px' }}>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
          <XAxis 
            dataKey="time" 
            stroke="var(--muted)"
            fontSize={12}
          />
          <YAxis 
            stroke="var(--muted)"
            fontSize={12}
            domain={[0, 8]}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              boxShadow: 'var(--shadow)'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="magnitude" 
            stroke={COLORS.primary} 
            strokeWidth={3}
            dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: COLORS.primary, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Magnitude distribution chart
export const MagnitudeDistributionChart = ({ data }) => {
  const distribution = data?.reduce((acc, eq) => {
    const range = eq.mag < 3 ? 'Light (<3)' : 
                  eq.mag < 5 ? 'Moderate (3-5)' : 
                  eq.mag < 7 ? 'Strong (5-7)' : 'Major (7+)';
    acc[range] = (acc[range] || 0) + 1;
    return acc;
  }, {}) || {};

  const chartData = Object.entries(distribution).map(([name, value]) => ({
    name,
    value,
    color: name.includes('Light') ? COLORS.success :
           name.includes('Moderate') ? COLORS.accent :
           name.includes('Strong') ? COLORS.primary : COLORS.danger
  }));

  return (
    <div style={{ width: '100%', height: '200px' }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              boxShadow: 'var(--shadow)'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Depth vs Magnitude scatter chart
export const DepthMagnitudeChart = ({ data }) => {
  const chartData = data?.map(eq => ({
    magnitude: eq.mag,
    depth: eq.depth,
    location: eq.place.split(',')[0]
  })) || [];

  return (
    <div style={{ width: '100%', height: '200px' }}>
      <ResponsiveContainer>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
          <XAxis 
            dataKey="magnitude" 
            stroke="var(--muted)"
            fontSize={12}
            label={{ value: 'Magnitude', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            dataKey="depth" 
            stroke="var(--muted)"
            fontSize={12}
            label={{ value: 'Depth (km)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              boxShadow: 'var(--shadow)'
            }}
            formatter={(value, name) => [value, name === 'depth' ? 'Depth (km)' : 'Magnitude']}
            labelFormatter={(label) => `Magnitude: ${label}`}
          />
          <Area 
            type="monotone" 
            dataKey="depth" 
            stroke={COLORS.info} 
            fill={COLORS.info}
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Daily earthquake count chart
export const DailyCountChart = ({ data }) => {
  const dailyData = data?.reduce((acc, eq) => {
    const date = new Date(eq.time).toDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {}) || {};

  const chartData = Object.entries(dailyData)
    .slice(-7) // Last 7 days
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      count
    }));

  return (
    <div style={{ width: '100%', height: '200px' }}>
      <ResponsiveContainer>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
          <XAxis 
            dataKey="date" 
            stroke="var(--muted)"
            fontSize={12}
          />
          <YAxis 
            stroke="var(--muted)"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              boxShadow: 'var(--shadow)'
            }}
          />
          <Bar 
            dataKey="count" 
            fill={COLORS.primary}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Location frequency chart
export const LocationFrequencyChart = ({ data }) => {
  const locationData = data?.reduce((acc, eq) => {
    const location = eq.place.split(',')[0].trim();
    acc[location] = (acc[location] || 0) + 1;
    return acc;
  }, {}) || {};

  const chartData = Object.entries(locationData)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8) // Top 8 locations
    .map(([location, count]) => ({
      location: location.length > 12 ? location.substring(0, 12) + '...' : location,
      count
    }));

  return (
    <div style={{ width: '100%', height: '200px' }}>
      <ResponsiveContainer>
        <BarChart data={chartData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
          <XAxis 
            type="number"
            stroke="var(--muted)"
            fontSize={12}
          />
          <YAxis 
            type="category"
            dataKey="location" 
            stroke="var(--muted)"
            fontSize={12}
            width={80}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              boxShadow: 'var(--shadow)'
            }}
          />
          <Bar 
            dataKey="count" 
            fill={COLORS.accent}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
