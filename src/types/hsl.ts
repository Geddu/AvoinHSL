export type Route = {
  gtfsId: string;
  shortName: string;
  longName: string;
  mode: "BUS" | "TRAM" | "RAIL" | "SUBWAY" | "FERRY";
};

export type Stop = {
  gtfsId: string;
  name: string;
  code: string;
  desc: string;
  lat: number;
  lon: number;
  routes: Route[];
};

export type StopEdge = {
  node: {
    stop: Stop;
    distance: number;
  };
};

export type StopTime = {
  scheduledArrival: number;
  realtimeArrival: number;
  arrivalDelay: number;
  realtime: boolean;
  serviceDay: number;
  trip?: {
    pattern?: {
      route: Route;
    };
  };
};

export interface StopsByRadiusResponse {
  stopsByRadius: {
    edges: StopEdge[];
  };
}

export interface StopTimesResponse {
  stop: {
    stoptimesWithoutPatterns: StopTime[];
  };
}
