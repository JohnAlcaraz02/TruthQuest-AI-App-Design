import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Clock, Award, CheckCircle, XCircle, ArrowRight, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const questions = [
    {
      question: "Which of the following is the MOST credible source for scientific information?",
      options: [
        "A social media post with no citations",
        "A peer-reviewed scientific journal",
        "A blog post by an anonymous author",
        "A viral video on social media",
      ],
      correct: 1,
      explanation: "Peer-reviewed scientific journals undergo rigorous verification by experts in the field before publication, making them highly credible sources.",
      difficulty: "Easy",
    },
    {
      question: "What is a common sign that an article might contain bias?",
      options: [
        "It presents multiple perspectives on an issue",
        "It uses emotional language to influence the reader",
        "It cites reputable sources",
        "It includes the author's credentials",
      ],
      correct: 1,
      explanation: "Articles that rely heavily on emotional or loaded language are often trying to influence your opinion rather than inform you objectively.",
      difficulty: "Medium",
    },
    {
      question: "Before sharing a news story on social media, you should:",
      options: [
        "Check if the headline sounds interesting",
        "Verify the information with multiple credible sources",
        "Share it immediately if it has many likes",
        "Only read the headline",
      ],
      correct: 1,
      explanation: "Always verify information with multiple credible sources before sharing to prevent the spread of misinformation.",
      difficulty: "Easy",
    },
    {
      question: "What does 'deepfake' technology primarily use to create fake content?",
      options: [
        "Traditional photo editing software",
        "Artificial Intelligence and machine learning",
        "Manual video editing",
        "Simple copy and paste techniques",
      ],
      correct: 1,
      explanation: "Deepfakes use AI and machine learning algorithms to create realistic but fake images, videos, or audio recordings.",
      difficulty: "Hard",
    },
    {
      question: "Which factor is LEAST important when evaluating a source's credibility?",
      options: [
        "The author's expertise and credentials",
        "The publication date of the information",
        "The number of advertisements on the page",
        "Whether the claims are backed by evidence",
      ],
      correct: 2,
      explanation: "While ads can be annoying, they don't directly affect the credibility of the content. Focus on author expertise, timeliness, and evidence instead.",
      difficulty: "Medium",
    },
  ];

  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answerIndex);
    setShowFeedback(true);
    
    if (answerIndex === questions[currentQuestion].correct) {
      setScore(score + 20);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setTimeLeft(30);
    } else {
      setQuizComplete(true);
      if (score >= 60) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-success text-white";
      case "Medium":
        return "bg-accent text-white";
      case "Hard":
        return "bg-destructive text-white";
      default:
        return "bg-muted text-foreground";
    }
  };

  if (quizComplete) {
    const percentage = (score / 100) * 100;
    const passed = percentage >= 60;

    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl w-full"
          >
            <div className="bg-card rounded-xl p-8 border border-border shadow-lg text-center">
              <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
                passed ? "bg-success" : "bg-accent"
              }`}>
                {passed ? (
                  <CheckCircle className="w-12 h-12 text-white" />
                ) : (
                  <Award className="w-12 h-12 text-white" />
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {passed ? "Congratulations! 🎉" : "Good Effort!"}
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                {passed
                  ? "You've passed the Media Literacy Quiz!"
                  : "Keep learning and try again!"}
              </p>
              
              <div className="bg-muted rounded-xl p-6 mb-8">
                <div className="flex items-center justify-center gap-8 mb-6">
                  <div>
                    <p className="text-4xl font-bold text-primary mb-1">{score}</p>
                    <p className="text-sm text-muted-foreground">Points Earned</p>
                  </div>
                  <div className="w-px h-16 bg-border" />
                  <div>
                    <p className="text-4xl font-bold text-primary mb-1">{percentage}%</p>
                    <p className="text-sm text-muted-foreground">Score</p>
                  </div>
                </div>
                
                <div className="w-full bg-card rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${passed ? "bg-success" : "bg-accent"}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              
              {passed && (
                <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-white mb-8">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Award className="w-6 h-6" />
                    <h3 className="text-lg font-semibold">Achievement Unlocked!</h3>
                  </div>
                  <p className="text-sm opacity-90">Media Literacy Master</p>
                  <p className="text-xs opacity-75 mt-1">+50 Bonus XP</p>
                </div>
              )}
              
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground mb-3">Your Performance</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-muted-foreground mb-1">Correct Answers</p>
                    <p className="text-2xl font-bold text-success">
                      {questions.filter((_, i) => i <= currentQuestion).length - Math.floor((100 - score) / 20)}
                    </p>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-muted-foreground mb-1">Total Questions</p>
                    <p className="text-2xl font-bold text-foreground">{questions.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => {
                    setQuizComplete(false);
                    setCurrentQuestion(0);
                    setScore(0);
                    setSelectedAnswer(null);
                    setShowFeedback(false);
                  }}
                  className="flex-1 px-6 py-3 bg-card border border-border text-foreground rounded-xl font-medium hover:bg-muted transition-all"
                >
                  Retry Quiz
                </button>
                <button
                  onClick={() => window.location.href = "/learning"}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-opacity-90 transition-all"
                >
                  Continue Learning
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Media Literacy Quiz
                </h1>
                <p className="text-muted-foreground">
                  Test your knowledge and earn XP
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Your Score</p>
                <p className="text-3xl font-bold text-primary">{score}</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-2">
              <motion.div
                className="bg-primary h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>

          {/* Quiz Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-card rounded-xl p-8 border border-border shadow-sm mb-6">
                {/* Question Header */}
                <div className="flex items-center justify-between mb-6">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${getDifficultyColor(currentQ.difficulty)}`}>
                    {currentQ.difficulty}
                  </span>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-5 h-5" />
                    <span className="text-lg font-medium">{timeLeft}s</span>
                  </div>
                </div>

                {/* Question */}
                <h2 className="text-2xl font-semibold text-foreground mb-8 leading-relaxed">
                  {currentQ.question}
                </h2>

                {/* Options */}
                <div className="space-y-4">
                  {currentQ.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = index === currentQ.correct;
                    const showCorrect = showFeedback && isCorrect;
                    const showIncorrect = showFeedback && isSelected && !isCorrect;

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={showFeedback}
                        className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                          showCorrect
                            ? "bg-success/10 border-success text-foreground"
                            : showIncorrect
                            ? "bg-destructive/10 border-destructive text-foreground"
                            : isSelected
                            ? "bg-primary/10 border-primary text-foreground"
                            : "bg-card border-border hover:border-primary text-foreground"
                        } ${showFeedback ? "cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              showCorrect
                                ? "bg-success text-white"
                                : showIncorrect
                                ? "bg-destructive text-white"
                                : isSelected
                                ? "bg-primary text-white"
                                : "bg-muted text-foreground"
                            }`}
                          >
                            {showCorrect ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : showIncorrect ? (
                              <XCircle className="w-5 h-5" />
                            ) : (
                              <span className="font-medium">{String.fromCharCode(65 + index)}</span>
                            )}
                          </div>
                          <span className="flex-1 font-medium">{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Feedback */}
                {showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-6 p-5 rounded-xl ${
                      selectedAnswer === currentQ.correct
                        ? "bg-success/10 border-2 border-success/30"
                        : "bg-amber-50 border-2 border-accent/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Lightbulb className={`w-6 h-6 flex-shrink-0 ${
                        selectedAnswer === currentQ.correct ? "text-success" : "text-accent"
                      }`} />
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">
                          {selectedAnswer === currentQ.correct ? "Correct! 🎉" : "Not quite right"}
                        </h3>
                        <p className="text-sm text-foreground leading-relaxed">
                          {currentQ.explanation}
                        </p>
                        {selectedAnswer === currentQ.correct && (
                          <p className="text-sm font-medium text-success mt-3">+20 points earned!</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Navigation */}
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-end"
                >
                  <button
                    onClick={handleNext}
                    className="px-8 py-4 bg-primary text-white rounded-xl font-medium hover:bg-opacity-90 transition-all flex items-center gap-2"
                  >
                    {currentQuestion < questions.length - 1 ? "Next Question" : "View Results"}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
