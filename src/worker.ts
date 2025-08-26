import { withClient } from "./db/tx";
import { dequeueBatch, deleteEvent, backoffEvent } from "./repositories/queue.repo";
import { handleQueuedEvent } from "./services/queue.service";
import { log } from "./utils/logger";

async function tick() {
  await withClient(async (client) => {
    const rows = await dequeueBatch(client, 25);
    for (const row of rows) {
      try {
        // Wrap each event in its own transaction
        await client.query("BEGIN");
        await handleQueuedEvent(client, row);
        await deleteEvent(client, row.event_id);
        await client.query("COMMIT");
      } catch (e: any) {
        await client.query("ROLLBACK");
        await backoffEvent(client, row.event_id, String(e?.message || e));
        log.error("Event failed", row.event_id, e?.message || e);
      }
    }
  });
}

(async function loop() {
  log.info("Worker started");
  for (;;) {
    await tick();
    await new Promise(r => setTimeout(r, 300)); // polling; easy to swap to LISTEN/NOTIFY later
  }
})();
