import { checkForMatches, calculateMatchScore } from './src/services/matching.service.js';
import { connectDB } from './src/db/index.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await connectDB();
  try {
    console.log('Running check...');
    await checkForMatches(10, 'lost');
    console.log('Finished check.');
  } catch (error) {
    console.log('Error caught:', error);
  } finally {
    process.exit(0);
  }
}

run();
