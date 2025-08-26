import type { PoolClient } from "pg";

export type QueueRow = {
  event_id: string;
  event_type: string;
  payload: any;
  attempts: number;
};

export async function enqueueEvent(client: PoolClient, eventId: string, type: string, payload: any) {
  await client.query(
    `INSERT INTO event_queue(event_id, event_type, payload)
     VALUES ($1,$2,$3) ON CONFLICT (event_id) DO NOTHING`,
    [eventId, type, JSON.stringify(payload)]
  );
}

export async function dequeueBatch(client: PoolClient, limit = 25): Promise<QueueRow[]> {
  const r = await client.query(`
    WITH picked AS (
      SELECT event_id
      FROM event_queue
      WHERE next_run_at <= now()
      ORDER BY next_run_at
      FOR UPDATE SKIP LOCKED
      LIMIT $1
    )
    SELECT q.*
    FROM event_queue q
    JOIN picked p USING(event_id)
  `, [limit]);
  return r.rows as QueueRow[];
}

export async function deleteEvent(client: PoolClient, eventId: string) {
  await client.query("DELETE FROM event_queue WHERE event_id=$1", [eventId]);
}

export async function backoffEvent(client: PoolClient, eventId: string, errMsg: string) {
  await client.query(
    `UPDATE event_queue
       SET attempts = attempts + 1,
           last_error = $2,
           next_run_at = now() + (interval '5 seconds' * pow(2, LEAST(attempts,6)))
     WHERE event_id = $1`,
    [eventId, errMsg]
  );
}
