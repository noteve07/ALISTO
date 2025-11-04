-- Notifications Table Schema
-- This table stores all system-wide notifications for earthquakes, volcanic advisories, and risk updates
-- Users subscribe via Supabase realtime to get instant updates
-- Frontend determines notification tier (1/2/3) based on user location and event severity

CREATE TABLE IF NOT EXISTS public.notifications (
  notification_id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  -- Possible values:
  -- 'minor_earthquake', 'major_earthquake',
  -- 'volcanic_advisory_update', 'volcano_alert_increased',
  -- 'risk_level_update', 'risk_level_increased'
  
  event_id VARCHAR(100) NOT NULL,
  -- Hybrid ID: eq_id for earthquakes, volcano_{volcano_id} for volcanoes, province_{province_id} for risk updates
  
  title TEXT NOT NULL,
  -- Short heading for the notification
  
  message TEXT NOT NULL,
  -- Detailed description of the event
  
  severity VARCHAR(20) NOT NULL DEFAULT 'info',
  -- 'info', 'warning', 'critical' - helps frontend determine notification tier
  
  metadata JSONB,
  -- Additional structured data about the event
  -- For earthquakes: magnitude, depth, location, latitude, longitude, datetime
  -- For volcanoes: volcano_id, volcano_name, alert_level, alert_status, previous_alert_level
  -- For risk: province_id, province_name, risk_level, previous_risk_level
  
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Indexes for performance
  CONSTRAINT notifications_event_type_check CHECK (
    event_type IN (
      'minor_earthquake', 
      'major_earthquake', 
      'volcanic_advisory_update', 
      'volcano_alert_increased',
      'risk_level_update',
      'risk_level_increased'
    )
  ),
  
  CONSTRAINT notifications_severity_check CHECK (
    severity IN ('info', 'warning', 'critical')
  )
) TABLESPACE pg_default;

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications USING btree (created_at DESC) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_notifications_event_type ON public.notifications USING btree (event_type) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_notifications_severity ON public.notifications USING btree (severity) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_notifications_event_id ON public.notifications USING btree (event_id) TABLESPACE pg_default;

-- GIN index for JSONB metadata queries
CREATE INDEX IF NOT EXISTS idx_notifications_metadata ON public.notifications USING gin (metadata) TABLESPACE pg_default;

-- Enable Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to read notifications
CREATE POLICY "Allow public read access to notifications"
ON public.notifications
FOR SELECT
TO authenticated, anon
USING (true);

-- Optional: Add a cleanup function to keep only recent notifications (e.g., last 30 days)
-- Uncomment if you want automatic cleanup

-- CREATE OR REPLACE FUNCTION cleanup_old_notifications()
-- RETURNS void AS $$
-- BEGIN
--   DELETE FROM public.notifications
--   WHERE created_at < NOW() - INTERVAL '30 days';
-- END;
-- $$ LANGUAGE plpgsql;

-- Schedule cleanup (using pg_cron extension if available)
-- SELECT cron.schedule('cleanup-notifications', '0 2 * * *', 'SELECT cleanup_old_notifications();');

COMMENT ON TABLE public.notifications IS 'System-wide notifications for earthquakes, volcanic advisories, and risk updates. Users subscribe via Supabase realtime.';
COMMENT ON COLUMN public.notifications.event_type IS 'Type of event: minor_earthquake, major_earthquake, volcanic_advisory_update, volcano_alert_increased, risk_level_update, risk_level_increased';
COMMENT ON COLUMN public.notifications.event_id IS 'Hybrid ID referencing the source event (eq_id, volcano_{id}, province_{id})';
COMMENT ON COLUMN public.notifications.severity IS 'Severity level for frontend tier determination: info, warning, critical';
COMMENT ON COLUMN public.notifications.metadata IS 'Additional structured data about the event in JSONB format';
