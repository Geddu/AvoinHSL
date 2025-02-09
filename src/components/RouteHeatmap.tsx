import { useQuery } from "@apollo/client";
import { STOP_TIMES_WITH_PATTERNS } from "@/graphql/queries";
import styles from "./RouteHeatmap.module.scss";
import { useMemo } from "react";
import { Route, StopTime } from "@/types/hsl";
import { startOfDay, endOfDay } from "date-fns";
import InfoTooltip from "./common/InfoTooltip";

// Represents frequency data for a specific route
interface RouteFrequency {
  routeName: string;
  mode: Route["mode"];
  hourlyFrequency: number[]; // Array of 24 values, one for each hour
}

type HeatmapData = Record<string, RouteFrequency>;

/**
 * Visualizes departure frequency for each route at different hours
 * Shows a heatmap where each row is a route and each column is an hour
 */
export default function RouteHeatmap({ stopId }: { stopId: string }) {
  const today = new Date();
  // Get timestamps for start and end of day
  const startTime = Math.floor(startOfDay(today).getTime() / 1000);
  const endTime = Math.floor(endOfDay(today).getTime() / 1000);

  // Fetch all departures for the day
  const { data, loading, error } = useQuery(STOP_TIMES_WITH_PATTERNS, {
    variables: {
      stopId,
      startTime,
      endTime,
    },
    skip: !stopId,
  });

  // Process departure data to create route-based heatmap
  const routeData = useMemo(() => {
    if (!data) return [];

    const heatmapData: HeatmapData = {};

    // Process each departure and organize by route
    data.stop.stoptimesWithoutPatterns.forEach((stopTime: StopTime) => {
      if (!stopTime.trip?.pattern?.route) return;

      const route = stopTime.trip.pattern.route;
      const routeId = `${route.mode}_${route.shortName}`;
      const hour = Math.floor(stopTime.scheduledArrival / 3600) % 24;

      // Initialize route data if not exists
      if (!heatmapData[routeId]) {
        heatmapData[routeId] = {
          routeName: route.shortName,
          mode: route.mode,
          hourlyFrequency: new Array(24).fill(0),
        };
      }

      // Increment frequency for this hour
      heatmapData[routeId].hourlyFrequency[hour]++;
    });

    // Convert to array and sort by mode and route name
    return Object.values(heatmapData).sort((a, b) => {
      if (a.mode !== b.mode) return a.mode.localeCompare(b.mode);
      return a.routeName.localeCompare(b.routeName);
    });
  }, [data]);

  // Find maximum frequency for scaling the heatmap colors
  const maxFrequency = useMemo(() => {
    return Math.max(...routeData.flatMap((route) => route.hourlyFrequency));
  }, [routeData]);

  if (loading) return <div>Loading route heatmap...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>
          Route Frequency Heatmap
          <InfoTooltip
            content={
              <>
                <p>Shows departure frequency by route and hour.</p>
                <p>
                  Darker colors indicate more frequent departures during that
                  hour.
                </p>
              </>
            }
          />
        </h3>
      </div>
      <div className={styles.scrollContainer}>
        <div className={styles.heatmapContainer}>
          {/* Time labels for columns */}
          <div className={styles.timeLabels}>
            {Array.from({ length: 24 }).map((_, hour) => (
              <div key={hour} className={styles.timeLabel}>
                {hour}:00
              </div>
            ))}
          </div>
          {/* Heatmap grid */}
          <div className={styles.heatmap}>
            {routeData.map((route) => (
              <div key={route.routeName} className={styles.row}>
                <div className={styles.routeLabel}>
                  <span
                    className={`${styles.routeTag} ${
                      styles[route.mode.toLowerCase()]
                    }`}
                  >
                    {route.routeName}
                  </span>
                </div>
                {route.hourlyFrequency.map((frequency, hour) => (
                  <div
                    key={hour}
                    className={styles.cell}
                    style={{
                      backgroundColor: `rgba(0, 122, 201, ${
                        frequency / maxFrequency
                      })`,
                    }}
                  >
                    <span className={styles.frequency}>{frequency}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
