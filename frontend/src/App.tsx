import { Routes, Route, useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import CreateQuizPage from "@/pages/CreateQuizPage";
import EditQuizPage from "@/pages/EditQuizPage";
import TakeQuizPage from "@/pages/TakeQuizPage";
import ResultsPage from "@/pages/ResultsPage";
import Login from "@/pages/Login";
import AdminDashboard from "@/pages/AdminDashboard";
import TeacherDashboard from "@/pages/TeacherDashboard";
import StudentDashboard from "@/pages/StudentDashboard";
import UserManagement from "@/pages/UserManagement";
import NotAuthorized from "@/pages/NotAuthorized";
import NotFound from "@/pages/NotFound";
import QuizManagement from "@/pages/admin/QuizManagement";
import Analytics from "@/pages/admin/Analytics";
import AdminQuizResultsPage from "@/pages/admin/QuizResultsPage";
import AdminResultsPage from "@/pages/admin/ResultsPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect } from "react";
import { authApi } from "./api/auth";
import api from "./api/axiosConfig";
import { UserRole } from "./lib/types";
import TeacherQuizManagement from "@/pages/teacher/QuizManagement";
import TeacherAnalytics from "@/pages/teacher/Analytics";
import TeacherGroups from "@/pages/teacher/Groups";
import TeacherQuestions from "@/pages/teacher/Questions";
import StudentQuizzes from "@/pages/student/Quizzes";
import StudentResults from "@/pages/student/Results";
import ProfilePage from "@/pages/ProfilePage";
import StudentProgress from "./pages/student/Progress";
import ImportQuizPage from "./pages/ImportQuizPage";
import CategoryManagementPage from "./pages/admin/CategoryManagement";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    // Add response interceptor for handling 401 errors
    api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // If we get an auth error, redirect to login
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        }
        return Promise.reject(error);
      }
    );
  }, [navigate]);

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/not-authorized" element={<NotAuthorized />} />

        {/* Profile Route - Accessible to all authenticated users */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/quizzes"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <QuizManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/quizzes/:quizId/results"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <AdminQuizResultsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/results"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <AdminResultsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <CategoryManagementPage />
            </ProtectedRoute>
          }
        />

        {/* Teacher Routes */}
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute allowedRoles={[UserRole.TEACHER]}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/quizzes"
          element={
            <ProtectedRoute allowedRoles={[UserRole.TEACHER]}>
              <TeacherQuizManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/groups"
          element={
            <ProtectedRoute allowedRoles={[UserRole.TEACHER]}>
              <TeacherGroups />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/questions"
          element={
            <ProtectedRoute allowedRoles={[UserRole.TEACHER]}>
              <TeacherQuestions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/analytics"
          element={
            <ProtectedRoute allowedRoles={[UserRole.TEACHER]}>
              <TeacherAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/quizzes/:quizId/results"
          element={
            <ProtectedRoute allowedRoles={[UserRole.TEACHER]}>
              <AdminQuizResultsPage />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/quizzes"
          element={
            <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
              <StudentQuizzes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/results"
          element={
            <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
              <StudentResults />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/progress"
          element={
            <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
              <StudentProgress />
            </ProtectedRoute>
          }
        />

        {/* General Application Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomePage />} />
          <Route
            path="create"
            element={
              <ProtectedRoute allowedRoles={[UserRole.TEACHER, UserRole.ADMIN]}>
                <CreateQuizPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="edit-quiz/:id"
            element={
              <ProtectedRoute allowedRoles={[UserRole.TEACHER, UserRole.ADMIN]}>
                <EditQuizPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="import-quiz"
            element={
              <ProtectedRoute allowedRoles={[UserRole.TEACHER, UserRole.ADMIN]}>
                <ImportQuizPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="quiz/:id"
            element={
              <ProtectedRoute
                allowedRoles={[
                  UserRole.STUDENT,
                  UserRole.TEACHER,
                  UserRole.ADMIN,
                ]}
              >
                <TakeQuizPage />
              </ProtectedRoute>
            }
          />
          <Route path="results/:quizId" element={<ResultsPage />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
