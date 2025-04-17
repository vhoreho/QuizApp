# Quiz App API Testing Guide

This guide explains how to use the provided Insomnia collection to test your Quiz App API endpoints.

## Getting Started

1. Install [Insomnia](https://insomnia.rest/download) if you haven't already
2. Import the `quiz-app-insomnia.json` file into Insomnia:
   - Open Insomnia
   - Click on "Create" > "Import from File"
   - Select the `quiz-app-insomnia.json` file
   - The "Quiz App API" workspace will be created with all endpoints

## Environment Setup

The collection comes with two environments:

- **Development**: Points to `http://localhost:3000` (default)
- **Production**: Points to `https://quiz-app-api.example.com` (modify as needed)

To switch environments:
1. Click on the environment dropdown in the top-left corner
2. Select either "Development" or "Production"

## Available Endpoints

### General Endpoints
- **Health Check**: `GET /` - Verify the API is running
- **Test Logs**: `GET /test-logs` - Test logging functionality

### Quizzes
- **Get All Quizzes**: `GET /quizzes` - List all quizzes
- **Get Quiz by ID**: `GET /quizzes/{id}` - Get a specific quiz
- **Create Quiz**: `POST /quizzes` - Create a new quiz
- **Submit Quiz**: `POST /quizzes/{id}/submit` - Submit answers for a quiz

### Users
- **Get All Users**: `GET /users` - List all users
- **Get User by ID**: `GET /users/{id}` - Get a specific user
- **Create User**: `POST /users` - Create a new user

### Questions
- **Get All Questions**: `GET /questions` - List all questions
- **Get Question by ID**: `GET /questions/{id}` - Get a specific question
- **Get Questions by Quiz ID**: `GET /questions/quiz/{id}` - Get all questions for a quiz
- **Create Question**: `POST /questions` - Create a new question

### Results
- **Get Results by User ID**: `GET /results/user/{id}` - Get all results for a user
- **Get Results by Quiz ID**: `GET /results/quiz/{id}` - Get all results for a quiz
- **Get Result by User and Quiz**: `GET /results/user/{userId}/quiz/{quizId}` - Get specific result

## Testing Workflow Examples

### Creating and Taking a Quiz

1. **Create a User**:
   - Use the "Create User" endpoint
   - Provide a name and email in the request body

2. **Create a Quiz**:
   - Use the "Create Quiz" endpoint
   - Provide a title and description in the request body

3. **Add Questions to the Quiz**:
   - Use the "Create Question" endpoint
   - Include the quiz ID, question text, options array, and correct answer

4. **Take the Quiz**:
   - Get questions using "Get Questions by Quiz ID"
   - Submit answers using "Submit Quiz" endpoint with question IDs and selected answers

5. **View Results**:
   - Check the result using "Get Result by User and Quiz"

### Reviewing Quiz Statistics

1. **View All Quiz Results**:
   - Use "Get Results by Quiz ID" to see all submissions for a quiz

2. **View User Performance**:
   - Use "Get Results by User ID" to see all quizzes taken by a user

## Request Body Examples

### Create User
```json
{
  "name": "Test User",
  "email": "test@example.com"
}
```

### Create Quiz
```json
{
  "title": "Sample Quiz",
  "description": "This is a sample quiz created for testing"
}
```

### Create Question
```json
{
  "quizId": 1,
  "questionText": "What is the capital of France?",
  "options": ["Paris", "London", "Berlin", "Madrid"],
  "correctAnswer": "Paris"
}
```

### Submit Quiz
```json
{
  "quizId": 1,
  "answers": [
    {
      "questionId": 1,
      "selectedAnswer": "Paris"
    },
    {
      "questionId": 2,
      "selectedAnswer": "Berlin"
    }
  ]
}
```

## Troubleshooting

- If you get connection errors, make sure your backend server is running
- Verify that the `baseUrl` in the environment settings matches your server configuration
- For 404 errors, check if the resource (user, quiz, etc.) exists in the database
- For validation errors, check the request body format against the required schema 