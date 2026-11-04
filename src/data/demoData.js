// Clearly labelled realistic sample data for SAHAYA prototype demonstration.
// All sample entities are marked with isDemo: true so teachers and reviewers
// can always distinguish sample data from real classroom records.

export const DEFAULT_SETTINGS = {
  id: 'global_settings',
  relearnThreshold: 50,       // Score < 50% -> Relearn Fundamentals
  practiseThreshold: 80,      // Score 50% to < 80% -> Practise; >= 80% -> Advance
  classConceptFlagThreshold: 65, // Concept accuracy < 65% across class -> Flag for review
  minQuestionsForConceptConfidence: 2, // Minimum questions on a concept before confirming pattern
  activeClassId: 'class_7a_demo',
  aiProxyUrl: ''              // Optional server-side proxy URL for live AI mode
};

export const DEMO_CLASSES = [
  {
    id: 'class_7a_demo',
    name: 'Class 7A — Mathematics (Sample)',
    grade: 'Class 7',
    subject: 'Mathematics',
    academicYear: '2026–27',
    isDemo: true,
    createdAt: '2026-09-01T09:00:00.000Z'
  },
  {
    id: 'class_8b_demo',
    name: 'Class 8B — Science (Sample)',
    grade: 'Class 8',
    subject: 'Science',
    academicYear: '2026–27',
    isDemo: true,
    createdAt: '2026-09-02T09:00:00.000Z'
  }
];

export const DEMO_STUDENTS = [
  // Class 7A Students (12 students covering diverse learning trajectories)
  { id: 'stu_7a_01', classId: 'class_7a_demo', rollNo: '7A-01', name: 'Aarav Sharma (Sample)', notes: 'Participates actively in verbal discussions', isDemo: true },
  { id: 'stu_7a_02', classId: 'class_7a_demo', rollNo: '7A-02', name: 'Ananya Verma (Sample)', notes: 'Strong in computation, occasionally rushes word problems', isDemo: true },
  { id: 'stu_7a_03', classId: 'class_7a_demo', rollNo: '7A-03', name: 'Devansh Nair (Sample)', notes: 'Needs visual aids for fraction equivalence', isDemo: true },
  { id: 'stu_7a_04', classId: 'class_7a_demo', rollNo: '7A-04', name: 'Ishita Patel (Sample)', notes: 'Consistent performer across topics', isDemo: true },
  { id: 'stu_7a_05', classId: 'class_7a_demo', rollNo: '7A-05', name: 'Kabir दास (Sample)', notes: 'Missed first week of fractions unit', isDemo: true },
  { id: 'stu_7a_06', classId: 'class_7a_demo', rollNo: '7A-06', name: 'Meera Krishnan (Sample)', notes: 'Enjoys challenge problems', isDemo: true },
  { id: 'stu_7a_07', classId: 'class_7a_demo', rollNo: '7A-07', name: 'Pranav Joshi (Sample)', notes: 'Struggles with unlike denominators', isDemo: true },
  { id: 'stu_7a_08', classId: 'class_7a_demo', rollNo: '7A-08', name: 'Riya Gupta (Sample)', notes: 'Steady improvement in arithmetic', isDemo: true },
  { id: 'stu_7a_09', classId: 'class_7a_demo', rollNo: '7A-09', name: 'Rohan Deshmukh (Sample)', notes: 'Needs step-by-step worked examples', isDemo: true },
  { id: 'stu_7a_10', classId: 'class_7a_demo', rollNo: '7A-10', name: 'Saanvi Reddy (Sample)', notes: 'Strong conceptual grasp', isDemo: true },
  { id: 'stu_7a_11', classId: 'class_7a_demo', rollNo: '7A-11', name: 'Tanvi Kulkarni (Sample)', notes: 'Careful worker, sometimes leaves last question blank', isDemo: true },
  { id: 'stu_7a_12', classId: 'class_7a_demo', rollNo: '7A-12', name: 'Vihaan Choudhury (Sample)', notes: 'Needs support with place value & decimals', isDemo: true },

  // Class 8B Students (6 students)
  { id: 'stu_8b_01', classId: 'class_8b_demo', rollNo: '8B-01', name: 'Aditya Rao (Sample)', notes: 'Curious about lab experiments', isDemo: true },
  { id: 'stu_8b_02', classId: 'class_8b_demo', rollNo: '8B-02', name: 'Bhavya Menon (Sample)', notes: 'Good diagram recall', isDemo: true },
  { id: 'stu_8b_03', classId: 'class_8b_demo', rollNo: '8B-03', name: 'Chirag Hegde (Sample)', notes: 'Confuses pressure and force units', isDemo: true },
  { id: 'stu_8b_04', classId: 'class_8b_demo', rollNo: '8B-04', name: 'Diya Sengupta (Sample)', notes: 'High accuracy on conceptual questions', isDemo: true },
  { id: 'stu_8b_05', classId: 'class_8b_demo', rollNo: '8B-05', name: 'Farhan Sheikh (Sample)', notes: 'Needs review of basic measurement units', isDemo: true },
  { id: 'stu_8b_06', classId: 'class_8b_demo', rollNo: '8B-06', name: 'Gauri ठाकुर (Sample)', notes: 'Participates well in group activities', isDemo: true }
];

