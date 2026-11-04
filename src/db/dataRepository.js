import { DEFAULT_SETTINGS } from '../data/demoData';
import {
  initializeAndLoadAllData,
  fetchAllAppState,
  saveClass,
  deleteClassAndRelated,
  saveStudent,
  deleteStudentAndResponses,
  saveAssessment,
  deleteAssessmentAndResponses,
  saveStudentResponseRecord,
  saveBulkResponseRecords,
  saveSettings,
  resetToDemoData,
  clearAllWorkspaceData,
  importBackupToIndexedDb
} from './indexedDb';
import {
  isSupabaseConfigured,
  getStoredSession,
  fetchAllFromSupabase,
  upsertClassInSupabase,
  deleteClassInSupabase,
  upsertStudentInSupabase,
  deleteStudentInSupabase,
  upsertAssessmentInSupabase,
  deleteAssessmentInSupabase,
  upsertResponsesInSupabase,
  upsertSettingsInSupabase
} from './supabaseClient';

function isCloudActive() {
  return isSupabaseConfigured() && Boolean(getStoredSession()?.access_token);
}

export function getStorageStatus() {
  const configured = isSupabaseConfigured();
  const session = getStoredSession();
  return {
    isSupabaseConfigured: configured,
    isAuthenticated: Boolean(session?.access_token),
    user: session?.user || null,
    mode: configured && session?.access_token ? 'supabase' : 'indexeddb',
    label:
      configured && session?.access_token
        ? 'Cloud Synced (Supabase)'
        : 'Local Storage (IndexedDB)'
  };
}

export async function loadInitialWorkspace() {
  if (isCloudActive()) {
    try {
      const cloudState = await fetchAllFromSupabase(DEFAULT_SETTINGS);
      // Mirror to IndexedDB for offline resilience
      await importBackupToIndexedDb(cloudState);
      return cloudState;
    } catch (err) {
      console.warn('Cloud fetch failed, using local IndexedDB fallback:', err);
    }
  }
  return initializeAndLoadAllData();
}

export async function saveClassRecord(cls) {
  const localNext = await saveClass(cls);
  if (isCloudActive()) {
    await upsertClassInSupabase(cls);
    return fetchAllFromSupabase(DEFAULT_SETTINGS);
  }
  return localNext;
}

export async function deleteClassRecord(classId) {
  const localNext = await deleteClassAndRelated(classId);
  if (isCloudActive()) {
    await deleteClassInSupabase(classId);
    return fetchAllFromSupabase(DEFAULT_SETTINGS);
  }
  return localNext;
}

export async function saveStudentRecord(stu) {
  const localNext = await saveStudent(stu);
  if (isCloudActive()) {
    await upsertStudentInSupabase(stu);
    return fetchAllFromSupabase(DEFAULT_SETTINGS);
  }
  return localNext;
}

export async function deleteStudentRecord(studentId) {
  const localNext = await deleteStudentAndResponses(studentId);
  if (isCloudActive()) {
    await deleteStudentInSupabase(studentId);
    return fetchAllFromSupabase(DEFAULT_SETTINGS);
  }
  return localNext;
}

export async function saveAssessmentRecord(asmt) {
  const localNext = await saveAssessment(asmt);
  if (isCloudActive()) {
    await upsertAssessmentInSupabase(asmt);
    return fetchAllFromSupabase(DEFAULT_SETTINGS);
  }
  return localNext;
}

export async function deleteAssessmentRecord(assessmentId) {
  const localNext = await deleteAssessmentAndResponses(assessmentId);
  if (isCloudActive()) {
    await deleteAssessmentInSupabase(assessmentId);
    return fetchAllFromSupabase(DEFAULT_SETTINGS);
  }
  return localNext;
}

export async function saveResponseRecord(rec) {
  const localNext = await saveStudentResponseRecord(rec);
  if (isCloudActive()) {
    await upsertResponsesInSupabase([rec]);
  }
  return localNext;
}

export async function saveBulkResponses(records) {
  const localNext = await saveBulkResponseRecords(records);
  if (isCloudActive()) {
    await upsertResponsesInSupabase(records);
  }
  return localNext;
}

export async function saveSettingsRecord(settings) {
  const localNext = await saveSettings(settings);
  if (isCloudActive()) {
    await upsertSettingsInSupabase(settings);
  }
  return localNext;
}

export async function loadDevSeedWorkspace() {
  return resetToDemoData();
}

export async function clearAllWorkspace() {
  return clearAllWorkspaceData();
}

export async function importWorkspaceBackup(backupData) {
  const localNext = await importBackupToIndexedDb(backupData);
  if (isCloudActive()) {
    await syncLocalWorkspaceToCloud();
    return fetchAllFromSupabase(DEFAULT_SETTINGS);
  }
  return localNext;
}

export async function syncLocalWorkspaceToCloud() {
  if (!isCloudActive()) {
    throw new Error('Sign in to Supabase first to synchronize local records.');
  }
  const localState = await fetchAllAppState();
  for (const c of localState.classes.filter((x) => !x.isDemo)) {
    await upsertClassInSupabase(c);
  }
  for (const s of localState.students.filter((x) => !x.isDemo)) {
    await upsertStudentInSupabase(s);
  }
  for (const a of localState.assessments.filter((x) => !x.isDemo)) {
    await upsertAssessmentInSupabase(a);
  }
  const realResponses = localState.responses.filter(
    (r) => !r.id.includes('_demo')
  );
  if (realResponses.length > 0) {
    await upsertResponsesInSupabase(realResponses);
  }
  if (localState.settings) {
    await upsertSettingsInSupabase(localState.settings);
  }
  return fetchAllFromSupabase(DEFAULT_SETTINGS);
}
