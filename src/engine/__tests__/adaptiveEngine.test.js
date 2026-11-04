import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LEARNING_PATHS,
  evaluateStudentAssessment,
  evaluateClassInsights,
  buildPreMarkedCorrectAnswers
} from '../adaptiveEngine.js';

const sampleAssessment = {
  id: 'asmt_test_1',
  classId: 'class_test',
  title: 'Fractions Diagnostic',
  grade: 'Class 7',
  subject: 'Mathematics',
  questions: [
    {
      id: 'q1',
      text: 'Equivalent fraction of 1/2',
      options: ['2/4', '1/4', '3/4', '2/3'],
      correctOptionIndex: 0,
      conceptTag: 'Equivalent Fractions',
      isFundamental: true
    },
    {
      id: 'q2',
      text: 'Simplify 4/8',
      options: ['1/4', '1/2', '2/8', '3/4'],
      correctOptionIndex: 1,
      conceptTag: 'Equivalent Fractions',
      isFundamental: true
    },
    {
      id: 'q3',
      text: 'Add 1/3 + 1/6',
      options: ['2/9', '1/2', '2/6', '1/9'],
      correctOptionIndex: 1,
      conceptTag: 'Unlike Fraction Addition',
      isFundamental: false
    },
    {
      id: 'q4',
      text: 'Add 2/5 + 3/10',
      options: ['5/15', '7/10', '5/10', '6/10'],
      correctOptionIndex: 1,
      conceptTag: 'Unlike Fraction Addition',
      isFundamental: false
    },
    {
      id: 'q5',
      text: 'Convert 3/5 to decimal',
      options: ['0.35', '0.6', '0.53', '0.06'],
      correctOptionIndex: 1,
      conceptTag: 'Fraction-Decimal Conversion',
      isFundamental: false
    }
  ]
};

const defaultSettings = {
  relearnThreshold: 50,
  practiseThreshold: 80,
  classConceptFlagThreshold: 65,
  minQuestionsForConceptConfidence: 2
};

test('1. Score calculation: computes correct, incorrect, unanswered, and scorePercent accurately', () => {
  const response = {
    studentId: 's1',
    answers: {
      q1: 'correct',
      q2: 'correct',
      q3: 'incorrect',
      q4: 'correct',
      q5: 'unanswered'
    }
  };

  const result = evaluateStudentAssessment(sampleAssessment, response, defaultSettings);
  assert.equal(result.totalQuestions, 5);
  assert.equal(result.correctCount, 3);
  assert.equal(result.incorrectCount, 1);
  assert.equal(result.unansweredCount, 1);
  assert.equal(result.attemptedCount, 4);
  assert.equal(result.scorePercent, 60);
  assert.equal(result.isComplete, false);
});

test('2. Concept accuracy: calculates per-concept accuracy and evidence sufficiency', () => {
  const response = {
    studentId: 's1',
    answers: {
      q1: 'correct',
      q2: 'correct',
      q3: 'correct',
      q4: 'incorrect',
      q5: 'incorrect'
    }
  };

  const result = evaluateStudentAssessment(sampleAssessment, response, defaultSettings);
  const eqFractions = result.conceptBreakdown.find(
    (c) => c.conceptTag === 'Equivalent Fractions'
  );
  const unlikeAdd = result.conceptBreakdown.find(
    (c) => c.conceptTag === 'Unlike Fraction Addition'
  );
  const decConv = result.conceptBreakdown.find(
    (c) => c.conceptTag === 'Fraction-Decimal Conversion'
  );

  assert.equal(eqFractions.accuracy, 100);
  assert.equal(eqFractions.hasEnoughEvidence, true);
  assert.equal(eqFractions.isFundamental, true);

  assert.equal(unlikeAdd.accuracy, 50);
  assert.equal(unlikeAdd.hasEnoughEvidence, true);

  assert.equal(decConv.accuracy, 0);
  assert.equal(decConv.hasEnoughEvidence, false); // Only 1 item, minQuestionsForConceptConfidence is 2
});

test('3. Relearn recommendations: assigns Relearn Fundamentals when overall score is below threshold', () => {
  const response = {
    studentId: 's1',
    answers: {
      q1: 'correct',
      q2: 'incorrect',
      q3: 'incorrect',
      q4: 'incorrect',
      q5: 'correct'
    }
  };

  const result = evaluateStudentAssessment(sampleAssessment, response, defaultSettings);
  assert.equal(result.scorePercent, 40);
  assert.equal(result.path, LEARNING_PATHS.RELEARN.id);
  assert.match(result.reasoning, /40%/);
});

test('4. Practise recommendations: assigns Practise when score is between Relearn and Advance thresholds without fundamental gap', () => {
  const response = {
    studentId: 's1',
    answers: {
      q1: 'correct',
      q2: 'correct',
      q3: 'correct',
      q4: 'incorrect',
      q5: 'incorrect'
    }
  };

  const result = evaluateStudentAssessment(sampleAssessment, response, defaultSettings);
  assert.equal(result.scorePercent, 60);
  assert.equal(result.path, LEARNING_PATHS.PRACTISE.id);
  assert.match(result.reasoning, /Practise/);
});

