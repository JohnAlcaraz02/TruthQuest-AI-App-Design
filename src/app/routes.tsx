import { createBrowserRouter } from "react-router";
import Root from "./layouts/Root";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Analyzer from "./pages/Analyzer";
import DeepfakeDetector from "./pages/DeepfakeDetector";
import LearningHub from "./pages/LearningHub";
import Quiz from "./pages/Quiz";
import Profile from "./pages/Profile";
import TeacherDashboard from "./pages/TeacherDashboard";
import Challenges from "./pages/Challenges";
import Achievements from "./pages/Achievements";
import Settings from "./pages/Settings";
import MobileHome from "./pages/mobile/MobileHome";
import MobileAnalyzer from "./pages/mobile/MobileAnalyzer";
import MobileLearning from "./pages/mobile/MobileLearning";
import MobileQuiz from "./pages/mobile/MobileQuiz";
import MobileProfile from "./pages/mobile/MobileProfile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Landing },
      { path: "dashboard", Component: Dashboard },
      { path: "analyze", Component: Analyzer },
      { path: "deepfake", Component: DeepfakeDetector },
      { path: "learning", Component: LearningHub },
      { path: "quiz", Component: Quiz },
      { path: "profile", Component: Profile },
      { path: "teacher", Component: TeacherDashboard },
      { path: "challenges", Component: Challenges },
      { path: "achievements", Component: Achievements },
      { path: "settings", Component: Settings },
      { path: "mobile", Component: MobileHome },
      { path: "mobile/analyze", Component: MobileAnalyzer },
      { path: "mobile/learning", Component: MobileLearning },
      { path: "mobile/quiz", Component: MobileQuiz },
      { path: "mobile/profile", Component: MobileProfile },
    ],
  },
]);
