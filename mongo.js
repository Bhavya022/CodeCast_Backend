const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://bhavya:bhavya@cluster0.kin5ecd.mongodb.net/codecast?retryWrites=true&w=majority';

const connectMongo = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'codecast',
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectMongo; 