test('5. Advance recommendations: assigns Advance when score >= 80% and no multi-item concept gap exists', () => {
  const response = {
    studentId: 's1',
    answers: {
      q1: 'correct',
      q2: 'correct',
      q3: 'correct',
      q4: 'correct',
      q5: 'incorrect' // 1-item concept, does not have enough evidence to block Advance
    }
  };

  const result = evaluateStudentAssessment(sampleAssessment, response, defaultSettings);
  assert.equal(result.scorePercent, 80);
  assert.equal(result.path, LEARNING_PATHS.ADVANCE.id);
});

test('6. Insufficient evidence: assigns Needs Confirmation when unanswered questions exceed threshold', () => {
  const responseBlank = {
    studentId: 's1',
    answers: {}
  };
  const res1 = evaluateStudentAssessment(sampleAssessment, responseBlank, defaultSettings);
  assert.equal(res1.path, LEARNING_PATHS.NEEDS_CONFIRMATION.id);

  const responseTooFew = {
    studentId: 's1',
    answers: {
      q1: 'correct',
      q2: 'correct',
      q3: 'unanswered',
      q4: 'unanswered',
      q5: 'unanswered'
    }
  };
  // 2 answered out of 5 (< ceil(5 * 0.5) = 3)
  const res2 = evaluateStudentAssessment(sampleAssessment, responseTooFew, defaultSettings);
  assert.equal(res2.path, LEARNING_PATHS.NEEDS_CONFIRMATION.id);
});

test('7. Fundamental concept overrides: assigns Relearn Fundamentals when student fails multi-item fundamental concept despite >=50% overall score', () => {
  const response = {
    studentId: 's1',
    answers: {
      q1: 'incorrect', // Fundamental concept item 1 missed
      q2: 'incorrect', // Fundamental concept item 2 missed (0% on Equivalent Fractions)
      q3: 'correct',
      q4: 'correct',
      q5: 'correct'
    }
  };

  // Overall score is 3/5 = 60% (normally Practise), but Equivalent Fractions is Fundamental with 2 items and 0% accuracy
  const result = evaluateStudentAssessment(sampleAssessment, response, defaultSettings);
  assert.equal(result.scorePercent, 60);
  assert.equal(result.fundamentalAccuracy, 0);
  assert.equal(result.path, LEARNING_PATHS.RELEARN.id);
  assert.match(result.reasoning, /Prerequisite gap in Equivalent Fractions/);
});

test('8. Non-fundamental concept override prevents premature Advance placement and pre-marked helper works', () => {
  // 6-question assessment where student gets 5/6 (83%) or 4/5 (80%)
  const sixQAssessment = {
    ...sampleAssessment,
    questions: [
      ...sampleAssessment.questions,
      {
        id: 'q6',
        text: 'Convert 1/4 to decimal',
        options: ['0.25', '0.14', '0.4', '0.5'],
        correctOptionIndex: 0,
        conceptTag: 'Fraction-Decimal Conversion',
        isFundamental: false
      }
    ]
  };

  // Student gets q1, q2, q3, q4 correct (4 items) and misses q5, q6 (both on Fraction-Decimal Conversion)
  // Wait: let's add 2 more questions so 6/8 = 75% or 8/10 = 80%
  const tenQAssessment = {
    ...sampleAssessment,
    questions: [
      ...sixQAssessment.questions,
      { id: 'q7', text: 'Q7', options: ['A', 'B'], correctOptionIndex: 0, conceptTag: 'Equivalent Fractions', isFundamental: true },
      { id: 'q8', text: 'Q8', options: ['A', 'B'], correctOptionIndex: 0, conceptTag: 'Equivalent Fractions', isFundamental: true },
      { id: 'q9', text: 'Q9', options: ['A', 'B'], correctOptionIndex: 0, conceptTag: 'Unlike Fraction Addition', isFundamental: false },
      { id: 'q10', text: 'Q10', options: ['A', 'B'], correctOptionIndex: 0, conceptTag: 'Unlike Fraction Addition', isFundamental: false }
    ]
  };

  const preMarked = buildPreMarkedCorrectAnswers(tenQAssessment);
  assert.equal(Object.keys(preMarked).length, 10);
  assert.equal(preMarked.q1, 'correct');

  const response = {
    id: 'asmt_test_1__s1',
    assessmentId: 'asmt_test_1',
    studentId: 's1',
    answers: {
      ...preMarked,
      q5: 'incorrect',
      q6: 'incorrect'
    }
  };

  // Score is 8/10 = 80% (>= Advance threshold), but 0/2 (0%) on Fraction-Decimal Conversion (hasEnoughEvidence = true)
  const result = evaluateStudentAssessment(tenQAssessment, response, defaultSettings);
  assert.equal(result.scorePercent, 80);
  assert.equal(result.path, LEARNING_PATHS.PRACTISE.id);
  assert.match(result.reasoning, /Fraction-Decimal Conversion/);

  // Verify class insights studentBreakdown
  const students = [
    { id: 's1', rollNo: '01', name: 'Student One' },
    { id: 's2', rollNo: '02', name: 'Student Two' }
  ];
  const insights = evaluateClassInsights(
    students,
    [tenQAssessment],
    [
      response,
      { id: 'asmt_test_1__s2', assessmentId: 'asmt_test_1', studentId: 's2', answers: preMarked }
    ],
    defaultSettings
  );

  const decInsight = insights.conceptInsights.find(
    (c) => c.conceptTag === 'Fraction-Decimal Conversion'
  );
  assert.equal(decInsight.studentsStrugglingCount, 1);
  assert.equal(decInsight.studentBreakdown.length, 2);
  assert.equal(decInsight.studentBreakdown[0].student.id, 's1');
  assert.equal(decInsight.studentBreakdown[0].accuracy, 0);
});

