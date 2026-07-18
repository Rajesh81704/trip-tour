# MongoDB Cluster Migration

This directory contains scripts and guides for migrating your MongoDB database from the old cluster to a new one.

## Quick Start

### 1. Prerequisites
- Install MongoDB CLI tools: `brew install mongodb-community` (macOS) or `sudo apt-get install mongodb-org-tools` (Linux)
- Have your new MongoDB Atlas cluster connection string ready
- Ensure network connectivity to both clusters

### 2. Validate Connectivity (Recommended)
```bash
npm install
npx ts-node scripts/validate-migration.ts "mongodb+srv://user:pass@new-cluster.mongodb.net/travel"
```

This will:
- ✓ Test connection to current database
- ✓ Test connection to new database
- ✓ Show collection and document counts
- ✓ Confirm readiness for migration

### 3. Run Migration
```bash
npx ts-node scripts/migrate-db.ts "mongodb+srv://user:pass@new-cluster.mongodb.net/travel"
```

This will:
- 📤 Export all data from current cluster
- 📥 Import to new cluster
- 🔍 Verify migration
- 💾 Keep backup dump for safety

### 4. Update Configuration
```bash
# Edit .env and update:
MONGODB_URI=mongodb+srv://user:pass@new-cluster.mongodb.net/travel
```

### 5. Test & Deploy
```bash
npm run build
npm run dev  # Test locally first
npm run start  # Production deployment
```

## File Structure

```
scripts/
├── migrate-db.ts           # Main migration script
├── validate-migration.ts   # Pre-migration validation
└── migrate-steps.md        # Detailed step-by-step guide
```

## Current Database Info

**Source Cluster:**
- Host: subhodeep-c.7on4tkd.mongodb.net
- Database: travel
- Status: ✓ Active

**Target Cluster:**
- Host: `<your-new-cluster>`
- Database: travel
- Status: Awaiting URI

## Common Commands

```bash
# Validate before migration
npx ts-node scripts/validate-migration.ts "<target-uri>"

# Run full migration
npx ts-node scripts/migrate-db.ts "<target-uri>"

# Run without keeping backup
npx ts-node scripts/migrate-db.ts "<target-uri>" --no-backup

# Manual export (if script fails)
mongodump --uri "mongodb+srv://subhodeep:KIAgl4YjiV56EOqg@subhodeep-c.7on4tkd.mongodb.net/travel" --out ./backup

# Manual import
mongorestore --uri "<target-uri>" --dir ./backup
```

## Troubleshooting

### mongodump/mongorestore not found
```bash
# Install MongoDB tools
brew install mongodb-community  # macOS
sudo apt-get install mongodb-org-tools  # Ubuntu
```

### Connection timeout
- Check IP whitelist in MongoDB Atlas
- Verify connection string credentials
- Test: `mongosh "<connection-string>"`

### Permission denied
- Verify database user role in MongoDB Atlas
- Ensure user has readWrite permissions on target database

## Rollback

If something goes wrong:

1. Revert `.env` to old URI
2. Redeploy application
3. Investigate logs
4. Retry with backup dump in `dump-*` directory

## Need Help?

See detailed guide: `scripts/migrate-steps.md`

For MongoDB issues: https://docs.mongodb.com/
For Atlas issues: https://docs.atlas.mongodb.com/
