import Sidebar from "../components/Sidebar";
import Badge from "../components/Badge";
import ProgressBar from "../components/ProgressBar";
import {
  Award,
  Flame,
  Target,
  TrendingUp,
  Calendar,
  BookOpen,
  Shield,
  Eye,
  Star,
  Trophy,
  Zap,
  Crown,
} from "lucide-react";
import { motion } from "motion/react";

export default function Profile() {
  const badges = [
    { icon: Star, title: "First Steps", description: "Complete first lesson", earned: true },
    { icon: Flame, title: "Week Warrior", description: "7-day streak", earned: true },
    { icon: Target, title: "Sharp Shooter", description: "95% quiz accuracy", earned: true },
    { icon: Trophy, title: "Truth Seeker", description: "100 analyses", earned: true },
    { icon: BookOpen, title: "Bookworm", description: "Complete 20 lessons", earned: true },
    { icon: Shield, title: "Fact Master", description: "Perfect bias detection", earned: false, progress: 75 },
    { icon: Eye, title: "Deepfake Hunter", description: "Detect 50 deepfakes", earned: false, progress: 40 },
    { icon: Zap, title: "Speed Learner", description: "Complete course in 1 day", earned: false, progress: 0 },
  ];

  const stats = [
    { label: "Total XP", value: "2,450", icon: Award, color: "from-primary to-blue-600" },
    { label: "Current Streak", value: "7 days", icon: Flame, color: "from-accent to-orange-600" },
    { label: "Lessons Done", value: "24", icon: BookOpen, color: "from-secondary to-teal-600" },
    { label: "Quizzes Passed", value: "18", icon: Trophy, color: "from-success to-green-600" },
  ];

  const recentActivity = [
    { action: "Completed lesson", title: "Spotting Fake News Basics", time: "2 hours ago", xp: 50 },
    { action: "Passed quiz", title: "Media Literacy Quiz", time: "5 hours ago", xp: 100 },
    { action: "Analyzed content", title: "Climate Change Article", time: "1 day ago", xp: 10 },
    { action: "Earned badge", title: "Week Warrior", time: "1 day ago", xp: 25 },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Student Profile
            </h1>
            <p className="text-muted-foreground">
              Track your progress and achievements
            </p>
          </div>

          {/* Profile Card */}
          <div className="bg-gradient-to-br from-primary via-blue-600 to-secondary rounded-xl p-8 text-white mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="relative flex items-start gap-6">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold backdrop-blur-sm">
                AR
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-bold mb-1">Alex Rodriguez</h2>
                    <p className="text-white/80 text-lg">Level 12 Media Literacy Champion</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5" />
                      <span className="font-semibold">Rank #2</span>
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-4 gap-4">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
                      >
                        <Icon className="w-6 h-6 mb-2 opacity-80" />
                        <p className="text-2xl font-bold mb-1">{stat.value}</p>
                        <p className="text-sm text-white/70">{stat.label}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Level Progress */}
            <div className="lg:col-span-2 bg-card rounded-xl p-6 border border-border shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-6">Level Progress</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Level</p>
                      <p className="text-3xl font-bold text-primary">12</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Next Level</p>
                      <p className="text-3xl font-bold text-foreground">13</p>
                    </div>
                  </div>
                  <ProgressBar
                    progress={82}
                    color="primary"
                    showPercentage
                    label="2,450 / 3,000 XP"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    550 XP needed to reach Level 13
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Total XP Earned</p>
                    <p className="text-2xl font-bold text-foreground">12,450</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">XP This Week</p>
                    <p className="text-2xl font-bold text-success">+680</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Streak Calendar */}
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-6">Activity Streak</h2>
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-accent to-orange-600 rounded-full flex items-center justify-center">
                  <Flame className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="text-center mb-6">
                <p className="text-4xl font-bold text-accent mb-1">7</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                  <div key={index} className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">{day}</p>
                    <div
                      className={`w-8 h-8 rounded-lg ${
                        index < 7 ? "bg-success" : "bg-muted"
                      }`}
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Keep your streak alive! Complete at least one activity daily.
              </p>
            </div>
          </div>

          {/* Badges Section */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Achievements</h2>
              <span className="text-sm text-muted-foreground">
                {badges.filter((b) => b.earned).length} of {badges.length} earned
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {badges.map((badge, index) => (
                <Badge key={index} {...badge} />
              ))}
            </div>
          </div>

          {/* Skills Breakdown */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">Skill Breakdown</h2>
            <div className="space-y-4">
              <div>
                <ProgressBar
                  progress={92}
                  color="primary"
                  showPercentage
                  label="Fact Checking"
                />
              </div>
              <div>
                <ProgressBar
                  progress={85}
                  color="secondary"
                  showPercentage
                  label="Source Verification"
                />
              </div>
              <div>
                <ProgressBar
                  progress={78}
                  color="accent"
                  showPercentage
                  label="Bias Detection"
                />
              </div>
              <div>
                <ProgressBar
                  progress={70}
                  color="success"
                  showPercentage
                  label="Deepfake Detection"
                />
              </div>
              <div>
                <ProgressBar
                  progress={88}
                  color="primary"
                  showPercentage
                  label="Critical Thinking"
                />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.action} • {activity.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-success font-medium">
                    <Award className="w-4 h-4" />
                    <span>+{activity.xp} XP</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
