CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY,
  total_cents INT NOT NULL CHECK (total_cents > 0),
  status TEXT NOT NULL CHECK (status IN ('sent','partially_paid','paid'))
);

CREATE TABLE IF NOT EXISTS payments (
  event_id UUID PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  amount_cents INT NOT NULL CHECK (amount_cents > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event_queue (
  event_id UUID PRIMARY KEY,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  next_run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS event_queue_sched_idx ON event_queue (next_run_at);
