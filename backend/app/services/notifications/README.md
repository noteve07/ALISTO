# Notifications System Documentation

## Overview

The ALISTO notification system provides real-time alerts for earthquakes, volcanic advisories, and risk level changes. It uses a simple, user-agnostic approach where all notifications are stored in a central table and users subscribe via Supabase realtime.

## Architecture

### Backend (Python/FastAPI)

- **Notification Service** (`app/services/notifications/notification_service.py`)
  - Creates notifications for various events
  - Determines severity levels (info/warning/critical)
  - Stores structured metadata in JSONB format

### Database (Supabase/PostgreSQL)

- **notifications Table**
  - Stores all system-wide notifications
  - No user_id column - notifications are broadcast to all users
  - Frontend determines relevance based on user location

### Frontend (React)

- Users subscribe to Supabase realtime on the notifications table
- Frontend logic determines notification tier (1/2/3) based on:
  - Event type and severity
  - User location vs event location
  - Magnitude/alert level thresholds

## Notification Tiers

### Tier 1: In-App Notification Only

- Minor earthquakes (magnitude < 4.0) far from user
- General volcanic advisory updates
- Provincial risk level updates

### Tier 2: In-App + Desktop Notification

- Major earthquakes (magnitude >= 4.0) far from user
- Volcano alert level increases
- User's province risk level changes

### Tier 3: In-App + Desktop + Sound (+ SMS in future)

- Major earthquakes near user or felt by user
- Rising/existing volcanic advisory on nearby volcano
- User's province risk level increases

## Event Types

### Earthquakes

- **minor_earthquake**: Magnitude < 4.0
- **major_earthquake**: Magnitude >= 4.0

### Volcanic Advisories

- **volcanic_advisory_update**: General update to any volcano advisory
- **volcano_alert_increased**: Alert level increased from previous state

### Risk Levels (Future)

- **risk_level_update**: Province risk level changed
- **risk_level_increased**: Province risk level went up

## Trigger Points

### 1. Earthquake Detection

**Location**: `app/services/live/earthquakes/earthquake_updater.py`

```python
async def add_or_skip_earthquakes(self, new_earthquakes):
    # Insert earthquakes
    result = supabase.table("latest_earthquakes").insert(new_earthquakes).execute()

    # Trigger notifications
    await notification_service.create_earthquake_notifications_batch(new_earthquakes)
```

**When**: After new earthquakes are successfully inserted into database
**Frequency**: Every 3 minutes (configurable via SCRAPE_INTERVAL_MINUTES)

### 2. Volcanic Advisory Updates

**Location**: `app/services/live/volcanoes/volcano_updater.py`

```python
async def apply_updates(self, advisories):
    # Get current state for comparison
    current_alert_map = {...}

    # Update advisories
    supabase.table("volcanic_advisories").upsert(payload).execute()

    # Detect changes and create notifications
    await self._create_notifications_for_changes(advisories, current_alert_map)
```

**When**: After volcanic advisories are updated in database
**Frequency**: Every 60 minutes (configurable via VOLCANO_SCRAPE_INTERVAL_MINUTES)
**Detection**: Compares previous alert levels with new ones to identify changes

## Notification Data Structure

### Earthquake Notification

```json
{
  "notification_id": 1,
  "event_type": "major_earthquake",
  "event_id": "eq_phivolcs_123456",
  "title": "Magnitude 5.2 Earthquake Detected",
  "message": "A magnitude 5.2 earthquake occurred at 015 km S 20° W of Balanga City (Bataan) with a depth of 32 km.",
  "severity": "critical",
  "metadata": {
    "magnitude": 5.2,
    "depth": 32,
    "location": "015 km S 20° W of Balanga City (Bataan)",
    "latitude": 14.593881,
    "longitude": 120.566876,
    "datetime": "2025-11-05T14:30:00"
  },
  "created_at": "2025-11-05T14:30:05"
}
```

### Volcanic Advisory Notification

```json
{
  "notification_id": 2,
  "event_type": "volcano_alert_increased",
  "event_id": "volcano_13",
  "title": "Mt. Isarog Alert Level Increased to 2",
  "message": "Mt. Isarog volcanic alert level has been raised from 1 to 2. Status: Low-level Unrest",
  "severity": "warning",
  "metadata": {
    "volcano_id": 13,
    "volcano_name": "Mt. Isarog",
    "alert_level": 2,
    "alert_status": "Low-level Unrest",
    "previous_alert_level": 1
  },
  "created_at": "2025-11-05T14:35:00"
}
```

