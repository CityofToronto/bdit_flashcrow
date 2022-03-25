BEGIN;

CREATE TABLE mvcr_access_events (
  user_id INT NOT NULL REFERENCES users (id),
  filename TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  collision_id TEXT NOT NULL REFERENCES collisions.events (collision_id)
);

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 22;
COMMIT;
