#!/usr/bin/env bash
# =================================================================
# AUTOMATED POSTGRESQL DATABASE BACKUP SCRIPT WITH ROLLING RETENTION
# =================================================================
# Rolling Retention Policy:
#   - 7 Daily Compressed Backups (/var/backups/postgres/daily)
#   - 4 Weekly Backups taken on Sundays (/var/backups/postgres/weekly)
# Alerting: Instant Telegram notifications on success/failure
# Cron Schedule: 0 2 * * * (Every night at 2:00 AM UTC)
# =================================================================

set -uo pipefail

# 1. Configuration & Directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/../.env"

if [ -f "${ENV_FILE}" ]; then
  export $(grep -E '^(POSTGRES_DB|POSTGRES_USER|POSTGRES_PASSWORD|TELEGRAM_BOT_TOKEN|TELEGRAM_CHAT_ID|SERVER_NAME)=' "${ENV_FILE}" | xargs -d '\n' 2>/dev/null || true)
fi

CONTAINER_NAME="yathu_postgres"
DB_NAME="${POSTGRES_DB:-yathu_ecommerce}"
DB_USER="${POSTGRES_USER:-yathu_admin}"
SERVER_NAME="${SERVER_NAME:-$(hostname)}"

BACKUP_ROOT="/var/backups/postgres"
DAILY_DIR="${BACKUP_ROOT}/daily"
WEEKLY_DIR="${BACKUP_ROOT}/weekly"
MEDIA_DIR="${BACKUP_ROOT}/media"

mkdir -p "${DAILY_DIR}" "${WEEKLY_DIR}" "${MEDIA_DIR}"

TIMESTAMP="$(date +'%Y%m%d_%H%M%S')"
DAY_OF_WEEK="$(date +'%u')" # 1=Mon, 7=Sun
DATE_HUMAN="$(date '+%Y-%m-%d %H:%M:%S UTC')"

DAILY_FILE="${DAILY_DIR}/db_${DB_NAME}_daily_${TIMESTAMP}.sql.gz"
WEEKLY_FILE="${WEEKLY_DIR}/db_${DB_NAME}_weekly_${TIMESTAMP}.sql.gz"
MEDIA_FILE="${MEDIA_DIR}/media_uploads_${TIMESTAMP}.tar.gz"

TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-}"

send_telegram_notification() {
  local message="$1"
  if [ -n "${TELEGRAM_BOT_TOKEN}" ] && [ -n "${TELEGRAM_CHAT_ID}" ]; then
    curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
      -d "chat_id=${TELEGRAM_CHAT_ID}" \
      -d "parse_mode=HTML" \
      -d "text=${message}" > /dev/null 2>&1 || echo "[WARNING] Could not dispatch Telegram notification."
  fi
}

echo "=================================================="
echo "[BACKUP STARTED] ${DATE_HUMAN}"
echo "Target Container: ${CONTAINER_NAME}"
echo "Database: ${DB_NAME}"

START_TIME=$(date +%s)

# 2. Check Database Container Availability
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  ERR_MSG="❌ <b>[BACKUP FAILED]</b>%0A<b>Server:</b> ${SERVER_NAME}%0A<b>Error:</b> Database container <code>${CONTAINER_NAME}</code> is not running!"
  echo "[ERROR] Container ${CONTAINER_NAME} is not running!"
  send_telegram_notification "${ERR_MSG}"
  exit 1
fi

# 3. Execute Compressed pg_dump
if ! docker exec -t "${CONTAINER_NAME}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists | gzip > "${DAILY_FILE}"; then
  ERR_MSG="❌ <b>[BACKUP FAILED]</b>%0A<b>Server:</b> ${SERVER_NAME}%0A<b>Database:</b> ${DB_NAME}%0A<b>Error:</b> pg_dump execution failed inside container!"
  echo "[ERROR] pg_dump failed!"
  send_telegram_notification "${ERR_MSG}"
  rm -f "${DAILY_FILE}"
  exit 1
fi

# Validate file size (> 100 bytes)
FILE_BYTES=$(wc -c < "${DAILY_FILE}" 2>/dev/null || echo 0)
if [ "${FILE_BYTES}" -lt 100 ]; then
  ERR_MSG="❌ <b>[BACKUP FAILED]</b>%0A<b>Server:</b> ${SERVER_NAME}%0A<b>Database:</b> ${DB_NAME}%0A<b>Error:</b> Backup file is empty or corrupted (${FILE_BYTES} bytes)!"
  echo "[ERROR] Backup file is empty!"
  send_telegram_notification "${ERR_MSG}"
  rm -f "${DAILY_FILE}"
  exit 1
fi

FILE_SIZE=$(du -h "${DAILY_FILE}" | cut -f1)
echo "[SUCCESS] Daily backup created: ${DAILY_FILE} (${FILE_SIZE})"

# 4. Weekly Rolling Copy (Taken on Sunday - Day 7)
WEEKLY_NOTIFY=""
if [ "${DAY_OF_WEEK}" -eq 7 ]; then
  cp "${DAILY_FILE}" "${WEEKLY_FILE}"
  WEEKLY_NOTIFY="%0A📅 <b>Weekly Snapshot Saved:</b> ${WEEKLY_FILE}"
  echo "[SUCCESS] Weekly backup created: ${WEEKLY_FILE}"
fi

# 5. Media Uploads Volume Backup
MEDIA_SIZE="N/A"
if docker volume inspect yathu_media_uploads >/dev/null 2>&1; then
  MEDIA_MOUNT=$(docker volume inspect yathu_media_uploads --format '{{.Mountpoint}}' 2>/dev/null || true)
  if [ -d "${MEDIA_MOUNT}" ] && [ "$(ls -A "${MEDIA_MOUNT}" 2>/dev/null)" ]; then
    tar -czf "${MEDIA_FILE}" -C "${MEDIA_MOUNT}" . 2>/dev/null || true
    MEDIA_SIZE=$(du -h "${MEDIA_FILE}" 2>/dev/null | cut -f1 || echo "0")
    echo "[SUCCESS] Media uploads backed up: ${MEDIA_FILE} (${MEDIA_SIZE})"
  fi
fi

# 6. Apply Rolling Retention Limits
# Retention: 7 daily copies
echo "Purging daily backups older than 7 days..."
find "${DAILY_DIR}" -name "db_${DB_NAME}_daily_*.sql.gz" -type f -mtime +7 -delete

# Retention: 4 weekly copies (28 days)
echo "Purging weekly backups older than 28 days..."
find "${WEEKLY_DIR}" -name "db_${DB_NAME}_weekly_*.sql.gz" -type f -mtime +28 -delete

# Media retention: 7 days
find "${MEDIA_DIR}" -name "media_uploads_*.tar.gz" -type f -mtime +7 -delete

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# 7. Dispatch Telegram Success Notification
SUCCESS_MSG="✅ <b>[BACKUP SUCCESSFUL] - ${SERVER_NAME}</b>%0A<b>Database:</b> <code>${DB_NAME}</code>%0A<b>Dump Size:</b> ${FILE_SIZE}%0A<b>Media Size:</b> ${MEDIA_SIZE}%0A<b>Duration:</b> ${DURATION}s%0A<b>Retention:</b> 7 Daily / 4 Weekly copies${WEEKLY_NOTIFY}"
send_telegram_notification "${SUCCESS_MSG}"

echo "[COMPLETED] Backup and rolling retention finished cleanly in ${DURATION}s at $(date)"
echo "=================================================="
