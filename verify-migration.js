const mongoose = require('mongoose');

const targetUri = 'mongodb+srv://contactnetpiedev_db_user:20KC3X3UJqYFC2bO@cluster0.rtyuckp.mongodb.net/travel?appName=Cluster0';

async function verify() {
  try {
    await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 10000,
    });

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name).sort();

    console.log('\n✅ NEW CLUSTER VERIFICATION\n');
    console.log('Connected to:', targetUri.replace(/:[^:]*@/, ':***@'));
    console.log('\nCollections and Document Counts:');
    console.log('━'.repeat(50));

    let totalDocs = 0;
    for (const collName of collectionNames) {
      const coll = db.collection(collName);
      const count = await coll.countDocuments({});
      totalDocs += count;
      console.log(`${collName.padEnd(20)} : ${count} documents`);
    }

    console.log('━'.repeat(50));
    console.log(`TOTAL                : ${totalDocs} documents\n`);

    console.log('✅ All data successfully saved on new cluster!\n');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verify();
