import Sidebar from "../components/Sidebar";
import StatsCard from "../components/StatsCard";
import {
  Users,
  TrendingUp,
  Award,
  BookOpen,
  Target,
  AlertCircle,
  CheckCircle,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function TeacherDashboard() {
  const classPerformance = [
    { name: "Week 1", average: 65 },
    { name: "Week 2", average: 70 },
    { name: "Week 3", average: 75 },
    { name: "Week 4", average: 82 },
    { name: "Week 5", average: 85 },
    { name: "Week 6", average: 88 },
  ];

  const skillDistribution = [
    { name: "Fact Checking", value: 85 },
    { name: "Source Verification", value: 78 },
    { name: "Bias Detection", value: 72 },
    { name: "Deepfake Detection", value: 65 },
  ];

  const completionData = [
    { name: "Completed", value: 24, color: "#22C55E" },
    { name: "In Progress", value: 8, color: "#F59E0B" },
    { name: "Not Started", value: 3, color: "#E2E8F0" },
  ];

  const students = [
    { id: 1, name: "Sarah Chen", level: 15, xp: 3420, score: 92, streak: 14, status: "excellent" },
    { id: 2, name: "Alex Rodriguez", level: 12, xp: 2450, score: 85, streak: 7, status: "good" },
    { id: 3, name: "Maya Patel", level: 11, xp: 2180, score: 88, streak: 10, status: "good" },
    { id: 4, name: "James Kim", level: 9, xp: 1890, score: 78, streak: 5, status: "average" },
    { id: 5, name: "Emma Wilson", level: 8, xp: 1750, score: 82, streak: 3, status: "average" },
    { id: 6, name: "Oliver Brown", level: 6, xp: 980, score: 65, streak: 1, status: "needs-attention" },
  ];

  const recentAssignments = [
    { title: "Media Bias Analysis", due: "2 days", submitted: 28, total: 35, status: "active" },
    { title: "Deepfake Detection Quiz", due: "5 days", submitted: 15, total: 35, status: "active" },
    { title: "Source Verification Exercise", due: "Completed", submitted: 35, total: 35, status: "completed" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isTeacher />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Teacher Dashboard
            </h1>
            <p className="text-muted-foreground">
              Monitor student progress and class performance
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Students"
              value="35"
              icon={Users}
              change="Active this week: 32"
              color="primary"
              delay={0}
            />
            <StatsCard
              title="Class Average"
              value="85%"
              icon={TrendingUp}
              change="+3% from last month"
              color="secondary"
              delay={0.1}
            />
            <StatsCard
              title="Lessons Completed"
              value="420"
              icon={BookOpen}
              change="This month"
              color="accent"
              delay={0.2}
            />
            <StatsCard
              title="Avg. Media Literacy"
              value="82/100"
              icon={Target}
              change="Class-wide score"
              color="success"
              delay={0.3}
            />
          </div>

          {/* Performance Charts */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Class Performance Trend */}
            <div className="lg:col-span-2 bg-card rounded-xl p-6 border border-border shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Class Performance Trend
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={classPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#64748B" />
                  <YAxis stroke="#64748B" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #E2E8F0",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke="#2563EB"
                    strokeWidth={3}
                    dot={{ fill: "#2563EB", r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Completion Status */}
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Course Completion
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={completionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {completionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {completionData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-foreground">{item.name}</span>
                    </div>
                    <span className="font-medium text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Skill Distribution */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Class Skill Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={skillDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Student List */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Student Progress</h2>
              <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all">
                Export Report
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Student
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Level
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Total XP
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Avg Score
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Streak
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b border-border hover:bg-muted transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <span className="font-medium text-foreground">{student.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-foreground">{student.level}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-foreground">{student.xp.toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium text-foreground">{student.score}%</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-foreground">{student.streak} days</span>
                      </td>
                      <td className="py-4 px-4">
                        {student.status === "excellent" && (
                          <span className="px-3 py-1 bg-success/10 text-success rounded-full text-sm font-medium">
                            Excellent
                          </span>
                        )}
                        {student.status === "good" && (
                          <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium">
                            Good
                          </span>
                        )}
                        {student.status === "average" && (
                          <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                            Average
                          </span>
                        )}
                        {student.status === "needs-attention" && (
                          <span className="px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm font-medium">
                            Needs Attention
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Assignments */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Recent Assignments</h2>
              <button className="px-4 py-2 bg-card border border-border text-foreground rounded-lg text-sm font-medium hover:bg-muted transition-all">
                Create Assignment
              </button>
            </div>
            <div className="space-y-4">
              {recentAssignments.map((assignment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground mb-1">{assignment.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Due: {assignment.due} • Submitted: {assignment.submitted}/{assignment.total}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">Progress</p>
                      <div className="w-32 bg-card rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            assignment.status === "completed" ? "bg-success" : "bg-primary"
                          }`}
                          style={{
                            width: `${(assignment.submitted / assignment.total) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    {assignment.status === "completed" ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-accent" />
                    )}
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
