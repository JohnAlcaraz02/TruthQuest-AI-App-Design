import { useState } from "react";
import Sidebar from "../components/Sidebar";
import StatsCard from "../components/StatsCard";
import ProgressBar from "../components/ProgressBar";
import {
  Target,
  TrendingUp,
  Award,
  Flame,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Brain,
} from "lucide-react";
import { Link } from "react-router";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";

export default function Dashboard() {
  const credibilityData = [
    { day: "Mon", score: 72 },
    { day: "Tue", score: 78 },
    { day: "Wed", score: 75 },
    { day: "Thu", score: 82 },
    { day: "Fri", score: 85 },
    { day: "Sat", score: 88 },
    { day: "Sun", score: 90 },
  ];

  const skillsData = [
    { skill: "Source Verification", score: 85 },
    { skill: "Bias Detection", score: 78 },
    { skill: "Fact Checking", score: 92 },
    { skill: "Deepfake Detection", score: 70 },
    { skill: "Critical Thinking", score: 88 },
  ];

  const recentAnalyses = [
    {
      id: 1,
      title: "Climate Change Article from ScienceDaily",
      score: 92,
      type: "Article",
      time: "2 hours ago",
      status: "high",
    },
    {
      id: 2,
      title: "Social Media Post about Vaccine",
      score: 45,
      type: "Social Media",
      time: "5 hours ago",
      status: "low",
    },
    {
      id: 3,
      title: "News Report on Economic Policy",
      score: 78,
      type: "Article",
      time: "1 day ago",
      status: "medium",
    },
    {
      id: 4,
      title: "Viral Video on Education Reform",
      score: 65,
      type: "Video",
      time: "2 days ago",
      status: "medium",
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, Alex! 👋
            </h1>
            <p className="text-muted-foreground">
              Here's your media literacy progress for today
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Media Literacy Score"
              value="85"
              icon={Target}
              change="+5 from last week"
              color="primary"
              delay={0}
            />
            <StatsCard
              title="Analyses Today"
              value="12"
              icon={TrendingUp}
              change="+3 from yesterday"
              color="secondary"
              delay={0.1}
            />
            <StatsCard
              title="Current Streak"
              value="7 days"
              icon={Flame}
              change="Keep it up!"
              color="accent"
              delay={0.2}
            />
            <StatsCard
              title="XP Earned"
              value="2,450"
              icon={Award}
              change="+120 today"
              color="success"
              delay={0.3}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Credibility Trends */}
            <div className="lg:col-span-2 bg-card rounded-xl p-6 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Credibility Analysis Trends
                </h2>
                <select className="px-4 py-2 bg-muted rounded-lg text-sm font-medium text-foreground border-none outline-none">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 3 months</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={credibilityData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="day" stroke="#64748B" />
                  <YAxis stroke="#64748B" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #E2E8F0",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#2563EB"
                    strokeWidth={2}
                    fill="url(#colorScore)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Learning Progress */}
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Learning Progress
              </h2>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Level 12</span>
                    <span className="text-sm text-muted-foreground">2,450 / 3,000 XP</span>
                  </div>
                  <ProgressBar progress={82} color="primary" />
                </div>
                
                <div className="bg-gradient-to-br from-primary to-secondary rounded-xl p-4 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Daily Challenge</p>
                      <p className="text-xs opacity-90">Analyze 3 more articles</p>
                    </div>
                  </div>
                  <ProgressBar progress={66} color="accent" />
                  <p className="text-xs mt-2 opacity-90">2 of 3 completed</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Lessons Completed</span>
                      <span className="text-sm font-semibold text-foreground">24/30</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Quizzes Passed</span>
                      <span className="text-sm font-semibold text-foreground">18</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Badges Earned</span>
                      <span className="text-sm font-semibold text-foreground">12</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Radar & Recent Analyses */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Skills Radar */}
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Skill Assessment
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={skillsData}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis
                    dataKey="skill"
                    tick={{ fill: "#64748B", fontSize: 10 }}
                  />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#2563EB"
                    fill="#2563EB"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Analyses */}
            <div className="lg:col-span-2 bg-card rounded-xl p-6 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Recent Analyses
                </h2>
                <Link
                  to="/analyze"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {recentAnalyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground">{analysis.title}</h3>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {analysis.time}
                        </span>
                        <span>•</span>
                        <span>{analysis.type}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">Score</p>
                        <p
                          className={`text-lg font-bold ${
                            analysis.status === "high"
                              ? "text-success"
                              : analysis.status === "medium"
                              ? "text-accent"
                              : "text-destructive"
                          }`}
                        >
                          {analysis.score}
                        </p>
                      </div>
                      {analysis.status === "high" ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : (
                        <AlertTriangle
                          className={`w-5 h-5 ${
                            analysis.status === "medium" ? "text-accent" : "text-destructive"
                          }`}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <Link
              to="/analyze"
              className="bg-gradient-to-br from-primary to-blue-600 rounded-xl p-6 text-white hover:shadow-lg transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <Brain className="w-8 h-8" />
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-xl">→</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Analyze Content</h3>
              <p className="text-sm text-white/80">
                Check credibility of articles and posts
              </p>
            </Link>

            <Link
              to="/deepfake"
              className="bg-gradient-to-br from-secondary to-teal-600 rounded-xl p-6 text-white hover:shadow-lg transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <Eye className="w-8 h-8" />
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-xl">→</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Deepfake Detector</h3>
              <p className="text-sm text-white/80">
                Detect manipulated media content
              </p>
            </Link>

            <Link
              to="/learning"
              className="bg-gradient-to-br from-accent to-orange-600 rounded-xl p-6 text-white hover:shadow-lg transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <Award className="w-8 h-8" />
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-xl">→</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Continue Learning</h3>
              <p className="text-sm text-white/80">
                Complete lessons and earn rewards
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
