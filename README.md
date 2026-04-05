🚀 ODNCEST - HyperLocal Freelance Marketplace
https://img.shields.io/badge/version-1.0.0-blue
https://img.shields.io/badge/license-MIT-green
https://img.shields.io/badge/node-v18+-green
https://img.shields.io/badge/Next.js-16-black
https://img.shields.io/badge/PostgreSQL-15-blue

📋 Table of Contents
Overview

Features

Tech Stack

Architecture

Prerequisites

Installation

Environment Variables

Database Setup

Running the Application

API Documentation

Testing

Deployment

Project Structure

Screenshots

Future Enhancements

Contributing

License

Contact

📖 Overview
ODnest (On-Demand Nest) is a full-stack freelance marketplace platform that connects clients with skilled freelancers in their local area or globally. The platform addresses key challenges in the freelance ecosystem including high commissions, lack of hyperlocal discovery, payment insecurity, and poor communication tools.

🎯 Problem Statement
Small businesses and startups struggle to find affordable, verified local talent quickly, while freelancers lack a credible platform to showcase their work and receive timely payments. Existing platforms charge high commissions (10-20%) and do not support hyperlocal discovery or milestone-based escrow payments.

✨ Solution
ODnest provides:

🔐 Secure authentication with JWT

📝 Project posting and bidding system

💬 Real-time chat using WebSockets

💰 Escrow-based milestone payments

🧠 AI-powered smart matching

⭐ Review and rating system

📍 Hyperlocal talent discovery

🚀 Features
For Clients
Feature	Description
Post Projects	Create detailed project posts with budget, skills, and deadline
Browse Freelancers	Search and filter freelancers by skills, rating, location
Smart Matching	Receive AI-powered freelancer recommendations
Manage Bids	Review, accept, or reject freelancer bids
Escrow Payments	Make milestone-based secure payments
Real-time Chat	Communicate directly with hired freelancers
Review System	Rate and review freelancers after project completion
For Freelancers
Feature	Description
Browse Projects	Search projects with advanced filters
Submit Bids	Place competitive bids with proposals
Receive Invitations	Get direct project invitations from clients
Real-time Chat	Communicate with clients instantly
Milestone Tracking	Track payment milestones
Earnings Dashboard	View earnings and transaction history
Portfolio Management	Showcase skills and completed work
General Features
🔐 JWT-based authentication

👤 Role-based access control (Client/Freelancer/Admin)

📱 Responsive dark-themed UI

🔔 Real-time notifications

📊 Dashboard analytics

⭐ Rating and review system

🛠 Tech Stack
Frontend
Technology	Version	Purpose
Next.js	16.2.2	React framework with SSR
React	19	UI library
Tailwind CSS	3.x	Styling
Socket.io Client	4.x	Real-time communication
Axios	1.x	HTTP client
Lucide React	Latest	Icons
Backend
Technology	Version	Purpose
Node.js	18+	Runtime environment
Express.js	4.18	Web framework
PostgreSQL	15+	Database
Socket.io	4.x	WebSocket server
JWT	9.x	Authentication
bcrypt	5.x	Password hashing
DevOps & Tools
Tool	Purpose
Docker	Containerization
Git	Version control
Postman	API testing
pgAdmin	Database management
🏗 Architecture
text
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                         │
│                   (Next.js 16 - React)                      │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP/WebSocket
┌─────────────────────────▼───────────────────────────────────┐
│                     Express.js Server                       │
│                    (Node.js Backend)                        │
└─────────┬───────────────────────────┬───────────────────────┘
          │                           │
┌─────────▼──────────┐      ┌─────────▼──────────┐
│   PostgreSQL DB    │      │    Socket.io       │
│   (Primary Store)  │      │   (Real-time)      │
└────────────────────┘      └────────────────────┘
📋 Prerequisites
Before you begin, ensure you have the following installed:

Node.js (v18 or higher)

PostgreSQL (v14 or higher)

Git

npm or yarn

🔧 Installation
1. Clone the Repository
bash
git clone https://github.com/Mandhapalligeethanjali/odnest.git
cd odnesta
2. Backend Setup
bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your database credentials
# Run database initialization
node init.db.js

# Start backend server
npm run dev
3. Frontend Setup
bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Start frontend development server
npm run dev
4. Access the Application
Frontend: http://localhost:3000

Backend API: http://localhost:5000

API Health Check: http://localhost:5000/

🔐 Environment Variables
Backend (.env)
env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=odnest

# JWT Configuration
JWT_SECRET=your_super_secret_key_here

