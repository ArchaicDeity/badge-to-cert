import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, User, CheckCircle2, XCircle } from 'lucide-react';
import useEnterpriseBranding from '@/hooks/use-enterprise-branding';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

interface Question {
  id: string;
  body: string;
  choices: string[];
  correctIndex: number;
}

interface Learner {
  id: string;
  name: string;
  badgeId: string;
}

interface Cohort {
  id: string;
  enterpriseId: string;
}

interface Enterprise {
  id: string;
  name: string;
  brandLogoPath?: string;
  brandPrimaryColor?: string;
  brandSecondaryColor?: string;
}

interface Course {
  id: string;
  title: string;
}

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
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [isLoadingCohort, setIsLoadingCohort] = useState(false);
  const [cohortError, setCohortError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [isLoadingLearners, setIsLoadingLearners] = useState(false);
  const [learnersError, setLearnersError] = useState<string | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enterprise, setEnterprise] = useState<Enterprise | null>(null);
  useEnterpriseBranding(enterprise ?? undefined);
  const [courses, setCourses] = useState<Course[]>([]);

  // Reset kiosk timers and block state after failed network calls
  const resetState = () => {
    setBlocks([]);
    setCurrentIndex(0);
    setTimer(0);
    setQuestionIndex(0);
    setQuiz({ questions: [], answers: [], attempts: 0 });
  };

  // Fetch cohort details for branding and course lookup
  useEffect(() => {
    const fetchCohort = async () => {
      setIsLoadingCohort(true);
      setCohortError(null);
      try {
        /*
         * Expected: GET /api/kiosk/cohort/:cohortId -> { cohort: Cohort }
         * Edge cases: 404 if cohort is missing, 500 on server error
         */
        const res = await fetch(`/api/kiosk/cohort/${cohortId}`);
        if (!res.ok) throw new Error('Failed cohort fetch');
        const data: { cohort: Cohort } = await res.json();
        setCohort(data.cohort ?? null);
      } catch (err) {
        console.error(err);
        setCohortError(err instanceof Error ? err.message : String(err));
        resetState();
        toast({
          title: 'Failed to load cohort',
          variant: 'destructive',
          action: (
            <ToastAction altText="Retry" onClick={fetchCohort}>
              Retry
            </ToastAction>
          ),
        });
      } finally {
        setIsLoadingCohort(false);
      }
    };
    fetchCohort();
  }, [cohortId, toast]);

  useEffect(() => {
    if (!token || token !== 'demo123') {
      toast({ title: 'Access Denied', description: 'Invalid kiosk token', variant: 'destructive' });
    }
  }, [token, toast]);

  useEffect(() => {
    const loadLearners = async () => {
      setIsLoadingLearners(true);
      setLearnersError(null);
      try {
        const res = await fetch(`/api/kiosk/learners/${cohortId ?? '0'}`);
        if (!res.ok) throw new Error('Failed learners fetch');
        const data: { learners: Learner[] } = await res.json();
        setLearners(data.learners ?? []);
      } catch (err) {
        console.error(err);
        setLearnersError(err instanceof Error ? err.message : String(err));
        toast({ title: 'Failed to load learners', variant: 'destructive' });
      } finally {
        setIsLoadingLearners(false);
    const loadEnterpriseAndCourses = async () => {
      if (!cohort?.enterpriseId) return;
      try {
        const res = await fetch(`/api/enterprise/${cohort.enterpriseId}`);
        if (res.ok) {
          const data: { enterprise: Enterprise } = await res.json();
          setEnterprise(data.enterprise ?? null);
        }
      } catch (err) {
        console.error(err);
      }
      try {
        const res = await fetch(`/api/enterprise/${cohort.enterpriseId}/courses`);
        if (res.ok) {
          const data: { courses: Course[] } = await res.json();
          setCourses(data.courses ?? []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadEnterpriseAndCourses();
  }, [cohort?.enterpriseId]);

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
          const block = blocks[currentIndex];
          const cfg = parseConfig(block);
          fetchQuestions(block.id, currentIndex).then((qs) => {
            if (!qs) return;
            const built = buildQuestions(qs, cfg);
            setQuiz({ questions: built, answers: new Array(built.length).fill(-1), attempts: quiz.attempts });
            setQuestionIndex(0);
            setTimer((cfg.timeLimitMinutes ?? 0) * 60);
            setQuiz((prev) => ({ ...prev, retakeAvailableAt: undefined }));
          });
        }
      }, 1000);
      return () => clearInterval(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz.retakeAvailableAt, quiz.attempts, blocks, currentIndex]);

  const parseConfig = (block: CourseBlock): BlockConfig => {
    try {
      return block.configJson ? JSON.parse(block.configJson) : {};
    } catch {
      return {};
    }
  };

  const fetchLearner = async (id: string): Promise<Learner | null> => {
    try {
      /*
       * Expected: GET /api/kiosk/learner/:badgeId -> { learner: Learner }
       * Edge cases: 404 for unknown badge, 500 for server errors
       */
      const res = await fetch(`/api/kiosk/learner/${id}`);
      if (!res.ok) throw new Error('Failed learner fetch');
      const data: { learner: Learner } = await res.json();
      setError(null);
      return data.learner;
    } catch (err) {
      console.error(err);
      setError('learner');
      resetState();
      toast({
        title: 'Failed to load learner',
        variant: 'destructive',
        action: (
          <ToastAction altText="Retry" onClick={submitBadge}>
            Retry
          </ToastAction>
        ),
      });
      return null;
    }
        toast({
          title: 'Failed to load learner',
          variant: 'destructive',
          action: (
            <ToastAction altText="Retry" onClick={submitBadge}>
              Retry
            </ToastAction>
          ),
        });
        return null;
      }
  };

  const buildQuestions = (qs: Question[], cfg: BlockConfig): Question[] => {
    const count = cfg.numQuestions ?? qs.length;
    const shuffled = [...qs];
    if (cfg.shuffleQuestions) {
      shuffled.sort(() => Math.random() - 0.5);
    }
    return shuffled.slice(0, count);
  };

  const loadBlocks = async (courseId: string): Promise<boolean> => {
    try {
      /*
       * Expected: GET /api/kiosk/course/:courseId -> { blocks: CourseBlock[] }
       * Edge cases: 404 if course not found or unpublished
       */
      const res = await fetch(`/api/kiosk/course/${courseId}`);
      if (!res.ok) throw new Error('Failed course fetch');
      const data: { blocks: CourseBlock[] } = await res.json();
      setBlocks(data.blocks ?? []);
      setError(null);
      return true;
    } catch (err) {
      console.error(err);
      setError('blocks');
      resetState();
      toast({
        title: 'Failed to load course',
        variant: 'destructive',
        action: (
          <ToastAction altText="Retry" onClick={submitBadge}>
            Retry
          </ToastAction>
        ),
      });
      return false;
    }
  };

  const fetchQuestions = async (blockId: number, index: number): Promise<Question[] | null> => {
    setIsLoadingQuestions(true);
    setQuestionsError(null);
    try {
      /*
       * Expected: GET /api/kiosk/questions/:blockId -> { questions: Question[] }
       * Edge cases: empty question sets, 404 for invalid block
       */
      const res = await fetch(`/api/kiosk/questions/${blockId}`);
      if (!res.ok) throw new Error('Failed question fetch');
      const data: { questions: Question[] } = await res.json();
      if (!data.questions?.length) throw new Error('No questions');
      return data.questions;
    } catch (err) {
      console.error(err);
      setQuestionsError(err instanceof Error ? err.message : 'Failed to load questions');
      resetState();
      toast({
        title: 'Failed to load questions',
        variant: 'destructive',
        action: (
          <ToastAction altText="Retry" onClick={() => startBlock(index)}>
            Retry
          </ToastAction>
        ),
      });
      return null;
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const loadQuestions = async (blockId: number) => {
    setIsLoadingQuestions(true);
    setQuestionsError(null);
    try {
      const res = await fetch(`/api/kiosk/questions/${blockId}`);
      if (!res.ok) throw new Error('Failed question fetch');
      const data: { questions: Question[] } = await res.json();
      setQuestions(data.questions ?? []);
    } catch (err) {
      console.error(err);
      setQuestionsError(err instanceof Error ? err.message : 'Failed to load questions');
      toast({ title: 'Failed to load questions', variant: 'destructive' });
      setQuestions([]);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const startBlock = async (index: number) => {
    if (index >= blocks.length) {
      setStep('complete');
      return;
    }

    setCurrentIndex(index);
    const block = blocks[index];
    if (block.kind === 'ASSESSMENT') {
      const cfg = parseConfig(block);
      const qs = await fetchQuestions(block.id, index);
      if (!qs) return;
      const cfg = parseConfig(block);
      const built = buildQuestions(qs, cfg);
      setQuiz({ questions: built, answers: new Array(built.length).fill(-1), attempts: 0 });
      setQuestionIndex(0);
      setTimer((cfg.timeLimitMinutes ?? 0) * 60);
    } else {
      const cfg = parseConfig(block);
      setTimer((cfg.durationMinutes ?? 0) * 60);
    }

    setStep('block');
  };

  const [fetchingLearner, setFetchingLearner] = useState(false);
  const [learnerError, setLearnerError] = useState<string | null>(null);

  const submitBadge = async () => {
    setLearnerError(null);
    setFetchingLearner(true);
    try {
      const learner = await fetchLearner(badgeId.toUpperCase());
      if (!learner) {
        setLearnerError('Badge not found. Please check your badge ID and try again.');
        toast({
          title: 'Badge Not Found',
          description: 'Please check your badge ID and try again',
          variant: 'destructive',
        });
        return;
      }
      setCurrentLearner(learner);
      const ok = await loadBlocks(cohortId ?? '0');
      if (!ok) return;
      await startBlock(0);
      toast({ title: 'Welcome!', description: `Starting course for ${learner.name}` });
    } finally {
      setFetchingLearner(false);
    }
  };

  const handleBadgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitBadge();
    } finally {
      setIsSubmitting(false);
    }
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
      await startBlock(currentIndex + 1);
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
                        disabled={isSubmitting}
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full text-lg py-6"
                      disabled={isSubmitting}
                    >
                      Start
                    </Button>
                  </form>

                  {fetchingLearner && (
                    <div className="mt-8 text-center text-sm text-muted-foreground">
                      Verifying badge...
                    </div>
                  )}
                  {learnerError && (
                    <div className="mt-8 p-4 bg-destructive/10 text-destructive rounded-lg text-sm text-center">
                      {learnerError}
                    </div>
                  )}
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

        {step === 'block' && currentBlock && currentBlock.kind === 'ASSESSMENT' && quiz.questions.length > 0 && (
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

