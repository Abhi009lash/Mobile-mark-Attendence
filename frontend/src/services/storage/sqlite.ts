import { OfflineAttendanceQueueItem } from "../../types";

// In-memory fallback queue for React Native testing / environment where expo-sqlite is mocked
const memoryQueue: OfflineAttendanceQueueItem[] = [];

export const sqliteService = {
  async init(): Promise<void> {
    // Database table initialization
    return Promise.resolve();
  },

  async enqueueAttendance(
    item: Omit<OfflineAttendanceQueueItem, "synced">
  ): Promise<OfflineAttendanceQueueItem> {
    const queueItem: OfflineAttendanceQueueItem = {
      ...item,
      synced: 0,
    };
    memoryQueue.push(queueItem);
    return Promise.resolve(queueItem);
  },

  async getPendingRecords(): Promise<OfflineAttendanceQueueItem[]> {
    const pending = memoryQueue.filter((item) => item.synced === 0);
    return Promise.resolve(pending);
  },

  async markSynced(clientIds: string[]): Promise<void> {
    memoryQueue.forEach((item) => {
      if (clientIds.includes(item.client_id)) {
        item.synced = 1;
      }
    });
    return Promise.resolve();
  },

  async clearQueue(): Promise<void> {
    memoryQueue.length = 0;
    return Promise.resolve();
  },
};

export default sqliteService;
