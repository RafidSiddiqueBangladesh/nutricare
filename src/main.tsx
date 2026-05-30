import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Auth Pages
import Landing from './screens/Landing';
import SignIn from './screens/SignIn';
import SignUp from './screens/SignUp';
import AuthCallback from './screens/AuthCallback';

// App Pages
import Nutrition from './screens/Nutrition';
import Exercise from './screens/Exercise';
import Health from './screens/Health';
import Cooking from './screens/Cooking';
import Costs from './screens/Costs';
import ExerciseCoach from './screens/ExerciseCoach';
import BMICalculator from './screens/BMICalculator';
import HospitalMap from './screens/HospitalMap';
import DoctorBooking from './screens/DoctorBooking';
import AnalysisHistory from './screens/AnalysisHistory';
import MoodSuggestions from './screens/MoodSuggestions';
import TrackingOptions from './screens/TrackingOptions';
import AIDiagnosis from './screens/AIDiagnosis';
import VideoCall from './screens/VideoCall';
import FaceMonitor from './screens/FaceMonitor';
import PoseMonitor from './screens/PoseMonitor';
import HandMonitor from './screens/HandMonitor';
import LiveExerciseEditor from './screens/LiveExerciseEditor';
import HealthResultsHistory from './screens/HealthResultsHistory';
import Profile from './screens/Profile';
import './index.css';

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/auth/signin" element={<SignIn />} />
      <Route path="/auth/signup" element={<SignUp />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected Routes */}
      <Route
        path="/nutrition"
        element={
          <ProtectedRoute>
            <Layout>
              <Nutrition />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/exercises"
        element={
          <ProtectedRoute>
            <Layout>
              <Exercise />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/exercises/coach/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <ExerciseCoach />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/exercises/live-editor"
        element={
          <ProtectedRoute>
            <Layout>
              <LiveExerciseEditor />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/health"
        element={
          <ProtectedRoute>
            <Layout>
              <Health />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/health/bmi"
        element={
          <ProtectedRoute>
            <Layout>
              <BMICalculator />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/health/hospitals"
        element={
          <ProtectedRoute>
            <Layout>
              <HospitalMap />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/health/doctors"
        element={
          <ProtectedRoute>
            <Layout>
              <DoctorBooking />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/health/history"
        element={
          <ProtectedRoute>
            <Layout>
              <HealthResultsHistory />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/health/tracking"
        element={
          <ProtectedRoute>
            <Layout>
              <TrackingOptions />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/health/mood"
        element={
          <ProtectedRoute>
            <Layout>
              <MoodSuggestions />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/health/diagnosis"
        element={
          <ProtectedRoute>
            <Layout>
              <AIDiagnosis />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/health/monitor/face"
        element={
          <ProtectedRoute>
            <Layout>
              <FaceMonitor />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/health/monitor/pose"
        element={
          <ProtectedRoute>
            <Layout>
              <PoseMonitor />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/health/monitor/hand"
        element={
          <ProtectedRoute>
            <Layout>
              <HandMonitor />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/video-call/:doctorId"
        element={
          <ProtectedRoute>
            <Layout>
              <VideoCall />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cooking"
        element={
          <ProtectedRoute>
            <Layout>
              <Cooking />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/costs"
        element={
          <ProtectedRoute>
            <Layout>
              <Costs />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
