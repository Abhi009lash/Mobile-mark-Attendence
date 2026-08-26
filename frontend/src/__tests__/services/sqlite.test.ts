import { sqliteService } from "../../services/storage/sqlite";

describe("SQLite Offline Queue Service", () => {
  beforeEach(async () => {
    await sqliteService.clearQueue();
  });

  it("enqueues offline attendance record with pending status (synced = 0)", async () => {
    const item = await sqliteService.enqueueAttendance({
      client_id: "test-client-uuid-1",
      employee_id: 10,
      date: "2026-08-26",
      check_in: "2026-08-26T09:00:00Z",
      check_in_latitude: 12.9716,
      check_in_longitude: 77.5946,
    });

    expect(item.client_id).toBe("test-client-uuid-1");
    expect(item.synced).toBe(0);

    const pending = await sqliteService.getPendingRecords();
    expect(pending.length).toBe(1);
    expect(pending[0].client_id).toBe("test-client-uuid-1");
  });

  it("marks queued records as synced when server processes them", async () => {
    await sqliteService.enqueueAttendance({
      client_id: "test-client-uuid-2",
      employee_id: 10,
      date: "2026-08-26",
    });

    await sqliteService.markSynced(["test-client-uuid-2"]);

    const pending = await sqliteService.getPendingRecords();
    expect(pending.length).toBe(0);
  });
});
