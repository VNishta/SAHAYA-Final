import React, { useEffect } from 'react';
import {
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  FileCheck2,
  Info
} from 'lucide-react';
import PathBadge from '../components/PathBadge';

export default function StudentProgress({
  activeClass,
  classStudents,
  classInsights,
  selectedStudentId,
  onSelectStudentId,
  onOpenAiForConcept,
  onOpenResponseEntry
}) {
  const currentStudent =
    classStudents.find((s) => s.id === selectedStudentId) ||
    classStudents[0] ||
    null;

  useEffect(() => {
    if (currentStudent && currentStudent.id !== selectedStudentId) {
      onSelectStudentId(currentStudent.id);
    }
  }, [currentStudent, selectedStudentId]);

  if (!activeClass || classStudents.length === 0) {
    return (
      <div className="empty-state">
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          No Students Enrolled
        </h2>
        <p style={{ margin: '0.4rem 0', fontSize: '0.85rem' }}>
          Add students to {activeClass?.name || 'your class'} to view progress.
        </p>
      </div>
    );
  }

  const studentEvalObj =
    (classInsights?.studentEvaluations || []).find(
      (se) => se.student.id === currentStudent?.id
    ) || null;

  const completedEvals = studentEvalObj?.completedEvals || [];
  const latestEvaluation = studentEvalObj?.latestEvaluation || null;
  const conceptSummary = studentEvalObj?.conceptSummary || [];

  const strongConcepts = conceptSummary.filter((c) => c.accuracy >= 75);
  const practiceConcepts = conceptSummary.filter((c) => c.accuracy < 75);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Progress</h1>
          <p className="page-subtitle">{activeClass.name}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label className="form-label" htmlFor="student-progress-select" style={{ margin: 0 }}>
            Student:
          </label>
          <select
            id="student-progress-select"
            className="form-select"
            style={{ fontWeight: 700, minWidth: '230px' }}
            value={currentStudent?.id || ''}
            onChange={(e) => onSelectStudentId(e.target.value)}
          >
            {classStudents.map((stu) => (
              <option key={stu.id} value={stu.id}>
                {stu.rollNo} — {stu.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentStudent && (
        <>
          {/* Student Overview Card */}
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-navy">{currentStudent.rollNo}</span>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                    {currentStudent.name}
                  </h2>
                  <PathBadge path={latestEvaluation?.path} />
                </div>
                {currentStudent.notes && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {currentStudent.notes}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1.35rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    LATEST SCORE
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                    {latestEvaluation?.hasAnyResponse ? `${latestEvaluation.scorePercent}%` : '—'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    AVERAGE
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                    {studentEvalObj?.averageScore !== null
                      ? `${studentEvalObj.averageScore}%`
                      : '—'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    ASSESSMENTS
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                    {completedEvals.length}
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: '0.9rem',
                padding: '0.75rem 0.9rem',
                background: 'var(--bg-slate-subtle)',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                fontSize: '0.84rem'
              }}
            >
              <strong>Recommendation Reason: </strong>
              <span style={{ color: 'var(--text-secondary)' }}>
                {latestEvaluation?.reasoning || 'No responses recorded.'}
              </span>
            </div>
          </div>

          {/* Progress Over Time & Concept Performance */}
          <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
            {/* Scores Over Time */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  <TrendingUp size={17} color="#1e3a8a" />
                  Progress Across Assessments
                </h2>
              </div>

              {completedEvals.length === 0 ? (
                <div className="empty-state" style={{ padding: '1.5rem' }}>
                  No assessment responses recorded yet.
                </div>
              ) : completedEvals.length === 1 ? (
                <div>
                  <div
                    className="callout callout-blue"
                    style={{ marginBottom: '0.75rem', padding: '0.65rem 0.85rem' }}
                  >
                    <Info size={16} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                    <div style={{ fontSize: '0.82rem' }}>
                      1 assessment recorded ({completedEvals[0].assessment.title}:{' '}
                      <strong>{completedEvals[0].evaluation.scorePercent}%</strong>). Record at
                      least 2 assessments to view a trend.
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      padding: '0.55rem 0.8rem',
                      background: 'var(--bg-slate-subtle)',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      marginBottom: '0.85rem',
                      fontSize: '0.83rem',
                      fontWeight: 600
                    }}
                  >
                    Trend: {studentEvalObj.trendLabel}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      gap: '1rem',
                      height: '150px',
                      padding: '0.85rem 0.65rem 0.4rem',
                      borderBottom: '2px solid var(--border-strong)'
                    }}
                  >
                    {completedEvals.map(({ assessment, evaluation }, idx) => {
                      const barColor =
                        evaluation.scorePercent < 50
                          ? '#f59e0b'
                          : evaluation.scorePercent < 80
                          ? '#0284c7'
                          : '#0d9488';
                      return (
                        <div
                          key={assessment.id}
                          style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            height: '100%',
                            justifyContent: 'flex-end'
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 800,
                              fontSize: '0.82rem',
                              marginBottom: '0.25rem'
                            }}
                          >
                            {evaluation.scorePercent}%
                          </div>
                          <div
                            style={{
                              width: '100%',
                              maxWidth: '56px',
                              height: `${Math.max(12, evaluation.scorePercent)}%`,
                              background: barColor,
                              borderRadius: '5px 5px 0 0'
                            }}
                          />
                          <div
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              marginTop: '0.4rem',
                              textAlign: 'center',
                              color: 'var(--text-secondary)'
                            }}
                          >
                            #{idx + 1}: {assessment.date}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Concept-Wise Performance */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  <Award size={17} color="#0d9488" />
                  Concept-Wise Performance
                </h2>
              </div>

              {conceptSummary.length === 0 ? (
                <div className="empty-state" style={{ padding: '1.5rem' }}>
                  No concept records yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <div
                      style={{
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: '#0f766e',
                        textTransform: 'uppercase',
                        marginBottom: '0.35rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <CheckCircle2 size={13} />
                      Strengths (&ge;75%)
                    </div>
                    {strongConcepts.length === 0 ? (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None yet</div>
                    ) : (
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {strongConcepts.map((c) => (
                          <span key={c.conceptTag} className="badge badge-teal">
                            {c.conceptTag} ({c.accuracy}% • {c.correct}/{c.total})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: '#b45309',
                        textTransform: 'uppercase',
                        marginBottom: '0.35rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <AlertTriangle size={13} />
                      Needs Practice (&lt;75%)
                    </div>
                    {practiceConcepts.length === 0 ? (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        {practiceConcepts.map((c) => (
                          <div
                            key={c.conceptTag}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '0.45rem 0.65rem',
                              background: '#fffbeb',
                              border: '1px solid #fde68a',
                              borderRadius: '6px'
                            }}
                          >
                            <div>
                              <strong style={{ fontSize: '0.83rem' }}>{c.conceptTag}</strong>
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  color: 'var(--text-muted)',
                                  marginLeft: '0.45rem'
                                }}
                              >
                                {c.accuracy}% ({c.correct}/{c.total})
                              </span>
                            </div>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => onOpenAiForConcept(c.conceptTag)}
                            >
                              <Sparkles size={12} />
                              Guide
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assessment History Table */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <FileCheck2 size={17} color="#1e3a8a" />
                Assessment History
              </h2>
            </div>

            {(studentEvalObj?.perAssessment || []).length === 0 ? (
              <div className="empty-state">No assessments in class.</div>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Assessment</th>
                      <th>Date</th>
                      <th>Responses</th>
                      <th>Score</th>
                      <th>Concepts</th>
                      <th>Learning Path</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(studentEvalObj?.perAssessment || []).map(({ assessment, evaluation }) => (
                      <tr key={assessment.id}>
                        <td style={{ fontWeight: 700 }}>{assessment.title}</td>
                        <td style={{ fontSize: '0.8rem' }}>{assessment.date}</td>
                        <td style={{ fontSize: '0.8rem' }}>
                          {evaluation.correctCount} ✓ • {evaluation.incorrectCount} ✗ •{' '}
                          {evaluation.unansweredCount} –
                        </td>
                        <td>
                          {evaluation.hasAnyResponse ? (
                            <strong>{evaluation.scorePercent}%</strong>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                            {evaluation.conceptBreakdown.map((cb) => (
                              <span
                                key={cb.conceptTag}
                                className={`badge ${
                                  cb.accuracy >= 80
                                    ? 'badge-teal'
                                    : cb.accuracy >= 50
                                    ? 'badge-blue'
                                    : 'badge-amber'
                                }`}
                                style={{ fontSize: '0.68rem' }}
                              >
                                {cb.conceptTag}: {cb.correct}/{cb.total}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <PathBadge path={evaluation.path} />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => onOpenResponseEntry(assessment.id)}
                          >
                            Edit Grid
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
