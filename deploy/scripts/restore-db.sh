#!/bin/bash
# =================================================================
# POSTGRESQL DATABASE RESTORE SCRIPT
# =================================================================
# Usage:
#   ./restore-db.sh /var/backups/postgres/db_backup_yathu_ecommerce_20260921.sql.gz
# =================================================================

set -e

BACKUP_FILE="$1"
CONTAINER_NAME="yathu_postgres"
DB_NAME="yathu_ecommerce"
DB_USER="yathu_admin"

if [ -z "${BACKUP_FILE}" ]; then
    echo "ERROR: Please specify a backup file to restore."
    echo "Usage: $0 /path/to/backup.sql.gz"
    exit 1
fi

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "ERROR: Backup file '${BACKUP_FILE}' not found."
    exit 1
fi

echo "=================================================="
echo "[WARNING] You are about to restore database '${DB_NAME}'"
echo "From file: ${BACKUP_FILE}"
echo "This will overwrite existing data!"
echo "=================================================="

read -p "Are you sure you want to proceed? (yes/no): " CONFIRM
if [ "${CONFIRM}" != "yes" ]; then
    echo "Restoration aborted."
    exit 0
fi

echo "Restoring database from compressed archive..."
gunzip -c "${BACKUP_FILE}" | docker exec -i "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}"

echo "[SUCCESS] Database restoration completed successfully at $(date)."
