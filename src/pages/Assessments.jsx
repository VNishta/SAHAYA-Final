import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Grid,
  CheckCircle2,
  AlertCircle,
  Printer
} from 'lucide-react';
import { SUGGESTED_CONCEPT_TAGS } from '../data/demoData';
import ConfirmModal from '../components/ConfirmModal';

const GRADES = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
const SUBJECTS = ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi'];

function createBlankQuestion(index) {
  return {
    id: `q_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 6)}`,
    text: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0,
    conceptTag: '',
    isFundamental: index === 0
  };
}

export default function Assessments({
  classes,
  activeClass,
  classAssessments,
  allAssessments,
  initialCreateMode = false,
  prefillAssessmentDraft = null,
  onClearPrefill,
  onSelectClass,
  onSaveAssessment,
  onDeleteAssessment,
  onOpenResponseEntry
}) {
  const [isFormOpen, setIsFormOpen] = useState(initialCreateMode);
  const [editingId, setEditingId] = useState(null);
  const [targetClassId, setTargetClassId] = useState(activeClass?.id || '');
  const [title, setTitle] = useState('');
  const [grade, setGrade] = useState(activeClass?.grade || 'Class 7');
  const [subject, setSubject] = useState(activeClass?.subject || 'Mathematics');
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [questions, setQuestions] = useState([
    createBlankQuestion(0),
    createBlankQuestion(1),
    createBlankQuestion(2)
  ]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [previewPaperAsmt, setPreviewPaperAsmt] = useState(null);

  useEffect(() => {
    if (activeClass?.id && !editingId) {
      setTargetClassId(activeClass.id);
      setGrade(activeClass.grade || 'Class 7');
      setSubject(activeClass.subject || 'Mathematics');
    }
  }, [activeClass?.id, editingId]);

  useEffect(() => {
    if (prefillAssessmentDraft) {
      setEditingId(null);
      setTargetClassId(activeClass?.id || classes[0]?.id || '');
      setTitle(prefillAssessmentDraft.title || '');
      setGrade(prefillAssessmentDraft.grade || activeClass?.grade || 'Class 7');
      setSubject(prefillAssessmentDraft.subject || activeClass?.subject || 'Mathematics');
      setTopic(prefillAssessmentDraft.topic || '');
      setDate(new Date().toISOString().slice(0, 10));
      setQuestions(
        (prefillAssessmentDraft.questions || []).map((q, idx) => ({
          ...q,
          id: `q_${Date.now()}_${idx}`
        }))
      );
      setValidationErrors([]);
      setIsFormOpen(true);
      if (onClearPrefill) onClearPrefill();
    } else if (initialCreateMode) {
      startNewAssessment();
      if (onClearPrefill) onClearPrefill();
    }
  }, [initialCreateMode, prefillAssessmentDraft]);

  const startNewAssessment = () => {
    setEditingId(null);
    setTargetClassId(activeClass?.id || classes[0]?.id || '');
    setTitle('');
    setGrade(activeClass?.grade || 'Class 7');
    setSubject(activeClass?.subject || 'Mathematics');
    setTopic('');
    setDate(new Date().toISOString().slice(0, 10));
    setQuestions([
      createBlankQuestion(0),
      createBlankQuestion(1),
      createBlankQuestion(2)
    ]);
    setValidationErrors([]);
    setIsFormOpen(true);
  };

  const startEditAssessment = (asmt) => {
    setEditingId(asmt.id);
    setTargetClassId(asmt.classId || activeClass?.id || '');
    setTitle(asmt.title);
    setGrade(asmt.grade || activeClass?.grade || 'Class 7');
    setSubject(asmt.subject || activeClass?.subject || 'Mathematics');
    setTopic(asmt.topic || '');
    setDate(asmt.date || new Date().toISOString().slice(0, 10));
    setQuestions(
      (asmt.questions || []).map((q) => ({
        ...q,
        options: [...(q.options || ['', '', '', ''])]
      }))
    );
    setValidationErrors([]);
    setIsFormOpen(true);
  };

  const handleDuplicateForReuse = (asmt) => {
    setEditingId(null);
    setTargetClassId(activeClass?.id || asmt.classId || '');
    setTitle(`${asmt.title.replace(' (Sample)', '')} (Copy)`);
    setGrade(activeClass?.grade || asmt.grade || 'Class 7');
    setSubject(activeClass?.subject || asmt.subject || 'Mathematics');
    setTopic(asmt.topic || '');
    setDate(new Date().toISOString().slice(0, 10));
    setQuestions(
      (asmt.questions || []).map((q, idx) => ({
        ...q,
        id: `q_${Date.now()}_${idx}`,
        options: [...(q.options || ['', '', '', ''])]
      }))
    );
    setValidationErrors([]);
    setIsFormOpen(true);
  };

  const handleClassSelectChange = (clsId) => {
    setTargetClassId(clsId);
    const chosen = classes.find((c) => c.id === clsId);
    if (chosen) {
      setGrade(chosen.grade);
      setSubject(chosen.subject);
    }
  };

  const updateQuestionField = (index, field, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  const updateQuestionOption = (qIndex, optIndex, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const nextOpts = [...q.options];
        nextOpts[optIndex] = value;
        return { ...q, options: nextOpts };
      })
    );
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, createBlankQuestion(prev.length)]);
  };

  const removeQuestion = (index) => {
    if (questions.length <= 1) {
      setValidationErrors(['An assessment requires at least 1 question.']);
      return;
    }
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const validateAndSave = async (e, openGridAfterSave = false) => {
    e.preventDefault();
    const errors = [];

    const selectedClsId = targetClassId || activeClass?.id;
    if (!selectedClsId) {
      errors.push('Select or create a class before saving.');
    }
    if (!title.trim()) {
      errors.push('Assessment title is required.');
    }
    if (questions.length < 1) {
      errors.push('Add at least 1 question.');
    }

    questions.forEach((q, idx) => {
      const qNum = idx + 1;
      if (!q.text.trim()) {
        errors.push(`Question ${qNum}: Question text is required.`);
      }
      if (!q.conceptTag.trim()) {
        errors.push(`Question ${qNum}: Concept tag is required.`);
      }
      const nonEmptyOptions = q.options.filter((opt) => opt.trim().length > 0);
      if (nonEmptyOptions.length < 2) {
        errors.push(`Question ${qNum}: Provide at least 2 answer options.`);
      }
      if (
        q.correctOptionIndex === undefined ||
        q.correctOptionIndex === null ||
        !q.options[q.correctOptionIndex]?.trim()
      ) {
        errors.push(`Question ${qNum}: Selected correct answer option cannot be empty.`);
      }
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    const assessmentRecord = {
      id: editingId || `asmt_${Date.now()}`,
      classId: selectedClsId,
      title: title.trim(),
      grade,
      subject,
      topic: topic.trim() || subject,
      date,
      status: 'saved',
      isDemo: false,
      questions: questions.map((q) => ({
        ...q,
        text: q.text.trim(),
        conceptTag: q.conceptTag.trim(),
        options: q.options.map((o) => o.trim())
      }))
    };

    if (selectedClsId !== activeClass?.id && onSelectClass) {
      await onSelectClass(selectedClsId);
    }

    await onSaveAssessment(assessmentRecord, !editingId);
    setValidationErrors([]);
    setIsFormOpen(false);

    if (openGridAfterSave) {
      onOpenResponseEntry(assessmentRecord.id);
    }
  };

  const suggestedTags =
    SUGGESTED_CONCEPT_TAGS[subject] || SUGGESTED_CONCEPT_TAGS.Mathematics;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Assessments</h1>
          <p className="page-subtitle">Create concept-tagged paper assessments</p>
        </div>
        {!isFormOpen && (
          <button type="button" className="btn btn-primary" onClick={startNewAssessment}>
            <Plus size={15} />
            Create Assessment
          </button>
        )}
      </div>

      {/* Assessment Builder Form */}
      {isFormOpen && (
        <div
          className="card"
          style={{ marginBottom: '1.5rem', border: '1.5px solid var(--primary-navy)' }}
        >
          <div className="card-header">
            <h2 className="card-title">
              <FileCheck2 size={18} color="#1e3a8a" />
              {editingId ? 'Edit Assessment' : 'New Assessment'}
            </h2>
          </div>

          {validationErrors.length > 0 && (
            <div className="callout callout-amber">
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
              <ul style={{ paddingLeft: '1.1rem', fontSize: '0.84rem' }}>
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={(e) => validateAndSave(e, false)}>
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label" htmlFor="asmt-title-input">
                  Assessment Title *
                </label>
                <input
                  id="asmt-title-input"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Fractions Quiz 1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="asmt-class-select">
                  Class *
                </label>
                <select
                  id="asmt-class-select"
                  className="form-select"
                  value={targetClassId}
                  onChange={(e) => handleClassSelectChange(e.target.value)}
                >
                  {classes.length === 0 && <option value="">No class available</option>}
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.grade})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="asmt-topic-input">
                  Topic
                </label>
                <input
                  id="asmt-topic-input"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Fractions"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Grade *</label>
                <select
                  className="form-select"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                >
                  {GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Subject *</label>
                <select
                  className="form-select"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <datalist id="concept-tag-suggestions">
              {suggestedTags.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>

            {/* Questions List */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                marginBottom: '1.1rem'
              }}
            >
              {questions.map((q, qIdx) => (
                <div
                  key={q.id}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid var(--border-strong)',
                    borderRadius: '8px',
                    padding: '0.95rem'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.65rem',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span className="badge badge-navy">Q{qIdx + 1}</span>
                      <label
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          color: 'var(--text-secondary)',
                          fontWeight: 500
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(q.isFundamental)}
                          onChange={(e) =>
                            updateQuestionField(qIdx, 'isFundamental', e.target.checked)
                          }
                        />
                        Fundamental / Prerequisite Concept
                      </label>
                    </div>

                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => removeQuestion(qIdx)}
                      title="Delete question"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </div>

                  <div className="grid-2" style={{ gridTemplateColumns: '2fr 1fr' }}>
                    <div className="form-group">
                      <label className="form-label">Question Text *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder={`Question ${qIdx + 1}`}
                        value={q.text}
                        onChange={(e) => updateQuestionField(qIdx, 'text', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Concept Tag *</label>
                      <input
                        type="text"
                        list="concept-tag-suggestions"
                        className="form-input"
                        placeholder="e.g., Equivalent Fractions"
                        value={q.conceptTag}
                        onChange={(e) =>
                          updateQuestionField(qIdx, 'conceptTag', e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <div className="form-label" style={{ marginBottom: '0.35rem' }}>
                      Options (Select radio button for Correct Answer) *
                    </div>
                    <div className="grid-2" style={{ gap: '0.55rem' }}>
                      {q.options.map((optText, optIdx) => {
                        const optionLetter = String.fromCharCode(65 + optIdx);
                        const isCorrect = Number(q.correctOptionIndex) === optIdx;
                        return (
                          <div
                            key={optIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.45rem',
                              padding: '0.35rem 0.6rem',
                              borderRadius: '6px',
                              background: isCorrect ? '#dcfce7' : '#ffffff',
                              border: `1px solid ${
                                isCorrect ? '#22c55e' : 'var(--border-color)'
                              }`
                            }}
                          >
                            <input
                              type="radio"
                              name={`correct_opt_${q.id}`}
                              checked={isCorrect}
                              onChange={() =>
                                updateQuestionField(qIdx, 'correctOptionIndex', optIdx)
                              }
                              title={`Mark Option ${optionLetter} as correct`}
                            />
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: '0.82rem',
                                minWidth: '16px'
                              }}
                            >
                              {optionLetter}.
                            </span>
                            <input
                              type="text"
                              className="form-input"
                              style={{ flex: 1, padding: '0.35rem 0.55rem' }}
                              placeholder={`Option ${optionLetter}`}
                              value={optText}
                              onChange={(e) =>
                                updateQuestionOption(qIdx, optIdx, e.target.value)
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.6rem'
              }}
            >
              <button type="button" className="btn btn-secondary" onClick={addQuestion}>
                <Plus size={14} />
                Add Question ({questions.length})
              </button>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsFormOpen(false);
                    setValidationErrors([]);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-blue">
                  Save Assessment
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={(e) => validateAndSave(e, true)}
                >
                  <CheckCircle2 size={14} />
                  Save & Enter Responses
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Printable Question Sheet Modal */}
      {previewPaperAsmt && (
        <div className="modal-backdrop" onClick={() => setPreviewPaperAsmt(null)}>
          <div
            className="modal-box"
            style={{ maxWidth: '680px', maxHeight: '85vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.85rem'
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  {previewPaperAsmt.title}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {previewPaperAsmt.grade} • {previewPaperAsmt.subject}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => window.print()}
              >
                <Printer size={14} />
                Print
              </button>
            </div>

            <div
              style={{
                padding: '0.5rem 0.75rem',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                marginBottom: '0.85rem',
                fontSize: '0.82rem',
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <span>Name: ________________________</span>
              <span>Roll No: ________</span>
              <span>Date: {previewPaperAsmt.date}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(previewPaperAsmt.questions || []).map((q, idx) => (
                <div
                  key={q.id}
                  style={{
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.35rem'
                    }}
                  >
                    <strong>
                      Q{idx + 1}. {q.text}
                    </strong>
                    <span className="badge badge-slate">{q.conceptTag}</span>
                  </div>
                  <div
                    className="grid-2"
                    style={{ gap: '0.35rem', fontSize: '0.84rem', marginTop: '0.35rem' }}
                  >
                    {(q.options || []).map((opt, oIdx) => {
                      const letter = String.fromCharCode(65 + oIdx);
                      const isKey = Number(q.correctOptionIndex) === oIdx;
                      return (
                        <div key={oIdx}>
                          ({letter}) {opt}{' '}
                          {isKey && (
                            <span
                              style={{
                                color: '#0f766e',
                                fontWeight: 700,
                                fontSize: '0.72rem'
                              }}
                            >
                              [Key]
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setPreviewPaperAsmt(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assessments Table */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-header">
          <h2 className="card-title">
            {activeClass ? `${activeClass.name} Assessments` : 'Assessments'} (
            {classAssessments.length})
          </h2>
        </div>

        {classAssessments.length === 0 ? (
          <div className="empty-state">
            <p style={{ marginBottom: '0.75rem' }}>No assessments saved for this class.</p>
            <button type="button" className="btn btn-primary" onClick={startNewAssessment}>
              <Plus size={14} />
              Create Assessment
            </button>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Items & Concepts</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {classAssessments.map((asmt) => {
                  const uniqueTags = Array.from(
                    new Set((asmt.questions || []).map((q) => q.conceptTag))
                  );
                  return (
                    <tr key={asmt.id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{asmt.title}</div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          {asmt.grade} • {asmt.subject}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>{asmt.date}</td>
                      <td>
                        <div
                          style={{
                            display: 'flex',
                            gap: '0.3rem',
                            flexWrap: 'wrap',
                            alignItems: 'center'
                          }}
                        >
                          <span className="badge badge-slate">
                            {asmt.questions?.length || 0} Qs
                          </span>
                          {uniqueTags.map((tag) => (
                            <span key={tag} className="badge badge-blue">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => onOpenResponseEntry(asmt.id)}
                          >
                            <Grid size={13} />
                            Responses
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => setPreviewPaperAsmt(asmt)}
                            title="Printable Sheet"
                          >
                            <Printer size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => startEditAssessment(asmt)}
                            title="Edit"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleDuplicateForReuse(asmt)}
                            title="Duplicate"
                          >
                            <Copy size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => setDeleteTarget(asmt)}
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title={`Delete "${deleteTarget?.title}"?`}
        message="This will remove the assessment and its recorded student responses."
        confirmLabel="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          await onDeleteAssessment(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
