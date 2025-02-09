import {
  MapContainer,
  TileLayer,
  useMapEvents,
  Circle,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./Map.module.scss";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { NEARBY_STOPS } from "@/graphql/queries";
import L from "leaflet";
import { HELSINKI_CENTER } from "@/constants/locations";
import InfoTooltip from "./common/InfoTooltip";
import { Route, StopEdge, StopsByRadiusResponse } from "@/types/hsl";

interface MapProps {
  onLocationSelect: (lat: number, lon: number) => void;
}

interface Stop {
  id: string;
  position: [number, number];
  mode: Route["mode"];
  name: string;
  distance: number;
}

// Color scheme for different transport modes
const TRANSPORT_COLORS = {
  BUS: "#0066cc",
  TRAM: "#00985f",
  RAIL: "#8c4799",
  SUBWAY: "#ff6319",
  FERRY: "#00b9e4",
} as const;

// Define Helsinki metropolitan area bounds to restrict map panning
const BOUNDS = {
  south: 60.1,
  north: 60.3,
  west: 24.8,
  east: 25.1,
} as const;

/**
 * Initialize Leaflet map icons and settings
 * This is needed because Leaflet's default icon paths don't work with bundlers
 */
const initializeLeaflet = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/leaflet/marker-icon-2x.png",
    iconUrl: "/leaflet/marker-icon.png",
    shadowUrl: "/leaflet/marker-shadow.png",
  });
};

export default function MapView({ onLocationSelect }: MapProps) {
  // Track the currently selected position on the map
  const [selectedPosition, setSelectedPosition] = useState<
    [number, number] | null
  >([HELSINKI_CENTER.lat, HELSINKI_CENTER.lon]);

  // Fetch stops within 5km radius for display on map
  const { data: stopsData } = useQuery<StopsByRadiusResponse>(NEARBY_STOPS, {
    variables: {
      lat: selectedPosition?.[0] || HELSINKI_CENTER.lat,
      lon: selectedPosition?.[1] || HELSINKI_CENTER.lon,
      radius: 5000, // Larger radius to show more stops on map
    },
  });

  // Process stops data to remove duplicates and format for display
  const stops = useMemo(() => {
    if (!stopsData?.stopsByRadius.edges) return [];

    // Create a Map to store unique stops by their position string
    const uniqueStops = new Map();

    stopsData.stopsByRadius.edges.forEach(({ node }: StopEdge) => {
      const posKey = `${node.stop.lat},${node.stop.lon}`;
      if (!uniqueStops.has(posKey)) {
        uniqueStops.set(posKey, {
          id: node.stop.gtfsId,
          position: [node.stop.lat, node.stop.lon] as [number, number],
          mode: node.stop.routes[0]?.mode || "BUS",
          name: node.stop.name,
          distance: node.distance,
        } as Stop);
      }
    });

    return Array.from(uniqueStops.values()) as Stop[];
  }, [stopsData]);

  // Filter stops to show only those within 500m of selected position
  const nearbyStops = useMemo(() => {
    if (!selectedPosition) return [];
    return stops.filter((stop) => stop.distance <= 500);
  }, [stops, selectedPosition]);

  // Initialize Leaflet on component mount
  useEffect(() => {
    initializeLeaflet();
  }, []);

  // Internal component to handle map click events
  function MapEvents() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        // Check if click is within Helsinki bounds
        if (
          lat >= BOUNDS.south &&
          lat <= BOUNDS.north &&
          lng >= BOUNDS.west &&
          lng <= BOUNDS.east
        ) {
          setSelectedPosition([lat, lng]);
          onLocationSelect(lat, lng);
        }
      },
    });

    return null;
  }

  return (
    <div className={styles.container}>
      {/* Map header with instructions */}
      <div className={styles.header}>
        <h2>
          Select Location
          <InfoTooltip
            content={
              <>
                <p>
                  Click anywhere on the map to analyze nearby public transport
                  stops.
                </p>
                <p>
                  The map shows the Helsinki metropolitan area. You can zoom and
                  pan to find specific locations.
                </p>
                <p>
                  Selected location will be used to find stops within 500 meter
                  radius.
                </p>
              </>
            }
          />
        </h2>
      </div>
      <div className={styles.mapContainer}>
        <MapContainer
          center={[HELSINKI_CENTER.lat, HELSINKI_CENTER.lon]}
          zoom={13}
          className={styles.map}
          maxBounds={[
            [BOUNDS.south, BOUNDS.west],
            [BOUNDS.north, BOUNDS.east],
          ]}
          maxBoundsViscosity={1.0} // Makes the bounds "solid"
          minZoom={11} // Restrict zoom out level
          maxZoom={18} // Restrict zoom in level
        >
          {/* Base map layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEvents />

          {/* Show 500m radius circle around selected position */}
          {selectedPosition && (
            <Circle
              center={selectedPosition}
              radius={500}
              pathOptions={{ color: "var(--primary-color)" }}
            />
          )}

          {/* Display nearby stops as colored circles */}
          {nearbyStops.map((stop) => (
            <Circle
              key={stop.id}
              center={stop.position}
              radius={16}
              pathOptions={{
                color: TRANSPORT_COLORS[stop.mode],
                fillOpacity: 1,
                weight: 0,
              }}
            >
              <Tooltip direction="top" offset={[0, -16]}>
                {stop.name}
              </Tooltip>
            </Circle>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
