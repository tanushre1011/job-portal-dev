// scripts/seedJobs.js
require('dotenv').config();
const mongoose = require('mongoose');
const Job = require('./models/Job'); // adjust path if models folder is elsewhere

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jobportal';
const jobs = [
  { title: 'Spring Boot Developer', company: 'Infosys', location: 'Bangalore', skills: ['spring','java','rest'] },
  { title: 'Machine Learning Engineer', company: 'TCS', location: 'Hyderabad', skills: ['machine learning','python','tensorflow'] },
  { title: 'Communication Trainer', company: 'HCL', location: 'Chennai', skills: ['communication'] },
  { title: 'Frontend Developer (React)', company: 'Acme', location: 'Remote', skills: ['react','javascript','html','css'] }
];

(async () => {
  await mongoose.connect(uri);
  await Job.deleteMany({});
  await Job.insertMany(jobs);
  console.log('Seeded jobs');
  process.exit(0);
})();
