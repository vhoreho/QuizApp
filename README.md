# Quiz App

A comprehensive quiz application with a modern React frontend and NestJS backend.

## Project Overview

This project is a full-featured quiz application that allows users to create, manage, and take quizzes. The system supports user authentication, quiz creation, quiz taking, and result tracking.

## Project Structure

The project follows a microservice architecture with separate frontend and backend applications.

### Frontend

- Built with **React 18** and **TypeScript**
- Uses **Vite** as the build tool
- Styled with **Tailwind CSS** and **Radix UI** components
- State management with **React Query** for server state
- Form handling with **React Hook Form** and **Zod** for validation
- Routing with **React Router DOM**
- Charting with **Recharts**

### Backend

- Built with **NestJS** framework and **TypeScript**
- Uses **PostgreSQL** database with **TypeORM** for ORM
- Authentication with **JWT** and **Passport.js**
- Validation with **class-validator** and **class-transformer**
- Logging with **Pino**

## Features

- User authentication and authorization
- Quiz creation and management
- Questions and answers management
- Quiz taking functionality
- Result tracking and statistics
- User performance analytics

## Modules

### Backend Modules
- User Management
- Quiz Management
- Question Management
- Result Tracking
- Authentication
- Administration
- Student Interface
- Teacher Interface

### Frontend Pages
- Dashboard
- Quiz Creation and Editing
- Quiz Taking Interface
- Results and Analytics
- User Management
- Authentication Pages

## API Endpoints

The project includes comprehensive API endpoints for all functionality:

- **General Endpoints**: Health check and logging
- **Quizzes**: CRUD operations for quizzes
- **Users**: User management endpoints
- **Questions**: Question management for quizzes
- **Results**: Quiz result tracking and analytics

## Deployment

The application is containerized using Docker and can be deployed using Docker Compose. The setup includes:

- Frontend container with Nginx
- Backend container with Node.js
- PostgreSQL database container

## Development Setup

1. Clone the repository
2. Set up environment variables
3. Run the database:
   ```
   docker-compose up -d db
   ```
4. Start the backend:
   ```
   cd backend
   npm install
   npm run start:dev
   ```
5. Start the frontend:
   ```
   cd frontend
   npm install
   npm run dev
   ```

## Testing

The project includes Insomnia configuration files for API testing.

## License

UNLICENSED - Private project 