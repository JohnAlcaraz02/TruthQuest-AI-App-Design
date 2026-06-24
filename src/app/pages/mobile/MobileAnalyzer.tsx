import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  CheckCircle,
  Home,
  Search,
  BookOpen,
  Trophy,
  User,
  Link2,
  FileText,
  Upload,
  Brain,
} from "lucide-react";
import CredibilityMeter from "../../components/CredibilityMeter";
import { analyzeContent, type ContentAnalysisMode } from "../../services/truthquestApi";

export default function MobileAnalyzer() {
  const [activeTab, setActiveTab] = useState<ContentAnalysisMode>("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReturnType<typeof analyzeContent extends (args: infer A) => infer R ? R : null>((analyzeContent as unknown as (args?: { mode?: string; input?: string }) => Promise<unknown>)() as ReturnType<typeof analyzeContent> | null);
  
  const [analysis, setAnalysis] = useState<ContentAnalysisResponse | null>(null);

  const reset = () => {
    setAnalysis(null);
    setError(null);
    setActiveTab("url");
    setUrl("");
    setText("");
  };

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      setError(null);
      
      const mode = activeTab;
      let inputValue: string | undefined;
      
      if (mode === "url") {
        if (!url) throw new Error("Please enter a URL to analyze.");
        inputValue = url;
      } else {
        if (!text) throw new Error("Please enter text to analyze.");
        inputValue = text;
      }
      
      const response = await analyzeContent({ mode, input: inputValue });
      setAnalysis(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setAnalyzing(false);
    }
  };

  const canAnalyze =
    (activeTab === "url" && url) || (activeTab === "text" && text);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-primary p-6 text-white">
        <h1 className="text-2xl font-bold">Content Analyzer</h1>
        <p className="text-sm opacity-90">Check credibility and bias</p>
      </div>

      <div className="p-6 space-y-6">
        {!analysis && (
          <>
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              <TabButton
                active={activeTab === "url"}
                onClick={() => setActiveTab("url")}
                icon={<Link2 className="w-4 h-4" />}
                label="URL"
              />
              <TabButton
                active={activeTab === "text"}
                onClick={() => setActiveTab("text")}
                icon={<FileText className="w-4 h-4" />}
                label="Text"
              />
            </div>

            <div className="bg-card rounded-xl p-6 border border-border">
              {activeTab === "url" ? (
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste article URL..."
                  className="w-full px-4 py-3 bg-input-background border border-input rounded-lg"
                />
              ) : (
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste text content..."
                  rows={8}
                  className="w-full px-4 py-3 bg-input-background border border-input rounded-lg resize-none"
                />
              )}
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={analyzing || !canAnalyze}
              className="w-full px-6 py-4 bg-primary text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzing ? (
                <>
                  <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  Analyze Content
                </>
              )}
            </button>
          </>
        )}

        {analysis && (
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 border border-border text-center">
              <CredibilityMeter score={analysis.score} size="md" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-xl p-4 border border-border">
                <p className="text-sm text-muted-foreground mb-1">Bias</p>
                <p className="text-lg font-bold text-primary">{analysis.biasLabel}</p>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border">
                <p className="text-sm text-muted-foreground mb-1">Reliability</p>
                <p className="text-lg font-bold text-secondary">{analysis.reliabilityLabel}</p>
              </div>
            </div>

            <div className="bg-card rounded-xl p-5 border border-border">
              <h3 className="font-semibold text-foreground mb-2">Summary</h3>
              <p className="text-sm text-foreground leading-relaxed">{analysis.summary}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={reset}
                className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground"
              >
                New Analysis
              </button>
              <button className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white">
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-6 py-4">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <NavItem to="/mobile" icon={<Home className="w-6 h-6" />} label="Home" />
          <NavItem to="/mobile/analyze" icon={<Search className="w-6 h-6" />} label="Analyze" active />
          <NavItem to="/mobile/learning" icon={<BookOpen className="w-6 h-6" />} label="Learn" />
          <NavItem to="/mobile/quiz" icon={<Trophy className="w-6 h-6" />} label="Quiz" />
          <NavItem to="/mobile/profile" icon={<User className="w-6 h-6" />} label="Profile" />
        </div>
      </nav>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium ${
        active ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function NavItem({
  to,
  icon,
  label,
  active,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center gap-1 ${active ? "text-primary" : "text-muted-foreground"}`}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </Link>
  );
}
