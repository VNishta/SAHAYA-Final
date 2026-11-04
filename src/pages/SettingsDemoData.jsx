import React, { useState, useRef } from 'react';
import {
  Settings,
  RotateCcw,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  Sliders,
  Database,
  Cloud,
  LogIn,
  LogOut,
  RefreshCw
} from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

export default function SettingsDemoData({
  settings,
  appState,
  storageStatus,
  onSaveSettings,
  onResetDemoData,
  onClearAllData,
  onImportBackup,
  onOpenAuthModal,
  onSignOutCloud,
  onSyncLocalToCloud
}) {
  const [relearnThreshold, setRelearnThreshold] = useState(
    settings?.relearnThreshold ?? 50
  );
  const [practiseThreshold, setPractiseThreshold] = useState(
    settings?.practiseThreshold ?? 80
  );
  const [classConceptFlagThreshold, setClassConceptFlagThreshold] = useState(
    settings?.classConceptFlagThreshold ?? 65
  );
  const [minQuestionsForConceptConfidence, setMinQuestionsForConceptConfidence] =
    useState(settings?.minQuestionsForConceptConfidence ?? 2);
  const [aiProxyUrl, setAiProxyUrl] = useState(settings?.aiProxyUrl || '');

  const [savedNotice, setSavedNotice] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [modalAction, setModalAction] = useState(null);
  const fileInputRef = useRef(null);

  const handleSaveThresholds = async (e) => {
    e.preventDefault();
    const rVal = Number(relearnThreshold);
    const pVal = Number(practiseThreshold);
    const fVal = Number(classConceptFlagThreshold);
    const mVal = Number(minQuestionsForConceptConfidence);

    if (rVal < 10 || rVal > 75) {
      setErrorMsg('Relearn threshold must be between 10% and 75%.');
      return;
    }
    if (pVal <= rVal || pVal > 95) {
      setErrorMsg('Advance threshold must be greater than Relearn threshold (max 95%).');
      return;
    }

    setErrorMsg('');
    await onSaveSettings({
      ...settings,
      relearnThreshold: rVal,
      practiseThreshold: pVal,
      classConceptFlagThreshold: fVal,
      minQuestionsForConceptConfidence: mVal,
      aiProxyUrl: aiProxyUrl.trim()
    });
    setSavedNotice('Settings saved.');
    setTimeout(() => setSavedNotice(''), 3500);
  };

  const handleExportJson = () => {
    const dataStr = JSON.stringify(appState, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sahaya_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg('');
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed.classes) || !Array.isArray(parsed.students)) {
        throw new Error('Invalid backup format.');
      }
      await onImportBackup(parsed);
      setSavedNotice('Backup imported.');
      setTimeout(() => setSavedNotice(''), 3500);
    } catch (err) {
      setErrorMsg(`Import failed: ${err.message}`);
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Thresholds, persistence, backup, and data reset</p>
        </div>
      </div>

      {errorMsg && (
        <div className="callout callout-amber" style={{ padding: '0.6rem 0.85rem' }}>
          {errorMsg}
        </div>
      )}

      {savedNotice && (
        <div className="callout callout-teal" style={{ padding: '0.6rem 0.85rem' }}>
          <CheckCircle2 size={16} />
          <span>{savedNotice}</span>
        </div>
      )}

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Left: Thresholds */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Sliders size={17} color="#1e3a8a" />
              Recommendation Thresholds
            </h2>
          </div>

          <form onSubmit={handleSaveThresholds}>
            <div className="form-group">
              <label className="form-label" htmlFor="relearn-threshold-input">
                Relearn Fundamentals Threshold (%): Below {relearnThreshold}%
              </label>
              <input
                id="relearn-threshold-input"
                type="number"
                min="10"
                max="75"
                className="form-input"
                value={relearnThreshold}
                onChange={(e) => setRelearnThreshold(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="advance-threshold-input">
                Advance Threshold (%): {practiseThreshold}% or above (Practise:{' '}
                {relearnThreshold}–{practiseThreshold - 1}%)
              </label>
              <input
                id="advance-threshold-input"
                type="number"
                min="55"
                max="95"
                className="form-input"
                value={practiseThreshold}
                onChange={(e) => setPractiseThreshold(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="flag-threshold-input">
                Class Concept Review Threshold (%): Below {classConceptFlagThreshold}%
              </label>
              <input
                id="flag-threshold-input"
                type="number"
                min="30"
                max="90"
                className="form-input"
                value={classConceptFlagThreshold}
                onChange={(e) => setClassConceptFlagThreshold(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="min-evidence-input">
                Minimum Questions for Concept Confidence
              </label>
              <input
                id="min-evidence-input"
                type="number"
                min="1"
                max="5"
                className="form-input"
                value={minQuestionsForConceptConfidence}
                onChange={(e) => setMinQuestionsForConceptConfidence(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ai-proxy-input">
                Backend AI Proxy URL (Optional)
              </label>
              <input
                id="ai-proxy-input"
                type="url"
                className="form-input"
                placeholder="https://your-backend.example/api/sahaya-ai"
                value={aiProxyUrl}
                onChange={(e) => setAiProxyUrl(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary">
              <Settings size={14} />
              Save Settings
            </button>
          </form>
        </div>

        {/* Right: Storage, Backup & Reset */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {/* Storage Mode Card */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                {storageStatus?.mode === 'supabase' ? (
                  <Cloud size={17} color="#0d9488" />
                ) : (
                  <Database size={17} color="#1e3a8a" />
                )}
                Data Storage & Sync
              </h2>
              <span
                className={`badge ${
                  storageStatus?.mode === 'supabase' ? 'badge-teal' : 'badge-navy'
                }`}
              >
                {storageStatus?.label}
              </span>
            </div>

            <div
              style={{
                padding: '0.75rem',
                background: 'var(--bg-slate-subtle)',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                fontSize: '0.82rem',
                marginBottom: '0.85rem'
              }}
            >
              <div>
                <strong>Stored Records:</strong> {appState.classes.length} Classes •{' '}
                {appState.students.length} Students • {appState.assessments.length}{' '}
                Assessments • {appState.responses.length} Response Records
              </div>
              <div style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {storageStatus?.isSupabaseConfigured
                  ? storageStatus.isAuthenticated
                    ? `Signed in as ${storageStatus.user?.email}`
                    : 'Supabase configured. Sign in to enable cloud PostgreSQL sync.'
                  : 'Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) not set. Running in Local Device Storage (IndexedDB).'}
              </div>
            </div>

            {storageStatus?.isSupabaseConfigured && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {!storageStatus.isAuthenticated ? (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={onOpenAuthModal}
                  >
                    <LogIn size={14} />
                    Teacher Sign In
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={async () => {
                        await onSyncLocalToCloud();
                        setSavedNotice('Local data synchronized to Supabase.');
                      }}
                    >
                      <RefreshCw size={13} />
                      Sync Local to Cloud
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={onSignOutCloud}
                    >
                      <LogOut size={13} />
                      Sign Out
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Backup, Reset & Dev Seed */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Backup & Data Management</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              {/* Export / Import */}
              <div
                style={{
                  padding: '0.75rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.6rem',
                  flexWrap: 'wrap'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>
                    Data Backup & Restore
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    Export or import JSON backup
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleExportJson}
                  >
                    <Download size={14} />
                    Export JSON
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={14} />
                    Import JSON
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/json"
                    style={{ display: 'none' }}
                    onChange={handleImportFileChange}
                  />
                </div>
              </div>

              {/* Development Seed Data (Explicit Dev-Only Process) */}
              <div
                style={{
                  padding: '0.75rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.6rem',
                  flexWrap: 'wrap'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>
                    Development Seed Data (Dev Only)
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    Load labelled sample classes for testing
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() =>
                    setModalAction({
                      type: 'reset_demo',
                      title: 'Load Development Seed Data?',
                      message:
                        'Loads labelled sample classroom records (Class 7A & Class 8B) for testing.',
                      confirmLabel: 'Load Seed Data',
                      variant: 'primary'
                    })
                  }
                >
                  <RotateCcw size={14} />
                  Load Sample Data
                </button>
              </div>

              {/* Reset / Clear All Data */}
              <div
                style={{
                  padding: '0.75rem',
                  border: '1px solid #fecdd3',
                  background: '#fff1f2',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.6rem',
                  flexWrap: 'wrap'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#9f1239' }}>
                    Reset Workspace Data
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#be123c' }}>
                    Delete all classes, students, assessments, and responses
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() =>
                    setModalAction({
                      type: 'clear_all',
                      title: 'Reset All Data?',
                      message:
                        'Permanently delete all stored classes, students, assessments, and response records?',
                      confirmLabel: 'Reset All Data',
                      variant: 'danger'
                    })
                  }
                >
                  <Trash2 size={14} />
                  Reset Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(modalAction)}
        title={modalAction?.title}
        message={modalAction?.message}
        confirmLabel={modalAction?.confirmLabel}
        variant={modalAction?.variant}
        onCancel={() => setModalAction(null)}
        onConfirm={async () => {
          if (modalAction.type === 'reset_demo') {
            await onResetDemoData();
            setSavedNotice('Development seed data loaded.');
          } else if (modalAction.type === 'clear_all') {
            await onClearAllData();
            setSavedNotice('All workspace data cleared.');
          }
          setModalAction(null);
        }}
      />
    </div>
  );
}
