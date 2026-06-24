import { Link } from "react-router";
import Sidebar from "../components/Sidebar";
import ProgressBar from "../components/ProgressBar";
import {
  BookOpen,
  Target,
  Eye,
  Shield,
  Users,
  Lightbulb,
  TrendingUp,
  Award,
  Lock,
  CheckCircle,
  Play,
  Star,
} from "lucide-react";
import { motion } from "motion/react";

export default function LearningHub() {
  const courses = [
    {
      id: 1,
      title: "Spot Fake News",
      description: "Learn to identify misinformation and verify sources",
      icon: Target,
      progress: 75,
      lessons: 12,
      completed: 9,
      xp: 120,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      locked: false,
    },
    {
      id: 2,
      title: "Understanding Bias",
      description: "Recognize different types of bias in media content",
      icon: TrendingUp,
      progress: 45,
      lessons: 10,
      completed: 4,
      xp: 100,
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
      textColor: "text-teal-600",
      locked: false,
    },
    {
      id: 3,
      title: "Source Verification",
      description: "Master the art of verifying information sources",
      icon: Shield,
      progress: 100,
      lessons: 8,
      completed: 8,
      xp: 80,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      locked: false,
    },
    {
      id: 4,
      title: "Deepfake Awareness",
      description: "Understand deepfakes and how to spot them",
      icon: Eye,
      progress: 20,
      lessons: 15,
      completed: 3,
      xp: 150,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      locked: false,
    },
    {
      id: 5,
      title: "Social Media Literacy",
      description: "Navigate social media responsibly and critically",
      icon: Users,
      progress: 0,
      lessons: 12,
      completed: 0,
      xp: 120,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
      locked: false,
    },
    {
      id: 6,
      title: "Digital Citizenship",
      description: "Become a responsible digital citizen",
      icon: Lightbulb,
      progress: 0,
      lessons: 10,
      completed: 0,
      xp: 100,
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50",
      textColor: "text-pink-600",
      locked: true,
    },
  ];

  const achievements = [
    { title: "First Steps", description: "Complete your first lesson", earned: true },
    { title: "Quick Learner", description: "Complete 5 lessons in one day", earned: true },
    { title: "Truth Seeker", description: "Master all Fake News lessons", earned: false },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Learning Hub
            </h1>
            <p className="text-muted-foreground">
              Build your media literacy skills through interactive lessons and challenges
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-primary to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">24</span>
              </div>
              <p className="text-sm opacity-90">Lessons Completed</p>
            </div>
            
            <div className="bg-gradient-to-br from-secondary to-teal-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">2,450</span>
              </div>
              <p className="text-sm opacity-90">Total XP Earned</p>
            </div>
            
            <div className="bg-gradient-to-br from-accent to-orange-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">7</span>
              </div>
              <p className="text-sm opacity-90">Day Streak</p>
            </div>
            
            <div className="bg-gradient-to-br from-success to-green-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">12</span>
              </div>
              <p className="text-sm opacity-90">Level</p>
            </div>
          </div>

          {/* Current Progress */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">Your Progress</h2>
                <p className="text-sm text-muted-foreground">Keep learning to level up!</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Level 12</p>
                <p className="text-2xl font-bold text-primary">2,450 XP</p>
              </div>
            </div>
            <ProgressBar
              progress={82}
              color="primary"
              showPercentage
              label="550 XP to Level 13"
            />
          </div>

          {/* Courses Grid */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-6">Courses</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => {
                const Icon = course.icon;
                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-card rounded-xl border border-border shadow-sm overflow-hidden hover:shadow-lg transition-all ${
                      course.locked ? "opacity-60" : ""
                    }`}
                  >
                    <div className={`h-2 bg-gradient-to-r ${course.color}`} />
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 ${course.bgColor} rounded-xl flex items-center justify-center`}>
                          {course.locked ? (
                            <Lock className={`w-6 h-6 ${course.textColor}`} />
                          ) : (
                            <Icon className={`w-6 h-6 ${course.textColor}`} />
                          )}
                        </div>
                        {!course.locked && course.progress === 100 && (
                          <div className="bg-success/10 text-success px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Completed
                          </div>
                        )}
                        {course.locked && (
                          <div className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs font-medium">
                            Locked
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {course.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {course.description}
                      </p>
                      
                      {!course.locked && (
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-muted-foreground">
                                {course.completed}/{course.lessons} lessons
                              </span>
                              <span className="font-medium text-foreground">{course.progress}%</span>
                            </div>
                            <ProgressBar progress={course.progress} color="primary" />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Award className="w-4 h-4" />
                              <span>{course.xp} XP</span>
                            </div>
                            <Link
                              to={`/learning/${course.id}`}
                              className={`px-4 py-2 bg-gradient-to-r ${course.color} text-white rounded-lg text-sm font-medium hover:shadow-md transition-all flex items-center gap-2`}
                            >
                              {course.progress > 0 ? "Continue" : "Start"}
                              <Play className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      )}
                      
                      {course.locked && (
                        <p className="text-sm text-muted-foreground italic">
                          Complete previous courses to unlock
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Recent Achievements</h2>
              <Link to="/achievements" className="text-sm font-medium text-primary hover:underline">
                View All
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-2 ${
                    achievement.earned
                      ? "bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30"
                      : "bg-muted border-border"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        achievement.earned ? "bg-primary text-white" : "bg-card text-muted-foreground"
                      }`}
                    >
                      <Award className="w-5 h-5" />
                    </div>
                    {achievement.earned && (
                      <CheckCircle className="w-5 h-5 text-success" />
                    )}
                  </div>
                  <h4 className={`font-semibold mb-1 ${achievement.earned ? "text-foreground" : "text-muted-foreground"}`}>
                    {achievement.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard Preview */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">This Week's Leaderboard</h2>
              <button className="text-sm font-medium text-primary hover:underline">
                View Full Leaderboard
              </button>
            </div>
            <div className="space-y-4">
              {[
                { rank: 1, name: "Sarah Chen", xp: 3420, avatar: "SC" },
                { rank: 2, name: "Alex Rodriguez", xp: 2450, avatar: "AR", current: true },
                { rank: 3, name: "Maya Patel", xp: 2180, avatar: "MP" },
                { rank: 4, name: "James Kim", xp: 1890, avatar: "JK" },
                { rank: 5, name: "Emma Wilson", xp: 1750, avatar: "EW" },
              ].map((user) => (
                <div
                  key={user.rank}
                  className={`flex items-center gap-4 p-4 rounded-lg ${
                    user.current
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-muted"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    user.rank === 1 ? "bg-accent text-white" :
                    user.rank === 2 ? "bg-muted-foreground text-white" :
                    user.rank === 3 ? "bg-amber-700 text-white" :
                    "bg-card text-foreground"
                  }`}>
                    {user.rank === 1 && <Star className="w-4 h-4" />}
                    {user.rank !== 1 && user.rank}
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white ${
                    user.current ? "bg-primary" : "bg-muted-foreground"
                  }`}>
                    {user.avatar}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${user.current ? "text-primary" : "text-foreground"}`}>
                      {user.name}
                      {user.current && " (You)"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{user.xp.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">XP</p>
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
