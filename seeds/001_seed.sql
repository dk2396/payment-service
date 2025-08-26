INSERT INTO invoices (id, total_cents, status)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 10000, 'sent')
ON CONFLICT (id) DO NOTHING;
