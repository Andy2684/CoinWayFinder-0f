const { MongoClient, ServerApiVersion } = require('mongodb');

if (!process.env.MONGODB_URI) {
  throw new Error("❌ MONGODB_URI is not set in .env.local");
}

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let clientPromise;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = client.connect();
}

module.exports = clientPromise;
