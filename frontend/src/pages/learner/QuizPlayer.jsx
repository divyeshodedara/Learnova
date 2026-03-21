import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { startQuizAttempt, submitQuizAnswer, completeQuizAttempt } from "../../api/player";
import { Button } from "../../components/ui/Button";
import { ArrowLeft, Loader2, CheckCircle, XCircle } from "lucide-react";

export default function QuizPlayer() {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    initQuiz();
  }, [quizId]);

  const initQuiz = async () => {
    try {
      setLoading(true);
      const res = await startQuizAttempt(quizId);
      // Attempt object typically includes questions
      setAttempt(res.data.data || res.data);
    } catch (err) {
      setError("Failed to start quiz attempt.");
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = attempt?.quiz?.questions?.[currentQuestionIndex];

  const handleNext = async () => {
    if (!selectedOption) return;
    
    setSubmitting(true);
    setError("");
    try {
      // Submit answer to the backend
      await submitQuizAnswer(attempt.id, {
        questionId: currentQuestion.id,
        optionId: selectedOption
      });

      if (currentQuestionIndex < (attempt.quiz?.questions?.length || 0) - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedOption(null);
      } else {
        // Last question answered, complete attempt
        const endRes = await completeQuizAttempt(attempt.id);
        setResult(endRes.data.data || endRes.data);
        setCompleted(true);
      }
    } catch (err) {
      setError("Failed to submit answer.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
         <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !attempt) {
    return (
      <div className="flex flex-col h-screen items-center justify-center p-4 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => navigate(`/player/${courseId}/intro`)}>Return to Course</Button>
      </div>
    );
  }

  if (completed && result) {
    const passed = result.score >= (attempt?.quiz?.passingScore || 60);
    return (
      <div className="max-w-xl mx-auto mt-24 text-center space-y-6 bg-card p-10 rounded-2xl border border-border shadow-lg">
        {passed ? (
          <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto" />
        ) : (
          <XCircle className="h-16 w-16 text-destructive mx-auto" />
        )}
        <h1 className="text-3xl font-bold">Quiz Completed</h1>
        <p className="text-muted-foreground text-lg">Your score: <span className="font-bold text-foreground">{result.score}%</span></p>
        <p className="text-sm">Passing score is {attempt?.quiz?.passingScore || 60}%</p>
        
        <div className="mt-8">
          <Button onClick={() => navigate(`/player/${courseId}/intro`)} size="lg">
            Return to Course Curriculum
          </Button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-xl mx-auto mt-24 text-center p-10 bg-card rounded-2xl border shadow-sm">
        <h1 className="text-xl font-semibold mb-4">No questions found in this quiz.</h1>
        <Button onClick={() => navigate(`/player/${courseId}/intro`)}>Return to Course</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-12 mb-24 px-4">
      <Button variant="ghost" className="mb-8" onClick={() => navigate(`/player/${courseId}/intro`)}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Course
      </Button>

      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold">{attempt.quiz?.title}</h2>
        <span className="text-sm font-medium text-muted-foreground">
          Question {currentQuestionIndex + 1} of {attempt.quiz?.questions?.length}
        </span>
      </div>

      <div className="w-full bg-muted h-2 rounded-full mb-10 overflow-hidden">
         <div 
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex) / (attempt.quiz?.questions?.length || 1)) * 100}%` }}
         ></div>
      </div>

      <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
        <h3 className="text-xl font-medium mb-8 leading-relaxed">
          {currentQuestion.topic || currentQuestion.title || "Question"}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options?.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedOption(option.id)}
              className={`
                w-full text-left p-4 rounded-lg border-2 transition-all duration-200
                ${selectedOption === option.id 
                  ? 'border-primary bg-primary/5 text-foreground' 
                  : 'border-border bg-background hover:border-primary/50 text-muted-foreground hover:text-foreground'
                }
              `}
            >
              {option.text}
            </button>
          ))}
        </div>

        {error && <p className="text-destructive mt-4 text-sm">{error}</p>}

        <div className="mt-8 flex justify-end">
          <Button 
            size="lg" 
            onClick={handleNext} 
            disabled={!selectedOption || submitting}
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {currentQuestionIndex < attempt.quiz?.questions?.length - 1 ? "Next Question" : "Submit Quiz"}
          </Button>
        </div>
      </div>
    </div>
  );
}
