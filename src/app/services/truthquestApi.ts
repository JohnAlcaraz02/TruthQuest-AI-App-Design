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
  xpEarned: number;
};

export type DeepfakeAnalysisRequest = {
  mediaType: DeepfakeMediaType;
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

export async function analyzeContent(request: ContentAnalysisRequest): Promise<ContentAnalysisResponse> {
  return apiFetch<ContentAnalysisResponse>("/api/v1/content/analyze", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function analyzeDeepfake(request: DeepfakeAnalysisRequest): Promise<DeepfakeAnalysisResponse> {
  return apiFetch<DeepfakeAnalysisResponse>("/api/v1/deepfake/analyze", {
    method: "POST",
    body: JSON.stringify(request),
  });
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
