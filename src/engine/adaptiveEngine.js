/**
 * SAHAYA — Deterministic Rule-Based Adaptive Recommendation Engine
 *
 * Evaluates:
 * 1. Overall assessment performance
 * 2. Concept-level accuracy
 * 3. Fundamental/prerequisite concept performance
 * 4. Number of questions answered
 * 5. Unanswered questions
 * 6. Evidence sufficiency
 */

export const LEARNING_PATHS = {
  RELEARN: {
    id: 'Relearn Fundamentals',
    label: 'Relearn Fundamentals',
    shortLabel: 'Relearn',
    color: 'amber',
    description: 'Revisit foundational concepts with worked examples.'
  },
  PRACTISE: {
    id: 'Practise',
    label: 'Practise',
    shortLabel: 'Practise',
    color: 'blue',
    description: 'Targeted practice on developing concepts.'
  },
  ADVANCE: {
    id: 'Advance',
    label: 'Advance',
    shortLabel: 'Advance',
    color: 'teal',
    description: 'Ready for multi-step application problems.'
  },
  NEEDS_CONFIRMATION: {
    id: 'Needs Confirmation',
    label: 'Needs Confirmation',
    shortLabel: 'Unconfirmed',
    color: 'slate',
    description: 'Insufficient responses recorded to assign a path.'
  }
};

/**
 * Evaluate a single student's response record on a single assessment.
 */
