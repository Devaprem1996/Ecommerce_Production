#!/bin/bash
# =================================================================
# HOSTINGER VPS INITIAL SERVER SETUP & HARDENING SCRIPT
# Target OS: Ubuntu 22.04 / 24.04 LTS (Hostinger KVM VPS)
# =================================================================
# Usage:
#   chmod +x setup-vps.sh
#   sudo ./setup-vps.sh
# =================================================================

set -e

# Color helpers
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}   YATHU E-COMMERCE - HOSTINGER VPS AUTOMATION SETUP  ${NC}"
echo -e "${BLUE}====================================================${NC}"

# 1. Check Root Privileges
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERROR] Please run this script as root or with sudo.${NC}"
  exit 1
fi

echo -e "${GREEN}[1/7] Updating system packages...${NC}"
apt-get update -y
apt-get upgrade -y
apt-get install -y \
  ca-certificates \
  curl \
  gnupg \
  lsb-release \
  git \
  ufw \
  fail2ban \
  htop \
  unzip \
  wget

# 2. Configure SWAP (2GB) for Memory Safety & Stability
echo -e "${GREEN}[2/7] Checking Swap memory configuration...${NC}"
SWAP_EXISTS=$(free | awk '/^Swap:/ {exit !$2}')
if [ "$SWAP_EXISTS" ]; then
    echo -e "${YELLOW}Swap is already configured. Skipping swap creation.${NC}"
else
    echo -e "${YELLOW}Creating 2GB swapfile for memory overflow protection...${NC}"
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    sysctl vm.swappiness=10
    echo 'vm.swappiness=10' >> /etc/sysctl.conf
    echo -e "${GREEN}2GB Swap created and active!${NC}"
fi

# 3. Install Docker Engine & Docker Compose Plugin (Official Docker Repo)
echo -e "${GREEN}[3/7] Installing official Docker Engine & Docker Compose...${NC}"
if command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker is already installed ($(docker --version)). Skipping.${NC}"
else
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
      tee /etc/apt/sources.list.d/docker.list > /dev/null

    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    systemctl enable docker
    systemctl start docker
    echo -e "${GREEN}Docker Engine installed successfully!${NC}"
fi

# 4. Configure UFW Firewall
echo -e "${GREEN}[4/7] Setting up UFW Firewall...${NC}"
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP Web Traffic'
ufw allow 443/tcp comment 'HTTPS Encrypted Web Traffic'
ufw allow 3001/tcp comment 'Uptime Kuma Monitoring Dashboard'
ufw --force enable
echo -e "${GREEN}UFW Firewall active. Ports 22, 80, 443, 3001 open.${NC}"

# 5. Configure Fail2Ban (SSH Brute Force Protection)
echo -e "${GREEN}[5/7] Hardening SSH with Fail2ban...${NC}"
systemctl enable fail2ban
systemctl restart fail2ban
echo -e "${GREEN}Fail2ban active.${NC}"

# 6. Prepare Backup & Media Directories
echo -e "${GREEN}[6/7] Creating backup and persistence directories...${NC}"
mkdir -p /var/backups/postgres
chmod 700 /var/backups/postgres

# 7. Setup Automated Daily Database Backup Cron Job
echo -e "${GREEN}[7/7] Checking database backup cron job...${NC}"
CRON_JOB="0 2 * * * /bin/bash -c 'if [ -f /root/ecommerce-production/deploy/scripts/backup-db.sh ]; then /root/ecommerce-production/deploy/scripts/backup-db.sh >> /var/log/db_backup.log 2>&1; fi'"
(crontab -l 2>/dev/null | grep -F "backup-db.sh") || (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
echo -e "${GREEN}Daily 2:00 AM database backup cron registered.${NC}"

echo -e "\n${GREEN}====================================================${NC}"
echo -e "${GREEN}   HOSTINGER VPS HARDENING COMPLETE! 🎉           ${NC}"
echo -e "${GREEN}====================================================${NC}"
echo -e "Next steps on this VPS:"
echo -e " 1. Clone repository:   ${YELLOW}git clone <repo_url> /root/ecommerce-production${NC}"
echo -e " 2. Configure .env:     ${YELLOW}cd /root/ecommerce-production/deploy && cp .env.example .env && nano .env${NC}"
echo -e " 3. Launch Docker stack: ${YELLOW}docker compose up -d --build${NC}"
echo -e " 4. Open Uptime Kuma:   ${YELLOW}http://<YOUR_VPS_IP>:3001${NC}"
echo -e " 5. Open Web App:       ${YELLOW}http://<YOUR_VPS_IP>${NC}"
echo -e "${GREEN}====================================================${NC}\n"
