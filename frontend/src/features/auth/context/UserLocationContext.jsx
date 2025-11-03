import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { userService } from "../services/userService";

const UserLocationContext = createContext();

export const useUserLocation = () => {
  const context = useContext(UserLocationContext);
  if (!context) {
    throw new Error("useUserLocation must be used within UserLocationProvider");
  }
  return context;
};

export const UserLocationProvider = ({ children }) => {
  const { user } = useAuth();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocation = async () => {
      setLoading(true);

      try {
        const userId = user?.id || "00000000-0000-0000-0000-000000000000";
        const result = await userService.getLocation(userId);

        if (result.success && result.data) {
          const { lat, lon, municipality, province, is_fallback } = result.data;
          setLocation({
            position: [lat, lon],
            municipality,
            province,
            isFallback: is_fallback,
          });
          console.log(
            `📍 ${
              is_fallback ? "Fallback" : "Saved"
            } location loaded: ${municipality}, ${province}`
          );
        }
      } catch (err) {
        console.warn("Failed to fetch user location:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [user]);

  return (
    <UserLocationContext.Provider value={{ location, loading }}>
      {children}
    </UserLocationContext.Provider>
  );
};
