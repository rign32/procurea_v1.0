# Database Backup & Recovery Runbook

## Infrastructure

- **Cloud SQL Instance**: `procureafullapp-kopia-fdc`
- **GCP Project**: `project-c64b9be9-1d92-4bc6-be7`
- **Databases**: `procurea` (production), `procurea_staging` (staging)
- **Engine**: PostgreSQL

## Automated Backups (Cloud SQL)

### Configuration

Cloud SQL automated backups are enabled with the following settings:

```bash
# Enable automated backups (daily, 7-day retention)
gcloud sql instances patch procureafullapp-kopia-fdc \
  --backup-start-time=03:00 \
  --retained-backups-count=7 \
  --retained-transaction-log-days=7 \
  --project=project-c64b9be9-1d92-4bc6-be7
```

### Verify Backup Status

```bash
# List recent backups
gcloud sql backups list \
  --instance=procureafullapp-kopia-fdc \
  --project=project-c64b9be9-1d92-4bc6-be7

# Describe a specific backup
gcloud sql backups describe <BACKUP_ID> \
  --instance=procureafullapp-kopia-fdc \
  --project=project-c64b9be9-1d92-4bc6-be7
```

## Point-in-Time Recovery (PITR)

Cloud SQL supports PITR using transaction logs (retained for 7 days).

```bash
# Restore to a specific point in time
gcloud sql instances clone procureafullapp-kopia-fdc procurea-recovery \
  --point-in-time='2026-04-10T12:00:00Z' \
  --project=project-c64b9be9-1d92-4bc6-be7
```

## Manual Backup (On-Demand)

```bash
# Create an on-demand backup before major changes
gcloud sql backups create \
  --instance=procureafullapp-kopia-fdc \
  --description="Pre-migration backup" \
  --project=project-c64b9be9-1d92-4bc6-be7
```

## Recovery Procedures

### Scenario 1: Restore from Automated Backup

```bash
# 1. Identify the backup to restore
gcloud sql backups list --instance=procureafullapp-kopia-fdc --project=project-c64b9be9-1d92-4bc6-be7

# 2. Restore (creates a new instance to avoid overwriting)
gcloud sql instances clone procureafullapp-kopia-fdc procurea-restored \
  --project=project-c64b9be9-1d92-4bc6-be7

# 3. Verify data integrity on the restored instance
# 4. Update DATABASE_URL in GitHub Secrets to point to restored instance
# 5. Redeploy (push to staging/main)
```

### Scenario 2: Accidental Data Deletion

1. Use PITR to restore to the moment before deletion
2. Export only the affected tables from the restored instance
3. Import into production instance using `pg_dump` / `psql`

### Scenario 3: Schema Migration Failure

1. CI/CD runs `prisma migrate deploy` — if it fails, the deploy is rolled back
2. If the migration was applied but broke something:
   - Create a new migration that reverses the change
   - Or restore from the latest backup

## Monitoring

The backend health endpoint `/api/health` verifies database connectivity.
Smoke tests at `/api/monitoring/status` check DB status every run.

## Retention Policy

| Type | Retention | Frequency |
|------|-----------|-----------|
| Automated backups | 7 days | Daily at 03:00 UTC |
| Transaction logs (PITR) | 7 days | Continuous |
| On-demand backups | Until deleted | Manual |

## Contacts

- **GCP Console**: https://console.cloud.google.com/sql/instances/procureafullapp-kopia-fdc
- **Alerts**: Slack #alerts channel (via observability service)
