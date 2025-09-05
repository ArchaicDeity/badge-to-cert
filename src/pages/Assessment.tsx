import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';

const Assessment = () => {
  const { toast } = useToast();
  const [numQuestions, setNumQuestions] = useState(0);
  const [passMarkPercent, setPassMarkPercent] = useState(0);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [maxAttempts, setMaxAttempts] = useState(0);
  const [cooldownMinutes, setCooldownMinutes] = useState(0);

  const settings = {
    num_questions: numQuestions,
    pass_mark_percent: passMarkPercent,
    time_limit_minutes: timeLimitMinutes,
    shuffle,
    max_attempts: maxAttempts,
    cooldown_minutes: cooldownMinutes
  };

  const handleValidate = async () => {
    try {
      const res = await fetch('/api/assessments/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      toast({ title: 'Validation', description: data.message || 'Assessment validated.' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Validation failed';
      toast({ title: 'Validation failed', description: message, variant: 'destructive' });
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/assessments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error('Failed to save');
      toast({ title: 'Saved', description: 'Assessment settings updated.' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Save failed';
      toast({ title: 'Save failed', description: message, variant: 'destructive' });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="numQuestions">Number of Questions</Label>
          <Input
            id="numQuestions"
            type="number"
            value={numQuestions}
            onChange={e => setNumQuestions(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="passMarkPercent">Pass Mark (%)</Label>
          <Input
            id="passMarkPercent"
            type="number"
            value={passMarkPercent}
            onChange={e => setPassMarkPercent(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timeLimitMinutes">Time Limit (minutes)</Label>
          <Input
            id="timeLimitMinutes"
            type="number"
            value={timeLimitMinutes}
            onChange={e => setTimeLimitMinutes(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxAttempts">Max Attempts</Label>
          <Input
            id="maxAttempts"
            type="number"
            value={maxAttempts}
            onChange={e => setMaxAttempts(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cooldownMinutes">Cooldown (minutes)</Label>
          <Input
            id="cooldownMinutes"
            type="number"
            value={cooldownMinutes}
            onChange={e => setCooldownMinutes(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2 flex flex-col justify-end">
          <div className="flex items-center justify-between">
            <Label htmlFor="shuffle">Shuffle Questions</Label>
            <Switch id="shuffle" checked={shuffle} onCheckedChange={setShuffle} />
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Question Bank</Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Question Bank</SheetTitle>
            </SheetHeader>
            <div className="p-4">Questions appear here.</div>
          </SheetContent>
        </Sheet>
        <Button onClick={handleValidate} variant="secondary">
          Validate Assessment
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
};

export default Assessment;

