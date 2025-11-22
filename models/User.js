import mongoose from 'mongoose';

// Connection caching for Next.js API Routes to prevent connection leaks
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    console.log('Using cached database connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disables mongoose buffering
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
    };
    
    // Check if MONGO_URI is available
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable not defined.');
    }

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
        console.log('New database connection established');
        return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    // If connection fails, reset the promise to allow retrying
    cached.promise = null;
    throw e;
  }
}

// MongoDB Schema
const UserSchema = new mongoose.Schema({
    yourName: {
        type: String,
        required: true,
        trim: true,
    },
    yourAge: {
        type: Number,
        required: true,
    },
    crushName: {
        type: String,
        required: true,
        trim: true,
    },
    calculatedPercentage: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
}, { collection: 'loveCalculations' }); // Collection name specifying

// Exports the model, checking if it already exists (Next.js requirement)
export default mongoose.models.User || mongoose.model('User', UserSchema);
export { dbConnect };