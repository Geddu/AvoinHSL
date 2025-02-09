import { useQuery } from "@apollo/client";
import { NEARBY_STOPS } from "@/graphql/queries";
import styles from "./NearbyStops.module.scss";
import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import PeakHoursAnalysis from "./PeakHoursAnalysis";
import DelayStatistics from "./DelayStatistics";
import RouteHeatmap from "./RouteHeatmap";
import LoadingCard from "./common/LoadingCard";
import Dialog from "./common/Dialog";
import InfoTooltip from "./common/InfoTooltip";
import { useInView } from "react-intersection-observer";
import { StopEdge, Route, StopsByRadiusResponse } from "@/types/hsl";
import SearchSection from "./SearchSection";

interface NearbyStopsProps {
  location: { lat: number; lon: number };
  onLocationChange: (location: { lat: number; lon: number }) => void;
}

const STOPS_PER_PAGE = 10;

/**
 * Custom hook to handle clicks outside of a specified element
 * Used for closing dropdowns and modals when clicking outside
 */
function useClickOutside(
  ref: React.RefObject<HTMLElement>,
  handler: () => void
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, handler]);
}

export default function NearbyStops({ location }: NearbyStopsProps) {
  // State for managing stop list and UI interactions
  const [selectedStop, setSelectedStop] = useState<string | null>(null);
  const [selectedStopName, setSelectedStopName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [displayedStops, setDisplayedStops] = useState(STOPS_PER_PAGE);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedModes, setSelectedModes] = useState<Set<Route["mode"]>>(
    new Set(["BUS", "TRAM", "RAIL", "SUBWAY", "FERRY"])
  );

  // Fetch nearby stops data from HSL API
  const { data, loading } = useQuery<StopsByRadiusResponse>(NEARBY_STOPS, {
    variables: {
      lat: location.lat,
      lon: location.lon,
      radius: 500,
    },
  });

  // Intersection observer for infinite scrolling
  const { ref: loadMoreRef, inView } = useInView();
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown when clicking outside
  useClickOutside(filterRef, () => setShowFilters(false));

  // Filter and sort stops based on search query and selected modes
  const filteredStops = useMemo(() => {
    if (!data?.stopsByRadius.edges) return [];

    return data.stopsByRadius.edges
      .filter(({ node }: StopEdge) => {
        const matchesSearch = node.stop.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const hasSelectedMode = node.stop.routes.some((route) =>
          selectedModes.has(route.mode)
        );
        return matchesSearch && hasSelectedMode;
      })
      .sort((a, b) => a.node.distance - b.node.distance);
  }, [data, searchQuery, selectedModes]);

  // Load more stops when scrolling
  useEffect(() => {
    if (inView && displayedStops < filteredStops.length) {
      setDisplayedStops((prev) => prev + STOPS_PER_PAGE);
    }
  }, [inView, filteredStops.length, displayedStops]);

  // Check if there are more stops to load
  const hasMoreStops = displayedStops < filteredStops.length;

  // Handle transport mode filter toggles
  const handleModeToggle = useCallback((mode: Route["mode"]) => {
    setSelectedModes((prev) => {
      const newModes = new Set(prev);
      if (newModes.has(mode)) {
        newModes.delete(mode);
      } else {
        newModes.add(mode);
      }
      return newModes;
    });
  }, []);

  // Handle stop selection for showing analysis dialog
  const handleStopSelect = (stopId: string, name: string) => {
    setSelectedStop(stopId);
    setSelectedStopName(name);
    setIsDialogOpen(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>
          Nearby Stops
          <InfoTooltip
            content={
              <>
                <p>
                  List of all public transport stops within 500 meters of the
                  selected location.
                </p>
                <p>
                  Each stop card shows: • Stop name and distance • All routes
                  serving the stop • Color-coded route numbers by transport mode
                </p>
                <p>
                  Click on any stop to view detailed statistics including peak
                  hours, delays, and route frequency analysis.
                </p>
              </>
            }
          />
        </h2>

        {/* Search and filter section */}
        <div className={styles.searchSection}>
          <SearchSection
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            selectedModes={selectedModes}
            onModeToggle={handleModeToggle}
          />
        </div>
      </div>
      {/* Stop list with infinite scroll */}
      <div className={styles.stopsGrid}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <LoadingCard key={`loading-${i}`} lines={3} />
            ))
          : filteredStops.slice(0, displayedStops).map(({ node }: StopEdge) => (
              <div
                key={node.stop.gtfsId}
                className={`${styles.stopCard} ${
                  selectedStop === node.stop.gtfsId ? styles.selected : ""
                }`}
                onClick={() =>
                  handleStopSelect(node.stop.gtfsId, node.stop.name)
                }
              >
                <h3 className={styles[node.stop.routes[0].mode.toLowerCase()]}>
                  {node.stop.name}
                </h3>
                <p>Distance: {Math.round(node.distance)}m</p>
                <div className={styles.routes}>
                  {node.stop.routes.map((route: Route) => (
                    <span
                      key={route.gtfsId}
                      className={`${styles.routeTag} ${
                        styles[route.mode.toLowerCase()]
                      }`}
                    >
                      {route.shortName}
                    </span>
                  ))}
                </div>
              </div>
            ))}
        {!loading && hasMoreStops && (
          <div ref={loadMoreRef} className={styles.loadMore}>
            <LoadingCard lines={3} />
          </div>
        )}
      </div>

      {/* Analysis dialog for selected stop */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={`Stop Analysis: ${selectedStopName}`}
      >
        <div className={styles.dialogContent}>
          <DelayStatistics stopId={selectedStop!} />
          <PeakHoursAnalysis stopId={selectedStop!} />
          <RouteHeatmap stopId={selectedStop!} />
        </div>
      </Dialog>
    </div>
  );
}
