import {
  DEFAULT_SETTINGS,
  DEMO_CLASSES,
  DEMO_STUDENTS,
  DEMO_ASSESSMENTS,
  DEMO_RESPONSES
} from '../data/demoData';

const DB_NAME = 'sahaya_adaptive_db';
const DB_VERSION = 2;

const STORES = {
  CLASSES: 'classes',
  STUDENTS: 'students',
  ASSESSMENTS: 'assessments',
  QUESTIONS: 'questions',
  RESPONSES: 'responses',
  SETTINGS: 'settings'
};

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORES.CLASSES)) {
        db.createObjectStore(STORES.CLASSES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.STUDENTS)) {
        const studentStore = db.createObjectStore(STORES.STUDENTS, { keyPath: 'id' });
        studentStore.createIndex('classId', 'classId', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.ASSESSMENTS)) {
        const asmtStore = db.createObjectStore(STORES.ASSESSMENTS, { keyPath: 'id' });
        asmtStore.createIndex('classId', 'classId', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.QUESTIONS)) {
        const qStore = db.createObjectStore(STORES.QUESTIONS, { keyPath: 'id' });
        qStore.createIndex('assessmentId', 'assessmentId', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.RESPONSES)) {
        const respStore = db.createObjectStore(STORES.RESPONSES, { keyPath: 'id' });
        respStore.createIndex('assessmentId', 'assessmentId', { unique: false });
        respStore.createIndex('studentId', 'studentId', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAllFromStore(storeName) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function putInStore(storeName, item) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.put(item);
    req.onsuccess = () => resolve(item);
    req.onerror = () => reject(req.error);
  });
}

async function deleteFromStore(storeName, id) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.delete(id);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

async function clearStore(storeName) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.clear();
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Initializes IndexedDB without auto-seeding fabricated demo data.
 * Also removes legacy auto-seeded demo records unless explicitly loaded by the developer seed tool,
 * while strictly preserving all real teacher-created records.
 */
export async function initializeAndLoadAllData() {
  const existingSettingsArr = await getAllFromStore(STORES.SETTINGS);
  const currentSettings = existingSettingsArr.find((s) => s.id === 'global_settings');

  // If no settings exist yet, initialize clean default settings (empty workspace, no fake data)
  if (!currentSettings) {
    await putInStore(STORES.SETTINGS, {
      ...DEFAULT_SETTINGS,
      activeClassId: '',
      devSeedExplicitlyLoaded: false
    });
  }

  // Clean up legacy auto-seeded demo records if devSeedExplicitlyLoaded is not true
  if (!currentSettings?.devSeedExplicitlyLoaded) {
    const [classes, students, assessments] = await Promise.all([
      getAllFromStore(STORES.CLASSES),
      getAllFromStore(STORES.STUDENTS),
      getAllFromStore(STORES.ASSESSMENTS)
    ]);

    const demoClassIds = new Set(classes.filter((c) => c.isDemo).map((c) => c.id));
    const demoStudentIds = new Set(students.filter((s) => s.isDemo).map((s) => s.id));
    const demoAsmtIds = new Set(assessments.filter((a) => a.isDemo).map((a) => a.id));

    if (demoClassIds.size > 0 || demoStudentIds.size > 0 || demoAsmtIds.size > 0) {
      const responses = await getAllFromStore(STORES.RESPONSES);
      for (const cId of demoClassIds) await deleteFromStore(STORES.CLASSES, cId);
      for (const sId of demoStudentIds) await deleteFromStore(STORES.STUDENTS, sId);
      for (const aId of demoAsmtIds) await deleteFromStore(STORES.ASSESSMENTS, aId);
      for (const r of responses) {
        if (demoAsmtIds.has(r.assessmentId) || demoStudentIds.has(r.studentId)) {
          await deleteFromStore(STORES.RESPONSES, r.id);
        }
      }
      if (currentSettings && demoClassIds.has(currentSettings.activeClassId)) {
        const remainingClasses = classes.filter((c) => !c.isDemo);
        await putInStore(STORES.SETTINGS, {
          ...currentSettings,
          activeClassId: remainingClasses[0]?.id || '',
          devSeedExplicitlyLoaded: false
        });
      }
    }
  }

  return fetchAllAppState();
}

