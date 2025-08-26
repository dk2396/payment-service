# Payments Service

A simple **TypeScript + Node.js + Postgres** project that demonstrates:

- Webhook endpoint to accept **payment events**
- Enforcing **idempotency** (no double counting)
- **Invoice status transitions** (`sent → partially_paid → paid`)
- Transactional inserts + updates
- **Event queue + worker (actor pattern)** for async processing
- Dockerized **Postgres + pgAdmin** for easy setup

---

## 🏗 Architecture

```mermaid
flowchart LR
  C[Webhook Sender]

  subgraph Service
    API[Express API: POST /webhooks/payments]
    Q[event_queue_table]
    W[Worker_actor_per_invoice_id]
  end

  subgraph Postgres
    INV[invoices]
    PAY[payments]
  end

  subgraph Admin
    PG[pgAdmin UI]
  end

  C -->|JSON event_id, type, invoice_id, amount_cents| API
  API -->|Validate and enqueue 202| Q

  W -->|Dequeue batch| Q
  W -->|Advisory lock by invoice_id| INV
  W -->|BEGIN tx| INV
  W -->|Insert payment idempotent by event_id| PAY
  W -->|Sum payments for invoice| PAY
  W -->|Update invoice status| INV
  W -->|COMMIT tx| INV
  W -->|Delete processed event| Q

  PG <-->|Inspect DB| INV
  PG <-->|Inspect DB| PAY
  PG <-->|Inspect DB| Q

```

---

## 📂 Project Structure

```
payments-service/
├─ src/
│  ├─ app.ts              # Express app setup
│  ├─ server.ts           # API entrypoint
│  ├─ worker.ts           # Async worker loop
│  ├─ db/                 # Pool, transactions, advisory locks
│  ├─ repositories/       # SQL access
│  ├─ services/           # Business logic
│  ├─ controllers/        # Route handlers
│  ├─ routes/             # Express routes
│  ├─ utils/              # Logger + helpers
│  └─ validation/         # Zod schemas
├─ migrations/            # SQL migrations + runner
│  ├─ 001_init.sql
│  └─ run.ts
├─ seeds/                 # Seed data
│  └─ 001_seed.sql
├─ docker-compose.yml     # Postgres + pgAdmin
├─ .env.example           # Environment variables
└─ package.json
```

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/dk2396/payment-service.git
cd payments-service
npm install
```

### 2. Environment
Copy example env file:
```bash
cp .env.example .env
```

Default config:
```ini
DATABASE_URL=postgres://app:app@localhost:55432/payments
PORT=3000
```

### 3. Start Postgres + pgAdmin
```bash
npm run db:up
```

- Postgres: `localhost:55432`  
- pgAdmin: http://localhost:5050  
  - Email: `admin@example.com`  
  - Password: `admin`

👉 In pgAdmin, register a server:
- Host: `db`  
- Port: `5432`  
- Username: `app`  
- Password: `app`

### 4. Apply schema & seed invoices
```bash
npm run db:migrate
npm run db:seed
```

### 5. Run API & Worker
Open two terminals:
```bash
npm run dev     # API (Express)
npm run worker  # Worker (event processor)
```

---

## 🔌 API Usage

### POST `/webhooks/payments`

```bash
curl -X POST http://localhost:3000/webhooks/payments   -H 'content-type: application/json'   -d '{
    "event_id":"6b1b36c0-2c4a-4b3f-bc54-6b5b3f3d86c4",
    "type":"payment",
    "invoice_id":"550e8400-e29b-41d4-a716-446655440000",
    "amount_cents":3000
  }'
```

**Fields**
- `event_id`: unique UUID (idempotency key)  
- `type`: `"payment"`  
- `invoice_id`: UUID of an existing invoice  
- `amount_cents`: positive integer  

**Responses**
- `202 Accepted` → event enqueued  
- `400 Bad Request` → invalid payload  

The worker processes events asynchronously.

---

## 🧾 Invoice Lifecycle

- Seed invoice → `10,000 cents` total, status = `sent`  
- Payment `3,000` → status → `partially_paid`  
- Payment `7,000` → status → `paid`  

Idempotency ensures replays of the same `event_id` don’t double count.

---

## ⚙️ Tech Notes

- **Event Queue:** `event_queue` table + worker loop (polling).  
- **Actor Guarantee:** serialization via `pg_advisory_lock(invoice_id)`.  
- **Idempotency:** enforced by `payments.event_id` PK.  
- **Validation:** Zod schemas validate UUIDs + positive amounts.  
- **Atomicity:** insert + update happens in one DB transaction.  
