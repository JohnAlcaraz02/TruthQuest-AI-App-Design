import { Link, useLocation } from "react-router";
import {
  Home,
  Search,
  CheckCircle,
  Eye,
  BookOpen,
  Trophy,
  Award,
  Settings,
  GraduationCap,
  Brain,
} from "lucide-react";

interface SidebarProps {
  isTeacher?: boolean;
}

export default function Sidebar({ isTeacher = false }: SidebarProps) {
  const location = useLocation();

  const studentNavItems = [
    { path: "/dashboard", icon: Home, label: "Home" },
    { path: "/analyze", icon: Search, label: "Analyze" },
    { path: "/deepfake", icon: Eye, label: "Deepfake Detector" },
    { path: "/learning", icon: BookOpen, label: "Learning Hub" },
    { path: "/challenges", icon: Trophy, label: "Challenges" },
    { path: "/achievements", icon: Award, label: "Achievements" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  const teacherNavItems = [
    { path: "/teacher", icon: GraduationCap, label: "Dashboard" },
    { path: "/dashboard", icon: Home, label: "Student View" },
    { path: "/learning", icon: BookOpen, label: "Learning Hub" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  const navItems = isTeacher ? teacherNavItems : studentNavItems;

  return (
    <div className="w-64 bg-card border-r border-border h-screen sticky top-0 flex flex-col">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">TruthQuest AI</h2>
            <p className="text-xs text-muted-foreground">Think Before You Share</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="bg-gradient-to-r from-primary to-secondary p-4 rounded-xl text-white">
          <p className="text-sm font-medium mb-1">Upgrade to Pro</p>
          <p className="text-xs opacity-90 mb-3">
            Get unlimited analyses and advanced features
          </p>
          <button className="w-full bg-white text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}