export async function fetchAllAppState() {
  const [classes, students, assessments, questionsStore, responses, settingsArr] =
    await Promise.all([
      getAllFromStore(STORES.CLASSES),
      getAllFromStore(STORES.STUDENTS),
      getAllFromStore(STORES.ASSESSMENTS),
      getAllFromStore(STORES.QUESTIONS),
      getAllFromStore(STORES.RESPONSES),
      getAllFromStore(STORES.SETTINGS)
    ]);

  const rawSettings =
    settingsArr.find((s) => s.id === 'global_settings') || {
      ...DEFAULT_SETTINGS,
      activeClassId: ''
    };

  // Merge normalized questions store if assessment doesn't already have inline questions
  const qByAsmt = new Map();
  questionsStore
    .sort((a, b) => (a.questionOrder ?? 0) - (b.questionOrder ?? 0))
    .forEach((q) => {
      if (!qByAsmt.has(q.assessmentId)) qByAsmt.set(q.assessmentId, []);
      qByAsmt.get(q.assessmentId).push(q);
    });

  const hydratedAssessments = assessments.map((a) => ({
    ...a,
    questions:
      Array.isArray(a.questions) && a.questions.length > 0
        ? a.questions
        : qByAsmt.get(a.id) || []
  }));

  classes.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  students.sort((a, b) =>
    (a.rollNo || '').localeCompare(b.rollNo || '', undefined, { numeric: true })
  );
  hydratedAssessments.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  const validActiveClassId = classes.some((c) => c.id === rawSettings.activeClassId)
    ? rawSettings.activeClassId
    : classes[0]?.id || '';

  return {
    classes,
    students,
    assessments: hydratedAssessments,
    responses,
    settings: {
      ...DEFAULT_SETTINGS,
      ...rawSettings,
      activeClassId: validActiveClassId
    }
  };
}

/**
 * Explicitly triggered Development-Only Seed Loader.
 * Never runs automatically on app startup.
 */
export async function resetToDemoData() {
  const db = await openDatabase();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(
      [
        STORES.CLASSES,
        STORES.STUDENTS,
        STORES.ASSESSMENTS,
        STORES.QUESTIONS,
        STORES.RESPONSES,
        STORES.SETTINGS
      ],
      'readwrite'
    );

    const classStore = tx.objectStore(STORES.CLASSES);
    const studentStore = tx.objectStore(STORES.STUDENTS);
    const asmtStore = tx.objectStore(STORES.ASSESSMENTS);
    const qStore = tx.objectStore(STORES.QUESTIONS);
    const respStore = tx.objectStore(STORES.RESPONSES);
    const settingsStore = tx.objectStore(STORES.SETTINGS);

    DEMO_CLASSES.forEach((c) => classStore.put(c));
    DEMO_STUDENTS.forEach((s) => studentStore.put(s));
    DEMO_ASSESSMENTS.forEach((a) => {
      asmtStore.put(a);
      (a.questions || []).forEach((q, idx) => {
        qStore.put({ ...q, assessmentId: a.id, questionOrder: idx });
      });
    });
    DEMO_RESPONSES.forEach((r) => respStore.put(r));
    settingsStore.put({
      ...DEFAULT_SETTINGS,
      activeClassId: DEMO_CLASSES[0].id,
      devSeedExplicitlyLoaded: true
    });

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });

  return fetchAllAppState();
}

export async function clearAllWorkspaceData() {
  await Promise.all([
    clearStore(STORES.CLASSES),
    clearStore(STORES.STUDENTS),
    clearStore(STORES.ASSESSMENTS),
    clearStore(STORES.QUESTIONS),
    clearStore(STORES.RESPONSES)
  ]);
  await putInStore(STORES.SETTINGS, {
    ...DEFAULT_SETTINGS,
    activeClassId: '',
    devSeedExplicitlyLoaded: false
  });
  return fetchAllAppState();
}

export async function importBackupToIndexedDb(backupData) {
  const db = await openDatabase();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(
      [
        STORES.CLASSES,
        STORES.STUDENTS,
        STORES.ASSESSMENTS,
        STORES.QUESTIONS,
        STORES.RESPONSES,
        STORES.SETTINGS
      ],
      'readwrite'
    );

    const classStore = tx.objectStore(STORES.CLASSES);
    const studentStore = tx.objectStore(STORES.STUDENTS);
    const asmtStore = tx.objectStore(STORES.ASSESSMENTS);
    const qStore = tx.objectStore(STORES.QUESTIONS);
    const respStore = tx.objectStore(STORES.RESPONSES);
    const settingsStore = tx.objectStore(STORES.SETTINGS);

    (backupData.classes || []).forEach((c) => classStore.put(c));
    (backupData.students || []).forEach((s) => studentStore.put(s));
    (backupData.assessments || []).forEach((a) => {
      asmtStore.put(a);
      (a.questions || []).forEach((q, idx) => {
        qStore.put({ ...q, assessmentId: a.id, questionOrder: idx });
      });
    });
    (backupData.responses || []).forEach((r) => respStore.put(r));
    if (backupData.settings) {
      settingsStore.put({
        ...DEFAULT_SETTINGS,
        ...backupData.settings,
        id: 'global_settings'
      });
    }

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });

  return fetchAllAppState();
}

