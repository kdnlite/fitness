-- KDN Fitness admin database (Cloudflare D1).
-- Run once: Cloudflare dashboard -> D1 -> kdn-admin -> Console -> paste this whole file -> Execute.
-- Safe to run again; it only creates what is missing.

CREATE TABLE IF NOT EXISTS messages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  direction   TEXT NOT NULL,              -- 'in' (received) or 'out' (sent from admin)
  message_id  TEXT,                       -- RFC Message-ID header
  in_reply_to TEXT,
  peer_email  TEXT NOT NULL,              -- the customer's address (sender for 'in', recipient for 'out')
  peer_name   TEXT,
  subject     TEXT,
  text_body   TEXT,
  html_body   TEXT,
  attachments TEXT,                       -- JSON list of {name,type,size}
  is_read     INTEGER NOT NULL DEFAULT 0,
  status      TEXT,                       -- for 'out': sent / failed
  error       TEXT,
  created_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_messages_peer ON messages(peer_email, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_dir  ON messages(direction, created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_mid ON messages(message_id) WHERE message_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT NOT NULL UNIQUE,
  name        TEXT,
  kdn_id      TEXT NOT NULL UNIQUE,       -- unique ID given on payment, e.g. KDN-7Q4M2X
  plan        TEXT NOT NULL DEFAULT 'ind',-- ind / fam / gym
  status      TEXT NOT NULL DEFAULT 'active', -- active / cancelled
  valid_until INTEGER,                    -- ms timestamp
  notes       TEXT,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  ref         TEXT UNIQUE,                -- Razorpay payment id, or manual reference
  source      TEXT NOT NULL,              -- razorpay / manual
  email       TEXT,
  plan        TEXT,
  amount      INTEGER NOT NULL,           -- in paise
  currency    TEXT NOT NULL DEFAULT 'INR',
  status      TEXT NOT NULL,              -- captured / failed / refunded / manual
  method      TEXT,
  coupon      TEXT,
  note        TEXT,
  created_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_payments_time ON payments(created_at);

CREATE TABLE IF NOT EXISTS coupons (
  code        TEXT PRIMARY KEY,           -- stored lowercase
  kind        TEXT NOT NULL,              -- percent / flat / days
  value       INTEGER NOT NULL,           -- % off, rupees off, or free days
  plan        TEXT,                       -- null = all plans
  max_uses    INTEGER,                    -- null = unlimited
  used        INTEGER NOT NULL DEFAULT 0,
  expires_at  INTEGER,                    -- ms timestamp, null = never
  active      INTEGER NOT NULL DEFAULT 1,
  note        TEXT,
  created_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL                     -- JSON
);
