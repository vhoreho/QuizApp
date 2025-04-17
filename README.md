# Quiz App

This is a Quiz Application with a frontend built using React and a backend built with NestJS.

### Frontend

The frontend is built using:

- React with TypeScript
- Vite for bundling
- TailwindCSS for styling
- React Router for navigation
- React Query for data fetching
- React Hook Form for form management
- Zod for form validation
- Shadcn UI components

### Backend

The backend is built using:

- NestJS
- TypeORM with PostgreSQL
- Class-validator for DTO validation

### Form Implementation with React Hook Form

All forms in the application use React Hook Form with Zod validation:

1. **Form Schemas**: Defined in `lib/schemas.ts` using Zod for type-safe validation
2. **Form Components**: Using shadcn's form components that integrate with React Hook Form
3. **Form Validation**: Client-side validation with error messages before submission

Benefits of using React Hook Form:
- Reduced re-renders and improved performance
- Built-in validation with Zod integration
- Simplified form state management
- TypeScript support for type safety

### Docker Setup

The application uses Docker for containerization and can be run using Docker Compose:

```bash
docker-compose up
```

This will start three containers:
- Frontend (React)
- Backend (NestJS)
- Database (PostgreSQL)

### Development

To run the application in development mode:

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
npm install
npm run start:dev
```

## Project Structure

- `/backend` - NestJS application
- `/frontend` - React Vite application
- `docker-compose.yml` - Docker Compose configuration
- `.env` - Environment variables for the services

## Getting Started

### Prerequisites

- Docker and Docker Compose

### Starting the Application

1. Clone the repository
2. Run Docker Compose:

```bash
docker-compose up -d
```

This will start:
- NestJS backend on port 3000
- React frontend on port 5173
- PostgreSQL database on port 5432

## API Endpoints

### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get a specific user
- `POST /users` - Create a new user

### Quizzes
- `GET /quizzes` - Get all quizzes
- `GET /quizzes/:id` - Get a specific quiz
- `POST /quizzes` - Create a new quiz
- `POST /quizzes/:id/submit` - Submit answers for a quiz

### Questions
- `GET /questions` - Get all questions
- `GET /questions/:id` - Get a specific question
- `GET /questions/quiz/:quizId` - Get all questions for a specific quiz
- `POST /questions` - Create a new question

### Answers
- `POST /answers` - Create a new answer
- `GET /answers/user/:userId` - Get all answers by a specific user
- `GET /answers/question/:questionId` - Get all answers for a specific question

### Results
- `GET /results/user/:userId` - Get all results for a specific user
- `GET /results/quiz/:quizId` - Get all results for a specific quiz
- `GET /results/user/:userId/quiz/:quizId` - Get the result for a specific user and quiz 