// CRUD Operations
export async function saveClass(classItem) {
  const timestamp = new Date().toISOString();
  await putInStore(STORES.CLASSES, {
    ...classItem,
    updatedAt: timestamp,
    createdAt: classItem.createdAt || timestamp
  });
  return fetchAllAppState();
}

export async function deleteClassAndRelated(classId) {
  const state = await fetchAllAppState();
  const classStudents = state.students.filter((s) => s.classId === classId);
  const classAsmts = state.assessments.filter((a) => a.classId === classId);
  const asmtIds = new Set(classAsmts.map((a) => a.id));
  const studentIds = new Set(classStudents.map((s) => s.id));

  for (const s of classStudents) {
    await deleteFromStore(STORES.STUDENTS, s.id);
  }
  for (const a of classAsmts) {
    for (const q of a.questions || []) {
      await deleteFromStore(STORES.QUESTIONS, q.id);
    }
    await deleteFromStore(STORES.ASSESSMENTS, a.id);
  }
  for (const r of state.responses) {
    if (asmtIds.has(r.assessmentId) || studentIds.has(r.studentId)) {
      await deleteFromStore(STORES.RESPONSES, r.id);
    }
  }
  await deleteFromStore(STORES.CLASSES, classId);
  return fetchAllAppState();
}

export async function saveStudent(student) {
  const timestamp = new Date().toISOString();
  await putInStore(STORES.STUDENTS, {
    ...student,
    updatedAt: timestamp,
    createdAt: student.createdAt || timestamp
  });
  return fetchAllAppState();
}

export async function deleteStudentAndResponses(studentId) {
  const state = await fetchAllAppState();
  for (const r of state.responses) {
    if (r.studentId === studentId) {
      await deleteFromStore(STORES.RESPONSES, r.id);
    }
  }
  await deleteFromStore(STORES.STUDENTS, studentId);
  return fetchAllAppState();
}

export async function saveAssessment(assessment) {
  const timestamp = new Date().toISOString();
  const record = {
    ...assessment,
    updatedAt: timestamp,
    createdAt: assessment.createdAt || timestamp
  };
  await putInStore(STORES.ASSESSMENTS, record);

  const db = await openDatabase();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.QUESTIONS, 'readwrite');
    const qStore = tx.objectStore(STORES.QUESTIONS);
    (assessment.questions || []).forEach((q, idx) => {
      qStore.put({
        ...q,
        assessmentId: assessment.id,
        questionOrder: idx
      });
    });
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });

  return fetchAllAppState();
}

export async function deleteAssessmentAndResponses(assessmentId) {
  const state = await fetchAllAppState();
  const targetAsmt = state.assessments.find((a) => a.id === assessmentId);
  if (targetAsmt) {
    for (const q of targetAsmt.questions || []) {
      await deleteFromStore(STORES.QUESTIONS, q.id);
    }
  }
  for (const r of state.responses) {
    if (r.assessmentId === assessmentId) {
      await deleteFromStore(STORES.RESPONSES, r.id);
    }
  }
  await deleteFromStore(STORES.ASSESSMENTS, assessmentId);
  return fetchAllAppState();
}

export async function saveStudentResponseRecord(responseRecord) {
  await putInStore(STORES.RESPONSES, {
    ...responseRecord,
    updatedAt: new Date().toISOString()
  });
  return fetchAllAppState();
}

export async function saveBulkResponseRecords(records) {
  const db = await openDatabase();
  const now = new Date().toISOString();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.RESPONSES, 'readwrite');
    const store = tx.objectStore(STORES.RESPONSES);
    records.forEach((rec) => store.put({ ...rec, updatedAt: rec.updatedAt || now }));
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
  return fetchAllAppState();
}

export async function saveSettings(newSettings) {
  await putInStore(STORES.SETTINGS, {
    ...newSettings,
    id: 'global_settings',
    updatedAt: new Date().toISOString()
  });
  return fetchAllAppState();
}
