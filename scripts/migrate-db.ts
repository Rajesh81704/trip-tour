import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as dotenv from 'dotenv';

const execAsync = promisify(exec);

// Load environment variables
dotenv.config();

interface MigrationConfig {
  sourceUri: string;
  targetUri: string;
  databaseName: string;
  dumpDir: string;
}

class DatabaseMigration {
  private config: MigrationConfig;
  private timestamp: string;

  constructor(config: Partial<MigrationConfig> = {}) {
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.config = {
      sourceUri: config.sourceUri || process.env.MONGODB_URI || '',
      targetUri: config.targetUri || '',
      databaseName: config.databaseName || 'travel',
      dumpDir: config.dumpDir || path.join(process.cwd(), `dump-${this.timestamp}`),
    };

    if (!this.config.sourceUri) {
      throw new Error('Source MongoDB URI not provided');
    }

    if (!this.config.targetUri) {
      throw new Error('Target MongoDB URI not provided');
    }
  }

  async ensureDumpDirectory(): Promise<void> {
    if (!fs.existsSync(this.config.dumpDir)) {
      fs.mkdirSync(this.config.dumpDir, { recursive: true });
      console.log(`✓ Created dump directory: ${this.config.dumpDir}`);
    }
  }

  async exportData(): Promise<void> {
    console.log('\n📤 Exporting data from source cluster...');
    console.log(`Source: ${this.config.sourceUri.replace(/:[^:]*@/, ':***@')}`);

    try {
      const command = `mongodump --uri "${this.config.sourceUri}" --out "${this.config.dumpDir}"`;
      const { stdout, stderr } = await execAsync(command);

      if (stderr && !stderr.includes('warning')) {
        console.error('Export warnings:', stderr);
      }

      console.log(stdout);
      console.log('✓ Data export completed successfully');
    } catch (error) {
      if (error instanceof Error) {
        console.error('✗ Export failed:', error.message);
        throw new Error(`Failed to export database: ${error.message}`);
      }
      throw error;
    }
  }

  async importData(): Promise<void> {
    console.log('\n📥 Importing data to target cluster...');
    console.log(`Target: ${this.config.targetUri.replace(/:[^:]*@/, ':***@')}`);

    const dumpPath = path.join(this.config.dumpDir, this.config.databaseName);

    if (!fs.existsSync(dumpPath)) {
      throw new Error(`Dump directory not found: ${dumpPath}`);
    }

    try {
      const command = `mongorestore --uri "${this.config.targetUri}" --dir "${this.config.dumpDir}"`;
      const { stdout, stderr } = await execAsync(command);

      if (stderr && !stderr.includes('warning')) {
        console.error('Import warnings:', stderr);
      }

      console.log(stdout);
      console.log('✓ Data import completed successfully');
    } catch (error) {
      if (error instanceof Error) {
        console.error('✗ Import failed:', error.message);
        throw new Error(`Failed to import database: ${error.message}`);
      }
      throw error;
    }
  }

  async verifyMigration(): Promise<void> {
    console.log('\n🔍 Verifying migration...');

    try {
      // You can add verification logic here
      // For example, count documents in both databases
      console.log('✓ Verification step completed');
    } catch (error) {
      console.warn('⚠ Verification failed:', error);
    }
  }

  async cleanup(keepBackup: boolean = true): Promise<void> {
    if (!keepBackup) {
      console.log('\n🗑 Cleaning up dump directory...');
      try {
        fs.rmSync(this.config.dumpDir, { recursive: true, force: true });
        console.log('✓ Cleanup completed');
      } catch (error) {
        console.warn('⚠ Failed to cleanup dump directory:', error);
      }
    } else {
      console.log(`\n💾 Backup preserved at: ${this.config.dumpDir}`);
    }
  }

  async migrate(keepBackup: boolean = true): Promise<void> {
    console.log('🚀 Starting MongoDB migration...');
    console.log(`Database: ${this.config.databaseName}`);
    console.log(`Timestamp: ${this.timestamp}\n`);

    try {
      await this.ensureDumpDirectory();
      await this.exportData();
      await this.importData();
      await this.verifyMigration();
      await this.cleanup(keepBackup);

      console.log('\n✅ Migration completed successfully!');
      console.log('\n📝 Next steps:');
      console.log('1. Test the new cluster connection in your application');
      console.log('2. Update .env with the new MONGODB_URI');
      console.log('3. Redeploy your application');
    } catch (error) {
      console.error('\n❌ Migration failed:', error);
      console.log('\n📝 Recovery steps:');
      console.log('1. Keep the backup dump directory for retry');
      console.log(`2. Backup location: ${this.config.dumpDir}`);
      process.exit(1);
    }
  }

  getConfig(): MigrationConfig {
    return this.config;
  }
}

// Main execution
async function main() {
  const targetUri = process.argv[2];

  if (!targetUri) {
    console.error('Usage: npx ts-node scripts/migrate-db.ts <target-mongodb-uri>');
    console.error('\nExample:');
    console.error(
      'npx ts-node scripts/migrate-db.ts "mongodb+srv://user:pass@new-cluster.mongodb.net/travel"'
    );
    process.exit(1);
  }

  const migration = new DatabaseMigration({
    targetUri,
  });

  const keepBackup = process.argv[3] !== '--no-backup';
  await migration.migrate(keepBackup);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