## Severity Determination

### Earthquakes

- **critical**: Magnitude >= 5.0
- **warning**: Magnitude >= 4.0 and < 5.0
- **info**: Magnitude < 4.0

### Volcanic Advisories

- **critical**: Alert Level >= 4
- **warning**: Alert Level >= 2 and < 4
- **info**: Alert Level < 2

## Frontend Integration (To Be Implemented)

### Supabase Realtime Subscription

```javascript
const subscription = supabase
  .channel("notifications")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "notifications",
    },
    (payload) => {
      const notification = payload.new;
      handleNotification(notification);
    }
  )
  .subscribe();
```

### Tier Determination Logic

```javascript
function determineNotificationTier(notification, userLocation) {
  const { event_type, severity, metadata } = notification;

  // Calculate distance if event has location
  const distance = calculateDistance(userLocation, {
    lat: metadata.latitude,
    lon: metadata.longitude,
  });

  // Tier 3: Nearby critical events
  if (severity === "critical" && distance < 50) return 3;

  // Tier 2: Major events or increases
  if (event_type.includes("increased") || severity === "warning") return 2;

  // Tier 1: General info
  return 1;
}
```

## Testing

### Simulation Endpoints

Use these endpoints to test notification creation:

#### Simulate Earthquake

```bash
POST /api/v1/simulation/simulate-earthquake?option=1
# Creates a minor earthquake (mag 2.9) - should trigger 'minor_earthquake' notification

POST /api/v1/simulation/simulate-earthquake?option=3
# Creates a major earthquake (mag 5.6) - should trigger 'major_earthquake' notification
```

#### Simulate Volcanic Advisory

```bash
POST /api/v1/simulation/simulate-volcanic-advisory?option=1
# Updates Mt. Isarog to Alert Level 2 - should trigger 'volcanic_advisory_update' or 'volcano_alert_increased'

POST /api/v1/simulation/reset-volcanic-advisory?option=1
# Resets Mt. Isarog to Alert Level 0 - no notification (level 0 ignored)
```

### Verify Notifications

```bash
# Query notifications table
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;

# Check latest earthquake notification
SELECT * FROM notifications WHERE event_type LIKE '%earthquake%' ORDER BY created_at DESC LIMIT 1;

# Check latest volcanic notification
SELECT * FROM notifications WHERE event_type LIKE 'volcano%' ORDER BY created_at DESC LIMIT 1;
```

## Future Enhancements

### Phase 2: User-Specific Notifications

- Add `user_id` column for targeted notifications
- Create notification preferences table
- Allow users to subscribe to specific provinces/volcanoes

### Phase 3: SMS Integration

- Integrate Twilio/similar service for SMS alerts
- Send SMS for Tier 3 notifications only
- Rate limiting to prevent spam

### Phase 4: Risk Level Notifications

- Monitor provincial risk_evaluations table
- Detect risk level changes
- Create notifications for risk increases

## Maintenance

### Cleanup Old Notifications

```sql
-- Delete notifications older than 30 days
DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '30 days';

-- Or use the provided function (if created)
SELECT cleanup_old_notifications();
```

### Monitor Notification Volume

```sql
-- Count notifications by type (last 24 hours)
SELECT event_type, COUNT(*) as count
FROM notifications
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY event_type
ORDER BY count DESC;

-- Check notification creation rate
SELECT
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as notifications
FROM notifications
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;
```

## Troubleshooting

### No notifications created for earthquakes

1. Check if earthquake_updater is being called: Look for log `✅ Successfully added X new earthquakes`
2. Verify notification service is imported correctly
3. Check notifications table exists and is accessible
4. Review error logs for notification creation failures

### Volcanic advisory notifications not triggering

1. Verify volcano advisory updates are running (check scheduler logs)
2. Ensure alert level actually changed (no notification for same level)
3. Confirm volcano_id exists in volcanoes_id.json lookup
4. Check that alert_level > 0 (level 0 is ignored)

### Duplicate notifications

1. Earthquakes: Check if earthquake_comparator is filtering correctly
2. Volcanoes: Verify comparison logic is detecting actual changes only
3. Review unique constraints on event_id if needed
