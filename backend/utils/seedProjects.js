/**
 * Seeds Masud Rana Nayeem's real projects so the site isn't empty on first run.
 * Run with: node utils/seedProjects.js
 * NOTE: githubLink currently points to the main GitHub profile for each project
 * since individual repo URLs weren't provided — update per-project links anytime
 * from the admin dashboard once the repos are live.
 */
require('dotenv').config();
const connectDB = require('../config/db');
const Project = require('../models/Project');

const GITHUB_PROFILE = 'https://github.com/masudrananayeem';

const sampleProjects = [
  {
    title: 'Portfolio Website',
    description: 'Personal portfolio website built with React and Tailwind CSS showcasing projects and skills.',
    overview: 'This portfolio itself — a React and Tailwind-based site presenting projects, skills, and background.',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800',
    techStack: ['React', 'Tailwind CSS'],
    category: 'Frontend',
    githubLink: GITHUB_PROFILE,
    liveLink: '',
    features: ['Responsive layout', 'Project showcase', 'Skills section'],
    featured: true,
  },
  {
    title: 'SkillSwap Platform',
    description: 'MERN stack collaborative learning platform with real-time chat.',
    overview: 'A platform where users trade skills with each other, featuring real-time messaging built with Socket.io.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
    techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'Socket.io'],
    category: 'Full Stack',
    githubLink: GITHUB_PROFILE,
    liveLink: '',
    features: ['Real-time chat', 'Skill matching', 'MERN stack'],
    featured: true,
  },
  {
    title: 'Cafe Verse',
    description: 'Modern and elegant tea & coffee shop landing page with responsive design.',
    overview: 'A fully responsive landing page for a boutique cafe, built with HTML, CSS, and Tailwind.',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
    techStack: ['HTML5', 'CSS3', 'Tailwind CSS'],
    category: 'Frontend',
    githubLink: GITHUB_PROFILE,
    liveLink: '',
    features: ['Menu showcase', 'Responsive design'],
    featured: false,
  },
  {
    title: 'Velocita Moto',
    description: 'Analytics dashboard for tracking social media growth and engagement using Chart.js.',
    overview: 'A data visualization dashboard displaying metrics with interactive Chart.js graphs.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    techStack: ['React', 'Chart.js'],
    category: 'Full Stack',
    githubLink: GITHUB_PROFILE,
    liveLink: '',
    features: ['Interactive charts', 'Engagement metrics'],
    featured: true,
  },
];

const run = async () => {
  await connectDB();
  await Project.deleteMany({});
  await Project.insertMany(sampleProjects);
  console.log(`Seeded ${sampleProjects.length} projects.`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
