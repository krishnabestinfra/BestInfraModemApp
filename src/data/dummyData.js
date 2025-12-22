export const modemStats = {
  connected: "1,823",
  disconnected: 47,
  totalIssues: 9,
  mostCommon: { label: "Low Signal", count: 4 }
};

export const modemErrors = [
  {
    id: "MDM009",
    modemId: "MDM009",
    code: 202,
    errorCode: 202,
    status: "warning",
    error: "Modem/DCU Auto Restart",
    codeDesc: "Modem/DCU Auto Restart",
    reason: "Automatic restart detected due to system instability",
    date: "2025-08-07 11:30",
    location: "Mumbai - Zone B",
    discom: "Mumbai",
    signalStrength: 15
  },
  {
    id: "MDM010",
    modemId: "MDM010",
    code: 214,
    errorCode: 214,
    status: "disconnected",
    error: "DCU/Modem Power Failed",
    codeDesc: "DCU/Modem Power Failed",
    reason: "Power supply interruption detected",
    date: "2025-08-07 09:15",
    location: "Delhi - Zone C",
    discom: "Delhi",
    signalStrength: 0
  },
  {
    id: "MDM011",
    modemId: "MDM011",
    code: 112,
    errorCode: 112,
    status: "disconnected",
    error: "Meter COM Failed",
    codeDesc: "Meter COM Failed",
    reason: "Communication failure between modem and meter",
    date: "2025-08-07 10:45",
    location: "Bangalore - Zone A",
    discom: "Bangalore",
    signalStrength: 8
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

export const notifications = [
  {
    id: 'NTF001',
    title: 'Meter COM Failed Alert',
    message: 'Modem MDM112001 at Bangalore - Zone A has communication failure.',
    type: 'warning',
    is_read: false,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString() // 15 minutes ago
  },
  {
    id: 'NTF002',
    title: 'Modem Auto Restart Detected',
    message: 'Modem MDM202002 at Mumbai - Zone B automatically restarted.',
    type: 'alert',
    is_read: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  },
  {
    id: 'NTF003',
    title: 'Power Failure Alert',
    message: 'DCU/Modem power failed at Delhi - Zone C. Signal strength: 0.',
    type: 'warning',
    is_read: true,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5 hours ago
  },
  {
    id: 'NTF004',
    title: 'Network Issue Resolved',
    message: 'Network connection restored for modem MDM001 at Building B-Floor 2.',
    type: 'success',
    is_read: false,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
  },
  {
    id: 'NTF005',
    title: 'Low Signal Warning',
    message: 'Modem MDM003 showing weak signal strength (5 dBm) at Building C-Floor 3.',
    type: 'alert',
    is_read: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  },
];

export const testAlerts = [
  {
    id: "TEST001",
    code: 112,
    modemSlNo: "MDM112001",
    codeDesc: "Meter COM Failed",
    error: "Meter COM Failed",
    status: "disconnected",
    date: "2025-01-15 10:30:00",
    updatedAt: "2025-01-15 10:30:00",
    location: "Bangalore - Zone A",
    reason: "Communication failure between modem and meter",
    signalStrength: 5
  },
  {
    id: "TEST002",
    code: 202,
    modemSlNo: "MDM202002",
    codeDesc: "Modem/DCU Auto Restart",
    error: "Modem/DCU Auto Restart",
    status: "warning",
    date: "2025-01-15 11:15:00",
    updatedAt: "2025-01-15 11:15:00",
    location: "Mumbai - Zone B",
    reason: "Automatic restart detected",
    signalStrength: 12
  },
  {
    id: "TEST003",
    code: 214,
    modemSlNo: "MDM214003",
    codeDesc: "DCU/Modem Power Failed",
    error: "DCU/Modem Power Failed",
    status: "disconnected",
    date: "2025-01-15 09:45:00",
    updatedAt: "2025-01-15 09:45:00",
    location: "Delhi - Zone C",
    reason: "Power supply interruption detected",
    signalStrength: 0
  },
  {
    id: "TEST004",
    code: 112,
    modemSlNo: "MDM112004",
    codeDesc: "Meter COM Failed",
    error: "Meter COM Failed",
    status: "disconnected",
    date: "2025-01-15 12:00:00",
    updatedAt: "2025-01-15 12:00:00",
    location: "Chennai - Zone D",
    reason: "Serial communication error",
    signalStrength: 8
  }
];

// Dummy data for offline modems
export const offlineModems = [
  {
    id: "OFF001",
    code: 214,
    modemSlNo: "MDM001",
    modemno: "MDM001",
    codeDesc: "Modem Power Failed",
    error: "Modem Power Failed",
    status: "disconnected",
    modemDate: "Nov 11, 2025 03:00 PM",
    date: "2025-11-11 15:00:00",
    discom: "Building B-Floor 2",
    location: "Building B-Floor 2",
    signalStrength1: 0,
    signalStrength2: 0,
    signalStrength: 0,
    resolved: false,
  },
  {
    id: "OFF002",
    code: 112,
    modemSlNo: "MDM002",
    modemno: "MDM002",
    codeDesc: "Meter COM Failed",
    error: "Meter COM Failed",
    status: "disconnected",
    modemDate: "13-08-2023 04:00PM",
    date: "2023-08-13 16:00:00",
    discom: "Building A-Floor 1",
    location: "Building A-Floor 1",
    signalStrength1: 8,
    signalStrength2: 8,
    signalStrength: 8,
    resolved: false,
  },
  {
    id: "OFF003",
    code: 212,
    modemSlNo: "MDM003",
    modemno: "MDM003",
    codeDesc: "Meter COM Failed",
    error: "Meter COM Failed",
    status: "disconnected",
    modemDate: "Nov 20, 2025 02:30 PM",
    date: "2025-11-20 14:30:00",
    discom: "Building C-Floor 3",
    location: "Building C-Floor 3",
    signalStrength1: 5,
    signalStrength2: 5,
    signalStrength: 5,
    resolved: false,
  },
  {
    id: "OFF004",
    code: 214,
    modemSlNo: "MDM004",
    modemno: "MDM004",
    codeDesc: "Modem Power Failed",
    error: "Modem Power Failed",
    status: "disconnected",
    modemDate: "Nov 18, 2025 10:15 AM",
    date: "2025-11-18 10:15:00",
    discom: "Building D-Floor 2",
    location: "Building D-Floor 2",
    signalStrength1: 0,
    signalStrength2: 0,
    signalStrength: 0,
    resolved: false,
  },
];

// Dummy data for visited modems
export const visitedModems = [
  {
    id: "VIS001",
    code: 202,
    modemSlNo: "MDM001",
    modemno: "MDM001",
    codeDesc: "Network Failure",
    error: "Network Failure",
    status: "resolved",
    modemDate: "Nov 21, 2025 02:45 PM",
    date: "2025-11-21 14:45:00",
    updatedAt: "Nov 21, 2025 02:45 PM",
    resolvedAt: "Nov 21, 2025 02:45 PM",
    discom: "Building B-Floor 2",
    location: "Building B-Floor 2",
    resolved: true,
  },
  {
    id: "VIS002",
    code: 214,
    modemSlNo: "MDM002",
    modemno: "MDM002",
    codeDesc: "Modem Power Failed",
    error: "Modem Power Failed",
    status: "not-resolved",
    modemDate: "Nov 20, 2025 11:30 AM",
    date: "2025-11-20 11:30:00",
    updatedAt: "Nov 20, 2025 11:30 AM",
    resolvedAt: "Nov 20, 2025 11:30 AM",
    discom: "Building A-Floor 1",
    location: "Building A-Floor 1",
    resolved: false,
  },
  {
    id: "VIS003",
    code: 213,
    modemSlNo: "MDM003",
    modemno: "MDM003",
    codeDesc: "Meter COM Restored",
    error: "Meter COM Restored",
    status: "resolved",
    modemDate: "Nov 19, 2025 09:20 AM",
    date: "2025-11-19 09:20:00",
    updatedAt: "Nov 19, 2025 09:20 AM",
    resolvedAt: "Nov 19, 2025 09:20 AM",
    discom: "Building C-Floor 3",
    location: "Building C-Floor 3",
    resolved: true,
  },
  {
    id: "VIS004",
    code: 112,
    modemSlNo: "MDM004",
    modemno: "MDM004",
    codeDesc: "Meter COM Failed",
    error: "Meter COM Failed",
    status: "not-resolved",
    modemDate: "Nov 18, 2025 04:15 PM",
    date: "2025-11-18 16:15:00",
    updatedAt: "Nov 18, 2025 04:15 PM",
    resolvedAt: "Nov 18, 2025 04:15 PM",
    discom: "Building D-Floor 2",
    location: "Building D-Floor 2",
    resolved: false,
  },
];

// Dummy data for resolved modems
export const resolvedModems = [
  {
    id: "RES001",
    modemSlNo: "MDM001",
    modemno: "MDM001",
    modemId: "MDM001",
    codeDesc: "Network Failure",
    error: "Network Failure",
    status: "Resolved",
    updatedAt: "Nov 21, 2025 02:45 PM",
    resolvedAt: "Nov 21, 2025 02:45 PM",
    discom: "Building B-Floor 2",
    location: "Building B-Floor 2",
    resolved: true,
  },
  {
    id: "RES002",
    modemSlNo: "MDM003",
    modemno: "MDM003",
    modemId: "MDM003",
    codeDesc: "Meter COM Restored",
    error: "Meter COM Restored",
    status: "Resolved",
    updatedAt: "Nov 19, 2025 09:20 AM",
    resolvedAt: "Nov 19, 2025 09:20 AM",
    discom: "Building C-Floor 3",
    location: "Building C-Floor 3",
    resolved: true,
  },
  {
    id: "RES003",
    modemSlNo: "MDM005",
    modemno: "MDM005",
    modemId: "MDM005",
    codeDesc: "Modem Auto Restart",
    error: "Modem Auto Restart",
    status: "Resolved",
    updatedAt: "Nov 17, 2025 03:30 PM",
    resolvedAt: "Nov 17, 2025 03:30 PM",
    discom: "Building E-Floor 1",
    location: "Building E-Floor 1",
    resolved: true,
  },
];