test('9. End-to-End 10-step classroom workflow verification across multiple assessments', () => {
  // Step 1 & 2: Class & Students
  const classStudents = [
    { id: 'stu_1', classId: 'cls_7a', rollNo: '7A-01', name: 'Aarav' },
    { id: 'stu_2', classId: 'cls_7a', rollNo: '7A-02', name: 'Diya' },
    { id: 'stu_3', classId: 'cls_7a', rollNo: '7A-03', name: 'Kabir' },
    { id: 'stu_4', classId: 'cls_7a', rollNo: '7A-04', name: 'Meera' }
  ];

  // Step 3: Assessment 1 Creation
  const asmt1 = { ...sampleAssessment, id: 'asmt_1', date: '2026-10-01' };

  // Step 4: Pre-marked Correct Responses, then teacher marks only Incorrect / Unanswered
  const preMarked1 = buildPreMarkedCorrectAnswers(asmt1);
  const responses1 = [
    // Aarav: all pre-marked Correct (100% -> Advance)
    { id: 'asmt_1__stu_1', assessmentId: 'asmt_1', studentId: 'stu_1', answers: { ...preMarked1 } },
    // Diya: misses q3 (Unlike Fraction Addition), 4/5 = 80%, 1/2 on Unlike Fraction Addition (50% >= relearnThreshold) -> Advance
    // Wait: let's make Diya miss q3 and q5 -> 3/5 = 60% -> Practise
    {
      id: 'asmt_1__stu_2',
      assessmentId: 'asmt_1',
      studentId: 'stu_2',
      answers: { ...preMarked1, q3: 'incorrect', q5: 'incorrect' }
    },
    // Kabir: misses q1, q2, q3, q4 -> 1/5 = 20% -> Relearn Fundamentals
    {
      id: 'asmt_1__stu_3',
      assessmentId: 'asmt_1',
      studentId: 'stu_3',
      answers: { ...preMarked1, q1: 'incorrect', q2: 'incorrect', q3: 'incorrect', q4: 'incorrect' }
    },
    // Meera: leaves 4 blank -> 1/5 answered -> Needs Confirmation
    {
      id: 'asmt_1__stu_4',
      assessmentId: 'asmt_1',
      studentId: 'stu_4',
      answers: { q1: 'correct', q2: 'unanswered', q3: 'unanswered', q4: 'unanswered', q5: 'unanswered' }
    }
  ];

  const insights1 = evaluateClassInsights(classStudents, [asmt1], responses1, defaultSettings);
  assert.equal(insights1.totalStudents, 4);
  assert.equal(insights1.assessmentsCount, 1);
  assert.equal(insights1.pathDistribution[LEARNING_PATHS.ADVANCE.id].length, 1);
  assert.equal(insights1.pathDistribution[LEARNING_PATHS.PRACTISE.id].length, 1);
  assert.equal(insights1.pathDistribution[LEARNING_PATHS.RELEARN.id].length, 1);
  assert.equal(insights1.pathDistribution[LEARNING_PATHS.NEEDS_CONFIRMATION.id].length, 1);

  // Add Assessment 2 to verify multi-assessment progress trajectory for Kabir (20% -> 80% = +60% Improving)
  const asmt2 = { ...sampleAssessment, id: 'asmt_2', title: 'Fractions Follow-Up', date: '2026-10-15' };
  const preMarked2 = buildPreMarkedCorrectAnswers(asmt2);
  const responses2 = [
    ...responses1,
    {
      id: 'asmt_2__stu_3',
      assessmentId: 'asmt_2',
      studentId: 'stu_3',
      answers: { ...preMarked2, q5: 'incorrect' } // 80%
    }
  ];

  const insights2 = evaluateClassInsights(classStudents, [asmt1, asmt2], responses2, defaultSettings);
  const kabirEval = insights2.studentEvaluations.find((se) => se.student.id === 'stu_3');
  assert.equal(kabirEval.completedEvals.length, 2);
  assert.equal(kabirEval.trendDelta, 60);
  assert.match(kabirEval.trendLabel, /Improving/);
});

