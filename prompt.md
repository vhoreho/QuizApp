You are tasked with developing a web application for an educational platform with the following requirements:

1. **Authentication System**:
   - Implement a secure authentication system without email-based registration.
   - Only administrators can create new user accounts (students, teachers, or other administrators).
   - Each user must have a unique username and password.
   - Passwords must be securely hashed and stored.
   - Implement session management with JWT or similar for secure user sessions.
   - Include a login page with input validation and error handling (e.g., incorrect credentials).

2. **Role-Based Access Control (RBAC)**:
   - Define three user roles: **Administrator**, **Teacher**, and **Student**.
   - **Administrator**:
     - Can create, edit, and delete user accounts (for all roles).
     - Can view and manage all tests, including assigning tests to students or groups.
     - Can access analytics and reports on test performance across all users.
   - **Teacher**:
     - Can create, edit, and delete tests they authored.
     - Can assign tests to specific students or groups.
     - Can view test results and analytics for their assigned students.
   - **Student**:
     - Can view and take tests assigned to them.
     - Can see their own test results and feedback (if provided).
     - Cannot create or edit tests.

3. **Test Creation and Management**:
   - Implement a test creation system allowing teachers to create various types of tests:
     - **Single-choice questions**: One correct answer from multiple options.
     - **Multiple-choice questions**: Multiple correct answers from several options.
     - **Open-ended questions**: Text-based answers, optionally graded manually or with automated keyword-based scoring.
     - **Matching questions**: Pair items from two lists (e.g., terms and definitions).
     - **Ordering questions**: Arrange items in the correct sequence (e.g., steps in a process).
   - Allow teachers to set:
     - Time limits for tests or individual questions.
     - Point values for each question.
     - Optional randomization of question or answer order.
     - Optional feedback for correct/incorrect answers (shown after test completion).
   - Support test categorization (e.g., by subject, topic, or difficulty level).
   - Allow test previews for teachers before publishing.

4. **Test-Taking Features**:
   - Students can access assigned tests via a dashboard.
   - Display a timer if the test is time-bound.
   - Allow students to save progress and resume later (optional, configurable by the teacher).
   - Provide a confirmation step before test submission.
   - Show results immediately after submission (if configured) or later (teacher’s choice).
   - Prevent students from accessing tests after submission or deadline.

5. **Additional Features**:
   - **Group Management**:
     - Administrators or teachers can create student groups for easier test assignment.
     - Assign tests to entire groups instead of individual students.
   - **Analytics and Reporting**:
     - Administrators and teachers can view detailed analytics (e.g., average scores, completion rates, question difficulty).
     - Students can see their performance trends over time (e.g., score history, improvement graphs).
   - **Question Bank**:
     - Teachers can save questions to a reusable question bank for future tests.
     - Support importing/exporting questions (e.g., via CSV or JSON).
   - **Notifications**:
     - Notify students of new test assignments or deadlines (in-app notifications).
     - Notify teachers of test completions requiring manual grading.
   - **Multilingual Support**:
     - Allow the interface and tests to support multiple languages (configurable by the administrator).
   - **Accessibility**:
     - Ensure the application is accessible (e.g., screen reader support, keyboard navigation, high-contrast mode).
   - **Test Proctoring (Optional)**:
     - Add basic proctoring features like disabling copy-paste, tracking tab-switching, or requiring full-screen mode during tests.

6. **Technical Requirements**:
   - Use a modern web framework (e.g., React for frontend, Node.js/Express or Django for backend).
   - Store data in a relational database (e.g., PostgreSQL) for users, tests, and results.
   - Ensure scalability and security (e.g., input sanitization, rate-limiting, HTTPS).
   - Provide a RESTful API for all major functionalities (e.g., user management, test creation, test submission).
   - Include unit and integration tests for core features (authentication, test creation, grading).

7. **User Interface**:
   - Create a clean, intuitive UI with role-specific dashboards:
     - **Administrator Dashboard**: User management, test overview, and analytics.
     - **Teacher Dashboard**: Test creation, assignment, and student performance.
     - **Student Dashboard**: Assigned tests, results, and progress tracking.
   - Use a responsive design compatible with desktops, tablets, and mobile devices.
   - Incorporate a modern CSS framework (e.g., Tailwind CSS) for styling.

8. **Future Scalability**:
   - Design the system to allow future additions like gamification (e.g., badges for achievements), integration with external LMS platforms, or AI-based question generation.
   - Ensure the database schema supports new question types or role permissions without major refactoring.

Deliverables:
- A complete web application meeting the above requirements.
- Comprehensive documentation covering setup, usage, and API endpoints.
- A demo dataset with sample users, tests, and results for testing purposes.