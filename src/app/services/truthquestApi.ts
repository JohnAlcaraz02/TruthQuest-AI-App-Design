import { useEffect, useMemo, useState } from "react";

export type ContentAnalysisMode = "url" | "text" | "image";
export type DeepfakeMediaType = "image" | "video" | "audio";

export type AppBootstrap = {
  landing?: {
    features?: Array<{
      icon?: string;
      title: string;
      description: string;
    }>;
    stats?: Array<{
      value: string;
      label: string;
    }>;
    testimonials?: Array<{
      name: string;
      role: string;
      content: string;
      avatar: string;
    }>;
  };
  dashboard?: {
    weeklyData?: Array<{
      day: string;
      score: number;
      articles?: number;
    }>;
    credibilityData?: Array<{
      name: string;
      value: number;
      color: string;
    }>;
    classData?: Array<{
      name: string;
      score: number;
      lessons: number;
      streak: number;
    }>;
    leaderboard?: Array<{
      rank: number;
      name: string;
      xp: number;
      avatar: string;
      badge?: string;
      isMe?: boolean;
    }>;
    recentAnalyses?: Array<{
      title: string;
      source: string;
      score: number;
      bias: string;
      time: string;
      tag: string;
    }>;
  };
  learning?: {
    modules?: Array<{
      id: number;
      title: string;
      icon: string;
      color: string;
      xp: number;
      progress: number;
      lessons: number;
      completed: boolean;
    }>;
    leaderboard?: Array<{
      rank: number;
      name: string;
      xp: number;
      avatar: string;
      badge?: string;
      isMe?: boolean;
    }>;
  };
  quiz?: {
    questions?: Array<{
      id: number;
      question: string;
      options: string[];
      correct: number;
      explanation: string;
    }>;
  };
  profile?: {
    stats?: Array<{
      label: string;
      value: string;
      icon: string;
      color: string;
    }>;
    badges?: Array<{
      icon: string;
      name: string;
      earned: boolean;
    }>;
    recentActivity?: Array<{
      action: string;
      title: string;
      time: string;
      xp: number;
    }>;
  };
  teacher?: {
    classPerformance?: Array<{
      name: string;
      average: number;
    }>;
    skillDistribution?: Array<{
      name: string;
      value: number;
    }>;
    completionData?: Array<{
      name: string;
      value: number;
      color: string;
    }>;
    students?: Array<{
      id: number;
      name: string;
      level: number;
      xp: number;
      score: number;
      streak: number;
      lessons?: number;
      status: string;
    }>;
    recentAssignments?: Array<{
      title: string;
      due: string;
      submitted: number;
      total: number;
      status: string;
    }>;
  };
  mobile?: {
    recentAnalyses?: Array<{
      title: string;
      score: number;
      time: string;
    }>;
    recentActivity?: Array<{
      title: string;
      time: string;
      xp: number;
    }>;
  };
  contentAnalyzer?: {
    loadingSteps?: string[];
  };
  deepfake?: {
    indicators?: Array<{
      label: string;
      value: number;
      risk: string;
      color: string;
    }>;
  };
};

export type ContentAnalysisRequest = {
  mode: ContentAnalysisMode;
  input: string;
};

export type ContentAnalysisResponse = {
  analysisId: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceExcerpt: string;
  score: number;
  biasLabel: string;
  emotionLabel: string;
  reliabilityLabel: string;
  factAccuracy: string;
  summary: string;
  chips: string[];
  metrics: Array<{
    label: string;
    value: string;
    sub: string;
  }>;
  recommendations: Array<{
    text: string;
    done: boolean;
  }>;
  sourceSignals?: Array<{
    label: string;
    value: string;
    status: "positive" | "warning" | "negative" | "neutral" | string;
  }>;
  claims?: Array<{
    claim: string;
    status: string;
    confidence: number;
    evidence: string;
  }>;
  evidenceSources?: Array<{
    title: string;
    url: string;
    type: string;
    relevance: number;
  }>;
  scoreBreakdown?: Array<{
    label: string;
    score: number;
    weight: number;
  }>;
  analysisStatus: "supported" | "mixed" | "insufficient_evidence";
  analysisConfidence: number;
  limitations: string[];
  xpEarned: number;
};

