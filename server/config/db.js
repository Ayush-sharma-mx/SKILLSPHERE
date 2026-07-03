const mongoose = require('mongoose');
const dns = require('dns').promises;

/**
 * Manually resolve SRV records and build a direct connection URI.
 * This bypasses ISP/router DNS blockers that refuse SRV queries.
 */
const resolveSrvToDirectUri = async (uri) => {
  try {
    const url = new URL(uri);
    const hostname = url.hostname; // e.g. cluster0.sjwjo5c.mongodb.net

    // Force DNS to use Google's resolver (8.8.8.8) for SRV lookup
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

    const srvRecords = await dns.resolveSrv(`_mongodb._tcp.${hostname}`);
    if (!srvRecords || srvRecords.length === 0) return uri;

    const hosts = srvRecords.map((r) => `${r.name}:${r.port}`).join(',');
    const user = url.username;
    const pass = url.password;
    const dbName = url.pathname.replace('/', '') || 'skillsphere';

    // Extract replicaSet name from TXT record
    let replicaSet = '';
    try {
      const txtRecords = await dns.resolveTxt(hostname);
      const authTxt = txtRecords.flat().find((t) => t.includes('replicaSet'));
      if (authTxt) {
        const match = authTxt.match(/replicaSet=([^&]+)/);
        if (match) replicaSet = match[1];
      }
    } catch (_) {}

    const directUri = `mongodb://${user}:${pass}@${hosts}/${dbName}?ssl=true&authSource=admin&retryWrites=true&w=majority${replicaSet ? `&replicaSet=${replicaSet}` : ''}`;
    console.log('🔗 Resolved SRV → direct connection URI');
    return directUri;
  } catch (err) {
    console.warn('⚠️  SRV resolution failed, using original URI:', err.message);
    return uri;
  }
};

const connectDB = async () => {
  let uri = process.env.MONGO_URI;

  if (!uri) {
    console.warn('⚠️  MONGO_URI not set in .env');
    return;
  }

  // If using SRV format, resolve it manually to bypass ISP DNS blocks
  if (uri.startsWith('mongodb+srv://')) {
    uri = await resolveSrvToDirectUri(uri);
  }

  let retries = 5;

  while (retries > 0) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 30000,
        tls: uri.includes('ssl=true') || uri.startsWith('mongodb+srv'),
      });

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      console.log(`📦 Database: ${conn.connection.name}`);

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
      });
      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected');
      });
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err.message);
      });

      return;
    } catch (error) {
      retries -= 1;
      console.error(`❌ MongoDB connection failed. Retries left: ${retries}`);
      console.error(`   Error: ${error.message}`);

      if (retries === 0) {
        console.error('❌ Could not connect to MongoDB after multiple attempts.');
        console.error('   ➡  Check MONGO_URI in server/.env');
        console.error('   ➡  Ensure your IP is whitelisted in MongoDB Atlas Network Access');
        console.error('   ➡  Get a free cluster at: https://www.mongodb.com/cloud/atlas\n');
        return;
      }

      // Wait 3 seconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
};

module.exports = connectDB;
