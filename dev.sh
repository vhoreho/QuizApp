#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print with color
print() {
    echo -e "${2}${1}${NC}"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to open URL in browser (cross-platform)
open_url() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open "$1"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command_exists xdg-open; then
            xdg-open "$1"
        else
            print "Cannot open browser automatically. Please open $1 manually." "$RED"
        fi
    else
        print "Cannot open browser automatically. Please open $1 manually." "$RED"
    fi
}

# Check required tools
if ! command_exists docker; then
    print "Docker is not installed. Please install Docker first." "$RED"
    exit 1
fi

if ! command_exists node; then
    print "Node.js is not installed. Please install Node.js first." "$RED"
    exit 1
fi

if ! command_exists concurrently; then
    print "Installing concurrently..." "$BLUE"
    npm install -g concurrently
fi

# Function to wait for database to be ready
wait_for_db() {
    print "Waiting for database to be ready..." "$BLUE"
    while ! docker exec quiz-app-db-dev pg_isready -U quizuser -d quizdb > /dev/null 2>&1; do
        sleep 1
    done
    print "Database is ready!" "$GREEN"
}

# Start database
print "Starting database containers..." "$BLUE"
docker-compose -f docker-compose.dev.yml up -d

# Wait for database to be ready
wait_for_db

# Install dependencies if needed
print "Checking dependencies..." "$BLUE"
cd backend && [ ! -d "node_modules" ] && npm install
cd ../frontend && [ ! -d "node_modules" ] && npm install
cd ..

# Print access information
print "\n=== Development Environment Ready ===" "$GREEN"
print "Frontend: http://localhost:5173" "$GREEN"
print "Backend: http://localhost:3000" "$GREEN"
print "Database: localhost:5433" "$GREEN"
print "PgAdmin: http://localhost:5050" "$GREEN"
print "  Email: admin@admin.com" "$GREEN"
print "  Password: admin" "$GREEN"
print "==================================\n" "$GREEN"

# Function to cleanup on exit
cleanup() {
    print "\nShutting down development environment..." "$BLUE"
    docker-compose -f docker-compose.dev.yml down
    print "Development environment stopped." "$GREEN"
    exit 0
}

# Set up cleanup on script termination
trap cleanup SIGINT SIGTERM

# Wait for services to be ready and open browser
(
    # Wait for frontend to be ready
    while ! curl -s http://localhost:5173 >/dev/null; do
        sleep 1
    done
    print "\nOpening frontend in browser..." "$BLUE"
    open_url "http://localhost:5173"

    # Wait a bit and open pgAdmin
    sleep 2
    print "Opening pgAdmin in browser..." "$BLUE"
    open_url "http://localhost:5050"
) &

# Start services with concurrently
concurrently \
    --names "BACKEND,FRONTEND" \
    --prefix-colors "cyan.bold,magenta.bold" \
    --kill-others \
    --kill-others-on-fail \
    --prefix "[{name}]" \
    --timestamp-format "HH:mm:ss" \
    "cd backend && npm run start:dev" \
    "cd frontend && npm run dev" 