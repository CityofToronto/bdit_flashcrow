# Flashcrow Scripts

The `scripts` folder contains various scripts used for development, deployment, and automation in Flashcrow:

- `airflow`: [Airflow](https://airflow.apache.org/) jobs, mostly used to perform migration, cleaning, and normalization of datasets used in Flashcrow;
  - `airflow/dags`: [DAGs](https://airflow.apache.org/concepts.html#dags) that define tasks in jobs and their dependencies;
  - `airflow/tasks`: scripts for [tasks](https://airflow.apache.org/concepts.html#tasks), mostly Bash / Python;
  - `airflow/systemd`: [`systemd`](https://en.wikipedia.org/wiki/Systemd) configuration to run Airflow as a service in our ETL stack;
- `db`: database migrations that define subsequent versions of the Flashcrow PostgreSQL data model;
- `deployment`: provisioning and deployment scripts;
  - [`deployment/web`](deployment/web/README.md) for our web stack;
  - [`deployment/etl`](deployment/etl/README.md) for our ETL stack;
- [`dev`](dev/README.md): provisioning scripts for the Flashcrow development environment;
- `replication`: scripts for on-prem replication of Oracle CRASH / FLOW data to PostgreSQL.
