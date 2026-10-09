import 'dotenv/config';
import mongoose from 'mongoose';
import Club from './models/Club.js';
import User from './models/User.js';
import Event from './models/Event.js';
import { CLUBS } from './config/constants.js';

const slug = (name) => name.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');

const daysFromNow = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

export const seedData = async () => {
  await Promise.all([Club.deleteMany(), User.deleteMany(), Event.deleteMany()]);

  const clubs = await Club.create(CLUBS.map((name) => ({ name, members: 22 })));
  const clubByName = Object.fromEntries(clubs.map((c) => [c.name, c]));

  await User.create({ name: 'College Admin', email: 'admin@college.edu', password: 'admin123', role: 'admin' });
  // one organizer account per club: media@college.edu, cultural@college.edu, ... (password: organizer123)
  const organizers = await User.create(
    clubs.map((c) => ({ name: `${c.name} Organizer`, email: `${slug(c.name)}@college.edu`, password: 'organizer123', role: 'organizer', club: c._id }))
  );
  const student = await User.create({ name: 'Aarav Sharma', email: 'student@college.edu', password: 'student123', role: 'student', department: 'CSE' });

  // Default poster artwork lives in frontend/public/posters (illustrations, no photos of people).
  // Last column = optional capacity (null = unlimited)
  const sample = [
    ['Technical Club', 'Hack-A-Thon 2026', '24-hour coding marathon. Build a solution to a real campus problem in teams of 3-4.', 3, '09:00', 'Main Auditorium', 'hackathon', 60],
    ['Cultural Club', 'Cultural Night', 'An evening of music, dance and drama performances by students of all departments.', 6, '18:00', 'Open Air Theatre', 'cultural-night', null],
    ['Innovation & Entrepreneurship Club', 'Startup Pitch Day', 'Pitch your startup idea to a panel of founders and investors.', 9, '11:00', 'Seminar Hall 2', 'startup-pitch', 40],
    ['Film Club', 'Short Film Screening', 'Screening of student-made short films followed by a discussion with the directors.', 12, '16:30', 'Mini Theatre', 'film-screening', 80],
    ['Women Empowerment Club', 'Leadership Workshop', 'A hands-on workshop on leadership and public speaking.', 15, '10:00', 'Conference Room A', 'leadership', 30],
    ['Financial & Literary Club', 'Stock Market Quiz', 'Test your knowledge of markets, finance and current affairs.', 18, '14:00', 'Library Hall', 'stock-market', null],
    ['Media Club', 'Photography Walk', 'Campus photography walk with tips from professional photographers.', 21, '07:30', 'Main Gate', 'photo-walk', 25],
  ];
  await Event.create(
    sample.map(([club, eventName, description, offset, time, venue, image, capacity], i) => ({
      eventName, description, time, venue,
      coverImage: `/posters/${image}.svg`,
      capacity,
      date: daysFromNow(offset),
      organizer: clubByName[club]._id,
      createdBy: organizers.find((o) => String(o.club) === String(clubByName[club]._id))._id,
      participants: i === 0 ? [student._id] : [],
    }))
  );
  console.log('Seeded: 7 clubs, 1 admin, 7 organizers, 1 student, 7 events');
};

// `npm run seed` -> seed the database from MONGO_URI
if (process.argv[1].endsWith('seed.js')) {
  await mongoose.connect(process.env.MONGO_URI);
  await seedData();
  await mongoose.disconnect();
}
