import { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, LineChart, Line, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import {
  Shield, Search, Brain, AlertTriangle, CheckCircle, TrendingUp,
  BookOpen, Trophy, Star, Flame, ChevronRight, ChevronDown, ChevronLeft, Upload,
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
  checkBackendHealth,
  useTruthQuestBootstrap,
  type AppBootstrap,
  type ContentAnalysisResponse,
  type DeepfakeAnalysisResponse,
} from "./services/truthquestApi";
import confetti from "canvas-confetti";

// ─── Types ───────────────────────────────────────────────────────────────────
type Screen =
  | "landing" | "dashboard" | "analyzer" | "deepfake"
  | "learning" | "quiz" | "profile" | "teacher" | "mobile"
  | "impact" | "privacy" | "terms";

type DemoProgress = {
  analysisComplete: boolean;
  quizWon: boolean;
  challengeWon: boolean;
};

const screenPaths: Record<Screen, string> = {
  landing: "/",
  dashboard: "/dashboard",
  analyzer: "/analyze",
  deepfake: "/deepfake",
  learning: "/learning",
  quiz: "/quiz",
  profile: "/profile",
  teacher: "/teacher",
  mobile: "/mobile",
  impact: "/impact",
  privacy: "/privacy",
  terms: "/terms",
};

const pathScreens: Record<string, Screen> = Object.fromEntries(
  Object.entries(screenPaths).map(([screen, path]) => [path, screen as Screen]),
) as Record<string, Screen>;

function screenFromPath(pathname: string): Screen {
  return pathScreens[pathname.replace(/\/$/, "") || "/"] ?? "landing";
}

function detectContentAnalysisMode(input: string): "url" | "text" {
  const trimmed = input.trim();
  if (/^https?:\/\/\S+$/i.test(trimmed)) return "url";
  if (/^[a-z0-9.-]+\.[a-z]{2,}(?:\/\S*)?$/i.test(trimmed)) return "url";
  return "text";
}

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

const demoPost = "BREAKING: A secret school policy will ban phones nationwide next week. Officials are hiding the document and every student will be fined $500 if they bring a phone to class. Share before they delete this.";

const demoScenarios = [
  {
    id: "school",
    label: "School Rumor",
    description: "A viral policy scare with no primary source.",
    input: demoPost,
  },
  {
    id: "health",
    label: "Health Claim",
    description: "A miracle-cure post with absolute language.",
    input: "Doctors are hiding this: drinking one herbal tea every morning reverses diabetes in 7 days. Big Pharma does not want you to know. Share this cure with your family now.",
  },
  {
    id: "civic",
    label: "Election Clip",
    description: "A cropped civic claim missing context.",
    input: "This video proves the city council secretly cancelled youth voting registration. The clip shows one official saying the program is paused. Nobody in local media will cover it.",
  },
] as const;

const modules = [
  { id: 1, title: "Spot Fake News", icon: "🎯", color: "#2563EB", xp: 150, progress: 100, lessons: 8, completed: true },
  { id: 2, title: "Understanding Bias", icon: "⚖️", color: "#14B8A6", xp: 200, progress: 65, lessons: 10, completed: false },
  { id: 3, title: "Source Verification", icon: "🔍", color: "#8B5CF6", xp: 175, progress: 40, lessons: 9, completed: false },
  { id: 4, title: "Deepfake Awareness", icon: "🎭", color: "#F59E0B", xp: 225, progress: 20, lessons: 12, completed: false },
  { id: 5, title: "Social Media Literacy", icon: "📱", color: "#22C55E", xp: 180, progress: 0, lessons: 8, completed: false },
  { id: 6, title: "Digital Citizenship", icon: "🌐", color: "#EF4444", xp: 250, progress: 0, lessons: 14, completed: false },
];

const lessonLibrary: Record<string, {
  objective: string;
  keyConcept: string;
  sections: Array<{ title: string; body: string }>;
  example: { scenario: string; breakdown: string[] };
  commonMistake: string;
  practice: string;
  reflection: string;
  checklist: string[];
  vocabulary: Array<{ term: string; definition: string }>;
  challenge: {
    prompt: string;
    goal: string;
    items: Array<{
      id: string;
      label: string;
      detail: string;
      strength: number;
    }>;
    explanation: string;
  };
}> = {
  "Spot Fake News": {
    objective: "Learn the fastest red flags that separate credible reporting from misinformation.",
    keyConcept: "Misinformation is easiest to catch when you reduce a post to one checkable claim, then inspect the evidence behind that claim.",
    sections: [
      { title: "Start With The Claim", body: "Identify the exact factual claim before judging the whole post. A headline may be emotional, but the core claim should be rewritten as something testable: who did what, when, where, and according to which evidence." },
      { title: "Watch For Absolutes", body: "Words like always, never, cure, secret, guaranteed, and everyone knows often signal overclaiming. Reliable reporting usually includes limits, uncertainty, and specific sourcing." },
      { title: "Check The Evidence Trail", body: "Look for named sources, dates, documents, original data, and links to primary evidence. Anonymous claims and circular links, where several articles all cite each other, should lower confidence." },
      { title: "Compare Before Sharing", body: "A claim becomes stronger when independent sources with different incentives report the same facts. If every version points back to the same weak source, treat it as unverified." },
    ],
    example: {
      scenario: "A post says: 'Breaking: A secret school policy will ban phones nationwide next week.'",
      breakdown: ["Check whether a real policy document exists.", "Look for the education department or school board source.", "Search whether reputable local outlets reported the same timing.", "If no primary source exists, mark it as unverified, not true or false."],
    },
    commonMistake: "Do not judge only by whether the claim sounds believable. Plausible misinformation spreads because it fits what people already expect.",
    practice: "Paste a viral headline into the analyzer and rewrite it as one factual claim you can verify.",
    reflection: "What detail would make this claim easier to verify: a date, a named source, a document, or a direct quote?",
    checklist: ["Find the claim", "Check the date", "Look for named evidence", "Compare with two independent sources"],
    vocabulary: [
      { term: "Claim", definition: "A statement that can be checked against evidence." },
      { term: "Primary source", definition: "Original evidence such as a document, dataset, transcript, or official release." },
      { term: "Circular sourcing", definition: "Several sources repeating the same claim without adding independent evidence." },
    ],
    challenge: {
      prompt: "Rank these evidence signals from strongest to weakest for deciding whether the claim is credible.",
      goal: "Strongest evidence should be the original source, then direct supporting documentation, then secondary reporting, then social reposts.",
      items: [
        { id: "official", label: "Official health agency or peer-reviewed study", detail: "Primary evidence from the source most likely to know the truth.", strength: 4 },
        { id: "document", label: "Quoted doctor with named publication", detail: "Useful if the quote links to the actual study or report.", strength: 3 },
        { id: "article", label: "News article summarizing the claim", detail: "Helpful, but still a layer removed from the original evidence.", strength: 2 },
        { id: "post", label: "Anonymous social media repost", detail: "Weakest because it adds no verifiable context.", strength: 1 },
      ],
      explanation: "The best order starts with primary evidence and moves outward to summaries and reposts.",
    },
  },
  "Understanding Bias": {
    objective: "Recognize framing, loaded language, and missing context without assuming every biased article is false.",
    keyConcept: "Bias is not the same as falsehood. Bias shapes emphasis, language, source choice, and what context is left out.",
    sections: [
      { title: "Bias Is Framing", body: "Bias often appears in what a story emphasizes, omits, or assumes. Separate observable facts from interpretation before deciding whether the article is fair." },
      { title: "Loaded Language", body: "Emotion-heavy labels can push readers toward a conclusion before evidence is shown. Replace labels with neutral descriptions when evaluating the facts." },
      { title: "Missing Context", body: "A story can be technically accurate and still misleading if it leaves out scale, history, counterevidence, or relevant comparisons." },
      { title: "Source Diversity", body: "A strong conclusion should survive comparison across sources with different audiences, incentives, and editorial angles." },
    ],
    example: {
      scenario: "Two articles describe the same protest. One says 'citizens gathered downtown'; another says 'angry mobs flooded the streets.'",
      breakdown: ["Both may describe the same event.", "The second uses stronger emotional framing.", "Check crowd size, police reports, images, and multiple outlets.", "Separate event facts from tone."],
    },
    commonMistake: "Do not label an article fake just because it has bias. Instead, identify which parts are fact, framing, opinion, or unsupported interpretation.",
    practice: "Choose one article and highlight three words that shape emotion more than facts.",
    reflection: "What neutral words could replace the most emotional phrase in the article?",
    checklist: ["Separate fact from opinion", "Identify emotional words", "Check what is missing", "Compare across viewpoints"],
    vocabulary: [
      { term: "Framing", definition: "The angle or emphasis used to present facts." },
      { term: "Loaded language", definition: "Words designed to trigger emotion or judgment." },
      { term: "Context", definition: "Background information needed to understand the significance of a claim." },
    ],
    challenge: {
      prompt: "Rank these statements from most factual to most opinionated.",
      goal: "Factual statements describe observable events; opinionated statements add judgment or emotional framing.",
      items: [
        { id: "data", label: "The report included data from three agencies.", detail: "Reports a concrete fact.", strength: 4 },
        { id: "pass", label: "The bill passed 52-48 on Tuesday.", detail: "Specific, checkable, and neutral.", strength: 3 },
        { id: "policy", label: "The mayor said the policy will start in July.", detail: "Verifiable but still a reported statement.", strength: 2 },
        { id: "loaded", label: "The reckless officials forced a disastrous plan on families.", detail: "Uses judgment words and emotional framing.", strength: 1 },
      ],
      explanation: "The more a statement uses measurable facts and the less it relies on judgment words, the stronger it is as evidence.",
    },
  },
  "Source Verification": {
    objective: "Trace information back to its original source before trusting or sharing it.",
    keyConcept: "The closer you get to the original evidence, the less you depend on someone else's summary or interpretation.",
    sections: [
      { title: "Primary Beats Secondary", body: "Government releases, court documents, research papers, datasets, and direct transcripts are stronger than articles that summarize those materials." },
      { title: "Domain And Author Checks", body: "Check the final URL, publisher, author, publish date, and whether the page links to supporting evidence. A professional-looking site can still be unreviewed or misleading." },
      { title: "Trace The Citation Chain", body: "Open the links. If a report cites another article, and that article cites a social post, your evidence may be weaker than it first appeared." },
      { title: "Check The Date", body: "Old articles, recycled images, and outdated statistics often resurface as if they are current. Date mismatch is one of the most common misinformation patterns." },
    ],
    example: {
      scenario: "An article says a court 'quietly banned' a popular app, but links only to another blog.",
      breakdown: ["Search the court website or legal database.", "Look for the case number or official order.", "Check whether reputable outlets cite the same document.", "If the document is absent, mark the claim as unsupported."],
    },
    commonMistake: "Do not stop at the first link. A linked source can be weak, outdated, unrelated, or simply repeating the same claim.",
    practice: "Open a news article and find the oldest source or document it relies on.",
    reflection: "What is the strongest source you found: official document, reputable article, social post, or no source?",
    checklist: ["Check final URL", "Find author/date", "Open linked evidence", "Trace claim to original source"],
    vocabulary: [
      { term: "Canonical URL", definition: "The preferred official URL for a page, often used to avoid duplicate or copied versions." },
      { term: "Source laundering", definition: "A weak claim becoming more believable as it is repeated by multiple sites." },
      { term: "Provenance", definition: "The origin and history of a piece of information or media." },
    ],
    challenge: {
      prompt: "Rank these source types from strongest to weakest for verifying a new court ruling.",
      goal: "Primary documents beat summaries, and summaries beat reposts.",
      items: [
        { id: "court", label: "Court document or official court website", detail: "Primary legal evidence.", strength: 4 },
        { id: "wire", label: "Reputable wire service article", detail: "A strong summary if it cites the document.", strength: 3 },
        { id: "screenshot", label: "Viral screenshot", detail: "Can be cropped or taken out of context.", strength: 2 },
        { id: "chat", label: "Group chat headline", detail: "Removes source context entirely.", strength: 1 },
      ],
      explanation: "The court document is strongest because it is the original source. Everything else adds more distance from the evidence.",
    },
  },
  "Deepfake Awareness": {
    objective: "Understand what media manipulation tools can fake and what signals still help verification.",
    keyConcept: "Deepfake detection is not one magic score. It is a layered process using media signals, source context, provenance, and corroboration.",
    sections: [
      { title: "Look Beyond The Face", body: "Visual artifacts matter, but context matters too: original uploader, source file, event timing, and whether trusted outlets have the same media." },
      { title: "Metadata Is A Clue", body: "Missing or synthetic metadata is not proof by itself, but file type mismatches, tiny files, or embedded generator markers raise risk." },
      { title: "Audio And Context Matter", body: "Deepfakes can target voice, timing, subtitles, or edits. Check whether the audio matches known context and whether the clip appears elsewhere." },
      { title: "Use Multiple Checks", body: "Combine reverse image search, source checks, file inspection, audio consistency, and provenance before making a judgment." },
    ],
    example: {
      scenario: "A short video appears to show a principal announcing school closure, but it was posted by an anonymous account.",
      breakdown: ["Check the school's official channels.", "Look for the full-length video.", "Inspect whether the audio and mouth movement align.", "Treat the clip as unverified until the source confirms it."],
    },
    commonMistake: "Do not declare media real or fake based only on one artifact. Compression, lighting, and low quality can create false alarms.",
    practice: "Upload a test image to Media Integrity Check and explain which file or provenance signals were strong or weak.",
    reflection: "Which evidence would change your confidence most: official source confirmation, original file, reverse search result, or metadata?",
    checklist: ["Check source", "Inspect metadata", "Reverse search", "Avoid sharing until verified"],
    vocabulary: [
      { term: "Synthetic media", definition: "Media generated or altered by software, often using AI." },
      { term: "Metadata", definition: "File information such as type, size, dimensions, camera/app data, or timestamps." },
      { term: "Provenance", definition: "The origin, custody, and history of a media file." },
    ],
    challenge: {
      prompt: "Rank these signals from strongest to weakest for deciding whether a clip is authentic.",
      goal: "Source and provenance matter more than one visual artifact.",
      items: [
        { id: "official", label: "Official account or original uploader confirmation", detail: "Best path to provenance.", strength: 4 },
        { id: "metadata", label: "File metadata and source file inspection", detail: "Strong supporting signal, but not enough alone.", strength: 3 },
        { id: "visual", label: "Visual artifact check", detail: "Helpful, but compression and low quality can mislead.", strength: 2 },
        { id: "guess", label: "Gut feeling from the thumbnail", detail: "Not evidence.", strength: 1 },
      ],
      explanation: "Authenticity is strongest when confirmed by provenance and source, not just by a visual scan.",
    },
  },
  "Social Media Literacy": {
    objective: "Evaluate fast-moving posts, screenshots, and short clips before reacting.",
    keyConcept: "Social platforms reward speed and emotion, but verification requires slowing down and finding original context.",
    sections: [
      { title: "Virality Is Not Verification", body: "Likes and reposts measure attention, not truth. Treat viral posts as unverified until evidence is traced." },
      { title: "Screenshots Need Extra Care", body: "Screenshots are easy to crop, edit, and remove from context. Search for the original post, archived version, or a direct source." },
      { title: "Account Context", body: "Check whether the account is new, impersonating someone, repeatedly posting sensational claims, or hiding source details." },
      { title: "Slow The Share", body: "Pause when content makes you angry, afraid, or excited. Strong emotional reaction is a cue to verify first." },
    ],
    example: {
      scenario: "A screenshot claims a celebrity endorsed a financial scheme, but the username is cropped out.",
      breakdown: ["Search for the original post.", "Check the celebrity's verified accounts.", "Look for archived copies.", "Do not treat a cropped screenshot as primary evidence."],
    },
    commonMistake: "Do not use comment agreement as evidence. Coordinated or emotional comments can make weak claims feel confirmed.",
    practice: "Pick a social post and identify what would need to be true for the post to be accurate.",
    reflection: "What would you need to find before sharing this post with your family or class?",
    checklist: ["Find original post", "Check account history", "Verify media date", "Pause before sharing"],
    vocabulary: [
      { term: "Context collapse", definition: "When a post is separated from the details needed to interpret it correctly." },
      { term: "Impersonation", definition: "An account pretending to be a person, organization, or official source." },
      { term: "Archive", definition: "A saved copy of a web page or post that can help verify timing and changes." },
    ],
    challenge: {
      prompt: "Rank these actions from best to worst when a screenshot goes viral.",
      goal: "The best response restores context before reacting.",
      items: [
        { id: "original", label: "Find the original post or archived version", detail: "Restores source context.", strength: 4 },
        { id: "history", label: "Check the account history and posting pattern", detail: "Helps spot impersonation or spam.", strength: 3 },
        { id: "share", label: "Share it with a warning", detail: "Still amplifies a possibly false post.", strength: 2 },
        { id: "crop", label: "Crop the screenshot to focus on the shocking line", detail: "Removes more context.", strength: 1 },
      ],
      explanation: "Finding the original source comes first because it restores the missing context the screenshot removed.",
    },
  },
  "Digital Citizenship": {
    objective: "Build responsible habits for sharing, correcting, and discussing information online.",
    keyConcept: "Being accurate online is a civic behavior: your shares, corrections, and comments affect what others believe.",
    sections: [
      { title: "Share With Context", body: "When sharing credible information, include the source, date, and uncertainty. Avoid stripping away context just to make a post more dramatic." },
      { title: "Correct Clearly", body: "If you shared something wrong, correct it where people saw it. A quiet deletion does not help others learn." },
      { title: "Respect Privacy", body: "Do not amplify private people, minors, addresses, or unverified accusations, even when a story seems important." },
      { title: "Disagree Productively", body: "A good correction names the claim, provides better evidence, and avoids personal attacks. The goal is to improve the information environment." },
    ],
    example: {
      scenario: "You shared a false weather warning in a class group chat, and several classmates reposted it.",
      breakdown: ["Post a correction in the same chat.", "Say what was wrong and link the official weather source.", "Avoid blaming others.", "Ask classmates not to keep forwarding the old message."],
    },
    commonMistake: "Do not assume deleting a bad post is enough. People may have already seen, saved, or reshared it.",
    practice: "Write a responsible correction for a fake claim you previously believed or saw online.",
    reflection: "How can you correct misinformation without embarrassing someone or escalating conflict?",
    checklist: ["Add source/date", "Explain uncertainty", "Correct visibly", "Protect private people"],
    vocabulary: [
      { term: "Correction", definition: "A clear update explaining what was wrong and what better evidence shows." },
      { term: "Amplification", definition: "Increasing the reach of content by sharing, quoting, reposting, or reacting." },
      { term: "Digital citizenship", definition: "Responsible participation in online communities and information spaces." },
    ],
    challenge: {
      prompt: "Rank these correction actions from most responsible to least responsible.",
      goal: "A good correction is visible, specific, and useful to the people who saw the original mistake.",
      items: [
        { id: "clear", label: "Post a clear correction where people saw the original", detail: "Best because it repairs the information trail.", strength: 4 },
        { id: "source", label: "Include the better source and what changed", detail: "Makes the correction useful.", strength: 3 },
        { id: "delete", label: "Delete the post quietly", detail: "Removes evidence but does not correct others.", strength: 2 },
        { id: "blame", label: "Blame someone else for the mistake", detail: "Creates conflict and avoids responsibility.", strength: 1 },
      ],
      explanation: "A responsible correction is visible, specific, and linked to evidence. Quiet deletion is the weakest response.",
    },
  },
};

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

type BootstrapLearningModule = NonNullable<NonNullable<AppBootstrap["learning"]>["modules"]>[number];

function learningIcon(value: unknown, fallback: string) {
  if (typeof value === "string" && value.length > 0) {
    const Icon = iconFromName(value);
    return <Icon size={30} />;
  }
  return fallback;
}

function normalizeLearningModule(module: Partial<BootstrapLearningModule> | undefined, fallback: typeof modules[number]) {
  return {
    id: typeof module?.id === "number" ? module.id : fallback.id,
    title: typeof module?.title === "string" && module.title ? module.title : fallback.title,
    icon: learningIcon(module?.icon, fallback.icon),
    color: typeof module?.color === "string" && module.color ? module.color : fallback.color,
    xp: typeof module?.xp === "number" ? module.xp : fallback.xp,
    progress: typeof module?.progress === "number" ? Math.max(0, Math.min(100, module.progress)) : fallback.progress,
    lessons: typeof module?.lessons === "number" ? module.lessons : fallback.lessons,
    completed: typeof module?.completed === "boolean" ? module.completed : fallback.completed,
  };
}

function shuffleItems<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function challengeKeywords(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !["with", "from", "that", "this", "into", "your", "they", "than", "most", "less", "more", "only", "when", "what", "why", "then", "into"].includes(word));
}