export function evaluateStudentAssessment(assessment, responseRecord, settings = {}) {
  const relearnThreshold = Number(settings.relearnThreshold ?? 50);
  const practiseThreshold = Number(settings.practiseThreshold ?? 80);
  const minQuestionsForConfidence = Number(settings.minQuestionsForConceptConfidence ?? 2);

  const questions = assessment?.questions || [];
  const totalQuestions = questions.length;
  const answers = responseRecord?.answers || {};

  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  const conceptMap = {};
  let fundamentalTotal = 0;
  let fundamentalCorrect = 0;

  questions.forEach((q) => {
    const rawState = answers[q.id];
    const state =
      rawState === 'correct' || rawState === 'incorrect' ? rawState : 'unanswered';
    const tag = (q.conceptTag || 'General').trim();

    if (!conceptMap[tag]) {
      conceptMap[tag] = {
        conceptTag: tag,
        total: 0,
        correct: 0,
        incorrect: 0,
        unanswered: 0,
        isFundamental: Boolean(q.isFundamental)
      };
    }
    if (q.isFundamental) {
      conceptMap[tag].isFundamental = true;
      fundamentalTotal += 1;
    }

    conceptMap[tag].total += 1;
    if (state === 'correct') {
      correctCount += 1;
      conceptMap[tag].correct += 1;
      if (q.isFundamental) fundamentalCorrect += 1;
    } else if (state === 'incorrect') {
      incorrectCount += 1;
      conceptMap[tag].incorrect += 1;
    } else {
      unansweredCount += 1;
      conceptMap[tag].unanswered += 1;
    }
  });

  const attemptedCount = correctCount + incorrectCount;
  const scorePercent =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const conceptBreakdown = Object.values(conceptMap).map((c) => {
    const accuracy = c.total > 0 ? Math.round((c.correct / c.total) * 100) : 0;
    const attempted = c.correct + c.incorrect;
    const hasEnoughEvidence =
      c.total >= minQuestionsForConfidence &&
      attempted >= Math.min(c.total, minQuestionsForConfidence);

    let status = 'Needs Confirmation';
    if (attempted === 0) {
      status = 'Unanswered';
    } else if (accuracy >= practiseThreshold) {
      status = hasEnoughEvidence ? 'Strong' : 'Strong (Low Evidence)';
    } else if (accuracy >= relearnThreshold) {
      status = 'Developing';
    } else {
      status = hasEnoughEvidence ? 'Gap Detected' : 'Verify (Single Item)';
    }

    return {
      ...c,
      accuracy,
      attempted,
      hasEnoughEvidence,
      status
    };
  });

  const weakConcepts = conceptBreakdown.filter(
    (c) => c.attempted > 0 && c.accuracy < relearnThreshold
  );
  const partialConcepts = conceptBreakdown.filter(
    (c) =>
      c.attempted > 0 &&
      c.accuracy >= relearnThreshold &&
      c.accuracy < practiseThreshold
  );
  const strongConcepts = conceptBreakdown.filter(
    (c) => c.attempted > 0 && c.accuracy >= practiseThreshold
  );

  // Prerequisite / fundamental concepts with sufficient evidence where student scored below relearnThreshold
  const weakFundamentalConcepts = weakConcepts.filter(
    (c) => c.isFundamental && c.hasEnoughEvidence
  );

  let path = LEARNING_PATHS.NEEDS_CONFIRMATION.id;
  let reasoning = '';
  let confidenceNote = '';

  const minAttemptedRequired = Math.max(1, Math.ceil(totalQuestions * 0.5));

  if (totalQuestions === 0 || attemptedCount === 0) {
    path = LEARNING_PATHS.NEEDS_CONFIRMATION.id;
    reasoning = 'No responses recorded.';
    confidenceNote = 'Awaiting response entry.';
  } else if (attemptedCount < minAttemptedRequired) {
    path = LEARNING_PATHS.NEEDS_CONFIRMATION.id;
    reasoning = `Insufficient responses (${attemptedCount}/${totalQuestions} answered, ${unansweredCount} unanswered).`;
    confidenceNote = `At least ${minAttemptedRequired} answered items required.`;
  } else if (scorePercent < relearnThreshold) {
    path = LEARNING_PATHS.RELEARN.id;
    const focusList = weakConcepts.map((c) => c.conceptTag).join(', ');
    reasoning = `Overall ${scorePercent}% (<${relearnThreshold}% threshold)${
      focusList ? ` • Gaps: ${focusList}` : ''
    }.`;
    confidenceNote =
      totalQuestions < minQuestionsForConfidence
        ? 'Low question count; verify orally.'
        : 'Sufficient evidence.';
  } else if (weakFundamentalConcepts.length > 0) {
    // Fundamental prerequisite gap override (triggers Relearn even if overall score >= relearnThreshold)
    path = LEARNING_PATHS.RELEARN.id;
    const fundNames = weakFundamentalConcepts.map((c) => c.conceptTag).join(', ');
    reasoning = `Prerequisite gap in ${fundNames} (${weakFundamentalConcepts[0].accuracy}%) despite ${scorePercent}% overall.`;
    confidenceNote = 'Fundamental concept override triggered.';
  } else if (scorePercent < practiseThreshold) {
    path = LEARNING_PATHS.PRACTISE.id;
    const targetTags = [...weakConcepts, ...partialConcepts].map((c) => c.conceptTag);
    reasoning = `Overall ${scorePercent}% (${relearnThreshold}–${practiseThreshold - 1}%)${
      targetTags.length > 0 ? ` • Practise: ${targetTags.join(', ')}` : ''
    }.`;
    confidenceNote =
      unansweredCount > 0
        ? `${unansweredCount} unanswered item(s).`
        : 'Sufficient evidence.';
  } else {
    // scorePercent >= practiseThreshold
    const supportedWeakConcept = weakConcepts.find((c) => c.hasEnoughEvidence);
    if (supportedWeakConcept) {
      path = LEARNING_PATHS.PRACTISE.id;
      reasoning = `Overall ${scorePercent}%, but concept gap in ${supportedWeakConcept.conceptTag} (${supportedWeakConcept.accuracy}%).`;
      confidenceNote = 'Concept-level gap prevented Advance placement.';
    } else {
      path = LEARNING_PATHS.ADVANCE.id;
      reasoning = `Overall ${scorePercent}% (≥${practiseThreshold}%) with strong concept mastery.`;
      confidenceNote = 'Strong consistency across concepts.';
    }
  }

  return {
    assessmentId: assessment?.id,
    studentId: responseRecord?.studentId,
    totalQuestions,
    correctCount,
    incorrectCount,
    unansweredCount,
    attemptedCount,
    scorePercent,
    isComplete: unansweredCount === 0 && totalQuestions > 0,
    hasAnyResponse: attemptedCount > 0,
    path,
    reasoning,
    confidenceNote,
    conceptBreakdown,
    weakConcepts,
    partialConcepts,
    strongConcepts,
    fundamentalAccuracy:
      fundamentalTotal > 0 ? Math.round((fundamentalCorrect / fundamentalTotal) * 100) : null
  };
}

/**
 * Create a default pre-marked Correct answers map for an assessment's questions.
 */
