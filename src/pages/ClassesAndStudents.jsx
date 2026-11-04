import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Edit3,
  Trash2,
  GraduationCap,
  FolderPlus,
  Search
} from 'lucide-react';
import PathBadge from '../components/PathBadge';
import ConfirmModal from '../components/ConfirmModal';

const GRADES = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
const SUBJECTS = ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi'];

export default function ClassesAndStudents({
  classes,
  activeClass,
  allStudents,
  classStudents,
  classInsights,
  onSelectClass,
  onSaveClass,
  onDeleteClass,
  onSaveStudent,
  onDeleteStudent,
  onOpenStudentProgress
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Class Form State
  const [showClassForm, setShowClassForm] = useState(classes.length === 0);
  const [editingClassId, setEditingClassId] = useState(null);
  const [className, setClassName] = useState('');
  const [classGrade, setClassGrade] = useState('Class 7');
  const [classSubject, setClassSubject] = useState('Mathematics');
  const [classError, setClassError] = useState('');

  // Student Form State
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [studentClassId, setStudentClassId] = useState(activeClass?.id || '');
  const [rollNo, setRollNo] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentNotes, setStudentNotes] = useState('');
  const [studentError, setStudentError] = useState('');

  const [confirmTarget, setConfirmTarget] = useState(null);

  useEffect(() => {
    if (activeClass?.id && !editingStudentId) {
      setStudentClassId(activeClass.id);
    }
  }, [activeClass?.id, editingStudentId]);

  const openNewClassForm = () => {
    setEditingClassId(null);
    setClassName('');
    setClassGrade('Class 7');
    setClassSubject('Mathematics');
    setClassError('');
    setShowClassForm(true);
  };

  const openEditClassForm = (cls) => {
    setEditingClassId(cls.id);
    setClassName(cls.name);
    setClassGrade(cls.grade || 'Class 7');
    setClassSubject(cls.subject || 'Mathematics');
    setClassError('');
    setShowClassForm(true);
  };

  const handleClassSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = className.trim();
    if (!trimmedName) {
      setClassError('Class name is required.');
      return;
    }

    const newClassObj = {
      id: editingClassId || `class_${Date.now()}`,
      name: trimmedName,
      grade: classGrade,
      subject: classSubject,
      academicYear: '2026–27',
      isDemo: false
    };

    await onSaveClass(newClassObj);
    onSelectClass(newClassObj.id);
    setShowClassForm(false);
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    const targetClassId = studentClassId || activeClass?.id;
    if (!targetClassId) {
      setStudentError('Create and select a class first.');
      return;
    }

    const trimmedRoll = rollNo.trim();
    const trimmedName = studentName.trim();

    if (!trimmedRoll || !trimmedName) {
      setStudentError('Student ID/Roll No and Name are required.');
      return;
    }

    const targetRoster = (allStudents || classStudents).filter(
      (s) => s.classId === targetClassId
    );
    const duplicate = targetRoster.find(
      (s) =>
        s.rollNo.toLowerCase() === trimmedRoll.toLowerCase() &&
        s.id !== editingStudentId
    );
    if (duplicate) {
      setStudentError(`ID "${trimmedRoll}" is already assigned to ${duplicate.name}.`);
      return;
    }

    const studentObj = {
      id: editingStudentId || `stu_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      classId: targetClassId,
      rollNo: trimmedRoll,
      name: trimmedName,
      notes: studentNotes.trim(),
      isDemo: false
    };

    await onSaveStudent(studentObj);
    if (targetClassId !== activeClass?.id) {
      onSelectClass(targetClassId);
    }
    setEditingStudentId(null);
    setRollNo('');
    setStudentName('');
    setStudentNotes('');
    setStudentError('');
  };

  const startEditStudent = (stu) => {
    setEditingStudentId(stu.id);
    setStudentClassId(stu.classId);
    setRollNo(stu.rollNo);
    setStudentName(stu.name);
    setStudentNotes(stu.notes || '');
    setStudentError('');
  };

  const cancelEditStudent = () => {
    setEditingStudentId(null);
    setStudentClassId(activeClass?.id || '');
    setRollNo('');
    setStudentName('');
    setStudentNotes('');
    setStudentError('');
  };

  const evalMap = new Map();
  (classInsights?.studentEvaluations || []).forEach((se) => {
    evalMap.set(se.student.id, se);
  });

  const filteredStudents = classStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.notes || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Classes & Students</h1>
          <p className="page-subtitle">Grades 6–10 class and student management</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openNewClassForm}>
          <FolderPlus size={15} />
          New Class
        </button>
      </div>

      {/* Create / Edit Class Form */}
      {showClassForm && (
        <div
          className="card"
          style={{ marginBottom: '1.25rem', border: '1.5px solid var(--primary-navy)' }}
        >
          <div className="card-header">
            <h2 className="card-title">{editingClassId ? 'Edit Class' : 'Create Class'}</h2>
          </div>
          <form onSubmit={handleClassSubmit}>
            {classError && (
              <div className="callout callout-amber" style={{ padding: '0.55rem 0.85rem' }}>
                {classError}
              </div>
            )}
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label" htmlFor="class-name-input">
                  Class Name *
                </label>
                <input
                  id="class-name-input"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Class 7A"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="class-grade-select">
                  Grade *
                </label>
                <select
                  id="class-grade-select"
                  className="form-select"
                  value={classGrade}
                  onChange={(e) => setClassGrade(e.target.value)}
                >
                  {GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="class-subject-select">
                  Subject *
                </label>
                <select
                  id="class-subject-select"
                  className="form-select"
                  value={classSubject}
                  onChange={(e) => setClassSubject(e.target.value)}
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowClassForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingClassId ? 'Update Class' : 'Save Class'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Class Cards */}
      {classes.length > 0 && (
        <div className="grid-3" style={{ marginBottom: '1.25rem' }}>
          {classes.map((cls) => {
            const isSelected = cls.id === activeClass?.id;
            const count = (allStudents || []).filter((s) => s.classId === cls.id).length;
            return (
              <div
                key={cls.id}
                className="card"
                style={{
                  borderColor: isSelected ? 'var(--primary-navy)' : 'var(--border-color)',
                  borderWidth: isSelected ? '2px' : '1px',
                  background: isSelected ? '#f8fafc' : 'var(--bg-surface)',
                  cursor: 'pointer'
                }}
                onClick={() => onSelectClass(cls.id)}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}
                >
                  <div>
                    <span className="badge badge-navy" style={{ marginBottom: '0.35rem' }}>
                      {cls.grade} • {cls.subject}
                    </span>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{cls.name}</h3>
                    <div
                      style={{
                        fontSize: '0.76rem',
                        color: 'var(--text-muted)',
                        marginTop: '0.2rem'
                      }}
                    >
                      {count} student{count === 1 ? '' : 's'}
                    </div>
                  </div>
                  <div
                    style={{ display: 'flex', gap: '0.25rem' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => openEditClassForm(cls)}
                      title="Edit Class"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        setConfirmTarget({
                          type: 'class',
                          id: cls.id,
                          title: `Delete "${cls.name}"?`,
                          message:
                            'This removes the class, its students, and its assessments.'
                        })
                      }
                      title="Delete Class"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Student Management */}
      {activeClass ? (
        <div className="grid-2" style={{ gridTemplateColumns: '1fr 2fr', alignItems: 'start' }}>
          {/* Add / Edit Student Form */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <Plus size={17} color="#1e3a8a" />
                {editingStudentId ? 'Edit Student' : 'Add Student'}
              </h2>
            </div>

            <form onSubmit={handleStudentSubmit}>
              {studentError && (
                <div
                  className="callout callout-amber"
                  style={{ padding: '0.55rem 0.8rem', fontSize: '0.82rem' }}
                >
                  {studentError}
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="stu-class-select">
                  Class *
                </label>
                <select
                  id="stu-class-select"
                  className="form-select"
                  value={studentClassId || activeClass.id}
                  onChange={(e) => setStudentClassId(e.target.value)}
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.grade})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="stu-roll-input">
                  Student ID / Roll No *
                </label>
                <input
                  id="stu-roll-input"
                  type="text"
                  className="form-input"
                  placeholder="e.g., 7A-01"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="stu-name-input">
                  Student Name *
                </label>
                <input
                  id="stu-name-input"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Aarav Sharma"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="stu-notes-input">
                  Notes (Optional)
                </label>
                <input
                  id="stu-notes-input"
                  type="text"
                  className="form-input"
                  placeholder="Optional observation"
                  value={studentNotes}
                  onChange={(e) => setStudentNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingStudentId ? 'Save Changes' : 'Add Student'}
                </button>
                {editingStudentId && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={cancelEditStudent}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Student List */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <Users size={17} color="#1e3a8a" />
                {activeClass.name} Students ({classStudents.length})
              </h2>
              <div style={{ position: 'relative', minWidth: '200px' }}>
                <Search
                  size={14}
                  style={{
                    position: 'absolute',
                    left: '0.6rem',
                    top: '0.6rem',
                    color: 'var(--text-muted)'
                  }}
                />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '1.85rem', width: '100%' }}
                  placeholder="Search ID or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="empty-state">No students in {activeClass.name}.</div>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID / Roll</th>
                      <th>Name</th>
                      <th>Latest Score</th>
                      <th>Learning Path</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((stu) => {
                      const se = evalMap.get(stu.id);
                      const latestScore = se?.latestEvaluation?.hasAnyResponse
                        ? se.latestEvaluation.scorePercent
                        : null;
                      const currentPath = se?.latestEvaluation?.path;

                      return (
                        <tr key={stu.id}>
                          <td style={{ fontWeight: 700 }}>{stu.rollNo}</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{stu.name}</div>
                            {stu.notes && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {stu.notes}
                              </div>
                            )}
                          </td>
                          <td>
                            {latestScore !== null ? (
                              <strong>{latestScore}%</strong>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>—</span>
                            )}
                          </td>
                          <td>
                            <PathBadge path={currentPath} />
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => onOpenStudentProgress(stu.id)}
                                title="Student Progress"
                              >
                                <GraduationCap size={13} />
                                Progress
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => startEditStudent(stu)}
                                title="Edit Student"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() =>
                                  setConfirmTarget({
                                    type: 'student',
                                    id: stu.id,
                                    title: `Remove ${stu.name}?`,
                                    message: `Remove ${stu.name} (${stu.rollNo}) and their recorded responses?`
                                  })
                                }
                                title="Remove Student"
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
        </div>
      ) : (
        <div className="empty-state">Create a class above to start adding students.</div>
      )}

      <ConfirmModal
        isOpen={Boolean(confirmTarget)}
        title={confirmTarget?.title}
        message={confirmTarget?.message}
        confirmLabel="Remove"
        onCancel={() => setConfirmTarget(null)}
        onConfirm={async () => {
          if (confirmTarget.type === 'class') {
            await onDeleteClass(confirmTarget.id);
          } else if (confirmTarget.type === 'student') {
            await onDeleteStudent(confirmTarget.id);
          }
          setConfirmTarget(null);
        }}
      />
    </div>
  );
}
