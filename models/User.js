import mongoose from 'mongoose';

// Connection function
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// User Schema
const UserSchema = new mongoose.Schema({
    yourName: {
        type: String,
        required: true,
    },
    yourAge: {
        type: Number,
        required: true,
    },
    crushName: {
        type: String,
        required: true,
    },
    calculatedPercentage: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

// Avoids recompiling model on every API call (Next.js requirement)
export default mongoose.models.User || mongoose.model('User', UserSchema);
export { dbConnect };