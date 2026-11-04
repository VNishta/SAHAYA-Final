/**
 * SAHAYA — Supabase Cloud Persistence & Authentication Client
 *
 * Uses official Supabase Auth & PostgREST endpoints when VITE_SUPABASE_URL
 * and VITE_SUPABASE_ANON_KEY are configured in the environment.
 * Never invents credentials or fakes cloud connectivity when unconfigured.
 */

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/\/$/, '');
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
const SESSION_STORAGE_KEY = 'sahaya_supabase_session';

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL.startsWith('http'));
}

export function getStoredSession() {
  if (!isSupabaseConfigured()) return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session?.access_token || !session?.user?.id) return null;
    return session;
  } catch {
    return null;
  }
}

function setStoredSession(session) {
  if (!session) {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

function getHeaders(accessToken, extra = {}) {
  const token = accessToken || getStoredSession()?.access_token || SUPABASE_ANON_KEY;
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...extra
  };
}

export async function supabaseSignUp(email, password, fullName = '') {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase environment variables are not configured.');
  }
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: getHeaders(SUPABASE_ANON_KEY),
    body: JSON.stringify({
      email,
      password,
      data: { full_name: fullName }
    })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.msg || data.error_description || data.message || 'Sign up failed.');
  }
  if (data.access_token && data.user) {
    setStoredSession(data);
  }
  return data;
}

export async function supabaseSignIn(email, password) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase environment variables are not configured.');
  }
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: getHeaders(SUPABASE_ANON_KEY),
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || data.msg || data.message || 'Invalid credentials.');
  }
  setStoredSession(data);
  return data;
}

export async function supabaseSignOut() {
  const session = getStoredSession();
  if (session?.access_token && isSupabaseConfigured()) {
    try {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: getHeaders(session.access_token)
      });
    } catch {
      // Ignore network error on logout
    }
  }
  setStoredSession(null);
}

