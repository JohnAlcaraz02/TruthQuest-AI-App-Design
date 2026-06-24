import { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, LineChart, Line, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import {
  Shield, Search, Brain, AlertTriangle, CheckCircle, TrendingUp,
  BookOpen, Trophy, Star, Flame, ChevronRight, ChevronDown, Upload,
  Link, FileText, Image, Video, Mic, Users, BarChart2, Settings,
  Home, Zap, Award, Play, Clock, Target, Eye, Hash, Globe, ArrowRight,
  X, Menu, Bell, MessageSquare, Layers, Sparkles, Lock,
  User, GraduationCap, FlaskConical, Newspaper, ChevronUp, RefreshCw, Lightbulb,
  AlertCircle, ThumbsUp, Share2, Bookmark, ExternalLink, LogIn,
  Smartphone, Monitor, Moon, Sun
} from "lucide-react";
import {
  analyzeContent,
  analyzeDeepfake,
  useTruthQuestBootstrap,
  type AppBootstrap,
  type ContentAnalysisResponse,
  type DeepfakeAnalysisResponse,
} from "./services/truthquestApi";

// ─── Types ───────────────────────────────────────────────────────────────────
type Screen =
  | "landing" | "dashboard" | "analyzer" | "deepfake"
  | "learning" | "quiz" | "profile" | "teacher" | "mobile";

// ─── Data ─────────────────────────────────────────────────────────────────────
const weeklyData = [
  { day: "Mon", score: 72, articles: 4 },
  { day: "Tue", score: 78, articles: 6 },
  { day: "Wed", score: 65, articles: 3 },
  { day: "Thu", score: 84, articles: 8 },
  { day: "Fri", score: 88, articles: 5 },
  { day: "Sat", score: 91, articles: 7 },
  { day: "Sun", score: 86, articles: 9 },
];

const credibilityData = [
  { name: "High", value: 45, color: "#22C55E" },
  { name: "Medium", value: 32, color: "#F59E0B" },
  { name: "Low", value: 23, color: "#EF4444" },
];

const classData = [
  { name: "Amara O.", score: 94, lessons: 18, streak: 12 },
  { name: "Kwame D.", score: 88, lessons: 15, streak: 7 },
  { name: "Zara M.", score: 82, lessons: 14, streak: 5 },
  { name: "Ethan R.", score: 76, lessons: 11, streak: 3 },
  { name: "Priya S.", score: 71, lessons: 9, streak: 8 },
  { name: "Leo F.", score: 65, lessons: 8, streak: 2 },
];

const leaderboard = [
  { rank: 1, name: "Amara O.", xp: 4820, avatar: "AO", badge: "🥇" },
  { rank: 2, name: "Kwame D.", xp: 4210, avatar: "KD", badge: "🥈" },
  { rank: 3, name: "Zara M.", xp: 3950, avatar: "ZM", badge: "🥉" },
  { rank: 4, name: "You", xp: 3640, avatar: "ME", badge: "⭐", isMe: true },
  { rank: 5, name: "Ethan R.", xp: 3120, avatar: "ER", badge: "" },
];

const quizQuestions = [
  {
    id: 1,
    question: "A news article claims that eating chocolate daily prevents all diseases. Which red flag is most apparent?",
    options: [
      "The article has a catchy headline",
      "The claim is absolute with no scientific citations",
      "The article mentions chocolate brands",
      "The writing style is casual"
    ],
    correct: 1,
    explanation: "Absolute health claims without peer-reviewed citations are a major red flag for misinformation. Credible medical claims always reference specific studies and acknowledge limitations."
  },
  {
    id: 2,
    question: "Which domain extension typically indicates the most reliable government information source?",
    options: [".com", ".org", ".gov", ".net"],
    correct: 2,
    explanation: "The .gov domain is reserved for official government entities. While not a guarantee of accuracy, it indicates an officially authorized government source with accountability structures."
  },
  {
    id: 3,
    question: "You see a viral photo claiming to show a recent disaster. What should you do first?",
    options: [
      "Share it immediately to spread awareness",
      "Reverse image search to check its origin and date",
      "Check the number of likes and shares",
      "Look at the profile picture of who posted it"
    ],
    correct: 1,
    explanation: "Reverse image search (Google Images, TinEye) reveals if an image has been used before, potentially in a different context. This is a foundational fact-checking technique."
  }
];

const modules = [
  { id: 1, title: "Spot Fake News", icon: "🎯", color: "#2563EB", xp: 150, progress: 100, lessons: 8, completed: true },
  { id: 2, title: "Understanding Bias", icon: "⚖️", color: "#14B8A6", xp: 200, progress: 65, lessons: 10, completed: false },
  { id: 3, title: "Source Verification", icon: "🔍", color: "#8B5CF6", xp: 175, progress: 40, lessons: 9, completed: false },
  { id: 4, title: "Deepfake Awareness", icon: "🎭", color: "#F59E0B", xp: 225, progress: 20, lessons: 12, completed: false },
  { id: 5, title: "Social Media Literacy", icon: "📱", color: "#22C55E", xp: 180, progress: 0, lessons: 8, completed: false },
  { id: 6, title: "Digital Citizenship", icon: "🌐", color: "#EF4444", xp: 250, progress: 0, lessons: 14, completed: false },
];

const badges = [
  { icon: "🏅", name: "First Analysis", earned: true },
  { icon: "🔥", name: "7-Day Streak", earned: true },
  { icon: "🎓", name: "Module 1 Complete", earned: true },
  { icon: "🕵️", name: "Fact Checker", earned: true },
  { icon: "🛡️", name: "Truth Guardian", earned: false },
  { icon: "⚡", name: "Speed Reader", earned: false },
  { icon: "🌟", name: "Top 10%", earned: false },
  { icon: "🧠", name: "Critical Thinker", earned: false },
];

// ─── Color constants ─────────────────────────────────────────────────────────
const BLUE = "#2563EB";
const TEAL = "#14B8A6";
const AMBER = "#F59E0B";
const GREEN = "#22C55E";
const PURPLE = "#8B5CF6";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function ScoreMeter({ score, size = 120 }: { score: number; size?: number }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const arc = (score / 100) * circ * 0.75;
  const color = score >= 70 ? GREEN : score >= 45 ? AMBER : "#EF4444";
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: "rotate(135deg)" }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="#E2E8F0" strokeWidth="10" strokeDasharray={`${circ * 0.75} ${circ * 0.25}`} strokeLinecap="round" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10" strokeDasharray={`${arc} ${circ - arc}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingTop: 8 }}>
        <span className="font-bold text-xl" style={{ color, fontFamily: "DM Mono, monospace", lineHeight: 1 }}>{score}</span>
        <span className="text-xs text-slate-400 font-medium">/100</span>
      </div>
    </div>
  );
}

function Chip({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ color, backgroundColor: bg }}>
      {label}
    </span>
  );
}

function StatCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-start gap-4">
      <div className="rounded-xl p-2.5 flex-shrink-0" style={{ backgroundColor: color + "15" }}>
        <div style={{ color }}>{icon}</div>
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-900" style={{ fontFamily: "DM Mono, monospace" }}>{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function iconFromName(name: string) {
  switch (name) {
    case "Target": return Target;
    case "TrendingUp": return TrendingUp;
    case "Shield": return Shield;
    case "Eye": return Eye;
    case "Users": return Users;
    case "Lightbulb": return Lightbulb;
    case "BookOpen": return BookOpen;
    case "Award": return Award;
    case "Flame": return Flame;
    case "Trophy": return Trophy;
    case "Zap": return Zap;
    case "Star": return Star;
    case "Crown": return Trophy;
    case "Heart": return Star;
    case "Rocket": return Zap;
    case "Play": return Play;
    case "Lock": return Lock;
    case "CheckCircle": return CheckCircle;
    default: return Award;
  }
}

// ─── Nav items ────────────────────────────────────────────────────────────────
const navItems: { icon: React.ReactNode; label: string; screen: Screen }[] = [
  { icon: <Home size={18} />, label: "Home", screen: "dashboard" },
  { icon: <Search size={18} />, label: "Analyze", screen: "analyzer" },
  { icon: <Shield size={18} />, label: "Deepfake", screen: "deepfake" },
  { icon: <BookOpen size={18} />, label: "Learning Hub", screen: "learning" },
  { icon: <Trophy size={18} />, label: "Challenges", screen: "quiz" },
  { icon: <User size={18} />, label: "Profile", screen: "profile" },
  { icon: <GraduationCap size={18} />, label: "Teacher View", screen: "teacher" },
  { icon: <Smartphone size={18} />, label: "Mobile View", screen: "mobile" },
  { icon: <Settings size={18} />, label: "Settings", screen: "dashboard" },
];

