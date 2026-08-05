#!/usr/bin/env bash
# ==============================================================================
# Daily MongoDB Automated Backup Script for TripTour / Nature Vacation
# Runs every night at 2:00 AM via cron on VPS
# ==============================================================================

set -e

# Configuration
DB_NAME="triptour"
MONGO_URI="${MONGODB_URI:-mongodb://103.138.96.92:27017/triptour}"
BACKUP_DIR="/var/backups/triptour-mongodb"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
TEMP_DUMP_DIR="/tmp/mongodump-${TIMESTAMP}"
ARCHIVE_NAME="triptour-backup-${TIMESTAMP}.tar.gz"
ARCHIVE_PATH="${BACKUP_DIR}/${ARCHIVE_NAME}"
RETENTION_DAYS=14

echo "========================================================================"
echo "[$(date +"%Y-%m-%d %H:%M:%S")] Starting Daily MongoDB Backup..."
echo "Database: ${DB_NAME}"
echo "Backup Directory: ${BACKUP_DIR}"

# 1. Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"
mkdir -p "${TEMP_DUMP_DIR}"

# 2. Export database using mongodump
echo "Exporting database to temporary directory..."
mongodump --uri="${MONGO_URI}" --out="${TEMP_DUMP_DIR}" --quiet

# 3. Compress the dump directory
echo "Compressing backup archive: ${ARCHIVE_NAME}..."
tar -czf "${ARCHIVE_PATH}" -C "${TEMP_DUMP_DIR}" .

# 4. Cleanup temporary files
rm -rf "${TEMP_DUMP_DIR}"

# 5. Verify archive creation
if [ -f "${ARCHIVE_PATH}" ]; then
  ARCHIVE_SIZE=$(du -h "${ARCHIVE_PATH}" | cut -f1)
  echo "✓ Backup created successfully! Size: ${ARCHIVE_SIZE}"
  echo "Archive location: ${ARCHIVE_PATH}"
else
  echo "❌ Backup failed: Archive file was not created!"
  exit 1
fi

# 6. Delete backups older than RETENTION_DAYS (14 days)
echo "Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -type f -name "triptour-backup-*.tar.gz" -mtime +${RETENTION_DAYS} -delete

echo "Current backups stored in ${BACKUP_DIR}:"
ls -lh "${BACKUP_DIR}"

echo "[$(date +"%Y-%m-%d %H:%M:%S")] Backup process completed successfully!"
echo "========================================================================"
