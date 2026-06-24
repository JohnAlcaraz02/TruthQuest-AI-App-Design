import { Link } from "react-router";
import { Home, Search, BookOpen, Trophy, User, Target, Eye, Shield, Play, Lock } from "lucide-react";
import ProgressBar from "../../components/ProgressBar";

export default function MobileLearning() {
  const courses = [
    { id: 1, title: "Spot Fake News", icon: Target, progress: 75, lessons: 12, color: "from-blue-500 to-blue-600", locked: false },
    { id: 2, title: "Understanding Bias", icon: Eye, progress: 45, lessons: 10, color: "from-teal-500 to-teal-600", locked: false },
    { id: 3, title: "Source Verification", icon: Shield, progress: 100, lessons: 8, color: "from-green-500 to-green-600", locked: false },
    { id: 4, title: "Deepfake Awareness", icon: Eye, progress: 20, lessons: 15, color: "from-purple-500 to-purple-600", locked: false },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-secondary p-6 text-white">
        <h1 className="text-2xl font-bold">Learning Hub</h1>
        <p className="text-sm opacity-90">Build your media literacy skills</p>
      </div>

      {/* Stats */}
      <div className="p-6">
        <div className="bg-card rounded-xl p-6 border border-border mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Level 12</p>
              <p className="text-2xl font-bold text-primary">2,450 XP</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Next Level</p>
              <p className="text-lg font-semibold text-foreground">550 XP</p>
            </div>
          </div>
          <ProgressBar progress={82} color="primary" />
        </div>

        {/* Courses */}
        <div className="space-y-4">
          {courses.map((course) => {
            const Icon = course.icon;
            return (
              <div key={course.id} className="bg-card rounded-xl border border-border overflow-hidden">
                <div className={`h-1 bg-gradient-to-r ${course.color}`} />
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${course.color} rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">{course.lessons} lessons</p>
                    </div>
                    {course.progress === 100 && (
                      <span className="bg-success/10 text-success px-3 py-1 rounded-full text-xs font-medium">
                        Done
                      </span>
                    )}
                  </div>
                  <ProgressBar progress={course.progress} color="primary" showPercentage />
                  <button className={`w-full mt-4 px-4 py-3 bg-gradient-to-r ${course.color} text-white rounded-lg font-medium flex items-center justify-center gap-2`}>
                    {course.progress > 0 ? "Continue" : "Start"}
                    <Play className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-6 py-4">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <Link to="/mobile" className="flex flex-col items-center gap-1 text-muted-foreground">
            <Home className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </Link>
          <Link to="/mobile/analyze" className="flex flex-col items-center gap-1 text-muted-foreground">
            <Search className="w-6 h-6" />
            <span className="text-xs">Analyze</span>
          </Link>
          <Link to="/mobile/learning" className="flex flex-col items-center gap-1 text-primary">
            <BookOpen className="w-6 h-6" />
            <span className="text-xs font-medium">Learn</span>
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