export function buildPreMarkedCorrectAnswers(assessment) {
  const answers = {};
  (assessment?.questions || []).forEach((q) => {
    answers[q.id] = 'correct';
  });
  return answers;
}

/**
 * Evaluate an entire class across one or all assessments for that class.
 */
export function evaluateClassInsights(
  classStudents,
  classAssessments,
  allResponses,
  settings = {},
  selectedAssessmentId = 'all'
) {
  const relearnThreshold = Number(settings.relearnThreshold ?? 50);
  const practiseThreshold = Number(settings.practiseThreshold ?? 80);
  const flagThreshold = Number(settings.classConceptFlagThreshold ?? 65);
  const minQuestionsForConfidence = Number(settings.minQuestionsForConceptConfidence ?? 2);

  const relevantAssessments =
    selectedAssessmentId && selectedAssessmentId !== 'all'
      ? classAssessments.filter((a) => a.id === selectedAssessmentId)
      : classAssessments;

  const responseLookup = new Map();
  allResponses.forEach((r) => {
    responseLookup.set(`${r.assessmentId}__${r.studentId}`, r);
  });

  // Evaluate latest status per student across relevant assessments
  const studentEvaluations = classStudents.map((student) => {
    const perAssessment = relevantAssessments.map((asmt) => {
      const rec = responseLookup.get(`${asmt.id}__${student.id}`);
      return {
        assessment: asmt,
        evaluation: evaluateStudentAssessment(asmt, rec, settings)
      };
    });

    const completedEvals = perAssessment.filter((item) => item.evaluation.hasAnyResponse);
    const latestItem =
      completedEvals.length > 0
        ? completedEvals[completedEvals.length - 1]
        : perAssessment[perAssessment.length - 1];

    let totalQ = 0;
    let totalCorrect = 0;
    let totalAttempted = 0;
    const studentConceptAgg = {};

    completedEvals.forEach(({ evaluation }) => {
      totalQ += evaluation.totalQuestions;
      totalCorrect += evaluation.correctCount;
      totalAttempted += evaluation.attemptedCount;

      evaluation.conceptBreakdown.forEach((cb) => {
        if (!studentConceptAgg[cb.conceptTag]) {
          studentConceptAgg[cb.conceptTag] = {
            conceptTag: cb.conceptTag,
            total: 0,
            correct: 0,
            incorrect: 0,
            unanswered: 0,
            assessmentsCount: 0,
            isFundamental: cb.isFundamental
          };
        }
        studentConceptAgg[cb.conceptTag].total += cb.total;
        studentConceptAgg[cb.conceptTag].correct += cb.correct;
        studentConceptAgg[cb.conceptTag].incorrect += cb.incorrect;
        studentConceptAgg[cb.conceptTag].unanswered += cb.unanswered;
        studentConceptAgg[cb.conceptTag].assessmentsCount += 1;
        if (cb.isFundamental) studentConceptAgg[cb.conceptTag].isFundamental = true;
      });
    });

    const averageScore = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : null;

    let trendDelta = null;
    let trendLabel = 'Single assessment recorded';
    if (completedEvals.length >= 2) {
      const firstScore = completedEvals[0].evaluation.scorePercent;
      const latestScore = completedEvals[completedEvals.length - 1].evaluation.scorePercent;
      trendDelta = latestScore - firstScore;
      if (trendDelta >= 10) {
        trendLabel = `Improving (+${trendDelta}%)`;
      } else if (trendDelta <= -10) {
        trendLabel = `Declining (${trendDelta}%)`;
      } else {
        trendLabel = `Steady (${trendDelta >= 0 ? '+' : ''}${trendDelta}%)`;
      }
    } else if (completedEvals.length === 0) {
      trendLabel = 'No responses recorded';
    }

    return {
      student,
      perAssessment,
      completedEvals,
      latestEvaluation: latestItem ? latestItem.evaluation : null,
      latestAssessment: latestItem ? latestItem.assessment : null,
      averageScore,
      trendDelta,
      trendLabel,
      conceptSummary: Object.values(studentConceptAgg).map((c) => ({
        ...c,
        accuracy: c.total > 0 ? Math.round((c.correct / c.total) * 100) : 0
      }))
    };
  });

  const latestPathByStudentId = new Map();
  studentEvaluations.forEach((se) => {
    latestPathByStudentId.set(
      se.student.id,
      se.latestEvaluation?.path || LEARNING_PATHS.NEEDS_CONFIRMATION.id
    );
  });

  // Aggregate Concept-Level Metrics across the class, including per-student breakdown
  const classConceptMap = {};
  const questionStatsList = [];

  relevantAssessments.forEach((asmt) => {
    (asmt.questions || []).forEach((q, qIdx) => {
      const tag = (q.conceptTag || 'General').trim();
      if (!classConceptMap[tag]) {
        classConceptMap[tag] = {
          conceptTag: tag,
          questionCount: 0,
          assessmentsSet: new Set(),
          totalResponsesPossible: 0,
          correctCount: 0,
          incorrectCount: 0,
          unansweredCount: 0,
          isFundamental: Boolean(q.isFundamental),
          perStudentMap: {}
        };
        classStudents.forEach((stu) => {
          classConceptMap[tag].perStudentMap[stu.id] = {
            student: stu,
            total: 0,
            correct: 0,
            incorrect: 0,
            unanswered: 0
          };
        });
      }

      classConceptMap[tag].questionCount += 1;
      classConceptMap[tag].assessmentsSet.add(asmt.id);
      if (q.isFundamental) classConceptMap[tag].isFundamental = true;

      let qCorrect = 0;
      let qIncorrect = 0;
      let qUnanswered = 0;

      classStudents.forEach((stu) => {
        const rec = responseLookup.get(`${asmt.id}__${stu.id}`);
        const rawAns = rec?.answers?.[q.id];
        const ans =
          rawAns === 'correct' || rawAns === 'incorrect' ? rawAns : 'unanswered';
        classConceptMap[tag].totalResponsesPossible += 1;

        const stuEntry = classConceptMap[tag].perStudentMap[stu.id];
        if (stuEntry) {
          stuEntry.total += 1;
        }

        if (ans === 'correct') {
          qCorrect += 1;
          classConceptMap[tag].correctCount += 1;
          if (stuEntry) stuEntry.correct += 1;
        } else if (ans === 'incorrect') {
          qIncorrect += 1;
          classConceptMap[tag].incorrectCount += 1;
          if (stuEntry) stuEntry.incorrect += 1;
        } else {
          qUnanswered += 1;
          classConceptMap[tag].unansweredCount += 1;
          if (stuEntry) stuEntry.unanswered += 1;
        }
      });

      const totalStudents = classStudents.length;
      const qAccuracy =
        totalStudents > 0 ? Math.round((qCorrect / totalStudents) * 100) : 0;
      const missOrBlankRate =
        totalStudents > 0
          ? Math.round(((qIncorrect + qUnanswered) / totalStudents) * 100)
          : 0;

      questionStatsList.push({
        assessmentId: asmt.id,
        assessmentTitle: asmt.title,
        questionId: q.id,
        questionNumber: qIdx + 1,
        text: q.text,
        conceptTag: tag,
        correctOption: q.options?.[q.correctOptionIndex] || '',
        correctCount: qCorrect,
        incorrectCount: qIncorrect,
        unansweredCount: qUnanswered,
        totalStudents,
        accuracy: qAccuracy,
        missOrBlankRate
      });
    });
  });

  const conceptInsights = Object.values(classConceptMap)
    .map((c) => {
      const attempted = c.correctCount + c.incorrectCount;
      const accuracy =
        c.totalResponsesPossible > 0
          ? Math.round((c.correctCount / c.totalResponsesPossible) * 100)
          : 0;
      const isFlagged = attempted > 0 && accuracy < flagThreshold;
      const assessmentsCount = c.assessmentsSet.size;

      const studentBreakdown = Object.values(c.perStudentMap)
        .map((sb) => {
          const stuAttempted = sb.correct + sb.incorrect;
          const stuAccuracy =
            sb.total > 0 ? Math.round((sb.correct / sb.total) * 100) : 0;
          let status = 'Unanswered';
          if (stuAttempted > 0) {
            if (stuAccuracy < relearnThreshold) status = 'Struggling';
            else if (stuAccuracy < practiseThreshold) status = 'Developing';
            else status = 'Mastered';
          }
          return {
            ...sb,
            attempted: stuAttempted,
            accuracy: stuAccuracy,
            status,
            isStruggling:
              stuAttempted > 0 &&
              (stuAccuracy < flagThreshold || sb.incorrect > 0 && stuAccuracy < practiseThreshold),
            latestPath:
              latestPathByStudentId.get(sb.student.id) ||
              LEARNING_PATHS.NEEDS_CONFIRMATION.id
          };
        })
        .sort((a, b) => a.accuracy - b.accuracy);

      const studentsStrugglingCount = studentBreakdown.filter(
        (sb) => sb.attempted > 0 && sb.accuracy < flagThreshold
      ).length;

      let classification = 'On Track';
      let classificationDetail = `Meets ${flagThreshold}% threshold.`;

      if (attempted === 0) {
        classification = 'Awaiting Responses';
        classificationDetail = 'No responses recorded.';
      } else if (isFlagged) {
        if (c.questionCount >= minQuestionsForConfidence && assessmentsCount >= 2) {
          classification = 'Persistent Gap';
          classificationDetail = `${accuracy}% across ${assessmentsCount} assessments (${c.questionCount} items).`;
        } else if (c.questionCount >= minQuestionsForConfidence) {
          classification = 'Review Needed';
          classificationDetail = `${accuracy}% across ${c.questionCount} items.`;
        } else {
          classification = 'Low Evidence (1 Item)';
          classificationDetail = `${accuracy}% on 1 question; verify in class.`;
        }
      }

      return {
        conceptTag: c.conceptTag,
        questionCount: c.questionCount,
        assessmentsCount,
        totalResponsesPossible: c.totalResponsesPossible,
        correctCount: c.correctCount,
        incorrectCount: c.incorrectCount,
        unansweredCount: c.unansweredCount,
        studentsStrugglingCount,
        studentBreakdown,
        isFundamental: c.isFundamental,
        accuracy,
        isFlagged,
        classification,
        classificationDetail
      };
    })
    .sort((a, b) => a.accuracy - b.accuracy);

  const flaggedConcepts = conceptInsights.filter((c) => c.isFlagged);

  const pathDistribution = {
    [LEARNING_PATHS.RELEARN.id]: [],
    [LEARNING_PATHS.PRACTISE.id]: [],
    [LEARNING_PATHS.ADVANCE.id]: [],
    [LEARNING_PATHS.NEEDS_CONFIRMATION.id]: []
  };

  studentEvaluations.forEach((se) => {
    const p = se.latestEvaluation?.path || LEARNING_PATHS.NEEDS_CONFIRMATION.id;
    if (!pathDistribution[p]) {
      pathDistribution[p] = [];
    }
    pathDistribution[p].push(se);
  });

  const studentsWithScores = studentEvaluations.filter(
    (se) => se.latestEvaluation?.hasAnyResponse
  );
  const overallClassAverage =
    studentsWithScores.length > 0
      ? Math.round(
          studentsWithScores.reduce(
            (acc, se) => acc + se.latestEvaluation.scorePercent,
            0
          ) / studentsWithScores.length
        )
      : 0;

  const challengingQuestions = [...questionStatsList]
    .filter((q) => q.incorrectCount + q.unansweredCount > 0)
    .sort((a, b) => b.missOrBlankRate - a.missOrBlankRate);

  let suggestedNextStep = {
    headline: 'Enter responses to generate insights',
    detail: 'Record student responses in the grid to calculate concept gaps.',
    priorityConcept: null
  };

  if (relevantAssessments.length > 0 && studentsWithScores.length > 0) {
    if (flaggedConcepts.length > 0) {
      const worst = flaggedConcepts[0];
      suggestedNextStep = {
        headline: `Review "${worst.conceptTag}" (${worst.accuracy}% accuracy, ${worst.studentsStrugglingCount} struggling)`,
        detail: `${worst.classification}: ${worst.classificationDetail}`,
        priorityConcept: worst.conceptTag
      };
    } else {
      suggestedNextStep = {
        headline: `All concepts meet the ${flagThreshold}% class threshold`,
        detail: `${pathDistribution[LEARNING_PATHS.PRACTISE.id].length} in Practise • ${pathDistribution[LEARNING_PATHS.ADVANCE.id].length} in Advance.`,
        priorityConcept: conceptInsights[0]?.conceptTag || null
      };
    }
  }

  return {
    overallClassAverage,
    totalStudents: classStudents.length,
    evaluatedStudentsCount: studentsWithScores.length,
    assessmentsCount: relevantAssessments.length,
    studentEvaluations,
    conceptInsights,
    flaggedConcepts,
    pathDistribution,
    challengingQuestions,
    suggestedNextStep
  };
}