# Client URL
CLIENT_URL=http://localhost:3000

# Razorpay Configuration (Optional)
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
Frontend (.env.local)
env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
🗄 Database Setup
Create Database
sql
CREATE DATABASE odnesta;
Run Migrations
The database schema will be automatically created when you run:

bash
cd backend
node init.db.js
Database Schema
Table	Description
users	User accounts (client/freelancer/admin)
projects	Project listings
bids	Freelancer bids on projects
messages	Chat messages
payments	Payment transactions
reviews	Ratings and reviews
invitations	Freelancer invitations
milestones	Project payment milestones
🏃 Running the Application
Development Mode
bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
Production Mode
bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
npm start
Using Docker
bash
# Build and run all services
docker-compose up --build

# Stop all services
docker-compose down
📡 API Documentation
Authentication Endpoints
Method	Endpoint	Description
POST	/api/auth/register	User registration
POST	/api/auth/login	User login
GET	/api/auth/me	Get current user
Project Endpoints
Method	Endpoint	Description
GET	/api/projects	Browse projects
POST	/api/projects	Create project
GET	/api/projects/my	Get user's projects
GET	/api/projects/:id	Get project details
Bid Endpoints
Method	Endpoint	Description
POST	/api/bids	Place a bid
GET	/api/bids/my/bids	Get user's bids
PUT	/api/bids/:id/accept	Accept a bid
Message Endpoints
Method	Endpoint	Description
GET	/api/messages/conversations	Get conversations
GET	/api/messages/project/:id	Get project messages
POST	/api/messages/send	Send message
Payment Endpoints
Method	Endpoint	Description
GET	/api/payments/client	Client payments
GET	/api/payments/freelancer	Freelancer earnings
PUT	/api/payments/:id/release	Release escrow
🧪 Testing
Test Accounts
Role	Email	Password
Client	client@test.com	123456
Freelancer	freelancer@test.com	123456
Admin	admin@test.com	123456
Run Tests
bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
API Testing with Postman
Import the Postman collection from /postman directory:

Open Postman

Click Import → Upload Files

Select ODnest.postman_collection.json

Start testing endpoints

🚢 Deployment
Deploy to Vercel (Frontend)
bash
cd frontend
npm install -g vercel
vercel --prod
Deploy to AWS (Backend)
bash
# Build Docker image
docker build -t odnesta-backend .

# Run container
docker run -p 5000:5000 -d odnesta-backend
Deploy to Railway/Render (Alternative)
Connect your GitHub repository

Set environment variables

Deploy automatically

📁 Project Structure
text
odnest/
├── backend/
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── bidRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── reviewRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   ├── utils/
│   │   ├── matchingEngine.js
│   │   └── emailService.js
│   ├── db.js
│   ├── server.js
│   ├── init.db.js
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── client/
│   │   │   ├── freelancer/
│   │   │   ├── messages/
│   │   │   └── settings/
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.js
│   ├── components/
│   │   ├── Chat.js
│   │   ├── Sidebar.js
│   │   └── PaymentModal.js
│   ├── context/
│   │   ├── AuthContext.js
│   │   └── SocketContext.js
│   ├── utils/
│   │   └── api.js
│   ├── public/
│   └── package.json
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
└── README.md
📸 Screenshots
Login Page
https://screenshots/login.png

Freelancer Dashboard
https://screenshots/freelancer-dashboard.png

Client Dashboard
https://screenshots/client-dashboard.png

Chat Interface
https://screenshots/chat.png

Browse Projects
https://screenshots/browse-projects.png

🔮 Future Enhancements
Feature	Status	Expected
Payment Gateway (Razorpay)	🚧 In Progress	Q2 2026
Mobile App (React Native)	📋 Planned	Q3 2026
Video Collaboration	📋 Planned	Q4 2026
AI Fraud Detection	📋 Planned	Q1 2027
Blockchain Smart Contracts	🔬 Research	Q2 2027
🤝 Contributing
Contributions are welcome! Please follow these steps:

Fork the repository

Create a feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

Coding Standards
Use ESLint for JavaScript linting

Follow Prettier formatting rules

Write meaningful commit messages

Add comments for complex logic

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

📞 Contact
Project Maintainer: Mandhapalli Geethanjali

GitHub: @Mandhapalligeethanjali

Email: [your-email@example.com]

Project Repository: https://github.com/Mandhapalligeethanjali/odnest

🙏 Acknowledgments
Next.js team for the amazing framework

Socket.io for real-time capabilities

PostgreSQL for reliable database

All open-source contributors

