import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/Layout';
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
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/nutrition" replace />} />
            <Route path="/nutrition" element={<Nutrition />} />
            <Route path="/exercises" element={<Exercise />} />
            <Route path="/exercises/coach/:id" element={<ExerciseCoach />} />
            <Route path="/health" element={<Health />} />
            <Route path="/health/bmi" element={<BMICalculator />} />
            <Route path="/health/hospitals" element={<HospitalMap />} />
            <Route path="/health/doctors" element={<DoctorBooking />} />
            <Route path="/health/history" element={<AnalysisHistory />} />
            <Route path="/health/tracking" element={<TrackingOptions />} />
            <Route path="/health/mood" element={<MoodSuggestions />} />
            <Route path="/health/diagnosis" element={<AIDiagnosis />} />
            <Route path="/health/monitor/face" element={<FaceMonitor />} />
            <Route path="/health/monitor/pose" element={<PoseMonitor />} />
            <Route path="/health/monitor/hand" element={<HandMonitor />} />
            <Route path="/video-call/:doctorId" element={<VideoCall />} />
            <Route path="/cooking" element={<Cooking />} />
            <Route path="/costs" element={<Costs />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
