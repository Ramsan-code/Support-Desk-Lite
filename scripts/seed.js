import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../src/models/User.js';
import Ticket from '../src/models/Ticket.js';
import Comment from '../src/models/comment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const users = [
    { name: 'Admin User', username: 'admin_user', email: 'admin@example.com', password: 'password123', role: 'admin' },
    { name: 'Agent Smith', username: 'agent_smith', email: 'agent@example.com', password: 'password123', role: 'agent' },
    { name: 'John Doe', username: 'customer_john', email: 'john@example.com', password: 'password123', role: 'customer' },
    { name: 'Jane Doe', username: 'customer_jane', email: 'jane@example.com', password: 'password123', role: 'customer' },
];

const tickets = [
    { title: 'Website is down', description: 'The corporate website is returning 500 errors since this morning.', priority: 'High', status: 'open' },
    { title: 'Printer paper jam', description: 'The printer on the 3rd floor is jammed again. Needs immediate attention.', priority: 'Low', status: 'open' },
    { title: 'VPN Connection drops', description: 'My VPN connection drops every 5 minutes when working from home.', priority: 'Medium', status: 'in-progress' },
    { title: 'New laptop request', description: 'I need a new laptop for development as my current one is quite old.', priority: 'Medium', status: 'resolved' },
];

const seedData = async () => {
    let client;
    try {
        if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not defined');

        console.log('Connecting to MongoDB...');
        client = await mongoose.connect(process.env.MONGO_URI);

        console.log('Connection successful. Clearing data...');

        await User.deleteMany({});
        await Ticket.deleteMany({});
        await Comment.deleteMany({});

        console.log('Seeding users...');
        const createdUsers = await User.create(users);

        const john = createdUsers.find(u => u.username === 'customer_john');
        const jane = createdUsers.find(u => u.username === 'customer_jane');
        const agent = createdUsers.find(u => u.role === 'agent');
        const admin = createdUsers.find(u => u.role === 'admin');

        console.log('Seeding tickets...');
        const ticketsWithLinks = tickets.map((t, i) => {
            if (i === 0) return { ...t, createdBy: john._id, assignedTo: agent._id };
            if (i === 1) return { ...t, createdBy: jane._id };
            if (i === 2) return { ...t, createdBy: john._id, assignedTo: admin._id };
            return { ...t, createdBy: jane._id, assignedTo: agent._id };
        });

        const createdTickets = await Ticket.insertMany(ticketsWithLinks);

        console.log('Seeding comments...');
        const comments = [
            { body: 'I will look into this immediately.', type: 'public', ticketId: createdTickets[0]._id, createdBy: agent._id },
            { body: 'Checking logs now. Internal note: Server memory is low.', type: 'internal', ticketId: createdTickets[0]._id, createdBy: agent._id },
            { body: 'Restarted the server, please check now.', type: 'public', ticketId: createdTickets[0]._id, createdBy: agent._id },
            { body: 'Thanks, it is working now!', type: 'public', ticketId: createdTickets[0]._id, createdBy: john._id },
        ];

        await Comment.insertMany(comments);

        console.log('Seeding complete!');
    } catch (error) {
        console.error('Seeding error:', error);
    } finally {
        if (client) await mongoose.disconnect();
        process.exit();
    }
};

seedData();

