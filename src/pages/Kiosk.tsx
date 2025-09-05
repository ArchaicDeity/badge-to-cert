import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const Kiosk = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('t');
  const { toast } = useToast();

  const [badgeId, setBadgeId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Temp cohort loader to mirror real kiosk behaviour
  const loadCohort = async () => {
    try {
      // In the real kiosk this would load cohort details
      await fetch('/api/kiosk/cohort');
    } catch (err) {
      console.error(err);
    } finally {
      // no-op: placeholder for any cleanup if needed
    }
  };

  useEffect(() => {
    loadCohort();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    toast({ title: 'Badge submitted', description: badgeId });
    setIsSubmitting(false);
  };

  if (!token || token !== 'demo123') {
    return <div>Access Denied</div>;
  }

  return (
    <div className="p-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Badge Check-in</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="badgeId">Badge ID</Label>
              <Input
                id="badgeId"
                value={badgeId}
                onChange={(e) => setBadgeId(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              Start
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Kiosk;

