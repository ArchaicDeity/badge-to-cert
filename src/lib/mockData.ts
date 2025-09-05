import { LearnerStatus } from "@/components/StatusBadge";

export interface Enterprise {
  id: string;
  name: string;
  slug: string;
  brandLogoPath?: string;
  brandPrimaryColor?: string;
  brandSecondaryColor?: string;
}

export interface Course {
  id: string;
  title: string;
  enterpriseId?: string;
}

export interface Question {
  id: string;
  body: string;
  choices: string[];
  correctIndex: number;
  tags: string[];
}

export interface Learner {
  id: string;
  name: string;
  idNumber: string;
  company: string;
  badgeId: string;
}

export interface Cohort {
  id: string;
  date: string;
  venue: string;
  instructor: string;
  assessor: string;
  enterpriseId: string;
}

export interface Enrollment {
  id: string;
  learnerId: string;
  cohortId: string;
  status: LearnerStatus;
  theoryScore?: number;
  practicalPassed?: boolean;
}

export interface PracticalRubric {
  cpr_aed: {
    ppe: boolean;
    check_responsiveness: boolean;
    call_for_help: boolean;
    breathing_check_10s: boolean;
    compressions_rate_depth: boolean;
    pads_position: boolean;
    stand_clear: boolean;
    shock_delivered: boolean;
    resume_compressions: boolean;
    must_pass: boolean;
  };
  bleeding_control: {
    ppe: boolean;
    direct_pressure: boolean;
    packing_or_tourniquet: boolean;
    tourniquet_time_logged: boolean;
    must_pass: boolean;
  };
  chemical_eye: {
    locate_eyewash: boolean;
    hold_lids_open: boolean;
    flush_15_min_sim: boolean;
    remove_contacts: boolean;
    call_ems: boolean;
    must_pass: boolean;
  };
  handover: {
    sbart_or_mist: boolean;
    times_recorded: boolean;
    must_pass: boolean;
  };
}

export const mockQuestions: Question[] = [
  {
    id: '1',
    body: 'What is the correct compression depth for adult CPR?',
    choices: ['At least 2 inches (5 cm)', 'At least 1 inch (2.5 cm)', 'At least 3 inches (7.5 cm)', 'At least 1.5 inches (4 cm)'],
    correctIndex: 0,
    tags: ['cpr', 'basic_life_support']
  },
  {
    id: '2',
    body: 'What is the correct compression rate for CPR?',
    choices: ['60-80 per minute', '80-100 per minute', '100-120 per minute', '120-140 per minute'],
    correctIndex: 2,
    tags: ['cpr', 'basic_life_support']
  },
  {
    id: '3',
    body: 'When should you use an AED?',
    choices: ['On any unconscious person', 'Only when trained personnel arrive', 'On unresponsive victims with no normal breathing', 'After 10 minutes of CPR'],
    correctIndex: 2,
    tags: ['aed', 'basic_life_support']
  },
  {
    id: '4',
    body: 'How long should you flush eyes exposed to chemicals?',
    choices: ['5 minutes', '10 minutes', '15 minutes', '20 minutes'],
    correctIndex: 2,
    tags: ['chemical_exposure', 'eye_injury']
  },
  {
    id: '5',
    body: 'What does the acronym SBAR stand for in medical handover?',
    choices: ['Situation, Background, Assessment, Recommendation', 'Safety, Background, Action, Result', 'Situation, Baseline, Action, Response', 'Safety, Baseline, Assessment, Recommendation'],
    correctIndex: 0,
    tags: ['communication', 'handover']
  },
  {
    id: '6',
    body: 'What is the first step in controlling severe bleeding?',
    choices: ['Apply a tourniquet', 'Direct pressure on the wound', 'Elevate the limb', 'Apply pressure to pressure points'],
    correctIndex: 1,
    tags: ['bleeding_control', 'wound_care']
  },
  {
    id: '7',
    body: 'How often should you switch rescuers during CPR?',
    choices: ['Every minute', 'Every 2 minutes', 'Every 5 minutes', 'When tired'],
    correctIndex: 1,
    tags: ['cpr', 'basic_life_support']
  },
  {
    id: '8',
    body: 'What is the universal sign of choking?',
    choices: ['Pointing to throat', 'Hands clutching throat', 'Waving hands', 'Pointing to chest'],
    correctIndex: 1,
    tags: ['choking', 'airway_obstruction']
  },
  {
    id: '9',
    body: 'When applying a tourniquet, how tight should it be?',
    choices: ['Snug but comfortable', 'Tight enough to stop arterial bleeding', 'As tight as possible', 'Just tight enough to slow bleeding'],
    correctIndex: 1,
    tags: ['bleeding_control', 'tourniquet']
  },
  {
    id: '10',
    body: 'What information should be included on a tourniquet time tag?',
    choices: ['Patient name only', 'Time applied only', 'Time applied and location', 'Time applied, location, and applied by'],
    correctIndex: 3,
    tags: ['bleeding_control', 'documentation']
  }
];

