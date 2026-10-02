#!/bin/bash
# =================================================================
# AUTOMATED POSTGRESQL DATABASE BACKUP SCRIPT
# =================================================================
# Set this script in crontab to run daily at 2:00 AM:
# 0 2 * * * /root/ecommerce-production/deploy/scripts/backup-db.sh >> /var/log/db_backup.log 2>&1
# =================================================================

set -e

# Configuration
CONTAINER_NAME="yathu_postgres"
DB_NAME="yathu_ecommerce"
DB_USER="yathu_admin"
BACKUP_DIR="/var/backups/postgres"
RETENTION_DAYS=14
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/db_backup_${DB_NAME}_${TIMESTAMP}.sql.gz"

echo "=================================================="
echo "[BACKUP STARTED] Date: $(date)"
echo "Target Container: ${CONTAINER_NAME}"
echo "Database: ${DB_NAME}"

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

# Execute pg_dump inside container and pipe through gzip
docker exec -t "${CONTAINER_NAME}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists | gzip > "${BACKUP_FILE}"

# Check backup file size
FILE_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "[SUCCESS] Database backup saved to: ${BACKUP_FILE} (Size: ${FILE_SIZE})"

# Also back up uploaded product images if Docker volume exists
MEDIA_BACKUP_FILE="${BACKUP_DIR}/media_uploads_${TIMESTAMP}.tar.gz"
if docker volume inspect yathu_media_uploads >/dev/null 2>&1; then
    MEDIA_DIR=$(docker volume inspect yathu_media_uploads --format '{{.Mountpoint}}')
    if [ -d "${MEDIA_DIR}" ]; then
        tar -czf "${MEDIA_BACKUP_FILE}" -C "${MEDIA_DIR}" . 2>/dev/null || true
        MEDIA_SIZE=$(du -h "${MEDIA_BACKUP_FILE}" | cut -f1)
        echo "[SUCCESS] Product media uploads saved to: ${MEDIA_BACKUP_FILE} (Size: ${MEDIA_SIZE})"
    fi
fi

# Remove backups older than retention window (14 days)
echo "Purging archives older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "db_backup_${DB_NAME}_*.sql.gz" -mtime +${RETENTION_DAYS} -exec rm -f {} \;
find "${BACKUP_DIR}" -name "media_uploads_*.tar.gz" -mtime +${RETENTION_DAYS} -exec rm -f {} \;

echo "[COMPLETED] Database and media backup finished cleanly at $(date)"
echo "=================================================="
