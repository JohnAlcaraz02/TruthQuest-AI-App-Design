import { useState } from "react";
import { Link } from "react-router";
import { Home, Search, BookOpen, Trophy, User, CheckCircle, XCircle } from "lucide-react";
import { motion } from "motion/react";

export default function MobileQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);

  const questions = [
    {
      question: "Which source is most credible?",
      options: ["Social media post", "Peer-reviewed journal", "Anonymous blog", "Viral video"],
      correct: 1,
    },
    {
      question: "What indicates bias in an article?",
      options: ["Multiple perspectives", "Emotional language", "Citations", "Author credentials"],
      correct: 1,
    },
  ];

  const handleAnswer = (index: number) => {
    if (showFeedback) return;
    setSelectedAnswer(index);
    setShowFeedback(true);
    if (index === questions[currentQuestion].correct) {
      setScore(score + 50);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-accent p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Quiz</h1>
            <p className="text-sm opacity-90">Question {currentQuestion + 1}/{questions.length}</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">Score</p>
            <p className="text-2xl font-bold">{score}</p>
          </div>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div
            className="bg-white h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-6">{currentQ.question}</h2>
            <div className="space-y-3">
              {currentQ.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQ.correct;
                const showCorrect = showFeedback && isCorrect;
                const showIncorrect = showFeedback && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={showFeedback}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      showCorrect
                        ? "bg-success/10 border-success"
                        : showIncorrect
                        ? "bg-destructive/10 border-destructive"
                        : isSelected
                        ? "bg-primary/10 border-primary"
                        : "bg-card border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
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
                          <CheckCircle className="w-4 h-4" />
                        ) : showIncorrect ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <span className="text-sm font-medium">{String.fromCharCode(65 + index)}</span>
                        )}
                      </div>
                      <span className="font-medium text-foreground">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl ${
                selectedAnswer === currentQ.correct
                  ? "bg-success/10 border-2 border-success/30"
                  : "bg-amber-50 border-2 border-accent/30"
              }`}
            >
              <p className="font-semibold text-foreground">
                {selectedAnswer === currentQ.correct ? "Correct! 🎉" : "Not quite right"}
              </p>
              {selectedAnswer === currentQ.correct && (
                <p className="text-sm text-success mt-1">+50 points earned!</p>
              )}
            </motion.div>
          )}

          {showFeedback && (
            <button
              onClick={handleNext}
              className="w-full px-6 py-4 bg-primary text-white rounded-xl font-medium"
            >
              {currentQuestion < questions.length - 1 ? "Next Question" : "Finish Quiz"}
            </button>
          )}
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-6 py-4">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <Link to="/mobile" className="flex flex-col items-center gap-1 text-muted-foreground">
            <Home className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </Link>
          <Link to="/mobile/analyze" className="flex flex-col items-center gap-1 text-muted-foreground">
            <Search className="w-6 h-6" />
            <span className="text-xs">Analyze</span>
          </Link>
          <Link to="/mobile/learning" className="flex flex-col items-center gap-1 text-muted-foreground">
            <BookOpen className="w-6 h-6" />
            <span className="text-xs">Learn</span>
          </Link>
          <Link to="/mobile/quiz" className="flex flex-col items-center gap-1 text-primary">
            <Trophy className="w-6 h-6" />
            <span className="text-xs font-medium">Quiz</span>
          </Link>
          <Link to="/mobile/profile" className="flex flex-col items-center gap-1 text-muted-foreground">
            <User className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
