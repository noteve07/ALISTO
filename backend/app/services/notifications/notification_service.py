"""Service for creating and managing notifications for various events."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from app.core.database import supabase


class NotificationService:
    """Create notifications for earthquakes, volcanic advisories, and risk updates."""

    async def create_earthquake_notification(
        self, 
        earthquake_data: Dict[str, Any]
    ) -> bool:
        """
        Create notification for a new earthquake event.
        
        Determines if earthquake is minor or major based on magnitude.
        Minor: < 4.0, Major: >= 4.0
        """
        try:
            magnitude = earthquake_data.get("magnitude", 0)
            location = earthquake_data.get("location", "Unknown location")
            eq_id = earthquake_data.get("eq_id", "unknown")
            depth = earthquake_data.get("depth", 0)
            latitude = earthquake_data.get("latitude")
            longitude = earthquake_data.get("longitude")
            
            # Determine event subtype
            is_major = magnitude >= 4.0
            event_subtype = "major" if is_major else "minor"
            
            # Create title and message
            title = f"Magnitude {magnitude} Earthquake Detected"
            message = f"A magnitude {magnitude} earthquake occurred at {location} with a depth of {depth} km."
            
            # Extract province name from location (text in parentheses)
            province_name = None
            if "(" in location and ")" in location:
                province_name = location[location.rfind("(")+1:location.rfind(")")]
            
            # Prepare notification data matching your schema
            notification_data = {
                "event_type": "earthquake",
                "event_subtype": event_subtype,
                "event_id": eq_id,
                "title": title,
                "message": message,
                "lat": latitude,
                "lon": longitude,
                "province_name": province_name,
                "magnitude": magnitude,
                "alert_level": None,
                "risk_level": None,
            }
            
            # Insert into notifications table
            result = supabase.table("notifications").insert(notification_data).execute()
            
            if result.data:
                print(f"✅ Created earthquake notification: {event_subtype} (mag {magnitude})")
                return True
            else:
                print(f"❌ Failed to create earthquake notification")
                return False
                
        except Exception as e:
            print(f"❌ Error creating earthquake notification: {e}")
            return False

    async def create_earthquake_notifications_batch(
        self, 
        earthquakes: List[Dict[str, Any]]
    ) -> bool:
        """Create notifications for multiple earthquakes at once."""
        if not earthquakes:
            return True
            
        try:
            notifications = []
            
            for earthquake_data in earthquakes:
                magnitude = earthquake_data.get("magnitude", 0)
                location = earthquake_data.get("location", "Unknown location")
                eq_id = earthquake_data.get("eq_id", "unknown")
                depth = earthquake_data.get("depth", 0)
                latitude = earthquake_data.get("latitude")
                longitude = earthquake_data.get("longitude")
                
                is_major = magnitude >= 4.0
                event_subtype = "major" if is_major else "minor"
                
                title = f"Magnitude {magnitude} Earthquake Detected"
                message = f"A magnitude {magnitude} earthquake occurred at {location} with a depth of {depth} km."
                
                # Extract province name from location (text in parentheses)
                province_name = None
                if "(" in location and ")" in location:
                    province_name = location[location.rfind("(")+1:location.rfind(")")]
                
                notifications.append({
                    "event_type": "earthquake",
                    "event_subtype": event_subtype,
                    "event_id": eq_id,
                    "title": title,
                    "message": message,
                    "lat": latitude,
                    "lon": longitude,
                    "province_name": province_name,
                    "magnitude": magnitude,
                    "alert_level": None,
                    "risk_level": None,
                })
            
            # Batch insert
            result = supabase.table("notifications").insert(notifications).execute()
            
            if result.data:
                print(f"✅ Created {len(result.data)} earthquake notifications")
                return True
            else:
                print(f"❌ Failed to create earthquake notifications batch")
                return False
                
        except Exception as e:
            print(f"❌ Error creating earthquake notifications batch: {e}")
            return False

    async def create_volcanic_advisory_notification(
        self,
        volcano_id: int,
        volcano_name: str,
        alert_level: int,
        alert_status: str,
        previous_alert_level: Optional[int] = None,
        volcano_lat: Optional[float] = None,
        volcano_lon: Optional[float] = None,
        province_name: Optional[str] = None,
    ) -> bool:
        """
        Create notification for volcanic advisory update.
        
        Determines if it's a general update or alert level increase.
        """
        try:
            # Determine event subtype
            is_increased = (
                previous_alert_level is not None 
                and alert_level > previous_alert_level
            )
            event_subtype = "alert_increase" if is_increased else "general_update"
            
            # Create title and message
            if is_increased:
                title = f"{volcano_name} Alert Level Increased to {alert_level}"
                message = f"{volcano_name} volcanic alert level has been raised from {previous_alert_level} to {alert_level}. Status: {alert_status}"
            else:
                title = f"{volcano_name} Volcanic Advisory Update"
                message = f"{volcano_name} is now at Alert Level {alert_level}. Status: {alert_status}"
            
            # Prepare notification data matching your schema
            notification_data = {
                "event_type": "volcanic_advisory",
                "event_subtype": event_subtype,
                "event_id": f"volcano_{volcano_id}",
                "title": title,
                "message": message,
                "lat": volcano_lat,
                "lon": volcano_lon,
                "province_name": province_name,
                "magnitude": None,
                "alert_level": alert_level,
                "risk_level": None,
            }
            
            # Insert into notifications table
            result = supabase.table("notifications").insert(notification_data).execute()
            
            if result.data:
                print(f"✅ Created volcanic advisory notification: {event_subtype} for {volcano_name}")
                return True
            else:
                print(f"❌ Failed to create volcanic advisory notification")
                return False
                
        except Exception as e:
            print(f"❌ Error creating volcanic advisory notification: {e}")
            return False


# Global notification service instance
notification_service = NotificationService()