export const DEMO_ASSESSMENTS = [
  {
    id: 'asmt_7a_fractions_1',
    classId: 'class_7a_demo',
    title: 'Checkpoint 1: Fractions & Equivalence (Sample)',
    grade: 'Class 7',
    subject: 'Mathematics',
    topic: 'Fractions and Rational Numbers',
    date: '2026-10-05',
    status: 'finalized',
    isDemo: true,
    questions: [
      {
        id: 'q_f1_1',
        text: 'Which of the following fractions is equivalent to 3/4?',
        options: ['6/12', '9/12', '7/8', '12/9'],
        correctOptionIndex: 1,
        conceptTag: 'Equivalent Fractions',
        isFundamental: true
      },
      {
        id: 'q_f1_2',
        text: 'If a rope of length 5/6 m is cut into pieces by removing 1/6 m, what length remains?',
        options: ['4/12 m', '2/3 m', '4/0 m', '6/6 m'],
        correctOptionIndex: 1,
        conceptTag: 'Like Fraction Operations',
        isFundamental: true
      },
      {
        id: 'q_f1_3',
        text: 'What is the result of adding 2/3 and 1/6?',
        options: ['3/9', '5/6', '3/6', '1/2'],
        correctOptionIndex: 1,
        conceptTag: 'Unlike Fraction Addition',
        isFundamental: false
      },
      {
        id: 'q_f1_4',
        text: 'To compare 4/5 and 5/7, what is the least common denominator we should convert both fractions to?',
        options: ['12', '35', '20', '70'],
        correctOptionIndex: 1,
        conceptTag: 'Equivalent Fractions',
        isFundamental: true
      },
      {
        id: 'q_f1_5',
        text: 'A water tank is 1/4 full in the morning and 3/8 more water is added. What fraction of the tank is full now?',
        options: ['4/12', '5/8', '4/8', '3/32'],
        correctOptionIndex: 1,
        conceptTag: 'Unlike Fraction Addition',
        isFundamental: false
      }
    ]
  },
  {
    id: 'asmt_7a_decimals_2',
    classId: 'class_7a_demo',
    title: 'Checkpoint 2: Fractions & Decimal Applications (Sample)',
    grade: 'Class 7',
    subject: 'Mathematics',
    topic: 'Fractions & Decimals Synthesis',
    date: '2026-10-20',
    status: 'finalized',
    isDemo: true,
    questions: [
      {
        id: 'q_f2_1',
        text: 'Which fraction represents the same value as 15/20 in simplest form?',
        options: ['5/10', '3/4', '3/5', '6/8'],
        correctOptionIndex: 1,
        conceptTag: 'Equivalent Fractions',
        isFundamental: true
      },
      {
        id: 'q_f2_2',
        text: 'Solve: 5/8 + 1/4 = ?',
        options: ['6/12', '7/8', '6/8', '5/32'],
        correctOptionIndex: 1,
        conceptTag: 'Unlike Fraction Addition',
        isFundamental: false
      },
      {
        id: 'q_f2_3',
        text: 'Which decimal is equal to the fraction 3/5?',
        options: ['0.35', '0.6', '0.53', '0.06'],
        correctOptionIndex: 1,
        conceptTag: 'Fraction-Decimal Conversion',
        isFundamental: true
      },
      {
        id: 'q_f2_4',
        text: 'Meena walked 1.25 km on Monday and 3/4 km on Tuesday. How many kilometres did she walk in total?',
        options: ['1.55 km', '2.00 km', '1.75 km', '4.25 km'],
        correctOptionIndex: 1,
        conceptTag: 'Fraction-Decimal Conversion',
        isFundamental: false
      },
      {
        id: 'q_f2_5',
        text: 'Subtract: 7/9 - 1/3 = ?',
        options: ['6/6', '4/9', '6/9', '2/3'],
        correctOptionIndex: 1,
        conceptTag: 'Unlike Fraction Addition',
        isFundamental: false
      }
    ]
  },
  {
    id: 'asmt_8b_force_1',
    classId: 'class_8b_demo',
    title: 'Unit Quiz 1: Force and Pressure (Sample)',
    grade: 'Class 8',
    subject: 'Science',
    topic: 'Force and Pressure',
    date: '2026-10-18',
    status: 'finalized',
    isDemo: true,
    questions: [
      {
        id: 'q_s1_1',
        text: 'When two forces act on an object in opposite directions, the net force is:',
        options: [
          'The sum of the two forces',
          'The difference between the two forces',
          'Always zero',
          'The product of the two forces'
        ],
        correctOptionIndex: 1,
        conceptTag: 'Net Force & Direction',
        isFundamental: true
      },
      {
        id: 'q_s1_2',
        text: 'Why do school bags have wide straps instead of thin strings?',
        options: [
          'To increase pressure on the shoulder',
          'To increase surface area and reduce pressure on the shoulder',
          'To reduce the weight of the books inside',
          'To increase friction with the uniform'
        ],
        correctOptionIndex: 1,
        conceptTag: 'Pressure & Surface Area',
        isFundamental: false
      },
      {
        id: 'q_s1_3',
        text: 'A force of 100 N is applied perpendicular to a surface of area 2 m². What is the pressure exerted?',
        options: ['200 Pa', '50 Pa', '102 Pa', '0.02 Pa'],
        correctOptionIndex: 1,
        conceptTag: 'Pressure & Surface Area',
        isFundamental: false
      },
      {
        id: 'q_s1_4',
        text: 'Which of the following is an example of a non-contact force?',
        options: [
          'Pushing a classroom door open',
          'Magnetic force pulling an iron nail',
          'Friction slowing down a rolling ball',
          'Lifting a bucket of water by hand'
        ],
        correctOptionIndex: 1,
        conceptTag: 'Contact vs Non-Contact Forces',
        isFundamental: true
      }
    ]
  }
];

