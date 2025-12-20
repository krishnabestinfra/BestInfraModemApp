import { normalizeModemIdentifier } from './modemHelpers';

export const calculateDashboardMetrics = (apiData, modemIds) => {
  const nonCommunicatingCodes = [214, 112, 212];
  const communicatingSet = new Set(modemIds.map(id => id?.toString()).filter(Boolean));
  const nonCommunicatingSet = new Set();
  
  if (apiData && apiData.alerts && apiData.alerts.length > 0) {
    const modemStatusMap = new Map();
    const normalizedModemIds = new Set(modemIds.map(id => id ? String(id).trim() : null).filter(Boolean));
    
    apiData.alerts?.forEach(alert => {
      const alertModemId = normalizeModemIdentifier(alert);
      if (!alertModemId || !normalizedModemIds.has(alertModemId)) return;
      const matchingOfficerModemId = modemIds.find(officerModemId => String(officerModemId).trim() === alertModemId);
      if (!matchingOfficerModemId) return;
      const code = Number(alert.code || alert.errorCode);
      if (!isNaN(code)) {
        const status = nonCommunicatingCodes.includes(code) ? 'non-communicating' : 'communicating';
        modemStatusMap.set(matchingOfficerModemId, status);
      }
    });
    
    modemStatusMap.forEach((status, modemId) => {
      const modemIdStr = modemId.toString();
      if (status === 'non-communicating') {
        nonCommunicatingSet.add(modemIdStr);
        communicatingSet.delete(modemIdStr);
      } else {
        communicatingSet.add(modemIdStr);
        nonCommunicatingSet.delete(modemIdStr);
      }
    });
  }

  return {
    communicatingModems: communicatingSet.size,
    nonCommunicatingModems: nonCommunicatingSet.size,
    totalTasksToday: apiData?.alerts?.length || 0,
    completedTasksToday: 0,
  };
};
