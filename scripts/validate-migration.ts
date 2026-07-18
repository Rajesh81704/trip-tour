import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

interface ValidationResult {
  uri: string;
  connected: boolean;
  databases?: string[];
  collections?: string[];
  documentCounts?: Record<string, number>;
  error?: string;
}

class MigrationValidator {
  async validateConnection(uri: string, label: string): Promise<ValidationResult> {
    console.log(`\n🔗 Testing ${label}...`);
    console.log(`   URI: ${uri.replace(/:[^:]*@/, ':***@')}`);

    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });

      const connection = mongoose.connection;
      const db = connection.db;

      // Get database info
      const collections = await db?.listCollections().toArray();
      const collectionNames = collections?.map((c) => c.name) || [];

      // Count documents in each collection
      const documentCounts: Record<string, number> = {};
      for (const collName of collectionNames) {
        const coll = db?.collection(collName);
        const count = await coll?.countDocuments({});
        if (count !== undefined) {
          documentCounts[collName] = count;
        }
      }

      await mongoose.disconnect();

      return {
        uri,
        connected: true,
        collections: collectionNames,
        documentCounts,
      };
    } catch (error) {
      return {
        uri,
        connected: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  printResults(result: ValidationResult): void {
    if (result.connected) {
      console.log(`   ✓ Connected successfully`);
      console.log(`   Collections: ${result.collections?.length || 0}`);

      if (result.collections && result.collections.length > 0) {
        console.log('   Collection summary:');
        result.collections.forEach((coll) => {
          const count = result.documentCounts?.[coll] || 0;
          console.log(`     - ${coll}: ${count} documents`);
        });
      }

      const totalDocs = Object.values(result.documentCounts || {}).reduce(
        (sum, count) => sum + count,
        0
      );
      console.log(`   Total documents: ${totalDocs}`);
    } else {
      console.log(`   ✗ Connection failed: ${result.error}`);
    }
  }

  async validate(sourceUri: string, targetUri: string): Promise<boolean> {
    console.log('🚀 MongoDB Migration Validation\n');

    const sourceResult = await this.validateConnection(sourceUri, 'Source Cluster');
    this.printResults(sourceResult);

    const targetResult = await this.validateConnection(targetUri, 'Target Cluster');
    this.printResults(targetResult);

    console.log('\n📊 Validation Summary:');
    console.log(`Source: ${sourceResult.connected ? '✓ OK' : '✗ FAILED'}`);
    console.log(`Target: ${targetResult.connected ? '✓ OK' : '✗ FAILED'}`);

    if (sourceResult.connected && targetResult.connected) {
      console.log('\n✅ Both clusters are accessible. Ready for migration!');
      if (sourceResult.documentCounts && targetResult.documentCounts) {
        const sourceTotal = Object.values(sourceResult.documentCounts).reduce(
          (sum, count) => sum + count,
          0
        );
        const targetTotal = Object.values(targetResult.documentCounts || {}).reduce(
          (sum, count) => sum + count,
          0
        );
        console.log(`\nNote: Source has ${sourceTotal} documents, Target has ${targetTotal} documents`);
        if (targetTotal > 0) {
          console.log('⚠  Target cluster already has data. It will be overwritten during migration.');
        }
      }
      return true;
    } else {
      console.log('\n❌ Validation failed. Please check connectivity before proceeding.');
      return false;
    }
  }
}

async function main() {
  const sourceUri = process.env.MONGODB_URI || '';
  const targetUri = process.argv[2];

  if (!sourceUri) {
    console.error('Error: MONGODB_URI not found in .env file');
    process.exit(1);
  }

  if (!targetUri) {
    console.error('Usage: npx ts-node scripts/validate-migration.ts <target-mongodb-uri>');
    process.exit(1);
  }

  const validator = new MigrationValidator();
  const isValid = await validator.validate(sourceUri, targetUri);

  process.exit(isValid ? 0 : 1);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
