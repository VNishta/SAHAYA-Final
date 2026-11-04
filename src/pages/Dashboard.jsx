import React from 'react';
import {
  Users,
  FileCheck2,
  AlertTriangle,
  PlusCircle,
  Grid,
  ArrowRight,
  UserPlus,
  BookOpen
} from 'lucide-react';
import { LEARNING_PATHS } from '../engine/adaptiveEngine';
import PathBadge from '../components/PathBadge';

export default function Dashboard({
  activeClass,
  classAssessments,
  classInsights,
  settings,
  onNavigate,
  onOpenResponseEntry,
  onOpenStudentProgress,
  onQuickCreateAssessment
}) {
  if (!activeClass) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">No class selected.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigate('classes')}
            >
              <PlusCircle size={15} />
              Create Class
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">
              <span>Total Students</span>
              <Users size={16} color="#1e3a8a" />
            </div>
            <div className="stat-value">0</div>
            <div className="stat-helper">No active class</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">
              <span>Total Assessments</span>
              <FileCheck2 size={16} color="#0284c7" />
            </div>
            <div className="stat-value">0</div>
            <div className="stat-helper">No assessments</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">
              <span>Students Needing Support</span>
              <AlertTriangle size={16} color="#64748b" />
            </div>
            <div className="stat-value">0</div>
            <div className="stat-helper">Relearn Fundamentals</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">
              <span>Concepts for Review</span>
              <BookOpen size={16} color="#64748b" />
            </div>
            <div className="stat-value">0</div>
            <div className="stat-helper">Below {settings.classConceptFlagThreshold}% accuracy</div>
          </div>
        </div>

        <div className="empty-state">
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            No Classroom Data Yet
          </h2>
          <p style={{ fontSize: '0.85rem', margin: '0.35rem 0 1rem' }}>
            Create a class, add students, and record an assessment to view live insights.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigate('classes')}
            >
              <UserPlus size={15} />
              Add Class & Students
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onNavigate('settings')}
            >
              Settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    totalStudents,
    evaluatedStudentsCount,
    assessmentsCount,
    flaggedConcepts,
    pathDistribution,
    conceptInsights,
    studentEvaluations
  } = classInsights;

  const relearnList = pathDistribution[LEARNING_PATHS.RELEARN.id] || [];
  const practiseList = pathDistribution[LEARNING_PATHS.PRACTISE.id] || [];
  const advanceList = pathDistribution[LEARNING_PATHS.ADVANCE.id] || [];
  const unconfirmedList = pathDistribution[LEARNING_PATHS.NEEDS_CONFIRMATION.id] || [];

  const studentsNeedingSupportCount = relearnList.length;
  const recentAssessments = [...classAssessments].reverse().slice(0, 5);

  return (
    <div>
      {/* Header & Quick Actions */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            {activeClass.name} • {activeClass.grade} • {activeClass.subject}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onNavigate('classes')}
          >
            <UserPlus size={15} />
            Add Students
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onNavigate('responses')}
          >
            <Grid size={15} />
            Enter Responses
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onQuickCreateAssessment}
          >
            <PlusCircle size={15} />
            Create Assessment
          </button>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">
            <span>Total Students</span>
            <Users size={16} color="#1e3a8a" />
          </div>
          <div className="stat-value">{totalStudents}</div>
          <div className="stat-helper">{evaluatedStudentsCount} evaluated</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <span>Total Assessments</span>
            <FileCheck2 size={16} color="#0284c7" />
          </div>
          <div className="stat-value">{assessmentsCount}</div>
          <div className="stat-helper">Saved in class</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <span>Students Needing Support</span>
            <AlertTriangle
              size={16}
              color={studentsNeedingSupportCount > 0 ? '#b45309' : '#0d9488'}
            />
          </div>
          <div
            className="stat-value"
            style={{ color: studentsNeedingSupportCount > 0 ? '#b45309' : 'var(--text-primary)' }}
          >
            {studentsNeedingSupportCount}
          </div>
          <div className="stat-helper">Relearn Fundamentals</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <span>Concepts for Review</span>
            <BookOpen size={16} color={flaggedConcepts.length > 0 ? '#b45309' : '#0d9488'} />
          </div>
          <div
            className="stat-value"
            style={{ color: flaggedConcepts.length > 0 ? '#b45309' : 'var(--text-primary)' }}
          >
            {flaggedConcepts.length}
          </div>
          <div className="stat-helper">&lt;{settings.classConceptFlagThreshold}% accuracy</div>
        </div>
      </div>

      {/* Learning Path Distribution & Important Class-Wide Learning Gaps */}
      <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
        {/* Left: Distribution Across Learning Paths */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Learning Path Distribution</h2>
            <span className="badge badge-slate">
              &lt;{settings.relearnThreshold}% / {settings.relearnThreshold}–
              {settings.practiseThreshold - 1}% / &ge;{settings.practiseThreshold}%
            </span>
          </div>

          {totalStudents > 0 && (
            <div
              style={{
                display: 'flex',
                height: '12px',
                borderRadius: '999px',
                overflow: 'hidden',
                marginBottom: '1rem',
                background: '#e2e8f0'
              }}
            >
              {relearnList.length > 0 && (
                <div
                  style={{
                    width: `${(relearnList.length / totalStudents) * 100}%`,
                    background: '#f59e0b'
                  }}
                  title={`Relearn: ${relearnList.length}`}
                />
              )}
              {practiseList.length > 0 && (
                <div
                  style={{
                    width: `${(practiseList.length / totalStudents) * 100}%`,
                    background: '#0284c7'
                  }}
                  title={`Practise: ${practiseList.length}`}
                />
              )}
              {advanceList.length > 0 && (
                <div
                  style={{
                    width: `${(advanceList.length / totalStudents) * 100}%`,
                    background: '#0d9488'
                  }}
                  title={`Advance: ${advanceList.length}`}
                />
              )}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              {
                pathId: LEARNING_PATHS.RELEARN.id,
                list: relearnList,
                bg: 'var(--bg-amber-subtle)',
                border: 'var(--amber-border)'
              },
              {
                pathId: LEARNING_PATHS.PRACTISE.id,
                list: practiseList,
                bg: 'var(--bg-subtle)',
                border: 'var(--blue-border)'
              },
              {
                pathId: LEARNING_PATHS.ADVANCE.id,
                list: advanceList,
                bg: 'var(--bg-teal-subtle)',
                border: 'var(--teal-border)'
              },
              {
                pathId: LEARNING_PATHS.NEEDS_CONFIRMATION.id,
                list: unconfirmedList,
                bg: 'var(--bg-slate-subtle)',
                border: 'var(--border-color)'
              }
            ].map(({ pathId, list, bg, border }) => (
              <div
                key={pathId}
                style={{
                  padding: '0.65rem 0.8rem',
                  borderRadius: '6px',
                  background: bg,
                  border: `1px solid ${border}`
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <PathBadge path={pathId} />
                  <strong style={{ fontSize: '0.9rem' }}>{list.length}</strong>
                </div>
                {list.length > 0 && (
                  <div
                    style={{
                      marginTop: '0.45rem',
                      display: 'flex',
                      gap: '0.3rem',
                      flexWrap: 'wrap'
                    }}
                  >
                    {list.map(({ student, latestEvaluation }) => (
                      <button
                        key={student.id}
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.15rem 0.45rem', fontSize: '0.73rem' }}
                        onClick={() => onOpenStudentProgress(student.id)}
                      >
                        {student.name}
                        {latestEvaluation?.hasAnyResponse
                          ? ` (${latestEvaluation.scorePercent}%)`
                          : ''}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Class-Wide Learning Gaps & Recent Assessments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {/* Class-Wide Learning Gaps */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Class-Wide Concept Gaps</h2>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onNavigate('insights')}
              >
                Class Insights <ArrowRight size={13} />
              </button>
            </div>

            {conceptInsights.length === 0 ? (
              <div className="empty-state" style={{ padding: '1.25rem' }}>
                No concept data recorded yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {conceptInsights.slice(0, 5).map((c) => {
                  const barColor = c.isFlagged
                    ? '#f59e0b'
                    : c.accuracy >= settings.practiseThreshold
                    ? '#0d9488'
                    : '#0284c7';
                  return (
                    <div key={c.conceptTag}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.25rem',
                          fontSize: '0.84rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <strong>{c.conceptTag}</strong>
                          {c.isFlagged && (
                            <span className="badge badge-amber" style={{ fontSize: '0.68rem' }}>
                              Review
                            </span>
                          )}
                        </div>
                        <span style={{ fontWeight: 700 }}>
                          {c.accuracy}% ({c.studentsStrugglingCount} struggling)
                        </span>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${c.accuracy}%`, backgroundColor: barColor }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Assessments */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent Assessments</h2>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onQuickCreateAssessment}
              >
                <PlusCircle size={13} />
                Create
              </button>
            </div>

            {recentAssessments.length === 0 ? (
              <div className="empty-state" style={{ padding: '1.25rem' }}>
                No assessments created yet.
              </div>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Assessment</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Responses</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAssessments.map((asmt) => (
                      <tr key={asmt.id}>
                        <td style={{ fontWeight: 600 }}>{asmt.title}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {asmt.date}
                        </td>
                        <td>{asmt.questions?.length || 0}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => onOpenResponseEntry(asmt.id)}
                          >
                            <Grid size={13} />
                            Enter Responses
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Student Roster Summary */}
      {studentEvaluations.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Student Recommendations</h2>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onNavigate('classes')}
            >
              Manage Roster <ArrowRight size={13} />
            </button>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID / Roll</th>
                  <th>Student</th>
                  <th>Latest Score</th>
                  <th>Learning Path</th>
                  <th>Reason</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {studentEvaluations.map(({ student, latestEvaluation }) => (
                  <tr key={student.id}>
                    <td style={{ fontWeight: 600 }}>{student.rollNo}</td>
                    <td style={{ fontWeight: 600 }}>{student.name}</td>
                    <td>
                      {latestEvaluation?.hasAnyResponse ? (
                        <strong>{latestEvaluation.scorePercent}%</strong>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <PathBadge path={latestEvaluation?.path} />
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {latestEvaluation?.reasoning}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => onOpenStudentProgress(student.id)}
                      >
                        Progress
                      </button>
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
