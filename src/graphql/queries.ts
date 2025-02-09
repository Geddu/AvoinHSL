import { gql } from "@apollo/client";

export const NEARBY_STOPS = gql`
  query NearbyStops($lat: Float!, $lon: Float!, $radius: Int!) {
    stopsByRadius(lat: $lat, lon: $lon, radius: $radius) {
      edges {
        node {
          stop {
            gtfsId
            name
            code
            desc
            lat
            lon
            routes {
              gtfsId
              shortName
              longName
              mode
            }
          }
          distance
        }
      }
    }
  }
`;

export const STOP_TIMES_WITH_PATTERNS = gql`
  query StopTimesWithPatterns($stopId: String!, $startTime: Long!) {
    stop(id: $stopId) {
      stoptimesWithoutPatterns(
        startTime: $startTime
        timeRange: 86400
        numberOfDepartures: 1000
      ) {
        scheduledArrival
        realtimeArrival
        arrivalDelay
        realtime
        serviceDay
        trip {
          pattern {
            route {
              shortName
              mode
            }
          }
        }
      }
    }
  }
`;
