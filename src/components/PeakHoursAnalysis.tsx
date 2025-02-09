import { useQuery } from "@apollo/client";
import { STOP_TIMES_WITH_PATTERNS } from "@/graphql/queries";
import styles from "./PeakHoursAnalysis.module.scss";
import { useMemo } from "react";
import { StopTime } from "@/types/hsl";
import { startOfDay } from "date-fns";
import InfoTooltip from "./common/InfoTooltip";

interface PeakHoursAnalysisProps {
  stopId: string;
}

/**
 * Analyzes and visualizes the busiest hours at a stop based on departure frequency
 * Shows a bar graph of departures per hour throughout the day
 */
export default function PeakHoursAnalysis({ stopId }: PeakHoursAnalysisProps) {
  const today = new Date();
  // Get start of day timestamp for querying departures
  const startTime = Math.floor(startOfDay(today).getTime() / 1000);

  // Fetch all departures for the day
  const { data, loading, error } = useQuery(STOP_TIMES_WITH_PATTERNS, {
    variables: {
      stopId,
      startTime,
    },
    skip: !stopId,
  });

  // Process departure data to create hourly distribution
  const hourlyDistribution = useMemo(() => {
    if (!data) return [];

    // Initialize array with 24 zeros for each hour of the day
    const distribution = new Array(24).fill(0);

    // Count departures for each hour
    data.stop.stoptimesWithoutPatterns.forEach((stopTime: StopTime) => {
      const hour = Math.floor(stopTime.scheduledArrival / 3600) % 24;
      distribution[hour]++;
    });

    return distribution;
  }, [data]);

  // Find the hour with most departures for scaling the graph
  const maxDepartures = Math.max(...hourlyDistribution);

  if (loading) return <div>Loading peak hours analysis...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>
          Peak Hours Analysis
          <InfoTooltip
            content={
              <>
                <p>Shows the distribution of departures throughout the day.</p>
                <p>
                  Data is fetched from HSL API for the current day, showing
                  scheduled departures for each hour.
                </p>
                <p>
                  The height of each bar represents the number of departures
                  during that hour relative to the busiest hour.
                </p>
              </>
            }
          />
        </h3>
      </div>
      <div className={styles.scrollContainer}>
        <div className={styles.graph}>
          {hourlyDistribution.map((count, hour) => (
            // Create a bar for each hour, height scaled relative to max departures
            <div key={hour} className={styles.bar}>
              <div
                className={styles.barFill}
                style={{
                  height: `${(count / maxDepartures) * 100}%`,
                }}
              />
              <span className={styles.hour}>{hour}:00</span>
              <span className={styles.count}>{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
