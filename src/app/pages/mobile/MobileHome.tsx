import { Link } from "react-router";
import { Home, Search, BookOpen, Trophy, User, Flame, Award, TrendingUp, Target } from "lucide-react";
import { motion } from "motion/react";

export default function MobileHome() {
  const stats = [
    { label: "Score", value: "85", icon: Target, color: "bg-primary" },
    { label: "Streak", value: "7", icon: Flame, color: "bg-accent" },
    { label: "Level", value: "12", icon: Award, color: "bg-secondary" },
  ];

  const quickActions = [
    { icon: Search, label: "Analyze", to: "/mobile/analyze", color: "from-primary to-blue-600" },
    { icon: BookOpen, label: "Learn", to: "/mobile/learning", color: "from-secondary to-teal-600" },
    { icon: Trophy, label: "Quiz", to: "/mobile/quiz", color: "from-accent to-orange-600" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm opacity-90">Welcome back,</p>
            <h1 className="text-2xl font-bold">Alex 👋</h1>
          </div>
          <Link to="/mobile/profile" className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-semibold">
            AR
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center"
              >
                <Icon className="w-6 h-6 mx-auto mb-2" />
                <p className="text-2xl font-bold mb-1">{stat.value}</p>
                <p className="text-xs opacity-90">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Progress Card */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Daily Goal</h2>
            <span className="text-sm text-muted-foreground">2/3 completed</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 mb-2">
            <div className="bg-primary h-3 rounded-full" style={{ width: "66%" }} />
          </div>
          <p className="text-sm text-muted-foreground">One more analysis to go!</p>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  to={action.to}
                  className={`bg-gradient-to-br ${action.color} rounded-xl p-6 text-white text-center hover:shadow-lg transition-all`}
                >
                  <Icon className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">{action.label}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {[
              { title: "Completed Quiz", time: "2 hours ago", xp: 100 },
              { title: "Analyzed Article", time: "5 hours ago", xp: 10 },
              { title: "Earned Badge", time: "1 day ago", xp: 25 },
            ].map((activity, index) => (
              <div key={index} className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                  <span className="text-success font-medium">+{activity.xp} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-6 py-4">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <Link to="/mobile" className="flex flex-col items-center gap-1 text-primary">
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link to="/mobile/analyze" className="flex flex-col items-center gap-1 text-muted-foreground">
            <Search className="w-6 h-6" />
            <span className="text-xs">Analyze</span>
          </Link>
          <Link to="/mobile/learning" className="flex flex-col items-center gap-1 text-muted-foreground">
            <BookOpen className="w-6 h-6" />
            <span className="text-xs">Learn</span>
          </Link>
          <Link to="/mobile/quiz" className="flex flex-col items-center gap-1 text-muted-foreground">
            <Trophy className="w-6 h-6" />
            <span className="text-xs">Quiz</span>
          </Link>
          <Link to="/mobile/profile" className="flex flex-col items-center gap-1 text-muted-foreground">
            <User className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
