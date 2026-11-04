import React, { useState, useEffect, useMemo } from 'react';
import {
  getStorageStatus,
  loadInitialWorkspace,
  saveClassRecord,
  deleteClassRecord,
  saveStudentRecord,
  deleteStudentRecord,
  saveAssessmentRecord,
  deleteAssessmentRecord,
  saveResponseRecord,
  saveBulkResponses,
  saveSettingsRecord,
  loadDevSeedWorkspace,
  clearAllWorkspace,
  importWorkspaceBackup,
  syncLocalWorkspaceToCloud
} from './db/dataRepository';
import { supabaseSignOut } from './db/supabaseClient';
import {
  evaluateClassInsights,
  buildPreMarkedCorrectAnswers
} from './engine/adaptiveEngine';
import Layout from './components/Layout';
import AuthModal from './components/AuthModal';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ClassesAndStudents from './pages/ClassesAndStudents';
import Assessments from './pages/Assessments';
import ResponseEntry from './pages/ResponseEntry';
import ClassInsights from './pages/ClassInsights';
import StudentProgress from './pages/StudentProgress';
import AiAssistant from './pages/AiAssistant';
import SettingsDemoData from './pages/SettingsDemoData';

const VALID_TABS = new Set([
  'welcome',
  'dashboard',
  'classes',
  'assessments',
  'responses',
  'insights',
  'progress',
  'ai-assistant',
  'settings'
]);

const PAGE_TITLES = {
  welcome: 'SAHAYA — Teacher-Assisted Adaptive Learning System (Grades 6–10)',
  dashboard: 'Dashboard | SAHAYA',
  classes: 'Classes & Students | SAHAYA',
  assessments: 'Assessments | SAHAYA',
  responses: 'Response Entry | SAHAYA',
  insights: 'Class Insights | SAHAYA',
  progress: 'Student Progress | SAHAYA',
  'ai-assistant': 'AI Teaching Assistant | SAHAYA',
  settings: 'Settings | SAHAYA'
};

