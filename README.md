# MedConnect Backend

Digital Prescription & Patient Records System Backend API

## 🏥 Project Overview

MedConnect is a comprehensive digital prescription system that enables doctors to issue prescriptions with QR codes, allows pharmacists to verify and fulfill them, and maintains complete patient medical records. The system supports cross-hospital access and provides secure, role-based access control.

## 🚀 Features

- **Digital Prescriptions**: Create and manage prescriptions with unique QR codes
- **Patient Records**: Comprehensive medical history and profile management
- **QR Code Verification**: Secure pharmacy verification system
- **Role-Based Access**: Support for patients, doctors, pharmacists, and admins
- **Cross-Hospital Access**: Patient data accessible across different healthcare facilities
- **Audit Logging**: Complete tracking of all system activities
- **Email Integration**: Automated QR code delivery and notifications

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT + bcrypt
- **Logging**: Winston
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd medconnect-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

```bash
# Copy environment file
cp env.example .env

# Edit .env with your configuration
nano .env
```

### 4. Database Setup

```bash
# Create PostgreSQL database
createdb medconnect_db

# Run migrations (when available)
npm run db:migrate
```

### 5. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medconnect_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_DIALECT=postgres

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# QR Code Configuration
QR_EXPIRY_HOURS=72
QR_SECRET_KEY=your_qr_encryption_secret
```

## 📁 Project Structure

```
src/
├── config/          # Configuration files
│   ├── database.ts  # Database configuration
│   └── logger.ts    # Winston logger setup
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Sequelize models
├── routes/          # API routes
├── services/        # Business logic
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── validators/      # Input validation
└── server.ts        # Main application file
```

## 🗄 Database Schema

The system includes the following main entities:

- **Users**: Authentication and role management
- **Patients**: Patient profiles and medical records
- **Doctors**: Healthcare provider information
- **Pharmacists**: Pharmacy staff management
- **Prescriptions**: Digital prescription management
- **Medical History**: Patient visit records
- **Test Results**: Laboratory and diagnostic results
- **QR Codes**: Secure prescription verification
- **Audit Logs**: System activity tracking

## 🔐 Security Features

- **Password Hashing**: bcrypt with configurable rounds
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permission system
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API abuse prevention
- **Security Headers**: Helmet.js security middleware
- **CORS Protection**: Cross-origin request control

## 📊 API Endpoints

### Health Check

- `GET /health` - System health status

### API Base

- `GET /api/v1` - API information (setup in progress)

_More endpoints will be added as development progresses_

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 📝 Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## 🚀 Development Workflow

### 1. Setup Phase (Current)

- ✅ Project structure and dependencies
- ✅ TypeScript configuration
- ✅ Basic Express server
- ✅ Database configuration
- ✅ Logging setup
- ✅ Error handling middleware
- ✅ Type definitions

### 2. Next Steps

- [ ] Database models and migrations
- [ ] Authentication system
- [ ] User management
- [ ] Patient management
- [ ] Prescription system
- [ ] QR code generation
- [ ] Pharmacy integration

## 🔍 Health Check

Once the server is running, you can check the system status:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development",
  "uptime": 123.45,
  "memory": { ... }
}
```

## 📚 Documentation

- **API Documentation**: Will be generated with Swagger/OpenAPI
- **Database Schema**: ER diagram available in project docs
- **Development Plan**: 2-sprint development timeline documented

## 🤝 Contributing

1. Follow the established code style and TypeScript best practices
2. Write tests for new features
3. Update documentation as needed
4. Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For development questions or issues:

- Check the project documentation
- Review the development plan
- Contact the development team

---

**MedConnect Team** - Building the future of digital healthcare 🏥✨