export const mockLearners: Learner[] = [
  { id: '1', name: 'Sarah Johnson', idNumber: '8801010123081', company: 'Sasol Synfuels', badgeId: 'SF001234' },
  { id: '2', name: 'Michael Chen', idNumber: '9005055678087', company: 'Sasol Mining', badgeId: 'SM002345' },
  { id: '3', name: 'Priya Patel', idNumber: '8512258899076', company: 'Sasol Chemicals', badgeId: 'SC003456' },
  { id: '4', name: 'David Williams', idNumber: '7809124567089', company: 'Sasol Energy', badgeId: 'SE004567' },
  { id: '5', name: 'Lisa van der Merwe', idNumber: '9203308765432', company: 'Sasol Synfuels', badgeId: 'SF005678' },
];

export const mockEnterprises: Enterprise[] = [
  {
    id: '1',
    name: 'Sasol',
    slug: 'sasol',
    brandLogoPath: '/vite.svg',
    brandPrimaryColor: '194 87% 32%',
    brandSecondaryColor: '210 17% 95%'
  },
  {
    id: '2',
    name: 'Acme Corp',
    slug: 'acme',
    brandPrimaryColor: '340 82% 52%',
    brandSecondaryColor: '210 17% 95%'
  }
];

export const mockCourses: Course[] = [
  { id: 'g1', title: 'Global Safety Induction' },
  { id: 's1', title: 'Sasol First Aid', enterpriseId: '1' },
  { id: 'a1', title: 'Acme Fire Safety', enterpriseId: '2' }
];

export const mockCohorts: Cohort[] = [
  {
    id: '1',
    date: new Date().toISOString().split('T')[0],
    venue: 'Secunda Training Centre',
    instructor: 'Dr. Jane Smith',
    assessor: 'John Assessor',
    enterpriseId: '1'
  },
  {
    id: '2',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    venue: 'Sasolburg Safety Hub',
    instructor: 'Prof. Mike Johnson',
    assessor: 'John Assessor',
    enterpriseId: '2'
  }
];

export const mockEnrollments: Enrollment[] = [
  { id: '1', learnerId: '1', cohortId: '1', status: 'PRACTICAL_PASS', theoryScore: 85, practicalPassed: true },
  { id: '2', learnerId: '2', cohortId: '1', status: 'THEORY_PASS', theoryScore: 80 },
  { id: '3', learnerId: '3', cohortId: '1', status: 'NOT_STARTED' },
  { id: '4', learnerId: '4', cohortId: '1', status: 'NYC', theoryScore: 75, practicalPassed: false },
  { id: '5', learnerId: '5', cohortId: '1', status: 'THEORY_PASS', theoryScore: 90 },
];

export const getEnrollmentWithLearner = (enrollment: Enrollment) => {
  const learner = mockLearners.find(l => l.id === enrollment.learnerId);
  return { ...enrollment, learner };
};

export const getCohortEnrollments = (cohortId: string) => {
  return mockEnrollments
    .filter(e => e.cohortId === cohortId)
    .map(getEnrollmentWithLearner);
};

export const getEnterpriseById = (id?: string) =>
  mockEnterprises.find(e => e.id === id);

export const updateEnterprise = (id: string, data: Partial<Enterprise>) => {
  const index = mockEnterprises.findIndex(e => e.id === id);
  if (index !== -1) {
    mockEnterprises[index] = { ...mockEnterprises[index], ...data };
  }
};

export const getCoursesForEnterprise = (enterpriseId?: string) => {
  const enterpriseCourses = mockCourses.filter(c => c.enterpriseId === enterpriseId);
  return enterpriseCourses.length > 0
    ? enterpriseCourses
    : mockCourses.filter(c => !c.enterpriseId);
};

export const getCohortById = (id: string) =>
  mockCohorts.find(c => c.id === id);
