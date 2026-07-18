# MongoDB Database Migration Guide

## Prerequisites

1. **MongoDB CLI tools installed**
   ```bash
   # On macOS with Homebrew
   brew install mongodb-community
   
   # On Ubuntu/Debian
   sudo apt-get install mongodb-org-tools
   
   # On Windows (using Chocolatey)
   choco install mongodb
   ```

2. **New MongoDB Atlas cluster created** with:
   - Connection string ready
   - Database user created with appropriate permissions
   - IP whitelist configured (if using Atlas)

## Migration Steps

### Step 1: Prepare New Cluster

1. Go to MongoDB Atlas (https://cloud.mongodb.com)
2. Create a new cluster or use existing one
3. Create a database user with read/write permissions
4. Get the connection string in the format:
   ```
   mongodb+srv://username:password@cluster-name.mongodb.net/travel
   ```
5. Add your IP address to the IP whitelist

### Step 2: Backup Current Database (Optional but Recommended)

```bash
# Create a backup of current database
mongodump --uri "mongodb+srv://subhodeep:KIAgl4YjiV56EOqg@subhodeep-c.7on4tkd.mongodb.net/travel" \
  --out ./backup-$(date +%Y%m%d-%H%M%S)
```

### Step 3: Run the Migration Script

```bash
# Install dependencies if not already done
npm install

# Run migration (replace with your new cluster URI)
npx ts-node scripts/migrate-db.ts "mongodb+srv://username:password@new-cluster.mongodb.net/travel"
```

### Step 4: Verify Migration

Check if all collections and documents were migrated:

```bash
# Connect to new cluster and count collections
mongosh "mongodb+srv://username:password@new-cluster.mongodb.net/travel"

# In mongosh shell:
show collections
db.packages.countDocuments()
db.reviews.countDocuments()
db.users.countDocuments()
# etc for all collections
```

### Step 5: Update Environment Variables

1. Update `.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@new-cluster.mongodb.net/travel
   ```

2. Or in your deployment environment (Heroku, Railway, etc.)

### Step 6: Test in Staging (If Available)

- Deploy to staging first
- Run your test suite
- Verify all database operations work

### Step 7: Deploy to Production

```bash
npm run build
npm run start
```

### Step 8: Monitor

Monitor application logs for any database errors after deployment.

## Rollback Plan (If Issues Occur)

If something goes wrong:

1. **Immediate Rollback:**
   ```bash
   # Revert .env to old MONGODB_URI
   MONGODB_URI=mongodb+srv://subhodeep:KIAgl4YjiV56EOqg@subhodeep-c.7on4tkd.mongodb.net/travel
   ```

2. **Redeploy:**
   ```bash
   npm run build
   npm run start
   ```

3. **Retry Migration:**
   - Check backup dump in `dump-*` directory
   - Review migration script logs
   - Fix issues and run again

## Troubleshooting

### mongodump/mongorestore not found
- Install MongoDB CLI tools (see Prerequisites)
- Ensure it's in your PATH

### Connection refused
- Verify new cluster IP whitelist
- Check connection string credentials
- Test connection: `mongosh <connection-string>`

### Permission denied
- Verify database user has read/write permissions
- Check user role assignments in MongoDB Atlas

### Migration incomplete
- Check disk space for dump files
- Run mongorestore with existing dump directory
- Monitor network stability

## Advanced Options

### Manual Export/Import

```bash
# Export only specific collections
mongodump --uri "mongodb+srv://..." --db travel --collection packages

# Import with drop option (WARNING: deletes existing data)
mongorestore --uri "mongodb+srv://..." --dir dump --drop

# Import with verbose output
mongorestore --uri "mongodb+srv://..." --dir dump --verbose
```

### Zero-Downtime Migration (Advanced)

For production systems that can't afford downtime:

1. Set up replication between old and new cluster
2. Sync data continuously
3. Switch connection string when ready
4. Verify new cluster
5. Shut down old cluster after confirmation

Consult MongoDB Atlas documentation for continuous sync options.

## Support & Escalation

If migration fails:
1. Keep the backup dump directory
2. Note the error messages
3. Review logs in application and MongoDB Atlas
4. Consider contacting MongoDB support for complex issues
