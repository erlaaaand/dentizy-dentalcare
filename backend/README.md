# 🦷 Dentizy Backend API

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
</p>

<p align="center">
  A robust and scalable backend API built with <strong>NestJS</strong> for the Dentizy dental management platform.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
</p>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Testing](#-testing)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Security](#-security)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Developer](#-developer)
- [License](#-license)

---

## 🎯 About

**Dentizy Backend** is a comprehensive RESTful API built with NestJS framework, designed to power dental clinic management systems. The application provides secure authentication, efficient data management, and scalable architecture following best practices and industry standards.

---

## ✨ Features

- **🔐 JWT Authentication** - Secure token-based authentication system
- **👥 User Management** - Complete user CRUD operations with role-based access
- **📧 Email Service** - Automated email notifications using Nodemailer
- **💾 Database Integration** - TypeORM with MySQL for robust data persistence
- **🛡️ Security Features**:
  - Helmet for securing HTTP headers
  - CSRF protection
  - Rate limiting with Throttler
  - Password hashing with Bcrypt
- **📊 API Documentation** - Interactive Swagger/OpenAPI documentation
- **⚡ Caching** - Redis-ready cache implementation
- **🔔 Event System** - Event-driven architecture support
- **⏰ Task Scheduling** - Cron jobs for automated tasks
- **✅ Validation** - Request validation with class-validator
- **🧪 Testing** - Unit and E2E testing with Jest

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **NestJS** | Progressive Node.js framework |
| **TypeScript** | Type-safe JavaScript |
| **TypeORM** | Object-Relational Mapping |
| **MySQL** | Relational database |
| **Passport JWT** | Authentication strategy |
| **Swagger** | API documentation |
| **Jest** | Testing framework |
| **Nodemailer** | Email service |
| **Helmet** | Security middleware |

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.x or higher) - [Download](https://nodejs.org/)
- **npm** (v9.x or higher) - Comes with Node.js
- **MySQL** (v8.x or higher) - [Download](https://dev.mysql.com/downloads/)
- **Git** - [Download](https://git-scm.com/)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

Create a MySQL database:

```sql
CREATE DATABASE dentizy_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## ⚙️ Configuration

### Environment Variables

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Edit `.env` file with your configuration:

```env
# Node Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=dentizy_db

# JWT Configuration
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=24h

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL
FRONTEND_URL=http://localhost:3001
```

### 🔑 Generating JWT Secret

Generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 📧 Gmail Configuration

For Gmail, you need to generate an **App Password**:

1. Enable 2-Factor Authentication on your Google Account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate a new app password
4. Use this password in `EMAIL_PASS`

---

## 🎬 Running the Application

### Development Mode

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

### Production Mode

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Debug Mode

```bash
npm run start:debug
```

---

## 🧪 Testing

### Run Unit Tests

```bash
npm run test
```

### Run E2E Tests

```bash
npm run test:e2e
```

### Test Coverage

```bash
npm run test:cov
```

### Watch Mode

```bash
npm run test:watch
```

---

## 📚 API Documentation

Once the application is running, access the interactive API documentation:

**Swagger UI:** `http://localhost:3000/api`

The Swagger documentation provides:
- All available endpoints
- Request/Response schemas
- Interactive API testing
- Authentication requirements

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── auth/              # Authentication module
│   ├── users/             # User management module
│   ├── common/            # Shared utilities and decorators
│   ├── config/            # Configuration files
│   ├── database/          # Database configuration
│   ├── mail/              # Email service
│   └── main.ts            # Application entry point
├── test/
│   └── jest-e2e.json      # E2E test configuration
├── dist/                  # Compiled output
├── node_modules/          # Dependencies
├── .env                   # Environment variables
├── .env.example           # Example environment file
├── nest-cli.json          # NestJS CLI configuration
├── package.json           # Project dependencies
├── tsconfig.json          # TypeScript configuration
└── README.md              # Documentation
```

---

## 🔒 Security

This application implements multiple security layers:

### 🛡️ Security Features

- **Helmet** - Sets secure HTTP headers
- **CSRF Protection** - Prevents Cross-Site Request Forgery
- **Rate Limiting** - Prevents brute force attacks
- **Password Hashing** - Bcrypt with salt rounds
- **JWT Tokens** - Secure stateless authentication
- **Input Validation** - Request data sanitization
- **CORS** - Configurable Cross-Origin Resource Sharing

### 🔐 Best Practices

1. **Never commit `.env` file** - Keep secrets safe
2. **Use strong JWT secrets** - Generate cryptographically secure keys
3. **Enable HTTPS in production** - Encrypt data in transit
4. **Regular dependency updates** - Keep packages up to date
5. **SQL Injection Prevention** - TypeORM parameterized queries

---

## 🚢 Deployment

### Using NestJS Mau (AWS)

```bash
npm install -g @nestjs/mau
mau deploy
```

### Manual Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Set environment variables** for production

3. **Run database migrations** (if applicable)

4. **Start the application:**
   ```bash
   npm run start:prod
   ```

### Environment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Use strong JWT secret
- [ ] Enable HTTPS
- [ ] Configure email service
- [ ] Set up monitoring
- [ ] Configure logging

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- Follow TypeScript best practices
- Write unit tests for new features
- Update documentation as needed
- Use ESLint and Prettier for code formatting

```bash
# Format code
npm run format

# Lint code
npm run lint
```

---

## 👨‍💻 Developer

<p align="center">
  <img src="https://img.shields.io/badge/Developer-Erland%20Agsya%20Agustian-blue?style=for-the-badge" alt="Developer" />
</p>

**Erland Agsya Agustian**

- 📧 Email: [erlandagsya458@gmail.com](mailto:erlandagsya458@gmail.com)
- 📱 Instagram: [@erlaaaand_](https://instagram.com/erlaaaand_)
- 💼 LinkedIn: [Connect with me](https://linkedin.com/in/erland-agsya-agustian)

### 💌 Get in Touch

Feel free to reach out for:
- Bug reports
- Feature requests
- Collaboration opportunities
- General inquiries

---

## 📄 License

This project is licensed under the **UNLICENSED** License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - The progressive Node.js framework
- [TypeORM](https://typeorm.io/) - Amazing ORM for TypeScript
- [Passport](http://www.passportjs.org/) - Authentication middleware
- All the amazing open-source contributors

---

## 📞 Support

If you encounter any issues or have questions:

1. Check the [API Documentation](http://localhost:3000/api)
2. Review this README
3. Open an [Issue](https://github.com/your-repo/issues)
4. Contact the [Developer](#-developer)

---

<p align="center">
  Develop <strong>Erland Agsya Agustian</strong>
</p>

<p align="center">
  <strong>⭐ Star this repository if you find it helpful!</strong>
</p>