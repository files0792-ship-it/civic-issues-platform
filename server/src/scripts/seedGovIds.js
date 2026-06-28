/**
 * Seed permanent Government Authentication IDs.
 * Run: npm run seed:govids (from server folder) with MONGODB_URI set.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { GovernmentAuthId } from '../models/GovernmentAuthId.js';

const GOVERNMENT_AUTH_IDS = [
  { governmentAuthId: 'AMC-2026-0001', department: 'Ahmedabad Municipal Corporation' },
  { governmentAuthId: 'AMC-2026-0002', department: 'Ahmedabad Municipal Corporation' },
  { governmentAuthId: 'AMC-2026-0003', department: 'Ahmedabad Municipal Corporation' },
  { governmentAuthId: 'RMC-2026-0001', department: 'Rajkot Municipal Corporation' },
  { governmentAuthId: 'RMC-2026-0002', department: 'Rajkot Municipal Corporation' },
  { governmentAuthId: 'SMC-2026-0001', department: 'Surat Municipal Corporation' },
  { governmentAuthId: 'SMC-2026-0002', department: 'Surat Municipal Corporation' },
  { governmentAuthId: 'GMC-2026-0001', department: 'Gandhinagar Municipal Corporation' },
  { governmentAuthId: 'GMC-2026-0002', department: 'Gandhinagar Municipal Corporation' },
  { governmentAuthId: 'PWD-GJ-0001', department: 'Public Works Department, Gujarat' },
  { governmentAuthId: 'PWD-GJ-0002', department: 'Public Works Department, Gujarat' },
  { governmentAuthId: 'NDMC-2026-0001', department: 'New Delhi Municipal Council' },
  { governmentAuthId: 'BMC-MH-0001', department: 'Brihanmumbai Municipal Corporation' },
  { governmentAuthId: 'PMC-MH-0001', department: 'Pune Municipal Corporation' },
  { governmentAuthId: 'GOV-IND-0001', department: 'Government of India' },
];

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Set MONGODB_URI in .env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected. Seeding Government Auth IDs...');

  let inserted = 0;
  let skipped = 0;

  for (const entry of GOVERNMENT_AUTH_IDS) {
    const result = await GovernmentAuthId.updateOne(
      { governmentAuthId: entry.governmentAuthId },
      { $setOnInsert: entry },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      inserted += 1;
      console.log(`  + ${entry.governmentAuthId} (${entry.department})`);
    } else {
      skipped += 1;
    }
  }

  console.log(`Done. Inserted ${inserted}, skipped ${skipped} (already existed).`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
