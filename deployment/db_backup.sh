#!/usr/bin/env bash
set -e

# Configuration
BACKUP_DIR="/var/backups/postgres"
DB_NAME="yathu_ecommerce_db"
DB_USER="yathu_admin"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "[PostgreSQL Backup] Exporting ${DB_NAME} to ${BACKUP_FILE}..."
pg_dump -U "${DB_USER}" "${DB_NAME}" | gzip > "${BACKUP_FILE}"

echo "[PostgreSQL Backup] Cleaning backups older than 14 days..."
find "${BACKUP_DIR}" -type f -name "*.sql.gz" -mtime +14 -delete

echo "[PostgreSQL Backup] Backup completed successfully."
