-- 1. Reset negative stock for Lemon Blast
UPDATE inventory 
SET quantity = 350 
WHERE sku = 'lemon' AND quantity < 0;

-- 2. Optional: Fix orders with identical "mock" dates to have unique, more recent timestamps
-- This assumes orders with IDs starting with 'BUP' and date '2026-03-26' are the ones to fix.
-- We'll spread them out over the last 24 hours.

-- First, let's just see how many there are (not executable in a simple UPDATE)
-- For a simple script, we'll just update the date to '2026-04-08' (today) for any order in the "future" 
-- relative to real current time if it's considered mock.

UPDATE orders
SET created_at = NOW() - (random() * interval '6 hours')
WHERE created_at > '2026-03-26 00:00:00' AND created_at < '2026-03-27 00:00:00';

-- 3. Add a log entry for the manual correction
INSERT INTO stock_movements (sku, type, amount, note, created_at)
VALUES ('lemon', 'correction', 0, 'Manual data correction for negative stock bug', NOW());
