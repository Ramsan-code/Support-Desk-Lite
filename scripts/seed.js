import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../src/models/User.js';
import Ticket from '../src/models/Ticket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const users = [
    { username: 'admin_user', email: 'admin@example.com', password: 'password123', role: 'admin' },
    { username: 'agent_smith', email: 'agent@example.com', password: 'password123', role: 'agent' },
    { username: 'customer_john', email: 'john@example.com', password: 'password123', role: 'customer' },
    { username: 'customer_jane', email: 'jane@example.com', password: 'password123', role: 'customer' },
];

const tickets = [
    { title: 'abc', description: 'loream .', priority: 'High', status: 'open' },
    { title: 'Printer paper jam', description: 'loreamqwert.', priority: 'Low', status: 'open' },
    { title: 'VPN Connection drops', description: 'loreammaeral.', priority: 'Medium', status: 'in_progress' },
    { title: 'New laptop request', description: 'loreamnjiyue', priority: 'Medium', status: 'resolved' },
];

const seedData = async () => {
    let client;
    try {
        if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not defined');

        console.log('Connecting to MongoDB...');
        client = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 15000,
        });

        console.log('Connection successful. Clearing data...');

        // Use the actual models
        await User.deleteMany({});
        await Ticket.deleteMany({});

        console.log('Seeding users...');
        const createdUsers = await User.insertMany(users);

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

        await Ticket.insertMany(ticketsWithLinks);

        console.log('Seeding complete!');
    } catch (error) {
        console.error('Seeding error:', error);
    } finally {
        if (client) await mongoose.disconnect();
        process.exit();
    }
};

seedData();
