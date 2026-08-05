#!/usr/bin/env bash
# ==============================================================================
# MongoDB Database Restore Script for TripTour / Nature Vacation
# Restores a compressed .tar.gz backup archive into MongoDB
# Usage: ./scripts/restore-db.sh /var/backups/triptour-mongodb/triptour-backup-YYYY-MM-DD_HH-MM-SS.tar.gz
# ==============================================================================

set -e

BACKUP_FILE="$1"
MONGO_URI="${MONGODB_URI:-mongodb://103.138.96.92:27017/triptour}"

if [ -z "${BACKUP_FILE}" ]; then
  echo "Usage: $0 <path-to-backup-tar-gz>"
  echo "Example: $0 /var/backups/triptour-mongodb/triptour-backup-2026-08-05_20-40-00.tar.gz"
  exit 1
fi

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "❌ Backup file not found: ${BACKUP_FILE}"
  exit 1
fi

TEMP_EXTRACT_DIR="/tmp/mongorestore-$(date +"%s")"
mkdir -p "${TEMP_EXTRACT_DIR}"

echo "========================================================================"
echo "🚀 Starting Database Restore..."
echo "Backup File: ${BACKUP_FILE}"
echo "Target MongoDB: ${MONGO_URI}"
echo "------------------------------------------------------------------------"

# 1. Extract backup archive
echo "Extracting backup archive..."
tar -xzf "${BACKUP_FILE}" -C "${TEMP_EXTRACT_DIR}"

# 2. Run mongorestore
echo "Restoring database to MongoDB..."
mongorestore --uri="${MONGO_URI}" --dir="${TEMP_EXTRACT_DIR}" --drop

# 3. Clean up extract dir
rm -rf "${TEMP_EXTRACT_DIR}"

echo "------------------------------------------------------------------------"
echo "✅ Database restored successfully from ${BACKUP_FILE}!"
echo "========================================================================"
