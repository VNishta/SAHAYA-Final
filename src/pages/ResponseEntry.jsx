import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  BarChart3,
  Keyboard,
  CheckCheck,
  RotateCcw,
  UserPlus
} from 'lucide-react';
import {
  evaluateStudentAssessment,
  buildPreMarkedCorrectAnswers
} from '../engine/adaptiveEngine';
import PathBadge from '../components/PathBadge';

// Since all responses start pre-marked Correct, first click cycles to Incorrect, then Unanswered, then Correct
const NEXT_STATE_CYCLE = {
  correct: 'incorrect',
  incorrect: 'unanswered',
  unanswered: 'correct'
};

export default function ResponseEntry({
  activeClass,
  classStudents,
  classAssessments,
  allResponses,
  settings,
  selectedAssessmentId,
  onSelectAssessmentId,
  onSaveResponseRecord,
  onSaveBulkResponses,
  onNavigate,
  onOpenStudentProgress
}) {
  const currentAssessment =
    classAssessments.find((a) => a.id === selectedAssessmentId) ||
    classAssessments[classAssessments.length - 1] ||
    null;

  const [saveIndicator, setSaveIndicator] = useState('All responses saved');
  const cellRefs = useRef({});
  const initializedRef = useRef('');

  useEffect(() => {
    if (currentAssessment && currentAssessment.id !== selectedAssessmentId) {
      onSelectAssessmentId(currentAssessment.id);
    }
  }, [currentAssessment, selectedAssessmentId]);

  // Ensure any student without a saved record for currentAssessment is pre-marked as Correct and persisted
  useEffect(() => {
    if (!currentAssessment || classStudents.length === 0) return;
    const questions = currentAssessment.questions || [];
    if (questions.length === 0) return;

    const existingMap = new Map();
    allResponses
      .filter((r) => r.assessmentId === currentAssessment.id)
      .forEach((r) => existingMap.set(r.studentId, r));

    const missingRecords = [];
    classStudents.forEach((stu) => {
      const existing = existingMap.get(stu.id);
      if (!existing) {
        missingRecords.push({
          id: `${currentAssessment.id}__${stu.id}`,
          assessmentId: currentAssessment.id,
          studentId: stu.id,
          answers: buildPreMarkedCorrectAnswers(currentAssessment),
          updatedAt: new Date().toISOString()
        });
      } else {
        // Check if any newly added question is missing in answers
        const hasMissingQ = questions.some((q) => !existing.answers?.[q.id]);
        if (hasMissingQ) {
          const nextAnswers = { ...existing.answers };
          questions.forEach((q) => {
            if (!nextAnswers[q.id]) nextAnswers[q.id] = 'correct';
          });
          missingRecords.push({
            ...existing,
            answers: nextAnswers,
            updatedAt: new Date().toISOString()
          });
        }
      }
    });

    const initKey = `${currentAssessment.id}_${classStudents.length}_${missingRecords.length}`;
    if (missingRecords.length > 0 && initializedRef.current !== initKey) {
      initializedRef.current = initKey;
      onSaveBulkResponses(missingRecords).then(() => {
        setSaveIndicator('Pre-marked Correct & saved ✓');
      });
    }
  }, [currentAssessment?.id, classStudents.length, allResponses.length]);

  if (!activeClass || classAssessments.length === 0) {
    return (
      <div className="empty-state">
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          No Assessments Available
        </h2>
        <p style={{ margin: '0.4rem 0 1rem', fontSize: '0.85rem' }}>
          Create an assessment for {activeClass?.name || 'your class'} to enter paper responses.
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onNavigate('assessments')}
        >
          Create Assessment
        </button>
      </div>
    );
  }

  if (classStudents.length === 0) {
    return (
      <div className="empty-state">
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          No Students in {activeClass.name}
        </h2>
        <p style={{ margin: '0.4rem 0 1rem', fontSize: '0.85rem' }}>
          Add students to {activeClass.name} before entering assessment responses.
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onNavigate('classes')}
        >
          <UserPlus size={15} />
          Add Students
        </button>
      </div>
    );
  }

  const questions = currentAssessment?.questions || [];

  const responseByStudent = new Map();
  allResponses
    .filter((r) => r.assessmentId === currentAssessment.id)
    .forEach((r) => responseByStudent.set(r.studentId, r));

  // Default state is 'correct' per SAHAYA's pre-marked workflow
  const getCellState = (studentId, questionId) => {
    const rec = responseByStudent.get(studentId);
    return rec?.answers?.[questionId] || 'correct';
  };

  const updateSingleCell = async (studentId, questionId, nextState) => {
    setSaveIndicator('Saving...');
    const existing = responseByStudent.get(studentId);
    const baseAnswers = existing?.answers || buildPreMarkedCorrectAnswers(currentAssessment);
    const updatedAnswers = {
      ...baseAnswers,
      [questionId]: nextState
    };

    const record = {
      id: `${currentAssessment.id}__${studentId}`,
      assessmentId: currentAssessment.id,
      studentId,
      answers: updatedAnswers,
      updatedAt: new Date().toISOString()
    };

    await onSaveResponseRecord(record);
    const timeStr = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    setSaveIndicator(`Saved ✓ (${timeStr})`);
  };

  const handleCellClick = (studentId, questionId) => {
    const current = getCellState(studentId, questionId);
    const next = NEXT_STATE_CYCLE[current] || 'incorrect';
    updateSingleCell(studentId, questionId, next);
  };

  const handleCellKeyDown = (e, rowIdx, colIdx, studentId, questionId) => {
    const key = e.key.toLowerCase();

    if (key === 'c' || key === '1') {
      e.preventDefault();
      updateSingleCell(studentId, questionId, 'correct');
      moveFocus(rowIdx, colIdx + 1);
    } else if (key === 'i' || key === 'x' || key === '2') {
      e.preventDefault();
      updateSingleCell(studentId, questionId, 'incorrect');
      moveFocus(rowIdx, colIdx + 1);
    } else if (key === 'u' || key === '0' || key === 'backspace' || key === 'delete') {
      e.preventDefault();
      updateSingleCell(studentId, questionId, 'unanswered');
      moveFocus(rowIdx, colIdx + 1);
    } else if (key === 'arrowright') {
      e.preventDefault();
      moveFocus(rowIdx, colIdx + 1);
    } else if (key === 'arrowleft') {
      e.preventDefault();
      moveFocus(rowIdx, colIdx - 1);
    } else if (key === 'arrowdown') {
      e.preventDefault();
      moveFocus(rowIdx + 1, colIdx);
    } else if (key === 'arrowup') {
      e.preventDefault();
      moveFocus(rowIdx - 1, colIdx);
    }
  };

  const moveFocus = (targetRow, targetCol) => {
    let r = targetRow;
    let c = targetCol;
    if (c >= questions.length) {
      c = 0;
      r += 1;
    }
    if (c < 0) {
      c = questions.length - 1;
      r -= 1;
    }
    const refKey = `${r}__${c}`;
    if (cellRefs.current[refKey]) {
      cellRefs.current[refKey].focus();
    }
  };

  const markEntireRow = async (studentId, stateValue) => {
    setSaveIndicator('Saving...');
    const updatedAnswers = {};
    questions.forEach((q) => {
      updatedAnswers[q.id] = stateValue;
    });
    const record = {
      id: `${currentAssessment.id}__${studentId}`,
      assessmentId: currentAssessment.id,
      studentId,
      answers: updatedAnswers,
      updatedAt: new Date().toISOString()
    };
    await onSaveResponseRecord(record);
    setSaveIndicator(`Row saved as ${stateValue} ✓`);
  };

  const markAllGridCells = async (stateValue) => {
    setSaveIndicator('Saving...');
    const bulk = classStudents.map((stu) => {
      const nextAnswers = {};
      questions.forEach((q) => {
        nextAnswers[q.id] = stateValue;
      });
      return {
        id: `${currentAssessment.id}__${stu.id}`,
        assessmentId: currentAssessment.id,
        studentId: stu.id,
        answers: nextAnswers,
        updatedAt: new Date().toISOString()
      };
    });
    await onSaveBulkResponses(bulk);
    setSaveIndicator(`All cells marked ${stateValue} ✓`);
  };

  const studentRows = classStudents.map((stu) => {
    const existing = responseByStudent.get(stu.id);
    const effectiveRecord = existing || {
      studentId: stu.id,
      answers: buildPreMarkedCorrectAnswers(currentAssessment)
    };
    const evaluation = evaluateStudentAssessment(
      currentAssessment,
      effectiveRecord,
      settings
    );
    return {
      student: stu,
      evaluation
    };
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Response Entry</h1>
          <p className="page-subtitle">
            Pre-marked Correct • Click cells to mark Incorrect or Unanswered
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            style={{ fontWeight: 600, minWidth: '240px' }}
            value={currentAssessment.id}
            onChange={(e) => onSelectAssessmentId(e.target.value)}
            aria-label="Select Assessment"
          >
            {classAssessments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title} ({a.date})
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onNavigate('insights')}
          >
            <BarChart3 size={15} />
            Class Insights
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="card" style={{ marginBottom: '1rem', padding: '0.85rem 1.1rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span className="badge badge-navy">
              <Keyboard size={12} />
              Shortcuts
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Click to cycle or press{' '}
              <kbd
                style={{
                  padding: '1px 5px',
                  background: '#dcfce7',
                  borderRadius: '4px',
                  fontWeight: 700
                }}
              >
                C
              </kbd>{' '}
              Correct,{' '}
              <kbd
                style={{
                  padding: '1px 5px',
                  background: '#ffe4e6',
                  borderRadius: '4px',
                  fontWeight: 700
                }}
              >
                I
              </kbd>{' '}
              Incorrect,{' '}
              <kbd
                style={{
                  padding: '1px 5px',
                  background: '#f1f5f9',
                  borderRadius: '4px',
                  fontWeight: 700
                }}
              >
                U
              </kbd>{' '}
              Unanswered
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge badge-teal" aria-live="polite">
              {saveIndicator}
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => markAllGridCells('correct')}
              title="Reset all responses to Correct"
            >
              <CheckCheck size={13} />
              All Correct
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => markAllGridCells('unanswered')}
              title="Clear all responses to Unanswered"
            >
              <RotateCcw size={13} />
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Response Entry Grid */}
      <div className="card">
        <div className="table-wrap">
          <table className="data-table response-grid-table">
            <thead>
              <tr>
                <th style={{ minWidth: '170px' }}>Student</th>
                {questions.map((q, qIdx) => {
                  const keyLetter = String.fromCharCode(65 + Number(q.correctOptionIndex || 0));
                  return (
                    <th key={q.id} style={{ textAlign: 'center', minWidth: '122px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        Q{qIdx + 1} ({keyLetter})
                      </div>
                      <div
                        style={{
                          fontSize: '0.68rem',
                          color: 'var(--primary-navy)',
                          textTransform: 'none',
                          fontWeight: 600,
                          marginTop: '0.1rem'
                        }}
                        title={q.text}
                      >
                        {q.conceptTag}
                      </div>
                    </th>
                  );
                })}
                <th style={{ textAlign: 'center' }}>Row Actions</th>
                <th style={{ textAlign: 'center' }}>Score</th>
                <th>Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {studentRows.map(({ student, evaluation }, rowIdx) => (
                <tr key={student.id}>
                  <td>
                    <button
                      type="button"
                      onClick={() => onOpenStudentProgress(student.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        textAlign: 'left',
                        cursor: 'pointer',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>
                        {student.rollNo} • {student.name}
                      </div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                        {evaluation.correctCount}/{evaluation.totalQuestions} correct
                      </div>
                    </button>
                  </td>

                  {questions.map((q, colIdx) => {
                    const state = getCellState(student.id, q.id);
                    const refKey = `${rowIdx}__${colIdx}`;
                    return (
                      <td key={q.id} style={{ textAlign: 'center' }}>
                        <button
                          ref={(el) => {
                            cellRefs.current[refKey] = el;
                          }}
                          type="button"
                          className={`response-cell-btn ${
                            state === 'correct'
                              ? 'cell-correct'
                              : state === 'incorrect'
                              ? 'cell-incorrect'
                              : 'cell-unanswered'
                          }`}
                          onClick={() => handleCellClick(student.id, q.id)}
                          onKeyDown={(e) =>
                            handleCellKeyDown(e, rowIdx, colIdx, student.id, q.id)
                          }
                          aria-label={`${student.name} Question ${colIdx + 1} (${q.conceptTag}): ${state}`}
                        >
                          {state === 'correct' && (
                            <>
                              <CheckCircle2 size={14} />
                              Correct
                            </>
                          )}
                          {state === 'incorrect' && (
                            <>
                              <XCircle size={14} />
                              Incorrect
                            </>
                          )}
                          {state === 'unanswered' && (
                            <>
                              <MinusCircle size={14} />
                              Unanswered
                            </>
                          )}
                        </button>
                      </td>
                    );
                  })}

                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '0.2rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem' }}
                        onClick={() => markEntireRow(student.id, 'correct')}
                        title="Mark row Correct"
                      >
                        All ✓
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem' }}
                        onClick={() => markEntireRow(student.id, 'incorrect')}
                        title="Mark row Incorrect"
                      >
                        All ✗
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem' }}
                        onClick={() => markEntireRow(student.id, 'unanswered')}
                        title="Mark row Unanswered"
                      >
                        Blank
                      </button>
                    </div>
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    {evaluation.hasAnyResponse ? (
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: '0.95rem',
                          color:
                            evaluation.scorePercent < settings.relearnThreshold
                              ? '#b45309'
                              : evaluation.scorePercent < settings.practiseThreshold
                              ? '#0369a1'
                              : '#0f766e'
                        }}
                      >
                        {evaluation.scorePercent}%
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>

                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <div>
                        <PathBadge path={evaluation.path} />
                      </div>
                      <div
                        style={{
                          fontSize: '0.74rem',
                          color: 'var(--text-muted)',
                          maxWidth: '250px'
                        }}
                      >
                        {evaluation.reasoning}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
