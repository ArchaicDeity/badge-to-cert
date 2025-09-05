import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { mockQuestions, type Question } from '@/lib/mockData';

interface ContentStep {
  type: 'content';
  title: string;
  body: string;
}

interface QuizStep {
  type: 'quiz';
  title: string;
  shuffle?: boolean;
  duration: number; // seconds
  questionCount?: number;
}

type Step = ContentStep | QuizStep;

const courseSteps: Step[] = [
  {
    type: 'content',
    title: 'Course Introduction',
    body: 'This preview simulates the course flow a learner would experience. Use the next button to proceed through content and assessments.',
  },
  {
    type: 'quiz',
    title: 'Assessment',
    shuffle: true,
    duration: 5 * 60,
    questionCount: 5,
  },
];

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const CoursePreview = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);

  const step = courseSteps[stepIndex];

  useEffect(() => {
    if (step.type === 'quiz') {
      let qs = [...mockQuestions];
      if (step.shuffle) {
        qs = qs.sort(() => Math.random() - 0.5);
      }
      const count = step.questionCount ?? qs.length;
      qs = qs.slice(0, Math.min(count, qs.length));
      setQuestions(qs);
      setAnswers(new Array(qs.length).fill(-1));
      setCurrentQuestionIndex(0);
      setResult(null);
      setTimeRemaining(step.duration);
    }
  }, [step]);

  useEffect(() => {
    if (step.type === 'quiz' && timeRemaining > 0 && !result) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, timeRemaining, result, handleSubmit]);

  const handleAnswerSelect = (index: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = index;
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = useCallback(() => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) correct++;
    });
    const score = Math.round((correct / questions.length) * 100);
    setResult({ score, passed: score >= 80 });
  }, [answers, questions]);

  const restartPreview = () => {
    setStepIndex(0);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
          <span className="text-sm text-muted-foreground">Course {courseId} preview</span>
        </div>

        {step.type === 'content' && (
          <Card>
            <CardHeader>
              <CardTitle>{step.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{step.body}</p>
              <Button onClick={() => setStepIndex(stepIndex + 1)}>Next</Button>
            </CardContent>
          </Card>
        )}

        {step.type === 'quiz' && (
          <>
            {result ? (
              <Card className="text-center">
                <CardHeader>
                  <div
                    className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4 ${
                      result.passed ? 'bg-success/10' : 'bg-destructive/10'
                    }`}
                  >
                    {result.passed ? (
                      <CheckCircle2 className="h-8 w-8 text-success" />
                    ) : (
                      <XCircle className="h-8 w-8 text-destructive" />
                    )}
                  </div>
                  <CardTitle>
                    {result.passed ? 'Assessment Passed' : 'Assessment Failed'}
                  </CardTitle>
                  <CardDescription>
                    Score: {result.score}% ({Math.round((result.score / 100) * questions.length)}/{questions.length} correct)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={restartPreview} variant="outline">
                    Restart Preview
                  </Button>
                  <Button onClick={() => navigate(-1)}>Close</Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{step.title}</span>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      {formatTime(timeRemaining)}
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} />
                  <div className="space-y-3">
                    {questions[currentQuestionIndex]?.choices.map((choice, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswerSelect(idx)}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all hover:bg-muted/50 ${
                          answers[currentQuestionIndex] === idx
                            ? 'border-primary bg-primary/5'
                            : 'border-border'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              answers[currentQuestionIndex] === idx
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-muted-foreground'
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span className="text-lg">{choice}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between mt-4">
                    <Button
                      variant="outline"
                      onClick={handlePrevQuestion}
                      disabled={currentQuestionIndex === 0}
                    >
                      Previous
                    </Button>
                    {currentQuestionIndex === questions.length - 1 ? (
                      <Button
                        onClick={handleSubmit}
                        disabled={answers.some((a) => a === -1)}
                        className="bg-success hover:bg-success/90"
                      >
                        Submit
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNextQuestion}
                        disabled={answers[currentQuestionIndex] === -1}
                      >
                        Next
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CoursePreview;
