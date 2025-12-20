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

