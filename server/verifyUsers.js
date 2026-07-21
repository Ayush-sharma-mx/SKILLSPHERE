require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const verifyMyAccounts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Update all users to be verified so you aren't locked out of old accounts
    const result = await User.updateMany({}, { $set: { isEmailVerified: true } });
    
    console.log(`Successfully verified ${result.modifiedCount} accounts!`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

verifyMyAccounts();
