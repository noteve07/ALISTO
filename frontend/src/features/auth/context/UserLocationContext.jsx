import { useEffect, useState, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { userService } from "../services/userService";
import UserLocationContext from "./userLocationContext";

export const UserLocationProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const lastFetchedUserId = useRef(null);
  const fallbackLocationRef = useRef({
    position: [14.676041, 120.536319],
    municipality: "Balanga City",
    province: "Bataan",
    isFallback: true,
  });

  // Synthetic user id ensures backend returns the canonical fallback record
  const fallbackUserId = "00000000-0000-0000-0000-000000000000";

  useEffect(() => {
    if (authLoading) {
      return;
    }

    const userId = user?.id || fallbackUserId;

    // Avoid unnecessary refetch if we already have data for this user
    if (lastFetchedUserId.current === userId && location) {
      return;
    }

    let isMounted = true;

    const fetchLocation = async () => {
      setLoading(true);
      try {
        console.log(`[UserLocation] Fetching location for userId: ${userId}`);
        const result = await userService.getLocation(userId);

        if (!isMounted) {
          return;
        }

        if (result.success && result.data) {
          const { lat, lon, municipality, province, is_fallback } = result.data;

          if (typeof lat === "number" && typeof lon === "number") {
            const normalizedLocation = {
              position: [lat, lon],
              municipality:
                municipality || fallbackLocationRef.current.municipality,
              province: province || fallbackLocationRef.current.province,
              isFallback: Boolean(is_fallback),
            };

            setLocation(normalizedLocation);
            console.log(
              `📍 Location loaded (${normalizedLocation.position[0]}, ${
                normalizedLocation.position[1]
              }) - ${normalizedLocation.isFallback ? "fallback" : "user"}`
            );
            return;
          }
        }

        console.warn(
          "[UserLocation] No location data returned, using fallback"
        );
        setLocation(fallbackLocationRef.current);
      } catch (err) {
        console.warn(
          "[UserLocation] Failed to fetch user location, using fallback:",
          err
        );
        setLocation(fallbackLocationRef.current);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLocation();
    lastFetchedUserId.current = userId;

    return () => {
      isMounted = false;
    };
  }, [user, authLoading, location]);

  return (
    <UserLocationContext.Provider value={{ location, loading }}>
      {children}
    </UserLocationContext.Provider>
  );
};
