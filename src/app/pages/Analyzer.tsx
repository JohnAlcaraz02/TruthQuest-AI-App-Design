import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import CredibilityMeter from "../components/CredibilityMeter";
import {
  Link2,
  FileText,
  Image as ImageIcon,
  Upload,
  AlertCircle,
  CheckCircle,
  Info,
  TrendingUp,
  Shield,
  AlertTriangle,
  Brain,
} from "lucide-react";
import { motion } from "motion/react";
import { analyzeContent, type ContentAnalysisResponse } from "../services/truthquestApi";

type Tab = "url" | "text" | "image";

function StatusColor({ value }: { value: string }) {
  const text = value.toLowerCase();
  if (["high", "verified", "low"].includes(text)) return "text-success";
  if (["medium", "moderate", "moderately"].includes(text)) return "text-accent";
  return "text-destructive";
}

export default function Analyzer() {
  const [activeTab, setActiveTab] = useState<Tab>("url");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ContentAnalysisResponse | null>(null);
  const [inputValue, setInputValue] = useState("");

  const hasResult = result !== null;

  const reset = () => {
    setResult(null);
    setError(null);
    setActiveTab("url");
    setInputValue("");
  };

  const resetResult = () => {
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed && activeTab !== "image") {
      setError("Please enter a URL or text before analyzing.");
      return;
    }

    try {
      setAnalyzing(true);
      setError(null);
      const response = await analyzeContent({
        mode: activeTab,
        input: activeTab === "image" ? "this uploaded image" : trimmed,
      });
      setResult(response);
    } catch (analyzeError) {
      setError(
        analyzeError instanceof Error
          ? analyzeError.message
          : "Analysis failed. Please try again.",
      );
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    setError(null);
  }, [activeTab]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Content Analyzer
            </h1>
            <p className="text-muted-foreground">
              Analyze articles, social media posts, and images for credibility
              and bias
            </p>
          </div>

          <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-6 flex gap-2 p-1 bg-muted rounded-lg">
              <TabButton
                active={activeTab === "url"}
                onClick={() => setActiveTab("url")}
                icon={<Link2 className="h-4 w-4" />}
                label="URL"
              />
              <TabButton
                active={activeTab === "text"}
                onClick={() => setActiveTab("text")}
                icon={<FileText className="h-4 w-4" />}
                label="Text"
              />
              <TabButton
                active={activeTab === "image"}
                onClick={() => setActiveTab("image")}
                icon={<ImageIcon className="h-4 w-4" />}
                label="Image"
              />
            </div>

            {activeTab === "url" && (
              <InputBlock
                id="analyzer-url"
                label="Article or Post URL"
                placeholder="https://example.com/article"
                value={hasResult ? result.sourceUrl : inputValue}
                onChange={(value) => {
                  setInputValue(value);
                  if (hasResult) resetResult();
                }}
                readOnly={hasResult}
                onClear={reset}
              />
            )}

            {activeTab === "text" && (
              <InputBlock
                id="analyzer-text"
                label="Paste Article or Social Media Content"
                placeholder="Paste the text content you want to analyze..."
                value={hasResult ? result.summary : inputValue}
                onChange={(value) => {
                  setInputValue(value);
                  if (hasResult) resetResult();
                }}
                readOnly={hasResult}
                multiline
                rows={8}
                onClear={reset}
              />
            )}

            {activeTab === "image" && !hasResult && (
              <div className="rounded-lg border-2 border-dashed border-input p-12 text-center">
                <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-2 font-medium text-foreground">
                  Drop image here or click to upload
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports PNG, JPG, WebP (max 10MB)
                </p>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={analyzing || (!hasResult && !inputValue.trim() && activeTab !== "image")}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Analyzing...
                </>
              ) : hasResult ? (
                <>
                  <Brain className="h-5 w-5" />
                  Reanalyze
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5" />
                  Analyze Content
                </>
              )}
            </button>
          </div>

          {error && !hasResult && (
            <ErrorBanner message={error} onDismiss={() => setError(null)} />
          )}

          {hasResult && <Results result={result} onReset={reset} />}

          {!hasResult && !analyzing && !error && <EmptyState />}
        </div>
      </div>
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
      className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-all ${
        active ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
      }`}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

function InputBlock({
  id,
  label,
  placeholder,
  value,
  onChange,
  onClear,
  readOnly,
  multiline = false,
  rows = 8,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  readOnly: boolean;
  multiline?: boolean;
  rows?: number;
}) {
  const common =
    "w-full rounded-lg border border-input bg-input-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div>
      <label
        className="mb-2 flex items-center justify-between text-sm font-medium text-foreground"
        htmlFor={id}
      >
        <span>{label}</span>
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        )}
      </label>
      {multiline ? (
        <textarea
          id={id}
          placeholder={placeholder}
          value={value}
          rows={rows}
          readOnly={readOnly}
          onChange={(event) => onChange(event.target.value)}
          className={`${common} resize-none`}
        />
      ) : (
        <input
          id={id}
          type="url"
          placeholder={placeholder}
          value={value}
          readOnly={readOnly}
          onChange={(event) => onChange(event.target.value)}
          className={common}
        />
      )}
    </div>
  );
}

function ErrorBanner({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
    >
      <AlertCircle className="mt-0.5 h-4 w-4" />
      <p className="flex-1">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="text-xs font-medium underline underline-offset-4"
      >
        Dismiss
      </button>
    </motion.div>
  );
}

function Results({
  result,
  onReset,
}: {
  result: ContentAnalysisResponse;
  onReset: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
          <div className="flex-shrink-0">
            <CredibilityMeter score={result.score} size="lg" />
          </div>
          <div className="flex-1">
            <h2 className="mb-4 text-2xl font-semibold text-foreground">
              Analysis Results
            </h2>
            <p className="mb-4 text-muted-foreground">{result.summary}</p>
            <div className="flex flex-wrap gap-2">
              {result.chips.slice(0, 4).map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {result.metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center gap-3">
              <MetricIcon label={metric.label} />
              <h3 className="font-semibold text-foreground">{metric.label}</h3>
            </div>
            <div className="mb-2 flex items-end gap-2">
              <span
                className={`text-3xl font-bold ${StatusColor({ value: metric.value })}`}
              >
                {metric.value}
              </span>
              <span className="mb-1 text-sm text-muted-foreground">
                {metric.sub}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{metric.sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              AI Summary
            </h3>
            <p className="mb-4 text-foreground leading-relaxed">
              {result.summary}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>AI-generated analysis • Always verify important information independently</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          Recommendations
        </h3>
        <div className="space-y-3">
          {result.recommendations.map((item) => (
            <div
              key={item.text}
              className="flex items-start gap-3 rounded-lg bg-muted p-4"
            >
              {item.done ? (
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
              ) : (
                <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
              )}
              <p className="font-medium text-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onReset}
          className="flex-1 rounded-xl border border-border bg-card px-6 py-3 font-medium text-foreground transition hover:bg-muted"
          type="button"
        >
          Analyze Another
        </button>
        <button
          className="flex-1 rounded-xl bg-primary px-6 py-3 font-medium text-white transition hover:bg-opacity-90"
          type="button"
        >
          Save to History
        </button>
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-border bg-card p-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Brain className="h-8 w-8 text-primary" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-foreground">
        Ready to Analyze
      </h3>
      <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
        Paste or enter a URL, article text, or upload an image to analyze for
        credibility, bias, and AI-generated content.
      </p>
      <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
        <Hint icon={<CheckCircle className="h-4 w-4 text-success" />} text="Instant Analysis" />
        <Hint icon={<CheckCircle className="h-4 w-4 text-success" />} text="Detailed Insights" />
        <Hint icon={<CheckCircle className="h-4 w-4 text-success" />} text="AI-Powered" />
      </div>
    </div>
  );
}

function Hint({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="flex items-center gap-2">
      {icon}
      <span>{text}</span>
    </span>
  );
}

function MetricIcon({ label }: { label: string }) {
  const lower = label.toLowerCase();
  const base =
    "flex h-10 w-10 items-center justify-center rounded-lg bg-muted";
  let color = "text-secondary";
  if (lower.includes("bias") || lower.includes("source")) color = "text-primary";
  else if (lower.includes("emotional") || lower.includes("emotion")) color = "text-accent";
  else if (lower.includes("fact") || lower.includes("reliability")) color = "text-success";

  if (lower.includes("source") || lower.includes("reliability")) {
    return (
      <div className={`${base} ${color}`}>
        <Shield className="h-5 w-5" />
      </div>
    );
  }
  if (lower.includes("bias")) {
    return (
      <div className={`${base} ${color}`}>
        <TrendingUp className="h-5 w-5" />
      </div>
    );
  }
  if (lower.includes("emotional")) {
    return (
      <div className={`${base} ${color}`}>
        <AlertTriangle className="h-5 w-5" />
      </div>
    );
  }
  return (
    <div className={`${base} ${color}`}>
      <CheckCircle className="h-5 w-5" />
    </div>
  );
}
