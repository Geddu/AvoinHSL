import { Route } from "@/types/hsl";
import styles from "./SearchSection.module.scss";

interface SearchSectionProps {
  searchQuery: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  selectedModes: Set<Route["mode"]>;
  onModeToggle: (mode: Route["mode"]) => void;
}

const TRANSPORT_MODES = ["BUS", "TRAM", "RAIL", "SUBWAY", "FERRY"] as const;

export default function SearchSection({
  searchQuery,
  onSearchChange,
  showFilters,
  setShowFilters,
  selectedModes,
  onModeToggle,
}: SearchSectionProps) {
  return (
    <div className={styles.searchSection}>
      <div className={styles.searchContainer}>
        <svg
          className={styles.searchIcon}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <input
          type="text"
          placeholder="Search stops..."
          value={searchQuery}
          onChange={onSearchChange}
          className={styles.searchInput}
        />
      </div>
      <button
        className={`${styles.filterButton} ${showFilters ? styles.active : ""}`}
        onClick={() => setShowFilters(!showFilters)}
        title="Filter by transport mode"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 4.5h18m-18 7.5h18m-18 7.5h18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {selectedModes.size !== TRANSPORT_MODES.length && (
          <span className={styles.filterCount}>{selectedModes.size}</span>
        )}
      </button>
      <div
        className={`${styles.filterDropdown} ${
          showFilters ? styles.visible : ""
        }`}
      >
        {TRANSPORT_MODES.map((mode) => (
          <label key={mode} className={styles.filterOption}>
            <input
              type="checkbox"
              checked={selectedModes.has(mode)}
              onChange={() => onModeToggle(mode)}
            />
            <span className={styles[mode.toLowerCase()]}>{mode}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
