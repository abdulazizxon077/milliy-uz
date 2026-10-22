-- Weekly hours in the OpenStreetMap opening_hours format, plus links that
-- tell visitors where a record and its photo come from.
ALTER TABLE places ADD COLUMN opening_hours TEXT NOT NULL DEFAULT '';
ALTER TABLE places ADD COLUMN website       TEXT NOT NULL DEFAULT '';
ALTER TABLE places ADD COLUMN image_credit  TEXT NOT NULL DEFAULT '';
ALTER TABLE places ADD COLUMN image_source  TEXT NOT NULL DEFAULT '';
ALTER TABLE places ADD COLUMN source        TEXT NOT NULL DEFAULT '';

-- Carry the old single time range over so existing records keep their hours.
UPDATE places
   SET opening_hours = CASE
         WHEN is_24_7 = 1 THEN '24/7'
         ELSE open_time || '-' || close_time
       END;
