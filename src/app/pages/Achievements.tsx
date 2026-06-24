import Sidebar from "../components/Sidebar";
import Badge from "../components/Badge";
import {
  Star,
  Flame,
  Target,
  Trophy,
  BookOpen,
  Shield,
  Eye,
  Zap,
  Award,
  Crown,
  Heart,
  Rocket,
} from "lucide-react";

export default function Achievements() {
  const allBadges = [
    { icon: Star, title: "First Steps", description: "Complete first lesson", earned: true },
    { icon: Flame, title: "Week Warrior", description: "7-day streak", earned: true },
    { icon: Target, title: "Sharp Shooter", description: "95% quiz accuracy", earned: true },
    { icon: Trophy, title: "Truth Seeker", description: "100 analyses", earned: true },
    { icon: BookOpen, title: "Bookworm", description: "Complete 20 lessons", earned: true },
    { icon: Shield, title: "Fact Master", description: "Perfect bias detection", earned: false, progress: 75 },
    { icon: Eye, title: "Deepfake Hunter", description: "Detect 50 deepfakes", earned: false, progress: 40 },
    { icon: Zap, title: "Speed Learner", description: "Complete course in 1 day", earned: false, progress: 0 },
    { icon: Crown, title: "Top of Class", description: "Rank #1 on leaderboard", earned: false, progress: 50 },
    { icon: Heart, title: "Helpful Heart", description: "Help 10 classmates", earned: false, progress: 30 },
    { icon: Rocket, title: "Rapid Rise", description: "Gain 3 levels in 1 week", earned: false, progress: 60 },
    { icon: Award, title: "Perfect Score", description: "100% on all quizzes", earned: false, progress: 85 },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Achievements</h1>
        <p className="text-muted-foreground mb-8">
          {allBadges.filter((b) => b.earned).length} of {allBadges.length} badges earned
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {allBadges.map((badge, index) => (
            <Badge key={index} {...badge} />
          ))}
        </div>
      </div>
    </div>
  );
}
