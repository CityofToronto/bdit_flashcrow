# Database Migration Scripts

The scripts in this folder define a *migration framework* for MOVE:

- `db-update-install.sql` installs a simple bookkeeping table to keep track of the current database version;
- `db-update.sh` runs successive migration scripts;
- `schema-N.up.sql` files define "forward migrations", which upgrade the database to newer versions;
- `schema-N.down.sql` files define "backward migrations", which downgrade the database to older versions.

## Initial Setup

```bash
psql $PSQL_ARGS < db-update-install.sql
```

## Introducing Schema Changes

During application development, you might need to add new tables, modify existing columns, etc.  Those changes are captured in migration files.

Start by creating new migration scripts:

```bash
./db-new-migration-create.sh
```

This will create two scripts `schema-N+1.up.sql`, `schema-N+1.down.sql` where `N` is the latest database schema version.

Next, implement the forward and backward migrations in those two files.  In general, `schema-N+1.down.sql` should *undo* the operations in `schema-N+1.up.sql` by applying the inverse operations in reverse order.  Look at existing migration files for examples.

## Testing Schema Changes

In development, make sure you have run both the forward and backward migration scripts before submitting a pull request.

We're currently working on a database testing harness that will make testing database changes and queries much easier, but for now database testing is largely manual.
