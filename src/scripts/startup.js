const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting Prescripto application...');

// Check if we're in production
if (process.env.NODE_ENV === 'production') {
  console.log('📊 Running database migrations...');
  try {
    // Run database migrations
    execSync('npx sequelize-cli db:migrate', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..', '..')
    });
    console.log('✅ Database migrations completed successfully');
  } catch (error) {
    console.error('❌ Database migration failed:', error.message);
    console.log('⚠️  Continuing startup without migrations...');
  }
}

// Start the main application
console.log('🎯 Starting server...');
require('../server');
