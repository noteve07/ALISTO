import { useContext } from "react";
import UserLocationContext from "../context/userLocationContext";

const useUserLocation = () => {
  const context = useContext(UserLocationContext);

  if (!context) {
    throw new Error("useUserLocation must be used within UserLocationProvider");
  }

  return context;
};

export default useUserLocation;