export type DeepfakeAnalysisRequest = {
  mediaType: DeepfakeMediaType;
  file: File;
};

export type DeepfakeAnalysisResponse = {
  analysisId: string;
  score: number;
  verdict: string;
  probabilityLabel: string;
  probability: number;
  summary: string;
  indicators: Array<{
    label: string;
    value: number;
    risk: string;
    color: string;
  }>;
  metadata: Array<{
    label: string;
    value: string;
  }>;
  aiSummary: string;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";
const RED = "#EF4444";
const AMBER = "#F59E0B";
const GREEN = "#22C55E";

function riskName(value: number) {
  if (value >= 70) return "High";
  if (value >= 45) return "Medium";
  return "Low";
}

function riskColor(value: number) {
  if (value >= 70) return RED;
  if (value >= 45) return AMBER;
  return GREEN;
}

function formatBytes(size: number) {
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  if (size >= 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${size} B`;
}

function detectFileKind(bytes: Uint8Array): { kind: string; label: string } {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return { kind: "image", label: "PNG image" };
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { kind: "image", label: "JPEG image" };
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return { kind: "image", label: "WebP image" };
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WAVE") return { kind: "audio", label: "WAV audio" };
  if (bytes.length >= 3 && String.fromCharCode(...bytes.slice(0, 3)) === "ID3") return { kind: "audio", label: "MP3 audio" };
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(4, 8)) === "ftyp") return { kind: "video", label: "MP4/MOV media container" };
  return { kind: "unknown", label: "Unknown signature" };
}

function pngDimensions(bytes: Uint8Array) {
  if (bytes.length < 24 || bytes[0] !== 0x89 || bytes[1] !== 0x50) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

function jpegDimensions(bytes: Uint8Array) {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let index = 2;
  while (index + 9 < bytes.length) {
    if (bytes[index] !== 0xff) {
      index += 1;
      continue;
    }
    const marker = bytes[index + 1];
    index += 2;
    if (marker === 0xd8 || marker === 0xd9) continue;
    if (index + 2 > bytes.length) return null;
    const length = (bytes[index] << 8) + bytes[index + 1];
    if (length < 2 || index + length > bytes.length) return null;
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { width: (bytes[index + 5] << 8) + bytes[index + 6], height: (bytes[index + 3] << 8) + bytes[index + 4] };
    }
    index += length;
  }
  return null;
}

function imageDimensions(bytes: Uint8Array) {
  return pngDimensions(bytes) ?? jpegDimensions(bytes);
}

async function sha256Hex(bytes: Uint8Array) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function analyzeDeepfakeLocally(request: DeepfakeAnalysisRequest, backendError: string): Promise<DeepfakeAnalysisResponse> {
  const bytes = new Uint8Array(await request.file.arrayBuffer());
  const detected = detectFileKind(bytes);
  const dimensions = detected.kind === "image" ? imageDimensions(bytes) : null;
  const sample = new TextDecoder("latin1").decode(bytes.slice(0, 2_000_000)).toLowerCase();
  const markers = [
    ["Adobe Firefly", ["firefly", "adobe firefly"]],
    ["Midjourney", ["midjourney"]],
    ["Stable Diffusion", ["stable diffusion", "stablediffusion", "automatic1111", "comfyui"]],
    ["DALL-E", ["dall-e", "dalle", "openai"]],
    ["Generative AI metadata", ["ai generated", "synthetic media", "generated by ai", "c2pa"]],
  ].filter(([, needles]) => (needles as string[]).some((needle) => sample.includes(needle))).map(([label]) => label as string);

  const typeMatch = detected.kind === request.mediaType;
  const tooSmall = request.file.size < (request.mediaType === "image" ? 1024 : 10 * 1024);
  const missingDimensions = request.mediaType === "image" && detected.kind === "image" && !dimensions;
  const signatureScore = typeMatch ? 10 : detected.kind === "unknown" ? 82 : 70;
  const metadataScore = Math.min(95, 15 + (markers.length ? 45 : 0) + (tooSmall ? 25 : 0));
  const structureScore = Math.min(95, 18 + (!typeMatch ? 50 : 0) + (missingDimensions ? 20 : 0));
  const generatorScore = markers.length ? 88 : 12;
  const contentScore = Math.min(95, 20 + (tooSmall ? 25 : 0) + (!typeMatch ? 30 : 0) + (markers.length ? 25 : 0));
  const probability = Math.max(5, Math.min(95, Math.round(signatureScore * 0.25 + metadataScore * 0.2 + structureScore * 0.2 + generatorScore * 0.2 + contentScore * 0.15)));
  const verdict = probability >= 70 ? "High File-Integrity Risk" : probability >= 45 ? "Needs Manual Provenance Review" : "No Strong Integrity Warnings Found";
  const hash = await sha256Hex(bytes);
  const dimensionValue = dimensions ? `${dimensions.width} x ${dimensions.height}` : "Unavailable";
  const markerValue = markers.length ? markers.join(", ") : "None found";
  const indicatorValues = [
    ["File Signature Match", 100 - signatureScore, signatureScore],
    ["Metadata Integrity", 100 - metadataScore, metadataScore],
    ["Container Structure", 100 - structureScore, structureScore],
    ["Embedded Generator Markers", generatorScore, generatorScore],
    ["Integrity Review Score", probability, probability],
  ] as const;

  return {
    analysisId: crypto.randomUUID(),
    score: probability,
    verdict,
    probabilityLabel: `${probability}% Integrity Review Score`,
    probability,
    summary: "Backend analysis was unavailable, so TruthQuest ran a local file and provenance check in your browser. This is not a visual or audio deepfake classification.",
    indicators: indicatorValues.map(([label, value, risk]) => ({ label, value, risk: riskName(risk), color: riskColor(risk) })),
    metadata: [
      { label: "Analysis Mode", value: "Local browser fallback" },
      { label: "Backend Error", value: backendError.slice(0, 80) },
      { label: "Filename", value: request.file.name },
      { label: "Declared Type", value: request.mediaType },
      { label: "Browser MIME", value: request.file.type || "Unavailable" },
      { label: "Detected Type", value: detected.label },
      { label: "File Size", value: formatBytes(request.file.size) },
      { label: "Dimensions", value: dimensionValue },
      { label: "Synthetic Markers", value: markerValue },
      { label: "SHA-256", value: `${hash.slice(0, 16)}...` },
    ],
    aiSummary: "Local fallback inspected file signature, size, basic dimensions, SHA-256 hash, and embedded generator strings. This avoids fake results when the backend is down, but a running backend should still be used for production logging and consistent server-side analysis.",
  };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request to ${path} failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchTruthQuestBootstrap(): Promise<AppBootstrap> {
  return apiFetch<AppBootstrap>("/api/v1/app/bootstrap");
}

export async function checkBackendHealth(): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) return false;
  const payload = await response.json().catch(() => null);
  return payload?.status === "ok";
}

export async function analyzeContent(request: ContentAnalysisRequest): Promise<ContentAnalysisResponse> {
  try {
    return await apiFetch<ContentAnalysisResponse>("/api/v1/content/analyze", {
      method: "POST",
      body: JSON.stringify(request),
    });
  } catch (error) {
    if (request.mode === "image") throw error;
    const text = request.input.trim();
    const lowered = text.toLowerCase();
    const loadedTerms = ["breaking", "shocking", "miracle", "secret", "urgent", "must see", "doctors hate", "won't believe"];
    const loadedCount = loadedTerms.filter((term) => lowered.includes(term)).length;
    const languageLabel = loadedCount >= 2 ? "Strong loaded-language signal" : loadedCount === 1 ? "Some loaded-language signal" : "No strong loaded-language signal";
    const claimPatterns = /\b(?:\d+(?:\.\d+)?%?|reported|confirmed|claimed|found|shows|increased|decreased|study|report|data|survey|policy|law|court|government|research|official)\b/i;
    const claims = text.split(/(?<=[.!?])\s+/).filter((sentence) => sentence.length >= 35 && sentence.length <= 260 && claimPatterns.test(sentence)).slice(0, 5);
    const languageScore = Math.max(10, 78 - loadedCount * 10);
    const sourceScore = request.mode === "url" ? 35 : text.length >= 120 ? 48 : 38;
    const score = Math.round(sourceScore * 0.3 + 30 * 0.35 + (claims.length ? 48 : 30) * 0.2 + languageScore * 0.1 + 25 * 0.05);
    const backendMessage = error instanceof Error ? error.message : "Backend unavailable";
    return {
      analysisId: crypto.randomUUID(),
      sourceUrl: request.mode === "url" ? text : "",
      sourceTitle: "Offline browser analysis",
      sourceExcerpt: text.slice(0, 500),
      score,
      biasLabel: languageLabel,
      emotionLabel: loadedCount ? "High" : "Low",
      reliabilityLabel: "Unavailable",
      factAccuracy: "Insufficient evidence",
      summary: "The live backend was unavailable. This browser-only fallback identified language and claim patterns, but did not fetch the publisher or search independent evidence.",
      chips: ["⚠ Offline fallback", `✓ Claims: ${claims.length}`, "⚠ Insufficient evidence"],
      metrics: [
        { label: "Language Signal", value: languageLabel, sub: "Browser pattern check only" },
        { label: "Emotional Language", value: loadedCount ? "High" : "Low", sub: "Observable wording markers" },
        { label: "Source Context", value: "Unavailable", sub: "Backend could not fetch the source" },
        { label: "Evidence Status", value: "Insufficient evidence", sub: "No independent search was run" },
      ],
      recommendations: [
        { text: "Start the FastAPI backend to fetch the source and search independent evidence.", done: false },
        { text: "Open the original source and identify its author, date, and primary evidence.", done: false },
        { text: "Cross-check each extracted claim against two independent sources.", done: false },
      ],
      sourceSignals: [
        { label: "Analysis Mode", value: "Offline browser fallback", status: "warning" },
        { label: "Backend", value: backendMessage.slice(0, 100), status: "warning" },
      ],
      claims: claims.map((claim) => ({ claim, status: "Needs evidence", confidence: 20, evidence: "Claim pattern extracted locally; no source or evidence verification was performed." })),
      evidenceSources: [],
      scoreBreakdown: [
        { label: "Source Context", score: sourceScore, weight: 30 },
        { label: "Evidence Match", score: 30, weight: 35 },
        { label: "Claim Extraction", score: claims.length ? 48 : 30, weight: 20 },
        { label: "Language Quality", score: languageScore, weight: 10 },
        { label: "Transparency", score: 25, weight: 5 },
      ],
      analysisStatus: "insufficient_evidence",
      analysisConfidence: 18,
      limitations: [
        "The publisher page was not fetched.",
        "No independent evidence source was searched.",
        "Pattern matching cannot determine whether a claim is true.",
      ],
      xpEarned: 10,
    };
  }
}

export async function analyzeDeepfake(request: DeepfakeAnalysisRequest): Promise<DeepfakeAnalysisResponse> {
  const formData = new FormData();
  formData.append("media_type", request.mediaType);
  formData.append("file", request.file);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/deepfake/analyze`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const message = await response.text().catch(() => "");
      return analyzeDeepfakeLocally(request, message || `Backend returned ${response.status}`);
    }

    return await response.json() as DeepfakeAnalysisResponse;
  } catch (error) {
    return analyzeDeepfakeLocally(request, error instanceof Error ? error.message : "Backend unavailable");
  }
}

export function useTruthQuestBootstrap() {
  const [data, setData] = useState<AppBootstrap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetchTruthQuestBootstrap()
      .then((bootstrap) => {
        if (!active) return;
        setData(bootstrap);
        setError(null);
      })
      .catch((bootstrapError: unknown) => {
        if (!active) return;
        setError(bootstrapError instanceof Error ? bootstrapError.message : "Unable to load bootstrap data");
        setData(null);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return useMemo(
    () => ({ data, loading, error }),
    [data, loading, error],
  );
}
