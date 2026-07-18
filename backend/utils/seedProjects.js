/**
 * Optional: seeds a few sample projects so the homepage isn't empty
 * on first run. Run with: node utils/seedProjects.js
 */
require('dotenv').config();
const connectDB = require('../config/db');
const Project = require('../models/Project');

const sampleProjects = [
  {
    title: 'SkillSwap Platform',
    description: 'MERN stack collaborative learning platform with real-time chat.',
    overview: 'A platform where users trade skills with each other, featuring real-time messaging built with Socket.io and a matching algorithm for finding skill partners.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
    techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'Socket.io'],
    category: 'Full Stack',
    githubLink: 'https://github.com/',
    liveLink: '',
    features: ['Real-time chat', 'Skill matching algorithm', 'JWT authentication', 'Rating system'],
    featured: true,
  },
  {
    title: 'Cafe Verse',
    description: 'Modern and elegant tea & coffee shop landing page.',
    overview: 'A fully responsive landing page for a boutique cafe, built with performance and conversion in mind.',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
    techStack: ['HTML5', 'Tailwind CSS', 'GSAP'],
    category: 'Frontend',
    githubLink: 'https://github.com/',
    liveLink: '',
    features: ['Menu showcase', 'Reservation form', 'Scroll animations'],
    featured: false,
  },
  {
    title: 'Velocita Moto Analytics',
    description: 'Analytics dashboard for tracking social media growth.',
    overview: 'A data visualization dashboard that pulls social metrics and displays them with interactive Chart.js graphs.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    techStack: ['React', 'Chart.js', 'Node.js', 'MongoDB'],
    category: 'Full Stack',
    githubLink: 'https://github.com/',
    liveLink: '',
    features: ['Real-time metrics', 'Custom date ranges', 'Export to CSV'],
    featured: true,
  },
];

const run = async () => {
  await connectDB();
  await Project.deleteMany({});
  await Project.insertMany(sampleProjects);
  console.log(`Seeded ${sampleProjects.length} sample projects.`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
