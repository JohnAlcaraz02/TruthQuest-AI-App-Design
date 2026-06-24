import { useState } from "react";
import Sidebar from "../components/Sidebar";
import CredibilityMeter from "../components/CredibilityMeter";
import {
  Upload,
  Video,
  Image as ImageIcon,
  Mic,
  AlertTriangle,
  CheckCircle,
  Eye,
  Camera,
  Waveform,
  FileCode,
} from "lucide-react";
import { motion } from "motion/react";

export default function DeepfakeDetector() {
  const [activeTab, setActiveTab] = useState<"image" | "video" | "audio">("image");
  const [analyzing, setAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setShowResults(true);
    }, 2500);
  };

  const indicators = [
    {
      category: "Facial Analysis",
      icon: Camera,
      items: [
        { label: "Eye movement consistency", status: "pass", detail: "Natural blink patterns detected" },
        { label: "Skin texture uniformity", status: "warning", detail: "Minor inconsistencies in lighting" },
        { label: "Facial symmetry", status: "pass", detail: "Proportions appear natural" },
      ],
    },
    {
      category: "Audio Analysis",
      icon: Waveform,
      items: [
        { label: "Voice frequency patterns", status: "pass", detail: "Consistent vocal characteristics" },
        { label: "Background noise", status: "pass", detail: "Natural ambient sound present" },
        { label: "Audio-visual sync", status: "pass", detail: "Lip movements match audio" },
      ],
    },
    {
      category: "Metadata Analysis",
      icon: FileCode,
      items: [
        { label: "File creation date", status: "pass", detail: "Matches claimed timeline" },
        { label: "Camera information", status: "pass", detail: "Valid EXIF data present" },
        { label: "Edit history", status: "warning", detail: "Some post-processing detected" },
      ],
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
              Deepfake Detector
            </h1>
            <p className="text-muted-foreground">
              Detect manipulated images, videos, and audio using advanced AI technology
            </p>
          </div>

          {/* Upload Section */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm mb-8">
            {/* Tab Selector */}
            <div className="flex gap-2 mb-6 p-1 bg-muted rounded-lg">
              <button
                onClick={() => setActiveTab("image")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === "image"
                    ? "bg-card text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                Image
              </button>
              <button
                onClick={() => setActiveTab("video")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === "video"
                    ? "bg-card text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Video className="w-4 h-4" />
                Video
              </button>
              <button
                onClick={() => setActiveTab("audio")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === "audio"
                    ? "bg-card text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Mic className="w-4 h-4" />
                Audio
              </button>
            </div>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-input rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer">
              <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">
                Drop {activeTab} here or click to upload
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {activeTab === "image" && "Supports PNG, JPG, WebP (max 10MB)"}
                {activeTab === "video" && "Supports MP4, MOV, WebM (max 100MB)"}
                {activeTab === "audio" && "Supports MP3, WAV, M4A (max 50MB)"}
              </p>
              <button
                onClick={handleAnalyze}
                className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition-all"
              >
                Select {activeTab === "image" ? "Image" : activeTab === "video" ? "Video" : "Audio"}
              </button>
            </div>

            {/* Quick Info */}
            <div className="mt-6 grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                <Eye className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground text-sm">Advanced Detection</p>
                  <p className="text-xs text-muted-foreground">AI-powered analysis</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground text-sm">Privacy First</p>
                  <p className="text-xs text-muted-foreground">Files processed securely</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                <AlertTriangle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground text-sm">Detailed Report</p>
                  <p className="text-xs text-muted-foreground">Comprehensive insights</p>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {analyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-xl p-12 border border-border text-center"
            >
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Analyzing Content...
              </h3>
              <p className="text-muted-foreground">
                Running advanced AI detection algorithms
              </p>
            </motion.div>
          )}

          {/* Results Section */}
          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Authenticity Score */}
              <div className="bg-card rounded-xl p-8 border border-border shadow-sm">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <div className="flex-shrink-0">
                    <CredibilityMeter score={78} size="lg" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-foreground mb-4">
                      Authenticity Analysis
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Based on facial analysis, audio patterns, metadata verification, and AI
                      generation detection algorithms. This content shows some signs of
                      post-processing but appears largely authentic.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-success/20">
                        <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground mb-1">Natural Patterns</p>
                          <p className="text-sm text-muted-foreground">
                            Consistent with real media
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-accent/20">
                        <AlertTriangle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground mb-1">Minor Edits Detected</p>
                          <p className="text-sm text-muted-foreground">
                            Some post-processing found
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Generation Probability */}
              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    AI Generation Probability
                  </h3>
                  <span className="text-2xl font-bold text-primary">22%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 mb-4">
                  <div
                    className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full"
                    style={{ width: "22%" }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Low probability of being AI-generated content. Most characteristics align with
                  authentic media captured by real devices.
                </p>
              </div>

              {/* Detection Indicators */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-foreground">
                  Detection Indicators
                </h3>
                
                {indicators.map((category, idx) => {
                  const Icon = category.icon;
                  return (
                    <div key={idx} className="bg-card rounded-xl p-6 border border-border shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <h4 className="text-lg font-semibold text-foreground">{category.category}</h4>
                      </div>
                      <div className="space-y-3">
                        {category.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex items-start justify-between p-4 bg-muted rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-foreground mb-1">{item.label}</p>
                              <p className="text-sm text-muted-foreground">{item.detail}</p>
                            </div>
                            <div className="flex-shrink-0 ml-4">
                              {item.status === "pass" ? (
                                <div className="flex items-center gap-2 text-success">
                                  <CheckCircle className="w-5 h-5" />
                                  <span className="text-sm font-medium">Pass</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-accent">
                                  <AlertTriangle className="w-5 h-5" />
                                  <span className="text-sm font-medium">Warning</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Conclusion */}
              <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-4">Conclusion</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-success/20">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground mb-1">
                        Content appears largely authentic
                      </p>
                      <p className="text-sm text-muted-foreground">
                        While some post-processing is evident, the content shows natural
                        characteristics consistent with real media. No significant signs of deepfake
                        manipulation were detected.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground mb-1">Recommendation</p>
                      <p className="text-sm text-muted-foreground">
                        Always verify important content through multiple sources and consider the
                        context. No detection system is 100% accurate.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowResults(false);
                  }}
                  className="flex-1 px-6 py-3 bg-card border border-border text-foreground rounded-xl font-medium hover:bg-muted transition-all"
                >
                  Analyze Another
                </button>
                <button className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-opacity-90 transition-all">
                  Download Report
                </button>
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {!showResults && !analyzing && (
            <div className="bg-card rounded-xl p-12 border border-border text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Ready to Detect Deepfakes
              </h3>
              <p className="text-muted-foreground mb-6">
                Upload an image, video, or audio file to analyze for signs of manipulation
              </p>
              <div className="flex gap-4 justify-center text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>Advanced AI</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>Detailed Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>Secure Processing</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
