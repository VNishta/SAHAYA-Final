import React, { useState } from 'react';
import {
  BarChart3,
  AlertTriangle,
  Sparkles,
  Users,
  CheckCircle2,
  GraduationCap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { evaluateClassInsights, LEARNING_PATHS } from '../engine/adaptiveEngine';
import PathBadge from '../components/PathBadge';

export default function ClassInsights({
  activeClass,
  classStudents,
  classAssessments,
  allResponses,
  settings,
  onOpenStudentProgress,
  onOpenAiForConcept,
  onNavigate
}) {
  const [filterAssessmentId, setFilterAssessmentId] = useState('all');
  const [expandedConceptTag, setExpandedConceptTag] = useState(null);

  if (!activeClass || classAssessments.length === 0) {
    return (
      <div className="empty-state">
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          No Assessment Data
        </h2>
        <p style={{ margin: '0.4rem 0 1rem', fontSize: '0.85rem' }}>
          Create an assessment and enter responses to view class insights.
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

  const insights = evaluateClassInsights(
    classStudents,
    classAssessments,
    allResponses,
    settings,
    filterAssessmentId
  );

  const {
    conceptInsights,
    flaggedConcepts,
    challengingQuestions,
    pathDistribution,
    studentEvaluations
  } = insights;

  const relearnStudents = pathDistribution[LEARNING_PATHS.RELEARN.id] || [];
  const practiseStudents = pathDistribution[LEARNING_PATHS.PRACTISE.id] || [];
  const advanceStudents = pathDistribution[LEARNING_PATHS.ADVANCE.id] || [];
  const unconfirmedStudents = pathDistribution[LEARNING_PATHS.NEEDS_CONFIRMATION.id] || [];

  const prioritySupportStudents = studentEvaluations.filter(
    (se) =>
      se.latestEvaluation?.path === LEARNING_PATHS.RELEARN.id ||
      (se.latestEvaluation?.hasAnyResponse &&
        se.latestEvaluation.scorePercent < settings.classConceptFlagThreshold)
  );

  const toggleConceptBreakdown = (conceptTag) => {
    setExpandedConceptTag((prev) => (prev === conceptTag ? null : conceptTag));
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Class Insights</h1>
          <p className="page-subtitle">
            {activeClass.name} • {flaggedConcepts.length} concept(s) flagged (&lt;
            {settings.classConceptFlagThreshold}% accuracy)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            value={filterAssessmentId}
            onChange={(e) => setFilterAssessmentId(e.target.value)}
            aria-label="Filter by Assessment"
          >
            <option value="all">All Assessments ({classAssessments.length})</option>
            {classAssessments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title} ({a.date})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Concept-Wise Accuracy & Student-Level Breakdown */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-header">
          <h2 className="card-title">
            <BarChart3 size={18} color="#1e3a8a" />
            Concept Performance & Student Breakdown
          </h2>
          <span className="badge badge-slate">
            Review Threshold: &lt;{settings.classConceptFlagThreshold}%
          </span>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Concept Tag</th>
                <th>Items</th>
                <th>Students Struggling</th>
                <th style={{ minWidth: '180px' }}>Class Accuracy</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {conceptInsights.map((c) => {
                const isExpanded = expandedConceptTag === c.conceptTag;
                const barColor = c.isFlagged
                  ? '#f59e0b'
                  : c.accuracy >= settings.practiseThreshold
                  ? '#0d9488'
                  : '#0284c7';

                return (
                  <React.Fragment key={c.conceptTag}>
                    <tr
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleConceptBreakdown(c.conceptTag)}
                    >
                      <td>
                        <div style={{ fontWeight: 700 }}>{c.conceptTag}</div>
                        {c.isFundamental && (
                          <span
                            className="badge badge-slate"
                            style={{ fontSize: '0.68rem', marginTop: '0.15rem' }}
                          >
                            Fundamental
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>
                        {c.questionCount} Qs ({c.assessmentsCount} asmt)
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            c.studentsStrugglingCount > 0 ? 'badge-amber' : 'badge-teal'
                          }`}
                        >
                          {c.studentsStrugglingCount} / {classStudents.length} struggling
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                          <div className="progress-track" style={{ flex: 1 }}>
                            <div
                              className="progress-fill"
                              style={{ width: `${c.accuracy}%`, backgroundColor: barColor }}
                            />
                          </div>
                          <strong style={{ minWidth: '36px', textAlign: 'right' }}>
                            {c.accuracy}%
                          </strong>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            c.isFlagged ? 'badge-amber' : 'badge-teal'
                          }`}
                        >
                          {c.isFlagged ? (
                            <AlertTriangle size={12} />
                          ) : (
                            <CheckCircle2 size={12} />
                          )}
                          {c.isFlagged ? 'Flagged for Review' : 'On Track'}
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => toggleConceptBreakdown(c.conceptTag)}
                          >
                            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            Students
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => onOpenAiForConcept(c.conceptTag)}
                          >
                            <Sparkles size={13} />
                            Guide
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr>
                        <td
                          colSpan={6}
                          style={{
                            background: '#f8fafc',
                            padding: '0.9rem 1.1rem',
                            borderBottom: '2px solid var(--border-strong)'
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '0.6rem'
                            }}
                          >
                            <strong style={{ fontSize: '0.86rem' }}>
                              Student Breakdown — {c.conceptTag} ({c.accuracy}% Class Accuracy)
                            </strong>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              {c.studentsStrugglingCount} struggling • {c.questionCount} question(s)
                            </span>
                          </div>

                          <div className="table-wrap">
                            <table
                              className="data-table"
                              style={{ background: '#ffffff', border: '1px solid var(--border-color)' }}
                            >
                              <thead>
                                <tr>
                                  <th>ID / Roll</th>
                                  <th>Student</th>
                                  <th>Correct / Total</th>
                                  <th>Concept Accuracy</th>
                                  <th>Concept Status</th>
                                  <th>Overall Path</th>
                                  <th></th>
                                </tr>
                              </thead>
                              <tbody>
                                {(c.studentBreakdown || []).map((sb) => (
                                  <tr key={sb.student.id}>
                                    <td style={{ fontWeight: 600 }}>{sb.student.rollNo}</td>
                                    <td style={{ fontWeight: 600 }}>{sb.student.name}</td>
                                    <td>
                                      {sb.correct} / {sb.total}
                                      {sb.unanswered > 0 ? ` (${sb.unanswered} blank)` : ''}
                                    </td>
                                    <td>
                                      <strong>{sb.attempted > 0 ? `${sb.accuracy}%` : '—'}</strong>
                                    </td>
                                    <td>
                                      <span
                                        className={`badge ${
                                          sb.status === 'Struggling'
                                            ? 'badge-amber'
                                            : sb.status === 'Developing'
                                            ? 'badge-blue'
                                            : sb.status === 'Mastered'
                                            ? 'badge-teal'
                                            : 'badge-slate'
                                        }`}
                                      >
                                        {sb.status}
                                      </span>
                                    </td>
                                    <td>
                                      <PathBadge path={sb.latestPath} />
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                      <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => onOpenStudentProgress(sb.student.id)}
                                      >
                                        Progress
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Distribution Across Learning Paths & Priority Support */}
      <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Learning Path Distribution</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              {
                meta: LEARNING_PATHS.RELEARN,
                list: relearnStudents,
                barColor: '#f59e0b'
              },
              {
                meta: LEARNING_PATHS.PRACTISE,
                list: practiseStudents,
                barColor: '#0284c7'
              },
              {
                meta: LEARNING_PATHS.ADVANCE,
                list: advanceStudents,
                barColor: '#0d9488'
              },
              {
                meta: LEARNING_PATHS.NEEDS_CONFIRMATION,
                list: unconfirmedStudents,
                barColor: '#64748b'
              }
            ].map(({ meta, list, barColor }) => {
              const pct =
                classStudents.length > 0
                  ? Math.round((list.length / classStudents.length) * 100)
                  : 0;
              return (
                <div
                  key={meta.id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: '#f8fafc'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.35rem'
                    }}
                  >
                    <PathBadge path={meta.id} />
                    <span style={{ fontWeight: 700, fontSize: '0.86rem' }}>
                      {list.length} / {classStudents.length} ({pct}%)
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${pct}%`, backgroundColor: barColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Students Needing Support */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Users size={17} color="#b45309" />
              Students Needing Support ({prioritySupportStudents.length})
            </h2>
          </div>

          {prioritySupportStudents.length === 0 ? (
            <div className="empty-state" style={{ padding: '1.5rem' }}>
              No students currently flagged for support.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {prioritySupportStudents.map(({ student, latestEvaluation }) => (
                <div
                  key={student.id}
                  style={{
                    padding: '0.7rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.65rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '0.88rem' }}>
                        {student.rollNo} • {student.name}
                      </strong>
                      <PathBadge path={latestEvaluation?.path} />
                      <span className="badge badge-slate">{latestEvaluation?.scorePercent}%</span>
                    </div>
                    <div
                      style={{
                        fontSize: '0.76rem',
                        color: 'var(--text-secondary)',
                        marginTop: '0.2rem'
                      }}
                    >
                      {latestEvaluation?.reasoning}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onOpenStudentProgress(student.id)}
                  >
                    <GraduationCap size={13} />
                    Progress
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Frequently Missed Questions */}
      {challengingQuestions.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Most Missed Questions</h2>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Concept</th>
                  <th>Incorrect</th>
                  <th>Unanswered</th>
                  <th>Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {challengingQuestions.map((q) => (
                  <tr key={`${q.assessmentId}_${q.questionId}`}>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        Q{q.questionNumber}: {q.text}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {q.assessmentTitle} • Key: {q.correctOption}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-blue">{q.conceptTag}</span>
                    </td>
                    <td>
                      <span className="badge badge-rose">
                        {q.incorrectCount} / {q.totalStudents}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-slate">{q.unansweredCount}</span>
                    </td>
                    <td>
                      <strong>{q.accuracy}%</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
