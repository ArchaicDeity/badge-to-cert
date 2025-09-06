import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/StatusBadge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock,
  AlertTriangle,
  FileCheck,
  ArrowLeft
} from 'lucide-react';
import { getCohortEnrollments, type PracticalRubric } from '@/lib/mockData';
import { CourseStatus } from '@/constants/enums';
import { useToast } from '@/hooks/use-toast';

const Assessor = () => {
  const { cohortId } = useParams();
  const { toast } = useToast();
  const [selectedLearner, setSelectedLearner] = useState<any>(null);
  const [rubric, setRubric] = useState<PracticalRubric>({
    cpr_aed: {
      ppe: false,
      check_responsiveness: false,
      call_for_help: false,
      breathing_check_10s: false,
      compressions_rate_depth: false,
      pads_position: false,
      stand_clear: false,
      shock_delivered: false,
      resume_compressions: false,
      must_pass: true
    },
    bleeding_control: {
      ppe: false,
      direct_pressure: false,
      packing_or_tourniquet: false,
      tourniquet_time_logged: false,
      must_pass: true
    },
    chemical_eye: {
      locate_eyewash: false,
      hold_lids_open: false,
      flush_15_min_sim: false,
      remove_contacts: false,
      call_ems: false,
      must_pass: true
    },
    handover: {
      sbart_or_mist: false,
      times_recorded: false,
      must_pass: false
    }
  });
  const [assessorNotes, setAssessorNotes] = useState('');

  const enrollments = getCohortEnrollments(cohortId || '1');
  const eligibleLearners = enrollments.filter(e =>
    [CourseStatus.THEORY_PASS, CourseStatus.PRACTICAL_PASS, CourseStatus.NYC].includes(e.status)
  );

  const rubricSections = [
    {
      key: 'cpr_aed' as keyof PracticalRubric,
      title: 'CPR & AED',
      description: 'Cardiopulmonary resuscitation and automated external defibrillator',
      items: [
        { key: 'ppe', label: 'Dons appropriate PPE' },
        { key: 'check_responsiveness', label: 'Checks responsiveness (shake & shout)' },
        { key: 'call_for_help', label: 'Calls for help/EMS immediately' },
        { key: 'breathing_check_10s', label: 'Checks breathing for max 10 seconds' },
        { key: 'compressions_rate_depth', label: 'Compressions: correct rate (100-120) & depth (5-6cm)' },
        { key: 'pads_position', label: 'AED pads placed correctly' },
        { key: 'stand_clear', label: 'Ensures everyone stands clear before shock' },
        { key: 'shock_delivered', label: 'Delivers shock when advised' },
        { key: 'resume_compressions', label: 'Resumes CPR immediately after shock' },
      ]
    },
    {
      key: 'bleeding_control' as keyof PracticalRubric,
      title: 'Bleeding Control',
      description: 'Severe bleeding management',
      items: [
        { key: 'ppe', label: 'Dons appropriate PPE' },
        { key: 'direct_pressure', label: 'Applies direct pressure to wound' },
        { key: 'packing_or_tourniquet', label: 'Uses wound packing or tourniquet as appropriate' },
        { key: 'tourniquet_time_logged', label: 'Documents tourniquet application time' },
      ]
    },
    {
      key: 'chemical_eye' as keyof PracticalRubric,
      title: 'Chemical Eye Exposure',
      description: 'Emergency eye wash procedure',
      items: [
        { key: 'locate_eyewash', label: 'Locates eyewash station quickly' },
        { key: 'hold_lids_open', label: 'Holds eyelids open during flush' },
        { key: 'flush_15_min_sim', label: 'Demonstrates 15-minute flush (simulated)' },
        { key: 'remove_contacts', label: 'Removes contact lenses if present' },
        { key: 'call_ems', label: 'Calls for medical assistance' },
      ]
    },
    {
      key: 'handover' as keyof PracticalRubric,
      title: 'Medical Handover',
      description: 'Communication with medical professionals',
      items: [
        { key: 'sbart_or_mist', label: 'Uses SBAR/MIST format for handover' },
        { key: 'times_recorded', label: 'Records key times (incident, intervention, etc.)' },
      ]
    }
  ];

  const updateRubricItem = (section: keyof PracticalRubric, item: string, checked: boolean) => {
    setRubric(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [item]: checked
      }
    }));
  };

  const calculateSectionScore = (section: keyof PracticalRubric) => {
    const sectionData = rubric[section];
    const items = Object.entries(sectionData).filter(([key]) => key !== 'must_pass');
    const checkedItems = items.filter(([_, value]) => value === true);
    return {
      score: Math.round((checkedItems.length / items.length) * 100),
      total: items.length,
      checked: checkedItems.length,
      mustPass: sectionData.must_pass
    };
  };

  const calculateOverallResult = () => {
    const sections = Object.keys(rubric) as (keyof PracticalRubric)[];
    let overallPassed = true;
    let totalScore = 0;
    
    sections.forEach(section => {
      const sectionScore = calculateSectionScore(section);
      totalScore += sectionScore.score;
      
      if (sectionScore.mustPass && sectionScore.score < 100) {
        overallPassed = false;
      }
    });
    
    return {
      passed: overallPassed,
      averageScore: Math.round(totalScore / sections.length)
    };
  };

  const handleSubmitAssessment = () => {
    const result = calculateOverallResult();
    
    toast({
      title: result.passed ? "Assessment Passed" : "Assessment Failed",
      description: `Overall Score: ${result.averageScore}%${!result.passed ? ' - Must-pass sections not completed' : ''}`,
      variant: result.passed ? "default" : "destructive",
    });

    // In real app, would save to database
    console.log('Practical Assessment Result:', {
      learnerId: selectedLearner.learner.id,
      passed: result.passed,
      rubric,
      assessorNotes,
      timestamp: new Date().toISOString()
    });
  };

  if (!selectedLearner) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm p-4">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Practical Assessment
            </h1>
            <p className="text-muted-foreground">Select a learner to begin practical evaluation</p>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-4">
            {eligibleLearners.map((enrollment) => (
              <Card 
                key={enrollment.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedLearner(enrollment)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-mono text-muted-foreground">
                        {enrollment.learner?.badgeId}
                      </div>
                      <div>
                        <div className="font-semibold text-lg">{enrollment.learner?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {enrollment.learner?.company} • {enrollment.learner?.idNumber}
                        </div>
                        {enrollment.theoryScore && (
                          <div className="text-sm text-success mt-1">
                            Theory Score: {enrollment.theoryScore}%
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={enrollment.status} />
                      <Button variant="outline">
                        {enrollment.status === CourseStatus.THEORY_PASS ? 'Start Assessment' : 'Re-assess'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {eligibleLearners.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Learners Ready</h3>
                  <p className="text-muted-foreground">
                    No learners have passed the theory assessment yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  const overallResult = calculateOverallResult();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileCheck className="h-6 w-6 text-primary" />
              Practical Assessment
            </h1>
            <p className="text-muted-foreground">
              {selectedLearner.learner?.name} • {selectedLearner.learner?.badgeId}
            </p>
          </div>
          <Button variant="outline" onClick={() => setSelectedLearner(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Learner Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{selectedLearner.learner?.name}</h2>
                  <p className="text-muted-foreground">
                    {selectedLearner.learner?.company} • Theory Score: {selectedLearner.theoryScore}%
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {overallResult.averageScore}%
                  </div>
                  <div className="text-sm text-muted-foreground">Overall Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rubric Sections */}
          {rubricSections.map((section) => {
            const sectionScore = calculateSectionScore(section.key);
            
            return (
              <Card key={section.key} className={sectionScore.mustPass && sectionScore.score < 100 ? 'border-destructive/50' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {section.title}
                        {sectionScore.mustPass && (
                          <Badge variant="outline" className="text-xs">
                            Must Pass
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        sectionScore.mustPass && sectionScore.score < 100 ? 'text-destructive' : 'text-primary'
                      }`}>
                        {sectionScore.score}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {sectionScore.checked}/{sectionScore.total}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {section.items.map((item) => (
                      <div key={item.key} className="flex items-center space-x-3">
                        <Checkbox
                          id={`${section.key}-${item.key}`}
                          checked={rubric[section.key][item.key as keyof typeof rubric[typeof section.key]]}
                          onCheckedChange={(checked) => 
                            updateRubricItem(section.key, item.key, checked as boolean)
                          }
                        />
                        <Label 
                          htmlFor={`${section.key}-${item.key}`}
                          className="text-sm font-medium leading-relaxed cursor-pointer"
                        >
                          {item.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Assessor Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Assessor Notes</CardTitle>
              <CardDescription>Additional observations and feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={assessorNotes}
                onChange={(e) => setAssessorNotes(e.target.value)}
                placeholder="Enter any additional observations, areas for improvement, or commendations..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Submit Assessment */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 ${overallResult.passed ? 'text-success' : 'text-destructive'}`}>
                    {overallResult.passed ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                    <span className="font-semibold">
                      {overallResult.passed ? 'COMPETENT' : 'NOT YET COMPETENT'}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Average Score: {overallResult.averageScore}%
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline">
                    Save Draft
                  </Button>
                  <Button 
                    onClick={handleSubmitAssessment}
                    className={overallResult.passed ? 'bg-success hover:bg-success/90' : 'bg-destructive hover:bg-destructive/90'}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Submit Assessment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Assessor;