// Responses are keyed by `${assessmentId}__${studentId}`
// Each response record holds: { id, assessmentId, studentId, answers: { [questionId]: 'correct' | 'incorrect' | 'unanswered' }, updatedAt }
export const DEMO_RESPONSES = [
  // --- Assessment 1: Checkpoint 1: Fractions & Equivalence (Class 7A) ---
  // Notice how 'Unlike Fraction Addition' (q_f1_3, q_f1_5) has many incorrect responses across the class,
  // creating a realistic class-wide learning gap.
  {
    id: 'asmt_7a_fractions_1__stu_7a_01',
    assessmentId: 'asmt_7a_fractions_1',
    studentId: 'stu_7a_01',
    answers: { q_f1_1: 'correct', q_f1_2: 'correct', q_f1_3: 'incorrect', q_f1_4: 'correct', q_f1_5: 'incorrect' },
    updatedAt: '2026-10-05T11:00:00.000Z'
  },
  {
    id: 'asmt_7a_fractions_1__stu_7a_02',
    assessmentId: 'asmt_7a_fractions_1',
    studentId: 'stu_7a_02',
    answers: { q_f1_1: 'correct', q_f1_2: 'correct', q_f1_3: 'correct', q_f1_4: 'correct', q_f1_5: 'incorrect' },
    updatedAt: '2026-10-05T11:00:00.000Z'
  },
  {
    id: 'asmt_7a_fractions_1__stu_7a_03',
    assessmentId: 'asmt_7a_fractions_1',
    studentId: 'stu_7a_03',
    answers: { q_f1_1: 'incorrect', q_f1_2: 'correct', q_f1_3: 'incorrect', q_f1_4: 'incorrect', q_f1_5: 'incorrect' },
    updatedAt: '2026-10-05T11:00:00.000Z'
  },
  {
    id: 'asmt_7a_fractions_1__stu_7a_04',
    assessmentId: 'asmt_7a_fractions_1',
    studentId: 'stu_7a_04',
    answers: { q_f1_1: 'correct', q_f1_2: 'correct', q_f1_3: 'correct', q_f1_4: 'correct', q_f1_5: 'correct' },
    updatedAt: '2026-10-05T11:00:00.000Z'
  },
  {
    id: 'asmt_7a_fractions_1__stu_7a_05',
    assessmentId: 'asmt_7a_fractions_1',
    studentId: 'stu_7a_05',
    answers: { q_f1_1: 'incorrect', q_f1_2: 'incorrect', q_f1_3: 'incorrect', q_f1_4: 'correct', q_f1_5: 'unanswered' },
    updatedAt: '2026-10-05T11:00:00.000Z'
  },
  {
    id: 'asmt_7a_fractions_1__stu_7a_06',
    assessmentId: 'asmt_7a_fractions_1',
    studentId: 'stu_7a_06',
    answers: { q_f1_1: 'correct', q_f1_2: 'correct', q_f1_3: 'correct', q_f1_4: 'correct', q_f1_5: 'correct' },
    updatedAt: '2026-10-05T11:00:00.000Z'
  },
  {
    id: 'asmt_7a_fractions_1__stu_7a_07',
    assessmentId: 'asmt_7a_fractions_1',
    studentId: 'stu_7a_07',
    answers: { q_f1_1: 'correct', q_f1_2: 'incorrect', q_f1_3: 'incorrect', q_f1_4: 'incorrect', q_f1_5: 'incorrect' },
    updatedAt: '2026-10-05T11:00:00.000Z'
  },
  {
    id: 'asmt_7a_fractions_1__stu_7a_08',
    assessmentId: 'asmt_7a_fractions_1',
    studentId: 'stu_7a_08',
    answers: { q_f1_1: 'correct', q_f1_2: 'correct', q_f1_3: 'incorrect', q_f1_4: 'correct', q_f1_5: 'incorrect' },
    updatedAt: '2026-10-05T11:00:00.000Z'
  },
  {
    id: 'asmt_7a_fractions_1__stu_7a_09',
    assessmentId: 'asmt_7a_fractions_1',
    studentId: 'stu_7a_09',
    answers: { q_f1_1: 'incorrect', q_f1_2: 'correct', q_f1_3: 'incorrect', q_f1_4: 'incorrect', q_f1_5: 'unanswered' },
    updatedAt: '2026-10-05T11:00:00.000Z'
  },
  {
    id: 'asmt_7a_fractions_1__stu_7a_10',
    assessmentId: 'asmt_7a_fractions_1',
    studentId: 'stu_7a_10',
    answers: { q_f1_1: 'correct', q_f1_2: 'correct', q_f1_3: 'correct', q_f1_4: 'correct', q_f1_5: 'incorrect' },
    updatedAt: '2026-10-05T11:00:00.000Z'
  },
  {
    id: 'asmt_7a_fractions_1__stu_7a_11',
    assessmentId: 'asmt_7a_fractions_1',
    studentId: 'stu_7a_11',
    answers: { q_f1_1: 'correct', q_f1_2: 'correct', q_f1_3: 'correct', q_f1_4: 'incorrect', q_f1_5: 'unanswered' },
    updatedAt: '2026-10-05T11:00:00.000Z'
  },
  {
    id: 'asmt_7a_fractions_1__stu_7a_12',
    assessmentId: 'asmt_7a_fractions_1',
    studentId: 'stu_7a_12',
    answers: { q_f1_1: 'incorrect', q_f1_2: 'incorrect', q_f1_3: 'incorrect', q_f1_4: 'incorrect', q_f1_5: 'incorrect' },
    updatedAt: '2026-10-05T11:00:00.000Z'
  },

  // --- Assessment 2: Checkpoint 2: Fractions & Decimal Applications (Class 7A) ---
  // Shows progress after initial reteaching, while still highlighting students needing support on Unlike Fractions & Decimals.
  {
    id: 'asmt_7a_decimals_2__stu_7a_01',
    assessmentId: 'asmt_7a_decimals_2',
    studentId: 'stu_7a_01',
    answers: { q_f2_1: 'correct', q_f2_2: 'correct', q_f2_3: 'correct', q_f2_4: 'incorrect', q_f2_5: 'correct' },
    updatedAt: '2026-10-20T11:30:00.000Z'
  },
  {
    id: 'asmt_7a_decimals_2__stu_7a_02',
    assessmentId: 'asmt_7a_decimals_2',
    studentId: 'stu_7a_02',
    answers: { q_f2_1: 'correct', q_f2_2: 'correct', q_f2_3: 'correct', q_f2_4: 'correct', q_f2_5: 'correct' },
    updatedAt: '2026-10-20T11:30:00.000Z'
  },
  {
    id: 'asmt_7a_decimals_2__stu_7a_03',
    assessmentId: 'asmt_7a_decimals_2',
    studentId: 'stu_7a_03',
    answers: { q_f2_1: 'correct', q_f2_2: 'incorrect', q_f2_3: 'correct', q_f2_4: 'incorrect', q_f2_5: 'incorrect' },
    updatedAt: '2026-10-20T11:30:00.000Z'
  },
  {
    id: 'asmt_7a_decimals_2__stu_7a_04',
    assessmentId: 'asmt_7a_decimals_2',
    studentId: 'stu_7a_04',
    answers: { q_f2_1: 'correct', q_f2_2: 'correct', q_f2_3: 'correct', q_f2_4: 'correct', q_f2_5: 'correct' },
    updatedAt: '2026-10-20T11:30:00.000Z'
  },
  {
    id: 'asmt_7a_decimals_2__stu_7a_05',
    assessmentId: 'asmt_7a_decimals_2',
    studentId: 'stu_7a_05',
    answers: { q_f2_1: 'correct', q_f2_2: 'incorrect', q_f2_3: 'incorrect', q_f2_4: 'incorrect', q_f2_5: 'incorrect' },
    updatedAt: '2026-10-20T11:30:00.000Z'
  },
  {
    id: 'asmt_7a_decimals_2__stu_7a_06',
    assessmentId: 'asmt_7a_decimals_2',
    studentId: 'stu_7a_06',
    answers: { q_f2_1: 'correct', q_f2_2: 'correct', q_f2_3: 'correct', q_f2_4: 'correct', q_f2_5: 'correct' },
    updatedAt: '2026-10-20T11:30:00.000Z'
  },
  {
    id: 'asmt_7a_decimals_2__stu_7a_07',
    assessmentId: 'asmt_7a_decimals_2',
    studentId: 'stu_7a_07',
    answers: { q_f2_1: 'correct', q_f2_2: 'incorrect', q_f2_3: 'correct', q_f2_4: 'incorrect', q_f2_5: 'correct' },
    updatedAt: '2026-10-20T11:30:00.000Z'
  },
  {
    id: 'asmt_7a_decimals_2__stu_7a_08',
    assessmentId: 'asmt_7a_decimals_2',
    studentId: 'stu_7a_08',
    answers: { q_f2_1: 'correct', q_f2_2: 'correct', q_f2_3: 'correct', q_f2_4: 'incorrect', q_f2_5: 'incorrect' },
    updatedAt: '2026-10-20T11:30:00.000Z'
  },
  {
    id: 'asmt_7a_decimals_2__stu_7a_09',
    assessmentId: 'asmt_7a_decimals_2',
    studentId: 'stu_7a_09',
    answers: { q_f2_1: 'incorrect', q_f2_2: 'incorrect', q_f2_3: 'correct', q_f2_4: 'incorrect', q_f2_5: 'incorrect' },
    updatedAt: '2026-10-20T11:30:00.000Z'
  },
  {
    id: 'asmt_7a_decimals_2__stu_7a_10',
    assessmentId: 'asmt_7a_decimals_2',
    studentId: 'stu_7a_10',
    answers: { q_f2_1: 'correct', q_f2_2: 'correct', q_f2_3: 'correct', q_f2_4: 'correct', q_f2_5: 'correct' },
    updatedAt: '2026-10-20T11:30:00.000Z'
  },
  {
    id: 'asmt_7a_decimals_2__stu_7a_11',
    assessmentId: 'asmt_7a_decimals_2',
    studentId: 'stu_7a_11',
    answers: { q_f2_1: 'correct', q_f2_2: 'correct', q_f2_3: 'correct', q_f2_4: 'unanswered', q_f2_5: 'correct' },
    updatedAt: '2026-10-20T11:30:00.000Z'
  },
  {
    id: 'asmt_7a_decimals_2__stu_7a_12',
    assessmentId: 'asmt_7a_decimals_2',
    studentId: 'stu_7a_12',
    answers: { q_f2_1: 'incorrect', q_f2_2: 'incorrect', q_f2_3: 'incorrect', q_f2_4: 'unanswered', q_f2_5: 'incorrect' },
    updatedAt: '2026-10-20T11:30:00.000Z'
  },

  // --- Class 8B Assessment 1: Unit Quiz 1: Force and Pressure ---
  {
    id: 'asmt_8b_force_1__stu_8b_01',
    assessmentId: 'asmt_8b_force_1',
    studentId: 'stu_8b_01',
    answers: { q_s1_1: 'correct', q_s1_2: 'correct', q_s1_3: 'incorrect', q_s1_4: 'correct' },
    updatedAt: '2026-10-18T14:00:00.000Z'
  },
  {
    id: 'asmt_8b_force_1__stu_8b_02',
    assessmentId: 'asmt_8b_force_1',
    studentId: 'stu_8b_02',
    answers: { q_s1_1: 'correct', q_s1_2: 'correct', q_s1_3: 'correct', q_s1_4: 'correct' },
    updatedAt: '2026-10-18T14:00:00.000Z'
  },
  {
    id: 'asmt_8b_force_1__stu_8b_03',
    assessmentId: 'asmt_8b_force_1',
    studentId: 'stu_8b_03',
    answers: { q_s1_1: 'correct', q_s1_2: 'incorrect', q_s1_3: 'incorrect', q_s1_4: 'correct' },
    updatedAt: '2026-10-18T14:00:00.000Z'
  },
  {
    id: 'asmt_8b_force_1__stu_8b_04',
    assessmentId: 'asmt_8b_force_1',
    studentId: 'stu_8b_04',
    answers: { q_s1_1: 'correct', q_s1_2: 'correct', q_s1_3: 'correct', q_s1_4: 'correct' },
    updatedAt: '2026-10-18T14:00:00.000Z'
  },
  {
    id: 'asmt_8b_force_1__stu_8b_05',
    assessmentId: 'asmt_8b_force_1',
    studentId: 'stu_8b_05',
    answers: { q_s1_1: 'incorrect', q_s1_2: 'incorrect', q_s1_3: 'incorrect', q_s1_4: 'correct' },
    updatedAt: '2026-10-18T14:00:00.000Z'
  },
  {
    id: 'asmt_8b_force_1__stu_8b_06',
    assessmentId: 'asmt_8b_force_1',
    studentId: 'stu_8b_06',
    answers: { q_s1_1: 'correct', q_s1_2: 'incorrect', q_s1_3: 'correct', q_s1_4: 'correct' },
    updatedAt: '2026-10-18T14:00:00.000Z'
  }
];

export const SUGGESTED_CONCEPT_TAGS = {
  Mathematics: [
    'Equivalent Fractions',
    'Like Fraction Operations',
    'Unlike Fraction Addition',
    'Fraction-Decimal Conversion',
    'Place Value & Decimals',
    'Ratio & Proportion',
    'Linear Equations in One Variable',
    'Integer Operations',
    'Area & Perimeter',
    'Data Handling & Averages'
  ],
  Science: [
    'Net Force & Direction',
    'Pressure & Surface Area',
    'Contact vs Non-Contact Forces',
    'Cell Structure & Function',
    'Metals & Non-Metals',
    'Light Reflection & Refraction',
    'Acids, Bases & Salts',
    'Heat Transfer'
  ],
  English: [
    'Reading Comprehension',
    'Subject-Verb Agreement',
    'Tenses & Aspect',
    'Active & Passive Voice',
    'Direct & Indirect Speech'
  ],
  'Social Studies': [
    'Indian Constitution & Civics',
    'Resources & Sustainable Development',
    'Medieval & Modern History',
    'Climate & Natural Vegetation'
  ]
};
