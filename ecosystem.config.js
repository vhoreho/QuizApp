module.exports = {
  apps: [
    {
      name: "quiz-backend",
      cwd: "./backend",
      script: "npm",
      args: "run start:dev",
      env: {
        NODE_ENV: "development",
        DB_HOST: "localhost",
        DB_PORT: "5432",
        DB_USER: "quizuser",
        DB_PASSWORD: "quizpassword",
        DB_NAME: "quizdb",
        JWT_SECRET: "your_secure_jwt_secret_key",
      },
      watch: ["src"],
      ignore_watch: ["node_modules", "dist"],
    },
    {
      name: "quiz-frontend",
      cwd: "./frontend",
      script: "npm",
      args: "run dev",
      env: {
        NODE_ENV: "development",
        VITE_API_URL: "http://localhost:3000",
        HOST: "0.0.0.0",
        PORT: "5173",
      },
      watch: ["src"],
      ignore_watch: ["node_modules", "dist"],
    },
  ],
};
