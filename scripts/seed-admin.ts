import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

interface IAdmin extends mongoose.Document {
  email: string;
  password: string;
  username: string;
  name: string;
}

const adminSchema = new mongoose.Schema<IAdmin>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  name: { type: String, required: true },
});

const AdminModel = mongoose.model<IAdmin>('Admin', adminSchema);

async function seedAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in .env');
    }

    console.log('\n🌱 Seeding Admin User...\n');
    console.log(`Connecting to: ${mongoUri.replace(/:[^:]*@/, ':***@')}`);

    await mongoose.connect(mongoUri);
    console.log('✓ Connected to database\n');

    // Check if admin already exists
    const existingAdmin = await AdminModel.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('⚠ Admin user already exists with username "admin"');
      console.log(`Email: ${existingAdmin.email}`);
      console.log('Skipping creation...\n');
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin@123', 12);

    // Create admin user
    const admin = new AdminModel({
      username: 'admin',
      email: 'admin@triptootravels.com',
      password: hashedPassword,
      name: 'TripToo Travels Administrator',
    });

    await admin.save();

    console.log('✅ Admin user created successfully!\n');
    console.log('━'.repeat(50));
    console.log('Admin Credentials:');
    console.log('━'.repeat(50));
    console.log(`Username: admin`);
    console.log(`Email: admin@triptootravels.com`);
    console.log(`Password: admin@123`);
    console.log('━'.repeat(50));
    console.log('\n✓ You can now login to the admin panel with these credentials.\n');

    await mongoose.disconnect();
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Error:', error.message);
    } else {
      console.error('❌ Error:', error);
    }
    process.exit(1);
  }
}

seedAdmin();
