/**
 * Normalizes modem identifiers from both APIs
 * Handles: modemSINo, modemNo, modemSlNo, modemno, sno, modemId, id, modem_sl_no
 * These fields represent the same modem identifier across different APIs
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
 * Gets status string from error code
 * Maps error codes to status types: 'warning', 'success', 'disconnected', 'default'
 */
export const getStatusFromCode = (code) => {
  if (!code) return 'default';
  
  const map = {
    202: 'warning',      // Modem / DCU Auto Restart
    213: 'success',      // Meter COM Restored
    214: 'disconnected', // DCU / Modem Power Failed
    215: 'success',      // DCU / Modem Power Restored
    112: 'disconnected',
    212: 'disconnected', // Meter COM Failed
  };
  
  return map[code] || 'default';
};

