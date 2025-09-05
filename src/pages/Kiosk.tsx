import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, User, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { mockQuestions, mockLearners, type Question, type Learner } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

type KioskStep = 'badge-input' | 'quiz' | 'complete';

const Kiosk = () => {
  const { cohortId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('t');
  const { toast } = useToast();
  
  const [step, setStep] = useState<KioskStep>('badge-input');
  const [badgeId, setBadgeId] = useState('');
  const [currentLearner, setCurrentLearner] = useState<Learner | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes
  const [quizResult, setQuizResult] = useState<{ score: number; passed: boolean } | null>(null);

  // Validate kiosk token
  useEffect(() => {
    if (!token || token !== 'demo123') {
      toast({
        title: "Access Denied",
        description: "Invalid kiosk token",
        variant: "destructive",
      });
    }
  }, [token, toast]);

  // Timer for quiz
  useEffect(() => {
    if (step === 'quiz' && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [step, timeRemaining]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBadgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const learner = mockLearners.find(l => l.badgeId === badgeId.toUpperCase());
    
    if (!learner) {
      toast({
        title: "Badge Not Found",
        description: "Please check your badge ID and try again",
        variant: "destructive",
      });
      return;
    }

    setCurrentLearner(learner);
    
    // Shuffle and select 20 questions
    const shuffled = [...mockQuestions].sort(() => Math.random() - 0.5).slice(0, Math.min(20, mockQuestions.length));
    setQuestions(shuffled);
    setAnswers(new Array(shuffled.length).fill(-1));
    setStep('quiz');
    
    toast({
      title: "Welcome!",
      description: `Starting quiz for ${learner.name}`,
    });
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    let correctAnswers = 0;
    
    questions.forEach((question, index) => {
      if (answers[index] === question.correctIndex) {
        correctAnswers++;
      }
    });
    
    const score = Math.round((correctAnswers / questions.length) * 100);
    const passed = score >= 80;
    
    setQuizResult({ score, passed });
    setStep('complete');
    
    toast({
      title: passed ? "Quiz Passed!" : "Quiz Not Passed",
      description: `Score: ${score}% (${correctAnswers}/${questions.length} correct)`,
      variant: passed ? "default" : "destructive",
    });
  };

  const resetKiosk = () => {
    setStep('badge-input');
    setBadgeId('');
    setCurrentLearner(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setTimeRemaining(30 * 60);
    setQuizResult(null);
  };

  if (!token || token !== 'demo123') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-destructive/5">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">Invalid kiosk access token</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Kiosk Header */}
      <div className="bg-primary text-primary-foreground p-4 text-center">
        <h1 className="text-2xl font-bold">SASOL First Aid Training</h1>
        <p className="text-primary-foreground/80">Theory Assessment Kiosk</p>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {step === 'badge-input' && (
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Badge Check-in</CardTitle>
              <CardDescription>
                Scan or enter your badge ID to begin the theory assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBadgeSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="badgeId" className="text-lg">Badge ID</Label>
                  <Input
                    id="badgeId"
                    type="text"
                    value={badgeId}
                    onChange={(e) => setBadgeId(e.target.value)}
                    placeholder="Enter or scan badge ID"
                    className="text-xl py-6 text-center font-mono"
                    autoFocus
                    required
                  />
                </div>
                <Button type="submit" size="lg" className="w-full text-lg py-6">
                  Start Assessment
                </Button>
              </form>
              
              <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold mb-2">Demo Badge IDs:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {mockLearners.map(learner => (
                    <div key={learner.id} className="font-mono">
                      {learner.badgeId} - {learner.name}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'quiz' && (
          <div className="space-y-6">
            {/* Quiz Header */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <div className="font-semibold">{currentLearner?.name}</div>
                      <div className="text-muted-foreground">{currentLearner?.badgeId}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Time Remaining</div>
                      <div className={`text-lg font-mono font-bold ${timeRemaining < 300 ? 'text-destructive' : 'text-foreground'}`}>
                        <Clock className="inline h-4 w-4 mr-1" />
                        {formatTime(timeRemaining)}
                      </div>
                    </div>
                    <Badge variant="outline">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </Badge>
                  </div>
                </div>
                <Progress 
                  value={((currentQuestionIndex + 1) / questions.length) * 100} 
                  className="mt-4"
                />
              </CardContent>
            </Card>

            {/* Current Question */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  {questions[currentQuestionIndex]?.body}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {questions[currentQuestionIndex]?.choices.map((choice, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all hover:bg-muted/50 ${
                        answers[currentQuestionIndex] === index
                          ? 'border-primary bg-primary/5'
                          : 'border-border'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          answers[currentQuestionIndex] === index
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-muted-foreground'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-lg">{choice}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </Button>
                  
                  {currentQuestionIndex === questions.length - 1 ? (
                    <Button
                      onClick={handleSubmitQuiz}
                      disabled={answers.some(a => a === -1)}
                      className="bg-success hover:bg-success/90"
                    >
                      Submit Quiz
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNextQuestion}
                      disabled={answers[currentQuestionIndex] === -1}
                    >
                      Next Question
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'complete' && quizResult && (
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4 ${
                quizResult.passed ? 'bg-success/10' : 'bg-destructive/10'
              }`}>
                {quizResult.passed ? (
                  <CheckCircle2 className="h-8 w-8 text-success" />
                ) : (
                  <XCircle className="h-8 w-8 text-destructive" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {quizResult.passed ? 'Theory Assessment Passed!' : 'Theory Assessment Not Passed'}
              </CardTitle>
              <CardDescription>
                Your score: {quizResult.score}% ({Math.round((quizResult.score / 100) * questions.length)}/{questions.length} correct)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                {quizResult.passed ? (
                  <div className="p-4 bg-success/10 rounded-lg">
                    <p className="text-success-foreground">
                      <strong>Congratulations!</strong> You may now proceed to the practical assessment.
                      Please wait for the assessor to call you.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-destructive/10 rounded-lg">
                    <p className="text-destructive-foreground">
                      <strong>Theory assessment not passed.</strong> You need 80% or higher to proceed.
                      Please speak with the instructor for additional training.
                    </p>
                  </div>
                )}

                <Button onClick={resetKiosk} variant="outline" size="lg">
                  Next Learner
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Kiosk;