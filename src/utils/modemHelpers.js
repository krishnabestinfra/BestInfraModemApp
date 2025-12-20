/**
 * Helper functions for modem data processing
 * Extracted from DashboardScreen to simplify and reuse logic
 */

/**
 * Extract modem ID from various possible fields
 */
export const extractModemId = (item) => {
  return item?.modemSlNo || item?.modemno || item?.sno?.toString() || item?.modemId || item?.id?.toString();
};

/**
 * Extract location from various possible fields
 */
export const extractLocation = (item) => {
  return item?.discom || item?.location || item?.meterLocation || 
         item?.section || item?.subdivision || item?.division || item?.circle || 'N/A';
};

/**
 * Extract error description from various possible fields
 */
export const extractError = (item) => {
  return item?.codeDesc || item?.error || item?.commissionStatus || 
         item?.communicationStatus || 'N/A';
};

/**
 * Extract reason from various possible fields
 */
export const extractReason = (item) => {
  return item?.reason || item?.codeDesc || item?.comments || 
         item?.techSupportStatus || 'N/A';
};

/**
 * Extract date string from various possible fields
 */
export const extractDate = (item) => {
  if (item?.modemDate) {
    return `${item.modemDate} ${item.modemTime || ''}`.trim();
  }
  return item?.date || item?.lastCommunicatedAt || item?.installedOn || item?.updatedAt || 'N/A';
};

/**
 * Extract signal strength from various possible fields
 */
export const extractSignalStrength = (item) => {
  return item?.signalStrength1 || item?.signalStrength2 || item?.signalStrength || 0;
};

/**
 * Get status from error code
 */
export const getStatusFromCode = (code) => {
  const statusMap = {
    202: 'warning',
    213: 'success',
    214: 'disconnected',
    215: 'success',
    112: 'disconnected',
    212: 'disconnected',
  };
  return statusMap[code] || 'default';
};

/**
 * Get signal band (weak/average/strong) from signal strength value
 */
export const getSignalBand = (signalStrength) => {
  const n = Number(signalStrength) || 0;
  if (n < 15) return 'weak';
  if (n <= 20) return 'average';
  return 'strong';
};

/**
 * Get error type description from error code
 */
export const getErrorType = (code, fallbackError = 'Unknown Error') => {
  const errorMap = {
    202: 'Modem Auto Restart',
    214: 'Modem Power Failed',
    112: 'Meter COM Failed',
    212: 'Meter COM Failed',
  };
  return errorMap[code] || fallbackError;
};

/**
 * Normalizes modem identifiers from both APIs
 * Handles: modemSINo, modemNo, modemSlNo, modemno, sno, modemId, id, modem_sl_no
 */
export const normalizeModemIdentifier = (item) => {
  if (!item) return null;
  
  const identifiers = [
    item.modemSINo,
    item.modemNo,
    item.modemSlNo,
    item.modemno,
    item.modemId,
    item.modem_sl_no,
    item.sno,
    item.id
  ];
  
  for (const id of identifiers) {
    if (id !== null && id !== undefined && id !== '') {
      return String(id).trim();
    }
  }
  
  return null;
};

/**
 * Normalize modem record from API response
 */
export const normalizeModemRecord = (alert = {}, index = 0, fallbackImage = null) => {
  const id = alert.id?.toString() || extractModemId(alert) || `alert-${index}`;
  const modemId = extractModemId(alert) || id;
  const code = alert.code || alert.errorCode || 'N/A';
  const dateStr = extractDate(alert);

  return {
    id,
    modemId,
    location: extractLocation(alert),
    error: extractError(alert),
    reason: extractReason(alert),
    date: dateStr,
    _parsedDate: new Date(dateStr).getTime(),
    status: getStatusFromCode(code),
    signalStrength: extractSignalStrength(alert),
    discom: alert.discom || alert.circle || alert.division || 'N/A',
    meterSlNo: alert.meterSlNo || alert.ctmtrno || extractModemId(alert) || 'N/A',
    code: code,
    photos: fallbackImage ? [fallbackImage] : [],
    originalAlert: alert,
  };
};

/**
 * Create searchable text from modem record
 */
export const createSearchableText = (modem) => {
  const fields = [
    modem.modemId || '',
    modem.meterSlNo || '',
    modem.error || '',
    modem.location || '',
    modem.discom || '',
    modem.reason || '',
    modem.status || '',
    String(modem.code || ''),
    modem.originalAlert?.codeDesc || '',
    modem.originalAlert?.discom || '',
    modem.originalAlert?.section || '',
    modem.originalAlert?.subdivision || '',
    modem.originalAlert?.division || '',
    modem.originalAlert?.circle || '',
    extractModemId(modem.originalAlert) || '',
    modem.originalAlert?.meterSlNo || '',
    modem.originalAlert?.ctmtrno || '',
  ];
  
  return fields.join(' ').toLowerCase();
};

