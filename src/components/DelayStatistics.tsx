import { useQuery } from "@apollo/client";
import { STOP_TIMES_WITH_PATTERNS } from "@/graphql/queries";
import styles from "./DelayStatistics.module.scss";
import { useMemo } from "react";
import { startOfDay } from "date-fns";
import InfoTooltip from "./common/InfoTooltip";
import { StopTime } from "@/types/hsl";

interface DelayStatisticsProps {
  stopId: string;
}

/**
 * Analyzes and displays delay statistics for a specific stop
 * Shows average delay, maximum delay, and on-time performance
 */
export default function DelayStatistics({ stopId }: DelayStatisticsProps) {
  const today = new Date();
  // Get start of day timestamp for querying today's departures
  const startTime = Math.floor(startOfDay(today).getTime() / 1000);

  // Fetch all departures with real-time data for the day
  const { data, loading, error } = useQuery(STOP_TIMES_WITH_PATTERNS, {
    variables: {
      stopId,
      startTime,
    },
    skip: !stopId,
  });

  // Calculate delay statistics from departure data
  const stats = useMemo(() => {
    if (!data) return null;

    // Filter for departures with real-time data and extract delays
    const delays = data.stop.stoptimesWithoutPatterns
      .filter((st: StopTime) => st.realtime)
      .map((st: StopTime) => st.arrivalDelay);

    // Calculate key metrics
    return {
      // Average delay in seconds
      average:
        delays.reduce((a: number, b: number) => a + b, 0) / delays.length,
      // Maximum delay in seconds
      max: Math.max(...delays),
      // Count of on-time arrivals (within 60 seconds of schedule)
      onTime: delays.filter((d: number) => Math.abs(d) <= 60).length,
      // Total number of departures with real-time data
      total: delays.length,
    };
  }, [data]);

  if (loading) return <div>Loading delay statistics...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!stats) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>
          Delay Statistics
          <InfoTooltip
            content={
              <>
                <p>
                  On-Time Performance: Percentage of arrivals within 1 minute of
                  schedule.
                </p>
                <p>
                  Data is calculated from real-time arrivals reported by HSL
                  API.
                </p>
              </>
            }
          />
        </h3>
      </div>
      <div className={styles.statsGrid}>
        {/* Average delay card */}
        <div className={styles.statCard}>
          <h4>Average Delay</h4>
          <p>{Math.round(stats.average / 60)} minutes</p>
        </div>
        {/* Maximum delay card */}
        <div className={styles.statCard}>
          <h4>Maximum Delay</h4>
          <p>{Math.round(stats.max / 60)} minutes</p>
        </div>
        {/* On-time performance card */}
        <div className={styles.statCard}>
          <h4>On-Time Performance</h4>
          <p>{Math.round((stats.onTime / stats.total) * 100)}%</p>
        </div>
      </div>
    </div>
  );
}
