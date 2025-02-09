"use client";

import { useQuery } from "@apollo/client";
import { NEARBY_STOPS } from "@/graphql/queries";
import styles from "./TransportStats.module.scss";
import { Route, StopEdge, StopsByRadiusResponse } from "@/types/hsl";
import LoadingCard from "./common/LoadingCard";
import { useState, useEffect } from "react";
import InfoTooltip from "./common/InfoTooltip";

type TransportMode = Route["mode"];

// Represents statistics for each transport mode
interface ModeData {
  stops: number; // Number of stops for this mode
  routes: number; // Number of routes serving these stops
}

// Maps transport modes to their statistics
type ModeStats = Record<TransportMode, ModeData>;

interface TransportStatsProps {
  location: { lat: number; lon: number };
}

interface QueryVariables {
  lat: number;
  lon: number;
  radius: number;
}

export default function TransportStats({ location }: TransportStatsProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  // Fetch nearby stops data within 500m radius
  const { data, loading, error } = useQuery<
    StopsByRadiusResponse,
    QueryVariables
  >(NEARBY_STOPS, {
    variables: {
      lat: location.lat,
      lon: location.lon,
      radius: 500,
    },
    skip: !location.lat || !location.lon,
  });

  // Process the stops data to calculate statistics for each transport mode
  const modeStats =
    data?.stopsByRadius.edges?.reduce(
      (stats: ModeStats, { node }: StopEdge) => {
        // Get all transport modes serving this stop
        const modes = node.stop.routes.map((route) => route.mode);

        // Determine the primary mode (most frequent) for this stop
        const primaryMode = modes.reduce(
          (
            acc: { mode: TransportMode; count: number },
            curr: TransportMode
          ) => {
            const count = modes.filter((m) => m === curr).length;
            return count > acc.count ? { mode: curr, count } : acc;
          },
          { mode: modes[0], count: 0 }
        ).mode;

        // Initialize stats for this mode if not already present
        if (!stats[primaryMode]) {
          stats[primaryMode] = { stops: 0, routes: 0 };
        }

        // Update statistics:
        // - Increment stop count
        // - Add number of routes of the primary mode
        stats[primaryMode].stops += 1;
        stats[primaryMode].routes += node.stop.routes.filter(
          (route) => route.mode === primaryMode
        ).length;
        return stats;
      },
      {} as ModeStats
    ) || ({} as ModeStats);

  // Calculate total number of stops across all modes
  const totalStops = Object.values(modeStats).reduce(
    (sum, data) => sum + data.stops,
    0
  ) as number;

  useEffect(() => {
    if (!loading && data) {
      setIsAnimating(true);
    }
  }, [loading, data]);

  if (error)
    return (
      <div className={styles.error}>
        Error loading statistics: {error.message}
      </div>
    );

  if (!loading && totalStops === 0)
    return <div>No transport stops in selected area</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>
          Stop Types
          <InfoTooltip
            content={
              <>
                <p>
                  Overview of stops by primary transport mode in the selected
                  area.
                </p>
                <p>
                  Each stop is categorized by its most common transport mode.
                  For example, a stop served by multiple bus lines and one tram
                  line would be counted as a bus stop.
                </p>
                <p>
                  The progress bar indicates the proportion of each transport
                  mode compared to the total number of stops.
                </p>
              </>
            }
          />
        </h2>
      </div>
      <div className={styles.statsGrid}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <LoadingCard key={`loading-${i}`} lines={2} />
            ))
          : (Object.entries(modeStats) as [string, ModeData][]).map(
              ([mode, count]: [string, ModeData]) => (
                <div
                  key={mode}
                  className={`${styles.statCard} ${
                    isAnimating ? styles.animate : ""
                  }`}
                >
                  <div className={styles.statHeader}>
                    <span
                      className={`${styles.icon} ${styles[mode.toLowerCase()]}`}
                    >
                      {getTransportIcon(mode)}
                    </span>
                    <h3 className={styles[mode.toLowerCase()]}>{mode}</h3>
                  </div>
                  <div className={styles.statInfo}>
                    <div className={styles.mainStats}>
                      <div className={styles.stopCount}>
                        <p className={styles.count}>{count.stops}</p>
                        <span className={styles.label}>
                          {count.stops === 1 ? "Stop" : "Stops"}
                        </span>
                      </div>
                      <div className={styles.routeCount}>
                        <p className={styles.count}>{count.routes}</p>
                        <span className={styles.label}>
                          {count.routes === 1 ? "Route" : "Routes"}
                        </span>
                      </div>
                    </div>
                    <div className={styles.metrics}>
                      <div className={styles.metric}>
                        <span className={styles.metricLabel}>
                          Share of Stops
                        </span>
                        <span className={styles.metricValue}>
                          {((count.stops / totalStops) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className={styles.metric}>
                        <span className={styles.metricLabel}>
                          Routes per Stop
                        </span>
                        <span className={styles.metricValue}>
                          {(count.routes / count.stops).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={styles.progressBar}
                    style={{ width: `${(count.stops / totalStops) * 100}%` }}
                  />
                </div>
              )
            )}
      </div>
    </div>
  );
}

/**
 * Returns an emoji representing the transport mode
 * @param mode - The transport mode (BUS, TRAM, etc.)
 * @returns An emoji string representing the mode
 */
function getTransportIcon(mode: string): string {
  switch (mode) {
    case "BUS":
      return "🚌";
    case "TRAM":
      return "🚋";
    case "RAIL":
      return "🚈";
    case "SUBWAY":
      return "🚇";
    case "FERRY":
      return "⛴️";
    default:
      return "🚍";
  }
}