// ══════════════════════════════════════════════════════════════════════════════
// LANDING PAGE
// ══════════════════════════════════════════════════════════════════════════════
function LandingPage({ onEnter, bootstrap }: { onEnter: () => void; bootstrap: AppBootstrap | null }) {
  const [mobileMenu, setMobileMenu] = useState(false);

  const features = [
    { icon: <Search size={22} />, title: "Content Analyzer", desc: "Paste any URL or text. Get instant credibility scores, bias indicators, and source reliability ratings.", color: BLUE },
    { icon: <Shield size={22} />, title: "Deepfake Detector", desc: "Upload images, videos, or audio clips. Our AI detects facial inconsistencies, audio anomalies, and metadata tampering.", color: TEAL },
    { icon: <BookOpen size={22} />, title: "Learning Hub", desc: "Gamified lessons, quizzes, and challenges that build media literacy skills through interactive experiences.", color: PURPLE },
    { icon: <Brain size={22} />, title: "AI Explanations", desc: "Every result comes with clear, jargon-free explanations so you learn while you verify.", color: AMBER },
    { icon: <Trophy size={22} />, title: "Leaderboards & XP", desc: "Earn points, unlock badges, and compete with classmates to become a certified Truth Guardian.", color: GREEN },
    { icon: <GraduationCap size={22} />, title: "Teacher Dashboard", desc: "Assign challenges, track student progress, and measure class-wide media literacy growth in real time.", color: "#EF4444" },
  ];

  const stats = bootstrap?.landing?.stats ?? [
    { value: "2.4M+", label: "Articles Analyzed" },
    { value: "98K+", label: "Active Students" },
    { value: "340+", label: "Schools Using TruthQuest" },
    { value: "89%", label: "Accuracy Rate" },
  ];

  const testimonials = bootstrap?.landing?.testimonials ?? [
    { name: "Ms. Adaeze Nwosu", role: "Media Studies Teacher, Lagos", content: "TruthQuest changed how my students engage with social media. They now naturally question sources before sharing anything.", avatar: "AN" },
    { name: "Kwame Asante", role: "University Student, Accra", content: "I caught three misinformation posts in my WhatsApp group within a week of using TruthQuest. The deepfake detector is mind-blowing.", avatar: "KA" },
    { name: "Dr. Fatima Al-Hassan", role: "Digital Literacy Researcher", content: "The most complete media literacy platform I have reviewed. The gamification keeps students genuinely engaged.", avatar: "FA" },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${BLUE}, ${TEAL})` }}>
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">TruthQuest <span style={{ color: BLUE }}>AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#how" className="hover:text-blue-600 transition-colors">How It Works</a>
            <a href="#stats" className="hover:text-blue-600 transition-colors">Impact</a>
            <a href="#testimonials" className="hover:text-blue-600 transition-colors">Stories</a>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={onEnter} className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors px-4 py-2">Log in</button>
            <button onClick={onEnter} className="text-sm font-semibold text-white px-4 py-2 rounded-lg transition-all hover:opacity-90 shadow-sm" style={{ background: `linear-gradient(135deg, ${BLUE}, #1d4ed8)` }}>
              Get Started Free
            </button>
          </div>
          <button className="md:hidden" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t border-slate-100 bg-white px-6 py-4 flex flex-col gap-4">
            <a href="#features" className="text-sm font-medium text-slate-700">Features</a>
            <a href="#how" className="text-sm font-medium text-slate-700">How It Works</a>
            <button onClick={onEnter} className="text-sm font-semibold text-white px-4 py-2.5 rounded-lg w-full" style={{ background: BLUE }}>Get Started Free</button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-[0.06]" style={{ background: `radial-gradient(circle, ${BLUE}, transparent)` }} />
          <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full opacity-[0.06]" style={{ background: `radial-gradient(circle, ${TEAL}, transparent)` }} />
        </div>
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-100 bg-blue-50 mb-6">
              <Sparkles size={14} style={{ color: BLUE }} />
              <span className="text-xs font-semibold" style={{ color: BLUE }}>AI-Powered Media Literacy</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-[1.08] tracking-tight mb-6">
              Navigate<br />
              <span style={{ background: `linear-gradient(135deg, ${BLUE}, ${TEAL})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Information
              </span><br />
              with Confidence.
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed mb-8 max-w-md">
              AI-powered media literacy for the next generation. Learn to detect misinformation, verify sources, and think critically.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <button onClick={onEnter} className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5" style={{ background: `linear-gradient(135deg, ${BLUE}, #1d4ed8)` }}>
                <Search size={18} />
                Analyze Content
              </button>
              <button onClick={onEnter} className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all hover:-translate-y-0.5 border border-slate-200 text-slate-700 bg-white hover:border-blue-200 hover:text-blue-700">
                <Play size={18} />
                Start Learning
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {["AO","KD","ZM","ER"].map(a => (
                  <div key={a} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white" style={{ background: `linear-gradient(135deg, ${BLUE}, ${TEAL})` }}>{a}</div>
                ))}
              </div>
              <p className="text-sm text-slate-500"><span className="font-semibold text-slate-700">98,000+</span> students already verifying smarter</p>
            </div>
          </div>

          {/* Hero illustration */}
          <div className="relative">
            <div className="bg-white rounded-3xl shadow-2xl p-6 border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: BLUE + "15" }}>
                    <Shield size={16} style={{ color: BLUE }} />
                  </div>
                  <span className="font-semibold text-slate-800 text-sm">Content Analysis</span>
                </div>
                <Chip label="AI Verified" color={GREEN} bg={GREEN + "15"} />
              </div>
              <div className="bg-slate-50 rounded-xl p-3 mb-4 text-xs font-mono text-slate-500 border border-slate-100">
                https://example-news.com/viral-story-2024
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: "Credibility", value: "87/100", color: GREEN },
                  { label: "Bias Level", value: "Low", color: TEAL },
                  { label: "Emotional Tone", value: "Neutral", color: BLUE },
                  { label: "Source Trust", value: "High", color: GREEN },
                ].map(m => (
                  <div key={m.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-xs text-slate-400 mb-1">{m.label}</p>
                    <p className="font-bold text-sm" style={{ color: m.color, fontFamily: "DM Mono, monospace" }}>{m.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                <div className="flex items-start gap-2">
                  <Brain size={14} style={{ color: BLUE }} className="mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700 leading-relaxed">This article cites verified government data. The author has an established track record. Cross-reference with 2 additional sources for full confidence.</p>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-lg px-3 py-2 border border-slate-100 flex items-center gap-2">
              <span className="text-lg">🔥</span>
              <div>
                <p className="text-[10px] text-slate-400">Current Streak</p>
                <p className="text-sm font-bold text-slate-800">14 Days</p>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-lg px-3 py-2 border border-slate-100 flex items-center gap-2">
              <span className="text-lg">🏅</span>
              <div>
                <p className="text-[10px] text-slate-400">XP Earned</p>
                <p className="text-sm font-bold text-slate-800">3,640 XP</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center pb-6 flex items-center justify-center gap-2 text-sm text-slate-400 font-medium">
          <span>Think Before You Share.</span>
          <ChevronDown size={16} />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-slate-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: BLUE }}>Everything You Need</p>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Built for the age of AI misinformation</h2>
            <p className="text-lg text-slate-500 mt-4 max-w-xl mx-auto">Six powerful tools that work together to make you a confident, critical consumer of information.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110" style={{ backgroundColor: f.color + "15" }}>
                  <div style={{ color: f.color }}>{f.icon}</div>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: TEAL }}>Simple Process</p>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">From skeptic to certified fact-checker in minutes</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6 relative">
            {[
              { step: "01", title: "Paste or Upload", desc: "Drop in any URL, text, image, video or audio you want to verify.", icon: <Upload size={20} /> },
              { step: "02", title: "AI Analysis", desc: "Our models analyze credibility, bias, emotion, and source history instantly.", icon: <Brain size={20} /> },
              { step: "03", title: "Get Insights", desc: "Receive a clear score, plain-English explanation, and recommended next steps.", icon: <Layers size={20} /> },
              { step: "04", title: "Learn & Level Up", desc: "Every analysis is a lesson. Earn XP, unlock badges, and track your growth.", icon: <Trophy size={20} /> },
            ].map((s, i) => (
              <div key={s.step} className="relative">
                {i < 3 && <div className="hidden md:block absolute top-8 left-full w-full h-px z-0" style={{ background: `linear-gradient(90deg, ${BLUE}40, transparent)` }} />}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 relative z-10">
                  <div className="text-xs font-bold mb-3" style={{ color: BLUE, fontFamily: "DM Mono, monospace" }}>{s.step}</div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `linear-gradient(135deg, ${BLUE}, ${TEAL})` }}>
                    <div className="text-white">{s.icon}</div>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" style={{ background: `linear-gradient(135deg, ${BLUE}, #1e40af)` }} className="py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-3">Making real impact in schools worldwide</h2>
          <p className="text-blue-200 mb-14">Numbers that prove media literacy education works.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(s => (
              <div key={s.label}>
                <p className="text-4xl font-extrabold text-white mb-2" style={{ fontFamily: "DM Mono, monospace" }}>{s.value}</p>
                <p className="text-blue-200 text-sm font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: AMBER }}>Real Stories</p>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Trusted by students and educators</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={AMBER} color={AMBER} />)}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-6">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: `linear-gradient(135deg, ${BLUE}, ${TEAL})` }}>{t.avatar}</div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{t.name}</p>
                    <p className="text-slate-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="bg-white rounded-3xl p-12 shadow-xl border border-slate-100">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: `linear-gradient(135deg, ${BLUE}, ${TEAL})` }}>
              <Shield size={28} className="text-white" />
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Start your media literacy journey today</h2>
            <p className="text-slate-500 mb-8 text-lg">Free for students. Powerful for schools. Essential for the internet age.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button onClick={onEnter} className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5" style={{ background: `linear-gradient(135deg, ${BLUE}, #1d4ed8)` }}>
                <Zap size={18} /> Get Started Free
              </button>
              <button onClick={onEnter} className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold border border-slate-200 text-slate-700 bg-white hover:border-blue-200 transition-all">
                <GraduationCap size={18} /> For Schools
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${BLUE}, ${TEAL})` }}>
              <Shield size={14} className="text-white" />
            </div>
            <span className="font-bold text-white text-sm">TruthQuest AI</span>
          </div>
          <p className="text-sm">© 2025 TruthQuest AI. Think Before You Share.</p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARD LAYOUT
// ══════════════════════════════════════════════════════════════════════════════
function AppShell({ screen, setScreen, children }: { screen: Screen; setScreen: (s: Screen) => void; children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Sidebar */}
      <aside className={cn(
        "flex-shrink-0 bg-white border-r border-slate-100 flex flex-col transition-all duration-300 z-20",
        sidebarOpen ? "w-56" : "w-16"
      )}>
        <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${BLUE}, ${TEAL})` }}>
            <Shield size={16} className="text-white" />
          </div>
          {sidebarOpen && <span className="font-bold text-slate-900 text-sm tracking-tight whitespace-nowrap">TruthQuest <span style={{ color: BLUE }}>AI</span></span>}
        </div>

        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.label}
              onClick={() => setScreen(item.screen)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                screen === item.screen
                  ? "text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
              style={screen === item.screen ? { background: `linear-gradient(135deg, ${BLUE}, #1d4ed8)` } : {}}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="whitespace-nowrap truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-100">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold">JD</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">Jordan Davis</p>
                <p className="text-[10px] text-slate-400">Level 7 · 3,640 XP</p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold mx-auto">JD</div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500">
              <Menu size={18} />
            </button>
            <div className="relative hidden sm:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="pl-8 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:border-transparent" style={{ "--tw-ring-color": BLUE } as React.CSSProperties} placeholder="Search articles, topics..." />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: AMBER }} />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-slate-100">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100">
                <Flame size={14} style={{ color: AMBER }} />
                <span className="text-xs font-bold" style={{ color: AMBER }}>14</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100">
                <Zap size={14} style={{ color: BLUE }} />
                <span className="text-xs font-bold" style={{ color: BLUE }}>3,640 XP</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARD HOME
// ══════════════════════════════════════════════════════════════════════════════
function Dashboard({ setScreen, bootstrap }: { setScreen: (s: Screen) => void; bootstrap: AppBootstrap | null }) {
  const recentAnalyses = bootstrap?.dashboard?.recentAnalyses ?? [
    { title: "Government unveils new AI policy draft", source: "techpolicy.gov", score: 91, bias: "Low", time: "2h ago", tag: "Politics" },
    { title: "Miracle berry cures diabetes, doctors hate this", source: "healthhacks.net", score: 22, bias: "High", time: "5h ago", tag: "Health" },
    { title: "Youth unemployment hits 5-year low in Q3", source: "reuters.com", score: 87, bias: "Low", time: "1d ago", tag: "Economy" },
    { title: "Celebrity endorses questionable crypto scheme", source: "cryptonews24.co", score: 38, bias: "High", time: "2d ago", tag: "Finance" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Good morning, Jordan 👋</h1>
          <p className="text-slate-500 text-sm mt-0.5">You have analyzed <span className="font-semibold text-slate-700">47 articles</span> this month. Keep it up!</p>
        </div>
        <button onClick={() => setScreen("analyzer")} className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90" style={{ background: `linear-gradient(135deg, ${BLUE}, #1d4ed8)` }}>
          <Search size={16} /> Analyze Content
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Target size={20} />} label="Literacy Score" value="84" sub="↑ 6 points this week" color={BLUE} />
        <StatCard icon={<Flame size={20} />} label="Day Streak" value="14" sub="Best: 21 days" color={AMBER} />
        <StatCard icon={<Search size={20} />} label="Analyses Done" value="47" sub="This month" color={TEAL} />
        <StatCard icon={<Trophy size={20} />} label="Badges Earned" value="4/8" sub="4 more to unlock" color={PURPLE} />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Score trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Credibility Score Trend</h3>
            <Chip label="This Week" color={BLUE} bg={BLUE + "12"} />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={weeklyData}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={BLUE} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Line type="monotone" dataKey="score" stroke={BLUE} strokeWidth={2.5} dot={{ fill: BLUE, strokeWidth: 0, r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Credibility breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">Content Quality Breakdown</h3>
          <div className="flex items-center justify-center mb-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={credibilityData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                  {credibilityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {credibilityData.map(d => (
            <div key={d.name} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                <span className="text-sm text-slate-600">{d.name} Credibility</span>
              </div>
              <span className="text-sm font-bold text-slate-800" style={{ fontFamily: "DM Mono, monospace" }}>{d.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent analyses + learning progress */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Recent Analyses</h3>
            <button onClick={() => setScreen("analyzer")} className="text-xs font-semibold" style={{ color: BLUE }}>View all →</button>
          </div>
          <div className="divide-y divide-slate-50">
            {recentAnalyses.map(a => (
              <div key={a.title} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                <ScoreMeter score={a.score} size={56} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{a.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Globe size={11} className="text-slate-400" />
                    <span className="text-xs text-slate-400">{a.source}</span>
                    <span className="text-xs text-slate-300">·</span>
                    <span className="text-xs text-slate-400">{a.time}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Chip label={a.tag} color={BLUE} bg={BLUE + "10"} />
                  <Chip label={`Bias: ${a.bias}`} color={a.bias === "Low" ? GREEN : "#EF4444"} bg={(a.bias === "Low" ? GREEN : "#EF4444") + "12"} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning progress */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Learning Progress</h3>
            <button onClick={() => setScreen("learning")} className="text-xs font-semibold" style={{ color: BLUE }}>Hub →</button>
          </div>
          <div className="p-4 space-y-4">
            {modules.slice(0, 4).map(m => (
              <div key={m.id} className="flex items-center gap-3">
                <div className="text-lg flex-shrink-0">{m.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-slate-700 truncate">{m.title}</p>
                    <span className="text-xs font-bold ml-2" style={{ color: m.progress === 100 ? GREEN : BLUE, fontFamily: "DM Mono, monospace" }}>{m.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${m.progress}%`, background: m.progress === 100 ? GREEN : `linear-gradient(90deg, ${BLUE}, ${TEAL})` }} />
                  </div>
                </div>
                {m.completed && <CheckCircle size={14} style={{ color: GREEN }} className="flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CONTENT ANALYZER
// ══════════════════════════════════════════════════════════════════════════════
function ContentAnalyzer() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"url" | "text" | "image">("url");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | "done">(null);
  const [analysis, setAnalysis] = useState<ContentAnalysisResponse | null>(null);

  const analyze = async () => {
    setLoading(true);
    try {
      const response = await analyzeContent({ mode, input });
      setAnalysis(response);
      setResult("done");
    } catch {
      setAnalysis(null);
      setResult("done");
    } finally {
      setLoading(false);
    }
  };

  const score = analysis?.score ?? 85;
  const metrics = analysis?.metrics ?? [
    { label: "Bias Indicator", value: "Low Bias", sub: "Minimal political lean detected" },
    { label: "Emotional Manipulation", value: "Medium", sub: "Some emotionally charged language" },
    { label: "Source Reliability", value: "High", sub: "Publisher has verified track record" },
    { label: "Fact Accuracy", value: "91%", sub: "Claims cross-reference verified data" },
  ];
  const recommendations = analysis?.recommendations ?? [
    { text: "Verify with 1–2 additional independent sources", done: false },
    { text: "Review author credentials and publication history", done: true },
    { text: "Check original government data source linked in article", done: false },
    { text: "Note article publication date: May 2025", done: true },
  ];
  const chips = analysis?.chips ?? ["✓ High Source Trust", "⚡ Low Bias", "⚠ Medium Emotion"];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Content Analyzer</h1>
        <p className="text-slate-500 text-sm mt-1">Paste a URL, text, or upload an image to get an instant credibility report.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        {/* Mode tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-5 w-fit">
          {([["url", <Link size={14} />, "URL"], ["text", <FileText size={14} />, "Text"], ["image", <Image size={14} />, "Image"]] as const).map(([m, icon, label]) => (
            <button
              key={m}
              onClick={() => { setMode(m as "url" | "text" | "image"); setResult(null); }}
              className={cn("flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all", mode === m ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {mode !== "image" ? (
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={mode === "url" ? "Paste article URL — e.g. https://example.com/article" : "Paste social media post, article text, or any content to analyze…"}
            className="w-full h-36 resize-none bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:border-transparent placeholder-slate-400"
            style={{ "--tw-ring-color": BLUE } as React.CSSProperties}
          />
        ) : (
          <div className="h-36 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-300 transition-colors cursor-pointer">
            <Upload size={24} className="text-slate-400" />
            <p className="text-sm text-slate-500">Drop image here or <span className="font-semibold" style={{ color: BLUE }}>browse</span></p>
            <p className="text-xs text-slate-400">PNG, JPG, WEBP up to 10MB</p>
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-slate-400">Analysis takes 2–5 seconds · Results are AI-generated insights</p>
          <button
            onClick={analyze}
            disabled={loading || (!input && mode !== "image")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${BLUE}, #1d4ed8)` }}
          >
            {loading ? <RefreshCw size={15} className="animate-spin" /> : <Search size={15} />}
            {loading ? "Analyzing…" : "Analyze Content"}
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center animate-pulse" style={{ background: `linear-gradient(135deg, ${BLUE}20, ${TEAL}20)` }}>
            <Brain size={28} style={{ color: BLUE }} />
          </div>
          <p className="font-semibold text-slate-700">AI is analyzing your content…</p>
          <div className="w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full animate-pulse" style={{ width: "60%", background: `linear-gradient(90deg, ${BLUE}, ${TEAL})` }} />
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {["Checking sources", "Analyzing tone", "Detecting bias", "Verifying claims"].map(s => (
              <div key={s} className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-full text-xs text-blue-600 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {result === "done" && !loading && (
        <div className="space-y-4">
          {/* Score row */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex flex-wrap items-center gap-6">
              <ScoreMeter score={score} size={110} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-slate-900 text-lg">Credibility Score: {score}/100</h3>
                  <CheckCircle size={18} style={{ color: GREEN }} />
                </div>
                {(analysis?.sourceUrl || analysis?.sourceTitle) && (
                  <p className="text-xs text-slate-400 mb-2 break-all">
                    {analysis?.sourceTitle ? `${analysis.sourceTitle} · ` : ""}
                    {analysis?.sourceUrl}
                  </p>
                )}
                <p className="text-sm text-slate-600 mb-4">{analysis?.summary ?? "This content shows strong source credibility with minor areas for verification. The information aligns with verified reporting from established outlets."}</p>
                <div className="flex flex-wrap gap-2">
                  {chips.map((chip) => (
                    <Chip
                      key={chip}
                      label={chip}
                      color={chip.includes("Bias") ? TEAL : chip.includes("Emotion") ? AMBER : GREEN}
                      bg={(chip.includes("Bias") ? TEAL : chip.includes("Emotion") ? AMBER : GREEN) + "15"}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Metrics grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((m, index) => {
              const icon = index === 0 ? <AlertTriangle size={18} /> : index === 1 ? <Brain size={18} /> : index === 2 ? <Shield size={18} /> : <CheckCircle size={18} />;
              const color = index === 0 ? TEAL : index === 1 ? AMBER : index === 2 ? GREEN : BLUE;
              return (
              <div key={m.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color + "15" }}>
                    <div style={{ color }}>{icon}</div>
                  </div>
                  <span className="text-xs font-medium text-slate-500">{m.label}</span>
                </div>
                <p className="font-bold text-slate-900 text-lg" style={{ fontFamily: "DM Mono, monospace" }}>{m.value}</p>
                <p className="text-xs text-slate-400 mt-1">{m.sub}</p>
              </div>
              );
            })}
          </div>

          {/* AI summary + recommendations */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} style={{ color: BLUE }} />
                <h4 className="font-bold text-blue-900 text-sm">AI Summary</h4>
              </div>
                <p className="text-sm text-blue-800 leading-relaxed">{analysis?.summary ?? "This article reports on government economic data published by a verified ministry source. The author, Dr. Emeka Osei, is a senior economics correspondent with a 12-year track record at established outlets. The headline accurately reflects the statistical findings without sensationalization. One minor concern: a quoted \"expert\" is not independently verifiable."}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Target size={16} style={{ color: AMBER }} />
                <h4 className="font-bold text-slate-900 text-sm">Recommendations</h4>
              </div>
              <ul className="space-y-2.5">
                {recommendations.map(r => (
                  <li key={r.text} className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: r.done ? GREEN + "20" : "#FEF3C7", border: `1px solid ${r.done ? GREEN : AMBER}` }}>
                      {r.done ? <CheckCircle size={10} style={{ color: GREEN }} /> : <AlertCircle size={10} style={{ color: AMBER }} />}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{r.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* XP earned */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-100 rounded-xl px-5 py-3">
            <span className="text-xl">🎉</span>
            <div>
              <p className="font-semibold text-slate-800 text-sm">Great analysis! You earned <span style={{ color: BLUE }}>+{analysis?.xpEarned ?? 25} XP</span></p>
              <p className="text-xs text-slate-500">Share responsibly — tap the share button to post your findings.</p>
            </div>
            <button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: BLUE }}>
              <Share2 size={12} /> Share
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DEEPFAKE DETECTOR
// ══════════════════════════════════════════════════════════════════════════════
function DeepfakeDetector() {
  const [mediaType, setMediaType] = useState<"image" | "video" | "audio">("image");
  const [analyzing, setAnalyzing] = useState(false);
  const [done, setDone] = useState(false);
  const [analysis, setAnalysis] = useState<DeepfakeAnalysisResponse | null>(null);

  const run = async () => {
    setAnalyzing(true);
    try {
      const response = await analyzeDeepfake({ mediaType });
      setAnalysis(response);
      setDone(true);
    } catch {
      setAnalysis(null);
      setDone(true);
    } finally {
      setAnalyzing(false);
    }
  };

  const indicators = analysis?.indicators ?? [
    { label: "Facial Inconsistencies", value: 72, risk: "Medium", color: AMBER },
    { label: "Lighting Artifacts", value: 85, risk: "High", color: "#EF4444" },
    { label: "Blinking Pattern", value: 40, risk: "Low", color: GREEN },
    { label: "Audio Sync Match", value: 88, risk: "High", color: "#EF4444" },
    { label: "Metadata Integrity", value: 30, risk: "Low", color: GREEN },
    { label: "AI Generation Probability", value: 78, risk: "High", color: "#EF4444" },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Deepfake Detector</h1>
        <p className="text-slate-500 text-sm mt-1">Upload media to detect AI-generated or manipulated content using multi-modal analysis.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        {/* Type selector */}
        <div className="flex gap-3 mb-6">
          {([["image", <Image size={16} />, "Image"], ["video", <Video size={16} />, "Video"], ["audio", <Mic size={16} />, "Audio"]] as const).map(([t, icon, label]) => (
            <button
              key={t}
              onClick={() => { setMediaType(t as "image" | "video" | "audio"); setDone(false); }}
              className={cn("flex items-center gap-2 flex-1 justify-center py-3 rounded-xl border-2 font-semibold text-sm transition-all", mediaType === t ? "text-white border-transparent shadow-sm" : "border-slate-200 text-slate-600 hover:border-slate-300")}
              style={mediaType === t ? { background: `linear-gradient(135deg, ${BLUE}, ${TEAL})`, borderColor: "transparent" } : {}}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Upload zone */}
        <div className="h-52 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-blue-300 transition-colors cursor-pointer group">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: `linear-gradient(135deg, ${BLUE}15, ${TEAL}15)` }}>
            <Upload size={24} style={{ color: BLUE }} />
          </div>
          <div className="text-center">
            <p className="font-semibold text-slate-700 text-sm">Drop {mediaType} here or <span style={{ color: BLUE }}>browse files</span></p>
            <p className="text-xs text-slate-400 mt-1">
              {mediaType === "image" && "PNG, JPG, WEBP up to 20MB"}
              {mediaType === "video" && "MP4, MOV, AVI up to 500MB"}
              {mediaType === "audio" && "MP3, WAV, M4A up to 50MB"}
            </p>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button onClick={run} disabled={analyzing} className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50" style={{ background: `linear-gradient(135deg, ${BLUE}, #1d4ed8)` }}>
            {analyzing ? <><RefreshCw size={15} className="animate-spin" /> Analyzing…</> : <><Eye size={15} /> Detect Deepfake</>}
          </button>
        </div>
      </div>

      {/* Results */}
      {done && !analyzing && (
        <div className="space-y-4">
          {/* Main verdict */}
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
            <div className="flex flex-wrap items-center gap-6">
              <div className="relative">
                <ScoreMeter score={analysis?.score ?? 78} size={110} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={20} style={{ color: "#EF4444" }} />
                  <h3 className="font-bold text-slate-900 text-lg">{analysis?.verdict ?? "Likely AI-Generated or Manipulated"}</h3>
                </div>
                <p className="text-sm text-slate-600 mb-4">{analysis?.summary ?? `This ${mediaType} shows significant indicators of synthetic manipulation. Multiple high-confidence signals detected. Exercise extreme caution before sharing this content.`}</p>
                <div className="flex flex-wrap gap-2">
                  <Chip label={analysis?.probabilityLabel ?? "78% AI Probability"} color="#EF4444" bg="#FEF2F2" />
                  <Chip label="High Risk" color="#EF4444" bg="#FEF2F2" />
                  <Chip label="Do Not Share" color={AMBER} bg={AMBER + "15"} />
                </div>
              </div>
            </div>
          </div>

          {/* Detection indicators */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-5">Detection Indicators</h3>
            <div className="space-y-4">
              {indicators.map(ind => (
                <div key={ind.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-slate-700">{ind.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold" style={{ color: ind.color, fontFamily: "DM Mono, monospace" }}>{ind.value}%</span>
                      <Chip label={ind.risk} color={ind.color} bg={ind.color + "15"} />
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${ind.value}%`, background: ind.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Metadata & AI explanation */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2"><Hash size={14} style={{ color: TEAL }} /> Metadata Findings</h4>
              <div className="space-y-2 text-xs font-mono text-slate-600">
                {(analysis?.metadata ?? [
                  { label: "Creation Date", value: "Modified 2025-11-03" },
                  { label: "Camera Model", value: "None detected" },
                  { label: "GPS Data", value: "Stripped" },
                  { label: "Software", value: "Adobe Firefly 3.1" },
                  { label: "Color Profile", value: "sRGB (synthetic)" },
                ]).map((item) => (
                  <div key={item.label} className="flex justify-between"><span className="text-slate-400">{item.label}:</span><span>{item.value}</span></div>
                ))}
              </div>
            </div>
            <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
              <h4 className="font-bold text-red-900 text-sm mb-3 flex items-center gap-2"><Sparkles size={14} style={{ color: "#EF4444" }} /> AI Analysis</h4>
              <p className="text-xs text-red-800 leading-relaxed">{analysis?.aiSummary ?? "Strong GAN fingerprints detected in the frequency domain. The Adobe Firefly metadata signature and stripped GPS data are typical of AI-generated synthetic media distributed without geographic attribution. The lighting consistency score of 85% suggests post-synthesis compositing. Do not share without verification."}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LEARNING HUB
// ══════════════════════════════════════════════════════════════════════════════
function LearningHub({ setScreen, bootstrap }: { setScreen: (s: Screen) => void; bootstrap: AppBootstrap | null }) {
  const [view, setView] = useState<"modules" | "leaderboard">("modules");
  const courses = bootstrap?.learning?.modules
    ? bootstrap.learning.modules.map((module) => ({ ...module, icon: iconFromName(module.icon) }))
    : modules.map((module) => ({ ...module, icon: module.icon }));
  const leaderboardData = bootstrap?.learning?.leaderboard ?? leaderboard;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Learning Hub</h1>
          <p className="text-slate-500 text-sm mt-1">Complete modules, earn XP, and become a certified media literacy expert.</p>
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {[["modules", "Modules"], ["leaderboard", "Leaderboard"]].map(([v, label]) => (
            <button key={v} onClick={() => setView(v as "modules" | "leaderboard")} className={cn("px-4 py-2 rounded-lg text-sm font-semibold transition-all", view === v ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}>{label}</button>
          ))}
        </div>
      </div>

      {/* XP banner */}
      <div className="rounded-2xl p-5 flex items-center gap-4 flex-wrap" style={{ background: `linear-gradient(135deg, ${BLUE}, ${TEAL})` }}>
        <div className="text-4xl">🎓</div>
        <div className="flex-1">
          <p className="text-white font-bold text-lg">Level 7 — Media Sentinel</p>
          <p className="text-blue-100 text-sm">360 XP to next level (Level 8 — Truth Guardian)</p>
          <div className="mt-2 h-2 bg-white/20 rounded-full w-full max-w-xs overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: "64%" }} />
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-extrabold text-white" style={{ fontFamily: "DM Mono, monospace" }}>3,640</p>
          <p className="text-blue-200 text-sm">Total XP</p>
        </div>
      </div>

      {view === "modules" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map(m => (
            <div key={m.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group cursor-pointer" onClick={() => setScreen("quiz")}>
              <div className="h-2" style={{ background: m.completed ? GREEN : m.progress > 0 ? `linear-gradient(90deg, ${BLUE}, ${TEAL})` : "#E2E8F0" }} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{m.icon}</div>
                  {m.completed
                    ? <Chip label="✓ Complete" color={GREEN} bg={GREEN + "15"} />
                    : m.progress > 0
                    ? <Chip label="In Progress" color={BLUE} bg={BLUE + "12"} />
                    : <Chip label="Locked" color="#94A3B8" bg="#F1F5F9" />
                  }
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{m.title}</h3>
                <p className="text-xs text-slate-400 mb-4">{m.lessons} lessons · +{m.xp} XP</p>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                  <div className="h-full rounded-full" style={{ width: `${m.progress}%`, background: m.completed ? GREEN : `linear-gradient(90deg, ${BLUE}, ${TEAL})` }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{m.progress}% complete</span>
                  <button className="text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: m.completed ? GREEN : BLUE }}>
                    {m.completed ? "Review" : m.progress > 0 ? "Continue" : "Start"} <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Weekly Leaderboard</h3>
            <p className="text-xs text-slate-400">Resets every Monday</p>
          </div>
          {leaderboardData.map(entry => (
            <div key={entry.rank} className={cn("flex items-center gap-4 px-6 py-4 border-b border-slate-50", entry.isMe ? "bg-blue-50" : "hover:bg-slate-50")}>
              <span className="text-lg w-8 text-center">{entry.badge || `#${entry.rank}`}</span>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: entry.isMe ? `linear-gradient(135deg, ${BLUE}, ${TEAL})` : "#94A3B8" }}>{entry.avatar}</div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900 text-sm">{entry.name} {entry.isMe && <span className="text-xs font-normal" style={{ color: BLUE }}>(you)</span>}</p>
                <p className="text-xs text-slate-400" style={{ fontFamily: "DM Mono, monospace" }}>{entry.xp.toLocaleString()} XP</p>
              </div>
              <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(entry.xp / 4820) * 100}%`, background: entry.isMe ? `linear-gradient(90deg, ${BLUE}, ${TEAL})` : "#CBD5E1" }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// QUIZ SCREEN
// ══════════════════════════════════════════════════════════════════════════════
function QuizScreen({ bootstrap }: { bootstrap: AppBootstrap | null }) {
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const quizList = bootstrap?.quiz?.questions ?? quizQuestions;
  const q = quizList[qIndex];

  useEffect(() => {
    if (selected !== null || finished) return;
    if (timeLeft === 0) { setShowResult(true); return; }
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, selected, finished]);

  const choose = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.correct) setScore(s => s + 1);
    setTimeout(() => setShowResult(true), 600);
  };

  const next = () => {
    if (qIndex + 1 >= quizList.length) { setFinished(true); return; }
    setQIndex(qi => qi + 1);
    setSelected(null);
    setShowResult(false);
    setTimeLeft(30);
  };

  if (finished) return (
    <div className="p-6 max-w-2xl mx-auto flex flex-col items-center pt-16 space-y-6">
      <div className="text-6xl">🏆</div>
      <h2 className="text-3xl font-extrabold text-slate-900 text-center">Quiz Complete!</h2>
      <p className="text-slate-500 text-center">You scored <span className="font-bold" style={{ color: BLUE }}>{score}/{quizList.length}</span> — excellent critical thinking!</p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Chip label={`+${score * 50} XP Earned`} color={GREEN} bg={GREEN + "15"} />
        <Chip label="🔥 Streak Maintained" color={AMBER} bg={AMBER + "15"} />
        {score === quizQuestions.length && <Chip label="🎯 Perfect Score!" color={BLUE} bg={BLUE + "12"} />}
      </div>
      <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center">
        <ScoreMeter score={Math.round((score / quizList.length) * 100)} size={140} />
        <p className="mt-3 font-semibold text-slate-700">Accuracy Rate</p>
      </div>
      <button onClick={() => { setQIndex(0); setSelected(null); setShowResult(false); setScore(0); setFinished(false); setTimeLeft(30); }} className="px-8 py-3 rounded-xl font-semibold text-white" style={{ background: `linear-gradient(135deg, ${BLUE}, ${TEAL})` }}>
        Try Again
      </button>
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-extrabold text-slate-900">Media Literacy Challenge</h1>
          <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-sm", timeLeft <= 10 ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600")} style={{ fontFamily: "DM Mono, monospace" }}>
            <Clock size={14} /> {timeLeft}s
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2">
          {quizQuestions.map((_, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-100">
              <div className="h-full rounded-full transition-all" style={{ width: i < qIndex ? "100%" : i === qIndex ? "50%" : "0%", background: i < qIndex ? GREEN : `linear-gradient(90deg, ${BLUE}, ${TEAL})` }} />
            </div>
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Chip label={`Question ${qIndex + 1} of ${quizQuestions.length}`} color={BLUE} bg={BLUE + "12"} />
          <Chip label="+50 XP" color={AMBER} bg={AMBER + "15"} />
        </div>
        <h2 className="text-lg font-bold text-slate-900 leading-snug">{q.question}</h2>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correct;
          const isSelected = i === selected;
          let bg = "bg-white border-slate-200";
          let textColor = "text-slate-800";
          if (selected !== null) {
            if (isCorrect) { bg = "border-green-400"; textColor = "text-green-800"; }
            else if (isSelected) { bg = "border-red-400"; textColor = "text-red-800"; }
          }
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={selected !== null}
              className={cn("w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all font-medium text-sm", bg, textColor, selected === null && "hover:border-blue-300 hover:bg-blue-50")}
              style={selected !== null && isCorrect ? { backgroundColor: GREEN + "10", borderColor: GREEN } : selected !== null && isSelected ? { backgroundColor: "#FEF2F2", borderColor: "#EF4444" } : {}}
            >
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border-2", selected !== null && isCorrect ? "border-green-400 text-green-700 bg-green-50" : selected !== null && isSelected ? "border-red-400 text-red-700 bg-red-50" : "border-slate-200 text-slate-500")}>
                {String.fromCharCode(65 + i)}
              </div>
              <span>{opt}</span>
              {selected !== null && isCorrect && <CheckCircle size={16} style={{ color: GREEN }} className="ml-auto" />}
              {selected !== null && isSelected && !isCorrect && <X size={16} style={{ color: "#EF4444" }} className="ml-auto" />}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {showResult && (
        <div className={cn("rounded-2xl p-5 border", selected === q.correct ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200")}>
          <div className="flex items-start gap-2">
            <Sparkles size={16} style={{ color: selected === q.correct ? GREEN : "#EF4444" }} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm mb-1" style={{ color: selected === q.correct ? "#15803D" : "#DC2626" }}>
                {selected === q.correct ? "Correct! Well done." : "Not quite — here's why:"}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: selected === q.correct ? "#166534" : "#991B1B" }}>{q.explanation}</p>
            </div>
          </div>
          <button onClick={next} className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white w-full justify-center" style={{ background: `linear-gradient(135deg, ${BLUE}, ${TEAL})` }}>
            {qIndex + 1 >= quizList.length ? "See Results" : "Next Question"} <ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STUDENT PROFILE
// ══════════════════════════════════════════════════════════════════════════════
function StudentProfile({ bootstrap }: { bootstrap: AppBootstrap | null }) {
  const profileStats = bootstrap?.profile?.stats
    ? bootstrap.profile.stats.map((stat) => ({ ...stat, icon: iconFromName(stat.icon) }))
    : [
      { label: "Total XP", value: "3,640", icon: Zap, color: BLUE },
      { label: "Rank", value: "#4", icon: Trophy, color: AMBER },
      { label: "Lessons Done", value: "31", icon: BookOpen, color: TEAL },
      { label: "Quiz Accuracy", value: "87%", icon: Target, color: GREEN },
    ];
  const profileBadges = bootstrap?.profile?.badges ?? badges;
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="h-24" style={{ background: `linear-gradient(135deg, ${BLUE}, ${TEAL})` }} />
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-4 flex-wrap gap-3">
            <div className="w-20 h-20 rounded-2xl border-4 border-white flex items-center justify-center text-2xl font-bold text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${BLUE}, ${TEAL})` }}>JD</div>
            <div className="flex gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-full">
                <Flame size={14} style={{ color: AMBER }} />
                <span className="text-xs font-bold" style={{ color: AMBER }}>14 Day Streak</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full">
                <Zap size={14} style={{ color: BLUE }} />
                <span className="text-xs font-bold" style={{ color: BLUE }}>Level 7</span>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Jordan Davis</h2>
          <p className="text-slate-500 text-sm">@jordan_davis · University of Lagos · Joined March 2025</p>
          <p className="text-slate-600 text-sm mt-2 max-w-lg">Passionate about digital literacy and responsible media consumption. Working toward Truth Guardian certification.</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {profileStats.map((stat) => {
          const Icon = stat.icon;
          return <StatCard key={stat.label} icon={<Icon size={20} />} label={stat.label} value={stat.value} sub="" color={stat.color} />;
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Badges */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-4">Achievement Badges</h3>
          <div className="grid grid-cols-4 gap-3">
            {profileBadges.map(b => (
              <div key={b.name} className={cn("flex flex-col items-center gap-1 p-3 rounded-xl border transition-all", b.earned ? "bg-blue-50 border-blue-100" : "bg-slate-50 border-slate-100 opacity-50 grayscale")}>
                <span className="text-2xl">{b.icon}</span>
                <p className="text-[10px] text-center font-medium text-slate-600 leading-tight">{b.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly activity */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12, border: "1px solid #e2e8f0" }} />
              <Bar dataKey="articles" fill={BLUE} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Credibility challenge score */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-900">Credibility Challenge Score</h3>
          <Chip label="All Time" color={BLUE} bg={BLUE + "12"} />
        </div>
        <div className="flex items-center gap-8 flex-wrap">
          <ScoreMeter score={87} size={130} />
          <div className="grid grid-cols-2 gap-4 flex-1">
            {[
              { label: "Fact-Checking Accuracy", value: "91%", color: GREEN },
              { label: "Bias Detection", value: "84%", color: TEAL },
              { label: "Source Evaluation", value: "88%", color: BLUE },
              { label: "Deepfake Detection", value: "79%", color: PURPLE },
            ].map(s => (
              <div key={s.label}>
                <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: s.value, background: s.color }} />
                  </div>
                  <span className="text-xs font-bold" style={{ color: s.color, fontFamily: "DM Mono, monospace" }}>{s.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TEACHER DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
function TeacherDashboard({ bootstrap }: { bootstrap: AppBootstrap | null }) {
  const classPerformance = bootstrap?.teacher?.classPerformance ?? weeklyData.map(d => ({ name: d.day, average: d.score }));
  const skillDistribution = bootstrap?.teacher?.skillDistribution ?? [
    { name: "Fact Checking", value: 85 },
    { name: "Source Verification", value: 78 },
    { name: "Bias Detection", value: 72 },
    { name: "Deepfake Detection", value: 65 },
  ];
  const completionData = bootstrap?.teacher?.completionData ?? [
    { name: "Completed", value: 24, color: "#22C55E" },
    { name: "In Progress", value: 8, color: "#F59E0B" },
    { name: "Not Started", value: 3, color: "#E2E8F0" },
  ];
  const students = bootstrap?.teacher?.students ?? [
    { id: 1, name: "Sarah Chen", level: 15, xp: 3420, score: 92, streak: 14, lessons: 18, status: "excellent" },
    { id: 2, name: "Alex Rodriguez", level: 12, xp: 2450, score: 85, streak: 7, lessons: 15, status: "good" },
    { id: 3, name: "Maya Patel", level: 11, xp: 2180, score: 88, streak: 10, lessons: 14, status: "good" },
    { id: 4, name: "James Kim", level: 9, xp: 1890, score: 78, streak: 5, lessons: 11, status: "average" },
    { id: 5, name: "Emma Wilson", level: 8, xp: 1750, score: 82, streak: 3, lessons: 10, status: "average" },
    { id: 6, name: "Oliver Brown", level: 6, xp: 980, score: 65, streak: 1, lessons: 7, status: "needs-attention" },
  ];
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Teacher Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Media Studies 101 · Ms. Adaeze Nwosu · Lagos Secondary School</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors">
            <FileText size={15} /> Export Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: `linear-gradient(135deg, ${BLUE}, #1d4ed8)` }}>
            <Zap size={15} /> Assign Challenge
          </button>
        </div>
      </div>

      {/* Class summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Users size={20} />} label="Students" value="28" sub="24 active this week" color={BLUE} />
        <StatCard icon={<TrendingUp size={20} />} label="Class Average" value="76" sub="↑ 8 pts from last month" color={GREEN} />
        <StatCard icon={<BookOpen size={20} />} label="Lessons Assigned" value="12" sub="9 completed by class" color={TEAL} />
        <StatCard icon={<Trophy size={20} />} label="Challenges Done" value="156" sub="Across all students" color={AMBER} />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-4">Class Literacy Score Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={classPerformance.map(d => ({ ...d, classAvg: d.average - 8 }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12, border: "1px solid #e2e8f0" }} />
              <Line type="monotone" dataKey="average" stroke={BLUE} strokeWidth={2.5} name="Top Student" dot={false} />
              <Line type="monotone" dataKey="classAvg" stroke={TEAL} strokeWidth={2.5} name="Class Average" dot={false} strokeDasharray="5 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-4">Module Completion Rate</h3>
          <div className="space-y-3">
            {completionData.map(m => (
              <div key={m.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700">{m.name}</span>
                  <span className="text-xs text-slate-500">{m.value}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${m.value}%`, background: `linear-gradient(90deg, ${BLUE}, ${TEAL})` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Student table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Student Performance</h3>
          <div className="flex items-center gap-2">
            <input className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none" placeholder="Search students…" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Score</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Lessons</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Streak</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {students.map(s => (
                <tr key={s.name} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: `linear-gradient(135deg, ${BLUE}, ${TEAL})` }}>
                        {s.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span className="font-medium text-slate-800">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${s.score}%`, background: s.score >= 80 ? GREEN : s.score >= 65 ? AMBER : "#EF4444" }} />
                      </div>
                      <span className="font-bold text-slate-800" style={{ fontFamily: "DM Mono, monospace" }}>{s.score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{s.lessons} done</td>
                  <td className="px-4 py-4">
                    <span className="flex items-center gap-1 text-sm">
                      <Flame size={13} style={{ color: s.streak >= 7 ? AMBER : "#94A3B8" }} />
                      <span style={{ color: s.streak >= 7 ? AMBER : "#94A3B8", fontFamily: "DM Mono, monospace" }}>{s.streak}d</span>
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <Chip
                      label={s.score >= 80 ? "On Track" : s.score >= 65 ? "Progressing" : "Needs Support"}
                      color={s.score >= 80 ? GREEN : s.score >= 65 ? AMBER : "#EF4444"}
                      bg={(s.score >= 80 ? GREEN : s.score >= 65 ? AMBER : "#EF4444") + "15"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MOBILE VIEW
// ══════════════════════════════════════════════════════════════════════════════
function MobileView({ bootstrap }: { bootstrap: AppBootstrap | null }) {
  const [activeTab, setActiveTab] = useState<"home" | "analyze" | "learn" | "quiz" | "profile">("home");
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ContentAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mInput, setMInput] = useState("");

  const tabs = [
    { id: "home", icon: <Home size={20} />, label: "Home" },
    { id: "analyze", icon: <Search size={20} />, label: "Analyze" },
    { id: "learn", icon: <BookOpen size={20} />, label: "Learn" },
    { id: "quiz", icon: <Trophy size={20} />, label: "Quiz" },
    { id: "profile", icon: <User size={20} />, label: "Profile" },
  ] as const;

  const mAnalyze = async () => {
    try {
      setAnalyzeLoading(true);
      setError(null);
      const trimmed = mInput.trim();
      if (!trimmed) {
        setError("Please enter a URL or text to analyze.");
        return;
      }
      const response = await analyzeContent({ mode: "url", input: trimmed });
      setAnalysis(response);
    } catch (err) {
      setAnalysis(null);
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    } finally {
      setAnalyzeLoading(false);
    }
  };

  const mobileRecentAnalyses = bootstrap?.mobile?.recentAnalyses ?? [
    { title: "Government AI policy draft", score: 91, time: "2h ago" },
    { title: "Miracle berry health claim", score: 22, time: "5h ago" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Mobile App Preview</h1>
        <p className="text-slate-500 text-sm mt-1">Tap the bottom navigation to explore mobile screens.</p>
      </div>

      {/* Phone mockup */}
      <div className="flex justify-center">
        <div className="w-[375px] h-[780px] bg-white rounded-[44px] border-[10px] border-slate-800 shadow-2xl overflow-hidden flex flex-col relative" style={{ boxShadow: "0 40px 80px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.1)" }}>
          {/* Status bar */}
          <div className="flex items-center justify-between px-6 pt-3 pb-1 bg-white flex-shrink-0">
            <span className="text-xs font-bold text-slate-800" style={{ fontFamily: "DM Mono, monospace" }}>9:41</span>
            <div className="w-20 h-5 bg-slate-800 rounded-full mx-auto" />
            <div className="flex items-center gap-1">
              <div className="w-3.5 h-2.5 border border-slate-800 rounded-sm relative"><div className="absolute inset-0.5 bg-slate-800 rounded-[1px]" style={{ right: "20%" }} /></div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            {activeTab === "home" && (
              <div className="px-4 py-3 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Good morning,</p>
                    <h2 className="text-lg font-extrabold text-slate-900">Jordan 👋</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50">
                      <Flame size={12} style={{ color: AMBER }} />
                      <span className="text-xs font-bold" style={{ color: AMBER }}>14</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold">JD</div>
                  </div>
                </div>

                {/* Score card */}
                <div className="rounded-2xl p-4 text-white" style={{ background: `linear-gradient(135deg, ${BLUE}, ${TEAL})` }}>
                  <p className="text-xs text-blue-100 mb-1">Daily Literacy Score</p>
                  <div className="flex items-center justify-between">
                    <p className="text-4xl font-extrabold" style={{ fontFamily: "DM Mono, monospace" }}>84</p>
                    <div className="text-right">
                      <p className="text-xs text-blue-100">XP Today</p>
                      <p className="text-lg font-bold">+125</p>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 bg-white/20 rounded-full">
                    <div className="h-full w-[64%] bg-white rounded-full" />
                  </div>
                  <p className="text-xs text-blue-100 mt-1">360 XP to Level 8</p>
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: <Search size={18} />, label: "Analyze", color: BLUE, action: () => setActiveTab("analyze") },
                    { icon: <Shield size={18} />, label: "Deepfake", color: TEAL, action: () => {} },
                    { icon: <BookOpen size={18} />, label: "Learn", color: PURPLE, action: () => setActiveTab("learn") },
                    { icon: <Trophy size={18} />, label: "Challenge", color: AMBER, action: () => setActiveTab("quiz") },
                  ].map(a => (
                    <button key={a.label} onClick={a.action} className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-white text-sm font-semibold text-slate-700 hover:border-blue-200 transition-colors">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: a.color + "15" }}>
                        <div style={{ color: a.color }}>{a.icon}</div>
                      </div>
                      {a.label}
                    </button>
                  ))}
                </div>

                {/* Recent */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Recent Analyses</p>
                  <div className="space-y-2">
                    {mobileRecentAnalyses.map(a => (
                      <div key={a.title} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
                        <ScoreMeter score={a.score} size={44} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">{a.title}</p>
                          <p className="text-[10px] text-slate-400">{a.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "analyze" && (
              <div className="px-4 py-3 space-y-4">
                <h2 className="text-lg font-extrabold text-slate-900">Content Analyzer</h2>
                <textarea
                  value={mInput}
                  onChange={e => setMInput(e.target.value)}
                  placeholder="Paste URL or text to analyze…"
                  className="w-full h-28 resize-none bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 focus:outline-none"
                />
                <button onClick={mAnalyze} disabled={analyzeLoading} className="w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2" style={{ background: `linear-gradient(135deg, ${BLUE}, ${TEAL})` }}>
                  {analyzeLoading ? <><RefreshCw size={14} className="animate-spin" /> Analyzing…</> : <><Search size={14} /> Analyze</>}
                </button>
                {error && (
                  <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
                )}
                {analysis && !analyzeLoading && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 bg-white rounded-xl p-4 border border-slate-100">
                      <ScoreMeter score={analysis.score} size={70} />
                      <div>
                        <p className="font-bold text-slate-900">Score: {analysis.score}/100</p>
                        <Chip label={`${analysis.biasLabel}`} color={GREEN} bg={GREEN + "15"} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        ["Bias", analysis.biasLabel, TEAL],
                        ["Emotion", analysis.emotionLabel, AMBER],
                        ["Source", analysis.reliabilityLabel, GREEN],
                        ["Facts", analysis.factAccuracy, BLUE],
                      ].map(([l, v, c]) => (
                        <div key={l as string} className="bg-white rounded-xl p-3 border border-slate-100">
                          <p className="text-[10px] text-slate-400">{l as string}</p>
                          <p className="font-bold text-sm" style={{ color: c as string, fontFamily: "DM Mono, monospace" }}>{v as string}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                      <p className="text-xs text-blue-700 leading-relaxed flex gap-2"><Sparkles size={12} className="flex-shrink-0 mt-0.5" style={{ color: BLUE }} /> {analysis.summary}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "learn" && (
              <div className="px-4 py-3 space-y-4">
                <h2 className="text-lg font-extrabold text-slate-900">Learning Hub</h2>
                <div className="rounded-xl p-3 flex items-center gap-3 text-white" style={{ background: `linear-gradient(135deg, ${BLUE}, ${TEAL})` }}>
                  <div className="text-2xl">🎓</div>
                  <div>
                    <p className="text-xs text-blue-100">Level 7</p>
                    <p className="font-bold text-sm">Media Sentinel</p>
                    <div className="mt-1 h-1 bg-white/20 rounded-full w-32">
                      <div className="h-full w-2/3 bg-white rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {modules.slice(0, 4).map(m => (
                    <button key={m.id} className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 text-left">
                      <div className="text-2xl flex-shrink-0">{m.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-slate-800">{m.title}</p>
                          <span className="text-[10px] font-bold" style={{ color: m.progress === 100 ? GREEN : BLUE }}>{m.progress}%</span>
                        </div>
                        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${m.progress}%`, background: m.progress === 100 ? GREEN : `linear-gradient(90deg, ${BLUE}, ${TEAL})` }} />
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "quiz" && (
              <div className="px-4 py-3 space-y-4">
                <h2 className="text-lg font-extrabold text-slate-900">Daily Challenge</h2>
                <div className="bg-white rounded-xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Chip label="Question 1/3" color={BLUE} bg={BLUE + "12"} />
                    <div className="flex items-center gap-1 text-sm font-bold" style={{ color: AMBER, fontFamily: "DM Mono, monospace" }}>
                      <Clock size={13} /> 30s
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 mb-4">{quizQuestions[0].question}</p>
                  <div className="space-y-2">
                    {quizQuestions[0].options.map((opt, i) => (
                      <button key={i} className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-slate-200 text-left text-xs font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                        <span className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-500 flex-shrink-0">{String.fromCharCode(65 + i)}</span>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="px-4 py-3 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white" style={{ background: `linear-gradient(135deg, ${BLUE}, ${TEAL})` }}>JD</div>
                  <div>
                    <h2 className="font-extrabold text-slate-900">Jordan Davis</h2>
                    <p className="text-xs text-slate-500">Level 7 · Media Sentinel</p>
                    <div className="flex gap-2 mt-1">
                      <div className="flex items-center gap-1"><Flame size={11} style={{ color: AMBER }} /><span className="text-xs font-bold" style={{ color: AMBER }}>14d</span></div>
                      <div className="flex items-center gap-1"><Zap size={11} style={{ color: BLUE }} /><span className="text-xs font-bold" style={{ color: BLUE }}>3,640 XP</span></div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[["#4", "Rank"], ["87%", "Accuracy"], ["31", "Lessons"], ["4/8", "Badges"]].map(([v, l]) => (
                    <div key={l as string} className="bg-white rounded-xl p-3 border border-slate-100 text-center">
                      <p className="text-xl font-extrabold text-slate-900" style={{ fontFamily: "DM Mono, monospace" }}>{v}</p>
                      <p className="text-xs text-slate-400">{l}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Badges</p>
                  <div className="grid grid-cols-4 gap-2">
                    {badges.slice(0, 8).map(b => (
                      <div key={b.name} className={cn("flex flex-col items-center gap-1 p-2 rounded-xl border", b.earned ? "bg-blue-50 border-blue-100" : "bg-slate-50 border-slate-100 opacity-40 grayscale")}>
                        <span className="text-xl">{b.icon}</span>
                        <p className="text-[8px] text-center font-medium text-slate-600 leading-tight">{b.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom nav */}
          <div className="flex-shrink-0 bg-white border-t border-slate-100 px-2 pb-4 pt-2">
            <div className="flex items-center justify-around">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn("flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all", activeTab === tab.id ? "text-white" : "text-slate-400")}
                  style={activeTab === tab.id ? { background: `linear-gradient(135deg, ${BLUE}, ${TEAL})` } : {}}
                >
                  {tab.icon}
                  <span className="text-[10px] font-semibold">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const { data: bootstrap } = useTruthQuestBootstrap();

  if (screen === "landing") return <LandingPage onEnter={() => setScreen("dashboard")} bootstrap={bootstrap} />;

  const content = (() => {
    switch (screen) {
      case "dashboard": return <Dashboard setScreen={setScreen} bootstrap={bootstrap} />;
      case "analyzer": return <ContentAnalyzer />;
      case "deepfake": return <DeepfakeDetector />;
      case "learning": return <LearningHub setScreen={setScreen} bootstrap={bootstrap} />;
      case "quiz": return <QuizScreen bootstrap={bootstrap} />;
      case "profile": return <StudentProfile bootstrap={bootstrap} />;
      case "teacher": return <TeacherDashboard bootstrap={bootstrap} />;
      case "mobile": return <MobileView bootstrap={bootstrap} />;
      default: return <Dashboard setScreen={setScreen} bootstrap={bootstrap} />;
    }
  })();

  return (
    <AppShell screen={screen} setScreen={setScreen}>
      {content}
    </AppShell>
  );
}
