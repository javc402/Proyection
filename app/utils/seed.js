require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { Logger } = require('../utils/logger');

// 🌱 SEED DATABASE WITH TEST USER
const seedDatabase = async () => {
  try {
    Logger.startupBanner();
    Logger.database('SEED', 'Starting database seeding process...');
    
    // 🔗 Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    Logger.database('CONNECTED', 'Connected to MongoDB for seeding');
    
    // 🧹 Clean existing test users
    await User.deleteMany({ email: { $in: ['admin@proyection.com', 'test@proyection.com'] } });
    Logger.database('CLEANED', 'Removed existing test users');
    
    // 👨‍💼 Create admin user
    const adminUser = new User({
      email: 'admin@proyection.com',
      password: 'admin123456',
      firstName: 'Admin',
      lastName: 'Proyection',
      phone: '+1234567890',
      country: 'Colombia',
      city: 'Bogotá',
      preferredCurrency: 'COP',
      isActive: true,
      isEmailVerified: true
    });
    
    await adminUser.save();
    Logger.auth('USER_CREATED', '👨‍💼 Admin user created successfully');
    
    // 👤 Create test user
    const testUser = new User({
      email: 'test@proyection.com',
      password: 'test123456',
      firstName: 'Usuario',
      lastName: 'Prueba',
      phone: '+0987654321',
      dateOfBirth: new Date('1990-01-01'),
      country: 'España',
      city: 'Madrid',
      preferredCurrency: 'EUR',
      isActive: true,
      isEmailVerified: true
    });
    
    await testUser.save();
    Logger.auth('USER_CREATED', '👤 Test user created successfully');
    
    // 📊 Summary
    const userCount = await User.countDocuments();
    Logger.database('SEED_COMPLETE', `Database seeded successfully! Total users: ${userCount}`);
    
    console.log('\n🎉 SEED COMPLETED SUCCESSFULLY!');
    console.log('📋 Test credentials:');
    console.log('   👨‍💼 Admin: admin@proyection.com / admin123456');
    console.log('   👤 User:  test@proyection.com / test123456');
    console.log('');
    
    process.exit(0);
    
  } catch (error) {
    Logger.database('SEED_ERROR', 'Error seeding database', error);
    console.error('💥 Seed failed:', error.message);
    process.exit(1);
  }
};

// 🚀 Run seed if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
