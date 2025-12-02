const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'PORT'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('\n❌ ERROR: Missing required environment variables:');
  missingEnvVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\n💡 Please create a .env file in the backend directory.');
  console.error('   You can copy .env.example and fill in the values.\n');
  process.exit(1);
}

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// connect database (catch errors so server startup isn't killed by unhandled rejections)
connectDB().catch(err => {
	console.error('Database connection failed during startup. Continuing without DB for now.');
});

// routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/user', require('./src/routes/userRoutes'));

app.get('/', (req, res) => res.send('CloudBase Voting Backend')); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n✅ Server started on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base: http://localhost:${PORT}`);
  console.log(`🌐 CORS Origin: ${corsOptions.origin}\n`);
});