// ─── Nav items ────────────────────────────────────────────────────────────────
const navItems: { icon: React.ReactNode; label: string; screen: Screen }[] = [
  { icon: <Home size={18} />, label: "Home", screen: "dashboard" },
  { icon: <Search size={18} />, label: "Analyze", screen: "analyzer" },
  { icon: <Shield size={18} />, label: "Media Integrity", screen: "deepfake" },
  { icon: <BookOpen size={18} />, label: "Learning Hub", screen: "learning" },
  { icon: <Trophy size={18} />, label: "Challenges", screen: "quiz" },
  { icon: <User size={18} />, label: "Profile", screen: "profile" },
  { icon: <GraduationCap size={18} />, label: "Teacher View", screen: "teacher" },
  { icon: <Smartphone size={18} />, label: "Mobile View", screen: "mobile" },
];

// ══════════════════════════════════════════════════════════════════════════════
// LANDING PAGE
// ══════════════════════════════════════════════════════════════════════════════
function LandingPage({ onNavigate, bootstrap }: { onNavigate: (screen: Screen) => void; bootstrap: AppBootstrap | null }) {
  const [mobileMenu, setMobileMenu] = useState(false);

  const features = [
    { icon: <Search size={22} />, title: "Evidence-Guided Analyzer", desc: "Extract checkable claims, inspect source context, find related evidence, and show uncertainty instead of issuing a black-box truth verdict.", color: BLUE },
    { icon: <Shield size={22} />, title: "Media Integrity Check", desc: "Inspect file signatures, dimensions, hashes, container structure, and embedded generator or content-credential markers.", color: TEAL },
    { icon: <BookOpen size={22} />, title: "Learning Hub", desc: "Gamified lessons, quizzes, and challenges that build media literacy skills through interactive experiences.", color: PURPLE },
    { icon: <Brain size={22} />, title: "Explainable Signals", desc: "Every result separates source, evidence, language, and confidence signals so users can inspect the reasoning.", color: AMBER },
    { icon: <Trophy size={22} />, title: "Leaderboards & XP", desc: "Earn points, unlock badges, and compete with classmates to become a certified Truth Guardian.", color: GREEN },
    { icon: <GraduationCap size={22} />, title: "Teacher Dashboard", desc: "Assign challenges, track student progress, and measure class-wide media literacy growth in real time.", color: "#EF4444" },
  ];

  const stats = bootstrap?.landing?.stats ?? [
    { value: "5", label: "Open Evidence Sources" },
    { value: "3", label: "Learning-to-Action Stages" },
    { value: "100%", label: "Visible Score Components" },
    { value: "30", label: "Curated Regression Cases" },
  ];

  const testimonials = bootstrap?.landing?.testimonials ?? [
    { name: "Analyze", role: "Student workflow", content: "Turn a viral post into explicit claims, evidence links, confidence, limitations, and concrete verification steps.", avatar: "01" },
    { name: "Learn", role: "Targeted intervention", content: "Convert the weaknesses found during analysis into a short lesson and source-ranking challenge.", avatar: "02" },
    { name: "Act", role: "Teacher workflow", content: "Give educators an intervention-ready summary while keeping simulated demo outcomes clearly labeled.", avatar: "03" },
  ];

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
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
            <button onClick={() => onNavigate("dashboard")} className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors px-4 py-2">Log in</button>
            <button onClick={() => onNavigate("dashboard")} className="text-sm font-semibold text-white px-4 py-2 rounded-lg transition-all hover:opacity-90 shadow-sm" style={{ background: `linear-gradient(135deg, ${BLUE}, #1d4ed8)` }}>
              Get Started Free
            </button>
          </div>
          <button className="md:hidden" aria-label="Toggle navigation menu" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t border-slate-100 bg-white px-6 py-4 flex flex-col gap-4">
            <a href="#features" className="text-sm font-medium text-slate-700">Features</a>
            <a href="#how" className="text-sm font-medium text-slate-700">How It Works</a>
            <button onClick={() => onNavigate("dashboard")} className="text-sm font-semibold text-white px-4 py-2.5 rounded-lg w-full" style={{ background: BLUE }}>Get Started Free</button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden max-w-full">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-[0.06]" style={{ background: `radial-gradient(circle, ${BLUE}, transparent)` }} />
          <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full opacity-[0.06]" style={{ background: `radial-gradient(circle, ${TEAL}, transparent)` }} />
        </div>
        <div className="max-w-6xl mx-auto px-6 pt-14 pb-20 md:pt-20 md:pb-24 grid lg:grid-cols-2 gap-10 lg:gap-12 items-center min-w-0 max-w-full">
          <div className="min-w-0 max-w-[342px] sm:max-w-xl lg:max-w-none">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-100 bg-blue-50 mb-6">
              <Sparkles size={14} style={{ color: BLUE }} />
              <span className="text-xs font-semibold" style={{ color: BLUE }}>AI-Powered Media Literacy</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 leading-[1.08] tracking-tight mb-6">
              Navigate<br />
              <span style={{ background: `linear-gradient(135deg, ${BLUE}, ${TEAL})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Information
              </span><br />
              with Confidence.
            </h1>
            <p className="text-base sm:text-xl text-slate-500 leading-relaxed mb-8 max-w-[342px] sm:max-w-md">
              Evidence-guided media literacy for the next generation. Inspect claims, verify sources, and learn what uncertainty means before sharing.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <button onClick={() => onNavigate("analyzer")} className="w-full max-w-[342px] sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5" style={{ background: `linear-gradient(135deg, ${BLUE}, #1d4ed8)` }}>
                <Search size={18} />
                Analyze Content
              </button>
              <button onClick={() => onNavigate("learning")} className="w-full max-w-[342px] sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all hover:-translate-y-0.5 border border-slate-200 text-slate-700 bg-white hover:border-blue-200 hover:text-blue-700">
                <Play size={18} />
                Start Learning
              </button>
            </div>
            <div className="flex items-center gap-4 min-w-0 max-w-full overflow-hidden">
              <div className="flex -space-x-2">
                {["AO","KD","ZM","ER"].map(a => (
                  <div key={a} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white" style={{ background: `linear-gradient(135deg, ${BLUE}, ${TEAL})` }}>{a}</div>
                ))}
              </div>
              <p className="text-sm text-slate-500 min-w-0 leading-snug"><span className="font-semibold text-slate-700">Hackathon prototype</span> · transparent by design</p>
            </div>
          </div>

          {/* Hero illustration */}
          <div className="relative hidden sm:block w-full max-w-xl lg:max-w-none mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-6 border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: BLUE + "15" }}>
                    <Shield size={16} style={{ color: BLUE }} />
                  </div>
                  <span className="font-semibold text-slate-800 text-sm">Content Analysis</span>
                </div>
                <Chip label="Evidence review" color={BLUE} bg={BLUE + "15"} />
              </div>
              <div className="bg-slate-50 rounded-xl p-3 mb-4 text-xs font-mono text-slate-500 border border-slate-100 break-all">
                https://example-news.com/viral-story-2024
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: "Readiness", value: "72/100", color: AMBER },
                  { label: "Evidence", value: "Mixed", color: AMBER },
                  { label: "Emotional Tone", value: "Neutral", color: BLUE },
                  { label: "Confidence", value: "64%", color: BLUE },
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
                  <p className="text-xs text-blue-700 leading-relaxed">Two related sources were found. Review whether they support the exact claim; related text is not proof.</p>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 left-2 sm:-left-4 bg-white rounded-2xl shadow-lg px-3 py-2 border border-slate-100 flex items-center gap-2">
              <span className="text-lg">🔥</span>
              <div>
                <p className="text-[10px] text-slate-400">Current Streak</p>
                <p className="text-sm font-bold text-slate-800">14 Days</p>
              </div>
            </div>
            <div className="absolute -bottom-4 right-2 sm:-right-4 bg-white rounded-2xl shadow-lg px-3 py-2 border border-slate-100 flex items-center gap-2">
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
              { step: "02", title: "Signal Analysis", desc: "TruthQuest separates source context, evidence matches, language signals, and analysis confidence.", icon: <Brain size={20} /> },
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
          <h2 className="text-3xl font-extrabold text-white mb-3">Prototype capabilities we can demonstrate</h2>
          <p className="text-blue-200 mb-14">Measured product facts—not invented traction or accuracy.</p>
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
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: AMBER }}>Core Workflow</p>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">From suspicious post to teacher action</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(3)].map((_, i) => <Star key={i} size={14} fill={AMBER} color={AMBER} />)}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-6">{t.content}</p>
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

      {/* Trust */}
      <section id="trust" className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: BLUE }}>Built For Responsible Use</p>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Clear limits, safer decisions</h2>
            <p className="text-slate-500 mt-3 max-w-2xl mx-auto">TruthQuest AI is a learning and verification assistant. Scores are guidance, not final proof, and users should confirm important claims with independent sources.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { title: "Human judgment first", body: "Every result includes recommendations so students learn how to verify claims instead of blindly trusting an AI score.", icon: <Brain size={20} /> },
              { title: "Transparent signals", body: "Credibility, bias, emotion, source reliability, and fact-confidence signals are shown separately for easier review.", icon: <Eye size={20} /> },
              { title: "Privacy-aware workflow", body: "Uploaded content is used for analysis previews in this product preview. Production deployments should document retention and school data policies.", icon: <Shield size={20} /> },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: BLUE + "12", color: BLUE }}>{item.icon}</div>
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.body}</p>
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
              <button onClick={() => onNavigate("dashboard")} className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5" style={{ background: `linear-gradient(135deg, ${BLUE}, #1d4ed8)` }}>
                <Zap size={18} /> Get Started Free
              </button>
              <button onClick={() => onNavigate("teacher")} className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold border border-slate-200 text-slate-700 bg-white hover:border-blue-200 transition-all">
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
            <button type="button" onClick={() => onNavigate("privacy")} className="hover:text-white transition-colors">Privacy</button>
            <button type="button" onClick={() => onNavigate("terms")} className="hover:text-white transition-colors">Terms</button>
            <a href="mailto:hello@truthquest.ai" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LegalPage({ type, onNavigate }: { type: "privacy" | "terms"; onNavigate: (screen: Screen) => void }) {
  const isPrivacy = type === "privacy";
  const sections = isPrivacy
    ? [
      ["Data Use", "This prototype processes submitted URLs, text, and uploaded media in memory to generate verification and media-literacy feedback. It has no account database. A production deployment must publish retention, school-data controls, and subprocessors before launch."],
      ["Student Safety", "Schools should configure accounts, classroom access, and reporting rules according to local policy. The app should not be used to collect sensitive student information unless a signed data agreement is in place."],
      ["Contact", "For privacy questions, contact hello@truthquest.ai."],
    ]
    : [
      ["Educational Tool", "TruthQuest AI provides learning-oriented analysis and should not be treated as legal, medical, financial, or definitive factual advice."],
      ["AI Limitations", "Scores can be wrong. Users are responsible for checking primary sources, publication dates, author credentials, and independent references before making decisions."],
      ["Acceptable Use", "Do not upload private, harmful, illegal, or non-consensual content. Schools and organizations should define moderation and escalation rules before deployment."],
    ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button type="button" onClick={() => onNavigate("landing")} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${BLUE}, ${TEAL})` }}>
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-900">TruthQuest <span style={{ color: BLUE }}>AI</span></span>
          </button>
          <button type="button" onClick={() => onNavigate("dashboard")} className="text-sm font-semibold text-white px-4 py-2 rounded-lg" style={{ background: BLUE }}>
            Open App
          </button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-14">
        <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: BLUE }}>{isPrivacy ? "Privacy" : "Terms"}</p>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">{isPrivacy ? "Privacy Policy" : "Terms of Use"}</h1>
        <p className="text-slate-500 leading-relaxed mb-8 max-w-2xl">
          This page is launch-ready placeholder copy for the prototype. Replace it with reviewed legal language before public deployment.
        </p>
        <div className="space-y-4">
          {sections.map(([title, body]) => (
            <section key={title} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h2 className="font-bold text-slate-900 mb-2">{title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{body}</p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARD LAYOUT
// ══════════════════════════════════════════════════════════════════════════════
function AppShell({ screen, onNavigate, progress, children }: { screen: Screen; onNavigate: (s: Screen) => void; progress: DemoProgress; children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [presenterMode, setPresenterMode] = useState(true);
  const demoStepsDone = [progress.analysisComplete, progress.quizWon, progress.challengeWon].filter(Boolean).length;
  const totalXp = 3640 + (progress.analysisComplete ? 75 : 0) + (progress.quizWon ? 150 : 0) + (progress.challengeWon ? 225 : 0);
  const presenterSteps = [
    { label: "Analyze", done: progress.analysisComplete, screen: "analyzer" as Screen },
    { label: "Challenge", done: progress.quizWon, screen: "quiz" as Screen },
    { label: "Teacher", done: progress.challengeWon, screen: "teacher" as Screen },
    { label: "Impact", done: progress.challengeWon, screen: "impact" as Screen },
  ];
  const mobileNav = navItems.filter((item) => ["dashboard", "analyzer", "learning", "quiz", "teacher"].includes(item.screen));

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Sidebar */}
      <aside className={cn(
        "hidden md:flex flex-shrink-0 bg-white border-r border-slate-100 flex-col transition-all duration-300 z-20",
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
              onClick={() => onNavigate(item.screen)}
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
          {sidebarOpen && (
            <div className="mb-3 rounded-xl border border-blue-100 bg-blue-50 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-blue-900">Live Judge Flow</p>
                <span className="text-xs font-bold" style={{ color: BLUE }}>{demoStepsDone}/3</span>
              </div>
              <div className="h-1.5 bg-white rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full transition-all" style={{ width: `${(demoStepsDone / 3) * 100}%`, background: `linear-gradient(90deg, ${BLUE}, ${TEAL})` }} />
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Analyze a viral post, win the challenge, then show teacher impact.
              </p>
            </div>
          )}
          {sidebarOpen ? (
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold">JD</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">Jordan Davis</p>
                <p className="text-[10px] text-slate-400">Level {progress.challengeWon ? 8 : 7} · {totalXp.toLocaleString()} XP</p>
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
            <button aria-label="Toggle sidebar" onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden md:block p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500">
              <Menu size={18} />
            </button>
            <div className="md:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${BLUE}, ${TEAL})` }}>
                <Shield size={16} className="text-white" />
              </div>
              <span className="font-bold text-slate-900 text-sm">TruthQuest <span style={{ color: BLUE }}>AI</span></span>
            </div>
            <div className="relative hidden sm:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="pl-8 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:border-transparent" style={{ "--tw-ring-color": BLUE } as React.CSSProperties} placeholder="Search articles, topics..." aria-label="Search articles and topics" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button aria-label="Notifications" className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 relative">
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
                <span className="text-xs font-bold" style={{ color: BLUE }}>{totalXp.toLocaleString()} XP</span>
              </div>
            </div>
            <button onClick={() => setPresenterMode((value) => !value)} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              <Monitor size={13} /> Presenter
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
          {children}
        </main>

        {presenterMode && (
          <div className="hidden md:block fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[min(760px,calc(100vw-2rem))]">
            <div className="rounded-2xl border border-blue-100 bg-white/95 backdrop-blur shadow-lg p-3">
              <div className="flex items-center gap-3">
                <div className="px-3">
                  <p className="text-xs font-bold text-slate-900">Presenter Mode</p>
                  <p className="text-[11px] text-slate-500">One story, four clicks</p>
                </div>
                <div className="flex-1 grid grid-cols-4 gap-2">
                  {presenterSteps.map((step, index) => (
                    <button
                      key={step.label}
                      onClick={() => onNavigate(step.screen)}
                      className={cn("rounded-xl border px-3 py-2 text-left transition-colors", step.done ? "border-green-100 bg-green-50" : screen === step.screen ? "border-blue-200 bg-blue-50" : "border-slate-100 bg-slate-50 hover:bg-blue-50")}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: step.done ? GREEN : BLUE }}>Step {index + 1}</p>
                      <p className="text-xs font-bold text-slate-800 truncate">{step.label}</p>
                    </button>
                  ))}
                </div>
                <button onClick={() => setPresenterMode(false)} className="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100" aria-label="Hide presenter mode">
                  <X size={15} className="mx-auto" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-100 px-2 pb-3 pt-2">
          <div className="grid grid-cols-5 gap-1">
            {mobileNav.map((item) => (
              <button
                key={item.label}
                onClick={() => onNavigate(item.screen)}
                className={cn("flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-semibold", screen === item.screen ? "text-white" : "text-slate-500")}
                style={screen === item.screen ? { background: `linear-gradient(135deg, ${BLUE}, #1d4ed8)` } : {}}
              >
                {item.icon}
                <span className="truncate max-w-full">{item.label.replace("Learning Hub", "Learn").replace("Teacher View", "Teacher")}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARD HOME
// ══════════════════════════════════════════════════════════════════════════════
function Dashboard({ setScreen, bootstrap, progress }: { setScreen: (s: Screen) => void; bootstrap: AppBootstrap | null; progress: DemoProgress }) {
  const recentAnalyses = bootstrap?.dashboard?.recentAnalyses ?? [
    { title: "Government unveils new AI policy draft", source: "techpolicy.gov", score: 91, bias: "Low", time: "2h ago", tag: "Politics" },
    { title: "Miracle berry cures diabetes, doctors hate this", source: "healthhacks.net", score: 22, bias: "High", time: "5h ago", tag: "Health" },
    { title: "Youth unemployment hits 5-year low in Q3", source: "reuters.com", score: 87, bias: "Low", time: "1d ago", tag: "Economy" },
    { title: "Celebrity endorses questionable crypto scheme", source: "cryptonews24.co", score: 38, bias: "High", time: "2d ago", tag: "Finance" },
  ];
  const literacyScore = progress.challengeWon ? 91 : progress.quizWon ? 88 : progress.analysisComplete ? 86 : 84;
  const totalXp = 3640 + (progress.analysisComplete ? 75 : 0) + (progress.quizWon ? 150 : 0) + (progress.challengeWon ? 225 : 0);
  const demoRecentAnalyses = progress.analysisComplete
    ? [
      { title: "Viral school phone-ban rumor", source: "live classroom input", score: 31, bias: "High", time: "Just now", tag: "Education" },
      ...recentAnalyses,
    ]
    : recentAnalyses;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Good morning, Jordan 👋</h1>
          <p className="text-slate-500 text-sm mt-0.5">You have analyzed <span className="font-semibold text-slate-700">{progress.analysisComplete ? 48 : 47} articles</span> this month. Keep it up!</p>
        </div>
        <button onClick={() => setScreen("analyzer")} className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90" style={{ background: `linear-gradient(135deg, ${BLUE}, #1d4ed8)` }}>
          <Search size={16} /> Analyze Content
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Target size={20} />} label="Literacy Score" value={`${literacyScore}`} sub={progress.challengeWon ? "↑ 13 points after challenge" : "↑ 6 points this week"} color={BLUE} />
        <StatCard icon={<Flame size={20} />} label="Day Streak" value="14" sub="Best: 21 days" color={AMBER} />
        <StatCard icon={<Search size={20} />} label="Analyses Done" value={`${progress.analysisComplete ? 48 : 47}`} sub="This month" color={TEAL} />
        <StatCard icon={<Trophy size={20} />} label="Badges Earned" value={progress.quizWon ? "5/8" : "4/8"} sub={progress.quizWon ? "Truth Guardian unlocked" : "4 more to unlock"} color={PURPLE} />
      </div>

      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: BLUE }}>Live Judge Path</p>
            <h2 className="font-extrabold text-slate-900 text-lg">Analyze a real claim and turn it into measurable classroom growth</h2>
            <p className="text-sm text-slate-500 mt-1">Paste any URL or text, run live analysis, complete the challenge, then open Teacher View to see Jordan move from at-risk to on-track.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Chip label={progress.analysisComplete ? "Analysis done" : "1. Analyze"} color={progress.analysisComplete ? GREEN : BLUE} bg={(progress.analysisComplete ? GREEN : BLUE) + "15"} />
            <Chip label={progress.quizWon ? "Quiz won" : "2. Win quiz"} color={progress.quizWon ? GREEN : AMBER} bg={(progress.quizWon ? GREEN : AMBER) + "15"} />
            <Chip label={progress.challengeWon ? "Teacher impact ready" : "3. Show impact"} color={progress.challengeWon ? GREEN : PURPLE} bg={(progress.challengeWon ? GREEN : PURPLE) + "15"} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={() => setScreen("analyzer")} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: `linear-gradient(135deg, ${BLUE}, #1d4ed8)` }}>
            Start Live Analysis
          </button>
          <button onClick={() => setScreen("teacher")} className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50">
            Teacher Impact
          </button>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Score trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Media Literacy Score Trend</h3>
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
            {demoRecentAnalyses.slice(0, 5).map(a => (
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
            {modules.slice(0, 4).map((m) => {
              const moduleProgress = m.title === "Source Verification" && progress.challengeWon ? 100 : m.progress;
              return (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="text-lg flex-shrink-0">{m.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-slate-700 truncate">{m.title}</p>
                      <span className="text-xs font-bold ml-2" style={{ color: moduleProgress === 100 ? GREEN : BLUE, fontFamily: "DM Mono, monospace" }}>{moduleProgress}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${moduleProgress}%`, background: moduleProgress === 100 ? GREEN : `linear-gradient(90deg, ${BLUE}, ${TEAL})` }} />
                    </div>
                  </div>
                  {(m.completed || moduleProgress === 100) && <CheckCircle size={14} style={{ color: GREEN }} className="flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CONTENT ANALYZER
// ══════════════════════════════════════════════════════════════════════════════
function ContentAnalyzer({ setScreen, onAnalysisComplete }: { setScreen: (s: Screen) => void; onAnalysisComplete: () => void }) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"url" | "text" | "image">("url");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | "done">(null);
  const [analysis, setAnalysis] = useState<ContentAnalysisResponse | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<"checking" | "live" | "offline">("checking");
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let active = true;
    checkBackendHealth()
      .then((healthy) => {
        if (active) setBackendStatus(healthy ? "live" : "offline");
      })
      .catch(() => {
        if (active) setBackendStatus("offline");
      });
    return () => {
      active = false;
    };
  }, []);

  const analyze = async () => {
    const payloadInput = mode === "image" ? imagePreview ?? "" : input;
    if (!payloadInput) {
      setInputError(mode === "image" ? "Upload an image before analyzing." : "Enter a URL or text before analyzing.");
      setLoading(false);
      return;
    }

    setInputError(null);
    setAnalysisError(null);
    setLoading(true);
    try {
      const response = await analyzeContent({ mode, input: payloadInput });
      setAnalysis(response);
      setResult("done");
      onAnalysisComplete();
    } catch (error) {
      setAnalysis(null);
      setResult(null);
      setAnalysisError(error instanceof Error ? error.message : "Content analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadScenario = (scenario = demoScenarios[0]) => {
    setMode("text");
    setInput(scenario.input);
    setImagePreview(null);
    setInputError(null);
    setAnalysisError(null);
    setLoading(false);
    setAnalysis(null);
    setResult(null);
  };

  const score = analysis?.score ?? 0;
  const metrics = analysis?.metrics ?? [];
  const recommendations = analysis?.recommendations ?? [];
  const chips = analysis?.chips ?? [];
  const sourceSignals = analysis?.sourceSignals ?? [];
  const claims = analysis?.claims ?? [];
  const evidenceSources = analysis?.evidenceSources ?? [];
  const scoreBreakdown = analysis?.scoreBreakdown ?? [];
  const analysisStatus = analysis?.analysisStatus ?? "insufficient_evidence";
  const analysisConfidence = analysis?.analysisConfidence ?? 0;
  const limitations = analysis?.limitations ?? [
    "This result came from an older or partial analyzer response. Restart the backend to load the current evidence and confidence fields.",
  ];
  const statusColor = (status: string) => {
    if (status === "positive") return GREEN;
    if (status === "negative") return "#EF4444";
    if (status === "warning") return AMBER;
    return BLUE;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Content Analyzer</h1>
        <p className="text-slate-500 text-sm mt-1">Paste a URL or text for claim analysis, or upload an image for real file, metadata, provenance, and integrity checks.</p>
      </div>

      <div className={cn("rounded-2xl border p-5", backendStatus === "live" ? "bg-green-50 border-green-100" : backendStatus === "checking" ? "bg-blue-50 border-blue-100" : "bg-amber-50 border-amber-100")}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: backendStatus === "live" ? GREEN : backendStatus === "offline" ? AMBER : BLUE }}>Live Analysis Status</p>
            <h2 className="font-extrabold text-slate-900">{backendStatus === "live" ? "Backend connected. Analyze any URL or text in real time." : backendStatus === "checking" ? "Checking backend connection..." : "Backend not connected yet."}</h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              {backendStatus === "live"
                ? "The report below will come from the FastAPI analyzer, including live URL fetching, evidence-source checks, and real uploaded-image inspection."
                : "Start the FastAPI backend on port 8000 before presenting live analysis. Sample inputs below still help you test the flow."}
            </p>
          </div>
          <Chip
            label={backendStatus === "live" ? "Live backend" : backendStatus === "checking" ? "Checking" : "Start backend"}
            color={backendStatus === "live" ? GREEN : backendStatus === "checking" ? BLUE : AMBER}
            bg={(backendStatus === "live" ? GREEN : backendStatus === "checking" ? BLUE : AMBER) + "15"}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-5 space-y-4 shadow-sm">
        <div>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: BLUE }}>Live Test Starters</p>
              <h2 className="font-extrabold text-slate-900">Use these as input, then run real analysis</h2>
            </div>
            <Chip label="No canned result" color={TEAL} bg={TEAL + "15"} />
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">These examples only fill the text box. The score, claims, evidence, and recommendations are produced when you click Analyze Content.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {demoScenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => loadScenario(scenario)}
              className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-left hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              <p className="text-sm font-bold text-slate-900">{scenario.label}</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{scenario.description}</p>
              <p className="text-xs font-bold mt-3" style={{ color: BLUE }}>Use as live input</p>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        {/* Mode tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-5 w-fit">
          {([["url", <Link size={14} />, "URL"], ["text", <FileText size={14} />, "Text"], ["image", <Image size={14} />, "Image"]] as const).map(([m, icon, label]) => (
            <button
              key={m}
              onClick={() => { setMode(m as "url" | "text" | "image"); setResult(null); setAnalysis(null); setAnalysisError(null); setInput(""); if (m !== "image") setImagePreview(null); }}
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
            <label className="flex flex-col items-center justify-center gap-2 cursor-pointer">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  setInputError(null);
                  if (!file.type.startsWith("image/")) {
                    setImagePreview(null);
                    setInputError("Please upload a PNG, JPG, or WEBP image.");
                    return;
                  }
                  if (file.size > 10 * 1024 * 1024) {
                    setImagePreview(null);
                    setInputError("Image is too large. Maximum size is 10MB.");
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = () => setImagePreview(reader.result as string);
                  reader.onerror = () => setImagePreview(null);
                  reader.readAsDataURL(file);
                }}
              />
              {imagePreview ? (
                <img src={imagePreview} alt="Uploaded preview" className="max-h-24 rounded-md object-contain" />
              ) : (
                <>
                  <Upload size={24} className="text-slate-400" />
                  <p className="text-sm text-slate-500">Drop image here or <span className="font-semibold" style={{ color: BLUE }}>browse</span></p>
                  <p className="text-xs text-slate-400">PNG, JPG, WEBP up to 10MB. Checks metadata locally and extracts text when Tesseract OCR is installed.</p>
                </>
              )}
            </label>
          </div>
        )}
        {inputError && <p className="mt-3 text-sm text-red-600">{inputError}</p>}

        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-slate-400">Analysis checks source, claims, language, and available evidence signals</p>
          <button
            onClick={analyze}
            disabled={loading || (mode === "image" ? !imagePreview : !input.trim())}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${BLUE}, #1d4ed8)` }}
          >
            {loading ? <RefreshCw size={15} className="animate-spin" /> : <Search size={15} />}
            {loading ? "Analyzing…" : "Analyze Content"}
          </button>
        </div>
      </div>
      {analysisError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-800">
          <strong className="font-bold">Analysis failed:</strong> {analysisError}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center animate-pulse" style={{ background: `linear-gradient(135deg, ${BLUE}20, ${TEAL}20)` }}>
            <Brain size={28} style={{ color: BLUE }} />
          </div>
          <p className="font-semibold text-slate-700">Checking source and claim signals…</p>
          <div className="w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full animate-pulse" style={{ width: "60%", background: `linear-gradient(90deg, ${BLUE}, ${TEAL})` }} />
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {["Checking sources", "Analyzing language", "Extracting claims", "Finding related evidence"].map(s => (
              <div key={s} className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-full text-xs text-blue-600 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {result === "done" && analysis && !loading && (
        <div className="space-y-4">
          {/* Score row */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex flex-wrap items-center gap-6">
              <ScoreMeter score={score} size={110} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-slate-900 text-lg">{mode === "image" ? "File Review Readiness" : "Verification Readiness"}: {score}/100</h3>
                  {analysisStatus === "insufficient_evidence" ? <AlertTriangle size={18} style={{ color: AMBER }} /> : <CheckCircle size={18} style={{ color: GREEN }} />}
                </div>
                {(analysis?.sourceUrl || analysis?.sourceTitle) && (
                  <p className="text-xs text-slate-400 mb-2 break-all">
                    {analysis?.sourceTitle ? `${analysis.sourceTitle} · ` : ""}
                    {analysis?.sourceUrl}
                  </p>
                )}
                <p className="text-sm text-slate-600 mb-4">{analysis.summary}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Chip
                    label={analysisStatus === "insufficient_evidence" ? "Insufficient evidence" : analysisStatus === "mixed" ? "Mixed evidence" : "Possible corroboration"}
                    color={analysisStatus === "insufficient_evidence" ? AMBER : analysisStatus === "mixed" ? BLUE : GREEN}
                    bg={(analysisStatus === "insufficient_evidence" ? AMBER : analysisStatus === "mixed" ? BLUE : GREEN) + "15"}
                  />
                  <Chip label={`${analysisConfidence}% analysis confidence`} color={BLUE} bg={BLUE + "15"} />
                </div>
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

          {/* Transparent scoring */}
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={16} style={{ color: TEAL }} />
                <h4 className="font-bold text-slate-900 text-sm">Source Signals</h4>
              </div>
              <div className="space-y-2">
                {sourceSignals.map((signal) => (
                  <div key={signal.label} className="flex items-start justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{signal.label}</p>
                      <p className="text-xs text-slate-500 break-all">{signal.value}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: statusColor(signal.status) }}>
                      {signal.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 size={16} style={{ color: BLUE }} />
                <h4 className="font-bold text-slate-900 text-sm">Verification Readiness Breakdown</h4>
              </div>
              <div className="space-y-3">
                {scoreBreakdown.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                      <span className="text-xs font-mono text-slate-500">{item.score}/100 · {item.weight}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${item.score}%`, background: item.score >= 75 ? GREEN : item.score >= 50 ? AMBER : "#EF4444" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} style={{ color: AMBER }} />
              <h4 className="font-bold text-amber-900 text-sm">What this analysis cannot prove</h4>
            </div>
            <ul className="space-y-2">
              {limitations.map((limitation) => <li key={limitation} className="text-xs text-amber-900 leading-relaxed">• {limitation}</li>)}
            </ul>
          </div>

          {/* Claims and evidence */}
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={16} style={{ color: AMBER }} />
                <h4 className="font-bold text-slate-900 text-sm">Extracted Claims</h4>
              </div>
              {claims.length > 0 ? (
                <div className="space-y-3">
                  {claims.map((claim) => (
                    <div key={claim.claim} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="text-xs font-semibold text-slate-800 leading-relaxed">{claim.claim}</p>
                        <span className="text-xs font-mono text-slate-500 flex-shrink-0">{claim.confidence}%</span>
                      </div>
                      <Chip label={claim.status} color={claim.status.includes("corroboration") ? GREEN : claim.status.includes("Related") || claim.status.includes("Present") ? AMBER : "#EF4444"} bg={(claim.status.includes("corroboration") ? GREEN : claim.status.includes("Related") || claim.status.includes("Present") ? AMBER : "#EF4444") + "15"} />
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">{claim.evidence}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No concrete factual claims were extracted from this input.</p>
              )}
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Link size={16} style={{ color: TEAL }} />
                <h4 className="font-bold text-slate-900 text-sm">Evidence Sources Found</h4>
              </div>
              {evidenceSources.length > 0 ? (
                <div className="space-y-3">
                  {evidenceSources.map((source) => (
                    <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="block rounded-xl border border-slate-100 bg-slate-50 p-3 hover:border-blue-200 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">{source.title}</p>
                          <p className="text-xs text-slate-500 break-all">{source.url}</p>
                          <p className="text-xs text-slate-400 mt-1">{source.type}</p>
                        </div>
                        <span className="text-xs font-mono text-slate-500 flex-shrink-0">{source.relevance}%</span>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No trusted outbound or search evidence was detected. Cross-check this manually with independent sources.</p>
              )}
            </div>
          </div>

          {/* AI summary + recommendations */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} style={{ color: BLUE }} />
                <h4 className="font-bold text-blue-900 text-sm">Evidence Summary</h4>
              </div>
                <p className="text-sm text-blue-800 leading-relaxed">{analysis.summary}</p>
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
            <button onClick={() => setScreen("quiz")} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: BLUE }}>
              <Trophy size={12} /> Take Challenge
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-blue-100 bg-white" style={{ color: BLUE }}>
              <Share2 size={12} /> Share
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MEDIA INTEGRITY CHECK
// ══════════════════════════════════════════════════════════════════════════════
function DeepfakeDetector() {
  const [mediaType, setMediaType] = useState<"image" | "video" | "audio">("image");
  const [analyzing, setAnalyzing] = useState(false);
  const [done, setDone] = useState(false);
  const [analysis, setAnalysis] = useState<DeepfakeAnalysisResponse | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const run = async () => {
    if (!selectedMedia) {
      setUploadError(`Choose a ${mediaType} file before running the integrity check.`);
      return;
    }
    setAnalyzing(true);
    setDone(false);
    setAnalysisError(null);
    try {
      const response = await analyzeDeepfake({ mediaType, file: selectedMedia });
      setAnalysis(response);
      setDone(true);
    } catch (error) {
      setAnalysis(null);
      setAnalysisError(error instanceof Error ? error.message : "Media integrity analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const indicators = analysis?.indicators ?? [];
  const riskChip = analysis
    ? analysis.probability >= 70
      ? { label: "High Risk", color: "#EF4444", bg: "#FEF2F2" }
      : analysis.probability >= 45
        ? { label: "Review Needed", color: AMBER, bg: AMBER + "15" }
        : { label: "Lower Risk", color: GREEN, bg: GREEN + "15" }
    : null;

  const maxBytes = mediaType === "video" ? 500 * 1024 * 1024 : mediaType === "audio" ? 50 * 1024 * 1024 : 20 * 1024 * 1024;
  const accept = mediaType === "video" ? "video/mp4,video/quicktime,video/x-msvideo" : mediaType === "audio" ? "audio/mpeg,audio/wav,audio/mp4" : "image/png,image/jpeg,image/webp";
  const allowedExtensions = mediaType === "video" ? [".mp4", ".mov", ".avi"] : mediaType === "audio" ? [".mp3", ".wav", ".m4a"] : [".png", ".jpg", ".jpeg", ".webp"];

  const selectMedia = (file: File | undefined) => {
    setUploadError(null);
    setAnalysisError(null);
    setDone(false);
    setAnalysis(null);
    if (!file) return;
    const normalizedName = file.name.toLowerCase();
    const hasAllowedExtension = allowedExtensions.some((extension) => normalizedName.endsWith(extension));
    const hasExpectedMime = file.type.startsWith(`${mediaType}/`);
    if (!hasExpectedMime && !hasAllowedExtension) {
      setSelectedMedia(null);
      setUploadError(`Please choose a valid ${mediaType} file.`);
      return;
    }
    if (file.size > maxBytes) {
      setSelectedMedia(null);
      setUploadError(`File is too large. Maximum size is ${Math.round(maxBytes / 1024 / 1024)}MB.`);
      return;
    }
    setSelectedMedia(file);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Media Integrity & Provenance Check</h1>
        <p className="text-slate-500 text-sm mt-1">Inspect file signatures, metadata, dimensions, hashes, and embedded generator markers. This is not a visual or audio deepfake classifier.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        {/* Type selector */}
        <div className="flex gap-3 mb-6">
          {([["image", <Image size={16} />, "Image"], ["video", <Video size={16} />, "Video"], ["audio", <Mic size={16} />, "Audio"]] as const).map(([t, icon, label]) => (
            <button
              key={t}
              onClick={() => { setMediaType(t as "image" | "video" | "audio"); setSelectedMedia(null); setUploadError(null); setAnalysisError(null); setDone(false); setAnalysis(null); }}
              className={cn("flex items-center gap-2 flex-1 justify-center py-3 rounded-xl border-2 font-semibold text-sm transition-all", mediaType === t ? "text-white border-transparent shadow-sm" : "border-slate-200 text-slate-600 hover:border-slate-300")}
              style={mediaType === t ? { background: `linear-gradient(135deg, ${BLUE}, ${TEAL})`, borderColor: "transparent" } : {}}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Upload zone */}
        <label className="h-52 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-blue-300 transition-colors cursor-pointer group">
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(event) => selectMedia(event.target.files?.[0])}
          />
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: `linear-gradient(135deg, ${BLUE}15, ${TEAL}15)` }}>
            <Upload size={24} style={{ color: BLUE }} />
          </div>
          <div className="text-center">
            <p className="font-semibold text-slate-700 text-sm">
              {selectedMedia ? selectedMedia.name : <>Drop {mediaType} here or <span style={{ color: BLUE }}>browse files</span></>}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {mediaType === "image" && "PNG, JPG, WEBP up to 20MB"}
              {mediaType === "video" && "MP4, MOV, AVI up to 500MB"}
              {mediaType === "audio" && "MP3, WAV, M4A up to 50MB"}
            </p>
          </div>
        </label>
        {uploadError && <p className="mt-3 text-sm text-red-600">{uploadError}</p>}

        <div className="flex justify-end mt-4">
          <button onClick={run} disabled={analyzing || !selectedMedia} className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: `linear-gradient(135deg, ${BLUE}, #1d4ed8)` }}>
            {analyzing ? <><RefreshCw size={15} className="animate-spin" /> Inspecting…</> : <><Eye size={15} /> Check File Integrity</>}
          </button>
        </div>
      </div>
      {analysisError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-800">
          <strong className="font-bold">Analysis failed:</strong> {analysisError}
        </div>
      )}

      {/* Results */}
      {done && analysis && !analyzing && (
        <div className="space-y-4">
          {/* Main verdict */}
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
            <div className="flex flex-wrap items-center gap-6">
              <div className="relative">
                <ScoreMeter score={analysis.score} size={110} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={20} style={{ color: "#EF4444" }} />
                  <h3 className="font-bold text-slate-900 text-lg">{analysis.verdict}</h3>
                </div>
                <p className="text-sm text-slate-600 mb-4">{analysis.summary}</p>
                <div className="flex flex-wrap gap-2">
                  <Chip label={analysis.probabilityLabel} color={riskChip?.color ?? "#EF4444"} bg={riskChip?.bg ?? "#FEF2F2"} />
                  {riskChip && <Chip label={riskChip.label} color={riskChip.color} bg={riskChip.bg} />}
                  <Chip label="Verify Before Sharing" color={AMBER} bg={AMBER + "15"} />
                </div>
              </div>
            </div>
          </div>

          {/* Detection indicators */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-5">File and Provenance Signals</h3>
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
                {analysis.metadata.map((item) => (
                  <div key={item.label} className="flex justify-between"><span className="text-slate-400">{item.label}:</span><span>{item.value}</span></div>
                ))}
              </div>
            </div>
            <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
              <h4 className="font-bold text-red-900 text-sm mb-3 flex items-center gap-2"><Sparkles size={14} style={{ color: "#EF4444" }} /> Scope and Findings</h4>
              <p className="text-xs text-red-800 leading-relaxed">{analysis.aiSummary}</p>
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
function LearningHub({ setScreen, bootstrap, progress, onChallengeComplete }: { setScreen: (s: Screen) => void; bootstrap: AppBootstrap | null; progress: DemoProgress; onChallengeComplete: () => void }) {
  const [view, setView] = useState<"modules" | "leaderboard">("modules");
  const courses = (bootstrap?.learning?.modules?.length ? bootstrap.learning.modules : modules)
    .map((module, index) => {
      const normalized = normalizeLearningModule(module, modules[index] ?? modules[0]);
      if (progress.challengeWon && normalized.title === "Source Verification") {
        return { ...normalized, progress: 100, completed: true };
      }
      return normalized;
    });
  const leaderboardData = bootstrap?.learning?.leaderboard ?? leaderboard;
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [challengeModuleId, setChallengeModuleId] = useState<number | null>(null);
  const [challengeOrder, setChallengeOrder] = useState<string[]>([]);
  const [challengeSubmitted, setChallengeSubmitted] = useState(false);
  const [challengeReflection, setChallengeReflection] = useState("");
  const [challengeReflectionSubmitted, setChallengeReflectionSubmitted] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const activeModule = courses.find((course) => course.id === activeModuleId);
  const activeLesson = activeModule ? lessonLibrary[activeModule.title] ?? lessonLibrary["Spot Fake News"] : null;
  const challengeModule = courses.find((course) => course.id === challengeModuleId);
  const challengeLesson = challengeModule ? lessonLibrary[challengeModule.title] ?? lessonLibrary["Spot Fake News"] : null;

  useEffect(() => {
    if (!challengeModule || !challengeLesson) return;
    setChallengeOrder(shuffleItems(challengeLesson.challenge.items).map((item) => item.id));
    setChallengeSubmitted(false);
    setDraggedItemId(null);
  }, [challengeModuleId]);

  const setChallengeAndOpen = (moduleId: number) => {
    setActiveModuleId(null);
    setChallengeModuleId(moduleId);
    const lesson = lessonLibrary[courses.find((course) => course.id === moduleId)?.title ?? "Spot Fake News"] ?? lessonLibrary["Spot Fake News"];
    setChallengeOrder(shuffleItems(lesson.challenge.items).map((item) => item.id));
    setChallengeSubmitted(false);
    setChallengeReflection("");
    setChallengeReflectionSubmitted(false);
    setDraggedItemId(null);
  };

  const moveChallengeItem = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setChallengeOrder((current) => {
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  if (challengeModule && challengeLesson) {
    const orderedItems = challengeOrder
      .map((id) => challengeLesson.challenge.items.find((item) => item.id === id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
    const correctOrder = challengeLesson.challenge.items
      .slice()
      .sort((a, b) => b.strength - a.strength)
      .map((item) => item.id);
    const isCorrect = correctOrder.every((id, index) => orderedItems[index]?.id === id);
    const topTwo = challengeLesson.challenge.items
      .slice()
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 2);
    const reflectionText = challengeReflection.trim().toLowerCase();
    const reflectionMentionsTopTwo = topTwo.every((item) => {
      const keywords = [...challengeKeywords(item.label), ...challengeKeywords(item.detail), item.id];
      return keywords.some((keyword) => reflectionText.includes(keyword));
    });
    const reflectionHasReason = /(because|since|evidence|primary|source|stronger|original|official|document|study|provenance)/i.test(challengeReflection);
    const reflectionComplete = challengeReflectionSubmitted && reflectionHasReason && (reflectionMentionsTopTwo || reflectionText.length >= 40);
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <button onClick={() => { setChallengeModuleId(null); setChallengeSubmitted(false); setDraggedItemId(null); }} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
          <ChevronLeft size={16} /> Back to Lesson
        </button>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: challengeModule.color + "15", color: challengeModule.color }}>
              {challengeModule.icon}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: challengeModule.color }}>Lesson Challenge</p>
              <h1 className="text-2xl font-extrabold text-slate-900">{challengeModule.title}</h1>
              <p className="text-sm text-slate-500 mt-1">Drag the evidence cards into the correct order based on the lesson.</p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 mb-5">
            <p className="font-bold text-slate-900 leading-relaxed">{challengeLesson.challenge.prompt}</p>
            <p className="text-sm text-slate-500 mt-2">{challengeLesson.challenge.goal}</p>
          </div>

          <div className="space-y-3">
            {orderedItems.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => setDraggedItemId(item.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (!draggedItemId) return;
                  const fromIndex = challengeOrder.indexOf(draggedItemId);
                  moveChallengeItem(fromIndex, index);
                  setDraggedItemId(null);
                }}
                onDragEnd={() => setDraggedItemId(null)}
                className={cn(
                  "w-full text-left rounded-xl border-2 p-4 text-sm font-semibold transition-colors bg-white cursor-grab active:cursor-grabbing",
                  challengeSubmitted
                    ? orderedItems[index]?.id === correctOrder[index]
                      ? "border-green-400 bg-green-50 text-green-800"
                      : "border-red-300 bg-red-50 text-red-800"
                    : "border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50",
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.detail}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={(event) => { event.stopPropagation(); moveChallengeItem(index, Math.max(0, index - 1)); }}
                      className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                      aria-label="Move item up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={(event) => { event.stopPropagation(); moveChallengeItem(index, Math.min(orderedItems.length - 1, index + 1)); }}
                      className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                      aria-label="Move item down"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3 justify-between items-center">
            <p className="text-xs text-slate-500">Drag the cards into the strongest-to-weakest evidence order, then check your rank.</p>
            <button
              onClick={() => setChallengeSubmitted(true)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ background: `linear-gradient(135deg, ${BLUE}, #1d4ed8)` }}
            >
              Check Ranking
            </button>
          </div>

          {challengeSubmitted && (
            <div className={cn("mt-5 rounded-2xl border p-5", isCorrect ? "bg-green-50 border-green-100" : "bg-amber-50 border-amber-100")}>
              <h3 className={cn("font-bold text-sm mb-2", isCorrect ? "text-green-900" : "text-amber-900")}>
                {isCorrect ? "Correct" : "Not quite"}
              </h3>
              <p className={cn("text-sm leading-relaxed", isCorrect ? "text-green-800" : "text-amber-800")}>{challengeLesson.challenge.explanation}</p>
              <div className="mt-4 flex flex-wrap gap-3 justify-end">
                {!isCorrect && (
                  <button
                    onClick={() => {
                      setChallengeOrder(correctOrder);
                      setChallengeSubmitted(true);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-blue-200 text-sm font-semibold bg-white hover:bg-blue-50 transition-colors"
                    style={{ color: BLUE }}
                  >
                    Review Correct Order
                  </button>
                )}
                <button onClick={() => { setChallengeOrder(shuffleItems(challengeLesson.challenge.items).map((item) => item.id)); setChallengeSubmitted(false); }} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors">
                  Try Again
                </button>
              </div>
            </div>
          )}

          {challengeSubmitted && isCorrect && (
            <div className={cn("mt-5 rounded-2xl border p-5", reflectionComplete ? "bg-blue-50 border-blue-100" : "bg-white border-slate-100")}>
              <h3 className="font-bold text-sm mb-2 text-slate-900">Explain Your Ranking</h3>
              <p className="text-sm text-slate-500 mb-4">Explain why the top two items are stronger than the rest.</p>
              <textarea
                value={challengeReflection}
                onChange={(event) => {
                  setChallengeReflection(event.target.value);
                  setChallengeReflectionSubmitted(false);
                }}
                className="w-full min-h-32 resize-none rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ "--tw-ring-color": BLUE } as React.CSSProperties}
                placeholder={`Example: ${topTwo[0]?.label} is strongest because...`}
              />
              <div className="mt-4 flex flex-wrap gap-3 justify-end">
                <button onClick={() => setChallengeReflection("")} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors">
                  Clear
                </button>
                <button onClick={() => setChallengeReflectionSubmitted(true)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: `linear-gradient(135deg, ${BLUE}, #1d4ed8)` }}>
                  Submit Explanation
                </button>
              </div>
              {challengeReflectionSubmitted && (
                <div className={cn("mt-4 rounded-2xl border p-4", reflectionComplete ? "bg-green-50 border-green-100" : "bg-amber-50 border-amber-100")}>
                  <p className={cn("text-sm font-bold mb-1", reflectionComplete ? "text-green-900" : "text-amber-900")}>
                    {reflectionComplete ? "Good reasoning" : "Needs more detail"}
                  </p>
                  <p className={cn("text-sm leading-relaxed", reflectionComplete ? "text-green-800" : "text-amber-800")}>
                    {reflectionComplete
                      ? "Your explanation references the strongest evidence and gives a reason for the ranking."
                      : "Mention the top evidence items or write a short reason using evidence words like source, primary, document, study, or provenance."}
                  </p>
                </div>
              )}
            </div>
          )}

          {challengeSubmitted && reflectionComplete && (
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => {
                  onChallengeComplete();
                  setChallengeModuleId(null);
                  setChallengeSubmitted(false);
                  setChallengeReflection("");
                  setChallengeReflectionSubmitted(false);
                  setDraggedItemId(null);
                  setScreen("teacher");
                  confetti({ particleCount: 120, spread: 70, origin: { y: 0.7 } });
                }}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ background: `linear-gradient(135deg, ${BLUE}, #1d4ed8)` }}
              >
                Show Teacher Impact
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeModule && activeLesson) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <button onClick={() => setActiveModuleId(null)} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
          <ChevronLeft size={16} /> Back to Learning Hub
        </button>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="h-2" style={{ background: activeModule.completed ? GREEN : activeModule.progress > 0 ? `linear-gradient(90deg, ${BLUE}, ${TEAL})` : activeModule.color }} />
          <div className="p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0" style={{ background: activeModule.color + "15", color: activeModule.color }}>
                  {activeModule.icon}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: activeModule.color }}>Interactive Lesson</p>
                  <h1 className="text-2xl font-extrabold text-slate-900">{activeModule.title}</h1>
                  <p className="text-sm text-slate-500 mt-1">{activeLesson.objective}</p>
                </div>
              </div>
              <Chip label={`+${activeModule.xp} XP`} color={GREEN} bg={GREEN + "15"} />
            </div>

            <div className="grid sm:grid-cols-3 gap-3 mb-6">
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                <p className="text-xs text-slate-400">Progress</p>
                <p className="font-bold text-slate-900">{activeModule.progress}% complete</p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                <p className="text-xs text-slate-400">Lessons</p>
                <p className="font-bold text-slate-900">{activeModule.lessons} short activities</p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                <p className="text-xs text-slate-400">Status</p>
                <p className="font-bold text-slate-900">{activeModule.completed ? "Ready to review" : activeModule.progress > 0 ? "Continue learning" : "Start module"}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 mb-6">
              <h2 className="font-bold text-blue-900 text-sm mb-2 flex items-center gap-2"><Brain size={15} /> Key Concept</h2>
              <p className="text-sm text-blue-800 leading-relaxed">{activeLesson.keyConcept}</p>
            </div>

            <div className="space-y-4">
              {activeLesson.sections.map((section, index) => (
                <div key={section.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ background: activeModule.color }}>{index + 1}</div>
                    <h2 className="font-bold text-slate-900">{section.title}</h2>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{section.body}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="rounded-2xl bg-white border border-slate-100 p-5">
                <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2"><FileText size={15} style={{ color: activeModule.color }} /> Worked Example</h3>
                <p className="text-sm font-semibold text-slate-800 leading-relaxed mb-3">{activeLesson.example.scenario}</p>
                <ul className="space-y-2">
                  {activeLesson.example.breakdown.map((step) => (
                    <li key={step} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle size={14} style={{ color: activeModule.color }} className="mt-0.5 flex-shrink-0" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl bg-amber-50 border border-amber-100 p-5">
                <h3 className="font-bold text-amber-900 text-sm mb-2 flex items-center gap-2"><AlertTriangle size={15} /> Common Mistake</h3>
                <p className="text-sm text-amber-800 leading-relaxed mb-4">{activeLesson.commonMistake}</p>
                <h3 className="font-bold text-amber-900 text-sm mb-2 flex items-center gap-2"><MessageSquare size={15} /> Reflection</h3>
                <p className="text-sm text-amber-800 leading-relaxed">{activeLesson.reflection}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="rounded-2xl bg-blue-50 border border-blue-100 p-5">
                <h3 className="font-bold text-blue-900 text-sm mb-2 flex items-center gap-2"><Target size={15} /> Practice Task</h3>
                <p className="text-sm text-blue-800 leading-relaxed">{activeLesson.practice}</p>
              </div>
              <div className="rounded-2xl bg-white border border-slate-100 p-5">
                <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2"><CheckCircle size={15} style={{ color: GREEN }} /> Verification Checklist</h3>
                <ul className="space-y-2">
                  {activeLesson.checklist.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle size={14} style={{ color: GREEN }} className="mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 mt-6">
              <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2"><BookOpen size={15} style={{ color: activeModule.color }} /> Key Vocabulary</h3>
              <div className="grid md:grid-cols-3 gap-3">
                {activeLesson.vocabulary.map((item) => (
                  <div key={item.term} className="rounded-xl bg-white border border-slate-100 p-3">
                    <p className="font-bold text-slate-900 text-sm">{item.term}</p>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">{item.definition}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 justify-end">
              <button onClick={() => setActiveModuleId(null)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Choose Another Lesson
              </button>
              <button onClick={() => setChallengeAndOpen(activeModule.id)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: `linear-gradient(135deg, ${BLUE}, #1d4ed8)` }}>
                Take Challenge <ChevronRight size={14} className="inline ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <div key={m.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group cursor-pointer" onClick={() => setActiveModuleId(m.id)}>
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
                  <button onClick={(event) => { event.stopPropagation(); setActiveModuleId(m.id); }} className="text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: m.completed ? GREEN : BLUE }}>
                    {m.completed ? "Review Lesson" : m.progress > 0 ? "Continue Lesson" : "Start Lesson"} <ChevronRight size={12} />
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
function QuizScreen({ bootstrap, setScreen, onWin }: { bootstrap: AppBootstrap | null; setScreen: (s: Screen) => void; onWin: () => void }) {
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const quizList = bootstrap?.quiz?.questions ?? quizQuestions;
  const q = quizList[qIndex];
  const passScore = Math.ceil(quizList.length * 0.67);

  useEffect(() => {
    if (selected !== null || finished) return;
    if (timeLeft === 0) { setShowResult(true); return; }
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, selected, finished]);

  const choose = (i: number) => {
    if (selected !== null || showResult) return;
    setSelected(i);
    if (i === q.correct) setScore(s => s + 1);
    setTimeout(() => setShowResult(true), 600);
  };

  const next = () => {
    if (qIndex + 1 >= quizList.length) {
      setFinished(true);
      if (score >= passScore) {
        onWin();
        confetti({ particleCount: 120, spread: 75, origin: { y: 0.65 } });
      }
      return;
    }
    setQIndex(qi => qi + 1);
    setSelected(null);
    setShowResult(false);
    setTimeLeft(30);
  };

  if (finished) {
    const passed = score >= passScore;
    return (
    <div className="p-6 max-w-2xl mx-auto flex flex-col items-center pt-16 space-y-6">
      <div className="text-6xl">{passed ? "🏆" : "🎯"}</div>
      <h2 className="text-3xl font-extrabold text-slate-900 text-center">{passed ? "Challenge Won!" : "Almost There"}</h2>
      <p className="text-slate-500 text-center">
        You scored <span className="font-bold" style={{ color: BLUE }}>{score}/{quizList.length}</span>.
        {passed ? " You earned your Truth Guardian badge." : ` Score ${passScore}/${quizList.length} to win this challenge.`}
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Chip label={`+${score * 50} XP Earned`} color={GREEN} bg={GREEN + "15"} />
        {passed && <Chip label="Truth Guardian Badge" color={AMBER} bg={AMBER + "15"} />}
        {score === quizList.length && <Chip label="Perfect Score" color={BLUE} bg={BLUE + "12"} />}
      </div>
      <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center">
        <ScoreMeter score={Math.round((score / quizList.length) * 100)} size={140} />
        <p className="mt-3 font-semibold text-slate-700">Quiz Accuracy</p>
      </div>
      {!passed && (
        <div className="w-full rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center">
          <p className="text-sm font-semibold text-amber-900">Review the explanations and retry. Every answer reveals the correct reasoning before the next question.</p>
        </div>
      )}
      <div className="flex flex-wrap gap-3 justify-center">
        <button onClick={() => { setQIndex(0); setSelected(null); setShowResult(false); setScore(0); setFinished(false); setTimeLeft(30); }} className="px-8 py-3 rounded-xl font-semibold text-white" style={{ background: `linear-gradient(135deg, ${BLUE}, ${TEAL})` }}>
          {passed ? "Play Again" : "Retry Challenge"}
        </button>
        {passed && (
          <button onClick={() => setScreen("teacher")} className="px-8 py-3 rounded-xl font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50">
            Show Teacher Impact
          </button>
        )}
      </div>
    </div>
    );
  }

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
          {quizList.map((_, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-100">
              <div className="h-full rounded-full transition-all" style={{ width: i < qIndex ? "100%" : i === qIndex ? "50%" : "0%", background: i < qIndex ? GREEN : `linear-gradient(90deg, ${BLUE}, ${TEAL})` }} />
            </div>
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Chip label={`Question ${qIndex + 1} of ${quizList.length}`} color={BLUE} bg={BLUE + "12"} />
          <Chip label="+50 XP" color={AMBER} bg={AMBER + "15"} />
          <Chip label={`Win at ${passScore}/${quizList.length}`} color={GREEN} bg={GREEN + "15"} />
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
              disabled={selected !== null || showResult}
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
                {selected === q.correct ? "Correct! Well done." : selected === null ? "Time's up — here's why:" : "Not quite — here's why:"}
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
              { label: "Media Provenance", value: "79%", color: PURPLE },
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
function TeacherDashboard({ bootstrap, progress, setScreen }: { bootstrap: AppBootstrap | null; progress: DemoProgress; setScreen: (s: Screen) => void }) {
  const [studentQuery, setStudentQuery] = useState("");
  const [interventionAssigned, setInterventionAssigned] = useState(false);
  const classPerformance = bootstrap?.teacher?.classPerformance ?? weeklyData.map((d, index) => ({
    name: d.day,
    average: progress.challengeWon && index >= 4 ? Math.min(96, d.score + 5) : d.score,
  }));
  const skillDistribution = bootstrap?.teacher?.skillDistribution ?? [
    { name: "Fact Checking", value: 85 },
    { name: "Source Verification", value: 78 },
    { name: "Bias Detection", value: 72 },
    { name: "Media Provenance", value: 65 },
  ];
  const completionData = bootstrap?.teacher?.completionData ?? [
    { name: "Completed", value: 24, color: "#22C55E" },
    { name: "In Progress", value: 8, color: "#F59E0B" },
    { name: "Not Started", value: 3, color: "#E2E8F0" },
  ];
  const students = bootstrap?.teacher?.students ?? [
    {
      id: 0,
      name: "Jordan Davis",
      level: progress.challengeWon ? 8 : 7,
      xp: 3640 + (progress.analysisComplete ? 75 : 0) + (progress.quizWon ? 150 : 0) + (progress.challengeWon ? 225 : 0),
      score: progress.challengeWon ? 91 : progress.quizWon ? 88 : progress.analysisComplete ? 82 : 74,
      streak: 14,
      lessons: progress.challengeWon ? 32 : 31,
      status: progress.challengeWon ? "excellent" : progress.analysisComplete ? "good" : "average",
    },
    { id: 1, name: "Sarah Chen", level: 15, xp: 3420, score: 92, streak: 14, lessons: 18, status: "excellent" },
    { id: 2, name: "Alex Rodriguez", level: 12, xp: 2450, score: 85, streak: 7, lessons: 15, status: "good" },
    { id: 3, name: "Maya Patel", level: 11, xp: 2180, score: 88, streak: 10, lessons: 14, status: "good" },
    { id: 4, name: "James Kim", level: 9, xp: 1890, score: 78, streak: 5, lessons: 11, status: "average" },
    { id: 5, name: "Emma Wilson", level: 8, xp: 1750, score: 82, streak: 3, lessons: 10, status: "average" },
    { id: 6, name: "Oliver Brown", level: 6, xp: 980, score: 65, streak: 1, lessons: 7, status: "needs-attention" },
  ];
  const visibleStudents = students.filter((student) =>
    student.name.toLowerCase().includes(studentQuery.trim().toLowerCase()),
  );
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Teacher Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Media Studies 101 · Ms. Adaeze Nwosu · Lagos Secondary School</p>
        </div>
        <div className="flex gap-2">
          <button disabled title="Report export is not available in this preview" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-400 bg-white cursor-not-allowed">
            <FileText size={15} /> Export Report
          </button>
          <button
            onClick={() => setInterventionAssigned(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90"
            style={{ background: interventionAssigned ? GREEN : `linear-gradient(135deg, ${BLUE}, #1d4ed8)` }}
          >
            {interventionAssigned ? <CheckCircle size={15} /> : <Zap size={15} />} {interventionAssigned ? "Feedback Sent" : "Send Feedback"}
          </button>
        </div>
      </div>

      {/* Class summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Users size={20} />} label="Students" value="28" sub="24 active this week" color={BLUE} />
        <StatCard icon={<TrendingUp size={20} />} label="Demo Class Average" value={progress.challengeWon ? "81" : "76"} sub={progress.challengeWon ? "Simulated +5 after challenge" : "Illustrative preview data"} color={GREEN} />
        <StatCard icon={<BookOpen size={20} />} label="Lessons Assigned" value="12" sub="9 completed by class" color={TEAL} />
        <StatCard icon={<Trophy size={20} />} label="Challenges Done" value={progress.quizWon || progress.challengeWon ? "157" : "156"} sub={progress.quizWon || progress.challengeWon ? "Jordan completed one now" : "Across all students"} color={AMBER} />
      </div>

      <div className={cn("rounded-2xl border p-5", progress.analysisComplete || progress.quizWon || progress.challengeWon ? "bg-green-50 border-green-100" : "bg-amber-50 border-amber-100")}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: progress.challengeWon ? GREEN : AMBER }}>Simulated Demo Outcome</p>
            <h2 className="font-extrabold text-slate-900 text-lg">
              {progress.challengeWon ? "Jordan moved from progressing to on-track" : progress.quizWon ? "Jordan earned the Truth Guardian badge" : progress.analysisComplete ? "Jordan analyzed a risky viral post" : "Run a live analysis to generate an outcome"}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {progress.challengeWon
                ? "The teacher can now see the completed challenge and an illustrative score change. Production impact requires measured pre/post assessment data."
                : "Use the Analyzer and Challenge screens to update this classroom view during the pitch."}
            </p>
            {interventionAssigned && (
              <p className="text-sm font-semibold text-green-800 mt-2">Remediation assigned: Jordan gets a source-verification practice set and teacher feedback.</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Chip label={progress.analysisComplete ? "Analysis complete" : "Awaiting analysis"} color={progress.analysisComplete ? GREEN : AMBER} bg={(progress.analysisComplete ? GREEN : AMBER) + "15"} />
            <Chip label={progress.quizWon ? "Badge unlocked" : "Badge pending"} color={progress.quizWon ? GREEN : AMBER} bg={(progress.quizWon ? GREEN : AMBER) + "15"} />
            <Chip label={progress.challengeWon ? "Lesson mastered" : "Lesson in progress"} color={progress.challengeWon ? GREEN : BLUE} bg={(progress.challengeWon ? GREEN : BLUE) + "15"} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={() => setScreen("impact")} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: `linear-gradient(135deg, ${BLUE}, #1d4ed8)` }}>
            View Impact Summary
          </button>
          {!interventionAssigned && (
            <button onClick={() => setInterventionAssigned(true)} className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-green-200 bg-white text-green-700 hover:bg-green-50">
              Assign Remediation
            </button>
          )}
        </div>
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
            <input value={studentQuery} onChange={(event) => setStudentQuery(event.target.value)} className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none" placeholder="Search students…" aria-label="Search students" />
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
              {visibleStudents.map(s => (
                <tr key={s.name} className={cn("hover:bg-slate-50 transition-colors", s.name === "Jordan Davis" && "bg-blue-50")}>
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
// IMPACT SUMMARY
// ══════════════════════════════════════════════════════════════════════════════
function ImpactSummary({ progress, setScreen }: { progress: DemoProgress; setScreen: (s: Screen) => void }) {
  const impactStats = [
    { label: "Risky Posts Analyzed", value: progress.analysisComplete ? "1" : "0", detail: "Viral classroom claim checked", color: BLUE, icon: <Search size={20} /> },
    { label: "Unsupported Claims Found", value: progress.analysisComplete ? "3" : "0", detail: "Claims routed to evidence checks", color: AMBER, icon: <AlertTriangle size={20} /> },
    { label: "Simulated Score Lift", value: progress.challengeWon ? "+17" : progress.quizWon ? "+14" : progress.analysisComplete ? "+8" : "0", detail: "Illustrative demo—not a measured result", color: GREEN, icon: <TrendingUp size={20} /> },
    { label: "Teacher Action", value: progress.challengeWon ? "Ready" : "Pending", detail: "Intervention and feedback prepared", color: PURPLE, icon: <GraduationCap size={20} /> },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="rounded-2xl p-6 text-white" style={{ background: `linear-gradient(135deg, ${BLUE}, ${TEAL})` }}>
        <p className="text-sm font-bold uppercase tracking-wide text-blue-100 mb-2">Final Hackathon Takeaway</p>
        <h1 className="text-3xl font-extrabold max-w-3xl">TruthQuest turns misinformation detection into measurable classroom learning.</h1>
        <p className="text-blue-100 text-sm mt-3 max-w-2xl">TruthQuest teaches the student what to check next and gives the teacher an actionable workflow. Score changes shown in this prototype are simulated until a classroom pilot provides measured results.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {impactStats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: stat.color + "15", color: stat.color }}>
              {stat.icon}
            </div>
            <p className="text-3xl font-extrabold" style={{ color: stat.color, fontFamily: "DM Mono, monospace" }}>{stat.value}</p>
            <p className="font-bold text-slate-900 text-sm mt-1">{stat.label}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-bold text-slate-900 mb-4">Live Product Narrative</h2>
          <div className="space-y-4">
            {[
              ["Analyze", "A student pastes a viral claim and gets transparent source, language, claim, and evidence signals.", progress.analysisComplete],
              ["Learn", "The app converts the analysis into a quiz and evidence-ranking challenge with immediate feedback.", progress.quizWon],
              ["Act", "The teacher sees Jordan's improved score, completed challenge, and a remediation-ready next step.", progress.challengeWon],
            ].map(([title, body, done]) => (
              <div key={title as string} className={cn("rounded-xl border p-4", done ? "bg-green-50 border-green-100" : "bg-slate-50 border-slate-100")}>
                <div className="flex items-start gap-3">
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0", done ? "bg-green-500 text-white" : "bg-slate-200 text-slate-500")}>
                    {done ? <CheckCircle size={15} /> : <Clock size={15} />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{title as string}</p>
                    <p className="text-sm text-slate-600 mt-1">{body as string}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-bold text-slate-900 mb-3">Judge Close</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-5">TruthQuest is built for the moment a student is about to share something questionable. It gives them a verification habit, then gives educators proof that the habit improved.</p>
          <div className="space-y-3">
            <button onClick={() => setScreen("analyzer")} className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: `linear-gradient(135deg, ${BLUE}, #1d4ed8)` }}>
              Run Another Analysis
            </button>
            <button onClick={() => setScreen("teacher")} className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50">
              Back to Teacher View
            </button>
          </div>
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
  const [mobileQuizAnswer, setMobileQuizAnswer] = useState<number | null>(null);

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
      const response = await analyzeContent({ mode: detectContentAnalysisMode(trimmed), input: trimmed });
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
                    { icon: <Shield size={18} />, label: "Deepfake", color: TEAL, action: undefined },
                    { icon: <BookOpen size={18} />, label: "Learn", color: PURPLE, action: () => setActiveTab("learn") },
                    { icon: <Trophy size={18} />, label: "Challenge", color: AMBER, action: () => setActiveTab("quiz") },
                  ].map(a => (
                    <button key={a.label} onClick={a.action} disabled={!a.action} title={!a.action ? "Deepfake preview is available in the desktop sidebar" : undefined} className={cn("flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-white text-sm font-semibold text-slate-700 transition-colors", a.action ? "hover:border-blue-200" : "opacity-60 cursor-not-allowed")}>
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
                    {quizQuestions[0].options.map((opt, i) => {
                      const answered = mobileQuizAnswer !== null;
                      const isCorrect = i === quizQuestions[0].correct;
                      const isSelected = i === mobileQuizAnswer;
                      return (
                      <button key={i} onClick={() => setMobileQuizAnswer(i)} disabled={answered} className={cn("w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left text-xs font-medium transition-colors", answered && isCorrect ? "border-green-400 bg-green-50 text-green-800" : answered && isSelected ? "border-red-400 bg-red-50 text-red-800" : "border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50")}>
                        <span className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-500 flex-shrink-0">{String.fromCharCode(65 + i)}</span>
                        {opt}
                      </button>
                      );
                    })}
                  </div>
                  {mobileQuizAnswer !== null && (
                    <div className="mt-3 rounded-lg bg-blue-50 border border-blue-100 p-3">
                      <p className="text-xs text-blue-800">{quizQuestions[0].explanation}</p>
                    </div>
                  )}
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
  const [screen, setScreen] = useState<Screen>(() => screenFromPath(window.location.pathname));
  const { data: bootstrap } = useTruthQuestBootstrap();
  const [demoProgress, setDemoProgress] = useState<DemoProgress>(() => {
    try {
      const saved = window.localStorage.getItem("truthquest-demo-progress");
      return saved ? JSON.parse(saved) as DemoProgress : { analysisComplete: false, quizWon: false, challengeWon: false };
    } catch {
      return { analysisComplete: false, quizWon: false, challengeWon: false };
    }
  });

  useEffect(() => {
    const onPopState = () => setScreen(screenFromPath(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const titles: Record<Screen, string> = {
      landing: "TruthQuest AI | AI-Powered Media Literacy",
      dashboard: "Dashboard | TruthQuest AI",
      analyzer: "Content Analyzer | TruthQuest AI",
      deepfake: "Media Integrity Check | TruthQuest AI",
      learning: "Learning Hub | TruthQuest AI",
      quiz: "Media Literacy Challenge | TruthQuest AI",
      profile: "Profile | TruthQuest AI",
      teacher: "Teacher Dashboard | TruthQuest AI",
      mobile: "Mobile App Preview | TruthQuest AI",
      impact: "Impact Summary | TruthQuest AI",
      privacy: "Privacy Policy | TruthQuest AI",
      terms: "Terms of Use | TruthQuest AI",
    };
    document.title = titles[screen];
  }, [screen]);

  useEffect(() => {
    window.localStorage.setItem("truthquest-demo-progress", JSON.stringify(demoProgress));
  }, [demoProgress]);

  const markDemoProgress = (updates: Partial<DemoProgress>) => {
    setDemoProgress((current) => ({ ...current, ...updates }));
  };

  const navigate = (nextScreen: Screen) => {
    const nextPath = screenPaths[nextScreen];
    if (window.location.pathname !== nextPath) {
      window.history.pushState(null, "", nextPath);
    }
    setScreen(nextScreen);
  };

  if (screen === "landing") return <LandingPage onNavigate={navigate} bootstrap={bootstrap} />;
  if (screen === "privacy") return <LegalPage type="privacy" onNavigate={navigate} />;
  if (screen === "terms") return <LegalPage type="terms" onNavigate={navigate} />;

  const content = (() => {
    switch (screen) {
      case "dashboard": return <Dashboard setScreen={navigate} bootstrap={bootstrap} progress={demoProgress} />;
      case "analyzer": return <ContentAnalyzer setScreen={navigate} onAnalysisComplete={() => markDemoProgress({ analysisComplete: true })} />;
      case "deepfake": return <DeepfakeDetector />;
      case "learning": return <LearningHub setScreen={navigate} bootstrap={bootstrap} progress={demoProgress} onChallengeComplete={() => markDemoProgress({ analysisComplete: true, quizWon: true, challengeWon: true })} />;
      case "quiz": return <QuizScreen bootstrap={bootstrap} setScreen={navigate} onWin={() => markDemoProgress({ analysisComplete: true, quizWon: true, challengeWon: true })} />;
      case "profile": return <StudentProfile bootstrap={bootstrap} />;
      case "teacher": return <TeacherDashboard bootstrap={bootstrap} progress={demoProgress} setScreen={navigate} />;
      case "mobile": return <MobileView bootstrap={bootstrap} />;
      case "impact": return <ImpactSummary progress={demoProgress} setScreen={navigate} />;
      default: return <Dashboard setScreen={navigate} bootstrap={bootstrap} progress={demoProgress} />;
    }
  })();

  return (
    <AppShell screen={screen} onNavigate={navigate} progress={demoProgress}>
      {content}
    </AppShell>
  );
}
