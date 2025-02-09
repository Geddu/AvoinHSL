import styles from "./App.module.scss";
import NearbyStops from "./components/NearbyStops";
import { useState, useEffect } from "react";
import TransportStats from "./components/TransportStats";
import MapView from "./components/Map";
import { HELSINKI_CENTER } from "./constants/locations";
import LoadingScreen from "./components/LoadingScreen";

export default function App() {
  // Main app state
  // location: Current selected location on the map
  // isLoading: Controls initial loading screen animation
  const [location, setLocation] = useState<{ lat: number; lon: number }>(
    HELSINKI_CENTER
  );
  const [isLoading, setIsLoading] = useState(true);

  // Show loading screen for 2.5 seconds on initial load
  // This gives time for Apollo Client to initialize and adds a nice UX touch
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Handler for when user selects a new location on the map
  const handleLocationSelect = (lat: number, lon: number) => {
    setLocation({ lat, lon });
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        <span className={styles.tramIcon}>🚋</span>
        HSL Stop Inspector
      </h1>
      {/* Interactive map for location selection */}
      <MapView onLocationSelect={handleLocationSelect} />

      {/* Overview of transport modes in selected area */}
      <TransportStats location={location} />

      {/* List of nearby stops with detailed information */}
      <NearbyStops location={location} onLocationChange={setLocation} />
    </div>
  );
}
