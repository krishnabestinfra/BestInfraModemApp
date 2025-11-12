export const modemStats = {
  connected: 25,
  disconnected: 8,
  totalIssues: 9,
  mostCommon: { label: "Low Signal", count: 4 }
};

export const modemErrors = [
  {
    id: "MDM001",
    modemId: "MDM001",
    status: "warning",
    error: "Low Signal",
    reason: "Heavy Rain",
    date: "2025-08-07 09:50",
    location: "Bangalore",
    signalStrength: 8
  },
  {
    id: "MDM002",
    modemId: "MDM002",
    status: "disconnected",
    error: "No SIM",
    reason: "SIM Card Removed",
    date: "2025-08-07 08:30",
    location: "Mumbai",
    signalStrength: 0
  },
  {
    id: "MDM003",
    modemId: "MDM003",
    status: "warning",
    error: "Timeout",
    reason: "Network Congestion",
    date: "2025-08-07 10:15",
    location: "Delhi",
    signalStrength: 12
  },
  {
    id: "MDM004",
    modemId: "MDM004",
    status: "disconnected",
    error: "Wire Damage",
    reason: "Physical Damage",
    date: "2025-08-07 07:45",
    location: "Chennai",
    signalStrength: 0
  },
  {
    id: "MDM005",
    modemId: "MDM005",
    status: "warning",
    error: "Low Signal",
    reason: "Poor Coverage",
    date: "2025-08-07 11:20",
    location: "Hyderabad",
    signalStrength: 6
  },
  {
    id: "MDM006",
    modemId: "MDM006",
    status: "disconnected",
    error: "None",
    reason: "Working Fine",
    date: "2025-08-07 12:00",
    location: "Pune",
    signalStrength: 15
  },
  {
    id: "MDM007",
    modemId: "MDM007",
    status: "warning",
    error: "Timeout",
    reason: "Server Issues",
    date: "2025-08-07 09:10",
    location: "Kolkata",
    signalStrength: 10
  },
  {
    id: "MDM008",
    modemId: "MDM008",
    status: "disconnected",
    error: "No SIM",
    reason: "SIM Expired",
    date: "2025-08-07 08:55",
    location: "Ahmedabad",
    signalStrength: 0
  }
];

export const alerts = [
  {
    id: "ALT001",
    modemId: "MDM008",
    type: "Signal Lost",
    date: "2025-08-07 08:10",
    location: "Chennai",
    severity: "high"
  },
  {
    id: "ALT002",
    modemId: "MDM004",
    type: "Connection Failed",
    date: "2025-08-07 07:45",
    location: "Chennai",
    severity: "high"
  },
  {
    id: "ALT003",
    modemId: "MDM002",
    type: "SIM Removed",
    date: "2025-08-07 08:30",
    location: "Mumbai",
    severity: "medium"
  },
  {
    id: "ALT004",
    modemId: "MDM001",
    type: "Low Signal Warning",
    date: "2025-08-07 09:50",
    location: "Bangalore",
    severity: "low"
  },
  {
    id: "ALT005",
    modemId: "MDM003",
    type: "Timeout Error",
    date: "2025-08-07 10:15",
    location: "Delhi",
    severity: "medium"
  }
];

export const errorChartData = [
  { label: "Low Signal", count: 4, color: "#163b7c" }, // BestInfra Blue
  { label: "No SIM", count: 2, color: "#F44336" }, // Red for errors
  { label: "Timeout", count: 2, color: "#55b56c" }, // BestInfra Green
  { label: "Wire Damage", count: 1, color: "#2a6f65" } // Darker Green
];

export const locations = [
  "All Locations",
  "Bangalore",
  "Mumbai",
  "Delhi",
  "Chennai",
  "Hyderabad",
  "Pune",
  "Kolkata",
  "Ahmedabad"
];

export const errorTypes = [
  "All Errors",
  "Low Signal",
  "No SIM",
  "Timeout",
  "Wire Damage"
]; 