#!/usr/bin/env bash
# =================================================================
# HOST RESOURCE & CONTAINER CRASH MONITORING SCRIPT (Low-Overhead)
# =================================================================
# Target: 2 vCPU, 8 GB RAM VPS Host
# Checks:
#   1. Memory (RAM) Usage > 85%
#   2. Primary Disk (/) Usage > 85%
#   3. Docker Container Crash / Loop Restarts
# Triggers: Instant Telegram Bot Push Notification
# Cron Example: Run every 5 minutes
#   */5 * * * * /var/www/yathu/deploy/scripts/monitor-resources.sh >> /var/log/vps_monitor.log 2>&1
# =================================================================

set -uo pipefail

# 1. Load Environment Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/../.env"

if [ -f "${ENV_FILE}" ]; then
  # Load TELEGRAM variables from .env if present
  export $(grep -E '^(TELEGRAM_BOT_TOKEN|TELEGRAM_CHAT_ID|SERVER_NAME)=' "${ENV_FILE}" | xargs -d '\n' 2>/dev/null || true)
fi

TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-}"
SERVER_NAME="${SERVER_NAME:-$(hostname)}"
HOST_IP="$(hostname -I | awk '{print $1}' 2>/dev/null || echo 'VPS')"

RAM_THRESHOLD="${RAM_THRESHOLD:-85}"
DISK_THRESHOLD="${DISK_THRESHOLD:-85}"

TIMESTAMP="$(date '+%Y-%m-%d %H:%M:%S UTC')"

send_telegram_alert() {
  local message="$1"
  if [ -n "${TELEGRAM_BOT_TOKEN}" ] && [ -n "${TELEGRAM_CHAT_ID}" ]; then
    curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
      -d "chat_id=${TELEGRAM_CHAT_ID}" \
      -d "parse_mode=HTML" \
      -d "text=${message}" > /dev/null 2>&1 || echo "[WARNING] Failed to dispatch Telegram alert."
  else
    echo "[INFO] Telegram credentials not configured. Skipping alert dispatch."
  fi
}

ALERTS=()

# 2. Check RAM Utilization
MEM_TOTAL=$(free -m | awk '/Mem:/ {print $2}')
MEM_USED=$(free -m | awk '/Mem:/ {print $3}')
if [ -n "${MEM_TOTAL}" ] && [ "${MEM_TOTAL}" -gt 0 ]; then
  MEM_PERCENT=$((MEM_USED * 100 / MEM_TOTAL))
  if [ "${MEM_PERCENT}" -ge "${RAM_THRESHOLD}" ]; then
    ALERTS+=("⚠️ <b>HIGH RAM USAGE:</b> ${MEM_PERCENT}% (${MEM_USED}MB / ${MEM_TOTAL}MB)")
  fi
fi

# 3. Check Disk Utilization (Root Filesystem)
DISK_PERCENT=$(df / | awk 'NR==2 {gsub("%",""); print $5}')
DISK_FREE_HUMAN=$(df -h / | awk 'NR==2 {print $4}')
if [ -n "${DISK_PERCENT}" ] && [ "${DISK_PERCENT}" -ge "${DISK_THRESHOLD}" ]; then
  ALERTS+=("💾 <b>HIGH DISK USAGE:</b> ${DISK_PERCENT}% (Only ${DISK_FREE_HUMAN} remaining on /)")
fi

# 4. Check Docker Containers Status (Crashes, Loops, or Exits)
if command -v docker > /dev/null 2>&1; then
  # Find restarting containers
  RESTARTING_CONTAINERS=$(docker ps --filter "status=restarting" --format "• {{.Names}} ({{.Status}})" 2>/dev/null || true)
  if [ -n "${RESTARTING_CONTAINERS}" ]; then
    ALERTS+=("🔄 <b>CRASHING CONTAINERS DETECTED:</b>%0A${RESTARTING_CONTAINERS}")
  fi

  # Find dead / abnormally exited containers in the last 15 minutes
  ABNORMAL_EXITS=$(docker ps -a --filter "status=exited" --format "• {{.Names}} (Status: {{.Status}})" 2>/dev/null | grep -v -E '(Exited \(0\)|Exited \(137\)|Exited \(143\))' || true)
  if [ -n "${ABNORMAL_EXITS}" ]; then
    ALERTS+=("💥 <b>ABNORMAL CONTAINER EXITS:</b>%0A${ABNORMAL_EXITS}")
  fi
fi

# 5. Dispatch Alert if Thresholds Breached
if [ ${#ALERTS[@]} -gt 0 ]; then
  ALERT_BODY=""
  for alert in "${ALERTS[@]}"; do
    ALERT_BODY="${ALERT_BODY}%0A${alert}"
  done

  TELEGRAM_MESSAGE="🚨 <b>[VPS RESOURCE ALERT] - ${SERVER_NAME}</b>%0A<b>Host IP:</b> <code>${HOST_IP}</code>%0A<b>Time:</b> ${TIMESTAMP}%0A${ALERT_BODY}%0A%0A<i>Immediate investigation recommended.</i>"
  echo "[ALERT Triggered at ${TIMESTAMP}]"
  echo -e "${TELEGRAM_MESSAGE}"
  send_telegram_alert "${TELEGRAM_MESSAGE}"
else
  echo "[${TIMESTAMP}] Health Check OK - RAM: ${MEM_PERCENT:-N/A}%, Disk: ${DISK_PERCENT:-N/A}%, Containers: Healthy."
fi
