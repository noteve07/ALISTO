# Live Earthquake Monitoring

This feature implements real-time earthquake monitoring using Supabase subscriptions instead of polling API endpoints.

## Features

- **Real-time Updates**: Live subscription to `earthquakes` table in Supabase
- **Interactive Map**: Leaflet-based map with earthquake markers
- **Statistics Dashboard**: Live statistics showing total, max magnitude, average, and recent earthquakes
- **Visual Indicators**: Color-coded markers based on magnitude with animated latest earthquake
- **Responsive Design**: Works on desktop and mobile devices

## Architecture

### Components

- **LiveMonitoringPage**: Main page component that orchestrates the earthquake monitoring
- **MapView**: Leaflet map container with earthquake markers
- **EarthquakeMarker**: Individual earthquake markers with popups and animations
- **EarthquakeStats**: Statistics panel showing live earthquake data
- **LoadingOverlay**: Loading indicator during initial data fetch

### Hooks

- **useEarthquakeData**: Main hook that fetches initial data and manages earthquake state
- **useRealtimeEarthquakes**: Supabase real-time subscription hook for live updates

### Utils

- **supabaseClient**: Configured Supabase client with real-time enabled
- **earthquakeUtils**: Utility functions for earthquake data processing and formatting

## Database Schema

The feature expects a `earthquakes` table with the following structure:

```sql
create table public.earthquakes (
  eq_id character varying(64) not null,
  datetime timestamp without time zone not null,
  latitude double precision not null,
  longitude double precision not null,
  coordinates geometry null,
  magnitude double precision not null,
  depth integer null,
  location text null,
  province_id integer null,
  constraint earthquakes_pkey primary key (eq_id),
  constraint earthquakes_province_id_fkey foreign KEY (province_id) references provinces (province_id)
);
```

## Environment Variables

Required environment variables in `.env` or `.env.local`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Real-time Setup

1. **Enable Realtime** for the `earthquakes` table in Supabase dashboard
2. **Configure RLS** (Row Level Security) policies if needed
3. **Ensure** the table is part of the `supabase_realtime` publication

## Usage

The component automatically:

1. Fetches initial earthquake data from the last 24 hours
2. Subscribes to real-time updates for new earthquakes
3. Updates the map and statistics in real-time
4. Handles connection errors gracefully with fallback data

## Customization

### Filtering

You can add filters to the real-time subscription by modifying the `useRealtimeEarthquakes` call in `useEarthquakeData.js`:

```javascript
useRealtimeEarthquakes({
  onInsert: handleInsert,
  onUpdate: handleUpdate,
  onDelete: handleDelete,
  filter: "magnitude=gte.3.0", // Only earthquakes with magnitude >= 3.0
});
```

### Map Styling

The map uses CartoDB Light theme and is bounded to the Philippines region. You can modify the bounds and styling in `MapView.jsx`.

### Magnitude Colors

Earthquake colors are based on magnitude ranges defined in `earthquakeUtils.js`. You can customize these colors and ranges as needed.

## Performance

- **Optimized Updates**: Uses React.useCallback to prevent unnecessary re-renders
- **Limited Data**: Keeps only the latest 100 earthquakes in memory
- **Efficient Subscriptions**: Single real-time channel for all earthquake updates
- **Graceful Degradation**: Falls back to sample data if Supabase is unavailable
