export const modemStats = {
  connected: "1,823",
  disconnected: 47,
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
    location: "86136 52958 79253",
    signalStrength: 8
  },
  {
    id: "MDM002",
    modemId: "MDM002",
    status: "disconnected",
    error: "No SIM",
    reason: "SIM Card Removed",
    date: "2025-08-07 08:30",
    location: "86136 52958 79254",
    signalStrength: 0
  },
  {
    id: "MDM003",
    modemId: "MDM003",
    status: "warning",
    error: "Timeout",
    reason: "Network Congestion",
    date: "2025-08-07 10:15",
    location: "86136 52958 79255",
    signalStrength: 12
  },
  {
    id: "MDM004",
    modemId: "MDM004",
    status: "disconnected",
    error: "Wire Damage",
    reason: "Physical Damage",
    date: "2025-08-07 07:45",
    location: "86136 52958 79256",
    signalStrength: 0
  },
  {
    id: "MDM005",
    modemId: "MDM005",
    status: "warning",
    error: "Low Signal",
    reason: "Poor Coverage",
    date: "2025-08-07 11:20",
    location: "86136 52958 79257",
    signalStrength: 6
  },
  {
    id: "MDM006",
    modemId: "MDM006",
    status: "disconnected",
    error: "None",
    reason: "Working Fine",
    date: "2025-08-07 12:00",
    location: "86136 52958 79258",
    signalStrength: 15
  },
  {
    id: "MDM007",
    modemId: "MDM007",
    status: "warning",
    error: "Timeout",
    reason: "Server Issues",
    date: "2025-08-07 09:10",
    location: "86136 52958 79259",
    signalStrength: 10
  },
  {
    id: "MDM008",
    modemId: "MDM008",
    status: "disconnected",
    error: "No SIM",
    reason: "SIM Expired",
    date: "2025-08-07 08:55",
    location: "86136 52958 79260",
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

export const notifications = [
  {
    id: 'NTF001',
    title: 'Payment Received',
    message: 'Payment of ₹4,250 received for Zone A.',
    type: 'success',
    is_read: false,
    created_at: '2025-08-07T09:10:00Z'
  },
  {
    id: 'NTF002',
    title: 'Network Maintenance',
    message: 'Scheduled maintenance at Building 304.',
    type: 'warning',
    is_read: false,
    created_at: '2025-08-07T05:40:00Z'
  },
  {
    id: 'NTF003',
    title: 'Balance Reminder',
    message: 'Diesel generator balance due in 3 days.',
    type: 'info',
    is_read: true,
    created_at: '2025-08-06T16:15:00Z'
  }
];

// Test alerts with error codes for testing purposes
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