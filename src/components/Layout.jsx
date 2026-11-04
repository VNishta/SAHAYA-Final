import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  FileCheck2,
  Grid,
  BarChart3,
  GraduationCap,
  Sparkles,
  Settings,
  Menu,
  X,
  PlusCircle,
  Info,
  Database,
  Cloud,
  Globe
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Overview' },
  { id: 'classes', label: 'Classes & Students', icon: Users, section: 'Classroom' },
  { id: 'assessments', label: 'Assessments', icon: FileCheck2, section: 'Classroom' },
  { id: 'responses', label: 'Response Entry', icon: Grid, section: 'Classroom' },
  { id: 'insights', label: 'Class Insights', icon: BarChart3, section: 'Analysis' },
  { id: 'progress', label: 'Student Progress', icon: GraduationCap, section: 'Analysis' },
  { id: 'ai-assistant', label: 'AI Assistant', icon: Sparkles, section: 'Support', badge: 'Optional' },
  { id: 'settings', label: 'Settings', icon: Settings, section: 'System' }
];

export default function Layout({
  activeTab,
  onNavigate,
  onOpenLanding,
  classes,
  activeClass,
  onSelectClass,
  onQuickCreateAssessment,
  flaggedCount = 0,
  storageStatus,
  children
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tabId) => {
    onNavigate(tabId);
    setMobileMenuOpen(false);
  };

  const isCurrentClassDemo = Boolean(activeClass?.isDemo);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              className="brand-logo-row"
              onClick={onOpenLanding}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onOpenLanding()}
              title="Public Overview"
            >
              <div className="brand-mark">S</div>
              <div>
                <div className="brand-title">SAHAYA</div>
                <div className="brand-tagline">Grades 6–10 Adaptive System</div>
              </div>
            </div>
            <button
              type="button"
              className="mobile-menu-btn"
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main Navigation">
          {['Overview', 'Classroom', 'Analysis', 'Support', 'System'].map((section) => {
            const items = NAV_ITEMS.filter((i) => i.section === section);
            return (
              <React.Fragment key={section}>
                <div className="nav-section-label">{section}</div>
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`nav-item ${isActive ? 'active' : ''}`}
                      onClick={() => handleNavClick(item.id)}
                    >
                      <Icon size={17} />
                      <span>{item.label}</span>
                      {item.id === 'insights' && flaggedCount > 0 && (
                        <span className="nav-badge">{flaggedCount}</span>
                      )}
                      {item.badge && item.id !== 'insights' && (
                        <span
                          className="nav-badge"
                          style={{ background: 'rgba(148,163,184,0.18)', color: '#cbd5e1' }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </React.Fragment>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: storageStatus?.mode === 'supabase' ? '#5eead4' : '#93c5fd',
              fontWeight: 600
            }}
          >
            {storageStatus?.mode === 'supabase' ? <Cloud size={14} /> : <Database size={14} />}
            <span>{storageStatus?.label || 'Local Storage (IndexedDB)'}</span>
          </div>
          <div style={{ marginTop: '0.45rem' }}>
            <button
              type="button"
              onClick={onOpenLanding}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '0.74rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: 0
              }}
            >
              <Globe size={12} />
              <span>Public Product Page</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="top-header">
          <div className="header-left">
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={19} />
            </button>

            <div className="class-selector-group">
              <span className="class-selector-label">Class:</span>
              {classes.length > 0 ? (
                <select
                  className="class-select"
                  value={activeClass?.id || ''}
                  onChange={(e) => onSelectClass(e.target.value)}
                  aria-label="Select Active Class"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.grade})
                    </option>
                  ))}
                </select>
              ) : (
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>None</span>
              )}
            </div>

            {activeClass && (
              <span className="badge badge-navy">
                {activeClass.grade} • {activeClass.subject}
              </span>
            )}
          </div>

          <div className="header-right">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('responses')}
            >
              <Grid size={14} />
              Enter Responses
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onQuickCreateAssessment}
            >
              <PlusCircle size={14} />
              Create Assessment
            </button>
          </div>
        </header>

        {isCurrentClassDemo && (
          <div className="demo-indicator-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Info size={15} />
              <span>
                <strong>Development Seed Data:</strong> Viewing sample records ({activeClass.name}).
              </span>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.18rem 0.55rem', fontSize: '0.73rem' }}
              onClick={() => onNavigate('settings')}
            >
              Manage Data
            </button>
          </div>
        )}

        <main className="page-container">{children}</main>
      </div>
    </div>
  );
}
