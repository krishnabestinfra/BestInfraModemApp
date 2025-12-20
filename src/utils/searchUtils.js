/**
 * Utility functions for searching and filtering modem data
 */

/**
 * Search modems by query string across multiple fields
 */
export const searchModems = (modems, query) => {
  if (!query || !query.trim()) return modems;
  
  const searchTerm = query.toLowerCase().trim();
  return modems.filter(modem => {
    const searchableFields = [
      modem.modemId || '',
      modem.meterSlNo || '',
      modem.error || '',
      modem.status || '',
      modem.location || '',
      modem.discom || '',
      modem.reason || '',
      String(modem.code || ''),
      modem.originalAlert?.codeDesc || '',
      modem.originalAlert?.discom || '',
      modem.originalAlert?.section || '',
      modem.originalAlert?.subdivision || '',
      modem.originalAlert?.division || '',
      modem.originalAlert?.circle || '',
    ];
    
    const searchableText = searchableFields.join(' ').toLowerCase();
    return searchableText.includes(searchTerm);
  });
};

/**
 * Filter modems by resolved status
 */
export const filterByResolved = (modems, showResolved) => {
  if (showResolved) {
    return modems.filter(m => m.resolved === true || m.originalAlert?.resolved === true);
  }
  return modems.filter(m => m.resolved !== true && m.originalAlert?.resolved !== true);
};

/**
 * Sort modems by date
 */
export const sortModemsByDate = (modems, newestFirst = true) => {
  return [...modems].sort((a, b) => {
    const dateA = new Date(a.date || a.resolvedAt || 0).getTime();
    const dateB = new Date(b.date || b.resolvedAt || 0).getTime();
    return newestFirst ? dateB - dateA : dateA - dateB;
  });
};

