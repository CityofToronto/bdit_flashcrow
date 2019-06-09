# ETL Stack Deployment

## Accessing the ETL Stack

You will first need the `flashcrow-dev-key.pem` file, as provided by Cloud Services.  The rest of this guide assumes you have that file at `~\ssh\flashcrow-dev-key.pem`.

```powershell
ssh -i ~\ssh\flashcrow-dev-key.pem ec2-user@flashcrow-etl.intra.dev-toronto.ca
```

## Provisioning

```bash
cd flashcrow
./scripts/deployment/etl/provision-etl-ec2.sh
```

## Deployment

You can

```bash
cd flashcrow
git fetch
git merge origin/master
```

to bring Airflow jobs up to date.  It is, however, recommended that you instead write jobs on the ETL server, then test them via the Airflow CLI before turning on automatic scheduling.
