import mongoose from 'mongoose';
import { MONGO_URI } from '#config/env.config.js';

const dropIndex = async () => {
    try {
        console.log('Connecting to MongoDB...');
        // Ensure MONGO_URI is loaded
        if (!MONGO_URI) {
            throw new Error('MONGO_URI is not defined. Check your .env file.');
        }

        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB.');

        // Access the raw collection
        const collection = mongoose.connection.collection('workorders');

        console.log('Attempting to drop index "jobNumber_1"...');
        try {
            await collection.dropIndex('jobNumber_1');
            console.log('✅ Index "jobNumber_1" dropped successfully.');
        } catch (err) {
            if (err.code === 27) {
                console.log('⚠️ Index "jobNumber_1" not found (it might have already been dropped).');
            } else {
                console.error('❌ Failed to drop index:', err.message);
            }
        }

        await mongoose.disconnect();
        console.log('Disconnected.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Fatal Error:', error);
        process.exit(1);
    }
};

dropIndex();