function getInitialTabFromUrl() {
  const hash = window.location.hash.replace(/^#\/?/, '').trim();
  if (VALID_TABS.has(hash)) return hash;
  const hasEntered = localStorage.getItem('sahaya_entered_app') === 'true';
  return hasEntered ? 'dashboard' : 'welcome';
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [storageStatus, setStorageStatus] = useState(() => getStorageStatus());
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [appState, setAppState] = useState({
    classes: [],
    students: [],
    assessments: [],
    responses: [],
    settings: {
      relearnThreshold: 50,
      practiseThreshold: 80,
      classConceptFlagThreshold: 65,
      minQuestionsForConceptConfidence: 2,
      activeClassId: ''
    }
  });

  const [activeTab, setActiveTab] = useState(getInitialTabFromUrl);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedAiConcept, setSelectedAiConcept] = useState('');
  const [createAsmtTrigger, setCreateAsmtTrigger] = useState(false);
  const [prefillAssessmentDraft, setPrefillAssessmentDraft] = useState(null);

  const navigateToTab = (tabId) => {
    const nextTab = VALID_TABS.has(tabId) ? tabId : 'dashboard';
    if (nextTab !== 'welcome') {
      localStorage.setItem('sahaya_entered_app', 'true');
    }
    setActiveTab(nextTab);
    window.history.replaceState(null, '', `#/${nextTab}`);
  };

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').trim();
      if (VALID_TABS.has(hash)) {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    document.title = PAGE_TITLES[activeTab] || PAGE_TITLES.dashboard;
  }, [activeTab]);

  const reloadWorkspace = async () => {
    setStorageStatus(getStorageStatus());
    const data = await loadInitialWorkspace();
    setAppState(data);
  };

  useEffect(() => {
    reloadWorkspace()
      .then(() => setLoading(false))
      .catch((err) => {
        console.error('Failed to initialize workspace:', err);
        setLoading(false);
      });
  }, []);

  const activeClass = useMemo(() => {
    const preferred = appState.classes.find(
      (c) => c.id === appState.settings?.activeClassId
    );
    return preferred || appState.classes[0] || null;
  }, [appState.classes, appState.settings?.activeClassId]);

  const classStudents = useMemo(() => {
    if (!activeClass) return [];
    return appState.students.filter((s) => s.classId === activeClass.id);
  }, [appState.students, activeClass]);

  const classAssessments = useMemo(() => {
    if (!activeClass) return [];
    return appState.assessments.filter((a) => a.classId === activeClass.id);
  }, [appState.assessments, activeClass]);

  const classInsights = useMemo(() => {
    return evaluateClassInsights(
      classStudents,
      classAssessments,
      appState.responses,
      appState.settings,
      'all'
    );
  }, [classStudents, classAssessments, appState.responses, appState.settings]);

  // Handlers
  const handleSelectClass = async (classId) => {
    const nextSettings = {
      ...appState.settings,
      activeClassId: classId
    };
    const nextState = await saveSettingsRecord(nextSettings);
    setAppState(nextState);
    setSelectedAssessmentId('');
    setSelectedStudentId('');
  };

  const handleOpenResponseEntry = (assessmentId) => {
    if (assessmentId) {
      setSelectedAssessmentId(assessmentId);
    }
    navigateToTab('responses');
  };

  const handleOpenStudentProgress = (studentId) => {
    if (studentId) {
      setSelectedStudentId(studentId);
    }
    navigateToTab('progress');
  };

  const handleOpenAiForConcept = (conceptTag) => {
    if (conceptTag) {
      setSelectedAiConcept(conceptTag);
    }
    navigateToTab('ai-assistant');
  };

  const handleQuickCreateAssessment = () => {
    setCreateAsmtTrigger(true);
    navigateToTab('assessments');
  };

  const handleCreateFollowUpAssessment = (draft) => {
    setPrefillAssessmentDraft(draft);
    navigateToTab('assessments');
  };

  const handleSaveAssessmentWithPreMarkedResponses = async (asmt, isNew = false) => {
    let nextState = await saveAssessmentRecord(asmt);
    if (isNew) {
      const targetStudents = nextState.students.filter(
        (s) => s.classId === asmt.classId
      );
      if (targetStudents.length > 0) {
        const defaultAnswers = buildPreMarkedCorrectAnswers(asmt);
        const initialRecords = targetStudents.map((stu) => ({
          id: `${asmt.id}__${stu.id}`,
          assessmentId: asmt.id,
          studentId: stu.id,
          answers: { ...defaultAnswers },
          updatedAt: new Date().toISOString()
        }));
        nextState = await saveBulkResponses(initialRecords);
      }
    }
    setAppState(nextState);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
          color: '#0f172a',
          fontWeight: 600,
          fontSize: '0.92rem'
        }}
      >
        Loading SAHAYA...
      </div>
    );
  }

  return (
    <>
      {activeTab === 'welcome' ? (
        <LandingPage
          onEnterDashboard={() => navigateToTab('dashboard')}
          storageStatus={storageStatus}
          onOpenAuthModal={() => setAuthModalOpen(true)}
        />
      ) : (
        <Layout
          activeTab={activeTab}
          onNavigate={navigateToTab}
          onOpenLanding={() => navigateToTab('welcome')}
          classes={appState.classes}
          activeClass={activeClass}
          onSelectClass={handleSelectClass}
          onQuickCreateAssessment={handleQuickCreateAssessment}
          flaggedCount={classInsights?.flaggedConcepts?.length || 0}
          storageStatus={storageStatus}
        >
          {activeTab === 'dashboard' && (
            <Dashboard
              activeClass={activeClass}
              classStudents={classStudents}
              classAssessments={classAssessments}
              classInsights={classInsights}
              settings={appState.settings}
              onNavigate={navigateToTab}
              onOpenResponseEntry={handleOpenResponseEntry}
              onOpenStudentProgress={handleOpenStudentProgress}
              onOpenAiForConcept={handleOpenAiForConcept}
              onQuickCreateAssessment={handleQuickCreateAssessment}
            />
          )}

          {activeTab === 'classes' && (
            <ClassesAndStudents
              classes={appState.classes}
              activeClass={activeClass}
              allStudents={appState.students}
              classStudents={classStudents}
              classInsights={classInsights}
              onSelectClass={handleSelectClass}
              onSaveClass={async (cls) => {
                const next = await saveClassRecord(cls);
                setAppState(next);
              }}
              onDeleteClass={async (clsId) => {
                const next = await deleteClassRecord(clsId);
                setAppState(next);
              }}
              onSaveStudent={async (stu) => {
                const next = await saveStudentRecord(stu);
                setAppState(next);
              }}
              onDeleteStudent={async (stuId) => {
                const next = await deleteStudentRecord(stuId);
                setAppState(next);
              }}
              onOpenStudentProgress={handleOpenStudentProgress}
            />
          )}

          {activeTab === 'assessments' && (
            <Assessments
              classes={appState.classes}
              activeClass={activeClass}
              classAssessments={classAssessments}
              allAssessments={appState.assessments}
              initialCreateMode={createAsmtTrigger}
              prefillAssessmentDraft={prefillAssessmentDraft}
              onClearPrefill={() => {
                setCreateAsmtTrigger(false);
                setPrefillAssessmentDraft(null);
              }}
              onSelectClass={handleSelectClass}
              onSaveAssessment={handleSaveAssessmentWithPreMarkedResponses}
              onDeleteAssessment={async (asmtId) => {
                const next = await deleteAssessmentRecord(asmtId);
                setAppState(next);
              }}
              onOpenResponseEntry={handleOpenResponseEntry}
            />
          )}

          {activeTab === 'responses' && (
            <ResponseEntry
              activeClass={activeClass}
              classStudents={classStudents}
              classAssessments={classAssessments}
              allResponses={appState.responses}
              settings={appState.settings}
              selectedAssessmentId={selectedAssessmentId}
              onSelectAssessmentId={setSelectedAssessmentId}
              onSaveResponseRecord={async (rec) => {
                const next = await saveResponseRecord(rec);
                setAppState(next);
              }}
              onSaveBulkResponses={async (records) => {
                const next = await saveBulkResponses(records);
                setAppState(next);
              }}
              onNavigate={navigateToTab}
              onOpenStudentProgress={handleOpenStudentProgress}
            />
          )}

          {activeTab === 'insights' && (
            <ClassInsights
              activeClass={activeClass}
              classStudents={classStudents}
              classAssessments={classAssessments}
              allResponses={appState.responses}
              settings={appState.settings}
              onOpenStudentProgress={handleOpenStudentProgress}
              onOpenAiForConcept={handleOpenAiForConcept}
              onNavigate={navigateToTab}
            />
          )}

          {activeTab === 'progress' && (
            <StudentProgress
              activeClass={activeClass}
              classStudents={classStudents}
              classInsights={classInsights}
              selectedStudentId={selectedStudentId}
              onSelectStudentId={setSelectedStudentId}
              onOpenAiForConcept={handleOpenAiForConcept}
              onOpenResponseEntry={handleOpenResponseEntry}
            />
          )}

          {activeTab === 'ai-assistant' && (
            <AiAssistant
              activeClass={activeClass}
              classInsights={classInsights}
              settings={appState.settings}
              initialConceptTag={selectedAiConcept}
              onCreateFollowUpAssessment={handleCreateFollowUpAssessment}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsDemoData
              settings={appState.settings}
              appState={appState}
              storageStatus={storageStatus}
              onSaveSettings={async (newSettings) => {
                const next = await saveSettingsRecord(newSettings);
                setAppState(next);
              }}
              onResetDemoData={async () => {
                const next = await loadDevSeedWorkspace();
                setAppState(next);
              }}
              onClearAllData={async () => {
                const next = await clearAllWorkspace();
                setAppState(next);
              }}
              onImportBackup={async (backup) => {
                const next = await importWorkspaceBackup(backup);
                setAppState(next);
              }}
              onOpenAuthModal={() => setAuthModalOpen(true)}
              onSignOutCloud={async () => {
                await supabaseSignOut();
                await reloadWorkspace();
              }}
              onSyncLocalToCloud={async () => {
                const next = await syncLocalWorkspaceToCloud();
                setAppState(next);
              }}
            />
          )}
        </Layout>
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={reloadWorkspace}
      />
    </>
  );
}
