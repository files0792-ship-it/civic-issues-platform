/**
 * Seed sample users and issues for hackathon demos.
 * Run: npm run seed (from server folder) with MONGODB_URI set.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Issue } from '../models/Issue.js';
import { predictPriorityStub } from '../utils/priorityStub.js';

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Set MONGODB_URI in .env');
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log('Connected. Seeding...');

  await Issue.deleteMany({});
  await User.deleteMany({});

  await User.create({
    name: 'Admin Demo',
    email: 'admin@civic.local',
    password: 'admin123',
    role: 'admin',
  });
  const user = await User.create({
    name: 'Jane Citizen',
    email: 'user@civic.local',
    password: 'user123',
    role: 'user',
  });

  const samples = [
    {
      title: 'Large pothole on Main Road',
      description:
        'Deep pothole near the bus stop causing traffic hazard. Urgent repair needed before monsoon.',
      location: 'Delhi',
      status: 'Pending',
    },
    {
      title: 'Broken streetlight — residential lane',
      description: 'Light out for two weeks; dark corner at night, safety concern.',
      location: 'Mumbai',
      status: 'In Progress',
    },
    {
      title: 'Illegal dumping near park',
      description: 'Construction debris blocking footpath access.',
      location: 'Bangalore',
      status: 'Resolved',
    },
    {
      title: 'Graffiti on community wall',
      description: 'Tags on north wall; needs paint or removal.',
      location: 'Chennai',
      status: 'Pending',
    },
  ];

  for (const s of samples) {
    const predictedPriority = predictPriorityStub(s.title, s.description);
    await Issue.create({
      title: s.title,
      description: s.description,
      image: null,
      location: s.location,
      status: s.status,
      upvotes: s.title.includes('pothole') ? [user._id] : [],
      createdBy: user._id,
      predictedPriority,
    });
  }

  console.log('Done.');
  console.log('Admin: admin@civic.local / admin123');
  console.log('User:  user@civic.local / user123');
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
