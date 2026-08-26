import { useState, useCallback } from "react";
import apiClient from "../api/client";
import { sqliteService } from "../services/storage/sqlite";
import { OfflineAttendanceQueueItem } from "../types";

export const useOfflineSync = () => {
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const checkPending = useCallback(async () => {
    const records = await sqliteService.getPendingRecords();
    setPendingCount(records.length);
    return records;
  }, []);

  const syncQueue = useCallback(async () => {
    const pending = await sqliteService.getPendingRecords();
    if (pending.length === 0) return;

    setSyncing(true);
    try {
      const response = await apiClient.post("/attendance/sync", {
        items: pending,
      });

      if (response.status === 200) {
        const clientIds = pending.map((p) => p.client_id);
        await sqliteService.markSynced(clientIds);
        await checkPending();
      }
    } catch {
      // Retain records in SQLite queue on network failure
    } finally {
      setSyncing(false);
    }
  }, [checkPending]);

  return {
    syncing,
    pendingCount,
    checkPending,
    syncQueue,
  };
};

export default useOfflineSync;
