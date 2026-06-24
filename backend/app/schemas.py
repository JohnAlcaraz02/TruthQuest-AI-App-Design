from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


ContentAnalysisMode = Literal["url", "text", "image"]
DeepfakeMediaType = Literal["image", "video", "audio"]


class LandingFeature(BaseModel):
    icon: str
    title: str
    description: str


class LandingStat(BaseModel):
    value: str
    label: str


class LandingTestimonial(BaseModel):
    name: str
    role: str
    content: str
    avatar: str


class DashboardRecentAnalysis(BaseModel):
    title: str
    source: str
    score: int
    bias: str
    time: str
    tag: str


class LearningModule(BaseModel):
    id: int
    title: str
    icon: str
    color: str
    xp: int
    progress: int
    lessons: int
    completed: bool


class LeaderboardEntry(BaseModel):
    rank: int
    name: str
    xp: int
    avatar: str
    badge: str = ""
    isMe: bool = False


class QuizQuestion(BaseModel):
    id: int
    question: str
    options: list[str]
    correct: int
    explanation: str


class ProfileStat(BaseModel):
    label: str
    value: str
    icon: str
    color: str


class ProfileBadge(BaseModel):
    icon: str
    name: str
    earned: bool


class ProfileActivity(BaseModel):
    action: str
    title: str
    time: str
    xp: int


class TeacherStudent(BaseModel):
    id: int
    name: str
    level: int
    xp: int
    score: int
    streak: int
    lessons: int
    status: str


class TeacherAssignment(BaseModel):
    title: str
    due: str
    submitted: int
    total: int
    status: str


class ContentAnalyzeRequest(BaseModel):
    mode: ContentAnalysisMode
    input: str = Field(min_length=1)


class ContentMetric(BaseModel):
    label: str
    value: str
    sub: str


class ContentRecommendation(BaseModel):
    text: str
    done: bool


class ContentAnalysisResponse(BaseModel):
    analysisId: str
    sourceUrl: str
    sourceTitle: str
    sourceExcerpt: str
    score: int
    biasLabel: str
    emotionLabel: str
    reliabilityLabel: str
    factAccuracy: str
    summary: str
    chips: list[str]
    metrics: list[ContentMetric]
    recommendations: list[ContentRecommendation]
    xpEarned: int


class DeepfakeAnalyzeRequest(BaseModel):
    mediaType: DeepfakeMediaType


class DeepfakeIndicator(BaseModel):
    label: str
    value: int
    risk: str
    color: str


class DeepfakeMetadataItem(BaseModel):
    label: str
    value: str


class DeepfakeAnalysisResponse(BaseModel):
    analysisId: str
    score: int
    verdict: str
    probabilityLabel: str
    probability: int
    summary: str
    indicators: list[DeepfakeIndicator]
    metadata: list[DeepfakeMetadataItem]
    aiSummary: str
