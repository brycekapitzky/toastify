export interface StatusManager {
  getSequenceStatus: (userId?: string, isDemo?: boolean) => string;
  getEmailStagesStatus: (userId?: string, isDemo?: boolean) => string;
  toggleSequence: (userId?: string, isDemo?: boolean) => string;
  toggleEmailStages: (userId?: string, isDemo?: boolean) => string;
  isProspectSearchConnected: (userId?: string, isDemo?: boolean) => boolean;
  toggleProspectSearchConnection: (userId?: string, isDemo?: boolean) => boolean;
}

export const createStatusManager = (): StatusManager => {
  const getSequenceStatus = (userId?: string, isDemo?: boolean) => {
    if (isDemo) {
      return localStorage.getItem("demo-sequence-status") || "paused";
    }
    if (userId) {
      const userSequenceKey = `toastify-sequence-status-${userId}`;
      return localStorage.getItem(userSequenceKey) || "paused";
    }
    return "paused";
  };

  const getEmailStagesStatus = (userId?: string, isDemo?: boolean) => {
    if (isDemo) {
      return localStorage.getItem("demo-stages-status") || "paused";
    }
    if (userId) {
      const userStagesKey = `toastify-stages-status-${userId}`;
      return localStorage.getItem(userStagesKey) || "paused";
    }
    return "paused";
  };

  const toggleSequence = (userId?: string, isDemo?: boolean) => {
    if (isDemo) {
      const currentStatus = localStorage.getItem("demo-sequence-status") || "paused";
      const newStatus = currentStatus === "activated" ? "paused" : "activated";
      localStorage.setItem("demo-sequence-status", newStatus);
      return newStatus;
    }

    if (userId) {
      const userSequenceKey = `toastify-sequence-status-${userId}`;
      const currentStatus = localStorage.getItem(userSequenceKey) || "paused";
      const newStatus = currentStatus === "activated" ? "paused" : "activated";
      localStorage.setItem(userSequenceKey, newStatus);
      return newStatus;
    }

    return "paused";
  };

  const toggleEmailStages = (userId?: string, isDemo?: boolean) => {
    if (isDemo) {
      const currentStatus = localStorage.getItem("demo-stages-status") || "paused";
      const newStatus = currentStatus === "activated" ? "paused" : "activated";
      localStorage.setItem("demo-stages-status", newStatus);
      return newStatus;
    }

    if (userId) {
      const userStagesKey = `toastify-stages-status-${userId}`;
      const currentStatus = localStorage.getItem(userStagesKey) || "paused";
      const newStatus = currentStatus === "activated" ? "paused" : "activated";
      localStorage.setItem(userStagesKey, newStatus);
      return newStatus;
    }

    return "paused";
  };

  const isProspectSearchConnected = (userId?: string, isDemo?: boolean) => {
    if (isDemo) {
      return localStorage.getItem("demo-prospect-search-connected") === "true";
    }
    if (userId) {
      const userSearchKey = `toastify-prospect-search-${userId}`;
      const searchData = localStorage.getItem(userSearchKey);
      return searchData ? JSON.parse(searchData).isConnected : false;
    }
    return false;
  };

  const toggleProspectSearchConnection = (userId?: string, isDemo?: boolean) => {
    const currentlyConnected = isProspectSearchConnected(userId, isDemo);
    const newStatus = !currentlyConnected;

    if (isDemo) {
      localStorage.setItem("demo-prospect-search-connected", newStatus.toString());
    } else if (userId) {
      const userSearchKey = `toastify-prospect-search-${userId}`;
      localStorage.setItem(
        userSearchKey,
        JSON.stringify({
          isConnected: newStatus,
          lastUpdated: new Date().toISOString(),
        })
      );
    }

    return newStatus;
  };

  return {
    getSequenceStatus,
    getEmailStagesStatus,
    toggleSequence,
    toggleEmailStages,
    isProspectSearchConnected,
    toggleProspectSearchConnection,
  };
};

export const statusManager = createStatusManager();