async function restRequest(path, options = {}) {
  const session = getStoredSession();
  if (!session?.access_token) {
    throw new Error('Not authenticated with Supabase.');
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: getHeaders(session.access_token, options.headers || {})
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Supabase error (${res.status}): ${errText}`);
  }
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function fetchAllFromSupabase(defaultSettings) {
  const session = getStoredSession();
  if (!session?.user?.id) {
    throw new Error('No authenticated teacher session.');
  }

  const [classRows, studentRows, asmtRows, questionRows, responseRows, settingsRows] =
    await Promise.all([
      restRequest('classes?select=*&order=name.asc'),
      restRequest('students?select=*&order=roll_no.asc'),
      restRequest('assessments?select=*&order=assessment_date.asc'),
      restRequest('questions?select=*&order=question_order.asc'),
      restRequest('response_records?select=*'),
      restRequest('app_settings?select=*&limit=1')
    ]);

  const questionsByAsmt = new Map();
  (questionRows || []).forEach((q) => {
    if (!questionsByAsmt.has(q.assessment_id)) {
      questionsByAsmt.set(q.assessment_id, []);
    }
    questionsByAsmt.get(q.assessment_id).push({
      id: q.id,
      text: q.question_text,
      options: Array.isArray(q.options) ? q.options : [],
      correctOptionIndex: Number(q.correct_option_index ?? 0),
      conceptTag: q.concept_tag,
      isFundamental: Boolean(q.is_fundamental)
    });
  });

  const classes = (classRows || []).map((c) => ({
    id: c.id,
    name: c.name,
    grade: c.grade,
    subject: c.subject,
    academicYear: c.academic_year || '2026–27',
    createdAt: c.created_at,
    updatedAt: c.updated_at
  }));

  const students = (studentRows || []).map((s) => ({
    id: s.id,
    classId: s.class_id,
    rollNo: s.roll_no,
    name: s.name,
    notes: s.notes || '',
    createdAt: s.created_at,
    updatedAt: s.updated_at
  }));

  const assessments = (asmtRows || []).map((a) => ({
    id: a.id,
    classId: a.class_id,
    title: a.title,
    grade: a.grade,
    subject: a.subject,
    topic: a.topic || '',
    date: a.assessment_date,
    status: a.status || 'saved',
    questions: questionsByAsmt.get(a.id) || [],
    createdAt: a.created_at,
    updatedAt: a.updated_at
  }));

  const responses = (responseRows || []).map((r) => ({
    id: r.id,
    assessmentId: r.assessment_id,
    studentId: r.student_id,
    answers: r.answers || {},
    updatedAt: r.updated_at
  }));

  const sRow = (settingsRows || [])[0];
  const settings = sRow
    ? {
        id: 'global_settings',
        relearnThreshold: sRow.relearn_threshold,
        practiseThreshold: sRow.practise_threshold,
        classConceptFlagThreshold: sRow.class_concept_flag_threshold,
        minQuestionsForConceptConfidence: sRow.min_questions_for_confidence,
        activeClassId: sRow.active_class_id || classes[0]?.id || '',
        aiProxyUrl: sRow.ai_proxy_url || import.meta.env.VITE_AI_PROXY_URL || ''
      }
    : {
        ...defaultSettings,
        activeClassId: classes[0]?.id || ''
      };

  return { classes, students, assessments, responses, settings };
}

export async function upsertClassInSupabase(cls) {
  const teacherId = getStoredSession().user.id;
  await restRequest('classes', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({
      id: cls.id,
      teacher_id: teacherId,
      name: cls.name,
      grade: cls.grade,
      subject: cls.subject,
      academic_year: cls.academicYear || '2026–27'
    })
  });
}

export async function deleteClassInSupabase(classId) {
  await restRequest(`classes?id=eq.${encodeURIComponent(classId)}`, {
    method: 'DELETE'
  });
}

export async function upsertStudentInSupabase(stu) {
  const teacherId = getStoredSession().user.id;
  await restRequest('students', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({
      id: stu.id,
      teacher_id: teacherId,
      class_id: stu.classId,
      roll_no: stu.rollNo,
      name: stu.name,
      notes: stu.notes || ''
    })
  });
}

export async function deleteStudentInSupabase(studentId) {
  await restRequest(`students?id=eq.${encodeURIComponent(studentId)}`, {
    method: 'DELETE'
  });
}

export async function upsertAssessmentInSupabase(asmt) {
  const teacherId = getStoredSession().user.id;
  await restRequest('assessments', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({
      id: asmt.id,
      teacher_id: teacherId,
      class_id: asmt.classId,
      title: asmt.title,
      grade: asmt.grade,
      subject: asmt.subject,
      topic: asmt.topic || '',
      assessment_date: asmt.date,
      status: asmt.status || 'saved'
    })
  });

  // Replace questions for this assessment
  await restRequest(`questions?assessment_id=eq.${encodeURIComponent(asmt.id)}`, {
    method: 'DELETE'
  });

  const qRows = (asmt.questions || []).map((q, idx) => ({
    id: q.id,
    teacher_id: teacherId,
    assessment_id: asmt.id,
    question_order: idx,
    question_text: q.text,
    options: q.options || [],
    correct_option_index: Number(q.correctOptionIndex ?? 0),
    concept_tag: q.conceptTag,
    is_fundamental: Boolean(q.isFundamental)
  }));

  if (qRows.length > 0) {
    await restRequest('questions', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify(qRows)
    });
  }
}

export async function deleteAssessmentInSupabase(assessmentId) {
  await restRequest(`assessments?id=eq.${encodeURIComponent(assessmentId)}`, {
    method: 'DELETE'
  });
}

export async function upsertResponsesInSupabase(records) {
  const teacherId = getStoredSession().user.id;
  const rows = records.map((r) => ({
    id: r.id,
    teacher_id: teacherId,
    assessment_id: r.assessmentId,
    student_id: r.studentId,
    answers: r.answers || {}
  }));
  if (rows.length > 0) {
    await restRequest('response_records', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify(rows)
    });
  }
}

export async function upsertSettingsInSupabase(settings) {
  const teacherId = getStoredSession().user.id;
  await restRequest('app_settings', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({
      id: `settings_${teacherId}`,
      teacher_id: teacherId,
      relearn_threshold: Number(settings.relearnThreshold ?? 50),
      practise_threshold: Number(settings.practiseThreshold ?? 80),
      class_concept_flag_threshold: Number(settings.classConceptFlagThreshold ?? 65),
      min_questions_for_confidence: Number(settings.minQuestionsForConceptConfidence ?? 2),
      active_class_id: settings.activeClassId || null,
      ai_proxy_url: settings.aiProxyUrl || ''
    })
  });
}
