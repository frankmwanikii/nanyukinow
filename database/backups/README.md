# Database backups

Gzipped MySQL dumps of the production/app database for recovery.

## Restore

```bash
gunzip -c nanyukinow-YYYYMMDD-HHMMSS.sql.gz | mysql -u USER -p DATABASE
```

Or:

```bash
gunzip nanyukinow-YYYYMMDD-HHMMSS.sql.gz
mysql -u USER -p DATABASE < nanyukinow-YYYYMMDD-HHMMSS.sql
```
