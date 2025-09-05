import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, User, CheckCircle2, XCircle } from 'lucide-react';
import {
  mockQuestions,
  mockLearners,
  mockCohorts,
  getEnterpriseById,
  getCoursesForEnterprise,
  type Question,
  type Learner,
} from '@/lib/mockData';
import useEnterpriseBranding from '@/hooks/use-enterprise-branding';
import { useToast } from '@/hooks/use-toast';

type KioskStep = 'badge-input' | 'block' | 'complete';

type CourseBlock = {
  id: number;
  kind: 'CONTENT' | 'ASSESSMENT';
  title: string;
  position: number;
  isMandatory: boolean;
  configJson?: string | null;
};

interface BlockConfig {
  durationMinutes?: number;
  timeLimitMinutes?: number;
  numQuestions?: number;
  passMarkPercent?: number;
  retakeCooldownMinutes?: number;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  htmlBody?: string;
}

interface QuizState {
  questions: Question[];
  answers: number[];
  result?: { score: number; passed: boolean };
  attempts: number;
  retakeAvailableAt?: number;
}

const Kiosk = () => {
  const { cohortId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('t');
  const { toast } = useToast();
  const [step, setStep] = useState<KioskStep>('badge-input');
  const [badgeId, setBadgeId] = useState('');
  const [currentLearner, setCurrentLearner] = useState<Learner | null>(null);
  const [blocks, setBlocks] = useState<CourseBlock[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [quiz, setQuiz] = useState<QuizState>({ questions: [], answers: [], attempts: 0 });

  const cohort = mockCohorts.find((c) => c.id === (cohortId || '1'));
  const enterprise = getEnterpriseById(cohort?.enterpriseId);
  useEnterpriseBranding(enterprise);
  const courses = getCoursesForEnterprise(cohort?.enterpriseId);

  useEffect(() => {
    if (!token || token !== 'demo123') {
      toast({ title: 'Access Denied', description: 'Invalid kiosk token', variant: 'destructive' });
    }
  }, [token, toast]);

  // global timer for content/assessment blocks
  useEffect(() => {
    if (step === 'block' && timer > 0) {
      const t = setInterval(() => {
        setTimer((s) => (s > 0 ? s - 1 : 0));
      }, 1000);
      return () => clearInterval(t);
    }
  }, [step, timer]);

  // retake cooldown timer
  useEffect(() => {
    if (quiz.retakeAvailableAt) {
      const id = setInterval(() => {
        if (Date.now() >= quiz.retakeAvailableAt!) {
          const cfg = parseConfig(blocks[currentIndex]);
          const qs = buildQuestions(cfg);
          setQuiz({ questions: qs, answers: new Array(qs.length).fill(-1), attempts: quiz.attempts });
          setQuestionIndex(0);
          setTimer((cfg.timeLimitMinutes ?? 0) * 60);
          setQuiz((prev) => ({ ...prev, retakeAvailableAt: undefined }));
        }
      }, 1000);
      return () => clearInterval(id);
    }
  }, [quiz.retakeAvailableAt, quiz.attempts, blocks, currentIndex]);

  const parseConfig = (block: CourseBlock): BlockConfig => {
    try {
      return block.configJson ? JSON.parse(block.configJson) : {};
    } catch {
      return {};
    }
  };

  const buildQuestions = (cfg: BlockConfig): Question[] => {
    const count = cfg.numQuestions ?? mockQuestions.length;
    const shuffled = [...mockQuestions];
    if (cfg.shuffleQuestions) {
      shuffled.sort(() => Math.random() - 0.5);
    }
    return shuffled.slice(0, count);
  };

  const loadBlocks = async (courseId: string) => {
    try {
      const res = await fetch(`/api/kiosk/course/${courseId}`);
      const data: { blocks: CourseBlock[] } = await res.json();
      setBlocks(data.blocks ?? []);
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to load course', variant: 'destructive' });
    }
  };

  const startBlock = (index: number) => {
    if (index >= blocks.length) {
      setStep('complete');
      return;
    }

    setCurrentIndex(index);
    const block = blocks[index];
    const cfg = parseConfig(block);

    if (block.kind === 'ASSESSMENT') {
      const qs = buildQuestions(cfg);
      setQuiz({ questions: qs, answers: new Array(qs.length).fill(-1), attempts: 0 });
      setQuestionIndex(0);
      setTimer((cfg.timeLimitMinutes ?? 0) * 60);
    } else {
      setTimer((cfg.durationMinutes ?? 0) * 60);
    }

    setStep('block');
  };

  const handleBadgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const learner = mockLearners.find((l) => l.badgeId === badgeId.toUpperCase());
    if (!learner) {
      toast({
        title: 'Badge Not Found',
        description: 'Please check your badge ID and try again',
        variant: 'destructive',
      });
      return;
    }
    setCurrentLearner(learner);
    await loadBlocks(cohortId ?? '0');
    startBlock(0);
    toast({ title: 'Welcome!', description: `Starting course for ${learner.name}` });
  };

  const handleContentContinue = () => {
    completeBlock('COMPLETED');
  };

  const updateProgress = async (status: 'COMPLETED' | 'FAILED', score?: number) => {
    const block = blocks[currentIndex];
    try {
      await fetch('/api/enrollment/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockId: block.id, status, score }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const completeBlock = async (status: 'COMPLETED' | 'FAILED', score?: number) => {
    await updateProgress(status, score);
    const block = blocks[currentIndex];
    if (status === 'COMPLETED' || !block.isMandatory) {
      startBlock(currentIndex + 1);
    } else {
      setStep('complete');
    }
  };

  const handleAnswerSelect = (answer: number) => {
    const newAnswers = [...quiz.answers];
    newAnswers[questionIndex] = answer;
    setQuiz((prev) => ({ ...prev, answers: newAnswers }));
  };

  const handleSubmitQuiz = () => {
    let correct = 0;
    quiz.questions.forEach((q, i) => {
      if (quiz.answers[i] === q.correctIndex) correct++;
    });
    const score = Math.round((correct / quiz.questions.length) * 100);
    const cfg = parseConfig(blocks[currentIndex]);
    const passed = score >= (cfg.passMarkPercent ?? 80);
    const attempts = quiz.attempts + 1;
    if (passed) {
      setQuiz((prev) => ({ ...prev, result: { score, passed }, attempts }));
      completeBlock('COMPLETED', score);
    } else {
      if (attempts < (cfg.maxAttempts ?? 1)) {
        const cooldown = (cfg.retakeCooldownMinutes ?? 10) * 60;
        setQuiz({
          ...quiz,
          result: { score, passed },
          attempts,
          retakeAvailableAt: Date.now() + cooldown * 1000,
        });
      } else {
        setQuiz((prev) => ({ ...prev, result: { score, passed }, attempts }));
        completeBlock('FAILED', score);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const resetKiosk = () => {
    setStep('badge-input');
    setBadgeId('');
    setCurrentLearner(null);
    setBlocks([]);
    setCurrentIndex(0);
    setTimer(0);
    setQuestionIndex(0);
    setQuiz({ questions: [], answers: [], attempts: 0 });
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

  const currentBlock = blocks[currentIndex];

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
        {/* Kiosk Header */}
        <div className="bg-primary text-primary-foreground p-4 text-center flex flex-col items-center">
        {enterprise?.brandLogoPath && (
          <img
            src={enterprise.brandLogoPath}
            alt={enterprise.name}
            className="h-12 mb-2 object-contain"
          />
        )}
        <h1 className="text-2xl font-bold">{enterprise?.name || 'First Aid Training'}</h1>

        <p className="text-primary-foreground/80">Theory Assessment Kiosk</p>
      </div>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
          {step === 'badge-input' && (
            <>
              {courses.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Courses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-1">
                      {courses.map((c) => (
                        <li key={c.id}>{c.title}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
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
                      <Label htmlFor="badgeId" className="text-lg">
                        Badge ID
                      </Label>
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
                      Start
                    </Button>
                  </form>

                  <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold mb-2">Demo Badge IDs:</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {mockLearners.map((l) => (
                        <div key={l.id} className="font-mono">
                          {l.badgeId} - {l.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

        {step === 'block' && currentBlock && currentBlock.kind === 'CONTENT' && (
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>{currentBlock.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: parseConfig(currentBlock).htmlBody ?? '' }}
              />
              {timer > 0 && (
                <div className="mb-4 text-center font-mono">
                  <Clock className="inline h-4 w-4 mr-1" /> {formatTime(timer)}
                </div>
              )}
              <Button onClick={handleContentContinue} disabled={timer > 0} className="w-full">
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'block' && currentBlock && currentBlock.kind === 'ASSESSMENT' && (
          <div className="space-y-6">
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
                      <div className={`text-lg font-mono font-bold ${timer < 300 ? 'text-destructive' : 'text-foreground'}`}>
                        <Clock className="inline h-4 w-4 mr-1" />
                        {formatTime(timer)}
                      </div>
                    </div>
                    <Badge variant="outline">
                      Question {questionIndex + 1} of {quiz.questions.length}
                    </Badge>
                  </div>
                </div>
                <Progress value={((questionIndex + 1) / quiz.questions.length) * 100} className="mt-4" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{quiz.questions[questionIndex]?.body}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quiz.questions[questionIndex]?.choices.map((choice, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all hover:bg-muted/50 ${
                        quiz.answers[questionIndex] === index ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            quiz.answers[questionIndex] === index
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-muted-foreground'
                          }`}
                        >
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-lg">{choice}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between mt-8">
                  <Button variant="outline" onClick={() => setQuestionIndex((i) => i - 1)} disabled={questionIndex === 0}>
                    Previous
                  </Button>
                  {questionIndex === quiz.questions.length - 1 ? (
                    <Button
                      onClick={handleSubmitQuiz}
                      disabled={quiz.answers.some((a) => a === -1)}
                      className="bg-success hover:bg-success/90"
                    >
                      Submit Quiz
                    </Button>
                  ) : (
                    <Button onClick={() => setQuestionIndex((i) => i + 1)} disabled={quiz.answers[questionIndex] === -1}>
                      Next Question
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {quiz.result && quiz.result.passed === false && quiz.retakeAvailableAt && (
              <Card className="bg-destructive/10">
                <CardContent className="p-4 text-center">
                  <p className="mb-2 font-semibold text-destructive">Attempt failed.</p>
                  <p className="text-sm text-muted-foreground">
                    Next attempt available in {formatTime(Math.max(0, Math.ceil((quiz.retakeAvailableAt - Date.now()) / 1000)))}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {step === 'complete' && (
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <div
                className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4 ${
                  quiz.result?.passed ? 'bg-success/10' : 'bg-destructive/10'
                }`}
              >
                {quiz.result?.passed ? (
                  <CheckCircle2 className="h-8 w-8 text-success" />
                ) : (
                  <XCircle className="h-8 w-8 text-destructive" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {quiz.result?.passed ? 'Assessment Passed!' : 'Assessment Complete'}
              </CardTitle>
              {quiz.result && (
                <CardDescription>
                  Score: {quiz.result.score}% ({quiz.result.passed ? 'Passed' : 'Failed'})
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
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

