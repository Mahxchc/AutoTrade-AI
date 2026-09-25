// ..M database.js

import mongoose from "mongoose";

// =========================================================
// ..M DATABASE CONFIG
// =========================================================

const MONGO_URI = process.env.MONGO_URI;

// =========================================================
// ..M CONNECT DATABASE
// =========================================================

async function connectDatabase() {
  try {
    if (!MONGO_URI) {
      console.error(
        "❌ MONGO_URI is not configured."
      );

      return false;
    }

    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(
      "✅ MongoDB connected successfully."
    );

    return true;
  } catch (error) {
    console.error(
      "❌ MongoDB connection failed:",
      error.message
    );

    return false;
  }
}

// =========================================================
// ..M DATABASE STATUS
// =========================================================

function getDatabaseStatus() {
  return {
    connected:
      mongoose.connection.readyState === 1,
    state:
      mongoose.connection.readyState,
  };
}

// =========================================================
// ..M EXPORTS
// =========================================================

export {
  connectDatabase,
  getDatabaseStatus,
};

export default connectDatabase;